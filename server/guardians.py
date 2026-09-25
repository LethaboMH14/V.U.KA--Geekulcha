"""PROPOSED guardian lifecycle (§9, G1, G5, G6): invite, accept, delayed removal, token.

Transport follows the other PIN-gated actions: the fresh authorisation is a
`pin_authorised` event (action add_guardian / remove_guardian) through
POST /v1/events; the invite and removal routes are bodyless and consume it.
Accept and token update take bodies, because a guardian has no PIN.

Decisions not stated by the spec, each PROPOSED:
- invite_code = "<8-hex invite id>-<6 digits>". The QR carries it whole; the
  id is what lets a 6-digit code be looked up without a global search.
- The code is kept only as an Argon2id hash; 10-minute expiry, 5 attempts per
  invite, 20 attempts per client IP per 10 minutes (G1, T14).
- "Existing guardians notified, naming the added guardian" happens at accept,
  when the guardian exists; a duress invite yields a decoy whose accept looks
  identical but who never receives alerts, and real guardians are told "a
  guardian was added under duress".
- Removal: scheduled 24 h out, silent to the removed guardian, remaining
  guardians notified at scheduling; it fires only while no incident is open
  ("deferred until the incident closes"). The last non-decoy guardian cannot be
  removed until a replacement has been accepted (a decoy is not a replacement).
"""
import hashlib
import os
import secrets
import uuid
from datetime import timedelta

from cryptography.exceptions import InvalidKey
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id

INVITE_TTL = timedelta(minutes=10)
INVITE_ATTEMPTS = 5
IP_ATTEMPTS = 20
IP_WINDOW = timedelta(minutes=10)
REMOVAL_DELAY = timedelta(hours=24)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS guardians (
    guardian_id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('invited','active','removal_scheduled','removed','expired')),
    decoy BOOLEAN NOT NULL DEFAULT FALSE,
    invite_phc TEXT,
    invite_expires_at TIMESTAMPTZ,
    invite_attempts INTEGER NOT NULL DEFAULT 0,
    signer_key_id TEXT,
    actor_id TEXT,
    fcm_token TEXT,
    invited_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    removal_due_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS invite_attempts_by_ip (
    id BIGSERIAL PRIMARY KEY, client_ip TEXT NOT NULL, attempted_at TIMESTAMPTZ NOT NULL
);
"""


class GuardianRefused(Exception):
    def __init__(self, code, status=400):
        self.code, self.status = code, status
        super().__init__(code)


def _argon2():
    return Argon2id(os.urandom(16), 32, 3, 4, 65536)


def create_invite(cur, subject_id, *, decoy, now):
    guardian_id = secrets.token_hex(4)
    digits = f"{secrets.randbelow(10 ** 6):06d}"
    code = f"{guardian_id}-{digits}"
    cur.execute(
        """INSERT INTO guardians (guardian_id, subject_id, status, decoy, invite_phc, invite_expires_at, invited_at)
           VALUES (%s, %s, 'invited', %s, %s, %s, %s)""",
        (guardian_id, subject_id, decoy, _argon2().derive_phc_encoded(code.encode()), now + INVITE_TTL, now),
    )
    return guardian_id, code


def check_invite(cur, code, client_ip, now):
    """Returns (guardian_id, subject_id, decoy). Every failure is the same 401 shape."""
    cur.execute("SELECT count(*) FROM invite_attempts_by_ip WHERE client_ip=%s AND attempted_at > %s",
                (client_ip, now - IP_WINDOW))
    if cur.fetchone()[0] >= IP_ATTEMPTS:
        raise GuardianRefused("invalid_signature", 401)
    cur.execute("INSERT INTO invite_attempts_by_ip (client_ip, attempted_at) VALUES (%s, %s)", (client_ip, now))
    guardian_id = code.split("-", 1)[0] if "-" in code else ""
    cur.execute("""SELECT subject_id, decoy, invite_phc, invite_expires_at, invite_attempts, status
                   FROM guardians WHERE guardian_id=%s FOR UPDATE""", (guardian_id,))
    row = cur.fetchone()
    if row is None:
        raise GuardianRefused("invalid_signature", 401)
    subject_id, decoy, phc, expires_at, attempts, status = row
    if status != "invited" or expires_at <= now or attempts >= INVITE_ATTEMPTS:
        raise GuardianRefused("invalid_signature", 401)
    cur.execute("UPDATE guardians SET invite_attempts = invite_attempts + 1 WHERE guardian_id=%s", (guardian_id,))
    try:
        Argon2id.verify_phc_encoded(code.encode(), phc)
    except InvalidKey:
        raise GuardianRefused("invalid_signature", 401) from None
    return guardian_id, subject_id, decoy


def activate(cur, guardian_id, *, signer_key_id, actor_id, public_key, fcm_token, now):
    cur.execute("SELECT subject_id FROM guardians WHERE guardian_id=%s", (guardian_id,))
    subject_id = cur.fetchone()[0]
    cur.execute("SELECT 1 FROM signer_keys WHERE signer_key_id=%s", (signer_key_id,))
    if cur.fetchone() is not None:
        raise GuardianRefused("invalid_signature", 401)
    cur.execute("""INSERT INTO signer_keys (subject_id, actor_id, signer_key_id, signer_role, public_key)
                   VALUES (%s, %s, %s, 'guardian', %s)""", (subject_id, actor_id, signer_key_id, public_key))
    cur.execute("""UPDATE guardians SET status='active', signer_key_id=%s, actor_id=%s, fcm_token=%s,
                   accepted_at=%s, invite_phc=NULL WHERE guardian_id=%s""",
                (signer_key_id, actor_id, fcm_token, now, guardian_id))
    return subject_id


def alerting_guardians(cur, subject_id, *, exclude=None):
    """Real guardians who receive alerts: accepted, not removed, never a decoy."""
    cur.execute("""SELECT guardian_id FROM guardians WHERE subject_id=%s AND NOT decoy
                   AND status IN ('active','removal_scheduled') AND guardian_id <> COALESCE(%s, '')
                   ORDER BY guardian_id""", (subject_id, exclude))
    return [r[0] for r in cur.fetchall()]


def schedule_removal(cur, subject_id, guardian_id, now):
    cur.execute("SELECT status, decoy FROM guardians WHERE guardian_id=%s AND subject_id=%s FOR UPDATE",
                (guardian_id, subject_id))
    row = cur.fetchone()
    if row is None or row[0] not in ("active",):
        raise GuardianRefused("not_found", 404)
    if not row[1]:
        cur.execute("""SELECT count(*) FROM guardians WHERE subject_id=%s AND NOT decoy AND status='active'
                       AND guardian_id <> %s""", (subject_id, guardian_id))
        if cur.fetchone()[0] == 0:
            raise GuardianRefused("last_guardian", 409)
    cur.execute("UPDATE guardians SET status='removal_scheduled', removal_due_at=%s WHERE guardian_id=%s",
                (now + REMOVAL_DELAY, guardian_id))


def due_removals(cur, subject_id, now):
    """Deferred while any incident is open (§9 table)."""
    cur.execute("SELECT 1 FROM incidents WHERE subject_id=%s AND closed_at IS NULL", (subject_id,))
    if cur.fetchone() is not None:
        return []
    cur.execute("""SELECT guardian_id FROM guardians WHERE subject_id=%s AND status='removal_scheduled'
                   AND removal_due_at <= %s ORDER BY guardian_id FOR UPDATE""", (subject_id, now))
    return [r[0] for r in cur.fetchall()]


def complete_removal(cur, guardian_id, now):
    cur.execute("UPDATE guardians SET status='removed', removed_at=%s WHERE guardian_id=%s RETURNING signer_key_id",
                (now, guardian_id))
    key_id = cur.fetchone()[0]
    if key_id:
        cur.execute("UPDATE signer_keys SET revoked_at=%s, revoked_reason='guardian_removed' WHERE signer_key_id=%s AND revoked_at IS NULL",
                    (now, key_id))


def guardian_key_id(spki: bytes) -> str:
    return "gdn_" + hashlib.sha256(spki).digest()[:8].hex()


def guardian_actor_id(guardian_id: str) -> str:
    return "guardian_" + guardian_id


def new_uuid() -> str:
    return str(uuid.uuid4())
