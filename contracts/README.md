# Contracts

- `openapi.yaml` — the frozen v2 API surface (§12). Changing it needs both leads and an ADR.
- `events.schema.json` — the `EvidenceEntryV2` shape.
- `vectors/` — canonical/Merkle golden vectors for T01/T02 (`canonical.json`, `merkle.json`).
- `keys/` — key-manifest format, no key material.

## Mock server (P3.A1)

`npm run mock` (or `scripts/mock-server.sh`) starts a pinned Prism mock
(`@stoplight/prism-cli@5.16.0`) against `openapi.yaml` on port 4020 (override
with `PORT=`). Client work (Vukosi, Mutarisi, Ipeleng) can build against this
instead of the real ANCHOR server. It mocks every path in the contract,
including v1 UMOJA paths kept for reference.
