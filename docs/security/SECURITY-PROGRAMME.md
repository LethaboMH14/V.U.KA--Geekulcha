# VUKA security, compliance and governance programme

> **Owner:** Ipeleng Constance Modise (security and privacy). Lethabo Hoaeane is covering the security lane from 24 Sep 2026 until Ipeleng returns, and is **acting incident lead** in the same period. **Status:** `PROPOSED`, revision 6, 25 Sep 2026.
> **Serves:** S, T, B.
> **What this is:** the umbrella over the existing security documents:
> - `SSDLC.md`: the lifecycle and the controls `C-nn`;
> - `THREAT-MODEL.md`: STRIDE and coercion;
> - `PENTEST-PLAN.md`: `PT-nn`;
> - `TEST-SPECS.md`: the oracles (PR #70);
> - `COMPLIANCE-GOVERNANCE.md`: POPIA and counsel questions.
>
> It adds a legal register built from quoted sources, a standards baseline with versions, new controls, a pentest methodology with scoring, day-to-day operations, governance, and what we can show live.
> **Evidence base:** `docs/security/research/SA-LAW.md`, `STANDARDS.md` and `THREAT-DATA.md`, researched 24 Sep 2026. Each claim carries a literal quote and URL, or ⚑ (unverified).
> **Review record:** revision 1 was attacked by an independent red-team review (30 findings); revisions 2 and 3 by a second, different-model adversarial review (12 and 10 findings); revision 4 by a further red-team round (6 findings); revision 5 by the second reviewer again (7 findings). Every finding is dispositioned in §11. That review read `main`, so artefacts still in open PRs showed as missing. They are cited by PR number here, and **nothing in the showcase (§9) is used until its artefact is on `main`.**
> **Not legal advice. This is an internal programme, not an independent assessment.** Gap G8 (no independent penetration test) stays open whatever this programme achieves.

---

## 1 · The security position in one paragraph

VUKA protects a person being coerced. The adversary may hold the unlocked phone, know the normal PIN, watch the screen, and may even be one of the person's own guardians. Three properties carry the product:
1. **Nothing on the phone reveals a duress signal:** screen, timing, request shape, notifications, record views, or the guardian list (V5, V8, ADR-0041).

   This is a claim about the phone only. **The consequences of a duress signal are observable by design.** A guardian is alerted, and a bank may add friction. A coercer who probes the bank can infer a signal. That is a stated residual, and ADR-0037 makes delayed or randomised friction a partner requirement (§10).
2. **No single party can rewrite what happened.** Each person's chain is device-signed and hash-linked, and a 33-byte message carrying a Merkle root is anchored on a public ledger (§4–§6, §10). The strength of this is bounded by §10: server-set receipt times are only as trustworthy as the next anchor.
3. **We keep the minimum.** No audio, no ID number, location only at detection, payloads deletable while hashes stay (§13).

## 2 · Legal and regulatory register (South Africa)

Source: `research/SA-LAW.md`. Each row states only what the quoted text supports. "Q-Cn" rows are open counsel questions (`COMPLIANCE-GOVERNANCE.md` §8).

| # | Obligation | Section | Applies | What it forces in the design | Control or test | Status |
|---|---|---|---|---|---|---|
| L1 | Security safeguards, and a risk assessment that is re-verified | POPIA s19(1), s19(2) | Yes | The threat model is re-reviewed at each release gate (§8) | C-04 | In build |
| L2 | A written operator contract; the operator notifies us of a compromise | POPIA s21 | Yes | **Today's operators carry real personal information:** Google FCM (guardian alerts with team members' real locations), the tunnel provider (TLS may end at its edge ⚑), and Azure. None has a signed data-processing clause, and that is disclosed. No bank or SMS partner goes live without one | C-130 | Disclosed gap |
| L3 | Notify the Regulator and the data subject of a compromise | POPIA s22(1) quoted; the "as soon as reasonably possible" timing in s22(2) is ⚑ (not fetched) | Yes | The runbook (§7.4) uses the eServices portal, **which needs a registered Information Officer, and the registration is not yet submitted** (D-IO-1). The fallback is a written record plus notice to the data subjects directly. No 72 h deadline is imported | C-120; §7.4 | Blocked on the IO |
| L4 | Access to your own information | POPIA s23 | Yes | The full record is exported **off the phone**, authenticated with the recovery code (ADR-0043(1)). The hold delays that route identically for every incident. It's **a product restriction, not a legal exception**: an ADR can't create one. The counsel-reviewed s23 process is Q-C10 | T19, T30, T64 | Open |
| L5 | The deletion right, and notifying recipients of a correction that affects decisions ("if reasonably practicable") | POPIA s24(1)(b), s24(3) | Yes | Keeping hashes after deletion **must be defended against** the s24(1)(b) deletion right (Q-C2). Propagating to recipients is **design-open**: a notice to the bank needs a per-signal reference (the s57 question in L8), and a notice to an abusive guardian tells him evidence was deleted | C-131 (design-open) | Open |
| L6 | "Biometrics" includes voice recognition | POPIA s1, s26(1)(a) | **Design line** | Only the six mapped class labels and scores leave the classifier. YAMNet's speech classes ("Male speech", "Female speech", "Child speech") never leave the inference call. No speaker ID, voiceprint or stored audio | C-132; T41 extended (§4.1) | New |
| L7 | Location is not special personal information | POPIA s1, s26 | Yes | Ordinary s11 processing with consent, minimised (V9) | T46 | Specified |
| L8 | Prior authorisation: linking identifiers (s57(1)(a)); criminal-conduct information for third parties (s57(1)(b) ⚑, not researched) | POPIA s57 | Counsel | **Traffic direction doesn't answer s57**: a useful bank signal is matched to a customer somewhere, even if only at the bank. Before any real bank integration: document the full account-matching flow and the original collection purpose, then get a **human legal decision** (Q-C8, both limbs). `sim_bank` only until then | C-133 | Counsel |
| L9 | Cross-border transfer | POPIA s72 | Yes | The anchor **arguably** doesn't engage s72, because it carries only hashes (pending Q-C7: are roots personal information?). T58 checks the whole Hedera transaction, not just the message. **FCM, the tunnel and Azure are current cross-border exposures** until each has a named basis | T58; `PRIVACY-POLICY.md` (PR #71) | Open |
| L10 | Electronic direct marketing | POPIA s69 | Not today | Safety alerts never carry marketing | C-134 | Rule |
| L11 | Offences | POPIA s107 | Yes | The severity scale in §6.4 | — | — |
| L12 | Reporting a cyber offence to SAPS within 72 h "where feasible" | Cybercrimes Act s54 | **Not in force** (checked 24 Sep 2026). Q-C5 (is an app provider covered?) is open | If it comes into force, the bank's duty concerns its own network. VUKA's signal neither triggers nor discharges it | — | Monitored |
| L13 | Evidential weight of data messages | ECTA s15 ⚑ | Yes | Say "built to support the reliability factors", never "court-admissible" | GV-1 | Rule |
| L14 | Harassment through location sharing | Protection from Harassment Act ⚑ | Yes | The guardian-abuse design in §4.6 | PT-69 | New |
| L15 | Cyber resilience at the bank partner | FSCA/PA Joint Standard 2 of 2024 ⚑ | Partner | Mapped in the partner pack, post-hackathon | — | Post-hackathon |
| L16 | Interception of communications | RICA ⚑ (`RICA-POSITION.md`) | Yes | A journey's microphone hears third parties. Audio is never persisted or sent, and only event labels leave the classifier. This is the first question an SA judge asks | C-132; `RICA-POSITION.md` | Counsel |

## 3 · Standards baseline

Source: `research/STANDARDS.md`, checked 24 Sep 2026.

| Standard | Version | Applies to | Target |
|---|---|---|---|
| OWASP MASVS / MASTG | **2.1.0** | VIGIL | All 8 groups considered. MASVS-RESILIENCE is **not claimed** (C-110) |
| OWASP ASVS | **5.0.0** | API, verify page | Level 2 where a chapter applies. The V6 password rules are declared not applicable (device key plus PIN) |
| OWASP API Security Top 10 | **2023** | API | All 10 mapped (`THREAT-MODEL.md` §5) |
| NIST SP 800-218 SSDF | **1.1** (1.2 is a draft) | The lifecycle | Evidenced in `SSDLC.md` |
| LINDDUN | 7 categories | Privacy | §4.7 |
| CVSS | **4.0** | Findings | §6.4 |
| SLSA Build Track | **1.2** | APK | **Not claimed this weekend.** Post-hackathon target L2 (cut per review) |

## 4 · Security architecture: what protects each layer

Existing controls are cited, not repeated. New IDs: controls from C-130, tests from T57, pentest cases from PT-65.

### 4.1 Device (VIGIL)
- **Keys and randomness:** Keystore P-256 (StrongBox when present), non-exportable; `SecureRandom` salts and nonces (C-10, C-11; T03, T18). Attestation is stored, not verified (G32, C-110).
- **PIN:** Argon2id on the device; `pin_authorised` bound to one action and target, with the server setting the expiry (§9; T12, T16, T36). Wrong PINs follow ADR-0041 (T47).
- **C-136 · `FLAG_SECURE` on the PIN, check-in and My Record windows.** The threat is **on-device capture only**: Recents thumbnails, screenshots, MediaProjection recorders. It doesn't stop a bystander filming with their own camera or a coercer looking at the screen, and we don't claim it does.
  - Because the flag blacks out captures, **parity (T15, PT-23) runs on a `parityTest` build variant that differs only by the flag being off.** The two APKs are diffed to prove that's the only difference.
  - **The demo and the recorded fallback are filmed through an overhead camera.** **T57:** the flag is set on both paths (`dumpsys window`), and a Recents thumbnail is blank on both.
- **C-137 · Sensitive-input protection that works on Android 14.** `View.setAccessibilityDataSensitive(true)` (API 34) on the PIN pad, through a small native wrapper, hides the pad's contents from accessibility services **not** declared `isAccessibilityTool`. That's the class the overlay banking trojans in THREAT-DATA use. **Services that declare `isAccessibilityTool` (genuine assistive tools) keep access by Android's design, and malware that declares it is not stopped.** The claim is limited to what the test shows. It adds no permission and no dropped taps. **PT-65:** two test services, one of each declaration, on the supported Android versions. The non-tool service can't read the pad; the tool service's access is recorded as the residual.
- **Clone defence, reduced to what works.** The release signer's certificate SHA-256 is published **on the GitHub Release page**, to be checked with `apksigner verify --print-certs` before installing. There's no in-app fingerprint (a clone can show anything) and no server-side refusal: the registry has no certificate column, attestation is unverified, and a refusal could become a duress oracle.

  **Residual (stated in §10):** a cloned app can harvest both PINs locally. Install only from the release page.
- **Minimal platform surface:** launcher-only export, a foreground service built from the granted permissions, no boot receiver, camera, SMS or background location (C-13, C-14; T17, T41). **T41 is re-run on the feature-complete APK.** The INTERNET-only result from PR #73 was a shell app. T41 also asserts that only the six mapped YAMNet labels and scores leave inference (L6).

### 4.2 Transport and API authentication
Request signing, the order of checks, and replay rules (§7; T06, PT-01–PT-09). The contract fixes are in #51 (SEC-1, SEC-2, C5–C8). TLS everywhere. No certificate pinning (C-111). ASVS V4: errors return `application/json` with a uniform body (C-38; PT-67).

### 4.3 Server (ANCHOR)
- **Per-subject authorisation:** a cross-subject request returns **404 with a body identical to a missing subject**, in every document: TEST-SPECS T49 (PR #70), THREAT-MODEL T49 and PENTEST-PLAN PT-32 aligned (C-36).
- **Governance under coercion:** PIN-authorised changes, the 24 h removal, never zero guardians, two operators for operator actions (§9; ADR-0036/0040/0041; T12, T13, T24, T48, T50–T52). **The two-operator rule is enforced at the API only.** Direct database or cloud-portal access bypasses it, and detection thresholds ship inside the APK, so the release-key holder can change them. Both are residuals, and the named principals are in §7.2.
- **Durable escalation:** the outbox, exactly-once effects (§8; T07–T11, T23). **An FCM collapse key is not deduplication.** It collapses only messages still waiting to be delivered, not one already shown before a worker crash and retry. So the guardian app **handles alerts in two durable steps**:
  1. The alert is stored as `pending`.
  2. It is shown with **notification ID = alert ID**, then marked `displayed`.

  On restart, every `pending` alert is shown again. A repeat delivery of a `displayed` alert is ignored. Because the notification ID is stable, a re-show replaces the notification rather than adding one. **The claim is narrowed to what is tested:** at most one visible notification per alert ID, and at least one display after any single crash. **T08 tests both crash boundaries** (after persist and before display; after display and before marking).
- **ADR-0043 (proposed; both leads, and Ipeleng's security review), sixth draft.** The direction was chosen by Lethabo on 24 Sep: **the verifiable record leaves the phone.**
  1. **My Record on the phone is a plain journey list**, identical whatever happened. The verifiable export is fetched **off the phone** with the recovery code (and later a counsel-reviewed s23 process). Every export is released 72 h after the request, whatever the incident state, and guardians aren't told about it.
  2. A **`stand_down` after duress only acknowledges.**
  3. **No automatic resolution or bank release.** At 72 h, **guardians** see "status unknown". Guardian removal and deletion become available again; the incident is scoped to its journey; the call stays locked. The bank's own process lifts a hold.
  4. **Recovery never silences the old phone.** During an armed journey, or within 72 h of the last one ending, the old key's revocation is scheduled for exactly 72 h after the recovery; until then it is a full device key. The ingest answer is identical for both keys, `key_revoked` carries `effective_at`, and the old phone's screens are unchanged.
  5. **The silence notice is not built.**
  6. **A labelled `sim_` demo-reset script** keeps a judge's duress test from leaving the demo stuck.
- **Public deploy:** `sim_` subjects only, rejected in code (SEC-6; PT-68).
  - The **controllable test clock is compiled out** of the public build, and a test checks it's absent.
  - **Rate limits are keyed per device key**, not per IP, so the venue's shared NAT can't lock the demo out.
  - The live panel is labelled as demo instrumentation, and team phones aren't shown on it.
- **Logs:** no payloads, PINs, tokens or coordinates (T46). **Outbox effects are logged without subject or check-in IDs**, so a log reader can't link a check-in to an alert or bank signal.

### 4.4 Chain and anchor
- Canonical form, the signed statement, keys rebuilt from the chain, revocation (§4, §4a/ADR-0042, §5; T01, T21; verify-min PR #69). Verify-min reports `internal_consistency_only`; "verified" appears only after the anchor and manifest checks pass.
- **T58 · Nothing personal leaves in an anchor transaction.** Every submission in a demo run is captured, **including the transaction memo, the topic memo and the payer account**. The message is 33 bytes with a type byte of `0x01` (a root) or `0x02` (the manifest, spec §10), and there are no free-text fields.
- **T59 · Running-hash tamper:** a changed `running_hash` or `sequence_number` on the right topic is rejected (extends T22).
- The topic **adminKey is held offline, or the topic has none** (§7.1). The verify page pins an **append-only list of manifest epochs**, so earlier epochs still verify after a key rotation.

### 4.5 Verify page and its independence
No upload, `textContent` only, a CSP allowing only its own origin and the pinned mirror (C-50–C-53; T32, T33). **A compromised server could serve a lying verifier**, so the verifier is also published as a **hashed static release asset built from a tag**, together with the CLI (`shared/scripts/verify-export.mjs`, PR #69). Judges are told to verify with that copy.

### 4.6 Guardians, including the guardian who is the abuser
THREAT-DATA records that safety apps are abused by **legitimately added** people. Controls:
- **C-139 · The guardian list is honest about its limits.** It shows each guardian's name and the date added, **never a last-alert time** (that would reveal an alert). The list sits under the pre-incident hold. After a duress session it deliberately shows the coerced view, with the decoy as real and a removed guardian as gone, and onboarding says so plainly.
- **ADR-0043(1)**, above: a guardian can't close a duress incident.
- **Onboarding copy:** "Choose guardians who don't live with you". This is already the spec's recommendation, now given as the reason.
- **Alerts are authenticated.**
  - The guardian app shows only alert payloads signed with the server's Ed25519 key (GD-5).
  - Every SMS fallback says "Open the VUKA app to confirm. Never trust an SMS that says stand down."
- **PT-69:** a validly added guardian can't retrieve a past location, record or export (404), and loses alerts 24 h after removal. **Residual:** the alerts he did receive stay on his own phone.

### 4.7 LINDDUN privacy threats
| LINDDUN | VUKA exposure | Decision |
|---|---|---|
| Linking | The guardian graph | Held in the server database only, never in the chain or anchor; exports show your own guardians only (T19, T49) |
| Identifying | Location in `signal_detected`; residuals after deletion | Minimised, and listed in the privacy policy (PR #71) |
| Non-repudiation | **Intended**: proving what happened is the product | Stated as a goal; the subject controls export; third-party access isn't built (ADR-0039) |
| Detecting | Root timing on the public topic; with few demo subjects, timing is per person | Accepted residual, stated on the slide |
| Data disclosure | Over-collection | No audio, no ID number, no background location |
| Unawareness | Guardians processed without notice | The s18 notice at guardian acceptance (PO-4) |
| Non-compliance | L1–L16 | This register |

### 4.8 Build and supply chain
- Secret scanning on commit and in CI (C-80–C-82), with the CI failure shown, not just the hook. SCA (C-70, C-71), semgrep, SHA-pinned actions (#62).
- **Install scripts:** `npm ci --ignore-scripts` wherever the build allows, and **Gradle wrapper validation** in CI. This targets the real 2025 threat, a correctly hashed malicious package whose install script steals credentials, and replaces the earlier lockfile-hash test.
- The model-weight digest is checked before loading (C-73; T41, PT-49).
- **Release signing custody (one statement, replacing three).** The upload key is held offline by the release owner (Vukosi) with one sealed backup (Mutarisi). A CI release job may sign only from a **GitHub Environment restricted to tags, with a required reviewer**. Never a plain repository secret: without branch protection (G17), any collaborator's workflow could read it.

## 5 · New controls and tests (the register)

| ID | Control or test | Owner | Due | Release-blocking? |
|---|---|---|---|---|
| C-130 | Operator-contract gap disclosed; no new live partner without a clause | Lethabo (covering) | Stated now | — |
| C-131 | Correction propagation: design-open, with the s57 conflict named | Sibusiso, Lethabo | Post-hackathon | — |
| C-132 / T41 | Only the six mapped labels leave inference; T41 on the feature-complete APK | Vukosi | Sat 26 12:00 | **Yes** |
| C-133 | Account-matching flow documented; no real bank without a legal decision | Sibusiso, Lethabo | Fri 25 (flow doc) | — |
| C-134 | No marketing on the safety channels | Babatunde | Sat 26 | — |
| C-136 / T57 | `FLAG_SECURE` plus the `parityTest` variant | Vukosi, Mutarisi | Fri 25 18:00 | **Yes** (T15 depends on it) |
| C-137 / PT-65 | `setAccessibilityDataSensitive` on the PIN pad | Vukosi | Sat 26 12:00 | — |
| C-139 / PT-69 | Guardian list without last-alert times, under the hold; abuse test | Sibusiso, Mutarisi | Sat 26 16:00 | — |
| C-140 (ADR-0043) | Off-phone record; no automatic resolution; recovery as an alarm; demo reset | Lethabo proposes; Ipeleng reviews; Sibusiso accepts | Fri 25 12:00 | **Yes, once accepted** |
| T58 | Nothing personal in anchor transactions | Sibusiso | Sat 26 16:00 | **Yes** |
| T59 | Running-hash tamper rejected | Lethabo (verify) | Sat 26 16:00 | — |
| PT-67 | Uniform, correctly typed errors | Sibusiso | Sat 26 12:00 | — |
| PT-68 | Public `sim_`-only gate; clock hook absent; per-key rate limits | Sibusiso | **Before the public URL is shared** | **Yes** |

**Cut this weekend (per the review):**
- SLSA provenance (post-hackathon target);
- the in-app fingerprint and the server-side clone refusal;
- PT-70: a testnet reset can't be induced, and PT-60 covers a blocked mirror;
- PT-71: it tested npm, not us;
- building C-131.

## 6 · Penetration testing: methodology

This is an internal test by the builders and is always called that (G8).

### 6.1 Method
The phases follow **PTES** and **NIST SP 800-115** (plan → discover → attack → report). IDs cite **OWASP WSTG** (`WSTG-<cat>-<nn>`) and **MASTG** (`MASTG-TEST-nnnn`) next to `PT-nn`. The rules of engagement are `PENTEST-PLAN.md` §2.

### 6.2 Release-blocking set (run and recorded by Sat 26 16:00, before RG2 at 18:00)
| Area | Cases |
|---|---|
| Duress on the phone | T15 and T31 (on the `parityTest` variant), T57, T30 (the off-phone export honours the hold identically), T64 (member-device API responses and My Record are byte-identical in shape with and without a duress incident, before and after 72 h) |
| The alert actually fires | T07 (force-stop), T08 (crash and restart), T51 (the check-in never shown), T11 (bank-signal triggers) |
| PIN authority and guardians | T12, T16, T36, T47, T52, T24 (never zero guardians, the two-session path), T61 (stand-down after duress: no close, no call unlock, bank signal stands), T34 (guardian-token substitution), T13 revised (recovery isn't blocked), T66 (no VUKA release; "status unknown" is guardian-only), T67 (recovery schedules revocation 72 h out; the old key stays a full key until then; one ingest answer for both keys; old screens unchanged), T68 (every export released at 72 h; no guardian notice), T69 (the verifier honours `effective_at`) |
| Authentication and authorisation | T06 (signing, replay), T49, PT-68, T40 (forged bank signal refused) |
| Chain and anchor | T04, T21, T22, T58 |
| Hygiene and leaks | T46, T42, T63 (app network capture), secrets C-80–C-82 (with the CI failure shown) |

Everything else runs after this set, and anything not run is recorded as **not run**. **A failure in this set is never waived by disclosure.** The affected path is removed from the live build and demo, and the failure is disclosed.

### 6.3 Tools, all free, with the exact command recorded in the results
- **Web and API:** ZAP baseline on the staging API and verify page. **The ZAP API scan is blocked until contract v2 (#51) merges.** `contracts/openapi.yaml` on `main` is still v1, so the scan would hit dead paths; if it runs early, it targets the v2 file with the commit recorded.
- **App:** MobSF static, `apkanalyzer`, `aapt dump badging`, `apksigner verify --print-certs`; Frida and objection on team test phones only.
- **Code:** semgrep, npm audit, pip-audit, osv-scanner, gitleaks.
- **Chain:** `node shared/scripts/verify-export.mjs` (PR #69) on tampered fixtures.

### 6.4 Scoring and reporting
Every failed case gets a **CVSS 4.0** vector and score, a reproduction, the commit, the tester and the date, in `PENTEST-RESULTS.md`. Dependency findings keep their advisory's CVSS version, stated.
- **≥ 7.0** blocks RG2 until it is fixed and re-tested, or it is removed from the demo and disclosed.
- **Medium** is fixed or disclosed in `OPEN-GAPS.md`.
- A case that can't run is **not run**, with the reason.

## 7 · Day-to-day operations

### 7.1 Secrets and keys
| Secret | Holder, and backup | Blast radius if leaked | Revoke or rotate |
|---|---|---|---|
| App upload key | Vukosi offline; Mutarisi sealed backup | Signed malicious updates | Rotation needs a new app identity (users reinstall). Publish the new fingerprint |
| Server Ed25519 signing key | Sibusiso, in Key Vault or a host secret | Forged server entries and forged alert signatures | Rotate under two operators; append the new epoch to the pinned list |
| Hedera submit key | Server secret | Pollution of our topic | The adminKey (offline) rotates it; or a new topic epoch |
| Hedera **adminKey** | **Offline** (Sibusiso), never on the server | Topic deletion or submit-key change | — |
| PostgreSQL credentials | Host secret (Sibusiso) | Read or alter everything below the API | Rotate the password; review access |
| Payload and salt encryption key (P1) | Host secret (Sibusiso) | Plaintext payloads | Re-encrypt under a new key |
| `sim_bank` countersign key | Khutso | Forged bank acknowledgements (simulated) | Regenerate |
| FCM credentials | Khutso | Fake alerts (mitigated by signed alerts) | Revoke in the Firebase console |
| SMS gateway key (if used) | Khutso | Spoofed or costly SMS | Revoke |
| Azure, Firebase, GitHub and tunnel/DNS owner accounts | Named owner plus a second admin, both with 2FA | Full takeover | Owner-only; recovery codes held offline |
| Device keys | Each user's Keystore | One member's chain | Recovery revokes the key. **If recovery is cut from the build (spec §14 cut line), a leaked device key can't be revoked**, and that is stated |

"Two-operator rotation" is a team rule; one portal admin can still edit a secret. Nothing secret goes in the repo, a PR, the chat or a screenshot.

### 7.2 Principals and access
The named principals are listed in the repo's `team/` files. Staging and database access: Sibusiso (owner) and one named backup. Cloud portals: owner plus a second admin. **Non-human principals** (CI tokens, deploy tokens, and the AI coding assistants some members use, which commit with their own tokens) are listed with their token scope. Any of them can open a PR, and none can merge alone. **The repo went public on 24 Sep 2026, so branch protection is now available (G17).** Required checks and a required non-author review on `main` are to be switched on by the repo owner. Until then, review is a team rule.

### 7.3 Monitoring and on-call
`/healthz`, outbox lag, the age of the last anchor, and the failed-signature and replay rates, alarmed to the team channel. **On-call:** Fri night, Sibusiso; Sat night, Lethabo (named in the team channel). No personal information in logs; the outbox correlation rule is in §4.3.

### 7.4 Incident and breach runbook
The acting incident lead is **Lethabo** (Ipeleng is away).
1. **Contain.** Revoke the token or key (see §7.1 for which revocations exist), stop the affected service, keep the logs.
2. **Assess**, using the statutory trigger (POPIA s22(1)): are there **reasonable grounds to believe personal information has been accessed or acquired by an unauthorised person**? That includes an insider viewing records, or an attacker reading data without downloading it. It isn't limited to data leaving our control. **Team locations, guardian numbers and names are personal information**, even under a `sim_` label.
3. **If there are such grounds:** notify the affected people directly, with a factual template. Notify the Information Regulator through the eServices portal once the Information Officer is registered. **Until then**, keep a dated written record and notify by the Regulator's published contact route, marked ⚑.
4. **Record** a build-log entry with a timeline and no secret values.
5. **Fix, re-test, and publish the lesson** in `OPEN-GAPS.md`.

**Tabletop (P3.S22): Fri 25 21:00**, including one unauthorised-access case with no proven exfiltration, moved off the RG1 hour. It covers a leaked device key (including the no-recovery case) and a location leak, recorded with the real participants and times.

### 7.5 Release checklist (every build that reaches a phone)
- Built from a tag.
- APK SHA-256 and signer fingerprint published on the Release page.
- T41 manifest check.
- MobSF: no unresolved high findings.
- T15 and T57 re-run on the `parityTest` pair.
- Release notes say what is SIMULATED.

## 8 · Governance
- **Decision rights:** security and privacy go to the security lead (Ipeleng; Lethabo covering). Contract and behaviour changes (ADR-0043) need both leads plus an ADR. **Nobody reviews their own security work:** a PR by the acting security lead gets its security review from the second lead (Sibusiso). When he is also the author, an independent review is recorded and the item is marked "single-reviewed".
- **Gates:**
  - **RG1** (Fri 12:00): the thin slice; SEC-1 and SEC-2 merged; ADR-0043 decided.
  - **RG2** (Sat 18:00): the §6.2 set passes. Anything that doesn't is **removed from the live path** and disclosed; never shipped as "disclosed".
  - **Content freeze Sat 23:00:** slides and claims locked.
  - **RG3** (Sun 08:30): check that the submission commit hash matches the reviewed one.
- **Evidence rule:** "Done" only with evidence on `main`. Counts come from `scripts/count-controls.mjs` (PR #72) and `scripts/check-threat-map.mjs` (PR #70), never typed by hand.
- **Honesty ledger as a control:** never "secure", "unhackable", "pentested", "court-admissible", "unbiased" or "prevents crime".
- **Document alignment:** `PIN-AUTHORITY-RULES.md` carries a banner saying spec §8–§9 and ADR-0041 govern where they differ.

## 9 · What we can show live (only once each artefact is on `main`)
1. **Tamper an export, then verify it.** The verifier names the first broken entry (T04), using the published CLI or the static verifier from a tag.
2. **Duress parity:** the `parityTest` build, normal and duress side by side through the overhead camera, identical; then the release build's `FLAG_SECURE` shown blanking a Recents thumbnail (T15, T57).
3. **Another subject's record** returns the same 404 as a missing record (T49).
4. **A staged secret:** blocked by the hook **and failed in CI** (C-80–C-82). **Caveat on the slide:** `--no-verify` bypasses the hook, which is why CI runs it too.
5. **The anchor transaction** carries 33 bytes and no memo text (T58). **Caveat on the slide:** with few demo users, root timing is per person.
6. **A failed-then-passing abuse test, tied to commits.** T49 (another subject's record) runs against the commit before the per-subject check (it fails; CI link) and the commit after (it passes; CI link). The live scorecard (§12) shows the same commit. This replaces a count, which only showed arithmetic.

## 10 · Limitations, stated first
- An internal test. **Not an independent penetration test** (G8).
- Key attestation is stored, not verified (G32). No tamper-resistance claim. No certificate pinning (C-111).
- **A cloned app can harvest PINs.** Install only from the Release page and check the fingerprint.
- **The consequences of duress are observable:** a coercer who probes the bank can infer a signal. Randomised or delayed friction is a partner requirement.
- **A coercer who is a guardian receives the alert.** ADR-0043 stops him closing it, but can't stop him seeing it. The advice is guardians who don't live with you.
- **A duress incident stays open ("status unknown", guardians only) until the post-hackathon safe-contact procedure exists** (ADR-0043). This is deliberate: every automatic resolution proved to be an attack surface.
- **The phone never holds the verifiable record.** Checking it needs the off-phone export with the recovery code, which is less convenient and is the price of showing a coercer nothing.
- **Anyone holding the recovery code can read the full record off the phone and recover the account.** Recovery during an incident alarms guardians and can't silence the old phone. Onboarding says to keep the code away from the phone.
- A compromised server can suppress or fabricate escalation (§17), and **backdate a revocation** within the window before the next anchor.
- The two-operator rule is enforced at the API only. Thresholds ship in the APK.
- Hedera **testnet** can reset, and its receipts are testnet receipts.
- Current operators (FCM, the tunnel, Azure) lack signed data-processing clauses, and cross-border bases are unconfirmed (L2, L9).
- Several statutes were read from secondary copies (⚑). The Information Officer isn't registered, and there's no legal entity yet.

## 11 · Review disposition (revision 1 red-team, 30 findings)
| # | Finding | Disposition |
|---|---|---|
| 1 | The last-alert date reveals duress | **Accepted.** C-139 rewritten (§4.6) |
| 2 | FLAG_SECURE blanks the parity test and the demo | **Accepted.** `parityTest` variant, overhead camera, threat narrowed (§4.1) |
| 3 | Server clone refusal infeasible and an oracle | **Accepted.** Cut; published fingerprint only; residual stated |
| 4 | Release-blocking set missing T30, T07, T08, T51, T24 | **Accepted.** §6.2 |
| 5 | A guardian-coercer sees the alert and can stand down | **Accepted.** ADR-0043(1); residual stated |
| 6 | Bank friction observable | **Accepted.** §1 reworded; partner requirement; residual |
| 7 | s24 read backwards; C-131 conflicts with C-133 | **Accepted.** L5 rewritten; C-131 design-open |
| 8 | s72 overstated; T58 incomplete | **Accepted.** L9 "arguably"; T58 covers memos and `0x02`; current exposures listed |
| 9 | Runbook inconsistent | **Accepted.** §7.4 rewritten; acting lead named; tabletop moved |
| 10 | Revocation depends on recovery | **Accepted.** Stated in §7.1 and §10 |
| 11 | Signing-key custody contradictory | **Accepted.** One statement, tag-restricted Environment |
| 12 | Secrets inventory incomplete | **Accepted.** §7.1 table; adminKey offline; epoch list |
| 13 | Insider bypass of the two-operator rule | **Accepted.** Stated as API-only; principals §7.2 |
| 14 | A compromised host serves a lying verifier | **Accepted.** Static verifier from a tag, plus the CLI (§4.5) |
| 15 | Alerts unauthenticated | **Accepted.** Signed alerts; SMS wording (§4.6) |
| 16 | The OS can silence an armed journey | **Partly.** The silence notice was withdrawn as a surveillance risk (ADR-0043(5)). A journey silenced by the OS with no incident open is a stated residual |
| 17 | Clock hook and rate limits break the demo | **Accepted.** §4.3 |
| 18 | C-137 infeasible as written | **Accepted.** Replaced with `setAccessibilityDataSensitive` |
| 19 | ZAP API scan targets v1 | **Accepted.** Blocked on #51 |
| 20 | Cited artefacts missing | **Partly.** They are in PRs #69–#72, now cited; the showcase requires them on `main` |
| 21 | Timeline doesn't fit | **Accepted.** Cuts in §5; content freeze Sat 23:00 |
| 22 | Showcase punctured | **Accepted.** §9 rewritten with caveats; 404 aligned |
| 23 | L12 overstated | **Accepted.** Reworded |
| 24 | RICA and s57(1)(b) missing | **Accepted.** L16; Q-C8 widened |
| 25 | Biometrics line depends on output hygiene | **Accepted.** T41 extended |
| 26 | Log correlation reveals duress | **Accepted.** §4.3 |
| 27 | Access and monitoring on paper only | **Accepted.** §7.2 and §7.3 |
| 28 | The supply-chain test checked npm | **Accepted.** `--ignore-scripts` plus wrapper validation |
| 29 | PIN-AUTHORITY-RULES contradicts the spec | **Accepted.** Banner added in this PR |
| 30 | Revocation can be backdated | **Accepted.** Stated in §10 |

### Revision 2 review (second, different-model adversarial review, 12 findings)
| # | Finding | Disposition |
|---|---|---|
| 1 | ADR-0043 can lock an incident open forever | **Accepted.** Safe resolution with the recovery code plus guardian voice confirmation, or 72 h expiry; bank release at resolution; recovery allowed (ADR-0043(2)) |
| 2 | The hold postpones disclosure, not prevents it | **Accepted.** Historical duress payloads never appear on the member device (ADR-0043(3)); T64 |
| 3 | A stand-down re-enables a dangerous call | **Accepted.** No G4 call unlock during an unresolved duress incident |
| 4 | The silence notice is a surveillance channel | **Accepted.** Not built; off by default; opt-in and abuse test first |
| 5 | Release-blocking set bypassable by disclosure; tests missing | **Accepted.** No disclosure waiver; T61, T06, T34, T40, T64 added |
| 6 | An FCM collapse key isn't deduplication | **Accepted.** Persistent signed-alert-ID dedupe on the guardian app; T08 oracle "one displayed" |
| 7 | The runbook trigger is narrower than s22 | **Accepted.** Statutory trigger; tabletop covers access without exfiltration |
| 8 | "One-way" doesn't answer s57 | **Accepted.** Account-matching flow documented; legal decision before any real bank |
| 9 | L4 invents an access exception | **Accepted.** Stated as a product restriction; safe access route; Q-C10 |
| 10 | T63 host policy and CA setup | **Accepted.** Pages host allowed; `captureTest` variant; all networked screens |
| 11 | C-137 overclaims | **Accepted.** Claim narrowed; both service declarations tested |
| 12 | Counts are weak evidence; the scorecard could reward docs and stale runs | **Accepted.** Failed-then-passing demo; E1 needs implementation paths; E2 bound to the exact commit |

### Revision 3 review (the same second reviewer, round 3: 10 findings)
| # | Finding | Disposition |
|---|---|---|
| 1 | Duress-only redaction is itself a tell; salts enable guessing | **Accepted.** Uniform redaction of every check-in result, payload and salt; T64 checks indistinguishability |
| 2 | Voice confirmation can be coerced | **Accepted.** Removed; safe contact is a human-reviewed procedure, designed not built |
| 3 | Expiry rewards silencing the victim | **Accepted.** 72 h gives "status unknown" only; no release; the call stays locked |
| 4 | Deadlock remains possible | **Accepted.** Recovery is separate from incident state and allowed during incidents; there is no eligibility rule to exhaust |
| 5 | Recovery, access and release conflated | **Accepted.** Three separate operations; access is Q-C10 (counsel) |
| 6 | A stale release can undo a new hold | **Accepted.** VUKA sends no release; the bank's own process lifts holds |
| 7 | The escape path is outside the gate; recovery can be cut | **Accepted.** T13 revised and T66 in §6.2; recovery moves onto the never-cut list |
| 8 | A dedupe crash gap | **Accepted.** Pending then displayed, with stable notification IDs; both crash boundaries tested; claim narrowed |
| 9 | T63 contradictory host lists | **Accepted.** One allow-list; both roles plus the recovery flow |
| 10 | The scorecard reads the overall CI status | **Accepted.** Per-test results for the exact commit; skipped means not passed |

### Revision 4 review (red-team round 4: 6 findings)
| # | Finding | Disposition |
|---|---|---|
| 1 | A permanently frozen record is a tell | **Accepted.** The phone never holds the record; the hold applies only to the off-phone route, identically for every incident |
| 2 | Redacting only check-in results leaves duress visible (event counts, `chain_index`) | **Accepted.** The record leaves the phone (Lethabo's decision); the phone shows a uniform journey list; T64 compares API responses |
| 3 | Recovery during an incident silences the victim or tips off the coercer | **Accepted.** Recovery during an incident is an alarm; the old key sends alarms only; old screens unchanged; T67 (superseded in revision 6, below) |
| 4 | No way out of a false alarm; the demo gets stuck | **Accepted.** "Status unknown" re-enables removal and deletion; incidents are scoped to their journey; a `sim_` demo-reset script |
| 5 | Unlisted conflicts with the spec and ADRs | **Accepted.** ADR-0043 carries an "Amends, on acceptance" list; the edits land in the acceptance PR |
| 6 | Tests claimed but not in §15; "status unknown" visibility undefined | **Accepted.** Tests listed for §15 on acceptance; "status unknown" is guardian-only; "new signal" is defined per journey |

### Revision 5 review (the second reviewer, round 4: 7 findings)
| # | Finding | Disposition |
|---|---|---|
| 1 | Recovery while offline or in flight still silences an alarm | **Accepted.** Revocation is scheduled 72 h after the recovery, fixed at that time; queued and in-flight events arriving before it are accepted (T67) |
| 2 | Accepting only alarm events makes the API an oracle | **Accepted.** The old key is a full key until `effective_at`; one transport acknowledgement for both keys, with or without an incident; effects are never echoed (T67) |
| 3 | "Alarm events only" breaks detection, check-ins and heartbeats | **Accepted.** Every event type is accepted until `effective_at`, so server-generated `no_answer` and `contact_lost` keep working |
| 4 | A leaked old key keeps alarm power indefinitely | **Accepted.** The window is at most 72 h and nothing extends it. The thief-false-alert residual is stated in ADR-0043 |
| 5 | Export stays blocked after duress | **Accepted.** Every export is released 72 h after the request, independent of incident state (T68) |
| 6 | Export notices expose evidence gathering to an abusive guardian | **Accepted.** Guardians aren't notified of exports; the member may add an email address for the release notice |
| 7 | The alarm-only key can't be verified under ADR-0042 | **Accepted.** `key_revoked` carries `effective_at`; ADR-0042 and §4a join the amendment list; T69 |

## 12 · The security scorecard: measured, checkable, shown in the app

**The question it answers:** *how much evidence stands behind each security claim, and what would raise it?* It does **not** answer "how secure is VUKA" as a probability. No calibrated number exists for that, and printing one would break the honesty ledger. Every score is computed by a script from repo artefacts. A judge re-runs the script and gets the same number.

### 12.1 Evidence levels (per control)
| Level | Name | What must exist, checked by the script |
|---|---|---|
| E0 | Specified | A `C-nn` row in `SSDLC.md`, or a new control in §5 here, with an owner |
| E1 | Implemented | An **implementation** path (code or configuration under `app/`, `server/`, `anchor/`, `shared/`, `dashboard/`, `scripts/`, `contracts/` or `.github/`) cited by the control exists **at the scored commit**. A documentation path alone never counts: a control with only docs stays E0 |
| E2 | Tested | At least one named test (`T-nn`, `PT-nn`, or a CI job) mapped to the control, **present in the code** and **passing in the CI run for the exact commit being scored**. The run's `head_sha` must equal the displayed commit. **The evidence is the per-test result**: CI writes machine-readable results (`node --test --test-reporter=tap`, JUnit XML for pytest and vitest) as an artefact, and the script reads each mapped test's own result. **Skipped, todo or missing tests count as not passed.** An overall green run doesn't count |
| E3 | Reviewed | E2, plus a linked review record by a non-author (a PR review URL, or a file in `docs/reviews/`) |
| E4 | Independently verified | E3, plus an external party's report. **None today** (G8), and that is shown, not hidden |

A control is never scored above the lowest level whose check fails. **A manual observation** (for example T17 on a named phone) counts toward E2 only with a dated build-log record naming the tester and the build.

### 12.2 Weights and categories
- **Weight** comes from the highest-severity threat the control mitigates in `THREAT-MODEL.md`: High = 3, Medium = 2, Low = 1. Coercion rows (TM-C) count as High.
- **Categories:**
  - Duress and coercion;
  - Device (MASVS);
  - API and server (ASVS, API Top 10);
  - Chain and anchor;
  - Privacy and POPIA (LINDDUN, L1–L16);
  - Supply chain;
  - Operations and governance.
- **Category evidence score** = Σ(weight × level) ÷ Σ(weight × 4), shown as a percentage with the level mix beside it (for example "12 controls: 2×E3, 5×E2, 3×E1, 2×E0").
- **Evidence confidence** for a category = the share of its weight at **E2 or above**. Its wording is fixed: "how much of this category is backed by a passing test". It is never "how secure".
- **The overall number is shown only next to the category breakdown**, never alone.

### 12.3 What each control shows
For each control: **what** it protects (the threat IDs), **how** (the mechanism, one line), the **method** (the test IDs and how they run), **why it has this level** (the first failing check), and **what raises it** (the specific next artefact, for example "add T57 to CI → E2", or "independent review → E4").

### 12.4 Build
1. **`docs/security/scorecard/controls.json`**, the machine-readable register, one entry per control: `id`, `title`, `category`, `threats`, `mechanism`, `evidence_paths`, `tests`, `ci_jobs`, `review_links`, `external`. It is generated from `SSDLC.md` plus §5, then hand-completed. The markdown stays the human source, and the script fails if they disagree.
2. **`scripts/security-score.mjs`** (Node, no dependencies). It reads the per-test results artefact for E2 (§12.1), never the overall run status:
   - it reads the register;
   - it checks that each evidence path exists;
   - it finds each test ID in the test files;
   - it reads the latest CI result for `main` (`gh run list --branch main --json`, or a `ci-status.json` artefact the CI job writes);
   - it writes `security-score.json` with levels, scores, reasons and next steps;
   - unit tests use fixtures for each level transition.
3. **CI job `security-score`** runs the script on every push and uploads `security-score.json`. **It fails if any High-weight control drops a level** compared with `main`.
4. **The public page `dashboard/security.html`, live.** A CI job on every push to `main` computes `security-score.json` and publishes it, with the page, to **GitHub Pages** (the repo is public). The page shows the **commit hash, the CI run link and the time it was computed**, so anyone can open the run that produced the number. It renders the categories as bars with the level mix, and a control table with level chips; each row expands to show what, how, the method, why, and next. It uses the same CSP as the verify page.
5. **In the app: Settings → "Security & privacy", live.** The app fetches the published `security-score.json` over HTTPS from the pinned Pages URL. If there's no network, it shows the copy bundled at build time, **labelled "as of <date>, commit <hash>"**. It never shows an invented or cached-without-date value. The screen shows the overall evidence score, the seven category bars and a link to the public page. **Duress check:** the screen is identical for every user and state, and the fetch is the same request for everyone, so it reveals nothing.

### 12.5 Honesty rules for the scorecard
- **Everything is live and computed.** No hand-entered score, and no demo data on this surface. If the CI job didn't run, the page says so.
- The label is **"Evidence score"**, with a one-line definition on every surface. Never "security score" alone, and never "% secure".
- **E4 is shown as empty** until an external report exists.
- A drop in score is published, not hidden (principle 12).

## 13 · Leak checks (no personal information or secrets leave where they shouldn't)
| Leak path | Check | Release-blocking |
|---|---|---|
| Secrets in the repo or history | gitleaks: the hook, plus CI on full history | Yes |
| Personal information in logs | T46; outbox logs without IDs (§4.3) | Yes |
| Personal information on the ledger | T58 (full transaction, memos) | Yes |
| **App network traffic** | **T63 (new):** every networked screen (onboarding, journey, check-in, Settings → Security & privacy) is captured on a **named test device** through an intercepting proxy. It uses a **`captureTest` build variant** that differs from release only by a network-security config trusting the user CA; the two APKs are diffed to prove that, since release trusts system CAs only (C-16). Only the spec's fields leave the phone: no audio bytes, no location outside `signal_detected`, no device identifiers. **Allowed hosts:** our API, FCM, the pinned mirror, and the GitHub Pages host of the scorecard | Yes |
| On-device capture | T57 (`FLAG_SECURE`) | Yes |
| Backups and readable storage | T42 (`allowBackup` off; nothing sensitive in shared storage) | Yes |
| Exports during an incident | T30 | Yes |
| Third-party SDK traffic | T63 lists every host contacted and checks it against **the one allow-list**: our API, FCM, the pinned mirror and the scorecard's GitHub Pages host. Captures cover **both app roles** (member and guardian) and the recovery flow | Yes |
