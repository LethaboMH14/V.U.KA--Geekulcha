## 2026-09-24 | Codex assistant | model identifier not recorded | slice2-events-endpoint-fix | verified locally, ready for authorized branch push

**Research** — Read the READY task packet `sibusiso-workflow/tasks/slice2-events-endpoint-fix/01-task.md`, C5's `EventSubmission` definition in `sibusiso-workflow/tasks/contract-c5c8-sec1-sec2/01-task.md`, the `/v1/events` OpenAPI request schema, `server/main.py`, `server/db.py`, and the maintained slice-2 tests. The packet's parenthetical about `details.received_at` and `details.chain_index` conflicts with both C5 and OpenAPI; followed the explicit schema, which excludes those server-owned fields. Confirmed this server slice has no `/v1/checkins/...` routes.

**Real data / references** — The clean dependency target was `C:\Users\LOVILO~1.ADM\AppData\Local\Temp\vuka-slice2-clean-deps-7798ce2a74144210ae6b4cbf752b0d0f`, freshly populated from `server/requirements.txt`. Import probe output:

```text
cryptography 50.0.0 C:\Users\LOVILO~1.ADM\AppData\Local\Temp\vuka-slice2-clean-deps-7798ce2a74144210ae6b4cbf752b0d0f\cryptography\__init__.py
fastapi 0.141.1 C:\Users\LOVILO~1.ADM\AppData\Local\Temp\vuka-slice2-clean-deps-7798ce2a74144210ae6b4cbf752b0d0f\fastapi\__init__.py
pydantic 2.13.4 C:\Users\LOVILO~1.ADM\AppData\Local\Temp\vuka-slice2-clean-deps-7798ce2a74144210ae6b4cbf752b0d0f\pydantic\__init__.py
```

The target install succeeded. Pip warned that unrelated globally installed packages (`hiero-sdk-python`, `msal`, `pyopenssl`) require `cryptography<50`; those packages are not in `server/requirements.txt`, and test imports above resolve to the clean target. The first network attempt was blocked by the sandbox; after network permission was granted, a second new target installed successfully.

First-attempt output excerpt before network permission:

```text
WARNING: Retrying (...) after connection broken by 'NewConnectionError("HTTPSConnection(host='pypi.org', port=443): Failed to establish a new connection: [WinError 10013] ...")'
ERROR: Could not find a version that satisfies the requirement fastapi==0.141.1 (from versions: none)
```

**Business reasoning** — Separating the client body from the server-stored evidence shape prevents valid devices from being rejected for fields they cannot compute and supports a checkable event chain (technical implementation, T) without weakening server ownership of receipt/chain fields.

**Competitor reference** — Not applicable; this is a server contract and dependency correction, not a competitor feature comparison.

Changed: `server/main.py` now parses `/v1/events` as a strict `EventSubmissionV2` matching C5/OpenAPI (`payload` and 16-byte base64 `salt` included; server-computed `prev_hash`, `event_hash`, `received_at`, and `chain_index` excluded). `EvidenceEntryV2` remains the stored/export shape. Request tests now send `Content-Type: application/json`, exercise the client shape, and reject client-supplied server fields. The in-memory adapter projects the transport-only `payload`/`salt` out of the chain record to match the Postgres row shape; encrypted payload storage and commitment recomputation remain unimplemented and are not claimed by this fix. `server/requirements.txt` pins `cryptography==50.0.0`.

Evidence (commands and actual outputs):

```text
PS C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-cline-contract-v2> python -m pip install --target C:\Users\LOVILO~1.ADM\AppData\Local\Temp\vuka-slice2-clean-deps-7798ce2a74144210ae6b4cbf752b0d0f -r server/requirements.txt
Successfully installed annotated-doc-0.0.5 annotated-types-0.8.0 anyio-4.14.2 cffi-2.1.1 cryptography-50.0.0 fastapi-0.141.1 h11-0.16.0 httpcore2-2.13.1 httpx2-2.13.1 idna-3.20 pydantic-2.13.4 pydantic-core-2.46.4 pycparser-3.0 starlette-1.3.1 truststore-0.10.4 typing-extensions-4.16.0 typing-inspection-0.4.4
```

```text
PS C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-cline-contract-v2> $env:PYTHONPATH = 'C:\Users\LOVILO~1.ADM\AppData\Local\Temp\vuka-slice2-clean-deps-7798ce2a74144210ae6b4cbf752b0d0f'; python -m pytest server/tests/ -q
..................                                                       [100%]
18 passed in 1.06s
Exit code: 0
```

```text
PS C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-cline-contract-v2> $auditCache = Join-Path $env:TEMP 'vuka-pip-audit-cache'; pip-audit --requirement server/requirements.txt --cache-dir $auditCache
WARNING:venv:Actual environment location may have moved due to redirects, links or junctions.
  Requested location: "C:\Users\LOVILO~1.ADM\AppData\Local\Temp\tmpv8i1pnut\Scripts\python.exe"
  Actual location:    "C:\Users\lovilocal.adm\AppData\Local\Temp\tmpv8i1pnut\Scripts\python.exe"
No known vulnerabilities found
Exit code: 0
```

```text
PS C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-cline-contract-v2> node scripts/check-docs.mjs
Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.
Exit code: 0
```

```text
PS C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-cline-contract-v2> git diff --check
warning: in the working copy of 'server/main.py', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'server/requirements.txt', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'server/tests/test_server_slice1.py', LF will be replaced by CRLF the next time Git touches it
Exit code: 0
```

Decision: none. No contract or ADR decision changed.

Needs/blockers: no PostgreSQL integration test was run. Payload/salt commitment recomputation and encrypted-at-rest storage remain unimplemented; this task only makes the request parser match the existing C5 shape. The local branch includes the existing related commit `27fe187` (expired slice-2 nonce cleanup) ahead of remote `eb14e06`; no unrelated untracked worktree file is included.

Business handoff: this removes a request-shape failure that prevented client event submissions while preserving server-computed receipt and chain fields. It does not claim that private payloads are retained or encrypted.

Next: push the verified feature branch as explicitly requested, then confirm PR #51 CI results. Do not deploy.
