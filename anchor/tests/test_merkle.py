"""Tests for anchor.merkle — VUKA-2-SPEC.md §6 vectors n=0…8."""

import hashlib
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from anchor.merkle import (
    build_merkle_root,
    build_merkle_proof,
    verify_merkle_proof,
    _largest_power_of_two_less_than,
)


# ── Load vectors ──────────────────────────────────────────────────────

VECTORS_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "contracts" / "vectors" / "merkle.json"
)


def _load_vectors():
    with open(VECTORS_PATH, encoding="utf-8") as f:
        return json.load(f)


_VECTORS = _load_vectors()


# ── Split function correctness ────────────────────────────────────────

def test_split_powers():
    """n=2..8 → largest power of two strictly less than n."""
    expected = {2: 1, 3: 2, 4: 2, 5: 4, 6: 4, 7: 4, 8: 4}
    for n, exp in expected.items():
        assert _largest_power_of_two_less_than(n) == exp, f"n={n}"


# ── n=0 rejection ─────────────────────────────────────────────────────

def test_empty_tree_rejected_root():
    """Empty tree (n=0) raises ValueError in build_merkle_root."""
    with pytest.raises(ValueError, match="Empty tree"):
        build_merkle_root([])


def test_empty_tree_rejected_proof():
    """Empty tree (n=0) raises ValueError in build_merkle_proof."""
    with pytest.raises(ValueError, match="Empty tree"):
        build_merkle_proof([], 0)


# ── Golden vectors — root ─────────────────────────────────────────────

@pytest.mark.parametrize(
    "vector", [v for v in _VECTORS["vectors"] if v["n"] > 0],
    ids=lambda v: f"n={v['n']}"
)
def test_merkle_root_matches(vector):
    """Every n=1..8 vector produces its documented root."""
    heads = [bytes.fromhex(h) for h in vector["heads_hex"]]
    root = build_merkle_root(heads)
    assert root.hex() == vector["root_hex"], (
        f"n={vector['n']} root mismatch"
    )


# ── Golden vectors — proofs ───────────────────────────────────────────

@pytest.mark.parametrize(
    "vector", [v for v in _VECTORS["vectors"] if v["n"] > 0],
    ids=lambda v: f"n={v['n']}"
)
def test_merkle_proofs_match(vector):
    """Every entry in every vector has its documented proof."""
    n = vector["n"]
    heads = [bytes.fromhex(h) for h in vector["heads_hex"]]
    for entry in vector["entries"]:
        idx = entry["index"]
        expected_proof = entry["proof"]
        actual_proof = build_merkle_proof(heads, idx)
        assert actual_proof == expected_proof, (
            f"n={n} index={idx} proof mismatch"
        )


# ── Golden vectors — proofs verify ────────────────────────────────────

@pytest.mark.parametrize(
    "vector", [v for v in _VECTORS["vectors"] if v["n"] > 0],
    ids=lambda v: f"n={v['n']}"
)
def test_merkle_proofs_verify(vector):
    """Every proof verifies against its root and head."""
    n = vector["n"]
    root = bytes.fromhex(vector["root_hex"])
    heads = [bytes.fromhex(h) for h in vector["heads_hex"]]
    for entry in vector["entries"]:
        idx = entry["index"]
        head = heads[idx]
        proof = entry["proof"]
        assert verify_merkle_proof(root, head, proof), (
            f"n={n} index={idx} proof did not verify"
        )


# ── Leaf construction ─────────────────────────────────────────────────

def test_leaf_is_prefixed_zero():
    """Leaf hash is SHA-256(0x00 || raw 32-byte head)."""
    head = b"\x01" * 32
    leaf = hashlib.sha256(b"\x00" + head).digest()
    root = build_merkle_root([head])
    assert root == leaf


# ── Node construction ─────────────────────────────────────────────────

def test_node_is_prefixed_one():
    """Internal node is SHA-256(0x01 || left 32 bytes || right 32 bytes)."""
    h0 = b"\x01" * 32
    h1 = b"\x02" * 32
    left_leaf = hashlib.sha256(b"\x00" + h0).digest()
    right_leaf = hashlib.sha256(b"\x00" + h1).digest()
    expected_root = hashlib.sha256(b"\x01" + left_leaf + right_leaf).digest()
    actual_root = build_merkle_root([h0, h1])
    assert actual_root == expected_root


# ── Sorting ───────────────────────────────────────────────────────────

def test_heads_sorted_before_tree():
    """Heads are sorted by raw bytes ascending before building the tree."""
    h0 = b"\x00" * 32
    h1 = b"\xff" * 32
    root_sorted = build_merkle_root([h0, h1])
    root_reversed = build_merkle_root([h1, h0])
    assert root_sorted == root_reversed, (
        "Root should be independent of input order (heads are sorted)"
    )


# ── Index validation ──────────────────────────────────────────────────

def test_out_of_range_index():
    """Index out of range raises ValueError."""
    with pytest.raises(ValueError, match="out of range"):
        build_merkle_proof([b"\x00" * 32], 1)


def test_negative_index():
    """Negative index raises ValueError."""
    with pytest.raises(ValueError, match="out of range"):
        build_merkle_proof([b"\x00" * 32], -1)


# ── Wrong proof rejected ──────────────────────────────────────────────

def test_wrong_proof_rejected():
    """A tampered proof is rejected by verify."""
    h0 = b"\x01" * 32
    h1 = b"\x02" * 32
    root = build_merkle_root([h0, h1])
    # Build correct proof, then tamper
    proof = build_merkle_proof([h0, h1], 0)
    tampered = [dict(proof[0])]
    tampered[0]["hash"] = "00" * 32  # replace with wrong hash
    assert not verify_merkle_proof(root, h0, tampered)


def test_wrong_root_rejected():
    """A correct proof for the wrong root does not verify."""
    h0 = b"\x01" * 32
    h1 = b"\x02" * 32
    root = build_merkle_root([h0, h1])
    proof = build_merkle_proof([h0, h1], 0)
    wrong_root = b"\x00" * 32
    assert not verify_merkle_proof(wrong_root, h0, proof)