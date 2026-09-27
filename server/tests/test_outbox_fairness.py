"""A fresh guardian alert is never starved by rows that keep failing."""
from datetime import datetime, timedelta, timezone

from server.outbox import OUTBOX_SCHEMA_SQL, claim_due, enqueue
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)


def test_fresh_rows_go_before_rows_that_keep_failing(sim_database):
    now = datetime(2026, 9, 26, 12, 0, tzinfo=timezone.utc)
    with sim_database() as conn, conn.cursor() as cur:
        cur.execute(OUTBOX_SCHEMA_SQL)
        # Twelve old rows that have already failed many times.
        for i in range(12):
            enqueue(cur, idempotency_key=f"bank:old{i:02d}", kind="guardian_alert", reference_id=f"old{i}", not_before=now - timedelta(hours=2))
        cur.execute("UPDATE outbox SET attempts = 50")
        enqueue(cur, idempotency_key="guardian:new:duress_signal", kind="guardian_alert", reference_id="new", not_before=now)
        rows = claim_due(cur, now=now, kinds=("guardian_alert",))
    keys = [r["idempotency_key"] for r in rows]
    assert "guardian:new:duress_signal" in keys
    assert keys[0] == "guardian:new:duress_signal"
