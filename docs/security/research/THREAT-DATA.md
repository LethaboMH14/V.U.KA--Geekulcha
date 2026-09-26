# VUKA threat & pentest research — verification pass, 24 Sep 2026

Local docs read first (not duplicated unless verifying/correcting): `docs/EVIDENCE.md`, `docs/MARKET-DATA.md`, `docs/STAGED-DURESS-DEFENCE.md`, `docs/COERCION-SCENARIOS.md` (skim), `docs/security/PENTEST-PLAN.md`, `docs/security/THREAT-MODEL.md`. All figures below are new primary/secondary web research, each with a literal quote, source and URL. ⚑ = secondary only / not independently confirmed.

---

## 1 · Real SA data on the threat

### SABRIC — the 64,000 vs 97,975 conflict (task explicitly asked to resolve)

The primary PDF (`https://www.sabric.co.za/wp-content/uploads/2025/09/CRIME-STATISTICS-REPORT-2024.pdf`, 6.8MB) could **not** be machine-read — WebFetch returned only corrupted binary streams, and the local `Read` tool cannot render it here either (`pdftoppm` unavailable). This matches the repo's own finding on the SAPS PDF ("does not survive machine extraction"). Resolution below is therefore from secondary sources only — **⚑ not a primary-source confirmation**, same standard the repo already applies.

Two reputable secondary quotes, both nominally reporting the same SABRIC 2024 report:

> "digital banking crime, which increased by 86% in 2024, rising from **52,000 incidents in 2023 to almost 98,000 reported cases**... Losses climbed by 74% year-on-year, reaching a record **R1.888 billion**"
— TechAfricaNews, 29 Aug 2025, https://techafricanews.com/2025/08/29/south-africa-sees-86-surge-in-digital-banking-fraud-losses-near-r1-9-billion/

> "Digital banking fraud remained the most dominant channel, **accounting for 65.3 percent of reported incidents**... Cases almost doubled in volume, rising from **31,612 in 2023 to 64,000 in 2024**, while losses increased from R1 billion to over **R1.4 billion**"
— IOL/Mercury, 23 Oct 2024 (republished framing of the same underlying SABRIC figures), https://iol.co.za/mercury/news/2024-10-23-surge-in-fraud-cases-in-digital-banking-sector-sabric-report/ ; SABRIC media statement page, https://www.sabric.co.za/media-statement-sabric-annual-crime-statistics-2024/

**Arithmetic check that resolves the conflict:** 64,000 / 97,975 = **65.35%**, which matches the "65.3 percent of reported incidents" line almost exactly. This strongly suggests **97,975 (≈98,000) is the total banking-crime-incident count across all channels (card, ATM, branch, digital), and 64,000 is digital banking fraud specifically as a 65.3% share of that total.** Under this reading both numbers are correct but describe different denominators — 97,975 is *not* "digital banking fraud incidents", it is the wider base that digital banking fraud (64,000) is 65.3% of.

This differs from `docs/EVIDENCE.md:14` and `docs/MARKET-DATA.md` §1, which currently present 97,975 as *the* digital-banking-fraud-incident figure and instruct "do not use 64,000." **Recommend the team re-open this with the primary PDF read by eye** (same approach already used for the SAPS PDF) before the next slide draft — the repo's own resolution may have the scope backwards. Flag as ⚑ until read.

Separately, and NOT in conflict — the **2025** report (newer, already correctly used in `docs/EVIDENCE.md:13`):
> "SABRIC recorded **110,074 digital banking crime incidents** during the year [2025]... South Africans lost an estimated **R2.4 billion**"
— crispng.com summarising SABRIC 2025, citing banking.org.za release; corroborated by BusinessTech, 18 Aug 2026, https://businesstech.co.za/news/banking/872115/r2-4-billion-stolen-from-south-africans-over-r21800-per-person/

### SAPS — kidnapping and quarterly trio-crime figures

Repo already has the strongest primary-adjacent figure (ISS Africa citing the SAPS Crime Registrar): **17,061 kidnappings FY2023/24, up 264% from 4,692 in 2014/15**, 44% during a hijacking. Confirmed still current in web research; no newer SAPS annual total located (repo already marks FY2024/25 and FY2025/26 as needing an eyes-on PDF read — still true).

New quarter-level SA-wide figure found, ⚑ regional not confirmed national:
> "Kidnapping rose by 31.9%, from 204 to 269 cases in the Western Cape" — Q1 2026/27 vs Q1 2025/26
— IOL Cape Argus, 15 Sep 2026, https://iol.co.za/capeargus/2026-09-15-western-cape-murders-fall-but-rape-kidnapping-and-vehicle-theft-rise/ ⚑ (provincial, not the national figure the repo already has from SA Government News, 28 Aug 2026)

The repo's existing national Q1 2026/27 figures (carjacking −18.2%, residential robbery −17.6%, trio crimes −16.4%) were not contradicted or improved on by this pass; no better national kidnapping delta for the same quarter was found.

### Express kidnapping / forced app transfers — direct, current, on-point reporting

> "Victims of express kidnappings are forced to unlock their phones and banking applications while under threat of violence, then criminals transfer money, make withdrawals, activate overdrafts or take out loans before releasing the victim."
— TechCentral, "Banking app kidnappings are on the rise in South Africa", https://techcentral.co.za/banking-app-kidnappings-south-africa/234770/

> "an average of 11 kidnappings were reported every day in Johannesburg during the first three months of 2026, with police recording 971 kidnappings in Johannesburg between January and March"
— allAfrica.com, "Johannesburg Express Kidnappings Surge As Criminals Target Digital Bank Accounts", https://allafrica.com/stories/202606030620.html ⚑ (secondary; original SAPS release not located)

> "Common banking app protection features including PINs, biometric authentication and facial recognition prove to be ineffective, as with app kidnapping someone is forced to open their own profile on their own phone — similar to someone forcing you at gunpoint to withdraw cash using your own card and PIN at an ATM."
— TechCentral, same article as above — this is the single best plain-language articulation of VUKA's own thesis found in this pass; worth citing directly on the problem slide.

A named individual case with a figure, useful as a concrete anecdote (use with care — real victim):
> "Man forced to transfer R900k in 'express kidnapping' ordeal"
— TimesLive, 26 Apr 2026, https://www.timeslive.co.za/news/south-africa/2026-04-26-man-forced-to-transfer-r900k-in-express-kidnapping-ordeal/ ⚑ (headline-level only, not read in full)

---

## 2 · Attacks on this product class

### Duress/panic-app-specific attack research (Citizen Lab / Coalition Against Stalkerware)

**Gap found, not a result:** no Citizen Lab or Coalition Against Stalkerware publication specifically analysing spoofed-SOS or panic-button apps was located in this pass. What exists is their broader stalkerware/IPV corpus, which is directly relevant to VUKA's guardian model but is about **abuse of legitimate access**, not technical spoofing of the app itself:

> "Location information about victims of domestic violence and stalking is undeniably sensitive, and surreptitious location tracking devices and apps are disproportionately dangerous for these individuals."
— NNEDV Safety Net Project, https://www.techsafety.org/spyware

> "Intimate Partner Surveillance (IPS) is a method in intimate partner violence where one partner monitors the location and behavior of the other through technical or non-technical means."
— NNEDV / Safety Net Project material, https://www.techsafety.org/choosingapps/ ⚑ (paraphrase of the standard IPS framing used across NNEDV, Coalition Against Stalkerware and academic sources — not one exact document quote)

**This is directly relevant and under-tested in `PENTEST-PLAN.md`**: the plan's PT-16–PT-22 test *forced* guardian changes under duress/normal PIN, but none test the far more common real-world pattern — an abuser who is a **legitimately added, never-revoked guardian** exploiting standing consent (the classic IPS pattern in the NNEDV/Coalition literature). See attack pattern #5 below.

### Android Keystore attestation bypass

> "An analyst on a rooted phone can defeat a backend's hardware attestation check by relaying the attestation to a second, clean device, forwarding a genuine attestation chain produced by an unmodified device and bound to the backend's own nonce."
— Quarkslab, "Bypassing Android Hardware Attestation from the Analyst's Chair", https://blog.quarkslab.com/bypassing-android-hardware-attestation.html

> "Techniques include leaked keyboxes, tools like TrickyStore that inject an attestation key at the Keystore layer, and TEE key extraction."
— same source (Quarkslab), summarised via search; direct quote on relay technique above is the load-bearing one.

This corroborates the threat model's own honest residual at PH-1: *"a signature proves a key was used, not a real sound"* — and shows the specific, named, documented technique (**attestation relay**) that would defeat it in practice. `PENTEST-PLAN.md` PT-50/51 check the release APK's own signer and manifest, but no test case attempts to demonstrate or rule out an attestation-relay bypass against the Keystore claim itself. Attack pattern #2 below.

### Mobile malware that auto-transfers money (overlay + accessibility abuse)

> "Accessibility privileges in place, the malware can silently watch what app the victim is using, intercept input, and perform taps and swipes on its own. The malware targets more than 180 banking, financial services, and cryptocurrency applications..."
— on **OverlayPhantom**, active since May 2025, two-stage dropper posing as ID Austria or TikTok. cybersecuritynews.com, https://cybersecuritynews.com/android-banking-trojan-overlayphantom/

> "the number of Trojan banker attacks on Android smartphones increased by **56% in 2025** compared to the previous year... Among all detected Trojan bankers, the leading families were **Mamont and Creduz**."
— Kaspersky press release, 13 Mar 2026, https://www.kaspersky.com/about/press-releases/the-number-of-trojan-banker-attacks-on-smartphones-increased-by-56-in-2025

> Kaspersky also names **Frogblight**, a new Android banking trojan targeting Türkiye — Securelist, https://securelist.com/frogblight-banker/118440/ (regional, not SA-specific — ⚑ relevance to SA market unconfirmed)

This class of malware is directly relevant and **not tested at all** in `PENTEST-PLAN.md`: an overlay/accessibility trojan resident on the *same device* as VIGIL could screen-scrape or intercept the duress PIN screen itself, defeating the pixel/haptic/timing parity controls (V5/T15) from a different angle than anything currently tested. Attack pattern #1 below.

---

## 3 · Pentest methodology

### OWASP WSTG

> "OWASP is currently working on release version 5.0, while the last stable release is **4.2**."
— multiple sources corroborating; WSTG 4.2 published 2020, https://owasp.org/www-project-web-security-testing-guide/v42/

> "Each scenario has an identifier in the format **WSTG-<category>-<number>**... It is preferable that other documents, reports, or tools use the format **WSTG-<version>-<category>-<number>**"
— OWASP WSTG project, https://owasp.github.io/www-project-web-security-testing-guide/ (paraphrase of the documented ID convention, consistent across github.com/OWASP/wstg and wstg.owasp.org)

`PENTEST-PLAN.md` does not currently cite WSTG IDs anywhere (its own T/PT numbering is internal). If the team wants external-standard traceability for the SSDLC submission, mapping PT-01–PT-64 to WSTG-v42-<CATEGORY>-<NN> would be cheap and would answer "what standard did you test against."

### OWASP MASTG

> "MASTG explains how to verify requirements by providing detailed test cases with step-by-step instructions, tool recommendations, and platform-specific techniques for both iOS and Android."
— OWASP MASTG project (mas.owasp.org/MASTG/), paraphrase of documented workflow; test cases are identified as **MASTG-TEST-####** and mapped to **MASWE** weaknesses and **MASVS** controls.

The Android-side cases in `PENTEST-PLAN.md` (PT-50–PT-56) closely resemble MASTG storage/IPC/manifest tests already but are not mapped to MASTG-TEST IDs. G8 in the plan already admits "no dynamic instrumentation... we do not do (C-110)" — MASTG's dynamic-analysis chapter (Frida/objection-based) is exactly the missing piece, see tools below.

### PTES

> Seven phases: **pre-engagement, intelligence gathering, threat modeling, vulnerability analysis, exploitation, post-exploitation, and reporting.**
— pentest-standard.org / multiple secondary corroborations (KirkpatrickPrice, GeeksforGeeks), consistent wording across sources.

`PENTEST-PLAN.md` largely follows an ad hoc "test matrix by area" structure rather than PTES phases — reasonable for a 2-day internal test, but its own §5 ("what an independent test would add") could explicitly name PTES phase 3 (threat modeling) and phase 6 (post-exploitation) as the two phases an internal test structurally cannot do, since the testers wrote the spec.

### NIST SP 800-115

> Five core phases: **Planning, Information Gathering, Vulnerability Analysis, Exploitation, and Post-Testing Activities.** Rules of engagement detail what testers may and may not do; three assessment methods: **testing, examination, interviewing.**
— NIST SP 800-115 (nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-115.pdf), corroborated via secondary summaries (Qualysec, KirkpatrickPrice).

`PENTEST-PLAN.md` §2 (Rules of engagement) already matches this structure well (scope, stop conditions, secrets handling). Missing: an explicit "examination" pass (reviewing the spec/ADRs/code for design flaws, distinct from "testing" — running attacks) and an "interviewing" pass (asking the three builders what they know is weak) — both of which NIST 800-115 treats as first-class methods, and both of which would be *free* given the team is the same three people.

### CVSS v4.0

> CVSS v4.0 was published by FIRST in **November 2023**; replaces the v3.1 Base metric set with a more granular one, introducing **Attack Requirements (AT)** and separating **Vulnerable System Impact** from **Subsequent System Impact**.
— FIRST.org, https://www.first.org/cvss/v4.0/ and https://www.first.org/cvss/v4-0/cvss-v40-specification.pdf

`PENTEST-PLAN.md` §3 records pass/fail/not-run only — **no severity scoring at all.** For an SSDLC submission and for the "report a bank or insurer can rely on" goal already named in §5, each failing PT case should carry a CVSS v4.0 vector, not just pass/fail. This is a fast fix (one column) with real credibility payoff — the OPEN-GAPS register already asks for exactly this kind of report.

### Free tools for a 2-day internal test — exact commands where available

| Tool | Purpose | Command (from official docs where found) |
|---|---|---|
| **OWASP ZAP baseline** | DAST, API + web | `docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://example.com` — official zaproxy.org docker docs |
| **ZAP report to file** | | `docker run -t -v $(pwd):/zap/wrk/:rw ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://example.com -r zap-baseline.html` |
| **MobSF** | Static + dynamic mobile scan | `docker pull opensecurity/mobile-security-framework-mobsf && docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest` — official MobSF GitHub |
| **MobSF REST workflow** | | POST to `/api/v1/upload` (Authorization header + API key + multipart file) to get a hash, then POST `/api/v1/scan` with that hash — official MobSF API docs, per GitHub README |
| **mobsfscan** | Static source-code rules (semgrep-powered, MobSF's own rules) | separate CLI tool, `mobsfscan <path>` — github.com/MobSF/mobsfscan |
| **objection (Frida)** | Runtime instrumentation, SSL pinning bypass, storage/IPC exploration | `objection -g <package_name> explore`, or newer: `objection -n <package_name> start --startup-command "android sslpinning disable"` — per HackTricks/official objection docs corroboration |
| **apkanalyzer** | Manifest, permissions, debuggable flag (already referenced in PT-51) | `apkanalyzer manifest print <apk>`; also `manifest permissions`, `manifest debuggable`, `manifest application-id` — developer.android.com/tools/apkanalyzer (official) |
| **semgrep** | SAST, source-code rules | `semgrep scan --config auto` for a registry ruleset tailored to detected languages; `semgrep ci` for PR-diff-aware scanning; `--error` to fail the build on findings — docs.semgrep.dev/cli-reference |
| **nuclei** | Fast templated DAST/recon | `nuclei -u https://target -t http/technologies` (or a specific template path) — docs.projectdiscovery.io / nuclei.projectdiscovery.io (official) |

None of these five tools currently appear in `PENTEST-PLAN.md` by name except an implied ZAP baseline reference (PT-61, "ZAP baseline on the API and the verify page" — good, already planned) and MobSF (PT-56, "MobSF static scan of the release APK" — also already planned, static only). **Missing from the plan entirely: objection/Frida dynamic instrumentation** (the plan's own G8/C-110 admits this gap), **semgrep** as a source-level SAST pass distinct from MobSF's bundled rules, and **nuclei** for a fast templated pass over the deployed ANCHOR API and verify page ahead of the manual ZAP baseline.

### Rules of engagement / findings report structure

> A RoE document contains "the authorisation — sometimes called the 'get-out-of-jail' statement... scope (in/out of scope assets), timing, methods, contacts, communication protocols, incident response, data handling, and legal authorization."
— SecureLayer7 / ioSENTRIX / SecurityScientist, corroborating summaries of standard RoE structure (no single primary standard body publishes one canonical template; this is industry-consistent practice).

`PENTEST-PLAN.md` §2 already has most of this (scope, stop conditions, secrets handling) but is missing an explicit **written sign-off / "get-out-of-jail" authorization statement** naming who approved internal testing against the staging server and testnet topic — worth a one-line addition given it doubles as evidence for the SSDLC submission.

---

## 4 · Blockchain anchoring attacks relevant to Hedera HCS

### Testnet resets

> "Hedera has implemented a mirror node and consensus node test network reset **once a quarter**"
— docs.hedera.com/networks/testnet, corroborated by crypto.news reporting the same cadence, https://crypto.news/hedera-hashgraph-to-wipe-testnet-environments-every-quarter/

This is a **named, official, and current risk to the demo**: VUKA's testnet topic (per `PENTEST-PLAN.md` scope, "the Hedera testnet topic we created") can be wiped on Hedera's own quarterly schedule with no guarantee it survives to 25–27 Sep. `THREAT-MODEL.md` HD-5 already lists "Testnet reset or outage" as a threat with control "epochs; archived state; recording fallback" and residual "G31" — this research **confirms the mechanism is real and scheduled, not hypothetical**, which strengthens the case for rehearsing the "archived — not independent" fallback path (already scripted in `PENTEST-PLAN.md` PT-60) well before the event, not as a contingency.

### Mirror-node trust assumption

> "Applications can and should **independently verify data** so as not to be reliant on a single 3rd party Mirror Node"... via querying multiple mirror nodes, or "**generating a State Proof** to cryptographically process a transaction provided by the Mirror Node."
— Hedera community/technical documentation (hashpack.app, docs.hedera.com/hedera/core-concepts/mirror-nodes), corroborated by Hedera's own blog on Alpha State Proof deprecation, https://hedera.com/blog/deprecation-of-alpha-state-proofs-asp-on-hedera/

Two things worth flagging: (1) VUKA's verify page (per THREAT-MODEL VP-1/VP-6) reads **one** pinned mirror host — this is the single-mirror-node trust assumption the Hedera docs explicitly warn against; the plan's own honesty framing ("archived — not independent") is the right mitigation given no state-proof verification is built. (2) **Alpha State Proofs were deprecated** — the strongest cryptographic mirror-independence mechanism Hedera once offered is gone, so "query more than one mirror node" is now the only realistic independent-check option left, and it isn't tested anywhere in `PENTEST-PLAN.md` (PT-59 checks that only the pinned host is contacted, which is the opposite test — correct for leakage, but no test confirms cross-mirror agreement).

### Topic spoofing / fake receipts

No documented CVE or named attack specifically titled "HCS topic spoofing" was found — this looks like a genuine research gap rather than an omission on my part; Hedera's own security material discusses the `submitKey` control (already tested at PT-45/HD-1) but nothing on forged receipts beyond what the mirror-node trust-assumption material above already covers. Mark this sub-question ⚑ unresolved rather than invent a source.

---

## 5 · Five attack patterns `PENTEST-PLAN.md` does not cover

1. **Overlay/accessibility-service malware co-resident on the phone during a duress event.** OverlayPhantom and the Mamont/Creduz family (Kaspersky, 56% YoY growth in 2025) demonstrate that accessibility-abuse trojans can watch screen content and inject taps/input in real time on 180+ target apps. Nothing in the plan tests whether such malware could screen-scrape the duress PIN screen or intercept the PIN before VIGIL's own signing occurs — a different attack surface than the network/timing-parity tests (PT-23–31) already planned.

2. **Attestation relay against the Keystore claim (PH-1's stated residual, untested).** Quarkslab's documented relay technique — forwarding a genuine attestation chain from an unmodified device to a backend's nonce — would let a rooted/emulated device impersonate a real one. PT-50/51 test the APK's own signature, not whether the *attestation the server relies on* can be relayed from elsewhere.

3. **Cloned/spoofed VIGIL APK used for phishing (invite-code or duress-PIN harvesting).** A documented pattern for safety apps generally (fake app posing as a real one, as seen with OverlayPhantom's ID-Austria/TikTok droppers). No PT case tests detection of, or user-facing defence against, a lookalike app distributed outside the GitHub Releases channel.

4. **Hedera testnet reset mid-event.** Confirmed as a real, quarterly, scheduled Hedera behaviour, not a hypothetical. `PENTEST-PLAN.md` has no case that simulates "the testnet topic no longer exists" and checks that the verify page correctly falls back to "archived — not independent" rather than erroring or silently failing.

5. **Legitimate-access guardian abuse (the real-world stalkerware/IPS pattern).** The NNEDV/Coalition Against Stalkerware literature's dominant pattern is not technical bypass — it's an abuser who was *validly* added as a guardian (often under social or coercive pressure at onboarding, before any incident) retaining standing access. PT-16–22 all test *forced, in-the-moment* guardian changes under duress; none test the scenario where the abuser's guardian status was never forced or contested in the first place, and the only mitigation is V9's "location only at signal time" — which is not verified by any PT case for what a validly-added abusive guardian actually sees over time.

---

## Limitations

- Primary SABRIC 2024 PDF not machine-readable in this environment; the 64k/97,975 resolution above is an inference from secondary-source arithmetic (65.3% match), not a page-cited primary read. Recommend a human eyes-on read, same treatment already given to the SAPS PDF in `docs/EVIDENCE.md`.
- No SA-specific reporting found linking named malware families (OverlayPhantom, Mamont, Creduz, Frogblight) to South African banking targets specifically — all confirmed threat-report data is international; relevance to VUKA's SA threat model is by analogy, not local incidence data.
- No Citizen Lab or Coalition Against Stalkerware publication specifically on panic/duress-app spoofing was located; the IPS material found is about location-sharing/stalkerware generally, applied here by inference to VUKA's guardian model.
- Hedera "topic spoofing" as a named attack class returned no primary source; treated as an open question, not asserted.
