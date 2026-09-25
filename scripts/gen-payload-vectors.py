#!/usr/bin/env python3
"""Generate simulated §4b payload vectors from anchor.canonical."""

from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from anchor.canonical import canonical


OUTPUT = ROOT / "contracts" / "vectors" / "payloads.json"
SALT = bytes(range(16))
CHECKIN_ID = "7c1d3f0e-5b2a-4c8e-9a61-2f4d8e0b1c33"
SIGNAL_EVENT_ID = "0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70"


def opened_payload(*, journey_id: str = "sim_journey_1", window_s: int = 20) -> dict:
    return {
        "kind": "checkin_opened",
        "pv": 1,
        "checkin_id": CHECKIN_ID,
        "journey_id": journey_id,
        "signal_event_id": SIGNAL_EVENT_ID,
        "window_s": window_s,
    }


def result_payload(*, result: str = "normal_pin", attempt: int = 1) -> dict:
    return {
        "kind": "checkin_result",
        "pv": 1,
        "checkin_id": CHECKIN_ID,
        "result": result,
        "attempt": attempt,
    }


def ended_payload(*, journey_id: str = "sim_journey_1") -> dict:
    return {"kind": "journey_ended", "pv": 1, "journey_id": journey_id}


def make_golden(name: str, kind: str, payload: dict) -> dict:
    canonical_bytes = canonical(payload)
    return {
        "name": name,
        "kind": kind,
        "payload": payload,
        "salt_b64": base64.b64encode(SALT).decode("ascii"),
        "canonical_hex": canonical_bytes.hex(),
        "sha256_hex": hashlib.sha256(canonical_bytes).hexdigest(),
        "commitment_hex": hashlib.sha256(SALT + canonical_bytes).hexdigest(),
    }


def raw_json(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def rejection(name: str, kind: str, text: str, reason: str) -> dict:
    return {"name": name, "kind": kind, "json": text, "reason": reason}


def build_vectors() -> dict:
    golden = [
        make_golden("sim_checkin_opened_window_20", "checkin_opened", opened_payload()),
        make_golden(
            "sim_checkin_opened_window_60",
            "checkin_opened",
            opened_payload(window_s=60),
        ),
        make_golden(
            "sim_checkin_opened_journey_128_ascii",
            "checkin_opened",
            opened_payload(journey_id="sim_" + "a" * 124),
        ),
        make_golden(
            "sim_checkin_opened_journey_non_ascii",
            "checkin_opened",
            opened_payload(journey_id="sim_journey_é"),
        ),
        make_golden(
            "sim_checkin_result_normal_attempt_1",
            "checkin_result",
            result_payload(),
        ),
        make_golden(
            "sim_checkin_result_normal_attempt_4",
            "checkin_result",
            result_payload(attempt=4),
        ),
        make_golden(
            "sim_checkin_result_duress_pin",
            "checkin_result",
            result_payload(result="duress_pin", attempt=2),
        ),
        make_golden(
            "sim_journey_ended_basic",
            "journey_ended",
            ended_payload(),
        ),
        make_golden(
            "sim_journey_ended_journey_128_non_bmp",
            "journey_ended",
            ended_payload(journey_id="😀" * 128),
        ),
    ]

    opened = opened_payload()
    result = result_payload()
    ended = ended_payload()
    rejections = [
        rejection(
            "sim_checkin_opened_window_30",
            "checkin_opened",
            raw_json({**opened, "window_s": 30}),
            "window_s must be 20 or 60",
        ),
        rejection(
            "sim_checkin_opened_window_string",
            "checkin_opened",
            raw_json({**opened, "window_s": "20"}),
            "window_s must be an integer, not a string",
        ),
        rejection(
            "sim_checkin_opened_window_float",
            "checkin_opened",
            raw_json({**opened, "window_s": 20.0}),
            "canonical payload text rejects floating-point numbers",
        ),
        rejection(
            "sim_checkin_opened_uppercase_uuid",
            "checkin_opened",
            raw_json({**opened, "checkin_id": CHECKIN_ID.upper()}),
            "checkin_id must be a lowercase UUID",
        ),
        rejection(
            "sim_checkin_opened_missing_signal_event_id",
            "checkin_opened",
            raw_json({key: value for key, value in opened.items() if key != "signal_event_id"}),
            "signal_event_id is required",
        ),
        rejection(
            "sim_checkin_opened_unknown_field",
            "checkin_opened",
            raw_json({**opened, "sim_unexpected": True}),
            "additional properties are forbidden",
        ),
        rejection(
            "sim_checkin_opened_wrong_pv",
            "checkin_opened",
            raw_json({**opened, "pv": 2}),
            "pv must equal 1",
        ),
        rejection(
            "sim_checkin_result_device_no_answer",
            "checkin_result",
            raw_json({**result, "result": "no_answer"}),
            "no_answer is server-authored, not a device result",
        ),
        rejection(
            "sim_checkin_result_wrong_duress_value",
            "checkin_result",
            raw_json({**result, "result": "duress_signal"}),
            "result must be normal_pin or duress_pin",
        ),
        rejection(
            "sim_checkin_result_attempt_zero",
            "checkin_result",
            raw_json({**result, "attempt": 0}),
            "attempt must be at least 1",
        ),
        rejection(
            "sim_checkin_result_attempt_float",
            "checkin_result",
            raw_json({**result, "attempt": 1.5}),
            "attempt must be an integer",
        ),
        rejection(
            "sim_checkin_result_attempt_boolean",
            "checkin_result",
            raw_json({**result, "attempt": True}),
            "attempt must be an integer, not a boolean",
        ),
        rejection(
            "sim_journey_ended_mode_forbidden",
            "journey_ended",
            raw_json({**ended, "mode": "duress"}),
            "journey_ended has no mode field (T52 shape parity)",
        ),
        rejection(
            "sim_journey_ended_empty_id",
            "journey_ended",
            raw_json(ended_payload(journey_id="")),
            "journey_id must not be empty",
        ),
        rejection(
            "sim_journey_ended_id_129_ascii",
            "journey_ended",
            raw_json(ended_payload(journey_id="sim_" + "a" * 125)),
            "journey_id exceeds 128 Unicode code points",
        ),
        rejection(
            "sim_journey_ended_id_129_non_bmp",
            "journey_ended",
            raw_json(ended_payload(journey_id="😀" * 129)),
            "journey_id exceeds 128 Unicode code points",
        ),
        rejection(
            "sim_journey_ended_duplicate_kind_key",
            "journey_ended",
            '{"kind":"journey_ended","kind":"journey_ended","pv":1,"journey_id":"sim_journey_1"}',
            "duplicate JSON object keys are refused before parsing",
        ),
    ]
    pin = {"kind": "pin_authorised", "pv": 1, "action": "export", "target_id": "sim_subject", "mode": "normal", "nonce": "sim_nonce", "sig": "MAA=", "signer_key_id": "sim_key"}
    for mode in ("normal", "duress"):
        golden.append(make_golden("sim_pin_authorised_" + mode, "pin_authorised", {**pin, "mode": mode}))
    golden.append(make_golden("sim_pin_authorised_delete", "pin_authorised", {**pin, "action": "delete"}))
    for name, invalid in (
        ("action", {**pin, "action": "add_guardian"}),
        ("mode", {**pin, "mode": "other"}),
        ("extra", {**pin, "extra": True}),
        ("missing_nonce", {k: v for k, v in pin.items() if k != "nonce"}),
        ("target_129", {**pin, "target_id": "s" * 129}),
        ("signature_base64", {**pin, "sig": "!bad"}),
    ):
        rejections.append(rejection("sim_pin_authorised_" + name, "pin_authorised", raw_json(invalid), "invalid proposed PIN payload"))
    return {
        "description": "Simulated §4b payload golden and raw-JSON rejection vectors; schemas remain PROPOSED under ADR-0044.",
        "golden": golden,
        "rejections": rejections,
    }


def main() -> None:
    vectors = build_vectors()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(vectors, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"wrote {OUTPUT.relative_to(ROOT)}")
    print(f"golden={len(vectors['golden'])} rejections={len(vectors['rejections'])}")


if __name__ == "__main__":
    main()
