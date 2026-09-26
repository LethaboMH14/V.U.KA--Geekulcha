"""Public, no-auth GET /v1/anchor/latest and /v1/anchor/proof/{head}; real PostgreSQL."""
from datetime import timedelta

from server.anchoring import BatchCoordinator
from server.outbox import enqueue
from server.tests.sim_postgres import sim_database, SIM_RECEIVED  # noqa: F401  (fixture)
from server.tests.test_anchor_batches import sim_receipt
from server.tests.test_slice3_events import sim_api  # noqa: F401  (fixture)


def test_no_anchor_yet_is_404(sim_api):
    store, client, *_ = sim_api
    response = client.get("/v1/anchor/latest")
    assert response.status_code == 404


def test_unknown_head_is_404(sim_api):
    store, client, *_ = sim_api
    response = client.get("/v1/anchor/proof/" + "a" * 64)
    assert response.status_code == 404


def test_malformed_head_is_400(sim_api):
    store, client, *_ = sim_api
    assert client.get("/v1/anchor/proof/not-hex").status_code == 400


def test_confirmed_batch_is_readable_with_a_valid_proof(sim_api):
    store, client, subject, *_ = sim_api
    connect = lambda: store._connection()  # noqa: E731  (matches the fixture's own connect shape)
    worker = BatchCoordinator(connect, publisher=sim_receipt)
    worker.initialize(SIM_RECEIVED)
    head = "a" * 64
    with connect() as conn, conn.cursor() as cur:
        cur.execute("UPDATE subject_heads SET event_hash=%s WHERE subject_id=%s", (head, subject))
        enqueue(cur, idempotency_key="sim_anchor_test", kind="anchor_request", reference_id="sim_event", not_before=SIM_RECEIVED)
    assert worker.tick(SIM_RECEIVED) == "confirmed"

    manifest = client.get("/v1/anchor/latest")
    assert manifest.status_code == 200
    body = manifest.json()
    assert body["key_manifest"]["server_ed25519_public_key"]
    assert body["receipt"]["sequence_number"] == 7

    proof = client.get("/v1/anchor/proof/" + head)
    assert proof.status_code == 200
    body = proof.json()
    assert body["proof"] == [] and body["receipt"]["sequence_number"] == 7
    from anchor.merkle import build_merkle_root, verify_merkle_proof
    root = build_merkle_root([bytes.fromhex(head)])
    assert verify_merkle_proof(root, bytes.fromhex(head), body["proof"])

    unrelated = client.get("/v1/anchor/proof/" + "b" * 64)
    assert unrelated.status_code == 404


def test_a_held_records_fingerprint_is_anchored_and_provable(sim_api):
    """A detection opens an incident; the member's export is then held at its
    pre_incident_head for 6 h (server/export_view.py). The signal supersedes
    that head at once, so a snapshot of current heads never captures it and a
    shared record could never be verified on the ledger. The incident must
    request an anchor, and the coordinator must include that head as a leaf."""
    from anchor.merkle import verify_merkle_proof
    from server.tests.test_slice3_events import signal
    store, client, subject, key, event, post, now, connect = sim_api
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT event_hash FROM subject_heads WHERE subject_id=%s", (subject,))
        before = cur.fetchone()[0].strip()
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("""SELECT i.pre_incident_head, h.event_hash FROM incidents i
                       JOIN subject_heads h USING (subject_id) WHERE i.subject_id=%s""", (subject,))
        pre, head_now = (v.strip() for v in cur.fetchone())
    assert pre == before and head_now != pre  # the held head is superseded at once

    worker = BatchCoordinator(connect, publisher=sim_receipt)
    worker.initialize(now[0])
    assert worker.tick(now[0]) == "confirmed"  # due because the incident asked for an anchor

    response = client.get("/v1/anchor/proof/" + pre)
    assert response.status_code == 200, response.json()
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT root_hex FROM anchor_batches WHERE state='confirmed'")
        root = bytes.fromhex(cur.fetchone()[0].strip())
    assert verify_merkle_proof(root, bytes.fromhex(pre), response.json()["proof"])
