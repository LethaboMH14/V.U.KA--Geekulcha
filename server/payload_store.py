"""Private v2 event payload encryption; public chain entries hold commitments only."""

from __future__ import annotations

import base64
import binascii
import json
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from anchor.canonical import canonical


def decode_payload_key(encoded: str | None) -> bytes:
    """Require an App Service supplied AES-256 key; never generate one per boot."""
    if not encoded:
        raise ValueError("VUKA_PAYLOAD_KEY_B64 is required")
    try:
        key = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise ValueError("VUKA_PAYLOAD_KEY_B64 must be base64") from exc
    if len(key) != 32:
        raise ValueError("VUKA_PAYLOAD_KEY_B64 must encode 32 bytes")
    return key


def _associated_data(subject_id: str, event_id: str) -> bytes:
    return canonical({
        "domain": "vuka.private_payload.v1",
        "subject_id": subject_id,
        "event_id": event_id,
    })


def encrypt_payload(
    key: bytes, *, subject_id: str, event_id: str, payload: dict, salt: str
) -> tuple[bytes, bytes]:
    if len(key) != 32:
        raise ValueError("AES-256 key must be 32 bytes")
    nonce = os.urandom(12)
    plaintext = canonical({"payload": payload, "salt": salt})
    ciphertext = AESGCM(key).encrypt(nonce, plaintext, _associated_data(subject_id, event_id))
    return nonce, ciphertext


def decrypt_payload(
    key: bytes, *, subject_id: str, event_id: str, nonce: bytes, ciphertext: bytes
) -> dict:
    plaintext = AESGCM(key).decrypt(
        nonce, ciphertext, _associated_data(subject_id, event_id)
    )
    return json.loads(plaintext)
