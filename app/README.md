# app/ — VIGIL

The Android app: journey mode, on-device YAMNet detection, the discreet "Journey check", guardian mode, and a signed, queued event record. It is specified in `docs/VUKA-2-SPEC.md` §2 (V1–V10, G1–G6), §5, §9 and §11.

**Being built from 24 Sep 2026.** Owners: Vukosi (native, sensing, signing, release build) and Mutarisi (UI; APK backup). It is a new React Native 0.74.5 project, with predecessor files ported **one at a time** and reviewed (RULES.md).

Rules that bind this folder:
- Map YAMNet classes by label, and assert the input shape.
- The model is fetched by `scripts/fetch_models.py` with a sha256 check and never committed.
- Salts and nonces come from native `SecureRandom`.
- No `CAMERA`, `SEND_SMS`, background-location or boot-receiver permissions.
- The duress path is pixel-identical to the normal one (test T15).

## Build a signed release APK (D1)

The React Native 0.74.5 shell is in this folder. Android only; it has no product code yet. It exists so the signed-release path works before any feature does (spec §14).

**The release key never enters the repo.** Gradle reads it from `~/.gradle/gradle.properties` or from environment variables:

```
VUKA_UPLOAD_STORE_FILE=C:/Users/<you>/.vuka/vigil-upload.jks
VUKA_UPLOAD_KEY_ALIAS=vigil-upload
VUKA_UPLOAD_STORE_PASSWORD=…
VUKA_UPLOAD_KEY_PASSWORD=…
```

A release task with no key configured **fails**; it never falls back to the public debug key. Debug builds are unaffected.

```bash
cd app && npm ci
cd android && ./gradlew assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`. Record its SHA-256 and the signing certificate fingerprint (`apksigner verify --print-certs`) in the release notes. T20 needs the digest.

## Firebase Android configuration for guardian push (G3)

Register Android package `com.teamsonar.vuka` in the team's Firebase project.
Place its `google-services.json` at `app/android/app/google-services.json`
(relative to the repository root). The file is ignored by Git; each local or
CI build needs it supplied separately by the app/release owner. Do not put a
service-account JSON or server credentials in the app.

The Gradle files include Firebase Messaging. They apply the Google Services
plug-in only when this config file exists, so the public APK build does not
require it at Gradle configuration time but **has no configured guardian push**.
Both build paths still need an actual Gradle run. From `app/android`,
with the config present, sync Gradle in Android Studio or run
`./gradlew :app:processDebugGoogleServices` after `npm ci` in `app/`.
This checks configuration processing, not device receipt. Token capture,
guardian-authorised registration, notification handling, Android 13+ runtime
permission and visible delivery still need implementation and a device test.

The **release owner** (Vukosi; backup Mutarisi) holds the upload key and publishes the GitHub Release with its QR code. Whoever holds the key must keep it: an installed APK only updates from an APK signed with the same key.
