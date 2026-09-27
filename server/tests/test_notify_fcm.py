from server.src.notify.fcm import FcmConfig, FcmError, FcmSender, build_message
from server.src.notify.sms import SmsConfig, SmsError
import pytest


def test_fcm_message_is_visible_high_priority_and_deterministically_collapsed():
    first = build_message(token="device-token", idempotency_key="outbox-42")
    second = build_message(token="device-token", idempotency_key="outbox-42")
    message = first["message"]
    assert first == second
    assert message["notification"]["body"]
    assert message["android"]["priority"] == "HIGH"
    assert message["android"]["notification"]["priority"] == "PRIORITY_HIGH"
    assert message["android"]["collapse_key"].startswith("vuka-")
    assert len(message["android"]["collapse_key"].encode()) <= 64
    assert message["data"]["outbox_idempotency_key"] == "outbox-42"


def test_fcm_sender_uses_injected_transport_without_exposing_token():
    calls = []

    def transport(path, body, headers, timeout):
        calls.append((path, body, headers, timeout))
        return {"name": "projects/demo/messages/123"}

    sender = FcmSender(FcmConfig("demo", "secret-token"), transport)
    assert sender.send(build_message(token="device", idempotency_key="k")) == "projects/demo/messages/123"
    assert calls[0][0] == "/v1/projects/demo/messages:send"
    assert calls[0][2]["Authorization"] == "Bearer secret-token"


def test_fcm_config_requires_runtime_settings():
    with pytest.raises(FcmError):
        FcmConfig.from_env({})


def test_sms_defaults_to_push_only_and_rejects_incomplete_settings():
    assert SmsConfig.from_env({}) is None
    with pytest.raises(SmsError):
        SmsConfig.from_env({"SMS_API_URL": "https://sms.example"})
