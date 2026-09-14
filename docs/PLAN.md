# PLAN — GKHack26 execution: corrections, deployability evidence, and a seven-person pipeline

> The whole shape of the build, in one place, so every person and every AI tool can see more than their own slice.
>
> **This does not replace the WBS in `docs/audit/05-team-operating-system.md`.** It corrects, extends and sequences it. Where a WBS ID exists it is kept; new items are marked **NEW**.
>
> Authored 14 September 2026. Ticked in `docs/CHECKLIST.md`. Read `docs/MASTER-CONTEXT.md` first.

---

## Context

Team SONAR is selected for **GKHack26** — 25–27 September, Centurion, hosted with **CPSI**, powered by **Telkom**. Our track is **Blockchain for Impact Use**.

The organisers have posted that they are *"still very worried about the overuse of AI in your solution which tends to move off from the sense of reality and provide an uneasiness to scale afterwards"*, with three instructions: **sharpen the project overview**, **put real figures in the Lean Canvas**, and **make the UVP show competitor awareness**.

**That worry is not about using AI to build.** It is about solutions that are *innovative but not implementable*. VUKA already holds the strongest available answer — the load-bearing parts contain no ML at all — but it is buried in the repo rather than in what a judge reads.

The external audit has merged (PR #1 → PR #2), scoring **17/40** and producing a bottom-up funnel, five journeys, a 35-leaf WBS, a red-team list and a contradiction sweep. Since then: Task 1, G6/G7 remediation, 12 wireframes, two built Figma screens, Task 3. Sibusiso merged PR #2, signed the intake gate, and started `contracts/openapi.yaml`.

**Decisions already taken:** TRL 4 with a named ceiling · Phase 1 before Phase 2 · per-person AI tooling stays personal to each member, with only *content* landing in this repo via PR.

---

## The governing rule: real data, or labelled absence

The organisers' worry resolves to one test — **is this real?** The standing rule:

| Real and usable | Real but restricted | Not yet real — must be labelled |
|---|---|---|
| SAPS quarterly stats (678 precincts, 9 provinces) | **15,712 claim records** — analysed under a prior engagement, **never redistributed**; aggregate context only | Acoustic dataset (must be recorded) |
| 709 geocoded suburbs (cached, checked in) | Predecessor code (ported file-by-file, reviewed) | Hardware BOM (must be quoted) |
| PSiRA 2024/25 Annual Report figures | | Household demand (must be interviewed) |
| Stats SA industry figures (R87bn, 2024) | | Bias evaluation (not measured) |
| Measured latency, **n = 10** | | Any per-user pricing acceptance |
| The forecast that **loses** (MAE 0.484 vs 0.246) | | |

**Claim tagging is mandatory in every artefact from here** — `FACT` / `ESTIMATE` / `ASSUMPTION` / `PROPOSED`. Anything simulated keeps its `sim_` prefix in code *and* is named aloud. This is the single discipline that answers "uneasiness to scale," because it lets a judge see we know the difference.

---

# PHASE 1 — Corrections, competitors, TRL *(execute first)*

## A1 · Three claims that are wrong or unverified

### The prize premise
Strategy was anchored on "no cash prize; 90-day deployment with a named institution." The official event page says verbatim: *"Yes there will be cash prizes (adn likely gadgets too) but don't let that be the motivator."* The deployability strategy survives regardless — theme, CPSI host and "commercially viable use cases" all point that way — but **tag it `ASSUMPTION`** and confirm with `sonke@geekulcha.dev`. `P1.8`

### The headline market stat is wrong by roughly 4×
The live canvas says *"~2.7m registered security officers versus roughly 180k police"* — that compares a **cumulative-ever registration count** against a **current headcount**.

| | Correct | Source |
|---|---|---|
| Active private security officers | **~637,675** (31 Mar 2025) | PSiRA 2024/25 Annual Report |
| SAPS | **155,231 sworn / 187,681 total** | SAPS, Mar 2025 |
| Ratio | **≈ 4:1** | — |

Also update industry size to **R87bn (2024)** — guarding R34.8bn · monitoring/surveillance R17.9bn · CIT R14.4bn · armed reaction R14.3bn. By buyer: business R66.3bn / households R11.6bn / **government R7bn**. `P1.1` `P1.2`

**The corrected number is still overwhelming.** Four private officers for every police officer is a serious market statement. It does not need inflating, and it survives being checked — which the old one does not.

### Stale figures live on the public profile
Still says "27 ADRs" (actual **25**) and "440 test cases" (unreproducible; `git grep` finds **510 test-function definitions**). `docs/EVIDENCE.md` already holds the corrected numbers and the exact commands. `P1.3`

## A2 · Settle TRL at 4, with the ceiling named

The repo currently states **three contradictory positions**: `docs/00-SPEC.md` says 5, `docs/01-ARCHITECTURE.md` says 5, `docs/EVIDENCE.md` says *"do not publish TRL 5 as locally verified"*, and the submission template asks for 3.

Verified definitions: TRL 3 proof-of-concept · **TRL 4 laboratory validation** · TRL 5 component validation in a *relevant* environment · TRL 6 demonstrated in a relevant environment · TRL 7 operational environment.

> **Position: TRL 4**, two subsystems argued at 5, and the four reasons for not being at 6 published.

Hardware is unfabricated and no household has run this. A home-security product cannot claim "relevant environment" from three laptops on a tunnel. **Record as ADR-0027.** `P1.4`

**Why this is the winning move rather than the modest one.** Every team in the room will claim the highest number they think they can get away with. A team that publishes a *lower* number with four specific reasons and a costed path to the next one is the only team in the room whose TRL claim a judge can believe.

## B1 · Rewrite the project overview — lead with the AI answer

Open on the line already in `README.md`:

> *"The load-bearing parts — the human gate, the two-signature rule, the hash chain, the public anchor, the three-second audio ring buffer — contain no machine learning at all."*

Then: four layers → corrected figures → TRL 4 with the ceiling. `P1.5`

## B2 · The competitor block — the top unmet organiser instruction

A repo-wide grep for competitor names returns **zero matches**. This is the single clearest instruction we have not acted on.

**Vumacam** is the sharpest comparison: 2,000+ ANPR cameras, roughly 9.68m plates/day, partnered with **Fidelity ADT**. Published criticism of it maps one-to-one onto VUKA's design:

| Documented criticism of the incumbent | VUKA mechanism | Where |
|---|---|---|
| *"no transparency or mechanism for public accountability about how thoroughly cleaning of watchlists is done"* | Lazy decay `0.5^(days/7)` — **forgets with no human required to clear you** | `docs/00-SPEC.md` §3.3 |
| *"any plate number could be added without any vetting"* | Two-of-two signatures; **the attempt is itself anchored** | F13, ADR-0022 |
| *"who owns the data, how long stored, what safeguards"* | Vectors not images; retention TTL; subject access; public anchor | E2, E8, F14 |
| *"carry out police functions without the same oversight"* | Machine ceiling `watch_candidate`; **no code path sets `flagged`** | E1, ADR-0002 |

⚠️ Intelwatch/Right2Know's complaint against Vumacam **escalated to an official Information Regulator complaint** — live South African precedent for this exact product class. It is both our differentiator **and** our warning. `P1.6`

**Also name what they do better.** Vumacam has scale, installed base, and a working commercial channel we do not have. A competitor block that only lists their failures reads as marketing; one that concedes their advantages reads as analysis.

## B3 · Economics gaps flagged and never closed

VAT and channel cost are missing from the R137 margin, and **no LTV, CAC, payback, churn or break-even figure exists anywhere in the repo**. `P1.10` `P1.11`

*(VAT registration is only compulsory above **R2.3m** turnover from 1 Apr 2026 — at pilot scale this is a disclosure, not a cost.)*

## B4 · Do not over-fit the criteria

The four × 10 criteria are the **selection** criteria. The workspace currently reads *"Criteria: There are 0 criterions"* for the event itself; the real ones will be loaded. When they publish, re-read them before further content work and refresh `docs/MASTER-CONTEXT.md` the same day. `P1.9`

---

# PHASE 2 — Deployability and compliance

This phase is where "would it survive contact with reality" is actually answered.

## C1 · PSiRA — the blocker with no documented answer

*"We integrate with armed response, we do not dispatch"* is **probably insufficient**.

The Private Security Industry Regulation Act 56 of 2001, s1, defines "security service" to include *installing or servicing security equipment* and *monitoring signals from electronic security equipment* — and "security equipment" expressly includes alarms and CCTV. **KHAYA is the former. UMOJA is the latter.** s20(1)(a) is a blanket prohibition, and **no SaaS exemption exists**. "Security service provider" is defined to *include* the unregistered. s38: first conviction up to **5 years**. PSiRA's own 2022 research argues for a *wider* remit over technology providers, not a narrower one.

**Individual flag-gate reviewers may themselves need registration as security officers.** Fees are trivial (~R7,900 business, ~R250 individual) — the cost is process and time, not money.

> **The structure:** the **PSiRA-registered security company is the party legally rendering** the monitoring and flag service; VUKA is its licensed technology supplier.

This matches the "sell through, don't replace" channel strategy already in the business docs. It needs an attorney's opinion before final go-to-market messaging. `P2.1`

## C2 · POPIA — the asymmetry that changes the architecture

**There is no "legitimate interest" ground for biometrics.** s11(1) offers it for ordinary personal information. s27(1) does **not** for special personal information.

| Data | Class | Lawful basis available |
|---|---|---|
| Number plate | Ordinary PI | Legitimate interest available (with a right to object) |
| **Face embedding** | **Special PI (s26)** | Only consent · legal right · public interest with safeguards · deliberately made public · **Regulator authorisation (s27(2))** |

A non-consenting passer-by fits none of them cleanly. **"Vectors not images" is not a workaround** — s1 defines biometrics by *technique*, not by storage format.

> ### Architecture decision, not policy
> **Default to discarding any embedding that does not match an enrolled, consenting resident.**
>
> Detect-and-characterise without retention may fall outside POPIA entirely. Storing a matchable embedding of a non-enrolled person does not. Person-versus-animal classification is fine. **Record as an ADR.** `P2.2` `P2.3`

**Also: s57(1)(a) prior authorisation.** Linking unique identifiers across different responsible parties for a new purpose needs the Regulator's **prior** authorisation. A neighbourhood database linking embeddings and plates contributed by separate households is close to the paradigm case — and a bigger gate than Information Officer registration. `P2.4`

## C3 · Get in front of the rule being written for our exact market

The Information Regulator published a draft **Code of Conduct for Gated Access Areas** (30 April 2026; comments closed 14 May) covering CCTV, ID and biometric scanning, and facial recognition at gated premises — applying to owners **and their technology service providers**.

Direction of travel: **7–30 day retention** with auto-overwrite, data minimisation, and facial recognition singled out for extra justification.

**That is estates and body corporates — our named launch channel.** Build to it now; submit comment when it reopens. `P2.6`

## C4 · RICA — the existing design is already right

RICA targets *communications*. The South African comparator **ShotSpotter** (Cape Town 2016, Lavender Hill 2022) deliberately *"does not use microphones"* — acoustic sensors tuned to booms, pops and bangs. VUKA's 3-second ring buffer and label-not-audio design is the same choice, arrived at independently.

> **Never attach an audio clip as evidence.** That creates a RICA interception question *and* a POPIA one — voice recognition is expressly biometric. `P2.7`

## C5 · CPSI is a post-deployment amplifier, not a way in

Private entrants qualify only where the innovation is **already implemented in the public sector and operational for at least one year**. CPSI cannot be the 90-day plan.

| Realistic in 90 days | Not realistic in 90 days |
|---|---|
| CSD registration (free, 5–10 working days) | Winning or being paid on a national tender |
| B-BBEE EME affidavit | SITA transversal listing |
| Tax clearance | Any CPSI award |
| An **already-open** tender | |
| A municipal quotation-based purchase (3+ written quotes, weeks not months) | |
| A pilot MOU | |

**SITA publishes "Deployment Guidelines: Surveillance and Access Control (SAC) Solutions"** — directly on point for KHAYA. Pull it and read it. `P2.8` `P2.9`

## C6 · Finance — the cheap wins

- **B-BBEE EME:** turnover ≤ R10m → automatic Level 4; **≥51% black-owned → Level 2; 100% → Level 1**, by sworn affidavit, no audit. Directly affects PPPFA preference points.
- **s11D R&D incentive:** 150% deduction, sunset **31 Dec 2033**, DSI pre-approval required *before* claiming.
- **SBC tax** (YoA Apr 2026–Mar 2027): 0% to R99k · 7% to R365k · 21% band to R550k · 27% above.
- **SEDA and SEFA merged into SEDFA** (1 Oct 2024) — target SEDFA, not the old names.
- **TIA Seed Fund** is the best fit for the hardware/AI R&D stage. `P2.10`

---

# The pipeline — how the seven of us connect

```text
REAL DATA IN                 REPO PIPELINE                      BUSINESS PIPELINE
─────────────                ─────────────                      ─────────────────
SAPS open stats  ──┐
709 geocoded     ──┤
PSiRA/StatsSA    ──┤
                   ▼
            KHUTSO  requirements → journeys → evidence index ──┐
                   │                                           │
            IPELENG lawful basis + abuse cases ────────────────┤
                   │  (gates what may be built at all)         │
                   ▼                                           │
            SIBUSISO contracts (OpenAPI/events) ── FROZEN ──┐  │
                   │                                        │  │
        ┌──────────┼──────────┐                             │  │
        ▼          ▼          ▼                             │  │
    VUKOSI     MUTARISI    SIBUSISO                         │  │
    edge +     12 screens  human gate +                     │  │
    BOM +      + fallback  F14 subject access               │  │
    power                       │                           │  │
        └──────────┬────────────┘                           │  │
                   ▼                                        │  │
            LETHABO  design review · licence register ·      │  │
                     TRL sign-off · release gate ───────────┤  │
                   │                                        │  │
                   ▼                                        ▼  ▼
            EVIDENCE (docs/EVIDENCE.md, BUILD-LOG, ADRs) ──► BABATUNDE
                                                             economics engine
                                                             + claim audit
                                                             + pitch
                                                                  │
                                                                  ▼
                                                        THE USE-CASE OUTPUT
```

> **The rule that makes this a pipeline and not seven people:** *nothing moves right without evidence.*
>
> Khutso gates entry · Ipeleng gates legality · Sibusiso freezes the contract everyone builds against · Lethabo gates release · Babatunde converts verified capability into commercial language — **and may not claim anything Khutso's evidence index does not carry.**

---

# The team operating system

Seven people across four universities, driving **different AI tools with no shared memory**. Therefore **all coordination is through files in the repo**, never through any one tool's chat history.

## The shared bus

| File | Role | Cadence |
|---|---|---|
| `docs/MASTER-CONTEXT.md` | Theme, criteria, showcase, honesty ledger | **Read first, every session** |
| `team/<name>.md` | Personal state: operating spec, current task, claimed files, blockers, running log | Every work session |
| `docs/OVERLAPS.md` | Shared-surface register — claim before editing a shared contract | Before touching shared files |
| `docs/BUILD-LOG.md` | **Append-only. Everyone writes. Every time** | Every meaningful change |
| `docs/CHECKLIST.md` | What we said we'd do, ticked, with amendments visible | Every completed item |
| `templates/BUSINESS-HANDOFF.md` | The engineering → Babatunde translation | Every capability change |

**The BUILD-LOG entry format is already mandatory and already correct** — *Changed / Evidence / Decision / Needs-blockers / Business handoff / Next.* The discipline to enforce, not redesign:

> Every entry says **what, why, how, when and for what reason**. A correction is a **new entry** — never a rewrite of someone else's history.

## The criteria recall — enforced, not remembered

A standing block now sits at the top of `RULES.md` and `AGENTS.md`:

> Before any iteration, any new concept, and any artefact that reaches a judge: re-read `docs/MASTER-CONTEXT.md`. State which criterion the work serves (C1–C4) and how it answers *"Would a real user trust and use this?"* If it serves none, say so and justify the work anyway — or drop it.

Every BUILD-LOG entry and every CHECKLIST row carries its criterion tag, so at any moment we can see coverage across all four rather than over-serving one.

## The handoff to Babatunde — four new fields

`templates/BUSINESS-HANDOFF.md` was good but missed exactly what is needed to write the commercial case. It now also asks for:

- **Canvas block affected** — which Lean Canvas box this changes.
- **Cost to build and cost to run** — actual hours and direct spend, plus marginal running cost per household if it changes. *Never invented; "unknown" is a valid answer.*
- **User-journey step touched** — which journey, and which screen ID (S01–S12).
- **Why it matters commercially, in one sentence a non-engineer can repeat.**

This is what turns *"we shipped F14 subject access"* into:

> *"A person can now hold their own file, with a proof a stranger can verify. That is the POPIA subject-access obligation discharged, it is the thing no competitor offers, it sits in journey J4 at screen S11, it cost roughly 14 hours and nothing per month to run."*

---

# The showcase — the single most important thing to demonstrate

> ## `GET /v1/subjects/{id}/record`
> ### A person asks for their own file and gets it, with an anchor proof a stranger can verify independently.

It is the right showcase because **all four criteria land at once**: it is the **user journey** made concrete; it is the **innovation** (nobody else offers it); it is **progress** (working code, not a diagram); and it demonstrates the **team's thesis** — a system that publishes the record of deciding *not* to accuse someone.

It is also the direct answer to the AI-overuse worry, because **the part being demonstrated contains no machine learning at all.**

**Second showcase, if time allows:** the refused single-signature whitelist attempt — an operator tries to whitelist alone, is refused, and *the refusal is itself anchored*. Thirty seconds, and it shows the insider-threat control the entire category leaves undefended.

Everything else in the demo is supporting material for these two moments.

---

# Per-person specifications

Each runs **Research → Workflow → Execution → Rules → Setup → Hands off to**. The workflow for everyone follows the same loop:

```text
UNDERSTAND → PLAN → EXECUTE → INSPECT → TEST → CHALLENGE → FIX → RECHECK → HANDOFF
```

Existing WBS IDs are kept; **NEW** items are marked. Each person's own operating spec — effort, behaviour, domain rules, current task — lives at the top of their `team/<name>.md`.

---

## 1 · Lethabo Hoaeane — UNISA · Co-lead · architecture, product, UX
*Reviewed by Sibusiso. Reviews Mutarisi, Ipeleng, Babatunde.*

**Real data owned:** the model registry (weights actually shipped, licences actually attached), the 14 screen specs, the ADR record.

**Research**
- **G12 model licence register — the urgent one.** Ultralytics **YOLOv8 is AGPL-3.0** with a separate commercial licence; several **InsightFace** pretrained weights are **non-commercial research only**. This repo is MIT. Verify against the weights actually shipped, not the docs. *A second licensing finding after G7 reads as a pattern, not a mistake.*
- TRL 3/4/5/6 evidence requirements, to write ADR-0027 defensibly.

**Execution**

| Item | Due | Note |
|---|---|---|
| 1.2 verify old-data cleanup | Sep 13 | ✅ effectively done via G7 |
| 1.5 replace team copy, verify roster | Sep 14 | must carry the **4:1** correction |
| 2.2 twelve-screen design handoff | Sep 15 | 12 already in `docs/wireframes/` + 2 built in Figma |
| **NEW** G12 licence register | Sep 15 | model · version · sha256 · **licence** · commercial position |
| **NEW** ADR-0027 TRL decision | Sep 16 | the single position + the ceiling |
| **NEW** competitor block (with Babatunde) | Sep 16 | the Vumacam mapping table, B2 |
| 2.5 household walkthrough | Sep 18 | **real people, or labelled as not done** |
| 6.5 dress rehearsal + release gate | Sep 24 | |
| 7.4 final submission | Sep 27, 15:00 | |

**Rules** · Never claim a capability the evidence index does not carry · a behaviour change needs docs **and** a BUILD-LOG entry in the same PR · duress states must be **visually identical** to normal ones — no observable UI, timing or network difference · you are the author of record for ADRs; **never edit one, supersede it.**

**Hands off to** → Mutarisi (screens), Babatunde (verified claims), Khutso (ADRs and evidence).

---

## 2 · Sibusiso Khumalo — Wits · Co-lead · backend, ledger, CI, demo
*Reviewed by Lethabo. Reviews Vukosi, Khutso.*

**Real data owned:** the evidence chain, the anchor, CI runs, the frozen contract.

**Research** · OpenTimestamps calendar reliability and what an independent verifier actually needs · the s57(1)(a) linking question with Ipeleng, since it constrains the data model · branch protection once the repo goes public (**G17** — currently impossible on a private free-tier repo).

**Execution**

| Item | Due | Note |
|---|---|---|
| 1.3 install and exercise scanning | Sep 13 | ✅ done |
| 3.1 freeze event/API/governance contracts | Sep 15 | `contracts/openapi.yaml` in flight |
| 3.3 human gate + proof path | Sep 17 | **no code path sets `flagged`** — prove it by test |
| **NEW** F14 subject access end-to-end | Sep 18 | **the demo that wins this theme** |
| **NEW** discard-by-default embeddings | Sep 18 | from C2 — architecture, not configuration |
| **NEW** decide the OTS calendar question | Sep 18 | self-host + `ots upgrade`, or concede the dependency |
| 4.5 integrated evidence checkpoint | Sep 20 | |
| **NEW** branch protection when public | Sep 20 | closes G17 |
| 7.2 fallback + hotfix rehearsal | Sep 26 | |

**Rules** · Contract tests assert exact request/response **shapes**, not status codes · two-of-two signatures on whitelist, disarm, threshold change and delete — and a **refused attempt is itself an anchored event** · the verifier returns the **first broken link by index**, never a boolean · never `--no-verify`.

**Hands off to** → Mutarisi and Vukosi (the frozen contract), Khutso (reproducible evidence), Babatunde (*what is actually built*).

---

## 3 · Babatunde Adelusi — Pretoria · business, pitch, validation
*Reviewed by Lethabo.* **Produces the final use-case output.**

**Real data owned:** buyer interviews, BOM quotes (from Vukosi), the corrected market figures, the claim audit.

**Research**
- **Replace the 2.7m stat** with **~637,675 active vs ~155–188k SAPS ≈ 4:1**, cited to PSiRA 2024/25.
- Industry **R87bn (2024)**; **government segment R7bn/yr** — the concrete number for a public-sector pitch.
- Name a **real estate or residents' association** and establish consenting contact capacity. The audit funnel is honest but hypothetical: 400 catchment → 200 SAM → 50 SOM = **R179,400/yr** at steady state. *"The 764 hotspots are not 764 customers."*
- Competitor pricing: Fidelity ADT and Vumacam actual monthly rates, to position R299.
- **SEDFA, TIA Seed Fund, s11D** as the funding path.

**Execution**

| Item | Due | Note |
|---|---|---|
| 5.1 consumer-first presentation spine | Sep 17 | |
| 5.2 validate model, catchment, objections | Sep 18 | **real named site, or labelled `ASSUMPTION`** |
| **NEW** economics engine | Sep 18 | ARPU · gross & contribution margin · **CAC · LTV · LTV:CAC · payback · churn · burn · runway · break-even month**, with VAT and channel cost added to the R137 |
| 5.3 five-minute pitch + one-slide economics | Sep 19 | |
| 5.4 audit claims against the delivered demo | Sep 21 | **every number traced to `docs/EVIDENCE.md`** |
| 5.5 rehearse hostile questions | Sep 23 | including the three blockchain attacks |
| 7.3 final pitch rehearsal | Sep 26 | |

**Rules** · Every figure carries `FACT`/`ESTIMATE`/`ASSUMPTION` and a provenance line · never call a company a partner without evidence · **never sell street-level risk as an underwriting input** — that is redlining, and it is already refused in our own documents · no personal data, biometric templates, footage or tokens, at any price · **if the demo does not do it, the pitch does not claim it.**

### ▶ The use-case output Babatunde produces at the end

One document, assembled last, consuming everyone's verified evidence:

1. **The buyer** — named segment, named candidate site, who signs, who pays.
2. **The offer** — VIGIL free · VIGIL+ R99 · KHAYA R299/mo or R3,999 + R149 · security licence R35/subscriber · patrol optimiser R12,000/control room · estate R5,500/mo · insurer R40/member · claim record R15.
3. **Unit economics** — the full engine, VAT and channel included, each line tagged.
4. **The market** — 4:1, R87bn, R7bn government, and the **bottom-up** funnel (not the 764-suburb top-down one).
5. **Competitive position** — the Vumacam mapping table, plus what they do better.
6. **Regulatory path** — PSiRA structure, POPIA basis, retention posture, IO registered, CSD + EME done.
7. **TRL 4 and the costed path to 6** — BOM quoted, pentest scoped, pilot designed.
8. **What we refuse to sell**, and why that refusal is the moat.
9. **The 90-day ask** — what a named institution would actually get, and what it would cost them.

---

## 4 · Mutarisi Chibaya — Pretoria · frontend, integration
*Reviewed by Lethabo.*

**Real data owned:** what a real person can actually complete, on a real screen, on a real phone.

**Research** · the 12 committed `.dc.html` references and the two built Figma screens · budget-Android rendering (the target device is 2 GB) · accessibility basics: contrast, touch targets, and a keyboard path for the subject portal.

**Execution**

| Item | Due | Note |
|---|---|---|
| 2.3 member/setup wireframes S01–S07 | Sep 16 | narrow viewport, checked by Lethabo |
| 2.4 operator/subject wireframes S08–S12 | Sep 17 | must include **stale, error and rights** states |
| 3.4 one synthetic end-to-end flow | Sep 18 | candidate → human review → receipt → record |
| **NEW** subject-access screen | Sep 19 | the front end of Sibusiso's F14 — **the demo moment** |
| 6.1 accessible offline visual fallback | Sep 21 | local assets, opens with no internet |

**Rules** · **Duress states must be visually identical to normal states** — no observable difference in UI, timing or network · stale data is **greyed and stamped with its age**, never blank and never silently fresh · exactly **one confidence number** per detection, with 2–5 factor chips explaining why — never raw per-model scores · **"Verify" is always visually primary; "Dispatch armed response" is always the quietest control on the screen** · anything simulated carries a visible `SIMULATED` tag.

**Hands off to** → Lethabo (review), Babatunde (screens for the pitch), Khutso (task-completion evidence).

---

## 5 · Khutso Mothopa — Wits · system analyst, evidence, traceability
*Reviewed by Sibusiso.* **Gates what enters the record.**

**Real data owned:** `docs/EVIDENCE.md` — the single source of truth for every number the team says out loud.

**Research** · re-derive every headline figure and record the exact command · the TRL evidence table against the verified definitions · which SAPS towns are actually covered (the claim is 17 of 18 — **verify the list**).

**Execution**

| Item | Due | Note |
|---|---|---|
| 1.4 clean-intake gate evidence | Sep 14 | ✅ gate now approved |
| 2.1 map requirements to five journeys | Sep 14 | F/N/E IDs → journey steps |
| **NEW** own `docs/MASTER-CONTEXT.md` | Sep 14 | theme, criteria, showcase, honesty ledger |
| **NEW** own and run `docs/CHECKLIST.md` | Sep 14 | every Phase 1/2 item entered on day one |
| **NEW** correct the 2.7m stat everywhere | Sep 15 | canvas, deck, public profile, docs |
| 3.5 reproduce evidence + resolve TRL | Sep 19 | now has the decision rule from A2 |
| **NEW** run the test suites | Sep 19 | resolve "440" vs 510 with a real collected count, or retire the claim |
| **NEW** criteria-coverage sweep | Sep 22 | show C1–C4 all served; flag any over-served |
| 6.4 submission/evidence index | Sep 23 | every link resolves |
| 7.1 verify venue copy + judging checklist | Sep 25 | refresh MASTER-CONTEXT if criteria published |

> **Khutso is the team's memory.** Three artefacts are owned here and nowhere else: `docs/EVIDENCE.md` (what is true), `docs/MASTER-CONTEXT.md` (what we are being judged on), `docs/CHECKLIST.md` (what we said we would do). When the real judging criteria are published, Khutso refreshes MASTER-CONTEXT and re-tags the checklist — **that is the mechanism that stops the team optimising for the old four.**

**Rules** · A historical count is not a current result · every measured figure travels with method, configuration and **sample size** (318 ms is always n = 10) · absent evidence stays **unverified** — never inferred · **if a number cannot be reproduced, it does not ship.**

**Hands off to** → everyone. **Babatunde may claim nothing this index does not carry.**

---

## 6 · Vukosi Khoza — Wits · edge, device, hardware, power
*Reviewed by Sibusiso.*

**Real data owned:** **real supplier quotes** and **real measured power draw** — currently the team's thinnest real-data area, and the one capping our TRL.

**Research** · **Real BOM quotes** from real suppliers for ARM SoC + NPU (~R2,200 `ESTIMATE`), LiFePO4 + BMS (~R1,100), enclosure/tamper/PoE (~R600) — the ~R3,900 → R3,000-at-1k figures are currently **unquoted estimates** · measured wattage → a real 48–72h runtime claim · **SITA "Deployment Guidelines: Surveillance and Access Control (SAC) Solutions"**, which directly governs this appliance for public-sector deployment.

**Execution**

| Item | Due | Note |
|---|---|---|
| 3.2 minimal synthetic edge producer | Sep 16 | `sim_` fixtures only |
| 4.2 measure load + obtain BOM quotes | Sep 17 | **real quotes with dates** — this converts `ESTIMATE` → `FACT` |
| 4.4 power/offline recovery | Sep 19 | observe real mains/WAN loss; **no fabricated continuity** |
| **NEW** read + summarise the SITA SAC guide | Sep 20 | feeds Babatunde's public-sector path |
| 6.2 pack and test venue power + network kit | Sep 22 | |

**Rules** · Never state a runtime you have not measured · tamper and heartbeat: the **absence** of a heartbeat must itself be timestamped evidence · the appliance decides **locally** — the siren still fires with no uplink · a missing instrument is recorded as missing, **not estimated silently**.

**Hands off to** → Babatunde (BOM → unit economics), Khutso (measured evidence), Sibusiso (the sensor contract).

---

## 7 · Ipeleng Constance Modise — TUT · security, privacy, red team
*Reviewed by Lethabo.* **Gates what may lawfully be built.**

**Real data owned:** the threat model, the abuse-case results, the lawful-basis determination.

**Research — the heaviest research load on the team**
- **PSiRA** (C1): which registration category, whether individual reviewers need registering, and the contracting structure that puts the registered partner as the party rendering the service.
- **POPIA** (C2): the s27 asymmetry, the s57(1)(a) prior-authorisation question, and whether discard-by-default removes the problem.
- The **draft Gated Access Areas Code** (C3) — retention 7–30 days, minimisation, FRT scrutiny.
- **RICA** (C4) and the ShotSpotter precedent.
- **Register the Information Officer** — free, online, under 30 minutes. No excuse before any pilot.

**Execution**

| Item | Due | Note |
|---|---|---|
| 1.1 verify credential remediation | Sep 13 | ✅ four rotated, both repos purged |
| 4.1 lawful data/rights + deletion controls | Sep 15 | now carries the s27 finding |
| **NEW** PSiRA position paper | Sep 16 | trigger · category · structure · the open question for counsel |
| **NEW** POPIA position paper + ADR | Sep 17 | discard-by-default is an **architecture** decision |
| **NEW** register the Information Officer | Sep 17 | |
| 4.3 operator/tenant/duress abuse cases | Sep 19 | as **executable tests** |
| 6.3 review release for privacy + secrets | Sep 22 | |
| 7.5 close temporary demo access | Sep 27 | |

**Abuse cases that must be executable tests**

- A single operator **cannot** whitelist → must fail.
- An unsigned device **cannot** post a sighting → must fail.
- An altered record **cannot** escape the verifier → must fail.
- The duress credential leaves **no** observable UI, timing or network difference → must find none.
- A flagged person **cannot** be tracked across cameras indefinitely — the Protection from Harassment Act exposure → purpose limitation enforced.

**Rules** · Never publish the location of an unrotated credential · a refused privileged action is **evidence, not an error to swallow** · **"not measured" is a valid and required answer** for bias evaluation · not "unhackable", not "court-admissible", not "unbiased AI" — **the honesty ledger is a security control.**

**Hands off to** → Sibusiso (what the data model may retain), Lethabo (release gate), Babatunde (the regulatory section of the use-case output).

---

# The track we are actually in — Blockchain for Impact Use

The brief is verbatim: *"Putting Blockchain for practical and impactful use — teams are challenged to come up with commercially viable use cases."* **20 teams took this track.** Everything above serves the four criteria; this section is about surviving a judge who actually knows blockchain.

The full argument, the refusals, the precedents and the attack answers live in **`docs/ANCHOR-RATIONALE.md`**. The short version:

- **The claim is precedence, not immutability** — proof a record existed *before anyone had a reason to falsify it*. Any database can approximate immutability internally; **none can prove precedence to a stranger.**
- **Commercially viable in the sense the brief means:** the anchor is *batched*. 720 roots/month for the entire network regardless of size — **the same cost at 100 homes as at 100,000.** A blockchain line item that does not grow per user is the difference between a use case and a demo.
- **We already publish where we refuse blockchain** — a table of uses considered and rejected, including the gate-unlock smart contract, refused *because our own accepted architecture decision forbids machine-alone consequence*. That is a better reason for saying no than most teams will have for saying yes.
- 🔴 **The R1.30/month figure does not survive** and must be fixed before it reaches a slide. It was computed off Hedera's pre-2026 price; Hedera repriced 8× in January 2026. The **structural** argument is untouched — only the digit is wrong. `P2.11`

---

# Repo hygiene — the standing rule

> **The repo contains exactly one current version of any claim. Superseded material lives in a dated archive folder that says what superseded it.**

The August submission — deck, slides and generated PDFs — carried "27 ADRs", "440 tests", the 2.7m stat and TRL 5. It has been moved to `submission/archive-2026-08/` with a README stating what replaced it, rather than left sitting in the repo looking current.

`docs/BUILD-LOG-EXAMPLES.md` **stays** — its `sim_` entries are correctly labelled and useful for onboarding. `docs/EVIDENCE.md` and `docs/BUILD-LOG.md` legitimately keep old figures as *historical record*; those are not stale claims, they are the audit trail.

---

# Verification — how we know each phase actually landed

**Phase 1**
- `grep -rn "2.7m\|2,7m\|180k"` → no hits; 4:1 present with the PSiRA citation
- `grep -rn "TRL"` → one position (4) + the ceiling + ADR-0027
- `grep -rniE "Vumacam|Fidelity ADT"` → the competitor block with its mapping table
- `grep -rn "27 ADR\|440 test"` → nothing outside `docs/EVIDENCE.md`'s historical record
- `node scripts/check-docs.mjs` exits 0 · PR opened, CI green, reviewer requested
- Public overview diffed against the saved team profile

**Phase 2**
- PSiRA paper states trigger, structure, and the counsel question
- POPIA paper + ADR state the s27 asymmetry and discard-by-default
- Information Officer registered · CSD registered · EME affidavit drafted
- BOM quotes dated and attributed
- Abuse cases run as tests, with recorded results

**The operating system**
- `docs/MASTER-CONTEXT.md` exists and is referenced from the first line of `RULES.md` and `AGENTS.md`
- `docs/CHECKLIST.md` carries every Phase 1/2 item with an owner, a criterion tag and a state — nothing deleted, amendments dated
- `templates/BUSINESS-HANDOFF.md` carries the four new fields
- Spot-check three BUILD-LOG entries: each states what, why, how, when and the reason, and names a business handoff or why none applies

**Per-person**
- Every WBS leaf closed with: evidence in `docs/EVIDENCE.md`, non-author reviewer acceptance, personal file updated, `docs/BUILD-LOG.md` entry — **plus its checklist row ticked and its criterion tagged**

**The showcase**
- F14 runs end to end in front of a stranger: a subject requests their record, receives their full decision history, and the anchor proof verifies against a public OpenTimestamps verifier **with no cooperation from us**
- Recorded fallback exists
- The single-signature refusal demo runs in under a minute

**End to end**
- One rehearsed thread: sighting → `watch_candidate` → human decision → anchored record → **subject pulls their own file with a verifiable proof**
- Recorded fallback exists
- **Every number spoken aloud traces to the evidence index**
