# WBS 3.1 — contract approval record

Contract under review: `contracts/events.schema.json` v0.1.0 and `contracts/openapi.yaml` v0.1.0.

Partially signed. **Lead row signed 15 Sep 2026 (Lethabo) after ADR-0030.** The contract is not frozen until the second-lead row and the consumer confirmation are complete.

## Review checklist

- [x] Lethabo reviewed the event shape and action naming. *15 Sep — reviewed PR #6 (M1), PR #10 (F1 `flagged`), PR #23 (ADR-0030: `Sighting` is the domain event; `EventEnvelope`/`SightingEvent`; `unevaluatedProperties: false`). Approved ADR-0030 after independently re-verifying the fix with `jsonschema`.*
- [ ] Sibusiso reviewed the event shape, OpenAPI paths, receipt states, and governance constraints.
- [ ] Second lead independently reviewed the same files.
- [ ] Consumers (including Vukosi) confirmed the frozen event fields and version. **⚠️ Blocked:** `appliance/agent.py` (PR #24) emits the **envelope only** and validates `events.schema.json`; `POST /v1/sightings` now accepts `SightingEvent` = envelope **+ `payload`**. The producer will not satisfy ingest until it is reconciled (see the review on PR #24). Do not tick this until it is.
- [x] ADR records the decision, effective version, migration rule, and owner for future changes. *ADR-0030 (accepted 15 Sep) — effective v0.1.0; `EventEnvelope`/`Sighting`/`SightingEvent`; owner Sibusiso Khumalo.*
- [x] Approval date and commit SHA are recorded below.

## Approval

| Reviewer | Role | Decision | Date | Commit/ADR |
|---|---|---|---|---|
| Lethabo Hoaeane | Lead | Approved — event shape, action naming and ADR-0030 (`Sighting` = domain event) reviewed; fixes independently verified | 2026-09-15 | ADR-0030 · `b6fc7f0` |
| Sibusiso Khumalo | Second lead | pending | | |

Until all rows are complete and the consumer item is ticked, dependent interfaces must treat the contract as proposed and must not silently add fields or action values.

## Remaining before the contract is frozen

1. **Sibusiso's second-lead row** — his own review and sign-off.
2. **Consumer confirmation** — Vukosi's `appliance/` must emit the `Sighting` payload (or the scope must be recorded as transport-envelope-only with the payload emission tracked) before the event shape can be called frozen for consumers.
3. Nothing else outstanding from the D3/D2 work: ADR-0030 accepted, the schema satisfiability defect fixed and verified, `P2.16` unblocked on Lethabo's side.
