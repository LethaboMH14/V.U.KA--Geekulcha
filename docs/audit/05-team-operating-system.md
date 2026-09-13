# Work breakdown and team operating system (C1, C3)

All assignments, hours and dates are **ASSUMPTIONS**, not commitments accepted by the people named. Leaf tasks are at most six hours in this plan. Additional review time is reserved separately: ASSUMPTION one hour per lead per pre-event workday, thirteen days × two leads = 26 hours. Leaf effort totals 144 hours; planned total including review is 170 hours. No paid capacity or daily availability was supplied.

## 1. WBS

Parents: 1 clean intake/team; 2 user flow; 3 minimal demonstration; 4 assurance; 5 commercial story; 6 release; 7 event. Dependencies mean evidence completion, never just a date passing. Dates are September 2026. Each acceptance must be checked by the assigned nonauthor reviewer.

| WBS | Owner | Due | Hours | Dependencies | Leaf task | Independent acceptance | Criterion |
|---|---|---|---:|---|---|---|---|
| 1.1 | Ipeleng | 13 | 4 | none | Verify credential/password remediation | Redacted issuer receipts reviewed; never values | I |
| 1.2 | Lethabo | 13 | 4 | none | Verify old data cleanup and original-file inventory | Removal scope and unresolved copies recorded; no history imported | I |
| 1.3 | Sibusiso | 13 | 4 | none | Install and exercise local/CI scanning | Clean scan passes; synthetic leak and missing-tool checks fail closed | I |
| 1.4 | Khutso | 14 | 3 | 1.1,1.2,1.3 | Assemble clean-intake gate evidence | Both leads sign actual evidence or feature intake stays blocked | C3 |
| 1.5 | Lethabo | 14 | 3 | none | Replace team copy and verify roster | Seven roles and four universities compared with supplied roster/originals | C1 |
| 2.1 | Khutso | 14 | 3 | none | Map requirements to five journeys | Each requirement has owner, screen and observable acceptance | C3,C4 |
| 2.2 | Lethabo | 15 | 6 | 2.1 | Complete twelve-screen design handoff | Designer can reproduce copy, controls and failure states | C3,C4 |
| 2.3 | Mutarisi | 16 | 6 | 2.2 | Build or draw member/setup wireframes | S01–S07 checked by Lethabo on narrow viewport | C4 |
| 2.4 | Mutarisi | 17 | 6 | 2.2 | Build or draw operator/subject wireframes | S08–S12 include stale/error and rights states | C3,C4 |
| 2.5 | Lethabo | 18 | 4 | 2.3,2.4 | Observe household walkthrough and revise | Actual consent-safe observations recorded; no invented participants | C4 |
| 3.1 | Sibusiso | 15 | 4 | 1.4 | Freeze event/API/governance contracts | Both leads and consumers approve versioned schemas | C3 |
| 3.2 | Vukosi | 16 | 6 | 1.4,3.1 | Port minimal synthetic edge producer | Only sim_ fixtures; consumer validates sequence and offline replay | C3 |
| 3.3 | Sibusiso | 17 | 6 | 1.4,3.1 | Port and verify human gate and proof path | Nonauthor reproduces denial, two-signature and tamper checks | C2,C3 |
| 3.4 | Mutarisi | 18 | 6 | 2.4,3.3 | Connect one synthetic end-to-end flow | Candidate→human review→receipt→record; stale status checked | C4 |
| 3.5 | Khutso | 19 | 4 | 3.2,3.3,3.4 | Reproduce evidence and resolve TRL wording | Record command/config/result; absent evidence stays unverified | C3 |
| 4.1 | Ipeleng | 15 | 4 | 2.1 | Specify lawful data/rights and deletion controls | Data map and open legal questions reviewed; no compliance claim | C3,C4 |
| 4.2 | Vukosi | 17 | 4 | none | Measure load and obtain BOM quotes | Wattage/runtime procedure and quote dates recorded; missing kit explicit | C3 |
| 4.3 | Ipeleng | 19 | 5 | 3.3,4.1 | Exercise operator, tenant and duress abuse cases | Actual outcomes plus unresolved tests recorded; failed mode excluded | C3,C4 |
| 4.4 | Vukosi | 19 | 4 | 3.2,4.2 | Exercise power/offline recovery | Mains/WAN loss observed; no fabricated continuity or receipt | C3,C4 |
| 4.5 | Sibusiso | 20 | 4 | 3.5,4.3,4.4 | Run integrated evidence checkpoint | Both leads record pass or cut scope; tag only tested snapshot | C3,C4 |
| 5.1 | Babatunde | 17 | 4 | 1.5 | Draft consumer-first presentation spine | Team and household offer match current evidence | C1,C2 |
| 5.2 | Babatunde | 18 | 5 | 4.2 | Validate model, pilot catchment and buyer objections | Named-site evidence or explicit unknowns; arithmetic independently checked | C2 |
| 5.3 | Babatunde | 19 | 4 | 2.5,5.1,5.2 | Build five-minute pitch and one-slide economics | Every number has lineage; rehearsal timing recorded | C2,C4 |
| 5.4 | Babatunde | 21 | 4 | 3.5,5.3 | Audit claims against delivered demo | Built/simulated/specified labels consistent across spoken and written pack | C2,C3 |
| 5.5 | Babatunde | 23 | 3 | 5.4 | Rehearse hostile questions and short pitch | Another member checks answers against evidence index | C2 |
| 6.1 | Mutarisi | 21 | 4 | 4.5 | Prepare accessible offline visual fallback | Local assets open without internet; sim_ and limitation labels retained | C4 |
| 6.2 | Vukosi | 22 | 3 | 4.4 | Pack and test venue power/network kit | Inventory, charged kit and local connectivity test recorded | I |
| 6.3 | Ipeleng | 22 | 4 | 4.3,4.5 | Review proposed release for privacy and secrets | No personal/demo data leaks; remediation unresolved items explicit | I |
| 6.4 | Khutso | 23 | 4 | 5.4,6.1,6.3 | Assemble submission/evidence index | All links resolve; no absent artefact presented as delivered | C3 |
| 6.5 | Lethabo | 24 | 4 | 5.5,6.2,6.4 | Run offline dress rehearsal and release gate | Both leads review, missing prerequisites block publication | C1,C3,C4 |
| 7.1 | Khutso | 25 | 3 | 6.5 | Verify venue copy and judging checklist | Known-good package hash and earlier Sunday deadline visible | C3 |
| 7.2 | Sibusiso | 26 | 4 | 7.1 | Rehearse fallback and scoped hotfix procedure | Rollback works; no bypass of authority or review | C3 |
| 7.3 | Babatunde | 26 | 3 | 7.1 | Rehearse final pitch with all presenters | Timing, transitions and candid gaps checked | C1,C2,C4 |
| 7.4 | Lethabo | 27 | 3 | 7.2,7.3 | Final submission by 15:00 SAST | Final package and submission receipt recorded by human | C1,C2,C3,C4 |
| 7.5 | Ipeleng | 27 | 2 | 7.4 | Close temporary demo access and record handover | Revoked temporary identities and export/retention owner recorded | I |

Release-constraining path: 1.1/1.2/1.3 → 1.4 → 3.1 → 3.3 → 3.4 → 3.5 → 4.5 → 6.1 → 6.4 → 6.5 → 7.1 → 7.2/7.3 → 7.4. Joining prerequisites 3.2, 4.3, 4.4, 5.4 and 6.3 can also delay it. Calendar waits and resource availability dominate simple summed hours; this is a planning critical path, not a computed resource-constrained schedule. Any remediation failure blocks feature porting but not wireframes and business research.

Not on the minimum demo path: production cloud deployment, model fitting, fabricated appliance manufacture, national market estimates, additional ADRs, multi-estate scale and extra languages beyond reviewed source copy. Do not claim these delivered. Real-data/consumer deployment has a separate unresolved legal and operational gate.

## 2. Per-person packages

- [Lethabo Hoaeane](../../team/lethabo.md): 24 assumed leaf hours; ownership, reviews, dated tasks, interfaces, done criteria, three blockers and three outside-role contributions included.
- [Sibusiso Khumalo](../../team/sibusiso.md): 22 assumed leaf hours; ownership, reviews, dated tasks, interfaces, done criteria, three blockers and three outside-role contributions included.
- [Babatunde Adelusi](../../team/babatunde.md): 23 assumed leaf hours; ownership, reviews, dated tasks, interfaces, done criteria, three blockers and three outside-role contributions included.
- [Mutarisi Chibaya](../../team/mutarisi.md): 22 assumed leaf hours; ownership, reviews, dated tasks, interfaces, done criteria, three blockers and three outside-role contributions included.
- [Khutso Mothopa](../../team/khutso.md): 17 assumed leaf hours; ownership, reviews, dated tasks, interfaces, done criteria, three blockers and three outside-role contributions included.
- [Vukosi Khoza](../../team/vukosi.md): 17 assumed leaf hours; ownership, reviews, dated tasks, interfaces, done criteria, three blockers and three outside-role contributions included.
- [Ipeleng Constance Modise](../../team/ipeleng.md): 19 assumed leaf hours; ownership, reviews, dated tasks, interfaces, done criteria, three blockers and three outside-role contributions included.

## 3. Exact personal-file template and worked example

[team/TEMPLATE.md](../../team/TEMPLATE.md) is the complete committable template. [team/lethabo.md](../../team/lethabo.md) is fully filled as a planning example, with unknown tool/model and availability explicitly undeclared. It does not fabricate his activity. Each owner updates only their own actual status, and records affected contract owners before starting work.

## 4. Overlap register

[docs/OVERLAPS.md](../OVERLAPS.md) names the shared event/API, governance, UX, proof, retention, BOM and evidence surfaces. Declare conflicts, stop only dependent edits, obtain both-lead arbitration and save a versioned decision. No chat-only resolution.

## 5. Shared build log

[BUILD-LOG.md](../BUILD-LOG.md) contains the exact append-only format, mandatory-entry rules and factual assistant entry. [Five worked entries](../BUILD-LOG-EXAMPLES.md) are explicitly fictional sim_ examples from five people on Sep 17. They stay out of the real log.

## 6. Rules and agent files

[RULES.md](../../RULES.md) governs all humans and tools: engineering invariants, prohibited material, branches, reviews and merge rules. [AGENTS.md](../../AGENTS.md) tells assistants what to read, how to scope work, when human authority is needed and how to record work; it includes model-effort guidance. Both are complete files, not outlines.

## 7. Git workflow

Main plus short-lived branches; no per-person long-lived integration branches. Branch/commit naming, first-review assignment and two-lead review are in RULES. [.github/pull_request_template.md](../../.github/pull_request_template.md) captures WBS, evidence, data/secret review, business effect, tests and rollback. Both leads review; lead-authored changes require other-lead and domain nonauthor approval. The CI workflow fails on detected secrets or document-contract failures. Branch protection must be enabled and verified on GitHub; files alone do not enforce it. During the weekend, use a tested rollback if minimal hotfix review cannot happen; never bypass governance or secret scanning. Do not import contaminated history to save time.

## 8. Master owner checklist

Unchecked means proposed/not accepted, including tasks partially prepared by this audit; owners must verify actual acceptance.

### Lethabo Hoaeane

- [ ] 1.2 — Sep 13 — Verify old data cleanup and original-file inventory [I]; depends none.
- [ ] 1.5 — Sep 14 — Replace team copy and verify roster [C1]; depends none.
- [ ] 2.2 — Sep 15 — Complete twelve-screen design handoff [C3,C4]; depends 2.1.
- [ ] 2.5 — Sep 18 — Observe household walkthrough and revise [C4]; depends 2.3,2.4.
- [ ] 6.5 — Sep 24 — Run offline dress rehearsal and release gate [C1,C3,C4]; depends 5.5,6.2,6.4.
- [ ] 7.4 — Sep 27 — Final submission by 15:00 SAST [C1,C2,C3,C4]; depends 7.2,7.3.

### Sibusiso Khumalo

- [ ] 1.3 — Sep 13 — Install and exercise local/CI scanning [I]; depends none.
- [ ] 3.1 — Sep 15 — Freeze event/API/governance contracts [C3]; depends 1.4.
- [ ] 3.3 — Sep 17 — Port and verify human gate and proof path [C2,C3]; depends 1.4,3.1.
- [ ] 4.5 — Sep 20 — Run integrated evidence checkpoint [C3,C4]; depends 3.5,4.3,4.4.
- [ ] 7.2 — Sep 26 — Rehearse fallback and scoped hotfix procedure [C3]; depends 7.1.

### Babatunde Adelusi

- [ ] 5.1 — Sep 17 — Draft consumer-first presentation spine [C1,C2]; depends 1.5.
- [ ] 5.2 — Sep 18 — Validate model, pilot catchment and buyer objections [C2]; depends 4.2.
- [ ] 5.3 — Sep 19 — Build five-minute pitch and one-slide economics [C2,C4]; depends 2.5,5.1,5.2.
- [ ] 5.4 — Sep 21 — Audit claims against delivered demo [C2,C3]; depends 3.5,5.3.
- [ ] 5.5 — Sep 23 — Rehearse hostile questions and short pitch [C2]; depends 5.4.
- [ ] 7.3 — Sep 26 — Rehearse final pitch with all presenters [C1,C2,C4]; depends 7.1.

### Mutarisi Chibaya

- [ ] 2.3 — Sep 16 — Build or draw member/setup wireframes [C4]; depends 2.2.
- [ ] 2.4 — Sep 17 — Build or draw operator/subject wireframes [C3,C4]; depends 2.2.
- [ ] 3.4 — Sep 18 — Connect one synthetic end-to-end flow [C4]; depends 2.4,3.3.
- [ ] 6.1 — Sep 21 — Prepare accessible offline visual fallback [C4]; depends 4.5.

### Khutso Mothopa

- [ ] 1.4 — Sep 14 — Assemble clean-intake gate evidence [C3]; depends 1.1,1.2,1.3.
- [ ] 2.1 — Sep 14 — Map requirements to five journeys [C3,C4]; depends none.
- [ ] 3.5 — Sep 19 — Reproduce evidence and resolve TRL wording [C3]; depends 3.2,3.3,3.4.
- [ ] 6.4 — Sep 23 — Assemble submission/evidence index [C3]; depends 5.4,6.1,6.3.
- [ ] 7.1 — Sep 25 — Verify venue copy and judging checklist [C3]; depends 6.5.

### Vukosi Khoza

- [ ] 3.2 — Sep 16 — Port minimal synthetic edge producer [C3]; depends 1.4,3.1.
- [ ] 4.2 — Sep 17 — Measure load and obtain BOM quotes [C3]; depends none.
- [ ] 4.4 — Sep 19 — Exercise power/offline recovery [C3,C4]; depends 3.2,4.2.
- [ ] 6.2 — Sep 22 — Pack and test venue power/network kit [I]; depends 4.4.

### Ipeleng Constance Modise

- [ ] 1.1 — Sep 13 — Verify credential/password remediation [I]; depends none.
- [ ] 4.1 — Sep 15 — Specify lawful data/rights and deletion controls [C3,C4]; depends 2.1.
- [ ] 4.3 — Sep 19 — Exercise operator, tenant and duress abuse cases [C3,C4]; depends 3.3,4.1.
- [ ] 6.3 — Sep 22 — Review proposed release for privacy and secrets [I]; depends 4.3,4.5.
- [ ] 7.5 — Sep 27 — Close temporary demo access and record handover [I]; depends 7.4.

Internal-only leaves: 6/35. They protect safe intake and delivery; avoid expanding them into unrelated infrastructure work. Weekly review Sep 13 and 20; daily blocker review thereafter, plus Sep 24 release gate.

## 9. Calendar

The brief calls this a thirteen-day calendar but asks for Sep 13–27 inclusive, which is fifteen days. Sep 13–25 inclusive is thirteen; Sep 26–27 are event continuation. **The integrated evidence checkpoint is Sep 20 and feature freeze is Sep 24**, matching `docs/HANDOVER.md` and `docs/TEAM.md`. Earlier deadline 15:00 SAST Sep 27 controls.

| Date | Due / owners | Gate or rule |
|---|---|---|
| Sep 13 | 1.1 Ipeleng: Verify credential/password remediation; 1.2 Lethabo: Verify old data cleanup and original-file inventory; 1.3 Sibusiso: Install and exercise local/CI scanning | Dependencies and reviewer availability govern |
| Sep 14 | 1.4 Khutso: Assemble clean-intake gate evidence; 1.5 Lethabo: Replace team copy and verify roster; 2.1 Khutso: Map requirements to five journeys | GATE 1: evidence-backed clean intake; no feature code if failed |
| Sep 15 | 2.2 Lethabo: Complete twelve-screen design handoff; 3.1 Sibusiso: Freeze event/API/governance contracts; 4.1 Ipeleng: Specify lawful data/rights and deletion controls | Dependencies and reviewer availability govern |
| Sep 16 | 2.3 Mutarisi: Build or draw member/setup wireframes; 3.2 Vukosi: Port minimal synthetic edge producer | Dependencies and reviewer availability govern |
| Sep 17 | 2.4 Mutarisi: Build or draw operator/subject wireframes; 3.3 Sibusiso: Port and verify human gate and proof path; 4.2 Vukosi: Measure load and obtain BOM quotes; 5.1 Babatunde: Draft consumer-first presentation spine | Babatunde starts presentation/alignment |
| Sep 18 | 2.5 Lethabo: Observe household walkthrough and revise; 3.4 Mutarisi: Connect one synthetic end-to-end flow; 5.2 Babatunde: Validate model, pilot catchment and buyer objections | Dependencies and reviewer availability govern |
| Sep 19 | 3.5 Khutso: Reproduce evidence and resolve TRL wording; 4.3 Ipeleng: Exercise operator, tenant and duress abuse cases; 4.4 Vukosi: Exercise power/offline recovery; 5.3 Babatunde: Build five-minute pitch and one-slide economics | Dependencies and reviewer availability govern |
| Sep 20 | 4.5 Sibusiso: Run integrated evidence checkpoint | GATE 2: review integrated evidence; cut failed capabilities |
| Sep 21 | 5.4 Babatunde: Audit claims against delivered demo; 6.1 Mutarisi: Prepare accessible offline visual fallback | Dependencies and reviewer availability govern |
| Sep 22 | 6.2 Vukosi: Pack and test venue power/network kit; 6.3 Ipeleng: Review proposed release for privacy and secrets | Dependencies and reviewer availability govern |
| Sep 23 | 5.5 Babatunde: Rehearse hostile questions and short pitch; 6.4 Khutso: Assemble submission/evidence index | Dependencies and reviewer availability govern |
| Sep 24 | 6.5 Lethabo: Run offline dress rehearsal and release gate | GATE 3: feature freeze; public release only after approvals |
| Sep 25 | 7.1 Khutso: Verify venue copy and judging checklist | Venue: awards 15:00, hacking 16:00; verify logistics |
| Sep 26 | 7.2 Sibusiso: Rehearse fallback and scoped hotfix procedure; 7.3 Babatunde: Rehearse final pitch with all presenters | Dependencies and reviewer availability govern |
| Sep 27 | 7.4 Lethabo: Final submission by 15:00 SAST; 7.5 Ipeleng: Close temporary demo access and record handover | Submit by 15:00 SAST, earlier supplied deadline |

§11 check: seven complete packages; estimates labelled; leaves bounded, ownership/dependencies/acceptance present; full coordination files supplied; fifteen-day discrepancy resolved. Proceed to business translation. Human schedule acceptance pending.
