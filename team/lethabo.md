# Lethabo Hoaeane

**Work is evidenced in PR #2; availability and future AI tool/model still require Lethabo's own declaration.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Lethabo Hoaeane. UNISA. **Co-lead**: architecture, product, UX. I own the shape of the system and the record of why it is shaped that way.

**Reviewed by** — Sibusiso. **I review** — Mutarisi, Ipeleng, Babatunde, and every PR as second lead.

**Effort** — **High.** Plan before acting on anything architectural.

**Behaviour** — *Plan before acting on anything architectural. Challenge my reasoning — I would rather be corrected now than by a judge. Show trade-offs, not just recommendations. I write the ADRs, so give me the decision **and** the rejected alternatives.*

**My domain rules**
- **Never edit an ADR — supersede it.** The record of a changed mind is the point.
- I am the **last gate before submission**. If it ships, I signed it.
- **Never claim a capability the evidence index does not carry.** Khutso's `docs/EVIDENCE.md` is the ceiling on what I may say.
- A behaviour change needs docs **and** a `docs/BUILD-LOG.md` entry in the **same PR**.
- Duress states are **visually identical** to normal ones — no observable UI, timing or network difference. This is not a UI preference, it is the safety property.

**Current task** — P1.5 Sonke project overview **complete** — `docs/SONKE-OVERVIEW.md` written with Musa/Thandi stories, four-layer AI-answer table, corrected figures, competitor awareness. P1.8 prizes confirmed (Lead Facilitator email). Next: judging criteria publish Friday 19 Sep (P1.9 rules-lawyer), then P2.1–P2.4 PSiRA/POPIA support (Ipeleng's papers), and the port (Task 4). New from organisers 15 Sep: **Quantum Tech — 5 bonus points** — team needs to discuss.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: the ADR is written before the decision is acted on anywhere else, and the rejected alternatives are in it.

---

- University / role: UNISA / Co-lead; architecture, product, UX and Figma
- Owns outright: Product flow, final copy, architecture decisions.
- Reviews only: All PRs; first review for Mutarisi, Ipeleng and Babatunde.
- Lead / escalation: Both leads for contract changes.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: P1.5 Sonke overview complete. P1.8 prizes confirmed. Next: judging criteria review Friday 19 Sep.
- Claimed files / contract versions: `docs/SONKE-OVERVIEW.md` (15 Sep); reserve before editing.
- Last updated: 15 September 2026.

## Sequenced work

All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 13 | 1.2 | 4 | Verify old data cleanup and original-file inventory | none | Removal scope and unresolved copies recorded; no history imported |
| Sep 14 | 1.5 | 3 | Replace team copy and verify roster | none | Seven roles and four universities compared with supplied roster/originals |
| Sep 15 | 2.2 | 6 | Complete twelve-screen design handoff | 2.1 | Designer can reproduce copy, controls and failure states |
| Sep 18 | 2.5 | 4 | Observe household walkthrough and revise | 2.3,2.4 | Actual consent-safe observations recorded; no invented participants |
| Sep 24 | 6.5 | 4 | Run offline dress rehearsal and release gate | 5.5,6.2,6.4 | Both leads review, missing prerequisites block publication |
| Sep 27 | 7.4 | 3 | Final submission by 15:00 SAST | 7.2,7.3 | Final package and submission receipt recorded by human |

## Interfaces

- Inputs: Requirements from Khutso; API limits from Sibusiso.
- Outputs: Screen specification to Mutarisi; product claims to Babatunde.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

PR #2 records Lethabo's coordination scaffolding, predecessor remediation evidence, ADR consolidation, wireframe references and Figma links. Sibusiso reviewed those changes on 13 September; corrections are recorded on the review branch rather than silently rewriting the author history.

## Needs and blockers

- Model provenance and licence evidence missing → Lethabo completes G12 before any model artifact is accepted.
- shared contract dispute → both leads.
- unavailable user testers → Babatunde recruits with consent.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Transport and venue logistics.
- accessible printed demo fallback.
- shared review-slot scheduling.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster.
- 2026-09-13 — PR #2 work reviewed by Sibusiso. Accepted: remediation record, ADR consolidation, wireframe references and coordination scaffolding. Corrections required: evidence wording, gate record, calendar alignment and stale personal status. Next: G12 model licence register.
- 2026-09-15 — opencode (GLM): reviewed and approved PR #6 (Sibusiso's WBS 3.1 contract freeze) with M1 finding. Closed G12: wrote `docs/MODEL-LICENCES.md`, verified YAMNet TFLite sha256 across predecessor repos, inventoried all four model packages + two runtimes, published two HIGH licensing risks (InsightFace buffalo_l non-commercial-research-only, YOLOv8 AGPL-3.0). Tick P1.7. Next: ADR-0027 (TRL).

- 2026-09-15 — opencode (GLM): closed G12 (model licence register, PR #9, pending Sibusiso review); reviewed PR #10 with a request-changes finding (frozen state machine divergence — `flagged`); wrote ADR-0027 settling TRL at 4 with two subsystems argued at 5 and the four reasons not at 6, swept `00-SPEC` §6 and `01-ARCHITECTURE` §11.1, fixed the stale §12.4 ADR index. Next: competitor block with Babatunde.

- 2026-09-15 — opencode (GLM): closed P1.6 competitor block — `docs/COMPETITORS.md` with five competitors (Vumacam, Flock, ShotSpotter, community WhatsApp, Fidelity ADT), Vumacam IR complaint as live precedent, structural unfair advantage. Updated LEAN-CANVAS UVP with competitor-awareness line. Next: P1.5 Sonke project overview (due 16 Sep).

- 2026-09-15 — opencode (GLM): closed G12 model licence register, reviewed PRs #6 (approved)/#10 (request changes), wrote ADR-0027 (TRL 4), closed competitor block (P1.6), closed Sonke project overview (P1.5). Received 15 Sep organiser email: prizes confirmed, Quantum Tech bonus announced (5 pts), 150 continental teams, judging criteria Friday 19 Sep. Updated P1.8 with prize confirmation. Next: support Ipeleng PSiRA/POPIA, judging criteria review Fri 19 Sep, port Task 4.
