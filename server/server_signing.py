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


def _pinned_public_key():
    manifest = json.loads((Path(__file__).resolve().parents[1] / "contracts/keys/manifest.json").read_text(encoding="utf8"))
    return base64.b64decode(manifest["server_ed25519_public_key"], validate=True)


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
