"""Verify a v2 subject chain and return its first broken 0-based index."""

from __future__ import annotations

import hashlib
from collections.abc import Sequence
from typing import Any

from anchor.canonical import canonical


GENESIS_HASH = "0" * 64


def first_broken_index(entries: Sequence[dict[str, Any]]) -> int | None:
    """Return the first malformed hash/link/index, or None for an intact chain.

    This is a structural integrity check, not device-signature or PIN
    verification. Callers must perform those independently before describing
    an export as authentic.
    """
    if not entries:
        return 0  # required genesis entry is missing
    previous = GENESIS_HASH
    for index, entry in enumerate(entries):
        try:
            if not isinstance(entry, dict) or entry["details"]["chain_index"] != index:
                return index
            if entry["prev_hash"] != previous:
                return index
            event_hash = entry["event_hash"]
            if not isinstance(event_hash, str) or len(event_hash) != 64:
                return index
            unhashed = {key: value for key, value in entry.items() if key != "event_hash"}
            if hashlib.sha256(canonical(unhashed)).hexdigest() != event_hash:
                return index
            previous = event_hash
        except (KeyError, TypeError, ValueError, OverflowError):
            return index
    return None
