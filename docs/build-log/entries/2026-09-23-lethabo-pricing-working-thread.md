## 2026-09-23 | Lethabo (co-lead), via Claude Code assistant | Pricing working thread opened for Babatunde | PROPOSED — Babatunde owns every figure

**Research** — Carried the open pricing points from the PR #43 thread (merged 23 Sep) into one working document, so the discussion continues on its own PR.

**Real data / references** — No new figures. Each open point links the PR #43 comment it came from. The conflicting figures (SABRIC 2024 incidents, the Prudential Authority claims ratio) are listed as needing their literal source span.

**Business reasoning** — The price becomes an output of the model. The review found the proposed formula runs backwards. Settling that before Friday avoids a pitch number an actuary would reject.

**Competitor reference** — FNB GuardMe (R19.90, April 2022) and iTOO [My]Cylution (R22.50–R300), as already cited in `docs/ECONOMICS-VIGIL-ANCHOR.md`.

Changed: `docs/PRICING-WORKING.md` (new).

Evidence: `node scripts/check-docs.mjs` passed before commit.

Decision: None. Babatunde decides the price by Fri 25 Sep.

Needs/blockers: Babatunde's model rebuild and sources; Khutso adds the confirmed figures to `docs/EVIDENCE.md`.

Business handoff: This file is Babatunde's.

Next: Babatunde pushes the rebuilt script, the market data and the sensitivity table to this branch.
