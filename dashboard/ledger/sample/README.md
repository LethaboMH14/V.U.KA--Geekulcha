# sample/ — test fixture only

**TEST-ONLY.** These files exist for `dashboard/ledger/test/` and are never loaded by the dashboard UI, which reads only live sources (the ANCHOR server, the Hedera testnet mirror, real VIGIL exports and the real `contracts/keys/` pins). Every file carries `"sample": true`; the keys that signed `export.json` lived only in memory while `make-sample.mjs` ran. Regenerate with `node dashboard/ledger/sample/make-sample.mjs`.
