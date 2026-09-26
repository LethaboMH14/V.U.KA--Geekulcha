#!/usr/bin/env python3
"""VUKA (VIGIL + ANCHOR) economics. Code does the arithmetic; every input is tagged.

Run:  python3 scripts/economics_vigil_anchor.py          (human-readable)
      python3 scripts/economics_vigil_anchor.py --json   (machine-readable)
Standard library only. Supersedes scripts/economics_engine.py's R299 KHAYA model (PR #40).

Fixed cost is ITEMISED from the fact register (docs/MARKET-DATA.md section 4) rather than a
single lumped ESTIMATE, so the product's own break-even (no team) is readable separately from
the team cost. Price is DECIDED at R20 per member per month, single tier (26 Sep 2026).
"""
import json
import math
import sys

# --- Inputs: (value, tag, source) -------------------------------------------------
IN = {
    # Ledger
    "hcs_fee_usd": (0.0008, "FACT", "Hedera ConsensusSubmitMessage price from Jan 2026 (hedera.com blog)"),
    "usd_zar": (16.2075, "FACT", "USD/ZAR 22 Sep 2026 (docs/EVIDENCE.md); NOTE MARKET-DATA.md:40 quotes 16.21 - register conflict to resolve"),
    "checkins_per_member_month": (2, "ASSUMPTION", "PIN-gated outcomes per member per month; drives immediate anchors until the 60 s coalescing cap; to be measured"),
    "immediate_windows_cap_month": (1440 * 30, "FACT", "at most one immediate root per 60 s window (VUKA-2-SPEC section 10)"),
    "hourly_roots_month": (720, "FACT", "24 x 30"),
    # Team - the biggest single ASSUMPTION (open: 5 vs 7 stipends)
    "stipend_count": (5, "ASSUMPTION", "team assumption; 7-person team, 5 stipends (MARKET-DATA.md section 6, open)"),
    "stipend_monthly": (30_000, "ASSUMPTION", "team assumption"),
    # Itemised fixed cost - register-backed (docs/MARKET-DATA.md section 4)
    "azure_app_shared_usd": (9.49, "FACT", "Azure published pricing (MARKET-DATA.md:42)"),
    "azure_pg_b1ms_usd": (12.00, "FACT", "Azure published pricing (MARKET-DATA.md:43)"),
    "cyber_insurance_monthly": (450.00, "FACT", "iTOO SureThing entry (MARKET-DATA.md:47)"),
    "professional_indemnity_annual": (2_615.00, "FACT", "AON R2.5m (MARKET-DATA.md:48)"),
    "accountant_retainer_monthly": (4_400.00, "FACT", "ProCompare average, range R1,950-R6,000 (MARKET-DATA.md:49)"),
    "engineering_tools_usd_each": (20.00, "FACT", "OpenAI / Anthropic pricing (MARKET-DATA.md:53-54)"),
    "engineering_tools_count": (2, "FACT", "ChatGPT Plus + Claude Pro"),
    "cipc_annual": (600.00, "FACT", "CIPC 2026, upper band (MARKET-DATA.md:50)"),
    # Variable per member - ESTIMATE; allocations over FACT inputs
    "var_cloud": (0.15, "ESTIMATE", "business plan: extra cloud per member at 10,000 members"),
    "var_support": (5.00, "ESTIMATE", "FACT agent R25,000/month (MARKET-DATA.md:46) / 5,000 members ASSUMPTION"),
    "var_compliance": (0.57, "ESTIMATE", "business plan: R68,000/year compliance over 10,000 members; POPIA Information Officer registration itself is free"),
    # Price - DECIDED 26 Sep 2026
    "price_recommended": (20.00, "ASSUMPTION", "decided 26 Sep 2026, single tier; anchors GuardMe R19.90 and iTOO R22.50 (MARKET-DATA.md:30-31)"),
    # One-off / initial investment
    "professional_indemnity_year1": (2_615.00, "FACT", "AON (MARKET-DATA.md:48)"),
    "cyber_insurance_first_month": (450.00, "FACT", "iTOO SureThing (MARKET-DATA.md:47)"),
    "cipc_annual_return": (600.00, "FACT", "CIPC 2026, upper band (MARKET-DATA.md:50)"),
    # Retirement note inputs
    "plan_theft_book": (1.09e9, "FACT*", "docs/EVIDENCE.md:17 - modelled exposure of a third party's dataset; NOT savings, NOT this cohort"),
    "plan_theft_claims": (14_380, "FACT*", "same"),
    "plan_members": (10_000, "ASSUMPTION", "business plan's example deal"),
    "plan_price": (100.00, "ASSUMPTION", "business plan's retired R100 insurer price"),
    "bass_p": (0.03, "FACT", "Sultan, Farley & Lehmann 1990, JMR 27(1):70-77, mean of 213 parameter sets"),
    "bass_q": (0.38, "FACT", "same source"),
    "channel_size": (1_000_000, "ASSUMPTION", "one partner with 1 million app customers; no partner signed"),
}
V = {k: v[0] for k, v in IN.items()}
VAR = V["var_cloud"] + V["var_support"] + V["var_compliance"]
MSG = V["hcs_fee_usd"] * V["usd_zar"]
# Anchoring is a bounded fixed cost: hourly roots + at most one immediate root per 60 s window, whatever the member count.
ANCHOR_CEILING = (V["hourly_roots_month"] + V["immediate_windows_cap_month"]) * MSG

# Itemised fixed cost, monthly. Tag per line; stipends are the only ASSUMPTION.
FIXED_ITEMS = {
    "stipends": (V["stipend_count"] * V["stipend_monthly"], "ASSUMPTION"),
    "azure_app_service_shared": (V["azure_app_shared_usd"] * V["usd_zar"], "FACT"),
    "azure_postgres_b1ms": (V["azure_pg_b1ms_usd"] * V["usd_zar"], "FACT"),
    "hedera_anchoring_ceiling": (ANCHOR_CEILING, "ESTIMATE"),
    "cyber_insurance": (V["cyber_insurance_monthly"], "FACT"),
    "professional_indemnity": (V["professional_indemnity_annual"] / 12, "FACT"),
    "accountant_retainer": (V["accountant_retainer_monthly"], "FACT"),
    "engineering_tools": (V["engineering_tools_count"] * V["engineering_tools_usd_each"] * V["usd_zar"], "FACT"),
    "cipc_annual_return": (V["cipc_annual"] / 12, "FACT"),
}
FIXED = sum(v for v, _ in FIXED_ITEMS.values())
FIXED_NO_STAFF = FIXED - FIXED_ITEMS["stipends"][0]
FIXED_7_STIPENDS = FIXED_NO_STAFF + 7 * V["stipend_monthly"]


def breakeven(price, fixed=None):
    """Smallest whole number of members with N*(price - var) >= fixed (rounded UP, never to nearest)."""
    return math.ceil((FIXED if fixed is None else fixed) / (price - VAR))


def operating_margin(members, price, fixed=None):
    revenue = members * price
    return (members * (price - VAR) - (FIXED if fixed is None else fixed)) / revenue


def position(members, price, fixed=None):
    return members * (price - VAR) - (FIXED if fixed is None else fixed)


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
    hourly = V["hourly_roots_month"] * MSG
    immediate_cap = V["immediate_windows_cap_month"] * MSG
    immediate_10k = min(V["immediate_windows_cap_month"], 10_000 * V["checkins_per_member_month"]) * MSG
    price = V["price_recommended"]
    be_share = breakeven(price) / V["channel_size"]
    plan_fee = V["plan_members"] * V["plan_price"] * 12
    return {
        "variable_cost_per_member_month": round(VAR, 3),
        "contribution_per_member_month": round(price - VAR, 2),
        "contribution_margin_pct": {str(p): round((p - VAR) / p * 100, 2) for p in (20, 25, 100)},
        "fixed_itemised_monthly": {k: {"value": round(v, 2), "tag": t} for k, (v, t) in FIXED_ITEMS.items()},
        "fixed_monthly_incl_anchoring_ceiling": round(FIXED, 2),
        "fixed_no_staff_monthly": round(FIXED_NO_STAFF, 2),
        "fixed_7_stipends_monthly": round(FIXED_7_STIPENDS, 2),
        "breakeven_members": {str(p): breakeven(p) for p in (10, 15, 19.90, 20, 22.50, 25)},
        "breakeven_no_staff": {"R20": breakeven(20, FIXED_NO_STAFF)},
        "breakeven_7_stipends": {"R20": breakeven(20, FIXED_7_STIPENDS)},
        "position_at_R20_5_stipends": {str(n): round(position(n, 20)) for n in (5_000, 10_000, 25_000)},
        "position_at_R20_no_staff": {str(n): round(position(n, 20, FIXED_NO_STAFF)) for n in (5_000, 10_000, 25_000)},
        "operating_margin_pct_at_R20": {str(n): round(operating_margin(n, 20) * 100, 1) for n in (10_000, 25_000, 50_000, 100_000)},
        "annual_operating_profit_at_R20": {str(n): round((n * (20 - VAR) - FIXED) * 12) for n in (25_000, 50_000, 100_000)},
        "actuary_test_per_member_year": 12 * price,
        "initial_investment": {
            "professional_indemnity_year1": {"value": round(V["professional_indemnity_year1"], 2), "tag": "FACT"},
            "cyber_insurance_first_month": {"value": round(V["cyber_insurance_first_month"], 2), "tag": "FACT"},
            "cipc_annual_return": {"value": round(V["cipc_annual_return"], 2), "tag": "FACT"},
            "popia_information_officer_registration": {"value": 0.00, "tag": "NOT_IN_REGISTER - confirm (believed free, online)"},
            "legal_counsel_popia_ecta_blockchain": {"value": None, "tag": "QUOTE NEEDED"},
            "hedera_mainnet_hbar_float": {"value": None, "tag": "QUOTE NEEDED"},
        },
        "anchoring_rand_month": {"hourly_roots": round(hourly, 2), "immediate_cap": round(immediate_cap, 2),
                                 "ceiling_total": round(ANCHOR_CEILING, 2), "immediate_at_10k_members": round(immediate_10k, 2)},
        "bank_per_case_R15_cases_needed_per_month": math.ceil(FIXED / 15),
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
    print(f"Contribution per member per month at R20: R{r['contribution_per_member_month']}")
    print("Fixed cost, itemised (monthly):")
    for k, d in r["fixed_itemised_monthly"].items():
        print(f"  {k:<32} R{d['value']:>10,.2f}  [{d['tag']}]")
    print(f"  {'TOTAL (5 stipends)':<32} R{r['fixed_monthly_incl_anchoring_ceiling']:>10,.2f}")
    print(f"  {'PRODUCT ONLY (no stipends)':<32} R{r['fixed_no_staff_monthly']:>10,.2f}  (break-even at R20: {r['breakeven_no_staff']['R20']:,} members)")
    print("Members to break even (rounded up):")
    for p, n in r["breakeven_members"].items():
        print(f"  R{p:>6}/member/month -> {n:>7,} members")
    print(f"  R    20 @ 7 stipends      -> {r['breakeven_7_stipends']['R20']:>7,} members")
    print("Operating margin at R20:", ", ".join(f"{int(k):,} members {v}%" for k, v in r["operating_margin_pct_at_R20"].items()))
    print("Position at R20 (5 stipends):", ", ".join(f"{int(k):,} members R{v:,}" for k, v in r["position_at_R20_5_stipends"].items()))
    print(f"Actuary test: insurer must save >= R{r['actuary_test_per_member_year']:.0f} per member per year (12 x R20)")
    a = r["anchoring_rand_month"]
    print(f"Anchoring: hourly R{a['hourly_roots']}/month + immediate at most R{a['immediate_cap']}/month "
          f"= ceiling R{a['ceiling_total']}/month, whatever the member count (~R{a['immediate_at_10k_members']} immediate at 10,000 members)")
    print(f"Bank per-case only at R15: {r['bank_per_case_R15_cases_needed_per_month']:,} cases/month to cover fixed costs")
    m = r["adoption_months_in_one_channel"]
    print(f"Reference adoption in one 1M-customer channel: 1% ~{m['1pct']} mo, 5% ~{m['5pct']} mo, 10% ~{m['10pct']} mo; "
          f"break-even at R20 ({r['breakeven_share_of_channel_at_R20_pct']}% of channel) ~{m['breakeven_at_R20']} mo  [ASSUMPTION channel; FACT parameters]")
    print("\nInitial investment (one-off / first period):")
    for k, d in r["initial_investment"].items():
        val = "QUOTE NEEDED" if d["value"] is None else f"R{d['value']:,.2f}"
        print(f"  {k:<44} {val:<14} [{d['tag']}]")
    x = r["retired_R100_insurer_story"]
    print(f"\nWhy the R100 insurer story was retired: it implies {x['implied_theft_claims_per_member_year']} theft claims "
          f"and R{x['implied_theft_cost_per_member_year']:,} of theft cost per member per year.")
    print(f"  With R2,000 or R5,000 of relevant claims per member, the insurer needs a {x['breakeven_reduction_if_relevant_claims_cost_R2000']}% "
          f"or {x['breakeven_reduction_if_relevant_claims_cost_R5000']}% reduction just to recover the fee.")


if __name__ == "__main__":
    main()
