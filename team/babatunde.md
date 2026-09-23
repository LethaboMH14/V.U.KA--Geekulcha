# Babatunde Adelusi

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Babatunde Adelusi. University of Pretoria. Business case, economics, go-to-market, the pitch. I produce the final use-case output that everyone else's evidence feeds.

**Reviewed by** — Lethabo, then both leads.

**Effort** — **High.** Ask where every number came from before it goes in the deck.

**Behaviour** — *Ask me where every number came from before it goes in the deck. If the demo does not do it, stop me from claiming it. Rehearse the hostile question back at me — I would rather hear it from you first.*

**My domain rules**
- Every figure carries `FACT` / `ESTIMATE` / `ASSUMPTION` and a provenance line — no bare numbers in the deck.
- **Never call a company a partner without evidence.**
- **Never sell street-level risk to underwriters as an input** — that is redlining, and it is already refused in our own documents.
- **If the demo does not do it, the pitch does not claim it.** No exceptions for a good story.
- I may claim nothing that is not in Khutso's `docs/EVIDENCE.md`.
- **Every money figure comes from `scripts/economics_vigil_anchor.py`** — I change the tagged input there, never the number on a slide.
- **The absence of a VUKA record is never evidence against a claimant** — I say it in every insurer and bank conversation.

**Current task** — Work order below (issued 23 Sep). First: run `scripts/economics_vigil_anchor.py`, challenge any input in the script itself, then rewrite `docs/COMPETITORS.md` and `docs/LEAN-CANVAS.md` for the two-layer product by Thu 20:00.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: every number in anything I produce traces to `docs/EVIDENCE.md` by the time it reaches a slide.

---

- University / role: University of Pretoria / Business developer
- Owns outright: Business case, economics, go-to-market, presentation from Sep 17.
- Reviews only: Commercial wording in technical handoffs; no code ownership.
- Lead / escalation: Lethabo, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: Work order issued 23 Sep 2026 (see the Work order section below); competitors and canvas due Thu 24 Sep 20:00. PR #40 (R299 economics) superseded by `scripts/economics_vigil_anchor.py`.
- Claimed files / contract versions: none; reserve before editing.
- Last updated: 23 September 2026 — work order issued by Lethabo (co-lead) via Claude Code assistant.

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledgement pending** — accept it in your running log, or raise a blocker here. All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

**Outcome you own:** a panel that says "pay full prize" — a business case that survives an actuary, and a pitch that sells without overclaiming.
**Serves:** B, I, U.
**Files you own or may touch:** `docs/ECONOMICS-VIGIL-ANCHOR.md`, `scripts/economics_vigil_anchor.py`, `docs/LEAN-CANVAS.md`, `docs/SONKE-OVERVIEW.md`, `docs/COMPETITORS.md`, `docs/PITCH-SCRIPT.md` (new), and the deck under `submission/`.

**Do this, in order:**
1. **Wed 23–Thu 24** — read `docs/ECONOMICS-VIGIL-ANCHOR.md` and run `python3 scripts/economics_vigil_anchor.py`. Challenge any input you disagree with **by editing the tagged input in the script**, never a number on a slide. Confirm the stipend line (seven people, five stipends?).
2. **Thu 24** — rewrite `docs/COMPETITORS.md` for the two-layer product:
   - Namola, AURA / FNB GuardMe, bSafe, Google Personal Safety, Apple Check In, Noonlight.
   - iTOO [My]Cylution is a partner or an objection, not a competitor.
   - What each does better.
   - VIGIL's one difference: it works when you can't press.
3. **Thu 24** — rewrite `docs/LEAN-CANVAS.md` with figures: R20 partner-funded; break-even 10,861; R155,090/month fixed; anchoring R9.34/month; market facts from MASTER-CONTEXT §8. It is also the Sonke canvas due Saturday night.
4. **Fri 19:00** — problem statement with the mentors, co-written with Lethabo: two paragraphs, SAPS/ISS kidnapping and SABRIC 2025 data, plus one lived-experience line.
5. **Fri–Sat — the deck** (more than 10 slides):
   - Problem, with charts.
   - Solution.
   - The user journey story (Nomsa's night).
   - Technological architecture.
   - Competitive analysis.
   - **Data privacy policies** (from Ipeleng).
   - Business model.
   - **The honesty slide**: "the anchor proves when, not what"; "discreet, not invisible"; "if the phone is switched off before anything is detected, nothing escalates"; testnet; `sim_bank` simulated.
   - Team; the ask.

   Every number gets a notes line citing its source.
6. **Sat by 18:00** — `docs/PITCH-SCRIPT.md`, the 3-minute sales pitch following the programme's pro tip:
   - 20 s of problem with evidence.
   - The offer and how it works.
   - What it costs and what we need now (re-derive the year-one ask in the script).
   - Why it stands out.
   - 50 s of demo.

   Include hostile questions with answers: the insurer's "no record", the bank's "you can't block my app", the blockchain "why not a signed database", privacy's "who sees my location". Rehearse twice with Lethabo.
7. **Sat night** — enter the Lean Canvas on Sonke.
8. **Sun 08:30** — final gate with Lethabo; submit by 09:00.

**Acceptance checks:**
- [ ] Every slide number has a notes line citing `docs/EVIDENCE.md` or the script output
- [ ] No dead number from MASTER-CONTEXT §8 appears anywhere (grep output in the PR)
- [ ] `docs/COMPETITORS.md` and `docs/LEAN-CANVAS.md` rewritten
- [ ] Lean Canvas on Sonke with figures by Saturday night
- [ ] Pitch under 3:00 in two timed rehearsals
- [ ] Deck and video submitted before 09:00 Sunday

**Deadlines:** competitors and canvas Thu 20:00; deck draft Fri 22:00; pitch script Sat 18:00; canvas on Sonke Sat night; final Sun 08:30.
**Depends on → hands off to:** evidence (Khutso), privacy policy (Ipeleng), screens (Mutarisi), demo (Lethabo) → the pitch to all presenters.
**Do not:**
- Call any company a partner without evidence.
- Use R1.09bn, R100 per member, "3% saves R20.7m", "85%", R1.9bn as current, "94% net margin" or "South Africa will follow the UK".
- Pitch crime displacement.
- Claim any claims-reduction percentage.

**Reviewer:** Lethabo.

## Sequenced work

**Superseded 23 September 2026 by the work order above** — kept for history; do not execute these rows. All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 17 | 5.1 | 4 | Draft consumer-first presentation spine | 1.5 | Team and household offer match current evidence |
| Sep 18 | 5.2 | 5 | Validate model, pilot catchment and buyer objections | 4.2 | Named-site evidence or explicit unknowns; arithmetic independently checked |
| Sep 19 | 5.3 | 4 | Build five-minute pitch and one-slide economics | 2.5,5.1,5.2 | Every number has lineage; rehearsal timing recorded |
| Sep 21 | 5.4 | 4 | Audit claims against delivered demo | 3.5,5.3 | Built/simulated/specified labels consistent across spoken and written pack |
| Sep 23 | 5.5 | 3 | Rehearse hostile questions and short pitch | 5.4 | Another member checks answers against evidence index |
| Sep 26 | 7.3 | 3 | Rehearse final pitch with all presenters | 7.1 | Timing, transitions and candid gaps checked |

## Interfaces

- Inputs: BOM from Vukosi; measured claims from Khutso; capabilities from engineers.
- Outputs: Verified offer, objection answers and pitch to all presenters.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

No work by Babatunde Adelusi is asserted. This package was created by the assistant. No files are reserved and no PR exists.

## Needs and blockers

- Unquoted BOM → Vukosi.
- no named pilot partner → Lethabo introductions.
- missing measured evidence → Khutso withholds claim.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Post-event support succession plan.
- travel-budget coordination.
- plain-language cancellation/exit walkthrough.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
- 2026-09-23 — Claude Code assistant, acting for Lethabo (co-lead): issued the VIGIL + ANCHOR work order above after the 21–22 Sep pivot meetings and Lethabo's 23 Sep decisions (ADR-0034 to ADR-0038). The previous sequenced work is superseded and kept for history. No work by Babatunde is asserted; owner acknowledgement pending.
