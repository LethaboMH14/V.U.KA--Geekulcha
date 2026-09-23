# Pricing model — working thread (owner: Babatunde)

> **Status:** `PROPOSED` working document, opened 23 Sep 2026 to carry on the pricing discussion from PR #43 (merged). **Babatunde owns the price and every number here.** Lethabo reviews. Nothing in this file is a decided price.
>
> **Read with:** `docs/ECONOMICS-VIGIL-ANCHOR.md`, `scripts/economics_vigil_anchor.py`, `docs/EVIDENCE.md` (the fact register Khutso owns).

## 1 · Where PR #43 left it

**Accepted by Babatunde** ([comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800759621), [comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988)):
- Break-even rounds **up** (`math.ceil`). A fraction of a member doesn't pay.
- **Claims savings are what the pilot measures, not what we promise.** The pitch leads with product value: retention, acquisition, faster verification, less fraud leakage.
- The pilot success criterion is the actuary test: the insurer saves at least **12 × price per enrolled member per year**, measured on the insurer's own data.
- R1.09bn and 318 ms are retired. The ICB proxy is out.
- "Free to users" is not said. Use: "free to the uninsured; funded through the insurer's premium for policyholders".
- **The price becomes an output of the model, not an input.**

**Working number:** a single tier at **R50** ([comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988)). Babatunde decides by **Fri 25 Sep** and quotes the script's output.

## 2 · Open points to settle here

| # | Point | Raised in | Owner |
|---|---|---|---|
| 1 | **The model's direction.** `F × S × (1 − r)` is the claims the insurer *still* pays, so that price rises as VIGIL gets *less* effective. Proposed instead: a **ceiling** (insurer gain = F × S × r ÷ 12, plus measured retention value) against a **floor** (R5.72 + fixed ÷ members + VUKA margin). The script's actuary test `r* = 12p / c` is the same inequality solved for r | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5801391858) | Babatunde |
| 2 | **Consistent units:** F × S is annual; R5.72 is monthly | same | Babatunde |
| 3 | **The sensitivity table:** r = 5, 10, 15 and 20%; ceiling vs floor at 1,000, 5,000 and 10,000 members | [Babatunde](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988) | Babatunde |
| 4 | **Tools counted twice?** `fixed_monthly` already includes R5,090 for "tools/hosting/insurance" (`scripts/economics_vigil_anchor.py:14`). Split it before adding R3,340 | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5801391858) | Babatunde |
| 5 | **Base fixed cost.** The R160,290 figure implies a base of R156,950; the script prints R155,659.47. Commit any input change and quote the output | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800723436) | Babatunde |
| 6 | **Free members cost R5.72/month each.** Add a free-to-paying ratio input, or name who funds free members | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800804685) | Babatunde |
| 7 | **Tier structure:** a single R50 tier, or base ≈R20 + premium ≈R100 + a per-record fee. The premium tier needs a **named segment** | [Babatunde](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800759621) | Babatunde |
| 8 | **Stipends:** 5 stipends for a 7-person team | [Babatunde](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800598590) | Team |

## 3 · Figures to confirm before they are tagged `FACT`

| Figure as quoted | Conflict or gap | What's needed |
|---|---|---|
| SABRIC 2024: R1.888bn, **64,000** incidents | `docs/EVIDENCE.md:14` records **97,975** incidents | The literal span and page from the SABRIC report |
| Industry claims ratio **~53–54%** | **51.4%** was quoted for the same Prudential Authority release | The literal span and page |
| Operational cost **R5.72/member/month** | Its inputs are tagged `ESTIMATE` in the script ([Sbu](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5801132862)) | Tag it `ESTIMATE` |
| Anchoring ceiling **R569.47/month** | `docs/VUKA-2-SPEC.md` §10 labels it `ESTIMATE` (fee schedule plus one day's exchange rate) | Keep `ESTIMATE` |
| FNB GuardMe **R19.90** | An April 2022 price | Quote it with its date, or re-check it |
| SABRIC totals as the market | They cover all digital banking crime, mostly social engineering, **not** coerced transfers | Say so wherever they are used |

New figures go into `docs/EVIDENCE.md` (Khutso's register), so each lives in one place.

## 4 · Babatunde's Friday list (from [his comment](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988))
- [ ] Market data committed, with citations
- [ ] `scripts/economics_vigil_anchor.py` rebuilt: price as an output, every input configurable, no hardcoded price
- [ ] The sensitivity table at r = 5, 10, 15 and 20%, on `ASSUMPTION` inputs and on market-comparable inputs
- [ ] The price decision posted here, with the script output quoted
- [ ] Update `docs/ECONOMICS-VIGIL-ANCHOR.md` to match
