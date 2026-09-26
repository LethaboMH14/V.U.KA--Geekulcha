"""PROPOSED §13/§9 F15: subject-requested deletion, 72h cooling-off, duress no-op.

Transport: the fresh PIN authorisation is a `pin_authorised` (action="delete")
event via POST /v1/events, same PROPOSED pattern as end_journey/export/
guardian_ack (a bare PinAuthorisationStatement cannot become a chain-signed
statement outside /v1/events). DELETE /v1/subjects/{id}/data consumes it.
"""
from datetime import timedelta

COOLING_OFF = timedelta(hours=72)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS deletion_requests (
    subject_id TEXT PRIMARY KEY,
    requested_at TIMESTAMPTZ NOT NULL,
    purge_due_at TIMESTAMPTZ NOT NULL,
    purged_at TIMESTAMPTZ
);
"""


def request_deletion(cur, subject_id: str, now) -> None:
    """Normal mode only — a duress delete never calls this (§9: looks done, does nothing)."""
    cur.execute(
        """INSERT INTO deletion_requests (subject_id, requested_at, purge_due_at)
           VALUES (%s, %s, %s)
           ON CONFLICT (subject_id) DO UPDATE SET requested_at=EXCLUDED.requested_at,
               purge_due_at=EXCLUDED.purge_due_at, purged_at=NULL""",
        (subject_id, now, now + COOLING_OFF),
    )


def due_purges(cur, now) -> list[str]:
    cur.execute(
        "SELECT subject_id FROM deletion_requests WHERE purge_due_at <= %s AND purged_at IS NULL",
        (now,),
    )
    return [row[0] for row in cur.fetchall()]


def purge_payloads(cur, subject_id: str, now) -> int:
    """Removes ciphertext only; chain_entries/commitments are untouched (§13)."""
    cur.execute(
        """DELETE FROM private_payloads WHERE subject_id=%s
           AND created_at <= (SELECT requested_at FROM deletion_requests WHERE subject_id=%s)""",
        (subject_id, subject_id),
    )
    removed = cur.rowcount
    # Location fixes (ADR-0048) go with the rest of the member's data.
    from server.locations import purge_subject
    purge_subject(cur, subject_id)
    cur.execute("UPDATE deletion_requests SET purged_at=%s WHERE subject_id=%s", (now, subject_id))
    return removed
