"""PROPOSED member accounts (server/accounts.py); SIMULATED subjects, real PostgreSQL."""
import json

import pytest

from server import notify
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_server_slice1 import make_signed_headers
from server.tests.test_slice3_events import sim_api  # noqa: F401  (fixture)


@pytest.fixture
def outbox(monkeypatch):
    """Captures every code instead of emailing or texting it."""
    sent = []

    def capture(channel, to, code, purpose):
        sent.append({"channel": channel, "to": to, "code": code, "purpose": purpose})
        return channel

    monkeypatch.setattr(notify, "send_code", capture)
    return sent


def call(client, key, method, path, body=None):
    raw = json.dumps(body).encode() if body is not None else b""
    headers = make_signed_headers(method, path, raw, key_id=key)
    return client.request(method, path, content=raw, headers=headers)


def verify_email(client, key, outbox, email="thandi@example.co.za"):
    sent = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": email})
    assert sent.status_code == 201, sent.text
    otp_id = sent.json()["otp_id"]
    ok = call(client, key, "POST", "/v1/account/otp/verify", {"otp_id": otp_id, "code": outbox[-1]["code"]})
    assert ok.status_code == 200, ok.text
    return ok


def test_email_code_verifies_the_contact_and_never_echoes_the_code(sim_api, outbox):
    store, client, subject, key, *_ = sim_api
    sent = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "Thandi@Example.co.za"})
    assert sent.status_code == 201
    assert sent.json()["sent_to"] == "t•••@example.co.za"
    assert outbox[-1]["code"] not in sent.text
    otp_id = sent.json()["otp_id"]
    wrong = "000000" if outbox[-1]["code"] != "000000" else "111111"
    bad = call(client, key, "POST", "/v1/account/otp/verify", {"otp_id": otp_id, "code": wrong})
    assert bad.status_code == 401 and bad.json()["code"] == "wrong_code" and bad.json()["attempts_left"] == 4
    good = call(client, key, "POST", "/v1/account/otp/verify", {"otp_id": otp_id, "code": outbox[-1]["code"]})
    assert good.status_code == 200 and good.json()["verified"] is True
    account = call(client, key, "GET", "/v1/account").json()
    assert account["email"] == "thandi@example.co.za" and account["email_verified"] is True
    assert account["recovery_channel"] == "email"


def test_contact_and_names_are_encrypted_at_rest(sim_api, outbox):
    store, client, subject, key, event, post, now, connect = sim_api
    verify_email(client, key, outbox)
    assert call(client, key, "PUT", "/v1/account/profile", {"first_name": "Thandi", "surname": "Dlamini"}).status_code == 200
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT email_ct, email_lookup, first_name_ct, surname_ct FROM accounts WHERE subject_id=%s", (subject,))
        row = cur.fetchone()
    assert all(v and "thandi" not in v.lower() and "dlamini" not in v.lower() for v in row)
    assert call(client, key, "GET", "/v1/account").json()["first_name"] == "Thandi"


def test_a_code_locks_after_five_wrong_tries(sim_api, outbox):
    store, client, subject, key, *_ = sim_api
    otp_id = call(client, key, "POST", "/v1/account/otp", {"channel": "sms", "to": "+27825550101"}).json()["otp_id"]
    wrong = "000000" if outbox[-1]["code"] != "000000" else "111111"
    for _ in range(5):
        call(client, key, "POST", "/v1/account/otp/verify", {"otp_id": otp_id, "code": wrong})
    locked = call(client, key, "POST", "/v1/account/otp/verify", {"otp_id": otp_id, "code": outbox[-1]["code"]})
    assert locked.status_code == 429 and locked.json()["code"] == "locked"


def test_an_expired_code_is_refused(sim_api, outbox):
    store, client, subject, key, event, post, now, connect = sim_api
    otp_id = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "a@b.co"}).json()["otp_id"]
    with connect() as conn, conn.cursor() as cur:
        cur.execute("UPDATE account_otps SET expires_at = now() - interval '1 minute' WHERE otp_id=%s", (otp_id,))
    r = call(client, key, "POST", "/v1/account/otp/verify", {"otp_id": otp_id, "code": outbox[-1]["code"]})
    assert r.status_code == 410 and r.json()["code"] == "expired"


def test_codes_are_rate_limited(sim_api, outbox):
    store, client, subject, key, *_ = sim_api
    for _ in range(5):
        assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "a@b.co"}).status_code == 201
    sixth = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "a@b.co"})
    assert sixth.status_code == 429 and sixth.json()["code"] == "rate_limited"


def test_invalid_contacts_are_refused(sim_api, outbox):
    store, client, subject, key, *_ = sim_api
    assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "not-an-email"}).status_code == 400
    assert call(client, key, "POST", "/v1/account/otp", {"channel": "sms", "to": "0825550101"}).status_code == 400
    assert outbox == []


def test_password_needs_a_verified_email_then_checks_and_resets(sim_api, outbox):
    store, client, subject, key, *_ = sim_api
    early = call(client, key, "PUT", "/v1/account/password", {"password": "correct horse"})
    assert early.status_code == 409 and early.json()["code"] == "email_not_verified"
    verify_email(client, key, outbox)
    assert call(client, key, "PUT", "/v1/account/password", {"password": "correct horse"}).status_code == 200
    assert call(client, key, "PUT", "/v1/account/password", {"password": "short"}).status_code == 400
    good = call(client, key, "POST", "/v1/account/password/check", {"email": "THANDI@example.co.za", "password": "correct horse"})
    assert good.status_code == 200
    bad = call(client, key, "POST", "/v1/account/password/check", {"email": "thandi@example.co.za", "password": "wrong horse"})
    assert bad.status_code == 401 and bad.json()["code"] == "invalid_credentials"
    # Reset: the code goes to the verified recovery contact, never to an address the caller names.
    start = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "purpose": "reset", "to": "attacker@evil.test"})
    assert start.status_code == 201 and outbox[-1]["to"] == "thandi@example.co.za" and outbox[-1]["purpose"] == "reset"
    done = call(client, key, "POST", "/v1/account/password/reset",
                {"otp_id": start.json()["otp_id"], "code": outbox[-1]["code"], "password": "battery staple"})
    assert done.status_code == 200
    assert call(client, key, "POST", "/v1/account/password/check", {"email": "thandi@example.co.za", "password": "battery staple"}).status_code == 200
    reused = call(client, key, "POST", "/v1/account/password/reset",
                  {"otp_id": start.json()["otp_id"], "code": outbox[-1]["code"], "password": "third one here"})
    assert reused.status_code == 404


def test_recovery_channel_must_be_verified(sim_api, outbox):
    store, client, subject, key, *_ = sim_api
    verify_email(client, key, outbox)
    assert call(client, key, "PUT", "/v1/account/recovery", {"channel": "sms"}).status_code == 409
    assert call(client, key, "PUT", "/v1/account/recovery", {"channel": "email"}).status_code == 200


def test_without_a_provider_the_api_says_so(sim_api, monkeypatch):
    store, client, subject, key, *_ = sim_api
    for k in ("VUKA_SMTP_HOST", "VUKA_TWILIO_ACCOUNT_SID", "VUKA_DEV_OTP_LOG"):
        monkeypatch.delenv(k, raising=False)
    r = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "a@b.co"})
    assert r.status_code == 503 and r.json()["code"] == "delivery_unavailable"


def test_account_routes_need_a_signed_device_request(sim_api):
    store, client, subject, key, *_ = sim_api
    assert client.get("/v1/account").status_code == 401
