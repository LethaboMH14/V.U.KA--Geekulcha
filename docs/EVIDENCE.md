# Evidence and provenance

Audit date: 12 September 2026. Source: user-supplied `26-ASTRA-AUDIT-PROMPT.md`, Block 0. This is a requirements source, not independent validation. Its embedded instruction to wait for separately pasted prompts does not replace the user's request to implement the whole pack.

Observed checkout base: `464d0c4e8af12897f27619620742aaa69c9332ca`, one commit, README and MIT LICENSE only. No previous history imported. Old code, deck, ADRs, Sonke screenshots, email, programme and datasets were not available for inspection. Repository visibility was not independently queried.

## P4 falsification result shown in the 13 September review screenshot

The screenshot reports `delta_r2 = 0.02787082786001449` and `p_value = 0.00018062196419940484`, and says a second implementation reproduced Sibusiso's checked-in result exactly. A search of this repository and the current predecessor working trees did not locate those exact values, the claimed independent program, its input snapshot or a run manifest. The screenshot is therefore a review lead, not repository evidence, until those artifacts are committed.

Even when independently reproduced, equality from two programs using the same copied dataset establishes implementation reproducibility for that calculation. It does not by itself validate the dataset's provenance, the research design, causal interpretation, generalisation, or IP ownership. Any pitch or audit statement must keep those claims separate.

## Supplied historical evidence — not reproduced in this checkout

- Detection to alert: 318 ms p95, 273 ms p50, **n = 10**, budget 2,000 ms.
- 440 tests; 25 ADRs; 207 commits; approximately 33,600 repository lines, approximately 10,300 server-side. These are historical scope counts, not current checkout counts. **Re-verified 12 September 2026 against both predecessors' `origin/main` — see "Re-derived on 12 September 2026" below. The 25-ADR figure holds exactly; the other two do not reproduce as stated.**
- 15,712 claim records **analysed under a prior engagement, not redistributed**. 764 hotspot suburbs, 709 geocoded; 678 precincts; 9 provinces; 680 hijackings; 1,296 incidents in the 00:00 hour. Modelled exposure R1.09bn; roughly R10.9m per 1% prevented is a hypothetical exposure calculation, not an outcome. SAPS public data reportedly covers 17 of 18 target towns; their names and source extracts were not supplied.
- TRL 4 is the target. The brief reports TRL 4 met and two subsystems at TRL 5; subsystem identities are absent from this checkout, and no ADR states them — `CLAUDE.md` §12's originally planned ADR-0025 for a TRL writeup was never authored before the ADR-port renumbering (`docs/adr.md`, ADR-0026); a TRL ADR, if written, is new work starting at ADR-0027. Do not publish TRL 5 as locally verified.

## Re-derived on 12 September 2026 — exact commands, against both predecessors' `origin/main`

The README invites "clone and count." These are the counts, with the command that produced them, so the invitation survives being taken up.

**25 ADRs — CONFIRMED.** Two predecessor series summed, both starting at 0001:
```
git -C <BEACON checkout> show 'origin/main:docs/adr.md' | grep -cE "^#{1,3} ADR-"   # → 7
git -C <Vuka checkout>   show 'origin/main:docs/adr.md' | grep -cE "^#{1,3} ADR-"   # → 18
```
7 + 18 = 25. Ported into `docs/adr.md` with a provenance table; see ADR-0026 for why the numbering isn't a straight concatenation.

**Commits — 207 does NOT reproduce. The true count is 224.**
```
git -C <BEACON checkout> rev-list --count origin/main   # → 90
git -C <Vuka checkout>   rev-list --count origin/main   # → 134
```
90 + 134 = 224, not 207. Note: the local `Vuka Gradhack` working checkout is on a feature branch (`lethabo/design-handoff-phase1-scenario-engine`), not `main` — counting the checked-out branch instead of `origin/main` gives a different, misleading number (129). Always count `origin/main`.

**Tests — "440 tests" has no reproducing command.** A `git grep` over tracked files (not a plain recursive grep — `node_modules` inflates a naive count to roughly 9,800) finds:
```
git -C <BEACON checkout> grep -ohE "^\s*(async )?def test_" -- '*.py'          # → 208
git -C <BEACON checkout> grep -ohE "\b(it|test)\(" -- '*.ts' '*.tsx' '*.js'    # → 34
git -C <Vuka checkout>   grep -ohE "^\s*(async )?def test_" -- '*.py'          # → 167
git -C <Vuka checkout>   grep -ohE "\b(it|test)\(" -- '*.ts' '*.tsx' '*.js'    # → 101
```
208 + 34 + 167 + 101 = **510 test-function definitions**, tracked files only. That is a *different measure* from "440 tests" — a collected pytest/vitest run count, which was not reproduced here because the two predecessor environments were not stood up to actually execute the suites. Until someone runs both suites and records the collected count, do not restate "440 tests" as a checkable figure; state either "510 test-function definitions found by `git grep`, command above" or run the suites and record what they collect.

## Corrected market figures — 14 September 2026

The live public profile states *"~2.7m registered security officers versus roughly 180k police"*. This compares a **cumulative-ever PSiRA registration count** against a **current SAPS headcount** — different measures, off by roughly 4×. Corrected:

| | Figure | Source |
|---|---|---|
| Active private security officers | **~637,675** (as at 31 March 2025) | PSiRA 2024/25 Annual Report |
| SAPS personnel | **155,231 sworn / 187,681 total** (March 2025) | SAPS |
| Ratio | **≈ 4:1** | derived |
| Private security industry revenue | **R87bn (2024)** — guarding R34.8bn · monitoring/surveillance R17.9bn · CIT R14.4bn · armed reaction R14.3bn | Stats SA |
| Industry revenue by buyer | Business R66.3bn / households R11.6bn / **government R7bn** | Stats SA |

`FACT`, cited. **Replace "2.7m vs 180k" everywhere it appears** — canvas, deck, public profile, docs — with the 4:1 figure and this citation. The corrected number does not need inflating to be a strong market statement; it survives being checked, which the old one did not.

## Anchoring cost — the R1.30/month figure does not survive

The existing R1.30/month figure (below, "Anchoring model") reconstructs as 720 batches/month × $0.0001 × ~R18/USD = R1.296 — a match too exact to be coincidence. That is **Hedera's pre-2026 `ConsensusSubmitMessage` price**.

**Hedera repriced this operation from $0.0001 to $0.0008 in January 2026** — an 8× increase, the first price change since 2019, in effect eight months before this event. Recomputed at the current price: 720 × $0.0008 = $0.576/month ≈ **R9–10/month** at ~R16.24/USD. `FACT`, current pricing not yet independently re-verified against Hedera's published fee schedule at time of use — re-check before quoting.

If **OpenTimestamps is the primary anchor**, as the architecture states, the honest end-user figure is **~R0** — the calendar operators absorb cost via donations, with the caveats already recorded below about service guarantees.

**The number must match a named system at a current price before it reaches a slide.** The *structural* claim — batched, so cost is fixed per network rather than per user, identical at 100 homes or 100,000 — is unaffected by which digit is correct, and remains the strongest commercial-viability point for the blockchain track. See `docs/ANCHOR-RATIONALE.md` for the full blockchain-track argument.

## Supplied economic model — no supplier or customer quotes

KHAYA R299/month; hardware R125/month = R3,000/24; cloud and anchor R12; support/operations R25; gross margin R137, reported 46%. Exact division R137/R299 = 45.8193979933…%, so 46% is the supplied rounded presentation value. Prototype BOM R3,900; target R3,000 at 1,000 units is an estimate.

Security licence R35/subscriber/month; patrol optimiser R12,000/control room (billing period unspecified); estate R5,500/month; insurer installation R40/member/month; claim record R15/record. These are alternatives or contracted add-ons, not revenue automatically stacked on the same household.

Anchoring model: 720 batches/month, approximately R1.30/month for the network. This assumes a 30-day month: 24 × 30 = 720. It is not a universal Bitcoin fee quote, nor proof that all infrastructure cost is independent of users. Public OpenTimestamps calendars are free to use ([official service](https://opentimestamps.org/)); operational costs and service guarantees require validation. A confirmed timestamp establishes a commitment's existence by a time, not truth, identity, event time or motive.

## Verified 23 September 2026 — VIGIL + ANCHOR facts

Added by Lethabo's Claude Code assistant from four source-checked research passes on 23 Sep (market data, fraud/legal/platform, design, and an independent red-team). Each row carries its quote source. **Khutso re-checks each source personally before it reaches a judge** (his rule: nothing enters this file without a command or source he has checked); until he does, treat each row as the assistant's verified reading, not his. ⚑ = secondary source only; a primary read is still owed.

### Market and crime

| Metric | Value | Source (date) | Tag |
|---|---|---|---|
| Digital banking crime, SA | **R2.4bn gross losses, 110,074 incidents, calendar 2025**; banking-app crime ≈ 89% of cases and 70.5% of value; mostly social engineering | SABRIC 2025 Annual Banking Crime Statistics, released 11 Aug 2026, via banking.org.za and BusinessTech | `FACT` |
| The same, one year earlier | R1.888bn, 97,975 incidents (2024) — **not current**; the business plan cited it as "ScamWatchHQ 2026" | SABRIC 2024 report | `FACT` (superseded) |
| Kidnappings | **17,061 in FY2023/24**, up 264% from 4,692 in 2014/15; aggravated robbery 66% of kidnappings, **44% during a hijacking**, 22% during another robbery; under 5% linked to ransom, trafficking or extortion; SAPS defines express kidnapping as coercion into ATM or mobile-banking transfers | ISS Africa, 3 Dec 2024, citing the SAPS Crime Registrar | `FACT` |
| Latest quarter | Carjacking −18.2%; residential robbery −17.6%; trio crimes −16.4% (13,116 → 10,960), Apr–Jun 2026 vs 2025 | SAPS Q1 2026/27 via BusinessDay, 28 Aug 2026 | `FACT` |
| SAPS full-year FY2024/25 and FY2025/26 totals | **Not extracted** — the official PDF table does not survive machine extraction; read p. ~129 of `2025-2026_-_4th_Quarter_WEB.pdf` by eye | saps.gov.za | open — Khutso |
| Bank fraud attempts rising | **75%** of SA banking fraud/AML/compliance leaders (81% among C-suite); **79%** report rising losses — **not 85%** | BioCatch press release, 13 May 2026 (vendor-commissioned) | `FACT` (vendor survey) |
| Banking Ombud fraud complaints | 1,436 → 2,483 (+73%), **Jan–May only**, virtual/digital banking **card** fraud | NFO, 7 Aug 2025 | `FACT` (narrow scope) |
| Absa fraud losses H1 2026 | R129m | BusinessTech, 18 Aug 2026 | `FACT` |
| Short-term claims and fraud | ICB: 10% of R35bn claims spend = R3.5bn — a long-recycled estimate, not a current figure | saicb.co.za | `ESTIMATE` (ICB's) |
| Santam | "More than 1 million" policyholders; market share "less than 24%"; FY2025 GWP R43.9bn — **not 3.7m policyholders** | santam.co.za, 2026; media release 9 Mar 2026 | `FACT` |
| Express kidnapping already insured | iTOO [My]Cylution covers "theft of funds … express kidnapping", **from R22.50/month** | itoo.co.za | `FACT` |
| In-app panic button | FNB GuardMe (Aura), **R19.90/month** after a 3-month trial | htxt.co.za, it-online.co.za, Apr 2022 ⚑ | `FACT` (press) |
| Vehicle trackers | R89–R335/month (Tracker, Netstar, Cartrack) | trackerprices.co.za aggregator, 2026 ⚑ | `FACT` (aggregator) |
| Smartphone excise | 9% ad valorem duty removed on phones under R2,500 from **1 Apr 2025**; entry-level smartphone sales **+80%** in 11 months | National Treasury Budget 2025; GSMA via The Citizen, 6 Jul 2026 | `FACT` |
| UK APP-fraud reimbursement | Mandatory from 7 Oct 2024, capped at £85,000, split 50/50; "gross negligence" is a high bar | psr.org.uk | `FACT` |
| "South Africa is expected to follow" | **No SARB, FSCA, Treasury or PASA statement found** | — | removed |
| Crime displacement | Guerette & Bowers (2009, *Criminology* 47(4)): displacement in 26% of 574 observations, diffusion of benefits in 27% ⚑ (abstract paywalled; figures from secondary summaries) | Wiley DOI 10.1111/j.1745-9125.2009.00177.x | `FACT` ⚑ |
| Adoption reference | Bass diffusion mean p = 0.03, q = 0.38 over 213 parameter sets (durables, 1950s–80s) | Sultan, Farley & Lehmann 1990, *JMR* 27(1) | `FACT` |

### Platform, ledger and law

| Fact | Source | Tag |
|---|---|---|
| YAMNet class indices: Shout 6, Yell 9, **Screaming 11**, Glass 435, Shatter 437, Breaking 464. The predecessor app's hard-coded indices (427/395/195/39) are **not** these classes | `yamnet_class_map.csv`, tensorflow/models | `FACT` |
| Android 14+: a microphone foreground service **cannot be started from the background or from `BOOT_COMPLETED`** (with narrow exceptions) | developer.android.com, FGS background-start restrictions | `FACT` |
| Android 12+ microphone privacy indicator cannot be suppressed by apps | developer.android.com | `FACT` |
| Play: the Accessibility API is only for accessibility tools; SEND_SMS needs a declared exception (physical-safety category exists, review-dependent); stalkerware policy needs a persistent notification | Google Play Console Help | `FACT` |
| Hedera `ConsensusSubmitMessage`: **$0.0008** from Jan 2026 (was $0.0001); finality ~3–5 s ⚑; the mirror node REST API returns consensus timestamp, sequence number and running hash to anyone | hedera.com blog; docs.hedera.com | `FACT` |
| USD/ZAR 16.2075 (22 Sep 2026) → hourly anchoring **R9.34/month** | tradingeconomics; `scripts/economics_vigil_anchor.py` | `FACT` / `ESTIMATE` |
| OpenTimestamps: calendar receipt in ~1 s; Bitcoin attestation typically about an hour to a few hours | opentimestamps.org | `FACT` |
| NIST FIPS 204 (ML-DSA) effective 14 Aug 2024; ML-DSA-65 signature 3,309 bytes, public key 1,952 bytes ⚑ (sizes from secondary summaries, to confirm in the final FIPS text) | Federal Register; csrc.nist.gov | `FACT` / ⚑ |
| **ECTA 25 of 2002 s15(3)** — evidential weight turns on the reliability of generation, storage and communication, of integrity maintenance, and of originator identification | primary Act text (ITU copy), read 23 Sep | `FACT` |
| **RICA 70 of 2002 s1 "intercept"** — acquiring the contents of a *communication* so as to make them available to someone other than the sender or intended recipient | primary Act text (justice.gov.za), read 23 Sep | `FACT` |
| Cybercrimes Act 19 of 2020 s8 (cyber fraud) and s9 (cyber forgery and uttering) | cybercrimesact.co.za reproduction ⚑ | `FACT` ⚑ |
| US FTC 2010 report on emergency ATM PINs: never deployed; could increase danger to victims | FTC report, primary PDF returned 503 ⚑ | ⚑ |
| Capitec Feature Lock: a mandatory 4-hour delay before a locked feature can be unlocked | capitecbank.co.za blog, 2024 | `FACT` |

### Retired for the two-layer product

- The historical 318 ms p95 (n = 10) measured the predecessor's server relay (the UMOJA path). **It is never quoted as VIGIL's latency.** VIGIL's own latency is measurement M3 in `docs/VUKA-2-SPEC.md` §16.
- R1.09bn (theft claims in a third party's dataset) is not a VIGIL market and not a saving. It is retired from all forward-facing material (ADR-0034, `docs/ECONOMICS-VIGIL-ANCHOR.md` §4).

## Failures retained without euphemism

The forecast **loses to the constant baseline: MAE 0.484 versus 0.246**. Fusion weights are hand-set, labelled “PROVISIONAL — NOT fit on real data”. Face thresholds 0.55 and 0.65 cosine are uncalibrated targets. One of six suspicion factors is implemented in the prior project; five are documented stubs. Face demographic bias evaluation has not run. No independent penetration test. No self-trained computer-vision model; pretrained integration only. Hardware has not been fabricated. Retention TTL, subject access and deletion routes are absent.

## Claim rules

Use `sim_` for simulated event identifiers and spoken demo labels. Never imply that simulation is deployed capability. No guarantees about guilt, admissibility, fairness, invulnerability or prevention. Public hashes can remain personal information if linkable. Embeddings are sensitive representations, not anonymous data by default.

## Missing evidence register

| Evidence needed | Owner | Proposed due | Acceptance |
|---|---|---|---|
| Credential rotation for three exposures and reused-password change | Ipeleng + account owners | Sep 13 | Redacted issuer revocation evidence; no secret values in repo |
| Dataset removal from old public repositories/history/caches where controlled | Lethabo | Sep 13 | Repository and hosting remediation record; no old remote or data copied |
| Clean file-by-file port permission and scanning | Sibusiso | Sep 14 | Both leads sign remediation gate |
| Historical tests, latency method, ADR-0025 and component names | Sibusiso | Sep 16 | Sanitised scripts/results and reviewer reproduction |
| Model licence register (G12) — model provenance, sha256, licence and commercial risk | Lethabo | Sep 15 | `docs/MODEL-LICENCES.md`: YAMNet sha256 verified across repos; two HIGH risks named; register published |
| Sonke roster and organiser criteria | Khutso | Sep 14 | Private-source comparison recorded without publishing personal screenshots |
| Original deck and documents for stale-text correction | Lethabo | Sep 16 | File/slide inventory and checked replacements |
| Household/partner interviews and named pilot area | Babatunde | Sep 18 | Consent-safe notes and actual recruitment capacity |
| VIGIL detection recall, false alarms, latency, battery, heartbeat continuity, delivery, false no_answer (M1-M7) | Vukosi (Khutso records) | Sep 26 18:00 | Method, configuration and n per `docs/VUKA-2-SPEC.md` Section 16; "not measured" until then |
| SAPS FY2024/25 and FY2025/26 totals read by eye from the official PDF | Khutso | Sep 24 | Page and table cited; no machine-extracted figures |
| Primary reads: FTC 2010 emergency-PIN report; Cybercrimes Act ss8-9; POPIA s1 biometrics | Ipeleng | Sep 25 | Quote from the primary text replaces each flag |
| Organiser answer on building before Fri 16:00 on declared lineage | Lethabo | Sep 24 12:00 | Written reply recorded (not the email content if private) |

All proposed dates, hours, capacities, design limits, scores and scenario numbers in this pack are planning assumptions, not measurements. IDs, table row counts, statutory section numbers and dates copied from the brief are not measured product claims.
