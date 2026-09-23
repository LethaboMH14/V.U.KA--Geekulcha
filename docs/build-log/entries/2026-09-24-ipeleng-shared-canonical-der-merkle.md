## 2026-09-24 | Ipeleng (verify page, `shared/`), via her coding assistant | Claude Code assistant (Cline), disclosed per AGENTS.md D12 | P3.S2 — `shared/` canonical, DER→raw and Merkle with vitest (T01, T02) | PROPOSED — Sibusiso's vectors and the leads' review still pending

**Research** — Read `docs/VUKA-2-SPEC.md` §5 (canonical form, seven rules), §6 (RFC 6962 trees, batches, proof encoding) and §15 (T01/T02 oracle rows), `shared/README.md`, `team/ipeleng.md` (the 09:00–11:00 P3.S2 block and T01/T02 ownership), `team/START-HERE.md` (Node 22+, vitest for `shared/`), root `package.json` (zero-dependency `node --test` contract) and the four-layer archive note that no suite count is restated without running. Checked `contracts/` on `main`: `events.schema.json` and `openapi.yaml` exist; **`contracts/vectors/` does not exist yet** — Sibusiso's P3.S1 drop is due Thu 24 Sep 09:00, so T01/T02 run with skips until then. Python 3.12 is available locally, so the JS side could be checked against the real reference implementation before the vectors land.

**Real data / references** — `FACT`, checked 24 Sep: `npx vitest run` → **49 passed, 0 failed, 4 skipped** (the 4 skips are T01/T02 awaiting `contracts/vectors/canonical.json` and `merkle.json`). Cross-language diff, run live on this checkout: **10/10 canonical cases byte-identical** between `shared/canonical.js` and Python `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)` (ASCII, Afrikaans ê, isiZulu, two emoji incl. a flag surrogate pair, control chars + DEL, ±(2^53−1), empty containers), and **8/8 RFC 6962 roots identical** between `shared/merkle.js` and a hashlib reference for n = 1…8. Commands and outputs are reproducible via `python shared/scripts/xcheck-canonical.py` and `python shared/scripts/xcheck-merkle.py` from the repo root.

**Business reasoning** — Vukosi's app and the verify page both import these three modules; a byte mismatch with the server's Python chain would reject every genuine receipt. One tested JS implementation (§5 rule 5) is what makes the verify page trustworthy for a buyer watching a receipt check.

**Competitor reference** — Not applicable.

Changed: new files only; nothing existing was rewritten except this README's own lines.
- `shared/canonical.js` — the §5 canonical form: ASCII-only keys sorted by code point, lowercase `\uXXXX` escaping with surrogate pairs (Python `ensure_ascii` parity), no floats, integers within ±(2^53−1), plus `canonicalizeJson` — a strict JSON-text entry that refuses duplicate keys (any depth), exponent/fraction floats and rounded integers, and treats `__proto__` as a plain own property.
- `shared/der.js` — Keystore DER → raw 64-byte r‖s for WebCrypto, refusing indefinite/non-minimal lengths, negative or padded-wrong INTEGERs, components over 32 bytes, zero components and trailing bytes; `rawToDer` included for fixtures.
- `shared/merkle.js` — RFC 6962 leaf/node hashing (0x00/0x01 prefixes), the §6 split table (n = 2…8 → 1, 2, 2, 4, 4, 4, 4), audit paths `[{side: "L"|"R", hash}]` leaf-to-root, path recomputation, and refusal of n = 0, unsorted/duplicate leaves and non-32-byte heads.
- `shared/test/canonical.test.js`, `shared/test/der.test.js`, `shared/test/merkle.test.js` — 49 tests incl. rejection cases; the Merkle suite cross-checks every root and path against an independently written RFC 6962 reference.
- `shared/test/vectors.test.js` — the T01/T02 harness for `contracts/vectors/`; skips with the blocker named until the files land, then enforces byte-exact golden vectors and both-language rejection vectors. Agreed file shapes are documented in `shared/README.md`; a schema mismatch fails loudly with an instruction instead of guessing.
- `shared/package.json`, `shared/vitest.config.js`, `shared/package-lock.json` — vitest as the only dev dependency (`engines.node >= 22`); `npm test` runs it.
- `shared/scripts/xcheck-canonical.{mjs,py}`, `shared/scripts/xcheck-merkle.{mjs,py}` — the Python↔JS diff harness used for the evidence above; keep using it whenever either implementation changes.

Evidence: `cd shared && npm test` → **49 passed, 0 failed, 4 skipped (T01/T02 pending Sibusiso's vectors)**; `python scripts/xcheck-canonical.py` → **10/10 byte-identical**; `python scripts/xcheck-merkle.py` → **8/8 roots identical**; `node scripts/check-docs.mjs` → passed; `node scripts/check-intake.mjs` → passed. Vitest 5.0.1 is a devDependency of `shared/` only; `node_modules` is gitignored.

Decision: none. This implements the already-specified §5/§6 forms; it changes no contract. ADR-0040 (PIN authority, PR #56) is separate.

Needs/blockers: **Sibusiso** — land `contracts/vectors/canonical.json` and `contracts/vectors/merkle.json` (P3.S1, due 09:00) so T01/T02 unskip; if his file shapes differ from the ones in `shared/README.md`, reconcile in the same PR. **Lethabo + Ipeleng** — the P3.L8 checkpoint this morning confirms the rules; no rule text here depends on it.

Business handoff: not applicable — this is the first tested product code; the demo path (verify page receipt check) gets its evidence when T03–T05 land.

Next: Ipeleng — T03 (real Keystore DER vector from Vukosi) and T04/T05 verify-page work after the vectors land Thu 09:00; test specifications T04–T24, T30–T49 by 20:00.