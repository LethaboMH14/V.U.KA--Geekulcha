"""Shape and timing helpers for the §9 PIN-authority statement and record.

This module does not verify a PIN, authenticate a signer, or verify ECDSA.
The device-signed statement contains action, target, mode and nonce; the
signature and signer key identify that statement. The server record adds an
expiry derived from its receipt time after the caller verifies the statement.
"""

from __future__ import annotations

import base64
import binascii
import re
from datetime import datetime, timedelta, timezone
from typing import Literal, Mapping, TypedDict

from anchor.canonical import canonical


PIN_AUTHORITY_TTL = timedelta(seconds=120)
_RFC3339 = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$"
)
_SIGNED_FIELDS = ("action", "target_id", "mode", "nonce")
_STATEMENT_FIELDS = frozenset((*_SIGNED_FIELDS, "sig", "signer_key_id"))
_RECORD_FIELDS = frozenset((*_STATEMENT_FIELDS, "expires_at"))


class PinAuthorisationStatement(TypedDict):
    """Device-signed statement; sig covers only the four §9 fields."""

    action: str
    target_id: str
    mode: Literal["normal", "duress"]
    nonce: str
    sig: str
    signer_key_id: str


class PinAuthorisationRecord(PinAuthorisationStatement):
    """Server-side record; expires_at is derived from server receipt time."""

    expires_at: str


def _parse_rfc3339(value: str, *, field: str) -> datetime:
    if not isinstance(value, str) or not _RFC3339.fullmatch(value):
        raise ValueError(f"{field} must be an RFC 3339 timestamp with an offset")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.utcoffset() is None:
        raise ValueError(f"{field} must include a timezone offset")
    return parsed.astimezone(timezone.utc)


def _format_rfc3339(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _validate_statement(statement: Mapping[str, str]) -> None:
    if set(statement) != _STATEMENT_FIELDS:
        raise ValueError("PIN-authority statement must contain exactly six fields")
    if not all(isinstance(statement[field], str) for field in _STATEMENT_FIELDS):
        raise ValueError("all PIN-authority statement fields must be strings")
    if statement["mode"] not in ("normal", "duress"):
        raise ValueError("mode must be 'normal' or 'duress'")
    if not statement["action"] or not statement["target_id"] or not statement["nonce"]:
        raise ValueError("action, target_id and nonce must be non-empty")
    if not statement["signer_key_id"]:
        raise ValueError("signer_key_id must be non-empty")
    try:
        signature = base64.b64decode(statement["sig"], validate=True)
    except (ValueError, binascii.Error) as exc:
        raise ValueError("sig must be valid base64 DER") from exc
    if not signature:
        raise ValueError("sig must contain a DER signature")


def construct_pin_authorisation_record(
    statement: PinAuthorisationStatement, *, receipt_time: str
) -> PinAuthorisationRecord:
    """Add a server-derived 120-second expiry to a validated signed statement.

    Signature verification must happen before this function is called. This
    helper only checks the statement shape and computes the record expiry.
    """
    _validate_statement(statement)
    received = _parse_rfc3339(receipt_time, field="receipt_time")
    return {
        **statement,
        "expires_at": _format_rfc3339(received + PIN_AUTHORITY_TTL),
    }


def is_unexpired(record: Mapping[str, str], check_time: str) -> bool:
    """Return true only before server-derived expires_at; equality is expired."""
    if set(record) != _RECORD_FIELDS:
        raise ValueError("PIN-authority record must contain exactly seven fields")
    _validate_statement({field: record[field] for field in _STATEMENT_FIELDS})
    expires_at = _parse_rfc3339(record.get("expires_at"), field="expires_at")
    checked_at = _parse_rfc3339(check_time, field="check_time")
    return checked_at < expires_at


def matches_claimed_action_target(
    statement: Mapping[str, str], *, action: str, target_id: str
) -> bool:
    """Check the signed statement scope against a claimed action/target pair."""
    return statement.get("action") == action and statement.get("target_id") == target_id


def canonical_pin_authorised(statement: Mapping[str, str]) -> bytes:
    """Canonicalize only {action,target_id,mode,nonce} for device signing.

    sig and signer_key_id are validated but deliberately excluded from the
    signed bytes to avoid self-signing and bind only the §9 authority statement.
    """
    _validate_statement(statement)
    return canonical({field: statement[field] for field in _SIGNED_FIELDS})
