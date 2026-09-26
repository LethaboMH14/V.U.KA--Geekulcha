"""Local-only FastAPI service for ANCHOR server slices 1 and 2.

Request authentication uses enrolled P-256 keys. This remains a prototype:
PIN authority, escalation, anchoring, encrypted payload storage and deployment
are outside these slices; do not expose it as a production service.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
import base64
import binascii
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
import os
import re
from typing import Annotated, Any, Literal
from uuid import UUID, uuid4

from cryptography.exceptions import InvalidSignature
from cryptography.exceptions import UnsupportedAlgorithm
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature
from cryptography.hazmat.primitives.serialization import load_der_public_key
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, status
from starlette.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, Field, StrictInt, StrictStr, field_validator, model_validator
from starlette.responses import JSONResponse

from anchor.canonical import canonical
from server.pin_records import EventRefused, require_authorisation
from server.event_effects import append_server
from server.server_signing import sign_key_revoked_entry
from server.db import (
    DatabaseUnavailable,
    IdempotencyConflict,
    JourneyBindingConflict,
    PostgresDatabase,
    RequestReplay,
    RequestTimestampExpired,
    SignerKeyRevoked,
    SignerKeyNotFound,
    SignerSubjectMismatch,
    SubjectNotFound,
)


_HASH_PATTERN = r"^[0-9a-f]{64}$"
_RFC3339_PATTERN = (
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}"
    r"(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$"
)


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class EvidenceDetailsV2(StrictModel):
    v: Literal[2]
    signer: Literal["device", "guardian", "server"]
    signer_key_id: Annotated[StrictStr, Field(min_length=1)]
    counter: Annotated[StrictInt, Field(ge=0, le=9_007_199_254_740_991)]
    event_id: Annotated[StrictStr, Field(json_schema_extra={"format": "uuid"})]
    commitment: Annotated[StrictStr, Field(pattern=_HASH_PATTERN)]
    sig: Annotated[StrictStr, Field(min_length=1)]
    received_at: StrictStr
    chain_index: Annotated[StrictInt, Field(ge=0, le=9_007_199_254_740_991)]
    signer_pubkey: StrictStr = None  # type: ignore[assignment]
    revoked_key_id: StrictStr = None  # type: ignore[assignment]

    @field_validator("event_id")
    @classmethod
    def event_id_is_uuid(cls, value: str) -> str:
        try:
            UUID(value)
        except ValueError as exc:
            raise ValueError("event_id must be a UUID") from exc
        return value

    @field_validator("received_at")
    @classmethod
    def received_at_is_rfc3339(cls, value: str) -> str:
        _validate_rfc3339(value, "received_at")
        return value

    @field_validator("sig", "signer_pubkey")
    @classmethod
    def encoded_values_are_base64(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            base64.b64decode(value, validate=True)
        except (ValueError, binascii.Error) as exc:
            raise ValueError("value must be base64") from exc
        return value


class EventSubmissionDetailsV2(StrictModel):
    """Client-supplied signed details; receipt fields belong to stored entries only."""

    v: Literal[2]
    signer: Literal["device", "guardian"]
    signer_key_id: Annotated[StrictStr, Field(min_length=1)]
    counter: Annotated[StrictInt, Field(ge=0, le=9_007_199_254_740_991)]
    event_id: Annotated[StrictStr, Field(json_schema_extra={"format": "uuid"})]
    commitment: Annotated[StrictStr, Field(pattern=_HASH_PATTERN)]
    sig: Annotated[StrictStr, Field(min_length=1)]
    signer_pubkey: StrictStr = None  # type: ignore[assignment]

    @field_validator("event_id")
    @classmethod
    def event_id_is_uuid(cls, value: str) -> str:
        try:
            UUID(value)
        except ValueError as exc:
            raise ValueError("event_id must be a UUID") from exc
        return value

    @field_validator("sig", "signer_pubkey")
    @classmethod
    def encoded_values_are_base64(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            base64.b64decode(value, validate=True)
        except (ValueError, binascii.Error) as exc:
            raise ValueError("value must be base64") from exc
        return value


class EventPayloadV2(StrictModel):
    model_config = ConfigDict(extra="allow", strict=True)

    kind: Annotated[StrictStr, Field(min_length=1)]
    pv: Annotated[StrictInt, Field(ge=1)]


class EventSubmissionV2(StrictModel):
    """Client request shape; the server adds receipt and chain-position fields."""

    action: Annotated[StrictStr, Field(min_length=1)]
    actor_id: Annotated[StrictStr, Field(min_length=1)]
    target_type: Literal["journey", "subject"]
    target_id: Annotated[StrictStr, Field(min_length=1)]
    details: EventSubmissionDetailsV2
    ts: StrictStr
    payload: EventPayloadV2
    salt: Annotated[StrictStr, Field(min_length=24, max_length=24)]

    @field_validator("ts")
    @classmethod
    def ts_is_rfc3339(cls, value: str) -> str:
        _validate_rfc3339(value, "ts")
        return value

    @field_validator("salt")
    @classmethod
    def salt_is_base64_for_16_bytes(cls, value: str) -> str:
        try:
            salt_bytes = base64.b64decode(value, validate=True)
        except (ValueError, binascii.Error) as exc:
            raise ValueError("salt must be base64") from exc
        if len(salt_bytes) != 16 or base64.b64encode(salt_bytes).decode("ascii") != value:
            raise ValueError("salt must encode exactly 16 bytes")
        return value


class EvidenceEntryV2(StrictModel):
    action: Annotated[StrictStr, Field(min_length=1)]
    actor_id: Annotated[StrictStr, Field(min_length=1)]
    target_type: Literal["journey", "subject"]
    target_id: Annotated[StrictStr, Field(min_length=1)]
    details: EvidenceDetailsV2
    ts: StrictStr
    prev_hash: Annotated[StrictStr, Field(pattern=_HASH_PATTERN)]
    event_hash: Annotated[StrictStr, Field(pattern=_HASH_PATTERN)]

    @field_validator("ts")
    @classmethod
    def ts_is_rfc3339(cls, value: str) -> str:
        _validate_rfc3339(value, "ts")
        return value

    @model_validator(mode="after")
    def key_revocation_has_public_reference(self):
        if self.action == "key_revoked" and not self.details.revoked_key_id:
            raise ValueError("key_revoked details must include revoked_key_id")
        if self.action != "key_revoked" and self.details.revoked_key_id is not None:
            raise ValueError("revoked_key_id is only valid on key_revoked entries")
        return self


class RequestAuthenticationFailure(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass(frozen=True)
class AuthenticatedSigner:
    signer_key_id: str
    subject_id: str
    signer_role: str
    nonce: str
    request_ts: str
    public_key: str
    genesis_registration: bool = False


def _validate_rfc3339(value: str, field: str) -> None:
    if re.fullmatch(_RFC3339_PATTERN, value) is None:
        raise ValueError(f"{field} must be RFC 3339")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"{field} must be RFC 3339") from exc
    if parsed.utcoffset() is None:
        raise ValueError(f"{field} must include a timezone offset")


def verify_request(
    request: Request,
    entry: EventSubmissionV2 | None = None,
    *,
    subject_id: str | None = None,
    database=None,
    body: bytes = b"",
) -> AuthenticatedSigner:
    """Verify §7's HTTP request signature against an active enrolled P-256 key.

    This verifies request authority only. It does not verify `details.sig`, a
    PIN-authority statement, or the event payload commitment.
    """
    store = database or getattr(request.app.state, "database", None)
    key_id = request.headers.get("X-Vuka-Key-Id")
    request_ts = request.headers.get("X-Vuka-Ts")
    nonce = request.headers.get("X-Vuka-Nonce")
    signature_text = request.headers.get("X-Vuka-Signature")
    if not all((key_id, request_ts, nonce, signature_text)):
        raise RequestAuthenticationFailure("authentication_required", "signed request headers are required")
    if store is None:
        raise RequestAuthenticationFailure("authentication_required", "signer registry is unavailable")
    if not nonce or not nonce.strip() or len(nonce) > 256:
        raise RequestAuthenticationFailure("invalid_signature", "signed request is invalid")
    try:
        _validate_rfc3339(request_ts, "X-Vuka-Ts")
        parsed_ts = datetime.fromisoformat(request_ts.replace("Z", "+00:00"))
        if parsed_ts.utcoffset() is None:
            raise ValueError("timestamp needs timezone")
    except ValueError as exc:
        raise RequestAuthenticationFailure("invalid_signature", "signed request is invalid") from exc

    genesis_registration = False
    if entry is not None:
        if entry.details.signer == "server":
            raise RequestAuthenticationFailure("invalid_signature", "server events cannot be submitted as client requests")
        if entry.details.signer_key_id != key_id:
            raise RequestAuthenticationFailure("invalid_signature", "signer key id does not match request")

    try:
        key_record = store.get_signer_key(key_id)
    except DatabaseUnavailable:
        raise
    if key_record is None and entry is not None and (
        entry.action.removeprefix("sim_") == "registration"
        and entry.target_type == "subject"
        and entry.details.signer == "device"
        and entry.details.signer_pubkey
    ):
        # Bootstrap exactly one device key from the signed genesis registration.
        # Persistence is atomic with the genesis chain row in register_subject().
        genesis_registration = True
        key_record = {
            "signer_key_id": key_id,
            "subject_id": entry.target_id,
            "actor_id": entry.actor_id,
            "signer_role": "device",
            "public_key": entry.details.signer_pubkey,
            "revoked_at": None,
        }
    if key_record is None:
        raise RequestAuthenticationFailure("invalid_signature", "signer key is unknown")
    if key_record.get("revoked_at") is not None:
        raise RequestAuthenticationFailure("key_revoked", "signer key is revoked")
    if key_record.get("signer_role") not in {"device", "guardian"}:
        raise RequestAuthenticationFailure("invalid_signature", "signer key role is invalid")
    if entry is not None and entry.details.signer != key_record.get("signer_role"):
        raise RequestAuthenticationFailure("invalid_signature", "entry signer role does not match key")
    if entry is not None and entry.actor_id != key_record.get("actor_id"):
        raise RequestAuthenticationFailure("invalid_signature", "entry actor does not match key")
    if subject_id is not None and subject_id != key_record.get("subject_id"):
        raise RequestAuthenticationFailure("not_found", "subject was not found")

    try:
        public_key_bytes = base64.b64decode(key_record["public_key"], validate=True)
        public_key = load_der_public_key(public_key_bytes)
        if not isinstance(public_key, ec.EllipticCurvePublicKey) or public_key.curve.name != "secp256r1":
            raise ValueError("registered signer key is not P-256")
        raw_signature = base64.b64decode(signature_text, validate=True)
        if len(raw_signature) != 64 or base64.b64encode(raw_signature).decode("ascii") != signature_text:
            raise ValueError("signature must be canonical base64 raw r||s")
        r = int.from_bytes(raw_signature[:32], "big")
        s = int.from_bytes(raw_signature[32:], "big")
        der_signature = encode_dss_signature(r, s)
        statement = {
            "method": request.method.upper(),
            "path": request.url.path,
            "ts": request_ts,
            "body_sha256": hashlib.sha256(body).hexdigest(),
            "nonce": nonce,
        }
        public_key.verify(der_signature, canonical(statement), ec.ECDSA(hashes.SHA256()))
    except InvalidSignature as exc:
        raise RequestAuthenticationFailure("invalid_signature", "signed request is invalid") from exc
    except (ValueError, TypeError, KeyError, binascii.Error, UnsupportedAlgorithm) as exc:
        raise RequestAuthenticationFailure("invalid_signature", "signed request is invalid") from exc

    return AuthenticatedSigner(
        signer_key_id=key_id,
        subject_id=key_record["subject_id"],
        signer_role=key_record["signer_role"],
        nonce=nonce,
        request_ts=request_ts,
        public_key=key_record["public_key"],
        genesis_registration=genesis_registration,
    )


def _server_time() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _subject_id_for(entry: EventSubmissionV2, principal: AuthenticatedSigner, store) -> str:
    if entry.target_type == "subject":
        if entry.target_id != principal.subject_id:
            raise RequestAuthenticationFailure("invalid_signature", "signed request is invalid")
        return principal.subject_id
    journey_subject = store.get_journey_subject(entry.target_id)
    if journey_subject != principal.subject_id:
        raise RequestAuthenticationFailure("invalid_signature", "signed request is invalid")
    return journey_subject


def verify_event_integrity(entry: EventSubmissionV2, subject_id: str, public_key_b64: str) -> None:
    """Check C5 commitment and the independent §4 event-context signature."""
    try:
        salt = base64.b64decode(entry.salt, validate=True)
        payload_bytes = canonical(entry.payload.model_dump(mode="json"))
    except (ValueError, TypeError) as exc:
        raise ValueError("payload is not canonical-safe") from exc
    commitment = hashlib.sha256(salt + payload_bytes).hexdigest()
    if commitment != entry.details.commitment:
        raise ValueError("payload commitment does not match")

    statement = {
        "domain": "vuka.event.v2",
        "subject_id": subject_id,
        "actor_id": entry.actor_id,
        "target_type": entry.target_type,
        "target_id": entry.target_id,
        "action": entry.action,
        "source_ts": entry.ts,
        "signer_key_id": entry.details.signer_key_id,
        "counter": entry.details.counter,
        "event_id": entry.details.event_id,
        "commitment": entry.details.commitment,
    }
    try:
        public_key = load_der_public_key(base64.b64decode(public_key_b64, validate=True))
        if not isinstance(public_key, ec.EllipticCurvePublicKey) or public_key.curve.name != "secp256r1":
            raise ValueError("event signer key is not P-256")
        signature = base64.b64decode(entry.details.sig, validate=True)
        public_key.verify(signature, canonical(statement), ec.ECDSA(hashes.SHA256()))
    except (InvalidSignature, ValueError, TypeError, binascii.Error, UnsupportedAlgorithm) as exc:
        raise RequestAuthenticationFailure("invalid_signature", "event signature is invalid") from exc


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"code": code, "message": message})


def create_app(database=None) -> FastAPI:
    store = database or PostgresDatabase()

    @asynccontextmanager
    async def lifespan(_app):
        initialize = getattr(store, "initialize", None)
        if initialize is not None:
            initialize()
        yield

    app = FastAPI(
        title="ANCHOR server slices 1 and 2",
        version="2.0.0",
        lifespan=lifespan,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
    app.state.database = store

    # PROPOSED (26 Sep): lets a browser-hosted dashboard call the read-only
    # public surface (/healthz, /v1/anchor/latest, /v1/anchor/proof/{head})
    # directly. Every other route needs a valid §7/§9 signature, which no
    # amount of permissive CORS lets a browser forge, so this widens *reach*,
    # not *authority*. GET-only, and only origins the operator names — never
    # a wildcard, and never with credentials (there is no cookie/session to
    # leak). Set VUKA_DASHBOARD_ORIGINS to a comma-separated list; unset
    # defaults to common local dev ports so a fresh checkout works with zero
    # configuration, per docs/DASHBOARD-INTEGRATION.md.
    dashboard_origins = [
        origin.strip()
        for origin in os.getenv(
            "VUKA_DASHBOARD_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]
    if dashboard_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=dashboard_origins,
            allow_methods=["GET"],
            allow_headers=["*"],
            allow_credentials=False,
            max_age=600,
        )

    @app.exception_handler(RequestValidationError)
    async def invalid_request(_request: Request, _exc: RequestValidationError):
        return _error_response(400, "invalid_request", "request shape or value is invalid")

    @app.get("/healthz")
    async def healthz():
        healthcheck = getattr(store, "healthcheck", None)
        if healthcheck is None:
            return _error_response(503, "database_unavailable", "database health check is unavailable")
        try:
            healthcheck()
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        return {"status": "ok", "database": "reachable"}

    @app.post("/v1/events", status_code=status.HTTP_201_CREATED)
    async def append_event(entry: EventSubmissionV2, request: Request):
        try:
            principal = verify_request(request, entry, database=store, body=await request.body())
            if (
                principal.genesis_registration
                and os.getenv("VUKA_SIM_ONLY", "1") != "0"
                and not entry.target_id.startswith("sim_")
            ):
                return _error_response(
                    403,
                    "simulation_only",
                    "genesis registration target must use the sim_ prefix while simulation-only mode is enabled",
                )
            subject_id = _subject_id_for(entry, principal, store)
            verify_event_integrity(entry, subject_id, principal.public_key)
        except ValueError:
            return _error_response(400, "invalid_request", "payload commitment is invalid")
        except RequestAuthenticationFailure as exc:
            status_code = 404 if exc.code == "not_found" else 401
            return _error_response(status_code, exc.code, exc.message)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        try:
            received_at = _server_time()
            if principal.genesis_registration:
                stored, _created = store.register_subject(
                    subject_id,
                    entry.model_dump(mode="json", exclude_unset=True),
                    received_at,
                    signer_key_id=principal.signer_key_id,
                    public_key=entry.details.signer_pubkey,
                    nonce=principal.nonce,
                    request_ts=principal.request_ts,
                )
            else:
                stored, _created = store.append(
                    subject_id,
                    entry.model_dump(mode="json", exclude_unset=True),
                    received_at,
                    signer_key_id=principal.signer_key_id,
                    signer_role=principal.signer_role,
                    nonce=principal.nonce,
                    request_ts=principal.request_ts,
                )
        except EventRefused as exc:
            return _error_response(exc.status, exc.code, exc.code)
        except IdempotencyConflict:
            return _error_response(
                409,
                "idempotency_conflict",
                "event_id was already used for different content",
            )
        except SignerKeyRevoked:
            return _error_response(401, "key_revoked", "signer key is revoked")
        except SignerKeyNotFound:
            return _error_response(401, "invalid_signature", "signer key is unknown")
        except (RequestReplay, RequestTimestampExpired):
            return _error_response(401, "invalid_signature", "signed request is invalid or was already used")
        except SubjectNotFound:
            return _error_response(400, "invalid_request", "subject chain is not registered")
        except JourneyBindingConflict:
            return _error_response(400, "invalid_request", "subject is already registered")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")

        return {
            "event_hash": stored["event_hash"],
            "chain_index": stored["details"]["chain_index"],
            "received_at": stored["details"]["received_at"],
        }

    @app.get("/v1/subjects/{id}/export")
    async def export_subject(id: str, request: Request):
        subject_id = id
        try:
            principal = verify_request(request, subject_id=subject_id, database=store, body=await request.body())
        except RequestAuthenticationFailure as exc:
            status_code = 404 if exc.code == "not_found" else 401
            return _error_response(status_code, exc.code, exc.message)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        if principal.signer_role != "device":
            return _error_response(404, "not_found", "subject was not found")
        try:
            store.consume_request_nonce(
                signer_key_id=principal.signer_key_id,
                subject_id=principal.subject_id,
                nonce=principal.nonce,
                request_ts=principal.request_ts,
                now=datetime.now(timezone.utc),
            )
        except SignerKeyRevoked:
            return _error_response(401, "key_revoked", "signer key is revoked")
        except (RequestReplay, RequestTimestampExpired):
            return _error_response(401, "invalid_signature", "signed request is invalid or was already used")
        except (SignerKeyNotFound, SignerSubjectMismatch):
            return _error_response(404, "not_found", "subject was not found")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        subject_export = getattr(store, "subject_export", None)
        if subject_export is None:
            # A store without PIN-authority records can never release a chain.
            return _error_response(403, "pin_authorisation_required", "fresh export PIN authorisation is required")
        try:
            return subject_export(subject_id, datetime.fromisoformat(_server_time().replace("Z", "+00:00")))
        except EventRefused as exc:
            return _error_response(exc.status, exc.code, "fresh export PIN authorisation is required")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")

    @app.post("/v1/devices/recover", status_code=202)
    async def recover_device(request: Request):
        """PROPOSED §9. No §7 request signature: the whole point is the old
        device/key is gone. Rate limited and code-verified inside recovery.py."""
        from server.recovery import RecoveryRefused, has_open_incident, notify_guardians, set_freeze, verify_recovery_code
        try:
            body = json.loads(await request.body())
            if (not isinstance(body, dict) or set(body) != {"recovery_code", "new_device_key"}
                    or not isinstance(body["recovery_code"], str) or not body["recovery_code"]
                    or not isinstance(body["new_device_key"], str) or not body["new_device_key"]):
                raise ValueError("recovery body shape")
            new_spki = base64.b64decode(body["new_device_key"], validate=True)
            new_public_key = load_der_public_key(new_spki)
            if not isinstance(new_public_key, ec.EllipticCurvePublicKey) or new_public_key.curve.name != "secp256r1":
                raise ValueError("new_device_key must be a P-256 SPKI key")
        except (ValueError, TypeError, KeyError, binascii.Error, UnsupportedAlgorithm):
            return _error_response(400, "invalid_request", "recovery body is invalid")
        now = datetime.fromisoformat(_server_time().replace("Z", "+00:00"))
        new_key_id = "dev_" + hashlib.sha256(new_spki).digest()[:8].hex()
        try:
            connection = store._connection()
            try:
                with connection:
                    with connection.cursor() as cur:
                        try:
                            subject_id = verify_recovery_code(cur, body["recovery_code"], now)
                        except RecoveryRefused:
                            return _error_response(401, "invalid_signature", "recovery code is invalid")
                        if has_open_incident(cur, subject_id):
                            return _error_response(400, "recovery_blocked_incident_open", "recovery is blocked during an open incident")
                        cur.execute("SELECT signer_key_id FROM signer_keys WHERE subject_id=%s AND signer_role='device' AND revoked_at IS NULL", (subject_id,))
                        prior = cur.fetchone()
                        if prior is None:
                            return _error_response(400, "invalid_request", "subject has no active device key to recover")
                        prior_key_id = prior[0]
            finally:
                connection.close()
            cur_now = store._connection()
            try:
                with cur_now.cursor() as cur:
                    cur.execute("SELECT chain_index FROM subject_heads WHERE subject_id=%s", (subject_id,))
                    approx_counter = int(cur.fetchone()[0]) + 1
            finally:
                cur_now.close()
            revocation_entry = sign_key_revoked_entry(subject_id, prior_key_id, now, approx_counter)
            store.recover_device_key(subject_id, prior_key_id, new_key_id, body["new_device_key"], _server_time(), revocation_entry)
        except SubjectNotFound:
            return _error_response(404, "not_found", "subject was not found")
        except IdempotencyConflict:
            return _error_response(409, "idempotency_conflict", "recovery was already recorded with a different key")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        try:
            connection = store._connection()
            try:
                with connection:
                    with connection.cursor() as cur:
                        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
                        set_freeze(cur, subject_id, now)
                        notify_guardians(cur, subject_id, "device_recovered", now)
                        append_server(cur, store, subject_id, {"kind": "recovery_performed", "pv": 1}, now)
            finally:
                connection.close()
        except DatabaseUnavailable:
            pass  # the security-critical key swap above already committed; freeze/notify are best-effort here
        return {"receipt_id": str(uuid4()), "state": "accepted"}

    @app.delete("/v1/subjects/{id}/data", status_code=202)
    async def delete_subject_data(id: str, request: Request):
        """PROPOSED §13/§9 F15. Consumes a fresh action=delete pin_authorised
        authorisation (transport: POST /v1/events, same as export/end_journey)."""
        from server.deletion import request_deletion
        from server.recovery import is_frozen, notify_guardians
        subject_id = id
        try:
            principal = verify_request(request, subject_id=subject_id, database=store, body=await request.body())
        except RequestAuthenticationFailure as exc:
            status_code = 404 if exc.code == "not_found" else 401
            return _error_response(status_code, exc.code, exc.message)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        if principal.signer_role != "device":
            return _error_response(404, "not_found", "subject was not found")
        try:
            store.consume_request_nonce(
                signer_key_id=principal.signer_key_id, subject_id=principal.subject_id,
                nonce=principal.nonce, request_ts=principal.request_ts,
                now=datetime.now(timezone.utc),
            )
        except SignerKeyRevoked:
            return _error_response(401, "key_revoked", "signer key is revoked")
        except (RequestReplay, RequestTimestampExpired):
            return _error_response(401, "invalid_signature", "signed request is invalid or was already used")
        except (SignerKeyNotFound, SignerSubjectMismatch):
            return _error_response(404, "not_found", "subject was not found")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        now = datetime.fromisoformat(_server_time().replace("Z", "+00:00"))
        try:
            connection = store._connection()
            try:
                with connection:
                    with connection.cursor() as cur:
                        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
                        if is_frozen(cur, subject_id, now):
                            return _error_response(403, "pin_authorisation_required", "deletion is frozen after a recent recovery")
                        try:
                            mode = require_authorisation(cur, subject_id, "delete", subject_id, now, consume=True)
                        except EventRefused as exc:
                            return _error_response(exc.status, exc.code, exc.code)
                        if mode == "normal":
                            request_deletion(cur, subject_id, now)
                            notify_guardians(cur, subject_id, "deletion_requested", now)
            finally:
                connection.close()
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        # Duress: looks exactly the same, does nothing further (§9). The
        # pin_authorised event itself (mode=duress) already raised the alarm.
        return {"receipt_id": str(uuid4()), "state": "accepted"}

    async def _signed_caller(request, *, role, subject_id=None):
        """§7 request authentication + nonce, for bodyless or small-body routes."""
        body = await request.body()
        try:
            principal = verify_request(request, subject_id=subject_id, database=store, body=body)
        except RequestAuthenticationFailure as exc:
            return None, _error_response(404 if exc.code == "not_found" else 401, exc.code, exc.message)
        except DatabaseUnavailable:
            return None, _error_response(503, "database_unavailable", "database unavailable")
        if principal.signer_role != role:
            return None, _error_response(403, "insufficient_approval", f"a {role} key is required")
        try:
            store.consume_request_nonce(
                signer_key_id=principal.signer_key_id, subject_id=principal.subject_id,
                nonce=principal.nonce, request_ts=principal.request_ts, now=datetime.now(timezone.utc))
        except SignerKeyRevoked:
            return None, _error_response(401, "key_revoked", "signer key is revoked")
        except (RequestReplay, RequestTimestampExpired):
            return None, _error_response(401, "invalid_signature", "signed request is invalid or was already used")
        except (SignerKeyNotFound, SignerSubjectMismatch):
            return None, _error_response(404, "not_found", "subject was not found")
        except DatabaseUnavailable:
            return None, _error_response(503, "database_unavailable", "database unavailable")
        return principal, None

    @app.post("/v1/guardians/invites", status_code=201)
    async def create_guardian_invite(request: Request):
        """PROPOSED: bodyless; consumes a fresh add_guardian pin_authorised (via /v1/events).
        A duress authorisation creates a decoy invite with an identical response (§9)."""
        from server.guardians import create_invite
        from server.recovery import is_frozen
        principal, refused = await _signed_caller(request, role="device")
        if refused:
            return refused
        subject_id = principal.subject_id
        now = datetime.fromisoformat(_server_time().replace("Z", "+00:00"))
        try:
            connection = store._connection()
            try:
                with connection, connection.cursor() as cur:
                    cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
                    if is_frozen(cur, subject_id, now):
                        return _error_response(403, "pin_authorisation_required", "guardian changes are frozen after a recent recovery")
                    try:
                        mode = require_authorisation(cur, subject_id, "add_guardian", subject_id, now, consume=True)
                    except EventRefused as exc:
                        return _error_response(exc.status, exc.code, exc.code)
                    guardian_id, code = create_invite(cur, subject_id, decoy=(mode == "duress"), now=now)
            finally:
                connection.close()
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        return JSONResponse(status_code=201, content={"receipt_id": str(uuid4()), "state": "accepted",
                                                      "guardian_id": guardian_id, "invite_code": code})

    _ACCEPT_FIELDS = (
        "invite_code",
        "guardian_key",
        "fcm_token",
        "popia_s18_acknowledged",
    )

    @app.post("/v1/guardians/accept", status_code=201)
    async def accept_guardian_invite(request: Request):
        """PROPOSED: the request is signed by the guardian_key in the body (proof of
        possession, like the device genesis bootstrap); X-Vuka-Key-Id must equal the id
        derived from that key. Every invite failure returns the same 401 shape."""
        from server.db import _clock_skewed, _consume_nonce
        from server.guardian_effects import record_accept
        from server.guardians import GuardianRefused, activate, check_invite, guardian_actor_id, guardian_key_id
        raw = await request.body()
        try:
            body = json.loads(raw)
            if (not isinstance(body, dict)
                    or set(body) != set(_ACCEPT_FIELDS)
                    or body["popia_s18_acknowledged"] is not True
                    or not all(isinstance(body[k], str) and body[k] for k in ("invite_code", "guardian_key", "fcm_token"))):
                raise ValueError("accept body shape")
            spki = base64.b64decode(body["guardian_key"], validate=True)
            key = load_der_public_key(spki)
            if not isinstance(key, ec.EllipticCurvePublicKey) or key.curve.name != "secp256r1":
                raise ValueError("guardian_key must be P-256 SPKI")
        except (ValueError, TypeError, KeyError, binascii.Error, UnsupportedAlgorithm):
            return _error_response(400, "invalid_request", "accept body is invalid")
        key_id = request.headers.get("X-Vuka-Key-Id")
        ts = request.headers.get("X-Vuka-Ts")
        nonce = request.headers.get("X-Vuka-Nonce")
        signature = request.headers.get("X-Vuka-Signature")
        if not (key_id and ts and nonce and signature) or key_id != guardian_key_id(spki):
            return _error_response(401, "invalid_signature", "signed request is invalid")
        try:
            raw_sig = base64.b64decode(signature, validate=True)
            if len(raw_sig) != 64:
                raise ValueError("signature must be raw r||s")
            statement = {"method": "POST", "path": request.url.path, "ts": ts,
                         "body_sha256": hashlib.sha256(raw).hexdigest(), "nonce": nonce}
            key.verify(encode_dss_signature(int.from_bytes(raw_sig[:32], "big"), int.from_bytes(raw_sig[32:], "big")),
                       canonical(statement), ec.ECDSA(hashes.SHA256()))
            _validate_rfc3339(ts, "X-Vuka-Ts")
        except (InvalidSignature, ValueError, binascii.Error):
            return _error_response(401, "invalid_signature", "signed request is invalid")
        wall = datetime.now(timezone.utc)
        if _clock_skewed(ts, wall):
            return _error_response(401, "invalid_signature", "signed request is invalid or was already used")
        now = datetime.fromisoformat(_server_time().replace("Z", "+00:00"))
        client_ip = request.client.host if request.client else "unknown"
        try:
            connection = store._connection()
            try:
                refused = None
                with connection:
                    with connection.cursor() as cur:
                        try:
                            guardian_id, subject_id, decoy = check_invite(cur, body["invite_code"], client_ip, now)
                        except GuardianRefused as exc:
                            refused = _error_response(exc.status, exc.code, "invite code is invalid")
                if refused is not None:
                    return refused  # the attempt counters above are committed
                with connection:
                    with connection.cursor() as cur:
                        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
                        actor_id = guardian_actor_id(guardian_id)
                        try:
                            activate(cur, guardian_id, signer_key_id=key_id, actor_id=actor_id,
                                     public_key=body["guardian_key"], fcm_token=body["fcm_token"], now=now)
                        except GuardianRefused as exc:
                            return _error_response(exc.status, exc.code, "guardian key is already enrolled")
                        _consume_nonce(cur, key_id, nonce, wall)
                        record_accept(cur, store, subject_id, guardian_id, decoy=decoy, actor_id=actor_id, now=now)
            finally:
                connection.close()
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        return JSONResponse(status_code=201, content={"receipt_id": str(uuid4()), "state": "accepted",
                                                      "guardian_id": guardian_id})

    @app.delete("/v1/guardians/{id}", status_code=202)
    async def remove_guardian(id: str, request: Request):
        """PROPOSED: bodyless; consumes a fresh remove_guardian authorisation whose
        target_id is this guardian id. Duress looks identical and does nothing (§9)."""
        from server.guardian_effects import record_removal_scheduled
        from server.guardians import GuardianRefused, schedule_removal
        from server.recovery import is_frozen
        principal, refused = await _signed_caller(request, role="device")
        if refused:
            return refused
        subject_id = principal.subject_id
        now = datetime.fromisoformat(_server_time().replace("Z", "+00:00"))
        try:
            connection = store._connection()
            try:
                with connection, connection.cursor() as cur:
                    cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
                    if is_frozen(cur, subject_id, now):
                        return _error_response(403, "pin_authorisation_required", "guardian changes are frozen after a recent recovery")
                    try:
                        mode = require_authorisation(cur, subject_id, "remove_guardian", id, now, consume=True)
                    except EventRefused as exc:
                        return _error_response(exc.status, exc.code, exc.code)
                    if mode == "normal":
                        try:
                            schedule_removal(cur, subject_id, id, now)
                        except GuardianRefused as exc:
                            connection.rollback()
                            return _error_response(exc.status, exc.code, exc.code)
                        record_removal_scheduled(cur, store, subject_id, id, now)
            finally:
                connection.close()
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        return {"receipt_id": str(uuid4()), "state": "accepted"}

    @app.put("/v1/guardians/{id}/token", status_code=202)
    async def update_guardian_token(id: str, request: Request):
        """Guardian-signed only (x-vuka-required-signer-role: guardian). Not a chain kind."""
        principal, refused = await _signed_caller(request, role="guardian")
        if refused:
            return refused
        try:
            body = json.loads(await request.body())
            if (not isinstance(body, dict) or set(body) != {"fcm_token"}
                    or not isinstance(body["fcm_token"], str) or not body["fcm_token"]):
                raise ValueError("token body")
        except (ValueError, TypeError):
            return _error_response(400, "invalid_request", "token body is invalid")
        try:
            connection = store._connection()
            try:
                with connection, connection.cursor() as cur:
                    cur.execute("""UPDATE guardians SET fcm_token=%s WHERE guardian_id=%s AND signer_key_id=%s
                                   AND status IN ('active','removal_scheduled') RETURNING 1""",
                                (body["fcm_token"], id, principal.signer_key_id))
                    if cur.fetchone() is None:
                        return _error_response(403, "insufficient_approval", "this key does not belong to that guardian")
            finally:
                connection.close()
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        return {"receipt_id": str(uuid4()), "state": "accepted"}

    stream_interval = float(os.getenv("VUKA_STREAM_POLL_SECONDS", "1"))

    @app.get("/v1/guardians/me/alerts")
    async def guardian_alerts(request: Request):
        """PROPOSED (Lethabo, 25 Sep): the alerts delivered to the calling guardian.
        Signed with the guardian's own key; a decoy sees an empty list, same shape."""
        from contextlib import closing
        from server.guardian_alerts import alerts_for, guardian_for_key
        principal, refused = await _signed_caller(request, role="guardian")
        if refused:
            return refused
        try:
            with closing(store._connection()) as connection, connection, connection.cursor() as cur:
                guardian_id = guardian_for_key(cur, principal.signer_key_id)
                alerts = alerts_for(cur, guardian_id, payload_key=store._payload_key()) if guardian_id else []
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        # The member's subject id lets the guardian sign a guardian_ack for it (G5).
        return {"subject_id": principal.subject_id, "alerts": alerts}

    @app.websocket("/ws/panel")
    async def panel_stream(websocket: WebSocket):
        """PROPOSED public opaque panel (see server/streams.py)."""
        import asyncio
        from server.streams import panel_batch, start_cursor
        await websocket.accept()
        cursor = start_cursor(store)
        try:
            while True:
                messages, cursor = panel_batch(store, cursor)
                for message in messages:
                    await websocket.send_json(message)
                await asyncio.sleep(stream_interval)
        except (WebSocketDisconnect, RuntimeError):
            return

    @app.websocket("/ws/member")
    async def member_stream(websocket: WebSocket):
        """PROPOSED: authenticated by the §7 signed-request headers on the handshake
        (method GET, path /ws/member, empty body) instead of bearerAuth, because no
        bearer issuer exists and the member client is the Android app, which can set
        handshake headers. Device keys only. Opaque, and held per T30."""
        import asyncio
        from types import SimpleNamespace
        from server.streams import member_batch, start_cursor
        shim = SimpleNamespace(headers=websocket.headers, method="GET", url=websocket.url, app=websocket.app)
        try:
            principal = verify_request(shim, database=store, body=b"")
            if principal.signer_role != "device":
                raise RequestAuthenticationFailure("not_found", "subject was not found")
            store.consume_request_nonce(
                signer_key_id=principal.signer_key_id, subject_id=principal.subject_id,
                nonce=principal.nonce, request_ts=principal.request_ts, now=datetime.now(timezone.utc))
        except (RequestAuthenticationFailure, SignerKeyRevoked, RequestReplay, RequestTimestampExpired,
                SignerKeyNotFound, SignerSubjectMismatch, DatabaseUnavailable):
            await websocket.close(code=1008)
            return
        await websocket.accept()
        cursor = start_cursor(store)
        try:
            while True:
                now = datetime.fromisoformat(_server_time().replace("Z", "+00:00"))
                messages, cursor = member_batch(store, principal.subject_id, cursor, now)
                for message in messages:
                    await websocket.send_json(message)
                await asyncio.sleep(stream_interval)
        except (WebSocketDisconnect, RuntimeError):
            return

    @app.get("/v1/anchor/latest")
    async def get_latest_anchor():
        from server.anchor_reads import key_manifest, latest_anchor
        try:
            connection = store._connection()
            try:
                with connection:
                    with connection.cursor() as cur:
                        receipt = latest_anchor(cur)
            finally:
                connection.close()
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        if receipt is None:
            return _error_response(404, "not_found", "no anchor has been confirmed yet")
        return {"receipt": receipt, "key_manifest": key_manifest()}

    @app.get("/v1/anchor/proof/{head_hash}")
    async def get_anchor_proof(head_hash: str):
        import re as _re
        from server.anchor_reads import ProofNotFound, anchor_proof
        if _re.fullmatch(r"[0-9a-f]{64}", head_hash) is None:
            return _error_response(400, "invalid_request", "head must be lowercase 32-byte hex")
        try:
            connection = store._connection()
            try:
                with connection:
                    with connection.cursor() as cur:
                        return anchor_proof(cur, head_hash)
            finally:
                connection.close()
        except ProofNotFound:
            return _error_response(404, "not_found", "no confirmed anchor contains this head")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")

    @app.post("/v1/journeys", status_code=201)
    async def start_journey(request: Request):
        """PROPOSED (25 Sep): server-issued journey_id; bodyless, device-only."""
        body = await request.body()
        try:
            principal = verify_request(request, database=store, body=body)
        except RequestAuthenticationFailure as exc:
            status_code = 404 if exc.code == "not_found" else 401
            return _error_response(status_code, exc.code, exc.message)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        if principal.signer_role != "device":
            return _error_response(404, "not_found", "subject was not found")
        try:
            store.consume_request_nonce(
                signer_key_id=principal.signer_key_id,
                subject_id=principal.subject_id,
                nonce=principal.nonce,
                request_ts=principal.request_ts,
                now=datetime.now(timezone.utc),
            )
        except SignerKeyRevoked:
            return _error_response(401, "key_revoked", "signer key is revoked")
        except (RequestReplay, RequestTimestampExpired):
            return _error_response(401, "invalid_signature", "signed request is invalid or was already used")
        except (SignerKeyNotFound, SignerSubjectMismatch):
            return _error_response(404, "not_found", "subject was not found")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        journey_id = str(uuid4())
        try:
            store.bind_journey(journey_id, principal.subject_id)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        return {"receipt_id": str(uuid4()), "state": "accepted", "journey_id": journey_id}

    @app.post("/v1/journeys/{id}/location", status_code=202)
    async def journey_location(id: str, request: Request):
        """PROPOSED (ADR-0048): a location fix, kept only while guardians are alerted.

        The phone sends fixes for 30 minutes after any check-in opens, after
        either PIN alike, and gets the same 202 whether the fix was kept or
        dropped, so it can never learn whether an alert was raised (T30)."""
        from contextlib import closing
        from server.locations import store_fix, valid_fix
        body = await request.body()
        try:
            subject_id = store.get_journey_subject(id)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        if subject_id is None:
            return _error_response(404, "not_found", "journey was not found")
        try:
            principal = verify_request(request, subject_id=subject_id, database=store, body=body)
        except RequestAuthenticationFailure as exc:
            status_code = 404 if exc.code == "not_found" else 401
            return _error_response(status_code, exc.code, exc.message)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        if principal.signer_role != "device":
            return _error_response(404, "not_found", "journey was not found")
        try:
            fix = json.loads(body)
            if not valid_fix(fix):
                raise ValueError("location shape")
            _validate_rfc3339(fix["ts"], "ts")
        except (ValueError, TypeError):
            return _error_response(400, "invalid_request", "location body is invalid")
        now = datetime.fromisoformat(_server_time().replace("Z", "+00:00"))
        try:
            store.consume_request_nonce(
                signer_key_id=principal.signer_key_id,
                subject_id=principal.subject_id,
                nonce=principal.nonce,
                request_ts=principal.request_ts,
                now=datetime.now(timezone.utc),
            )
            with closing(store._connection()) as connection, connection, connection.cursor() as cur:
                store_fix(cur, subject_id, id, fix, now)
            store.record_heartbeat(subject_id, now)
        except SignerKeyRevoked:
            return _error_response(401, "key_revoked", "signer key is revoked")
        except (RequestReplay, RequestTimestampExpired):
            return _error_response(401, "invalid_signature", "signed request is invalid or was already used")
        except (SignerKeyNotFound, SignerSubjectMismatch):
            return _error_response(404, "not_found", "journey was not found")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        # The same answer whether the fix was kept or dropped.
        return {"receipt_id": str(uuid4()), "state": "accepted"}

    @app.post("/v1/journeys/{id}/heartbeat", status_code=202)
    async def journey_heartbeat(id: str, request: Request):
        """PROPOSED contact clock input: records last contact only, never location."""
        body = await request.body()
        try:
            subject_id = store.get_journey_subject(id)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        if subject_id is None:
            return _error_response(404, "not_found", "journey was not found")
        try:
            principal = verify_request(request, subject_id=subject_id, database=store, body=body)
        except RequestAuthenticationFailure as exc:
            status_code = 404 if exc.code == "not_found" else 401
            return _error_response(status_code, exc.code, exc.message)
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        if principal.signer_role != "device":
            return _error_response(404, "not_found", "journey was not found")
        try:
            heartbeat = json.loads(body)
            if (not isinstance(heartbeat, dict) or set(heartbeat) != {"speed_bucket", "ts"}
                    or not isinstance(heartbeat["speed_bucket"], str) or not heartbeat["speed_bucket"]
                    or not isinstance(heartbeat["ts"], str)):
                raise ValueError("heartbeat shape")
            _validate_rfc3339(heartbeat["ts"], "ts")
        except (ValueError, TypeError):
            return _error_response(400, "invalid_request", "heartbeat body is invalid")
        now = datetime.fromisoformat(_server_time().replace("Z", "+00:00"))
        try:
            store.consume_request_nonce(
                signer_key_id=principal.signer_key_id,
                subject_id=principal.subject_id,
                nonce=principal.nonce,
                request_ts=principal.request_ts,
                now=datetime.now(timezone.utc),
            )
            store.record_heartbeat(subject_id, now)
        except SignerKeyRevoked:
            return _error_response(401, "key_revoked", "signer key is revoked")
        except (RequestReplay, RequestTimestampExpired):
            return _error_response(401, "invalid_signature", "signed request is invalid or was already used")
        except (SignerKeyNotFound, SignerSubjectMismatch):
            return _error_response(404, "not_found", "journey was not found")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        return {"receipt_id": str(uuid4()), "state": "accepted"}

    return app


app = create_app()
