"""Post-quantum root attestation v1 — a PROPOSED demonstration (docs/QUANTUM-TECH.md).

A hybrid signature over one anchored Hedera root: ML-DSA-65 (FIPS 204) AND
Ed25519, both over the spec §5 canonical bytes of a statement that binds the
exact 33-byte topic message (0x01 || root), its topic, epoch, sequence number
and consensus timestamp. An attestation is valid only if both signatures
verify under the given public keys AND the statement's message bytes equal the
mirror node's bytes for that sequence number.

Why hybrid: a future quantum computer running Shor's algorithm could forge
Ed25519; ML-DSA-65 is a lattice signature standardised for that threat. With
AND-composition a forger must break both. The Merkle root itself is SHA-256
(Grover leaves about 128-bit security), so the record's integrity does not
depend on these signatures; they authenticate who attested the root.

What this does NOT prove: the keys used in the demonstration are not in the
pinned key manifest (contracts/keys/manifest.json), so a valid attestation
shows the scheme works end to end, not that VUKA's server issued it. Pinning
is a later step (key ceremony, manifest re-pin, 0x02 anchor, verifier pins).
"""

from __future__ import annotations

import base64
import re

from cryptography.exceptions import InvalidSignature

from anchor.canonical import canonical

CONTEXT = b"vuka-root-attestation-v1"  # FIPS 204 context string; fixed for v1
KIND = "vuka_root_attestation"
VERSION = 1
FIELDS = {"v", "kind", "network", "topic", "topic_epoch", "seq", "consensus_timestamp", "message_type", "message_hex"}
ROOT_MESSAGE_TYPE = 0x01  # 0x01 = root, 0x02 = manifest fingerprint (shared/keys.js)
_HEX66 = re.compile(r"^[0-9a-f]{66}$")
_TOPIC = re.compile(r"^\d+\.\d+\.\d+$")
_TIMESTAMP = re.compile(r"^\d+\.\d{9}$")


def statement(*, network: str, topic: str, topic_epoch: int, seq: int, consensus_timestamp: str, message: bytes) -> dict:
    """The v1 statement for one root message (0x01 || 32-byte root)."""
    if len(message) != 33 or message[0] != ROOT_MESSAGE_TYPE:
        raise ValueError("a root message is exactly 0x01 || 32-byte root")
    st = {
        "v": VERSION,
        "kind": KIND,
        "network": network,
        "topic": topic,
        "topic_epoch": topic_epoch,
        "seq": seq,
        "consensus_timestamp": consensus_timestamp,
        "message_type": ROOT_MESSAGE_TYPE,
        "message_hex": message.hex(),
    }
    _check(st)
    return st


def _check(st: dict) -> None:
    if not isinstance(st, dict) or set(st) != FIELDS:
        raise ValueError("statement fields are not exactly the v1 fields")
    if st["v"] != VERSION or st["kind"] != KIND or st["message_type"] != ROOT_MESSAGE_TYPE:
        raise ValueError("unsupported statement version, kind or message type")
    for key in ("topic_epoch", "seq"):
        if not isinstance(st[key], int) or isinstance(st[key], bool) or st[key] < 0:
            raise ValueError(f"{key} must be a non-negative integer")
    if not isinstance(st["network"], str) or not st["network"]:
        raise ValueError("network must be a non-empty string")
    if not isinstance(st["topic"], str) or not _TOPIC.match(st["topic"]):
        raise ValueError("topic must be shard.realm.num")
    if not isinstance(st["consensus_timestamp"], str) or not _TIMESTAMP.match(st["consensus_timestamp"]):
        raise ValueError("consensus_timestamp must be seconds.nanoseconds")
    if not isinstance(st["message_hex"], str) or not _HEX66.match(st["message_hex"]) or not st["message_hex"].startswith("01"):
        raise ValueError("message_hex must be 66 lowercase hex characters starting 01")


def statement_bytes(st: dict) -> bytes:
    """The exact bytes both algorithms sign: spec §5 canonical JSON."""
    _check(st)
    return canonical(st)


def verify(attestation: dict, *, ed25519_public: bytes, ml_dsa_65_public: bytes, mirror_message: bytes) -> str | None:
    """None if valid; otherwise the first reason it is not."""
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    from cryptography.hazmat.primitives.asymmetric.mldsa import MLDSA65PublicKey

    if not isinstance(attestation, dict) or set(attestation) != {"statement", "sig_ed25519", "sig_ml_dsa_65"}:
        return "attestation fields are not exactly statement, sig_ed25519, sig_ml_dsa_65"
    st = attestation["statement"]
    try:
        signed = statement_bytes(st)
    except ValueError as exc:
        return f"statement: {exc}"
    if bytes.fromhex(st["message_hex"]) != mirror_message:
        return "message bytes differ from the mirror node's message"
    try:
        sig_ed = base64.b64decode(attestation["sig_ed25519"], validate=True)
        sig_pq = base64.b64decode(attestation["sig_ml_dsa_65"], validate=True)
    except (ValueError, TypeError):
        return "signatures must be base64"
    try:
        Ed25519PublicKey.from_public_bytes(ed25519_public).verify(sig_ed, signed)
    except (InvalidSignature, ValueError):
        return "Ed25519 signature does not verify"
    try:
        MLDSA65PublicKey.from_public_bytes(ml_dsa_65_public).verify(sig_pq, signed, context=CONTEXT)
    except (InvalidSignature, ValueError):
        return "ML-DSA-65 signature does not verify"
    return None
