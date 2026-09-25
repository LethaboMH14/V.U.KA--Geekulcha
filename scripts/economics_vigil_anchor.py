#!/usr/bin/env python3
"""VUKA (VIGIL + ANCHOR) economics v2 — ceiling/floor model.

Run:  py scripts/economics_vigil_anchor.py           (human-readable)
      py scripts/economics_vigil_anchor.py --json    (machine-readable)
      py scripts/economics_vigil_anchor.py --sensitivity (ceiling/floor matrix)

Standard library only. Supersedes PR #40's R299 KHAYA model.
Every input is tagged: FACT / ESTIMATE / ASSUMPTION / PROPOSED.
Price is an OUTPUT — the script finds the feasible range where floor <= ceiling.
"""
import json
import math
import sys
from dataclasses import dataclass
from typing import Dict, List, Tuple

# ──────────────────────────────────────────────────────────────────────────────
# Tagged inputs: (value, tag, source)
# ──────────────────────────────────────────────────────────────────────────────
IN = {
    # Fixed operating costs (monthly, ZAR)
    "stipend_monthly": (30_000, "ASSUMPTION", "Team assumption: founder stipend ZAR/month"),
    "stipend_count": (5, "ASSUMPTION", "Team assumption: 5 of 7 people receive stipend; 5 or 7 to be decided"),
    "hosting_monthly": (2_500, "ESTIMATE", "Azure App Service Shared tier; to be confirmed with invoice"),
    "email_monthly": (800, "ESTIMATE", "Transactional email; to be confirmed"),
    "sage_monthly": (240, "ESTIMATE", "Sage accounting; to be confirmed"),
    "insurance_monthly": (700, "ESTIMATE", "Cyber + PI insurance combined; iTOO SureThing entry R450 + AON PI R2,615/yr ≈ R700/mo"),
    "monitoring_monthly": (400, "ESTIMATE", "Infrastructure monitoring; to be confirmed"),
    "ticketing_monthly": (450, "ESTIMATE", "Support ticketing; to be confirmed"),
    "accountant_monthly": (4_400, "ESTIMATE", "ProCompare average R1,950–R6,000"),
    "cipc_annual": (350, "ESTIMATE", "CIPC annual return by turnover band"),
    "uif_monthly_cap": (17_712, "FACT", "Rivermate Aug 2026: 1% capped at R17,712/month"),
    "sdl_threshold_annual": (500_000, "FACT", "Xero Aug 2026: 1% if payroll > R500k/yr"),

    # Variable costs (per enrolled member per month, ZAR)
    "var_cloud": (0.15, "ESTIMATE", "Extra cloud per member at 10k members; to be measured"),
    "var_support_base": (25_000, "ESTIMATE", "One agent at R25,000/month per 5,000 members — step cost"),
    "var_compliance_annual": (68_000, "ESTIMATE", "Annual compliance over 10,000 members — scales with member count"),

    # Anchoring (FACT from Hedera + spec)
    "hcs_fee_usd": (0.0008, "FACT", "Hedera ConsensusSubmitMessage price from Jan 2026 (hedera.com blog)"),
    "usd_zar": (16.2075, "FACT", "USD/ZAR on 22 Sep 2026 (tradingeconomics)"),
    "hourly_roots_month": (720, "FACT", "24 x 30 per VUKA-2-SPEC §10"),
    "immediate_windows_cap_month": (43_200, "FACT", "At most one immediate root per 60s window (VUKA-2-SPEC §10)"),
    "checkins_per_member_month": (2, "ASSUMPTION", "PIN-gated outcomes per member per month; drives immediate anchors until 60s coalescing cap; to be measured"),

    # Market / adoption
    "bass_p": (0.03, "FACT", "Sultan, Farley & Lehmann 1990, JMR 27(1): mean of 213 parameter sets"),
    "bass_q": (0.38, "FACT", "Same source"),
    "channel_size": (1_000_000, "ASSUMPTION", "One partner with 1M app customers; no partner signed"),

    # Insurance-side (for ceiling)
    "claims_cost_per_member_year": (5_000, "ASSUMPTION", "Insurer's relevant claims cost per member per year — to be provided by partner"),
    "retention_value_per_member_year": (0, "ASSUMPTION", "Measured retention/acquisition value per member per year — pilot output"),

    # Tax
    "vat_rate": (0.15, "FACT", "SARS standard VAT rate 15%"),
    "vat_threshold_annual": (2_300_000, "FACT", "SARS compulsory registration threshold from 1 Apr 2026"),

    # Retired / reference (not used in model)
    "plan_theft_book": (1.09e9, "FACT*", "docs/EVIDENCE.md:17 — modelled exposure of third-party dataset; NOT savings"),
    "plan_theft_claims": (14_380, "FACT*", "Same source"),
    "plan_members": (10_000, "ASSUMPTION", "Business plan's example deal"),
    "plan_price": (100.0, "ASSUMPTION", "Retired R100 insurer price"),
}

# ──────────────────────────────────────────────────────────────────────────────
# Derived constants
# ──────────────────────────────────────────────────────────────────────────────
V = {k: v[0] for k, v in IN.items()}

# Anchoring ceiling (monthly, ZAR) — fixed regardless of member count
MSG_ZAR = V["hcs_fee_usd"] * V["usd_zar"]
ANCHOR_HOURLY = V["hourly_roots_month"] * MSG_ZAR
ANCHOR_IMMEDIATE_CAP = V["immediate_windows_cap_month"] * MSG_ZAR
ANCHOR_CEILING = ANCHOR_HOURLY + ANCHOR_IMMEDIATE_CAP

# Fixed operating costs (excl. stipends, excl. anchoring)
FIXED_OPS_BASE = (
    V["hosting_monthly"] + V["email_monthly"] + V["sage_monthly"] +
    V["insurance_monthly"] + V["monitoring_monthly"] + V["ticketing_monthly"] +
    V["accountant_monthly"] + (V["cipc_annual"] / 12)
)

# Compliance is annual fixed cost allocated over enrolled members
COMPLIANCE_ANNUAL = V["var_compliance_annual"]

# Support is step-cost: one agent per 5,000 members
SUPPORT_AGENT_MONTHLY = V["var_support_base"]
SUPPORT_CAPACITY = 5_000

# Payroll levies (UIF/SDL) — only if stipends become salaries
UIF_RATE = 0.01
UIF_CAP_MONTHLY = V["uif_monthly_cap"]
SDL_RATE = 0.01
SDL_THRESHOLD_MONTHLY = V["sdl_threshold_annual"] / 12

# ──────────────────────────────────────────────────────────────────────────────
# Core calculations
# ──────────────────────────────────────────────────────────────────────────────

def monthly_fixed_cost(stipend_count: int, enrolled_members: int) -> float:
    """Total monthly fixed cost including stipends, anchoring ceiling, ops, compliance allocation, support step-cost."""
    stipends = V["stipend_monthly"] * stipend_count
    compliance_per_member = COMPLIANCE_ANNUAL / enrolled_members if enrolled_members > 0 else 0
    support_agents = math.ceil(enrolled_members / SUPPORT_CAPACITY) if enrolled_members > 0 else 1
    support = support_agents * SUPPORT_AGENT_MONTHLY
    return stipends + FIXED_OPS_BASE + ANCHOR_CEILING + compliance_per_member + support


def monthly_variable_cost() -> float:
    """Per-enrolled-member variable cost (cloud only — support & compliance are in fixed)."""
    return V["var_cloud"]


def payroll_levies_monthly(stipend_count: int) -> float:
    """UIF + SDL on stipends if they become salaries."""
    total_stipends = V["stipend_monthly"] * stipend_count
    uif = min(total_stipends * UIF_RATE, UIF_CAP_MONTHLY * stipend_count)
    sdl = total_stipends * SDL_RATE if total_stipends > SDL_THRESHOLD_MONTHLY else 0
    return uif + sdl


def floor_price(enrolled_members: int, stipend_count: int, margin_per_member: float = 0) -> float:
    """
    Floor = variable + fixed/enrolled + margin + payroll/enrolled
    All monthly, per enrolled member.
    """
    var = monthly_variable_cost()
    fixed = monthly_fixed_cost(stipend_count, enrolled_members)
    payroll = payroll_levies_monthly(stipend_count)
    return var + (fixed / enrolled_members) + margin_per_member + (payroll / enrolled_members)


def ceiling_price(claims_reduction_pct: float, claims_cost_per_member_year: float,
                  retention_value_per_member_year: float = 0) -> float:
    """
    Ceiling = (F × S × r ÷ 12) + retention_value_per_member_year ÷ 12
    F = claims_cost_per_member_year (annual)
    S = 1 (share of relevant claims — insurer defines)
    r = claims_reduction_pct (fraction)
    Returns monthly per-member ceiling.
    """
    return (claims_cost_per_member_year * claims_reduction_pct / 12) + (retention_value_per_member_year / 12)


def breakeven_members(price: float, stipend_count: int, margin_per_member: float = 0) -> int:
    """Smallest whole number of members with N*(price - var) >= fixed (rounded UP)."""
    var = monthly_variable_cost()
    fixed = monthly_fixed_cost(stipend_count, 1)  # fixed cost at 1 member (for formula)
    # Actually: N*(price - var) >= fixed_at_N
    # Fixed depends on N via compliance and support steps. Use iterative.
    for n in range(1, 1_000_000):
        if n * (price - var) >= monthly_fixed_cost(stipend_count, n) + payroll_levies_monthly(stipend_count):
            return n
    return 1_000_000


def operating_margin_pct(enrolled_members: int, price: float, stipend_count: int, margin_per_member: float = 0) -> float:
    var = monthly_variable_cost()
    fixed = monthly_fixed_cost(stipend_count, enrolled_members)
    payroll = payroll_levies_monthly(stipend_count)
    revenue = enrolled_members * price
    return (enrolled_members * (price - var) - fixed - payroll) / revenue * 100


def annual_profit(enrolled_members: int, price: float, stipend_count: int, margin_per_member: float = 0) -> float:
    var = monthly_variable_cost()
    fixed = monthly_fixed_cost(stipend_count, enrolled_members)
    payroll = payroll_levies_monthly(stipend_count)
    return (enrolled_members * (price - var) - fixed - payroll) * 12


def bass_share(t_years: float) -> float:
    p, q = V["bass_p"], V["bass_q"]
    e = math.exp(-(p + q) * t_years)
    return (1 - e) / (1 + (q / p) * e)


def years_to_share(target_share: float) -> float:
    lo, hi = 0.0, 50.0
    for _ in range(100):
        mid = (lo + hi) / 2
        if bass_share(mid) < target_share:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def vat_inclusive_price(price_excl_vat: float) -> float:
    return round(price_excl_vat * (1 + V["vat_rate"]), 2)


def price_excl_vat(price_incl_vat: float) -> float:
    return round(price_incl_vat / (1 + V["vat_rate"]), 2)


def free_member_cost(enrolled_members: int, free_ratio: float, stipend_count: int) -> float:
    """Cost of free members = free_members * variable_cost (insurer funds the variable cost)."""
    free = enrolled_members * free_ratio
    return free * monthly_variable_cost()


def effective_breakeven(price: float, stipend_count: int, margin_per_member: float = 0, free_ratio: float = 0) -> int:
    """Breakeven accounting for free members who cost variable but pay nothing."""
    var = monthly_variable_cost()
    for n in range(1, 1_000_000):
        paying = n * (1 - free_ratio)
        free_cost = n * free_ratio * var
        fixed = monthly_fixed_cost(stipend_count, n) + payroll_levies_monthly(stipend_count)
        if paying * (price - var) >= fixed + free_cost + n * margin_per_member:
            return n
    return 1_000_000


# ──────────────────────────────────────────────────────────────────────────────
# Sensitivity table
# ──────────────────────────────────────────────────────────────────────────────

def sensitivity_table() -> List[Dict]:
    """Generate ceiling vs floor at r=5/10/15/20% and members=1k/5k/10k."""
    reductions = [0.05, 0.10, 0.15, 0.20]
    member_counts = [1_000, 5_000, 10_000]
    stipend_counts = [5, 7]

    rows = []
    for r in reductions:
        for n in member_counts:
            for sc in stipend_counts:
                ceiling = ceiling_price(r, V["claims_cost_per_member_year"], V["retention_value_per_member_year"])
                floor = floor_price(n, sc, margin_per_member=0)
                feasible = ceiling >= floor
                rows.append({
                    "claims_reduction_pct": round(r * 100, 1),
                    "enrolled_members": n,
                    "stipends": sc,
                    "ceiling_per_member_month": round(ceiling, 2),
                    "floor_per_member_month": round(floor, 2),
                    "feasible": feasible,
                    "gap_per_member_month": round(ceiling - floor, 2),
                })
    return rows


def price_feasibility_table() -> List[Dict]:
    """For each price candidate, show breakeven at 5/7 stipends, with/without VAT, with/without free members."""
    price_candidates = [10, 15, 19.90, 20, 22.50, 25, 50, 100]
    stipend_counts = [5, 7]
    free_ratios = [0.0, 0.1, 0.2]
    vat_modes = ["excl_vat", "incl_vat"]

    rows = []
    for p in price_candidates:
        for sc in stipend_counts:
            for fr in free_ratios:
                for vm in vat_modes:
                    price_eff = p if vm == "excl_vat" else price_excl_vat(p)
                    be = effective_breakeven(price_eff, sc, margin_per_member=0, free_ratio=fr)
                    om = operating_margin_pct(be, price_eff, sc) if be < 1_000_000 else None
                    rows.append({
                        "price_candidate": p,
                        "vat_mode": vm,
                        "price_effective_monthly": round(price_eff, 2),
                        "stipends": sc,
                        "free_ratio": fr,
                        "breakeven_enrolled": be,
                        "operating_margin_pct_at_be": round(om, 1) if om else None,
                    })
    return rows


def retired_r100_analysis() -> Dict:
    plan_fee = V["plan_members"] * V["plan_price"] * 12
    return {
        "fee_per_year": plan_fee,
        "implied_theft_claims_per_member_year": round(V["plan_theft_claims"] / V["plan_members"], 3),
        "implied_theft_cost_per_member_year": round(V["plan_theft_book"] / V["plan_members"]),
        "breakeven_reduction_if_relevant_claims_R2000": round(12 * V["plan_price"] / 2_000 * 100, 1),
        "breakeven_reduction_if_relevant_claims_R5000": round(12 * V["plan_price"] / 5_000 * 100, 1),
    }


def market_facts() -> Dict:
    return {
        "sabric_2025_digital_banking_losses_R": 2.4e9,
        "sabric_2025_incidents": 110_074,
        "sabric_2025_avg_loss_per_incident_R": round(2.4e9 / 110_074),
        "saps_kidnappings_2023_24": 17_061,
        "kidnappings_during_hijacking_share": 0.44,
        "kidnappings_during_hijacking_est": round(17_061 * 0.44, -2),
    }


def all_inputs() -> Dict:
    return {k: {"value": v, "tag": t, "source": s} for k, (v, t, s) in IN.items()}


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    if "--json" in sys.argv:
        out = {
            "variable_cost_per_member_month": round(monthly_variable_cost(), 3),
            "anchor_ceiling_monthly": round(ANCHOR_CEILING, 2),
            "anchor_breakdown": {
                "hourly_roots": round(ANCHOR_HOURLY, 2),
                "immediate_cap": round(ANCHOR_IMMEDIATE_CAP, 2),
            },
            "fixed_ops_base_monthly": round(FIXED_OPS_BASE, 2),
            "compliance_annual": COMPLIANCE_ANNUAL,
            "support_step": {"agent_monthly": SUPPORT_AGENT_MONTHLY, "capacity": SUPPORT_CAPACITY},
            "payroll_levies": {"uif_rate": UIF_RATE, "uif_cap_monthly": UIF_CAP_MONTHLY,
                               "sdl_rate": SDL_RATE, "sdl_threshold_monthly": SDL_THRESHOLD_MONTHLY},
            "breakeven_members": {str(p): effective_breakeven(p, 5) for p in (10, 15, 19.90, 20, 22.50, 25, 50, 100)},
            "sensitivity_table": sensitivity_table(),
            "price_feasibility": price_feasibility_table(),
            "retired_R100_analysis": retired_r100_analysis(),
            "market_facts": market_facts(),
            "inputs": all_inputs(),
        }
        print(json.dumps(out, indent=2))
        return

    if "--sensitivity" in sys.argv:
        print("CEILING vs FLOOR sensitivity matrix")
        print("=" * 100)
        print(f"{'r%':>4} {'Members':>8} {'Stipends':>8} | {'Ceiling':>10} {'Floor':>10} | {'Feasible':>8} {'Gap':>8}")
        print("-" * 100)
        for row in sensitivity_table():
            print(f"{row['claims_reduction_pct']:>4.1f} {row['enrolled_members']:>8,} {row['stipends']:>8} | "
                  f"{row['ceiling_per_member_month']:>10.2f} {row['floor_per_member_month']:>10.2f} | "
                  f"{str(row['feasible']):>8} {row['gap_per_member_month']:>8.2f}")
        print()
        print("PRICE FEASIBILITY (breakeven enrolled members)")
        print("=" * 120)
        print(f"{'Price':>6} {'VAT':>8} {'Stipends':>8} {'Free%':>6} | {'Be Members':>10} {'OpMargin@Be':>12}")
        print("-" * 120)
        for row in price_feasibility_table():
            print(f"{row['price_candidate']:>6.2f} {row['vat_mode']:>8} {row['stipends']:>8} {row['free_ratio']*100:>5.0f}% | "
                  f"{row['breakeven_enrolled']:>10,} {row['operating_margin_pct_at_be'] if row['operating_margin_pct_at_be'] else 'N/A':>12}")
        return

    # Human-readable summary
    var = monthly_variable_cost()
    print("VUKA economics v2 (VIGIL + ANCHOR) — ceiling/floor model")
    print("Every input tagged. Price is an OUTPUT. Run with --sensitivity for matrix.\n")
    print(f"Variable cost per member/month: R{var:.2f}  [ESTIMATE]")
    print(f"Anchoring ceiling: hourly R{ANCHOR_HOURLY:.2f}/mo + immediate cap R{ANCHOR_IMMEDIATE_CAP:.2f}/mo = R{ANCHOR_CEILING:.2f}/mo [FACT]")
    print(f"Fixed ops base (excl. stipends/anchoring/compliance/support): R{FIXED_OPS_BASE:.2f}/mo [ESTIMATE]")
    print(f"Compliance annual: R{COMPLIANCE_ANNUAL:,.0f} [ESTIMATE] — allocated over enrolled members")
    print(f"Support: R{SUPPORT_AGENT_MONTHLY:,.0f}/mo per {SUPPORT_CAPACITY:,} members (step cost) [ESTIMATE]")
    print(f"Stipend: R{V['stipend_monthly']:,.0f}/mo each [ASSUMPTION]")
    print(f"Payroll levies: UIF 1% (cap R{UIF_CAP_MONTHLY:,.0f}/mo), SDL 1% if payroll > R{SDL_THRESHOLD_MONTHLY:,.0f}/mo [FACT]")
    print(f"VAT: {V['vat_rate']*100:.0f}%, threshold R{V['vat_threshold_annual']:,.0f}/yr [FACT]")
    print()
    print("Breakeven enrolled members (rounded UP, 5 stipends, no free members, VAT-exclusive):")
    for p in (10, 15, 19.90, 20, 22.50, 25, 50, 100):
        be = effective_breakeven(p, 5)
        om = operating_margin_pct(be, p, 5)
        print(f"  R{p:>6.2f}/mo -> {be:>7,} members  (op margin at BE: {om:.1f}%)")
    print()
    print("Why the R100 insurer story was retired:")
    x = retired_r100_analysis()
    print(f"  Implied {x['implied_theft_claims_per_member_year']} theft claims & R{x['implied_theft_cost_per_member_year']:,} theft cost per member/year.")
    print(f"  At R2,000 or R5,000 relevant claims/member, insurer needs {x['breakeven_reduction_if_relevant_claims_R2000']}% or "
          f"{x['breakeven_reduction_if_relevant_claims_R5000']}% reduction to recover fee.")
    print()
    print("Run with --sensitivity for ceiling/floor matrix and price feasibility table.")
    print("Run with --json for full machine-readable output.")


if __name__ == "__main__":
    main()