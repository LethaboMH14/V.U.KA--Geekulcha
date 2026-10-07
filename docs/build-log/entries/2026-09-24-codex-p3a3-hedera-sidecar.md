## 2026-09-24 | Codex assistant for Sibusiso | P3.A3 isolated Hedera transport | PARTIAL

**Research** — Read `docs/VUKA-2-SPEC.md` §§8, 10 and the slice-3 task packet. The earlier P3.A2 spike proved a topic with `submitKey` and a plain-text mirror read-back; it did not publish the typed manifest message. The merged `contracts/keys/` files pin topic `0.0.10687280`, epoch 1 and fingerprint `c1d90404edd180765e15321d690881933c5a4ffcdecc18f064131b6c5c70a0a2`. The Python Hedera SDK used for the spike requires `cryptography<50`, while the server's audited pin is `cryptography==50.0.0`. Sibusiso selected an isolated Node sidecar for this conflict. The first `@hashgraph/sdk@2.81.0` install failed the high-severity audit (3 high, 1 critical); the maintained `@hiero-ledger/sdk@2.88.0` with pinned transitive `protobufjs`/`ws` replacements passed a clean install and audit. This is a tooling choice, not ADR acceptance.

**Real data / references** — Public testnet mirror queries returned HTTP 200 for the pinned topic; it exists, has a submit key and is not deleted. Its only message is sequence 1, plain UTF-8 spike text (`56554b41207370696b652074657374206d6573736167652031373930313937343433`), not the 33-byte `0x02` manifest message. All four required Hedera environment variables were absent locally. The prior spike entry says the original credential file was deleted after use. No testnet transaction was sent in this change.

**Business reasoning** — Keeping the SDK in a separate Node package avoids downgrading the server's cryptography dependency. Fail-closed mirror verification prevents an unconfirmed ledger submission from being represented as an anchor receipt. The sidecar publishes only a 33-byte digest/root; no personal data or key material is put on the topic.

**Competitor reference** — Not applicable to this infrastructure slice.

**Changed** — `anchor/hedera-sidecar/` with exact pinned messages, testnet topic validation, SDK submission and public mirror read-back; `anchor/publish.py` as a narrow Python process adapter; tests; this log and the current-task status. The sidecar requires a confirmed `0x02` sequence before it submits any `0x01` root. It does not schedule batches, maintain a durable outbox, sign roots off-chain or expose a server route. No Python Hedera SDK was added to server requirements.

**Evidence — commands and actual output** (from `feat/sibusiso-contract-v2` after merging `origin/main` at `e90c655`):
```
node --input-type=module -e "...pinnedAnchorMessage('manifest')..."
0.0.10687280 33 02c1d90404edd180765e15321d690881933c5a4ffcdecc18f064131b6c5c70a0a2

node --input-type=module -e "...readMirror({topicId,sequenceNumber:1,message:manifest,attempts:1})..."
expected_rejection: mirror message bytes differ from the submitted message

node --input-type=module -e "...fetch('https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.10687280/messages?limit=10')..."
status 200
[{ sequence: 1, hex: '56554b41207370696b652074657374206d6573736167652031373930313937343433' }]

npm ci --ignore-scripts --no-fund
added 102 packages, and audited 103 packages in 4m
found 0 vulnerabilities
npm audit --omit=dev --audit-level=high
found 0 vulnerabilities
npm test (anchor/hedera-sidecar)
tests 6; pass 6; fail 0

$env:VUKA_TEST_DATABASE_URL = 'postgresql://vuka_test@127.0.0.1:55433/postgres'
python -m pytest anchor/tests server/tests -q -rs
126 passed in 7.64s
npm test
tests 34; pass 34; fail 0
npm --prefix shared test
Test Files 7 passed (7); Tests 99 passed (99)
node scripts/check-docs.mjs
Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.
node scripts/check-intake.mjs
Intake gate has evidence references and approval records; reviewers must verify their authenticity.
```

**Decision** — Sibusiso selected the isolated Node sidecar. The maintained package and audit overrides are an implementation response to the initial package's reported vulnerabilities; security reviewers still need to inspect them. No contract or ADR was accepted by this assistant.

**Needs / blockers** — The existing topic's original operator and submit keys must be supplied through the deployment secret store; do not create a new topic silently or commit credentials. A live `0x02` publication and mirror read-back are still required for P3.A2/P3.A3 completion. The per-kind payload schemas and human review remain required before event-to-escalation wiring. The batching/outbox coordinator, PIN-gated export/proof, deployment and joint end-to-end test are not built by this slice.

**Business handoff** — Sibusiso and Lethabo should review the SDK/runtime choice and the exact confirmed receipt before treating a testnet anchor as demonstrated. The public verify page must continue to trust only the committed pins.

**Next** — With the original credentials, publish and mirror-confirm the `0x02` message, configure its sequence, then test one `0x01` root. After the payload contract decision, wire durable escalation and anchor batches to the outbox, followed by P3.A5 and the security-reviewed deployment.
