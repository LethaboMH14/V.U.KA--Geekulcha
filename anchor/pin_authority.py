"""Non-cryptographic PIN-authority statement shape from VUKA-2-SPEC §9.

This module does not verify a PIN or a signature. The caller supplies a nonce
and a mode that has already been decided elsewhere.
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Literal, Mapping

from anchor.canonical import canonical


PIN_AUTHORITY_TTL = timedelta(seconds=120)
_RFC3339 = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$"
)
_STATEMENT_FIELDS = {"action", "target_id", "mode", "expires_at", "nonce"}


def _parse_rfc3339(value: str, *, field: str) -> datetime:
    if not isinstance(value, str) or not _RFC3339.fullmatch(value):
        raise ValueError(f"{field} must be an RFC 3339 timestamp with an offset")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.utcoffset() is None:
        raise ValueError(f"{field} must include a timezone offset")
    return parsed.astimezone(timezone.utc)


def _format_rfc3339(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def construct_pin_authorised(
    *,
    action: str,
    target_id: str,
    mode: Literal["normal", "duress"],
    receipt_time: str,
    nonce: str,
) -> dict[str, str]:
    """Build the statement shape; nonce and mode are supplied, never verified here."""
    if not isinstance(action, str) or not action:
        raise ValueError("action must be a non-empty string")
    if not isinstance(target_id, str) or not target_id:
        raise ValueError("target_id must be a non-empty string")
    if mode not in ("normal", "duress"):
        raise ValueError("mode must be 'normal' or 'duress'")
    if not isinstance(nonce, str) or not nonce:
        raise ValueError("nonce must be a non-empty string")

    received = _parse_rfc3339(receipt_time, field="receipt_time")
    return {
        "action": action,
        "target_id": target_id,
        "mode": mode,
        "expires_at": _format_rfc3339(received + PIN_AUTHORITY_TTL),
        "nonce": nonce,
    }


def is_unexpired(statement: Mapping[str, str], check_time: str) -> bool:
    """Return true only before expires_at; equality with the expiry is expired."""
    expires_at = _parse_rfc3339(statement.get("expires_at"), field="expires_at")
    checked_at = _parse_rfc3339(check_time, field="check_time")
    return checked_at < expires_at


def matches_claimed_action_target(
    statement: Mapping[str, str], *, action: str, target_id: str
) -> bool:
    """Check the statement scope against a claimed action/target pair."""
    return statement.get("action") == action and statement.get("target_id") == target_id


def canonical_pin_authorised(statement: Mapping[str, str]) -> bytes:
    """Validate the exact shape and canonicalize via anchor.canonical.canonical."""
    if set(statement) != _STATEMENT_FIELDS:
        raise ValueError("PIN-authority statement must contain exactly the five §9 fields")
    if not all(isinstance(statement[field], str) for field in _STATEMENT_FIELDS):
        raise ValueError("all PIN-authority statement fields must be strings")
    if statement["mode"] not in ("normal", "duress"):
        raise ValueError("mode must be 'normal' or 'duress'")
    if not statement["action"] or not statement["target_id"] or not statement["nonce"]:
        raise ValueError("action, target_id and nonce must be non-empty")
    _parse_rfc3339(statement["expires_at"], field="expires_at")
    return canonical(dict(statement))
