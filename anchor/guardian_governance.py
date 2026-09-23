"""Pure guardian-governance decision table from VUKA-2-SPEC §9.

Inputs are already-authoritative policy facts. This module does not verify a
PIN, authenticate a person, sign a statement, or perform any side effect.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


GovernanceAction = Literal["add_guardian", "remove_guardian", "delete_evidence", "recover_device"]
PinMode = Literal["normal", "duress"]
Outcome = Literal[
    "allowed",
    "decoy",
    "looks_done_no_op",
    "scheduled_24h",
    "deferred",
    "blocked",
]

REMOVAL_DELAY_HOURS = 24
DELETION_COOLING_OFF_HOURS = 72
RECOVERY_GUARDIAN_FREEZE_HOURS = 24


@dataclass(frozen=True)
class GovernanceDecision:
    outcome: Outcome
    notify_existing_guardians: bool = False
    guardian_notice: str | None = None
    delay_hours: int | None = None
    continues_alerting_removed_guardian_until_effective: bool = False
    cooling_off_hours: int | None = None
    notify_guardians_on_completion: bool = False
    revoke_old_key: bool = False
    freeze_guardian_changes_and_deletion_hours: int | None = None


_ACTIONS = {"add_guardian", "remove_guardian", "delete_evidence", "recover_device"}
_MODES = {"normal", "duress"}


def decide_guardian_action(
    *, action: GovernanceAction, mode: PinMode, incident_open: bool, guardian_count: int
) -> GovernanceDecision:
    """Return the §9 outcome and its fixed timing/notification consequences.

    Duress behavior takes precedence over incident handling so a duress request
    never performs the underlying real action. Open-incident rules then apply
    before ordinary normal-mode handling.
    """
    if action not in _ACTIONS:
        raise ValueError(f"unsupported guardian action: {action!r}")
    if mode not in _MODES:
        raise ValueError(f"unsupported PIN mode: {mode!r}")
    if not isinstance(incident_open, bool):
        raise ValueError("incident_open must be a bool")
    if isinstance(guardian_count, bool) or not isinstance(guardian_count, int) or guardian_count < 0:
        raise ValueError("guardian_count must be a non-negative integer")

    if mode == "duress":
        if action == "add_guardian":
            return GovernanceDecision(
                "decoy",
                notify_existing_guardians=True,
                guardian_notice="added_under_duress",
            )
        return GovernanceDecision("looks_done_no_op")

    if incident_open:
        if action == "add_guardian":
            return GovernanceDecision(
                "allowed", notify_existing_guardians=True, guardian_notice="added"
            )
        if action == "remove_guardian":
            return GovernanceDecision("deferred")
        return GovernanceDecision("blocked")

    if action == "add_guardian":
        return GovernanceDecision(
            "allowed", notify_existing_guardians=True, guardian_notice="added"
        )
    if action == "remove_guardian":
        if guardian_count <= 1:
            return GovernanceDecision("blocked")
        return GovernanceDecision(
            "scheduled_24h",
            delay_hours=REMOVAL_DELAY_HOURS,
            continues_alerting_removed_guardian_until_effective=True,
        )
    if action == "delete_evidence":
        return GovernanceDecision(
            "allowed",
            cooling_off_hours=DELETION_COOLING_OFF_HOURS,
            notify_guardians_on_completion=True,
        )
    return GovernanceDecision(
        "allowed",
        notify_existing_guardians=True,
        guardian_notice="device_recovered",
        revoke_old_key=True,
        freeze_guardian_changes_and_deletion_hours=RECOVERY_GUARDIAN_FREEZE_HOURS,
    )
