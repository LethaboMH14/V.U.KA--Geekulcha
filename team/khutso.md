# Khutso Mothopa

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Khutso Mothopa. Wits. Requirements, WBS, traceability, verification mapping. **I am the team's memory** — I own `docs/EVIDENCE.md`, `docs/MASTER-CONTEXT.md` and `docs/CHECKLIST.md`, and nobody else edits them without telling me.

**Reviewed by** — Sibusiso, then both leads.

**Effort** — **High.** Accuracy beats speed every time.

**Behaviour** — *I am the team's memory — accuracy beats speed every time. Never let me record a number without its command, method and sample size. Push back hard if I am about to write something that cannot be reproduced.*

**My domain rules**
- I own `docs/EVIDENCE.md`, `docs/MASTER-CONTEXT.md`, `docs/CHECKLIST.md`. Nowhere else records these.
- **A historical count is not a current result.**
- **318 ms always travels with n = 10.** Every measured figure carries method, configuration and sample size, or it is not a measurement.
- **If it cannot be reproduced, it does not ship.**
- When the real judging criteria publish, I refresh `docs/MASTER-CONTEXT.md` and re-tag `docs/CHECKLIST.md` the same day — that is the mechanism that stops the team optimising for the old four.

**Current task** — `docs/MASTER-CONTEXT.md` and `docs/CHECKLIST.md` are created; keep both current as items close. P1.1's repository-controlled surfaces are corrected (merged via PR #35) and its external public-profile portion remains blocked pending owner confirmation. P2.16's proposed ownership and evidence boundary are coordinated without calling the contract frozen. Next: resolve "440 tests" vs 510 test-function definitions with a real collected count or retire the claim (`P1.3`).

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: nothing enters `docs/EVIDENCE.md` without a command or source I have personally checked.

---

- University / role: Wits / System analyst
- Owns outright: Requirements, WBS, traceability, verification mapping, docs.
- Reviews only: Acceptance evidence across all layers.
- Lead / escalation: Sibusiso, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: P1.1 partial/blocked; repository-controlled surfaces are corrected (merged via PR #35), but the external public-profile update is unverified. WBS 1.4 is done with intake gate approved and both lead approvals recorded in `docs/security/intake-gate.json`. P2.16 coordination in progress with the ownership/evidence split recorded, while contract freeze remains pending consumer confirmation and Sibusiso's second-lead evidence. P1.3 follows closure; P1.2 remains a shared Khutso/Babatunde check.
- Claimed files / contract versions: `team/khutso.md` (role self-review) and `docs/BUILD-LOG.md` (append-only review record); no contract version change.
- Last updated: 12 September 2026 by Codex assistant as a planning assignment.

## Sequenced work

All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 14 | 1.4 | 3 | Assemble clean-intake gate evidence | 1.1,1.2,1.3 | Both leads sign actual evidence or feature intake stays blocked |
| Sep 14 | 2.1 | 3 | Map requirements to five journeys | none | Each requirement has owner, screen and observable acceptance |
| Sep 19 | 3.5 | 4 | Reproduce evidence and resolve TRL wording | 3.2,3.3,3.4 | Record command/config/result; absent evidence stays unverified |
| Sep 23 | 6.4 | 4 | Assemble submission/evidence index | 5.4,6.1,6.3 | All links resolve; no absent artefact presented as delivered |
| Sep 25 | 7.1 | 3 | Verify venue copy and judging checklist | 6.5 | Known-good package hash and earlier Sunday deadline visible |

## Interfaces

- Inputs: Roster/criteria from Lethabo; actual test results from builders.
- Outputs: Acceptance map and evidence index to everyone.
- See docs/OVERLAPS.md; do not silently change a shared version.

## P1.1 task declaration — 2026-09-16

Criterion: **C2 (innovation and creativity) and C3 (progress of solution profile)**. Trust answer: a real user can trust the market context only when the comparison uses like-for-like measures, carries its source and date, and has no stale live claim left in a judge-facing surface.

Bounded work: replace the stale private-security-versus-police comparison in `docs/08-BUSINESS.md` and `docs/LEAN-CANVAS.md`; do not rewrite historical evidence, task descriptions or the dead-number warning that explicitly records the correction. Update the P1.1 checklist state and append the exact sweep to `docs/BUILD-LOG.md`. No contract, security, or product code is in scope.

Acceptance evidence: `docs/EVIDENCE.md` remains the checked source for **~637,675 active private-security officers (31 March 2025)** and **155,231 sworn / 187,681 total SAPS personnel (March 2025)**, with derived **≈4:1** ratio; a tracked-file sweep lists only intentionally retained historical/task references; `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs` and `git diff --check` pass. Sibusiso reviews first, followed by both leads.

Blockers: the public-profile paste target is not editable from this repository; `docs/SONKE-OVERVIEW.md` is already corrected. Any external Sonke update remains a handoff, not an invented completion claim.

## P1.1 repository portion — 2026-09-16

Outcome: the two current judge-facing stale claims were corrected in `docs/08-BUSINESS.md` and `docs/LEAN-CANVAS.md` using the checked figures and provenance in `docs/EVIDENCE.md`. The sweep intentionally retains historical/task references in `docs/EVIDENCE.md`, `docs/PLAN.md`, `docs/BUILD-LOG.md`, `docs/MASTER-CONTEXT.md`, `docs/CHECKLIST.md`, `team/babatunde.md` and the archived submission, because rewriting those would destroy the correction trail or task definition. P1.1 remains partial until the external public-profile update is confirmed by its owner.
## P2.16 coordination declaration — 2026-09-16

Criterion: **C3 (progress of solution profile)**, with C2/C4 protected by keeping the contract boundary explicit. Trust answer: a real user can trust this coordination only if the proposed ownership split is visible, the consumer gate remains blocked until its evidence exists, and no envelope-only producer is described as live ingest.

Bounded work: coordinate the P2.16 follow-up only. Intended shared-file edits: `docs/OVERLAPS.md`, `docs/CHECKLIST.md`, and `docs/BUILD-LOG.md`. No contract schema or production code is in scope. Acceptance evidence: the P2.16 row and `docs/CONTRACT-APPROVAL-RECORD.md` continue to show the contract as not frozen; the ownership split names Vukosi for future synthetic `SightingEvent` payload emission, Sibusiso for server-consumer confirmation, and Khutso for the evidence/checklist record; document, intake and whitespace checks pass.

Blockers: the consumer-confirmation checkbox remains unchecked because `appliance/agent.py` emits only the transport envelope; Sibusiso's second-lead approval is also pending. This acknowledgement is recorded by the Codex assistant at Khutso's request and is not a human signature, contract approval, or claim that P2.16 is complete. Sibusiso remains first reviewer, followed by both leads.


## Changed this session

2026-09-15 — Codex assistant, acting at Khutso Mothopa's request, prepared this role review on `docs/khutso-role-feedback`. WBS 1.4 is complete based on the approved intake gate and recorded lead approvals; the remaining four sequenced leaves are not marked complete. The PR records feedback and coordination only.

## Role review and self-feedback — 2026-09-15

### What is working

- The memory-owner boundary is useful: `docs/MASTER-CONTEXT.md`, `docs/CHECKLIST.md`, and `docs/EVIDENCE.md` make criteria, claims, and provenance visible to the rest of the team.
- The evidence discipline is doing its job. It preserved the forecast failure, the historical latency caveat (`n = 10`), the 510 test-function-definition count, and the distinction between predecessor work and this clean checkout.
- The WBS and checklist give reviewers concrete acceptance evidence rather than activity descriptions. The strongest remaining contribution is keeping those records honest as implementation arrives.

### What I need to improve

- P1.1, P1.2, and P1.3 remain open while stale market, anchoring, ADR, test-count, and TRL claims still appear in current documents or the deck generator. I must not mark any of them done until each replacement has a personally checked command or source and an exact sweep result.
- WBS 1.4 is complete: the intake gate is approved and both lead approvals are recorded in `docs/security/intake-gate.json`. P1.1 remains the next bounded evidence activity; the remaining four sequenced WBS leaves stay proposed/not started until their own dependencies and acceptance evidence are confirmed.
- My acceptance role depends on inputs I do not own: remediation receipts from the account owners, reproducible predecessor test/TRL evidence from Sibusiso, and contract/privacy decisions from the relevant owners. I should record those as blockers, not infer completion from a green document check.

### Feedback to the team

Please route evidence requests through the named owner and require the command, configuration, sample size, and source before a figure enters a judge-facing artefact. Treat “not measured” and “historical, not reproduced here” as valid statuses. Send contract changes through `docs/OVERLAPS.md`; I will review the OpenAPI, retention/subject-rights, and evidence surfaces after the owners propose a versioned diff. Sibusiso is the first reviewer for this work, followed by both leads.

### Status and boundary

This is a role review, not evidence that a product capability is complete. WBS 1.4 is complete from the recorded intake-gate evidence; availability remains unconfirmed and the remaining four sequenced WBS leaves remain proposed/not started. No approval is inferred beyond the recorded gate. The work serves C3 by making the acceptance state and blockers checkable; a real user should trust the project only when its claims remain reproducible under this scrutiny.

## Needs and blockers

- Original criteria absent → Lethabo.
- unrepeatable measurement → Sibusiso.
- owner availability unknown → both leads rebalance.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Meeting decision receipts.
- release-file/link inventory.
- rehearsal timekeeping and unresolved-question log.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
