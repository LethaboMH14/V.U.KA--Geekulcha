# Isolated Hedera submission process

The ANCHOR server retains `cryptography==50.0.0`; the Python Hedera SDK used
in the spike requires `cryptography<50`. This sidecar uses the maintained
`@hiero-ledger/sdk` Node package instead. Its dependencies are local to this
directory. Install with `npm ci --ignore-scripts` and audit with
`npm audit --omit=dev --audit-level=high` before deployment.

The only accepted stdin requests are `{"kind":"manifest"}` and
`{"kind":"root","root_hex":"<64 lowercase hex>"}`. The sidecar reads the
committed `contracts/keys/manifest.json` and `verify-pins.json`, rejects a
fingerprint mismatch, and submits exactly 33 bytes to the pinned testnet topic.
It reports success only after the public mirror returns the same topic,
sequence and message bytes with a consensus timestamp and running hash.
It never puts credentials on the command line or in its success output.

Set `HEDERA_OPERATOR_ID`, `HEDERA_OPERATOR_KEY`, and `HEDERA_SUBMIT_KEY` through
the deployment secret store. The keys are `0x`-prefixed 32-byte secp256k1
private-key hex; the sidecar uses the SDK's explicit ECDSA parser and checks
their derived public keys against the existing pinned topic and operator
account on the public mirror before submitting. Publish the `0x02` manifest message first and
record its confirmed sequence in `HEDERA_MANIFEST_SEQUENCE`; a root request
re-reads and checks that manifest message before submitting `0x01`. The
previous spike's plain-text message at sequence 1 is **not** a manifest
publication and cannot satisfy this condition.

`anchor/publish.py` is a narrow process adapter. `server/anchoring.py`'s
`BatchCoordinator`, run every second by `server/run_workers.py`, is its
durable batch worker and owns the 60-second coalescing policy; this sidecar
does not schedule anything itself. If submission succeeds but mirror
read-back fails, the state is ambiguous: inspect the topic before any retry
to avoid a duplicate ledger message. Live publication still needs real
`HEDERA_OPERATOR_ID`/`HEDERA_OPERATOR_KEY`/`HEDERA_SUBMIT_KEY` and this
directory's `npm ci` run — the coordinator itself has been live since
26 Sep. Nothing in this directory signs Merkle roots off-chain or records a
production receipt.
