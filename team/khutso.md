# Khutso Mothopa

**Work order acknowledged for workflow setup on 23 September 2026; availability and AI model remain undeclared. No deliverable is complete without the acceptance evidence below and reviewer acceptance.**

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

**Current task** — P3.K1 review findings are resolved in the working tree by a Codex assistant acting at Khutso's request; Khutso's personal confirmation and Sibusiso's acceptance remain pending. P3.K2 is on the separate stacked PR #52.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: nothing enters `docs/EVIDENCE.md` without a command or source I have personally checked.

---

- University / role: Wits / System analyst
- Owns outright: Requirements, WBS, traceability, verification mapping, docs.
- Reviews only: Acceptance evidence across all layers.
- Lead / escalation: Sibusiso, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: P3.K1 review findings addressed on 23 Sep 2026; Khutso personal confirmation and Sibusiso review pending; due Thu 24 Sep 12:00 (`PROPOSED` schedule from the work order).
- Claimed files / contract versions: `docs/EVIDENCE.md` for P3.K1/P3.K2; `team/khutso.md`, `docs/OVERLAPS.md` and a new `docs/build-log/entries/` record for coordination; `docs/CHECKLIST.md` only after acceptance evidence exists. No contract version change.
- Last updated: 23 September 2026 — Khutso requested a pull, task realignment and workflow setup; Codex assistant configured the local workflow and recorded the bounded P3.K1 claim. No evidence row is asserted re-verified.

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledged the work order for workflow setup on 23 Sep; this is not acceptance of unverified claims or completion of any row.** All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

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

Replaced on 23 Sep 2026 by the work order above. The four-layer sequenced work, declarations and self-reviews are kept in [this file's history](../archive/2026-09-four-layer/team/khutso-history.md).

## Interfaces

See your work order's **Depends on → hands off to** line. Shared files are claimed in `docs/OVERLAPS.md`; never silently change a shared contract.

## Needs and blockers

- P3.K1/P3.K2: no known blocker at workflow setup. Any inaccessible or secondary-only source remains flagged rather than being inferred or silently upgraded.
- P3.K4/P3.K5 gate status needs reconciliation before implementation: `SECURITY.md` says the remediation gate is blocked, while `docs/security/intake-gate.json` says `approved` and `node scripts/check-intake.mjs` passes. Sibusiso and Ipeleng must confirm which standing record is current and correct the stale one; no approval is inferred by this workflow entry. P3.K1/P3.K2 may proceed.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every work-order item has its acceptance checks ticked with evidence, reviewer acceptance, the relevant checks passing, an honest built/specified/simulated status, this file and a `docs/build-log/entries/` file updated, and its `docs/CHECKLIST.md` P3 row ticked. Blocked tasks stay blocked; no approval is inferred from elapsed time.

## Outside-role work

None assigned for the build weekend. Agree any extra contribution with the leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Khutso is asserted; owner acknowledgement pending.
- 2026-09-23 — Khutso requested that the latest changes be pulled, his tasks realigned and his workflow set up. Codex assistant pulled `main` at `847225e`, configured `origin`, installed the repository-pinned Gitleaks 8.24.3 hook, verified GitHub CLI 2.101.0 is authenticated as `KhutsoMothopa`, and opened `docs/khutso-p3-k1-evidence-recheck`. P3.K1 source disposition is now recorded in `docs/build-log/entries/2026-09-23-codex-khutso-p3-k1-evidence-audit.md`; no checklist row is ticked and no review is inferred.
- 2026-09-23 — Codex assistant, acting at Khutso's request, resolved PR #47 review findings: secondary SABRIC and UK APP split details are flagged, ICB's inaccessible primary is flagged, FIPS 204 publication/effective dates are distinguished, the audit authorship/status is explicit, smartphone-duty wording is described as a clarification, and the unsupported OpenTimestamps observation is removed. Khutso confirmation and Sibusiso acceptance remain pending; no checklist row is ticked.
