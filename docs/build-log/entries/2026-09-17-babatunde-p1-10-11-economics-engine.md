## 2026-09-17 | Babatunde (via Claude Code, Sonnet 5) | tool/model: Claude Code | P1.10, P1.11 | ◐ in progress → gross margin/VAT closed, CAC/LTV formulas built without real inputs

**Research** — Read `docs/EVIDENCE.md` lines 73/75 for the real KHAYA unit-economics figures (R299 price, R125 hardware amortised, R12 cloud+anchor, R25 support/ops, R137 gross margin). Read `docs/COMPETITORS.md` and confirmed zero competitor pricing exists — reserved for Babatunde's own P1.13. Read `docs/08-BUSINESS.md` §1–3 in full: market sizing, all five revenue streams (2.1–2.6), and the cost structure section, including the explicit "sell through security companies" channel strategy in §4.

**Real data / references** — All five cost/price lines are `FACT`, sourced to `docs/EVIDENCE.md`. The R2.3m VAT registration threshold (effective 1 Apr 2026) is the existing rule already recorded in `docs/CHECKLIST.md` P1.10 and `docs/MASTER-CONTEXT.md`; this entry adds the computed crossover point (~641 subscribers/year at R299/month) rather than restating the rule. CAC/LTV/churn/payback/burn/runway have **no real data anywhere in the repo** — confirmed by grep before writing anything — so the engine reports `NOT YET MEASURED` for each rather than inventing a figure.

**Business reasoning** — A reproducible gross-margin calculation (code, not a model, doing the arithmetic) means the R137/45.82% figure quoted anywhere else in the repo is now independently checkable in one command. The VAT crossover tells the team exactly how many pilot subscribers can be onboarded before a new compliance cost line appears — useful for scoping the 90-day pilot honestly. The CAC/LTV engine, even empty, means the team is one pilot away from real unit economics instead of building the formulas under deadline pressure later.

**Competitor reference** — Not applicable. This entry is internal unit economics, not a comparative claim against Vumacam/Fidelity ADT/etc.

Changed: New `scripts/economics_engine.py` (pure stdlib, no dependencies) and `docs/09-ECONOMICS.md` (presentation of its output with FACT/ASSUMPTION tags). `docs/CHECKLIST.md` P1.10 row ticked ☑, P1.11 row set to ◐ (half-closed — computable metrics done, CAC/LTV family blocked on real pilot data). `team/babatunde.md` Current task updated.

Evidence: `python3 scripts/economics_engine.py` — real command, real output, reproduced the R137.00/45.82% figure exactly matching `docs/EVIDENCE.md`, computed VAT crossover at 641 subscribers, and printed `NOT YET MEASURED` for all seven CAC/LTV-family metrics.

Decision: none — no ADR required, this is a calculation tool and a documentation artefact, not an architecture or contract change.

Needs/blockers: Real CAC/churn/burn/runway data requires an actual pilot with real spend and a live subscriber cohort — no owner or date exists for that yet, since no pilot has launched. Channel-cost commission rate (currently a labelled 20% `ASSUMPTION`) needs a real negotiated rate once a named security-company partner exists — Babatunde's own P1.13/P1.12 territory, not fabricated here.

Business handoff: `docs/09-ECONOMICS.md` — Babatunde can quote the R137/45.82% gross margin and the VAT crossover directly in the pitch deck; must NOT quote the CAC/LTV placeholder values or the 20% channel commission as real figures.

Next: Babatunde, P1.12 (validate a real named pilot site or label `ASSUMPTION`) and P1.13 (competitor pricing sweep), proposed Sep 18.
