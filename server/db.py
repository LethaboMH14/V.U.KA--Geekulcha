"""PostgreSQL persistence for ANCHOR server slices 1 and 2.

This module stores chain entries, signer keys, journey ownership and replay
state. Payload encryption, escalation, outbox delivery and anchoring remain
outside these slices.
"""

from __future__ import annotations

import copy
import hashlib
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Callable

from anchor.canonical import canonical
from server.outbox import OUTBOX_SCHEMA_SQL
from server.payload_store import decode_payload_key, encrypt_payload


GENESIS_HASH = "0" * 64
MAX_APPEND_ATTEMPTS = 5
NONCE_TTL = timedelta(hours=24)
MAX_CLOCK_SKEW_SECONDS = 120

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
);
CREATE TABLE IF NOT EXISTS subject_heads (
    subject_id TEXT PRIMARY KEY,
    chain_index BIGINT NOT NULL CHECK (chain_index >= 0),
    event_hash CHAR(64) NOT NULL
);
INSERT INTO subject_heads (subject_id, chain_index, event_hash)
SELECT DISTINCT ON (subject_id) subject_id, chain_index, event_hash
FROM chain_entries ORDER BY subject_id, chain_index DESC
ON CONFLICT (subject_id) DO NOTHING;
CREATE TABLE IF NOT EXISTS private_payloads (
    subject_id TEXT NOT NULL,
    event_id TEXT PRIMARY KEY,
    nonce BYTEA NOT NULL,
    ciphertext BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS signer_keys (
    signer_key_id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    signer_role TEXT NOT NULL CHECK (signer_role IN ('device', 'guardian')),
    public_key TEXT NOT NULL,
    revoked_at TIMESTAMPTZ NULL,
    revoked_reason TEXT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS signer_keys_one_active_device_per_subject
    ON signer_keys (subject_id)
    WHERE signer_role = 'device' AND revoked_at IS NULL;
CREATE TABLE IF NOT EXISTS journey_subjects (
    journey_id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS request_nonces (
    signer_key_id TEXT NOT NULL REFERENCES signer_keys(signer_key_id),
    nonce TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (signer_key_id, nonce)
);
CREATE INDEX IF NOT EXISTS request_nonces_expiry_idx ON request_nonces (expires_at);
CREATE TABLE IF NOT EXISTS signer_counters (
    signer_key_id TEXT NOT NULL REFERENCES signer_keys(signer_key_id),
    counter BIGINT NOT NULL CHECK (counter >= 0),
    event_id TEXT NOT NULL,
    PRIMARY KEY (signer_key_id, counter)
)
"""

CREATE_EVENT_ID_INDEX_SQL = """
CREATE UNIQUE INDEX IF NOT EXISTS chain_entries_event_id_unique
ON chain_entries ((details_json ->> 'event_id'))
"""

LOCK_HEAD_SQL = """
SELECT chain_index, event_hash
FROM subject_heads
WHERE subject_id = %s
FOR UPDATE
"""


class SubjectNotFound(LookupError):
    """The subject has no registered genesis entry in this database."""


class IdempotencyConflict(Exception):
    """An event_id was reused for different submitted content."""


class DatabaseUnavailable(RuntimeError):
    """The configured database driver or database is unavailable."""


class SignerKeyNotFound(LookupError):
    """No signer key is registered for the supplied key id."""


class SignerKeyRevoked(PermissionError):
    """A request used a key that has been revoked."""


class SignerSubjectMismatch(PermissionError):
    """A signing key does not belong to the requested subject."""


class JourneyBindingConflict(ValueError):
    """A journey id was already bound to a different subject."""


class RequestReplay(PermissionError):
    """A nonce or counter has already been used by this signer key."""


class RequestTimestampExpired(PermissionError):
    """The signed request timestamp is outside the §7 acceptance window."""


def _request_fingerprint(entry: dict[str, Any]) -> str:
    """Hash signed/committed entry fields shared by submission and stored row.

    Payload and salt do not belong to the public chain entry. The verified
    commitment binds them, so the stored row can answer an identical retry.
    Separate encrypted payload storage is still required before deployment.
    """
    request = copy.deepcopy(entry)
    request.pop("event_hash", None)
    request.pop("prev_hash", None)
    request.pop("payload", None)
    request.pop("salt", None)
    details = request["details"]
    details.pop("received_at", None)
    details.pop("chain_index", None)
    details.pop("clock_skew", None)
    return hashlib.sha256(canonical(request)).hexdigest()


def _parse_timestamp(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (AttributeError, ValueError) as exc:
        raise ValueError("timestamp must be RFC 3339") from exc
    if parsed.utcoffset() is None:
        raise ValueError("timestamp must include a timezone offset")
    return parsed.astimezone(timezone.utc)


def _clock_skewed(request_ts: str, now: datetime) -> bool:
    return abs((_parse_timestamp(request_ts) - now).total_seconds()) > MAX_CLOCK_SKEW_SECONDS


def _consume_nonce(cursor, signer_key_id: str, nonce: str, now: datetime) -> None:
    cursor.execute(
        "DELETE FROM request_nonces WHERE expires_at <= %s",
        (now,),
    )
    cursor.execute(
        "SELECT 1 FROM request_nonces WHERE signer_key_id = %s AND nonce = %s",
        (signer_key_id, nonce),
    )
    if cursor.fetchone() is not None:
        raise RequestReplay("request nonce was already used")
    cursor.execute(
        "INSERT INTO request_nonces (signer_key_id, nonce, expires_at) VALUES (%s, %s, %s)",
        (signer_key_id, nonce, now + NONCE_TTL),
    )


def _with_server_fields(
    entry: dict[str, Any], *, chain_index: int, prev_hash: str, received_at: str,
    clock_skew: bool = False,
) -> dict[str, Any]:
    stored = copy.deepcopy(entry)
    stored.pop("payload", None)
    stored.pop("salt", None)
    stored["prev_hash"] = prev_hash
    stored["details"]["received_at"] = received_at
    stored["details"]["chain_index"] = chain_index
    if clock_skew:
        stored["details"]["clock_skew"] = True
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
        payload_key_b64: str | None = None,
    ) -> None:
        self.database_url = database_url or os.environ.get("DATABASE_URL")
        self._connect = connect
        self._payload_key_b64 = payload_key_b64

    def _payload_key(self) -> bytes:
        try:
            return decode_payload_key(
                self._payload_key_b64 or os.environ.get("VUKA_PAYLOAD_KEY_B64")
            )
        except ValueError as exc:
            raise DatabaseUnavailable("Payload encryption key is unavailable") from exc

    def _store_private_payload(self, cursor, subject_id: str, entry: dict[str, Any], now: datetime) -> None:
        event_id = entry["details"]["event_id"]
        nonce, ciphertext = encrypt_payload(
            self._payload_key(), subject_id=subject_id, event_id=event_id,
            payload=entry["payload"], salt=entry["salt"],
        )
        cursor.execute(
            """INSERT INTO private_payloads (subject_id, event_id, nonce, ciphertext, created_at)
               VALUES (%s, %s, %s, %s, %s)""",
            (subject_id, event_id, nonce, ciphertext, now),
        )

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
        from server import escalation, incidents, guardian_notifier, pin_records, event_effects, bank_worker
        self._payload_key()
        connection = self._connection()
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(CREATE_SCHEMA_SQL)
                    cursor.execute(CREATE_EVENT_ID_INDEX_SQL)
                    cursor.execute(OUTBOX_SCHEMA_SQL)
                    for module in (escalation, incidents, guardian_notifier, pin_records, event_effects, bank_worker):
                        cursor.execute(module.SCHEMA_SQL)
        finally:
            connection.close()

    def healthcheck(self) -> None:
        """Fail readiness when PostgreSQL cannot answer a trivial query."""
        self._payload_key()
        connection = self._connection()
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    if cursor.fetchone() != (1,):
                        raise DatabaseUnavailable("PostgreSQL health query failed")
        except Exception as exc:
            if isinstance(exc, DatabaseUnavailable):
                raise
            raise DatabaseUnavailable("PostgreSQL health query failed") from exc
        finally:
            connection.close()

    def get_signer_key(self, signer_key_id: str) -> dict[str, Any] | None:
        from psycopg2.extras import RealDictCursor

        connection = self._connection()
        try:
            with connection:
                with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(
                        """SELECT signer_key_id, subject_id, actor_id, signer_role, public_key,
                                  revoked_at, revoked_reason
                           FROM signer_keys WHERE signer_key_id = %s""",
                        (signer_key_id,),
                    )
                    row = cursor.fetchone()
            return dict(row) if row is not None else None
        except Exception as exc:
            if isinstance(exc, DatabaseUnavailable):
                raise
            raise DatabaseUnavailable("Could not read signer key registry") from exc
        finally:
            connection.close()

    def enroll_signer_key(
        self, subject_id: str, signer_key_id: str, signer_role: str, public_key: str,
        actor_id: str,
    ) -> None:
        """Enroll a key only after its registration/guardian acceptance is trusted."""
        if signer_role not in {"device", "guardian"}:
            raise ValueError("signer_role must be device or guardian")
        if not all((subject_id, signer_key_id, public_key, actor_id)):
            raise ValueError("subject, actor, key id and public key are required")
        connection = self._connection()
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """INSERT INTO signer_keys
                           (subject_id, actor_id, signer_key_id, signer_role, public_key)
                           VALUES (%s, %s, %s, %s, %s)""",
                        (subject_id, actor_id, signer_key_id, signer_role, public_key),
                    )
        finally:
            connection.close()

    def register_subject(
        self,
        subject_id: str,
        entry: dict[str, Any],
        received_at: str,
        *,
        signer_key_id: str,
        public_key: str,
        nonce: str,
        request_ts: str,
    ) -> tuple[dict[str, Any], bool]:
        """Atomically create a genesis chain and its first device key."""
        if (
            entry.get("action", "").removeprefix("sim_") != "registration"
            or entry.get("target_type") != "subject"
            or entry.get("target_id") != subject_id
            or entry.get("details", {}).get("signer") != "device"
            or entry.get("details", {}).get("signer_key_id") != signer_key_id
            or entry.get("details", {}).get("signer_pubkey") != public_key
        ):
            raise ValueError("genesis registration must bind its subject and first device key")
        now = _parse_timestamp(received_at)
        if _clock_skewed(request_ts, now):
            raise RequestTimestampExpired(request_ts)
        from psycopg2 import IntegrityError
        from psycopg2.extras import Json

        connection = self._connection()
        try:
            try:
                with connection:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT 1 FROM chain_entries WHERE subject_id = %s LIMIT 1 FOR UPDATE",
                            (subject_id,),
                        )
                        if cursor.fetchone() is not None:
                            raise JourneyBindingConflict("subject already has a genesis entry")
                        cursor.execute(
                            "SELECT 1 FROM signer_keys WHERE signer_key_id = %s FOR UPDATE",
                            (signer_key_id,),
                        )
                        if cursor.fetchone() is not None:
                            raise SignerSubjectMismatch(signer_key_id)
                        cursor.execute(
                            "INSERT INTO signer_keys (subject_id, actor_id, signer_key_id, signer_role, public_key)"
                            " VALUES (%s, %s, %s, 'device', %s)",
                            (subject_id, entry["actor_id"], signer_key_id, public_key),
                        )
                        _consume_nonce(cursor, signer_key_id, nonce, now)
                        counter = entry["details"]["counter"]
                        cursor.execute(
                            "INSERT INTO signer_counters (signer_key_id, counter, event_id) VALUES (%s, %s, %s)",
                            (signer_key_id, counter, entry["details"]["event_id"]),
                        )
                        stored = _with_server_fields(
                            entry, chain_index=0, prev_hash=GENESIS_HASH, received_at=received_at
                        )
                        cursor.execute(
                            """INSERT INTO chain_entries (
                                   subject_id, chain_index, action, actor_id, target_type, target_id,
                                   details_json, ts, prev_hash, event_hash
                               ) VALUES (%s, 0, %s, %s, %s, %s, %s, %s, %s, %s)""",
                            (
                                subject_id, stored["action"], stored["actor_id"], stored["target_type"],
                                stored["target_id"], Json(stored["details"]), stored["ts"],
                                stored["prev_hash"], stored["event_hash"],
                            ),
                        )
                        cursor.execute(
                            """INSERT INTO subject_heads (subject_id, chain_index, event_hash)
                               VALUES (%s, 0, %s)""",
                            (subject_id, stored["event_hash"]),
                        )
                        self._store_private_payload(cursor, subject_id, entry, now)
                return stored, True
            except IntegrityError as exc:
                if getattr(exc, "pgcode", None) != "23505":
                    raise DatabaseUnavailable("Database rejected subject registration") from exc
                # Resolve a competing identical genesis by the normal idempotency
                # path; differing content or key ownership remains a rejection.
                return self.append(
                    subject_id, entry, received_at,
                    signer_key_id=signer_key_id, signer_role="device",
                    nonce=nonce, request_ts=request_ts,
                )
        finally:
            connection.close()

    def bind_journey(self, journey_id: str, subject_id: str) -> None:
        """Internal helper used by journey creation; this slice adds no route."""
        if not journey_id or not subject_id:
            raise ValueError("journey_id and subject_id are required")
        connection = self._connection()
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT 1 FROM chain_entries WHERE subject_id = %s LIMIT 1",
                        (subject_id,),
                    )
                    if cursor.fetchone() is None:
                        raise SubjectNotFound(subject_id)
                    cursor.execute(
                        """INSERT INTO journey_subjects (journey_id, subject_id)
                           VALUES (%s, %s) ON CONFLICT (journey_id) DO NOTHING""",
                        (journey_id, subject_id),
                    )
                    cursor.execute(
                        "SELECT subject_id FROM journey_subjects WHERE journey_id = %s",
                        (journey_id,),
                    )
                    row = cursor.fetchone()
                    bound_subject = row[0] if not isinstance(row, dict) else row["subject_id"]
                    if bound_subject != subject_id:
                        raise JourneyBindingConflict(journey_id)
        finally:
            connection.close()

    def get_journey_subject(self, journey_id: str) -> str | None:
        connection = self._connection()
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT subject_id FROM journey_subjects WHERE journey_id = %s",
                        (journey_id,),
                    )
                    row = cursor.fetchone()
            if row is None:
                return None
            return row[0] if not isinstance(row, dict) else row["subject_id"]
        except Exception as exc:
            if isinstance(exc, DatabaseUnavailable):
                raise
            raise DatabaseUnavailable("Could not read journey ownership") from exc
        finally:
            connection.close()

    def recover_device_key(
        self,
        subject_id: str,
        prior_key_id: str,
        new_key_id: str,
        new_public_key: str,
        received_at: str,
        revocation_entry: dict[str, Any],
    ) -> dict[str, Any]:
        """Atomically append key_revoked and replace a device key.

        The internal recovery caller supplies the already server-signed event;
        signature generation/key-manifest loading and the recovery route are
        deliberately outside slice 2.
        """
        if not all((subject_id, prior_key_id, new_key_id, new_public_key)):
            raise ValueError("recovery key fields are required")
        if prior_key_id == new_key_id:
            raise ValueError("recovery must use a new signer_key_id")
        details = revocation_entry.get("details", {})
        if (
            revocation_entry.get("action") != "key_revoked"
            or revocation_entry.get("target_type") != "subject"
            or revocation_entry.get("target_id") != subject_id
            or details.get("signer") != "server"
            or details.get("revoked_key_id") != prior_key_id
            or not details.get("event_id")
            or not details.get("sig")
        ):
            raise ValueError("server key_revoked entry must name the revoked key and subject")
        revoked_at = _parse_timestamp(received_at)
        from psycopg2.extras import Json, RealDictCursor

        connection = self._connection()
        try:
            with connection:
                with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(
                        """SELECT subject_id, actor_id, signer_role, revoked_at
                           FROM signer_keys WHERE signer_key_id = %s FOR UPDATE""",
                        (prior_key_id,),
                    )
                    row = cursor.fetchone()
                    if row is None:
                        raise SignerKeyNotFound(prior_key_id)
                    if isinstance(row, dict):
                        prior_subject, prior_actor, prior_role, prior_revoked = row["subject_id"], row["actor_id"], row["signer_role"], row["revoked_at"]
                    else:
                        prior_subject, prior_actor, prior_role, prior_revoked = row
                    cursor.execute(
                        """SELECT subject_id, action, actor_id, target_type, target_id,
                                  details_json, ts, prev_hash, event_hash
                           FROM chain_entries WHERE details_json ->> 'event_id' = %s""",
                        (details["event_id"],),
                    )
                    existing = cursor.fetchone()
                    if existing is not None:
                        existing_entry = _row_entry(existing)
                        if _request_fingerprint(existing_entry) != _request_fingerprint(revocation_entry):
                            raise IdempotencyConflict(details["event_id"])
                        return existing_entry
                    if prior_subject != subject_id or prior_role != "device" or prior_revoked is not None:
                        raise SignerSubjectMismatch(prior_key_id)
                    cursor.execute(LOCK_HEAD_SQL, (subject_id,))
                    head = cursor.fetchone()
                    if head is None:
                        raise SubjectNotFound(subject_id)
                    chain_index = int(head["chain_index"]) + 1
                    stored = _with_server_fields(
                        revocation_entry,
                        chain_index=chain_index,
                        prev_hash=head["event_hash"].strip(),
                        received_at=received_at,
                    )
                    cursor.execute(
                        """INSERT INTO chain_entries (
                               subject_id, chain_index, action, actor_id, target_type, target_id,
                               details_json, ts, prev_hash, event_hash
                           ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                        (
                            subject_id,
                            chain_index,
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
                    cursor.execute(
                        """UPDATE signer_keys SET revoked_at = %s, revoked_reason = 'recovery'
                           WHERE signer_key_id = %s AND revoked_at IS NULL""",
                        (revoked_at, prior_key_id),
                    )
                    cursor.execute(
                        """INSERT INTO signer_keys
                           (subject_id, actor_id, signer_key_id, signer_role, public_key)
                           VALUES (%s, %s, %s, 'device', %s)""",
                        (subject_id, prior_actor, new_key_id, new_public_key),
                    )
                    cursor.execute(
                        """UPDATE subject_heads SET chain_index = %s, event_hash = %s
                           WHERE subject_id = %s""",
                        (chain_index, stored["event_hash"], subject_id),
                    )
            return stored
        finally:
            connection.close()

    def consume_request_nonce(
        self,
        *,
        signer_key_id: str,
        subject_id: str,
        nonce: str,
        request_ts: str,
        now: datetime,
    ) -> None:
        """Consume a bodyless request nonce after signature verification."""
        connection = self._connection()
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """SELECT subject_id, revoked_at FROM signer_keys
                           WHERE signer_key_id = %s FOR UPDATE""",
                        (signer_key_id,),
                    )
                    row = cursor.fetchone()
                    if row is None:
                        raise SignerKeyNotFound(signer_key_id)
                    key_subject, revoked_at = row if not isinstance(row, dict) else (row["subject_id"], row["revoked_at"])
                    if revoked_at is not None:
                        raise SignerKeyRevoked(signer_key_id)
                    if key_subject != subject_id:
                        raise SignerSubjectMismatch(signer_key_id)
                    if _clock_skewed(request_ts, now):
                        raise RequestTimestampExpired(request_ts)
                    _consume_nonce(cursor, signer_key_id, nonce, now)
        finally:
            connection.close()

    def append(
        self,
        subject_id: str,
        entry: dict[str, Any],
        received_at: str,
        *,
        signer_key_id: str,
        signer_role: str,
        nonce: str,
        request_ts: str,
    ) -> tuple[dict[str, Any], bool]:
        from psycopg2 import IntegrityError
        from psycopg2.extras import Json, RealDictCursor

        fingerprint = _request_fingerprint(entry)
        event_id = entry["details"]["event_id"]
        now = _parse_timestamp(received_at)

        for attempt in range(MAX_APPEND_ATTEMPTS):
            connection = self._connection()
            try:
                with connection:
                    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                        # Recheck key status under lock, then honor §7 event-id
                        # idempotency before nonce, counter and clock-skew checks.
                        cursor.execute(
                            """SELECT subject_id, actor_id, signer_role, revoked_at
                               FROM signer_keys WHERE signer_key_id = %s FOR UPDATE""",
                            (signer_key_id,),
                        )
                        key = cursor.fetchone()
                        if key is None:
                            raise SignerKeyNotFound(signer_key_id)
                        if key["revoked_at"] is not None:
                            raise SignerKeyRevoked(signer_key_id)
                        if (key["subject_id"] != subject_id or key["signer_role"] != signer_role
                                or key["actor_id"] != entry["actor_id"]):
                            raise SignerSubjectMismatch(signer_key_id)

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

                        skewed = _clock_skewed(request_ts, now)
                        skew_exempt = entry["action"].removeprefix("sim_") in {
                            "checkin_opened", "checkin_result", "pin_authorised"
                        }
                        if skewed and not skew_exempt:
                            raise RequestTimestampExpired(request_ts)
                        _consume_nonce(cursor, signer_key_id, nonce, now)
                        cursor.execute(
                            """SELECT 1 FROM signer_counters
                               WHERE signer_key_id = %s AND counter = %s""",
                            (signer_key_id, entry["details"]["counter"]),
                        )
                        if cursor.fetchone() is not None:
                            raise RequestReplay("signer counter was already used")
                        cursor.execute(
                            """INSERT INTO signer_counters (signer_key_id, counter, event_id)
                               VALUES (%s, %s, %s)""",
                            (signer_key_id, entry["details"]["counter"], event_id),
                        )

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
                            clock_skew=skewed and skew_exempt,
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
                        cursor.execute(
                            """UPDATE subject_heads SET chain_index = %s, event_hash = %s
                               WHERE subject_id = %s""",
                            (next_index, stored["event_hash"], subject_id),
                        )
                        self._store_private_payload(cursor, subject_id, entry, now)
                        from server.event_effects import apply_event
                        with connection.cursor() as effects_cursor:
                            apply_event(effects_cursor, self, subject_id, entry, stored, now)
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
