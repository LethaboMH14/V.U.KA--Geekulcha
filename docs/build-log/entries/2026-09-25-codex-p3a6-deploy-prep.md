## 2026-09-25 | Codex assistant for Sibusiso | P3.A6/P3.A4 deployment preparation, Part A | INCOMPLETE — export gate

**Research** — Read the refreshed `sibusiso-workflow/tasks/azure-deploy/01-task.md`, the implementation-status task already present on PR #51, current server routes, ADR-0041, OpenAPI and existing PostgreSQL integration tests. This entry covers Part A only. No Azure CLI, App Service or production credential operation was attempted; the worktree `.env` was not opened or changed.

**Real data / references** — At pushed commit `583a13fc5f5d2db9b7cfc073f3aec09e06fd921e`, `git archive` produced the deployment ZIP listed below. The archive builder checked banned paths and private-key-shaped content and checked the resulting ZIP. A fresh virtual environment was installed from root `requirements.txt`; its imported runtime versions were FastAPI 0.141.1, cryptography 50.0.0, psycopg2 2.9.13 and Uvicorn 0.53.0. `pip-audit` reported no known vulnerabilities. The local PostgreSQL 17 test cluster was started and stopped for the verification run.

**Criteria / limits** — The default-on SEC-6 guard permits genesis registrations only for `sim_` targets unless `VUKA_SIM_ONLY=0`; requests are still signed and verified before the refusal. Synthetic events and identities are explicitly `sim_`. Chain payload and salt remain encrypted at rest. The local smoke completed health, registration, append and non-sim refusal. Export returned `403 pin_authorisation_required` both before and after server restart, as current code and accepted ADR-0041 require. No PIN bypass was added. A direct PostgreSQL read after restart found two chain entries, two encrypted payload rows and an intact chain. This proves local persistence, but not a successful API export; Part A acceptance remains incomplete until ADR-0041 PIN-authority and prefix-export behavior exists.

**Changed** — `server/main.py` adds the default-on simulation-only guard; Python tests cover refusal, `sim_` acceptance and explicit disablement. `contracts/openapi.yaml` documents the 403 `simulation_only` example and a Node contract assertion checks it. `scripts/build-deploy-package.py` requires a full commit SHA, builds only from `git archive`, excludes server tests and unrelated directories, rejects `.env*`, `*.pem`, `*.key`, `node_modules`, `.git` and private-key-shaped content, then prints the final package members. `scripts/smoke-live.py` performs signed health/register/append/export/refusal calls, prints HTTP status and sanitized response bodies, checks the returned chain when export is available, and supports a deterministic synthetic-key export-only restart check. No private or payload key is printed or included in this log.

**Commands and actual output**

```text
python -m pip install --disable-pip-version-check --no-cache-dir -r requirements.txt
Successfully installed ... cryptography-50.0.0 ... fastapi-0.141.1 ... psycopg2-binary-2.9.13 ... uvicorn-0.53.0

pip-audit --requirement server/requirements.txt --cache-dir <temporary cache> --progress-spinner off
No known vulnerabilities found

pytest server/tests/ anchor/tests/ scripts/tests/test_build_deploy_package.py -q
138 passed in 3.39s

node --test "test/**/*.test.mjs"
ℹ tests 37
ℹ pass 37
ℹ fail 0

node scripts/check-docs.mjs
Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.

node scripts/check-intake.mjs
Intake gate has evidence references and approval records; reviewers must verify their authenticity.

git diff --check
exit 0

pg_ctl start -D <temporary PostgreSQL 17 data directory> -l <temporary log> -o "-h 127.0.0.1 -p 55433" -w
waiting for server to start.... done
server started

Start-Process "C:\Program Files\Git\bin\bash.exe" -ArgumentList '-c "exec bash startup.sh"' (clean venv first on PATH; local PostgreSQL; throwaway 32-byte VUKA_PAYLOAD_KEY_B64 set only in process environment; VUKA_SIM_ONLY=1; PORT=8017)
startup_pid=28180
smoke sim_ subject: sim_smoke_subject_edbaa8346f364ee8b58fdb21a1a98416
healthz: status=200 body={"database":"reachable","status":"ok"}
register sim_smoke_subject_edbaa8346f364ee8b58fdb21a1a98416: status=201 body={"chain_index":0,"event_hash":"4e9c570beb01f32cb155bc490c9eb9818ee56a6f6ba92d01e491824bdf305464","received_at":"2026-09-25T05:35:09.312836Z"}
append sim_ event: status=201 body={"chain_index":1,"event_hash":"1319f109a7b4a325653347a18ed6f455877262690babb410bb14e3255aaba2af","received_at":"2026-09-25T05:35:09.816640Z"}
read export: status=403 body={"code":"pin_authorisation_required","message":"fresh export PIN authorisation is required"}
register subject_c2c98b580ae647d2aea4feec55586865: status=403 body={"code":"simulation_only","message":"genesis registration target must use the sim_ prefix while simulation-only mode is enabled"}
smoke result: FAILED
  - export remains fail-closed pending ADR-0041 PIN-authority and prefix implementation
smoke_exit_code=1

Stop server PID 28180, then restart using the same `bash startup.sh` command
restart_pid=51848
smoke sim_ subject: sim_smoke_subject_edbaa8346f364ee8b58fdb21a1a98416
healthz: status=200 body={"database":"reachable","status":"ok"}
smoke mode: export-only restart check
read export: status=403 body={"code":"pin_authorisation_required","message":"fresh export PIN authorisation is required"}
smoke result: FAILED
  - export remains fail-closed pending ADR-0041 PIN-authority and prefix implementation
restart_export_exit_code=1
persisted_chain_entries=2
first_broken_index=None
persisted_encrypted_payload_rows=2
local_server_stopped=true

python scripts/build-deploy-package.py 583a13fc5f5d2db9b7cfc073f3aec09e06fd921e --output <temporary ZIP outside the repository>
commit: 583a13fc5f5d2db9b7cfc073f3aec09e06fd921e
package: <temporary ZIP outside the repository>
package_command_exit=0
files:
  anchor/canonical.py
  requirements.txt
  server/README.md
  server/db.py
  server/main.py
  server/outbox.py
  server/payload_store.py
  server/requirements.txt
  server/src/api/.gitkeep
  server/src/auth/.gitkeep
  server/src/db/.gitkeep
  server/src/middleware/.gitkeep
  server/src/notify/.gitkeep
  server/src/ws/.gitkeep
  startup.sh
```

**Decision / needs** — Keep export refused until the accepted ADR-0041 authorization and pre-incident prefix behavior are actually implemented and tested. The smoke's observed 403 is expected fail-closed behavior, not a successful export. Sibusiso owns Part B and any Azure action; no deploy is claimed. Package ZIP remains in the temporary directory only and is not committed.

**Business handoff** — The SEC-6 guard and safe package workflow are ready for review. The ZIP contains the three server endpoints and their code, but API export is not operational; do not treat P3.A6/P3.A4 as complete on this evidence alone.
