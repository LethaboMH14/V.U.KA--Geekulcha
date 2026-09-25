# Market Data Register

**Status:** PROPOSED — working document. Owner: Babatunde Adelusi.
**Purpose:** Verified market data points used in the VUKA pricing model.
**Source rule:** a `FACT` row needs a linkable source and date in the row, or its entry in `docs/EVIDENCE.md`. Most rows now have URLs and dates; remaining gaps are noted. Until a row has a linkable source, read it as ⚑ secondary, and don't quote it on a slide. Babatunde adds the links; Khutso confirms them into `docs/EVIDENCE.md`.
**Relationship to EVIDENCE.md:** `docs/EVIDENCE.md` is Khutso's register. This file points to it. Where a figure also lives in EVIDENCE.md, this file cites the line and does not duplicate the row.

## 1. Problem size — digital banking fraud

| Figure | Value | Tag | Source | Date | URL / Note |
|---|---|---|---|---|---|
| SA digital banking fraud losses (2024) | R1.888bn | FACT | SABRIC 2024 Annual Banking Crime Statistics | 11 Aug 2026 | https://www.banking.org.za/ — released 11 Aug 2026; also BusinessTech coverage |
| SA digital banking fraud incidents (2024) | **97,975** | FACT | `docs/EVIDENCE.md:14` | 23 Sep 2026 | Do not use 64,000. Conflict resolved in favour of EVIDENCE.md. |
| SA digital banking fraud losses (2025) | R2.4bn | FACT | SABRIC 2025 Annual Banking Crime Statistics | 11 Aug 2026 | https://www.banking.org.za/ — released 11 Aug 2026; also BusinessTech coverage |
| SA digital banking fraud incidents (2025) | 110,000+ | FACT | SABRIC 2025 | 11 Aug 2026 | Same scope caveat. |

**Scope warning:** SABRIC totals cover all digital banking crime. Most is social engineering, not coerced in-person transfers. Do not present these as the coerced-transfer market size.

## 2. Industry benchmarks

| Figure | Value | Tag | Source | Date | URL / Note |
|---|---|---|---|---|---|
| Short-term insurance claims ratio | **51.4%** | FACT | Prudential Authority, Dec 2025 | Dec 2025 | https://www.fsca.co.za/ — "Non-Life insurance: Primary insurers" PDF, printed p. 7; footnote defines as % of net written premium. Quote exact span with page before use. |
| Compulsory VAT registration threshold (from 1 Apr 2026) | R2.3m | FACT | SARS | 1 Apr 2026 | https://www.sars.gov.za/ — Budget Review 2025 p.45 & tariff amendment notice |

## 3. Market comparables — competitor pricing

| Product | Price | Tag | Source | Date | URL / Note |
|---|---|---|---|---|---|
| FNB GuardMe | R19.90/month | FACT | FNB published pricing | **April 2022** | https://www.fnb.co.za/ — carry the date; re-check current price before quoting |
| iTOO [My]Cylution (entry) | R22.50/month | FACT | iTOO published pricing | 24 Sep 2026 | https://itoo.co.za/mycylution/ — current at time of writing |
| iTOO [My]Cylution (top tier) | R300/month | FACT | iTOO published pricing | 24 Sep 2026 | https://itoo.co.za/mycylution/ — current at time of writing |
| Tracker subscriptions (vehicle) | R89–R335/month | FACT | Industry range | 2026 | https://trackerprices.co.za/ — confirms vehicle policyholders already pay this band |

## 4. VUKA operating costs — verified

| Figure | Value | Tag | Source | Date | URL / Note |
|---|---|---|---|---|---|
| Hedera ConsensusSubmitMessage | $0.0008/message | FACT | Hedera blog | Jan 2026 | https://hedera.com/blog/price-update-to-consensussubmitmessage-in-consensus-service-january-2026 |
| USD/ZAR used in script | 16.2075 | FACT | tradingeconomics | 22 Sep 2026 | https://tradingeconomics.com/south-africa/currency |
| Anchoring ceiling (monthly) | R569.47 | ESTIMATE | Derived: 43,200 immediate + 720 hourly × $0.0008 × 16.2075 | 24 Sep 2026 | Per spec §10; moves with fee schedule & FX |
| Azure App Service (Shared) | $9.49/month | FACT | Azure pricing calculator | 24 Sep 2026 | https://azure.microsoft.com/pricing/calculator/ (App Service, Shared, South Africa North) |
| Azure PostgreSQL (B1ms) | ~$12/month | FACT | Azure pricing calculator | 24 Sep 2026 | https://azure.microsoft.com/pricing/calculator/ (PostgreSQL Flexible, B1ms) |
| Azure PostgreSQL (B2ms, ZA North) | $126/month | FACT | Azure pricing calculator | 24 Sep 2026 | https://azure.microsoft.com/pricing/calculator/ (PostgreSQL Flexible, B2ms, South Africa North) |
| SMS gateway | R0.18–R0.29/SMS | FACT | WinSMS pricing | 2026 | https://winsms.co.za/pricing/ — volume-dependent |
| Customer support agent | R8,101–R30,000/month | FACT | Indeed, RecruiterFlow, City of Johannesburg | 2026 | Average R25,000 used in script; https://za.indeed.com/career/support-agent/salaries |
| Cyber insurance (SME) | R450/month | FACT | iTOO SureThing | 2026 | https://itoo.co.za/surething/ — entry tier; range up to R50,000/year |
| Professional indemnity (R2.5m) | R2,615/year | FACT | AON South Africa | 2026 | https://www.aon.com/south-africa/ — R2.5m aggregate + 1 reinstatement |
| Accountant retainer (average) | R4,400/month | FACT | ProCompare | 2026 | https://procompare.co.za/accountant-fees/ — range R1,950–R6,000 |
| CIPC annual return | R100–R600/year | FACT | CIPC | 2026 | https://www.cipc.co.za/ — by turnover band |
| UIF employer contribution | 1%, capped R17,712/month | FACT | Rivermate | Aug 2026 | https://rivermate.com/country/south-africa/ — UIF cap |
| SDL employer contribution | 1% if payroll > R500,000/year | FACT | Xero | Aug 2026 | https://www.xero.com/za/resources/payroll/skills-development-levy/ |
| Engineering tools (ChatGPT Plus) | $20/month (~R324) | FACT | OpenAI pricing | 2026 | https://openai.com/chatgpt/pricing/ — R400 ESTIMATE if no invoice (15% VAT) |
| Engineering tools (Claude Pro) | $20/month (~R324) | FACT | Anthropic pricing | 2026 | https://www.anthropic.com/pricing — R400 ESTIMATE if no invoice (15% VAT) |

## 5. Figures that must stay ESTIMATE

| Figure | Why ESTIMATE |
|---|---|
| R5.72 operational cost per member | Inputs (cloud, support, compliance) are ESTIMATE in the script. Output cannot be FACT. |
| R569.47 anchoring ceiling | Depends on fee schedule and one day's exchange rate. |
| R400 per engineering tool | $20 × R16.21 = R324.15, or R372.77 with VAT. Only FACT if an invoice shows R400. |
| Engineering tools total (R3,340) | Sum of ESTIMATE inputs. |

## 6. Figures that are ASSUMPTION

| Figure | Why ASSUMPTION |
|---|---|
| Frequency of coerced-transfer claims | Must come from the insurer's own data. |
| Severity (average claim value) | Must come from the insurer's own data. |
| Claims reduction (r) | Pilot measurement, not a promise. |
| Founder stipends (5 × R30,000) | Team assumption. 5 stipends for 7 people. Open. |
| Free-to-paying ratio | Not yet modelled. |

## 7. Conflict resolutions

| Conflict | Resolution |
|---|---|
| SABRIC 2024 incidents: 64,000 vs 97,975 | 97,975. `docs/EVIDENCE.md:14` is the register. |
| Claims ratio: 53–54% vs 51.4% | 51.4%. Prudential Authority, Dec 2025. **Quote exact span with page before use.** Source: PA "Non-Life insurance: Primary insurers" PDF, printed p. 7; footnote defines as % of net written premium. |
| "Free to users" | Do not say. Use "free to the uninsured; funded through the insurer's premium for policyholders." |
| R1.09bn | Retired. Modelled exposure from third-party dataset, not a savings base. |

## 8. What this file does not do

- It does not duplicate `docs/EVIDENCE.md`. Khutso owns that register. This file points to it.
- It does not decide the price. The price is an output of the model.
- It does not promise claims savings. Those are pilot measurements.
