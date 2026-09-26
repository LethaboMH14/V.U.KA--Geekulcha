"""Regression tests for Khutso's #89 review and the clock-skew exemption; real PostgreSQL."""
import json
from datetime import timedelta

import pytest

from server.bank_worker import deliver_bank_signal
from server.guardian_worker import deliver_guardian_alert
from server.incidents import request_alarm
from server.outbox import claim_due
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_guardian_delivery import setup_alert
from server.tests.test_server_slice1 import make_genesis_registration, signed_post
from server.tests.test_slice3_events import sim_api  # noqa: F401  (fixture)


class Receiver:
    def __init__(self, fail_first=False):
        self.calls, self.fail = [], fail_first

    def send(self, body, headers):
        payload = json.loads(body)
        assert payload["idempotency_key"] == headers["Idempotency-Key"]
        self.calls.append(payload)
        if self.fail:
            self.fail = False
            raise RuntimeError("sim send failed")
        return {"sim": True, "hold_ref": "sim_hold_" + str(len(self.calls))}


def test_failed_no_answer_send_then_late_duress_sends_duress(sim_api):
    store, *_, now, connect = sim_api
    incident, row, notifier = setup_alert(sim_api, trigger="no_answer")
    assert deliver_guardian_alert(connect, notifier, row, now[0])
    now[0] += timedelta(minutes=3)
    with connect() as conn, conn.cursor() as cur:
        bank = next(r for r in claim_due(cur, now=now[0]) if r["kind"] == "bank_signal")
    receiver = Receiver(fail_first=True)
    with pytest.raises(RuntimeError):
        deliver_bank_signal(store, bank, now[0], receiver)
    now[0] += timedelta(seconds=5)
    with connect() as conn, conn.cursor() as cur:
        request_alarm(cur, incident, trigger="duress_signal", now=now[0])
    now[0] += timedelta(seconds=61)
    with connect() as conn, conn.cursor() as cur:
        bank = next(r for r in claim_due(cur, now=now[0]) if r["kind"] == "bank_signal")
    assert deliver_bank_signal(store, bank, now[0], receiver)
    assert receiver.calls[0]["triggering_outcome"] == "no_answer"
    assert receiver.calls[-1]["triggering_outcome"] == "duress_signal"
    assert receiver.calls[-1]["idempotency_key"] != receiver.calls[0]["idempotency_key"]


def test_contact_lost_then_no_answer_is_labelled_no_answer(sim_api):
    store, *_, now, connect = sim_api
    incident, row, notifier = setup_alert(sim_api, trigger="contact_lost")
    with connect() as conn, conn.cursor() as cur:
        request_alarm(cur, incident, trigger="no_answer", now=now[0])
        cur.execute("SELECT bank_trigger FROM incidents WHERE incident_id=%s", (incident,))
        assert cur.fetchone() == ("no_answer",)
        request_alarm(cur, incident, trigger="contact_lost", now=now[0])
        cur.execute("SELECT bank_trigger FROM incidents WHERE incident_id=%s", (incident,))
        assert cur.fetchone() == ("no_answer",)  # never downgraded


def test_skew_exemption_matches_v2_payload_kind(sim_api):
    """A checkin_result sent as action=device_event with a far-off request clock is still accepted."""
    import uuid
    from server.tests.test_slice3_events import opened, signal
    store, client, subject, key, event, post, now, connect = sim_api
    detection = signal(event)
    assert post(detection).status_code == 201
    checkin = str(uuid.uuid4())
    assert post(opened(event, detection, checkin)).status_code == 201
    result = event({"kind": "checkin_result", "pv": 1, "checkin_id": checkin, "result": "duress_pin", "attempt": 1})
    assert result["action"].removeprefix("sim_") == "device_event"
    far = (now[0] - timedelta(hours=2)).isoformat()
    response = signed_post(client, result, ts=far)
    assert response.status_code == 201, response.json()
    assert store.export(subject)[-1]["details"].get("clock_skew") is True


def test_identical_genesis_retry_returns_the_original_receipt(sim_api):
    store, client, *_ , now, connect = sim_api
    registration = make_genesis_registration("sim_retry_" + "a" * 8)
    first = signed_post(client, registration, ts=now[0].isoformat())
    second = signed_post(client, registration, ts=now[0].isoformat())
    assert first.status_code == 201
    assert second.status_code in (200, 201), second.json()
    assert second.json()["event_hash"] == first.json()["event_hash"]
