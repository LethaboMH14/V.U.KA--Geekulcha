## 2026-10-28 | Sibusiso, with Claude Code assistant | Claude Code (assistant) | One-page SLA roadmap for the showcase | PROPOSED

**Research** — Read `docs/venture/04-SLA.md` in full (indicators, targets, stack, incidents, changes 1–13) and the phase table in `docs/venture/06-LAUNCH-ROADMAP.md` §5. Re-derived the arithmetic: 99.5% of 30 days is 216 minutes and 99.9% is 43.2 minutes; Microsoft's SLAs multiply to about 99.85% (pilot) and about 99.98% (Scale), leaving about 150 and about 35 minutes for own faults.

**Real data / references** — Every figure is copied with its tag from `04` and `06`. The "about 35 minutes" Scale margin is derived here from `04` §3 (`ESTIMATE`). Nothing was re-priced: the R470 and R7,860–R8,360 figures are `04`'s estimates, and `04` §7 lists South Africa North prices and the PostgreSQL General Purpose price as not retrieved.

**Business reasoning** — A vendor-risk team asks for service levels in writing before a pilot (`01` §7). A roadmap that says what is measured, what isn't, and where the ceiling is answers that without promising a number the team can't back.

**Competitor reference** — Not applicable.

Changed: `docs/venture/13-SLA-ROADMAP.md` (new); this entry. No change to `04`, `06` or any target.

Evidence: `git diff --check` and `node scripts/check-docs.mjs` run before the commit. Not run: any uptime measurement (there is no baseline).

Decision: none.

**Review gates (`MASTER-CONTEXT` §10).** 1 Fraud red-team: not applicable. 2 Build for use: the roadmap states that nothing is measured today. 3 Economic integrity: figures traced to `04` and `06`. 4 Privacy: not applicable. Criteria **T**, **B**.

Needs/blockers: D9 (server), acceptance of the targets, and the rota owner, all with both founders.

Business handoff: `13-SLA-ROADMAP.md` can sit beside the judges' deck slide 8.

Next: both founders decide D9; Sibusiso starts steps 2 and 4.
