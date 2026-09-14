# Mutarisi Chibaya

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Mutarisi Chibaya. University of Pretoria. Member and operator interfaces. What a real person can actually complete, on a real screen, on a real phone.

**Reviewed by** — Lethabo, then both leads.

**Effort** — **Medium-high.** Show me the screen, not a description of the screen.

**Behaviour** — *Show me the screen, not a description of the screen. Flag anything that would be unreadable on a budget Android or in daylight. If a state is missing — loading, error, stale, empty — tell me before I build the happy path.*

**My domain rules**
- **Duress states are visually identical to normal states** — no observable difference in UI, timing or network behaviour. This is the safety property, not a design choice.
- **Stale data is greyed and stamped with its age**, never blank and never silently fresh.
- **Exactly one confidence number** per detection, with 2–5 factor chips explaining why — never raw per-model scores.
- **"Verify" is always visually primary; "Dispatch armed response" is always the quietest control on the screen.**
- Anything simulated carries a visible `SIMULATED` tag.

**Current task** — Member/setup wireframes S01–S07 (`2.3`), then operator/subject wireframes S08–S12 with stale/error/rights states (`2.4`), then the **subject-access screen** — the front end of Sibusiso's F14, and the demo moment (checklist `SC.2`).

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: every screen has its loading, error, stale and empty states before I call it done, not just the happy path.

---

- University / role: University of Pretoria / Frontend developer
- Owns outright: Member and operator interfaces.
- Reviews only: API usability and screen-copy feasibility.
- Lead / escalation: Lethabo, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: 2.3, proposed, not started.
- Claimed files / contract versions: none; reserve before editing.
- Last updated: 12 September 2026 by Codex assistant as a planning assignment.

## Sequenced work

All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 16 | 2.3 | 6 | Build or draw member/setup wireframes | 2.2 | S01–S07 checked by Lethabo on narrow viewport |
| Sep 17 | 2.4 | 6 | Build or draw operator/subject wireframes | 2.2 | S08–S12 include stale/error and rights states |
| Sep 18 | 3.4 | 6 | Connect one synthetic end-to-end flow | 2.4,3.3 | Candidate→human review→receipt→record; stale status checked |
| Sep 21 | 6.1 | 4 | Prepare accessible offline visual fallback | 4.5 | Local assets open without internet; sim_ and limitation labels retained |

## Interfaces

- Inputs: Approved screens from Lethabo; API schema from Sibusiso.
- Outputs: Screen state requirements to backend; task walkthrough to Khutso.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

No work by Mutarisi Chibaya is asserted. This package was created by the assistant. No files are reserved and no PR exists.

## Needs and blockers

- Schema churn → both leads freeze contract.
- inaccessible copy → Lethabo language reviewers.
- hardware unavailable → Vukosi provides clearly labelled synthetic fixture.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Projector/contrast checks.
- screenshot inventory for offline fallback.
- keyboard navigation review of subject portal.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
