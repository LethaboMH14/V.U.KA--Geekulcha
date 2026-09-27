## 2026-09-25 | Babatunde Adelusi (via OpenCode assistant, DeepSeek V4.1 Flash) | P3.B6 problem statement — Slidev deck | In progress — figure flags open

**Research** — Checked every figure in the problem-statement deck against `docs/EVIDENCE.md`, `docs/MARKET-DATA.md`, `docs/ECONOMICS-VIGIL-ANCHOR.md`, `docs/VUKA-2-SPEC.md` §10 and the bank research (OBS 2024; NFO 2025; The Citizen 16 Mar 2026). Searched the repository for the two figures that were not already in the register.

**Real data / references** — Verified: R2.4bn / 110,074 incidents (SABRIC 2025, calendar 2025, all digital banking crime, **not** coerced transfers); 17,061 kidnappings 2023/24 and 44% during a hijacking (SAPS via ISS, 3 Dec 2024); banking formal cases ≈742.83/month, +25.4% y/y (NFO Annual Report 2025); R4,962.38 cost per formal case (OBS Annual Report 2024, 2023 data); fraud complaints ≈doubled and ≈61 days average resolution (NFO via The Citizen, 16 Mar 2026); R569.47/month ESTIMATE (spec §10, script).

**Business reasoning** — A four-minute problem statement is what buys permission to show the solution; it must land with both the business and technical judges, so it leads with the victim, then shows each payer losing, then the gap only a verifiable duress record closes.

**Competitor reference** — Not applicable (problem statement, no competitor comparison). The insurer/bank loss framing is the setup for the VUKA solution slides.

Changed: `docs/PROBLEM-STATEMENT-SLIDES.md` (new); this build-log entry.

Evidence: `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` run locally. **Two figures are flagged, not sourced:**
- **`~13,600 coerced transfers a year (SAPS + ISS, calculated)`** — not found in `docs/EVIDENCE.md` or any reachable source; the calculation is not reproducible from the cited data. **Flagged ⚑ on the slide.**
- **`Peaks at midnight. Three times the early-morning rate.`** — the `00:00 hour = 1,296 incidents, ≈3× the 05:00 trough` figure is from the **parked four-layer dataset** (`archive/2026-09-four-layer/`), not current VIGIL/ANCHOR evidence. **Flagged ⚑ on the slide.**

Three wording points flagged for the owners (not changed): "sent to three places — phone, guardians, encrypted store" does not match spec §8 (transactional outbox: guardian alert, bank signal, anchor request); "a public blockchain" should be "a permissioned-consensus ledger (Hedera)" per the `docs/ANCHOR-RATIONALE.md` precision fix; "publishes … every hour" omits the immediate coalesced roots (spec §10).

Decision: none. No price or model decision is made in this deck.

Needs/blockers: Khutso to confirm or retire the `~13,600` and midnight figures before the deck is presented; Sibusiso/Lethabo on the three wording points.

Business handoff: `docs/PROBLEM-STATEMENT-SLIDES.md` to the presenters.

Next: Remove or replace the two flagged figures on Babatunde's word, then rehearse the problem statement.
