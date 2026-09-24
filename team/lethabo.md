# Lethabo Hoaeane

**Work is evidenced in PR #2; availability and future AI tool/model still require Lethabo's own declaration.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Lethabo Hoaeane. UNISA. **Co-lead**: architecture, product, UX. I own the shape of the system, the record of why it is shaped that way, and the final gate before submission.

**Reviewed by** — Sibusiso. **I review** — Mutarisi, Ipeleng, Babatunde, Vukosi (from 23 Sep), and every PR as second lead.

**Effort** — **High.** Plan before acting on anything architectural.

**Behaviour** — *Plan before acting on anything architectural. Challenge my reasoning — I would rather be corrected now than by a judge. Show trade-offs, not just recommendations. I write the ADRs, so give me the decision **and** the rejected alternatives.*

**My domain rules**
- **Never edit an ADR — supersede it.** The record of a changed mind is the point.
- I am the **last gate before submission**. If it ships, I signed it.
- **Never claim a capability the evidence index does not carry.** Khutso's `docs/EVIDENCE.md` is the ceiling on what I may say.
- A behaviour change needs docs **and** a `docs/build-log/entries/` file in the **same PR**.
- Duress states are **visually identical** to normal ones — no observable UI, timing or network difference. This is not a UI preference, it is the safety property.

**Current task** — Work order below (issued 23 Sep). Pivot PR #43 merged as `8c621df`; pre-event building confirmed 23 Sep. Next: PR #43 review follow-ups (Ipeleng's B1–B3/S1–S4, this PR), then P3.L8 (PIN authority and incident rules, Thu 12:00) and P3.L9 (commit the organiser's confirmation).

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: the ADR is written before the decision is acted on anywhere else, and the rejected alternatives are in it.

---

- University / role: UNISA / Co-lead; architecture, product, UX and Figma
- Owns outright: Product flow, final copy, architecture decisions.
- Reviews only: All PRs; first review for Mutarisi, Ipeleng and Babatunde.
- Lead / escalation: Both leads for contract changes.
- AI tool / model: Claude (Claude Code), Codex and Figma; Gemini at times for cross-checks. Declared by Lethabo on 23 Sep 2026.
- Availability / timezone: Available all day, every day, from 23 Sep 2026 until the end of the hackathon (Sun 27 Sep) / Africa/Johannesburg.
- Current task / status: Work order issued 23 Sep 2026 (see the Work order section below). Pivot PR open for review.
- Claimed files / contract versions: `docs/CONTRACT-APPROVAL-RECORD.md` (15 Sep); reserve before editing.
- Last updated: 23 September 2026 — work order issued by Lethabo (co-lead) via Claude Code assistant.

## Work order — VIGIL + ANCHOR build (issued 23 Sep 2026)

> Issued by Lethabo (co-lead) after the 21–22 Sep pivot meetings with Sibusiso and Babatunde. Decisions: ADR-0034 to ADR-0038. Spec: `docs/VUKA-2-SPEC.md` (section numbers below refer to it). **Owner acknowledgement pending** — accept it in your running log, or raise a blocker here. All times SAST. Criterion letters per `docs/MASTER-CONTEXT.md` §2 (I · T · U · S · B · Q). Before you start anything: pass the four review gates in `docs/MASTER-CONTEXT.md` §10.

**Outcome you own:** the product holds together. The pivot is recorded, the screens are designed, the demo tells one true story, and nothing ships that isn't evidenced.
**Serves:** U, I, S, B.
**Files you own or may touch:** `docs/adr.md` (ADR-0034–0038), `docs/VUKA-2-SPEC.md`, `BRIEF.md`, `RULES.md`, `AGENTS.md`, `docs/DEMO-SCRIPT.md` (new), Figma file `pZYQ3m68SWIMFqaOk8kN3R`, this file. `docs/MASTER-CONTEXT.md` v3 is your draft; Khutso owns it.

**Do this, in order:**
1. **Wed 23** — get the pivot PR reviewed: Sibusiso as second lead (his acceptance binds the ADRs), plus Ipeleng, Babatunde and Khutso on their docs. Before requesting review: `node scripts/check-docs.mjs && node scripts/check-intake.mjs && git diff --check`.
2. ~~Wed 23 — ask the organisers about pre-event building.~~ **Done 23 Sep: confirmed allowed.** Still tag the baseline at Fri 16:00 (step 6) so the lineage is declared.
2b. **Thu 24 by 12:00** — agree PIN authority, incident closure and the removal rules (24 h silent delay; never zero guardians) with Ipeleng (§8, §9).
3. **Thu 24 by 12:00** — Figma: new pages "VIGIL", "Guardian", "ANCHOR panel + verify" and "Archive 2026-09-23 (parked layers)". Move obsolete frames to the archive page. Carry frame `9:9` (re-skin as the discreet "Journey check") and `23:8` (My Record: Hedera labels, VIGIL event kinds). Draw every surface in V1–V10 and G1–G6, each with loading, error, queued, no-network and empty states. Type: IBM Plex Sans + IBM Plex Mono, display IBM Plex Sans Condensed (`PROPOSED`). Icons: Phosphor. 48 px targets; dark grey, not pure black; state never shown by colour alone.
4. **Thu 24** — hand Mutarisi the frames and tokens; review his first two screens on a real budget phone.
5. **Fri 25 by 12:00** — run the thin end-to-end slice (§2 D2) with Vukosi, Sibusiso and Ipeleng; record it in a build-log entry.
6. **Fri 25 16:00** — tag the baseline: `git tag -a pre-hackathon-baseline -m "State at GKHack26 start" && git push origin pre-hackathon-baseline`.
7. **Fri 19:00** — problem statement with the mentors: two paragraphs, SAPS/ISS kidnapping and SABRIC 2025 data, co-written with Babatunde.
8. **Sat** — `docs/DEMO-SCRIPT.md`: the 50-second sales demo, the 5-minute finale and the under-90-second video storyboard (phone mirrored with `scrcpy` beside the panel). Rehearse twice.
8b. **Every evening at 20:00 until Sunday** — review every lane against its work order: open PRs, P3 rows and running logs. Mark each lane on track, at risk (pair) or taking over, and act on it per RULES.md "Leads step in".
9. **Sun 08:30** — final gate: every slide number traced to `docs/EVIDENCE.md` or `scripts/economics_vigil_anchor.py`; every SIMULATED label present; the honesty slide present. Submit with Babatunde by 09:00.

**Acceptance checks (all before you tick P3 rows):**
- [ ] ADR-0034 to ADR-0038 accepted by Sibusiso on the PR
- [x] Organiser answer recorded — pre-event building confirmed 23 Sep
- [ ] Figma pages hold every V and G surface with non-happy states
- [ ] T15 (normal vs duress screenshot diff) passes on the built app
- [ ] E2E slice build-log entry exists by Fri 12:00; baseline tag exists
- [ ] Demo script written; video under 90 s; submission receipt recorded before Sun 09:00

**Depends on → hands off to:** everyone → frames to Mutarisi, demo claims to Babatunde, final gate to the whole team.
**Do not:** approve your own PRs; claim a capability `docs/EVIDENCE.md` does not carry; let the duress screen differ in any way; write "invisible" or "proof of duress" anywhere.
**Reviewer:** Sibusiso.

## Sequenced work

Replaced on 23 Sep 2026 by the work order above. The four-layer sequenced work, declarations and self-reviews are kept in [this file's history](../archive/2026-09-four-layer/team/lethabo-history.md).

## Interfaces

See your work order's **Depends on → hands off to** line. Shared files are claimed in `docs/OVERLAPS.md`; never silently change a shared contract.

## Needs and blockers

- Add new blockers here with the person's name and the evidence needed.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every work-order item has its acceptance checks ticked with evidence, reviewer acceptance, the relevant checks passing, an honest built/specified/simulated status, this file and a `docs/build-log/entries/` file updated, and its `docs/CHECKLIST.md` P3 row ticked. Blocked tasks stay blocked; no approval is inferred from elapsed time.

## Outside-role work

None assigned for the build weekend. Agree any extra contribution with the leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster.
- 2026-09-13 — PR #2 work reviewed by Sibusiso. Accepted: remediation record, ADR consolidation, wireframe references and coordination scaffolding. Corrections required: evidence wording, gate record, calendar alignment and stale personal status. Next: G12 model licence register.
- 2026-09-15 — opencode (GLM): reviewed and approved PR #6 (Sibusiso's WBS 3.1 contract freeze) with M1 finding. Closed G12: wrote `docs/MODEL-LICENCES.md`, verified YAMNet TFLite sha256 across predecessor repos, inventoried all four model packages + two runtimes, published two HIGH licensing risks (InsightFace buffalo_l non-commercial-research-only, YOLOv8 AGPL-3.0). Tick P1.7. Next: ADR-0027 (TRL).

- 2026-09-15 — opencode (GLM): closed G12 (model licence register, PR #9, pending Sibusiso review); reviewed PR #10 with a request-changes finding (frozen state machine divergence — `flagged`); wrote ADR-0027 settling TRL at 4 with two subsystems argued at 5 and the four reasons not at 6, swept `00-SPEC` §6 and `01-ARCHITECTURE` §11.1, fixed the stale §12.4 ADR index. Next: competitor block with Babatunde.

- 2026-09-15 — opencode (GLM): closed P1.6 competitor block — `docs/COMPETITORS.md` with five competitors (Vumacam, Flock, ShotSpotter, community WhatsApp, Fidelity ADT), Vumacam IR complaint as live precedent, structural unfair advantage. Updated LEAN-CANVAS UVP with competitor-awareness line. Next: P1.5 Sonke project overview (due 16 Sep).

- 2026-09-15 — opencode (GLM): reviewed and corrected operator training material — fixed stale `verify_concern` claim (now transitions to `flagged` per PR #10 F1 fix), added operator error remedy and escalation paths, closed P1.8 (prizes confirmed), updated G15 and P2.17 tracking. Next: Quantum Tech strategy, port Task 4.
- 2026-09-15 — opencode (GLM): wrote ADR-0029 after inspecting the BEACON predecessor — it carried two divergent fusion models (`brain/fusion.py` log-odds/`watch_candidate` orphaned; `server/src/suspicion/scorer.py` additive/`candidate` in use) and a duplicate server copy of `entity_resolution.py`. Decision: one fusion source (`brain/`), server delegates; state vocabulary is the contract's. Port guard added to `brain/README.md` and `docs/HANDOVER.md`. Next: support `server/` port against ADR-0029; judging criteria Friday 19 Sep.
- 2026-09-15 — opencode (GLM): opened `docs/PORT-DIVERGENCES.md` to register predecessor-vs-contract mismatches during the port. Found and logged D2 (evidence-integrity response fields: `first_broken_index` vs `broken_at_seq`) and **D3 (material: the contract's `Sighting` carries none of the domain fields — `camera_id`, `hex_id`, `kind`, … — the fusion consumes, so the contract cannot be frozen as written)**. Updated P2.16 and HANDOVER Task 4. Next: resolve D3 with Sibusiso (needs an ADR).
- 2026-09-23 — Claude Code assistant, at Lethabo's request: pivot analysis (four source-checked research passes), ADR-0034 to ADR-0038, `docs/VUKA-2-SPEC.md`, `docs/STAGED-DURESS-DEFENCE.md`, `docs/ECONOMICS-VIGIL-ANCHOR.md` with `scripts/economics_vigil_anchor.py`, MASTER-CONTEXT v3 and the seven work orders. Next: PR review, the organiser email, the Figma pages.
- 2026-09-23 — Lethabo declared her tools (Claude Code, Codex, Figma; Gemini at times) and full-day availability through Sun 27 Sep, and confirmed that Babatunde owns the subscription price and every economics number, which he may revise at any point during the build.
- 2026-09-24 — Lethabo took over the security lane from Ipeleng until she returns, and decided the eight P3.L8 items (ADR-0041, Proposed; Sibusiso to accept). Next: security review of #51 and #57, and verify-min (P3.S7).
