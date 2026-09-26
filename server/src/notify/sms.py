"""Optional SMS fallback boundary.

No provider is selected in source. Until business verification and a provider
contract are complete, the supported production posture is push-only.
"""

from __future__ import annotations

import json
import http.client
import ssl
import urllib.parse
from dataclasses import dataclass
from typing import Mapping


class SmsError(RuntimeError):
    pass


@dataclass(frozen=True)
class SmsConfig:
    api_url: str
    api_token: str
    sender: str

    @classmethod
    def from_env(cls, environ: Mapping[str, str]) -> "SmsConfig | None":
        values = tuple(environ.get(k, "").strip() for k in ("SMS_API_URL", "SMS_API_TOKEN", "SMS_FROM"))
        if not any(values):
            return None
        if not all(values):
            raise SmsError("SMS_API_URL, SMS_API_TOKEN and SMS_FROM must be supplied together")
        parsed = urllib.parse.urlparse(values[0])
        if parsed.scheme != "https" or not parsed.netloc:
            raise SmsError("SMS_API_URL must be an HTTPS URL")
        return cls(*values)


class SmsSender:
    def __init__(self, config: SmsConfig):
        self.config = config

    def send(self, *, to: str, body: str, idempotency_key: str) -> str:
        if not to or not body or not idempotency_key:
            raise ValueError("SMS recipient, body and idempotency key are required")
        parsed = urllib.parse.urlparse(self.config.api_url)
        path = parsed.path or "/"
        if parsed.query:
            path += "?" + parsed.query
        payload = json.dumps({"to": to, "from": self.config.sender, "body": body}).encode()
        connection = http.client.HTTPSConnection(
            parsed.netloc, timeout=10, context=ssl.create_default_context()
        )
        # Provider-specific response parsing is intentionally deferred until a
        # verified SA trial contract exists; HTTP success is the only evidence.
        try:
            connection.request("POST", path, body=payload, headers={
                "Authorization": "Bearer " + self.config.api_token,
                "Content-Type": "application/json",
                "Idempotency-Key": idempotency_key,
            })
            response = connection.getresponse()
            response.read()
            if response.status < 200 or response.status >= 300:
                raise SmsError(f"SMS provider returned HTTP {response.status}")
        finally:
            connection.close()
        return "sms_http:" + idempotency_key
