# server/ — UMOJA

**The street.** Cloud service, entity graph, risk layer. Satisfies F7, F8, F10, E1 (`docs/00-SPEC.md` §3.3).

**Empty scaffold.** No code lands here yet — see `docs/HANDOVER.md` Task 4 for port order (`shared/contract.ts` → `brain/` → `server/` → ...) and §1 for where the working version currently exists.

## Structure

```
src/
  api/          Frozen contract surface — docs/00-SPEC.md §4.1: sightings, entities,
                verify, risk, hotspots, safest-route, patrol, evidence/integrity
  ws/           /ws/ops and /ws/member rooms. The member socket must NEVER receive
                ops events — this is a contract test, not a convention
  suspicion/    entity_resolution · face_resolution · plate_text · scorer.
                Whitelist-before-watchlist: factor_f1_recurrence() returns False
                immediately for a whitelisted entity (F7) — this is the system's
                highest-value attack surface, per its own audit (docs/00-SPEC.md §3.3)
  risk/         3-tier honest fallback: real risk cell → claims fallback → no_data.
                Never blank, never invented (D8 in the wider architecture)
  routing/      OR-Tools patrol planner — DISTINCT from the member-facing safest-route
  db/           Migrations, evidence_integrity — the hash-chain verifier lives here
                or in anchor/chain.py depending on the Task 5 port decision
  auth/         Operator authentication
  middleware/   Rate limiting
  notify/       Email/notification dispatch
```

## Non-negotiable, before any code lands here

- **No code path may set `flagged`.** Machine ceiling is `watch_candidate`; only `human_verify()` with an operator ID may escalate (E1). The absence of any other path is the test — a reviewer greps for it.
- **Two-of-two signatures** on whitelist, camera disarm, threshold change, deletion (F13). A refused single-signature attempt is itself an anchored event, not a discarded error.
- **Contract tests assert exact request/response shapes**, not status codes (`RULES.md`).
- `POST /v1/sightings` requires a device signature. `GET /v1/risk` must degrade honestly, never silently, when a tier is unavailable.

## Budgets this directory is measured against

Detection → alert render p95 ≤ 2000 ms, **measured 318 ms (n = 10) in the predecessor codebase** (N1); dual-signature compliance 100% (contract test); false alerts ≤ 1/camera-week (N9).
