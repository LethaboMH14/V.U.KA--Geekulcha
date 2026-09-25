# Economics — VIGIL + ANCHOR

> **Owner:** Babatunde Adelusi. **Drafted** 23 September 2026 by Lethabo's Claude Code assistant from Babatunde's 21–22 September business plan, after checking every figure in it against primary sources. **Rebuilt** 24 September 2026 (script v2) with ceiling/floor model, tagged configurable inputs, no hardcoded price. **Status:** `PROPOSED`. Babatunde owns it from here and carries it into the deck and Lean Canvas.

> **Every number here is printed by** `py scripts/economics_vigil_anchor.py` (standard library only; `--json` for machine output, `--sensitivity` for ceiling/floor matrix). Code does the arithmetic. If this page and the script disagree, the script wins and this page is wrong.

> **Babatunde owns every number here, including the subscription price, and may revise any of them at any point during the build.** To change a figure, edit its tagged input in `scripts/economics_vigil_anchor.py`, re-run the script, and update this page, `docs/MASTER-CONTEXT.md` §8 and the deck from its output, with a build-log entry saying why (for example what the user conversations showed). Never change a number on a slide alone.

> **Supersedes** the R299 KHAYA model in `archive/2026-09-four-layer/docs/08-BUSINESS.md` §2.1 and `scripts/economics_engine.py` (PR #40).

---

## 1 · Who pays (decided 23 Sep)

- **The app is free to users.** VIGIL is never behind a paywall.
- **A partner pays a monthly fee per enrolled member** `ASSUMPTION` as a value-added benefit. The partner is a bank or an insurer that switches VIGIL on for its customers. This is the same shelf as FNB's GuardMe panic button (R19.90/month after a 3-month trial, press report Apr 2022 — re-check current price).
- **B2B prices are quoted excluding VAT.** VAT (15%) is added for the partner's invoice; the insurer claims it back if VAT-registered. The compulsory registration threshold is R2.3M/yr from 1 Apr 2026.
- **A per-record fee** when a verified evidence pack is pulled for a dispute or claim `PROPOSED`.
- **Retired:** the R100-per-member insurer story, and the "3% theft-claims reduction saves R20.7m" table (§4 explains why).
- **Wording:** "free to the uninsured; funded through the insurer's premium for policyholders" — not "free to users".

---

## 2 · Unit economics — ceiling/floor model (script v2)

The model finds the feasible price range where **floor ≤ ceiling**.

### Floor (VUKA's cost per enrolled member per month)

```
floor = variable_cost
      + fixed_cost / enrolled_members
      + margin_per_member
      + payroll_levies / enrolled_members
```

### Ceiling (insurer's willingness to pay per enrolled member per month)

```
ceiling = (claims_cost_per_member_year × claims_reduction_pct / 12)
        + (retention_value_per_member_year / 12)
```

A deal exists only where `floor ≤ ceiling`. The price is an **output** — the script finds the feasible range.

### Cost breakdown (monthly, ZAR)

| Line | Value | Tag | Notes |
|---|---:|---|---|
| **Variable cost per member/month** (cloud only) | **R0.15** | `ESTIMATE` | Extra cloud at 10k members; support & compliance moved to fixed |
| **Anchoring ceiling** (fixed, whole network) | **R569.47** | `ESTIMATE` | Hourly R9.34 + immediate cap R560.13; $0.0008/msg × R16.2075; spec §10 |
| **Fixed ops base** (excl. stipends, anchoring, compliance, support) | **R9,519.17** | `ESTIMATE` | Hosting R2,500 + email R800 + Sage R240 + insurance R700 + monitoring R400 + ticketing R450 + accountant R4,400 + CIPC R29.17 |
| **Compliance annual** | **R68,000** | `ESTIMATE` | Allocated over enrolled members (scales with 1/N) |
| **Support** | **R25,000/mo per 5,000 members** | `ESTIMATE` | Step cost — one agent per 5k members |
| **Stipend** | **R30,000/mo each** | `ASSUMPTION` | 5 of 7 people (5 or 7 to be decided) |
| **Payroll levies** (if stipends become salaries) | UIF 1% (cap R17,712/mo), SDL 1% (>R500k/yr) | `FACT` | Rivermate/Xero Aug 2026 |
| **VAT** | **15%** | `FACT` | SARS standard rate; threshold R2.3M/yr from 1 Apr 2026 |

### Break-even enrolled members (rounded UP, VAT-exclusive, no free members, no margin)

| Price/mo | 5 stipends | 7 stipends |
|---:|---:|---:|
| R10 | 34,324 | 48,152 |
| R15 | 17,717 | 23,522 |
| R19.90 | 12,056 | 16,420 |
| **R20** | **11,995** | **16,338** |
| R22.50 | 9,535 | 13,392 |
| R25 | 8,576 | 12,045 |
| **R50** | **3,774** | **5,503** |
| R100 | 1,885 | 2,497 |

*At R50 excl. VAT with 5 stipends: 3,774 members. At R50 incl. VAT (R43.48 net): 4,342 members.*

### Operating margin at scale (R50 excl. VAT, 5 stipends, no free members)

| Enrolled | Operating margin |
|---:|---:|
| 10,000 | 42.8% |
| 25,000 | 59.1% |
| 50,000 | 65.8% |
| 100,000 | 69.6% |

### Actuary test — required claims reduction at candidate prices

| Price/mo | Required annual saving (12×) | At R2,000 claims/member/yr | At R5,000 claims/member/yr |
|---:|---:|---:|---:|
| R20 | R240 | 12.0% | 4.8% |
| R50 | R600 | 30.0% | 12.0% |
| R100 | R1,200 | 60.0% | 24.0% |

*Claims reduction is a pilot measurement, not a promise. Retention/acquisition value carries the commercial argument.*

---

## 3 · What the South African market already pays for this shelf

| Product | Price | What it tells a buyer |
|---|---|---|
| **FNB GuardMe** (Aura) in-app panic button | R19.90/month after 3-month trial (press report, Apr 2022 — re-check current price) | A bank already sells safety inside its app. It needs a press; **VIGIL works when you can't press** |
| **iTOO [My]Cylution** | from **R22.50/month** | Already insures **express kidnapping** and theft of funds as named perils. Partner or objection; we pre-empt: "we make those claims cheaper to verify" |
| Vehicle trackers (Tracker, Netstar, Cartrack) | R89–R335/month | Policyholders already pay monthly for insurer-linked safety tech |
| Discovery Insure Vitality Drive | R150 once-off device activation | A major insurer runs a phone-and-telematics safety programme |

---

## 4 · Why the R100 insurer story was retired

It counted savings on the **whole** R1.09bn theft book of a third party's claims dataset (14,380 claims — `docs/EVIDENCE.md:17`, "a hypothetical exposure calculation, not an outcome") but charged the fee on **10,000** members. For the table to work, every member would have to file **1.44 theft claims a year**, costing the insurer **R109,000 each**. Counted on the members actually paying, an insurer with R2,000 or R5,000 of relevant claims per member per year needs a **60% or 24%** reduction just to recover a R100 fee. VIGIL doesn't prevent theft at all.

The industry figures that supported it were vendor marketing or sandbox results (the "20% fewer payouts", "3× faster", "14–56× ROI" and "25–30% lower expenses" claims), not deployed outcomes.

---

## 5 · "1%, 5%, 10%" — of what, and by when

A penetration percentage needs a base. The honest base is **one partner's customers**, not "South Africa". Take a partner with **1 million app customers** `ASSUMPTION`. On the published average Bass diffusion curve (Sultan, Farley & Lehmann 1990; 213 parameter sets — durables-era, a reference, not a forecast):

| Share of partner's base | Members | Months after switch-on |
|---|---:|---:|
| 1% | 10,000 | ~3.8 |
| **Break-even at R20 (1.09%)** | **10,901** | **~4.1** |
| 5% | 50,000 | ~15.9 |
| 10% | 100,000 | ~27.0 |

A default-on switch inside a bank app would be faster; a download-only campaign slower. **Claims-reduction percentages** are not asserted at all. A pilot measures them (§7).

---

## 6 · The market, with the counterweights left in

| Fact | Source | Tag |
|---|---|---|
| **R2.4bn** digital banking crime in 2025, **110,074** incidents (≈ R21,800 each); banking apps ≈ 89% of cases, 70.5% of value; mostly social engineering | SABRIC 2025 report (released 11 Aug 2026) | `FACT` |
| **17,061** kidnappings in 2023/24, up 264% from 4,692 in 2014/15; **44%** during a hijacking (≈ 7,500); SAPS defines express kidnapping as coercion into ATM or app transfers | SAPS Crime Registrar via ISS Africa (3 Dec 2024) | `FACT` / `ESTIMATE` |
| **75%** of SA banking leaders report rising fraud attempts, 79% rising losses | BioCatch press release, 13 May 2026 — vendor-commissioned survey | `FACT` (labelled vendor) |
| Entry-level smartphone sales **+80%** after 9% excise duty on phones under R2,500 removed 1 Apr 2025 | GSMA via The Citizen (6 Jul 2026) | `FACT` |
| Carjacking, house & business robbery combined **−16.4%** (Apr–Jun 2026 vs 2025) | SAPS Q1 2026/27 | `FACT` |
| UK mandatory APP-fraud reimbursement from 7 Oct 2024, capped £85,000, split 50/50 | UK PSR | `FACT` — **no SA regulator has committed to follow** |

**Read together:** physical robbery is falling while app-driven crime rises. The money moved into the phone, and so did the attack. **R2.4bn is not our market.** Coerced transfers are a subset of unknown size, bounded above by the kidnapping figures.

---

## 7 · What a pilot must measure before any saving is claimed

False alarms per armed hour · missed events · share of alerts delivered · guardian response time · bank holds triggered and released · verified evidence packs pulled · claims-handling time with and without an E2 record · legitimate payouts (a good record may *increase* fair payouts) · fraud leakage.

---

## 8 · Corrections carried from the business plan

| In the plan | Now | Source |
|---|---|---|
| R1.9bn / 97,975 ("ScamWatchHQ 2026") | **R2.4bn / 110,074** (2025) | SABRIC |
| 85% of banks | **75%** (vendor survey) | BioCatch primary release |
| Banking Ombud fraud complaints +73% | Real, but **Jan–May** and **virtual-card fraud** only, published Aug 2025 | NFO |
| "Nearly R2bn" and R3.5bn fraud | One recycled ICB estimate: 10% × R35bn = R3.5bn | ICB |
| Santam 3.7m policyholders | **"More than 1 million"** | santam.co.za |
| NFO 35% motor / 8% theft-hijack | Not found — removed | — |
| 94% "net margin" | **94.28% was contribution margin at R100**; at R50 it is 77.1% | this script |
| Profit "~R9.8m at break-even" | Zero by definition | arithmetic |
| Bank per-case 2,000 cases = break-even | **10,378 cases/month** at R15 | this script |
| "South Africa is expected to follow" the UK | No statement found — removed | — |
| Crime displacement as an advantage | Removed (see `docs/STAGED-DURESS-DEFENCE.md` §7) | Guerette & Bowers 2009 |

---

## 9 · Ceiling vs Floor — sensitivity matrix (script v2)

Run `py scripts/economics_vigil_anchor.py --sensitivity` for the full matrix.

### Feasibility (ceiling ≥ floor) at r = claims reduction, 5 stipends

| r | 1,000 members | 5,000 members | 10,000 members |
|---:|---:|---:|---:|
| 5% | ✗ (floor R188 > ceiling R21) | ✗ (floor R38 > ceiling R21) | ✗ (floor R21 > ceiling R21) |
| 10% | ✗ | **✓** (gap +R3.90) | **✓** (gap +R20.21) |
| 15% | ✗ | **✓** (gap +R24.73) | **✓** (gap +R41.04) |
| 20% | ✗ | **✓** (gap +R45.56) | **✓** (gap +R61.87) |

*At 7 stipends, floor is higher; feasibility requires higher r or more members.*

---

## 10 · VAT and free members

- **B2B prices quoted excluding VAT.** Partner pays VAT on invoice; VAT-registered insurer claims it back.
- **VAT-inclusive breakeven:** at R50 incl. VAT (R43.48 net), break-even rises to ~4,342 (5 stipends) or ~6,331 (7 stipends).
- **Free members:** insurer pays variable cost (R0.15/mo) for every enrolled member. Free-to-paying ratio is a model input.

| Free ratio | R50 excl. VAT BE (5 stipends) | R50 excl. VAT BE (7 stipends) |
|---:|---:|---:|
| 0% | 3,774 | 5,503 |
| 10% | 4,195 | 6,116 |
| 20% | 4,721 | 6,884 |

---

## 11 · Cost inputs — tagged (from script v2)

| Input | Value | Tag | Source |
|---|---:|---|---|
| Stipend/month | R30,000 | `ASSUMPTION` | Team assumption |
| Stipend count | 5 (or 7) | `ASSUMPTION` | Team assumption; 5 of 7 people |
| Hosting/month | R2,500 | `ESTIMATE` | Azure App Service Shared; to confirm |
| Email/month | R800 | `ESTIMATE` | Transactional email; to confirm |
| Sage/month | R240 | `ESTIMATE` | Sage accounting; to confirm |
| Insurance/month | R700 | `ESTIMATE` | Cyber + PI combined; iTOO + AON |
| Monitoring/month | R400 | `ESTIMATE` | Infra monitoring; to confirm |
| Ticketing/month | R450 | `ESTIMATE` | Support ticketing; to confirm |
| Accountant/month | R4,400 | `ESTIMATE` | ProCompare average |
| CIPC annual | R350 | `ESTIMATE` | By turnover band |
| Compliance annual | R68,000 | `ESTIMATE` | Allocated over enrolled members |
| Support agent | R25,000/mo | `ESTIMATE` | 1 per 5,000 members (step) |
| Cloud/member/mo | R0.15 | `ESTIMATE` | Extra cloud at 10k; to measure |
| UIF | 1% (cap R17,712/mo) | `FACT` | Rivermate Aug 2026 |
| SDL | 1% if payroll > R500k/yr | `FACT` | Xero Aug 2026 |
| VAT | 15% | `FACT` | SARS standard rate |
| VAT threshold | R2.3M/yr | `FACT` | SARS from 1 Apr 2026 |
| HCS fee | $0.0008/msg | `FACT` | Hedera Jan 2026 |
| USD/ZAR | 16.2075 | `FACT` | tradingeconomics 22 Sep 2026 |
| Anchoring ceiling | R569.47/mo | `ESTIMATE` | Spec §10; fee + FX dependent |

**All figures computed by `py scripts/economics_vigil_anchor.py` — script is the arithmetic source of truth.**