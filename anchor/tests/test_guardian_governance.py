"""Decision-table tests for the pure §9 guardian governance function."""

import pytest

from anchor.guardian_governance import (
    DELETION_COOLING_OFF_HOURS,
    RECOVERY_GUARDIAN_FREEZE_HOURS,
    REMOVAL_DELAY_HOURS,
    decide_guardian_action,
)


@pytest.mark.parametrize(
    ("action", "expected"),
    [
        ("add_guardian", "allowed"),
        ("remove_guardian", "scheduled_24h"),
        ("delete_evidence", "allowed"),
        ("recover_device", "allowed"),
    ],
)
def test_each_normal_mode_action(action, expected):
    decision = decide_guardian_action(
        action=action, mode="normal", incident_open=False, guardian_count=2
    )
    assert decision.outcome == expected


@pytest.mark.parametrize(
    ("action", "expected"),
    [
        ("add_guardian", "decoy"),
        ("remove_guardian", "looks_done_no_op"),
        ("delete_evidence", "looks_done_no_op"),
        ("recover_device", "looks_done_no_op"),
    ],
)
def test_each_duress_mode_action(action, expected):
    decision = decide_guardian_action(
        action=action, mode="duress", incident_open=False, guardian_count=2
    )
    assert decision.outcome == expected


@pytest.mark.parametrize(
    ("action", "expected"),
    [
        ("add_guardian", "allowed"),
        ("remove_guardian", "deferred"),
        ("delete_evidence", "blocked"),
        ("recover_device", "blocked"),
    ],
)
def test_each_action_during_an_open_incident(action, expected):
    decision = decide_guardian_action(
        action=action, mode="normal", incident_open=True, guardian_count=2
    )
    assert decision.outcome == expected


def test_decoy_invite_never_reaches_real_guardians_but_alerts_them():
    decision = decide_guardian_action(
        action="add_guardian", mode="duress", incident_open=False, guardian_count=1
    )
    assert decision.notify_existing_guardians
    assert decision.guardian_notice == "added_under_duress"


def test_guardian_removal_uses_24_hour_delay_and_last_guardian_is_blocked():
    decision = decide_guardian_action(
        action="remove_guardian", mode="normal", incident_open=False, guardian_count=2
    )
    assert decision.delay_hours == REMOVAL_DELAY_HOURS == 24
    assert decision.continues_alerting_removed_guardian_until_effective
    assert decide_guardian_action(
        action="remove_guardian", mode="normal", incident_open=False, guardian_count=1
    ).outcome == "blocked"


def test_evidence_deletion_has_72_hour_cooling_off_and_completion_notice():
    decision = decide_guardian_action(
        action="delete_evidence", mode="normal", incident_open=False, guardian_count=1
    )
    assert decision.cooling_off_hours == DELETION_COOLING_OFF_HOURS == 72
    assert decision.notify_guardians_on_completion


def test_recovery_revokes_old_key_and_freezes_sensitive_changes_for_24_hours():
    decision = decide_guardian_action(
        action="recover_device", mode="normal", incident_open=False, guardian_count=1
    )
    assert decision.notify_existing_guardians
    assert decision.revoke_old_key
    assert decision.freeze_guardian_changes_and_deletion_hours == RECOVERY_GUARDIAN_FREEZE_HOURS == 24


def test_rejects_invalid_policy_inputs():
    with pytest.raises(ValueError, match="unsupported guardian action"):
        decide_guardian_action(
            action="add_operator", mode="normal", incident_open=False, guardian_count=1  # type: ignore[arg-type]
        )
    with pytest.raises(ValueError, match="guardian_count"):
        decide_guardian_action(
            action="add_guardian", mode="normal", incident_open=False, guardian_count=True  # type: ignore[arg-type]
        )
