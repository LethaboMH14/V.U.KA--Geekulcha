## 2026-09-24 | Babatunde Adelusi (via OpenCode assistant) | Economics v2 rebuild (P3.B1) | PROPOSED — PR #65, price decision pending

**Research** — Read `docs/MASTER-CONTEXT.md`, `RULES.md`, `AGENTS.md`, `docs/VUKA-2-SPEC.md`, `team/babatunde.md`, `docs/OVERLAPS.md`, `docs/AGENT-ROUTING.md`, five newest build-log entries. Reviewed PR #65 history: Sibusiso's CHANGES_REQUESTED (unsupported R5,090 "Resolved" status), Lethabo's C2/C3 review (unit errors, denominator ambiguity, price/VAT conflicts, missing sources), Babatunde's own CHANGES_REQUESTED accepting findings. Re-read `scripts/economics_vigil_anchor.py` v1, `docs/ECONOMICS-VIGIL-ANCHOR.md`, `docs/PRICING-WORKING.md`, `docs/MARKET-DATA.md`, `docs/EVIDENCE.md`. Confirmed the branch was 47 commits behind main and contained only a checklist, not a rebuilt model.

**Real data / references** — `FACT`, checked 24 Sep:
- `py scripts/economics_vigil_anchor.py` (v2) → ceiling/floor sensitivity matrix printed; breakeven at R50 excl. VAT = 3,774 (5 stipends) / 5,503 (7 stipends); R50 incl. VAT = 4,342 / 6,331.
- `node scripts/check-docs.mjs` → pass.
- `node scripts/check-intake.mjs` → pass.
- `npm test` (root) → 10 passed.
- `cd shared && npx vitest run` → 94 passed, 5 skipped (T01/T02 awaiting vectors).
- `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .` → no leaks.
- `.tools/gitleaks.exe git --redact --config .gitleaks.toml --log-opts="--all"` → no leaks.
- `git diff --check` → clean.

**Business reasoning** — The economics model must be reproducible, with every input tagged and no hardcoded price. The ceiling/floor framework makes the insurer's willingness-to-pay explicit and separates measured pilot outputs (claims reduction, retention value) from VUKA's cost structure. This answers criterion B: a buyer can reproduce the arithmetic and see exactly what is FACT, ESTIMATE, ASSUMPTION, or PROPOSED.

**Competitor reference** — FNB GuardMe (R19.90/mo, Apr 2022) and iTOO [My]Cylution (R22.50–R300/mo) remain the shelf comparators. The model now shows feasibility at r=10% for 5k+ members (5 stipends) and at r=15% for 1k members, grounding the R50 working number in insurer economics rather than an arbitrary choice.

**Changed:**
- `scripts/economics_vigil_anchor.py` — completely rebuilt v2: ceiling/floor model, all inputs tagged (FACT/ESTIMATE/ASSUMPTION/PROPOSED), no hardcoded price, member-sensitive compliance allocation, support step-cost (1 agent/5k), VAT modes (excl/incl), free-to-paying ratio, stipend scenarios (5 vs 7), payroll levies (UIF/SDL), actuary test, sensitivity matrix (r=5/10/15/20% × 1k/5k/10k members × 5/7 stipends), price feasibility table, JSON/sensitivity CLI.
- `docs/PRICING-WORKING.md` — reverted unsupported "Resolved" on R5,090 (item 4); added §6 with rebuilt model key outputs: ceiling/floor feasibility matrix, breakeven tables (5/7 stipends, VAT-excl/incl, free ratios), operating margins, actuary test, tagged cost inputs.
- `docs/ECONOMICS-VIGIL-ANCHOR.md` — aligned with script v2: variable cost now cloud-only R0.15; fixed cost broken down (stipends, split R5,090, compliance annual, support step-cost, anchoring ceiling); breakeven tables updated; ceiling/floor model documented; sensitivity matrix included; VAT/free-member sections added; all cost inputs tagged.
- `docs/MARKET-DATA.md` — added source URLs and dates for all FACT rows in §4 (Hedera, USD/ZAR, Azure, WinSMS, Indeed, iTOO, AON, ProCompare, CIPC, Rivermate, Xero, OpenAI, Anthropic); added URLs/dates for SABRIC, Prudential Authority, VAT threshold, competitor pricing; updated source rule note.
- `docs/CHECKLIST.md` — P3.B1 ticked ☑ with detail.
- `team/babatunde.md` — updated Current task, Claimed files, Running log.
- New build-log entry: this file.

**Evidence:** `py scripts/economics_vigil_anchor.py --sensitivity` → ceiling/floor matrix and price feasibility table; `py scripts/economics_vigil_anchor.py --json` → full machine output; all checks pass.

**Decision:** Economics v2 rebuild complete on the branch. P3.B1 marked done. Remaining: price decision (owner choice), fresh non-author review on PR #65, then merge.

**Needs/blockers:**
- Babatunde to post price decision with script output quoted on PR #65.
- Lethabo (reviewer) to accept the rebuilt model.
- Khutso to confirm source links into `docs/EVIDENCE.md` where needed.
- Team to decide 5 vs 7 stipends (changes breakeven materially at R50: 3,774 vs 5,503).
- Team to confirm target margin (currently 0 at breakeven; margin_per_member is a configurable input).

**Business handoff:** The rebuilt model is the arithmetic source of truth for the deck, Lean Canvas, and pitch script. Every number in those artefacts must trace to `py scripts/economics_vigil_anchor.py` output. The ceiling/floor matrix tells the insurer exactly what claims reduction (r) makes the deal feasible at their member count. The pitch rule from PR #50 holds: show tier and E-level only; never a score.

**Next:** Babatunde posts price decision on PR #65, requests fresh review, and merges after acceptance.