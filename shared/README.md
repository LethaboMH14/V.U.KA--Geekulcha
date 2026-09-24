# shared/ — code both the app and the verify page use

- `canonical.js` — the canonical JSON form (`docs/VUKA-2-SPEC.md` §5), identical byte for byte to the Python reference. Exports `canonicalJson`, `canonicalize` (bytes), `canonicalizeJson` (strict text parse: duplicate keys, floats and unsafe integers refused) and `CanonicalisationError`.
- `der.js` — converts Android Keystore DER signatures to raw r‖s for WebCrypto. Exports `derToRaw`, `rawToDer` (test/vector helper) and `DerError`.
- `merkle.js` — RFC 6962 trees and audit paths (§6). Exports `merkleRoot`, `auditPath`, `recomputeRoot`, `leafHash`, `nodeHash`, `splitPoint`, `bytesToHex`, `hexToBytes` and `MerkleError`. Leaves are raw 32-byte chain heads in ascending byte order; an empty tree is refused (§6).
- `keys.js` — key-manifest bootstrap (§10). Exports `canonicalManifestBytes` (the hashed representation: canonical JSON bytes per §5 — the serialization pin that closes the open note in `contracts/keys/README.md`), `manifestMessage` (`0x02 ‖ SHA-256(manifest bytes)`, 33 bytes, published before the first `0x01` root), `decodeAnchorMessage`, `sha256`, `importSpkiVerifyKey` (Ed25519 for the server key, `{name: "ECDSA", namedCurve: "P-256"}` for device/guardian keys) and `validateManifest` (mirrors the contract-v2 `KeyManifest` schema). Re-exports `bytesToHex`/`hexToBytes
- `verify.js` — verify-min (P3.S7): v2 subject-export hash, link, commitment, signature and counter checks. Device/guardian keys are rebuilt from the chain (registration `signer_pubkey`); a re-registration with a different key or actor is `key_conflict` and every entry must claim its key's registered actor (`actor_mismatch`). With `pins` (verify-pins.json + manifest.json) server signatures verify against the PINNED Ed25519 key only (T05) and receipts must name the pinned topic. Exports `verifyExport`, `normaliseExport`, `chainHeadHex` and `ExportError`. **`ok: true` means internal consistency only** (`assurance: "internal_consistency_only"`); it does not prove the record came from VUKA until the anchor and mirror checks run.

## Cross-language checks (before Thursday's vectors)

`scripts/xcheck-canonical.py` (and `.mjs`) and `scripts/xcheck-merkle.py` (and `.mjs`) run the same fixed inputs through Python (`json.dumps` / `hashlib`) and the JS modules and diff the output. Both were byte-identical when this module landed (10/10 canonical cases; 8/8 merkle roots for n = 1…8). Re-run them whenever either side changes: `python shared/scripts/xcheck-canonical.py` from the repo root.

**Owner:** Ipeleng; tested with vitest against `contracts/vectors/`. The API contract itself lives in `contracts/`, and changing it needs both leads and an ADR.

## Running the tests

```
cd shared && npm install && npm test
```

`npm test` runs `vitest run` (Node 22+; spec §15 T01/T02 and `team/START-HERE.md`). No dependencies beyond vitest ship in the modules themselves.

## Verify an export

Run `node shared/scripts/verify-export.mjs <export.json>` to print the first-failure verification result for a v2 subject export. Mirror receipts, Merkle proofs, key revocation and server signatures are reported as not checked.

## Vector files (T01/T02)

`test/vectors.test.js` consumes Sibusiso's drop in `contracts/vectors/` (P3.S1, due Thu 24 Sep 09:00). Until the files land, those two suites **skip with the blocker named** — a green run before they land is not a checked T01/T02. Agreed shapes:

- `contracts/vectors/canonical.json` — `{ "positive": [{ "name", "json" | "value", "canonical_hex" }], "rejection": [{ "name", "json" | "value" }] }`, where `json` is JSON text (for duplicate-key and float rejections), `value` an in-memory value, and `canonical_hex` lowercase hex of the canonical bytes.
- `contracts/vectors/merkle.json` — `{ "roots": [{ "name", "leaves_hex": ["hex"…], "root_hex" }], "rejections": [{ "name", "leaves_hex": ["hex"…] }] }`, covering n = 1…8 and n = 0 as a rejection (§6).

If Sibusiso's files use different keys, change `test/vectors.test.js` in the same PR that reconciles the two sides — the harness fails loudly with that instruction instead of guessing.

## Byte-for-byte rule (§5)

The canonical bytes are the UTF-8 of Python `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)`: ASCII-only keys sorted by code point, non-ASCII content escaped as lowercase `\uXXXX` (outside-BMP characters as UTF-16 surrogate pairs), no floats, integers within ±(2^53 − 1). `test/canonical.test.js` pins this against Python-derived expectations; `anchor/` is the Python half.
