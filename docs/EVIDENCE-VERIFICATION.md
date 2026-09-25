# VUKA — Evidence verification register

> **Owner:** Babatunde Adelusi. **Status:** `PROPOSED`. **Purpose:** every figure in `docs/BUSINESS-CANVAS.md`, `docs/PITCH-DECK-STRUCTURE.md` and the problem-statement deck, checked against its source and its tag.
> **Method:** each figure was compared to `docs/EVIDENCE.md`, the source it cites, and `scripts/economics_vigil_anchor.py` (v2). "Verified?" = can we point to the source that says this, at the stated tag.
> **Result:** **26 verified, 3 stale/corrected, 6 unsourced (demoted or flagged).** Unsourced figures were **demoted to `ASSUMPTION`** and must be sourced or dropped before they reach a judge.

Legend — **Verified?**: `Y` source confirms · `~` secondary/partial · `N` not verified · `n/a` assumption/target.

| Figure | Value | Where used | Tag | Source | Verified? | Action |
|---|---|---|---|---|---|---|
| Coerced transfers / year | ~13,600 | Canvas B1 | `ESTIMATE` | SAPS + ISS (calculated) | **N** | Not in `EVIDENCE.md` and not reproducible — Khutso to confirm or drop |
| Digital banking crime (2025) | R2.4bn | Canvas B1; Deck S5 | `FACT` | SABRIC 2025 (11 Aug 2026) | `Y` | Keep the scope caveat (all digital banking crime) |
| Digital banking incidents (2025) | 110,074 | Canvas B1 | `FACT` ⚑ | SABRIC 2025 | `~` | Keep ⚑ (detailed figures secondary) |
| Ombud banking cases | 743/month, +25% y/y | Canvas B1/B9; Deck S5 | `FACT` | NFO Annual Report 2025 | `Y` | — |
| Cost per escalated case | R4,962.38 | Canvas B1/B5/B9; Deck S5/S10 | `FACT` | OBS Annual Report 2024 (2023 data) | `Y` | State "levy-funded system cost, not a bank invoice" |
| Fraud resolution time | ~61 days | Canvas B1; Deck S5 | `FACT` | NFO via The Citizen, 16 Mar 2026 | `~` | Keep the source on the slide |
| Fraud complaints | ~doubled 2024→2025 | Canvas B1 | `FACT` | The Citizen, 16 Mar 2026 | `~` | Keep the source |
| Kidnappings 2023/24 | 17,061; 44% hijacking | Problem slides; Deck S1 | `FACT` | SAPS via ISS Africa, 3 Dec 2024 | `Y` | — |
| Anchoring ceiling | R569.47/month | Canvas B2/B4/B8; Deck S9 | `ESTIMATE` | spec §10; script | `Y` | ESTIMATE, not FACT |
| Insurer price | R50/member/month | Canvas B5/B9; Deck S10 | `ASSUMPTION` | working number, undecided | `n/a` | **Decide** |
| Bank price | R15/case | Canvas B5/B9; Deck S10 | `PROPOSED` | bank model, undecided | `n/a` | **Decide** |
| R15 as share of escalation | 0.3% | Canvas B5 | `ESTIMATE` | derived (15 ÷ 4,962.38) | `Y` | Derived from the `FACT` |
| Santam | market share <24%; >1m policyholders | Canvas B5 | `FACT` | Santam investor relations | `Y` | **Corrected** from "24% / 3.7m" (dead number) |
| Discovery Insure (Vitality Drive) | runs it | Canvas B5 | `FACT` | Discovery Insure | `~` | — |
| King Price | discounts for safety devices | Canvas B5 | `ASSUMPTION` | none | **N** | Source or drop |
| Absa digital fraud H1 2026 | R129m | Canvas B5 | `FACT` ⚑ | BusinessTech, 18 Aug 2026 | `~` | Keep ⚑ (secondary) |
| SA adults banking on a phone | 85% | Canvas B5 | `ASSUMPTION` ⚑ | none | **N** | Source or drop |
| TAM / SAM / SOM | see B5 | Canvas B5 | `ASSUMPTION` | none | **N** | Frame explicitly as assumptions; source the TAM |
| Fixed ops base | R9,519.17/month | Canvas B8 | `ESTIMATE` | script v2 | `Y` | — |
| Fixed monthly (pre member-dependent steps) | R160,088.64 | Canvas B8 | `ESTIMATE` | script v2 (150,000 + 9,519.17 + 569.47) | `Y` | **Corrected** from R155,659.47 (retired pre-v2) |
| Per-member variable | R0.15 (cloud) | Canvas B8 | `ESTIMATE` | script v2 | `Y` | **Corrected** from R5.72 (retired blended figure) |
| Support (step) | R25,000/mo per 5,000 | Canvas B8 | `ESTIMATE` | script v2 | `Y` | — |
| Compliance | R68,000/year | Canvas B8 | `ESTIMATE` | script v2 | `Y` | — |
| Stipends | 5 × R30,000 | Canvas B8 | `ASSUMPTION` | team | `n/a` | **Decide 5 vs 7** |
| Break-even at R50 | 3,774 (5) / 5,503 (7) | Canvas B8/B9; Deck S10 | `ESTIMATE` | script v2 | `Y` | — |
| VAT-inclusive break-even | 4,342 (5 stipends) | Canvas B9 | `ESTIMATE` | script v2 | `Y` | — |
| Feasibility | 1,000 none; 5,000 r≥10% +R3.90; 10,000 +R20.21 | Canvas B9 | `ESTIMATE` | script v2 | `Y` | Never present 1,000 as feasible |
| Profit at scale | 10k → R3.42M/yr; 50k → R24.95M; 100k → R51.86M | Canvas B9; Deck S10 | `ESTIMATE` | script v2 (`annual_profit`) | `Y` | Use script outputs, not hand calcs |
| Operating margin | 57.1% at 10k; 86.4% at 100k | Canvas B9/B10 | `ESTIMATE` | script v2 (`operating_margin_pct`) | `Y` | **`ECONOMICS-VIGIL-ANCHOR.md` §2 says 42.8%/69.6% — stale/incorrect; fix that doc** |
| Claims reduction target | ≥10% | Canvas B9/B10 | `ASSUMPTION` | pilot target | `n/a` | "Measurement, not promise" |
| Seed ask | R2M | Canvas B10; Deck S11 | `ASSUMPTION` | none | **N** | Build the number up |
| TIA Seed Fund | up to R1.2M grant | Canvas B10 | `ASSUMPTION` | none | **N** | Confirm TIA terms (URL + date) |
| Angel investment | R800k | Canvas B10 | `ASSUMPTION` | none | **N** | Confirm |
| VIGIL latency (M3) | not measured | Canvas B6 | — | spec §16 | `n/a` | Nothing quoted until Vukosi posts it |
| Detection → alert render target | ≤2.0 s p95 | Canvas B6 | target | spec §16 | `n/a` | — |

## Open for Khutso (`docs/EVIDENCE.md` owner)
1. **~13,600 coerced transfers/year** — confirm the derivation or retire.
2. **"midnight / 3× a.m." peak** (problem-statement Slide 5) — sourced only from the parked four-layer dataset; confirm or retire.
3. **The claims-ratio row (51.4%)** — still needs its exact Prudential Authority span (pre-existing open item).

## Open for the team
- **Price (R50)** and **stipend count (5 vs 7)** — the two decisions that move the headline numbers.
- **`docs/ECONOMICS-VIGIL-ANCHOR.md` §2 margin table** — reconcile with the script (57.1%/86.4%).
