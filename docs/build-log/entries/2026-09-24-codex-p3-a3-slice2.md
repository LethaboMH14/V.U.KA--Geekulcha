## 2026-09-24 | Codex assistant | Luna medium (user-selected; exact build identifier not exposed) | P3.A3 slice 2 | implemented locally; review pending

**Research** — Read `sibusiso-workflow/tasks/anchor-server-slice2/01-task.md`, `docs/VUKA-2-SPEC.md` §§4, 4a, 7, 9, `contracts/openapi.yaml` request-security and event schemas, `contracts/keys/README.md`, and the current server/database implementation. Compared authentication, event idempotency order, key enrollment/recovery and journey ownership against the accepted task packet. The implementation branch is `feat/sibusiso-contract-v2`; before edits it was at `5c8bfaf` (local merge of `origin/main`) with the slice changes uncommitted.

**Real data / references** — The auth contract specifies P-256 ECDSA over `canonical({method, path, ts, body_sha256, nonce})`, carried by the four `X-Vuka-*` headers; the public-key registry stores SPKI/base64. The 120-second timestamp window, three safety-event skew exemptions, 24-hour nonce retention, and per-key counter uniqueness follow `docs/VUKA-2-SPEC.md` §§4a and 7. The local `contracts/keys/` directory contains only `README.md`; the exact manifest byte serialization remains unspecified there. A live `gh pr view 79/80` query could not connect to GitHub from this run, so remote PR status was not freshly checked here.

**Business reasoning** — Verifying the request signature and binding journey writes to the owning subject reduces the risk of forged or cross-person records, which is necessary before a user or guardian can trust an ANCHOR export.

**Competitor reference** — Not applicable; this is backend integrity and account-key handling, not a user-facing capability comparison.

Changed: `server/main.py` replaces the always-allow auth stub with P-256 request-signature verification using the accepted headers, canonical request object, registered SPKI key, nonce and signed body hash. It rejects missing, malformed, unknown, revoked, wrong-role and mismatched-subject keys; retains only the existing `POST /v1/events` and `GET /v1/subjects/{id}/export` routes; binds subject and journey events to the resolved key owner; and consumes export nonces. Genesis `registration` uses its carried device SPKI for bootstrap and atomically creates the first key and index-0 chain entry through the existing events route. `server/db.py` adds `signer_keys`, `journey_subjects`, 24-hour `request_nonces`, per-key `signer_counters`, one-active-device-key-per-subject enforcement, internal key/journey helpers, and a row-locked recovery transaction that appends `key_revoked` with `revoked_key_id` while revoking the old device key and inserting the replacement. `server/requirements.txt` pins the direct `cryptography` dependency. `server/tests/test_server_slice1.py` now covers valid and invalid signatures, genesis enrollment, revoked/unknown keys, timestamp expiry and safety skew, replay and retry ordering, journey ownership, export key binding, and revocation fields. `team/sibusiso.md` and the P3.A3 row in `docs/CHECKLIST.md` record local progress without marking all of P3.A3 complete.

Evidence:

- `pytest server/tests/` → `17 passed in 2.50s`.
- `pytest --ignore=archive` → `collected 114 items`; `114 passed in 6.10s`.
- `npm test` → `ℹ tests 23`, `ℹ pass 23`, `ℹ fail 0`.
- `node scripts/check-docs.mjs` → `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.`
- `python -m py_compile server/db.py server/main.py server/tests/test_server_slice1.py` → exit 0, no output.
- `git diff --check` → exit 0; Git emitted only LF-to-CRLF working-copy warnings for the four edited server files.
- Unscoped `pytest` → collection failed in four archived predecessor tests (`ModuleNotFoundError` for archived modules); the maintained test set passes when `archive/` is excluded as above.
- Raw `node --test` → `ℹ tests 28`, `ℹ pass 24`, `ℹ fail 4`; it incorrectly discovers `shared/test/*.test.js`, which use Vitest globals and fail with `TypeError: Cannot read properties of undefined (reading 'config')`. The repository's supported root script, `npm test`, passes 23/23.
- `gh pr view 79/80 --repo LethaboMH14/V.U.KA--Geekulcha --json state,mergeCommit,title` → both calls failed with `dial tcp ...:443: connectex: An attempt was made to access a socket in a way forbidden by its access permissions`; remote PR status was not verified in this run.
- No PostgreSQL service/integration test was run. The HTTP/auth tests use the in-memory test adapter; SQL transaction, row-lock and database constraint behavior still need PostgreSQL-backed verification.

Decision: No new ADR or contract change. No deployment, push, or remote PR action. This records implementation progress only; it is not a security review, approval, or production-readiness claim.

Needs/blockers: Lethabo and Ipeleng to review the authentication and cryptographic failure paths before merge. Recovery's internal helper receives a server-authored revocation entry but does not independently verify the server signature against a key manifest; manifest serialization and runtime verification remain outside this slice. The HTTP request signature is verified, but `details.sig` event-context verification and payload/salt encryption are not implemented by this slice. PostgreSQL-backed tests remain required before treating persistence behavior as verified.

Business handoff: `server/main.py` and `server/db.py` are the server-side implementation boundary for P3.A3 slice 2. They preserve the current two routes and provide internal journey ownership for a future journey-creation component; no user-facing journey endpoint was added.

Next: Sibusiso requests security review from Lethabo and Ipeleng on this local commit; continue P3.A3 slice 3 (durable escalation and anchoring) only after its task packet and required decisions are ready. No push or deployment was performed.
