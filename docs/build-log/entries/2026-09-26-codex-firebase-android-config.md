## 2026-09-26 | Codex assistant acting at Khutso's request | G3 Android Firebase setup | PROPOSED

**Research** — Read the G3 work order, spec G3/§8, app Gradle files, `.gitignore`, and Firebase's Android setup and Messaging guidance. The app uses Groovy `buildscript`, not the console screenshot's Kotlin DSL. Parsed supplied JSON metadata: a `com.teamsonar.vuka` client exists; no service-account `private_key` field. Firebase also included the earlier misspelled package client; the file was not hand-edited.

**Real data / references** — https://firebase.google.com/docs/android/setup ; https://firebase.google.com/docs/android/troubleshooting-faq ; https://firebase.google.com/docs/cloud-messaging/android/get-started . No production delivery data.

**Business reasoning** — Correct Android configuration is prerequisite to a visible guardian alert (G3), not proof of delivery.

**Competitor reference** — Not applicable.

Changed: the two Android Gradle files add the Google Services plug-in and Firebase Messaging SDK; `app/README.md` documents local configuration and remaining device work. The supplied `google-services.json` is local and Git-ignored, not part of this change.

Evidence: JSON metadata matched the app package and lacked private-key fields; `git check-ignore` confirmed exclusion; `git diff --check` passed; `node scripts/check-docs.mjs` passed. Gradle sync/build was not run: Java, Android SDK and app `node_modules` are absent here. No device notification or FCM token is claimed.

Decision: None. G3 delivery remains unverified.

Needs/blockers: Vukosi/Lethabo provide the app config in their build environment and own client token/notification wiring with Mutarisi; Sibusiso reviews integration, Ipeleng reviews disclosure. Server credentials stay server-side.

Business handoff: `app/README.md` provides setup and separates build configuration from delivery evidence.

Next: app owner review, configured-machine Gradle check, and an end-to-end guardian-device test before G3 is marked done.
