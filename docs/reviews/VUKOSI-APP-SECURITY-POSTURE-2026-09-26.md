# VIGIL app security posture (static review), 26 September 2026

**Author:** Claude Code assistant (`claude-sonnet-5`), at Vukosi Khoza's request. **AI review, not human approval.** Every finding is for the app owner (Lethabo), the security reviewer (Ipeleng) and the leads to confirm, edit or overrule. Nothing here is a penetration test.

**Criterion:** S (Security and Ethics), with T. **Trust question:** *would a real user trust this app with a moment of danger?*

**Handling:** this file lists exploitable weaknesses. The repository is private. Do not share it outside the team before the High findings are fixed.

## 1 · Scope, method and limits

| | |
|---|---|
| **Reviewed** | The app on PR #88, head `83bc2480ebacb90173d0106312a1d98536189a6a` (branch `feat/lethabo-vigil-events`), by reading source: `AndroidManifest.xml`, `build.gradle`, `net_release.xml`, `net_test.xml`, backup rules, `SignerModule.kt`, `PinModule.kt`, `QueueModule.kt`, `app/src/api/device.ts`, `events.ts`, `app/src/ui/screens.tsx`. Also the repo's `docs/security/SSDLC.md` and `THREAT-MODEL.md`. |
| **Also checked** | `npm audit` (25 Sep to 26 Sep, from the lockfile). The installed VIGIL 0.0.8 on two test phones: file size and sha256 match the published `VIGIL.apk`; not debuggable; declared permissions; the persistent notification title (read with `dumpsys`). |
| **Not done** | No dynamic testing, no traffic capture (T17h), no MobSF or DAST run, no fuzzing, no server penetration test, no review of `server/` beyond what other reviewers reported, no review of the PIN screens' UI logic beyond `device.ts`, no reverse engineering of the shipped APK's JavaScript bundle. |
| **Tags** | **FACT** = read in code or on a device. **PROPOSED** = a recommendation nobody has accepted. **ASSUMPTION** = stated where used. Severity is my judgement (Section 3), not a scored CVSS. |
| **Pinning** | Findings are true at the head above. #88 moves often; re-check before acting. |

## 2 · What already holds up (FACT)

| Area | Evidence |
|---|---|
| Device key | P-256 in Android Keystore, sign purpose only, non-exportable (`SignerModule.kt`). |
| PIN storage | Argon2id at OWASP parameters (19 MiB, 2 passes, 1 lane); both hashes always derived and compared in constant time; record sealed with a Keystore AES-GCM key; file in no-backup storage (`PinModule.kt`). |
| Event queue | Each event a separate file, AES-256-GCM with a Keystore key, in no-backup storage (`QueueModule.kt`). |
| Transport | Release build is HTTPS-only with system certificate authorities and cleartext off (`net_release.xml`). Plain HTTP exists only in a separate test config selected by `-PvigilTestFeed=true`. |
| Platform surface | `allowBackup=false`, backup and device-transfer rules exclude everything; only the launcher activity is exported; the sensing service is not exported; no WebView, deep links, receivers or providers. |
| Shipped build | Not debuggable (installed APK). |
| Telemetry | No analytics or crash SDK in `package.json`; no `console.*` or `Log.*` of app data in `app/src` or the Kotlin sources. |
| Dependencies | `npm audit`: one high advisory, `image-size` via Metro (build-time), tracked as waiver SCA-W1 (expires 2026-10-31). |

## 3 · Findings, by severity

| ID | Severity | Finding | Where (FACT) | OWASP | Suggested fix (PROPOSED) |
|---|---|---|---|---|---|
| **APP-V1** | **High** | **The app takes its server address from a mutable file on a GitHub release.** `discover()` fetches `server.json` from the `vigil-demo` release and accepts any string matching `https://host`; the app then replaces its server address unless the member pinned one (the default is unpinned), on load and at onboarding. The guardian-join path always uses discovery. Whoever can replace that release asset can move every install to a server they control. A server that never alerts, while the app still shows "Server reached", removes the product's purpose. Not in the threat model. | `device.ts:247–251`, `:271`, `:412`, `:540–553` | MASVS-NETWORK; Mobile Top 10 M5 and M8 | Do not auto-follow in release builds; or verify a signature over `server.json` with a key built into the app; restrict to an allowlisted domain; show the member when the address changes |
| **APP-V2** | **High to Medium** | **No throttle on PIN guesses for pause, end, export and add-guardian.** A wrong PIN returns "retry" with no counter, delay or lockout; only the Argon2 cost slows it. PINs may be 4 digits (4 to 8 allowed). The scenario this app exists for is someone holding the unlocked phone. Check-in entry is limited to 3 tries. | `device.ts:368`, `:380`, `:394`; `PinModule.kt` (`validPin`) | MASVS-AUTH; M3 | Exponential backoff and lockout in the native module; raise the minimum to 6 digits; record failed attempts as events the server and guardians can see |
| **APP-V3** | Medium | **No attestation and no real security level.** A software-only key or an emulator registers the same as a phone with a TEE. The threat model accepts fake-sensor signing (PH-1) but the level is not reported at all. (Same as my S1 and S2 comments on #88.) | `SignerModule.kt` | MASVS-RESILIENCE; M7 | Export the attestation chain, stored and labelled unverified; report `strongbox`, `tee` or `software` from `KeyInfo`; let the server weigh events by it |
| **APP-V4** | Medium | **The release is not shrunk or obfuscated,** and has no root, emulator or tamper signal. | `build.gradle:57` (`enableProguardInReleaseBuilds = false`) | MASVS-RESILIENCE; M7 | Enable R8 with the TFLite keep rules (already in the work order) |
| **APP-V5** | Medium | **The app is visible to whoever the member fears.** No screenshot or recents-thumbnail protection anywhere (`FLAG_SECURE` absent); the persistent notification title is "VUKA active"; the home screen says it is listening. Spec V2 asks for a neutral notification. | source search; `dumpsys notification` on a test phone | MASVS-PLATFORM, PRIVACY | Neutral notification text (leads' decision); `FLAG_SECURE` on My record, guardian and PIN screens |
| **APP-V6** | Medium | **Release provenance is thin.** The release notes say it is signed with "the project's development key" (`CN=Team SONAR VUKA`); upload-key custody was never answered; a debug keystore is still tracked in the app tree at this head; the release page publishes no signer fingerprint. | release notes; `git ls-files` | M2 (supply chain); MASVS-CODE | Sign with the upload key; publish its SHA-256 on the release page; merge the keystore removal (P5b) |
| **APP-V7** | Low | **PINs can be replaced without the old ones.** The native `setPins` overwrites both PINs with no check of the current ones; PIN strings also cross the JavaScript bridge and cannot be wiped. | `PinModule.kt` | MASVS-AUTH, STORAGE | Require the current PIN to change PINs |
| **APP-V8** | Low | **No certificate pinning.** System authorities only. Fine for a demo, but combined with APP-V1 nothing ties the app to one server identity. | `net_release.xml` | MASVS-NETWORK-2 | Pin the certificate or public key once the address is fixed |
| **APP-V9** | Low | **Test-only paths ship in the codebase** (cleartext config, test clip feed). Nothing I found asserts in CI that a release build excludes them. | `DetectionModule.kt:121`, `net_test.xml`, `build.gradle` | MASVS-CODE | CI check on the release merged manifest (`net_release`, no test feed) |
| **APP-V10** | Info | **Unverified claims and open SSDLC items.** "Audio never leaves the phone" has not been traffic-tested (T17h). Always-on listening departs from spec §17 ("journey mode, not always on") and needs a consent and purpose review (POPIA). #89's CI has two blocking semgrep findings. The repo-wide secret scan is red on a false positive in another branch. SCA-W1 still needs Ipeleng's disposition. | see PR threads | SSDLC gates | see Section 5 |

Server-side items reported by others and **not verified here:** the server-signing key format mismatch, scheduler and outbox workers not running, payload encryption stubbed for slice 2.

## 4 · OWASP MASVS scorecard (static evidence only)

| Category | Status | Notes |
|---|---|---|
| STORAGE | Strong | Sealed with Keystore keys, no backup |
| CRYPTO | Strong | Keystore, Argon2id, GCM, constant-time compare |
| AUTH | **Gap** | APP-V2, APP-V7 |
| NETWORK | **Gap** | APP-V1; APP-V8 low |
| PLATFORM | Good | APP-V5 for the coercion case |
| CODE | Partial | APP-V6, APP-V9 |
| RESILIENCE | **Gap** | APP-V3, APP-V4 |
| PRIVACY | Open | APP-V5, APP-V10 |

## 5 · Quick wins (PROPOSED, in order of value for effort)

| # | Do | Closes | Effort (ESTIMATE) | Suggested owner |
|---|---|---|---|---|
| 1 | Stop auto-following `server.json` in release builds, or pin the address | APP-V1 | small | Lethabo |
| 2 | Backoff and lockout on PIN entry; 6-digit minimum | APP-V2 | small to medium | Lethabo, Mutarisi (screens) |
| 3 | Run the T17h packet capture and record what leaves the phone | APP-V10 claim | small | Vukosi |
| 4 | Add APP-V1 and APP-V2 to `THREAT-MODEL.md` with tests | SSDLC gap | small | Ipeleng |
| 5 | Neutral notification text and `FLAG_SECURE` on sensitive screens | APP-V5 | small (needs a decision) | leads, Mutarisi |
| 6 | Enable R8 and add the CI check for the release manifest | APP-V4, APP-V9 | medium | Lethabo |
| 7 | Report the real security level and export the attestation chain | APP-V3 | medium | Vukosi (P3a/P3b design exists) |
| 8 | Sign releases with the upload key and publish its fingerprint | APP-V6 | depends on key custody | Lethabo, Vukosi |

## 6 · Protection from a TTP perspective

Adversaries are the ones the project already names (coercer, thief, insider, hostile network, compromised server, malware, fraud). Technique names come from MITRE ATT&CK for Mobile and are for orientation; verify the exact identifiers against the current matrix before they appear in a submission.

| Adversary and path | Technique (orientation) | Held today by | Gap | Add (PROPOSED) |
|---|---|---|---|---|
| **Coercer with the unlocked phone** | Input capture and guessing; impairing defenses (turning listening off) | Two PINs, duress PIN looks identical, constant-time check, pause is PIN-gated | APP-V2, APP-V5 | Backoff and lockout, attempt events, `FLAG_SECURE`, neutral notification |
| **Rogue or redirected server** | Adversary-in-the-middle; supply-chain compromise through the release asset | Request signing, per-subject chain, public anchors | APP-V1, APP-V8 | Signed or fixed server address, certificate pinning |
| **Insider or stolen repository token** | Supply-chain compromise (release asset, CI, signing key) | Secret scan, review rules | APP-V1, APP-V6 | Branch protection, signed releases with a published fingerprint, minimal token scopes |
| **Malware or a rooted phone** | Stored application data; input injection | Data sealed in Keystore, no backup | APP-V3, APP-V4 | Attestation, R8, a root signal sent to the server |
| **Fraudster faking sensor or duress events** | Data manipulation; masquerading (emulator) | Signed events, counters, replay protection | APP-V3 | Record the security level and weigh the bank signal by it |
| **Network observer** | Adversary-in-the-middle; traffic analysis | HTTPS-only, cleartext off | APP-V8 | Pinning; capture test of what heartbeats reveal |
| **Suppression attacker (silence the alert)** | Endpoint denial of service; impairing defenses | Server owns escalation; missing heartbeat is evidence | APP-V1; workers not running | Redundant delivery; alarm on an unexpected server change |

**Defence in depth.** *Prevent:* the fixes in Section 5. *Detect:* heartbeat loss, chain verification by a stranger, attempt events, an unexpected server change. *Respond:* key revocation, recovery with a freeze, the incident runbook (`SSDLC.md` §12).

## 7 · Improving the posture beyond the quick wins (PROPOSED)

1. **Make the release gate real (SSDLC §11).** Add pass/fail checks for: release manifest uses `net_release`, no test feed, not debuggable, R8 on, no tracked key material, signer fingerprint recorded.
2. **Run the mobile checks the SSDLC already names (§10).** MobSF and a MASVS pass on the release APK, results filed with method and version.
3. **Turn on a dynamic test.** T17h capture, then a proxy run of onboarding, heartbeat, a check-in and export, to prove what leaves the device.
4. **Threat-model the new behaviour.** Always-on listening, server discovery and PIN guessing are missing or thin in `THREAT-MODEL.md`; add rows with tests.
5. **Decide privacy on the always-on change.** A written consent and purpose statement, retention of the 3-second buffer, and the POPIA view, before it is shown to judges as a feature.
6. **Add a rooted-phone and emulator signal.** Not to block users, but so the server and guardians can see the confidence level.
7. **Rotate and protect the signing key.** Upload key with a custody record; release page shows the fingerprint; rebuild reproducibly where possible.
8. **Keep findings from going stale.** Re-run this review at each release candidate; record head SHAs.

## 8 · Not claimed

This review does not show the app is safe, that no other flaw exists, or that the server is secure. A signature shows that a key was used, not that a real event happened. "Attestation present" means a certificate extension exists, not a genuine device. No detection rate, latency or battery figure is stated or implied.
