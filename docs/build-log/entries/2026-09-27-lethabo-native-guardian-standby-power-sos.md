## 2026-09-27 | Lethabo (co-lead), via Claude Code assistant | Native app: guardian standby with the app closed, power-button help, location window, 112 and Maps | PROPOSED — for Mutarisi

**Research** — Read `feature/integrate` @ f9bdb29: `SensingService.kt`, `GuardianAlerts.kt`, `GuardianAlertFragment.kt`, `Panic.kt`, `ServerSync.kt`, `CheckinActivity.kt`, the manifest. Server location route and shape from `feat/lethabo-guardian-delivery` (`server/main.py` `/v1/journeys/{id}/location`, `server/locations.py` `FIELDS`), which is what Azure runs. The React Native app's `sendLocation` (ADR-0048) and hold-for-help (ADR-0049) were the reference.

**Real data / references** — Android: no app can read power-button presses, but each press toggles the screen (ACTION_SCREEN_ON/OFF, registered at runtime). Android's own Emergency SOS uses five presses, so VUKA uses four. `ACTION_DIAL` is required for emergency numbers (Mutarisi's earlier entry). 112 reaches an emergency centre from SA mobiles.

**Business reasoning** — A guardian who only hears about an alert while the app is open isn't a guardian. Power presses give the member a way to ask for help without unlocking the phone or opening the app.

**Competitor reference** — Android Emergency SOS (five presses, calls a number with a countdown alarm); Namola (hold for 2 s in the app). VUKA's four presses do the same as its Emergency button: a Journey check, silent unless answered.

Changed:
- **Guardian standby with the app closed** (`GuardianWatchService`, `GuardianBootReceiver`): a linked guardian's phone keeps a quiet foreground service (special-use type) that fetches alerts every 15 s, starts on enrolment, on app start and after a reboot, and stops when they leave. The alert notification now vibrates and opens full-screen over the lock screen where Android allows it. **Stated limits:** a partial wake lock (battery cost not measured); Doze can delay polls on a phone left still with the screen off. FCM push is the real fix (needs the Firebase config).
- **Four power presses in 3 s** (`PowerPresses.kt`, while a journey is active) raise the same help request as the Emergency button (`Panic.Source.POWER_BUTTON`, ADR-0049): a manual `signal_detected`, then the Journey check notification. A 30 s cooldown stops double fires. `PressCounterTest`: 6 tests.
- **Location window** (`LocationShare.kt`, ADR-0048): when a Journey check opens, a fix goes to `/v1/journeys/{id}/location` about every 30 s for 30 min, only if location is allowed. The server keeps it only while a guardian alert is open. `SensingService` adds the location foreground type only when the permission is granted.
- **Guardian alert:** "Call 112" and "Open in Maps" (the last shared fix, via `geo:`) beside Call 10111. "Call them" stays locked during an incident (G4).
- **Home:** "You can close the app: VIGIL keeps listening until you deactivate", and the power-button shortcut. The journey notification says "Listening. You can close the app." (it doesn't mention the shortcut, since the lock screen is visible to anyone holding the phone).
- **Record:** "Emergency alert · not sent" → "Emergency alert" (it is sent since the server connection).

Evidence: `./gradlew :app:assembleDebug :app:testDebugUnitTest -q` → exit 0; 25 tests, 0 failures (PressCounterTest 6, DetectionEngineTest 14, CanonicalTest 4, Example 1). **Not run on a device or emulator** (the build laptop had no memory for one): standby surviving app close, the full-screen alert, the power pattern on real hardware, and location fixes reaching Azure are all untested.

Decision: none. Power-button help and guardian standby are PROPOSED; the four-press choice and the wake-lock trade-off need Mutarisi's and the leads' acceptance.

Needs/blockers: a two-phone device test; FCM (Firebase config) to replace polling; Ipeleng on the special-use foreground service and location window wording.

Business handoff: pitch may say "guardians are alerted with the app closed" only after the device test passes.

Next: install on two phones; guardian closes the app; member presses power four times, does not answer; confirm the guardian's full-screen alert and Open in Maps.
