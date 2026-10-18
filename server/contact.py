"""PROPOSED contact_lost clock (Sibusiso, 25 Sep; Lethabo has not accepted it).

- Contact is subject-wide, matching one open incident per subject: any
  authenticated device heartbeat, or any accepted device event, from the
  subject counts, whichever journey it names.
- The 90 s clock runs from the later of the incident opening and the last
  contact, so an incident that opens before any heartbeat still gets 90 s.
- It fires only while the incident is open AND the subject has a journey that
  has not ended: after every journey ends no heartbeats are expected (G35).
- It fires at most once per incident.
All mutation functions require the caller's subject_heads row lock.
"""
from datetime import timedelta

from server import incidents

CONTACT_LOST_AFTER = timedelta(seconds=90)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS subject_contact (
    subject_id TEXT PRIMARY KEY, last_contact_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS contact_lost_at TIMESTAMPTZ;
"""


def record_contact(cur, subject_id, now):
    cur.execute("""INSERT INTO subject_contact(subject_id,last_contact_at) VALUES(%s,%s)
        ON CONFLICT(subject_id) DO UPDATE SET last_contact_at=GREATEST(subject_contact.last_contact_at,EXCLUDED.last_contact_at)""",
                (subject_id, now))


DUE_SQL = """SELECT i.incident_id::text FROM incidents i
    LEFT JOIN subject_contact c ON c.subject_id=i.subject_id
    WHERE i.subject_id=%s AND i.closed_at IS NULL AND i.contact_lost_at IS NULL
      AND GREATEST(i.opened_at, COALESCE(c.last_contact_at, i.opened_at)) + %s <= %s
      AND EXISTS(SELECT 1 FROM journey_subjects j WHERE j.subject_id=i.subject_id
                 AND NOT EXISTS(SELECT 1 FROM ended_journeys e WHERE e.journey_id=j.journey_id))"""


def contact_lost_enabled() -> bool:
    """Off by default (Khutso #89): the app sends no heartbeats yet, so the
    90 s clock would false-alarm while the phone is fine. Enable only with a
    heartbeat producer and an integration test."""
    import os
    return os.getenv("VUKA_CONTACT_LOST_ENABLED", "0") == "1"


def fire_contact_lost(cur, store, subject_id, now):
    from server.event_effects import append_server
    if not contact_lost_enabled():
        return False
    cur.execute(DUE_SQL + " FOR UPDATE OF i", (subject_id, CONTACT_LOST_AFTER, now))
    row = cur.fetchone()
    if row is None:
        return False
    incident_id = row[0]
    cur.execute("UPDATE incidents SET contact_lost_at=%s WHERE incident_id=%s", (now, incident_id))
    append_server(cur, store, subject_id, {"kind": "contact_lost", "pv": 1}, now)
    incidents.request_alarm(cur, incident_id, trigger="contact_lost", now=now)
    return True


def all_outcomes_normal(cur, incident_id):
    """G33: every check-in outcome in the incident is normal_pin (and at least one exists)."""
    cur.execute("""SELECT count(*), count(*) FILTER (WHERE t.outcome='normal_pin')
        FROM incident_signals s JOIN signal_deadlines t USING(signal_event_id)
        WHERE s.incident_id=%s""", (incident_id,))
    total, normal = cur.fetchone()
    return total > 0 and total == normal
