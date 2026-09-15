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

**Current task** — `docs/MASTER-CONTEXT.md` and `docs/CHECKLIST.md` are created; keep both current as items close. Next: correct the 2.7m stat everywhere it appears (`P1.1`), then resolve "440 tests" vs 510 test-function definitions with a real collected count or retire the claim.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: nothing enters `docs/EVIDENCE.md` without a command or source I have personally checked.

---

- University / role: Wits / System analyst
- Owns outright: Requirements, WBS, traceability, verification mapping, docs.
- Reviews only: Acceptance evidence across all layers.
- Lead / escalation: Sibusiso, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: 1.4, done; intake gate approved with both lead approvals recorded in `docs/security/intake-gate.json`.
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
