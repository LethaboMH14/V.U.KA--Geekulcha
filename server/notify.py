"""Delivers one-time codes by email (Brevo API or SMTP) or text message (Twilio).

PROPOSED (26 Sep, assistant for Mutarisi): the account backend's delivery side.
Configured only by environment settings, never by code:

  email   VUKA_BREVO_API_KEY + VUKA_EMAIL_FROM  (Brevo's HTTPS API, port 443;
          use this on hosts that block SMTP, e.g. Render's free tier), or
          VUKA_SMTP_HOST, VUKA_SMTP_PORT (587), VUKA_SMTP_USER,
          VUKA_SMTP_PASSWORD, VUKA_SMTP_FROM
          (any SMTP account works, e.g. Gmail with an app password)
          VUKA_EMAIL_FROM / VUKA_SMTP_FROM: "Name <address>" or just an address.
  sms     VUKA_TWILIO_ACCOUNT_SID, VUKA_TWILIO_AUTH_TOKEN, VUKA_TWILIO_FROM

With neither set, a LOCAL development server may set VUKA_DEV_OTP_LOG=1 to
print codes to its own console. Codes never appear in an API response.
Anything else raises DeliveryUnavailable, and the API says so plainly.
"""
import base64
import http.client
import json
import os
import smtplib
import ssl
import urllib.parse
from email.message import EmailMessage


class DeliveryUnavailable(Exception):
    """No provider is configured for this channel (and dev logging is off)."""


class DeliveryFailed(Exception):
    """The provider refused or could not be reached."""


def _message(code: str, purpose: str) -> str:
    what = "reset your VUKA password" if purpose == "reset" else "verify it's you in VUKA"
    return f"Your VUKA code is {code}. Use it to {what}. It expires in 10 minutes. VUKA will never ask you for this code."


def brevo_configured() -> bool:
    return all(os.environ.get(k) for k in ("VUKA_BREVO_API_KEY", "VUKA_EMAIL_FROM"))


def smtp_configured() -> bool:
    return all(os.environ.get(k) for k in ("VUKA_SMTP_HOST", "VUKA_SMTP_USER", "VUKA_SMTP_PASSWORD", "VUKA_SMTP_FROM"))


def email_configured() -> bool:
    return brevo_configured() or smtp_configured()


def sms_configured() -> bool:
    return all(os.environ.get(k) for k in ("VUKA_TWILIO_ACCOUNT_SID", "VUKA_TWILIO_AUTH_TOKEN", "VUKA_TWILIO_FROM"))


def send_code(channel: str, to: str, code: str, purpose: str) -> str:
    """Sends the code. Returns how it went out: "email", "sms" or "dev_log"."""
    if channel == "email" and brevo_configured():
        _send_brevo(to, code, purpose)
        return "email"
    if channel == "email" and smtp_configured():
        _send_email(to, code, purpose)
        return "email"
    if channel == "sms" and sms_configured():
        _send_sms(to, code, purpose)
        return "sms"
    if os.environ.get("VUKA_DEV_OTP_LOG") == "1":
        # Local development only: the operator reads it from this console.
        print(f"vuka: DEV OTP for {channel} {to}: {code} ({purpose})", flush=True)
        return "dev_log"
    raise DeliveryUnavailable(f"no {channel} provider is configured on this server")


def _send_email(to: str, code: str, purpose: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = "Your VUKA code"
    msg["From"] = os.environ["VUKA_SMTP_FROM"]
    msg["To"] = to
    msg.set_content(_message(code, purpose))
    try:
        port = int(os.environ.get("VUKA_SMTP_PORT", "587"))
        context = ssl.create_default_context()
        if port == 465:
            with smtplib.SMTP_SSL(os.environ["VUKA_SMTP_HOST"], port, context=context, timeout=20) as smtp:
                smtp.login(os.environ["VUKA_SMTP_USER"], os.environ["VUKA_SMTP_PASSWORD"])
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(os.environ["VUKA_SMTP_HOST"], port, timeout=20) as smtp:
                smtp.starttls(context=context)
                smtp.login(os.environ["VUKA_SMTP_USER"], os.environ["VUKA_SMTP_PASSWORD"])
                smtp.send_message(msg)
    except (OSError, smtplib.SMTPException) as exc:
        raise DeliveryFailed("email could not be sent") from exc


def _sender(value: str) -> dict:
    """ "VUKA <a@b.co>" -> {"name": "VUKA", "email": "a@b.co"}; "a@b.co" -> {"email": "a@b.co"}."""
    value = value.strip()
    if "<" in value and value.endswith(">"):
        name, email = value[:-1].split("<", 1)
        return {"name": name.strip().strip('"'), "email": email.strip()} if name.strip() else {"email": email.strip()}
    return {"email": value}


def _send_brevo(to: str, code: str, purpose: str) -> None:
    """Brevo transactional email over HTTPS (POST /v3/smtp/email)."""
    body = json.dumps({
        "sender": _sender(os.environ["VUKA_EMAIL_FROM"]),
        "to": [{"email": to}],
        "subject": "Your VUKA code",
        "textContent": _message(code, purpose),
    })
    conn = http.client.HTTPSConnection("api.brevo.com", timeout=20, context=ssl.create_default_context())
    try:
        conn.request("POST", "/v3/smtp/email", body=body, headers={
            "api-key": os.environ["VUKA_BREVO_API_KEY"],
            "Content-Type": "application/json",
            "Accept": "application/json",
        })
        resp = conn.getresponse()
        text = resp.read()
        if resp.status >= 300:
            try:
                detail = json.loads(text).get("message", "")
            except ValueError:
                detail = ""
            raise DeliveryFailed(f"email provider refused ({resp.status}) {detail}".strip())
    except OSError as exc:
        raise DeliveryFailed("email provider could not be reached") from exc
    finally:
        conn.close()


def _send_sms(to: str, code: str, purpose: str) -> None:
    sid = os.environ["VUKA_TWILIO_ACCOUNT_SID"]
    auth = base64.b64encode(f"{sid}:{os.environ['VUKA_TWILIO_AUTH_TOKEN']}".encode()).decode()
    body = urllib.parse.urlencode({"To": to, "From": os.environ["VUKA_TWILIO_FROM"], "Body": _message(code, purpose)})
    conn = http.client.HTTPSConnection("api.twilio.com", timeout=20, context=ssl.create_default_context())
    try:
        conn.request("POST", f"/2010-04-01/Accounts/{urllib.parse.quote(sid)}/Messages.json", body=body,
                     headers={"Authorization": f"Basic {auth}", "Content-Type": "application/x-www-form-urlencoded"})
        resp = conn.getresponse()
        text = resp.read()
        if resp.status >= 300:
            try:
                detail = json.loads(text).get("message", "")
            except ValueError:
                detail = ""
            raise DeliveryFailed(f"sms provider refused ({resp.status}) {detail}".strip())
    except OSError as exc:
        raise DeliveryFailed("sms provider could not be reached") from exc
    finally:
        conn.close()
