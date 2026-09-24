## 2026-09-24 | Ipeleng (security lead), via Cline assistant | P3.S2 verified against the P3.S1 oracle; P3.S3 owner review of TEST-SPECS and THREAT-MODEL | ACCEPTED (threat model) / ACCEPTED WITH CONDITIONS (test specs)

**Research** — Sources read directly, not assumed:
- `contracts/vectors/canonical.json` and `merkle.json` as delivered on `feat/sibusiso-contract-v2` (the T01/T02 oracle), diffed against the shapes the harness had guessed.
- `docs/VUKA-2-SPEC.md` §5 and §6 (canonical form; Merkle, batches and proofs) and §15 (Needs column).
- Lethabo's `docs/security/TEST-SPECS.md` (T04–T52) and the `scripts/check-threat-map.mjs` mapping audit, reviewed as owner.

**Real data / references** — `shared/` vitest run against the delivered vectors: **54/54 green** — 9 golden canonical vectors byte-for-byte with SHA-256 cross-checks; 5 rejection vectors (float, non-ASCII key, ±2^53, duplicate key) refused by the strict parser (the duplicate key is caught by the parser itself, not by JSON.parse, which keeps the last duplicate silently); Merkle roots for n = 1…8; every recorded audit path reproduced and re-rooted; n = 0 rejected. Threat-map check: 63 rows, 55 fully mapped, 8 recorded in §9.

**Business reasoning** — The S2 blocker is now closed with machine evidence, not a claim: the app (Vukosi) and verify page can import `shared/*.js` knowing the bytes agree with the Python reference. Accepting the threat model with §9's honest gap table turns "no orphans" into a checkable state (`node scripts/check-threat-map.mjs`) instead of an assertion.

**Competitor reference** — Not applicable.

Changed:
- `shared/test/vectors.test.js` (branch `shared/ipeleng-p3-s2-canonical-der-merkle`, commit `acb057c`, **PR #74**): harness adapted to Sibusiso's delivered schema; golden/rejection/audit-path/n=0 suites run for real; fixed a latent harness bug (canonicalJson returns text; hashing needs canonicalize()'s bytes).
- `docs/security/THREAT-MODEL.md`: status `PROPOSED` → `ACCEPTED` (owner, 24 Sep) with the §9 unmapped rows standing as recorded observations; VP-7 (verify-page hosting integrity) is mine and is specified with T32/T33.
- `docs/security/TEST-SPECS.md`: owner review recorded with two conditions — contract-v2 UNDEFINED values are not invented by writers; no test is marked run from this document.

Evidence: `npm test` in `shared/` (vitest 5.0.1) 54/54; `node scripts/check-threat-map.mjs` 63 rows, 55 fully mapped. PR #74: https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/74

Decision: T49 stays 404 with a byte-identical body (existence must not leak through the status). T47's `attempt` field proposal is accepted in principle but waits on contract v2 (#51) — it touches the committed payload.

Needs/blockers: §9's 8 unmapped rows (GD-4/5/6, VP-7, HD-5, BK-5, CI-1/2) keep their proposed owners; SV-3 and CI-3's inferred coverage is accepted as noted. Hand-off to writers: Sibusiso and Khutso take the server specs (T06–T11, T30, T34–T38, T40, T43–T45, T48, T49), Vukosi the device specs (T15–T18, T41, T42, T46, T47) — deadline 20:00 unchanged.

Business handoff: Not applicable.

Next: merge PR #74 after cross-family review; writers confirm oracles and start implementations; T24/T37 oracles are now available for the 16:00–20:00 block (PR #43 condition B1).