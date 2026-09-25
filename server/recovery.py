"""PROPOSED §9 device recovery: code verification, key swap, 24h freeze.

Provisioning (storing a subject's recovery lookup_handle + Argon2id hash at
onboarding, "shown once") is NOT built here — it needs a genesis-registration
contract decision (a new field, or a follow-on event) that is Lethabo's call.
`provision_recovery_code` is the internal seam a provisioning flow will call,
mirroring how `bind_journey`/`enroll_signer_key` existed before their routes.
"""
from datetime import timedelta

from cryptography.exceptions import InvalidKey
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id

RATE_LIMIT_ATTEMPTS = 5
RATE_LIMIT_WINDOW = timedelta(hours=1)
FREEZE_DURATION = timedelta(hours=24)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS recovery_codes (
    subject_id TEXT PRIMARY KEY,
    lookup_handle CHAR(64) NOT NULL UNIQUE,
    phc_encoded TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS recovery_attempts (
    id BIGSERIAL PRIMARY KEY,
    lookup_handle CHAR(64) NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS recovery_attempts_handle_time ON recovery_attempts(lookup_handle, attempted_at);
CREATE TABLE IF NOT EXISTS device_freezes (
    subject_id TEXT PRIMARY KEY,
    frozen_until TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS guardian_notifications (
    id BIGSERIAL PRIMARY KEY,
    subject_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    detail TEXT,
    created_at TIMESTAMPTZ NOT NULL
);
"""


class RecoveryRefused(Exception):
    """Deliberately generic: wrong code, unknown handle and rate limit all raise this."""


def _argon2(length=32, *, iterations=3, lanes=4, memory_cost=65536):
    # Fixed cost parameters; embedded in the stored PHC string by derive_phc_encoded,
    # so verify_phc_encoded needs none of these at verify time.
    import os
    return Argon2id(os.urandom(16), length, iterations, lanes, memory_cost)


def hash_recovery_code(code: str) -> str:
    return _argon2().derive_phc_encoded(code.encode("utf-8"))


def lookup_handle_for(code: str) -> str:
    import hashlib
    words = code.strip().split()
    if len(words) < 2:
        raise ValueError("recovery code must have at least two words")
    return hashlib.sha256(f"{words[0]} {words[1]}".encode("utf-8")).hexdigest()


def provision_recovery_code(cur, subject_id: str, code: str, now) -> None:
    """Internal seam; no route calls this yet (see module docstring)."""
    handle = lookup_handle_for(code)
    phc = hash_recovery_code(code)
    cur.execute(
        """INSERT INTO recovery_codes (subject_id, lookup_handle, phc_encoded, created_at)
           VALUES (%s, %s, %s, %s)
           ON CONFLICT (subject_id) DO UPDATE SET lookup_handle=EXCLUDED.lookup_handle,
               phc_encoded=EXCLUDED.phc_encoded, created_at=EXCLUDED.created_at""",
        (subject_id, handle, phc, now),
    )


def _rate_limited(cur, lookup_handle: str, now) -> bool:
    cur.execute(
        "SELECT count(*) FROM recovery_attempts WHERE lookup_handle=%s AND attempted_at > %s",
        (lookup_handle, now - RATE_LIMIT_WINDOW),
    )
    return cur.fetchone()[0] >= RATE_LIMIT_ATTEMPTS


def _record_attempt(cur, lookup_handle: str, now) -> None:
    cur.execute(
        "INSERT INTO recovery_attempts (lookup_handle, attempted_at) VALUES (%s, %s)",
        (lookup_handle, now),
    )


def verify_recovery_code(cur, code: str, now) -> str:
    """Returns subject_id on success. Every failure path raises the same
    RecoveryRefused, with the same shape, so a handle's existence, a wrong
    code and a rate limit are indistinguishable to the caller (§3/§9 ethos:
    no oracle for which recovery handles exist)."""
    try:
        handle = lookup_handle_for(code)
    except ValueError:
        raise RecoveryRefused("malformed code") from None
    if _rate_limited(cur, handle, now):
        raise RecoveryRefused("rate limited")
    _record_attempt(cur, handle, now)
    cur.execute("SELECT subject_id, phc_encoded FROM recovery_codes WHERE lookup_handle=%s", (handle,))
    row = cur.fetchone()
    if row is None:
        raise RecoveryRefused("unknown handle")
    subject_id, phc = row
    try:
        Argon2id.verify_phc_encoded(code.encode("utf-8"), phc)
    except InvalidKey:
        raise RecoveryRefused("wrong code") from None
    return subject_id


def has_open_incident(cur, subject_id: str) -> bool:
    cur.execute("SELECT 1 FROM incidents WHERE subject_id=%s AND closed_at IS NULL", (subject_id,))
    return cur.fetchone() is not None


def set_freeze(cur, subject_id: str, now) -> None:
    """24h freeze on guardian changes, deletion and export (§9)."""
    cur.execute(
        """INSERT INTO device_freezes (subject_id, frozen_until) VALUES (%s, %s)
           ON CONFLICT (subject_id) DO UPDATE SET frozen_until=EXCLUDED.frozen_until""",
        (subject_id, now + FREEZE_DURATION),
    )


def is_frozen(cur, subject_id: str, now) -> bool:
    cur.execute("SELECT frozen_until FROM device_freezes WHERE subject_id=%s", (subject_id,))
    row = cur.fetchone()
    return row is not None and row[0] > now


def notify_guardians(cur, subject_id: str, kind: str, now, detail: str | None = None) -> None:
    """Records intent only; no delivery worker exists yet (matches the guardian_alert gap)."""
    cur.execute(
        "INSERT INTO guardian_notifications (subject_id, kind, detail, created_at) VALUES (%s, %s, %s, %s)",
        (subject_id, kind, detail, now),
    )
