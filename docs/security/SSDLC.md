# VUKA Secure Software Development Lifecycle (SSDLC) — GKHack26 build

> **Owner:** Ipeleng Constance Modise (security, privacy and compliance). **Issued** 23 Sep 2026 by Lethabo (co-lead) as her starting programme. **Status:** `PROPOSED` until Ipeleng accepts it and Lethabo reviews it. It becomes the Sonke SSDLC submission (due **Sat 26 Sep 12:30**, internal **11:00**).
> **Serves:** S (security and ethics), T (technical). **Answers "Would a real user trust and use this?"** by making every security claim checkable against a test or a file.
> **Companions:** `docs/security/THREAT-MODEL.md` · `docs/security/PENTEST-PLAN.md` · `docs/security/COMPLIANCE-GOVERNANCE.md` · `docs/VUKA-2-SPEC.md` (requirement and test IDs) · ADR-0034 to ADR-0038.
> This file supersedes the path `docs/SSDLC-GKHACK26.md` named in `team/ipeleng.md`.

---

## 0 · How to read this

- Every control has an ID (`C-nn`), an owner, a test or evidence item, and one status:
  - **Done** — it exists in the repository today (23 Sep), and the evidence column says where.
  - **In build** — assigned in a work order and due before Sun 27 Sep 09:00.
  - **Planned** — designed here, not yet assigned to a dated row. New rows are proposed as P3.S9 onwards.
  - **Not doing** — a deliberate decision, with the reason.
- `FACT` / `ESTIMATE` / `ASSUMPTION` / `PROPOSED` tags follow `RULES.md`.
- **State of the code, 23 Sep** `FACT`: `anchor/`, `server/`, `app/`, `dashboard/` and `shared/` hold only READMEs and `.gitkeep` files. `contracts/openapi.yaml` is still the v1 (UMOJA) surface. Almost every product control is therefore *In build* or *Planned*. That is the honest starting point.
- **Control count, 23 Sep** `FACT` (count of `C-nn` rows by status in this file): 79 controls — 14 Done, 30 In build, 31 Planned, 4 Not doing. Re-count before the Sonke submission.

## 1 · Frameworks we map to

| Framework | What we take from it | Source (retrieved 23 Sep 2026) |
|---|---|---|
| NIST SSDF SP 800-218 v1.1 (Feb 2022) | The four practice groups organise §3–§13: PO "people, processes, and technology are prepared"; PS "protect all components of their software from tampering and unauthorized access"; PW "minimal security vulnerabilities in its releases"; RV "identify residual vulnerabilities". | https://csrc.nist.gov/pubs/sp/800/218/final (PDF text) |
| OWASP MASVS v2.1.0 + MASTG | Android controls by group: STORAGE, CRYPTO, AUTH, NETWORK, PLATFORM, CODE, RESILIENCE, PRIVACY (§10). MASTG gives the test procedures. A literal MASTG description quote: NOT FOUND this session | https://mas.owasp.org/MASVS/ ; release "Introducing MASVS-PRIVACY", https://github.com/OWASP/masvs/releases |
| OWASP ASVS 5.0.0 (May 2025) | **Target Level 2** for the ANCHOR API and the verify page: "Level 2 represents a comprehensive view of standard security practices". Level 3 is not claimed. | ASVS 5.0.0 PDF, https://github.com/OWASP/ASVS/tree/v5.0.0 |
| OWASP API Security Top 10 (2023) | API1–API10 mapped in `THREAT-MODEL.md` §5 and `PENTEST-PLAN.md` | https://api-security.owasp.org/editions/2023/en/0x11-t10 |
| POPIA s19 | "identify all reasonably foreseeable internal and external risks" and "regularly verify that the safeguards are effectively implemented" — the legal reason this SSDLC exists | https://popia.co.za/section-19-security-measures-on-integrity-and-confidentiality-of-personal-information/ (Accessible Law copy ⚑ pending Gazette check) |

## 2 · Roles and RACI

People: **L** Lethabo (co-lead, spec, first reviewer) · **Si** Sibusiso (co-lead, server, contract, CI) · **I** Ipeleng (security, privacy, verify page, `shared/`) · **V** Vukosi (Android, measurements) · **M** Mutarisi (UI, APK backup) · **K** Khutso (evidence, delivery, `sim_bank`) · **B** Babatunde (business, deck).
R = does it · A = accountable, signs off · C = consulted · I = informed.

| Activity | L | Si | I | V | M | K | B |
|---|---|---|---|---|---|---|---|
| Requirements and spec changes (§2, §9) | A | R | C | C | C | I | I |
| Threat model and abuse-case specifications | C | C | **A/R** | C | I | C | I |
| Secure design decisions (ADRs) | A/R | A/R | C | I | I | I | I |
| Contract v2 and vectors | C | **A/R** | C | I | I | I | I |
| `shared/` canonical, DER, Merkle; verify page | C | C | **A/R** | I | C | I | I |
| Server security controls (auth, replay, outbox) | C | **A/R** | C | I | I | C | I |
| Android security controls (Keystore, storage, manifest) | C | I | C | **A/R** | R | I | I |
| Duress parity (pixels, timing) | A | C | C | R | **R** | I | I |
| FCM, SMS, `sim_bank` controls | I | C | C | I | I | **A/R** | I |
| SAST, SCA, secrets tooling in CI | C | **A/R** | R | R | I | I | I |
| Internal pentest (execution) | I | R | **A/R** | R | R | R | I |
| Release gates RG1–RG3 | **A** | R | R | R | R | R | I |
| Incident response | A | R | **R (lead)** | R | I | R | C |
| POPIA breach decision and notification | **A** | C | R | I | I | C | C |
| Privacy policy and s18 notice | A | C | **R** | I | C | I | C |
| Honesty ledger on slides | A | I | R | I | I | C | **R** |
| Sonke SSDLC submission | A | I | **R** | I | I | I | I |

`ASSUMPTION`: the leads hold the POPIA "head" role until they designate an Information Officer (decision D-IO-1, `docs/POPIA-IO-REGISTRATION.md`). Checked by Lethabo.

## 3 · Phase gates (SSDF PO/PW), mapped to spec §14

| Gate | When (SAST) | Security exit criterion | Owner |
|---|---|---|---|
| SG0 · Design | Thu 24 12:00 | PIN authority, incident rules and removal rules agreed (P3.L8). PR #43 blockers B1–B3 in the spec. The export-during-incident rule decided (T30) | Lethabo, Ipeleng |
| SG1 · Vectors | Thu 24 14:00 | T01 and T02 green in pytest and vitest, including rejection vectors | Sibusiso, Ipeleng |
| SG2 · Threat model | Thu 24 20:00 | Every STRIDE row maps to a spec ID and a test; T04–T24 and T30–T49 specified | Ipeleng |
| SG3 · APK | Thu 24 22:00 | Signed release APK; manifest check (C-31) and T17 recorded | Vukosi |
| RG1 · Thin slice | Fri 25 12:00 | Release gate RG1 (§11) | Lethabo |
| SG4 · Full server | Fri 25 23:59 | T06, T08 (or the stub fallback at 18:00), T11, T12, T19 run | Sibusiso |
| SG5 · SSDLC | Sat 26 11:00 | This file with every test status filled; submitted by 12:30 | Ipeleng |
| RG2 · Demo freeze | Sat 26 18:00 | Release gate RG2 (§11) | Lethabo |
| RG3 · Final gate | Sun 27 08:30 | Release gate RG3 (§11) | Lethabo |

## 4 · Requirements → threat model → secure design

1. **Requirements** are the spec IDs V1–V10, G1–G6, A1–A7, S1–S4, P1–P2, D1–D3 (`docs/VUKA-2-SPEC.md` §2). A control without a requirement is not built (the team's spec-driven method).
2. **Threat model:** `docs/security/THREAT-MODEL.md`. STRIDE per component and boundary, plus coercion threats. Every threat names a spec control and a test.
3. **Secure design** is fixed by ADR-0034 (machines notice, people decide), ADR-0035 (typed 33-byte messages, coalesced roots), ADR-0036 (PIN authority, duress no-ops, decoy guardian), ADR-0037 (bank signal never from detection alone) and ADR-0038 (no generative model).
4. **Abuse cases are executable tests**, not prose (`team/ipeleng.md`). Each gets a fixture, an oracle and prerequisites (P3.S3).

| ID | Control | Status | Evidence / test | Owner |
|---|---|---|---|---|
| C-01 | Requirements carry stable IDs; tests cite them | **Done** | `docs/VUKA-2-SPEC.md` §2, §15 | Lethabo |
| C-02 | ADRs append-only, acceptance recorded per decision | **Done** | `docs/adr.md`, `docs/ADR-ACCEPTANCE-RECORD.md` | Leads |
| C-03 | Security review recorded before a contract is frozen | **Done** | Closure table in `docs/ADR-ACCEPTANCE-RECORD.md` on `main`; full text `docs/reviews/IPELENG-PR43-REVIEW.md` is on branch `docs/ipeleng-pr43-review` (PR #45), not yet on `main` at `847225e` `FACT` | Ipeleng |
| C-04 | STRIDE threat model mapped to spec IDs and tests | **In build** | `docs/security/THREAT-MODEL.md`; P3.S3 | Ipeleng |
| C-05 | Abuse-test specifications T04–T24, T30–T49 | **In build** | P3.S3, Thu 20:00 | Ipeleng |
| C-06 | Requirement → owner → test trace | **In build** | `docs/REQUIREMENTS-TRACE.md`, P3.K3 | Khutso |
| C-07 | Honesty ledger as a governance control | **Done** | `docs/MASTER-CONTEXT.md` §6; spec §17 | Khutso |
| C-08 | Open-gap register, public | **Done** | `docs/OPEN-GAPS.md` | Khutso |

## 5 · Secure coding standards per stack (SSDF PW.5)

Each rule is checked by the named test, tool or review. "Review" means the PR reviewer ticks it in the PR body.

### 5.1 Kotlin / Android (VIGIL native layer)

| ID | Rule | Status | Checked by | Owner |
|---|---|---|---|---|
| C-10 | Event keys: P-256 in Android Keystore, StrongBox when present, non-exportable (V7) | **In build** | T03 fixture; code review | Vukosi |
| C-11 | Salts and nonces from `java.security.SecureRandom` only, never JS (V7) | **In build** | T18 | Vukosi |
| C-12 | PIN checked on device with Argon2id; hash in Keystore-wrapped storage; `pin_authorised` bound to one action and target (§9) | **In build** | T12, T16, T36 | Vukosi |
| C-13 | Foreground service type built from granted permissions; no start from background; no boot receiver (V2, V10) | **In build** | T17, T41 | Vukosi |
| C-14 | Only the launcher activity is `exported`; every other component `exported="false"` | **Planned** | T41 (`apkanalyzer manifest print`) | Vukosi |
| C-15 | `allowBackup="false"` and data-extraction rules exclude the queue and keys | **Planned** | T42 | Vukosi |
| C-16 | `usesCleartextTraffic="false"`; network security config trusts system CAs only | **Planned** | T41; MobSF | Vukosi |
| C-17 | Encrypted local queue (AES-GCM, Keystore key) (V8) | **In build** | T42 | Vukosi |
| C-18 | Raw audio is never written to storage; only label and basis-point score leave the classifier (RICA bright line) | **In build** | T41 storage sweep | Vukosi |
| C-19 | No PIN, salt, payload, token or location in `Log.*`; release build strips debug logs | **Planned** | T46; semgrep | Vukosi |
| C-20 | Permissions limited to the judge-build list in spec §11; never `CAMERA`, `SEND_SMS`, `ACCESS_BACKGROUND_LOCATION`, `RECEIVE_BOOT_COMPLETED` | **In build** | T41 | Vukosi |

### 5.2 React Native / JavaScript (VIGIL UI, `shared/`)

| ID | Rule | Status | Checked by | Owner |
|---|---|---|---|---|
| C-21 | One canonicaliser, `shared/canonical.js`; no floats; ASCII keys; safe integers (§5) | **In build** | T01 | Ipeleng |
| C-22 | DER → raw r‖s only in `shared/der.js` (§5.7) | **In build** | T03 | Ipeleng |
| C-23 | No secrets in the JS bundle (it is extractable). Server credentials never ship in the app | **Planned** | gitleaks on the APK's `index.android.bundle`; MobSF | Vukosi |
| C-24 | No `eval`, `new Function` or dynamic `require` | **Planned** | eslint-plugin-security (§8) | Mutarisi |
| C-25 | Normal and duress PIN code paths share one render, one haptic, one request builder and one response wait (V5) | **In build** | T15, T31 | Mutarisi, Vukosi |
| C-26 | No guardian acknowledgement on the member's phone during an open incident; incident events hidden from My Record until close (V8) | **In build** | T15 extension; review | Mutarisi |
| C-27 | Exact dependency versions (no `^` or `~`) and a committed `package-lock.json` | **Planned** | `npm ci` in CI | Mutarisi |

### 5.3 Python server (ANCHOR)

| ID | Rule | Status | Checked by | Owner |
|---|---|---|---|---|
| C-30 | Order of checks: authenticate → `event_id` idempotency → nonce, counter, skew → append (§7) | **In build** | T06 | Sibusiso |
| C-31 | Signed statement binds domain, subject, actor, target, action, source time, key id, counter, event id and commitment (§4, B1) | **In build** | T21 | Sibusiso |
| C-32 | Deadlines from server receipt time only; window limited to 20 s or 60 s (§7, B4) | **In build** | T07, T23 | Sibusiso |
| C-33 | Outcome row locked (`SELECT … FOR UPDATE`); first terminal outcome wins; outbox in the same transaction (§8) | **In build** | T08, T23 | Sibusiso |
| C-34 | Parameterised SQL only; no string-built queries | **Planned** | bandit B608; semgrep | Sibusiso |
| C-35 | Request models reject unknown fields and floats | **Planned** | T01 rejection vectors; contract tests | Sibusiso |
| C-36 | Object-level authorisation on every `/v1/subjects/{id}/…` path: the key must belong to that subject (API1) | **In build** | T19, T49 | Sibusiso |
| C-37 | Rate limits on invites (per subject, device, IP), recovery and public endpoints (G1, API4) | **In build** | T14, T44 | Sibusiso |
| C-38 | Uniform error bodies; no stack traces; no personal data in logs | **Planned** | T46; ZAP baseline | Sibusiso |
| C-39 | Constant-time comparison for codes and hashes (`hmac.compare_digest`) | **Planned** | code review; semgrep | Sibusiso |
| C-40 | Payloads and salts stored apart from the chain and encrypted at rest; deletion removes only them (P1) | **In build** | T04 after deletion; review | Sibusiso |
| C-41 | Server response bytes and timing for normal and duress results identical; outbox work runs after the response (V5, S3) | **Planned** | T31 | Sibusiso |
| C-42 | Export PIN-gated and never reveals an open incident to the device (proposed fix for gap TM-C9) | **Planned** | T30 | Lethabo (spec), Sibusiso |
| C-43 | Post-recovery 24 h freeze extends to bulk export (S4) | **Planned** | T39 | Lethabo, Sibusiso |

### 5.4 Browser verify page (`dashboard/`)

| ID | Rule | Status | Checked by | Owner |
|---|---|---|---|---|
| C-50 | The export never leaves the browser: no upload, no analytics, no third-party script | **In build** | T32 (network log) | Ipeleng |
| C-51 | CSP `default-src 'none'; script-src 'self'; connect-src 'self' <pinned mirror host>; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` `PROPOSED` | **Planned** | T32; ZAP baseline | Ipeleng |
| C-52 | Export content rendered with `textContent` only, never `innerHTML` | **Planned** | T33 (XSS payload fixture) | Ipeleng, Mutarisi |
| C-53 | Pinned network, topic id and key-manifest fingerprint built into the page; mirror bytes decoded and compared with the recomputed root (§6, B2) | **In build** | T05, T22 | Ipeleng |
| C-54 | Three honest states: live-verified, archived ("archived — not independent"), unavailable (§10) | **In build** | T22; screenshot | Ipeleng |
| C-55 | WebCrypto for SHA-256 and P-256; no home-made crypto | **In build** | T03, T04 | Ipeleng |

### 5.5 CI and repository

| ID | Rule | Status | Checked by | Owner |
|---|---|---|---|---|
| C-60 | Actions pinned by commit SHA; `permissions: contents: read`; `persist-credentials: false` | **Done** | `.github/workflows/checks.yml` | Sibusiso |
| C-61 | Document contracts and claim safeguards in CI | **Done** | `scripts/check-docs.mjs` job | Sibusiso |
| C-62 | Contract tests (`node --test`) run in CI. **Gap:** 10/10 pass locally, but `checks.yml` does not run them `FACT` | **Planned** | new CI job | Sibusiso |
| C-63 | Branch protection requiring CI and non-author review | **Planned** — blocked: repo is private on the free tier; `gh api …/branches/main/protection` returned 403 on 23 Sep `FACT` (G17) | GitHub settings | Sibusiso |
| C-64 | CODEOWNERS auto-requests security review on `contracts/`, `server/`, `shared/`, `dashboard/` | **Done** | `.github/CODEOWNERS` | Leads |
| C-65 | Release APK built from a tag; sha256 published with the release (D1, T20) | **In build** | T20 | Vukosi |

## 6 · Dependencies and supply chain (SSDF PS.2, PS.3, PW.4)

| ID | Control | Status | Command / evidence | Owner |
|---|---|---|---|---|
| C-70 | Lockfiles committed: `package-lock.json`; Python requirements with hashes; Gradle dependency verification | **Planned** | `pip-compile --generate-hashes`; `pip install --require-hashes -r requirements.txt`; `./gradlew --write-verification-metadata sha256 help` | Sibusiso, Vukosi |
| C-71 | SCA on every PR | **Planned** | `npm audit --audit-level=high`; `pip-audit -r server/requirements.txt`; `osv-scanner scan source -r .` `ASSUMPTION`: flags checked on first run | Sibusiso |
| C-72 | Pinned toolchain: Node, Python, JDK 17, RN 0.74. Today `team/START-HERE.md` states minimums ("Node 22 LTS or newer"), not pins; add `engines` in `package.json` and `.python-version` | **Planned** | `team/START-HERE.md` §1–2 | Sibusiso |
| C-73 | Model-weights manifest with sha256; the app verifies the digest before loading; input shape asserted from `get_input_details()` (V3) | **In build** | YAMNet sha256 `10c95ea3…17de` recorded `FACT` (`docs/MODEL-CARDS.md`); P3.V2 | Vukosi |
| C-74 | Gitleaks binary pinned by version and sha256 | **Done** | `checks.yml` (8.24.3, `sha256sum --check --strict`) | Sibusiso |
| C-75 | SBOM (CycloneDX) for the APK and server | **Not doing** — no reviewer time this weekend; SCA (C-71) covers the known-CVE question. Post-hackathon | — | — |

**Severity rule** `PROPOSED`: a critical or high CVE in a shipped dependency blocks RG2 unless Ipeleng records a waiver in the PR (reachable? fix available? exposure in the demo?).

## 7 · Secrets (SSDF PS.1)

| ID | Control | Status | Evidence | Owner |
|---|---|---|---|---|
| C-80 | Pre-commit gitleaks scan of staged content; refuses commits if gitleaks is missing | **Done** | `.githooks/pre-commit`, `.gitleaks.toml` | Sibusiso |
| C-81 | CI scans full history and worktree | **Done** | `checks.yml` `secret-scan` | Sibusiso |
| C-82 | Hook failure behaviour tested in isolated fixtures | **Done** | `scripts/test-security.mjs` | Sibusiso |
| C-83 | `.env`, keys, keystores, service-account files, `*.tflite`, data files git-ignored | **Done** | `.gitignore` | Leads |
| C-84 | Runtime secrets (Hedera `submitKey`, server Ed25519 key, FCM service account, SMS key) only in App Service settings or a local `.env`; never in chat, issue or PR | **In build** | `team/START-HERE.md` §2; review | Sibusiso, Khutso |
| C-85 | Two distinct operators sign signing-key rotation, operator deletion and threshold changes (ADR-0036(8)) | **Planned** | T48 | Sibusiso |
| C-86 | APK signing keystore held by Vukosi and Mutarisi only, backed up offline; never committed | **In build** | review | Vukosi |

## 8 · SAST (SSDF PW.7) — free tools, exact commands

`FACT`: semgrep 1.164.0 is installed on Lethabo's machine; bandit, detekt and eslint are not installed there (checked 23 Sep). None of these has been run on product code, because there is no product code yet. Commands are `ASSUMPTION` until their first run is recorded.

| ID | Tool | Scope | Command | Fail rule | Status | Owner |
|---|---|---|---|---|---|---|
| C-90 | semgrep | all | `semgrep scan --config p/python --config p/javascript --config p/kotlin --config p/secrets --metrics=off --error --sarif --output semgrep.sarif` | any ERROR finding | **Planned** | Ipeleng |
| C-91 | bandit | `server/`, `anchor/` | `bandit -r server anchor -ll -f json -o bandit.json` | any medium+ finding unwaived | **Planned** | Sibusiso |
| C-92 | eslint + `eslint-plugin-security` | `shared/`, `dashboard/`, `app/src/` | `npx eslint --max-warnings=0 shared dashboard app/src` (flat config with `pluginSecurity.configs.recommended`) | any warning | **Planned** | Mutarisi |
| C-93 | Android lint | `app/android` | `./gradlew lintRelease` with `abortOnError true`, `warningsAsErrors true` for the Security category | any Security error | **Planned** | Vukosi |
| C-94 | detekt | Kotlin modules | `./gradlew detekt` (plugin `io.gitlab.arturbosch.detekt`) | any issue above baseline | **Planned** | Vukosi |

Findings go into `docs/security/PENTEST-RESULTS.md` (new, Sat), with rule id, file, decision (fix / waive with reason) and PR link.

## 9 · DAST — ZAP baseline (SSDF PW.8)

- The baseline "doesn't perform any actual 'attacks'" (ZAP docs, https://www.zaproxy.org/docs/docker/baseline-scan/, retrieved 23 Sep). That makes it safe on our own staging server.
- Command: `docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://<staging-host> -c zap-baseline.conf -r zap-report.html`. Docker is not installed on Lethabo's machine `FACT`; run it on a team laptop with Docker or in a CI job.
- Targets: the deployed ANCHOR API and the verify page. Our systems only.
- Pass rule `PROPOSED`: no FAIL-level rule; missing CSP, HSTS or anti-clickjacking headers are FAIL for the verify page.

| ID | Control | Status | Evidence | Owner |
|---|---|---|---|---|
| C-100 | ZAP baseline on staging API and verify page, report kept | **Planned** | `zap-report.html` → PENTEST-RESULTS | Ipeleng |
| C-101 | Active scan (`zap-api-scan.py` against the OpenAPI file) on staging only | **Planned** — only if time after RG1 | report | Sibusiso |

## 10 · Mobile checks — MobSF and MASVS

- **MobSF static scan** of the signed release APK: `docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest`, then upload the APK. `ASSUMPTION`: image name checked on first run. High findings are triaged in PENTEST-RESULTS.
- `apksigner verify --print-certs` and `apkanalyzer manifest print` on the same APK (T20, T41).

| MASVS v2 group | Our control | Test | Status |
|---|---|---|---|
| STORAGE | C-15, C-17, C-18 | T41, T42 | Planned / In build |
| CRYPTO | C-10, C-11, C-21, C-22 | T01, T03, T18 | In build |
| AUTH | C-12, PIN authority §9 | T12, T16, T36 | In build |
| NETWORK | C-16; request signing §7 | T06, T41 | Planned / In build |
| PLATFORM | C-13, C-14, C-20; full-screen intent (V4) | T17, T41 | In build / Planned |
| CODE | C-19, C-24, C-27, C-73 | SAST, T45 | Planned |
| RESILIENCE | root/emulator detection, anti-tamper | — | **Not doing** (C-110): key attestation is stored, not verified (G32); we claim no tamper resistance |
| PRIVACY | V9 (no location in heartbeats), C-18, spec §13 | T41, T46 | In build |

| ID | Control | Status | Evidence | Owner |
|---|---|---|---|---|
| C-102 | MobSF static scan of the release APK | **Planned** | report in PENTEST-RESULTS | Vukosi |
| C-110 | Root, emulator and hooking detection | **Not doing** — cannot be made reliable on a sideloaded build by Sunday; stated as G32 | `docs/OPEN-GAPS.md` G32 | — |
| C-111 | TLS certificate pinning in the app | **Not doing** — a wrong pin bricks the demo phone mid-event; request signing (§7) already stops tampering in transit. Revisit post-hackathon | — | — |
| C-112 | Play Integrity verdicts | **Not doing** — needs Play distribution; the demo is sideloaded (spec §11) | spec §11 | — |

## 11 · Release gates — pass/fail

| Gate | Pass only if all are true | Fail action |
|---|---|---|
| **RG1 · Fri 25 12:00** thin slice | T01, T02 green in CI; T03 and T04 green on verify-min; no secret found by `gitleaks git`; export endpoint requires subject auth (T19 export half); APK is the signed release build or the debug build is declared aloud | Slice demo stays local; no public URL shared |
| **RG2 · Sat 26 18:00** demo freeze | Everything in RG1, plus T06, T11, T12, T15, T16, T21, T22 green or recorded "not run" with owner; ZAP baseline has no FAIL on the verify page; MobSF has no unwaived high; no unwaived critical/high CVE; every simulated part labelled SIMULATED; `sim_bank` only | The failing feature is cut per spec §14 cut line, not patched past midnight |
| **RG3 · Sun 27 08:30** final gate | RG2 still true on the submitted commit; PENTEST-RESULTS lists every PT case pass/fail/not run; honesty slide carries G8, G26, G27, G32 and the B2/B3 lines; no claim of "unhackable", "court-admissible", "pentested" | Remove the claim, not the evidence |

## 12 · Incident response (SSDF RV.1–RV.3)

**Roles:** Incident lead Ipeleng · Server Sibusiso · App Vukosi · Evidence log Khutso · Decision and external communication Lethabo · Partner and deck Babatunde.

| Step | Target time `PROPOSED` | What | Owner |
|---|---|---|---|
| Detect | T+0 | Anyone who sees a secret, a data leak, a broken duress parity or a false alert posts "INCIDENT" in the team channel, without pasting the secret | Anyone |
| Contain | T+15 min | Revoke or rotate first (`SECURITY.md`); disable the demo path or roll back to the last RG commit (`RULES.md` weekend hotfix) | Sibusiso / Vukosi |
| Record | T+30 min | New `docs/build-log/entries/<date>-<name>-incident-<slug>.md`: what, when, scope, actions. No secret values | Khutso |
| Assess | T+2 h | Was personal information accessed or acquired by an unauthorised person? Whose (team member, guardian, `sim_` fixture)? | Ipeleng |
| Decide | T+4 h | Leads decide on s22 notification (below) | Lethabo, Sibusiso |
| Fix | before next gate | Patch with second-person review, security scan and focused test; no deadline exception for secrets, privacy or authority boundaries | Owner of the area |

### 12.1 POPIA security-compromise runbook

During the event, personal data is only the team's own: test journeys carry real team phones' locations, and guardians are team members. `sim_` fixtures are not personal information.

1. **Trigger:** "reasonable grounds to believe that the personal information of a data subject has been accessed or acquired by any unauthorised person" (POPIA s22(1)).
2. **Regulator:** notify through the eServices portal. Since 1 Apr 2025 the Regulator says the portal "is mandatory for all organisations to report any security compromises" (media statement, 7 Apr 2025, https://inforegulator.org.za/wp-content/uploads/2025/04/MEDIA-STATEMENT-INVITATION-TO-REPORT-SECURITY-COMPROMISES-THROUGH-THE-eSERVICES-PORTAL-.pdf). Portal: https://eservices.inforegulator.org.za/compromises/default.aspx.
3. **Timing:** "as soon as reasonably possible after the discovery of the compromise" (s22(2)). The Act sets no fixed hours. Internal target `PROPOSED`: draft within 24 h of discovery; leads submit within 72 h.
4. **Data subjects:** notify each affected person in writing unless a public body or the Regulator says it would impede a criminal investigation (s22(3)). The content list in s22(4)–(5): NOT FETCHED this session — Ipeleng reads it before Friday.
5. **Blocker, stated:** no Information Officer is registered (D-IO-1). Until the leads register one, the head of the responsible party carries the duty (`docs/POPIA-IO-REGISTRATION.md` §1).

| ID | Control | Status | Evidence | Owner |
|---|---|---|---|---|
| C-120 | Incident roles and steps written | **In build** | this section | Ipeleng |
| C-121 | 15-minute tabletop of one leaked-key and one location-leak scenario | **Planned** | build-log entry | Ipeleng |
| C-122 | Secret-exposure procedure: revoke first | **Done** | `SECURITY.md` "If exposure is found" | Sibusiso |

## 13 · Change control

- Every change is a PR with the template; both leads review; build-weekend fast path is one lead plus one non-author domain reviewer (`RULES.md`).
- Contract, ADR, security-boundary and governance changes always need both leads, plus Ipeleng for security.
- **Two-signature rule** (ADR-0036(8)): two distinct operators sign operator deletion, detection-threshold changes and signing-key rotation (C-85).
- A decision in a comment is not enforced until it is a rule in `RULES.md` or a standing doc.

**Tracked conditions from Ipeleng's PR #43 review** (`docs/ADR-ACCEPTANCE-RECORD.md`):

| ID | Condition | Owner | Due | Test / evidence | Status |
|---|---|---|---|---|---|
| B1 | Remaining guardians told of additions and scheduled removals, naming the other party; ADR-0036(5) qualified to one session; §17 line; T24 extended | Lethabo (spec), Ipeleng (test) | Thu 24, §8/§9 meeting | T24, T37 | **Open** |
| B2 | §17: a compromised server can suppress or fabricate escalation; independent witnesses are the guardian's own-key ack and the bank | Lethabo | Thu 24 | §17 text; T08 for durability only | **Open** |
| B3 | §17: the unlocked phone can force a `no_answer` escalation and bank signal; `signal_detected` carries location | Lethabo | Thu 24 | §17 text; recorded observation | **Open** |
| S1 | `bank_signal_sent` records its trigger | Sibusiso | contract v2 | T38 | **Open** |
| S2 | Onboarding recommends ≥ 2 guardians; §17 lone-guardian line | Vukosi, Mutarisi | before RG2 | copy review | **Open** |
| S3 | Privacy-policy text: residuals, cooling-off, hash permanence, guardian departure, bank as recipient | Ipeleng | Sat 18:00 | `docs/PRIVACY-POLICY.md` | **Open** |
| S4 | 24 h post-recovery freeze covers bulk export | Lethabo | with §9 | T39 | **Open** |

## 14 · Evidence for the Sonke SSDLC submission

| Sonke section | What we submit | Source file | Ready when |
|---|---|---|---|
| Requirements | Spec IDs and the security requirements S1–S4, P1–P2 | spec §2 | now |
| Threat model | STRIDE tables and coercion threats | `docs/security/THREAT-MODEL.md` | Thu 20:00 |
| Secure design | ADR-0034–0038 with acceptance record | `docs/adr.md` | now |
| Secure coding | §5 of this file; `RULES.md` | this file | Sat 09:00 |
| Testing | T01–T24, T30–T49 with status (pass / fail / not run) | PENTEST-RESULTS; CI links | Sat 10:30 |
| Tooling | gitleaks (Done); SAST, SCA, ZAP, MobSF with run date or "not run" | §6–§10 | Sat 10:30 |
| Deployment | RG1–RG3; signed APK sha256; staging URL (no secrets) | §11 | Sat 10:30 |
| Incident response | §12 and the POPIA runbook | §12 | now |
| Privacy | Lawful basis, retention, operators | `docs/security/COMPLIANCE-GOVERNANCE.md` | Sat 10:30 |
| Honest limits | No independent pentest (G8); attestation unverified (G32); detection uncalibrated (G27) | `docs/OPEN-GAPS.md` | now |

**Not to submit:** anything with a secret, a real location, a phone number, or a screenshot of a private organiser message.

## 15 · Limitations, stated first

- The code does not exist yet. Controls marked Done are repository and process controls, not product controls.
- There is no independent penetration test (G8). Our internal test (`PENTEST-PLAN.md`) is not one.
- Branch protection is unavailable while the repository is private on the free tier (G17). CI is advisory.
- ASVS Level 2 and MASVS are targets we map to, not certifications we hold.
