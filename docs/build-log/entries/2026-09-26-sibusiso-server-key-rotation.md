## 2026-09-26 | Sibusiso, with Claude Code assistant | Key rotation | New ANCHOR server Ed25519 signing key; manifest re-pinned | PROPOSED

**Research** — Azure never had the server's signing key: `VUKA_SERVER_ED25519_KEY_B64` was missing, which caused the 15:23 UTC worker outage (`2026-09-26-sibusiso-worker-outage-unsigned-deadline.md`). The private half of the original key (Ipeleng, 25 Sep, `2026-09-25-ipeleng-key-manifest-bootstrap.md`) was never deployed. Sibusiso chose to rotate rather than wait. Rotation is safe now for a specific reason: every server signature ever attempted on Azure failed, so **no server-signed entry exists in Azure's data** and no existing record breaks.

**Real data / references** — Where the key is pinned:
- `contracts/keys/manifest.json` and `verify-pins.json`, on `main` and the server branch;
- the server (`server/server_signing.py`, `server/anchoring.py`);
- the Hedera sidecar;
- `shared/verify.js` and `shared/keys.js`;
- the ledger and `verify-min` dashboards, which load `contracts/keys/` at runtime.

The VIGIL app does not pin it (nothing in `app/src` reads it), so no APK rebuild is needed.

**Business reasoning** — Without the key, no escalation outcome (`no_answer`), incident closure or bank signal can be written on the live server.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Key generation.** Sibusiso generated the key on his own machine with the new `scripts/new-server-signing-key.py`. It writes the private key to a file outside the repository (it refuses in-repo paths and overwrites) and prints only the public key. He backed the key up, set it in Azure himself with a command that never prints it, and deleted the file. The private key never passed through the assistant or the repository.
- **New public key** (SPKI): `MCowBQYDK2VwAyEASagu9YLvQfa30jTOAEUPeOAuiuJUpiWvYyet5IH+yJM=`.
- **New manifest fingerprint:** `f20cf84a7fd4a795c9ce0a351a8a16a8213e2513037cc78cb44f6d5b9c334830`. It is computed identically by Python (`anchor.canonical`) and JavaScript (`shared/keys.js canonicalManifestBytes`); the same code reproduces the old pin `c1d90404…` for the old key.
- **Unchanged:** `topic_id` and `topic_epoch`. The old `0x02` messages (sequences 2 and 3) stay on the topic as history. A new `0x02` message carrying the new fingerprint must be published, and `HEDERA_MANIFEST_SEQUENCE` set to its sequence.

Evidence (FACT): `shared` vitest 94 passed and 5 skipped (the same pending vectors as on 25 Sep), including the check that the committed manifest's fingerprint equals the pin. Ledger tests 42/42 on `main` with the new pins. The server branch's full suite, root node tests and sidecar tests are recorded in the commit. The pin files are byte-identical on `main` and the server branch.

Decision: None accepted. **Ipeleng owns the key manifest; this rotation needs her review.**

Needs/blockers: publish the new `0x02` manifest message (Sibusiso, locally, with the Hedera credentials); set `HEDERA_MANIFEST_SEQUENCE`; reset the stuck anchor batch; then confirm the first real root.

Business handoff: Not applicable.

Next: deploy; confirm server signing works on Azure (the worker no longer reports "pinned server signer is unavailable").
