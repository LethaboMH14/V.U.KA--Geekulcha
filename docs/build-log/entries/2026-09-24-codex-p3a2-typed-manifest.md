## 2026-09-24 | Codex assistant for Sibusiso | P3.A2 typed key-manifest publication | VERIFIED ON TESTNET

**Research** — The existing pinned topic `0.0.10687280` had only the earlier plain-text spike message at sequence 1. Sibusiso supplied the original operator and submit credentials in this worktree's gitignored `.env`; no account or topic was created. The sidecar's initial generic SDK private-key parser inferred the wrong key family for the supplied `0x`-prefixed ECDSA keys. Before any transaction, the explicit `fromStringECDSA()` parser produced a public key matching the mirror-listed topic `submitKey`; the operator key similarly matched the mirror-listed account key. The sidecar now enforces both matches before submission.

**Real data / references** — Testnet topic `0.0.10687280`, epoch 1, manifest fingerprint `c1d90404edd180765e15321d690881933c5a4ffcdecc18f064131b6c5c70a0a2`. The new manifest publication is sequence 2, consensus timestamp `1790283223.545362104`, running hash `53KSOeGpfzBK55kJ8Urhf3adUB++VtofdkVcrb/H3b6yPxQa2aZuQNlSkXdi+ZtF`. Its message bytes are exactly `02c1d90404edd180765e15321d690881933c5a4ffcdecc18f064131b6c5c70a0a2`. No private key was printed or committed.

**Business reasoning** — The public mirror now independently confirms the same manifest fingerprint the verify page pins, closing the typed-message gap left by the initial Hedera spike. Root anchoring remains a separate server outcome; a fabricated `sim_` root was deliberately not submitted to the pinned production-demo topic.

**Competitor reference** — Not applicable.

**Changed** — `anchor/hedera-sidecar/publish.mjs` now requires explicit secp256k1 key parsing and validates the operator and topic public keys against the public mirror. Tests and README updated. `HEDERA_MANIFEST_SEQUENCE=2` was written only to the gitignored local `.env`. No key value entered the repository. This entry records the real testnet action.

**Evidence — commands and actual output** (private values never echoed):
```
node --env-file=../../.env --input-type=module -e "...verifyPinnedCredentials(...)..."
pinned_topic_and_operator_keys_match

'{"kind":"manifest"}' | node --env-file=../../.env cli.mjs
{"kind":"manifest","topic_epoch":1,"topic_id":"0.0.10687280","sequence_number":2,"consensus_timestamp":"1790283223.545362104","running_hash":"53KSOeGpfzBK55kJ8Urhf3adUB++VtofdkVcrb/H3b6yPxQa2aZuQNlSkXdi+ZtF","message_hex":"02c1d90404edd180765e15321d690881933c5a4ffcdecc18f064131b6c5c70a0a2","confirmed_by":"public_mirror"}

node --input-type=module -e "...fetch('https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.10687280/messages/2')..."
{"http":200,"topic_id":"0.0.10687280","sequence_number":2,"exact_bytes":true,"consensus_timestamp":"1790283223.545362104","running_hash_present":true}

node --env-file=../../.env --input-type=module -e "...readMirror({sequenceNumber:2,...})..."
{"topic_id":"0.0.10687280","sequence_number":2,"manifest_bytes_match":true}

npm test (anchor/hedera-sidecar)
tests 6; pass 6; fail 0
```

**Decision** — Reuse the pinned topic and existing keys; the typed manifest is now live at sequence 2. This is a testnet infrastructure result, not an ADR approval or a production anchor receipt.

**Needs / blockers** — The outbox/batch coordinator must persist and submit a real Merkle root (`0x01`) after accepted event wiring. Testnet reset/epoch handling and off-chain root signatures still require implementation and review. P3.A3, P3.A5, deployment and the joint end-to-end test are not complete.

**Business handoff** — Lethabo and Ipeleng can verify the receipt directly at the public testnet mirror; the committed pins remain unchanged. Khutso should reconcile the P3.A2 checklist status after review.

**Next** — Implement and test durable batch scheduling, then publish a root derived from actual chain heads and verify its receipt against the pinned topic. Do not repeat the manifest submission as a root or present the initial plain-text message as the manifest.
