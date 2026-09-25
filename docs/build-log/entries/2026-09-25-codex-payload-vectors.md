## 2026-09-25 | Codex at Sibusiso's request | GPT-6 | P3.A3 / §4b payload-schema vectors | implemented; review pending

**Research** — Read `sibusiso-workflow/tasks/payload-schemas-tests/01-task.md`, `docs/VUKA-2-SPEC.md` §4b, the three proposed `contracts/payloads/*.json` schemas, `anchor/canonical.py`, `shared/canonical.js`, the repo test/build-log rules, and PR #82's branch state. Created a separate worktree from PR #51 head `af8629d6fa8d9b6b27754a5a214b79c6e72c4bc5` and merged PR #82 head `d69cb1948e298d4c51583515228ea3a65246597a` in merge commit `9e6819f77df3d5fafa922af81bd2aa04e09cac06`. Before publication, PR #51 advanced to `bb6a44694385b3aa2028a1a1e7ef2e1584353980`; merged it into this worktree in merge commit `8a070420609f9c1de00a3b1b9085e56ca610c7ec`. PR #51's worktree and branch were not modified.

**Real data / references** — The §4b schemas and ADR-0044 remain **PROPOSED** pending required reviews. The generator produced 9 golden vectors and 17 raw-JSON rejections. The 128-emoji journey ID is 128 Unicode code points (256 JavaScript UTF-16 code units); the 129-emoji rejection is 129 code points. The vectors use the fixed synthetic salt `bytes(range(16))` and SHA-256 commitments over `salt || canonical(payload)`.

**Business reasoning** — Shared Python and JavaScript vectors expose serialization or validation drift before it reaches the server or a device, reducing integration risk without prematurely enforcing an unaccepted schema.

**Competitor reference** — Not applicable; this is internal contract conformance tooling, not a user-facing capability comparison.

Changed: added deterministic `scripts/gen-payload-vectors.py`, `contracts/vectors/payloads.json`, dependency-free validators `anchor/payloads.py` and `shared/payloads.js`, pytest/Vitest/root Node contract tests, and the task claim in `team/sibusiso.md`. Both validators implement the schema-keyword subset and reject every unknown keyword. Raw JSON entry points reject duplicate keys and floats before schema validation. This task did not edit the schemas or server; the proposed schemas are included from PR #82.

Evidence:

- `python scripts/gen-payload-vectors.py` twice — each run printed `golden=9 rejections=17`; SHA-256 both times was `388844241B2702C70CB82699D3C933536E6AD9B9A8F35915DBE24EB5587AB2D9`; output: `deterministic=true`.
- Clean JavaScript install: `npm ci --cache "$env:TEMP\vuka-payload-npm-cache" --prefer-online` — `added 37 packages, and audited 38 packages`; `found 0 vulnerabilities`. The default machine npm cache first returned `EPERM`; the isolated temporary cache succeeded.
- Clean Python environment: created a fresh venv, installed `server/requirements.txt` with `pip install --no-cache-dir`, then installed pytest as the test runner. `python -m pytest anchor/tests server/tests -q -rs` — `161 passed, 2 skipped`; skips are `server/tests/test_outbox_postgres.py` and `server/tests/test_server_postgres.py`, both because the test PostgreSQL URL is not set.
- In the clean `shared/` install, `npm test` — `Test Files 8 passed (8); Tests 128 passed (128)`.
- `node --test "test/**/*.test.mjs"` — after merging the latest PR #51 head, `tests 50; pass 50; fail 0`.
- `node scripts/check-docs.mjs` — `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.`
- `node scripts/check-intake.mjs` — `Intake gate has evidence references and approval records; reviewers must verify their authenticity.`
- `pip-audit -r server/requirements.txt --cache-dir "$env:TEMP\vuka-payload-pip-audit-cache" --progress-spinner off` — `No known vulnerabilities found`.
- `node scripts/test-security.mjs` — `Security integration checks passed; no fixture was added to the real repository.` Gitleaks initially matched the vendor README in its own temporary extracted release under `.tools`; the ignored archive/extraction were deleted. Re-running `gitleaks dir --redact --config .gitleaks.toml .` printed `no leaks found`.
- Mutation check 1: changed the first golden `canonical_hex` byte. Python: `1 failed, 28 passed`; Vitest: `1 failed, 127 passed`. Both failed the named `sim_checkin_opened_window_20` canonical-byte assertion. Original vector bytes restored.
- Mutation check 2: changed `checkin_opened.additionalProperties` from `false` to `true`. `node --test test/payloads-contract.test.mjs` — `2 pass; 1 fail`; `checkin_opened schema matches the proposed §4b field table` failed on `true !== false`. Original schema bytes restored.
- `git diff --check` and `git diff --cached --check` — exit 0, no output. Gitleaks 8.24.3 was downloaded via authenticated GitHub CLI after direct PowerShell download returned an authentication error; archive SHA-256 matched the pinned `SECURITY.md` value `3f1a35578631dbfe633cc5b49e6c906e55ff14a4bfd7336a10fb27fe33b6dcd2`; `gitleaks.exe version` printed `8.24.3`; local `.githooks` is enabled.
- Python and JavaScript agreed on every golden vector's canonical bytes, SHA-256 and salted commitment; all 17 rejection vectors were refused by both. No disagreements observed.

Decision: none. No schema, ADR or server behavior was changed. ADR-0044 remains **PROPOSED**; this work is test evidence, not acceptance or freeze.

Needs/blockers: Lethabo, Ipeleng and Khutso still own their pending §4b/ADR-0044 reviews. Any ASCII-only `journey_id` rule requires a decision from the contract owners and, if adopted, a schema/ADR change outside this task.

Business handoff: not applicable; this tooling does not add a user-facing capability. The shared vectors are ready for future client/server consumers after contract acceptance.

Next: Sibusiso/Claude — review this branch and open its PR. Keep server enforcement for slice 3 and preserve the proposed status until required reviewers decide. Push/commit identifiers are recorded in the follow-up entry after publication.
