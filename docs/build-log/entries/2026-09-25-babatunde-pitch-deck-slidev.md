## 2026-09-25 | Babatunde Adelusi (via OpenCode assistant, DeepSeek V4.1 Flash) | P3.B4 (deck) | In progress — PR open, price pending

**Research** — Read `docs/PRICING-WORKING.md` §6, `docs/ECONOMICS-VIGIL-ANCHOR.md` §2/§9/§11, `scripts/economics_vigil_anchor.py` (v2), `docs/MASTER-CONTEXT.md` §8 (the dead-number list), `docs/EVIDENCE.md`, `docs/VUKA-2-SPEC.md` §8 and §10, and the bank research on the Ombudsman for Banking Services / National Financial Ombud Scheme. Ran the script to verify every economics figure that reaches the deck.

**Real data / references** — Script v2 output: break-even at R50 excl. VAT 3,774 (5 stipends) / 5,503 (7 stipends); incl. VAT (5) 4,342; feasibility floor ≤ ceiling at 5,000 members r ≥ 10% (+R3.90) and 10,000 members r ≥ 10% (+R20.21); anchoring ceiling R569.47/month (spec §10); fixed ops base R9,519.17/month. Bank anchor R4,962.38 per formal case (OBS Annual Report 2024, 2023 data); banking formal cases +25.4% y/y (NFO 2025); fraud resolution ~61 days (The Citizen, 16 Mar 2026). SABRIC 2025 R2.4bn / 110,074 incidents; BioCatch 75% (May 2026).

**Business reasoning** — The deck is the pitch's single source of truth. It makes the insurer (volume payer, per enrolled member per month) and the bank (evidence payer, per case, later phase) explicit, and keeps every figure traceable, so a panel, an actuary or a judge can check it rather than trust it.

**Competitor reference** — FNB GuardMe (R19.90/month, press Apr 2022) and iTOO [My]Cylution (from R22.50/month) set the shelf price for a panic/cyber feature; VUKA is a different product class — verified duress evidence — not a cheaper panic button.

Changed: `docs/PITCH-DECK.md` (new, Slidev format); `package.json` (`slides` script + `@slidev/cli`, `@slidev/theme-default` dev dependencies); `package-lock.json`; this build-log entry; `team/babatunde.md` running log.

Evidence: `py scripts/economics_vigil_anchor.py` (v2) matched every economics figure in the deck; `npm run slides` serves the deck at http://localhost:3030/. Draft corrections applied and listed in the PR: 85% → 75% (dead number), Santam 3.7m → "more than 1 million", accountant `FACT` → `ESTIMATE`, R155,659.47 → R160,088.64 (retired pre-v2 total), per-member R5.72 → v2 variable R0.15 plus fixed steps. Wording fixes: "before the attacker knows it fired" → "in the background, discreetly"; "32-byte fingerprint" → "33-byte typed message (immediate roots coalesced per 60 s plus an hourly root)" (spec §10); "Deployable tomorrow" → "Designed to be deployable; ANCHOR server not yet deployed (slice 1 only)"; "three locations" → spec §8 transactional-outbox wording. `npm audit` reports 13 vulnerabilities (10 high) from the Slidev dev-dependency tree — waived in the PR as dev-only, not shipped code.

Decision: none. Price (R50) and stipend count (5 or 7) remain undecided.

Needs/blockers: price decision (Babatunde, due 25 Sep); stipend count (team, open); the deck's economics figures depend on the open economics-v2 branch (PR #65).

Business handoff: `docs/PITCH-DECK.md` to the whole team and to any presenter; bank/insurer wording to whoever presents.

Next: Babatunde — decide the price, then P3.B2 (`docs/COMPETITORS.md` rewrite) and P3.B3 (Lean Canvas with figures).
