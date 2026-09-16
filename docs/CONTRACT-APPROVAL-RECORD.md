# WBS 3.1 — contract approval record

Contract under review: `contracts/events.schema.json` v0.1.0 and `contracts/openapi.yaml` v0.1.0.

Both lead rows signed (Lethabo 15 Sep, Sibusiso 16 Sep). **The contract is not yet frozen** — the consumer-confirmation row remains open pending the envelope-vs-payload decision tracked against PR #24.

## Review checklist

- [x] Lethabo reviewed the event shape and action naming. *15 Sep — reviewed PR #6 (M1), PR #10 (F1 `flagged`), PR #23 (ADR-0030: `Sighting` is the domain event; `EventEnvelope`/`SightingEvent`; `unevaluatedProperties: false`). Approved ADR-0030 after independently re-verifying the fix with `jsonschema`.*
- [x] Sibusiso reviewed the event shape, OpenAPI paths, receipt states, and governance constraints. *16 Sep — contracts/events.schema.json and contracts/openapi.yaml checked against docs/00-SPEC.md; ADR-0030's EventEnvelope/Sighting/SightingEvent re-verified against the current schema with jsonschema's Draft202012Validator (the same check used to fix PR #23's F1, re-run against this state: valid instance passes, extra field rejected, missing payload rejected); governance.py's REVIEW_ACTIONS/DESTRUCTIVE_ACTIONS confirmed to match openapi.yaml's VerifyRequest.action enum exactly (verify_concern, dismiss, whitelist, disarm, threshold_change, delete — two signatures on the last four, no flag/flagged setter anywhere).*
- [x] Second lead independently reviewed the same files. *Same review as the row above — Sibusiso is the second lead; this row restates that fact and is kept rather than removed, since renumbering the checklist is out of scope for a sign-off commit.*
- [ ] Consumers (including Vukosi) confirmed the frozen event fields and version. **Still blocked, re-confirmed 16 Sep.** PR #24 (approved, mergeable) explicitly documents its scope as transport-envelope-only in appliance/README.md and team/vukosi.md — an honest boundary, not a bug — but it does not construct the SightingEvent payload POST /v1/sightings now requires. This is not the same as "confirmed": the scope is tracked as a known follow-up, owned jointly by Sibusiso/Khutso per PR #24's BUILD-LOG entry, not yet resolved. Do not tick until either the payload is emitted or this row is explicitly rewritten to accept envelope-only as the frozen consumer contract (a decision, not a default).
- [x] ADR records the decision, effective version, migration rule, and owner for future changes. *ADR-0030 (accepted 15 Sep) — effective v0.1.0; `EventEnvelope`/`Sighting`/`SightingEvent`; owner Sibusiso Khumalo.*
- [x] Approval date and commit SHA are recorded below.

## Approval

| Reviewer | Role | Decision | Date | Commit/ADR |
|---|---|---|---|---|
| Lethabo Hoaeane | Lead | Approved — event shape, action naming and ADR-0030 (`Sighting` = domain event) reviewed; fixes independently verified | 2026-09-15 | ADR-0030 · `b6fc7f0` |
| Sibusiso Khumalo | Second lead | Approved — event shape, OpenAPI paths, receipt states and governance constraints reviewed; ADR-0030 re-verified with jsonschema | 2026-09-16 | ADR-0030 · events.schema.json/openapi.yaml current state |

Until all rows are complete and the consumer item is ticked, dependent interfaces must treat the contract as proposed and must not silently add fields or action values.

## Remaining before the contract is frozen

1. ~~Sibusiso's second-lead row~~ — done 16 Sep.
2. **Consumer confirmation** — the only item left. Either Vukosi's `appliance/` emits the `Sighting` payload, or a lead decision explicitly accepts envelope-only as the frozen consumer contract (recorded as a decision, not left as a silent gap). Owned jointly by Sibusiso/Khutso per PR #24's BUILD-LOG entry.
3. Nothing else outstanding from the D3/D2 work: ADR-0030 accepted, the schema satisfiability defect fixed and verified, `P2.16` unblocked on both leads' side.
