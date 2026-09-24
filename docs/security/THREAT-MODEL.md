# VUKA threat model — VIGIL + ANCHOR (STRIDE plus coercion)

> **Owner:** Ipeleng Constance Modise. **Issued** 23 Sep 2026 by Lethabo (co-lead) as the starting model for P3.S3. **Status:** `PROPOSED` until Ipeleng accepts it. Supersedes the path `docs/THREAT-MODEL-VIGIL-ANCHOR.md` in `team/ipeleng.md`.
> **Serves:** S, T. Every threat maps to a spec control (`docs/VUKA-2-SPEC.md` IDs) and a test (T01–T24 from spec §15, T30–T49 new, defined in §6). Not legal advice.
> **Rule:** a threat with no test gets a recorded observation or "not measured". Nothing is marked mitigated because the spec says so; it is mitigated when its test passes.

---

## 1 · Assets

| ID | Asset | Why it matters |
|---|---|---|
| AS-1 | The fact that a duress PIN was entered | If a coercer learns it, the victim is in danger (S3) |
| AS-2 | Location attached to `signal_detected` (V9) | Points a guardian, police or an abuser to a person |
| AS-3 | Device, guardian and server signing keys | Forge events, forge roots, forge acknowledgements |
| AS-4 | The per-subject chain and its payloads and salts | The record the user asked us to keep (A1, P1) |
| AS-5 | Guardian set and FCM tokens | Who gets alerted; redirecting it silences the alarm |
| AS-6 | PIN, duress PIN, recovery code | Authority over every gated action (§9) |
| AS-7 | Hedera `submitKey` and the key manifest | Who may publish roots; what the verify page trusts |
| AS-8 | Bank risk signal | A money consequence for a person (ADR-0037) |
| AS-9 | Escalation deadlines and outbox | Whether anyone is alerted at all (§8) |
| AS-10 | Release APK and CI pipeline | A poisoned build owns every phone |

## 2 · Trust boundaries

```text
[Coercer]··(physical)··[Member phone: VIGIL]──TB1 HTTPS, signed requests──[ANCHOR server + PostgreSQL + workers]
                                                                             │            │            │
                                                          TB2 FCM / SMS ─────┘   TB3 HCS submit   TB5 signed POST
                                                                ▼                        ▼                ▼
                                                   [Guardian phone]              [Hedera testnet]    [sim_bank]
                                                        │ TB2' signed ack              │ TB4 mirror read
                                                        └──────► server               ▼
                                                                          [Stranger's browser: verify page]
[Developers]──TB6 git push / PR──[GitHub + CI]──TB7 release asset──[Member / guardian install]
```

| ID | Boundary | Crosses |
|---|---|---|
| TB0 | Person ↔ phone (physical) | A coercer may hold the unlocked phone or watch the screen |
| TB1 | Member phone ↔ server | Signed events, heartbeats, PIN authorisations, export |
| TB2 | Server ↔ guardian phone | FCM alert, SMS fallback; signed acks and token updates back |
| TB3 | Server ↔ Hedera HCS | 33-byte typed messages under the `submitKey` |
| TB4 | Browser ↔ mirror node and server | Public proof, mirror messages, the export file (local only) |
| TB5 | Server ↔ `sim_bank` (later, a real bank) | Signed risk signal with `Idempotency-Key` |
| TB6 | Developer ↔ repository and CI | Code, contracts, secrets hygiene |
| TB7 | Release ↔ installer | APK from GitHub Releases via QR (D1) |

## 3 · STRIDE per component

Columns: threat · spec control · test · residual. **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**enial of service, **E**levation of privilege.

### 3.1 Member phone (VIGIL)

| ID | S T R I D E | Threat | Control | Test | Residual |
|---|---|---|---|---|---|
| PH-1 | S | App or emulator signs fake `signal_detected` | V7 Keystore key; attestation stored | T03, T18 | **Accepted:** a signature proves a key was used, not a real sound (G32) |
| PH-2 | T | Event context altered after signing | §4 signed statement (B1) | T21 | — |
| PH-3 | R | Member later denies entering the normal PIN | device-signed `checkin_result`, anchored immediately (§10) | T04, T22 | Normal PIN = "normal code entered", not "safe" (duress doc S6) |
| PH-4 | I | Duress visible on screen, haptic or timing | V5, V8 | T15, T31 | Mic indicator visible (G24) |
| PH-5 | I | Queue, keys or payloads read from storage or backup | V8 encrypted queue; C-15 no backup | T42 | Rooted phone out of scope (C-110) |
| PH-6 | I | Raw audio written to disk | V3 labels only; RICA bright line | T41 | — |
| PH-7 | I | Location sent in heartbeats | V9 speed bucket only | T46, T41 | — |
| PH-8 | D | OEM kills the foreground service; reboot disarms | V2, V10, M5 | T17, M5 | Published, not fixed (G24) |
| PH-9 | D | Notification permission revoked → check-in never shown → false `no_answer` | V1 refuse to arm; V4 `opened` only after shown | T17 | — |
| PH-10 | E | Exported component or intent lets another app arm, answer or read | C-14 | T41 | — |
| PH-11 | E | JS-side salt or nonce predictable (Hermes) | V7 native `SecureRandom` | T18 | — |

### 3.2 ANCHOR server

| ID | S T R I D E | Threat | Control | Test | Residual |
|---|---|---|---|---|---|
| SV-1 | S | Request replayed or forged | §7 request signing, nonces, counters | T06 | Undelivered bytes replayed later → at most a late escalation (PR #43 review, finding 2) |
| SV-2 | S | Revoked key keeps signing after recovery; skew-exempt kinds bypass auth | §9 revocation; §7 exemption is skew only | T35 | — |
| SV-3 | T | Server rewrites a subject's history | per-subject chain; roots anchored; subject keeps export (A1, §4, §6, §10) | T04, T22 | Server can still **omit or fabricate server events** (B2) |
| SV-4 | T | Two outcomes for one check-in (race) | §8 row lock, first terminal outcome wins | T23 | — |
| SV-5 | R | Operator deletes or changes thresholds alone | two-signature rule, ADR-0036(8) | T48 | — |
| SV-6 | I | Subject A reads subject B's export (BOLA, API1) | A5 subject auth | T19, T49 | — |
| SV-7 | I | Public proof or panel leaks chain segments or kinds | A6; panel kinds only for `sim_` | T19 | — |
| SV-8 | I | Logs hold payloads, PINs, tokens, locations | C-38 | T46 | — |
| SV-9 | I | Response size or time differs for duress (network observer on the attacker's hotspot) | V5; C-41 | T31 | — |
| SV-10 | D | Crash loses the alert | §8 outbox, deadlines table | T07, T08 | Fallback: anchoring stubbed if T08 fails Fri 18:00 |
| SV-11 | D | Resource exhaustion on public endpoints (API4) | C-37 | T44 | Azure student tier limits `ASSUMPTION` (Sibusiso checks) |
| SV-12 | E | Device signature treated as PIN authority | §9 B5: fresh `pin_authorised` for that action and target | T12, T36 | — |
| SV-13 | E | Invite code brute-forced | G1: 6 digits, 5 attempts, 10 min, rate limits | T14 | — |

### 3.3 Guardian phone and delivery (FCM, SMS)

| ID | S T R I D E | Threat | Control | Test | Residual |
|---|---|---|---|---|---|
| GD-1 | S | Attacker re-points a guardian's FCM token to his device | G5 token updates signed by guardian key | T34 | — |
| GD-2 | S | Forged `stand_down` stops the bank signal | G5 guardian-key signature | T21 (guardian vectors), T34 | A guardian who lies becomes a co-accused (duress doc layer 2) |
| GD-3 | T | Duplicate or lost alert after a crash | outbox idempotency key; FCM collapse key (§8) | T08 | — |
| GD-4 | I | Alert text on a guardian's lock screen reveals location to a bystander | G3 visible notification; none yet — see §9 | none yet — see §9 | **Accepted** for the demo; revisit copy |
| GD-5 | I | Alerts readable by Google or the SMS gateway | TLS + at-rest only; none yet — see §9 | none yet — see §9 | **Open:** not end-to-end (G28) |
| GD-6 | D | Guardian phone offline; data off | SMS fallback (G3); M6 | none yet — see §9 | Delivery needs data (§17) |
| GD-7 | E | Abusive guardian keeps receiving alerts after removal | §9: 24 h delay, silent | T24 | 24 h exposure, stated in §9 |

### 3.4 Browser verify page

| ID | S T R I D E | Threat | Control | Test | Residual |
|---|---|---|---|---|---|
| VP-1 | S | Genuine receipt from another batch or topic accepted | §6 B2: decode message, compare root, pin network/topic/manifest | T22 | — |
| VP-2 | S | Forged server chain with a substituted key | pinned key manifest (§10) | T05 | — |
| VP-3 | T | Altered export passes | recompute hashes, links, signatures (§4, §6) | T04, T21 | — |
| VP-4 | I | Export uploaded to our server or a third party | C-50 no upload; CSP `connect-src` | T32 | — |
| VP-5 | E | Script injection from export strings | C-52 `textContent`; CSP | T33 | — |
| VP-6 | S | Archived mirror response presented as live | three states (§10) | T22 | Testnet resets (G31) |
| VP-7 | T | Page itself altered in transit or on host | HTTPS; SRI not needed (no third-party script); none yet — see §9 | none yet — see §9 | Host compromise out of scope |

### 3.5 Hedera (HCS and mirror)

| ID | S T R I D E | Threat | Control | Test | Residual |
|---|---|---|---|---|---|
| HD-1 | S | Third party posts roots to our topic | topic created with `submitKey` (ADR-0035) | T43 | `submitKey` theft = our server compromise |
| HD-2 | T | Root substituted in our receipt store | verify page reads the mirror, not our copy (§6) | T22 | — |
| HD-3 | I | Personal data on chain | only 33-byte typed messages (§10) | T19, code review | — |
| HD-4 | I | Anchor timing reveals duress | every PIN-gated outcome anchored; coalesced to 1 per 60 s (§10) | PT-29 (topic timing check) | Minute-level activity visible (§10) |
| HD-5 | D | Testnet reset or outage | epochs; archived state; recording fallback (§10) | none yet — see §9 | G31 |

### 3.6 `sim_bank` and the future bank

| ID | S T R I D E | Threat | Control | Test | Residual |
|---|---|---|---|---|---|
| BK-1 | S | Forged risk signal places a hold | ANCHOR-signed request (S1, §12) | T40 | — |
| BK-2 | T | Duplicate hold after retry | `Idempotency-Key` (§8) | T11, T40 | — |
| BK-3 | E | Detection alone triggers a hold | S1, ADR-0037 | T11 | — |
| BK-4 | R | Bank cannot tell a duress PIN from a timeout | S1 provenance (PR #43 S1) | T38 | Both are one principal (E1) |
| BK-5 | I | Bank's UI names duress during the event | ADR-0037(4) | none yet — see §9 | Real banks: partner contract (G30) |

### 3.7 Repository, CI and release

| ID | S T R I D E | Threat | Control | Test | Residual |
|---|---|---|---|---|---|
| CI-1 | I | Secret committed | gitleaks hook + CI (C-80–C-82) | `scripts/test-security.mjs` in the CI secret-scan job — no T/PT ID yet, see §9 | Detects patterns only (`SECURITY.md`) |
| CI-2 | T | Direct push to `main` with failing checks | review rules; CODEOWNERS; none yet — see §9 | none yet — see §9 | **Open:** no branch protection (G17) |
| CI-3 | T | Malicious or vulnerable dependency | lockfiles, SCA (C-70, C-71) | T45 | **Partial:** T45 covers known vulnerabilities (C-71) only. Nothing yet tests hash-pinned lockfile enforcement (C-70), the defence against a malicious package with no CVE — see §9 |
| CI-4 | T | Swapped model weights | sha256 manifest (C-73) | T41 digest check; PT-49 (swapped file refused) | — |
| CI-5 | S | APK replaced on the release page | APK sha256 published; signer cert recorded (D1) | T20, PT-50 | — |

## 4 · Coercion-specific threats

| ID | Threat | What the design does | Spec | Test | Residual, stated |
|---|---|---|---|---|---|
| TM-C1 | Attacker holds the unlocked phone and arms a journey, then ignores the check-in | Escalation proceeds; guardians can `stand_down` within 3 min before any bank signal | V1, S1, §8 | T07, T11 | **B3:** possession alone forces a `no_answer` escalation and can move guardians toward the recorded location |
| TM-C2 | Attacker forces the **normal** PIN | Records "normal code entered"; a normal PIN alone never closes an incident | §8 | T09 | Not "safe" (duress doc S6) |
| TM-C3 | Attacker watches the screen or network while the duress PIN is entered | Pixel, haptic, request and response parity; no device SMS | V5, S3 | T15, T31 | Mic indicator visible |
| TM-C4 | Attacker forces guardian changes, deletion or recovery | Duress PIN → convincing no-op, decoy guardian; normal PIN → removal delayed 24 h, never zero guardians | §9, ADR-0036 | T12, T16, T24 | **B1:** across two coerced sessions the attacker's own add becomes the "replacement". Fix: notify remaining guardians (T37) |
| TM-C5 | Abusive guardian | Only the member can create invites, with PIN; silent removal; location only at signal time | G1, §9 | T12, T24 | Lone-guardian case (PR #43 S2) |
| TM-C6 | Compromised or malicious server | Chain and roots let a stranger detect rewriting of what was anchored | §4, §6, §10 | T04, T05, T22 | **B2:** it can suppress or fabricate escalation. Independent witnesses are the guardian's own-key ack and the bank's own systems |
| TM-C7 | Staged fraud (accomplice screams, claim filed) | Anchor proves when, not what; history kept; bank hold blocks the payout | duress doc §3 | T11 | A real scream in a real room is accepted as a signal |
| TM-C8 | Forced recovery (code dictated under threat), then bulk export | Recovery notifies guardians, revokes the old key | §9 | T13, T35 | **PR #43 S4:** extend the 24 h freeze to export (T39) |
| TM-C9 | **Export during an open incident, from the held phone** | My Record hides incident events (V8), but `GET /v1/subjects/{id}/export` returns "genesis → head with payloads" (A5) to the device key. The payload of the current `checkin_result` contains `duress_pin`. Export is not in the §9 PIN table | A5, V8, S3 | **T30** | **Rule decided 24 Sep (ADR-0041): PIN-gated export, pre-incident hold** — open until T30 passes |
| TM-C10 | PIN guessing on the held phone | Not specified: no attempt limit or wrong-PIN behaviour at the check-in | §8, §9 | T47 | **Rule decided 24 Sep (ADR-0041)** — open until T47 passes |

## 5 · OWASP API Security Top 10 (2023) mapping

| API risk | Where it bites us | Control | Test |
|---|---|---|---|
| API1 Broken Object Level Authorization | `/v1/subjects/{id}/export`, `/record`, `/data` | C-36 | T19, T49 |
| API2 Broken Authentication | request signing, recovery code | §7, §9 | T06, T13, T35 |
| API3 Broken Object Property Level Authorization | payload `kind` or `mode` leaking in public or panel responses | A6 | T19 |
| API4 Unrestricted Resource Consumption | invites, recovery, public proof | C-37 | T14, T44 |
| API5 Broken Function Level Authorization | operator deletion, threshold, key rotation | two-signature rule | T48 |
| API6 Unrestricted Access to Sensitive Business Flows | bank signal, guardian changes | S1, §9 | T11, T12 |
| API7 Server Side Request Forgery | none planned: the server fetches only fixed Hedera and `sim_bank` URLs | fixed allow-list | PT-38 |
| API8 Security Misconfiguration | headers, CORS, debug mode | C-38, C-51 | ZAP baseline |
| API9 Improper Inventory Management | v1 UMOJA paths still in `contracts/openapi.yaml` | v1 marked `deprecated`, not served (§12) | PT-39 |
| API10 Unsafe Consumption of APIs | mirror-node responses parsed by the verify page | decode and length-check the 33 bytes | T22, T33 |

Source: https://api-security.owasp.org/editions/2023/en/0x11-t10 (retrieved 23 Sep 2026).

## 6 · New tests (T30–T49)

Each needs a fixture, an oracle and prerequisites before Thu 20:00 (P3.S3). Owners are the people who write the test; Ipeleng reviews each.

| ID | Test | Oracle | Owner |
|---|---|---|---|
| T30 | Export from the member device while an incident is open | No payload, kind or ordering reveals a duress signal; export needs a fresh PIN authorisation `PROPOSED` | Sibusiso |
| T31 | Normal vs duress `checkin_result`: server response status, headers, body length and time | Identical bytes except ids; timing difference within ±50 ms over n ≥ 30 | Sibusiso, Vukosi |
| T32 | Verify page network log while verifying an export | Only the pinned mirror host and own origin contacted; CSP header present | Ipeleng |
| T33 | Export with `<img src=x onerror=…>` in every string field | Rendered as text; no script runs | Ipeleng |
| T34 | Guardian token update unsigned or signed by another key | 401/403; token unchanged | Khutso |
| T35 | Events from a revoked key after recovery, including skew-exempt kinds | Rejected; revocation entry present | Sibusiso |
| T36 | `pin_authorised` reused for another action or target, or after 120 s | Rejected | Sibusiso |
| T37 | B1: forced-normal-PIN add, then removal across two sessions | Remaining guardians notified of each change, naming the other party | Sibusiso, Ipeleng |
| T38 | S1: `bank_signal_sent` payload | Carries `duress_pin` / `no_answer` / `contact_lost` | Sibusiso |
| T39 | S4: export within 24 h of recovery | Refused | Sibusiso |
| T40 | `sim_bank` with bad signature, no signature, repeated `Idempotency-Key` | Rejected / rejected / one hold | Khutso |
| T41 | Release APK: manifest, permissions, cleartext, model digest, storage after a 10-minute armed journey | Only launcher exported; spec §11 permission list; no audio file on disk | Vukosi |
| T42 | App data after `adb backup` attempt and file inspection | Keys and queue not extractable in readable form | Vukosi |
| T43 | HCS message submitted without the `submitKey` (testnet) | Rejected by the network | Sibusiso |
| T44 | Burst of 200 requests to public endpoints | Rate limited (429); service stays up | Sibusiso |
| T45 | SCA over lockfiles | No unwaived critical or high | Sibusiso |
| T46 | Server logs and release logcat during a full scenario | No PIN, salt, payload, token or location | Khutso, Vukosi |
| T47 | Wrong PIN at the check-in; repeated guesses | Decided by ADR-0041 (spec §8, §15): identical "Try again" ×3, then `no_answer` at the deadline; a later entry shows "Checked in"; duress still counts. Oracle in `TEST-SPECS.md` | Vukosi |
| T48 | Operator deletion, threshold change or key rotation with one operator | Rejected; the attempt is chained | Sibusiso |
| T49 | Subject A's key calls subject B's export, record and delete | 404, body byte-identical to a subject that doesn't exist (corrected 24 Sep: a 403 leaks existence) | Sibusiso |

## 7 · Gaps this model raises

1. **TM-C9, export during an open incident (largest).** A coercer holding the unlocked phone can open the export (or a share button built on it) and read `duress_pin` in the current payload. V8 hides it in My Record, but not in the export. **Proposed fix** for Lethabo and Sibusiso (spec change, both leads): export needs a fresh `pin_authorised` for action `export`; while an incident is open, or under a duress authorisation, the export ends at the last head before the incident. A chain prefix still verifies, so the no-op stays convincing. Test T30.
2. **TM-C10, PIN guessing and wrong-PIN behaviour**: decided 24 Sep by ADR-0041; T47. Open only until T47 passes.
3. **B1–B3** from the PR #43 review remain open until the spec text lands (`docs/security/SSDLC.md` §13).
4. **No branch protection** (G17): a reviewed control can still be bypassed by a direct push.
5. **Contract tests are not in CI** (`SSDLC.md` C-62).

## 8 · Limitations

- Written against the spec and ADRs; there is no product code to inspect yet.
- Physical attacks beyond TB0 (forensic extraction of a rooted phone) are out of scope.
- STRIDE coverage of the SMS gateway depends on the provider Khutso chooses; to be added when named.

## 9 · Unmapped threats

The `none yet` cells identify references not found in the current spec or test set. A control reference may be a spec section or requirement ID, an ADR, or an SSDLC control (`C-nn` in `docs/security/SSDLC.md`, which carries its own status and evidence). `scripts/check-threat-map.mjs` applies the same rule. Owners below are proposed for closing the remaining gaps. Reviewed 24 Sep by an independent mapping audit: every added reference was checked against its source, and a test counts only if its oracle would fail when the threat succeeds.

| ID | What's missing | Proposed owner |
|---|---|---|
| GD-4 | Spec control for lock-screen location disclosure; test | Mutarisi (guardian UI) |
| GD-5 | Spec control and test for exposure to FCM and SMS providers | Khutso (guardian delivery) |
| GD-6 | Test for offline guardian delivery and SMS fallback | Khutso (guardian delivery) |
| VP-7 | Spec control and test for integrity of the hosted verify page | Ipeleng (verify page) |
| HD-5 | Test for testnet reset handling and re-anchoring under a new epoch | Sibusiso (anchoring) |
| BK-5 | Test that the bank-facing copy does not name duress during an event | Khutso (`sim_bank`) |
| CI-1 | A T/PT ID for the existing fixture test `scripts/test-security.mjs` (C-82), which already runs in CI | Sibusiso and Ipeleng (security/CI) |
| CI-2 | Spec control and T/PT test for rejecting direct pushes with failing checks | Sibusiso (repository controls) |
| SV-3 | A direct fixture for the server rewriting already-anchored history in place. Today coverage is inferred from T22's root mismatch | Sibusiso (anchoring) |
| CI-3 | A test that CI refuses a lockfile whose integrity hash doesn't match (C-70); T45 covers known CVEs only | Sibusiso (server dependencies) |
