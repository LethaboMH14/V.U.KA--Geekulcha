# Packet P1a: React Native 0.74.5 scaffold, first build, first install

**PROPOSED packet, prepared 24 Sep 2026 (Thursday) by the Claude Code assistant (`claude-sonnet-5`) at Vukosi's request.** Not yet accepted by Vukosi, no human approval. Part of work-order item 1 / **P3.V1** (issued target Thu 24 morning). The deadline is the work order's, not a new commitment. It is also the critical path for **D1** (signed release APK, Thu 24 22:00): nothing else can start until an app builds and installs.

## 1 · Criterion and trust answer

**T** and **S**. *Would a real user trust this?* Only a build that installs and starts, and whose manifest asks for nothing the judge build doesn't need, can carry the rest of the product. The RN template ships two traps that would quietly break the honesty rules: a **release build signed with the debug key**, and **debug-only permissions and cleartext traffic** leaking into release. This packet closes both before any feature is built on top.

Four gates: **fraud:** not applicable, no feature. **Budget phone:** the device check runs on the Samsung SM-A736B (Android 16, API 36, 5.2 GB RAM), which is **not** a budget device. It proves the build installs, not budget-phone behaviour. **Economics:** none. **Privacy:** no audio, keys or personal data; the debug keystore is not committed.

## 2 · Pins

| Pin | Value |
|---|---|
| Spec | `docs/VUKA-2-SPEC.md` §11 (judge-build permissions), V1/V2/V10, D1 at `origin/main` `41a8877` |
| Base | `BASE_SHA` = the local commit on `docs/vukosi-vigil-workflow` that Vukosi gives in the prompt (main plus the workflow docs plus this TASK, so **this TASK is inside the checkout**). It may be **local only, not pushed**; verify with `git cat-file -t <sha>` and `git ls-tree -r <sha> --name-only | grep p1a-rn-scaffold/TASK.md`. Stacked on an unmerged docs branch; rebase later |
| Worktree | **`C:\v\p1a`** (short path on purpose), branch `feat/vukosi-p3v1-scaffold`. Long paths are enabled on this machine, but keep the short path anyway (CMake/Ninja have their own limits) |
| RN | **exactly 0.74.5**, no `^` or `~`, never upgraded silently (work order) |
| CLI | `@react-native-community/cli@13.6.9` (latest 13.x on npm at prep time), pinned in the init command. Record the **exact** command that succeeded |
| Toolchain (found, not assumed) | Node v24.19.0, npm 11.17.0 (RN 0.74.5 declares `node >=18`), JDK 17.0.19, Android SDK: platform 34, build-tools 34.0.0, NDK 26.1.10909125, CMake 3.22.1, cmdline-tools. `ANDROID_HOME` and `JAVA_HOME` are set for the user. Open a **new** terminal to pick them up |
| Device | Samsung SM-A736B, serial `RZCTB0KRYSX`, Android 16 / API 36, USB debugging authorised. Physical access is Vukosi's: the executor cannot unlock the phone |
| Dependencies | None on contract v2, `shared/`, R1–R3 or the model. Independent |

## 3 · Objective and non-goals

A fresh React Native 0.74.5 app in `app/` that **builds** (`assembleDebug`, `assembleRelease`), **installs** on the Samsung, **starts**, and whose **release merged manifest** passes a forbidden-permission and cleartext check that is written first.

**Non-goals.** No Kotlin port (SensingService, AudioModule, PinModule): those are packet P1b and need Vukosi's predecessor-file access, which is **unconfirmed**. No YAMNet, model, signer, queue, heartbeat, journey or UI work. No UI libraries (NativeWind, Reanimated, Reusables): Mutarisi's (P3.U1). No CI change (P3.V5). No signed release, keystore, Play or upload. No new architecture toggle or Hermes change from the template defaults. No edits to `.gitignore`, contracts, root `package.json`, `test/` or any other owner's file.

## 4 · Allowed files

- `app/**` (new project files), **except** keep `app/README.md` unchanged and keep the `app/src/{api,brain,evidence,sensors,ui}/.gitkeep` placeholders
- `app/scripts/check-manifest.mjs` and `app/scripts/check-manifest.test.mjs` (the oracle)
- `docs/workflows/vukosi/p1a-rn-scaffold/IMPLEMENTATION.md`
- `team/vukosi.md`: running-log line only
- `docs/build-log/entries/2026-09-24-codex-p1a-rn-scaffold.md` (actual date)

**Placeholder reconciliation (review C3):** the repo has `app/android/assets/models/.gitkeep`, `app/android/modules/.gitkeep` and `app/android/service/.gitkeep`, which collide with the generated `android/` layout. Remove exactly those three files and record it. The model folder becomes `app/android/app/src/main/assets/models/`, which `*.tflite` in the root `.gitignore` already covers. Do not add a `.gitkeep` under it.

**Coordination (record it, do not wait on it):** Mutarisi's work order also adds dependencies to `app/`. This packet claims `app/package.json`, `app/package-lock.json` and `app/android/**` for the scaffold commit only. Add the claim line to `team/vukosi.md`, and note in IMPLEMENTATION.md that Mutarisi builds on top of the scaffold commit. Ask him nothing on chat.

## 5 · Decisions, defaults, and what to leave open

| Item | Default for this packet | Owner to confirm |
|---|---|---|
| `applicationId` / package | `app.vuka.vigil` (**PROPOSED**). A release keystore alias and Keystore key names will be tied to it later, so changing it is costly | Vukosi: say so in chat if you want a different id before Codex starts |
| App name shown | `VUKA` | Lethabo/Mutarisi later |
| Package manager | npm (template default), `package-lock.json` committed | none |
| `minSdk` | template default, **record the value**. Do not lower it | Vukosi to compare with the spec's budget phones |
| Debug keystore | **Do not commit** (`*.keystore` is gitignored on purpose, and the work order forbids committing keystores). The template's `signingConfigs.debug` points at a missing `app/debug.keystore`. Remove that explicit config so Android Gradle Plugin uses its default `~/.android/debug.keystore`, and record the change | none |
| Release signing | **Unsigned.** The template signs `release` with the debug key. Remove `signingConfig signingConfigs.debug` from the `release` build type. A debug-signed "release" APK must never exist in any output | Vukosi/leads for the real key (D1, packet P4) |

## 6 · Acceptance oracle: write the check first, run it red, then build

**Step 1, before any project exists.** Write `app/scripts/check-manifest.mjs` (Node ESM, no dependencies) and `app/scripts/check-manifest.test.mjs` (`node --test`, `sim_` fixtures only). The script reads an **Android merged manifest XML** path and exits 0 or 2:

| # | Fixture case | Expected |
|---|---|---|
| M1 | permissions exactly `INTERNET` | exit 0 |
| M2 | adds `CAMERA` | exit 2, names it |
| M3 | adds `SEND_SMS` / `ACCESS_BACKGROUND_LOCATION` / `RECEIVE_BOOT_COMPLETED` (one case each) | exit 2, names it |
| M4 | adds `SYSTEM_ALERT_WINDOW` | exit 2 (debug-only dev-menu permission must not reach release) |
| M5 | `android:usesCleartextTraffic="true"` on `<application>` | exit 2 |
| M6 | a `<receiver>` with an intent-filter for `BOOT_COMPLETED` | exit 2 |
| M7 | `<uses-permission-sdk-23>` or a `<uses-permission android:name=...>` written with attribute order or whitespace variations, and a forbidden permission written that way | still detected |
| M8 | missing file / not XML / no `<manifest>` | exit 2 (not 0) |
| M9 | an **allowed-list mode**: any permission outside the set `{INTERNET}` at this stage | exit 2 |

The allowed set for **this packet** is `{INTERNET}` (the scaffold adds nothing else). The full judge-build set in §11 arrives with the packets that need each permission. Run the tests **red first** (no script yet), keep that output, then make them pass.

**Step 2, the build, in `C:\v\p1a`:**

| # | Check | Expected |
|---|---|---|
| B1 | `react-native` in `app/package.json` and `app/package-lock.json` | exactly `0.74.5` |
| B2 | `cd app/android; .\gradlew.bat :app:assembleDebug` | exit 0; record APK path and `sha256sum` |
| B3 | `.\gradlew.bat :app:assembleRelease` | exit 0; APK is **unsigned** (`apksigner verify` fails or `build-tools\34.0.0\apksigner.bat verify --print-certs` shows no signer). If a signer appears, it is debug-signed: **fail** |
| B4 | run `check-manifest.mjs` on the **release** merged manifest (`app/android/app/build/intermediates/merged_manifests/release*/**/AndroidManifest.xml` or `processReleaseMainManifest` output; record the exact path) | exit 0 |
| B5 | run it on the **debug** merged manifest | **informational only**: record which extra permissions debug adds (expected: `SYSTEM_ALERT_WINDOW`, cleartext for Metro). Debug must never be described as the judge build |
| B6 | no build output, `node_modules`, `local.properties`, keystore, `.jks`, `.tflite`, `.csv` staged (`git status --short`, `git ls-files`) | none; `research/results/anchor-scale-scenarios.csv` is inherited, say so |

**Step 3, device (Vukosi's phone; status may be NOT RUN):**

| # | Check | Expected |
|---|---|---|
| D1 | `adb devices -l` | `RZCTB0KRYSX  device` |
| D2 | with Metro running and `adb reverse tcp:8081 tcp:8081`, `adb install -r` the debug APK, then `adb shell am start -n app.vuka.vigil/.MainActivity` | app process exists (`adb shell pidof app.vuka.vigil`) and `adb logcat -d -t 300` has no `FATAL EXCEPTION` for the package |
| D3 | `adb exec-out screencap -p` saved **outside the repo** | not committed |

If the phone is not connected or is locked, mark D1–D3 **NOT RUN** with the reason. Do not treat B2 as a device pass. Building is not installing.

**Repository checks:** `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `node --test "test/**/*.test.mjs"`, `gitleaks dir --redact --config .gitleaks.toml .` (binary at `C:\Users\khoza\Desktop\Geekulture\.tools\gitleaks.exe`; the repo pre-commit hook needs it on `PATH`), `git diff --check`. Run `cd app; npm ci` from the lockfile once to prove it reproduces.

## 7 · Commands (PROPOSED; record actual commands and full output)

```powershell
git -C C:/Users/khoza/Desktop/Geekulture-vukosi-workflow worktree add C:/v/p1a -b feat/vukosi-p3v1-scaffold <BASE_SHA>
cd C:/v/p1a
# oracle first (section 6, Step 1):
node --test app/scripts/check-manifest.test.mjs          # must FAIL first, then pass
# scaffold into a temp dir OUTSIDE the repo, then copy the files in, so app/README.md and placeholders are preserved:
npx @react-native-community/cli@13.6.9 init VukaApp --version 0.74.5 --skip-git-init --directory C:/v/scaffold-tmp
# copy into app/ per section 4; set applicationId; fix the two signing traps (section 5)
cd app; npm ci
cd android; .\gradlew.bat :app:assembleDebug ; .\gradlew.bat :app:assembleRelease
```

Record the exact `init` command that worked, including any flag changes.

## 8 · Rollback, evidence, review

- Rollback: `git worktree remove --force C:/v/p1a; git branch -D feat/vukosi-p3v1-scaffold`. Nothing shared changes, nothing is published, `~/.android` and Gradle caches are outside the repo.
- IMPLEMENTATION.md records: executor and **actual model name**, BASE_SHA and HEAD_SHA, oracle red and green runs, every B/D result as PASS / FAIL / NOT RUN, versions actually used (`node`, `npm`, `java`, Gradle wrapper, AGP, `minSdk`, `targetSdk`, `compileSdk`), the merged-manifest paths and the permission list found, and deviations. Pasted outputs, not summaries.
- Commit locally as a new commit (no amend). No push, PR, comment or release.
- **Claude review:** exact HEAD in a separate checkout, re-run `npm ci`, the oracle tests, both Gradle builds and the manifest check on my own; read `build.gradle` for the two signing traps. AI review is not Lethabo's review.
- Downstream: packet **P1b** (file-by-file port of SensingService/AudioModule/PinModule, needs Vukosi's predecessor-file access and the four known defect fixes); Mutarisi's UI foundation; packet **P4** (signed release APK, signing custodian, cold install, T17, T20).

## 9 · Executor prompt

Suggested model: **GPT-6 Sol, high** (native integration). Record whichever model actually runs.

```text
I am Vukosi Khoza. Implement ONLY docs/workflows/vukosi/p1a-rn-scaffold/TASK.md.
Create the worktree C:/v/p1a on branch feat/vukosi-p3v1-scaffold from the BASE_SHA I give you in chat (a local commit on docs/vukosi-vigil-workflow) so the TASK is in your checkout. Read docs/MASTER-CONTEXT.md, AGENTS.md, RULES.md, team/vukosi.md and the TASK in full first. Never edit C:/Users/khoza/Desktop/Geekulture-vukosi-workflow, C:/Users/khoza/Desktop/Geekulture, ../Geekulture-vukosi-p2a or ../Geekulture-vukosi-p7a.
Open a NEW terminal so ANDROID_HOME, JAVA_HOME and PATH are picked up; the toolchain is already installed (Node 24, JDK 17, Android SDK, NDK 26.1, CMake 3.22.1). Do not install or upgrade anything without asking me in chat.
Touch only TASK section 4 files. Write the section 6 Step 1 manifest checker and its tests FIRST, run them red, keep the output, then make them pass. Then scaffold React Native EXACTLY 0.74.5 (no ^ or ~), never upgrade it, using the pinned CLI in the TASK; scaffold in a temp dir outside the repo and copy files in so app/README.md and the src .gitkeep placeholders survive.
Fix the two signing traps: no committed keystore, and the release build must NOT be signed with the debug key (leave it unsigned). Do not commit node_modules, build output, local.properties, keystores, model files or CSVs. Keep the applicationId app.vuka.vigil unless I say otherwise in chat. Do not add any permission except what the template already gives INTERNET; do not port any Kotlin, add UI libraries, touch CI, contracts, .gitignore or the root package.json.
Run every check in section 6. The device checks need my phone (serial RZCTB0KRYSX) connected and unlocked: run them if it is, otherwise report D1-D3 as NOT RUN with the reason. Report each check as PASS, FAIL or NOT RUN. Building is not installing. Record actual commands, outputs, your tool and model name, BASE_SHA and HEAD_SHA in IMPLEMENTATION.md, add the running-log line and a new build-log entry, commit locally, and stop. No push, PR, comment or release.
```
