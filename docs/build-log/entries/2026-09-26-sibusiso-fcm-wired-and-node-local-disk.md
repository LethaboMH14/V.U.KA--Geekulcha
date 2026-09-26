## 2026-09-26 | Sibusiso, with Claude Code assistant | Implementation | FCM guardian push wired into the worker; Node moved off Azure's network share | PROPOSED

**Research** — Sibusiso set `FCM_PROJECT_ID` and `FCM_ACCESS_TOKEN` as Azure app settings and asked for FCM to be wired in. Khutso's adapter (`server/src/notify/fcm.py`, `FcmGuardianNotifier`, #95) lived only on #95's branch. `server/run_workers.py` always used the SIMULATED notifier. Wiring it in naively would have broken the working demo in two ways, both found by reading the code before switching:
1. **Placeholder tokens.** The guardian app on #88 enrols with `fcm_token: 'sim_poll_while_open'` (`app/src/api/device.ts`); it polls for alerts rather than receiving pushes. Sending those to FCM fails every alert, so nothing is recorded as delivered.
2. **Alerts route.** Lethabo's `GET /v1/guardians/me/alerts` (`server/guardian_alerts.py::alerts_for`) read only `sim_notification_receipts`, so an alert pushed through FCM (recorded in `fcm_notification_receipts`) would never appear in the guardian's in-app list.

Separately, the 11:56 UTC Azure boot logged "installing pinned Node" and then nothing for 9+ minutes. The only step in between was `rm -rf` of the half-extracted Node tree under `/home`. `/home` on App Service is a network share, where deleting or writing thousands of small files is very slow; that is also the likely cause of the 10:40 UTC hang.

**Real data / references** — #95's code merged into this branch (`45a21ce` and ancestors, clean merge). The `/v1/guardians/{id}/token` route (guardian-signed) already lets the app replace its placeholder with a real token. App Service boot logs for 10:40, 11:56 UTC.

**Business reasoning** — A guardian must never miss an alert because a push credential expired or a device hasn't registered for push. In-app delivery is the reliable floor; push is added on top.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Merged #95 into this branch.** `RoutingGuardianNotifier` (new, `server/guardian_notifier.py`) routes per guardian: a real device token goes through FCM; a `sim_` placeholder keeps in-app delivery. If a push fails (`FcmError`/`OSError`, e.g. an expired ~1-hour access token → HTTP 401), a `sim_` member's guardian falls back to in-app delivery and the failure is logged (status only, never a token).
- **Per-delivery `simulated` flag.** `DeliveryResult` gains an optional `simulated`, and `guardian_worker` records it per delivery instead of per notifier.
- **`alerts_for` reads `guardian_deliveries`,** the worker's adapter-neutral record of every verified delivery.
- **The switch.** `run_workers.py` uses the routing notifier only when both FCM settings are non-empty, and logs which mode it runs in (`vuka: guardian alerts via ...`).
- **Node off the network share.** `startup.sh` keeps a single file on `/home`: the Node tarball, with its SHA-256 pinned in the script and checked before every extraction. It extracts Node and installs the sidecar's dependencies on local `/tmp`, with a local npm cache; npm's default cache is under `$HOME`, which is `/home`.

Evidence (FACT, real PostgreSQL):
- **`server/tests/test_fcm_routing.py`** (new, FCM transport is a SIMULATED fixture), four tests:
  - a placeholder token never calls FCM and still shows in-app;
  - a real-shaped token is pushed once, recorded `simulated=False`, and shows in-app;
  - a 401 from FCM still delivers in-app;
  - the worker chooses FCM only when both settings are present.
- **Mutation-tested:** routing every token to FCM, reverting the alerts route to the old receipts table, and removing the failure fallback each fail at least one of these tests.
- **Existing tests:** `test_guardian_alerts`, `test_fcm_guardian_notifier`, `test_notify_fcm` and `test_run_workers_all_effects` pass unchanged.
- **`startup.sh`, local sandbox runs:**
  - a stub tarball with its hash pinned logs "using cached Node tarball", then "node v24.18.0 ready on local disk", "installing sidecar dependencies" and "sidecar ready";
  - a rerun logs "dependencies already present";
  - fresh, cached and corrupted-cache runs against the real nodejs.org tarball are recorded in the commit.

Decision: None accepted.

Needs/blockers:
- (1) No guardian gets a real push until the guardian app obtains a real FCM registration token and sends it to `PUT /v1/guardians/{id}/token` (Lethabo). Until then, FCM is configured but every current guardian stays in-app.
- (2) `FCM_ACCESS_TOKEN` is short-lived by the adapter's own design (no long-lived service-account key on the server); it must be refreshed before a demo, or a token-minting step decided on with Khutso and Ipeleng.
- (3) Khutso's #95 self-review points (FCM collapse-key dedup unproven; send-then-record race) still stand.

Business handoff: Not applicable.

Next: redeploy; confirm `vuka: guardian alerts via FCM push` and `vuka: sidecar ready` in the App Service log.
