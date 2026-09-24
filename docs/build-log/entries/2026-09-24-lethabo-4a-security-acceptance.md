## 2026-09-24 | Lethabo (co-lead, acting security lead), via Claude Code assistant | §4a key registry accepted with security amendments — ADR-0042 | ACCEPTED — Sibusiso confirms the amendments

**Research** — Read §4a (#64), §4, §7, §9 and §10, and Sibusiso's handover. §4a was named there as "the single blocker on P3.A3 slice 2 and everything downstream", pending Ipeleng's security review.

**Real data / references** — No measurement. A design review. The findings were posted on #51.

**Business reasoning** — "A stranger can verify the record without trusting us" is the product's central claim. If the verifier trusted our key table, the claim would be false.

**Competitor reference** — Not applicable.

Changed:
- `docs/VUKA-2-SPEC.md` §4a: accepted, amended with the chain-derived registry, no server keys, and one key per device or guardian.
- `docs/adr.md`: ADR-0042.
- `docs/ADR-ACCEPTANCE-RECORD.md`: the ADR-0042 row.
- `docs/CHECKLIST.md`: P3.S14 and P3.S17 set to ☑ after the #62 security review.

Evidence: `node scripts/check-docs.mjs` and `git diff --check` were run before commit.

Decision: §4a accepted (ADR-0042). #62 approved on security review. The 13 Sep intake remediation was reconfirmed by a full-history gitleaks scan (no leaks), posted on #47.

Needs/blockers: Sibusiso confirms the three amendments, then adds `revoked_key_id` and drops `server` from `signer_role` in contract v2 (#51).

Business handoff: Not applicable.

Next: P3.A3 slice 2 can start. Security re-review of #51 on its next push.
