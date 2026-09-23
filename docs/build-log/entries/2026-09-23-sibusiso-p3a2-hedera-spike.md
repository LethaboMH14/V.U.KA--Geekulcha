## 2026-09-23 | Sibusiso Khumalo (co-lead), via Claude Code assistant | P3.A2 Hedera spike | COMPLETE

**Research** — Read `docs/VUKA-2-SPEC.md` §10 (Anchoring) for the required shape: a Hedera Consensus Service topic created with a `submitKey` held server-side, and the public mirror node as the independent read-back path. Read `docs/CHECKLIST.md` P3.A2 ("Hedera spike: testnet topic with `submitKey`, mirror-node read-back, runtime decision", owner Sibusiso, due Thu 24 14:00–16:00) for scope. This is tooling/research, not a contract or product change — no ADR dependency, no `contracts/openapi.yaml` touched.

**Real data / references** — Created a real Hedera testnet account via `portal.hedera.com` (account `0.0.10686482`, ECDSA key, 1000 ℏ testnet balance — funded by the portal's own faucet, not a real-value transaction). Installed `hiero-sdk-python` 0.2.10 (`pip install hiero-sdk-python`). Hit a real, reproducible failure on first import: `google.protobuf.runtime_version.VersionError: Detected incompatible Protobuf Gencode/Runtime versions ... gencode 6.31.1 runtime 5.29.6`, caused by an older `protobuf` pulled in transitively. Fixed with `pip install --upgrade "protobuf>=6.31.1"` (installed 7.36.2) — no Node sidecar was needed.

**Business reasoning** — Confirms the ANCHOR server's anchoring dependency (§10) is buildable with the SDK named first in the team's own priority order (`hiero-sdk-python`, falling back to a Node sidecar only if it fails), which keeps `anchor/publish.py`'s stack a single language rather than adding a second runtime. Not applicable beyond that — this is infrastructure validation, not a product or pricing decision.

**Competitor reference** — Not applicable.

Changed: no repository files. Spike code and testnet credentials lived only in a local, untracked scratchpad directory outside the repository; the credential file was deleted immediately after the spike completed. Nothing was installed into or referenced from the VUKA repo's own dependency files.

Evidence — commands and actual output:
```
$ pip install hiero-sdk-python
Successfully installed ... hiero-sdk-python-0.2.10

$ python hedera_spike.py   (first run, before the protobuf fix)
AttributeError / then:
google.protobuf.runtime_version.VersionError: Detected incompatible Protobuf
Gencode/Runtime versions when loading services/basic_types.proto:
gencode 6.31.1 runtime 5.29.6.

$ pip install --upgrade "protobuf>=6.31.1"
Successfully installed protobuf-7.36.2
(note: conflicts with an unrelated locally installed `ortools` package,
which requires protobuf<5.30 — not a VUKA dependency, no action needed
here, but worth a pinned requirements file when this lands in `anchor/`)

$ python hedera_spike.py   (after the fix)
Using account 0.0.10686482 on testnet

=== Creating topic with submitKey ===
Topic created: 0.0.10687280

=== Submitting a test message ===
Message submitted. Sequence number: 1

=== Reading back from the public mirror node ===
GET https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.10687280/messages/1
{
  "consensus_timestamp": "1790197443.416460104",
  "message": "VlVLQSBzcGlrZSB0ZXN0IG1lc3NhZ2UgMTc5MDE5NzQ0Mw==",
  "payer_account_id": "0.0.10686482",
  "running_hash": "PCcYFPSJdCf/W+ZjTPkQwbjDeLCtKLWW04k096lR3AgPEZAgUu1eti7RXnyx35wo",
  "running_hash_version": 3,
  "sequence_number": 1,
  "topic_id": "0.0.10687280"
}

Decoded message bytes match what was sent: True
```

**Runtime decision (P3.A2's required output): use `hiero-sdk-python`.** No Node/`@hashgraph/sdk` sidecar is needed — the one blocker was a version pin, not a library gap. Its transaction-builder API differs from what the spec's prose implies: `TopicCreateTransaction` uses `.set_memo()` / `.set_submit_key()`, `TopicMessageSubmitTransaction` uses `.set_topic_id()` / `.set_message()`, and `.execute(client)` returns the `TransactionReceipt` directly — there is no separate `.get_receipt(client)` call in this SDK version. Whoever writes `anchor/publish.py` against this SDK should use these exact method names rather than the ones implied by the general Hedera SDK documentation pattern.

Decision: none — this is a runtime/tooling decision (Python via `hiero-sdk-python`, not a Node sidecar), not an ADR or contract change. No ADR touched.

Needs/blockers: none for the spike itself. The real `anchor/publish.py` implementation still needs (a) a pinned `protobuf` version in whatever requirements file backs the ANCHOR server, given the version conflict found here, and (b) the key-manifest fingerprint message (`0x02 ‖ SHA-256(key manifest)`) and the 33-byte typed-message format from §10, neither of which this spike exercised — it used a plain UTF-8 test message, not the typed root/manifest format.

Business handoff: not applicable.

Next: Sibusiso (or whoever implements `P3.A3`, the ANCHOR server) uses `hiero-sdk-python` with a pinned `protobuf>=6.31.1` and the method names confirmed above; publish the key-manifest message format spike separately before the first real root is submitted.
