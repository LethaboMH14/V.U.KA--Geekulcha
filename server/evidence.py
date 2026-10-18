"""PROPOSED (ADR-0047): the per-decision rules of evidence_observed pv2.

The JSON schema (contracts/payloads/evidence_observed.v2.json) fixes types;
these rules fix which fields each decision carries, so a record never names
a signal, a prompt names exactly one, and PIN evidence has no aggregate
fields (one fixed shape for both PINs, V5).
"""

ASSESSED = ("tally_db", "band", "k_pct", "context", "observations", "candidate", "signal_event_id")
PIN_REASONS = ("pin_retry", "pin_slow")


class EvidenceShapeError(ValueError):
    pass


def check_v2(payload):
    """Raise EvidenceShapeError unless the payload has its decision's shape."""
    decision = payload["decision"]
    if decision == "pin":
        extra = [k for k in ASSESSED if k in payload]
        if extra:
            raise EvidenceShapeError(f"pin evidence must not carry {extra[0]}")
        if "checkin_id" not in payload:
            raise EvidenceShapeError("pin evidence needs checkin_id")
        reasons = payload["reasons"]
        if [r["name"] for r in reasons] != list(PIN_REASONS) or any(r["db"] not in (0, 2) for r in reasons):
            raise EvidenceShapeError("pin evidence reasons must be exactly pin_retry, pin_slow with weights 0 or 2")
        return
    missing = [k for k in ASSESSED if k not in payload]
    if missing:
        raise EvidenceShapeError(f"{decision} evidence needs {missing[0]}")
    if "checkin_id" in payload:
        raise EvidenceShapeError(f"{decision} evidence must not carry checkin_id")
    if any(r["db"] == 0 for r in payload["reasons"]):
        raise EvidenceShapeError("zero-weight reasons belong in observations")
    if decision == "record" and payload["signal_event_id"] is not None:
        raise EvidenceShapeError("record evidence must not name a signal")
    if decision == "prompt" and payload["signal_event_id"] is None:
        raise EvidenceShapeError("prompt evidence must name its signal")
