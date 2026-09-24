## 2026-09-23 | Codex assistant, acting at Khutso Mothopa's request | P3.K1 evidence audit | REVIEW FINDINGS ADDRESSED — Khutso confirmation and reviewer acceptance pending

**Research** — Re-opened or attempted every source named in the 23 September section of `docs/EVIDENCE.md`, searched for primary replacements where the cited page was secondary or unavailable, checked the local YAMNet class map and economics script, and compared each claim's wording with what the source actually establishes. P3.K2 (SAPS FY totals by-eye read) was deliberately not performed here.

**Real data / references** — Primary/official checks include SABRIC's 2024 PDF (Table 11, p.17), the Banking Association's 2025 release, ISS Africa's SAPS-derived analysis, official SAPS Q1 reporting, BioCatch's survey release, NFO, iTOO, eBucks GuardMe, National Treasury, PSR, NIST FIPS 204, Android Developers, Google Play policy, Hedera's fee/mirror-node pages, the official ECTA and RICA texts, OpenTimestamps and the Wiley metadata/secondary table for Guerette–Bowers. Rows that remain secondary, inaccessible or not independently reproducible remain marked ⚑/open/not measured.

**Business reasoning** — Narrowing claims to what a source actually supports prevents a judge, bank or insurer from discovering an inflated statistic or an implied performance promise; that protects trust and keeps the commercial case defensible.

**Competitor reference** — GuardMe, iTOO [My]Cylution and vehicle-tracker prices were checked as dated comparators, not as evidence that VIGIL has equivalent coverage or dispatch capability.

Audit disposition:

- SABRIC 2025: official release supports R2.4bn and more than 70% of app losses; the 110,074/89% cases/70.5% value detail remains secondary and is labelled accordingly.
- SABRIC 2024: primary PDF Table 11 confirms R1.888bn and 97,975 incidents; conflicting secondary 97,959 was rejected.
- ISS kidnapping analysis: supports 17,061, 264%, 66%, 44%, 22% and under 5%; “SAPS defines express kidnapping” was narrowed to “ISS describes”.
- SAPS Q1 2026/27: reporting supports −18.2%, −17.6%, −16.4% and 13,116→10,960; retained.
- SAPS FY totals: not read here; remains P3.K2 and was not added.
- BioCatch: supports 75%, 79% and C-suite figures; vendor-survey limitation retained.
- NFO: supports 1,436→2,483, +73%, Jan–May and virtual-card scope; retained.
- Absa: R129m is supported by a dated secondary report; primary interim results remain preferable.
- ICB: page returned 403; unsupported “10% of R35bn” calculation removed and wording narrowed to the organisation's R3.5bn warning.
- Santam: official page supports more than 1m and less than 24%; FY2025 R43.9bn removed pending primary support.
- iTOO and GuardMe: official pages support express-kidnapping cover, R22.50 starting price, R19.90/member/month and three free months; retained as dated comparators.
- Vehicle trackers: aggregator/provider pages support the lower range, but the full range is not one provider's price; comparator caveat retained.
- Smartphone excise: Treasury supports duty only above R2,500 from 1 Apr 2025; the row wording was clarified and the +80% sales figure remains secondary.
- UK APP: PSR supports 7 Oct 2024, £85,000 and the high gross-negligence bar; the 50/50 split was not re-established here and is explicitly flagged.
- Guerette–Bowers: primary metadata confirms 102 evaluations; the 574/572 observation discrepancy remains explicitly caveated and is not a VUKA forecast.
- Bass: Sage abstract confirms 213 applications; p/q values remain a historical reference, not a VUKA forecast.
- YAMNet: TensorFlow class map confirms labels/indices; predecessor hard-coded indices differ.
- Android foreground-service/privacy rules and Google Play Accessibility/SMS restrictions: official pages support the stated constraints; “cannot be suppressed” is narrowed to the observable system indicator.
- Hedera: official pages support $0.0008 and public mirror-node ordering data; 3–5 s finality removed because it was not evidenced.
- USD/ZAR/economics: local script reproduces the R9.34 estimate; it remains dated and tagged as an estimate.
- OpenTimestamps: official pages support calendar-server operation; the unrecorded 1.01-hour observation was removed because the audit had no capture timestamp or sample basis.
- FIPS 204: [NIST's publication page](https://csrc.nist.gov/pubs/fips/204/final) says “Date Published: August 13, 2024”; the [Federal Register notice 2024-17956](https://www.federalregister.gov/d/2024-17956) says “FIPS 203, FIPS 204, and FIPS 205 are effective on August 14, 2024.” The primary FIPS 204 PDF table supports the ML-DSA-65 sizes. A previously linked Federal Register document number (2024-17918) was incorrect and has been replaced.
- ECTA/RICA: official texts support the quoted factors/definition; source links corrected to government/Justice copies.
- Cybercrimes Act, FTC emergency PIN, and Capitec Feature Lock: primary or current verification remains incomplete; limitations stay visible and no stronger claim is made.

Evidence: `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `python scripts/economics_vigil_anchor.py`, `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .`, `.tools/gitleaks.exe git --redact --config .gitleaks.toml --log-opts="--all"`, and `git diff --check` are required before commit. No SAPS annual total was added, no measurement was invented, and no reviewer approval is claimed.

Decision: none. Corrections narrow provenance and wording; no product contract or ADR changed.

Needs/blockers: Khutso's personal confirmation remains pending. P3.K2 is on the separate stacked PR #52. Ipeleng still owns primary Cybercrimes/FTC/POPIA reads. Sibusiso reviews this evidence audit first; both leads remain final reviewers.

Business handoff: Babatunde and Lethabo may use only the corrected rows and must preserve the ⚑/open/not-measured labels.

Next: complete P3.K2, then run P3.K7 coverage and update the checklist only after Sibusiso accepts the evidence audit.
