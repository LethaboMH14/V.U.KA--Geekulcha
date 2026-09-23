# ANCHOR key manifest format

This directory documents the public key manifest format from `docs/VUKA-2-SPEC.md` §10. It contains no real keys.

The manifest lists the server's Ed25519 **public** key and, only if built, its ML-DSA-65 public key. Private keys and personal data are never included.

The first Hedera topic message for each key epoch is exactly 33 bytes:

```text
0x02 || SHA-256(key manifest bytes)
```

The message is published before the first Merkle-root message (`0x01 || 32-byte root`). A key change starts a new epoch and publishes a new `0x02` message. The manifest is available from `GET /v1/anchor/latest` and its shape is described by the OpenAPI `KeyManifest` schema.

**Serialization remains to be specified:** §10 identifies the manifest contents and fingerprint message but does not define the exact bytes to hash (for example, JSON serialization and line endings). Implementations must not emit a fingerprint until that byte representation is pinned consistently by the team.
