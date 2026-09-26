## 2026-09-26 | Codex assistant acting at Khutso's request | G3 PR #112 review correction | PROPOSED

**Research** — Read Lethabo's approval on PR #112 and checked the exact `apply plugin` line, Git-ignored JSON rule, and app build instructions. His finding: applying Google Services unconditionally makes a public APK build without `google-services.json` fail during configuration processing.

**Real data / references** — PR #112 review: https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/112#pullrequestreview-5326824456 ; Firebase Android setup: https://firebase.google.com/docs/android/setup . No device-delivery data.

**Business reasoning** — Remove the known missing-config failure from the public APK path while the team provisions Firebase separately; explicitly label that APK as not configured for guardian push.

**Competitor reference** — Not applicable.

Changed: conditionally apply the app-level Google Services plug-in only if `app/android/app/google-services.json` exists; update `app/README.md` to describe the no-config build honestly. The Messaging dependency remains present in either case.

Evidence: Static review of both file-present and file-absent branches; `git diff --check` passed and `node scripts/check-docs.mjs` passed. A real Gradle build remains unverified locally because Java, Android SDK and app `node_modules` are absent. CI currently does not exercise an Android build for this PR.

Decision: Lethabo approved PR #112 with this must-fix before merge; his approval does not establish a successful APK build or live FCM delivery.

Needs/blockers: App/release owner runs `assembleRelease` without config for the public path and with the supplied config for the FCM path, then records both outcomes. Guardian token registration and visible notification still require device evidence.

Business handoff: `app/README.md` distinguishes a conditional build configuration from proven push delivery.

Next: Re-request Lethabo and Sibusiso review on corrected head; do not merge without the required checks and reviews.
