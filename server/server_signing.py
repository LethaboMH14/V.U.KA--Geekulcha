"""Server entries use only the Ed25519 public authority pinned in the manifest."""
import base64
import hashlib
import json
import os
import uuid
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

from anchor.canonical import canonical


def manifest_path() -> Path:
    """The pinned key manifest. VUKA_SERVER_MANIFEST_PATH points a LOCAL development
    server at its own manifest (with a throwaway dev key); unset, it is the committed
    contracts/keys/manifest.json. Pinning is unchanged: the runtime key must match
    whichever manifest is in use."""
    override = os.environ.get("VUKA_SERVER_MANIFEST_PATH")
    return Path(override) if override else Path(__file__).resolve().parents[1] / "contracts/keys/manifest.json"


def _pinned_public_key():
    """Raw 32-byte Ed25519 key. The manifest stores base64 SPKI DER (as shared/keys.js
    and shared/verify.js require); comparing SPKI to a raw key never matched, so every
    server-signed entry failed outside tests that patched this function."""
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    from cryptography.hazmat.primitives.serialization import load_der_public_key
    manifest = json.loads(manifest_path().read_text(encoding="utf8"))
    key = load_der_public_key(base64.b64decode(manifest["server_ed25519_public_key"], validate=True))
    if not isinstance(key, Ed25519PublicKey):
        raise ValueError("manifest server key is not Ed25519")
    return key.public_bytes(Encoding.Raw, PublicFormat.Raw)


def sign_server_bytes(message):
    """Sign canonical server messages with the manifest-matching runtime key."""
    try:
        private = Ed25519PrivateKey.from_private_bytes(base64.b64decode(os.environ["VUKA_SERVER_ED25519_KEY_B64"], validate=True))
        public = private.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
        if public != _pinned_public_key():
            raise ValueError("key mismatch")
    except (ValueError, KeyError, TypeError) as exc:
        from server.db import DatabaseUnavailable
        raise DatabaseUnavailable("pinned server signer is unavailable") from None
    return base64.b64encode(private.sign(message)).decode("ascii")


def sign_key_revoked_entry(subject_id, revoked_key_id, now, counter):
    """key_revoked (§3) is its own action, revoked_key_id sits in plain details, §5/9."""
    salt = os.urandom(16)
    payload = {"kind": "key_revoked", "pv": 1}
    commitment = hashlib.sha256(salt + canonical(payload)).hexdigest()
    source_ts = now.isoformat().replace("+00:00", "Z")
    event_id = str(uuid.uuid4())
    statement = {"domain": "vuka.event.v2", "subject_id": subject_id,
                 "actor_id": "anchor_server", "target_type": "subject",
                 "target_id": subject_id, "action": "key_revoked", "source_ts": source_ts,
                 "signer_key_id": "server_ed25519", "counter": counter,
                 "event_id": event_id, "commitment": commitment}
    return {"action": "key_revoked", "actor_id": "anchor_server",
            "target_type": "subject", "target_id": subject_id, "ts": source_ts,
            "details": {"v": 2, "signer": "server", "signer_key_id": "server_ed25519",
                        "counter": counter, "event_id": event_id, "commitment": commitment,
                        "sig": sign_server_bytes(canonical(statement)), "revoked_key_id": revoked_key_id},
            "payload": payload, "salt": base64.b64encode(salt).decode("ascii")}


def sign_server_entry(subject_id, target_type, target_id, payload, now, counter):
    """Runtime key handling only; keys and SDK exceptions are never logged."""
    salt = os.urandom(16)
    commitment = hashlib.sha256(salt + canonical(payload)).hexdigest()
    source_ts = now.isoformat().replace("+00:00", "Z")
    event_id = str(uuid.uuid4())
    statement = {"domain": "vuka.event.v2", "subject_id": subject_id,
                 "actor_id": "anchor_server", "target_type": target_type,
                 "target_id": target_id, "action": "server_event", "source_ts": source_ts,
                 "signer_key_id": "server_ed25519", "counter": counter,
                 "event_id": event_id, "commitment": commitment}
    return {"action": "server_event", "actor_id": statement["actor_id"],
            "target_type": target_type, "target_id": target_id, "ts": source_ts,
            "details": {"v": 2, "signer": "server", "signer_key_id": statement["signer_key_id"],
                        "counter": counter, "event_id": event_id, "commitment": commitment,
                        "sig": sign_server_bytes(canonical(statement))},
            "payload": payload, "salt": base64.b64encode(salt).decode("ascii")}
