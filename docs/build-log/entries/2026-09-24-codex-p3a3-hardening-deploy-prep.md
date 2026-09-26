## 2026-09-24 | Codex assistant, acting at Sibusiso's request | GPT-6 | P3.A1/P3.A3/P3.A4 preparation | LOCAL, NOT REVIEWED

**Research** — Read `docs/MASTER-CONTEXT.md` and its four review gates, `docs/VUKA-2-SPEC.md` §§4, 7–10 and 12, merged ADR-0041, the slice-2, slice-3, export and Azure task packets, `contracts/openapi.yaml`, PR #51's changes-requested review, and the existing `server/` implementation. Fraud: an event signature and actor binding must stop forged identity/context; no detection-only bank action was added. Build for use: a clean App Service dependency set and PostgreSQL transactions are required. Economics: no cost or performance claim was made. Privacy: the chain stores a commitment, while payload and salt are encrypted off-chain; export must fail closed until PIN and incident rules exist. Criteria T/S/I: these checks make an exported record more trustworthy, but no finished export is claimed.

**Real data / references** — Local real PostgreSQL 17 on `127.0.0.1:55433` exercised the SQL path with synthetic `sim_` records. `docs/build-log/entries/2026-09-23-sibusiso-p3a2-hedera-spike.md` records the earlier testnet topic and mirror read-back; no Hedera submission occurred in this change. `gh pr view 51 --json state,reviewDecision,headRefOid` returned `OPEN`, `CHANGES_REQUESTED`, `263b5879260254babd5d4f012dd53095be8c2f21`. `gh pr view 79` returned `OPEN`, `CHANGES_REQUESTED`. Local work began at `e11eb288967c88245292704c2270165e0d2464ae`; `origin/main` was fetched to `d0af8c2d812eae9dd802f9cefb6e72b6ea24b5b9` without changing the worktree.

**Business reasoning** — Rejecting forged event context and withholding a chain without PIN authority reduces the chance of a false or coercer-visible record, which matters to whether a member would trust the service.

**Competitor reference** — Not applicable; this is an internal cryptographic and persistence boundary.

Changed: `server/main.py` verifies the C5 payload commitment and §4 event-context signature in addition to HTTP authentication, binds the event actor to the registered key, adds database-backed `/healthz`, and returns 403 `pin_authorisation_required` for export until ADR-0041's fresh PIN and pre-incident hold are implemented. `server/db.py` stores the actor binding, locks a `subject_heads` row for each append, and stores encrypted payload/salt in the same transaction as the public chain entry. `server/payload_store.py` uses AES-256-GCM with fresh 12-byte nonces and subject/event associated data; startup fails closed without a 32-byte `VUKA_PAYLOAD_KEY_B64`. Root/server requirements and `startup.sh` prepare an Azure build but do not deploy it. `contracts/openapi.yaml` descriptions now state ADR-0041's journey-end and export gates; this is a proposed contract correction in PR #51, not a new approval. Tests cover actor substitution, signed-context tampering, encrypted storage, real PostgreSQL registration/append/retry/concurrent heads and PIN-less export rejection.

Evidence — commands and actual output:

The `.gitattributes` update pins `*.sh` to LF, so `startup.sh` remains runnable after a Windows checkout. The clean dependency installation exited 0 despite pip's unrelated global-environment conflict warnings; it did not install the Hedera SDK into the isolated server target.

```text
$taskDeps = Join-Path $env:TEMP ('vuka-clean-deps-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $taskDeps | Out-Null
python -m pip install --disable-pip-version-check --target $taskDeps -r requirements.txt --quiet
ERROR: pip's dependency resolver does not currently take into account all the packages that are installed.
hiero-sdk-python 0.2.10 requires cryptography<50,>=44.0.1, but you have cryptography 50.0.0 which is incompatible.

$taskDeps = (Get-ChildItem $env:TEMP -Directory -Filter 'vuka-clean-deps-*' | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
$env:PYTHONPATH = $taskDeps
$env:VUKA_TEST_DATABASE_URL = 'postgresql://vuka_test@127.0.0.1:55433/postgres'
python -m pytest server/tests/ -q
.........................                                                [100%]
25 passed in 3.97s

python -m pytest anchor/tests server/tests -q
........................................................................ [ 59%]
..................................................                       [100%]
122 passed in 3.40s

npm test
ℹ tests 34
ℹ pass 34
ℹ fail 0

npm --prefix shared test
Test Files  5 passed (5)
Tests       79 passed (79)

node scripts/check-docs.mjs
Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.

$taskAuditCache = Join-Path $env:TEMP ('vuka-audit-cache-' + [guid]::NewGuid().ToString('N'))
python -m pip_audit --requirement server/requirements.txt --cache-dir $taskAuditCache --progress-spinner off
No known vulnerabilities found

$env:VUKA_CLEAN_DEPS = $taskDeps
python -S -c "import os,sys;sys.path.insert(0,os.environ['VUKA_CLEAN_DEPS']);import fastapi,psycopg2,uvicorn,cryptography;from server.main import app;print('clean-import: ok');print('psycopg2:',psycopg2.__version__);print('uvicorn:',uvicorn.__version__);print('cryptography:',cryptography.__version__);print('routes:',','.join(sorted(r.path for r in app.routes)))"
clean-import: ok
psycopg2: 2.9.13 (dt dec pq3 ext lo64)
uvicorn: 0.53.0
cryptography: 50.0.0
routes: /healthz,/v1/events,/v1/subjects/{id}/export

git diff --check
exit 0 (working-copy LF/CRLF conversion warnings only)
```

The first sandboxed local PostgreSQL start failed with `pg_ctl: could not create restricted token: error code 87`. The same temporary test cluster started successfully under the approved escalated command: `waiting for server to start.... done; server started`. `pg_isready -h 127.0.0.1 -p 55433` returned `accepting connections`. The real integration test passed, including 4 persisted chain rows, 4 encrypted private payload rows, and head index 3 after two concurrent appends. This is local integration evidence, not Azure verification. Unscoped `node --test` found Vitest files and failed; the repository's supported root `npm test` and shared `npm --prefix shared test` both passed.

Decision: no new ADR, human sign-off, merge, deployment or typed Hedera submission. ADR-0041 is already merged and is the source of the fail-closed export behavior. The proposed OpenAPI wording still needs both leads and relevant domain review. No production key is in the repository; tests use synthetic fixed bytes only.

Needs/blockers: Lethabo and Ipeleng review the auth, encryption and incident safety boundary; both leads settle the absent per-kind payload schemas before event-to-escalation wiring; Ipeleng's key-manifest PR #79 and its verify-page consumer must merge before `0x02` publishing; Khutso and both leads settle the `sim_bank` subject/hold/signature contract. PIN verification, durable escalation/outbox, anchoring, prefix export, public proof, Azure deployment and the joint APK-to-verifier run remain unbuilt/unverified.

Business handoff: `server/` is now locally testable against PostgreSQL and packaged for an App Service build. It is not safe to expose as a completed ANCHOR service; the export route deliberately refuses until P3.A5's authority and hold rules are implemented.

Next: Sibusiso obtains the pending schema and reviewer decisions; the implementer then completes slice 3, export/proof, deployment and joint integration in that order, retaining the §8 T08 fallback if anchoring cannot be verified.
