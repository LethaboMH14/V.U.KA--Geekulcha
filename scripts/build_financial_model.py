"""Build docs/finance/VUKA-financial-model.xlsx from Babatunde's economics inputs.

Inputs match docs/ECONOMICS-VIGIL-ANCHOR.md on branch docs/babatunde-war-room-and-access-model
(26 Sep 2026). Values are written, not formulas, so any reader sees numbers without recalculating.
Change an input below and rerun:  python scripts/build_financial_model.py
"""
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

# ---- Inputs (tag in brackets) ----
START = (2026, 11)                 # first model month: Nov 2026 [ASSUMPTION]
MONTHS = 36
PRICE = 20.00                      # R per member per month, paid by the insurer [ASSUMPTION, decided 26 Sep]
BANK_FEE = 15.00                   # R per dispute case [PROPOSED]; cases modelled as 0 (conservative)
VAR = {"Cloud": 0.15, "Support (1 agent per 5,000)": 5.00, "Compliance": 0.57}   # R/member/month [ESTIMATE]
FIXED = {"Team stipends (5 x R30,000)": 150_000.00, "Azure hosting": 348.30, "Hedera anchoring ceiling": 569.47,
         "Business insurance": 667.92, "Accountant": 4_400.00, "Engineering tools": 648.30, "CIPC": 50.00}
ONE_OFF = 3_665.00                 # month 1 [ESTIMATE]
OPENING_CASH = 0.00                # cash today [FACT: no funds raised]
FUNDING = [(1, 1_884_583.00, "First-year ask (TIA grant + angel target)")]  # (month, amount) [ASSUMPTION]
PILOT_START, PILOT_MEMBERS = 7, 5_000        # pilot paid from month 7 (May 2027) [ASSUMPTION, roadmap]
SCALE_START, SCALE_END, SCALE_MEMBERS = 19, 30, 50_000  # linear ramp to 50,000 [ASSUMPTION, business canvas]


def members(m):
    if m < PILOT_START:
        return 0
    if m < SCALE_START:
        return PILOT_MEMBERS
    if m >= SCALE_END:
        return SCALE_MEMBERS
    return round(PILOT_MEMBERS + (SCALE_MEMBERS - PILOT_MEMBERS) * (m - SCALE_START + 1) / (SCALE_END - SCALE_START + 1))


def label(m):
    y, mo = START[0] + (START[1] - 1 + m - 1) // 12, (START[1] - 1 + m - 1) % 12 + 1
    return f"{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo-1]} {y}"


var_unit, fixed_total = sum(VAR.values()), sum(FIXED.values())
rows, cash = [], OPENING_CASH
for m in range(1, MONTHS + 1):
    n = members(m)
    rev = n * PRICE
    cost = fixed_total + n * var_unit + (ONE_OFF if m == 1 else 0)
    net = rev - cost
    funding = sum(a for mm, a, _ in FUNDING if mm == m)
    cash += funding + net
    rows.append([m, label(m), n, rev, n * var_unit, fixed_total, ONE_OFF if m == 1 else 0, cost, net, -min(net, 0), funding, cash])

be = -(-fixed_total // (PRICE - var_unit))
runway_end = next((r[1] for r in rows if r[11] < 0), None)

wb = Workbook()
H, B = Font(bold=True, color="FFFFFF"), PatternFill("solid", fgColor="111111")
money = '"R"#,##0;[Red]-"R"#,##0'

s = wb.active; s.title = "Summary"
summary = [
    ("VUKA financial model", ""), ("Company", "VUKA (PILOTCORE). Founders: Lethabo Hoaeane, Sibusiso Khumalo. Not yet incorporated."),
    ("Source", "Babatunde's economics, docs/ECONOMICS-VIGIL-ANCHOR.md (26 Sep 2026); rebuilt by scripts/build_financial_model.py"),
    ("", ""), ("Price per member per month (insurer pays)", PRICE), ("Variable cost per member per month", var_unit),
    ("Contribution margin", f"{(PRICE-var_unit)/PRICE:.1%}"), ("Fixed cost per month", fixed_total),
    ("Break-even members", int(be)), ("Opening cash (today)", OPENING_CASH), ("Funding assumed", sum(a for _, a, _ in FUNDING)),
    ("Peak monthly burn", max(r[9] for r in rows)), ("Lowest cash balance", min(r[11] for r in rows)),
    ("First month cash goes negative", runway_end or f"None within {MONTHS} months"),
    ("First month net-positive", next((r[1] for r in rows if r[8] > 0), "None")),
    ("", ""), ("Tags", "FACT = sourced · ESTIMATE = derived · ASSUMPTION = believed, not sourced · PROPOSED = designed, not agreed"),
    ("Not included", "Bank per-case revenue (R15/case) is set to 0 cases; VAT; tax; salary increases; HBAR float."),
]
for r in summary:
    s.append(list(r))
s["A1"].font = Font(bold=True, size=14)
for row in s.iter_rows(min_row=5, max_row=15, min_col=2, max_col=2):
    for c in row:
        if isinstance(c.value, (int, float)) and c.row not in (9,):
            c.number_format = money
s.column_dimensions["A"].width, s.column_dimensions["B"].width = 42, 100

i = wb.create_sheet("Inputs")
i.append(["Input", "Value", "Tag"])
i.append(["Price per member per month", PRICE, "ASSUMPTION"])
i.append(["Bank fee per dispute case (cases modelled = 0)", BANK_FEE, "PROPOSED"])
for k, v in VAR.items():
    i.append([f"Variable: {k}", v, "ESTIMATE"])
for k, v in FIXED.items():
    i.append([f"Fixed monthly: {k}", v, "ASSUMPTION" if "stipend" in k else "ESTIMATE"])
i.append(["One-off set-up (month 1)", ONE_OFF, "ESTIMATE"])
i.append(["Opening cash", OPENING_CASH, "FACT"])
for mm, a, why in FUNDING:
    i.append([f"Funding in month {mm}: {why}", a, "ASSUMPTION"])
i.append([f"Pilot members from month {PILOT_START}", PILOT_MEMBERS, "ASSUMPTION"])
i.append([f"Ramp to members by month {SCALE_END}", SCALE_MEMBERS, "ASSUMPTION"])
for c in i[1]:
    c.font, c.fill = H, B
for row in i.iter_rows(min_row=2, min_col=2, max_col=2):
    row[0].number_format = '"R"#,##0.00'
i.column_dimensions["A"].width, i.column_dimensions["C"].width = 52, 14

mo = wb.create_sheet("Monthly")
mo.append(["#", "Month", "Members", "Revenue", "Variable cost", "Fixed cost", "One-off", "Total cost", "Net", "Burn", "Funding in", "Cash balance"])
for r in rows:
    mo.append(r)
for c in mo[1]:
    c.font, c.fill = H, B
for row in mo.iter_rows(min_row=2, min_col=4, max_col=12):
    for c in row:
        c.number_format = money
mo.freeze_panes = "C2"
for col in "BCDEFGHIJKL":
    mo.column_dimensions[col].width = 14

out = Path(__file__).resolve().parents[1] / "docs" / "finance" / "VUKA-financial-model.xlsx"
out.parent.mkdir(parents=True, exist_ok=True)
wb.save(out)
print(out, "| break-even", int(be), "| lowest cash", round(min(r[11] for r in rows)), "| negative from", runway_end,
      "| first positive", next((r[1] for r in rows if r[8] > 0), None))
