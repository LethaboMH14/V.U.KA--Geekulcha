## 2026-09-24 | Lethabo (co-lead, acting security lead), via Claude Code assistant | Security test specifications T04–T24, T30–T52 and the threat-map check | PROPOSED — writers review their tests

**Research** — Drafted from:
- `docs/VUKA-2-SPEC.md` §3–§9, §15 and §17;
- `docs/PIN-AUTHORITY-RULES.md` and ADR-0036, ADR-0040 and ADR-0041;
- `docs/security/THREAT-MODEL.md` §6, `PENTEST-PLAN.md` and `SSDLC.md`.

Every oracle was reviewed against the spec text before commit.

**Real data / references** — Specification only. **No test has run**: the coverage table records every test as `not written`. The threat-map check on this commit reports `63 rows, 41 fully mapped`.

**Business reasoning** — A security judge asks "how do you know?". Each safety claim now has a written pass criterion and a named writer, so it can be checked instead of asserted.

**Competitor reference** — Not applicable.

Changed:
- `docs/security/TEST-SPECS.md` (new): 44 tests, each with proves, writer and runner, fixture, steps, oracle, prerequisites and a negative control. 17 values are marked UNDEFINED and grouped by who resolves each.
- `scripts/check-threat-map.mjs` and `test/check-threat-map.test.mjs` (new): list threat rows missing a spec or test reference. `--strict` exits 1.
- `docs/security/THREAT-MODEL.md`: T47 decided (ADR-0041). T49 corrected from "403, same body as not-found" to 404 with an identical body, because a 403 reveals that the subject exists.

Evidence: `node --test "test/**/*.test.mjs"` gives 18 of 18 passing. `node scripts/check-docs.mjs` passes. `node scripts/check-threat-map.mjs` reports 63 rows, 41 fully mapped.

Decision: T49 is 404, not 403. T47 proposes an `attempt` field in the `checkin_result` payload, so a normal PIN after the limit is never terminal (needs contract v2).

Needs/blockers: 22 threat rows still need a spec or test reference (P3.S10). Sibusiso resolves the 13 contract-v2 UNDEFINED values.

Business handoff: Not applicable.

Next: map the 22 threat rows; each writer confirms their oracles.
