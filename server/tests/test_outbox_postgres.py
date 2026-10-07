"""Real PostgreSQL outbox durability and idempotency checks."""

import base64
import os
import uuid
from contextlib import closing
from datetime import datetime, timedelta, timezone

import pytest

from server.db import PostgresDatabase
from server.outbox import OutboxConflict, claim_due, enqueue, mark_done


@pytest.mark.skipif(not os.getenv("VUKA_TEST_DATABASE_URL"), reason="test PostgreSQL URL not set")
def test_outbox_commit_lease_reclaim_and_idempotency():
    database = PostgresDatabase(
        database_url=os.environ["VUKA_TEST_DATABASE_URL"],
        payload_key_b64=base64.b64encode(bytes(range(32))).decode("ascii"),
    )
    database.initialize()
    due = datetime.now(timezone.utc).replace(microsecond=0)
    key = f"sim_outbox_{uuid.uuid4().hex}"
    reference = f"sim_checkin_{uuid.uuid4().hex}"

    with closing(database._connection()) as connection:
        with connection:
            with connection.cursor() as cursor:
                enqueue(cursor, idempotency_key=key, kind="guardian_alert",
                        reference_id=reference, not_before=due)
                enqueue(cursor, idempotency_key=key, kind="guardian_alert",
                        reference_id=reference, not_before=due)

    # New connection stands in for a restarted process after the outcome commit.
    with closing(database._connection()) as connection:
        with connection:
            with connection.cursor() as cursor:
                assert claim_due(cursor, now=due - timedelta(seconds=1)) == []
                first = claim_due(cursor, now=due, lease_seconds=10)
                assert len(first) == 1
                assert first[0]["idempotency_key"] == key
                assert first[0]["attempts"] == 1
                assert claim_due(cursor, now=due + timedelta(seconds=9)) == []

    # Simulate a crash after external send but before mark_done. A later worker
    # gets the same idempotency key; the receiver must dedupe its visible effect.
    with closing(database._connection()) as connection:
        with connection:
            with connection.cursor() as cursor:
                second = claim_due(cursor, now=due + timedelta(seconds=11), lease_seconds=10)
                assert len(second) == 1
                assert second[0]["attempts"] == 2
                assert second[0]["lease_token"] != first[0]["lease_token"]
                assert not mark_done(cursor, idempotency_key=key,
                                     lease_token=first[0]["lease_token"],
                                     now=due + timedelta(seconds=12))
                assert mark_done(cursor, idempotency_key=key,
                                 lease_token=second[0]["lease_token"],
                                 now=due + timedelta(seconds=12))
                assert claim_due(cursor, now=due + timedelta(seconds=30)) == []

    with closing(database._connection()) as connection:
        with pytest.raises(OutboxConflict):
            with connection:
                with connection.cursor() as cursor:
                    enqueue(cursor, idempotency_key=key, kind="bank_signal",
                            reference_id=reference, not_before=due)

    rollback_key = f"sim_outbox_rollback_{uuid.uuid4().hex}"
    with closing(database._connection()) as connection:
        with pytest.raises(RuntimeError, match="sim_crash"):
            with connection:
                with connection.cursor() as cursor:
                    enqueue(cursor, idempotency_key=rollback_key,
                            kind="anchor_request", reference_id=reference,
                            not_before=due)
                    raise RuntimeError("sim_crash")
    with closing(database._connection()) as connection:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM outbox WHERE idempotency_key = %s", (rollback_key,))
                assert cursor.fetchone() is None


def test_outbox_rejects_naive_deadlines_and_invalid_effects():
    with pytest.raises(ValueError, match="timezone"):
        enqueue(None, idempotency_key="sim_k", kind="guardian_alert",
                reference_id="sim_ref", not_before=datetime(2026, 9, 24))
    with pytest.raises(ValueError, match="key, kind"):
        enqueue(None, idempotency_key="sim_k", kind="unknown",
                reference_id="sim_ref", not_before=datetime.now(timezone.utc))
