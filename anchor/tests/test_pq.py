"""Post-quantum root attestation v1 (PROPOSED demonstration) — Python side.

Cross-implementation evidence: pyca/cryptography 50 (this file) and
@noble/post-quantum (shared/test/pq.test.js) derive the same public keys from
the same seeds, verify each other's signatures and decapsulate each other's
ML-KEM ciphertexts. Keys are TEST-ONLY, derived from public labels.
"""

import base64
import copy
import hashlib
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

mldsa = pytest.importorskip("cryptography.hazmat.primitives.asymmetric.mldsa", reason="needs cryptography>=50 (pinned in server/requirements.txt)")
from cryptography.hazmat.primitives import serialization as S  # noqa: E402
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey  # noqa: E402
from cryptography.hazmat.primitives.asymmetric.mlkem import MLKEM768PrivateKey  # noqa: E402

from anchor import pq  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
PY = json.loads((ROOT / "contracts/vectors/pq.json").read_text(encoding="utf-8"))
JS = json.loads((ROOT / "contracts/vectors/pq-js.json").read_text(encoding="utf-8"))
MIRROR = json.loads((ROOT / "contracts/vectors/hedera-mirror-0.0.10687280-seq8.json").read_text(encoding="utf-8"))
MESSAGE = base64.b64decode(MIRROR["message"])
ED_PUB = bytes.fromhex(PY["ed25519_public_hex"])
PQ_PUB = bytes.fromhex(PY["ml_dsa_65_public_hex"])


def seed(label, n):
    out, i = b"", 0
    while len(out) < n:
        out += hashlib.sha256(f"{label}/{i}".encode()).digest()
        i += 1
    return out[:n]


def check(att, **over):
    kw = {"ed25519_public": ED_PUB, "ml_dsa_65_public": PQ_PUB, "mirror_message": MESSAGE}
    kw.update(over)
    return pq.verify(att, **kw)


def test_statement_binds_the_real_root_8_message():
    st = PY["attestation"]["statement"]
    assert st["message_hex"] == MESSAGE.hex()
    assert st["seq"] == 8 and st["topic"] == "0.0.10687280" and st["topic_epoch"] == 1
    assert st["message_hex"].startswith("01fba0ff6c")  # root #8 on the public ledger


def test_python_and_noble_derive_identical_public_keys():
    dsa = mldsa.MLDSA65PrivateKey.from_seed_bytes(seed(PY["labels"]["ml_dsa_65"], 32))
    kem = MLKEM768PrivateKey.from_seed_bytes(seed(PY["labels"]["ml_kem_768"], 64))
    raw = lambda k: k.public_key().public_bytes(S.Encoding.Raw, S.PublicFormat.Raw).hex()  # noqa: E731
    assert raw(dsa) == PY["ml_dsa_65_public_hex"] == JS["ml_dsa_65_public_hex"]
    assert raw(kem) == PY["ml_kem_768_public_hex"] == JS["ml_kem_768_public_hex"]


def test_python_attestation_verifies():
    assert check(PY["attestation"]) is None


def test_noble_signed_attestation_verifies_in_python():
    assert check(JS["attestation"]) is None


def test_noble_ml_kem_ciphertext_decapsulates_in_python():
    kem = MLKEM768PrivateKey.from_seed_bytes(seed(PY["labels"]["ml_kem_768"], 64))
    enc = JS["ml_kem_768_js_encapsulation"]
    assert hashlib.sha256(kem.decapsulate(bytes.fromhex(enc["ciphertext_hex"]))).hexdigest() == enc["ss_sha256"]


def test_tampered_ml_kem_ciphertext_gives_a_different_secret():
    kem = MLKEM768PrivateKey.from_seed_bytes(seed(PY["labels"]["ml_kem_768"], 64))
    enc = JS["ml_kem_768_js_encapsulation"]
    ct = bytearray(bytes.fromhex(enc["ciphertext_hex"]))
    ct[0] ^= 1
    assert hashlib.sha256(kem.decapsulate(bytes(ct))).hexdigest() != enc["ss_sha256"]  # FIPS 203 implicit rejection


@pytest.mark.parametrize("field,value", [("seq", 7), ("topic_epoch", 2), ("consensus_timestamp", "1790454709.667629105"), ("topic", "0.0.1")])
def test_altered_statement_fields_fail(field, value):
    att = copy.deepcopy(PY["attestation"])
    att["statement"][field] = value
    assert check(att) is not None


def test_mirror_bytes_mismatch_fails():
    other = bytes([0x01]) + bytes(32)
    assert check(PY["attestation"], mirror_message=other) == "message bytes differ from the mirror node's message"


def test_statement_edited_to_match_other_mirror_bytes_fails_signatures():
    att = copy.deepcopy(PY["attestation"])
    other = bytes([0x01]) + bytes(32)
    att["statement"]["message_hex"] = other.hex()
    assert check(att, mirror_message=other) == "Ed25519 signature does not verify"


def test_manifest_message_type_is_refused():
    att = copy.deepcopy(PY["attestation"])
    att["statement"]["message_type"] = 2
    assert check(att).startswith("statement:")


def test_swapped_keys_fail():
    assert check(PY["attestation"], ed25519_public=bytes(32)) is not None
    other = mldsa.MLDSA65PrivateKey.from_seed_bytes(bytes(32)).public_key().public_bytes(S.Encoding.Raw, S.PublicFormat.Raw)
    assert check(PY["attestation"], ml_dsa_65_public=other) == "ML-DSA-65 signature does not verify"


def test_wrong_context_fails():
    dsa = mldsa.MLDSA65PrivateKey.from_seed_bytes(seed(PY["labels"]["ml_dsa_65"], 32))
    att = copy.deepcopy(PY["attestation"])
    signed = pq.statement_bytes(att["statement"])
    att["sig_ml_dsa_65"] = base64.b64encode(dsa.sign(signed, context=b"another-context")).decode()
    assert check(att) == "ML-DSA-65 signature does not verify"


def test_each_signature_alone_is_not_enough():
    ed = Ed25519PrivateKey.from_private_bytes(seed(PY["labels"]["ed25519"], 32))
    att = copy.deepcopy(PY["attestation"])
    att["sig_ml_dsa_65"] = base64.b64encode(b"\x00" * 3309).decode()  # Ed25519 valid, ML-DSA missing
    assert check(att) == "ML-DSA-65 signature does not verify"
    att = copy.deepcopy(PY["attestation"])
    att["sig_ed25519"] = base64.b64encode(ed.sign(b"something else")).decode()  # ML-DSA valid, Ed25519 wrong
    assert check(att) == "Ed25519 signature does not verify"


def test_truncated_signature_fails():
    att = copy.deepcopy(PY["attestation"])
    att["sig_ml_dsa_65"] = base64.b64encode(base64.b64decode(att["sig_ml_dsa_65"])[:-1]).decode()
    assert check(att) == "ML-DSA-65 signature does not verify"


def test_extra_fields_are_refused():
    att = copy.deepcopy(PY["attestation"])
    att["statement"]["note"] = "x"
    assert check(att).startswith("statement:")
    att = copy.deepcopy(PY["attestation"])
    att["extra"] = 1
    assert check(att) is not None
