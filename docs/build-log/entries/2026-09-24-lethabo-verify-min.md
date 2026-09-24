## 2026-09-24 | Lethabo (co-lead, acting security lead), via Claude Code assistant | Verify-min (P3.S7): `shared/verify.js` | PROPOSED — review pending

**Research** — Built against `docs/VUKA-2-SPEC.md` §4 (entry format v2 and the signed statement), §4a/ADR-0042 (keys from the chain only) and §5 (canonical form), plus the `SubjectExport` shape in contract v2 (#51). Reuses `shared/canonical.js` and `shared/der.js`.

**Real data / references** — Test fixtures only: `sim_`-style ids and WebCrypto P-256 keys generated in each test run, with no committed keys. `cd shared && npx vitest run` gives 74 passed and 4 skipped. The skips are the T01/T02 vector suites, waiting on #51.

**Business reasoning** — "A stranger can check the record without trusting us" needs a verifier that runs without our server. This is the chain half of it. The anchor half (the Hedera mirror, the pinned manifest) is next, before the full verify page (Sat 26 Sep 18:00).

**Competitor reference** — Not applicable.

Changed:
- `shared/verify.js` (new): `verifyExport` and `normaliseExport`. It checks, in order and stopping at the first break:
  - shape;
  - the genesis and `prev_hash` links;
  - `event_hash` recomputation;
  - the payload commitment (16-byte salt), where deletion keeps the hash;
  - the device or guardian ECDSA P-256 signature over the §4 signed statement, with keys rebuilt from the chain and `actor_id` bound to the registered key;
  - per-key counter replay.

  A server entry can't register a key.
- `shared/test/verify.test.js` (new): the valid chain; T04 (payload, outer field, link and signature each tampered); T21 (six signed fields, each re-hashed so only the signature can catch it); deletion; bad inputs.
- `shared/scripts/verify-export.mjs` (new): the CLI.
- `shared/README.md`: documents the module.

Evidence: `cd shared && npx vitest run` gives 74 passed and 4 skipped.

Decision: **`ok: true` means internal consistency only** (`assurance: "internal_consistency_only"`). Anyone can build a self-consistent chain with their own keys, so no screen may say "verified" on this result alone. It becomes "verified" only after the pinned anchor and key-manifest checks (§6, §10).

Needs/blockers:
- The export's payload/salt keying and proof binding (SEC-3 and SEC-4 on #51).
- `revoked_key_id` on `key_revoked` entries (ADR-0042), for the revocation check.
- Server signatures (Ed25519, pinned manifest).

Business handoff: Babatunde can say "anyone can check the chain with an open-source script", but not "verified by blockchain" until the anchor checks land.

Next: the anchor half (mirror fetch, type byte, root binding, pinned topic, T05 and T22), then the verify page UI.
