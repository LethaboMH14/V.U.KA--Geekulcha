"""Tests for the non-cryptographic §9 PIN-authority statement shape."""

import pytest

from anchor import canonical as canonical_module
from anchor import pin_authority
from anchor.pin_authority import (
    canonical_pin_authorised,
    construct_pin_authorised,
    is_unexpired,
    matches_claimed_action_target,
)


def _statement(**overrides):
    statement = construct_pin_authorised(
        action="remove_guardian",
        target_id="sim_guardian_1",
        mode="normal",
        receipt_time="2026-09-23T12:00:00Z",
        nonce="sim_nonce_1",
    )
    statement.update(overrides)
    return statement


def test_constructs_exact_statement_with_120_second_expiry():
    assert construct_pin_authorised(
        action="remove_guardian",
        target_id="sim_guardian_1",
        mode="duress",
        receipt_time="2026-09-23T14:00:00+02:00",
        nonce="sim_nonce_1",
    ) == {
        "action": "remove_guardian",
        "target_id": "sim_guardian_1",
        "mode": "duress",
        "expires_at": "2026-09-23T12:02:00Z",
        "nonce": "sim_nonce_1",
    }


@pytest.mark.parametrize(
    ("check_time", "expected"),
    [
        ("2026-09-23T12:01:59Z", True),
        ("2026-09-23T12:02:00Z", False),
        ("2026-09-23T12:02:01Z", False),
    ],
)
def test_expiry_boundary(check_time, expected):
    assert is_unexpired(_statement(), check_time) is expected


def test_expiry_comparison_handles_equivalent_offsets():
    statement = _statement()
    assert is_unexpired(statement, "2026-09-23T14:01:59+02:00")


def test_rejects_action_or_target_mismatch():
    statement = _statement()
    assert not matches_claimed_action_target(
        statement, action="delete_evidence", target_id="sim_guardian_1"
    )
    assert not matches_claimed_action_target(
        statement, action="remove_guardian", target_id="sim_guardian_2"
    )


def test_rejects_naive_receipt_time_and_invalid_mode():
    with pytest.raises(ValueError, match="RFC 3339"):
        construct_pin_authorised(
            action="remove_guardian",
            target_id="sim_guardian_1",
            mode="normal",
            receipt_time="2026-09-23T12:00:00",
            nonce="sim_nonce_1",
        )
    with pytest.raises(ValueError, match="mode"):
        construct_pin_authorised(
            action="remove_guardian",
            target_id="sim_guardian_1",
            mode="machine",  # type: ignore[arg-type]
            receipt_time="2026-09-23T12:00:00Z",
            nonce="sim_nonce_1",
        )


def test_canonicalization_calls_the_existing_anchor_canonicalizer(monkeypatch):
    statement = _statement()
    calls = []
    original = canonical_module.canonical

    def spy(value):
        calls.append(value)
        return original(value)

    monkeypatch.setattr(pin_authority, "canonical", spy)
    encoded = canonical_pin_authorised(statement)
    assert calls == [statement]
    assert encoded == original(statement)
    assert b'"mode":"normal"' in encoded


def test_canonicalization_rejects_extra_or_malformed_fields():
    with pytest.raises(ValueError, match="exactly"):
        canonical_pin_authorised({**_statement(), "public_mode": "normal"})
    with pytest.raises(ValueError, match="expires_at"):
        canonical_pin_authorised(_statement(expires_at="not-a-time"))
