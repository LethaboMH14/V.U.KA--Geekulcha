#!/usr/bin/env python3
"""Exercise the signed server-min HTTP surface with generated sim_ identities."""

from __future__ import annotations

import argparse
import base64
from datetime import datetime, timezone
import hashlib
import http.client
import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit
import uuid

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from anchor.canonical import canonical
from anchor.verify import first_broken_index


PRIVATE_KEY_BLOCK = re.compile(rb"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----")
SECRET_FIELD = re.compile(r"private|secret|password|token|authorization", re.IGNORECASE)
P256_ORDER = 0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def public_key_b64(private_key: ec.EllipticCurvePrivateKey) -> str:
    public_bytes = private_key.public_key().public_bytes(
        serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return base64.b64encode(public_bytes).decode("ascii")


def synthetic_identity(subject_id: str):
    """Derive a reproducible test-only key with sim_-prefixed key and actor IDs."""
    seed = hashlib.sha256(b"vuka.sim.smoke.key.v1\0" + subject_id.encode("utf-8")).digest()
    scalar = int.from_bytes(seed, "big") % (P256_ORDER - 1) + 1
    suffix = hashlib.sha256(subject_id.encode("utf-8")).hexdigest()[:20]
    return (
        ec.derive_private_key(scalar, ec.SECP256R1()),
        f"sim_smoke_key_{suffix}",
        f"sim_smoke_device_{suffix}",
    )


def build_event(
    private_key: ec.EllipticCurvePrivateKey,
    *,
    subject_id: str,
    actor_id: str,
    signer_key_id: str,
    action: str,
    counter: int,
    registration: bool = False,
) -> dict:
    payload = {"kind": f"sim_{action.removeprefix('sim_')}", "pv": 1}
    salt = os.urandom(16)
    details = {
        "v": 2,
        "signer": "device",
        "signer_key_id": signer_key_id,
        "counter": counter,
        "event_id": str(uuid.uuid4()),
        "commitment": hashlib.sha256(salt + canonical(payload)).hexdigest(),
        "sig": "",
    }
    if registration:
        details["signer_pubkey"] = public_key_b64(private_key)
    event = {
        "action": action,
        "actor_id": actor_id,
        "target_type": "subject",
        "target_id": subject_id,
        "details": details,
        "ts": now_utc(),
        "payload": payload,
        "salt": base64.b64encode(salt).decode("ascii"),
    }
    statement = {
        "domain": "vuka.event.v2",
        "subject_id": subject_id,
        "actor_id": actor_id,
        "target_type": "subject",
        "target_id": subject_id,
        "action": action,
        "source_ts": event["ts"],
        "signer_key_id": signer_key_id,
        "counter": counter,
        "event_id": details["event_id"],
        "commitment": details["commitment"],
    }
    details["sig"] = base64.b64encode(
        private_key.sign(canonical(statement), ec.ECDSA(hashes.SHA256()))
    ).decode("ascii")
    return event


def signed_headers(
    private_key: ec.EllipticCurvePrivateKey,
    *,
    key_id: str,
    method: str,
    path: str,
    body: bytes,
) -> dict[str, str]:
    timestamp = now_utc()
    nonce = f"sim_nonce_{uuid.uuid4().hex}"
    statement = {
        "method": method.upper(),
        "path": path,
        "ts": timestamp,
        "body_sha256": hashlib.sha256(body).hexdigest(),
        "nonce": nonce,
    }
    der_signature = private_key.sign(canonical(statement), ec.ECDSA(hashes.SHA256()))
    r, s = decode_dss_signature(der_signature)
    signature = base64.b64encode(r.to_bytes(32, "big") + s.to_bytes(32, "big")).decode("ascii")
    return {
        "X-Vuka-Key-Id": key_id,
        "X-Vuka-Ts": timestamp,
        "X-Vuka-Nonce": nonce,
        "X-Vuka-Signature": signature,
        "Content-Type": "application/json",
    }


def redact_body(body: bytes) -> str:
    body = PRIVATE_KEY_BLOCK.sub(b"[REDACTED PRIVATE KEY]", body)
    text = body.decode("utf-8", errors="replace")
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return text

    def redact(value):
        if isinstance(value, dict):
            return {
                key: "[REDACTED]" if SECRET_FIELD.search(key) else redact(item)
                for key, item in value.items()
            }
        if isinstance(value, list):
            return [redact(item) for item in value]
        return value

    return json.dumps(redact(parsed), sort_keys=True, separators=(",", ":"))


def parse_origin(base_url: str) -> tuple[str, str, int | None]:
    parsed = urlsplit(base_url)
    scheme = parsed.scheme.lower()
    if scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("base URL must use http or https and include a host")
    if parsed.username or parsed.password or parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
        raise ValueError("base URL must be an origin without credentials, path, query or fragment")
    host = parsed.hostname
    if any(ord(char) < 33 or char in "/\\?#@" for char in host):
        raise ValueError("base URL host contains an invalid character")
    try:
        port = parsed.port
    except ValueError as exc:
        raise ValueError("base URL port is invalid") from exc
    return scheme, host, port


def call(base_url: str, label: str, method: str, path: str, private_key, key_id: str, body: bytes = b""):
    headers = signed_headers(private_key, key_id=key_id, method=method, path=path, body=body)
    connection = None
    try:
        scheme, host, port = parse_origin(base_url)
        connection_type = http.client.HTTPSConnection if scheme == "https" else http.client.HTTPConnection
        connection = connection_type(host, port=port, timeout=15)
        connection.request(
            method.upper(),
            path,
            body=body if method.upper() != "GET" else None,
            headers=headers,
        )
        response = connection.getresponse()
        status = response.status
        response_body = response.read()
    except (http.client.HTTPException, TimeoutError, OSError, ValueError) as exc:
        safe_body = json.dumps({"transport_error": type(exc).__name__}, separators=(",", ":"))
        print(f"{label}: status=NO_RESPONSE body={safe_body}")
        return None, None
    finally:
        if connection is not None:
            connection.close()
    print(f"{label}: status={status} body={redact_body(response_body)}")
    try:
        return status, json.loads(response_body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return status, None


def register(base_url: str, subject_id: str):
    private_key, signer_key_id, actor_id = synthetic_identity(subject_id)
    event = build_event(
        private_key,
        subject_id=subject_id,
        actor_id=actor_id,
        signer_key_id=signer_key_id,
        action="sim_registration",
        counter=0,
        registration=True,
    )
    body = canonical(event)
    status, response = call(
        base_url, f"register {subject_id}", "POST", "/v1/events", private_key, signer_key_id, body
    )
    return status, response, private_key, signer_key_id, actor_id


def run(base_url: str, *, subject_id: str | None = None, export_only: bool = False) -> int:
    problems: list[str] = []
    subject_id = subject_id or f"sim_smoke_subject_{uuid.uuid4().hex}"
    try:
        device_key, key_id, actor_id = synthetic_identity(subject_id)
    except ValueError as exc:
        print(f"smoke result: FAILED ({exc})")
        return 2
    print(f"smoke sim_ subject: {subject_id}")
    health_status, _ = call(
        base_url,
        "healthz",
        "GET",
        "/healthz",
        device_key,
        key_id,
    )
    if health_status != 200:
        problems.append("healthz did not return 200")

    if export_only:
        print("smoke mode: export-only restart check")
    else:
        register_status, _register_body, device_key, key_id, actor_id = register(base_url, subject_id)
        if register_status != 201:
            problems.append("sim_ genesis registration did not return 201")
        else:
            appended = build_event(
                device_key,
                subject_id=subject_id,
                actor_id=actor_id,
                signer_key_id=key_id,
                action="sim_checkin_result",
                counter=1,
            )
            append_status, _ = call(
                base_url,
                "append sim_ event",
                "POST",
                "/v1/events",
                device_key,
                key_id,
                canonical(appended),
            )
            if append_status != 201:
                problems.append("signed append did not return 201")

    export_path = f"/v1/subjects/{subject_id}/export"
    export_status, export_body = call(
        base_url,
        "read export",
        "GET",
        export_path,
        device_key,
        key_id,
    )
    if export_status != 200:
        if isinstance(export_body, dict) and export_body.get("code") == "pin_authorisation_required":
            problems.append("export remains fail-closed pending ADR-0041 PIN-authority and prefix implementation")
        else:
            problems.append("export did not return 200")
    else:
        entries = export_body.get("entries") if isinstance(export_body, dict) else None
        broken_index = first_broken_index(entries if isinstance(entries, list) else [])
        if broken_index is not None:
            problems.append(f"exported chain is invalid at index {broken_index}")

    if not export_only:
        refused_id = f"subject_{uuid.uuid4().hex}"
        refused_status, refused_body, _key, _key_id, _actor_id = register(base_url, refused_id)
        if not (
            refused_status == 403
            and isinstance(refused_body, dict)
            and refused_body.get("code") == "simulation_only"
        ):
            problems.append("non-sim genesis registration was not refused with 403 simulation_only")

    if problems:
        print("smoke result: FAILED")
        for problem in problems:
            print(f"  - {problem}")
        return 1
    print("smoke result: PASSED")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base_url", help="service origin, e.g. http://127.0.0.1:8000")
    parser.add_argument("--subject-id", help="sim_ subject ID for an export-only restart check")
    parser.add_argument(
        "--export-only",
        action="store_true",
        help="re-read one existing sim_ subject export after restarting the service",
    )
    args = parser.parse_args(argv)
    if args.export_only and not args.subject_id:
        parser.error("--export-only requires --subject-id")
    if args.export_only and not args.subject_id.startswith("sim_"):
        parser.error("--export-only requires a sim_ subject id")
    if args.subject_id and not args.export_only:
        parser.error("--subject-id is only valid with --export-only")
    try:
        parse_origin(args.base_url)
    except ValueError as exc:
        parser.error(str(exc))
    return run(args.base_url, subject_id=args.subject_id, export_only=args.export_only)


if __name__ == "__main__":
    raise SystemExit(main())
