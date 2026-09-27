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
    for n in range(5):  # distinct addresses, so only the per-subject limit applies
        assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": f"a{n}@b.co"}).status_code == 201
    sixth = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "a9@b.co"})
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


# ---- review fixes (27 Sep, #116): store before send, recipient/global caps, redaction ----

def test_a_code_is_committed_before_it_is_sent(sim_api, monkeypatch):
    """A code that reaches the member must be verifiable even if the database
    fails after the send, so the row is committed before the provider call."""
    store, client, subject, key, event, post, now, connect = sim_api
    seen = []

    def send(channel, to, code, purpose):
        with connect() as conn, conn.cursor() as cur:  # a separate connection sees only committed rows
            cur.execute("SELECT count(*) FROM account_otps WHERE subject_id=%s", (subject,))
            seen.append(cur.fetchone()[0])
        return channel

    monkeypatch.setattr(notify, "send_code", send)
    assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "a@b.co"}).status_code == 201
    assert seen == [1]


def test_one_recipient_is_capped_across_subjects(sim_api, outbox, monkeypatch):
    """Fresh sim_ registrations each get their own per-subject allowance, so the
    recipient itself is capped: 3 codes per 15 minutes, whoever asks."""
    from server import accounts
    store, client, subject, key, event, post, now, connect = sim_api
    monkeypatch.setattr(accounts, "OTP_RATE", 100)
    lookup = accounts._Fields(store._payload_key()).lookup("otp_target", "email\0victim@b.co")
    with connect() as conn, conn.cursor() as cur:  # one code already sent there by another subject
        cur.execute("""INSERT INTO account_otps (otp_id, subject_id, channel, purpose, target_ct, target_lookup, code_phc, expires_at, created_at)
                       VALUES ('sim_otp_other', 'sim_subj_other', 'email', 'verify', 'x', %s, 'x', now() + interval '10 minutes', now())""", (lookup,))
    for _ in range(2):
        assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "Victim@b.co"}).status_code == 201
    capped = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "victim@b.co"})
    assert capped.status_code == 429 and capped.json()["code"] == "rate_limited"
    assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "someone@b.co"}).status_code == 201


def test_server_wide_cap(sim_api, outbox, monkeypatch):
    from server import accounts
    store, client, subject, key, *_ = sim_api
    monkeypatch.setattr(accounts, "OTP_GLOBAL_RATE", 2)
    assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "one@b.co"}).status_code == 201
    assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "two@b.co"}).status_code == 201
    third = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "three@b.co"})
    assert third.status_code == 429 and third.json()["code"] == "rate_limited"


def test_a_failed_send_never_verifies_still_counts_and_hides_provider_text(sim_api, monkeypatch):
    store, client, subject, key, event, post, now, connect = sim_api
    codes = []

    def refuse(channel, to, code, purpose):
        codes.append(code)
        raise notify.DeliveryFailed("email provider refused (400) sim_provider_detail")

    monkeypatch.setattr(notify, "send_code", refuse)
    r = call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "a@b.co"})
    assert r.status_code == 502 and r.json()["code"] == "delivery_failed"
    assert "sim_provider_detail" not in r.text and "400" not in r.text and codes[0] not in r.text
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT otp_id, consumed_at FROM account_otps WHERE subject_id=%s", (subject,))
        (otp_id, consumed_at), = cur.fetchall()
    assert consumed_at is not None  # counts against the limits, but can never verify
    late = call(client, key, "POST", "/v1/account/otp/verify", {"otp_id": otp_id, "code": codes[0]})
    assert late.status_code != 200


def test_no_provider_leaves_no_code_behind(sim_api, monkeypatch):
    store, client, subject, key, event, post, now, connect = sim_api
    for k in ("VUKA_BREVO_API_KEY", "VUKA_SMTP_HOST", "VUKA_TWILIO_ACCOUNT_SID", "VUKA_DEV_OTP_LOG"):
        monkeypatch.delenv(k, raising=False)
    assert call(client, key, "POST", "/v1/account/otp", {"channel": "email", "to": "a@b.co"}).status_code == 503
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM account_otps WHERE subject_id=%s", (subject,))
        assert cur.fetchone()[0] == 0
