## 2026-09-26 | Claude Code (assistant) for operator mutarisi | Claude Code / claude-opus-5-5 | Native app (za.co.vuka.app) connected to the live ANCHOR server | partly done, partly blocked

**Research** — Operator asked to connect the app to `feat/sibusiso-backend-completion` and said the rest is on other branches. Found: the live Azure server (`https://vuka-anchor-server.azurewebsites.net`, `/healthz` → `{"status":"ok","database":"reachable"}`) runs `feat/lethabo-guardian-delivery` (contains backend-completion; has `/v1/guardians/me/alerts` and `/location`, which backend-completion lacks). The team's tunnel demo server (discovery file on the `vigil-demo` release) was down (Cloudflare 1033). The client logic was ported from the RN app on `feat/lethabo-vigil-events`: `app/src/api/events.ts`, `device.ts`, `SignerModule.kt`, `shared/canonical.js`. Read spec §4, §4b, §5, §7, §9, V1–V9; `server/main.py`, `event_effects.py`, `escalation.py`, `guardians.py`.

**Real data / references** — Live responses observed on 26 Sep (all `FACT`, from the app's outbox counters and logcat, plus Python probes): registration 201, `POST /v1/journeys` 201 (journey `51750240-…`), `journey_armed` 201, manual `signal_detected` 201, `checkin_opened` 201; `/v1/guardians/invites` 201 (code format `<8 hex>-<6 digits>`); `/v1/guardians/accept` **503 database_unavailable** for every valid request, reproduced from Python with no app involved. Server escalation: signal + 60 s window + 30 s grace → `no_answer` → alarm (`server/escalation.py`, PROPOSED).

**Business reasoning** — The app stops being a phone-only demo: its evidence is signed on the device and held by the server, which is what makes the record believable to a third party.

**Competitor reference** — Not applicable.

Changed:
- Merged `origin/feat/sibusiso-backend-completion` and `origin/feat/lethabo-guardian-delivery` (server, anchor, contracts, docs; no `app/` changes). One docs conflict in `docs/SIBUSISO-HANDOVER.md` each time, resolved by keeping both sides' dated entries.
- `api/Canonical.kt`: Kotlin canonical JSON. **PROPOSED DEVIATION from spec §5 rule 5 ("There is no Kotlin canonicaliser")** — the native app has no JS runtime. `CanonicalTest` passes all 9 golden vectors (exact bytes and SHA-256) and all 5 rejection vectors in `contracts/vectors/canonical.json`. Needs Sibusiso (contract) and Ipeleng (vectors) acceptance.
- `api/DeviceSigner.kt`: P-256 Keystore key (StrongBox when present), DER event sigs, raw r||s request sigs, persisted counter; key id `dev_…`, guardian key id `gdn_…` from the same key.
- `api/EventClient.kt`, `api/ServerSync.kt`: format-v2 events + signed requests; durable outbox (oldest first, 4xx set aside, retried on network failure). Flows: registration (`sim_subj_…`, at PIN setup / completion / app start for existing members), Activate → journey + `journey_armed` + 30 s heartbeats (speed_bucket "unknown"), sound detections and Emergency/QS tile → `signal_detected` (sound / manual), Deactivate → `pin_authorised(end_journey)` + `journey_ended` (duress mode from the PIN sheet), duress at invite/delete → `pin_authorised {mode: duress}`.
- `detect/CheckinActivity.kt`: the Journey check — full-screen where allowed, over the lock screen; `checkin_opened` only once shown; normal/duress → `checkin_result`, identical screen; wrong PINs 1–3 "Try again", then always "Checked in" (T47).
- Guardians: invite sheet shows the server's real code + Share (normal authorisation during onboarding, PIN mode from Settings); enrolment takes the real code format and calls accept only after consent; linked guardians poll `/v1/guardians/me/alerts` every 15 s while the app is open; Call 10111 / Stand down send signed `guardian_ack`; alert screen shows trigger, reasons and last location in words; standby says "Linked".
- Panic screen, Home and Record copy updated to what now happens (sent to the server; Record shows "SERVER: N SIGNED EVENTS RECEIVED"). Home no longer says "Starting to listen…" for a journey left open after the app was closed.
- `INTERNET` and `USE_FULL_SCREEN_INTENT` permissions.

Evidence: `./gradlew :app:assembleDebug :app:testDebugUnitTest -q` → exit 0 (CanonicalTest 4, DetectionEngineTest 14). On emulator-5554 against Azure: registration, journey, `journey_armed`, manual `signal_detected` and `checkin_opened` accepted (outbox empty, `sent`=4); Journey check screen shown from the notification. Guardian invite via a synthetic `sim_` member script (scratchpad, not committed) returned a code; entering it on the emulator got 503 from `/v1/guardians/accept`, as did the same request from Python.

Decision: operator authorised connecting everything. Kotlin canonicaliser and "open a journey on Emergency when none is open" are PROPOSED and need the contract owners.

Needs/blockers:
- **Sibusiso: `/v1/guardians/accept` returns 503 on the live server for valid requests** (repro: create an invite, accept with any fresh P-256 key). Until fixed, no guardian can link, so no guardian receives alerts.
- Not yet connected: record export/verification against the server (needs an `export` PIN authorisation), location sharing after a check-in (ADR-0048), FCM push (alerts only while the guardian's app is open), server deletion/recovery, guardian removal, CEM evidence, and a duress signal for sign-in / sign-out / profile edit (no server action exists).
- The test signals from this session went unanswered and will have escalated to `no_answer` on sim_ subjects with no guardians (nobody alerted).
- A test member `sim_subj_e2e…` exists on the live DB (sim-only by design).

Business handoff: not applicable — no pricing change.

Next: Sibusiso fixes accept; operator re-runs the guardian link on two phones, then Emergency without answering to see the alert arrive.
