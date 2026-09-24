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
import re
from typing import Annotated, Any, Literal
from uuid import UUID

from cryptography.exceptions import InvalidSignature
from cryptography.exceptions import UnsupportedAlgorithm
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature
from cryptography.hazmat.primitives.serialization import load_der_public_key
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, Field, StrictInt, StrictStr, field_validator, model_validator
from starlette.responses import JSONResponse

from anchor.canonical import canonical
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
        # ADR-0041 requires a fresh export PIN authorisation and an incident
        # prefix check. Neither exists in slices 1/2, so no chain is released.
        return _error_response(403, "pin_authorisation_required", "fresh export PIN authorisation is required")

    return app


app = create_app()
