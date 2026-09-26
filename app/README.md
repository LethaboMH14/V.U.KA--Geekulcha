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

The **release owner** (Vukosi; backup Mutarisi) holds the upload key and publishes the GitHub Release with its QR code. Whoever holds the key must keep it: an installed APK only updates from an APK signed with the same key.

## Run the demo: server, emulator, download link and QR

Installed apps find their server through `server.json` on the `vigil-demo` release (`DISCOVERY_URL` in `src/api/device.ts`). Release builds are HTTPS-only, so phones reach a laptop server through a Cloudflare quick tunnel, not an open port. No firewall rule is needed.

1. **Server (port 8000).** Check out the server branch (PR #99, `feat/lethabo-guardian-delivery`), set up `.env` as in `server/README.md`, then run two terminals:
   `uvicorn server.main:app --host 127.0.0.1 --port 8000` and `python -m server.run_workers`.
   Without the second process, no alert, deadline or bank signal ever fires.
2. **Tunnel.** `cloudflared tunnel --url http://localhost:8000` prints `https://<name>.trycloudflare.com`.
3. **Point every app at it.** `node scripts/publish-server.mjs https://<name>.trycloudflare.com`. The script refuses anything that isn't https or doesn't answer `/healthz` with 200. Apps pick up the new address by themselves within a minute of losing the old one.
   For Azure instead: `node scripts/publish-server.mjs https://vuka-anchor-server.azurewebsites.net --note "Azure"`. Do this once Sibusiso confirms the deployed commit has #99's routes (guardian alerts and location). Moving a member to a different server re-registers them there and parks their old queue on the phone.
4. **Emulator.** A test build talks to the laptop directly over `http://10.0.2.2:8000`:
   `cd android && ./gradlew installRelease -PreactNativeArchitectures=x86_64 -PvigilTestFeed=true`.
   Then run the checks below.
5. **Build and publish the phone APK.** `cd android && ./gradlew assembleRelease`, signed with the team key (see above). Then `cd .. && node scripts/publish-apk.mjs`. The asset keeps the name `VIGIL.apk`, so the link and the QR code stay valid. Put the printed sha256 in the release notes.
   - Download link: https://github.com/LethaboMH14/V.U.KA--Geekulcha/releases/download/vigil-demo/VIGIL.apk
   - QR: `VIGIL-download-qr.png` on the release (it decodes to the link above)
   - Release page: https://github.com/LethaboMH14/V.U.KA--Geekulcha/releases/tag/vigil-demo

**Member checks on the emulator:**
- sign-up, all 8 steps;
- "First entry: received";
- start listening;
- hold for help, then answer with the normal PIN, then with the second PIN;
- End journey;
- My record.

## Firebase: guardian push and Google sign-in

Firebase is **off** unless `android/app/google-services.json` is present. That file is gitignored; never commit it. Without it, VIGIL builds and runs as before: guardians get alerts while the app is open, and Google sign-in shows as SIMULATED.

**One-time setup in the team's Firebase project** (the one whose ID is in the server's `FCM_PROJECT_ID`):
1. **Add an Android app** with package name `com.teamsonar.vuka`.
2. **Add the signing-certificate fingerprints.** These are public, not secrets:
   - Release (Team SONAR upload key): SHA-1 `B0:80:8B:9B:B9:61:CB:A9:04:D4:81:5D:2A:E7:03:56:29:AF:06:32`, SHA-256 `DD:FB:F9:16:77:9C:40:4C:03:70:33:F9:AE:30:F0:57:CB:4F:03:24:2A:26:BA:CD:66:AC:8E:E4:06:60:E6:2D`
   - Debug (`android/app/debug.keystore`): SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, SHA-256 `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
3. **Turn on sign-in:** Authentication → Sign-in method → enable **Google**.
4. **Download `google-services.json`** into `android/app/`, then rebuild. The file must be downloaded *after* step 3, so that it contains the web OAuth client Google sign-in needs.
5. **Server:** `FCM_PROJECT_ID` and a fresh `FCM_ACCESS_TOKEN` must be set on the ANCHOR server. The token lasts about an hour, so refresh it before a demo.

**What changes with it:**
- **Push:** a guardian's phone registers its push token with the server (`PUT /v1/guardians/{id}/token`), and alerts then arrive even with the app closed. Checking inside the app stays on as the fallback.
- **Google sign-in:** "Continue with Google" and "Sign in with Google" use a real Google account, and Google and Firebase Authentication receive the sign-in. VIGIL's own server never receives the email, and it never enters the record. Identity is still the key on the phone.
