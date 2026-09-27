"""Member accounts: verified contacts, profile, password and resets.

PROPOSED (26 Sep, assistant for Mutarisi, at the operator's request to make
sign-up and sign-in real). Not in VUKA-2-SPEC.md yet; the contract owners
(Sibusiso, Lethabo) must accept it and the privacy notice must list it.

What it adds, all signed with the member's device key (§7), so an account is
always the subject this phone registered (sim_ subjects only while
VUKA_SIM_ONLY is on):

  POST /v1/account/otp            send a 6-digit code (email or sms)
  POST /v1/account/otp/verify     check it: verifies the contact, or unlocks a reset
  GET  /v1/account                the member's own details, decrypted
  PUT  /v1/account/profile        first name and surname
  PUT  /v1/account/password       set or change the email sign-in password
  POST /v1/account/password/check email + password sign-in check (same phone)
  POST /v1/account/password/reset new password after a verified reset code
  PUT  /v1/account/recovery       where reset codes go (email or sms)

The PIN is never reset here: PIN recovery stays the recovery code (§9).
Personal data at rest: email, phone and names are AES-256-GCM encrypted with
the payload key; lookups use an HMAC of the normalised value. Codes and
passwords are stored only as Argon2id PHC strings. Codes expire in 10
minutes, allow 5 tries, and a subject may request at most 5 per 15 minutes.
"""
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from cryptography.exceptions import InvalidKey
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id
from fastapi import Request
from fastapi.responses import JSONResponse

from server import notify

OTP_TTL = timedelta(minutes=10)
OTP_ATTEMPTS = 5
OTP_RATE = 5
OTP_RATE_WINDOW = timedelta(minutes=15)
MIN_PASSWORD = 8
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE = re.compile(r"^\+27[1-9][0-9]{8}$")

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS accounts (
    subject_id TEXT PRIMARY KEY,
    email_ct TEXT,
    email_lookup TEXT UNIQUE,
    email_verified_at TIMESTAMPTZ,
    phone_ct TEXT,
    phone_lookup TEXT UNIQUE,
    phone_verified_at TIMESTAMPTZ,
    first_name_ct TEXT,
    surname_ct TEXT,
    password_phc TEXT,
    recovery_channel TEXT CHECK (recovery_channel IN ('email', 'sms')),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS account_otps (
    otp_id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
    purpose TEXT NOT NULL CHECK (purpose IN ('verify', 'reset')),
    target_ct TEXT NOT NULL,
    code_phc TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    verified_at TIMESTAMPTZ,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS account_otps_subject ON account_otps (subject_id, created_at);
"""


def _argon2():
    return Argon2id(os.urandom(16), 32, 3, 4, 65536)


def _hash(secret: str) -> str:
    return _argon2().derive_phc_encoded(secret.encode())


def _matches(secret: str, phc: str | None) -> bool:
    if not phc:
        return False
    try:
        Argon2id.verify_phc_encoded(secret.encode(), phc)
        return True
    except InvalidKey:
        return False


class _Fields:
    """Field encryption and lookup hashes, keyed from the payload key."""

    def __init__(self, key: bytes):
        self.enc = hashlib.sha256(b"vuka.account.enc.v1\0" + key).digest()
        self.mac = hashlib.sha256(b"vuka.account.lookup.v1\0" + key).digest()

    def seal(self, subject_id: str, field: str, value: str | None) -> str | None:
        if value is None:
            return None
        nonce = os.urandom(12)
        ct = AESGCM(self.enc).encrypt(nonce, value.encode(), f"{subject_id}\0{field}".encode())
        return base64.b64encode(nonce + ct).decode()

    def open(self, subject_id: str, field: str, sealed: str | None) -> str | None:
        if sealed is None:
            return None
        raw = base64.b64decode(sealed)
        return AESGCM(self.enc).decrypt(raw[:12], raw[12:], f"{subject_id}\0{field}".encode()).decode()

    def lookup(self, field: str, value: str) -> str:
        return hmac.new(self.mac, f"{field}\0{value}".encode(), hashlib.sha256).hexdigest()


def normalise(channel: str, value: str) -> str:
    value = value.strip()
    return value.lower() if channel == "email" else value.replace(" ", "")


def mask(channel: str, value: str) -> str:
    if channel == "email":
        at = value.find("@")
        return value if at <= 0 else value[0] + "•••" + value[at:]
    return value if len(value) < 4 else value[:3] + " •• ••• " + value[-4:]


def _ensure(cur, subject_id, now):
    cur.execute("""INSERT INTO accounts (subject_id, created_at, updated_at) VALUES (%s, %s, %s)
                   ON CONFLICT (subject_id) DO NOTHING""", (subject_id, now, now))


def _err(status, code, message, **extra):
    return JSONResponse(status_code=status, content={"code": code, "message": message, **extra})


def register_routes(app, store, signed_caller):
    """Adds the account routes to the ANCHOR app (called from server.main.create_app)."""
    from server.db import DatabaseUnavailable

    def now():
        return datetime.now(timezone.utc)

    async def body_of(request):
        try:
            data = json.loads(await request.body() or b"{}")
            return data if isinstance(data, dict) else None
        except ValueError:
            return None

    def fields():
        return _Fields(store._payload_key())

    def run(fn):
        try:
            conn = store._connection()
            try:
                with conn:
                    with conn.cursor() as cur:
                        return fn(cur)
            finally:
                conn.close()
        except DatabaseUnavailable:
            return _err(503, "database_unavailable", "database unavailable")

    @app.post("/v1/account/otp", status_code=201)
    async def send_otp(request: Request):
        principal, refused = await signed_caller(request, role="device")
        if refused:
            return refused
        data = await body_of(request)
        if data is None or data.get("channel") not in ("email", "sms") or data.get("purpose", "verify") not in ("verify", "reset"):
            return _err(400, "invalid_request", "channel must be email or sms")
        channel, purpose, subject = data["channel"], data.get("purpose", "verify"), principal.subject_id
        f, t = fields(), now()

        def work(cur):
            cur.execute("SELECT count(*) FROM account_otps WHERE subject_id=%s AND created_at > %s", (subject, t - OTP_RATE_WINDOW))
            if cur.fetchone()[0] >= OTP_RATE:
                return _err(429, "rate_limited", "too many codes requested; wait a few minutes")
            if purpose == "reset":
                cur.execute("SELECT email_ct, phone_ct, email_verified_at, phone_verified_at, password_phc FROM accounts WHERE subject_id=%s", (subject,))
                row = cur.fetchone()
                sealed = row and (row[0] if channel == "email" else row[1])
                verified = row and (row[2] if channel == "email" else row[3])
                if not row or not sealed or not verified or not row[4]:
                    return _err(404, "not_found", "no verified contact with a password on this account")
                target = f.open(subject, channel, sealed)
            else:
                target = normalise(channel, str(data.get("to", "")))
                if not (EMAIL.match(target) if channel == "email" else PHONE.match(target)):
                    return _err(400, "invalid_request", "email address or +27 mobile number is invalid")
            code = f"{secrets.randbelow(10 ** 6):06d}"
            otp_id = str(uuid.uuid4())
            try:
                via = notify.send_code(channel, target, code, purpose)
            except notify.DeliveryUnavailable as exc:
                return _err(503, "delivery_unavailable", str(exc))
            except notify.DeliveryFailed as exc:
                return _err(502, "delivery_failed", str(exc))
            cur.execute("""INSERT INTO account_otps (otp_id, subject_id, channel, purpose, target_ct, code_phc, expires_at, created_at)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                        (otp_id, subject, channel, purpose, f.seal(subject, "otp_target", target), _hash(code), t + OTP_TTL, t))
            return JSONResponse(status_code=201, content={
                "otp_id": otp_id, "channel": channel, "sent_to": mask(channel, target),
                "expires_in_s": int(OTP_TTL.total_seconds()), "delivery": via})
        return run(work)

    def check_code(cur, subject, otp_id, code, t):
        """Returns (row, None) on a right code, or (None, error response)."""
        cur.execute("""SELECT channel, purpose, target_ct, code_phc, expires_at, attempts, verified_at, consumed_at
                       FROM account_otps WHERE otp_id=%s AND subject_id=%s FOR UPDATE""", (otp_id, subject))
        row = cur.fetchone()
        if row is None or row[7] is not None:
            return None, _err(404, "not_found", "code request not found")
        if row[4] <= t:
            return None, _err(410, "expired", "this code has expired; request a new one")
        if row[5] >= OTP_ATTEMPTS:
            return None, _err(429, "locked", "too many attempts; request a new code")
        cur.execute("UPDATE account_otps SET attempts = attempts + 1 WHERE otp_id=%s", (otp_id,))
        if not _matches(str(code), row[3]):
            left = OTP_ATTEMPTS - row[5] - 1
            return None, _err(401, "wrong_code", "that code isn't right", attempts_left=max(0, left))
        return row, None

    @app.post("/v1/account/otp/verify")
    async def verify_otp(request: Request):
        principal, refused = await signed_caller(request, role="device")
        if refused:
            return refused
        data = await body_of(request)
        if data is None or not isinstance(data.get("otp_id"), str) or not re.fullmatch(r"[0-9]{6}", str(data.get("code", ""))):
            return _err(400, "invalid_request", "otp_id and a 6-digit code are required")
        subject, f, t = principal.subject_id, fields(), now()

        def work(cur):
            row, error = check_code(cur, subject, data["otp_id"], data["code"], t)
            if error:
                return error
            channel, purpose = row[0], row[1]
            if purpose == "reset":
                cur.execute("UPDATE account_otps SET verified_at=%s WHERE otp_id=%s", (t, data["otp_id"]))
                return {"verified": True, "purpose": "reset"}
            target = f.open(subject, "otp_target", row[2])
            lookup = f.lookup(channel, target)
            col = "email" if channel == "email" else "phone"
            cur.execute(f"SELECT subject_id FROM accounts WHERE {col}_lookup=%s AND subject_id<>%s", (lookup, subject))
            if cur.fetchone() is not None:
                return _err(409, "contact_in_use", f"this {'email' if channel == 'email' else 'number'} is already on another VUKA account")
            _ensure(cur, subject, t)
            cur.execute(f"""UPDATE accounts SET {col}_ct=%s, {col}_lookup=%s, {col}_verified_at=%s, updated_at=%s,
                            recovery_channel=COALESCE(recovery_channel, %s) WHERE subject_id=%s""",
                        (f.seal(subject, channel, target), lookup, t, t, channel, subject))
            cur.execute("UPDATE account_otps SET verified_at=%s, consumed_at=%s WHERE otp_id=%s", (t, t, data["otp_id"]))
            return {"verified": True, "purpose": "verify", "channel": channel, "contact": mask(channel, target)}
        return run(work)

    @app.get("/v1/account")
    async def get_account(request: Request):
        principal, refused = await signed_caller(request, role="device")
        if refused:
            return refused
        subject, f = principal.subject_id, fields()

        def work(cur):
            cur.execute("""SELECT email_ct, email_verified_at, phone_ct, phone_verified_at, first_name_ct, surname_ct,
                                  password_phc, recovery_channel FROM accounts WHERE subject_id=%s""", (subject,))
            r = cur.fetchone()
            if r is None:
                return {"subject_id": subject, "email": None, "email_verified": False, "phone": None, "phone_verified": False,
                        "first_name": None, "surname": None, "has_password": False, "recovery_channel": None}
            return {"subject_id": subject, "email": f.open(subject, "email", r[0]), "email_verified": r[1] is not None,
                    "phone": f.open(subject, "sms", r[2]), "phone_verified": r[3] is not None,
                    "first_name": f.open(subject, "first_name", r[4]), "surname": f.open(subject, "surname", r[5]),
                    "has_password": r[6] is not None, "recovery_channel": r[7]}
        return run(work)

    @app.put("/v1/account/profile")
    async def put_profile(request: Request):
        principal, refused = await signed_caller(request, role="device")
        if refused:
            return refused
        data = await body_of(request)
        first, last = (data or {}).get("first_name"), (data or {}).get("surname")
        if not all(isinstance(x, str) and 0 < len(x.strip()) <= 80 for x in (first, last)):
            return _err(400, "invalid_request", "first_name and surname are required")
        subject, f, t = principal.subject_id, fields(), now()

        def work(cur):
            _ensure(cur, subject, t)
            cur.execute("UPDATE accounts SET first_name_ct=%s, surname_ct=%s, updated_at=%s WHERE subject_id=%s",
                        (f.seal(subject, "first_name", first.strip()), f.seal(subject, "surname", last.strip()), t, subject))
            return {"saved": True}
        return run(work)

    @app.put("/v1/account/password")
    async def put_password(request: Request):
        principal, refused = await signed_caller(request, role="device")
        if refused:
            return refused
        data = await body_of(request)
        password = (data or {}).get("password")
        if not isinstance(password, str) or len(password) < MIN_PASSWORD:
            return _err(400, "invalid_request", f"password must be at least {MIN_PASSWORD} characters")
        subject, t = principal.subject_id, now()

        def work(cur):
            cur.execute("SELECT email_verified_at FROM accounts WHERE subject_id=%s", (subject,))
            row = cur.fetchone()
            if row is None or row[0] is None:
                return _err(409, "email_not_verified", "verify an email before setting a password")
            cur.execute("UPDATE accounts SET password_phc=%s, updated_at=%s WHERE subject_id=%s", (_hash(password), t, subject))
            return {"saved": True}
        return run(work)

    @app.post("/v1/account/password/check")
    async def check_password(request: Request):
        principal, refused = await signed_caller(request, role="device")
        if refused:
            return refused
        data = await body_of(request)
        email, password = (data or {}).get("email"), (data or {}).get("password")
        if not isinstance(email, str) or not isinstance(password, str):
            return _err(400, "invalid_request", "email and password are required")
        subject, f = principal.subject_id, fields()

        def work(cur):
            cur.execute("SELECT email_lookup, password_phc FROM accounts WHERE subject_id=%s", (subject,))
            row = cur.fetchone()
            ok = (row is not None and row[0] == f.lookup("email", normalise("email", email)) and _matches(password, row[1]))
            # One answer for any mismatch: never says which part was wrong.
            return {"ok": True} if ok else _err(401, "invalid_credentials", "that email and password don't match this account")
        return run(work)

    @app.post("/v1/account/password/reset")
    async def reset_password(request: Request):
        principal, refused = await signed_caller(request, role="device")
        if refused:
            return refused
        data = await body_of(request)
        password = (data or {}).get("password")
        if (data is None or not isinstance(data.get("otp_id"), str) or not re.fullmatch(r"[0-9]{6}", str(data.get("code", "")))
                or not isinstance(password, str) or len(password) < MIN_PASSWORD):
            return _err(400, "invalid_request", "otp_id, a 6-digit code and a new password are required")
        subject, t = principal.subject_id, now()

        def work(cur):
            row, error = check_code(cur, subject, data["otp_id"], data["code"], t)
            if error:
                return error
            if row[1] != "reset":
                return _err(400, "invalid_request", "this code is not a reset code")
            cur.execute("UPDATE accounts SET password_phc=%s, updated_at=%s WHERE subject_id=%s", (_hash(password), t, subject))
            cur.execute("UPDATE account_otps SET verified_at=%s, consumed_at=%s WHERE otp_id=%s", (t, t, data["otp_id"]))
            return {"saved": True}
        return run(work)

    @app.put("/v1/account/recovery")
    async def put_recovery(request: Request):
        principal, refused = await signed_caller(request, role="device")
        if refused:
            return refused
        data = await body_of(request)
        channel = (data or {}).get("channel")
        if channel not in ("email", "sms"):
            return _err(400, "invalid_request", "channel must be email or sms")
        subject, t = principal.subject_id, now()

        def work(cur):
            col = "email" if channel == "email" else "phone"
            cur.execute(f"SELECT {col}_verified_at FROM accounts WHERE subject_id=%s", (subject,))
            row = cur.fetchone()
            if row is None or row[0] is None:
                return _err(409, "not_verified", f"verify your {'email' if channel == 'email' else 'mobile number'} first")
            cur.execute("UPDATE accounts SET recovery_channel=%s, updated_at=%s WHERE subject_id=%s", (channel, t, subject))
            return {"saved": True}
        return run(work)
