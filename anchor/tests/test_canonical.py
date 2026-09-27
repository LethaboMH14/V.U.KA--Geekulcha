"""Tests for anchor.canonical — VUKA-2-SPEC.md §5 golden and rejection vectors."""

import hashlib
import json
import sys
from pathlib import Path

import pytest

# Ensure anchor/ is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from anchor.canonical import canonical, canonicalize_json


# ── Load vectors ──────────────────────────────────────────────────────

VECTORS_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "contracts" / "vectors" / "canonical.json"
)


def _load_vectors():
    with open(VECTORS_PATH, encoding="utf-8") as f:
        return json.load(f)


_VECTORS = _load_vectors()


# ── Golden vector tests ───────────────────────────────────────────────

@pytest.mark.parametrize("entry", _VECTORS["golden"], ids=lambda e: e["name"])
def test_golden_canonical_bytes(entry):
    """Every golden vector round-trips to its documented hex bytes."""
    obj = entry["input"]
    expected_bytes_hex = entry["bytes"]
    result = canonical(obj)
    assert result.hex() == expected_bytes_hex, (
        f"Canonical bytes mismatch for '{entry['name']}'"
    )


@pytest.mark.parametrize("entry", _VECTORS["golden"], ids=lambda e: e["name"])
def test_golden_canonical_hash(entry):
    """Every golden vector hashes to its documented SHA-256."""
    obj = entry["input"]
    expected_hash = entry["sha256"]
    result_bytes = canonical(obj)
    result_hash = hashlib.sha256(result_bytes).hexdigest()
    assert result_hash == expected_hash, (
        f"SHA-256 mismatch for '{entry['name']}'"
    )


# ── Rejection vector tests ────────────────────────────────────────────

@pytest.mark.parametrize("entry", _VECTORS["rejections"], ids=lambda e: e["name"])
def test_rejection_vectors_raise(entry):
    """Every rejection vector raises ValueError."""
    name = entry["name"]
    assert entry["raised"], (
        f"Rejection vector '{name}' did not raise (must have been accepted)"
    )


def test_float_rejected():
    """Float in a hashed object raises ValueError."""
    with pytest.raises(ValueError, match="Float"):
        canonical({"score": 0.5})


def test_non_ascii_key_rejected():
    """Non-ASCII key raises ValueError."""
    with pytest.raises(ValueError, match="Non-ASCII key"):
        canonical({"t\u00eaxt": "value"})


def test_int_2_pow_53_rejected():
    """2^53 (exactly at the unsafe boundary) raises ValueError."""
    with pytest.raises(ValueError, match="outside safe range"):
        canonical({"big": 9007199254740992})


def test_neg_2_pow_53_rejected():
    """-2^53 raises ValueError."""
    with pytest.raises(ValueError, match="outside safe range"):
        canonical({"big": -9007199254740992})


def test_duplicate_json_key_rejected():
    """Duplicate key in JSON input raises ValueError."""
    with pytest.raises(ValueError, match="Duplicate key"):
        canonicalize_json('{"a":1,"a":2}')


# ── Boundary edge cases ───────────────────────────────────────────────

def test_max_safe_int_accepted():
    """2^53 - 1 is the maximum allowed integer."""
    result = canonical({"max": 9007199254740991})
    assert b'"max":9007199254740991' in result


def test_min_safe_int_accepted():
    """-(2^53 - 1) is the minimum allowed integer."""
    result = canonical({"min": -9007199254740991})
    assert b'"min":-9007199254740991' in result


def test_zero_accepted():
    """Zero is a valid integer."""
    result = canonical({"zero": 0})
    assert b'"zero":0' in result


def test_bool_is_not_int():
    """Bools (True/False) are not rejected as 'float' — they're JSON booleans."""
    result = canonical({"flag": True, "other": False})
    assert b'"flag":true' in result
    assert b'"other":false' in result


def test_ensure_ascii_emoji():
    """Emoji is escaped as \\uXXXX surrogate pair, not raw UTF-8."""
    result = canonical({"e": "\U0001F600"})
    # U+1F600 → UTF-16 surrogate pair \uD83D\uDE00
    assert b"\\ud83d\\ude00" in result
    # Must NOT contain raw UTF-8 emoji bytes
    assert "\U0001F600".encode("utf-8") not in result


def test_ensure_ascii_diacritics():
    """Afrikaans diacritics are escaped, not raw UTF-8."""
    result = canonical({"text": "sk\u00ear en br\u00ebe"})
    assert b"\\u00ea" in result  # ê
    assert b"\\u00eb" in result  # ë
    # Must NOT contain raw UTF-8
    assert "\u00ea".encode("utf-8") not in result


def test_sort_keys_deep():
    """Keys are sorted recursively, not just at the top level."""
    result = canonical({"z": {"b": 2, "a": 1}, "a": 3})
    # "a" should come before "z" at top level
    assert result.index(b'"a"') < result.index(b'"z"')
    # Inside the nested object, "a" should come before "b"
    inner = result[result.index(b'{"a"') :]
    assert inner.index(b'"a"') < inner.index(b'"b"')


def test_empty_containers():
    """Empty dict and list produce {},[]."""
    result = canonical({"empty_obj": {}, "empty_arr": []})
    assert b'"empty_arr":[]' in result
    assert b'"empty_obj":{}' in result
    # Keys are sorted: empty_arr comes before empty_obj
    assert result.index(b'"empty_arr"') < result.index(b'"empty_obj"')