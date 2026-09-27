"""The signer (server/pq_attest.py) produces attestations the verifier accepts.

Fresh signatures from TEST-ONLY seeded keys, verified by anchor/pq.py here;
shared/test/pq.test.js checks signer output through contracts/vectors/pq.json,
which scripts/gen-pq-vectors.py writes with this same signer.
"""

import base64
import hashlib
import json
from pathlib import Path

import pytest

mldsa = pytest.importorskip("cryptography.hazmat.primitives.asymmetric.mldsa", reason="needs cryptography>=50 (pinned in server/requirements.txt)")
from cryptography.exceptions import InvalidSignature  # noqa: E402
from cryptography.hazmat.primitives import serialization as S  # noqa: E402
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey  # noqa: E402

from anchor import pq  # noqa: E402
from server import pq_attest  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
MIRROR = json.loads((ROOT / "contracts/vectors/hedera-mirror-0.0.10687280-seq8.json").read_text(encoding="utf-8"))


def _keys():
    dsa = mldsa.MLDSA65PrivateKey.from_seed_bytes(hashlib.sha256(b"vuka-pq-signer-test/ml-dsa-65").digest())
    ed = Ed25519PrivateKey.from_private_bytes(hashlib.sha256(b"vuka-pq-signer-test/ed25519").digest())
    raw = lambda k: k.public_key().public_bytes(S.Encoding.Raw, S.PublicFormat.Raw)  # noqa: E731
    return dsa, ed, raw(dsa), raw(ed)


def _statement():
    return pq.statement(network="hedera-testnet", topic=MIRROR["topic_id"], topic_epoch=1, seq=MIRROR["sequence_number"],
                        consensus_timestamp=MIRROR["consensus_timestamp"], message=base64.b64decode(MIRROR["message"]))


def test_fresh_signer_output_verifies():
    dsa, ed, dsa_pub, ed_pub = _keys()
    att = pq_attest.sign(_statement(), ed25519_private=ed, ml_dsa_65_private=dsa)
    assert pq.verify(att, ed25519_public=ed_pub, ml_dsa_65_public=dsa_pub, mirror_record=MIRROR) is None


def test_signer_uses_the_fixed_context():
    dsa, ed, dsa_pub, _ = _keys()
    att = pq_attest.sign(_statement(), ed25519_private=ed, ml_dsa_65_private=dsa)
    signed = pq.statement_bytes(att["statement"])
    public = mldsa.MLDSA65PublicKey.from_public_bytes(dsa_pub)
    public.verify(base64.b64decode(att["sig_ml_dsa_65"]), signed, context=pq.CONTEXT)
    with pytest.raises(InvalidSignature):
        public.verify(base64.b64decode(att["sig_ml_dsa_65"]), signed, context=b"")


def test_signer_refuses_a_malformed_statement():
    dsa, ed, _, _ = _keys()
    st = _statement()
    st["message_type"] = 2
    with pytest.raises(ValueError):
        pq_attest.sign(st, ed25519_private=ed, ml_dsa_65_private=dsa)
