#!/usr/bin/env python3
"""Export the CEM-0 catalogue scenarios the phone can observe, with their
evaluated scores, as the golden oracle for the phone's CEM-1 engine
(app/src/brain/cem). The phone must reproduce every total, positive,
negative, K and band exactly.

A scenario is phone-observable when every signal in it is a sound, a sound
context or a motion reason: nothing from the server (no_answer, contact_lost),
the PIN (duress, normal PIN), guardians, banks or time context.

Usage: python scripts/eval/cem_golden.py > app/src/brain/cem/__tests__/golden.json
"""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("cem0", ROOT / "scripts" / "coercion_scenarios.py")
cem0 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cem0)

PHONE = (cem0.TRIGGER | cem0.SUPPORT | cem0.NEG_CONTEXT | cem0.MOTION) - {"surge"}

out = []
for s in sorted(cem0.SCENARIOS, key=lambda x: x["id"]):
    reasons = {r for r, _, _ in s["signals"]}
    if not reasons <= PHONE or not s["armed"]:
        continue
    entries = cem0.entries_for(s)
    contrib = cem0.contributions(entries, s["eval_t"])
    pos = sum(v for v in contrib.values() if v > 0)
    neg = -sum(v for v in contrib.values() if v < 0)
    total = pos - neg
    k = 0 if max(pos, neg) == 0 else cem0.round_half_up(cem0.Fraction(100 * min(pos, neg), max(pos, neg)))
    out.append({
        "id": s["id"],
        "signals": [{"reason": r, "t": t} for r, t, _ in sorted(s["signals"], key=cem0.sig_key)],
        "eval_t": s["eval_t"],
        "pos": pos,
        "neg": neg,
        "total": total,
        "k_pct": k,
        "band": cem0.band(total),
    })

json.dump({"cem_version": cem0.CEM_VERSION, "count": len(out), "scenarios": out}, sys.stdout, indent=1)
print(file=sys.stderr, end=f"{len(out)} phone-observable scenarios\n")
