## 2026-09-24 | Lethabo (co-lead), via Claude Code assistant | App shell and signed-release pipeline (P3.V4 path, D1) | PROPOSED — for Vukosi (release owner) to adopt

**Research** — Spec §14 says Thursday is for "an empty signed-APK pipeline with no product code", with D1 (a signed release APK cold-installed from a QR code) due Thu 22:00. `app/README.md` fixes the stack as React Native 0.74.5. No app code or pipeline existed on any branch at 16:00.

**Real data / references** — Built locally on 24 Sep 2026 (Windows 11, JDK 17, Android SDK platform 34, build-tools 34.0.0):
- `gradlew assembleRelease` succeeds;
- `apksigner verify --print-certs` shows signer CN=Team SONAR VUKA, certificate SHA-256 `ddfbf916779c404c037033f9ae30f057cb4f03242a26bacd66ac8ee40660e62d`;
- `aapt dump badging` shows `uses-permission` INTERNET only, minSdk 23, targetSdk 34;
- the only exported component is the launcher activity;
- `npx jest` gives 1/1; `npx tsc --noEmit` is clean.

The APK digest is recorded in the release notes when the release is published, not here: it changes with every build.

**Business reasoning** — The demo phone and the judges' QR install depend on a signed build existing before any feature lands.

**Competitor reference** — Not applicable.

Changed:
- `app/`: the React Native 0.74.5 shell (Android only, no `ios/`). `App.tsx` is a plain "release pipeline check" screen labelled SIMULATED.
- `app/android/app/build.gradle`: the release is signed from `VUKA_UPLOAD_*` Gradle properties or environment variables. A release task with no key **fails** and never falls back to the public debug key.
- `app/android/gradle.properties`: release ABIs are `armeabi-v7a,arm64-v8a`.
- `app/.gitignore`: ignores `*.jks`, `*.p12` and `keystore.properties`.
- `app/README.md`: how to build and sign.

Evidence: the commands above, run locally. CI does not build the APK yet.

Decision: none. The upload key used for this proof build is held only on Lethabo's machine (`~/.vuka`, outside the repo). Vukosi, as release owner, decides whether the team keeps this key or generates their own before the first public release. An installed APK only updates from the same key.

Needs/blockers: Vukosi adopts or replaces this, publishes the GitHub Release with its QR, and runs T20 (a cold install on a clean phone) and T17.

Business handoff: None until a release is published.

Next: native modules (the Keystore signer, the foreground service), then the UI port from `prototype/`.
