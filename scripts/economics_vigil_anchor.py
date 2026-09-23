#!/usr/bin/env python3
"""VUKA (VIGIL + ANCHOR) economics. Code does the arithmetic; every input is tagged.

Run:  python3 scripts/economics_vigil_anchor.py          (human-readable)
      python3 scripts/economics_vigil_anchor.py --json   (machine-readable)
Standard library only. Supersedes scripts/economics_engine.py's R299 KHAYA model (PR #40).
"""
import json
import math
import sys

# --- Inputs: (value, tag, source) -------------------------------------------------
IN = {
    "fixed_monthly": (155_090, "ESTIMATE", "business plan 21-22 Sep: 5 stipends x R30,000 + R5,090 tools/hosting/insurance"),
    "var_cloud": (0.15, "ESTIMATE", "business plan: extra cloud per member at 10,000 members"),
    "var_anchor": (0.001, "ESTIMATE", "hourly anchoring R9.34/month spread over 10,000 members"),
    "var_support": (5.00, "ESTIMATE", "business plan: 1 agent at R25,000/month per 5,000 members"),
    "var_compliance": (0.57, "ESTIMATE", "business plan: R68,000/year compliance over 10,000 members"),
    "price_recommended": (20.00, "ASSUMPTION", "value-added benefit priced beside FNB GuardMe R19.90/month; decided 23 Sep"),
    "hcs_fee_usd": (0.0008, "FACT", "Hedera ConsensusSubmitMessage price from Jan 2026 (hedera.com blog)"),
    "usd_zar": (16.2075, "FACT", "USD/ZAR on 22 Sep 2026 (tradingeconomics)"),
    "alerts_per_member_year": (0.5, "ASSUMPTION", "check-in outcomes needing immediate anchoring; to be measured"),
    "bass_p": (0.03, "FACT", "Sultan, Farley & Lehmann 1990, JMR 27(1):70-77, mean of 213 parameter sets"),
    "bass_q": (0.38, "FACT", "same source"),
    "channel_size": (1_000_000, "ASSUMPTION", "one partner with 1 million app customers; no partner signed"),
    "plan_theft_book": (1.09e9, "FACT*", "docs/EVIDENCE.md:17 - modelled exposure of a third party's dataset; NOT savings, NOT this cohort"),
    "plan_theft_claims": (14_380, "FACT*", "same"),
    "plan_members": (10_000, "ASSUMPTION", "business plan's example deal"),
    "plan_price": (100.00, "ASSUMPTION", "business plan's retired R100 insurer price"),
}
V = {k: v[0] for k, v in IN.items()}
VAR = V["var_cloud"] + V["var_anchor"] + V["var_support"] + V["var_compliance"]


def breakeven(price):
    """Members needed so that N*(price - var) = fixed."""
    return V["fixed_monthly"] / (price - VAR)


def operating_margin(members, price):
    revenue = members * price
    return (members * (price - VAR) - V["fixed_monthly"]) / revenue


def insurer_breakeven_reduction(price, claims_cost_per_member_year):
    """r* = 12p / c : the claims reduction an insurer needs just to recover the fee."""
    return 12 * price / claims_cost_per_member_year


def bass_share(t_years):
    p, q = V["bass_p"], V["bass_q"]
    e = math.exp(-(p + q) * t_years)
    return (1 - e) / (1 + (q / p) * e)


def years_to_share(share):
    lo, hi = 0.0, 50.0
    for _ in range(100):
        mid = (lo + hi) / 2
        if bass_share(mid) < share:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def compute():
    hourly = 720 * V["hcs_fee_usd"] * V["usd_zar"]
    immediate = (10_000 * V["alerts_per_member_year"] / 12) * V["hcs_fee_usd"] * V["usd_zar"]
    price = V["price_recommended"]
    be_share = breakeven(price) / V["channel_size"]
    plan_fee = V["plan_members"] * V["plan_price"] * 12
    return {
        "variable_cost_per_member_month": round(VAR, 3),
        "contribution_margin_pct": {str(p): round((p - VAR) / p * 100, 2) for p in (20, 25, 100)},
        "breakeven_members": {str(p): round(breakeven(p)) for p in (10, 15, 19.90, 20, 22.50, 25, 50, 100)},
        "operating_margin_pct_at_R20": {str(n): round(operating_margin(n, 20) * 100, 1) for n in (10_000, 25_000, 50_000, 100_000)},
        "annual_operating_profit_at_R20": {str(n): round((n * (20 - VAR) - V["fixed_monthly"]) * 12) for n in (25_000, 50_000, 100_000)},
        "anchoring_rand_month": {"hourly_roots": round(hourly, 2), "immediate_checkins_10k_members": round(immediate, 2),
                                 "constant_5min_option": round(12 * 24 * 30 * V["hcs_fee_usd"] * V["usd_zar"], 2)},
        "bank_per_case_R15_cases_needed_per_month": round(V["fixed_monthly"] / 15),
        "adoption_months_in_one_channel": {"1pct": round(years_to_share(0.01) * 12, 1), "5pct": round(years_to_share(0.05) * 12, 1),
                                           "10pct": round(years_to_share(0.10) * 12, 1),
                                           "breakeven_at_R20": round(years_to_share(be_share) * 12, 1)},
        "breakeven_share_of_channel_at_R20_pct": round(be_share * 100, 2),
        "retired_R100_insurer_story": {
            "fee_per_year": plan_fee,
            "implied_theft_claims_per_member_year": round(V["plan_theft_claims"] / V["plan_members"], 3),
            "implied_theft_cost_per_member_year": round(V["plan_theft_book"] / V["plan_members"]),
            "breakeven_reduction_if_relevant_claims_cost_R2000": round(insurer_breakeven_reduction(100, 2_000) * 100, 1),
            "breakeven_reduction_if_relevant_claims_cost_R5000": round(insurer_breakeven_reduction(100, 5_000) * 100, 1),
        },
        "market_facts": {
            "sabric_2025_digital_banking_losses_R": 2.4e9, "sabric_2025_incidents": 110_074,
            "sabric_2025_avg_loss_per_incident_R": round(2.4e9 / 110_074),
            "saps_kidnappings_2023_24": 17_061, "kidnappings_during_hijacking_share": 0.44,
            "kidnappings_during_hijacking_est": round(17_061 * 0.44, -2),
        },
        "inputs": {k: {"value": v, "tag": t, "source": s} for k, (v, t, s) in IN.items()},
    }


def main():
    r = compute()
    if "--json" in sys.argv:
        print(json.dumps(r, indent=2))
        return
    print("VUKA economics (VIGIL + ANCHOR) - every number computed here, every input tagged\n")
    print(f"Variable cost per member per month: R{r['variable_cost_per_member_month']}  [ESTIMATE]")
    print("Members to break even (fixed R155,090/month):")
    for p, n in r["breakeven_members"].items():
        print(f"  R{p:>6}/member/month -> {n:>7,} members")
    print("Operating margin at R20:", ", ".join(f"{int(k):,} members {v}%" for k, v in r["operating_margin_pct_at_R20"].items()))
    a = r["anchoring_rand_month"]
    print(f"Anchoring: hourly R{a['hourly_roots']}/month + immediate check-ins ~R{a['immediate_checkins_10k_members']}/month "
          f"(option: constant 5-min R{a['constant_5min_option']}/month)")
    print(f"Bank per-case only at R15: {r['bank_per_case_R15_cases_needed_per_month']:,} cases/month to cover fixed costs")
    m = r["adoption_months_in_one_channel"]
    print(f"Reference adoption in one 1M-customer channel: 1% ~{m['1pct']} mo, 5% ~{m['5pct']} mo, 10% ~{m['10pct']} mo; "
          f"break-even at R20 ({r['breakeven_share_of_channel_at_R20_pct']}% of channel) ~{m['breakeven_at_R20']} mo  [ASSUMPTION channel; FACT parameters]")
    x = r["retired_R100_insurer_story"]
    print(f"\nWhy the R100 insurer story was retired: it implies {x['implied_theft_claims_per_member_year']} theft claims "
          f"and R{x['implied_theft_cost_per_member_year']:,} of theft cost per member per year.")
    print(f"  With R2,000 or R5,000 of relevant claims per member, the insurer needs a {x['breakeven_reduction_if_relevant_claims_cost_R2000']}% "
          f"or {x['breakeven_reduction_if_relevant_claims_cost_R5000']}% reduction just to recover the fee.")


if __name__ == "__main__":
    main()
