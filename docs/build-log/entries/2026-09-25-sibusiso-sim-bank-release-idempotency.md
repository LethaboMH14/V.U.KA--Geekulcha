## 2026-09-25 | Sibusiso, with Claude Code assistant | Contract fix | sim_bank release target and signed idempotency key | PROPOSED

**Research** — Khutso's review of PR #51 at `af8629d` found two gaps in the simulated bank contract: `release` carries only `subject_id` and `triggering_outcome`, so it cannot name which of several holds to lift, and `X-Vuka-Server-Signature` signs `{method, path, ts, body_sha256, nonce}` but not the `Idempotency-Key` header, so a proxy can change the header without breaking the signature. Read `contracts/openapi.yaml` (`/sim_bank/v1/*`, `BankSignal`, `Receipt`, `IdempotencyConflict`) and the existing contract tests before editing.

**Real data / references** — Khutso's review comment on #51 (25 Sep 07:35Z). No server code touched; both routes stay `x-vuka-implemented: false`.

**Business reasoning** — A bank release that cannot identify its hold, or a retry key an intermediary can rewrite, means a held transfer can be released ambiguously or duplicated. Putting the key inside the signed body authenticates the retry binding; naming the hold makes release exact.

**Competitor reference** — Not applicable.

Changed:
- `contracts/openapi.yaml`: `BankSignal` now requires `idempotency_key` (1–128 chars, inside the signed body); new `BankRelease` schema (`subject_id`, `hold_ref`, `idempotency_key`); `Receipt.hold_ref` returned by risk-signal; the header must equal the body key (400 `idempotency_key_mismatch`); release adds 404 `unknown_hold` and 409 `hold_already_released`; `IdempotencyConflict` text covers same key with a different body.
- `test/sim-bank-contract.test.mjs` (new, 10 tests): 3 contract-text checks on the real document and 7 behaviour tests against a small in-test **model** of the stated rules (no bank implementation exists): wrong key, changed header, same key different body, repeated signal, release of one of two holds, unknown or cross-subject hold, retry after a simulated worker crash.
- `test/openapi-contract.test.mjs`: one assertion updated for the new required field.

Evidence: clean `npm ci`; `node --test "test/**/*.test.mjs"` 47 pass, 0 fail (37 before). Mutation checks, each restored byte-for-byte: removing `hold_ref` from `BankRelease.required` fails 1 test; removing the header/body check in the model fails 1; removing the already-released check fails 1. `check-docs`, `check-intake`, `git diff --check` pass. Server and sidecar untouched.

Decision: None. Proposes contract changes for Khutso, Ipeleng and both leads to review; nothing is accepted.

Needs/blockers: Khutso and the leads re-review #51. The behaviour tests exercise a model, not a running bank, so they pin the contract wording, not an implementation. The unrelated untracked Hedera spike note was left alone.

Business handoff: Not applicable.

Next: Reviewers re-check #51; a real sim_bank implementation must reuse these rules.
