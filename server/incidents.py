"""PROPOSED subject-wide incident grouping, explicitly directed by Sibusiso.

All mutation functions require the caller's existing subject_heads row lock.
They do not acquire a second subject lock or commit the caller's transaction.
"""
import uuid
from datetime import timedelta

from server.outbox import enqueue

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS incidents (
    incident_id UUID PRIMARY KEY, subject_id TEXT NOT NULL,
    pre_incident_head CHAR(64) NOT NULL, opened_at TIMESTAMPTZ NOT NULL,
    last_signal_at TIMESTAMPTZ NOT NULL, last_pin_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ, close_reason TEXT,
    has_duress BOOLEAN NOT NULL DEFAULT FALSE,
    bank_trigger TEXT, bank_sent_at TIMESTAMPTZ, hold_ref TEXT,
    stand_down_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS one_open_incident_per_subject
    ON incidents(subject_id) WHERE closed_at IS NULL;
CREATE TABLE IF NOT EXISTS incident_signals (
    signal_event_id TEXT PRIMARY KEY, incident_id UUID NOT NULL REFERENCES incidents(incident_id)
);
CREATE TABLE IF NOT EXISTS escalation_gaps (
    incident_id UUID NOT NULL, reason TEXT NOT NULL, recorded_at TIMESTAMPTZ NOT NULL,
    proposed BOOLEAN NOT NULL DEFAULT TRUE, PRIMARY KEY(incident_id,reason)
);
"""


def incident_for_signal(cursor, subject_id, now, pre_incident_head):
    """PROPOSED: one open incident per subject, across all journeys."""
    cursor.execute("SELECT incident_id::text FROM incidents WHERE subject_id=%s AND closed_at IS NULL", (subject_id,))
    row = cursor.fetchone()
    if row:
        incident_id = row[0]
        cursor.execute("UPDATE incidents SET last_signal_at=GREATEST(last_signal_at,%s) WHERE incident_id=%s", (now, incident_id))
    else:
        incident_id = str(uuid.uuid4())
        cursor.execute("INSERT INTO incidents(incident_id,subject_id,pre_incident_head,opened_at,last_signal_at) VALUES(%s,%s,%s,%s,%s)", (incident_id, subject_id, pre_incident_head, now, now))
    return incident_id


def request_alarm(cursor, incident_id, *, trigger, now):
    """Reserve one bank effect per incident; delivery gates non-duress timing."""
    if trigger not in ("duress_signal", "no_answer", "contact_lost"):
        raise ValueError("detection alone cannot request a bank signal")
    cursor.execute("SELECT bank_trigger,bank_sent_at FROM incidents WHERE incident_id=%s", (incident_id,))
    prior, sent_at = cursor.fetchone()
    # A late duress escalation must reach guardians even after a no-answer
    # notification. Retries/detections of the same trigger retain a stable key.
    key = "guardian:" + incident_id + ":" + trigger
    cursor.execute("SELECT 1 FROM outbox WHERE idempotency_key=%s", (key,))
    if cursor.fetchone() is None:
        enqueue(cursor, idempotency_key=key, kind="guardian_alert", reference_id=incident_id, not_before=now)
    if trigger == "duress_signal":
        cursor.execute("UPDATE incidents SET has_duress=TRUE,bank_trigger='duress_signal' WHERE incident_id=%s", (incident_id,))
        if sent_at is None:
            key = "bank:" + incident_id
            cursor.execute("SELECT 1 FROM outbox WHERE idempotency_key=%s", (key,))
            if cursor.fetchone() is None:
                enqueue(cursor, idempotency_key=key, kind="bank_signal", reference_id=incident_id, not_before=now)
            else:
                cursor.execute("""UPDATE outbox SET not_before=LEAST(not_before,%s),
                    state=CASE WHEN state='done' THEN 'pending' ELSE state END,
                    delivered_at=NULL WHERE idempotency_key=%s""", (now, key))
    elif prior is None:
        cursor.execute("UPDATE incidents SET bank_trigger=%s WHERE incident_id=%s", (trigger, incident_id))


def bank_after_delivery(cursor, incident_id):
    cursor.execute("SELECT bank_trigger,bank_sent_at,stand_down_at FROM incidents WHERE incident_id=%s", (incident_id,))
    trigger, sent, stand_down = cursor.fetchone()
    if trigger not in ("no_answer", "contact_lost") or sent is not None or stand_down is not None:
        return
    from server.contact import all_outcomes_normal
    if trigger == "contact_lost" and all_outcomes_normal(cursor, incident_id):
        return  # G33: contact_lost after all-normal check-ins alerts guardians, never the bank
    cursor.execute("SELECT MIN(delivered_at) FROM guardian_deliveries WHERE incident_id=%s", (incident_id,))
    delivered = cursor.fetchone()[0]
    if delivered is None:
        return
    key = "bank:" + incident_id
    cursor.execute("SELECT 1 FROM outbox WHERE idempotency_key=%s", (key,))
    if cursor.fetchone() is None:
        enqueue(cursor, idempotency_key=key, kind="bank_signal", reference_id=incident_id,
                not_before=delivered + timedelta(minutes=3))


def stand_down(cursor, incident_id, now):
    """Call only after a guardian's stand-down authority is verified."""
    cursor.execute("UPDATE incidents SET stand_down_at=%s WHERE incident_id=%s", (now, incident_id))
    cursor.execute("""UPDATE outbox SET state='done',delivered_at=%s,lease_token=NULL,lease_until=NULL
        WHERE idempotency_key=%s AND state <> 'done' AND EXISTS
        (SELECT 1 FROM incidents WHERE incident_id=%s AND bank_trigger <> 'duress_signal')""",
        (now, "bank:" + incident_id, incident_id))


def gap(cursor, incident_id, reason, now):
    """PROPOSED: no delivery means no timed bank signal; keep incident open."""
    cursor.execute("INSERT INTO escalation_gaps(incident_id,reason,recorded_at) VALUES(%s,%s,%s) ON CONFLICT DO NOTHING", (incident_id, reason, now))
