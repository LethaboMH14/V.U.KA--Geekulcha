"""Chain integrity verification.

Frozen contract (contracts/openapi.yaml IntegrityResult, anchor/README.md,
CLAUDE.md's original spec): returns the FIRST broken link, by 0-based index,
never a boolean. An operator needs to know what broke and where — "false"
tells them nothing.

is_intact / first_broken_index / detail — additionalProperties: false, no
extra keys.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from anchor.chain import EvidenceEntry, compute_event_hash


@dataclass(frozen=True)
class IntegrityResult:
    is_intact: bool
    first_broken_index: Optional[int]  # 0-based (ADR-0030 D2); None if intact
    detail: str

    def to_dict(self) -> dict:
        return {
            "is_intact": self.is_intact,
            "first_broken_index": self.first_broken_index,
            "detail": self.detail,
        }


def verify_chain(chain: list[EvidenceEntry]) -> IntegrityResult:
    """Walk the chain from index 0. For each entry, check two things:
    (1) its own event_hash still matches its own content (nobody edited it
        after the fact), and
    (2) its prev_hash still matches the actual event_hash of the entry before it
        (nobody spliced or reordered the chain).
    Stop at the FIRST entry that fails either check and report that index —
    never scan past a known break and never collapse this to true/false.
    """
    if not chain:
        return IntegrityResult(is_intact=True, first_broken_index=None, detail="empty chain")

    expected_prev: Optional[str] = None
    for index, entry in enumerate(chain):
        if entry.event_hash != compute_event_hash(entry):
            return IntegrityResult(
                is_intact=False,
                first_broken_index=index,
                detail=f"entry {index}: event_hash does not match its own content — record was altered after being written",
            )
        if entry.prev_hash != expected_prev:
            return IntegrityResult(
                is_intact=False,
                first_broken_index=index,
                detail=f"entry {index}: prev_hash does not match the preceding entry's event_hash — chain was spliced or reordered",
            )
        expected_prev = entry.event_hash

    return IntegrityResult(is_intact=True, first_broken_index=None, detail=f"{len(chain)} entries, chain intact")
