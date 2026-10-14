"""
Reference Python canonicaliser per VUKA-2-SPEC.md §5.

Bytes are UTF-8 of json.dumps(obj, sort_keys=True, separators=(",", ":"),
ensure_ascii=True), with validation:
- No floats anywhere in a hashed or signed object.
- Object keys ASCII only, sorted by code point.
- Integers within ±(2^53 − 1).
- Duplicate keys in JSON input are rejected.
- Non-ASCII string content escaped as \\uXXXX lowercase hex; outside-BMP as
  UTF-16 surrogate pairs.
"""

import json
import re

_SAFE_INT_MIN = -(2**53 - 1)  # -9007199254740991
_SAFE_INT_MAX = 2**53 - 1     #  9007199254740991
_DUPLICATE_KEY_ERROR = "Duplicate key in JSON input"


def _parse_json_no_duplicates(json_str: str):
    """Parse JSON, rejecting duplicate object keys."""
    seen_keys = []

    def _check_pairs(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"{_DUPLICATE_KEY_ERROR}: {key!r}")
            result[key] = value
            seen_keys.append(key)
        return result

    return json.loads(json_str, object_pairs_hook=_check_pairs)


def _validate(obj, _path=""):
    """Validate obj recursively, raising ValueError on contract violations."""
    if isinstance(obj, float):
        raise ValueError(f"Float not allowed at {_path or '<root>'}: {obj}")
    if isinstance(obj, int) and not isinstance(obj, bool):
        if obj < _SAFE_INT_MIN or obj > _SAFE_INT_MAX:
            raise ValueError(
                f"Integer {obj} outside safe range [{_SAFE_INT_MIN}, {_SAFE_INT_MAX}] "
                f"at {_path or '<root>'}"
            )
    if isinstance(obj, dict):
        for key in obj:
            if not isinstance(key, str):
                raise ValueError(
                    f"Non-string key at {_path or '<root>'}: {key!r}"
                )
            if not key.isascii():
                raise ValueError(
                    f"Non-ASCII key at {_path or '<root>'}: {key!r}"
                )
            _validate(obj[key], f"{_path}.{key}" if _path else key)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            _validate(item, f"{_path}[{i}]")


def canonical(obj) -> bytes:
    """Produce canonical UTF-8 bytes from a Python object per §5.

    Validates then serializes with sorted keys, compact separators,
    and \\uXXXX escaping for non-ASCII.
    """
    _validate(obj)
    return json.dumps(
        obj,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=True,
    ).encode("utf-8")


def canonicalize_json(json_str: str) -> bytes:
    """Parse a JSON string (rejecting duplicate keys), then canonicalize."""
    obj = _parse_json_no_duplicates(json_str)
    return canonical(obj)