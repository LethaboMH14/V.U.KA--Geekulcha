# CHECKLIST — what we said we would do, ticked

> **Owner: Khutso Mothopa.** Anyone may tick their own row and propose new ones; Khutso keeps the file coherent.
>
> `docs/OPEN-GAPS.md` tracks what is *broken*. `docs/audit/05-team-operating-system.md` tracks *assigned WBS leaves*. **This file tracks what we committed to, whether it is done, and what changed since we said it.** Scope drift is visible here or it is invisible everywhere.

---

## The three rules of this file

1. **An item is never deleted.** It is ticked ☑, or marked dropped ⊘ **with a reason and a date**. A row that vanishes is a row nobody has to explain.
2. **An added item carries the date it was added and who asked for it.** Growth is fine. Silent growth is not.
3. **Every row carries a criterion tag.** At any moment we can see whether all four criteria are served, or whether we are over-serving one.

**States:** ☐ open · ◐ in progress · ☑ done · ⊘ dropped · 🔒 blocked

---

## Phase 1 — Corrections, competitors, TRL *(do these first)*

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| P1.1 | Replace the "2.7m vs 180k" stat with **4:1** (~637,675 active vs 155,231 sworn / 187,681 total), cited to PSiRA 2024/25 and SAPS Mar 2025 — **everywhere**: canvas, deck, Sonke, docs | Khutso | C2, C3 | Sep 15 | ☐ | Added 14 Sep, Lethabo |
| P1.2 | Update industry size to **R87bn (2024)**, government segment **R7bn** | Khutso, Babatunde | C2 | Sep 15 | ☐ | Added 14 Sep, Lethabo |
| P1.3 | Correct "27 ADRs" → **25** and retire "440 tests" (state **510 test-function definitions** with the command, or run the suites and record the collected count) | Khutso | C3 | Sep 19 | ☐ | Added 14 Sep, Lethabo |
| P1.4 | Settle TRL at **4** with two subsystems argued at 5 and the four reasons for not being at 6 published. Record as **ADR-0027**. Resolves three contradictory positions in the repo | Lethabo | C3 | Sep 16 | ☐ | Added 14 Sep, Lethabo |
| P1.5 | Rewrite the Sonke project overview — **lead with the AI answer** (the load-bearing parts contain no ML), then four layers, corrected figures, TRL 4 with ceiling | Lethabo | C2, C3 | Sep 16 | ☐ | Added 14 Sep, Lethabo |
| P1.6 | **The competitor block** — the top unmet organiser instruction. Repo-wide grep for competitor names currently returns **zero**. Vumacam mapping table: documented criticism → VUKA mechanism | Lethabo, Babatunde | C2 | Sep 16 | ☐ | Added 14 Sep, Lethabo |
| P1.7 | **G12 model licence register** — model · version · sha256 · licence · commercial position. YOLOv8 is AGPL-3.0; some InsightFace weights are non-commercial-research-only. Verify against what is **actually shipped** | Lethabo | C3 | Sep 15 | ☐ | Pre-existing gap G12 |
| P1.8 | Confirm the prize/deployment premise with `sonke@geekulcha.dev` — official page says *"there will be cash prizes"*, contradicting the 90-day-deployment assumption the strategy was anchored on. Tag `ASSUMPTION` until confirmed | Lethabo | — | Sep 16 | ☐ | Added 14 Sep, Lethabo |
| P1.9 | Dispatch `rules-lawyer` the moment the **real judging criteria** publish; refresh `docs/MASTER-CONTEXT.md` and re-tag every row here the same day | Khutso | all | on publication | ☐ | Added 14 Sep, Lethabo |

## Phase 1 — Economics gaps Astra flagged and nobody closed

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| P1.10 | Add **VAT and channel cost** to the R137 margin. *(VAT registration is only compulsory above R2.3m turnover from 1 Apr 2026 — at pilot scale this is a disclosure, not a cost)* | Babatunde | C2 | Sep 18 | ☐ | Added 14 Sep, Lethabo |
| P1.11 | Build the **economics engine**: ARPU · gross and contribution margin · CAC · LTV · LTV:CAC · payback · churn · burn · runway · break-even month. None of these exist anywhere in the repo today | Babatunde | C2, C3 | Sep 18 | ☐ | Added 14 Sep, Lethabo |
| P1.12 | Name a **real estate or residents' association** with consenting contact capacity — or label the funnel `ASSUMPTION` in full. *"The 764 hotspots are not 764 customers"* | Babatunde | C2, C4 | Sep 18 | ☐ | Added 14 Sep, Lethabo |
| P1.13 | Competitor pricing — Fidelity ADT / Vumacam actual monthly rates, to position R299 | Babatunde | C2 | Sep 18 | ☐ | Added 14 Sep, Lethabo |

---

## Phase 2 — Deployability and compliance

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| P2.1 | **PSiRA position paper** — trigger, registration category, whether individual flag-gate reviewers need registering, and the contracting structure that puts the **registered security company as the party rendering the service**. s20(1)(a) is a blanket prohibition; there is no SaaS exemption. Flag the open question for counsel | Ipeleng | C2, C3 | Sep 16 | ☐ | Added 14 Sep, Lethabo |
| P2.2 | **POPIA position paper + ADR** — s26/s27 asymmetry (there is **no legitimate-interest ground for biometrics**), and whether **discard-by-default** removes the problem | Ipeleng | C2, C3 | Sep 17 | ☐ | Added 14 Sep, Lethabo |
| P2.3 | **Discard-by-default embeddings** — architecture, not configuration. Any embedding that does not match an enrolled, consenting resident is discarded | Sibusiso | C2 | Sep 18 | ◐ | Proposed boundary in `docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md`; implementation test and ADR pending |
| P2.4 | **s57(1)(a) prior authorisation** question — linking unique identifiers across responsible parties for a new purpose needs the Regulator's *prior* authorisation. A bigger gate than IO registration | Ipeleng, Sibusiso | C3 | Sep 17 | ◐ | Decision record in `docs/POPIA-S57-DECISION-RECORD.md`; counsel determination and pilot gate evidence pending |
| P2.5 | **Register the Information Officer** — free, online, under 30 minutes. No excuse before any pilot | Ipeleng | C3 | Sep 17 | ☐ | Pre-existing, `OPEN-GAPS.md` |
| P2.6 | Read the draft **Code of Conduct for Gated Access Areas** (published 30 Apr 2026) — covers CCTV, biometric scanning and FRT at gated premises, and applies to owners **and their technology service providers**. Direction: 7–30 day retention with auto-overwrite. **Estates are our named launch channel** — build to it now | Ipeleng | C2, C3 | Sep 17 | ☐ | Added 14 Sep, Lethabo |
| P2.7 | Record the **RICA** position — the 3-second ring buffer / label-not-audio design already matches the ShotSpotter precedent. **Never attach an audio clip as evidence** | Ipeleng | C3 | Sep 19 | ☐ | Added 14 Sep, Lethabo |
| P2.8 | Read and summarise the **SITA "Deployment Guidelines: Surveillance and Access Control (SAC) Solutions"** — directly governs KHAYA for public-sector deployment | Vukosi | C2, C3 | Sep 20 | ☐ | Added 14 Sep, Lethabo |
| P2.9 | Record the realistic 90-day public-sector path: **CSD registration** (free, 5–10 working days) · **B-BBEE EME affidavit** · tax clearance · an already-open tender · a municipal quotation-based purchase · a pilot MOU. **Not** a national tender, **not** SITA transversal listing, **not** a CPSI award — CPSI requires one year of live public-sector operation | Babatunde | C2 | Sep 19 | ☐ | Added 14 Sep, Lethabo |
| P2.10 | Record the funding path — **SEDFA**, **TIA Seed Fund**, **s11D** R&D 150% deduction (DSI pre-approval required; sunset 31 Dec 2033), SBC tax bands | Babatunde | C2 | Sep 19 | ☐ | Added 14 Sep, Lethabo |

---

## Phase 2 — Blockchain track *(our competition track — a judge here will know blockchain)*

| # | Item | Owner | Criterion | Due | State | Amended |
|---|---|---|---|---|---|---|
| P2.11 | 🔴 **Fix the R1.30/month anchoring figure before it reaches a slide.** It was computed off Hedera's pre-2026 price; Hedera repriced `ConsensusSubmitMessage` $0.0001 → $0.0008 in **January 2026**. Pick one system, show the arithmetic, use current prices | Babatunde, Sibusiso | C2, C3 | Sep 17 | ◐ | Reconciliation in `docs/ANCHOR-COST-RECONCILIATION.md`; final system choice and repo-wide presentation sweep outstanding |
| P2.12 | Stop calling Hedera *"a public blockchain"* — it is a **permissioned-consensus ledger run by a Governing Council of up to 39**. Still a legitimate choice; blurring it invites *"so it's not really decentralised"* | Babatunde | C2 | Sep 17 | ☐ | Added 14 Sep, Lethabo |
| P2.13 | State that Hedera mainnet fees are **paid in HBAR**, rather than let a judge find the tension with *"we refused tokens."* OpenTimestamps genuinely needs no wallet, token or account — that claim holds | Babatunde | C2 | Sep 17 | ☐ | Added 14 Sep, Lethabo |
| P2.14 | Rehearse the three blockchain attacks verbatim: *(a)* walk me through R1.30, *(b)* why not a private signed hash chain, *(c)* OpenTimestamps depends on volunteer calendar servers | Babatunde, Sibusiso | C2 | Sep 23 | ◐ | Rehearsal script in `docs/BLOCKCHAIN-ATTACK-REHEARSAL.md`; live evidence checkpoint still required |
| P2.15 | **Decide and record:** do we self-host an OpenTimestamps calendar and run `ots upgrade` promptly? The answer to attack *(c)* is only valid if it is actually implemented | Sibusiso | C2, C3 | Sep 18 | ◐ | Decision recorded in `docs/OTS-CALENDAR-DECISION.md`: deferred; do not claim self-hosting |
| P2.16 | **WBS 3.1 contract freeze** — machine-readable v0.1.0 event schema, v3.1 OpenAPI surface, exact-shape tests and rejection tests; second-lead approval and ADR still required before calling the shared contract frozen | Sibusiso | C2, C3, C4 | Sep 15 | ◐ | Added 15 Sep, Sibusiso session |
| P2.17 | **Human-gate operator duty card** — review procedure, refusal evidence, two-signature handling, privacy boundaries and pre-pilot training evidence | Lethabo, Sibusiso | C2, C3, C4 | Sep 21 | ◐ | Added 15 Sep, Sibusiso session |

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
| SC.1 | **`GET /v1/subjects/{id}/record` end to end** — a subject requests their record, receives their full decision history, and the anchor proof verifies against a public verifier **with no cooperation from us** | Sibusiso | C2, C3, C4 | Sep 18 | ☐ | Added 14 Sep, Lethabo |
| SC.2 | The **subject-access screen** — the front end of SC.1. This is the demo moment | Mutarisi | C4 | Sep 19 | ☐ | Added 14 Sep, Lethabo |
| SC.3 | **Second showcase** — an operator tries to whitelist alone, is refused, and the refusal is **itself anchored**. Under a minute | Sibusiso, Mutarisi | C2 | Sep 20 | ☐ | Added 14 Sep, Lethabo |
| SC.4 | **Recorded fallback** for both showcases — local assets, opens with no internet | Mutarisi | C3 | Sep 21 | ☐ | Added 14 Sep, Lethabo |
| SC.5 | One rehearsed end-to-end thread: sighting → `watch_candidate` → human decision → anchored record → **subject pulls their own file with a verifiable proof** | Lethabo, Sibusiso | all | Sep 24 | ☐ | Added 14 Sep, Lethabo |

---

## Criterion coverage — checked at every sweep

| Criterion | Rows serving it | Health |
|---|---:|---|
| **C1 · Team composition** | 5 | Thin by nature — the composition is what it is. Served by the operating system being visibly seven-person |
| **C2 · Innovation & creativity** | 18 | Strongest. Watch for over-serving |
| **C3 · Progress of solution profile** | 17 | Strong |
| **C4 · User journey story** | 5 | 🟠 **Thinnest real gap.** SC.2, P1.12 and the household walkthrough carry it. Khutso flags at the Sep 22 sweep if still thin |

---

## Amendment log

| Date | Change | Who asked |
|---|---|---|
| 14 Sep 2026 | File created. Every Phase 1 / Phase 2 / operating-system / showcase item entered on day one, so scope drift from here is visible | Lethabo |
