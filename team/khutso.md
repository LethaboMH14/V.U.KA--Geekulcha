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

**Current task** — P3.K3's requirements trace merged to `main` in PR #63, but its acceptance record is not closed: Sibusiso approved an earlier head, Lethabo approved the merged head, and the A5 wording correction is merged in PR #70. Reconcile the final-head first-review requirement and A5 trace wording before ticking P3.K3. P3.K1 corrections are on `main`; P3.K2's separate status must be checked before claiming completion.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: nothing enters `docs/EVIDENCE.md` without a command or source I have personally checked.

---

- University / role: Wits / System analyst
- Owns outright: Requirements, WBS, traceability, verification mapping, docs.
- Reviews only: Acceptance evidence across all layers.
- Lead / escalation: Sibusiso, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: P3.K3 trace merged in PR #63 on 24 Sep 2026; final-head Sibusiso acceptance and seventeen complete-behaviour test gaps remain open; PR #70 A5 wording correction is merged. The Thu 24 Sep 20:00 date is the work-order schedule, not proof of completion.
- Claimed files / contract versions: `docs/EVIDENCE.md` for P3.K1/P3.K2; `team/khutso.md`, `docs/CHECKLIST.md` P3.K3 status note, and a new `docs/build-log/entries/` record for this reconciliation. No contract version change or checklist tick.
- Last updated: 25 September 2026 — Codex assistant, at Khutso's request, reconciled current PR evidence and task records. No personal source confirmation or reviewer approval is inferred.

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledged the work order for workflow setup on 23 Sep; this is not acceptance of unverified claims or completion of any row.** All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

**Outcome you own:** the team's memory stays true through the pivot, and two small services make the demo real: guardian delivery and `sim_bank`.
**Serves:** T, S, B.
**Files you own or may touch:** `docs/EVIDENCE.md`, `docs/MASTER-CONTEXT.md`, `docs/CHECKLIST.md`, `docs/OPEN-GAPS.md` (with Lethabo), `docs/REQUIREMENTS-TRACE.md` (new), `server/src/notify/` (delivery), `sim_bank/` (new service).

**Do this, in order:**
1. **Wed 23–Thu 24 by 12:00** — review MASTER-CONTEXT v3 and the "Verified 23 September 2026" section of `docs/EVIDENCE.md`. Open every source, confirm the quote, and fix or flag ⚑ anything that doesn't hold. Tick each row in your running log.
2. **Thu 24** — read the SAPS FY2024/25 and FY2025/26 national totals **by eye** from the official PDF (cite page and table) into `docs/EVIDENCE.md`. Never paste machine-extracted numbers.
3. **Thu 24** — confirm the criterion letters on every P3 row in `docs/CHECKLIST.md` and run the coverage sweep (OS.11) under the new criteria.
4. **Thu 24 by 20:00** — `docs/REQUIREMENTS-TRACE.md`: every requirement in `docs/VUKA-2-SPEC.md` §2 (V1–V10, G1–G6, A1–A7, S1–S4, P1–P2, D1–D3) → owner → test ID (T01–T24) → status. Owners for the newer tests: **T16** Vukosi (app) with Sibusiso (server); **T21** Sibusiso (vectors) with Ipeleng (verify); **T22** Ipeleng (verify page); **T23** and **T24** Sibusiso.
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
- 2026-09-23 — Codex assistant rechecked the PR #47 follow-up and found the Federal Register citation targeted the wrong document number; corrected it to NIST's linked notice 2024-17956 and recorded the source wording. Removed the secondary SABRIC incident and app-share figures from the `MASTER-CONTEXT.md` headline row while retaining their explicit caveat in `EVIDENCE.md`. This is a review correction, not Khutso's personal source confirmation or reviewer acceptance.
- 2026-09-24 — Codex assistant, at Khutso's request, re-critiqued P3.K1 and corrected secondary-source flags, smartphone-duty valuation basis, UK APP policy scope and source, and the crime-displacement paper's observation count and limitations on PR #47. The new build-log entry names the later corrections and points to live P3.K2 PR #54. Khutso's row-by-row personal confirmation and reviewer acceptance remain pending; P3.K1 is not complete.
- 2026-09-24 — Codex assistant, acting at Khutso's request, drafted `docs/REQUIREMENTS-TRACE.md` from VUKA-2 §2/§15 and the current P3 owners. The trace covers all 32 requirements, uses current T21–T24 tests where applicable, exposes requirements without dedicated tests, and records the work-order T01–T20 range mismatch. P3.K3 remains pending Sibusiso and both-lead review; no checklist row is ticked.
- 2026-09-24 — Codex assistant, at Khutso's request, answered Sibusiso's PR #63 review by auditing each test against its literal §15 oracle. Seventeen requirement rows lack a direct test for their defining behavior, and the remaining rows state any partial clause coverage. The earlier 11-gap count was too narrow; the dated correction is in `docs/build-log/entries/2026-09-24-codex-khutso-p3-k3-test-scope-correction.md`. Re-review is pending; P3.K3 remains open.
- 2026-09-24 — Codex assistant, at Khutso's request, merged current `main` into PR #63's branch without rewriting its history and re-checked the P3.K3 trace against ADR-0041's T30, T47 and T50–T52. The trace now flags the §2 A5 versus §9 member-device export scope conflict for Sibusiso, Ipeleng and both leads; no contract decision or test pass is inferred. Review of the updated head is required before P3.K3 can close.
- 2026-09-24 — Codex assistant, at Khutso's request, verified PR #63 merged as `ea6d7b5` with passing checks. Sibusiso approved `f209422`, not the final `2b3657f` head; Lethabo approved `2b3657f` and recorded A5 as an intended ADR-0041 exception, with the wording fix in open PR #70. The checklist remains unticked pending a recorded disposition of final-head first review and an A5 trace follow-up. This corrects task status, not the accepted contract.
