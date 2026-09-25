## 2026-09-24 | Lethabo (co-lead, acting security lead), via Claude Code assistant | SSDLC control recount, and a correction (P3.S9) | CORRECTION — review pending

**Research** — Re-checked each `C-nn` row's status against evidence on `main`. Status changes only where a merged file, a passing CI job or a recorded review exists; an open PR is at most "In build".

**Real data / references** — `node scripts/count-controls.mjs` gives `total=70 Done=15 In build=29 Planned=25 Not doing=1`.

**Correction.** Line 19 said "79 controls — 14 Done, 30 In build, 31 Planned, 4 Not doing", tagged `FACT`. That was wrong: the file held **70** `C-nn` rows before today's edits (13 Done, 29 In build, 27 Planned, 1 Not doing). The numbering has gaps, such as C-09 and C-44–C-49, which may be where 79 came from. The count is now produced by a script, not typed.

**Business reasoning** — The SSDLC is submitted on Sonke on Saturday. A wrong number tagged `FACT` is exactly what a judge checks.

**Competitor reference** — Not applicable.

Changed:
- `scripts/count-controls.mjs` and `test/count-controls.test.mjs` (new): count controls by status and report duplicate or missing IDs.
- `docs/security/SSDLC.md` changes:
  - line 19 now carries the script's count;
  - C-62 and C-71 move from Planned to **Done** (the `tests`, `npm-audit`, `python-audit` and `osv-scan` jobs, PR #62, reviewed 24 Sep);
  - C-03's evidence is updated (PR #45 merged);
  - C-05 cites PR #70.

Evidence: `node --test "test/**/*.test.mjs"` passes; `node scripts/check-docs.mjs` passes.

Decision: None.

Needs/blockers: C-04 and C-05 move to Done when #70 merges. C-90's semgrep ruleset differs from the one the control names: Sibusiso aligns the control text or the job.

Business handoff: Quote "70 security controls, 15 done, 29 in build" only from the script output on the submission commit.

Next: Lethabo reviews the full SSDLC before the Fri 22:00 internal gate, then uploads it at Sat 11:00.
