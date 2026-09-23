# Economics — VIGIL + ANCHOR

> **Owner:** Babatunde Adelusi. **Drafted** 23 September 2026 by Lethabo's Claude Code assistant from Babatunde's 21–22 September business plan, after checking every figure in it against primary sources. **Status:** `PROPOSED`. Babatunde owns it from here and carries it into the deck and Lean Canvas.
>
> **Every number here is printed by** `python3 scripts/economics_vigil_anchor.py` (standard library only; `--json` for machine output). Code does the arithmetic. If this page and the script disagree, the script wins and this page is wrong.
>
> **Supersedes** the R299 KHAYA model in `docs/08-BUSINESS.md` §2.1 and `scripts/economics_engine.py` (PR #40).

---

## 1 · Who pays (decided 23 Sep)

- **The app is free to users.** VIGIL is never behind a paywall.
- **A partner pays about R20 per member per month** `ASSUMPTION` as a value-added benefit. The partner is a bank or an insurer that switches VIGIL on for its customers. This is the same shelf as FNB's GuardMe panic button (R19.90/month, powered by Aura — press report, 2022).
- **A per-record fee** when a verified evidence pack is pulled for a dispute or claim `PROPOSED`.
- **Retired:** the R100-per-member insurer story, and the "3% theft-claims reduction saves R20.7m" table (§4 explains why).

## 2 · Unit economics

| Line | Value | Tag |
|---|---:|---|
| Variable cost per member per month (cloud R0.15 + support R5.00 + compliance R0.57; anchoring moved into fixed cost) | **R5.72** | `ESTIMATE` — Babatunde's plan |
| Fixed cost per month (5 stipends × R30,000 + R5,090 tools, hosting, insurance) + anchoring ceiling R569.47 | **R155,659.47** | `ESTIMATE` — Babatunde's plan (7 people, 5 stipends: to confirm) + `docs/VUKA-2-SPEC.md` §10 |
| Contribution margin at R20 | **71.4%** | `ESTIMATE` |
| **Break-even at R20** (rounded **up**) | **10,901 members** | `ESTIMATE` |
| Operating margin at R20 | 10,000 members **−6.4%** · 25,000 **40.3%** · 50,000 **55.8%** · 100,000 **63.6%** | `ESTIMATE` |
| Annual operating profit at R20 | 25,000 members **R2.42m** · 50,000 **R6.70m** · 100,000 **R15.27m** | `ESTIMATE` |
| Anchoring, whole network | hourly **R9.34/month** + immediate roots **at most R560.13/month** (one per 60 s window) = **ceiling R569.47/month whatever the member count**; ≈ R259 immediate at 10,000 members × 2 PIN-gated outcomes a month (`ASSUMPTION`) | `ESTIMATE` — $0.0008 per message × R16.21 (Hedera fee from Jan 2026; USD/ZAR 22 Sep 2026) |

**Break-even by price** (⌈fixed R155,659.47 ÷ (price − R5.72)⌉, rounded up):

| Price / member / month | R10 | R15 | R19.90 | **R20** | R22.50 | R25 | R50 | R100 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Members to break even | 36,370 | 16,774 | 10,978 | **10,901** | 9,277 | 8,074 | 3,516 | 1,652 |

**The equations:**

```
contribution per member     m  = p − v
break-even members          N* = ⌈F / (p − v)⌉   (round UP — a fraction of a member doesn't pay)
operating margin at N          = (N·m − F) / (N·p)
a partner pays if             value per member per year ≥ 12·p
insurer break-even reduction  r* = 12·p / c     (c = relevant claims cost per member per year)
adoption in one channel       F(t) = (1 − e^−(p+q)t) / (1 + (q/p)·e^−(p+q)t),  p = 0.03, q = 0.38
```

## 3 · What the South African market already pays for this shelf

| Product | Price | What it tells a buyer |
|---|---|---|
| **FNB GuardMe** (Aura) in-app panic button | R19.90/month after a 3-month trial | A bank already sells safety inside its app. It needs a press; **VIGIL works when you can't press** |
| **iTOO [My]Cylution** | from **R22.50/month** | Already insures **express kidnapping** and theft of funds as named perils. It's a partner or an objection, and either way we pre-empt it: "we make those claims cheaper to verify" |
| Vehicle trackers (Tracker, Netstar, Cartrack) | R89–R335/month | Policyholders already pay monthly for insurer-linked safety tech |
| Discovery Insure Vitality Drive | R150 once-off device activation | A major insurer already runs a phone-and-telematics safety programme |

## 4 · Why the R100 insurer story was retired

It counted savings on the **whole** R1.09bn theft book of a third party's claims dataset (14,380 claims — `docs/EVIDENCE.md:17`, "a hypothetical exposure calculation, not an outcome") but charged the fee on **10,000** members. For the table to work, every member would have to file **1.44 theft claims a year**, costing the insurer **R109,000 each**. Counted on the members actually paying, an insurer with R2,000 or R5,000 of relevant claims per member per year needs a **60% or 24%** reduction just to recover a R100 fee. VIGIL doesn't prevent theft at all.

The industry figures that supported it were vendor marketing or sandbox results (the "20% fewer payouts", "3× faster", "14–56× ROI" and "25–30% lower expenses" claims), not deployed outcomes.

## 5 · "1%, 5%, 10%" — of what, and by when

A penetration percentage needs a base. The honest base is **one partner's customers**, not "South Africa". Take a partner with **1 million app customers** `ASSUMPTION`. On the published average Bass diffusion curve (Sultan, Farley & Lehmann 1990; 213 parameter sets — durables-era, a reference, not a forecast):

| Share of the partner's base | Members | Months after switch-on |
|---|---:|---:|
| 1% | 10,000 | ~3.8 |
| **Break-even at R20 (1.09%)** | **10,901** | **~4.1** |
| 5% | 50,000 | ~15.9 |
| 10% | 100,000 | ~27.0 |

A default-on switch inside a bank app would be faster; a download-only campaign slower. **Claims-reduction percentages** are not asserted at all. A pilot measures them (§7).

## 6 · The market, with the counterweights left in

| Fact | Source | Tag |
|---|---|---|
| **R2.4bn** digital banking crime in 2025, **110,074** incidents (≈ R21,800 each); banking apps ≈ 89% of cases, 70.5% of value; mostly social engineering | SABRIC 2025 report (released 11 Aug 2026) | `FACT` |
| **17,061** kidnappings in 2023/24, up 264% from 4,692 in 2014/15; **44%** during a hijacking (≈ 7,500); SAPS defines express kidnapping as coercion into ATM or app transfers | SAPS Crime Registrar via ISS Africa (3 Dec 2024) | `FACT` / `ESTIMATE` |
| **75%** of SA banking leaders report rising fraud attempts, 79% rising losses | BioCatch press release, 13 May 2026 — vendor-commissioned survey | `FACT` (labelled vendor) |
| Entry-level smartphone sales **+80%** after the 9% excise duty on phones under R2,500 was removed on 1 Apr 2025 | GSMA via The Citizen (6 Jul 2026) | `FACT` |
| Carjacking, house and business robbery combined **−16.4%** (Apr–Jun 2026 vs 2025) | SAPS Q1 2026/27 | `FACT` |
| UK mandatory APP-fraud reimbursement from 7 Oct 2024, capped at £85,000, split 50/50 | UK PSR | `FACT` — **no SA regulator has committed to follow** |

**Read together:** physical robbery is falling while app-driven crime rises. The money moved into the phone, and so did the attack. **R2.4bn is not our market.** Coerced transfers are a subset of unknown size, bounded above by the kidnapping figures.

## 7 · What a pilot must measure before any saving is claimed

False alarms per armed hour · missed events · share of alerts delivered · guardian response time · bank holds triggered and released · verified evidence packs pulled · claims-handling time with and without an E2 record · legitimate payouts (a good record may *increase* fair payouts) · fraud leakage.

## 8 · Corrections carried from the business plan

| In the plan | Now | Source |
|---|---|---|
| R1.9bn / 97,975 ("ScamWatchHQ 2026") | **R2.4bn / 110,074** (2025) | SABRIC |
| 85% of banks | **75%** (vendor survey) | BioCatch primary release |
| Banking Ombud fraud complaints +73% | Real, but **Jan–May** and **virtual-card fraud** only, published Aug 2025 | NFO |
| "Nearly R2bn" and R3.5bn fraud | One recycled ICB estimate: 10% × R35bn = R3.5bn | ICB |
| Santam 3.7m policyholders | **"More than 1 million"** | santam.co.za |
| NFO 35% motor / 8% theft-hijack | Not found — removed | — |
| 94% "net margin" | **94.28% was contribution margin at R100**; at R20 it is 71.4% | this script |
| Profit "~R9.8m at break-even" | Zero by definition | arithmetic |
| Bank per-case 2,000 cases = break-even | **10,378 cases/month** at R15 | this script |
| "South Africa is expected to follow" the UK | No statement found — removed | — |
| Crime displacement as an advantage | Removed (see `docs/STAGED-DURESS-DEFENCE.md` §7) | Guerette & Bowers 2009 |
