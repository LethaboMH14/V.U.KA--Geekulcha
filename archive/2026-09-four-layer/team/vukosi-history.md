# Vukosi Khoza — history (four-layer plan, to 23 Sep 2026)

Moved out of `team/vukosi.md` when VUKA pivoted to VIGIL + ANCHOR (ADR-0034). Nothing here was deleted; the running log stays in the live file.

## Merge-gate follow-up declaration — 2026-09-16

Criterion: **C3 (progress of solution profile)**. Trust answer: the follow-up makes the boundary and future acceptance test independently checkable without claiming that payload integration is already built.

Intended shared-file edits: `docs/OVERLAPS.md` (coordination claim), `docs/CHECKLIST.md` (P2.16 follow-up reference), and `docs/BUILD-LOG.md` (append-only evidence). No contract file or production access is in scope.

Ownership is **PROPOSED**, pending acknowledgement: Vukosi owns future synthetic `SightingEvent` payload emission; Sibusiso owns server-consumer confirmation; Khutso maintains the checklist/evidence record. This session records the follow-up only and does not implement payload emission or mark the consumer gate complete.

## Sequenced work

**Superseded 23 September 2026 by the work order above** — kept for history; do not execute these rows. All hours and dates below are ASSUMPTIONS, subject to availability and gates.

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

- Physical phones: at least two Android phones (user + guardian) and one budget 2–3 GB phone for M4/M5 → leads confirm who brings what by Thu 24 Sep 10:00.
- No appliance → Lethabo procurement decision.
- no UPS measurement → borrow test equipment through team.
- event envelope v0.1.0 is merged in `contracts/events.schema.json`, with Lethabo's PR #6 approval and Sibusiso's implementation instruction; the approval record still requires reconciliation before calling the contract fully frozen. Build against the exact fields and rejection rules. `test/events-contract.test.mjs` is the pattern mirrored by the producer tests. No live server consumer exists yet — validate against the schema directly until one does.
- Consumer confirmation remains a separate cross-layer blocker: current `POST /v1/sightings` accepts `SightingEvent` (the envelope plus required `Sighting` payload), while WBS 3.2 intentionally emits the envelope only. Sibusiso/Khutso must track and resolve payload construction; this producer must not be described as live-ingest ready.

Needed dates: before the dependent WBS leaf above; owner records actual evidence and escalation here.

## Definition of done

Every assigned leaf has the independent evidence in the table, reviewer acceptance, relevant checks, honest built/specified/simulated status, an updated personal log and BUILD-LOG entry, and business handoff when capability changes. Blocked tasks remain blocked; no inferred approval from elapsed time.

## Outside-role work

- Spare cables/power-bank kit.
- camera field-of-view consent checklist.
- hardware disposal and handover instructions.

These are proposed additional contributions, not unbudgeted critical-path commitments. Agree ownership and time with leads before starting.

