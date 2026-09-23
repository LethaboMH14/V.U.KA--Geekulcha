# CHECKLIST — what we said we would do, ticked

> **Owner: Khutso Mothopa.** Anyone may tick their own row and propose new ones; Khutso keeps the file coherent.
>
> `docs/OPEN-GAPS.md` tracks what is *broken*. Each `team/<name>.md` work order (issued 23 Sep) tracks *assigned work*; the old WBS in `docs/audit/05-team-operating-system.md` is history for the parked layers. **This file tracks what we committed to, whether it is done, and what changed since we said it.** Scope drift is visible here or it is invisible everywhere.

---

## The three rules of this file

1. **An item is never deleted.** It is ticked ☑, or marked dropped ⊘ **with a reason and a date**. A row that vanishes is a row nobody has to explain.
2. **An added item carries the date it was added and who asked for it.** Growth is fine. Silent growth is not.
3. **Every row carries a criterion tag.** From 23 Sep the tags are the published criteria — **I** innovation · **T** technical · **U** usability & design · **S** security & ethics · **B** business · **Q** quantum bonus (`docs/MASTER-CONTEXT.md` §2). Rows added before 23 Sep keep their C1–C4 tags as history.

**States:** ☐ open · ◐ in progress · ☑ done · ⊘ dropped · 🔒 blocked

---

## Phase 1 — Corrections, competitors, TRL *(do these first)*

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| P1.1 | Replace the "2.7m vs 180k" stat with **4:1** (~637,675 active vs 155,231 sworn / 187,681 total), cited to PSiRA 2024/25 and SAPS Mar 2025 — **everywhere**: canvas, deck, Sonke, docs | Khutso | C2, C3 | Sep 15 | ◐ | Repository-controlled surfaces corrected 16 Sep — fixed the two live stale surfaces (`docs/08-BUSINESS.md`, `docs/LEAN-CANVAS.md`) with source/date tags; `docs/SONKE-OVERVIEW.md` was already corrected. Historical evidence, task descriptions, BUILD-LOG history, the MASTER-CONTEXT dead-number warning and archived submission remain explicitly labelled rather than rewritten. External public-profile update is not verifiable from this checkout, so P1.1 is not marked complete. Exact sweep recorded in `docs/BUILD-LOG.md`. |
| P1.2 | Update industry size to **R87bn (2024)**, government segment **R7bn** | Khutso, Babatunde | C2 | Sep 15 | ☐ | Added 14 Sep, Lethabo |
| P1.3 | Correct "27 ADRs" → **25** and retire "440 tests" (state **510 test-function definitions** with the command, or run the suites and record the collected count) | Khutso | C3 | Sep 19 | ☐ | Added 14 Sep, Lethabo |
| P1.4 | Settle TRL at **4** with two subsystems argued at 5 and the four reasons for not being at 6 published. Record as **ADR-0027**. Resolves three contradictory positions in the repo | Lethabo | C3 | Sep 16 | ☑ | Closed 15 Sep — ADR-0027 written, `00-SPEC` §6 + `01-ARCHITECTURE` §11.1 swept, stale ADR index fixed |
| P1.5 | Rewrite the Sonke project overview — **lead with the AI answer** (the load-bearing parts contain no ML), then four layers, corrected figures, TRL 4 with ceiling | Lethabo | C2, C3 | Sep 16 | ☑ | Closed 15 Sep — `docs/SONKE-OVERVIEW.md` with Musa/Thandi stories, four-layer AI-answer table, corrected figures, competitor awareness, organiser email alignment |
| P1.6 | **The competitor block** — the top unmet organiser instruction. Vumacam, Flock, ShotSpotter, WhatsApp, Fidelity ADT: documented criticism → VUKA mechanism. Written at `docs/COMPETITORS.md` | Lethabo, Babatunde | C2 | Sep 16 | ☑ | Closed 15 Sep — `docs/COMPETITORS.md` with five competitors, Vumacam IR complaint, structural unfair advantage. Babatunde to add pricing (P1.13) |
| P1.7 | **G12 model licence register** — model · version · sha256 · licence · commercial position. YOLOv8 is AGPL-3.0; some InsightFace weights are non-commercial-research-only. Verify against what is **actually shipped** | Lethabo | C3 | Sep 15 | ☑ | Closed 15 Sep — `docs/MODEL-LICENCES.md`, verified against predecessor repos |
| P1.8 | Confirm the prize/deployment premise with `sonke@geekulcha.dev` — official page says *"there will be cash prizes"*, contradicting the 90-day-deployment assumption the strategy was anchored on. Tag `ASSUMPTION` until confirmed | Lethabo | — | Sep 16 | ☑ | Closed 15 Sep — prizes confirmed `FACT` (Lead Facilitator email). Deployment premise no longer contradicts; 90-day assumption reconciled |
| P1.9 | Dispatch `rules-lawyer` the moment the **real judging criteria** publish; refresh `docs/MASTER-CONTEXT.md` and re-tag every row here the same day | Khutso | all | on publication | ☑ | Added 14 Sep, Lethabo · **Closed 23 Sep — criteria published; MASTER-CONTEXT v3 refreshed; P3 rows tagged I/T/U/S/B/Q** |

## Phase 1 — Economics gaps Astra flagged and nobody closed

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| P1.10 | Add **VAT and channel cost** to the R137 margin. *(VAT registration is only compulsory above R2.3m turnover from 1 Apr 2026 — at pilot scale this is a disclosure, not a cost)* | Babatunde | C2 | Sep 18 | ⊘ | Added 14 Sep, Lethabo · **Superseded 23 Sep — the R299/R137 model is parked with KHAYA; replaced by P3.B1 (`docs/ECONOMICS-VIGIL-ANCHOR.md`); PR #40 superseded** |
| P1.11 | Build the **economics engine**: ARPU · gross and contribution margin · CAC · LTV · LTV:CAC · payback · churn · burn · runway · break-even month. None of these exist anywhere in the repo today | Babatunde | C2, C3 | Sep 18 | ⊘ | Added 14 Sep, Lethabo · **Superseded 23 Sep — replaced by `scripts/economics_vigil_anchor.py` (P3.B1)** |
| P1.12 | Name a **real estate or residents' association** with consenting contact capacity — or label the funnel `ASSUMPTION` in full. *"The 764 hotspots are not 764 customers"* | Babatunde | C2, C4 | Sep 18 | ⊘ | Added 14 Sep, Lethabo · **Superseded 23 Sep — the estate channel is parked; the buyer is a bank or insurer partner (P3.B4)** |
| P1.13 | Competitor pricing — Fidelity ADT / Vumacam actual monthly rates, to position R299 | Babatunde | C2 | Sep 18 | ⊘ | Added 14 Sep, Lethabo · **Superseded 23 Sep — R299 retired; comparables for R20 in `docs/ECONOMICS-VIGIL-ANCHOR.md` §3; competitor rewrite is P3.B2** |

---

## Phase 2 — Deployability and compliance

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| P2.1 | **PSiRA position paper** — trigger, registration category, whether individual flag-gate reviewers need registering, and the contracting structure that puts the **registered security company as the party rendering the service**. s20(1)(a) is a blanket prohibition; there is no SaaS exemption. Flag the open question for counsel | Ipeleng | C2, C3 | Sep 16 | ☑ | Closed 15 Sep — `docs/PSIRA-POSITION.md` via PR #28 (merged 16 Sep): four answers + Q1–Q8 for counsel; `08-BUSINESS` one-liner swept. Statutory wording flagged ⚑ for verification — see paper §9 |
| P2.2 | **POPIA position paper + ADR** — s26/s27 asymmetry (there is **no legitimate-interest ground for biometrics**), and whether **discard-by-default** removes the problem | Ipeleng | C2, C3 | Sep 17 | ◐ | Written 16 Sep, review pending — `docs/POPIA-POSITION.md` + ADR-0031 via PR #30 (successor PR — #28 merged with the P2.1 commits only): s27(1) grounds quoted from the Act's full text (Accessible Law copy, ⚑ pending Gazette verification), ground-by-ground walk shows no basis for a non-consenting passer-by, s33 limb flagged circular-or-open, discard-by-default proposed as an architecture constraint (ADR-0031 *Proposed* — binds on both-lead acceptance); counsel Q1–Q5 open; stays ◐ until merge and counsel verification |
| P2.3 | **Discard-by-default embeddings** — architecture, not configuration. Any embedding that does not match an enrolled, consenting resident is discarded | Sibusiso | C2 | Sep 18 | ⊘ | Proposed boundary in `docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md`; adopted as **ADR-0031** (16 Sep, PR #30); implementation test still pending · **Parked 23 Sep with UMOJA — no faces or embeddings in VIGIL + ANCHOR (ADR-0034); PR #32 not applicable** |
| P2.4 | **s57(1)(a) prior authorisation** question — linking unique identifiers across responsible parties for a new purpose needs the Regulator's *prior* authorisation. A bigger gate than IO registration | Ipeleng, Sibusiso | C3 | Sep 17 | ⊘ | Decision record in `docs/POPIA-S57-DECISION-RECORD.md`; counsel determination and pilot gate evidence pending · **Parked 23 Sep with UMOJA; the bank-signal data flow is re-assessed in P3.S3** |
| P2.5 | **Register the Information Officer** — free, online, under 30 minutes. No excuse before any pilot | Ipeleng | C3 | Sep 17 | ◐ | Path prepared 16 Sep — `docs/POPIA-IO-REGISTRATION.md` (PR #30): eServices Portal verified as the live primary route, `Registration.IO@inforegulator.org.za` manual form as fallback, s55 duties and the five leads' inputs recorded; submission still pending (head designation D-IO-1 + org legal identity) — §7 deliberately empty |
| P2.6 | Read the draft **Code of Conduct for Gated Access Areas** (published 30 Apr 2026) — covers CCTV, biometric scanning and FRT at gated premises, and applies to owners **and their technology service providers**. Direction: 7–30 day retention with auto-overwrite. **Estates are our named launch channel** — build to it now | Ipeleng | C2, C3 | Sep 17 | ⊘ | Review written 16 Sep — `docs/GATED-ACCESS-CODE-REVIEW.md` (PR #30): **draft text not corroborated on any reachable source** (Regulator site search zero hits; codes page lists no 2026 entries; nearest artefact is the RCC proposed code, 08 Sep 2023) — all draft content ⚑ pending Gazette retrieval (counsel Q1). Design floor proposed as **ADR-0032** (status *Proposed* — binds on both-lead acceptance): ≤30-day auto-overwrite for gate-domain data as a team-chosen conservative default, discard-by-default stands, FRT justification dossier before any pilot face gate. Added 14 Sep, Lethabo · **Parked 23 Sep with KHAYA/UMOJA — gated-access cameras out of scope** |
| P2.7 | Record the **RICA** position — the 3-second ring buffer / label-not-audio design already matches the ShotSpotter precedent. **Never attach an audio clip as evidence** | Ipeleng | C3 | Sep 19 | ◐ | Position written 16 Sep — `docs/RICA-POSITION.md` (PR #30): RICA full text not readable this session (official justice.gov.za PDF reachable but binary-unparseable; SAFLII/lawlibrary/polity 403) — no verbatim quotes, statutory characterisations ⚑, five counsel questions. The two bright lines are specified architecture constraints (ASR-6/T0 recorded design, not yet implemented code; executable negative tests owed with the audio-path port): **audio never persists** (3-second ring buffer, ASR-6) and **never attach an audio clip as evidence** (labels-not-audio through T2); transient-acquisition question is counsel Q1. No ADR — the design does not change. Added 14 Sep, Lethabo |
| P2.8 | Read and summarise the **SITA "Deployment Guidelines: Surveillance and Access Control (SAC) Solutions"** — directly governs KHAYA for public-sector deployment | Vukosi | C2, C3 | Sep 20 | ⊘ | Added 14 Sep, Lethabo · **Parked 23 Sep with KHAYA** |
| P2.9 | Record the realistic 90-day public-sector path: **CSD registration** (free, 5–10 working days) · **B-BBEE EME affidavit** · tax clearance · an already-open tender · a municipal quotation-based purchase · a pilot MOU. **Not** a national tender, **not** SITA transversal listing, **not** a CPSI award — CPSI requires one year of live public-sector operation | Babatunde | C2 | Sep 19 | ☐ | Added 14 Sep, Lethabo |
| P2.10 | Record the funding path — **SEDFA**, **TIA Seed Fund**, **s11D** R&D 150% deduction (DSI pre-approval required; sunset 31 Dec 2033), SBC tax bands | Babatunde | C2 | Sep 19 | ☐ | Added 14 Sep, Lethabo |

---

## Phase 2 — Blockchain track *(our competition track — a judge here will know blockchain)*

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| P2.11 | ~~Fix the R1.30/month anchoring figure before it reaches a slide.~~ **CLOSED 15 September 2026.** Picked OpenTimestamps as the named primary chain (already the diagrammed default throughout `docs/01-ARCHITECTURE.md`) — corrected figure is **~R0/month** (public calendar servers), Hedera fallback recomputed at current price ($0.0008/message, repriced Jan 2026) ≈ **R9–10/month**. Swept across every live doc that stated the figure: `anchor/README.md`, `docs/00-SPEC.md`, `docs/01-ARCHITECTURE.md` (9 occurrences), `docs/08-BUSINESS.md`, `docs/HANDOVER.md`, `docs/LEAN-CANVAS.md`, `docs/SDLC.md` | Babatunde, Sibusiso | Sep 17 | ☑ | Closed 15 Sep, Sibusiso |
| P2.12 | Stop calling Hedera *"a public blockchain"* — it is a **permissioned-consensus ledger run by a Governing Council of up to 39**. Still a legitimate choice; blurring it invites *"so it's not really decentralised"* | Babatunde | C2 | Sep 17 | ☐ | Added 14 Sep, Lethabo · **Now load-bearing: Hedera is the primary anchor (ADR-0035)** |
| P2.13 | State that Hedera mainnet fees are **paid in HBAR**, rather than let a judge find the tension with *"we refused tokens."* OpenTimestamps genuinely needs no wallet, token or account — that claim holds | Babatunde | C2 | Sep 17 | ☐ | Added 14 Sep, Lethabo · **Now load-bearing: Hedera is the primary anchor (ADR-0035)** |
| P2.14 | Rehearse the three blockchain attacks verbatim: *(a)* walk me through R1.30, *(b)* why not a private signed hash chain, *(c)* OpenTimestamps depends on volunteer calendar servers | Babatunde, Sibusiso | C2 | Sep 23 | ◐ | Rehearsal script in `docs/BLOCKCHAIN-ATTACK-REHEARSAL.md` (from WBS 3.3); live evidence checkpoint still required |
| P2.15 | ~~Decide and record: self-host an OpenTimestamps calendar?~~ **CLOSED — ADR-0028.** No self-hosted calendar; multi-calendar submission (OTS client default) plus scheduled `ots upgrade` pass in `anchor/publish.py`. `docs/ANCHOR-RATIONALE.md` attack-3 answer corrected. Implementation pending Task 5 — do not claim mitigation live until `anchor/publish.py` runs it | Sibusiso | Sep 18 | ☑ | Closed 15 Sep, Sibusiso |
| P2.16 | **WBS 3.1 contract freeze** — machine-readable v0.1.0 event schema, v3.1 OpenAPI surface, exact-shape tests and rejection tests; second-lead approval and ADR still required before calling the shared contract frozen | Sibusiso | C2, C3, C4 | Sep 15 | ⊘ | Both lead rows signed 16 Sep in `docs/CONTRACT-APPROVAL-RECORD.md` (Lethabo 15 Sep, Sibusiso 16 Sep, ADR-0030 independently re-verified with jsonschema both times). **Only remaining item: consumer confirmation** — Vukosi's `appliance/` (PR #24, Sibusiso-approved and technically mergeable, but Lethabo's latest review is CHANGES_REQUESTED — not fully approved) documents itself as envelope-only; PR #24's BUILD-LOG entry tracks the SightingEvent payload gap as a joint Sibusiso/Khutso follow-up, not yet resolved · **Superseded 23 Sep by contract v2 (P3.A1); v1 kept, UMOJA paths to be marked deprecated** |
| P2.17 | **Human-gate operator duty card** — review procedure, refusal evidence, two-signature handling, privacy boundaries and pre-pilot training evidence | Lethabo, Sibusiso | C2, C3, C4 | Sep 21 | ⊘ | Reviewed 15 Sep — `duty card corrected` (`verify_concern` now transitions to `flagged` per PR #10 fix), operator error + escalation paths added. Real training evidence still required · **Parked 23 Sep with UMOJA (operator human-gate duty)** |
| P2.18 | **ADR-0029 — single fusion source.** The server consumes `brain/fusion.py` and `brain/entity_resolution.py`; `scorer.py` and the duplicate server `entity_resolution.py` are not ported. State vocabulary is the contract's (`watch_candidate`, not `candidate`) | Lethabo, Sibusiso | C2, C3 | Sep 15 | ☑ | Closed 15 Sep — ADR-0029 written from predecessor evidence; port guard added to `brain/README.md` and `docs/HANDOVER.md` Task 4 |
| P2.19 | **G13 model cards** — one card per model (YAMNet, YOLOv8, InsightFace, fast-plate-ocr) on the `docs/SDLC.md` §17.4 template; the demographic-performance row states **"not measured"** | Lethabo | C3 | Sep 19 | ☑ | Closed 15 Sep — `docs/MODEL-CARDS.md`; includes a negative card for the non-ML fusion engine and the plate-gate honest limit |

## Bonus — Quantum Tech (5 points, announced 15 Sep)

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| B1 | **Quantum Tech strategy** — explain/implement quantum technologies. Honest angle: hash-chain + Merkle-tree primitives (SHA-256) as post-quantum foundation; Ed25519→PQ migration path designed; architecture decouples anchoring from signing. Sibusiso to verify cryptographic claims, team to decide explain vs implement | Lethabo, Sibusiso | bonus | — | ◐ | Added 15 Sep — `docs/QUANTUM-TECH.md` written with claim boundaries, Sibusiso verification checklist, and implementation demo option. Team decision pending · **23 Sep — implementation is P3.Q1 (ML-DSA-65 + Ed25519 on roots), on the cut line** |

---

## Phase 3 — VIGIL + ANCHOR build *(added 23 Sep 2026, Lethabo — ADR-0034 to ADR-0038; full steps in each work order)*

| # | Item | Owner | Criterion | Due (SAST) | State | Amended |
|---|---|---|---|---|---|---|
| P3.L1 | Pivot PR merged: ADR-0034–0038, `docs/VUKA-2-SPEC.md`, defence and economics docs, MASTER-CONTEXT v3, seven work orders | Lethabo | I, T, S | Sep 23 | ◐ | Added 23 Sep, Lethabo |
| P3.L2 | Organiser answer on building before Fri 16:00 on declared lineage | Lethabo | — | Sep 24 12:00 | ☐ | Added 23 Sep, Lethabo |
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
| P3.S3 | STRIDE threat model + abuse-test specifications T04–T19 (incl. bank-signal data flow) | Ipeleng | S | Sep 24 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S4 | Verify-page cryptography (T03–T05) | Ipeleng | I, T, S | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.S5 | SSDLC submitted on Sonke | Ipeleng | S | **Sep 26 12:30** | ☐ | Added 23 Sep, Lethabo |
| P3.S6 | Privacy policy (the required slide's source) | Ipeleng | S, B | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.B1 | Own the economics doc and script; challenge inputs in the script | Babatunde | B | Sep 24 | ☐ | Added 23 Sep, Lethabo |
| P3.B2 | `docs/COMPETITORS.md` rewritten for the two-layer product | Babatunde | B, I | Sep 24 20:00 | ☐ | Added 23 Sep, Lethabo |
| P3.B3 | Lean Canvas with figures — repo and Sonke | Babatunde | B | Sep 26 night | ☐ | Added 23 Sep, Lethabo |
| P3.B4 | Deck (>10 slides incl. privacy policy and the honesty slide), buyer = bank or insurer partner | Babatunde | B, U | Sep 26 | ☐ | Added 23 Sep, Lethabo |
| P3.B5 | Pitch script + two timed rehearsals under 3:00 | Babatunde | B | Sep 26 18:00 | ☐ | Added 23 Sep, Lethabo |
| P3.B6 | Problem statement with the mentors (with Lethabo) | Babatunde | B, I | Sep 25 19:00 | ☐ | Added 23 Sep, Lethabo |

---

## The operating system — the four additions that make seven people work as one

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| OS.1 | `docs/MASTER-CONTEXT.md` — theme, criteria, showcase, honesty ledger, in one page every tool reads | Khutso | all | Sep 14 | ☑ | Created 14 Sep |
| OS.2 | `docs/CHECKLIST.md` — this file | Khutso | all | Sep 14 | ☑ | Created 14 Sep |
| OS.3 | `templates/BUSINESS-HANDOFF.md` gains four fields: **canvas block · cost to build and run · journey step + screen ID · one-sentence commercial why** | Lethabo | C2, C4 | Sep 14 | ☑ | Created 14 Sep |
| OS.4 | Criteria-recall block added to `RULES.md` and `AGENTS.md`, both pointing at MASTER-CONTEXT | Lethabo | all | Sep 14 | ☑ | Created 14 Sep |
| OS.5 | `## Agent operating spec` block added to all seven `team/<name>.md` files | Lethabo | C1 | Sep 14 | ☑ | Created 14 Sep |
| OS.6 | `docs/SESSION-PROMPT.md` — one universal prompt, one word different per person | Lethabo | C1 | Sep 14 | ☑ | Created 14 Sep |
| OS.7 | `docs/KICKOFF.md` — the team greeting, kept so late joiners get the same start | Lethabo | C1 | Sep 14 | ☑ | Created 14 Sep |
| OS.8 | `docs/PLAN.md` — the whole plan, visible to everyone, not just each person's slice | Lethabo | all | Sep 14 | ☑ | Created 14 Sep |
| OS.9 | Archive the superseded August submission to `submission/archive-2026-08/` with a README saying what replaced it | Lethabo | C3 | Sep 14 | ☑ | Created 14 Sep |
| OS.10 | **Every person updates `Current task` in their own file when it changes.** This is what keeps the universal session prompt self-refreshing | everyone | C1 | ongoing | ◐ | Added 14 Sep, Lethabo |
| OS.11 | **Criteria-coverage sweep** — show C1–C4 are all served; flag any over-served | Khutso | all | Sep 22 | ☐ | Added 14 Sep, Lethabo |

---

## The showcase — the thing everything else supports

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| SC.1 | **`GET /v1/subjects/{id}/record` end to end** — a subject requests their record, receives their full decision history, and the anchor proof verifies against a public verifier **with no cooperation from us** | Sibusiso | C2, C3, C4 | Sep 18 | ◐ | Added 14 Sep, Lethabo · **Re-scoped 23 Sep to VIGIL subjects — export (P3.A5) + verify (P3.S4); Musa fixture retired; PR #39 code reused** |
| SC.2 | The **subject-access screen** — the front end of SC.1. This is the demo moment | Mutarisi | C4 | Sep 19 | ☐ | Added 14 Sep, Lethabo · **Re-scoped 23 Sep — the My Record screen (P3.U2)** |
| SC.3 | **Second showcase** — an operator tries to whitelist alone, is refused, and the refusal is **itself anchored**. Under a minute | Sibusiso, Mutarisi | C2 | Sep 20 | ⊘ | Added 14 Sep, Lethabo · **Superseded 23 Sep — whitelisting parked with UMOJA; replaced by the duress no-op and decoy-guardian demo (P3.S3, T12)** |
| SC.4 | **Recorded fallback** for both showcases — local assets, opens with no internet | Mutarisi | C3 | Sep 21 | ☐ | Added 14 Sep, Lethabo |
| SC.5 | One rehearsed end-to-end thread: sighting → `watch_candidate` → human decision → anchored record → **subject pulls their own file with a verifiable proof** | Lethabo, Sibusiso | all | Sep 24 | ⊘ | Added 14 Sep, Lethabo · **Superseded 23 Sep — replaced by Nomsa's night (MASTER-CONTEXT §5, P3.L6)** |

---

## Criterion coverage — checked at every sweep

| Criterion | Rows serving it | Health |
|---|---:|---|
| **C1 · Team composition** | 5 | Thin by nature — the composition is what it is. Served by the operating system being visibly seven-person |
| **C2 · Innovation & creativity** | 18 | Strongest. Watch for over-serving |
| **C3 · Progress of solution profile** | 17 | Strong |
| **C4 · User journey story** | 5 | 🟠 **Thinnest real gap.** SC.2, P1.12 and the household walkthrough carry it. Khutso flags at the Sep 22 sweep if still thin |


### Phase 3 coverage by published criterion (computed 23 Sep from the P3 table; `all` counts once for each of I/T/U/S/B)

| Criterion | Weight | P3 rows serving it |
|---|---:|---:|
| **I** · Innovation & Creativity | 15 | 10 |
| **T** · Technical Implementation | 15 | 19 |
| **U** · Usability & Design | 10 | 11 |
| **S** · Security & Ethics | 10 | 14 |
| **B** · Business & Presentation | 15 | 13 |
| **Q** · Quantum bonus | 5 | 1 |

Khutso re-runs this sweep (OS.11) under the new letters.

---

## Amendment log

| Date | Change | Who asked |
|---|---|---|
| 14 Sep 2026 | File created. Every Phase 1 / Phase 2 / operating-system / showcase item entered on day one, so scope drift from here is visible | Lethabo |
| 23 Sep 2026 | VIGIL + ANCHOR pivot: Phase 3 added (41 rows); 12 earlier rows ⊘ or re-scoped with dated reasons; published criteria letters I/T/U/S/B/Q adopted for new rows | Lethabo |
