## 2026-09-25 | Codex assistant for Sibusiso | P3.A1 / PR #51 sim_bank contract fixes | REVIEW REQUIRED

**Research** — Read `sibusiso-workflow/tasks/contract-sim-bank-fixes/01-task.md`, ADR-0041, `docs/VUKA-2-SPEC.md` §3/§7/§9, `docs/OVERLAPS.md`, `contracts/openapi.yaml`, the contract tests, and the current ANCHOR/server source. The task packet is READY and records Sibusiso's acceptance in PR #51 comment 5821108768. Searched `anchor/`, `server/`, `test/` and `contracts/`: the old value occurred in the BankSignal contract and its contract assertion; there were no `triggering_outcome` consumers in `anchor/` or `server/` to rename.

**Real data / references** — Repository facts only. A fresh sidecar install and unrestricted `npm audit` found 0 vulnerabilities. No real bank integration or bank runtime authentication was exercised or claimed.

**Business reasoning** — Requiring the subject and a pinned ANCHOR signature makes the simulated bank exchange attributable and clearly simulated, which makes the showcase safer to assess and reduces integration ambiguity for future consumers.

**Criterion and trust gate** — T and S: a clearly identified, simulated bank signal with a pinned server-authentication contract helps a real integrator assess the request. A user could trust the simulation label and subject association as specified; runtime enforcement is not built, so this work makes no claim that a real endpoint rejects an unsigned request. Fraud review: the signature scheme names the pinned verifier key and request context; red-team acceptance remains with Lethabo/Ipeleng. Build-for-use: no phone flow changed. Economics: not applicable, no price or cost claim changed. Privacy: the added identifier is described as `sim_`; no real subject data is sent to a ledger.

**Competitor reference** — Not applicable; this changes VUKA's own simulated contract, not a market or competitor claim.

**Changed** — `BankSignal` requires `subject_id` and the `duress_signal`/`no_answer`/`contact_lost` trigger enum. Both `/sim_bank` operations require timestamp, nonce and `X-Vuka-Server-Signature`; the Ed25519 verifier key is the pinned server key in `contracts/keys/manifest.json`. Their accepted response uses `SimBankReceipt`, which requires `sim: true`; generic receipts do not require the marker. `/v1/journeys/{id}/end` and `/v1/subjects/{id}/export` explicitly say `INCOMPLETE` per ADR-0041 G35/T30. The CI sidecar audit now runs plain `npm audit`, matching the root and shared audit gates; no waiver was added. No server route or runtime authentication was implemented. `duress_pin` remains a valid check-in result value where §3 defines it; only the bank-signal trigger value was renamed.

**Evidence — clean dependency install** — Validation ran in a fresh detached worktree at base `cc9c40c` with the task diff applied, using a new npm cache. The first concurrent install attempt against the existing Windows npm cache failed with `EPERM`/`EACCES`; the sequential isolated installs below succeeded.

```text
npm ci --cache C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-npm-cache-clean
up to date, audited 1 package in 4s
found 0 vulnerabilities

npm ci --prefix shared --cache C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-npm-cache-clean
added 37 packages, and audited 38 packages in 19s
12 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities

npm ci --ignore-scripts --prefix anchor/hedera-sidecar --cache C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-npm-cache-clean
npm warn deprecated crypto-js@4.2.0: Active development of CryptoJS has been discontinued.
added 102 packages, and audited 103 packages in 2m
18 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities
```

**Evidence — checks and actual results**

```text
node --test "test/**/*.test.mjs"
tests 35; pass 35; fail 0; skipped 0

npm --prefix shared test
Test Files 7 passed (7); Tests 99 passed (99)

npm test --prefix anchor/hedera-sidecar
tests 6; pass 6; fail 0; skipped 0

npm audit --prefix anchor/hedera-sidecar
found 0 vulnerabilities

python -m pytest anchor/tests/ server/tests/
collected 131 items
129 passed, 2 skipped in 2.05s
The skipped cases require a PostgreSQL test URL; CI supplies its ephemeral PostgreSQL service.

node scripts/check-docs.mjs
Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.

git diff --check
exit 0

PyYAML parse of contracts/openapi.yaml
OpenAPI 3.1.0; 33 paths; BankSignal required fields: subject_id, triggering_outcome; SimBankReceipt allOf branches: 2

Draft 2020-12 validation of BankSignal and receipt examples
BankSignal accepts required sim subject and duress_signal: PASS
BankSignal rejects missing subject_id: PASS
BankSignal rejects legacy duress_pin trigger: PASS
generic Receipt remains valid without sim marker: PASS
SimBankReceipt accepts sim true: PASS
SimBankReceipt rejects missing sim: PASS
SimBankReceipt rejects sim false: PASS
```

**Decision** — No new ADR or human sign-off was created. The task packet's accepted contract decision is implemented on PR #51. The OpenAPI scheme describes the server-authenticated interface; it is not evidence that a runtime sim_bank endpoint enforces the signature.

**Needs / blockers** — Fresh PR #51 checks and Lethabo/Ipeleng contract/security review. The server-side sim_bank verifier remains unbuilt. The ADR-0041 endJourney/export implementation remains unbuilt and is labelled incomplete. Two PostgreSQL tests were skipped locally and must be observed in CI.

**Business handoff** — Future sim_bank consumer must include the simulated subject id, server signature context and `sim: true` receipt. Do not describe the contract declaration as a deployed bank connection.

**Next** — Sibusiso: wait for PR #51 checks and required review; keep deployment blocked until security review and required server slices are complete.
