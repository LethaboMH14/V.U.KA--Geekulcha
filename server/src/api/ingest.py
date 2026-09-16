"""Ingest-path embedding boundary — discard by default (P2.3).

Wires the boundary proposed in ``docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md`` into
the server's ingest path. A transient sensor embedding is compared only
against the consented enrolment set for the stated tenant and purpose:

* a valid match retains a match result plus its consent reference — never the
  embedding itself, which stays transient and is dropped when this call
  returns;
* every non-match is discarded in memory: no embedding, raw image or
  recoverable derivative reaches the persistence boundary;
* the audit event carries the decision shape only — no biometric payload.

Retained records carry a retention bound (G3): the final TTL is the data
layer's decision and may only be widened with a recorded ADR.

Port-time note (Lethabo, PR #27 review): for real embeddings — numpy arrays —
``==`` is element-wise and ``any()`` over the result is fragile and slow. Use
``np.array_equal`` or a cosine-similarity threshold with tolerance when the
comparison is ported to real vectors; the tuple/list content equality here is
the simulated-data stand-in.
"""

from dataclasses import dataclass
from typing import Any, Optional

from server.src.auth.governance import retain_consented_match

EMBEDDING_MATCH_RETENTION_SECONDS = 7 * 24 * 60 * 60  # 7 days


@dataclass(frozen=True)
class Enrolment:
    """One consented enrolment: who consented, on what evidence, for what.

    ``embedding`` is transient input for comparison only. It is never copied
    into any receipt field or evidence event.
    """

    resident_id: str
    consent_ref: str
    tenant: str
    purpose: str
    embedding: Any


@dataclass(frozen=True)
class EmbeddingReceipt:
    """The decision an ingest caller may persist, plus its audit event.

    ``persistence_record`` is the only thing the caller may write to the data
    layer; it never contains the embedding or a derivative. ``evidence_event``
    is the append-only audit record for the decision.
    """

    retained: bool
    persistence_record: dict[str, Any]
    evidence_event: dict[str, Any]


def _refused_empty(field_name: str) -> None:
    raise ValueError(f"{field_name} is required: a boundary decision must state its tenant and purpose")


def receive_sensor_embedding(
    *,
    embedding: Any,
    tenant: str,
    purpose: str,
    enrolments: list[Enrolment],
    observed_at: int,
) -> EmbeddingReceipt:
    """Apply the discard-by-default boundary to one transient sensor embedding.

    Compares ``embedding`` only against enrolments that match ``tenant`` and
    ``purpose`` — consent given for one context never unlocks another. Returns
    the receipt the caller may persist; a non-match persists no biometric data
    by construction, so the acceptance property "a non-match leaves no
    embedding in the persistence boundary" holds without caller discipline.
    """

    if not tenant or not isinstance(tenant, str):
        _refused_empty("tenant")
    if not purpose or not isinstance(purpose, str):
        _refused_empty("purpose")

    candidates = [e for e in enrolments if e.tenant == tenant and e.purpose == purpose]
    retained_embedding = retain_consented_match(embedding, enrolled_embeddings=[e.embedding for e in candidates])

    if retained_embedding is None:
        return EmbeddingReceipt(
            retained=False,
            persistence_record={
                "event_type": "embedding_discarded",
                "tenant": tenant,
                "purpose": purpose,
                "observed_at": observed_at,
            },
            evidence_event={
                "event_type": "embedding_discarded",
                "tenant": tenant,
                "purpose": purpose,
                "embedding_persisted": False,
            },
        )

    matched = [e for e in candidates if e.embedding == retained_embedding]
    if len(matched) != 1:
        raise ValueError(
            "ambiguous embedding match: the consent reference must be unambiguous, not invented"
        )

    enrolment = matched[0]
    return EmbeddingReceipt(
        retained=True,
        persistence_record={
            "event_type": "embedding_match",
            "resident_id": enrolment.resident_id,
            "consent_ref": enrolment.consent_ref,
            "tenant": tenant,
            "purpose": purpose,
            "observed_at": observed_at,
            "retention_expires_at": observed_at + EMBEDDING_MATCH_RETENTION_SECONDS,
        },
        evidence_event={
            "event_type": "embedding_match_recorded",
            "tenant": tenant,
            "purpose": purpose,
            "consent_ref": enrolment.consent_ref,
            "retention_seconds": EMBEDDING_MATCH_RETENTION_SECONDS,
            "embedding_persisted": False,
        },
    )