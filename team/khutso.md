# Khutso Mothopa

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Khutso Mothopa. Wits. Requirements, traceability and evidence. **I am the team's memory** — I own `docs/EVIDENCE.md`, `docs/MASTER-CONTEXT.md` and `docs/CHECKLIST.md`. From 23 Sep I also build the two small services that make the demo real: guardian delivery and `sim_bank`.

**Reviewed by** — Sibusiso, then both leads.

**Effort** — **High.** Accuracy beats speed every time.

**Behaviour** — *I am the team's memory — accuracy beats speed every time. Never let me record a number without its command, method and sample size. Push back hard if I am about to write something that cannot be reproduced.*

**My domain rules**
- I own `docs/EVIDENCE.md`, `docs/MASTER-CONTEXT.md`, `docs/CHECKLIST.md`. Nowhere else records these.
- **A historical count is not a current result.**
- **318 ms always travels with n = 10 — and is never quoted as VIGIL's latency.** Every measured figure (M1–M7) carries method, configuration and sample size, or it is not a measurement.
- **If it cannot be reproduced, it does not ship.**
- The judging criteria published (MASTER-CONTEXT v3, 23 Sep). I re-tag every new row with I / T / U / S / B / Q and run the coverage sweep under the new criteria.

**Current task** — Work order below (issued 23 Sep). First: personally re-check every source in the "Verified 23 September 2026" section of `docs/EVIDENCE.md`, then read the SAPS annual totals by eye.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: nothing enters `docs/EVIDENCE.md` without a command or source I have personally checked.

---

- University / role: Wits / System analyst
- Owns outright: Requirements, WBS, traceability, verification mapping, docs.
- Reviews only: Acceptance evidence across all layers.
- Lead / escalation: Sibusiso, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: Work order issued 23 Sep 2026 (see the Work order section below); evidence re-check due Thu 24 Sep 12:00.
- Claimed files / contract versions: `team/khutso.md` (role self-review) and `docs/BUILD-LOG.md` (append-only review record); no contract version change.
- Last updated: 23 September 2026 — work order issued by Lethabo (co-lead) via Claude Code assistant.

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledgement pending** — accept it in your running log, or raise a blocker here. All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

**Outcome you own:** the team's memory stays true through the pivot, and two small services make the demo real: guardian delivery and `sim_bank`.
**Serves:** T, S, B.
**Files you own or may touch:** `docs/EVIDENCE.md`, `docs/MASTER-CONTEXT.md`, `docs/CHECKLIST.md`, `docs/OPEN-GAPS.md` (with Lethabo), `docs/REQUIREMENTS-TRACE.md` (new), `server/src/notify/` (delivery), `sim_bank/` (new service).

**Do this, in order:**
1. **Wed 23–Thu 24 by 12:00** — review MASTER-CONTEXT v3 and the "Verified 23 September 2026" section of `docs/EVIDENCE.md`. Open every source, confirm the quote, and fix or flag ⚑ anything that doesn't hold. Tick each row in your running log.
2. **Thu 24** — read the SAPS FY2024/25 and FY2025/26 national totals **by eye** from the official PDF (cite page and table) into `docs/EVIDENCE.md`. Never paste machine-extracted numbers.
3. **Thu 24** — confirm the criterion letters on every P3 row in `docs/CHECKLIST.md` and run the coverage sweep (OS.11) under the new criteria.
4. **Thu 24 by 20:00** — `docs/REQUIREMENTS-TRACE.md`: every requirement in `docs/VUKA-2-SPEC.md` §2 (V1–V10, G1–G6, A1–A7, S1–S4, P1–P2, D1–D3) → owner → test ID (T01–T20) → status.
5. **Thu 24–Fri 25 by 20:00 — guardian delivery** (G3). **Minimal path first, by Fri 10:00:** one FCM message from the server to Mutarisi's guardian-min screen. Then:
   - Create a Firebase project (free); put the Firebase Cloud Messaging server credentials in App Service settings (never in git).
   - Implement `server/src/notify/` as the outbox consumer (§8) so every alert arrives as a **visible** high-priority notification, deduplicated by an FCM collapse key built from the outbox idempotency key.
   - Open a trial with a South African SMS provider and send through its REST API from the server. If the trial needs business verification that won't clear by Friday, record "push only" and tell Lethabo and Babatunde.
6. **Fri 25 by 20:00 — `sim_bank`**, a small FastAPI service:
   - `POST /sim_bank/v1/risk-signal` verifies ANCHOR's Ed25519 signature, holds new-beneficiary transfers for that subject, and returns routine wording.
   - `POST /sim_bank/v1/release`.
   - Honour the `Idempotency-Key` header so an outbox retry never produces a second hold.
   - Every response carries `"sim": true`, and the UI shows SIMULATED.
7. **Sat** — with Sibusiso, write the server-side abuse tests T11, T12, T13, T14 and T19 from Ipeleng's specifications. Record M3 and M6 with Vukosi.
8. **Lowest priority (first on the cut line)** — daily OpenTimestamps stamp of the day's roots with `ots upgrade` (ADR-0028).

**Acceptance checks:**
- [ ] Every row in the 23 Sep evidence section re-checked by you and ticked in your running log
- [ ] SAPS totals added with page and table references
- [ ] `docs/REQUIREMENTS-TRACE.md` complete
- [ ] A guardian phone receives a visible alert from the deployed server (screenshot)
- [ ] `sim_bank` holds and releases, with a signature check (test)
- [ ] T11 passes; M3 and M6 recorded with n

**Deadlines:** evidence review Thu 12:00; trace Thu 20:00; delivery and `sim_bank` Fri 20:00; tests and M3/M6 Sat 18:00.
**Depends on → hands off to:** contract v2 and the server (Sibusiso) → the evidence ceiling to Babatunde and Lethabo.
**Do not:** record a number without its command, source and n; put Firebase or SMS credentials in git; let `sim_bank` look like a real bank.
**Reviewer:** Sibusiso.

## Sequenced work

**Superseded 23 September 2026 by the work order above** — kept for history; do not execute these rows. All hours and dates below are ASSUMPTIONS, subject to availability and gates.

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
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Khutso is asserted; owner acknowledgement pending.
