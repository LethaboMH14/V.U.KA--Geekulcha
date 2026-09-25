"""Dedicated-connection deadline worker; receipt times are persisted in SQL."""
from contextlib import closing
import time
from datetime import datetime, timezone

from server.db import PostgresDatabase
from server.event_effects import fire_due_for_subject

SCHEDULER_LOCK = 864204


def tick(store, now):
    lock_connection = store._connection()
    try:
        with lock_connection.cursor() as cur:
            cur.execute("SELECT pg_try_advisory_lock(%s)", (SCHEDULER_LOCK,))
            if not cur.fetchone()[0]:
                return False
            cur.execute("SELECT DISTINCT subject_id FROM signal_deadlines WHERE outcome IS NULL AND COALESCE(opened_due_at,fallback_due_at)<=%s ORDER BY subject_id", (now,))
            subjects = [r[0] for r in cur.fetchall()]
        for subject_id in subjects:
            with closing(store._connection()) as conn, conn, conn.cursor() as cur:
                cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
                fire_due_for_subject(cur, store, subject_id, now)
        return True
    finally:
        # The dedicated session never returns to a pool. Every tick must
        # successfully acquire a fresh session lock before doing any work.
        lock_connection.close()


def main():
    store = PostgresDatabase()
    store.initialize()
    while True:
        tick(store, datetime.now(timezone.utc))
        time.sleep(1)


if __name__ == "__main__":
    main()
