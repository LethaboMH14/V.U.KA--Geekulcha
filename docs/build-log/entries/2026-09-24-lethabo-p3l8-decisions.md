## 2026-09-24 | Lethabo (co-lead, acting security lead), via Claude Code assistant | P3.L8 checkpoint decisions — ADR-0041 | PROPOSED — Sibusiso's acceptance pending

**Research** — Read the eight open items in `docs/PIN-AUTHORITY-RULES.md` §8, together with:
- `docs/VUKA-2-SPEC.md` §8 and §9;
- `docs/OPEN-GAPS.md` G33–G35;
- `docs/security/THREAT-MODEL.md` TM-C9 and TM-C10;
- the coercion-catalogue scenarios behind them: E06, E10, E11, I01 and F06 (`docs/COERCION-SCENARIOS.md`).

**Real data / references** — No measurement. These are design decisions. Each one has an executable test named in spec §15: T30, T47 and T50–T52.

**Business reasoning** — A false alarm that ends in a bank signal is the fastest way to lose a bank or insurer partner. A journey an attacker can end with one tap is the first question a security judge will ask. Both are now answered in the spec.

**Competitor reference** — Not applicable.

Changed:
- `docs/adr.md`: ADR-0041 added (Proposed).
- `docs/ADR-ACCEPTANCE-RECORD.md`: ADR-0040 accepted as amended; ADR-0041 pending.
- `docs/VUKA-2-SPEC.md`:
  - §8: the fallback deadline, the wrong-PIN rule, member-ended closure, `contact_lost` without a bank signal after all-normal outcomes, the PIN-gated journey end, and `incident_closed.reason`;
  - §9: the recovery freeze confirmed, two new rows, the pre-incident hold, and duress no-ops that keep showing success;
  - §15: T30, T47, T50, T51 and T52;
  - §17: the new residual.
- `docs/PIN-AUTHORITY-RULES.md` §8 and §7: statuses and oracles.
- `docs/OPEN-GAPS.md` G33–G35 and `docs/security/THREAT-MODEL.md` TM-C9 and TM-C10: statuses.
- `docs/CHECKLIST.md`: P3.L8, P3.S20 and P3.S21 set to ◐.

Evidence: `node scripts/check-docs.mjs` and `git diff --check` were run before commit.

Decision: Lethabo decided all eight items on 24 Sep 2026. ADR-0041 binds when Sibusiso accepts it.

Needs/blockers:
- Sibusiso accepts ADR-0041, then adds `end_journey` and `incident_closed.reason` to contract v2 (#51).
- Vukosi confirms the identical journey-end path on Android.

Business handoff: Babatunde can say "a false alarm you answer never reaches your bank" and "ending a journey needs your PIN". No detection-accuracy claim changes.

Next: T30, T47 and T50–T52 go into the security test specifications (P3.S3/P3.S11). The coercion catalogue is re-run under the new rules.
