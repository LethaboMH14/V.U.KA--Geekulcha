#!/usr/bin/env python3
"""Transparent ANCHOR scale model.

All demand and record-size values are scenario assumptions, not measured facts.
Run: python research/anchor_scale_model.py
"""

from __future__ import annotations

import csv
import math
from pathlib import Path

EVENTS_PER_HOME_PER_DAY = 10  # scenario assumption
CANONICAL_EVENT_BYTES = 512   # replace with measured serialised event size
SIGNATURE_BYTES = 64          # Ed25519 signature size
METADATA_BYTES = 96           # scenario allowance: ids, key id, schema/version
ROOTS_PER_DAY = 24
DAYS_PER_MONTH = 30
DAYS_PER_YEAR = 365
HEDERA_SUBMIT_USD = 0.0008    # official baseline fee, Jan 2026

SCENARIOS = (
    ("Honest pilot", 100),
    ("Security partner", 5_000),
    ("National network", 100_000),
)


def model(name: str, homes: int) -> dict[str, object]:
    event_bytes = CANONICAL_EVENT_BYTES + SIGNATURE_BYTES + METADATA_BYTES
    events_day = homes * EVENTS_PER_HOME_PER_DAY
    events_hour = events_day / ROOTS_PER_DAY
    proof_levels = math.ceil(math.log2(max(1, math.ceil(events_hour))))
    return {
        "scenario": name,
        "homes": homes,
        "events_per_home_per_day_assumption": EVENTS_PER_HOME_PER_DAY,
        "events_per_day": events_day,
        "mean_events_per_hour": round(events_hour, 2),
        "retained_bytes_per_event_assumption": event_bytes,
        "offchain_gb_per_month_decimal": round(events_day * event_bytes * DAYS_PER_MONTH / 1e9, 4),
        "offchain_gb_per_year_decimal": round(events_day * event_bytes * DAYS_PER_YEAR / 1e9, 4),
        "merkle_proof_levels": proof_levels,
        "approx_merkle_path_bytes": proof_levels * 32,
        "public_roots_per_month": ROOTS_PER_DAY * DAYS_PER_MONTH,
        "hedera_baseline_submit_fee_usd_month": round(ROOTS_PER_DAY * DAYS_PER_MONTH * HEDERA_SUBMIT_USD, 4),
    }


def main() -> None:
    rows = [model(name, homes) for name, homes in SCENARIOS]
    out = Path(__file__).parent / "results" / "anchor-scale-scenarios.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    for row in rows:
        print(row)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
