## 2026-09-25 | Sibusiso, with Claude Code assistant | Implementation | POST /v1/devices/recover, 24h freeze | PROPOSED

**Research** — `server/db.py` already had `recover_device_key()` (atomic key-swap + `key_revoked` chain append), fully tested at the storage layer, with a docstring naming "the recovery route" as deliberately out of scope for that earlier slice. No route called it. `key_revoked` also needed its own signing helper: `revoked_key_id` sits in plain `details`, not inside the committed `payload`, and the entry's top-level `action` is `"key_revoked"`, not the generic `"server_event"` every other server-authored kind uses — the existing `sign_server_entry()` cannot produce that shape.

**Real data / references** — Spec §9 (recovery: 10-word code, SHA-256 of the first two words as lookup handle, Argon2id verification; rate-limited; blocked during an open incident; 24h freeze on guardian changes, deletion and export). `cryptography==50.0.0` (already pinned) ships `Argon2id` with `derive_phc_encoded`/`verify_phc_encoded`, so no new dependency was needed.

**Business reasoning** — Losing a phone is the scenario the whole duress design has to survive without becoming a bigger hole than the one it closes: the route must never leak which lookup handles exist (every failure path returns the identical 401 shape) or allow the freeze to be a no-op against the surface already built today (export).

**Competitor reference** — Not applicable.

Decision (**PROPOSED**, tenth item for Lethabo on #82): device-generated recovery code provisioning (storing the lookup handle + Argon2id hash at onboarding, "shown once") is **not built**. It needs a genesis-registration contract decision this task does not make. `provision_recovery_code()` is the internal seam a provisioning flow will call, same pattern as `bind_journey`/`enroll_signer_key` before their own routes existed. The freeze also gates export (retrofitted into `server/export_view.py`, built earlier today) since spec §9 names export explicitly; it does not yet gate guardian changes or deletion, because those routes don't exist yet either.

Changed: `server/recovery.py` (new), `server/server_signing.py` (`sign_key_revoked_entry`), `server/main.py` (`POST /v1/devices/recover`), `server/export_view.py` (freeze check), `server/db.py` (recovery schema registered), `contracts/openapi.yaml` (flag flipped true).

Evidence (FACT, real PostgreSQL): `server/tests/test_device_recovery.py` 7/7 (key swap + two chain entries, wrong code, unknown handle, rate limit after 5 attempts on one handle, open-incident block, freeze set + guardian notice recorded, export refused while frozen). Full suite: 235 pytest / 0 skipped, 50 node. 4 mutation checks (rate limit, unknown-handle check, export freeze check, open-incident block), each broke a test; one needed a retry after a shell-escaping artifact in the mutation script, confirmed genuine on the isolated re-run.

Decision: None accepted.

Needs/blockers: recovery-code provisioning at onboarding (genesis registration contract change, both leads); the freeze does not yet gate guardian invite/accept/removal (not built) or deletion (next item); no guardian notification delivery (same documented gap as guardian_alert).

Business handoff: Not applicable.

Next: deletion route (F15, §9), then guardian invite/accept/removal and sim_bank/WebSockets go to Codex as separate packets.
