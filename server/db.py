"""PostgreSQL persistence for the first ANCHOR server slice.

This module stores chain entries only. It does not implement request
authentication, payload encryption, escalation, outbox delivery, or anchoring.
"""

from __future__ import annotations

import copy
import hashlib
import os
import time
from typing import Any, Callable

from anchor.canonical import canonical


GENESIS_HASH = "0" * 64
MAX_APPEND_ATTEMPTS = 5

CREATE_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS chain_entries (
    subject_id TEXT NOT NULL,
    chain_index BIGINT NOT NULL CHECK (chain_index >= 0),
    action TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('journey', 'subject')),
    target_id TEXT NOT NULL,
    details_json JSONB NOT NULL,
    ts TEXT NOT NULL,
    prev_hash CHAR(64) NOT NULL,
    event_hash CHAR(64) NOT NULL,
    PRIMARY KEY (subject_id, chain_index),
    UNIQUE (subject_id, chain_index)
)
"""

CREATE_EVENT_ID_INDEX_SQL = """
CREATE UNIQUE INDEX IF NOT EXISTS chain_entries_event_id_unique
ON chain_entries ((details_json ->> 'event_id'))
"""

LOCK_HEAD_SQL = """
SELECT chain_index, event_hash
FROM chain_entries
WHERE subject_id = %s
ORDER BY chain_index DESC
LIMIT 1
FOR UPDATE
"""


class SubjectNotFound(LookupError):
    """The subject has no registered genesis entry in this database."""


class IdempotencyConflict(Exception):
    """An event_id was reused for different submitted content."""


class DatabaseUnavailable(RuntimeError):
    """The configured database driver or database is unavailable."""


def _request_fingerprint(entry: dict[str, Any]) -> str:
    """Hash the submitted event content, excluding server-owned chain fields."""
    request = copy.deepcopy(entry)
    request.pop("event_hash", None)
    request.pop("prev_hash", None)
    details = request["details"]
    details.pop("received_at", None)
    details.pop("chain_index", None)
    return hashlib.sha256(canonical(request)).hexdigest()


def _with_server_fields(
    entry: dict[str, Any], *, chain_index: int, prev_hash: str, received_at: str
) -> dict[str, Any]:
    stored = copy.deepcopy(entry)
    stored["prev_hash"] = prev_hash
    stored["details"]["received_at"] = received_at
    stored["details"]["chain_index"] = chain_index
    stored.pop("event_hash", None)
    stored["event_hash"] = hashlib.sha256(canonical(stored)).hexdigest()
    return stored


def _row_entry(row: dict[str, Any]) -> dict[str, Any]:
    details = row["details_json"]
    if isinstance(details, str):
        import json

        details = json.loads(details)
    return {
        "action": row["action"],
        "actor_id": row["actor_id"],
        "target_type": row["target_type"],
        "target_id": row["target_id"],
        "details": details,
        "ts": row["ts"],
        "prev_hash": row["prev_hash"].strip(),
        "event_hash": row["event_hash"].strip(),
    }


class PostgresDatabase:
    """Small synchronous PostgreSQL adapter using psycopg2."""

    def __init__(
        self,
        database_url: str | None = None,
        *,
        connect: Callable[..., Any] | None = None,
    ) -> None:
        self.database_url = database_url or os.environ.get("DATABASE_URL")
        self._connect = connect

    def _connection(self):
        if not self.database_url:
            raise DatabaseUnavailable("DATABASE_URL is not configured")
        connect = self._connect
        if connect is None:
            try:
                import psycopg2
            except ImportError as exc:
                raise DatabaseUnavailable("psycopg2 is not installed") from exc
            connect = psycopg2.connect
        try:
            return connect(self.database_url)
        except Exception as exc:
            raise DatabaseUnavailable("PostgreSQL connection failed") from exc

    def initialize(self) -> None:
        connection = self._connection()
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(CREATE_SCHEMA_SQL)
                    cursor.execute(CREATE_EVENT_ID_INDEX_SQL)
        finally:
            connection.close()

    def append(
        self, subject_id: str, entry: dict[str, Any], received_at: str
    ) -> tuple[dict[str, Any], bool]:
        from psycopg2 import IntegrityError
        from psycopg2.extras import Json, RealDictCursor

        fingerprint = _request_fingerprint(entry)
        event_id = entry["details"]["event_id"]

        for attempt in range(MAX_APPEND_ATTEMPTS):
            connection = self._connection()
            try:
                with connection:
                    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                        # Idempotency is checked before locking/assigning a chain position.
                        cursor.execute(
                            """SELECT subject_id, action, actor_id, target_type, target_id,
                                      details_json, ts, prev_hash, event_hash
                               FROM chain_entries
                               WHERE details_json ->> 'event_id' = %s""",
                            (event_id,),
                        )
                        existing = cursor.fetchone()
                        if existing is not None:
                            if _request_fingerprint(_row_entry(existing)) != fingerprint:
                                raise IdempotencyConflict(event_id)
                            return _row_entry(existing), False

                        cursor.execute(LOCK_HEAD_SQL, (subject_id,))
                        head = cursor.fetchone()
                        if head is None:
                            raise SubjectNotFound(subject_id)

                        next_index = int(head["chain_index"]) + 1
                        stored = _with_server_fields(
                            entry,
                            chain_index=next_index,
                            prev_hash=head["event_hash"].strip(),
                            received_at=received_at,
                        )
                        cursor.execute(
                            """INSERT INTO chain_entries (
                                   subject_id, chain_index, action, actor_id,
                                   target_type, target_id, details_json, ts,
                                   prev_hash, event_hash
                               ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                            (
                                subject_id,
                                next_index,
                                stored["action"],
                                stored["actor_id"],
                                stored["target_type"],
                                stored["target_id"],
                                Json(stored["details"]),
                                stored["ts"],
                                stored["prev_hash"],
                                stored["event_hash"],
                            ),
                        )
                return stored, True
            except IntegrityError as exc:
                if getattr(exc, "pgcode", None) != "23505":
                    raise DatabaseUnavailable(
                        "Database rejected the chain entry"
                    ) from exc
                # A competing append may have won the same next index. Retry so
                # the next SELECT ... FOR UPDATE observes the committed head.
                if attempt + 1 == MAX_APPEND_ATTEMPTS:
                    raise DatabaseUnavailable(
                        "Concurrent append did not settle after bounded retries"
                    ) from exc
                time.sleep(0.01 * (attempt + 1))
            finally:
                connection.close()

        raise DatabaseUnavailable("Append retry loop exhausted")

    def export(self, subject_id: str) -> list[dict[str, Any]]:
        from psycopg2.extras import RealDictCursor

        connection = self._connection()
        try:
            with connection:
                with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(
                        """SELECT action, actor_id, target_type, target_id,
                                  details_json, ts, prev_hash, event_hash
                           FROM chain_entries
                           WHERE subject_id = %s
                           ORDER BY chain_index ASC""",
                        (subject_id,),
                    )
                    rows = cursor.fetchall()
            if not rows:
                raise SubjectNotFound(subject_id)
            return [_row_entry(row) for row in rows]
        finally:
            connection.close()
