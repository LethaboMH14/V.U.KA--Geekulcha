"""GET /v1/subjects/{id}/record — the F14 showcase route.

Framework-agnostic handler. server/ has no FastAPI app scaffold or pinned
dependency file yet (no server/requirements.txt exists in this checkout), so
this does not import fastapi — introducing an unpinned dependency isn't this
task's call to make. `handle_get_subject_record` takes plain arguments and
returns a plain dict matching the frozen SubjectRecord schema exactly; wiring
it to a real HTTP route is a one-line call once the app scaffold exists:

    from server.src.api.subjects import handle_get_subject_record

    @app.get("/v1/subjects/{id}/record")
    def get_subject_record(id: str, authorization: str = Header(...)):
        result = handle_get_subject_record(
            subject_id=id, bearer_token=authorization, chain=CHAIN_STORE.all(),
        )
        if result["status"] == 401:
            raise HTTPException(401, result["body"])
        ...
        return result["body"]

sim_ fixture data below reuses the exact Musa scenario already canonical
across docs/ANCHOR-RATIONALE.md, the Figma "My Record" screen, and the
showcase description in docs/MASTER-CONTEXT.md — same story, same numbers,
everywhere it appears in this repo.
"""

from __future__ import annotations

from typing import Any, Optional

from anchor.chain import EvidenceEntry, append_entry
from anchor.subject import get_subject_record


def _authorised(bearer_token: Optional[str], subject_id: str) -> bool:
    """PLACEHOLDER auth boundary — no real bearer-token issuance or
    verification system exists anywhere in this repo yet. This function
    exists so the 401 path is exercised and tested, not to be trusted as a
    real security boundary. Replace when server/src/auth/ has a real
    token-verification module; do not ship this placeholder as-is."""
    return bool(bearer_token) and bearer_token.startswith("sim_bearer_")


def handle_get_subject_record(
    *, subject_id: str, bearer_token: Optional[str], chain: list[EvidenceEntry]
) -> dict[str, Any]:
    """Returns {"status": <int>, "body": <dict>} — status matches the frozen
    contract's declared response codes (200/401/404). 403 (InsufficientApproval)
    is not reachable from this handler alone; it belongs to the rights-review
    step this module does not implement."""
    if not _authorised(bearer_token, subject_id):
        return {"status": 401, "body": {"error": "unauthorized", "detail": "missing or invalid bearer token"}}

    record = get_subject_record(chain, subject_id)
    if not record["entries"]:
        return {"status": 404, "body": {"error": "not_found", "detail": f"no record for subject_id {subject_id!r}"}}

    return {"status": 200, "body": record}


def build_sim_musa_chain() -> list[EvidenceEntry]:
    """The canonical Musa scenario (docs/ANCHOR-RATIONALE.md Scenario 3),
    as a chain — sim_ fixture, not live ingest. Every id and detail here
    matches what's already published in the Figma "My Record" screen and
    docs/MASTER-CONTEXT.md's showcase description, so a demo walkthrough is
    consistent across every artefact a judge might look at."""
    chain: list[EvidenceEntry] = []
    chain = append_entry(
        chain,
        action="watch_candidate_proposed",
        actor_id="sim_system",
        target_type="entity",
        target_id="sim_subject_musa_ent7f3a",
        details={"factor": "F1 recurrence", "sightings": 4, "cameras": 2, "window_days": 11},
        ts="2026-09-16T16:04:00Z",
    )
    chain = append_entry(
        chain,
        action="human_verify_accepted",
        actor_id="op_A41",
        target_type="entity",
        target_id="sim_subject_musa_ent7f3a",
        details={"requested_action": "dismiss", "reason": "recognised delivery route"},
        ts="2026-09-16T16:22:00Z",
    )
    chain = append_entry(
        chain,
        action="human_verify_accepted",
        actor_id="op_A41",
        target_type="entity",
        target_id="sim_subject_musa_ent7f3a",
        details={"requested_action": "whitelist"},
        ts="2026-09-16T16:22:00Z",
    )
    return chain
