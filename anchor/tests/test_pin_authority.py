"""Tests for the non-cryptographic §9 statement/record shapes."""

import base64

import pytest

from anchor import canonical as canonical_module
from anchor import pin_authority
from anchor.pin_authority import (
    canonical_pin_authorised,
    construct_pin_authorisation_record,
    is_unexpired,
    matches_claimed_action_target,
)


def _statement(**overrides):
    statement = {
        "action": "remove_guardian",
        "target_id": "sim_guardian_1",
        "mode": "normal",
        "nonce": "sim_nonce_1",
        # This is a synthetic base64-encoded byte string, not a verified signature.
        "sig": base64.b64encode(b"sim_der_signature").decode("ascii"),
        "signer_key_id": "sim_device_key_1",
    }
    statement.update(overrides)
    return statement


def _record(**overrides):
    return construct_pin_authorisation_record(
        _statement(**overrides), receipt_time="2026-09-23T12:00:00Z"
    )


def test_server_record_adds_120_second_expiry_after_statement_fields():
    statement = _statement()
    record = construct_pin_authorisation_record(
        statement, receipt_time="2026-09-23T14:00:00+02:00"
    )

    assert record == {
        **statement,
        "expires_at": "2026-09-23T12:02:00Z",
    }
    assert "expires_at" not in statement


@pytest.mark.parametrize(
    ("check_time", "expected"),
    [
        ("2026-09-23T12:01:59Z", True),
        ("2026-09-23T12:02:00Z", False),
        ("2026-09-23T12:02:01Z", False),
    ],
)
def test_expiry_boundary(check_time, expected):
    assert is_unexpired(_record(), check_time) is expected


def test_expiry_comparison_handles_equivalent_offsets():
    assert is_unexpired(_record(), "2026-09-23T14:01:59+02:00")


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
        construct_pin_authorisation_record(
            _statement(), receipt_time="2026-09-23T12:00:00"
        )
    with pytest.raises(ValueError, match="mode"):
        construct_pin_authorisation_record(
            _statement(mode="machine"),  # type: ignore[arg-type]
            receipt_time="2026-09-23T12:00:00Z",
        )


def test_canonical_signature_bytes_exclude_expiry_signature_and_key_id(monkeypatch):
    statement = _statement()
    calls = []
    original = canonical_module.canonical

    def spy(value):
        calls.append(value)
        return original(value)

    monkeypatch.setattr(pin_authority, "canonical", spy)
    encoded = canonical_pin_authorised(statement)
    signed = {
        "action": statement["action"],
        "target_id": statement["target_id"],
        "mode": statement["mode"],
        "nonce": statement["nonce"],
    }
    assert calls == [signed]
    assert encoded == original(signed)
    assert b'"mode":"normal"' in encoded
    assert b"expires_at" not in encoded
    assert b'"sig"' not in encoded
    assert b'signer_key_id' not in encoded


def test_canonicalization_rejects_extra_missing_and_malformed_fields():
    with pytest.raises(ValueError, match="exactly six"):
        canonical_pin_authorised({**_statement(), "public_mode": "normal"})
    missing_key = _statement()
    missing_key.pop("signer_key_id")
    with pytest.raises(ValueError, match="exactly six"):
        canonical_pin_authorised(missing_key)
    with pytest.raises(ValueError, match="base64 DER"):
        canonical_pin_authorised(_statement(sig="not base64!"))


def test_record_rejects_expiry_in_signed_statement_and_extra_record_fields():
    with pytest.raises(ValueError, match="exactly six"):
        canonical_pin_authorised({**_statement(), "expires_at": "2026-09-23T12:02:00Z"})
    with pytest.raises(ValueError, match="exactly seven"):
        is_unexpired({**_record(), "public_mode": "normal"}, "2026-09-23T12:01:00Z")
