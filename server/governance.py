"""Pure governance boundary for WBS 3.3.

This module has no transport or persistence. It makes the authority boundary
executable before an API adapter is added.
"""

from dataclasses import dataclass
from typing import Literal

State = Literal["observed", "watch_candidate", "flagged", "dismissed", "whitelisted"]
Action = Literal["flag", "dismiss", "whitelist"]


class GovernanceError(ValueError):
    """A decision violates the human-authority contract."""


@dataclass(frozen=True)
class Decision:
    actor_id: str
    reason: str
    co_signer_id: str | None = None


def human_verify(state: State, action: Action, decision: Decision) -> State:
    """Apply one human decision; machine callers must not use this boundary."""
    if not decision.actor_id.strip():
        raise GovernanceError("operator identity is required")
    if not decision.reason.strip():
        raise GovernanceError("decision reason is required")
    if state not in ("observed", "watch_candidate"):
        raise GovernanceError(f"decision is not valid from state {state!r}")
    if action == "whitelist":
        if not decision.co_signer_id or not decision.co_signer_id.strip():
            raise GovernanceError("whitelist requires a co-signer")
        if decision.co_signer_id == decision.actor_id:
            raise GovernanceError("signers must be distinct")
        return "whitelisted"
    if action == "flag":
        return "flagged"
    if action == "dismiss":
        return "dismissed"
    raise GovernanceError(f"unsupported action {action!r}")
