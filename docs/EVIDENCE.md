# Evidence and provenance

The ceiling on every claim. If a number or capability isn't here with its source, command or n, it doesn't reach a slide. Evidence from the four-layer plan (predecessor counts, the 318 ms relay measurement with n = 10, the R299 model, the forecast result) is kept in [the archived evidence file](../archive/2026-09-four-layer/docs/EVIDENCE-four-layer.md).

## Verified 23 September 2026 — VIGIL + ANCHOR facts

Added by Lethabo's Claude Code assistant from four research passes on 23 Sep (market data, fraud/legal/platform, design, and an independent red-team). A Codex assistant, acting at Khutso's request, re-opened or attempted the cited sources for the P3.K1 audit and recorded summary dispositions in `docs/build-log/entries/2026-09-23-codex-khutso-p3-k1-evidence-audit.md`. **On 25 Sep Khutso stated that he personally checked every row and confirmed the audit dispositions, including the unresolved flags.** The row-by-row confirmation record is `docs/build-log/entries/2026-09-25-codex-khutso-evidence-acceptance-reconciliation.md`. This confirmation does not turn a secondary or inaccessible source into primary proof. ⚑ = secondary source only, primary source unavailable, or a primary read still owed.

### Market and crime

| Metric | Value | Source (date) | Tag |
|---|---|---|---|
| Digital banking crime, SA | **R2.4bn gross losses, calendar 2025**; the detailed 110,074 incidents, ≈89% of cases and 70.5% of value figures remain secondary; mostly social engineering | SABRIC 2025 Annual Banking Crime Statistics, released 11 Aug 2026, via banking.org.za and BusinessTech | `FACT`; ⚑ for detailed secondary figures |
| The same, one year earlier | R1.888bn, 97,975 incidents (2024) — **not current**; the business plan cited it as "ScamWatchHQ 2026" | SABRIC 2024 report | `FACT` (superseded) |
| Kidnappings | **17,061 in FY2023/24**, up 264% from 4,692 in 2014/15; aggravated robbery 66% of kidnappings, **44% during a hijacking**, 22% during another robbery; under 5% linked to ransom, trafficking or extortion; ISS describes express kidnappings as coercion into ATM or mobile-banking transfers | [ISS Africa, 3 Dec 2024](https://issafrica.org/iss-today/south-africa-s-armed-robbery-problem-drives-kidnapping), citing the SAPS Crime Registrar | `FACT` |
| Latest quarter | Carjacking −18.2%; residential robbery −17.6%; trio crimes −16.4% (13,116 → 10,960), Apr–Jun 2026 vs the same quarter in 2025 | [SA Government News, 28 Aug 2026](https://www.sanews.gov.za/node/83899), reporting the acting National Police Commissioner's release of SAPS Q1 2026/27 figures | `FACT` (reported SAPS quarter; not a VUKA outcome) |
| SAPS 17 community-reported serious crime, full-year national total | **FY2024/25: 1,515,383** (official annual report, printed p.112, “Republic of South Africa” table); **FY2025/26: 1,452,038** = 346,182 (Q1, Apr–Jun 2025) + 361,560 (Q2, Jul–Sep 2025) + 385,936 (Q3, Oct–Dec 2025) + 358,360 (Q4, Jan–Mar 2026). The FY2025/26 value is an explicit sum of four quarter rows, not an annual-table extraction. | [SAPS Annual Report 2024/25](https://www.saps.gov.za/about/stratframework/annual_report/2024_2025/2024-25-SAPS-Annual-Report.pdf) p.112; [Q1 PDF](https://www.saps.gov.za/services/downloads/2025/2025-2026_-_1st_Quarter_WEB.pdf) p.10; [Q2 PDF](https://www.saps.gov.za/services/downloads/2025/2025-2026_-_2nd_Quarter_WEB.pdf) p.10; [Q3 PDF](https://www.saps.gov.za/services/downloads/2025/2025-2026_-_3rd_Quarter_WEB.pdf) p.10; [Q4 PDF](https://www.saps.gov.za/services/downloads/2025/2025-2026_-_4th_Quarter_WEB.pdf) p.10. Khutso confirmed the source reads by eye on 24 Sep 2026 in PR #54; his screenshot is printed p.130 and shows a quarterly/provincial summary, not an annual-total row. | `FACT` (annual-report row); `FACT` (four visually read quarters); `FACT` (derived sum); **restored from PR #54, fresh Sibusiso review pending** |
| Bank fraud attempts rising | **75%** of SA banking fraud/AML/compliance leaders (81% among C-suite); **79%** report rising losses — **not 85%** | BioCatch press release, 13 May 2026 (vendor-commissioned) | `FACT` (vendor survey) |
| Banking Ombud fraud complaints | 1,436 → 2,483 (+73%), **Jan–May only**, virtual/digital banking **card** fraud | NFO, 7 Aug 2025 | `FACT` (narrow scope) |
| Absa fraud losses H1 2026 | R129m reported for Absa and its customers in South Africa; Absa's primary interim-results disclosure was not located in this audit | [BusinessTech, 18 Aug 2026](https://businesstech.co.za/news/banking/870662/criminals-hit-major-bank-and-its-customers-for-r129-million-in-south-africa/) ⚑ | `FACT` ⚑ (secondary report) |
| Short-term claims and fraud | ICB warns the industry could potentially lose **R3.5bn** if fraud and organised crime are unchecked; the “10% of R35bn” denominator calculation is not retained because the cited page was inaccessible during audit | [ICB warning](https://saicb.co.za/the-r3-5-billion-challenge-facing-sa-insurers-and-intermediaries/) ⚑ | `FACT` ⚑ (organisation warning; primary page unavailable) |
| Santam | Official page confirms **more than 1 million policyholders** and market share **less than 24%**; FY2025 GWP R43.9bn is not retained until a primary FY2025 result is linked — **not 3.7m policyholders** | [Santam investor relations](https://www.santam.com/about-us/investor-relations/) | `FACT` (partial; FY2025 GWP open) |
| Express kidnapping already insured | iTOO [My]Cylution covers "theft of funds … express kidnapping", **from R22.50/month** | itoo.co.za | `FACT` |
| In-app panic button | FNB GuardMe (Aura), **R19.90/month** after a 3-month trial | htxt.co.za, it-online.co.za, Apr 2022 ⚑ | `FACT` (press) |
| Vehicle trackers | R89–R335/month (Tracker, Netstar, Cartrack) | trackerprices.co.za aggregator, 2026 ⚑ | `FACT` (aggregator) |
| Smartphone excise | From **1 Apr 2025**, the 9% ad valorem duty applies only to smartphones whose **price paid at export to South Africa** exceeded R2,500; this is not a retail-price threshold. The entry-level sales **+80% in 11 months** figure remains secondary and needs its original GSMA release | [National Treasury Budget Review 2025](https://www.treasury.gov.za/documents/National%20Budget/2025Mar/review/FullBR.pdf) p.45 (proposal and valuation basis); [SARS tariff amendment notice](https://www.sars.gov.za/latest-news/legal-counsel-secondary-legislation-tariffs-amendments-2025/) (1 Apr 2025 implementation); GSMA via The Citizen, 6 Jul 2026 ⚑ | `FACT` (duty rule); ⚑ (sales figure) |
| UK APP-fraud reimbursement | For qualifying UK APP scams through Faster Payments or CHAPS, reimbursement became mandatory from 7 Oct 2024 with a standard cap of £85,000 per claim; the receiving payment firm contributes 50% of reimbursable cost to the sending firm. The gross-negligence exception has a high bar and does not apply to vulnerable consumers. This UK policy is not a South African rule | [PSR policy statement](https://www.psr.org.uk/publications/policy-statements/ps247-faster-payments-app-scams-reimbursement-requirement-confirming-the-maximum-level-of-reimbursement/); [PSR scope and exceptions](https://www.psr.org.uk/news-and-updates/latest-news/news/groundbreaking-new-protections-for-victims-of-app-scams-start-today/); [PSR contribution explanation](https://www.psr.org.uk/news-and-updates/thought-pieces/thought-pieces/one-year-on-delivering-fair-outcomes-through-our-app-scam-reimbursement-regime/) | `FACT` (scoped UK policy) |
| "South Africa is expected to follow" | **No SARB, FSCA, Treasury or PASA statement found** | — | removed |
| Crime displacement | Guerette & Bowers (2009, *Criminology* 47(4)): Table 1 reports 574 observations, with displacement in 147 (26%) and diffusion of benefits in 153 (27%). These are observations across 102 evaluations, not a VUKA forecast; the authors caution that many study designs cannot establish causation. A conflicting secondary 572 count was rejected against the paper's table | [Author-paper copy](https://static1.squarespace.com/static/5b7ea2794cde7a79e7c00582/t/66d8f1e46586e1517f36eee0/1734180015445/ASSESSING_THE_EXTENT_OF_CRIME_DISPLACEME.pdf), Table 1, printed p.1346; DOI 10.1111/j.1745-9125.2009.00177.x | `FACT` (historical review, limited inference) |
| Adoption reference | Bass diffusion mean p = 0.03, q = 0.38 over 213 parameter sets (durables, 1950s–80s) | Sultan, Farley & Lehmann 1990, *JMR* 27(1) | `FACT` |

### Platform, ledger and law

| Fact | Source | Tag |
|---|---|---|
| YAMNet class indices: Shout 6, Yell 9, **Screaming 11**, Glass 435, Shatter 437, Breaking 464. The predecessor app's hard-coded indices (427/395/195/39) are **not** these classes | `yamnet_class_map.csv`, tensorflow/models | `FACT` |
| Android 14+: a microphone foreground service **cannot be started from the background or from `BOOT_COMPLETED`** (with narrow exceptions) | developer.android.com, FGS background-start restrictions | `FACT` |
| Android 12+ microphone privacy indicator cannot be suppressed by apps | developer.android.com | `FACT` |
| Play: the Accessibility API is only for accessibility tools; SEND_SMS needs a declared exception (physical-safety category exists, review-dependent); stalkerware policy needs a persistent notification | Google Play Console Help | `FACT` |
| Hedera `ConsensusSubmitMessage`: **$0.0008** from Jan 2026 (was $0.0001); a public mirror node exposes consensus timestamp and message-order data; the unqualified “finality ~3–5 s” claim is removed pending a measured or primary latency source | [Hedera fee notice](https://hedera.com/blog/price-update-to-consensussubmitmessage-in-consensus-service-january-2026); [public mirror-node description](https://hedera.com/blog/now-available-public-mainnet-mirror-node-managed-by-hedera/) | `FACT` (fee/API); latency not measured |
| USD/ZAR 16.2075 (22 Sep 2026) → hourly anchoring **R9.34/month** | tradingeconomics; `scripts/economics_vigil_anchor.py` | `FACT` / `ESTIMATE` |
| OpenTimestamps | Calendar servers accept timestamp requests. Receipt latency and Bitcoin attestation time are environment-dependent; no exact timing is retained because the audit record lacks a capture timestamp and sample basis | [OpenTimestamps](https://opentimestamps.org/); [calendar server status](https://alice.btc.calendar.opentimestamps.org/) | `FACT` (service); timings not a product measurement |
| NIST FIPS 204 (ML-DSA) published 13 Aug 2024 and effective 14 Aug 2024; ML-DSA-65 public key 1,952 bytes and signature 3,309 bytes | [NIST FIPS 204 final](https://csrc.nist.gov/pubs/fips/204/final), [Federal Register effective date](https://www.federalregister.gov/d/2024-17956), [primary PDF table](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf) | `FACT` |
| **ECTA 25 of 2002 s15(3)** — evidential weight turns on the reliability of generation, storage and communication, of integrity maintenance, and of originator identification | [South African government Act text](https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf), read 23 Sep | `FACT` |
| **RICA 70 of 2002 s1 "intercept"** — acquiring the contents of a *communication* so as to make them available to someone other than the sender or intended recipient | [Justice Act text](https://www.justice.gov.za/legislation/acts/2002-070.pdf), read 23 Sep | `FACT` |
| Cybercrimes Act 19 of 2020 s8 (cyber fraud) and s9 (cyber forgery and uttering) | [Official South African Government Gazette PDF](https://www.gov.za/sites/default/files/gcis_document/202106/44651gon324.pdf), printed p.18; this is a citation to the enacted text, not legal advice about VUKA | `FACT` (text and section names) |
| US FTC 2010 staff report on emergency ATM PINs: FTC staff found no deployment at ATMs and warned the technology might increase danger in some instances; the report lacked data for a definitive efficacy conclusion | [Official FTC report PDF](https://www.ftc.gov/sites/default/files/documents/reports/federal-trade-commission-bureau-economics-staff-report-emergency-technology-use-atms-pursuant-credit/100504creditcardreport.pdf), Executive Summary pp. i–ii; a historical ATM precedent, not a VUKA outcome | `FACT` (scoped historical report) |
| Capitec Feature Lock: a mandatory 4-hour delay before a locked feature can be unlocked | capitecbank.co.za blog, 2024 | `FACT` |

### Retired for the two-layer product

- The historical 318 ms p95 (n = 10) measured the predecessor's server relay (the UMOJA path). **It is never quoted as VIGIL's latency.** VIGIL's own latency is measurement M3 in `docs/VUKA-2-SPEC.md` §16.
- R1.09bn (theft claims in a third party's dataset) is not a VIGIL market and not a saving. It is retired from all forward-facing material (ADR-0034, `docs/ECONOMICS-VIGIL-ANCHOR.md` §4).

### Detection (measured 25 Sep 2026, ESC-50 proxy, ruleset `vigil-detect` v1, uncalibrated)

Method: `scripts/eval/yamnet_windows.py` runs the registered YAMNet (sha256 `10c95ea3…17de`, confirmed identical to Google's TF Hub `google/lite-model/yamnet/classification/tflite/1`) with the phone's windowing (15 600 samples, hop 7 800, 16 kHz, no gate), and `scripts/eval/run-engine.mjs` replays the integer windows through the compiled `app/src/brain/detect` engine. Clips: `scripts/eval/esc50-cliplist.txt` (ESC-50, CC BY-NC 3.0, audio not committed). The thresholds were **not** tuned on folds 4–5. The neighbour rule was designed after seeing the fold-1 false gunshots.

| Measure | Folds 1–3 (tuning) | **Folds 4–5 (held out)** | Tag |
|---|---|---|---|
| Glass recall (clips recorded as glass) | 21/24 (87.5 %) | **11/16 (68.8 %)** | `FACT` (n as shown) |
| False records on negatives | 1 in 0.544 h (392 clips, 49 classes) | **4 in 0.544 h = 7.3/h** (392 clips) | `FACT` |
| False prompts, host-harness replay of the negatives as one stream (not a phone measurement) | 1.8/h | **5.5/h** | `FACT` (host proxy) |
| Main false triggers | crackling fire → Gunshot | pouring water → Glass (8008 bp), clock alarm → Glass, can opening → Gunshot | `FACT` |
| Gun-like neighbour rule | false "Gunshot" records fell from 9 to 1 on the first 392-clip set | — | `FACT` |
| On-device parity | the emulator's classification of `1-20133-A-39.wav` gave the same integer scores as the host (Breaking 3320, top class 374 at 5000) | — | `FACT` (n = 1 clip) |
| Gunshot, scream, shout recall | **Not measured.** ESC-50 has none of these classes | — | — |
| Field false alarms per armed hour (M2) | **Not measured.** ESC-50 is dense isolated events, not a commute | — | — |

Say: "On a public dataset, held out from tuning, the phone detected 11 of 16 glass-break clips and falsely recorded 7 events per hour of dense everyday sounds." Never: "detects glass breaking" without the n, or any figure for screams or gunshots.

## Claim rules

Use `sim_` for simulated event identifiers and spoken demo labels. Never imply that simulation is deployed capability. No guarantees about guilt, admissibility, fairness, invulnerability or prevention. Public hashes can remain personal information if linkable. Embeddings are sensitive representations, not anonymous data by default.

## Missing evidence register

| Evidence needed | Owner | Proposed due | Acceptance |
|---|---|---|---|
| Five user conversations and one bank or insurer approach (P3.B7) | Babatunde | Sep 26 12:00 | Consent-safe notes in `docs/VALIDATION-2026-09.md`; "no reply" is a valid result |
| VIGIL detection recall, false alarms, latency, battery, heartbeat continuity, delivery, false no_answer (M1-M7) | Vukosi (Khutso records) | Sep 26 18:00 | Method, configuration and n per `docs/VUKA-2-SPEC.md` Section 16; "not measured" until then |
| SAPS FY2024/25 and FY2025/26 totals read by eye from the official PDF | Khutso | Sep 24 | Restored above from PR #54's owner-confirmed reads and page/table citations; fresh review of the current-main restoration pending |
| Primary read: POPIA s1 biometrics | Ipeleng | Sep 25 | Primary text and scoped interpretation still needed; FTC and Cybercrimes source flags were resolved with official PDFs in the 25 Sep P3.K1 reconciliation |
| Organiser answer on building before Fri 16:00 on declared lineage | Lethabo | Sep 24 12:00 | **Confirmed 23 Sep 2026** — pre-event building allowed (reply to Lethabo; content not stored — **record pending**: a redacted copy is P3.L9) |

All proposed dates, hours, capacities, design limits, scores and scenario numbers in this pack are planning assumptions, not measurements. IDs, table row counts, statutory section numbers and dates copied from the brief are not measured product claims.
