"""PROPOSED §4b.1 PIN authority, atomically stored with its signed event."""
import base64
from datetime import timedelta

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import load_der_public_key

from anchor.canonical import canonical
from anchor.payloads import validate_payload
from anchor.pin_authority import canonical_pin_authorised

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS pin_authorisations (
    subject_id TEXT NOT NULL, action TEXT NOT NULL, target_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('normal','duress')),
    nonce TEXT NOT NULL, event_id TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL, consumed_at TIMESTAMPTZ,
    PRIMARY KEY(subject_id,nonce)
);
"""


class EventRefused(Exception):
    def __init__(self, code, status=400):
        self.code, self.status = code, status
        super().__init__(code)


def store_authorisation(cursor, subject_id, entry, now):
    payload = entry["payload"]
    if payload.get("action") not in {"end_journey", "export"}:
        raise EventRefused("action_not_supported")
    validate_payload("pin_authorised", payload)
    key_id = entry["details"]["signer_key_id"]
    if payload["signer_key_id"] != key_id or entry["details"]["signer"] != "device":
        raise EventRefused("invalid_signature", 401)
    cursor.execute("SELECT public_key,subject_id,revoked_at,signer_role FROM signer_keys WHERE signer_key_id=%s", (key_id,))
    row = cursor.fetchone()
    if not row or row[1] != subject_id or row[2] is not None or row[3] != "device":
        raise EventRefused("invalid_signature", 401)
    statement = {k: payload[k] for k in ("action", "target_id", "mode", "nonce", "sig", "signer_key_id")}
    try:
        key = load_der_public_key(base64.b64decode(row[0], validate=True))
        if not isinstance(key, ec.EllipticCurvePublicKey) or key.curve.name != "secp256r1":
            raise ValueError("not P-256")
        key.verify(base64.b64decode(payload["sig"], validate=True), canonical_pin_authorised(statement), ec.ECDSA(hashes.SHA256()))
    except (InvalidSignature, ValueError, TypeError) as exc:
        raise EventRefused("invalid_signature", 401) from exc
    if payload["action"] == "export":
        own_target = payload["target_id"] == subject_id
    else:
        cursor.execute("SELECT subject_id FROM journey_subjects WHERE journey_id=%s", (payload["target_id"],))
        target = cursor.fetchone()
        own_target = target is not None and target[0] == subject_id
    if not own_target:
        raise EventRefused("pin_authorisation_required", 403)
    cursor.execute("SELECT 1 FROM pin_authorisations WHERE subject_id=%s AND nonce=%s", (subject_id, payload["nonce"]))
    if cursor.fetchone() is not None:
        raise EventRefused("invalid_signature", 401)
    cursor.execute("""INSERT INTO pin_authorisations
        (subject_id,action,target_id,mode,nonce,event_id,expires_at)
        VALUES(%s,%s,%s,%s,%s,%s,%s)""", (subject_id, payload["action"], payload["target_id"], payload["mode"], payload["nonce"], entry["details"]["event_id"], now + timedelta(seconds=120)))


def require_authorisation(cursor, subject_id, action, target_id, now, *, consume=False):
    """PROPOSED end_journey consumption under the caller's subject_heads lock."""
    cursor.execute("""SELECT nonce,mode FROM pin_authorisations
        WHERE subject_id=%s AND action=%s AND target_id=%s
          AND expires_at > %s AND consumed_at IS NULL
        ORDER BY expires_at DESC,event_id DESC LIMIT 1 FOR UPDATE""", (subject_id, action, target_id, now))
    row = cursor.fetchone()
    if row is None:
        raise EventRefused("pin_authorisation_required", 403)
    if consume:
        cursor.execute("UPDATE pin_authorisations SET consumed_at=%s WHERE subject_id=%s AND nonce=%s", (now, subject_id, row[0]))
    return row[1]
