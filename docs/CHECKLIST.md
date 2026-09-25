# CHECKLIST — what we said we would do, ticked

> **Owner: Khutso Mothopa.** Anyone may tick their own row and propose new ones; Khutso keeps the file coherent.
>
> `docs/OPEN-GAPS.md` tracks what is *broken*. Each `team/<name>.md` work order (issued 23 Sep) tracks *assigned work*. **This file tracks what we committed to, whether it is done, and what changed since we said it.** Scope drift is visible here or it is invisible everywhere.

---

## The three rules of this file

1. **An item is never deleted.** It is ticked ☑, or marked dropped ⊘ **with a reason and a date**. A row that vanishes is a row nobody has to explain.
2. **An added item carries the date it was added and who asked for it.** Growth is fine. Silent growth is not.
3. **Every row carries a criterion tag.** From 23 Sep the tags are the published criteria — **I** innovation · **T** technical · **U** usability & design · **S** security & ethics · **B** business · **Q** quantum bonus (`docs/MASTER-CONTEXT.md` §2). Rows added before 23 Sep keep their C1–C4 tags as history.

**States:** ☐ open · ◐ in progress · ☑ done · ⊘ dropped · 🔒 blocked

---

## Phase 3 — VIGIL + ANCHOR build *(added 23 Sep 2026, Lethabo — ADR-0034 to ADR-0038; full steps in each work order)*

| # | Item | Owner | Criterion | Due (SAST) | State | Amended |
|---|---|---|---|---|---|---|
| P3.L1 | Pivot PR merged: ADR-0034–0038, `docs/VUKA-2-SPEC.md`, defence and economics docs, MASTER-CONTEXT v3, seven work orders | Lethabo | I, T, S | Sep 23 | ◐ | Added 23 Sep, Lethabo |
| P3.L2 | Organiser answer on building before Fri 16:00 on declared lineage | Lethabo | — | Sep 24 12:00 | ☑ | Added 23 Sep, Lethabo · **Confirmed 23 Sep: the organisers allow pre-event building (reply to Lethabo; not stored in the repo)** |
| P3.L3 | Figma pages: VIGIL, Guardian, ANCHOR panel + verify, archive of parked frames | Lethabo | U | Sep 24 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.L4 | Thin end-to-end slice: APK → server → chain → export → verify (D2) | Lethabo, Vukosi, Sibusiso, Ipeleng | T | Sep 25 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.L5 | `pre-hackathon-baseline` tag | Lethabo | — | Sep 25 16:00 | ☐ | Added 23 Sep, Lethabo |
| P3.L6 | Demo script, finale and video under 90 s | Lethabo | U, B | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.L7 | Final gate and submission | Lethabo, Babatunde | all | **Sep 27 09:00** | ☐ | Added 23 Sep, Lethabo |
| P3.A1 | Contract v2 + canonical and Merkle vectors + pinned mock server | Sibusiso | T | Sep 24 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.A2 | Hedera spike: testnet topic with `submitKey`, mirror-node read-back, runtime decision | Sibusiso | T, I | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.A3 | ANCHOR server: per-subject signed chains, auth, durable escalation, anchoring | Sibusiso | T, S | Sep 25 | ☐ | Added 23 Sep, Lethabo |
| P3.A4 | Deployed on Azure with CI (pytest + vitest vectors) | Sibusiso | T | Sep 25 23:59 | ☐ | Added 23 Sep, Lethabo |
| P3.A5 | Export + public proof (no chain segment in public) | Sibusiso | I, T | Sep 25 | ☐ | Added 23 Sep, Lethabo |
| P3.Q1 | Ed25519 + ML-DSA-65 root signing, keys published (cut line) | Sibusiso | Q | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.V1 | File-by-file port of the predecessor app + the four defect fixes | Vukosi | T | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.V2 | YAMNet by label, sha256 fetch, input shape asserted | Vukosi | T | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.V3 | Keystore signer, native salts, encrypted queue, heartbeats | Vukosi | T, S | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.V4 | **Signed release APK cold-installed from QR** + deny-each-permission test (D1, T17) | Vukosi | U, T | **Sep 24 22:00** | ☐ | Added 23 Sep, Lethabo |
| P3.V5 | Android CI job | Vukosi | T | Sep 25 | ☐ | Added 23 Sep, Lethabo |
| P3.V6 | Measurements M1–M5, M7 with n | Vukosi | T, B | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.U1 | UI foundation: NativeWind + Reusables + Reanimated, Plex type, Phosphor icons | Mutarisi | U | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.U2 | VIGIL screens (Start journey, Journey check, My Record first) | Mutarisi | U, S | Sep 25 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.U3 | Guardian mode ("Don't call or text them. Call 10111.") | Mutarisi | U, S | Sep 26 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.U4 | Panel + verify page layout | Mutarisi | U, I | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.K1 | Personal re-check of every 23 Sep evidence row | Khutso | all | Sep 24 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.K2 | SAPS FY2024/25 and FY2025/26 totals read by eye | Khutso | B | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.K3 | `docs/REQUIREMENTS-TRACE.md` (requirement → owner → test) | Khutso | T | Sep 24 20:00 | ☐ | Added 23 Sep, Lethabo · PR #63 merged 24 Sep as `ea6d7b5`, checks passed; Sibusiso approved earlier head `f209422`, Lethabo approved merged head `2b3657f`. PR #70's A5 wording correction is merged; final-head first-review disposition, seventeen complete-behaviour test gaps and acceptance evidence remain before the row can be ticked. |
| P3.K4 | Guardian delivery: FCM visible notifications + SA SMS gateway | Khutso | T, U | Sep 25 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.K5 | `sim_bank` service with signature check, labelled SIMULATED | Khutso | S, B | Sep 25 20:00 | ☐ | Added 23 Sep, Lethabo · PR #51's latest schema patch records subject_id, a pinned server-signature scheme, the triggering-outcome enum and sim: true receipt; service hold/release/idempotency behaviour and acceptance tests remain open. |
| P3.K6 | Daily OpenTimestamps stamp (first on the cut line) | Khutso | I | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.S1 | Own `docs/STAGED-DURESS-DEFENCE.md`; primary reads replace ⚑ | Ipeleng | S | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.S2 | `shared/` canonical, DER→raw and Merkle with vitest (T01, T02) | Ipeleng | T, S | Sep 24 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S3 | STRIDE threat model + abuse-test specifications T04–T24 (incl. bank-signal data flow) | Ipeleng | S | Sep 24 20:00 | ◐ | Added 23 Sep, Lethabo · **Widened T19 → T24, PR #43 review (C10)** · 24 Sep: T04–T24 specified in `docs/security/TEST-SPECS.md` (Lethabo covering); writers to confirm |
| P3.S4 | Verify-page cryptography (T03–T05) | Ipeleng | I, T, S | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S5 | SSDLC submitted on Sonke | Ipeleng | S | **Sep 26 12:30** | ☐ | Added 23 Sep, Lethabo |
| P3.S6 | Privacy policy (the required slide's source) | Ipeleng | S, B | Sep 26 18:00 | ◐ | Added 23 Sep, Lethabo · 24 Sep: `docs/PRIVACY-POLICY.md` + `docs/security/POPIA-ONE-PAGER.md` drafted and claim-checked (Lethabo covering); PR open |
| P3.B1 | Own the economics doc and script; challenge inputs in the script | Babatunde | B | Sep 24 | ☑ | Added 23 Sep, Lethabo · **Done 24 Sep: rebased PR #65, reverted unsupported R5,090 resolution, rebuilt `scripts/economics_vigil_anchor.py` v2 with tagged configurable inputs (no hardcoded price), generated sensitivity table, updated `docs/PRICING-WORKING.md` and `docs/ECONOMICS-VIGIL-ANCHOR.md`, added source links to `docs/MARKET-DATA.md`; price decision pending** |
| P3.B2 | `docs/COMPETITORS.md` rewritten for the two-layer product | Babatunde | B, I | Sep 24 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.B3 | Lean Canvas with figures — repo and Sonke | Babatunde | B | Sep 26 night | ☐ | Added 23 Sep, Lethabo |
| P3.B4 | Deck (>10 slides incl. privacy policy and the honesty slide), buyer = bank or insurer partner | Babatunde | B, U | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.B5 | Pitch script + two timed rehearsals under 3:00 | Babatunde | B | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.B6 | Problem statement with the mentors (with Lethabo) | Babatunde | B, I | Sep 25 19:00 | ☐ | Added 23 Sep, Lethabo |
| P3.L8 | PIN authority, incident closure and removal rules agreed (§8, §9) | Lethabo, Ipeleng | S | Sep 24 12:00 | ☑ | Added 23 Sep (PR #43 review), Lethabo; draft `docs/PIN-AUTHORITY-RULES.md` + ADR-0040 up 24 Sep — awaiting Lethabo's agreement at the checkpoint; 24 Sep: Lethabo agreed ADR-0040 and decided all 8 open items (ADR-0041, `PROPOSED`); ☑ when Sibusiso accepts ADR-0041; accepted by Sibusiso 24 Sep 12:21 UTC (PR #67 review) |
| P3.L9 | Commit a redacted copy of the organiser's pre-build confirmation | Lethabo | — | Sep 24 12:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.A6 | **Server-min** deployed: ingest + chain + export | Sibusiso | T | Sep 25 09:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.S7 | **Verify-min**: hashes, links, device signatures | Ipeleng | T, S | Sep 25 10:00 | ◐ | Added 23 Sep (PR #43 review), Lethabo · 24 Sep: `shared/verify.js` built and tested (74 pass), PR open; Lethabo covering for Ipeleng |
| P3.U5 | **Guardian-min receiver** screen + one FCM message; Mutarisi is also the APK backup owner | Mutarisi, Khutso | T | Sep 25 10:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.B7 | Validation: 5 consent-based user conversations + 1 bank/insurer approach, recorded honestly | Babatunde | B, U | Sep 26 12:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.B8 | Hedera wording in every pitch surface: a permissioned-consensus ledger with a council of up to 39; network fees paid in HBAR; we issue no token *(carried from P2.12/P2.13)* | Babatunde | B, S | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.B9 | Rehearse the blockchain attacks verbatim; update `docs/BLOCKCHAIN-ATTACK-REHEARSAL.md` for Hedera + OpenTimestamps and retire the R1.30 attack *(carried from P2.14)* | Babatunde, Sibusiso | I, B | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.K7 | Criteria-coverage sweep under I/T/U/S/B/Q *(carried from OS.11)* | Khutso | all | Sep 25 | ☐ | Added 23 Sep, Lethabo |
| P3.B10 | Rewrite the Sonke overview and Lean Canvas for VIGIL + ANCHOR with live figures only | Babatunde (reviewer: Lethabo) | B, I | Sep 24 20:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.S9 | `docs/security/SSDLC.md` accepted by Ipeleng, reviewed by Lethabo, merged; control counts re-computed | Ipeleng | S, T | Sep 26 11:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S10 | `docs/security/THREAT-MODEL.md`: every STRIDE and coercion row has a spec ID and a test | Ipeleng | S | Sep 24 20:00 | ◐ | Added 23 Sep, Lethabo · 24 Sep: `scripts/check-threat-map.mjs` (column-aware) — 55 of 63 rows fully mapped after an independent mapping audit; 8 missing a test, listed in THREAT-MODEL §9 with owners |
| P3.S11 | Test specifications for T30–T49 (fixture, oracle, prerequisites), each sent to its writer | Ipeleng | S, T | Sep 24 20:00 | ◐ | Added 23 Sep, Lethabo · 24 Sep: T30–T52 specified in `docs/security/TEST-SPECS.md`; sent to writers via the PR |
| P3.S12 | Internal test plan executed: `docs/security/PENTEST-RESULTS.md` with pass / fail / not run for all 64 PT cases | Ipeleng | S | Sep 26 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S13 | `docs/security/COMPLIANCE-GOVERNANCE.md` reviewed; counsel questions Q-C1–Q-C7 logged | Ipeleng | S, B | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S14 | CI runs `node --test` plus semgrep and SCA jobs | Sibusiso | T, S | Sep 25 12:00 | ☑ | Added 23 Sep, Lethabo · PR #62 all checks green 24 Sep; review pending · security review posted 24 Sep by Lethabo, covering for Ipeleng ([#62 comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/62#issuecomment-5814099098)): approve, three non-blocking notes |
| P3.S15 | ZAP baseline on staging API and verify page; report linked | Ipeleng | S | Sep 26 14:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S16 | MobSF static scan of the release APK; highs triaged | Vukosi | S | Sep 26 10:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S17 | Lockfiles committed; `npm audit`, `pip-audit`, `osv-scanner` clean or waived in the PR | Sibusiso | T, S | Sep 26 10:00 | ☑ | Added 23 Sep, Lethabo · PR #62 npm/OSV pass; no Python requirements to audit; review pending · security review posted 24 Sep by Lethabo, covering for Ipeleng (same #62 comment); pip-audit applies once `server/requirements.txt` lands with #51 |
| P3.S18 | PR #43 blockers B1–B3 in the spec; T37 specified | Lethabo, Ipeleng | S | Sep 24 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S19 | PR #43 should-fix S1–S4 each closed or carried with an owner | Sibusiso, Vukosi, Mutarisi, Ipeleng, Lethabo | S | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S20 | Export during an open incident decided (PIN-gated, prefix-only) and T30 specified | Lethabo, Sibusiso | S | Sep 24 12:00 | ☑ | Added 23 Sep, Lethabo; 24 Sep: decided (ADR-0041) and T30 specified in spec §15; ☑ when Sibusiso accepts ADR-0041; accepted by Sibusiso 24 Sep 12:21 UTC (PR #67 review) |
| P3.S21 | Wrong-PIN behaviour and attempt limit decided; T47 oracle written | Lethabo, Ipeleng | S, U | Sep 24 12:00 | ☑ | Added 23 Sep, Lethabo; 24 Sep: decided (ADR-0041) and T47 oracle written in spec §15; ☑ when Sibusiso accepts ADR-0041; accepted by Sibusiso 24 Sep 12:21 UTC (PR #67 review) |
| P3.S22 | 15-minute incident tabletop (leaked key, location leak) recorded in a build-log entry | Ipeleng | S | Sep 25 12:00 | ☐ | Added 23 Sep, Lethabo |

---

### Phase 3 coverage by published criterion (computed 23 Sep (night, after P3.S9–S22) from the P3 table; `all` counts once for each of I/T/U/S/B)

| Criterion | Weight | P3 rows serving it |
|---|---:|---:|
| **I** · Innovation & Creativity | 15 | 13 |
| **T** · Technical Implementation | 15 | 27 |
| **U** · Usability & Design | 10 | 14 |
| **S** · Security & Ethics | 10 | 32 |
| **B** · Business & Presentation | 15 | 19 |
| **Q** · Quantum bonus | 5 | 1 |

Khutso re-runs this sweep (OS.11) under the new letters.

---

## History — the four-layer plan

Phases 1–2, the bonus row, the operating-system rows and the old showcase rows moved to [the archived checklist](../archive/2026-09-four-layer/docs/CHECKLIST-four-layer.md) on 23 Sep 2026. Nothing was deleted (rule 1). Live rows were carried into P3: P2.12/P2.13 → P3.B8, P2.14 → P3.B9, OS.11 → P3.K7, B1 → P3.Q1, SC.1/SC.2 → P3.A5/P3.S4/P3.U2, SC.4 → P3.L6.

---

## Amendment log

| Date | Change | Who asked |
|---|---|---|
| 14 Sep 2026 | File created. Every Phase 1 / Phase 2 / operating-system / showcase item entered on day one, so scope drift from here is visible | Lethabo |
| 23 Sep 2026 | VIGIL + ANCHOR pivot: Phase 3 added (41 rows); 12 earlier rows ⊘ and 2 re-scoped, each with a dated reason; published criteria letters I/T/U/S/B/Q adopted for new rows | Lethabo |
| 23 Sep 2026 (evening) | PR #43 review response: 5 rows added (P3.L8, P3.A6, P3.S7, P3.U5, P3.B7) — P3 now 65 rows, including P3.L9 and P3.B10 from #48; coverage recomputed | Lethabo |
| 23 Sep 2026 (night) | Pivot clean-up: four-layer phases archived (nothing deleted); live rows carried into P3 as P3.B8, P3.B9, P3.K7; P3.L2 closed (pre-event building confirmed). P3 now 49 rows | Lethabo |
| 23 Sep 2026 (late) | Ipeleng's security programme: 14 rows added (P3.S9–P3.S22) from `docs/security/SSDLC.md`, the threat model, the internal test plan and the compliance map. P3 now 63 rows; coverage recomputed | Lethabo |
