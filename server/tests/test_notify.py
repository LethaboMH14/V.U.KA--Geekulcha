"""server/notify.py delivery choice and the Brevo request, without calling Brevo."""
import json

import pytest

from server import notify


class FakeResponse:
    def __init__(self, status, body=b"{}"):
        self.status, self._body = status, body

    def read(self):
        return self._body


class FakeConnection:
    calls = []
    status = 201
    body = b'{"messageId": "<x@brevo>"}'

    def __init__(self, host, timeout=None, context=None):
        self.host = host

    def request(self, method, path, body=None, headers=None):
        FakeConnection.calls.append({"host": self.host, "method": method, "path": path, "body": body, "headers": headers})

    def getresponse(self):
        return FakeResponse(FakeConnection.status, FakeConnection.body)

    def close(self):
        pass


@pytest.fixture
def brevo(monkeypatch):
    for k in ("VUKA_SMTP_HOST", "VUKA_SMTP_USER", "VUKA_SMTP_PASSWORD", "VUKA_SMTP_FROM", "VUKA_DEV_OTP_LOG"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("VUKA_BREVO_API_KEY", "sim_test_key")
    monkeypatch.setenv("VUKA_EMAIL_FROM", "VUKA <codes@example.co.za>")
    FakeConnection.calls, FakeConnection.status = [], 201
    monkeypatch.setattr(notify.http.client, "HTTPSConnection", FakeConnection)
    return FakeConnection


def test_brevo_sends_one_https_request_with_the_code(brevo):
    assert notify.send_code("email", "thandi@example.co.za", "123456", "verify") == "email"
    (call,) = brevo.calls
    assert call["host"] == "api.brevo.com" and call["method"] == "POST" and call["path"] == "/v3/smtp/email"
    assert call["headers"]["api-key"] == "sim_test_key"
    body = json.loads(call["body"])
    assert body["sender"] == {"name": "VUKA", "email": "codes@example.co.za"}
    assert body["to"] == [{"email": "thandi@example.co.za"}]
    assert "123456" in body["textContent"] and "verify" in body["textContent"]


def test_brevo_refusal_is_a_delivery_failure(brevo):
    brevo.status, brevo.body = 401, b'{"code": "unauthorized", "message": "Key not found"}'
    with pytest.raises(notify.DeliveryFailed, match="Key not found"):
        notify.send_code("email", "a@b.co", "123456", "reset")


def test_plain_sender_address_is_accepted():
    assert notify._sender("codes@example.co.za") == {"email": "codes@example.co.za"}
    assert notify._sender('"VUKA Codes" <c@x.co>') == {"name": "VUKA Codes", "email": "c@x.co"}


def test_nothing_configured_is_delivery_unavailable(monkeypatch):
    for k in ("VUKA_BREVO_API_KEY", "VUKA_EMAIL_FROM", "VUKA_SMTP_HOST", "VUKA_DEV_OTP_LOG"):
        monkeypatch.delenv(k, raising=False)
    with pytest.raises(notify.DeliveryUnavailable):
        notify.send_code("email", "a@b.co", "123456", "verify")
