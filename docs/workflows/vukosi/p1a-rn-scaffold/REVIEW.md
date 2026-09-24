# P1a review

**Reviewer:** Claude Code assistant (`claude-sonnet-5`). **Reviewed SHA:** `5624705deeb85902ac9b59772f45e36b2aa70007` (implementation `0a7cbcb3dbb3db77511875b2845633b62e2d6153`, base `b27e728`), in a separate detached checkout at `C:\v\rev`. AI review only. It is not Lethabo's review or human approval.

## Verdict: passes; two decisions and three notes for Vukosi. Not release-ready and not a demo build

Reproduced independently on this machine (Node v24.19.0, JDK 17.0.19, Gradle wrapper from the scaffold, Samsung SM-A736B on Android 16 / API 36):

| Check | Result |
|---|---|
| Oracle tests (`node --test app/scripts/check-manifest.test.mjs`) | 15/15 pass |
| B1 `react-native` pinned | `"0.74.5"` in `app/package.json`; lockfile and installed package both 0.74.5. `npm ci` from the lockfile: 925 packages |
| B2 `assembleDebug` | **PASS on rerun**, 47 s. APK 129,441,885 bytes, sha256 `7454458ae9c5c2bcb01e42539c95babec21340b9186a755cc83bd790aa4f56e1`. Signer is the standard Android debug key (informational). **The first attempt in my checkout failed** (exit 1, 6 min); its error text was lost to a trimmed log, so the cause is **unexplained**. The rerun with a full log passed. See N1 |
| B3 `assembleRelease` | PASS. `app-release-unsigned.apk` 53,093,708 bytes, sha256 `65a2ece1651eead779c4e30df0a2f2f48bb214625f185ea87b1cd41b297c681c`. `apksigner verify` reports **no signature** (`Missing META-INF/MANIFEST.MF`), so it is not debug-signed |
| B4 release manifest, checker in default mode | PASS: permissions `android.permission.INTERNET` and `app.vuka.vigil.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. None of CAMERA, SEND_SMS, ACCESS_BACKGROUND_LOCATION, RECEIVE_BOOT_COMPLETED, SYSTEM_ALERT_WINDOW. No cleartext. `allowBackup="false"` |
| B4 with `--allowlist` (Codex's command) | FAIL, reproduced exactly (see D1) |
| B5 debug manifest | reports `usesCleartextTraffic=true` and `SYSTEM_ALERT_WINDOW`, as expected for debug. Informational |
| B6 tracked files | no keystore, `.jks`, `.tflite`, build output, `local.properties` or `node_modules`. Only inherited `research/results/anchor-scale-scenarios.csv` |
| Source | release build type has no `signingConfig`; no `signingConfigs` block and no keystore in the repo; the three placeholder `.gitkeep` files removed as specified; the five `src/` placeholders and `app/README.md` kept; `applicationId` `app.vuka.vigil`; `minSdk` 23; `compileSdk`/`targetSdk` 34; build-tools 34.0.0; NDK 26.1.10909125 |
| **D1–D3 on the phone** | **PASS on the debug build (my own build)**. `adb devices` showed `RZCTB0KRYSX device`; `adb install -r` → `Success`; with Metro running and `adb reverse tcp:8081 tcp:8081`, `am start -n app.vuka.vigil/.MainActivity`; `pidof` returned a process; `topResumedActivity` was `app.vuka.vigil/.MainActivity`; no `FATAL EXCEPTION` or load error in `logcat`; `ReactNativeJS: Running "VukaApp"` was logged; screenshot (kept outside the repo) shows the React Native welcome screen |

## Decisions and notes

### D1 (decision, Vukosi/Lethabo): the strict allow-list rejects a harmless AndroidX permission
The merged release manifest declares and requests `app.vuka.vigil.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (`protectionLevel="signature"`), added by AndroidX Core. It is scoped to the app's own package and cannot be granted to other apps. My packet's M9 allow-list of exactly `{INTERNET}` was too tight, so this "FAIL" is a packet defect, not a scaffold defect. Codex correctly left it visible rather than widening the list silently. **Recommendation:** allow exactly `<applicationId>.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` for the package under check and nothing else, and add a test that a look-alike from another package is still rejected.

### D2 (decision, Vukosi): keep the generated `app/ios/` directory?
The scaffold committed a full iOS project (Podfile, Xcode project, tests). The product is an Android app (spec §1). It adds noise and dependencies for Mutarisi's work, and nothing builds it. **Recommendation:** remove it in a follow-up commit. Not blocking.

### N1 (unexplained first failure)
My first `assembleDebug` failed and I did not capture why. Codex reports it passed, and my rerun passed in 47 s. Possible causes are first-build dependency downloads or timing, but that is not established. Record it: if the Thursday release build fails once and then passes, that is not a green light.

### N2 (later packets, not defects)
`enableProguardInReleaseBuilds = false`, so R8 is off. D1's `-keep class org.tensorflow.** { *; }` rules and the release-signing custodian belong to packet P4. The scaffold does not remove either dependency.

### N3 (environment)
`npm ci` reported 14 advisories, not fixed and not upgraded, as instructed. Node 24 worked with RN 0.74.5. The phone dropped off USB once mid-test and Metro lost its `adb reverse` link; both were restored by replugging and re-running `adb reverse`. A debug build cannot run without Metro. It is not a demo build.

## Not verified
- A release build **installed on the phone** (only the debug build was). T17 (deny each permission) and T20 (cold install from a QR) are **NOT RUN**.
- Anything on a budget 2–3 GB phone. This phone has 5.2 GB.
- Signed-release behaviour, R8 and the model.
