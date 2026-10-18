"""Dedicated-connection deadline worker; receipt times are persisted in SQL."""
from contextlib import closing
import logging
import time
from datetime import datetime, timedelta, timezone

from server.db import PostgresDatabase
from server.contact import fire_contact_lost
from server.guardian_effects import fire_guardian_removals
from server.event_effects import fire_due_for_subject

SCHEDULER_LOCK = 864204

# One subject whose due work cannot complete (e.g. the server signing key is
# missing, so a server-signed `no_answer` can't be written) must not stop every
# other subject's deadlines. Its transaction rolls back and it is retried on the
# next tick; the failure is logged at most once per subject and stage per window,
# not once a second.
_FAILURE_LOG_WINDOW = timedelta(minutes=5)
_last_failure_logged = {}


def _run_for_subject(store, subject_id, now, stage, fire):
    try:
        with closing(store._connection()) as conn, conn, conn.cursor() as cur:
            cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
            fire(cur, store, subject_id, now)
    except Exception as exc:
        key = (subject_id, stage, type(exc).__name__, str(exc))
        last = _last_failure_logged.get(key)
        if last is None or now - last >= _FAILURE_LOG_WINDOW:
            _last_failure_logged[key] = now
            logging.error("vuka: scheduler %s failed for %s (%s: %s); other subjects continue, retried next tick",
                          stage, subject_id, type(exc).__name__, exc)


def tick(store, now):
    lock_connection = store._connection()
    try:
        with lock_connection.cursor() as cur:
            cur.execute("SELECT pg_try_advisory_lock(%s)", (SCHEDULER_LOCK,))
            if not cur.fetchone()[0]:
                return False
            cur.execute("SELECT DISTINCT subject_id FROM signal_deadlines WHERE outcome IS NULL AND COALESCE(opened_due_at,fallback_due_at)<=%s ORDER BY subject_id", (now,))
            subjects = [r[0] for r in cur.fetchall()]
            cur.execute("SELECT DISTINCT subject_id FROM incidents WHERE closed_at IS NULL AND contact_lost_at IS NULL ORDER BY subject_id")
            contact_subjects = [r[0] for r in cur.fetchall()]
        for subject_id in subjects:
            _run_for_subject(store, subject_id, now, "deadlines", fire_due_for_subject)
        with closing(store._connection()) as conn, conn.cursor() as cur:
            cur.execute("SELECT DISTINCT subject_id FROM guardians WHERE status='removal_scheduled' AND removal_due_at<=%s", (now,))
            removal_subjects = [r[0] for r in cur.fetchall()]
        for subject_id in removal_subjects:
            _run_for_subject(store, subject_id, now, "guardian removals", fire_guardian_removals)
        for subject_id in contact_subjects:
            _run_for_subject(store, subject_id, now, "contact_lost", fire_contact_lost)
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
