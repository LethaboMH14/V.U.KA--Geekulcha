"""One worker process must actually drive all three outbox kinds, not just
guardian alerts. Transport receipts here are SIMULATED fixtures (a live
sim_bank over a real socket; a fixed Merkle-batch receipt standing in for a
Hedera mirror read-back) — never the real hedera-sidecar, which needs real
testnet credentials this test suite must never depend on."""
import socket
import threading
import time
from datetime import timedelta

import uvicorn
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

from server.anchoring import PINS, BatchCoordinator
from server.bank_worker import SimBankHTTP
from server.event_effects import anchor_intent
from server.incidents import request_alarm
from server.run_workers import step
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_slice3_events import signal, sim_api  # noqa: F401  (fixture)


def sim_receipt(root):
    return {"kind": "root", "confirmed_by": "public_mirror", "message_hex": "01" + root.hex(),
            "topic_id": PINS["topic_id"], "topic_epoch": PINS["topic_epoch"],
            "sequence_number": 7, "consensus_timestamp": "1790294400.000000001",
            "running_hash": "sim_running_hash"}


def test_a_single_worker_tick_delivers_a_guardian_alert_a_bank_signal_and_an_anchor_batch(sim_api):
    from server import server_signing
    from sim_bank.main import create_app

    store, client, subject, key, event, post, now, connect = sim_api
    with connect() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO sim_guardians VALUES(%s,'sim_guardian')", (subject,))
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents")
        incident = cur.fetchone()[0]
        request_alarm(cur, incident, trigger="duress_signal", now=now[0])
        # A real duress checkin_result/pin_authorised event calls this itself
        # (server/event_effects.py); this test drives request_alarm directly,
        # so it must enqueue the anchor_request the same way to prove the
        # worker's anchor tick, not just skip the third outbox kind.
        anchor_intent(cur, "sim_test_event", now[0])
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT kind FROM outbox WHERE state='pending'")
        pending_kinds = {row[0] for row in cur.fetchall()}
    assert pending_kinds == {"guardian_alert", "bank_signal", "anchor_request"}

    pinned = Ed25519PublicKey.from_public_bytes(server_signing._pinned_public_key())
    bank_app = create_app(public_key=pinned, clock=lambda: now[0])
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    bank_server = uvicorn.Server(uvicorn.Config(bank_app, host="127.0.0.1", port=port, log_level="warning"))
    thread = threading.Thread(target=bank_server.run, daemon=True)
    thread.start()
    for _ in range(100):
        if bank_server.started:
            break
        time.sleep(0.05)

    batches = BatchCoordinator(store._connection, publisher=sim_receipt)
    batches.initialize(now[0])
    try:
        delivered = step(store, now[0], bank_sender=SimBankHTTP(f"http://127.0.0.1:{port}"), batches=batches)
    finally:
        bank_server.should_exit = True
        thread.join(timeout=5)

    assert delivered == 2  # guardian_alert + bank_signal in this one tick
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT state FROM outbox WHERE kind='guardian_alert'")
        assert cur.fetchone()[0] == "done"
        cur.execute("SELECT state,hold_ref FROM outbox o JOIN incidents i ON i.incident_id::text=o.reference_id WHERE o.kind='bank_signal'")
        state, hold_ref = cur.fetchone()
        assert state == "done" and hold_ref
        cur.execute("SELECT state FROM outbox WHERE kind='anchor_request'")
        assert cur.fetchone()[0] == "done"  # folded into the batch snapshot by the same tick
        cur.execute("SELECT state FROM anchor_batches")
        assert cur.fetchone()[0] == "confirmed"

    assert len(bank_app.state.sim_state["holds"]) == 1


def test_anchor_status_changes_are_logged_once_each(sim_api, capsys):
    """The coordinator returns a status and never raises for transport
    failures; the worker must print each change so a stuck batch is visible."""
    store, *_, now, _connect = sim_api

    class Batches:
        statuses = iter(["not_due", "not_due", "retry_pending", "retry_pending"])

        def tick(self, _now):
            return next(self.statuses)

    batches = Batches()
    for _ in range(4):
        step(store, now[0], batches=batches, environ={})
    out = capsys.readouterr().out
    assert out.count("vuka: anchor status not_due") == 1
    assert out.count("vuka: anchor status retry_pending") == 1


def test_an_unsignable_deadline_never_stops_guardian_alerts(sim_api, monkeypatch):
    """The 26 Sep Azure outage: no server signing key, so a due deadline's
    server-signed `no_answer` could not be written. The scheduler raised out of
    every worker step, and no guardian alert, bank signal or anchor ran for
    anyone. A failing deadline must roll back and wait; delivery must go on."""
    from datetime import timedelta
    from server.tests.test_guardian_lifecycle import add_real_guardian
    store, client, subject, key, event, post, now, connect = sim_api
    add_real_guardian(sim_api)
    assert post(signal(event)).status_code == 201  # schedules a deadline for this signal
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents")
        request_alarm(cur, cur.fetchone()[0], trigger="duress_signal", now=now[0])
    monkeypatch.delenv("VUKA_SERVER_ED25519_KEY_B64", raising=False)  # exactly Azure's state
    later = now[0] + timedelta(minutes=5)  # the signal's deadline is well past due

    delivered = step(store, later, bank_sender=None, environ={})

    assert delivered >= 1  # the duress alert still reached the guardian
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT state FROM outbox WHERE kind='guardian_alert'")
        assert cur.fetchone()[0] == "done"
        cur.execute("SELECT count(*) FROM signal_deadlines WHERE outcome IS NULL")
        assert cur.fetchone()[0] >= 1  # the unsignable outcome rolled back; retried next tick


def test_the_scheduler_isolates_a_subject_it_cannot_sign_for(sim_api, monkeypatch, caplog):
    """Layer 1: the scheduler itself must not raise; the failing subject is
    rolled back, logged (once per window, not per second) and retried."""
    from datetime import timedelta
    from server import scheduler
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    monkeypatch.delenv("VUKA_SERVER_ED25519_KEY_B64", raising=False)
    later = now[0] + timedelta(minutes=5)
    with caplog.at_level("ERROR"):
        assert scheduler.tick(store, later) is True
        assert scheduler.tick(store, later + timedelta(seconds=1)) is True
    failures = [r for r in caplog.records if "scheduler deadlines failed for " + subject in r.getMessage()]
    assert len(failures) == 1  # attempted, logged once, not once per tick


def test_a_scheduler_that_raises_does_not_stop_delivery(sim_api, monkeypatch):
    """Layer 2: whatever the scheduler does, the worker step still delivers."""
    from server import run_workers
    from server.tests.test_guardian_lifecycle import add_real_guardian
    store, client, subject, key, event, post, now, connect = sim_api
    add_real_guardian(sim_api)
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents")
        request_alarm(cur, cur.fetchone()[0], trigger="no_answer", now=now[0])

    def broken_tick(_store, _now):
        raise RuntimeError("sim_scheduler_failure")

    monkeypatch.setattr(run_workers, "tick", broken_tick)
    assert step(store, now[0], environ={}) == 1
