"""SIMULATED recipient delivery, real PostgreSQL crash/retry boundaries."""
from datetime import timedelta

import pytest

from server.guardian_notifier import DeliveryResult, SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.incidents import request_alarm, stand_down
from server.outbox import claim_due
from server.bank_worker import deliver_bank_signal
from server.tests.sim_postgres import sim_database
from server.tests.test_slice3_events import sim_api, signal


def setup_alert(sim_api, *, trigger="no_answer", guardian=True):
    _, _, subject, _, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents")
        incident = cur.fetchone()[0]
        request_alarm(cur, incident, trigger=trigger, now=now[0])
        if guardian:
            cur.execute("INSERT INTO sim_guardians VALUES(%s,'sim_guardian')", (subject,))
        rows = claim_due(cur, now=now[0])
    row = next(r for r in rows if r["kind"] == "guardian_alert")
    return incident, row, SimulatedGuardianNotifier(connect, lambda: now[0])


def test_proposed_no_bank_without_delivery_timer_uses_delivery_then_stand_down(sim_api):
    *_, now, connect = sim_api
    incident, row, notifier = setup_alert(sim_api)
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == 0
    now[0] += timedelta(seconds=30)
    assert deliver_guardian_alert(connect, notifier, row, now[0])
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT not_before FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == now[0] + timedelta(minutes=3)
        assert claim_due(cur, now=now[0] + timedelta(seconds=179)) == []
        stand_down(cur, incident, now[0] + timedelta(seconds=179))
        assert claim_due(cur, now=now[0] + timedelta(seconds=180)) == []


def test_delivery_failure_then_success_and_crash_before_ack_is_deduped(sim_api):
    *_, now, connect = sim_api
    _, row, notifier = setup_alert(sim_api)
    class FailedNotifier:
        simulated = True
        recipients = notifier.recipients
        def deliver(self, _):
            return DeliveryResult(False, None, None)
    assert not deliver_guardian_alert(connect, FailedNotifier(), row, now[0])
    now[0] += timedelta(seconds=61)
    with connect() as conn, conn.cursor() as cur:
        row = next(r for r in claim_due(cur, now=now[0]) if r["kind"] == "guardian_alert")
    delivered_at = now[0]
    def crash():
        raise RuntimeError("sim_crash_after_receiver_before_ack")
    with pytest.raises(RuntimeError):
        deliver_guardian_alert(connect, notifier, row, now[0], after_deliver=crash)
    now[0] += timedelta(seconds=61)
    with connect() as conn, conn.cursor() as cur:
        row = next(r for r in claim_due(cur, now=now[0]) if r["kind"] == "guardian_alert")
    assert deliver_guardian_alert(connect, notifier, row, now[0])
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM sim_notification_receipts")
        assert cur.fetchone()[0] == 1
        cur.execute("SELECT not_before FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == delivered_at + timedelta(minutes=3)
        due = claim_due(cur, now=delivered_at + timedelta(minutes=3))
        assert [r["kind"] for r in due] == ["bank_signal"]
        assert claim_due(cur, now=delivered_at + timedelta(minutes=3)) == []


def test_proposed_zero_guardians_records_gap_but_duress_needs_no_delivery(sim_api):
    *_, now, connect = sim_api
    incident, row, notifier = setup_alert(sim_api, guardian=False)
    assert not deliver_guardian_alert(connect, notifier, row, now[0])
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT reason,proposed FROM escalation_gaps")
        assert cur.fetchall() == [("sim_no_guardians", True)]
        cur.execute("SELECT count(*) FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == 0
        request_alarm(cur, incident, trigger="duress_signal", now=now[0])
        cur.execute("SELECT not_before FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == now[0]
    with pytest.raises(ValueError, match="sim_"):
        notifier.recipients("not_simulated")


def test_bank_delivery_at_three_minutes_signed_body_retry_and_hold_ref(sim_api):
    import base64
    import hashlib
    import json
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    from anchor.canonical import canonical
    from server.server_signing import _pinned_public_key
    store, *_, now, connect = sim_api
    _, row, notifier = setup_alert(sim_api)
    assert deliver_guardian_alert(connect, notifier, row, now[0])
    now[0] += timedelta(minutes=3)
    with connect() as conn, conn.cursor() as cur:
        bank = next(r for r in claim_due(cur, now=now[0]) if r["kind"] == "bank_signal")
    class SimReceiver:
        calls = {}
        sim_crash = True
        def send(self, body, headers):
            statement = {"method": "POST", "path": "/sim_bank/v1/risk-signal", "ts": headers["X-Vuka-Ts"],
                         "nonce": headers["X-Vuka-Nonce"], "body_sha256": hashlib.sha256(body).hexdigest()}
            Ed25519PublicKey.from_public_bytes(_pinned_public_key()).verify(base64.b64decode(headers["X-Vuka-Server-Signature"]), canonical(statement))
            payload = json.loads(body)
            key = headers["Idempotency-Key"]
            assert payload["idempotency_key"] == key
            assert self.calls.setdefault(key, body) == body
            if self.sim_crash:
                self.sim_crash = False
                raise RuntimeError("sim_receiver_committed_sender_crashed")
            return {"sim": True, "hold_ref": "sim_hold_1"}
    receiver = SimReceiver()
    with pytest.raises(RuntimeError):
        deliver_bank_signal(store, bank, now[0], receiver)
    now[0] += timedelta(seconds=61)
    with connect() as conn, conn.cursor() as cur:
        bank = next(r for r in claim_due(cur, now=now[0]) if r["kind"] == "bank_signal")
    assert deliver_bank_signal(store, bank, now[0], receiver)
    assert len(receiver.calls) == 1
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT hold_ref,bank_sent_at FROM incidents")
        assert cur.fetchone() == ("sim_hold_1", now[0])


def test_sim_bank_adapter_refuses_non_http_and_remote_plain_http():
    from server.bank_worker import SimBankHTTP
    for url in ("file:///etc/passwd", "ftp://bank.example", "http://bank.example", "https://"):
        with pytest.raises(ValueError):
            SimBankHTTP(url)
    SimBankHTTP("https://bank.example")
    SimBankHTTP("http://127.0.0.1:9000")
