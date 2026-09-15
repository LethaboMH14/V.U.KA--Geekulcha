"""Human-gated decisions for UMOJA.

This module is deliberately small and side-effect free. The caller persists
``evidence_event`` to the append-only evidence path; refused privileged
attempts are returned as evidence instead of being swallowed as errors.
"""

from dataclasses import dataclass
from typing import Any, Optional


DESTRUCTIVE_ACTIONS = frozenset({"whitelist", "disarm", "threshold_change", "delete"})
REVIEW_ACTIONS = frozenset({"verify_concern", "dismiss", "whitelist", "disarm", "threshold_change", "delete"})


@dataclass(frozen=True)
class DecisionReceipt:
    accepted: bool
    resulting_state: str
    evidence_event: dict[str, Any]


def _refused(
    *, operator_id: str, action: str, reason: str, tenant: str, target_id: str, detail: str
) -> DecisionReceipt:
    return DecisionReceipt(
        accepted=False,
        resulting_state="watch_candidate",
        evidence_event={
            "action": "human_verify_refused",
            "actor_id": operator_id,
            "target_type": "subject" if target_id.startswith("sim_subject_") else "entity",
            "target_id": target_id,
            "details": {"requested_action": action, "reason": reason, "detail": detail},
            "tenant": tenant,
        },
    )


def human_verify(
    *,
    current_state: str,
    action: str,
    operator_id: str,
    reason: str,
    signature: str,
    tenant: str,
    target_id: str,
    co_signature: Optional[str] = None,
) -> DecisionReceipt:
    """Apply one named human review action and return its evidence receipt.

    ``verify_concern`` is the one human-authenticated path that sets
    ``flagged``. No machine path assigns that state; this function requires a
    named operator and signature.
    """

    if action == "flag":
        raise ValueError("unsupported action: use verify_concern")
    if action not in REVIEW_ACTIONS:
        raise ValueError(f"unsupported action: {action}")
    if current_state != "watch_candidate":
        return _refused(
            operator_id=operator_id,
            action=action,
            reason=reason,
            tenant=tenant,
            target_id=target_id,
            detail="only watch_candidate records may be reviewed",
        )
    if not operator_id or not reason or not signature:
        raise ValueError("operator_id, reason and signature are required")

    if action in DESTRUCTIVE_ACTIONS:
        if not co_signature or ":" not in co_signature:
            return _refused(
                operator_id=operator_id,
                action=action,
                reason=reason,
                tenant=tenant,
                target_id=target_id,
                detail="two distinct signatures are required",
            )
        co_operator_id, co_sig = co_signature.split(":", 1)
        if not co_operator_id or not co_sig or co_operator_id == operator_id:
            return _refused(
                operator_id=operator_id,
                action=action,
                reason=reason,
                tenant=tenant,
                target_id=target_id,
                detail="signatures must belong to two distinct operators",
            )
    else:
        co_operator_id = None

    resulting_state = {
        "verify_concern": "flagged",
        "dismiss": "dismissed",
        "whitelist": "whitelisted",
        "disarm": "watch_candidate",
        "threshold_change": "watch_candidate",
        "delete": "watch_candidate",
    }[action]
    return DecisionReceipt(
        accepted=True,
        resulting_state=resulting_state,
        evidence_event={
            "action": "human_verify_accepted",
            "actor_id": operator_id,
            "target_type": "subject" if target_id.startswith("sim_subject_") else "entity",
            "target_id": target_id,
            "details": {"requested_action": action, "reason": reason},
            "tenant": tenant,
            "co_actor_id": co_operator_id,
        },
    )
def retain_consented_match(embedding, *, enrolled_embeddings):
    """Return a consented match marker; non-matches are discarded by default."""
    if embedding is None:
        return None
    return embedding if any(embedding == candidate for candidate in enrolled_embeddings) else None
