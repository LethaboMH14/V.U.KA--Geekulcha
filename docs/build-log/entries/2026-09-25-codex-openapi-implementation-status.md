## 2026-09-25 | Codex assistant for Sibusiso | GPT-6 | P3.A3 / PR #51 contract implementation status | REVIEW REQUIRED

**Research** — Read `sibusiso-workflow/tasks/contract-implementation-status/01-task.md`, the repository operating rules and overlap register, `docs/MASTER-CONTEXT.md`, `docs/VUKA-2-SPEC.md` §§4, 7, 10, 12 and 15, `contracts/openapi.yaml`, `server/main.py`, and the existing Node contract-test conventions. Checked the worktree before editing; preserved its unrelated untracked Hedera-spike note.

**Real data / references** — `FACT`: the task packet inventories 33 OpenAPI operations. `Select-String -Path server/main.py -Pattern '@app\.(get|post|put|delete|patch)\(' -Context 0,2` found exactly these registered route decorators:

```text
@app.get("/healthz")
@app.post("/v1/events", status_code=status.HTTP_201_CREATED)
@app.get("/v1/subjects/{id}/export")
```

No external or user data was used.

**Business reasoning** — Marking the published surface against actual route registration helps client developers avoid integrating future-only endpoints and makes the current service boundary easier to trust.

**Criterion and trust gate** — T and S: route drift is checked in both directions, and the contract distinguishes registered handlers from future endpoints. A real user can see which HTTP routes exist; the metadata does not claim that every specified behavior behind a registered handler is complete. Fraud red-team: no new decision or consequence path was introduced. Build-for-use: no phone flow changed. Economics: not applicable; no cost or price claim changed. Privacy: no data collection or retention changed.

**Competitor reference** — Not applicable; this is contract-to-server consistency work, not a market comparison.

**Changed** — `contracts/openapi.yaml` now gives each of its 33 operations exactly one `x-vuka-implemented: true|false` flag. Only `GET /healthz`, `POST /v1/events` and `GET /v1/subjects/{id}/export` are `true`, matching the three decorators above. The top-level `info.description` says all other operations are future-work contracts and clarifies that `true` means a route is registered, not that all specified behavior is complete. `POST /v1/subjects` is `false`; its description says genesis registration is currently accepted at `POST /v1/events` with `action: registration`, and the dedicated route is not implemented. No server behavior or route changed. `test/openapi-contract.test.mjs` uses only Node built-ins, parses every operation and route decorator, normalises path parameter names, and asserts exact set equality in both directions plus one valid flag per operation. `team/sibusiso.md` records the task and claimed paths.

**Evidence — clean dependency install and final checks**

```text
npm ci --cache C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-npm-cache-contract-status-20260925-final
up to date, audited 1 package in 3s
found 0 vulnerabilities

node --test "test/**/*.test.mjs"
tests 36; pass 36; fail 0; cancelled 0; skipped 0; todo 0

node scripts/check-docs.mjs
Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.

node scripts/check-intake.mjs
Intake gate has evidence references and approval records; reviewers must verify their authenticity.

git -c "safe.directory=C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-cline-contract-v2" diff --check
exit 0
```

The first clean-install test attempt exposed a test assertion that did not allow YAML folded-description whitespace. The assertion was corrected to accept the folded scalar; the clean install and complete suite above were then rerun successfully.

**Evidence — requested negative check** — Temporarily changed only `POST /v1/subjects` from `false` to `true`, ran `node --test test/openapi-contract.test.mjs`, and restored the original OpenAPI file byte-for-byte:

```text
AssertionError [ERR_ASSERTION]: x-vuka-implemented flags must match server/main.py routes in both directions
actual:   [..., 'POST /v1/subjects']
expected: [...]
tests 20; pass 19; fail 1
EXPECTED_FAIL_EXIT=1
RESTORED contracts/openapi.yaml byte-for-byte
```

**Decision** — No ADR or human approval was created. The `true` flag records route registration only; `GET /v1/subjects/{id}/export` remains behaviorally incomplete and fail-closed under ADR-0041 as documented elsewhere in the contract.

**Needs/blockers** — PR #51 still requires its normal lead and domain review. This change does not imply approval, merge or deployment.

**Business handoff** — Client implementers should filter for `x-vuka-implemented: true` to find registered routes, then heed operation-level `INCOMPLETE` notes for behavior gates.

**Next** — Lethabo and the relevant contract/security reviewer assess this change on PR #51; no merge or deployment is implied.
