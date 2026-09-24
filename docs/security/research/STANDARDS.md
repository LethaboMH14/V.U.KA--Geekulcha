# VUKA security-standards research — versions, control IDs, repo mapping

> Retrieved 24 Sep 2026. Repo baseline read: `docs/security/SSDLC.md`, `THREAT-MODEL.md`, `PENTEST-PLAN.md`, `COMPLIANCE-GOVERNANCE.md`, `docs/VUKA-2-SPEC.md` (§4–§10, §15, §17), all at `C:\Users\USER\AppData\Local\Temp\vuka-pivot`.
> Method: WebFetch/WebSearch against primary sources. Every row below is either a literal quote (<30 words, quoted) with URL, or marked ⚑ where the source page would not yield a literal quote to the fetch tool (paraphrase only, general knowledge corroborates it).
> Repo control refs: `C-nn` = SSDLC.md, `T-nn`/`PT-nn` = spec/PENTEST-PLAN test IDs. "GAP" = no existing repo control found.

---

## 0 · Versions confirmed (do not guess — these are what to cite)

| Standard | Version in use | Confirmed current? | Source |
|---|---|---|---|
| OWASP MASVS | **v2.1.0** (18 Jan 2024), 8 categories, 24 controls, adds MASVS-PRIVACY | Yes, still current 2026 | https://mas.owasp.org/news/2024/01/18/masvs-v210-release--masvs-privacy/ |
| OWASP MASTG | Companion to MASVS v2.1.0; test IDs format `MASTG-TEST-nnnn` | Yes | https://mas.owasp.org/MASTG/ |
| OWASP ASVS | **v5.0.0** (May 2025), released at Global AppSec EU Barcelona | Yes — repo already targets this correctly | https://github.com/OWASP/ASVS/tree/v5.0.0 |
| OWASP API Security Top 10 | **2023 edition** — no 2025 refresh exists for the API-specific project (the general web OWASP Top 10 got a 2025 edition; API Security Top 10 is a separate project, still on 2023) | Yes, repo citation correct | https://api-security.owasp.org/editions/2023/en/0x11-t10 |
| NIST SP 800-218 SSDF | **v1.1** (Feb 2022) is the only **final** version | v1.2 exists only as an **Initial Public Draft** (SP 800-218r1), published 17 Dec 2025, comment period to 30 Jan 2026 — **not final, do not cite as current** | https://csrc.nist.gov/pubs/sp/800/218/final ; https://www.nist.gov/news-events/news/2025/12/secure-software-development-framework-ssdf-version-12-available-public |
| LINDDUN | Current category names (renamed from the original acronym): Linking, Identifying, Non-Repudiation, Detecting, Data Disclosure, Unawareness & Unintervenability, Non-Compliance | Yes | https://linddun.org/threat-types/ |
| CVSS | **v4.0** (released 1 Nov 2023; spec document dated 2024-06-18) | Yes | https://www.first.org/cvss/v4-0/ ; https://www.first.org/cvss/v4-0/cvss-v40-specification.pdf |
| SLSA | **v1.2** (announced Nov 2025) is current; v1.1 (Apr 2025) is the prior Approved spec; both backward-compatible with v1.0 | v1.2 adds a Source Track on top of v1.0/1.1's Build Track — for VUKA's APK/container builds, the Build Track levels (unchanged since v1.0) are what apply | https://slsa.dev/spec/v1.2/ ; https://slsa.dev/blog/2025/11/announce-slsa-v1.2 |
| Android 14 foreground-service types | Current guidance, page last verified live | — | https://developer.android.com/about/versions/14/changes/fgs-types-required |
| Hedera HCS | Current docs.hedera.com | — | https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service/submit-a-message |

**Correction to log for the team:** `SSDLC.md` §1 cites NIST SSDF "v1.1 (Feb 2022)" — this is still correct and should **not** be bumped to v1.2, which is only a draft. No change needed there.

---

## 1 · OWASP MASVS v2.1.0 + MASTG — VIGIL (Android)

8 groups, 24 controls total. MASTG-TEST-nnnn IDs are illustrative examples per group (full list is much longer; team should pull the exact subset touching VIGIL's actual surface from `mas.owasp.org/MASTG/` when writing PENTEST-RESULTS).

| MASVS group | Quote (paraphrase, source didn't yield exact control text this session ⚑) | Example MASTG test IDs | VIGIL component | Repo control | Status |
|---|---|---|---|---|---|
| MASVS-STORAGE | Sensitive data handling at rest | MASTG-TEST-0001 (local storage), MASTG-TEST-0009 (backups) | Encrypted local queue, PIN hash | C-15, C-17, C-42 (SSDLC.md §5.1/§10) | Mapped — T41/T42 |
| MASVS-CRYPTO | Cryptographic implementation & key management | MASTG-TEST-0013 (symmetric crypto), MASTG-TEST-0016 (RNG) | Keystore P-256 signing, SecureRandom nonces | C-10, C-11, C-21, C-22 | Mapped — T01, T03, T18 |
| MASVS-AUTH | Authentication & session mechanisms | MASTG-TEST-0017 (confirm credentials), MASTG-TEST-0018 (biometric auth) | Argon2id PIN check, `pin_authorised` | C-12, spec §9 | Mapped — T12, T16, T36 |
| MASVS-NETWORK | Secure network communication | MASTG-TEST-0019 (encryption in transit), MASTG-TEST-0022 (cert pinning) | Request signing over HTTPS | C-16; spec §7 | Mapped for TLS (T41); **GAP: no cert pinning** — repo explicitly "Not doing" (C-111), a documented trade-off, not an oversight |
| MASVS-PLATFORM | Platform API / permission usage | MASTG-TEST-0024 (app permissions), MASTG-TEST-0031 (WebView JS) | Foreground-service type, exported components, judge-build permission list | C-13, C-14, C-20 | Mapped — T17, T41 |
| MASVS-CODE | Code quality, build config, dependency hygiene | MASTG-TEST-0025 (injection), MASTG-TEST-0042 (3rd-party lib weaknesses) | No `eval`, exact dep pins, model-weight sha256 | C-19, C-24, C-27, C-73 | Mapped — SAST (§8 of SSDLC), T45 |
| MASVS-RESILIENCE | Anti-tamper / reverse-engineering defence | MASTG-TEST-0045 (root detection), MASTG-TEST-0051 (obfuscation) | — | **GAP, explicitly** — repo's own table (SSDLC.md §10) already says "Not doing (C-110): key attestation is stored, not verified (G32); we claim no tamper resistance." Correctly disclosed, not silently missing. |
| MASVS-PRIVACY | User-data minimisation, consent, on-device privacy | MASTG-TEST-0206 (undeclared PII in traffic), MASTG-TEST-0254 (dangerous permissions) | No location in heartbeats, no raw audio persisted | V9, C-18 | Mapped — T41, T46 |

**Team note:** SSDLC.md §10 already has a MASVS-group table (lines 219–228) — this section should be treated as the authoritative extension of it, adding literal test-ID granularity, not a competing structure.

---

## 2 · OWASP ASVS v5.0.0 — ANCHOR API + verify page, Level 2

Chapter renumbering changed substantially from 4.0.3 to 5.0.0 (merged/renamed chapters). Confirmed chapter list (from the v5.0.0 tag structure):

| Chapter | Title | Relevant VUKA surface | Example requirement (Level) | Repo control | Status |
|---|---|---|---|---|---|
| V1 | Encoding and Sanitization | Export/verify-page rendering | — | C-52 (`textContent` only) | Mapped |
| V2 | Validation and Business Logic | Contract v2 request validation | — | C-35 (reject unknown fields/floats) | Mapped |
| V3 | Web Frontend Security | Verify page | — | C-51 CSP, C-50 no upload | Mapped |
| V4 | API and Web Service | ANCHOR endpoints | V4.1.1 (L1): "every HTTP response with a message body contains a Content-Type header field that matches the actual content" | C-38 (uniform error bodies) | Partial — **GAP: Content-Type header consistency not an explicit control**; add to C-38 or new row |
| V5 | File Handling | N/A (no file upload surface) | — | — | N/A |
| V6 | Authentication | Request signing, PIN, recovery | V6.2.1 (L1): password-length style rule (N/A — VUKA uses PIN+Keystore, not passwords) | §7, §9 | Mapped, but **note: ASVS's password-based V6 controls don't map cleanly to VUKA's signature+PIN model — team should state this explicitly rather than force-fit** |
| V7 | Session Management | Nonce/counter/replay window | — | §7 (nonces, counters, skew) | Mapped — T06 |
| V8 | Authorization | BOLA/BFLA on subject endpoints | — | C-36 (object-level auth), two-signature rule | Mapped — T19, T49, T48 |
| V9 | Self-contained Tokens | N/A — no JWT/self-contained token scheme in contract v2 | — | — | **GAP or N/A — confirm no token scheme is silently missing an ASVS check** |
| V10 | OAuth and OIDC | N/A — VUKA doesn't use OAuth | — | — | N/A |
| V11 | Cryptography | Ed25519/P-256 signing, SHA-256 canonical hashing | — | §4, §5, C-10, C-22 | Mapped — T01, T03, T21 |
| V12 | Secure Communication | TLS for API and verify page | — | C-16 | Mapped |
| V13 | Configuration | CORS, headers, debug mode off | — | C-38, C-51 | Mapped — ZAP baseline (C-100) |
| V14 | Data Protection | Payload/salt separation, deletion | — | C-40, P1, P2 | Mapped — T04 |
| V15 | Secure Coding and Architecture | SAST/dependency hygiene | — | §5–§8 of SSDLC | Mapped |
| V16 | Security Logging and Error Handling | No secrets in logs | — | C-38, C-46(T46) | Mapped |

Level 2 definition ⚑ (paraphrase, literal <30-word quote not retrievable from the fetched page this session): ASVS 5.0.0 targets Level 2 as "the recommended level for most applications... adequately defends against most of the risks associated with software today." Matches `SSDLC.md` §1's own citation of "a comprehensive view of standard security practices" — team should re-verify that exact phrase against the PDF (not fetchable as plain text this session) before quoting it on a slide.

**Gap count for ASVS:** 2 explicit (V4 Content-Type consistency, V9 self-contained tokens N/A-confirmation) out of 16 chapters mapped.

---

## 3 · OWASP API Security Top 10 (2023) — endpoint mapping

Repo already has this exact table in `THREAT-MODEL.md` §5 (lines 156–171) and it is accurate against the 2023 edition. Reproduced here with the repo's own control refs, confirmed against https://api-security.owasp.org/editions/2023/en/0x11-t10 (retrieved 23 Sep 2026 per repo, re-confirmed 24 Sep this session — no successor edition exists):

| API risk | VUKA endpoint | Repo control | Test | Status |
|---|---|---|---|---|
| API1 Broken Object Level Authorization | `/v1/subjects/{id}/export`, `/record`, `/data` | C-36 | T19, T49 | Mapped |
| API2 Broken Authentication | request signing, recovery code | §7, §9 | T06, T13, T35 | Mapped |
| API3 Broken Object Property Level Authorization | `kind`/`mode` leak in public/panel responses | A6 | T19 | Mapped |
| API4 Unrestricted Resource Consumption | invites, recovery, public proof | C-37 | T14, T44 | Mapped |
| API5 Broken Function Level Authorization | operator deletion, threshold, key rotation | two-signature rule | T48 | Mapped |
| API6 Unrestricted Access to Sensitive Business Flows | bank signal, guardian changes | S1, §9 | T11, T12 | Mapped |
| API7 SSRF | none planned — fixed allow-list (Hedera, sim_bank) | fixed allow-list | PT-38 | Mapped (by absence of the surface) |
| API8 Security Misconfiguration | headers, CORS, debug mode | C-38, C-51 | ZAP baseline | Mapped, **but ZAP itself is still Planned (C-100)** — control exists on paper only until run |
| API9 Improper Inventory Management | v1 UMOJA paths in `contracts/openapi.yaml` | marked deprecated | PT-39 | Mapped |
| API10 Unsafe Consumption of APIs | mirror-node response parsing | decode + length-check 33 bytes | T22, T33 | Mapped |

**Gap count: 0 unmapped** — this is the strongest-covered standard in the repo. Residual risk is execution (many rows are "Planned" not "Done"), not design gaps.

---

## 4 · NIST SP 800-218 SSDF v1.1 — practice-group evidence

Four groups, literal quotes from the final PDF (https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf; short-form quotes as already captured by the repo, re-verified this session):

| Group | Quote | VUKA evidence a small team can show | Repo control | Status |
|---|---|---|---|---|
| PO — Prepare the Organization | "people, processes, and technology are prepared to perform secure software development" | RACI (SSDLC.md §2), phase gates §3 | C-01–C-08 | Mapped |
| PS — Protect the Software | "protect all components of their software from tampering and unauthorized access" | Secrets handling §7, key registry §4a, signed-APK release | C-80–C-86, C-65 | Mapped |
| PW — Produce Well-Secured Software | "minimal security vulnerabilities in its releases" | Secure coding standards §5, SAST §8, DAST §9 | C-10–C-94 | Mapped, mostly Planned |
| RV — Respond to Vulnerabilities | "identify residual vulnerabilities... respond appropriately" | Incident response §12, PENTEST-RESULTS | C-120–C-122 | Mapped |

**Gap count: 0 structural** — every PO/PS/PW/RV group already has a home in SSDLC.md. The honest gap is **execution status**: of 79 total controls (SSDLC.md's own count), 30 are "In build" and 31 "Planned" as of 23 Sep — i.e. the mapping is complete, the evidence mostly is not yet.

---

## 5 · LINDDUN privacy threat modelling — alongside STRIDE

Category names per https://linddun.org/threat-types/ (current naming, differs from the original 2010 acronym letters — repo should use these names, not force old letter labels):

| LINDDUN category | Quote | Where it applies in VUKA | STRIDE row it complements | Repo control | Status |
|---|---|---|---|---|---|
| Linking | "Associating data items or user actions to learn more about an individual or group" | Guardian graph, journey history correlation across subjects | SV-6 (I, BOLA) | **GAP — THREAT-MODEL.md has no explicit linkability analysis of the guardian/subject graph** | GAP |
| Identifying | "Learning the identity of an individual, through leaks, deduction, or inference" | Location on `signal_detected`, coarse-class residuals after deletion | PH-7, PO-3 (COMPLIANCE-GOVERNANCE) | Partially mapped via P1/P2 | Partial |
| Non-Repudiation | "Being able to attribute a claim to an individual" | **Inverted use case for VUKA** — the anchor chain deliberately maximises non-repudiation (this is the product). LINDDUN normally treats this as a privacy *threat* (unwanted attribution); VUKA should state explicitly that non-repudiation is an intentional design goal, not an unmitigated threat, to avoid a judge reading it as an oversight | §4 signed statements, ANCHOR by design | GV-1 honesty ledger | Explicitly reasoned, not a gap — but **not yet written down as a LINDDUN-framed statement** |
| Detecting | "Deducing the involvement of an individual through observation" | HCS public-topic timing (minute-level activity visible even with coalescing) | HD-4 | Stated residual, "minute-level activity visible" | Mapped, residual accepted |
| Data Disclosure | "Excessively collecting, storing, processing or sharing personal data" | Raw audio never persisted, location minimisation | V3, V9, P1 | C-18, PO-5 | Mapped |
| Unawareness & Unintervenability | "Insufficiently informing, involving or empowering individuals in the processing of their personal data" | Guardian s18 notice, subject export/deletion | G6, A5, DELETE endpoint | PO-1, PO-4, PO-10 | Mapped |
| Non-Compliance | "The system deviates from security and data management best practices, standards and legislation" | POPIA gaps register (PO-3, PO-8, PO-11 all ⚑-flagged for counsel) | — | COMPLIANCE-GOVERNANCE.md §8 (Q-C1–Q-C7) | Mapped — already the repo's strongest section |

**Gap count: 1 explicit (Linking/linkability of the guardian graph not modelled), 1 needs reframing (Non-Repudiation as intentional).**

---

## 6 · CVSS v4.0 — for scoring PENTEST-RESULTS findings

Quote: "Finer granularity through the addition of new Base metrics and values" including a new Attack Requirements (AT) metric; retires Scope, splits impact into Vulnerable System (VC/VI/VA) and Subsequent System (SC/SI/SA) impacts. Source: https://www.first.org/cvss/v4-0/ ; spec PDF https://www.first.org/cvss/v4-0/cvss-v40-specification.pdf (2024-06-18 revision).

| Repo artefact | Current scoring method | Gap |
|---|---|---|
| `PENTEST-PLAN.md` pass/fail matrix (PT-01…PT-64) | Binary pass/fail only, no severity score | **GAP — no CVSS score assigned to any finding category.** For findings that do fail, PENTEST-RESULTS.md (not yet written) should score each with CVSS v4.0 vector strings, not just pass/fail, so severity triage (e.g. "critical/high CVE blocks RG2" language already used in C-71's severity rule) has a consistent basis across dependency CVEs (which arrive with a CVSS score from the advisory) and internal pentest findings (which currently would not) |
| SCA severity rule (SSDLC.md §6, "a critical or high CVE... blocks RG2") | Uses CVE severity as reported by the advisory (source CVSS version unspecified) | **GAP — no stated CVSS version for triage; should state v4.0 (or v3.1 if the advisory only publishes that) explicitly** |

---

## 7 · SLSA v1.2 (Build Track, compatible back to v1.0) — APK + container

Build levels (source: https://slsa.dev/spec/v1.2/ and https://slsa.dev/spec/v1.0/levels, quotes stable across v1.0–v1.2 for the Build Track):

| Level | Quote | Achievable with GitHub Actions? | VUKA artefact | Repo control | Status |
|---|---|---|---|---|---|
| Build L0 | "No requirements—L0 represents the lack of SLSA" | trivially | — | — | N/A |
| Build L1 | "Package has provenance showing how it was built" | Yes — GitHub Actions workflow run produces provenance metadata even without a dedicated generator | APK (Gradle build), ANCHOR container image | **GAP — no provenance is currently generated for the release APK or a server container image** | GAP |
| Build L2 | "Forging the provenance or evading verification requires an explicit attack" | Yes — GitHub-hosted runners + the official `slsa-framework/slsa-github-generator` reusable workflow satisfy L2 for artifacts built by a trusted build platform | Same | **GAP — same** | GAP |
| Build L3 | "Forging the provenance or evading verification requires exploiting a vulnerability that is beyond the capabilities of most adversaries" | Requires hardened, isolated ephemeral build environments — GitHub-hosted runners with the SLSA generator's isolation model can reach this for many artifact types, but it needs explicit adoption, not default | Same | Not targeted | N/A for a hackathon weekend |

**Recommendation for the team (not a claim, a gap):** C-65 ("Release APK built from a tag; sha256 published with the release") gives ad hoc provenance (a published digest) but is **not SLSA provenance** (no signed attestation, no build-platform identity binding). Adopting `slsa-framework/slsa-github-generator`'s generic generator for the APK artifact would cost one CI job and reach Build L2 — cheap, and directly supports D14's honesty-ledger stance ("checkable, not trusted"). Flagged as a real, low-cost gap.

**Gap count: 2 of 3 achievable levels unimplemented (L1, L2); L3 correctly not targeted.**

---

## 8 · Android specifics

| Control area | Quote | VUKA relevance | Repo control | Status |
|---|---|---|---|---|
| Keystore attestation | StrongBox "also supports key attestation"; StrongBox requires "Its own CPU... Secure storage... A true random-number generator..." | V7 (P-256 Keystore, StrongBox when present) | C-10 | Mapped, but **spec §11 and C-110 already state attestation is "stored, not verified" (`stored_unverified`) — this is a correctly disclosed gap, not silent** |
| Play Integrity API | "Call the Integrity API... to check that user actions and requests are coming from your unmodified app binary, installed by Google Play, running on a genuine Android device" (Standard vs Classic API) | N/A for a sideloaded demo build | C-112 | **Correctly "Not doing"** — repo reasoning: "needs Play distribution; the demo is sideloaded" |
| Android 14 foreground-service types — microphone | "you cannot create a `microphone` foreground service while your app is in the background" + requires `FOREGROUND_SERVICE_MICROPHONE` and `RECORD_AUDIO` runtime grant | V1, V2, V10 | C-13 | Mapped — T17, T41 |
| Android 14 foreground-service types — location | "cannot create a `location` foreground service while your app is in the background, unless you've been granted `ACCESS_BACKGROUND_LOCATION`" | V2 (location only if granted) — VUKA correctly never requests `ACCESS_BACKGROUND_LOCATION` (spec §11 judge-build permission list) | C-13 | Mapped |
| Exported components | Default: "the absence of any filters means... the default value is `false`"; presence of an intent filter defaults to `true`, so must be set explicitly | C-14 (only launcher exported) | T41 (`apkanalyzer manifest print`) | Mapped, but **currently "Planned" not "Done"** |
| `FLAG_SECURE` | Blocks screenshots, screen recording, casting, and Recents-screen previews of a marked window ⚑ (paraphrase; exact android.com wording not retrievable this session — corroborated by multiple secondary Android security sources) | **GAP — not mentioned anywhere in the repo.** The check-in screen (V4/V5, duress-parity screens) and any screen showing `duress_pin`-adjacent state should set `FLAG_SECURE` so a bystander's screen-recording app, or Android's own screenshot-to-clipboard/Recents thumbnail, can't leak the check-in UI. This directly supports S3 ("nothing an attacker can observe reveals that duress was signalled") — currently S3's controls are all about network/timing parity, not screen-capture surface | **GAP — new control needed, call it C-19a or fold into V4/V5 tests (T15)** |

**Gap count: 1 clear new gap (FLAG_SECURE), 3 already-disclosed accepted gaps (attestation unverified, Play Integrity N/A, exported-components still Planned).**

---

## 9 · Hedera HCS — submitKey and running-hash verification

| Control | Quote | VUKA relevance | Repo control | Status |
|---|---|---|---|---|
| submitKey | "you can create a private topic where only authorized parties can submit messages... by setting the submitKey"; without it "anyone can submit" to a public topic | HD-1 (third party posts to our topic) | ADR-0035 (topic created with submitKey) | Mapped — T43 |
| Running hash / sequence verification | Mirror-node topic-message responses carry `running_hash`, `running_hash_version` and `sequence_number` fields ⚑ (field names and presence confirmed directly from the API schema at https://docs.hedera.com/api-reference/topics/get-topic-message-by-consensustimestamp; the exact hashing algorithm description — SHA-384 chained over prior running hash + sequence number + consensus timestamp + message — is Hedera's documented behaviour but a literal <30-word quote could not be pulled from a fetchable page this session, so mark ⚑ for the algorithm detail specifically, not for the fields' existence) | §6 verify-page flow: "checks the consensus timestamp and running hash" (spec §6 step 4) | spec §6, C-53 | **Mapped in the spec text, but T22's pass criterion doesn't explicitly test a tampered `running_hash_version` or out-of-sequence `sequence_number` — only "another batch's receipt" / "another topic" are the named negative vectors (PT-41, PT-42).** Recommend adding a running-hash-specific negative vector. |

**Gap count: 1 (running-hash negative vector not explicit in the test matrix — spec text names the check, PENTEST-PLAN.md doesn't have a dedicated PT case for it, closest is PT-41/PT-42 which test batch/topic substitution, not hash-chain tampering within the same topic).**

---

## 10 · Summary gap table (all standards)

| Standard | Total items mapped | GAPs found | Notes |
|---|---|---|---|
| MASVS v2.1.0 | 8 groups | 1 (RESILIENCE — already disclosed as "Not doing" in repo, so arguably 0 *undisclosed* gaps) | Strongest-documented mobile standard in the repo |
| ASVS v5.0.0 | 16 chapters | 2 (V4 Content-Type header consistency; V9 self-contained tokens N/A needs confirming) | |
| API Security Top 10 2023 | 10 items | 0 | Fully mapped; execution (not design) is the residual risk |
| NIST SSDF v1.1 | 4 groups | 0 structural | 61 of 79 controls still Planned/In-build, not a mapping gap |
| LINDDUN | 7 categories | 2 (Linking not modelled; Non-Repudiation not reframed as intentional) | |
| CVSS v4.0 | scoring method | 2 (no CVSS scoring in PENTEST-RESULTS; SCA severity rule doesn't state CVSS version) | |
| SLSA v1.2 (Build Track) | 3 levels | 2 (L1, L2 both unimplemented — no provenance generated at all) | Cheap fix available (`slsa-github-generator`) |
| Android specifics | 5 areas | 1 new (FLAG_SECURE never mentioned) + 3 already-disclosed | |
| Hedera HCS | 2 controls | 1 (no running-hash-tampering negative test case) | |

**The 5 most important gaps, ranked by how much they'd cost the team if a judge or reviewer found them first:**

1. **FLAG_SECURE never mentioned anywhere in the repo** — directly undermines S3's "nothing an attacker can observe reveals duress" claim, since a bystander's screen recording or Android's Recents thumbnail could capture the check-in/PIN screen. One line of Kotlin, currently absent.
2. **No SLSA provenance for the release APK** — C-65 publishes a sha256 digest but not a signed build attestation; cheap to add via the official GitHub Action, and it's exactly the kind of "checkable, not trusted" evidence the honesty-ledger (D14) already claims to value.
3. **No running-hash-specific negative test vector for Hedera anchoring** — T22/PT-41/PT-42 test batch and topic substitution but not a tampered `running_hash`/`sequence_number` within the legitimate topic, leaving B2's chain-integrity claim partially untested.
4. **No CVSS scoring in the pentest results** — PENTEST-PLAN.md is pass/fail only; without a severity score, the "critical/high blocks RG2" rule (C-71) has no consistent basis between SCA-reported CVEs (which have CVSS) and internally-found issues (which won't).
5. **LINDDUN linkability of the guardian/subject graph not modelled** — THREAT-MODEL.md is STRIDE-only; the guardian graph (who is whose guardian) is exactly the kind of cross-record linkability LINDDUN exists to catch, and it's currently unexamined.

---

## Limitations

- MASTG-TEST-nnnn IDs given are illustrative examples pulled from a fetch of the MASTG index, not an exhaustive enumeration against VIGIL's actual code surface — the team should generate the full applicable subset from `mas.owasp.org/MASTG/` once code exists.
- ASVS 5.0.0's exact Level 2 defining sentence and the full V1–V16 requirement-ID list could not be extracted as literal quotes from the fetched pages this session (GitHub tree view and PDF were not plain-text-fetchable); chapter names are corroborated by two independent fetches/searches but should be re-verified against the downloaded PDF/CSV before being quoted verbatim on a slide.
- Hedera's running-hash algorithm (SHA-384, chained) is well-documented Hedera behaviour but no single fetchable docs.hedera.com page yielded a literal <30-word quote this session — flagged ⚑, not asserted as a direct quote.
- FLAG_SECURE's exact android.com wording could not be fetched directly (page fetch failed / returned navigation only); the behavioural description is corroborated by multiple secondary sources and is standard, uncontested platform behaviour, but is marked ⚑ for "not a literal primary-source quote."
- This file maps standards to controls; it does not re-verify whether "Done" controls in SSDLC.md are actually implemented in code — that's a separate check against the repository's `anchor/`, `server/`, `app/` directories, which (per SSDLC.md's own admission) held only READMEs as of 23 Sep.
