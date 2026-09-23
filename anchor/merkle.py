"""
Reference Python Merkle tree builder per VUKA-2-SPEC.md §6.

RFC 6962 style:
  leaf = SHA-256(0x00 || raw 32-byte chain head)
  node = SHA-256(0x01 || left 32 bytes || right 32 bytes)

Split at the largest power of two strictly less than n.
n=0 (empty tree) is a rejection — raises ValueError.
Heads are ordered by raw bytes ascending before tree construction.
"""

import hashlib
import math

_EMPTY_TREE_ERROR = "Empty tree (n=0) is never anchored"


def _sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()


def _largest_power_of_two_less_than(n: int) -> int:
    """Largest power of two strictly less than n (n >= 2)."""
    if n & (n - 1) == 0:
        return n // 2  # n is a power of 2; return n/2
    return 1 << (n.bit_length() - 1)


def _build_tree(nodes: list[bytes], offset: int, count: int) -> bytes:
    """Recursively build a Merkle subtree and return its root hash."""
    if count == 1:
        return _sha256(b"\x00" + nodes[offset])
    # split at largest power of two strictly less than count
    k = _largest_power_of_two_less_than(count)
    left = _build_tree(nodes, offset, k)
    right = _build_tree(nodes, offset + k, count - k)
    return _sha256(b"\x01" + left + right)


def build_merkle_root(heads: list[bytes]) -> bytes:
    """Build an RFC 6962 Merkle tree from ordered 32-byte chain heads.

    Returns the 32-byte root hash.  Raises ValueError if heads is empty.
    """
    if not heads:
        raise ValueError(_EMPTY_TREE_ERROR)
    # sort by raw bytes ascending (per §6)
    sorted_heads = sorted(heads)
    return _build_tree(sorted_heads, 0, len(sorted_heads))


def _build_proof(nodes: list[bytes], offset: int, count: int,
                 target_index: int, proof: list) -> None:
    """Recursively build an audit path from leaf to root."""
    if count == 1:
        return  # reached the leaf; nothing to add
    k = _largest_power_of_two_less_than(count)
    if target_index < offset + k:
        # target is in the left subtree
        right_root = _build_tree(nodes, offset + k, count - k)
        # recurse first (deeper = closer to leaf), then add current sibling
        _build_proof(nodes, offset, k, target_index, proof)
        proof.append({"side": "R", "hash": right_root.hex()})
    else:
        # target is in the right subtree
        left_root = _build_tree(nodes, offset, k)
        _build_proof(nodes, offset + k, count - k, target_index, proof)
        proof.append({"side": "L", "hash": left_root.hex()})


def build_merkle_proof(heads: list[bytes], index: int) -> list[dict]:
    """Build an audit path for the leaf at `index` (0-based into sorted heads).

    Returns an ordered list of {"side": "L|R", "hash": "<hex>"} from leaf to
    root.  Raises ValueError if heads is empty or index out of range.
    """
    if not heads:
        raise ValueError(_EMPTY_TREE_ERROR)
    sorted_heads = sorted(heads)
    if index < 0 or index >= len(sorted_heads):
        raise ValueError(
            f"Index {index} out of range [0, {len(sorted_heads)})"
        )
    proof = []
    _build_proof(sorted_heads, 0, len(sorted_heads), index, proof)
    return proof


def verify_merkle_proof(root: bytes, head: bytes,
                        proof: list[dict]) -> bool:
    """Verify a Merkle audit path from a leaf head to the expected root.

    proof elements: {"side": "L|R", "hash": "<hex>"}
    """
    current = _sha256(b"\x00" + head)
    for step in proof:
        sibling = bytes.fromhex(step["hash"])
        if step["side"] == "L":
            current = _sha256(b"\x01" + sibling + current)
        else:
            current = _sha256(b"\x01" + current + sibling)
    return current == root