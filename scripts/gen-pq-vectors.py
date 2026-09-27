"""Writes contracts/vectors/pq.json: Python-side test vectors for the PQ demonstration.

TEST-ONLY keys, derived from public labels (SHA-256 of the label), so both
languages can re-derive them and no secret is stored:
  - ML-DSA-65 and Ed25519 attestation of the real Hedera testnet root #8
    (contracts/vectors/hedera-mirror-0.0.10687280-seq8.json), for shared/pq.js to verify;
  - ML-KEM-768 key derivation and a pyca encapsulation, for noble to decapsulate.
The JS side writes contracts/vectors/pq-js.json (shared/scripts/gen-pq-js-vectors.mjs)
for Python to check. Needs cryptography>=50 (server/requirements.txt pins 50.0.0).
Run from the repo root: python scripts/gen-pq-vectors.py
"""

import base64
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from cryptography.hazmat.primitives import serialization as S  # noqa: E402
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey  # noqa: E402
from cryptography.hazmat.primitives.asymmetric.mldsa import MLDSA65PrivateKey  # noqa: E402
from cryptography.hazmat.primitives.asymmetric.mlkem import MLKEM768PrivateKey  # noqa: E402

from anchor import pq  # noqa: E402
from server import pq_attest  # noqa: E402


def seed(label: str, n: int) -> bytes:
    out = b""
    counter = 0
    while len(out) < n:
        out += hashlib.sha256(f"{label}/{counter}".encode()).digest()
        counter += 1
    return out[:n]


LABELS = {
    "ml_dsa_65": "vuka-pq-test-vector/ml-dsa-65/1",
    "ed25519": "vuka-pq-test-vector/ed25519/1",
    "ml_kem_768": "vuka-pq-test-vector/ml-kem-768/1",
}


def raw_pub(key) -> str:
    return key.public_key().public_bytes(S.Encoding.Raw, S.PublicFormat.Raw).hex()


def main() -> None:
    mirror = json.loads((ROOT / "contracts/vectors/hedera-mirror-0.0.10687280-seq8.json").read_text(encoding="utf-8"))
    message = base64.b64decode(mirror["message"])
    pins = json.loads((ROOT / "contracts/keys/verify-pins.json").read_text(encoding="utf-8"))
    st = pq.statement(
        network="hedera-" + pins["network"], topic=mirror["topic_id"], topic_epoch=pins["topic_epoch"],
        seq=mirror["sequence_number"], consensus_timestamp=mirror["consensus_timestamp"], message=message,
    )
    dsa = MLDSA65PrivateKey.from_seed_bytes(seed(LABELS["ml_dsa_65"], 32))
    ed = Ed25519PrivateKey.from_private_bytes(seed(LABELS["ed25519"], 32))
    kem = MLKEM768PrivateKey.from_seed_bytes(seed(LABELS["ml_kem_768"], 64))
    shared_secret, ciphertext = kem.public_key().encapsulate()
    out = {
        "_note": "TEST-ONLY keys derived from the public labels below (seed = SHA-256(label/0 || label/1 ...)). Never use these keys for anything real.",
        "labels": LABELS,
        "ml_dsa_65_public_hex": raw_pub(dsa),
        "ed25519_public_hex": raw_pub(ed),
        "ml_kem_768_public_hex": raw_pub(kem),
        "attestation": pq_attest.sign(st, ed25519_private=ed, ml_dsa_65_private=dsa),
        "ml_kem_768_py_encapsulation": {"ciphertext_hex": ciphertext.hex(), "ss_sha256": hashlib.sha256(shared_secret).hexdigest()},
    }
    (ROOT / "contracts/vectors/pq.json").write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print("wrote contracts/vectors/pq.json")


if __name__ == "__main__":
    main()
