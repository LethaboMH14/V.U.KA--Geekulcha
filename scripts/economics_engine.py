#!/usr/bin/env python3
"""P1.11 economics engine. Every input below is sourced from docs/EVIDENCE.md
or docs/08-BUSINESS.md (cited inline); the script only does the arithmetic.
Run: python3 scripts/economics_engine.py
"""

# --- Real inputs (FACT, docs/EVIDENCE.md lines 73/75; docs/08-BUSINESS.md sec 2.1/3) ---
KHAYA_PRICE = 299.00          # R/month, consumer KHAYA tier
HARDWARE_COST_MONTHLY = 3000 / 24   # R125.00, target BOM R3,000 amortised over 24 months
CLOUD_ANCHOR_COST = 12.00     # R/month
SUPPORT_OPS_COST = 25.00      # R/month
GROSS_MARGIN_RAND = KHAYA_PRICE - (HARDWARE_COST_MONTHLY + CLOUD_ANCHOR_COST + SUPPORT_OPS_COST)

# VAT — P1.10. Registration compulsory only above R2.3m turnover from 1 Apr 2026.
VAT_THRESHOLD_ANNUAL = 2_300_000.00
VAT_RATE = 0.15  # SA standard rate, unchanged by the R2.3m threshold rule itself

def pilot_annual_revenue(subscribers, monthly_price):
    return subscribers * monthly_price * 12

def vat_treatment(annual_revenue):
    if annual_revenue < VAT_THRESHOLD_ANNUAL:
        return "disclosure_only", 0.0
    taxable_output_vat = annual_revenue * VAT_RATE / (1 + VAT_RATE)
    return "compulsory_registration", round(taxable_output_vat, 2)

def channel_cost(revenue, model):
    # docs/08-BUSINESS.md sec 4: sell THROUGH security companies (channel), not direct.
    # No commission rate has been agreed with any named partner — ASSUMPTION only.
    rates = {"direct": 0.0, "security_company_channel_ASSUMPTION_20pct": 0.20}
    return round(revenue * rates[model], 2)

def main():
    print("=== VUKA P1.11 economics engine — real figures only, code does the arithmetic ===\n")

    print("-- Gross margin (FACT, from docs/EVIDENCE.md) --")
    print(f"KHAYA price:            R{KHAYA_PRICE:,.2f}/month")
    print(f"Hardware (amortised):   R{HARDWARE_COST_MONTHLY:,.2f}/month  (R3,000 / 24 months)")
    print(f"Cloud + anchor:         R{CLOUD_ANCHOR_COST:,.2f}/month")
    print(f"Support/ops:            R{SUPPORT_OPS_COST:,.2f}/month")
    print(f"Gross margin:           R{GROSS_MARGIN_RAND:,.2f}/month "
          f"({GROSS_MARGIN_RAND / KHAYA_PRICE * 100:.2f}%)\n")

    print("-- P1.10: VAT treatment at pilot scale --")
    for n in (50, 200, 643):  # 643 = min subscribers to cross R2.3m/yr at R299/mo, shown below
        rev = pilot_annual_revenue(n, KHAYA_PRICE)
        treatment, vat_due = vat_treatment(rev)
        print(f"{n:>4} subscribers -> annual revenue R{rev:,.2f} -> {treatment}"
              + (f", output VAT R{vat_due:,.2f}/yr" if vat_due else ""))
    breakeven_subs = VAT_THRESHOLD_ANNUAL / (KHAYA_PRICE * 12)
    print(f"Crossover: ~{breakeven_subs:.0f} KHAYA subscribers/yr at R299/mo reaches the R2.3m threshold.\n")

    print("-- Channel cost, if sold through a security company partner --")
    rev_200 = pilot_annual_revenue(200, KHAYA_PRICE)
    direct = channel_cost(rev_200, "direct")
    channel = channel_cost(rev_200, "security_company_channel_ASSUMPTION_20pct")
    print(f"200 subscribers, annual revenue R{rev_200:,.2f}")
    print(f"  Direct channel cost:   R{direct:,.2f}")
    print(f"  Security-company channel cost (ASSUMPTION 20% commission, no partner agreed): R{channel:,.2f}")
    print("  No named partner has agreed a commission rate. This is a placeholder for the")
    print("  formula, not a real cost — see docs/COMPETITORS.md and P1.13 (Babatunde's job).\n")

    print("-- P1.11: CAC / LTV / churn / payback / burn / runway --")
    print("ASSUMPTION placeholders only. No pilot, no spend, no customer data exists yet.")
    print("Formulas below are the engine; every input is None until real data lands.\n")

    inputs_needed = {
        "CAC (rand per subscriber acquired)": "requires real marketing/channel spend — NOT YET MEASURED",
        "Monthly churn rate": "requires a live cohort over >=1 month — NOT YET MEASURED",
        "LTV = gross_margin / churn_rate": f"= R{GROSS_MARGIN_RAND:,.2f} / churn_rate — churn unknown, cannot compute",
        "LTV:CAC ratio": "cannot compute — both terms unmeasured",
        "Payback period (months) = CAC / gross_margin": "cannot compute — CAC unmeasured",
        "Monthly burn": "requires actual spend ledger — NOT YET MEASURED",
        "Runway (months) = cash / burn": "requires actual cash balance — NOT YET MEASURED",
    }
    for k, v in inputs_needed.items():
        print(f"  {k}: {v}")

    print("\n=== end ===")

if __name__ == "__main__":
    main()
