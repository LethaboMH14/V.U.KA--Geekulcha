# Gated Access Areas Code — review, verification finding, and the design-floor decision

> Serves **C2, C3** — `docs/CHECKLIST.md` `P2.6` (due 17 Sep, owner Ipeleng). Advances `docs/OPEN-GAPS.md` **G21**. Companion decision: **ADR-0032** in `docs/adr.md`.
>
> **Status: team position, not legal advice.** One finding comes before the analysis, because the honesty ledger outranks the plan: **the draft Code of Conduct for Gated Access Areas could not be found in any source reachable this session.** The Information Regulator's own site search returns zero results for "Gated Access Areas" and for "access control"; its codes-of-conduct page lists no 2026 entries; a web search for the exact title returns nothing. Everything below that characterises the draft's content therefore stays ⚑ and traces to recorded team research, not to the instrument itself. The analysis and the decision still stand — §5 explains why the *direction* is safe under *either* outcome.

---

## 1 · The question P2.6 asks

`docs/PLAN.md` §C3 states the stakes: the Information Regulator is writing a rule for our **exact named launch channel** — estates and body corporates — and the instruction is *build to it now; submit comment when it reopens*. The question this paper must answer is:

> **What must VUKA build to, today, so that an estate pilot does not ship against the rule being written for gated premises — and where does the current architecture already meet, beat, or miss that standard?**

The honest complication: P2.6 says *read the draft*. The draft is not in this repository, not on the Regulator's website, and not on the open web as far as this session can reach. So the paper does the three things that are still useful: records what the team's research already says the draft is (and that none of it is verified); states the verified statutory machinery that governs any such code; and converts the recorded direction of travel into a concrete design floor the team can build to **regardless of whether the draft says exactly what the record remembers**.

---

## 2 · What the record says, and what could not be verified

**Recorded team research** (three places, consistent with each other — `docs/PLAN.md` §C3, `docs/OPEN-GAPS.md` G21, `docs/CHECKLIST.md` P2.6): a draft **Code of Conduct for Gated Access Areas**, published **30 Apr 2026**, comment period **closed 14 May 2026**, covering **CCTV, ID and biometric scanning, and facial recognition** at gated premises; applying to owners **and their technology service providers**; direction of travel **7–30 day retention with auto-overwrite**, data minimisation, and **facial recognition singled out for extra justification**. Every one of those specifics is ⚑ **UNVERIFIED as of this session** — the record is internally consistent, but internal consistency is not verification, and no external corroboration was found (log in §8).

**The nearest verified artefact:** the Regulator's codes-of-conduct page (reachable) records, among its section 61(2) receipt notices, a **Proposed Code of Conduct by the Residential Communities Council (RCC), received 08 September 2023**. Residential communities are our exact launch market, and the RCC is the industry-body route (s61(1)(b)) for precisely that sector — a plausible ancestor or sibling of a "Gated Access Areas" code. Whether the recorded draft is the Regulator's own-initiative evolution of that thread (s60(1)(a)), a separate track, or not yet published at all is **unverified** (counsel Q3).

**Consequence for the method:** the honest answer to "read the draft" is *the draft could not be obtained from this session* — and the s61 mechanism says exactly how to obtain it when it exists: the Gazette notice must state that the details of the code, *including a draft of the proposed code, may be obtained from the Regulator* (⚑, §3). Retrieval through that route is counsel question Q1. Nothing else in this paper waits on it.

---

## 3 · The statutory spine, verified (⚑)

Quoted from the Accessible Law full-text copy of POPIA (`popia.co.za`) — the same convenience copy the POPIA position paper used, not a primary source; every quote ⚑ pending Gazette verification:

| Provision | Text (verbatim, ⚑) | Consequence for VUKA |
|---|---|---|
| **s60(1)** | *"The Regulator may from time to time issue codes of conduct."* | A Regulator-issued gated-premises code is the s60(1)(a) own-initiative route — no industry application needed |
| **s60(1)(a)–(b)** | A code must *"incorporate all the conditions for the lawful processing of personal information or set out obligations that provide a functional equivalent"* and *"prescribe how the conditions ... are to be applied ... given the particular features of the sector"* | A sector code can only be as strict as POPIA's conditions allow — it specialises them, never loosens them below the Act |
| **s60(2)(a)–(d)** | A code *"may apply in relation to"* specified information, bodies, activities, or industries | This is the lever by which a gated-premises code reaches *owners **and** their technology service providers* — two named classes of bodies |
| **s60(2)(b)(ii)** | A code must specify appropriate measures *"for protecting the legitimate interests of data subjects insofar as automated decision making, as referred to in section 71, is concerned"* | Automated-decision safeguards belong in a sector code by design — the human gate (ADR-0002) is precisely such a measure, already built |
| **s61(2)** | The Regulator *"must give notice in the Gazette"*, stating that *"the details of the code of conduct being considered, including a draft of the proposed code, may be obtained from the Regulator"* and that submissions may be made within a specified period | The concrete retrieval route for Q1 — and proof a real s61 process leaves a public paper trail this session did not find |
| **s61(3)–(4)** | The Regulator *"may not issue a code of conduct unless it has considered the submissions"* and all affected persons *"have had a reasonable opportunity to be heard"*; the decision *"must not exceed 13 weeks"* | A draft is a consultative artefact: it binds nobody until issued after this process |
| **s73(1)(c)** | Interference with the protection of personal information includes *"a breach of the provisions of a code of conduct issued in terms of section 60"* | The teeth: once issued, code breach is "interference" — the complaint (s74) and enforcement-notice (s95) machinery attaches to it. By heading, not quoted: s62 (commencement), s64 (amendment/revocation), s66 (register), s67 (review), s68 (effect of non-compliance) |
| **s14** | Condition 3, *"Retention and restriction of records"* (heading verified; text not re-quoted here — the POPIA paper's s13–14 row governs) | Records may not be kept longer than necessary for the purpose. This is the bound that makes §5's design floor safe under any outcome |

**Status today:** the Regulator's register of approved codes lists only the Credit Bureau Association (CO 2/22) and Banking Association (CO 3/22) codes, approved 2022. No gated-access code is issued or approved in anything reachable. **No compliance obligation is asserted and no compliance claim is made** — the honesty ledger applies.

---

## 4 · VUKA against the recorded direction of travel

The architecture is graded against the draft *as the record remembers it* (all ⚑); architecture rows are verified from this repository:

| Code direction (as recorded, ⚑) | What the architecture does today | Verdict | Owed |
|---|---|---|---|
| **7–30 day retention with auto-overwrite** | T0 raw frames/audio: never persisted — 3-second ring buffer; face crops never written | **Beats any bound** — no code can require retaining less than nothing | Nothing; hold the line (ASR-6, E3) |
| Same bound | T1: embeddings without a linked incident, 30-day TTL; member location traces, 7 days rolling | **At / inside the bound** | Keep; the bound must be encoded when G3 implements the TTL sweep |
| Same bound | T1: embeddings linked to an open case, case lifetime + 90 days; T2: sightings, 12 months | **Exceeds the bound if** the code's scope reaches detection/decision records rather than only gate capture (footage, ID scans, biometric scans) — genuinely open | **Q2** to counsel; until answered, these stay recorded rather than silently trimmed or silently kept — the G3 implementation must make each retention value a named, reviewable parameter |
| **Auto-overwrite** | TTL sweep designed (`docs/01-ARCHITECTURE.md` §6.5) but **G3 not implemented** (E8 open) | Specified, **not running** | P2.3 / G3 implementation — the same gate that owes discard-by-default's test |
| **Data minimisation** | ADR-0031: discard-by-default of non-matching embeddings; consent enrolment the sole retained lawful basis | **Aligned by a decision already accepted** | Extend the rule to the partner's side (PSiRA paper §6 clause 3) |
| **FRT singled out for extra justification** | ADR-0002: the machine's ceiling is `watch_candidate`, only a human sets `flagged`; bias evaluation answered honestly as "not measured" (G9) | The *controls* exist; the *justification dossier* does not | A written FRT justification — why facial recognition, why not a less-intrusive mechanism, what the demographic-differential exposure is — owed before any pilot face gate unblocks at G-gate |
| **Applies to owners *and* their technology service providers** | VUKA is the technology service provider; the PSiRA paper's partner-of-record split already assumes regulators reach through to us | **The code would reach us directly, twice** — as provider, and via the owner's obligations flowing down the contract | Contract clauses must carry the floor to the provider-of-record's side |

---

## 5 · The proposed decision — ADR-0032, and why the direction stands under either outcome

**ADR-0032** (in `docs/adr.md`) proposes the recorded direction of travel as the **internal design floor** — status *Proposed*, binding only on both-lead acceptance:

1. **Gate-domain retained data: ≤ 30 days, auto-overwrite.** *Gate-domain retained data* means personal information collected for operating the gated-access function itself — gate-adjacent camera footage, ID/biometric scans, embeddings with no linked incident, access-event records — and **not** case-linked evidence created after a reported incident. The 30-day figure is a **team-chosen conservative internal default, not an independently compelled legal bound** (the draft is unverifiable and s14 fixes no number); the case+90 and 12-month §6.5 rows that exceed it stay named, reviewable parameters pending counsel Q2 — reduced to the floor or justified by fresh ADR if Q2 puts them in scope, standing unchanged if not.
2. **Discard-by-default stands** (ADR-0031) — the code's minimisation direction and the s27(1) answer agree.
3. **FRT justification dossier** required before any pilot face gate unblocks at G-gate.
4. **The final text supersedes the floor** — any divergence between the issued code and this floor re-opens the decision via a fresh ADR, never a configuration change.
5. **The partner contract carries the floor** to the provider-of-record's side.

Why this is safe **whether or not the draft exists as recorded**: if it does, the team is ahead of the rule being written for its named launch channel — the entire point of `docs/PLAN.md` §C3. If the recorded publication detail is wrong, nothing is loosened, because each element has a separate anchor: s14 requires retention no longer than necessary (without fixing a number); ADR-0031 (*Proposed* pending both leads) supplies the stricter discard direction; ADR-0002 (accepted) keeps a human in the loop; the honesty ledger forbids hiding "not measured". What this deliberately does **not** claim: that the specific 30-day bound, the gate-domain scope, or the exception list are compelled by law — they are conservative internal choices recorded for lead review, binding only when both leads accept ADR-0032. **Building to the stricter bound cannot put us on the wrong side of the final rule; building to the looser status quo could.** The asymmetry is the whole argument, and it needs no unverified text to hold.

---

## 6 · What this changes in the build

- **G3 (retention TTL implementation):** encode the proposed ≤ 30-day auto-overwrite floor for gate-domain data classes once ADR-0032 is accepted; keep the case-linked rows as named parameters pending Q2. The G3 gate now carries two constraints — this floor and ADR-0031's discard boundary.
- **Estate pilot documentation:** signage/notice obligations are expected in any gated-premises code (recorded direction, ⚑) — folded into the counsel pack rather than guessed at now.
- **Partner contract:** the PSiRA paper's clause 3 gains the retention floor alongside the discard rule.
- **Showcase (SC.1–SC.5):** unaffected — synthetic data; no gate-domain personal information leaves the building.
- **P2.7 (RICA):** unchanged and next — the ring-buffer/label-not-audio design precedes this code, and the ShotSpotter precedent is already in the record.

---

## 7 · Counsel questions (this paper's own numbering; the POPIA paper's Q1–Q5 stand separately)

| Q | Question | Why it decides something |
|---|---|---|
| **Q1** | Obtain the Gazette notice and draft text via the s61(2) route (the Regulator must make the draft obtainable) — or confirm that no such notice exists, i.e. the 30 Apr 2026 publication is not recorded correctly | The load-bearing fact of this review; every ⚑ in §2–§4 resolves against it |
| **Q2** | Scope: does the draft's 7–30-day bound reach detection/decision records (sightings, match records), or only gate capture (footage, ID scans, biometric scans)? | Decides whether the 12-month sighting retention and case+90 embedding retention are in or out of scope, and therefore what G3 must encode |
| **Q3** | Is a "Gated Access Areas" code the Regulator's own-initiative s60(1)(a) issuance, an evolution of the RCC's s61(1)(b) application (received 08 Sep 2023), or something else? | Determines who VUKA aligns with and where comment is submitted when the window reopens |
| **Q4** | What exactly does the draft require for FRT justification (assessment form, notice content, alternatives analysis, bias evidence)? | Defines the dossier the pilot face gate needs before the G-gate can open |

---

## 8 · Provenance and verification log

- **Recorded research this review builds on:** `docs/PLAN.md` §C3; `docs/OPEN-GAPS.md` G21; `docs/CHECKLIST.md` P2.6; `docs/POPIA-POSITION.md` §9 (P2.6 consequence: the draft's bound is stricter than discard-on-non-match because it bounds retention of matches too); `docs/PSIRA-POSITION.md` §4 (two regulators converging on technology providers); `docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md`; `docs/POPIA-S57-DECISION-RECORD.md`.
- **Primary-source access, 16 Sep 2026:** `inforegulator.org.za` reachable. Site search: "Gated Access Areas" — **zero results**; "access control" — **zero results**. Codes-of-conduct page: lists the RCC proposed code (received 08 Sep 2023), DMASA (30 Jun 2023), research sector (12 May 2023), CBA and BASA (approved 12 Oct 2022) — **no 2026 entries**; the register of approved codes lists CBA (CO 2/22) and BASA (CO 3/22) only. The homepage's latest posted notices date from 2025. Web search for the exact title "Code of Conduct for Gated Access Areas": **no corroboration**. `popia.co.za` (Accessible Law) reachable — s60, s61 and s73(1)(c) quoted verbatim from it above (⚑); s71 fetched to confirm the automated-decision cross-reference. The Government Gazette itself was not reachable from this environment.
- **Every characterisation of the draft code in §2 and §4 is ⚑ pending Q1.** The statutory quotes are ⚑ pending counsel verification against the Gazette text.
- **Not legal advice.** This paper makes no compliance claim and adopts no external instrument as binding; ADR-0032 is a *proposed* internal design decision — its elements draw on the Act's requirements and on already-accepted ADRs, while the 30-day bound, the gate-domain scope and the exception list are team-chosen defaults awaiting both-lead acceptance.
