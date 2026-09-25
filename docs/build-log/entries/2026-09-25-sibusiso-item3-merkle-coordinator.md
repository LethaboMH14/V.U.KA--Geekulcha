## 2026-09-25 | Codex acting for Sibusiso | P3.A3 item 3 | implementation awaiting independent review

### 1. Research and references

FACT: inspected spec §§6/10, the existing RFC 6962 Merkle implementation, pinned-topic sidecar, publish adapter and transactional outbox at PR #85 `2acefbc`. Criteria T/S: an unconfirmed ledger submission must not be presented as proof. Real data: repository golden vectors and real local PostgreSQL transactions with sim_ fixtures. Competitor reference: not applicable to this internal correctness change.

### 2. Changed and limitations

FACT: added `server/anchoring.py`, a dedicated-connection batch coordinator: persisted sorted-head snapshots, hourly selection, immediate outbox intents coalesced to at most one attempt per 60 seconds, identical-snapshot retry after a proven pre-submit failure, and mirror reconciliation after ambiguous submission. No empty root is submitted. Proof components contain only audit path and receipt. No HTTP route added; implementation flags unchanged.

FACT: sidecar exit 2 now identifies a failure before SDK execute; exit 1 is ambiguous. Its explicit `--sim-stub` validates the typed message but never submits or returns a ledger receipt. Runtime uses the existing environment variable credentials only. No credential file is loaded by this change. No testnet root is claimed anchored by this session.

FACT: ambiguous submission with no matching mirror message remains unresolved rather than blindly resubmitting. Operators must investigate a persistently unresolved intent. The CLI has no automatic health supervisor; infrastructure operations remain outside scope. Immediate-event producers are separate slice-3 work, not asserted complete by this coordinator commit.

### 3. Evidence

FACT: focused real PostgreSQL/adapter run: `.tools/venv/Scripts/python -m pytest server/tests/test_anchor_batches.py anchor/tests/test_publish.py -q` → `11 passed in 4.35s`.

FACT: mutation commands used the same Python executable with `-m pytest <test> -q`. Each mutation was restored byte-for-byte in a finally block:

```text
coalescing_60_removed exit=1
test_immediate_roots_coalesce_and_later_head_gets_next_batch
AssertionError: assert 'confirmed' == 'coalesced'
1 failed in 0.92s

root_binding_removed exit=1
test_wrong_root_receipt_never_confirms_or_serves_proof
Failed: DID NOT RAISE AnchorPublicationError
1 failed in 0.64s

durable_submission_intent_removed exit=1
test_ambiguous_submission_survives_restart_without_blind_resubmit
Failed: must reconcile before resubmission
1 failed in 0.80s
```

FACT: isolated staged-tree validation used `git write-tree`, `git archive --format=tar --output=.tools/item3-check.tar <tree>` and extraction to `.tools/item3-check`. This excludes all unstaged slice-3/PIN work and every ignored file. A separate clean venv was created with `python -m venv .tools/item3-venv`; installed only requirements plus pytest/pip-audit. From the extracted tree, actual commands/output:

```text
npm ci
up to date, audited 1 package in 671ms
found 0 vulnerabilities
npm --prefix shared ci
added 37 packages, and audited 38 packages in 13s
found 0 vulnerabilities
npm --prefix anchor/hedera-sidecar ci
added 102 packages, and audited 103 packages in 2m
found 0 vulnerabilities
../item3-venv/Scripts/python -m pytest anchor/tests server/tests scripts/tests -q
177 passed in 12.84s
node --test 'test/**/*.test.mjs'
tests 50; pass 50; fail 0; skipped 0
npm --prefix shared test -- --reporter=dot
Test Files 8 passed (8)
Tests 128 passed (128)
node --test anchor/hedera-sidecar/publish.test.mjs
tests 6; pass 6; fail 0; skipped 0
```

FACT: the PostgreSQL tests ran against a fresh loopback cluster (`sim_test`, port 55439), not skipped. Initial sandbox pg_ctl startup failed with restricted-token error 87; an authorized unsandboxed pg_ctl start succeeded. Initial npm shared-cache access failed with EPERM; a new worktree-local cache resolved it. No dependency or gate was relaxed. Bare `pytest`/`node --test` in the overall worktree also discovered retired archive tests and Vitest files under the wrong runner; the maintained CI paths above are the passing suite, not a claim that those broad discovery commands passed.

FACT: checked only environment-variable presence, not values: `All required sidecar environment variables present: False`. No .env was accessed. Explicit sidecar stub command:

```text
'{"kind":"root","root_hex":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}' | node anchor/hedera-sidecar/cli.mjs --sim-stub
{"sim":true,"submitted":false,"message_hex":"01aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}
sidecar_exit=2
```

FACT: live testnet submission/read-back was not run because the necessary process environment is absent; this stub is not an anchor or a testnet receipt.

```text
../item3-venv/Scripts/python -m pip_audit -r requirements.txt --cache-dir ../item3-audit-cache
No known vulnerabilities found
node scripts/check-docs.mjs
Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.
node scripts/check-intake.mjs
Intake gate has evidence references and approval records; reviewers must verify their authenticity.
git -c safe.directory='*' diff --check
(no whitespace errors)
```

### 4. Decisions and blockers

FACT: no ADR accepted, schema changed, deployment performed or human sign-off inferred for item 3. Items 1/1b/2 and 4 retain separate implementation and decision records. PROPOSED G34 and incident grouping choices remain subject to Lethabo's review, not made final by this batch implementation.

### 5. Business handoff and next

Business reasoning: persisted roots, conservative recovery and pinned mirror verification prevent retries from creating unsupported timestamp claims. Handoff: Lethabo/Ipeleng review the coordinator and transport failure boundary. Run `python -m server.anchoring --sim-stub --once` for explicitly simulated transport; live mode requires the existing pinned-topic environment and a verified manifest sequence, never a new account/topic. No Azure operations are part of this work.
