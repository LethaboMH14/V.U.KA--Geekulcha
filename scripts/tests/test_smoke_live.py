from __future__ import annotations

import importlib.util
from pathlib import Path
import sys

from server.main import EventSubmissionV2, verify_event_integrity


MODULE_PATH = Path(__file__).parents[1] / "smoke-live.py"
SPEC = importlib.util.spec_from_file_location("smoke_live", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
smoke_live = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = smoke_live
SPEC.loader.exec_module(smoke_live)


def test_smoke_origin_accepts_http_origins_and_rejects_non_http_schemes():
    assert smoke_live.parse_origin("http://127.0.0.1:8000") == ("http", "127.0.0.1", 8000)
    assert smoke_live.parse_origin("https://example.test/") == ("https", "example.test", None)
    for origin in ("file:///etc/passwd", "ftp://example.test", "//example.test", "https://user@example.test"):
        try:
            smoke_live.parse_origin(origin)
        except ValueError:
            pass
        else:
            raise AssertionError(f"unsafe/non-origin base URL was accepted: {origin}")


def test_smoke_generated_event_has_sim_identity_and_valid_event_signature():
    subject_id = "sim_smoke_subject_unit"
    private_key, key_id, actor_id = smoke_live.synthetic_identity(subject_id)
    event = smoke_live.build_event(
        private_key,
        subject_id=subject_id,
        actor_id=actor_id,
        signer_key_id=key_id,
        action="sim_checkin_result",
        counter=1,
    )

    assert actor_id.startswith("sim_")
    assert key_id.startswith("sim_")
    assert event["action"].startswith("sim_")
    verify_event_integrity(
        EventSubmissionV2.model_validate(event),
        subject_id,
        smoke_live.public_key_b64(private_key),
    )


def test_smoke_redacts_secret_named_response_fields():
    assert smoke_live.redact_body(b'{"private_key":"do-not-print","status":"ok"}') == (
        '{"private_key":"[REDACTED]","status":"ok"}'
    )
