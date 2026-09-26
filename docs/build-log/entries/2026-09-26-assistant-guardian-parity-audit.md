## 2026-09-26 | Claude Code (assistant, at Lethabo's request) | Claude Code / claude-opus-5-5 | VIGIL app: guardian-side parity with Mutarisi's native build (origin/feature/ui 5aa5d24) | done in the working tree, not device-tested

**Research** — Read every guardian file on origin/feature/ui (GuardianAlertFragment, GuardianAlerts, EnrolFragment, StandbyFragment, AcknowledgedFragment, fragment_guardian_*.xml, dialog_turn_on_alerts.xml, dialog_leave_guardian.xml, MainActivity EXTRA_OPEN_ALERT) and its six 2026-09-2* assistant build-log entries, against app/src/ui/guardian.tsx, screens.tsx, map.tsx, api/push.ts, api/device.ts and the native LocationModule/CheckinNotice/GuardianPushChannel/MainActivity. Server routes checked on origin/feat/lethabo-guardian-delivery (server/main.py, server/locations.py, server/guardian_alerts.py).

**Real data / references** — Not applicable: no figures. Mutarisi's build has no map (a "Location unavailable" placeholder only); the RN app already shows the real one from `GET /v1/guardians/me/alerts` `alerts[].location`.

**Business reasoning** — A guardian who can't open the alert from its notification, or can't step down cleanly, would not trust the product; this closes those gaps without simulated data.

**Competitor reference** — Not applicable.

Changed:
- Tapping the polled alert notice now opens the alert (Mutarisi's EXTRA_OPEN_ALERT): GuardianNotice has its own extra and `openPending`; MainActivity sets it; JS reads it once (`consumeGuardianOpen`) at start-up and on return to the app.
- "Stop being a guardian" (his LeaveGuardianSheet): `device.leaveGuardian()` forgets the slot on this phone; `dropGuardianPush()` deletes the FCM token. VIGIL's server has no guardian-side removal (DELETE /v1/guardians/{id} is member-signed), so the dialog says the server isn't told.
- Standby: "Alerts to this phone" (push or polling, last alert) and "Your guardian role" rows; notifications-off check uses areNotificationsEnabled (any Android version); "Turn on notifications" opens VUKA's notification settings.
- minSdk 23 safety: notification channels only created on Android 8+, ContextCompat.startForegroundService, setShowWhenLocked only on 8.1+.

Evidence: `cd app && npx tsc --noEmit` clean; `npx jest --silent` 279 passed (baseline 272). Kotlin not compiled here (no Android SDK in this environment).

Decision: none.

Needs/blockers: device check of notice tap → alert, full-screen intent, FCM push on a Firebase build; a guardian-side removal route on the server (owner: Lethabo) so stepping down also tells the member.

Business handoff: not applicable (no capability claim changes).

Next: Lethabo, device test on the next APK.
