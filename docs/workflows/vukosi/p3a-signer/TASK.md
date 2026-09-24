# Packet P3a: native Keystore signer and secure randomness (P3.V3, signer half)

**PROPOSED packet, prepared 24 Sep 2026 by the Claude Code assistant (`claude-sonnet-5`) at Vukosi's request.** Not yet accepted by Vukosi, no human approval. Work order item 5 / **P3.V3** (issued target Thu 24) and the **T03 fixture** hand-off to Ipeleng (with D1). Tests T18 and the phone half of T03. The queue and heartbeat half of P3.V3 is a separate packet and is **blocked** on contract v2 (review C5–C8) and the offline-retry decision (R1).

## 1 · Criterion and trust answer

**T** and **S**. *Would a real user trust this?* Their evidence is only as good as the key that signs it and the salts that hide it. The key must never leave the phone's hardware-backed store, the salts must come from the operating system's secure random source and never from JavaScript (Hermes has no `crypto.getRandomValues`), and the app must say honestly what level of hardware protection it actually got. **A signature proves that a key was used, not that a microphone heard a real event** (spec §17).

Four gates: **fraud:** a stolen phone can sign: out of scope here, PIN authority is P3.L8 work. **Budget phone:** the device runs on the Samsung SM-A736B; StrongBox and older-Android behaviour are **recorded, not assumed**. **Economics:** none. **Privacy:** no attestation chain, serial or identifier is published; the fixture holds a public key, a synthetic message and a signature only.

## 2 · Pins

| Pin | Value |
|---|---|
| Spec | `docs/VUKA-2-SPEC.md` V7, §4 (signed statement), §5 rules 5 and 7, T03, T18, §11 at `origin/main` `bc698dc` |
| Base | the **P1a head after its fixes** (Vukosi gives the SHA in chat). New worktree `C:\v\p3a`, branch `feat/vukosi-p3v3-signer`. Stacked on unmerged branches; rebase later |
| Stack | RN 0.74.5, Kotlin 1.9.22, `minSdk` 23, `compileSdk`/`targetSdk` 34, `applicationId` `app.vuka.vigil` |
| Device | Samsung SM-A736B, serial `RZCTB0KRYSX`, Android 16 / API 36. **Vukosi must keep it plugged in and unlocked** for the on-device tests |
| Dependencies | **None on contract v2, `shared/` (PR #58, open) or R1–R3.** The signer takes bytes in and returns a signature. It does not build, canonicalise or send anything |

## 3 · Objective and non-goals

A React Native native module `VukaSigner` that:
1. creates and holds one **P-256 signing key** in Android Keystore (StrongBox where present, otherwise the TEE, reported honestly);
2. returns its **SPKI public key**;
3. **signs bytes handed to it** and returns a **DER** signature (`SHA256withECDSA`);
4. returns **secure random bytes** from native `SecureRandom`;
5. exports the key-attestation chain **locally**, labelled `stored_unverified`;

plus a golden **T03 fixture** captured from the phone, and machine-checkable oracles for all of it.

**Non-goals.** No canonicalisation in Kotlin (spec §5 rule 5: there is one JS implementation, in `shared/`). No building of events, no `shared/` code, no network, no queue, no heartbeat, no PIN, no Argon2, no UI, no registration flow, no server challenge. No attestation **verification** and no claim of "genuine device". No permission added. No new architecture or template dependency other than the dev-only test dependencies named below. No edit to `.gitignore`, contracts, root `package.json`, `test/`, `shared/` or another owner's file.

## 4 · Allowed files

- `app/android/app/src/main/java/app/vuka/vigil/signer/*.kt` (new: `VukaSignerModule.kt`, `VukaSignerPackage.kt`, and a small `SignerCore.kt` only if it keeps Keystore code testable)
- `app/android/app/src/main/java/app/vuka/vigil/MainApplication.kt` (register the package, nothing else)
- `app/android/app/src/androidTest/java/app/vuka/vigil/signer/*.kt` (device tests)
- `app/android/app/build.gradle` (add `testInstrumentationRunner` and **dev-only** `androidTestImplementation` dependencies; nothing in `implementation`)
- `app/src/evidence/signer.ts` (typed wrapper, no logic beyond validation and base64)
- `app/scripts/verify-t03-fixture.mjs`, `app/scripts/verify-t03-fixture.test.mjs`, `app/scripts/check-no-weak-random.mjs`, `app/scripts/check-no-weak-random.test.mjs`
- `docs/workflows/vukosi/p3a-signer/IMPLEMENTATION.md`, `docs/workflows/vukosi/p3a-signer/fixtures/t03-keystore.json`
- `team/vukosi.md` (running-log line only); `docs/build-log/entries/2026-09-24-codex-p3a-signer.md` (actual date)

Anything else means stop and record it as a blocker. Claim these paths in the running-log line. Mutarisi works in `app/` too: touch none of his files.

## 5 · Interface (PROPOSED; our own module, not a contract)

Native module `VukaSigner`. Every method returns a Promise; bytes are **base64** strings.

```text
ensureKey() -> { created: boolean, spki_b64: string, security_level: "strongbox"|"tee"|"software"|"unknown",
                 attestation: "present"|"unsupported"|"failed" }
    Alias "vuka_device_v1". EC secp256r1, purpose SIGN only, digest SHA-256, non-exportable, no user-auth binding.
    If FEATURE_STRONGBOX_KEYSTORE is present, try StrongBox; on StrongBoxUnavailableException fall back to the TEE and
    say so. Report the ACTUAL level from KeyInfo (securityLevel on API 31+, isInsideSecureHardware below), never the
    requested one. A second call returns the same SPKI with created=false. It never overwrites an existing key.
publicKey() -> spki_b64                       rejects E_NO_KEY if ensureKey never ran
sign(message_b64) -> sig_der_b64              SHA256withECDSA over the exact decoded bytes; rejects E_NO_KEY,
                                              E_BAD_INPUT (not base64, or empty), E_SIGN_FAILED
attestationChain() -> string[] (base64 DER certs, leaf first)   [] with attestation "unsupported" on API < 24
randomBytes(n) -> b64                         1 <= n <= 1024 from java.security.SecureRandom; else E_BAD_INPUT
```

There is **no** JS-exposed way to delete or export the private key. The device tests may delete only their own **test alias** `vuka_t03_fixture` through the Keystore API directly. They never touch `vuka_device_v1`.

The TypeScript wrapper `app/src/evidence/signer.ts` only validates arguments, converts `Uint8Array` ↔ base64, and types the results. It contains no cryptography and no random source.

## 6 · The T03 message (exact bytes, so the fixture can be cross-checked)

The fixture signs the UTF-8 bytes of this compact string, which is the canonical form of a synthetic §4 statement (keys sorted, no spaces, ASCII, integers only). **All values are `sim_`/zero placeholders, not real identifiers.**

```text
{"action":"device_event","actor_id":"sim_actor_0001","commitment":"0000000000000000000000000000000000000000000000000000000000000000","counter":1,"domain":"vuka.event.v2","event_id":"00000000-0000-4000-8000-000000000001","signer_key_id":"sim_key_0001","source_ts":"2026-09-24T12:00:00+02:00","subject_id":"sim_subject_0001","target_id":"sim_journey_0001","target_type":"journey"}
```

The Node oracle asserts the fixture's message bytes equal this string exactly. When PR #58 lands, Ipeleng cross-checks that her `canonical.js` produces the same bytes and that `derToRaw` accepts the signature. That is her step, not this packet's.

## 7 · Acceptance oracle: write the host-side checks first, run them red

### Step 1: host checks (Node, standard library only, `sim_` fixtures generated in the test)

`app/scripts/verify-t03-fixture.mjs <fixture.json>` exits 0 or 2. It verifies with `node:crypto` (`crypto.verify("sha256", message, { key: spkiDer, format: "der", type: "spki", dsaEncoding: "der" }, sig)`) **and** checks the DER itself (minimal, `r` and `s` at most 32 bytes after sign padding, no trailing bytes). Fixture shape: `{ schema: 1, kind: "sim_t03_keystore", message_utf8, message_hex, spki_b64, sig_der_hex, security_level, android_api }`. **No attestation chain, no serial, no device identifiers.**

| # | Case (tests generate their own key with `crypto.generateKeyPairSync("ec", {namedCurve:"P-256"})`) | Expected |
|---|---|---|
| H1 | correct message, key and DER signature | exit 0 |
| H2 | one byte of the message changed | exit 2 |
| H3 | one byte of the signature changed | exit 2 |
| H4 | different key's SPKI | exit 2 |
| H5 | signature with one extra trailing byte | exit 2 |
| H6 | non-minimal DER length, and a component with a redundant leading `0x00` | exit 2 |
| H7 | raw 64-byte `r‖s` supplied instead of DER | exit 2 |
| H8 | key on P-384 or an RSA SPKI | exit 2 |
| H9 | fixture carrying an `attestation`, `serial` or `imei` key, or any unknown key | exit 2 (privacy) |
| H10 | `message_hex` not matching `message_utf8`, or the message differing from the §6 literal | exit 2 |
| H11 | missing file, not JSON, wrong `schema` | exit 2, never 0 |

`app/scripts/check-no-weak-random.mjs <dir>...` fails (exit 2) on `Math.random`, `java.util.Random`, `ThreadLocalRandom`, `kotlin.random.Random` (or a bare `Random()`) in production code, and passes on `SecureRandom`. Cases: a clean file passes; each forbidden token fails and is named; the token inside a comment or a `*Test.kt` / `androidTest` file is allowed only for **test** paths; a missing directory exits 2. Run it over `app/src`, `app/index.js` and `app/android/app/src/main`. It is the T18 source-inspection half.

Run both test files **red first** (no script yet), keep the output, then make them pass.

### Step 2: build

`assembleDebug` and `assembleRelease` still succeed. The **release merged manifest** is unchanged by this packet (`node app/scripts/check-manifest.mjs <release manifest>` passes, same permissions as before). The signer adds **no** permission.

### Step 3: on-device tests (`androidTest`, run with the phone unlocked)

`cd app/android; .\gradlew.bat :app:connectedDebugAndroidTest` (or `adb shell am instrument`; record the exact command). Record every result as PASS / FAIL / NOT RUN.

| # | Case | Expected |
|---|---|---|
| S1 | `ensureKey` twice | second returns the same `spki_b64`, `created:false`. The private key is never returned by any method |
| S2 | parse the SPKI | EC, curve `secp256r1`, uncompressed 65-byte point |
| S3 | `sign(m)` then verify in-test with `java.security.Signature("SHA256withECDSA")` and the SPKI | verifies |
| S4 | verify the same signature against a one-byte-different message | does **not** verify |
| S5 | signature bytes | DER (`0x30` tag), minimal, `r` and `s` at most 32 bytes after sign padding, length at most 72 |
| S6 | `security_level` | one of the enum values **and equal to what `KeyInfo` reports**. Record the value. **Do not assert hardware-backed**: a `software` result is a finding to report, not a failure to hide |
| S7 | `attestationChain()` | non-empty on this device; the leaf certificate's public key equals `spki_b64`. Result labelled `stored_unverified`. **No chain validation is claimed** |
| S8 | `randomBytes(16)` called 1000 times | every result 16 bytes and **all 1000 distinct** (T18 uniqueness; this is not proof of a CSPRNG, and the report must say so) |
| S9 | `randomBytes(0)`, `(-1)`, `(1025)` | reject `E_BAD_INPUT` |
| S10 | `sign` with invalid base64 / empty input; `sign`/`publicKey` before `ensureKey` on a **fresh test alias path** | reject with the named codes, no crash |
| S11 | `sign` is called from a background thread while the app is in the foreground | works (Keystore calls must not block the JS thread: report which thread the module uses) |
| S12 | **fixture capture** with the separate test alias `vuka_t03_fixture`: sign the §6 message, write `t03-keystore.json` to the app's external cache, delete the test alias, `adb pull` the file to `docs/workflows/vukosi/p3a-signer/fixtures/t03-keystore.json` | file passes `verify-t03-fixture.mjs` with exit 0 |

If the phone is not connected or is locked, mark S1–S12 **NOT RUN** with the reason. Host checks alone are not a device pass.

**Repository checks:** `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `node --test "test/**/*.test.mjs"`, Gitleaks (`C:\Users\khoza\Desktop\Geekulture\.tools\gitleaks.exe dir --redact --config .gitleaks.toml .`, on `PATH` for the pre-commit hook), `git diff --check`. No keystore, key material, model, CSV or build output tracked. The **private key is never in any file, log or report**. The fixture holds only the public key.

## 8 · Commands (PROPOSED; record actual commands and output)

```powershell
git -C C:/Users/khoza/Desktop/Geekulture-vukosi-workflow worktree add C:/v/p3a -b feat/vukosi-p3v3-signer <P1a-fixed-head-sha>
cd C:/v/p3a/app; npm ci
node --test scripts/verify-t03-fixture.test.mjs scripts/check-no-weak-random.test.mjs     # red first, then green
node scripts/check-no-weak-random.mjs src ../app/android/app/src/main index.js
cd android; .\gradlew.bat :app:assembleDebug ; .\gradlew.bat :app:assembleRelease
.\gradlew.bat :app:connectedDebugAndroidTest      # phone unlocked and plugged in
node ../scripts/verify-t03-fixture.mjs ../../docs/workflows/vukosi/p3a-signer/fixtures/t03-keystore.json
```

## 9 · Rollback, evidence, review

- Rollback: `git worktree remove --force C:/v/p3a; git branch -D feat/vukosi-p3v3-signer`. Nothing shared changes. The test key aliases live only on the phone: `vuka_t03_fixture` is deleted by the test, and `vuka_device_v1` can be removed by uninstalling the app.
- IMPLEMENTATION.md records: executor and **actual model name**, BASE_SHA and HEAD_SHA, the red and green host runs, every B/S result as PASS / FAIL / NOT RUN, the device's actual `security_level` and API, the exact APIs used for StrongBox and attestation (with the API level guards), test dependency versions, and deviations. Pasted outputs, not summaries.
- Commit locally as new commits. No push, PR, comment or release.
- **Claude review** of the exact HEAD in a separate checkout at `C:\v\rev`: re-run the host oracle and the device tests, read the Kotlin for key extractability, alias handling, error codes and threading, verify the fixture independently, and confirm the release manifest is unchanged. AI review is not Lethabo's review. Ipeleng's `derToRaw` cross-check (after #58 merges) is a **human** hand-off.
- Downstream: Ipeleng (T03 fixture); the queue/transport packet (needs contract v2); the arming and check-in packet (P4) that calls `sign`.

## 10 · Executor prompt

See the message that carries this packet. Suggested model: **GPT-6 Sol, high** (native Keystore integration). Record the model that actually runs.
