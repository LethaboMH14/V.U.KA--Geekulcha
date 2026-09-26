## 2026-09-26 | Claude Code (assistant) for operator mutarisi | Claude Code / claude-opus-5-5 | Account backend (codes, profile, password), local dev server, visible connection | done locally; delivery providers and Azure deploy pending

**Research** — Operator: "create the backend for those things… I want everything to work as a real app". Checked spec: no account/email/phone endpoints exist; §18 keeps the phone number out of the registration payload. Reproduced the live `/v1/guardians/accept` 503 on a local copy of the server and traced it with the steps run directly: `server_signing.sign_server_bytes` raises "pinned server signer is unavailable" — `VUKA_SERVER_ED25519_KEY_B64` is missing or doesn't match `contracts/keys/manifest.json`.

**Real data / references** — Local PostgreSQL 17.4 (throwaway cluster, port 55441, trust auth, 127.0.0.1 only). Live requests from the emulator seen in the local server log: `POST /v1/events` 201, `POST /v1/journeys` 201, heartbeat 202; Settings → Test connection returned "Connected. Signed in as sim_subj_16dab4cf". YAMNet reported "Silence · 33%" once the emulator's host microphone was switched on (then switched off again).

**Business reasoning** — Sign-up and sign-in stop being theatre: contacts are proven, passwords are checked by the server, and the member can see the app is really connected.

**Competitor reference** — Not applicable.

Changed:
- **Root cause of the live guardian-join 503 (and of every server-signed entry: guardian_added, no_answer, alarms):** the Azure app setting `VUKA_SERVER_ED25519_KEY_B64` is missing or doesn't match the pinned manifest. Only Sibusiso holds that key. Locally, `VUKA_SERVER_MANIFEST_PATH` (new, `server/server_signing.py`, `server/anchor_reads.py`) points a dev server at a dev manifest with a throwaway key; pinning is unchanged; production default unchanged. With it, `/v1/guardians/accept` returns 201.
- **New `server/accounts.py` (PROPOSED)**: tables `accounts`, `account_otps`; signed device-key routes `POST /v1/account/otp`, `POST /v1/account/otp/verify`, `GET /v1/account`, `PUT /v1/account/profile`, `PUT /v1/account/password`, `POST /v1/account/password/check`, `POST /v1/account/password/reset`, `PUT /v1/account/recovery`. Email/phone/names AES-256-GCM encrypted (key derived from the payload key), HMAC lookups, Argon2id for codes and passwords, 10-minute codes, 5 attempts, 5 codes per 15 minutes, reset codes only to the verified recovery contact. PIN is never reset here (spec §9).
- **New `server/notify.py`**: SMTP email and Twilio SMS delivery from env settings; `VUKA_DEV_OTP_LOG=1` prints codes to a local server console only; otherwise the API answers 503 `delivery_unavailable`.
- `scripts/run-local-server.sh`: workers + uvicorn against local PostgreSQL, dev payload key, dev server key/manifest, dev code logging.
- App: server choice in Settings → VUKA server (cloud, this computer via `adb reverse`, custom; switching re-registers and sets old queued events aside), account id, delivery counts, **Test connection**; Home "● Connected to VUKA's server · last contact HH:mm"; live "Hearing: <label> · N% sure" + level bar while listening; real codes on the Verify code screen (send, resend, channel change, wrong/expired/locked from the server; dev-server note instead of "SIMULATED"); email sign-up password saved on the server after the email is verified; email sign-in checked by the server (offline fallback to the phone's copy); Forgot password with a real reset code; Recovery choice saved on the server; profile names saved; a changed email/number verified with a code (`VerifyContactDialog`). Network security config allows cleartext only to localhost/10.0.2.2.

Evidence: `.venv/Scripts/python -m pytest -q server/tests` → 166 passed (156 existing + 10 new in `server/tests/test_accounts.py`) against local PostgreSQL; `./gradlew :app:assembleDebug :app:testDebugUnitTest` → exit 0. Emulator (local server via `adb reverse`): registration 201, Test connection "Connected…", Activate → journey 201, journey_armed 201, heartbeat 202, Home connection line and Hearing line shown. NOT run on device: the new sign-up code flow, email sign-in, reset and contact verification (the emulator holds an existing account whose PIN the assistant doesn't know).

Decision: operator authorised building the backend. PROPOSED, needs acceptance: the account API and its storage of email/phone/names on the server (privacy notice and POPIA register must be updated), Kotlin canonicaliser (earlier entry).

Needs/blockers:
- Sibusiso: set the matching `VUKA_SERVER_ED25519_KEY_B64` on Azure; deploy this branch's server (accounts module, schema is created on boot).
- Operator: SMTP credentials (e.g. a Gmail app password) and optionally a Twilio trial, as server env settings, for real email/SMS delivery. Until then only the dev server can show codes (in its console).
- Google sign-in still needs Firebase (`google-services.json`); a start exists on `claude/nifty-edison-mibetp`.
- Sign-in on a different phone is deliberately not added: it would move the chain to a new key, which spec §9 reserves for the recovery code.

Business handoff: not applicable — no pricing change; an email/SMS provider may carry a cost (SMS per message).

Next: operator tests a fresh sign-up on the local server; then provider credentials; then Azure deploy with Sibusiso.
