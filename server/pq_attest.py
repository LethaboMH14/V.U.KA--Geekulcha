"""Signer for the post-quantum root attestation v1 — a PROPOSED demonstration.

Signs anchor/pq.py's statement bytes with Ed25519 AND ML-DSA-65 (FIPS 204,
context "vuka-root-attestation-v1"), using pyca/cryptography 50, which
server/requirements.txt already pins. It is not called by the anchoring
worker: wiring it into root issuance, and pinning its public keys in the key
manifest, are later steps (docs/QUANTUM-TECH.md).
"""

from __future__ import annotations

import base64

from anchor import pq


def sign(statement: dict, *, ed25519_private, ml_dsa_65_private) -> dict:
    """The attestation object for one statement. Keys are pyca private-key objects."""
    signed = pq.statement_bytes(statement)
    return {
        "statement": statement,
        "sig_ed25519": base64.b64encode(ed25519_private.sign(signed)).decode("ascii"),
        "sig_ml_dsa_65": base64.b64encode(ml_dsa_65_private.sign(signed, context=pq.CONTEXT)).decode("ascii"),
    }
