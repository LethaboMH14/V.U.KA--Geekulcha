# shared/ — code both the app and the verify page use

- `canonical.js` — the canonical JSON form (`docs/VUKA-2-SPEC.md` §5), identical byte for byte to the Python reference. Exports `canonicalJson`, `canonicalize` (bytes), `canonicalizeJson` (strict text parse: duplicate keys, floats and unsafe integers refused) and `CanonicalisationError`.
- `der.js` — converts Android Keystore DER signatures to raw r‖s for WebCrypto. Exports `derToRaw`, `rawToDer` (test/vector helper) and `DerError`.
- `merkle.js` — RFC 6962 trees and audit paths (§6). Exports `merkleRoot`, `auditPath`, `recomputeRoot`, `leafHash`, `nodeHash`, `splitPoint`, `bytesToHex`, `hexToBytes` and `MerkleError`. Leaves are raw 32-byte chain heads in ascending byte order; an empty tree is refused (§6).

## Cross-language checks (before Thursday's vectors)

`scripts/xcheck-canonical.py` (and `.mjs`) and `scripts/xcheck-merkle.py` (and `.mjs`) run the same fixed inputs through Python (`json.dumps` / `hashlib`) and the JS modules and diff the output. Both were byte-identical when this module landed (10/10 canonical cases; 8/8 merkle roots for n = 1…8). Re-run them whenever either side changes: `python shared/scripts/xcheck-canonical.py` from the repo root.

**Owner:** Ipeleng; tested with vitest against `contracts/vectors/`. The API contract itself lives in `contracts/`, and changing it needs both leads and an ADR.

## Running the tests

```
cd shared && npm install && npm test
```

`npm test` runs `vitest run` (Node 22+; spec §15 T01/T02 and `team/START-HERE.md`). No dependencies beyond vitest ship in the modules themselves.

## Vector files (T01/T02)

`test/vectors.test.js` consumes Sibusiso's drop in `contracts/vectors/` (P3.S1, due Thu 24 Sep 09:00). Until the files land, those two suites **skip with the blocker named** — a green run before they land is not a checked T01/T02. Agreed shapes:

- `contracts/vectors/canonical.json` — `{ "positive": [{ "name", "json" | "value", "canonical_hex" }], "rejection": [{ "name", "json" | "value" }] }`, where `json` is JSON text (for duplicate-key and float rejections), `value` an in-memory value, and `canonical_hex` lowercase hex of the canonical bytes.
- `contracts/vectors/merkle.json` — `{ "roots": [{ "name", "leaves_hex": ["hex"…], "root_hex" }], "rejections": [{ "name", "leaves_hex": ["hex"…] }] }`, covering n = 1…8 and n = 0 as a rejection (§6).

If Sibusiso's files use different keys, change `test/vectors.test.js` in the same PR that reconciles the two sides — the harness fails loudly with that instruction instead of guessing.

## Byte-for-byte rule (§5)

The canonical bytes are the UTF-8 of Python `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)`: ASCII-only keys sorted by code point, non-ASCII content escaped as lowercase `\uXXXX` (outside-BMP characters as UTF-16 surrogate pairs), no floats, integers within ±(2^53 − 1). `test/canonical.test.js` pins this against Python-derived expectations; `anchor/` is the Python half.
