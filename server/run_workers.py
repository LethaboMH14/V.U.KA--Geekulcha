"""PROPOSED (Lethabo, 25 Sep): one process that runs the background work.

Every second: the deadline and contact-lost scheduler tick, then due outbox
rows. Guardian alerts go through the SIMULATED notifier (FCM is not wired);
bank signals and anchor requests are left for their own workers, and their
leases simply expire. Run: python -m server.run_workers
"""
import time
from contextlib import closing
from datetime import datetime, timezone

from server.db import PostgresDatabase
from server.guardian_notifier import SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.outbox import claim_due
from server.scheduler import tick


def step(store, notifier, now):
    tick(store, now)
    with closing(store._connection()) as conn, conn, conn.cursor() as cur:
        rows = [r for r in claim_due(cur, now=now) if r["kind"] == "guardian_alert"]
    delivered = 0
    for row in rows:
        if deliver_guardian_alert(store._connection, notifier, row, now):
            delivered += 1
    return delivered


def main():
    store = PostgresDatabase()
    store.initialize()
    notifier = SimulatedGuardianNotifier(store._connection, lambda: datetime.now(timezone.utc))
    while True:
        step(store, notifier, datetime.now(timezone.utc))
        time.sleep(1)


if __name__ == "__main__":
    main()
