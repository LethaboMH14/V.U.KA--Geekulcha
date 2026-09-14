# shared/ — the frozen contract

`contract.ts` — the single source of truth for every request/response shape crossing
a layer boundary. **FROZEN. Changing it requires sign-off from both leads and an ADR
entry** (`docs/HANDOVER.md` §8, `docs/00-SPEC.md` §4).

**Does not exist yet.** It is the first thing ported (`docs/HANDOVER.md` Task 4 —
port order is `shared/contract.ts` → `brain/` → `server/` → `app/` → `appliance/` →
`data/` → `dashboard/`), precisely because everything else depends on it and nothing
should be built against a moving target.

## Why this file is frozen, specifically

The predecessor project's own build log records a real bug caused by exactly this:
a dashboard app's local synced copy of the contract had a type (`IncidentDetail`)
that the canonical `shared/contract.ts` was silently missing, despite that file's
own header claiming byte-identical parity. Silent drift, caught by nothing. That
incident is why "frozen" here means what it says — a locally-synced copy in
`dashboard/` or elsewhere must be checked against this file, not assumed identical.

## The frozen API surface (`docs/00-SPEC.md` §4.1, excerpt)

```
POST   /v1/sightings
GET    /v1/entities/{id}
POST   /v1/entities/{id}/verify        — flag/whitelist REQUIRE two signatures (F13)
GET    /v1/risk                        — 3-tier honest fallback
GET    /v1/hotspots
GET    /v1/safest-route                — member-facing, distinct from the patrol planner
POST   /v1/routes/patrol
GET    /v1/evidence/integrity
GET    /v1/anchor/latest               [NEW — anchor/]
GET    /v1/subjects/{id}/record        [NEW — anchor/, F14]
DELETE /v1/subjects/{id}/data          [NEW — anchor/, F15]
WS     /ws/ops
WS     /ws/member                      — MUST NEVER receive ops events
```

## Non-negotiable, before this file is created

- **Contract tests assert exact request/response shapes, not status codes** (`RULES.md`).
- The state-machine table (`observed` / `watch_candidate` / `flagged` / `dismissed` /
  `whitelisted`, and who may set each) lives alongside this contract and is equally
  frozen — see `docs/00-SPEC.md` §4.3.
