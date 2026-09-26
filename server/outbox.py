"""Durable, idempotent effect queue for the ANCHOR server.

The caller enqueues in the same PostgreSQL transaction as its outcome. A
worker claims due rows with a finite lease, performs the effect, then marks
the row done. Receivers still have to dedupe by idempotency_key: a crash after
sending but before mark_done causes an intentional at-least-once retry.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Any


OUTBOX_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS outbox (
    idempotency_key TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('guardian_alert', 'bank_signal', 'anchor_request')),
    reference_id TEXT NOT NULL,
    not_before TIMESTAMPTZ NOT NULL,
    state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'inflight', 'done')),
    lease_token UUID NULL,
    lease_until TIMESTAMPTZ NULL,
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS outbox_due_idx ON outbox (not_before, lease_until)
    WHERE state <> 'done';
"""

EFFECT_KINDS = frozenset({"guardian_alert", "bank_signal", "anchor_request"})


class OutboxConflict(ValueError):
    """A reused idempotency key refers to a different effect."""


def enqueue(cursor: Any, *, idempotency_key: str, kind: str, reference_id: str,
            not_before: datetime) -> None:
    """Insert in the caller's outcome transaction; never commit here."""
    if not idempotency_key or not reference_id or kind not in EFFECT_KINDS:
        raise ValueError("outbox effect needs a key, kind and opaque reference")
    if not isinstance(not_before, datetime) or not_before.utcoffset() is None:
        raise ValueError("not_before must have a timezone offset")
    cursor.execute(
        """INSERT INTO outbox (idempotency_key, kind, reference_id, not_before)
           VALUES (%s, %s, %s, %s) ON CONFLICT (idempotency_key) DO NOTHING""",
        (idempotency_key, kind, reference_id, not_before),
    )
    cursor.execute(
        "SELECT kind, reference_id, not_before FROM outbox WHERE idempotency_key = %s FOR UPDATE",
        (idempotency_key,),
    )
    existing_kind, existing_reference, existing_due = cursor.fetchone()
    if (existing_kind, existing_reference, existing_due) != (kind, reference_id, not_before):
        raise OutboxConflict("idempotency key already belongs to a different effect")


def claim_due(cursor: Any, *, now: datetime, limit: int = 10,
              lease_seconds: int = 60, kinds: tuple[str, ...] | None = None) -> list[dict[str, Any]]:
    """Atomically claim due or expired-lease rows; worker owns returned token.

    `kinds` restricts the claim to those row kinds. A worker that only handles
    one kind must pass it: claiming and discarding other kinds leases them away
    from their own worker and lets them crowd out the rows it does handle.
    """
    if not isinstance(now, datetime) or now.utcoffset() is None:
        raise ValueError("now must have a timezone offset")
    if limit < 1 or limit > 100 or lease_seconds < 1:
        raise ValueError("invalid outbox claim bounds")
    lease_token = uuid.uuid4()
    cursor.execute(
        """WITH due AS (
               SELECT idempotency_key FROM outbox
               WHERE not_before <= %s AND (
                   state = 'pending' OR (state = 'inflight' AND lease_until <= %s)
               ) AND (%s::text[] IS NULL OR kind = ANY(%s::text[]))
               ORDER BY not_before, idempotency_key
               FOR UPDATE SKIP LOCKED LIMIT %s
           )
           UPDATE outbox AS o SET state = 'inflight', lease_token = %s,
               lease_until = %s, attempts = o.attempts + 1
           FROM due WHERE o.idempotency_key = due.idempotency_key
           RETURNING o.idempotency_key, o.kind, o.reference_id, o.attempts""",
        (now, now, list(kinds) if kinds else None, list(kinds) if kinds else None,
         limit, str(lease_token), now + timedelta(seconds=lease_seconds)),
    )
    return [
        {"idempotency_key": key, "kind": kind, "reference_id": reference,
         "attempts": attempts, "lease_token": str(lease_token)}
        for key, kind, reference, attempts in cursor.fetchall()
    ]


def mark_done(cursor: Any, *, idempotency_key: str, lease_token: str,
              now: datetime) -> bool:
    """Only the current lease owner may acknowledge a delivered effect."""
    if not isinstance(now, datetime) or now.utcoffset() is None:
        raise ValueError("now must have a timezone offset")
    cursor.execute(
        """UPDATE outbox SET state = 'done', delivered_at = %s,
               lease_token = NULL, lease_until = NULL
           WHERE idempotency_key = %s AND state = 'inflight'
             AND lease_token = %s AND lease_until > %s""",
        (now, idempotency_key, lease_token, now),
    )
    return cursor.rowcount == 1
