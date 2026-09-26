# Thu 22:00 Runbook -- S1 PENTEST Runs (PT-50, PT-51)

---

## PT-50: Release APK Cold-Install + Keystore Verification

**Objective:** Verify signed release APK installs on clean phone; no debug keys in keystore.

### Prerequisites
- Release APK at app/build/outputs/apk/release/app-release.apk
- Release keystore path known (not debug.keystore)
- Test device: factory reset or clean phone, USB debugging on
- adb in PATH

### Procedure
`ash
# 1. Verify device connection
adb devices
# Should show device serial

# 2. Install release APK
adb install -r app/build/outputs/apk/release/*.apk
# Expected: Success

# 3. Verify no debug keys in release keystore
keytool -list -keystore <RELEASE_KEYSTORE_PATH> -storepass <STOREPASS>
# Expected: Only release alias, NO debug alias

# 4. Verify app launches
adb shell monkey -p com.teamsonar.vuka -c android.intent.category.LAUNCHER 1
# Expected: App opens without crash
`

### Pass Criteria
- [ ] APK installs without error
- [ ] Keystore shows only release alias (no debug keys)
- [ ] App launches on clean device
- [ ] No debug.keystore used

### Evidence to Record in PENTEST-RESULTS.md
- Commit hash: git rev-parse HEAD
- Date/time: date -u +%Y-%m-%dT%H:%M:%SZ
- Tester: Ipeleng Constance Modise
- Result: PASS / FAIL
- Evidence: keystore output screenshot, adb install log

---