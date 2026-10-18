"""First full S1 path: incident -> guardian delivery -> +3 min -> ANCHOR's outbox sends
to a live sim_bank over a socket -> bank_signal_sent with the real hold_ref. Real PostgreSQL."""
import socket
import threading
import time
from datetime import timedelta

import uvicorn
from cryptography.hazmat.primitives.serialization import PublicFormat, Encoding
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

from server.bank_worker import SimBankHTTP, deliver_bank_signal
from server.guardian_worker import deliver_guardian_alert
from server.outbox import claim_due
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_guardian_delivery import setup_alert
from server.tests.test_slice3_events import sim_api  # noqa: F401  (fixture)
from sim_bank.main import create_app


def test_no_answer_reaches_a_live_sim_bank(sim_api):
    from server import server_signing
    store, *_, now, connect = sim_api
    incident, row, notifier = setup_alert(sim_api, trigger="no_answer")
    assert deliver_guardian_alert(connect, notifier, row, now[0])
    now[0] += timedelta(minutes=3)
    with connect() as conn, conn.cursor() as cur:
        bank_row = next(r for r in claim_due(cur, now=now[0]) if r["kind"] == "bank_signal")

    pinned = Ed25519PublicKey.from_public_bytes(server_signing._pinned_public_key())  # fixture-patched key
    app = create_app(public_key=pinned, clock=lambda: now[0])
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    server = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning"))
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    for _ in range(100):
        if server.started:
            break
        time.sleep(0.05)
    try:
        assert deliver_bank_signal(store, bank_row, now[0], SimBankHTTP(f"http://127.0.0.1:{port}"))
    finally:
        server.should_exit = True
        thread.join(timeout=5)
    holds = app.state.sim_state["holds"]
    assert len(holds) == 1
    (hold_ref, hold), = holds.items()
    assert hold["triggering_outcome"] == "no_answer" and hold["subject_id"].startswith("sim_")
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT hold_ref FROM incidents WHERE incident_id=%s", (incident,))
        assert cur.fetchone() == (hold_ref,)
