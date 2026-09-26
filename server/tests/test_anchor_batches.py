"""Real PostgreSQL batch tests; transport receipts here are SIMULATED fixtures."""
from datetime import timedelta

import pytest

from anchor.merkle import verify_merkle_proof
from anchor.publish import AnchorNotSubmitted, AnchorPublicationError
from server.anchoring import BatchCoordinator, PINS, sim_stub_publish, reconcile_mirror_root
from server.outbox import OUTBOX_SCHEMA_SQL, enqueue
from server.tests.sim_postgres import sim_database, SIM_RECEIVED


def sim_receipt(root):
    return {"kind": "root", "confirmed_by": "public_mirror", "message_hex": "01" + root.hex(),
            "topic_id": PINS["topic_id"], "topic_epoch": PINS["topic_epoch"],
            "sequence_number": 7, "consensus_timestamp": "1790294400.000000001",
            "running_hash": "sim_running_hash"}


@pytest.fixture
def batch_store(sim_database):
    with sim_database() as conn, conn.cursor() as cur:
        cur.execute(OUTBOX_SCHEMA_SQL)
        cur.execute("CREATE TABLE subject_heads(subject_id TEXT PRIMARY KEY,event_hash CHAR(64) NOT NULL)")
    return sim_database


def change(connect, value, *, immediate=False, now=SIM_RECEIVED):
    with connect() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO subject_heads VALUES('sim_subject',%s) ON CONFLICT(subject_id) DO UPDATE SET event_hash=EXCLUDED.event_hash", (value * 64,))
        if immediate:
            enqueue(cur, idempotency_key="sim_anchor_" + value, kind="anchor_request",
                    reference_id="sim_event_" + value, not_before=now)


def test_hourly_empty_and_public_proof_has_no_payload(batch_store):
    worker = BatchCoordinator(batch_store, publisher=sim_receipt)
    worker.initialize(SIM_RECEIVED)
    assert worker.tick(SIM_RECEIVED + timedelta(hours=1)) == "empty"
    change(batch_store, "a")
    assert worker.tick(SIM_RECEIVED + timedelta(hours=1, minutes=59)) == "not_due"
    assert worker.tick(SIM_RECEIVED + timedelta(hours=2)) == "confirmed"
    proof = worker.proof("a" * 64)
    assert set(proof) == {"proof", "receipt"}
    assert set(proof["receipt"]) == {"topic_id", "topic_epoch", "sequence_number", "consensus_timestamp", "running_hash"}
    with batch_store() as conn, conn.cursor() as cur:
        cur.execute("SELECT root_hex FROM anchor_batches")
        root = bytes.fromhex(cur.fetchone()[0])
    assert verify_merkle_proof(root, bytes.fromhex("a" * 64), proof["proof"])
    assert worker.proof("b" * 64) is None
    assert worker.tick(SIM_RECEIVED + timedelta(hours=3)) == "empty"


def test_immediate_roots_coalesce_and_later_head_gets_next_batch(batch_store):
    calls = []
    def publish(root):
        calls.append(root)
        return sim_receipt(root)
    worker = BatchCoordinator(batch_store, publisher=publish)
    worker.initialize(SIM_RECEIVED)
    change(batch_store, "a", immediate=True)
    assert worker.tick(SIM_RECEIVED) == "confirmed"
    change(batch_store, "b", immediate=True, now=SIM_RECEIVED + timedelta(seconds=1))
    assert worker.tick(SIM_RECEIVED + timedelta(seconds=59)) == "coalesced"
    assert len(calls) == 1
    assert worker.tick(SIM_RECEIVED + timedelta(seconds=60)) == "confirmed"
    assert len(calls) == 2
    assert worker.proof("a" * 64) is not None
    assert worker.proof("b" * 64) is not None


def test_ambiguous_submission_survives_restart_without_blind_resubmit(batch_store):
    def sim_ambiguous(_root):
        raise AnchorPublicationError("sim_timeout_after_submit")
    worker = BatchCoordinator(batch_store, publisher=sim_ambiguous)
    worker.initialize(SIM_RECEIVED)
    change(batch_store, "a", immediate=True)
    assert worker.tick(SIM_RECEIVED) == "reconciliation_required"
    change(batch_store, "b", immediate=True)
    def forbidden(_):
        pytest.fail("must reconcile before resubmission")
    restarted = BatchCoordinator(batch_store, publisher=forbidden)
    assert restarted.tick(SIM_RECEIVED + timedelta(hours=2)) == "reconciliation_required"
    assert restarted.proof("a" * 64) is None
    restarted.reconcile = lambda root, _submitted_at: sim_receipt(bytes.fromhex(root))
    assert restarted.tick(SIM_RECEIVED + timedelta(hours=2)) == "confirmed"
    with batch_store() as conn, conn.cursor() as cur:
        cur.execute("SELECT leaves FROM anchor_batches")
        assert cur.fetchall() == [(["a" * 64],)]


def test_wrong_root_receipt_never_confirms_or_serves_proof(batch_store):
    worker = BatchCoordinator(batch_store, publisher=lambda _: sim_receipt(bytes.fromhex("b" * 64)))
    worker.initialize(SIM_RECEIVED)
    change(batch_store, "a", immediate=True)
    with pytest.raises(AnchorPublicationError, match="pinned root"):
        worker.tick(SIM_RECEIVED)
    assert worker.proof("a" * 64) is None


def test_pre_submit_failure_retries_identical_snapshot_after_60_seconds(batch_store):
    calls = []
    def pre_submit_failure(root):
        calls.append(root)
        raise AnchorNotSubmitted("sim_pre_submit_failure")
    worker = BatchCoordinator(batch_store, publisher=pre_submit_failure)
    worker.initialize(SIM_RECEIVED)
    change(batch_store, "a", immediate=True)
    assert worker.tick(SIM_RECEIVED) == "retry_pending"
    change(batch_store, "b", immediate=True)
    assert worker.tick(SIM_RECEIVED + timedelta(seconds=59)) == "coalesced"
    def recovered(root):
        calls.append(root)
        return sim_receipt(root)
    worker.publisher = recovered
    assert worker.tick(SIM_RECEIVED + timedelta(seconds=60)) == "confirmed"
    assert calls[0] == calls[1]
    assert worker.proof("b" * 64) is None


def test_mirror_reconciliation_checks_typed_bytes_and_pinned_topic():
    import base64
    root = bytes.fromhex("a" * 64)
    receipt = sim_receipt(root)
    message = {key: receipt[key] for key in ("topic_id", "sequence_number", "consensus_timestamp", "running_hash")}
    message["message"] = base64.b64encode(b"\x01" + root).decode()
    pages = [{"messages": [], "links": {"next": "/api/v1/sim_next"}}, {"messages": [message], "links": {"next": None}}]
    assert reconcile_mirror_root(root.hex(), SIM_RECEIVED, fetch=lambda _: pages.pop(0)) == receipt
    assert reconcile_mirror_root("b" * 64, SIM_RECEIVED, fetch=lambda _: {"messages": [message]}) is None
    message["topic_id"] = "0.0.1"
    with pytest.raises(AnchorPublicationError):
        reconcile_mirror_root(root.hex(), SIM_RECEIVED, fetch=lambda _: {"messages": [message]})
