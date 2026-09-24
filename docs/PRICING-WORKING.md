# Pricing model — working thread (owner: Babatunde)

> **Status:** `PROPOSED` working document, opened 23 Sep 2026 to carry on the pricing discussion from PR #43 (merged). **Babatunde owns the price and every number here.** Lethabo reviews. Nothing in this file is a decided price.
>
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
| 1 | **The model's direction.** `F × S × (1 − r)` is the claims the insurer *still* pays, so that price rises as VIGIL gets *less* effective. Proposed instead: a **ceiling** (insurer gain = F × S × r ÷ 12, plus measured retention value) against a **floor** (R5.72 + fixed ÷ members + VUKA margin). The script's actuary test `r* = 12p / c` is the same inequality solved for r | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5801391858) | Babatunde |
| 2 | **Consistent units:** F × S is annual; R5.72 is monthly | same | Babatunde |
| 3 | **The sensitivity table:** r = 5, 10, 15 and 20%; ceiling vs floor at 1,000, 5,000 and 10,000 members | [Babatunde](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800893988) | Babatunde |
| 4 | **Resolved (23 Sep): no double count.** Babatunde's breakdown shows the R5,090 is hosting, email, Sage, insurance, monitoring and ticketing, with no AI tools, so the R3,340 tools line adds on top. Split the R5,090 into its parts in the script | [review](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5801391858) | Babatunde |
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

## 5 · Continue here — economics v2 (opened 24 Sep 2026 for Babatunde)

PR #46 (this working file) and PR #53 (`docs/MARKET-DATA.md`) are merged. This branch carries the rest of the economics work to Friday.

- [x] Market data committed (`docs/MARKET-DATA.md`, #53)
- [ ] **Source links for `MARKET-DATA.md` §4 and the VAT row.** Each `FACT` row needs a URL and date, or it stays ⚑ secondary and off the slides. Khutso confirms them into `docs/EVIDENCE.md`.
- [ ] **Claims ratio:** quote the exact Prudential Authority span and page for 51.4%.
- [ ] **Script rebuild** (`scripts/economics_vigil_anchor.py`): a ceiling of F × S × r ÷ 12 against a floor of R5.72 + fixed ÷ members + margin. Every input is a tagged, configurable parameter; no price is hard-coded; the units are consistent (annualise both).
- [ ] **Split the R5,090** into hosting R2,500, email R800, Sage R240, insurance R700, monitoring R400 and ticketing R450. Then add tools as a per-engineer input.
- [ ] **Missing costs as tagged inputs:** SMS fallback per alert per guardian; 24/7 on-call cover; production hosting (managed PostgreSQL, backups, 90-day storage); cyber and PI insurance; accountant and CIPC; UIF/SDL if stipends become salaries; payment terms and working capital; USD exposure; real bank integration after `sim_bank`.
- [ ] **VAT basis:** quote B2B prices excluding VAT. Model the VAT-inclusive case (at R50 inclusive, break-even rises to 4,123 on today's base).
- [ ] **Free members:** add the free-to-paying ratio. The insurer pays R5.72 for every enrolled member.
- [ ] **Stipends:** 5 or 7. At 7, break-even at R50 is 4,871 on today's base.
- [ ] **Sensitivity table** at r = 5, 10, 15 and 20%, and at 1,000, 5,000 and 10,000 members: the ceiling next to the floor, printed by the script.
- [ ] **Pitch rule (from PR #50):** show the tier and E-level only. Never a score, a percentage or a "likelihood".
- [ ] **Price decision** posted on this PR with the script output quoted (Fri 25 Sep).
- [ ] **Update `docs/ECONOMICS-VIGIL-ANCHOR.md`** to match.
