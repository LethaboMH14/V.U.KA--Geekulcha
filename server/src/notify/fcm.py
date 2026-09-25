"""Firebase Cloud Messaging HTTP v1 transport.

This module deliberately accepts a short-lived OAuth bearer token rather than
service-account material. The token is injected through App Service settings;
it is never logged or committed. Delivery remains at-least-once and callers
must use the stable outbox key as the collapse key.
"""

from __future__ import annotations

import hashlib
import http.client
import json
from dataclasses import dataclass
from typing import Callable, Mapping


class FcmError(RuntimeError):
    """A configuration or FCM response error."""


def _collapse_key(idempotency_key: str) -> str:
    if not isinstance(idempotency_key, str) or not idempotency_key.strip():
        raise ValueError("idempotency key is required")
    # FCM limits Android collapse keys to 64 bytes. The digest is a stable,
    # non-sensitive derivation of the outbox key and avoids leaking its value.
    return "vuka-" + hashlib.sha256(idempotency_key.encode("utf-8")).hexdigest()[:59]


def build_message(*, token: str, idempotency_key: str,
                  title: str = "VUKA guardian alert",
                  body: str = "Please open VUKA to check your selected contact.") -> dict:
    if not token or not isinstance(token, str):
        raise ValueError("FCM registration token is required")
    if not title or not body:
        raise ValueError("visible notification title and body are required")
    return {
        "message": {
            "token": token,
            "notification": {"title": title, "body": body},
            "android": {
                "priority": "HIGH",
                "collapse_key": _collapse_key(idempotency_key),
                "notification": {
                    "channel_id": "vuka_guardian_alerts",
                    "priority": "PRIORITY_HIGH",
                    "visibility": "PRIVATE",
                    "default_sound": True,
                },
            },
            "data": {"outbox_idempotency_key": idempotency_key},
        }
    }


@dataclass(frozen=True)
class FcmConfig:
    project_id: str
    access_token: str
    timeout_seconds: float = 10.0

    @classmethod
    def from_env(cls, environ: Mapping[str, str]) -> "FcmConfig":
        project = environ.get("FCM_PROJECT_ID", "").strip()
        token = environ.get("FCM_ACCESS_TOKEN", "").strip()
        if not project or not token:
            raise FcmError("FCM_PROJECT_ID and FCM_ACCESS_TOKEN are required")
        return cls(project, token)


class FcmSender:
    """Minimal HTTP v1 sender with injectable transport for deterministic tests."""

    def __init__(self, config: FcmConfig,
                 transport: Callable[[str, bytes, Mapping[str, str], float], Mapping] | None = None):
        self.config = config
        self.transport = transport

    def send(self, message: Mapping) -> str:
        body = json.dumps(message, separators=(",", ":"), sort_keys=True).encode("utf-8")
        path = f"/v1/projects/{self.config.project_id}/messages:send"
        headers = {
            "Authorization": "Bearer " + self.config.access_token,
            "Content-Type": "application/json; charset=utf-8",
        }
        if self.transport is not None:
            response = self.transport(path, body, headers, self.config.timeout_seconds)
        else:
            # The host and path are fixed by this adapter; credentials remain
            # in the Authorization header and never appear in exception text.
            connection = http.client.HTTPSConnection("fcm.googleapis.com", timeout=self.config.timeout_seconds)  # nosemgrep: controlled FCM host
            try:
                connection.request("POST", path, body=body, headers=headers)
                raw = connection.getresponse()
                response_body = raw.read()
                if raw.status < 200 or raw.status >= 300:
                    raise FcmError(f"FCM returned HTTP {raw.status}")
                response = json.loads(response_body.decode("utf-8"))
            finally:
                connection.close()
        name = response.get("name") if isinstance(response, Mapping) else None
        if not name or not isinstance(name, str):
            raise FcmError("FCM response did not contain a message name")
        return name
