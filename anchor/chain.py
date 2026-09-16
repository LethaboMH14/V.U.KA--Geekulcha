"""Prev-hash evidence chain — the append-only record the showcase reads.

Frozen shape (contracts/openapi.yaml EvidenceEntry, additionalProperties: false):
    action, actor_id, target_type, target_id, details, ts, prev_hash, event_hash

Canonical hash formula (CLAUDE.md's original spec, carried through unchanged):
    event_hash = SHA256(json.dumps(entry_without_event_hash, sort_keys=True))

This module is deliberately side-effect free, matching server/src/auth/governance.py's
convention: no I/O, no clock, no persistence. The caller owns appending to storage.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from typing import Any, Optional


REQUIRED_FIELDS = ("action", "actor_id", "target_type", "target_id", "details", "ts", "prev_hash")


@dataclass(frozen=True)
class EvidenceEntry:
    action: str
    actor_id: str
    target_type: str
    target_id: str
    details: dict[str, Any]
    ts: str  # ISO 8601, e.g. "2026-09-16T16:04:00Z"
    prev_hash: Optional[str]
    event_hash: str = field(init=False)

    def __post_init__(self) -> None:
        object.__setattr__(self, "event_hash", compute_event_hash(self))

    def to_dict(self) -> dict[str, Any]:
        """Exact EvidenceEntry shape per contracts/openapi.yaml — field order and
        set is intentional; additionalProperties: false means no extra keys."""
        return {
            "action": self.action,
            "actor_id": self.actor_id,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "details": self.details,
            "ts": self.ts,
            "prev_hash": self.prev_hash,
            "event_hash": self.event_hash,
        }


def compute_event_hash(entry: "EvidenceEntry") -> str:
    """SHA256 over the entry's required fields, sorted keys, excluding event_hash
    itself (which does not exist yet at the point this is computed)."""
    payload = {
        "action": entry.action,
        "actor_id": entry.actor_id,
        "target_type": entry.target_type,
        "target_id": entry.target_id,
        "details": entry.details,
        "ts": entry.ts,
        "prev_hash": entry.prev_hash,
    }
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def append_entry(
    chain: list[EvidenceEntry],
    *,
    action: str,
    actor_id: str,
    target_type: str,
    target_id: str,
    details: dict[str, Any],
    ts: str,
) -> list[EvidenceEntry]:
    """Return a NEW chain (does not mutate) with one entry appended, correctly
    linked to the current tip's event_hash. Empty chain links to prev_hash=None."""
    prev_hash = chain[-1].event_hash if chain else None
    entry = EvidenceEntry(
        action=action,
        actor_id=actor_id,
        target_type=target_type,
        target_id=target_id,
        details=details,
        ts=ts,
        prev_hash=prev_hash,
    )
    return [*chain, entry]
