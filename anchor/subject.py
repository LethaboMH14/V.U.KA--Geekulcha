"""Subject access — the F14 showcase.

Assembles a SubjectRecord (contracts/openapi.yaml, additionalProperties: false:
subject_id, entries, proof) for one subject: every evidence-chain entry that
targets them, plus a proof package showing the chain is internally consistent.

HONESTY BOUNDARY, stated here because this is the showcase and the honesty
ledger treats this file as a security control, not a formality:

  REAL: the hash-chain construction (anchor/chain.py) and verification
  (anchor/verify.py) are genuine, tested, cryptographic logic — not simulated.
  Given any chain, `is_intact`/`first_broken_index` are real answers.

  NOT YET REAL: this module has no data source of its own. `anchor/publish.py`
  (submitting a Merkle root to a public OpenTimestamps calendar) does not exist
  yet, so `proof.anchor` below is honestly labelled `sim_` and `state:
  "not_submitted"` until that module lands. The showcase's actual claim —
  "verifies against a public verifier with no cooperation from us" — is NOT
  satisfied by this module alone. Do not present sim_ proof output as a real
  anchor in a demo. See docs/CHECKLIST.md SC.1.
"""

from __future__ import annotations

from typing import Any

from anchor.chain import EvidenceEntry
from anchor.verify import verify_chain


def get_subject_record(chain: list[EvidenceEntry], subject_id: str) -> dict[str, Any]:
    """Return the frozen SubjectRecord shape for one subject_id.

    `chain` is the FULL evidence chain (integrity is a property of the whole
    chain — a tamper anywhere invalidates every subject's proof, not just the
    tampered entry's own subject). `entries` in the response is filtered to
    this subject only; `proof` reports on the whole chain's integrity.
    """
    integrity = verify_chain(chain)
    subject_entries = [e for e in chain if e.target_id == subject_id]

    proof: dict[str, Any] = {
        "chain_integrity": integrity.to_dict(),
        "chain_length": len(chain),
        "anchor": {
            "state": "not_submitted",
            "note": "sim_ — anchor/publish.py (OpenTimestamps submission) is not implemented yet; "
                    "this chain has not been anchored to any public calendar. Do not present as verified.",
        },
    }

    return {
        "subject_id": subject_id,
        "entries": [e.to_dict() for e in subject_entries],
        "proof": proof,
    }
