# Vukosi Khoza

**Proposed planning package; owner has not confirmed availability or started these tasks.**

## Agent operating spec

> This is what my AI agent follows for the whole session. Started via `docs/SESSION-PROMPT.md` — one prompt, my name swapped in. **I keep `Current task` accurate; that is what keeps the prompt self-refreshing.**

**I am** — Vukosi Khoza. Wits. KHAYA sensors, edge runtime, hardware and power. I own the team's thinnest real-data area, and the one capping our TRL.

**Reviewed by** — Sibusiso, then both leads.

**Effort** — **Medium-high.** Never let me state a number I have not measured.

**Behaviour** — *Never let me state a number I have not measured. If I need an instrument to make a claim, build the instrument first. "Unknown" is a fine answer; an estimate dressed as a measurement is not.*

**My domain rules**
- **Never state a runtime I have not measured.**
- **Build the instrument before the claim** — a benchmark harness or a wattage log comes first, the number comes after.
- **The absence of a heartbeat must itself be timestamped evidence**, not a silent gap.
- **The appliance decides locally** — the siren fires with no uplink.
- A missing instrument is recorded as missing, never estimated silently to fill the gap.

**Current task** — WBS 4.2: candidate BOM pricing and repeatable power-measurement procedure. Public web prices are only listed-price observations, not formal supplier quotes; no physical load/runtime has been measured. WBS 4.4 remains downstream.

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: every figure I report has a measurement method attached, or it is explicitly labelled unmeasured.

---

- University / role: Wits / IoT developer
- Owns outright: KHAYA sensors, edge runtime, hardware and power.
- Reviews only: Sensor/data contract and physical installation assumptions.
- Lead / escalation: Sibusiso, then both leads.
- AI tool / model: Codex / GPT-5 (assistant-run in this session; owner confirmation pending).
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: WBS 3.2 merged by PR #24 on 16 September 2026 (FACT; merge commit `2b34d239`). WBS 4.2 is partially evidenced on `feat/vukosi-4.2-bom-power`: candidate public listing prices and a proposed measurement procedure are recorded. No formal supplier quotations or physical power readings have been supplied or recorded; appliance/instrument access and owner availability remain unconfirmed.
- Claimed files / contract versions: WBS 4.2 candidate documents are `appliance/BOM.md`, `appliance/POWER-MEASUREMENT.md`, and `docs/VUKOSI-WBS-4.2-HANDOFF.md`; no contract change. Historical WBS 3.2 producer consumes `contracts/events.schema.json` v0.1.0 unchanged.
- Last updated: 19 September 2026 by Codex assistant at the user's request; owner availability remains unconfirmed.

## WBS 4.2 declaration — 2026-09-19

Criterion: **C3 (progress of solution profile)**. Trust answer: each listed price will point to a dated supplier source and exact candidate SKU; wattage/runtime remain “not measured” until an identified device and meter produce a reproducible record.

Intended files: `appliance/BOM.md`, `appliance/POWER-MEASUREMENT.md`, `docs/VUKOSI-WBS-4.2-HANDOFF.md`, `team/vukosi.md`, `docs/OVERLAPS.md`, and `docs/build-log/entries/2026-09-19-codex-wbs-4-2-bom-power.md`. Per the current repository convention, `docs/BUILD-LOG.md` is frozen. No contract or production file is in scope. No raw measurement log will be created unless actual instrument readings are available.

Shared-surface claim: hardware/BOM economics is shared with Babatunde; the planned BOM and commercial handoff will be proposed candidate pricing, not a purchase or approved design. Blocker: availability of the appliance components and a calibrated or specified power meter is not confirmed in this session, so physical power and runtime evidence may remain not measured.

Acceptance evidence: dated, attributed public price observations for exact candidate parts with VAT, delivery and stock caveats where the supplier states them; an itemised proposed BOM separating listed prices from unpriced costs; a reproducible power test procedure; explicit “not measured” status for absent readings; and a business handoff to Babatunde/Khutso. Formal written supplier quotations and physical measurements remain required to close WBS 4.2.

Status as of 2026-09-19: **PARTIAL**. Public listing observations, unresolved costs, and a proposed procedure are recorded. Formal written quotes and physical power/runtime measurements remain outstanding; the WBS 4.2 acceptance gate is not met. The schedule's 2026-09-17 date is past and marked as an assumption; no revised date is approved.

## Merge-gate follow-up declaration — 2026-09-16

Criterion: **C3 (progress of solution profile)**. Trust answer: the follow-up makes the boundary and future acceptance test independently checkable without claiming that payload integration is already built.

Intended shared-file edits: `docs/OVERLAPS.md` (coordination claim), `docs/CHECKLIST.md` (P2.16 follow-up reference), and `docs/BUILD-LOG.md` (append-only evidence). No contract file or production access is in scope.

Ownership is **PROPOSED**, pending acknowledgement: Vukosi owns future synthetic `SightingEvent` payload emission; Sibusiso owns server-consumer confirmation; Khutso maintains the checklist/evidence record. This session records the follow-up only and does not implement payload emission or mark the consumer gate complete.

## Sequenced work

All hours and dates below are ASSUMPTIONS, subject to availability and gates.

| Date | WBS | Hours | Task | Dependencies | Acceptance evidence |
|---|---|---:|---|---|---|
| Sep 16 | 3.2 | 6 | Port minimal synthetic edge producer | 1.4,3.1 | Only sim_ fixtures; consumer validates sequence and offline replay |
| Sep 17 | 4.2 | 4 | Measure load and obtain BOM quotes | none | Wattage/runtime procedure and quote dates recorded; missing kit explicit |
| Sep 19 | 4.4 | 4 | Exercise power/offline recovery | 3.2,4.2 | Mains/WAN loss observed; no fabricated continuity or receipt |
| Sep 22 | 6.2 | 3 | Pack and test venue power/network kit | 4.4 | Inventory, charged kit and local connectivity test recorded |

## Interfaces

- Inputs: Event schema from Sibusiso; capture constraints from Ipeleng.
- Outputs: Measured load/BOM to Babatunde; edge event format to backend.
- See docs/OVERLAPS.md; do not silently change a shared version.

## Changed this session

2026-09-15 — Codex assistant, at the user's request, implemented WBS 3.2 on `feat/vukosi-3.2-edge-producer`. This records assistant work, not unverified human activity. Added a schema-shaped synthetic producer, JSONL queue/replay, fixtures and focused tests. No sensor, hardware, power, tamper, or live-consumer capability is claimed.

## Role self-review — 2026-09-15

- Current task matches the assignment: WBS 3.2 is the first implementation slice, followed by BOM/power measurement (4.2), offline/power recovery (4.4), and venue kit (6.2).
- This session used Codex / GPT-5. The human owner's preferred tool/model is not independently confirmed.
- Availability remains **unconfirmed**; no hours or dates are treated as accepted commitments.
- The implementation scope matches reality for this checkout: `appliance/` has no real sensors, fabricated appliance, power instrument, or live server consumer. The queue demonstrates synthetic file replay only.
- The contract is consumed exactly as merged. The repository's `docs/CONTRACT-APPROVAL-RECORD.md` still says approval is pending; Sibusiso/Lethabo must reconcile that record before the contract is described as fully frozen.

## Needs and blockers

- No appliance → Lethabo procurement decision.
- no UPS measurement → borrow test equipment through team.
- event envelope v0.1.0 is merged in `contracts/events.schema.json`, with Lethabo's PR #6 approval and Sibusiso's implementation instruction; the approval record still requires reconciliation before calling the contract fully frozen. Build against the exact fields and rejection rules. `test/events-contract.test.mjs` is the pattern mirrored by the producer tests. No live server consumer exists yet — validate against the schema directly until one does.
- Consumer confirmation remains a separate cross-layer blocker: current `POST /v1/sightings` accepts `SightingEvent` (the envelope plus required `Sighting` payload), while WBS 3.2 intentionally emits the envelope only. Sibusiso/Khutso must track and resolve payload construction; this producer must not be described as live-ingest ready.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Decisions affecting others

No approved decisions. Proposed tasks depend on both-lead acceptance; decisions changing contracts use docs/OVERLAPS.md and an append-only build-log reference.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Spare cables/power-bank kit.
- camera field-of-view consent checklist.
- hardware disposal and handover instructions.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

## Running log

- 2026-09-12 — Codex assistant: prepared this proposed package from the supplied roster. No human activity, tool choice, availability or approval inferred. Next: owner confirms capacity and selects first task.
- 2026-09-15 — Protocol correction: the WBS/path declaration for 3.2 was recorded in this file after implementation began, rather than before the first edit as RULES/AGENTS require. The paths are now explicit (`appliance/agent.py`, `appliance/tests/`, `appliance/README.md`, `team/vukosi.md`, `docs/BUILD-LOG.md`); no shared contract was edited. This correction is assistant-authored and included in PR #24.
- 2026-09-19 — Codex assistant, at Vukosi's request: recorded WBS 4.2 candidate supplier listing observations and an unexecuted power-measurement procedure on `feat/vukosi-4.2-bom-power`; added the business/evidence handoff and shared-surface claim. No formal quote, procurement, power measurement, or reviewer approval is claimed. See `docs/build-log/entries/2026-09-19-codex-wbs-4-2-bom-power.md`.
