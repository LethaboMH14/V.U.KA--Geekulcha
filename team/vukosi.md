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

**Current task** — Minimal synthetic edge producer with `sim_` fixtures only (`3.2`), then **real BOM quotes with dates** — this converts `ESTIMATE` to `FACT` (`4.2`) — then measured power/offline recovery (`4.4`).

**Done means** the five in `docs/SESSION-PROMPT.md` — plus, for me: every figure I report has a measurement method attached, or it is explicitly labelled unmeasured.

---

- University / role: Wits / IoT developer
- Owns outright: KHAYA sensors, edge runtime, hardware and power.
- Reviews only: Sensor/data contract and physical installation assumptions.
- Lead / escalation: Sibusiso, then both leads.
- AI tool / model: UNDECLARED — owner must enter actual values.
- Availability / timezone: unconfirmed / Africa/Johannesburg.
- Current task / status: 3.2, proposed, not started.
- Claimed files / contract versions: none; reserve before editing.
- Last updated: 12 September 2026 by Codex assistant as a planning assignment.

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

No work by Vukosi Khoza is asserted. This package was created by the assistant. No files are reserved and no PR exists.

## Needs and blockers

- No appliance → Lethabo procurement decision.
- no UPS measurement → borrow test equipment through team.
- event contract frozen at v0.1.0 in `contracts/events.schema.json`, merged to main via PR #6 (Lethabo approved) — build against the exact fields and rejection rules. `test/events-contract.test.mjs` is the pattern to mirror for your own producer's output tests. No live server consumer exists yet (server/ is still scaffold-only) — validate against the schema directly until one does.

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
