# WBS 4.2 handoff — candidate BOM and power evidence

**Date:** 2026-09-19 (FACT; SAST)

**Author:** Codex assistant, GPT-5, working at Vukosi's request
**Status:** PARTIALLY COMPLETE; review and physical evidence outstanding.

This work serves C3 (solution progress). It answers “Would a real user trust and use this?” by exposing which hardware costs have a traceable public source and which power claims have not been measured. It does not claim a working household appliance.

## What is ready for review

- [`appliance/BOM.md`](../appliance/BOM.md) records item-level candidate listings, exact source pages, listed VAT prices and caveats. These are **FACT** observations of public pages, not formal quotations, procurement approval, or a complete BOM.
- [`appliance/POWER-MEASUREMENT.md`](../appliance/POWER-MEASUREMENT.md) provides a safe, repeatable **PROPOSED** procedure and blank run record. Physical draw and runtime are **NOT MEASURED**.
- `docs/OVERLAPS.md` now carries a **PROPOSED** claim for the shared hardware/BOM economics surface with Babatunde. No interface or contract changed.

## Business handoff

**To Babatunde (economics):** do not publish total cost, unit economics, amortization, or cash-vs-capital comparison from this candidate list. It contains missing production items, a conflicting accelerator-stock state, and alternative battery SKUs. A complete cost comparison needs Lethabo's approved build configuration and written supplier quotations with VAT, shipping, validity, quantity, and lead time.

**To Khutso (evidence):** the auditable claims are the linked, dated public listing observations and the explicit “not measured” power status. Please keep listing observations distinct from written supplier quotes and keep all missing items visible in downstream submissions.

**To Sibusiso (reviewer):** review board/accelerator and battery power architecture, the test-instrument gate, and the separation of proposed procedure from measured evidence. No electrical integration is approved by these documents.

**To Lethabo (procurement / architecture):** a physical appliance and measurement-equipment path are still needed. Any purchase decision, substitute, or change to the hardware architecture remains yours to approve with the relevant reviewers.

## Blockers and next steps

1. **Vukosi — evidence required:** confirm what physical hardware and suitable power analyzer are actually available; otherwise obtain access to them before claiming a measurement. Then execute and preserve raw logs using the proposed procedure.
2. **Vukosi + Lethabo — quote evidence:** obtain current written quotes for chosen SKUs and unresolved lines. Resolve the Pi 5 mains plug/adapter and the AI HAT stock conflict.
3. **Vukosi + Sibusiso — design review:** settle safe battery charging, regulation, power-path, protection, and measurement boundary before battery testing.
4. **Babatunde — economics:** after the above, produce a priced BOM and model only from approved quantities and documented costs.
5. **Khutso — evidence trail:** link accepted quote files and raw measurement records with source, date, sample size, instrument, and caveats.

**Schedule note:** the team schedule marks 2026-09-17 for WBS 4.2 and 2026-09-19 for WBS 4.4; those are **ASSUMPTION** dates in `team/vukosi.md`, and WBS 4.2's date has passed. No revised due date or completed WBS 4.4 dependency is asserted; leads should rebaseline if needed.

**Formal supplier quotes obtained:** none. **Power runs completed:** none. **Procurement or reviewer approval:** none inferred.

## Dependent-work rebaseline proposal

This proposal serves C3. It protects trust by requiring real prerequisites for hardware claims and by separating dependency risk from completed work.

**FACT (repository baseline):** `docs/audit/05-team-operating-system.md` labels task dates and hours as assumptions and says human schedule acceptance is pending. It lists WBS 4.2 for 2026-09-17, WBS 5.2 for 2026-09-18 (dependent on 4.2), WBS 4.4 for 2026-09-19 (dependent on 3.2 and 4.2), WBS 5.3 for 2026-09-19 (dependent on 2.5, 5.1 and 5.2), WBS 4.5 for 2026-09-20 (dependent on 3.5, 4.3 and 4.4), and WBS 6.2 for 2026-09-22 (dependent on 4.4). The same repository baseline records feature freeze on 2026-09-24 and the event on 2026-09-25 to 2026-09-27, with final submission at 15:00 SAST on 2026-09-27. These are repository-plan facts, not independently reverified event notices.

| WBS | Existing planned date (ASSUMPTION) | Evidence/status verified here | Required owner action |
|---|---|---|---|
| 4.2 | 2026-09-17 | Partial: public listings and proposed measurement procedure; no formal quotations or physical readings. | Vukosi confirms availability; Lethabo confirms appliance/procurement path; Sibusiso reviews the test setup. |
| 5.2 | 2026-09-18 | Not verified in this task; its 4.2 input is partial. | Babatunde confirms task status and whether public listings can support a clearly provisional business analysis; do not present them as supplier quotes. |
| 4.4 | 2026-09-19 | Not evidenced; depends on 4.2 and physical setup/instrument availability is unconfirmed. | Vukosi confirms resources, then records actual mains/WAN-loss test outcomes or keeps it blocked. |
| 5.3 | 2026-09-19 | Not verified in this task; dependency on 5.2 and other inputs remains. | Babatunde confirms status/date after checking 2.5, 5.1 and 5.2 with their owners. |
| 4.5 | 2026-09-20 | At risk through 4.4; status of 3.5 and 4.3 was not checked here. | Sibusiso verifies all prerequisites and proposes a checkpoint date; leads decide any scope cut. |
| 6.2 | 2026-09-22 | Not verified; depends on 4.4 and the actual venue kit is not inventoried here. | Vukosi inventories available kit and tests it only after 4.4 prerequisites are met. |

**PROPOSED conditional recovery sequence, not commitments:** if the physical appliance, appropriate analyzer, written quotes, and Vukosi's availability are confirmed before 2026-09-20, target WBS 4.2 by 2026-09-20, WBS 4.4 by 2026-09-21, retain WBS 6.2 at 2026-09-22, and target the WBS 4.5 evidence checkpoint by 2026-09-23 if WBS 3.5 and 4.3 are also accepted. These dates leave the repository's 2026-09-24 feature-freeze milestone unchanged; they are **PROPOSED** and require both leads' agreement plus each owner's capacity confirmation.

If those prerequisites are not available for the conditional WBS 4.2 target, **PROPOSED**: do not keep moving dates silently or claim hardware coverage. Lethabo and Sibusiso should decide whether to procure/borrow the required kit or explicitly cut physical power/offline claims from the event scope. Babatunde must separately decide with the leads whether WBS 5.2 can proceed using source-linked public listing observations with missing costs visible; no date is proposed for WBS 5.2 or 5.3 until Babatunde confirms their status and availability.

**Authority/status:** this is a Vukosi-authored proposal recorded by the Codex assistant, not a change to `docs/audit/05-team-operating-system.md` or `docs/HANDOVER.md`. Both leads (Lethabo and Sibusiso) must approve any changed cross-team due dates/scope; Vukosi must confirm personal capacity; Khutso should record the accepted change in the canonical WBS/calendar. No approvals or confirmations are recorded yet.
