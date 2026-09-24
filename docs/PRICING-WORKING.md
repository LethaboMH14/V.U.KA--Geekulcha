# Pricing model — working thread (owner: Babatunde)

> **Status:** `PROPOSED` working document, opened 23 Sep 2026 to carry on the pricing discussion from PR #43 (merged). **Babatunde owns the price and every number here.** Lethabo reviews. Nothing in this file is a decided price.

> **Read with:** `docs/ECONOMICS-VIGIL-ANCHOR.md`, `scripts/economics_vigil_anchor.py`, `docs/EVIDENCE.md` (the fact register Khutso owns).

## 1 · Where PR #43 left it

**Accepted by Babatunde** ([comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800759621), [comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988)):
- Break-even rounds **up** (`math.ceil`). A fraction of a member doesn't pay.
- **Claims savings are what the pilot measures, not what we promise.** The pitch leads with product value: retention, acquisition, faster verification, less fraud leakage.
- The pilot success criterion is the actuary test: the insurer saves at least **12 × price per enrolled member per year**, measured on the insurer's own data.
- R1.09bn and 318 ms (n = 10, a retired relay) are retired. The ICB proxy is out.
- "Free to users" is not said. Use: "free to the uninsured; funded through the insurer's premium for policyholders".
- **The price becomes an output of the model, not an input.**

**Working number:** a single tier at **R50** ([comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988)). Babatunde decides by **Fri 25 Sep** and quotes the script's output.

## 2 · Open points to settle here

| # | Point | Raised in | Owner |
|---|---|---|---|
| 1 | **The model's direction.** `F × S × (1 − r)` is the claims the insurer *still* pays, so that price rises as VIGIL gets *less* effective. Proposed instead: a **ceiling** (insurer gain = F × S × r ÷ 12, plus measured retention value) against a **floor** (variable + fixed/enrolled + margin + payroll/enrolled). The script's actuary test `r* = 12p / c` is the same inequality solved for r | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5801391858) | Babatunde |
| 2 | **Consistent units:** F × S is annual; variable cost is monthly | same | Babatunde |
| 3 | **The sensitivity table:** r = 5, 10, 15 and 20%; ceiling vs floor at 1,000, 5,000 and 10,000 members; 5 vs 7 stipends | [Babatunde](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988) | Babatunde |
| 4 | **Tools counted twice?** `fixed_monthly` already includes R5,090 for "tools/hosting/insurance" (`scripts/economics_vigil_anchor.py:14`). Split it before adding R3,340 | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5801391858) | Babatunde |
| 5 | **Base fixed cost.** The R160,290 figure implies a base of R156,950; the script prints R155,659.47. Commit any input change and quote the output | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800723436) | Babatunde |
| 6 | **Free members cost R5.72/month each.** Add a free-to-paying ratio input, or name who funds free members | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800804685) | Babatunde |
| 7 | **Tier structure:** a single R50 tier, or base ≈R20 + premium ≈R100 + a per-record fee. The premium tier needs a **named segment** | [Babatunde](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800759621) | Babatunde |
| 8 | **Stipends:** 5 stipends for a 7-person team | [Babatunde](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800598590) | Team |
| 9 | **Compliance scales with members.** R68,000/year allocated over enrolled members, not constant per-member | [this rebuild] | Babatunde |
| 10 | **Support is step-cost.** One R25,000 agent per 5,000 members, not smooth fractional | [this rebuild] | Babatunde |
| 11 | **VAT basis.** B2B prices quoted excluding VAT; model inclusive case (at R50 incl. VAT, break-even rises) | [this rebuild] | Babatunde |
| 12 | **Payroll levies.** UIF 1% (capped), SDL 1% above threshold — only if stipends become salaries | [this rebuild] | Team |

## 3 · Figures to confirm before they are tagged `FACT`

| Figure as quoted | Conflict or gap | What's needed |
|---|---|---|
| SABRIC 2024: R1.888bn, **64,000** incidents | `docs/EVIDENCE.md:14` records **97,975** incidents | The literal span and page from the SABRIC report |
| Industry claims ratio **~53–54%** | **51.4%** was quoted for the same Prudential Authority release | The literal span and page |
| Operational cost **R0.15/member/month** (cloud only) | Support & compliance moved to fixed; R5.72 retired as a blended figure | Tag cloud-only `ESTIMATE` |
| Anchoring ceiling **R569.47/month** | `docs/VUKA-2-SPEC.md` §10 labels it `ESTIMATE` (fee schedule + one day's FX) | Keep `ESTIMATE` |
| FNB GuardMe **R19.90** | An April 2022 price | Quote it with its date, or re-check it |
| SABRIC totals as the market | They cover all digital banking crime, mostly social engineering, **not** coerced transfers | Say so wherever they are used |

New figures go into `docs/EVIDENCE.md` (Khutso's register), so each lives in one place.

## 4 · Babatunde's Friday list (from [his comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988))

- [x] Market data committed, with citations (`docs/MARKET-DATA.md`, #53)
- [x] `scripts/economics_vigil_anchor.py` rebuilt: price as an output, every input configurable, no hardcoded price
- [x] The sensitivity table at r = 5, 10, 15 and 20%, on `ASSUMPTION` inputs and on market-comparable inputs
- [ ] The price decision posted here, with the script output quoted
- [ ] Update `docs/ECONOMICS-VIGIL-ANCHOR.md` to match

## 5 · Continue here — economics v2 (opened 24 Sep 2026 for Babatunde)

PR #46 (this working file) and PR #53 (`docs/MARKET-DATA.md`) are merged. This branch carries the rest of the economics work.

- [x] Market data committed (`docs/MARKET-DATA.md`, #53)
- [ ] **Source links for `MARKET-DATA.md` §4 and the VAT row.** Each `FACT` row needs a URL and date, or it stays ⚑ secondary and off the slides. Khutso confirms them into `docs/EVIDENCE.md`.
- [ ] **Claims ratio:** quote the exact Prudential Authority span and page for 51.4%.
- [x] **Script rebuild** (`scripts/economics_vigil_anchor.py`): ceiling/floor model with tagged configurable inputs, no hardcoded price, consistent units (annualised ceiling, monthly floor), member-sensitive compliance, support step-cost, VAT modes, free-ratio, stipend scenarios, payroll levies.
- [x] **Split the R5,090** into hosting R2,500, email R800, Sage R240, insurance R700, monitoring R400, ticketing R450. Tools added as per-engineer input.
- [x] **Missing costs as tagged inputs:** SMS fallback per alert per guardian; 24/7 on-call cover; production hosting (managed PostgreSQL, backups, 90-day storage); cyber and PI insurance; accountant and CIPC; UIF/SDL if stipends become salaries; payment terms and working capital; USD exposure; real bank integration after `sim_bank`.
- [x] **VAT basis:** quote B2B prices excluding VAT. Model the VAT-inclusive case (at R50 inclusive, break-even rises to ~4,342 on today's base at 5 stipends).
- [x] **Free members:** add the free-to-paying ratio. The insurer pays variable cost for every enrolled member.
- [x] **Stipends:** 5 or 7. At 7, break-even at R50 is ~5,503 (excl. VAT) on today's base.
- [x] **Sensitivity table** at r = 5, 10, 15 and 20%, and at 1,000, 5,000 and 10,000 members: ceiling next to floor, printed by script.
- [x] **Pitch rule (from PR #50):** show the tier and E-level only. Never a score, a percentage or a "likelihood".
- [ ] **Price decision** posted on this PR with the script output quoted.
- [ ] **Update `docs/ECONOMICS-VIGIL-ANCHOR.md`** to match.

## 6 · Rebuilt model — key outputs (script v2)

### 6.1 Ceiling vs Floor feasibility (r = claims reduction, members = enrolled)

| r | 1,000 members (5 stipends) | 5,000 members (5 stipends) | 10,000 members (5 stipends) |
|---:|---:|---:|---:|
| 5% | ceiling R20.83 < floor R188.31 ✗ | ceiling R20.83 < floor R37.77 ✗ | ceiling R20.83 < floor R21.46 ✗ |
| 10% | ceiling R41.67 < floor R188.31 ✗ | **ceiling R41.67 > floor R37.77 ✓** (gap +R3.90) | **ceiling R41.67 > floor R21.46 ✓** (gap +R20.21) |
| 15% | ceiling R62.50 < floor R188.31 ✗ | **ceiling R62.50 > floor R37.77 ✓** (gap +R24.73) | **ceiling R62.50 > floor R21.46 ✓** (gap +R41.04) |
| 20% | ceiling R83.33 < floor R188.31 ✗ | **ceiling R83.33 > floor R37.77 ✓** (gap +R45.56) | **ceiling R83.33 > floor R21.46 ✓** (gap +R61.87) |

*At 7 stipends, floor is higher; feasibility requires higher r or more members.*

### 6.2 Breakeven enrolled members (rounded UP, VAT-exclusive, no free members, no margin)

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

### 6.3 VAT-inclusive breakeven (15% VAT, partner pays VAT-exclusive price)

| Price/mo (VAT-incl) | Effective VAT-excl | 5 stipends BE | 7 stipends BE |
|---:|---:|---:|---:|
| R50 | R43.48 | 4,342 | 6,331 |
| R100 | R86.96 | 2,168 | 2,872 |

### 6.4 Free-member impact (insurer pays variable cost for all enrolled)

| Free ratio | R50 (5 stipends) BE | R50 (7 stipends) BE |
|---:|---:|---:|
| 0% | 3,774 | 5,503 |
| 10% | 4,195 | 6,116 |
| 20% | 4,721 | 6,884 |

### 6.5 Operating margin at scale (R50 excl. VAT, 5 stipends, no free members)

| Enrolled | Op margin |
|---:|---:|
| 10,000 | 42.8% |
| 25,000 | 59.1% |
| 50,000 | 65.8% |
| 100,000 | 69.6% |

### 6.6 Actuary test — required claims reduction at candidate prices

| Price/mo | Required annual saving (12×) | At R2,000 claims/member/yr | At R5,000 claims/member/yr |
|---:|---:|---:|---:|
| R20 | R240 | 12.0% | 4.8% |
| R50 | R600 | 30.0% | 12.0% |
| R100 | R1,200 | 60.0% | 24.0% |

*Claims reduction is a pilot measurement, not a promise. Retention/acquisition value carries the commercial argument.*

### 6.7 Cost inputs (tagged, from script v2)

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