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
| P3.K3 | `docs/REQUIREMENTS-TRACE.md` (requirement → owner → test) | Khutso | T | Sep 24 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.K4 | Guardian delivery: FCM visible notifications + SA SMS gateway | Khutso | T, U | Sep 25 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.K5 | `sim_bank` service with signature check, labelled SIMULATED | Khutso | S, B | Sep 25 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.K6 | Daily OpenTimestamps stamp (first on the cut line) | Khutso | I | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.S1 | Own `docs/STAGED-DURESS-DEFENCE.md`; primary reads replace ⚑ | Ipeleng | S | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.S2 | `shared/` canonical, DER→raw and Merkle with vitest (T01, T02) | Ipeleng | T, S | Sep 24 12:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S3 | STRIDE threat model + abuse-test specifications T04–T24 (incl. bank-signal data flow) | Ipeleng | S | Sep 24 20:00 | ☐ | Added 23 Sep, Lethabo · **Widened T19 → T24, PR #43 review (C10)** |
| P3.S4 | Verify-page cryptography (T03–T05) | Ipeleng | I, T, S | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S5 | SSDLC submitted on Sonke | Ipeleng | S | **Sep 26 12:30** | ☐ | Added 23 Sep, Lethabo |
| P3.S6 | Privacy policy (the required slide's source) | Ipeleng | S, B | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.B1 | Own the economics doc and script; challenge inputs in the script | Babatunde | B | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.B2 | `docs/COMPETITORS.md` rewritten for the two-layer product | Babatunde | B, I | Sep 24 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.B3 | Lean Canvas with figures — repo and Sonke | Babatunde | B | Sep 26 night | ☐ | Added 23 Sep, Lethabo |
| P3.B4 | Deck (>10 slides incl. privacy policy and the honesty slide), buyer = bank or insurer partner | Babatunde | B, U | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.B5 | Pitch script + two timed rehearsals under 3:00 | Babatunde | B | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.B6 | Problem statement with the mentors (with Lethabo) | Babatunde | B, I | Sep 25 19:00 | ☐ | Added 23 Sep, Lethabo |
| P3.L8 | PIN authority, incident closure and removal rules agreed (§8, §9) | Lethabo, Ipeleng | S | Sep 24 12:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.L9 | Commit a redacted copy of the organiser's pre-build confirmation | Lethabo | — | Sep 24 12:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.A6 | **Server-min** deployed: ingest + chain + export | Sibusiso | T | Sep 25 09:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.S7 | **Verify-min**: hashes, links, device signatures | Ipeleng | T, S | Sep 25 10:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.U5 | **Guardian-min receiver** screen + one FCM message; Mutarisi is also the APK backup owner | Mutarisi, Khutso | T | Sep 25 10:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.B7 | Validation: 5 consent-based user conversations + 1 bank/insurer approach, recorded honestly | Babatunde | B, U | Sep 26 12:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |
| P3.B8 | Hedera wording in every pitch surface: a permissioned-consensus ledger with a council of up to 39; network fees paid in HBAR; we issue no token *(carried from P2.12/P2.13)* | Babatunde | B, S | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.B9 | Rehearse the blockchain attacks verbatim; update `docs/BLOCKCHAIN-ATTACK-REHEARSAL.md` for Hedera + OpenTimestamps and retire the R1.30 attack *(carried from P2.14)* | Babatunde, Sibusiso | I, B | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.K7 | Criteria-coverage sweep under I/T/U/S/B/Q *(carried from OS.11)* | Khutso | all | Sep 25 | ☐ | Added 23 Sep, Lethabo |
| P3.B10 | Rewrite the Sonke overview and Lean Canvas for VIGIL + ANCHOR with live figures only | Babatunde (reviewer: Lethabo) | B, I | Sep 24 20:00 | ☐ | Added 23 Sep (PR #43 review), Lethabo |

---

### Phase 3 coverage by published criterion (computed 23 Sep from the P3 table; `all` counts once for each of I/T/U/S/B)

| Criterion | Weight | P3 rows serving it |
|---|---:|---:|
| **I** · Innovation & Creativity | 15 | 12 |
| **T** · Technical Implementation | 15 | 23 |
| **U** · Usability & Design | 10 | 13 |
| **S** · Security & Ethics | 10 | 18 |
| **B** · Business & Presentation | 15 | 17 |
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
| 23 Sep 2026 (evening) | PR #43 review response: 5 rows added (P3.L8, P3.A6, P3.S7, P3.U5, P3.B7) — P3 now 46 rows; coverage recomputed | Lethabo |
| 23 Sep 2026 (night) | Pivot clean-up: four-layer phases archived (nothing deleted); live rows carried into P3 as P3.B8, P3.B9, P3.K7; P3.L2 closed (pre-event building confirmed). P3 now 49 rows | Lethabo |
