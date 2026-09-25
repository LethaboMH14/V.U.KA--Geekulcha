"""PROPOSED (Lethabo, 25 Sep): one process that runs the background work.

Every second: the deadline and contact-lost scheduler tick, then due outbox
rows. Guardian alerts go through the SIMULATED notifier (FCM is not wired);
bank signals and anchor requests are left for their own workers, and their
leases simply expire. Run: python -m server.run_workers
"""
import logging
import time
from contextlib import closing
from datetime import datetime, timezone

from server.db import PostgresDatabase
from server.guardian_notifier import SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.outbox import claim_due
from server.scheduler import tick


def step(store, now):
    """One tick. The notifier shares this tick's clock: delivery evidence must
    never be stamped later than the time the worker acknowledges it."""
    tick(store, now)
    notifier = SimulatedGuardianNotifier(store._connection, lambda: now)
    with closing(store._connection()) as conn, conn, conn.cursor() as cur:
        rows = [r for r in claim_due(cur, now=now) if r["kind"] == "guardian_alert"]
    delivered = 0
    for row in rows:
        try:
            if deliver_guardian_alert(store._connection, notifier, row, now):
                delivered += 1
        except Exception:  # one bad row must not stop delivery; its lease expires and it retries
            logging.exception("guardian alert %s failed", row["idempotency_key"])
    return delivered


def main():
    store = PostgresDatabase()
    store.initialize()
    while True:
        try:
            step(store, datetime.now(timezone.utc))
        except Exception:
            logging.exception("worker tick failed")
        time.sleep(1)


if __name__ == "__main__":
    main()
