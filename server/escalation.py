"""Receipt-time G34 scheduling primitives; incident wiring is not yet built."""

from datetime import datetime, timedelta

# PROPOSED by Sibusiso, 25 Sep: assume the maximum before opened supplies a
# window. Lethabo has not accepted this policy. Never infer it from audio ms.
NO_OPENED_ASSUMED_WINDOW_S = 60


def fallback_due_at(received_at: datetime) -> datetime:
    """PROPOSED G34: signal receipt + assumed window + 30 seconds grace."""
    if not isinstance(received_at, datetime) or received_at.utcoffset() is None:
        raise ValueError("received_at must be timezone-aware")
    return received_at + timedelta(seconds=NO_OPENED_ASSUMED_WINDOW_S + 30)


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS signal_deadlines (
    signal_event_id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    journey_id TEXT NOT NULL,
    fallback_due_at TIMESTAMPTZ NOT NULL,
    checkin_id TEXT UNIQUE,
    opened_due_at TIMESTAMPTZ,
    outcome TEXT CHECK (outcome IN ('normal_pin', 'duress_pin', 'no_answer')),
    CHECK ((checkin_id IS NULL) = (opened_due_at IS NULL))
);
"""


def schedule_signal(cursor, *, signal_event_id, subject_id, journey_id, received_at):
    """Called in the authenticated signal append transaction; does not commit."""
    cursor.execute(
        """INSERT INTO signal_deadlines
           (signal_event_id, subject_id, journey_id, fallback_due_at)
           VALUES (%s, %s, %s, %s)""",
        (signal_event_id, subject_id, journey_id, fallback_due_at(received_at)),
    )


def record_opened(cursor, *, signal_event_id, subject_id, journey_id,
                  checkin_id, window_s, received_at):
    """Replace only this signal's fallback under its row lock.

    An already-terminal fallback is never undone. Caller handles its late
    opened/result records; this primitive does not decide incident policy.
    """
    if type(window_s) is not int or window_s not in (20, 60):
        raise ValueError("window_s must be 20 or 60")
    if received_at.utcoffset() is None:
        raise ValueError("received_at must be timezone-aware")
    cursor.execute(
        """SELECT outcome, checkin_id FROM signal_deadlines
           WHERE signal_event_id = %s AND subject_id = %s AND journey_id = %s
           FOR UPDATE""", (signal_event_id, subject_id, journey_id),
    )
    row = cursor.fetchone()
    if row is None:
        raise ValueError("signal binding is unknown")
    if row[1] is not None:
        raise ValueError("signal already has an opened check-in")
    cursor.execute(
        """UPDATE signal_deadlines SET checkin_id = %s, opened_due_at = %s
           WHERE signal_event_id = %s""",
        (checkin_id, received_at + timedelta(seconds=window_s + 10), signal_event_id),
    )
    return row[0]


def claim_timeout(cursor, *, signal_event_id, now):
    """Arbitrate a timeout in the caller's outcome/outbox transaction.

    Exactly one caller wins. Returning True is NOT a complete escalation:
    caller must append the signed server event and effects before committing.
    """
    if now.utcoffset() is None:
        raise ValueError("now must be timezone-aware")
    cursor.execute(
        """UPDATE signal_deadlines SET outcome = 'no_answer'
           WHERE signal_event_id = %s AND outcome IS NULL
             AND COALESCE(opened_due_at, fallback_due_at) <= %s
           RETURNING signal_event_id""", (signal_event_id, now),
    )
    return cursor.fetchone() is not None
