# shared/ — superseded by contracts/

**This directory's original plan — a single `shared/contract.ts` — was superseded on
2026-09-15 by `contracts/events.schema.json` and `contracts/openapi.yaml`, built and
tested under WBS 3.1 / gap G14.** `docs/OVERLAPS.md` already named `contracts/` as the
shared surface before this directory was scaffolded; the frozen contract now lives
there, not here. This file is kept, not deleted, so nobody re-reserves `contract.ts`
believing the port is still pending.

**FROZEN. Changing the contract requires sign-off from both leads and an ADR entry**
(`docs/HANDOVER.md` §8, `docs/00-SPEC.md` §4) — that rule did not change, only the
file layout did.

## Why this file is frozen, specifically

The predecessor project's own build log records a real bug caused by exactly this
kind of drift: a dashboard app's local synced copy of the contract had a type
(`IncidentDetail`) that the canonical contract was silently missing, despite that
file's own header claiming byte-identical parity. Silent drift, caught by nothing.
That incident is why "frozen" here means what it says — a locally-synced copy in
`dashboard/` or elsewhere must be checked against `contracts/`, not assumed identical.

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

See `contracts/openapi.yaml` for the versioned, machine-readable form of this surface
and `contracts/events.schema.json` for the event envelope. Both are implementation-
proposed pending Lethabo's review and a versioned ADR (`docs/BUILD-LOG.md`, WBS 3.1).

## Non-negotiable

- **Contract tests assert exact request/response shapes, not status codes** (`RULES.md`).
  See `test/events-contract.test.mjs`.
- The state-machine table (`observed` / `watch_candidate` / `flagged` / `dismissed` /
  `whitelisted`, and who may set each) lives alongside the contract and is equally
  frozen — see `docs/00-SPEC.md` §4.3. No code path may set `flagged`.
