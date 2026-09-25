## 2026-09-26 | Claude Code (assistant, at the operator's request on branch feature/ui) | Claude Code / claude-opus-5-5 | Android: registration routes, code channel, member ↔ guardian switching | built; switching checked on the emulator

Continues `2026-09-25-assistant-android-permissions-screen.md`.

**Research** — `VUKA-2-SPEC.md` §2 (registration is a name and a +27 number, Google optional; no email/password or email OTP anywhere in the spec), §4a / ADR-0042 ("each guardian has at most one non-revoked key"), G1 and G3; `docs/PRIVACY-POLICY.md` (collection table: name, +27 number, optional Google profile).

**Real data / references** — Not applicable. No figures.

**Business reasoning** — People whose Google account on the phone isn't the one they want can still register, and someone who is both protected and a guardian can reach either role in one tap, which matters when an alert arrives.

**Competitor reference** — Not applicable.

Changed:
- **Registration**: "Sign in" is now **"Create your account"** (step 2) with three routes, Continue with Google, **Sign up with email** (new `EmailSignUpFragment`: email, password ≥ 8 with show/hide, confirm) and Use your phone number, plus **"Already have an account? Sign in"**. Every route still verifies the +27 number next.
- **Sign in** (new `SignInExistingFragment`): by phone number (code, then the PIN on "Welcome back") or by email + password (then the PIN). A wrong email or password gets one message that never says which part was wrong. A number with no account on this phone gets a "No account found" dialog offering "Create an account" or "Try another number". This is local only.
- **Password**: new `auth/InterimPasswordStore`, a salted PBKDF2 hash in app-private storage, excluded from backups and cleared by "Delete profile". SIMULATED: there is no account server.
- **Code channel**: when an email is on file (Google or email route), the Verify screen offers **Text message / Email** and names the destination. It remains SIMULATED; no code is sent.
- **Role switching**: when the phone has both roles, a **Guardian tab** appears in the bottom bar (Home / Record / Guardian / Settings). Standby for a member shows **"Switch to my VUKA"**; a guardian-only phone keeps "Set up VUKA for yourself" and no tab bar. A shared `navigateToTab()` keeps Settings' "Guardian standby" row and the tabs in sync. Standby's back button was removed because the tab replaces it.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. The final rebuild → EXIT=0. On `emulator-5554`, using the operator's own test profile and nothing destructive: the 4-tab bar showed in Midnight, the Guardian tab opened Standby with "Switch to my VUKA", and that row returned to Home with "Home, selected". **Not checked on the device**: the "Create your account", email sign-up, sign-in and code-channel screens, because reaching them would mean signing the operator out.

Decision: none. The following need owners.

Needs/blockers:
- **The privacy notice must add email and password** (and say they are kept only as a hash) before this ships. Owner: Ipeleng.
- **The spec doesn't define email accounts, passwords, or codes by email**, and it ties an account to a verified +27 number. Whether email can replace the SMS check is a spec decision.
- **A guardian on several devices** conflicts with ADR-0042 (at most one live guardian key). Options: move the role to a new device (revoking the old key, like recovery), or amend the spec to allow one key per device. Team decision.
- **Real alert delivery** (G3: a high-priority notification that opens the alert directly) is what removes any need to switch roles during an emergency. It needs FCM and a server.

### Follow-up (same day): guardian role out of the tab bar, and an alert notification + banner

**Research** — Material/Apple guidance reserves the bottom bar for frequent, primary destinations. The guardian role is rare but urgent, so it gets a contextual entry point plus an alert path. Spec G3 requires a visible, high-priority notification.

Changed:
- **Guardian tab removed**; the bar is Home / Record / Settings again. `navigateToTab()` is gone.
- **Home card, shown only when enrolled**: "You're a guardian · Open guardian standby" → Standby (new `action_home_to_standby`). Settings' "Guardian standby" row pushes Standby too (`action_settings_to_standby`). With a member account, Standby has a back button; the redundant "Switch to my VUKA" row is removed. Guardian-only phones keep "Set up VUKA for yourself".
- **New `ui/guardian/GuardianAlerts`**, one shared alert state (active + acknowledgement). The alert screen reads and writes it (its private ViewModel is removed). Stepping down or deleting the profile clears it.
- **Alert notification (G3, SIMULATED)**: the channel "Guardian alerts" has IMPORTANCE_HIGH and CATEGORY_ALARM. Tapping the notification opens the alert (`MainActivity.EXTRA_OPEN_ALERT`, handled in onCreate and onNewIntent). It is skipped if notification permission isn't granted; guardian-only phones never pass the member Permissions step, so they get the banner only.
- **App-wide amber banner** above the nav host: "Alert · Example member / Simulated · tap to open". It shows on every screen while an alert is active and not stood down, except on the alert itself.
- Standby's link is now **"Simulate an incoming alert"**; it raises the notification and banner and opens the alert.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. **On `emulator-5554`** with the operator's profile (member + guardian, in-memory alert only):
1. Home showed 3 tabs and the guardian card.
2. Card → Standby (with back button) → Simulate an incoming alert. The heads-up notification appeared and the alert opened.
3. Back to Standby and then Home: the banner showed on both.
4. Tapping the banner opened the alert.
5. Call → I called → Stand down → Yes. Back on Standby, the banner count was 0.

Not tried: tapping the notification itself, and a guardian-only phone.

### Follow-up (same day): guardians are asked for notification permission at enrolment

Changed:
- **Enrol, consent step**: a line explaining the next step ("Next, VUKA asks to send you notifications. Allow them so an alert reaches you straight away, even when your phone is locked."). "I understand" then requests `POST_NOTIFICATIONS` (Android 13+, only if not already granted) and completes enrolment whatever the answer. This is Android's recommended "explain, then ask" pattern.
- **Standby**: when notifications are off (`areNotificationsEnabled()`, re-checked in onResume), an ink-outlined notice reads "Notifications are off for VUKA, so an alert can't reach you until you open the app", with "Turn on notifications". That opens the app's notification settings on Android 8+ and the app details page on Android 7.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. **On `emulator-5554`**:
1. `pm revoke … POST_NOTIFICATIONS`, then Standby showed the notice.
2. Stop being a guardian → Settings → Protect someone → code → consent. The explanation showed, and "I understand" raised the system prompt.
3. Allow → Standby, notice gone, `POST_NOTIFICATIONS: granted=true`, both roles true (the operator's original state, restored).

Not tried: "Don't allow" then "Turn on notifications", and Android 7.

Noticed: the permission prompt reads "Allow **My Application** …" because `app_name` in `res/values/strings.xml` is still the template's "My Application". Renaming it is the operator's call.

### Follow-up (same day): app name is "VUKA"

Changed: `res/values/strings.xml` `app_name` "My Application" → "VUKA" (the launcher label, and the name in Android's permission prompts and notification headers). Left unchanged: `settings.gradle.kts` `rootProject.name` (the Gradle/IDE project name, which users never see) and the package id `com.example.myapplication`.

Evidence: `./gradlew :app:assembleDebug` → EXIT=0; `aapt2 dump badging` on the APK → `application-label:'VUKA'`; installed on `emulator-5554`.

Needs/blockers: the package id `com.example.myapplication` must change before any Play Store release, because Google Play rejects `com.example.*`. It is permanent once published, so it is a team decision (for example `za.co.vuka.app`).

### Follow-up (same day): package id is `za.co.vuka.app`

Operator decision: the package id is `za.co.vuka.app`. This supersedes the "team decision" note in the previous follow-up.

Changed:
- `app/build.gradle.kts`: `namespace` and `applicationId` now read `za.co.vuka.app`.
- Moved `app/src/{main,test,androidTest}/java/com/example/myapplication` to `.../za/co/vuka/app`, including the empty `data/`, `data/model/` and `ui/common/` directories someone had created. The emptied `com/example` directories were removed.
- Rewrote `com.example.myapplication` → `za.co.vuka.app` in 42 files under `app/src`: package lines, imports, nav-graph class names, custom-view tags, `tools:context`, and the instrumented test's package assertion.
- Not touched: `.idea/workspace.xml` (IDE state, which Studio regenerates), `app/build.gradle.zip` (the operator's archive), `settings.gradle.kts` `rootProject.name`, and earlier build-log text (historical).

Evidence: `./gradlew clean :app:assembleDebug :app:lintDebug :app:testDebugUnitTest` → EXIT=0, 0 lint errors. `aapt2 dump badging` → `package: name='za.co.vuka.app'`, `application-label:'VUKA'`. Installed on `emulator-5554` and launched `za.co.vuka.app/.MainActivity` with no FATAL in logcat; it opened at Welcome. A new application id is a new app to Android, so **the old `com.example.myapplication` install and its data are still on the emulator, separate from the new one**.

### Follow-up (same day): a dedicated "Turn on alerts" enrolment step, and the old app removed

**Research** — The operator reported that enrolment "went straight" past the notification request. Reproduced on `emulator-5554`: the system prompt did appear on "I understand", and the operator's grant was recorded `USER_SET`. It is easy to miss, because it pops over the consent screen and only a small caption announces it.

Changed:
- Enrolment is now **Code → Consent → Turn on alerts**. The third step shows only when notification permission is missing (Android 13+). It has a bell, the heading "Get their alerts straight away", a plain reason ("…even when your phone is locked or you're in another app. Without it, you'd only see the alert when you next open VUKA."), **Allow notifications** (which raises Android's prompt) and **Not now**. Either way enrolment then finishes, and Standby's notice covers "Not now". The step counter reads "of 3" only when the step will show, and Back walks back through the stages. The consent-screen caption was removed.
- **The old `com.example.myapplication` install was uninstalled** from the emulator at the operator's request. Before that, a snapshot of `za.co.vuka.app` (all 5 `shared_prefs` files and every permission grant) was taken; it was identical afterwards (`diff` produced no output). The new app then launched with no FATAL in logcat, on guardian Standby. The old app's own test data is gone with it, as expected.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. On the emulator, with the permission revoked, the flow ran Stop being a guardian → I'm a guardian → code → "STEP 2 OF 3" → consent → "Turn on alerts" (STEP 3 OF 3) → Allow notifications → Allow → Standby, with no warning and `POST_NOTIFICATIONS: granted=true`. Not tried: "Not now".
