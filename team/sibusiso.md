# Sibusiso Khumalo

**Owner confirmed identity on 13 September 2026. Current role and instructions are active.**

- University / role: Wits / Co-lead; backend developer
- Owns outright: Server, ledger, CI and demo orchestration.
- Reviews only: All PRs; first review for Vukosi and Khutso.
- Lead / escalation: Both leads for contract changes.
- AI tool / model: Codex / GPT-6 for the 13 September review session; update this line if a different tool is used later.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: WBS 3.3 governance boundary implemented with tests; WBS 3.1 contract remains proposed pending team review.
- Claimed files / contract versions: `contracts/openapi.yaml`, `contracts/events.schema.json`, team/START-HERE.md, SECURITY.md, BRIEF.md, docs/security/intake-gate.json and docs/BUILD-LOG.md; contract version 0.1.0 proposed, pending review.
- Last updated: 13 September 2026 during Sibusiso's review session.

## Sequenced work

All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 13 | 1.3 | 4 | Install and exercise local/CI scanning | none | Clean scan passes; synthetic leak and missing-tool checks fail closed |
| Sep 15 | 3.1 | 4 | Freeze event/API/governance contracts | 1.4 | Both leads and consumers approve versioned schemas |
| Sep 17 | 3.3 | 6 | Port and verify human gate and proof path | 1.4,3.1 | Nonauthor reproduces denial, two-signature and tamper checks |
| Sep 20 | 4.5 | 4 | Run integrated evidence checkpoint | 3.5,4.3,4.4 | Both leads record pass or cut scope; tag only tested snapshot |
| Sep 26 | 7.2 | 4 | Rehearse fallback and scoped hotfix procedure | 7.1 | Rollback works; no bypass of authority or review |

## Interfaces

- Inputs: Remediation evidence from Ipeleng/Lethabo; sensor contract from Vukosi.
- Outputs: Versioned API/events and proof export to Mutarisi/Vukosi/Khutso.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

Sibusiso requested and owns this review. Local security-hook tests, clean repository/history scans and PR #2's successful remote checks were reviewed. The intake gate records Sibusiso's approval with those evidence references; this branch contains the resulting corrections.

## Needs and blockers

- Collected predecessor test count remains unverified → owners must run both suites before repeating “440 tests”.
- cloud quota failure → use approved local rehearsal path.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Venue network rehearsal.
- independent proof-verifier instructions.
- release archive and rollback inventory.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster.
- 2026-09-13 — Sibusiso confirmed identity and requested full readiness/review. Reviewed Lethabo's PR #2 evidence, corrected the gate/calendar/role record and retained unresolved product work as explicitly assigned gaps.
- 2026-09-14 — WBS 1.3 completed in the review clone: `.githooks` is configured; `node scripts/check-docs.mjs` passed; `node scripts/test-security.mjs .tools/gitleaks.exe` passed all fixture checks, including synthetic leak rejection, staged-content protection and missing-scanner failure; `gitleaks dir` and `gitleaks git --log-opts="--all"` found no leaks; `node scripts/check-intake.mjs` passed. Next: WBS 3.1.
- 2026-09-14 — WBS 3.1 draft created: `contracts/openapi.yaml` v0.1.0 and `contracts/events.schema.json` define tenant scope, idempotency, signed ingestion, event timing/sequence, state transitions, two-signer requirements and WebSocket separation. Pending both-lead, Mutarisi, Vukosi and Khutso review; no endpoint implementation is claimed.
- 2026-09-14 — WBS 3.3 boundary implemented in `server/governance.py` with focused tests in `server/test_governance.py`. Tests cover operator identity/reason, machine ceiling, two distinct whitelist signers and terminal states. `python`/`py` is unavailable in this environment, so test execution is pending on a Python-enabled clone; document and intake checks pass.
- 2026-09-14 — Added `scripts/check-contracts.mjs` and wired it into CI. It validates the event envelope's required fields/types, all specified REST/WebSocket paths and tenant/idempotency/signing/governance/channel-isolation rules in `contracts/openapi.yaml`. Local contract, document and intake checks pass.
