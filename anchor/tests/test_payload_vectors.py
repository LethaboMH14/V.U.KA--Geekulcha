"""Cross-check the proposed §4b payload schemas against shared golden vectors."""

from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from anchor.canonical import canonical
from anchor.payloads import PayloadError, validate_payload, validate_payload_json, validate_schema


VECTORS = json.loads(
    (ROOT / "contracts" / "vectors" / "payloads.json").read_text(encoding="utf-8")
)


@pytest.mark.parametrize("entry", VECTORS["golden"], ids=lambda entry: entry["name"])
def test_golden_payload_canonical_hash_and_commitment(entry):
    payload = entry["payload"]
    validate_payload(entry["kind"], payload)
    canonical_bytes = canonical(payload)
    salt = base64.b64decode(entry["salt_b64"], validate=True)

    assert len(salt) == 16
    assert canonical_bytes.hex() == entry["canonical_hex"]
    assert hashlib.sha256(canonical_bytes).hexdigest() == entry["sha256_hex"]
    assert hashlib.sha256(salt + canonical_bytes).hexdigest() == entry["commitment_hex"]


@pytest.mark.parametrize("entry", VECTORS["rejections"], ids=lambda entry: entry["name"])
def test_raw_json_rejections(entry):
    assert isinstance(entry["json"], str)
    with pytest.raises(PayloadError):
        validate_payload_json(entry["kind"], entry["json"])


def test_raw_float_and_duplicate_keys_use_strict_canonical_text_entry():
    float_vector = next(entry for entry in VECTORS["rejections"] if entry["name"].endswith("window_float"))
    duplicate_vector = next(entry for entry in VECTORS["rejections"] if "duplicate" in entry["name"])
    assert "20.0" in float_vector["json"]
    assert duplicate_vector["json"].count('"kind"') == 2
    for entry in (float_vector, duplicate_vector):
        with pytest.raises(PayloadError, match="invalid canonical payload JSON"):
            validate_payload_json(entry["kind"], entry["json"])


def test_validator_refuses_schema_keywords_it_does_not_implement():
    with pytest.raises(PayloadError, match="unsupported schema keyword x_future"):
        validate_schema({"kind": "checkin_opened"}, {"type": "object", "x_future": True})


def test_python_counts_non_bmp_journey_code_points():
    valid = next(
        entry for entry in VECTORS["golden"] if entry["name"].endswith("128_non_bmp")
    )
    invalid = next(
        entry for entry in VECTORS["rejections"] if entry["name"].endswith("129_non_bmp")
    )
    assert len(valid["payload"]["journey_id"]) == 128
    assert len(json.loads(invalid["json"])["journey_id"]) == 129
