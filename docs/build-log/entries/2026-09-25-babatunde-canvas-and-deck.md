## 2026-09-25 | Babatunde Adelusi (via OpenCode assistant, DeepSeek V4.1 Flash) | P3.B3/P3.B4 commercial canvas + deck structure | Proposed — 3 new docs, open decisions

**Research** — Read `docs/LEAN-CANVAS.md` (stale, four-layer), `docs/SONKE-OVERVIEW.md`, `docs/ECONOMICS-VIGIL-ANCHOR.md`, `docs/MARKET-DATA.md`, `docs/PRICING-WORKING.md`, `docs/VUKA-2-SPEC.md` §8/§10/§16, `docs/adr.md` ADR-0034/0035/0037, `docs/EVIDENCE.md`, `docs/OPEN-GAPS.md`, `docs/MASTER-CONTEXT.md` §2/§6/§8, `RULES.md`, `team/*.md`, `docs/PROBLEM-STATEMENT-SLIDES.md`, and `scripts/economics_vigil_anchor.py` (v2). Ran the script's own functions for the margin/profit table.

**Real data / references** — Verified: R2.4bn / 110,074 (SABRIC 2025); 743 Ombud cases/month, +25% (NFO 2025); R4,962.38 per formal case (OBS 2024, 2023 data); fraud complaints ≈doubled and ≈61 days (The Citizen, 16 Mar 2026); 17,061 kidnappings, 44% hijacking (SAPS/ISS 2024); Santam <24% share, >1m policyholders. Script v2: break-even at R50 = 3,774 (5 stipends) / 5,503 (7); VAT-incl 4,342; operating margin 57.1% at 10k and 86.4% at 100k; annual profit R3.42M at 10k. Fixed ops base R9,519.17; anchoring ceiling R569.47.

**Business reasoning** — The canvas and deck are the sell: ten blocks and twelve slides that answer "why does this make money?" and "why will this work?" for two payers, with every figure tagged so an insurer, an actuary or a judge can check it.

**Competitor reference** — FNB GuardMe (R19.90) and iTOO [My]Cylution (from R22.50) set the shelf price for a panic/cyber feature; VUKA is a different product class (verified duress evidence), so the comparison is class, not price.

Changed: `docs/BUSINESS-CANVAS.md` (new), `docs/PITCH-DECK-STRUCTURE.md` (new), `docs/EVIDENCE-VERIFICATION.md` (new), this build-log entry. No spec, ADR, contract, script or code changed.

Evidence: `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` run locally. **Corrections applied (stale/dead numbers), each flagged in `EVIDENCE-VERIFICATION.md`:** Santam "24% / 3.7m" → "<24% / >1m"; fixed monthly "R155,659.47" → "R160,088.64"; per-member "R5.72" → v2 "R0.15 cloud + fixed steps"; "79% margin" → script's 57.1%/86.4%. **Demoted to `ASSUMPTION` (unsourced):** "85% of SA adults bank on a phone", King Price, TAM/SAM/SOM, R2M seed, TIA R1.2M, angel R800k, and the "~13,600 coerced transfers" (with the midnight peak) carried from the problem-statement deck. **Drift found and not fixed (needs go):** `docs/ECONOMICS-VIGIL-ANCHOR.md` §2's margin table (42.8%/69.6%) does not match the script (57.1%/86.4%).

Decision: none. Price (R50) and stipend count (5 vs 7) remain open; the canvas states both.

Needs/blockers: Babatunde — price and stipend decisions, and the funding build-up; Khutso — confirm/retire ~13,600 and the midnight peak; team — reconcile the margin table.

Business handoff: the three docs to the deck, the Sonke canvas and the pitch.

Next: decide price + stipends, source the funding ask, then build the Figma deck (Figma MCP is not connected in this environment).
