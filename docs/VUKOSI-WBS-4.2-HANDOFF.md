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
