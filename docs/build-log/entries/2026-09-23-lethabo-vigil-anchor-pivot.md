## 2026-09-23 | Lethabo (co-lead), via Claude Code assistant | VIGIL + ANCHOR pivot | PROPOSED — binds on second-lead acceptance

**Research** — Read Babatunde's 21–22 Sep business plan and the official GKHack26 programme (Sonke export, 23 Sep; judging criteria now published). Ran four source-checked research passes (market data, fraud/legal/platform, design) plus an independent red-team. Verified the predecessor Android app (`Team-Sonar---Vuka-/app/`) file by file. The build plan passed an independent adversarial review (three rounds, 45 findings, all resolved) before any file here was written.

**Real data / references** — SABRIC 2025 (R2.4bn, 110,074 incidents); SAPS via ISS Africa (17,061 kidnappings 2023/24, 44% during hijackings); BioCatch May 2026 (75%); FNB GuardMe R19.90; iTOO [My]Cylution from R22.50; Hedera $0.0008/message; Android 14 foreground-service rules; ECTA s15 and RICA s1 read from primary text. All rows in `docs/EVIDENCE.md` "Verified 23 September 2026", pending Khutso's re-check.

**Business reasoning** — The R100 insurer story was mis-scaled (savings counted on a whole R1.09bn book, fee charged on 10,000 members). Pricing at ~R20 partner-funded, the shelf FNB GuardMe already sells on, gives a break-even of 10,861 members that an actuary can't break (`scripts/economics_vigil_anchor.py`).

**Competitor reference** — FNB GuardMe/Aura, Namola, Google Personal Safety, Apple Check In, Noonlight: all need a press or connectivity. VIGIL's one difference is that it works when you can't press. The rewrite is P3.B2.

Changed: ADR-0034–0038 (scope, ledger, coercion governance, bank signal, no LLMs); new `docs/VUKA-2-SPEC.md`, `docs/STAGED-DURESS-DEFENCE.md`, `docs/ECONOMICS-VIGIL-ANCHOR.md`, `scripts/economics_vigil_anchor.py`; MASTER-CONTEXT v3; BRIEF, RULES, AGENTS and CODEOWNERS updated; seven detailed work orders in `team/*.md` (old sequenced work superseded, logs untouched); CHECKLIST P3 (41 rows, 12 older rows ⊘ or re-scoped with reasons); OPEN-GAPS G24–G30 added, UMOJA/KHAYA gaps parked; EVIDENCE 23 Sep section; dated banners on superseded docs.

Evidence: `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `python3 scripts/economics_vigil_anchor.py` — run before commit; results in the PR.

Decision: ADR-0034 to ADR-0038 Proposed — bind on Sibusiso's acceptance.

Needs/blockers: organiser answer on pre-event building (Lethabo, Thu 12:00); physical Android phones; Hedera, Azure and Firebase accounts.

Business handoff: `docs/ECONOMICS-VIGIL-ANCHOR.md` to Babatunde — quote the R20 model, the comparables and the corrected stats; never R100, R1.09bn, 85% or "3% saves R20.7m".

Next: all seven owners acknowledge their work orders; Sibusiso's contract v2 due Thu 24 Sep 12:00.
