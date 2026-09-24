"""Local-only FastAPI skeleton for ANCHOR server slice 1.

Request authentication is deliberately stubbed and is NOT real authentication.
This app must not be exposed to users until slice 2 replaces verify_request().
Journey-target events are rejected until authenticated subject binding exists.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
import base64
import binascii
from datetime import datetime, timezone
import re
from typing import Annotated, Literal
from uuid import UUID

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, Field, StrictInt, StrictStr, field_validator
from starlette.responses import JSONResponse

from server.db import (
    DatabaseUnavailable,
    IdempotencyConflict,
    PostgresDatabase,
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


class SubjectBindingUnavailable(Exception):
    """A journey event has no trusted subject identity in slice 1."""


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
    entry: EvidenceEntryV2 | None = None,
    *,
    subject_id: str | None = None,
) -> bool:
    """TODO slice 2: replace with signed-request auth; this always allows access.

    This is a development stub only. It does not verify signatures, credentials,
    signer registration, revocation, nonce use, or device identity.
    """
    del request, entry, subject_id
    return True


def _server_time() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _subject_id_for(entry: EvidenceEntryV2) -> str:
    if entry.target_type == "subject":
        return entry.target_id
    # target_id may be a journey ID, while no subject_id or authenticated
    # subject principal is present in this contract/request context.
    raise SubjectBindingUnavailable


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
        title="ANCHOR server slice 1",
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

    @app.post("/v1/events", status_code=status.HTTP_201_CREATED)
    def append_event(entry: EvidenceEntryV2, request: Request):
        if not verify_request(request, entry):
            return _error_response(401, "unauthorized", "authentication required or invalid")

        try:
            subject_id = _subject_id_for(entry)
        except SubjectBindingUnavailable:
            return _error_response(
                400,
                "invalid_request",
                "journey-target events need subject binding, not implemented in slice 1",
            )
        try:
            stored, _created = store.append(
                subject_id,
                entry.model_dump(mode="json", exclude_unset=True),
                _server_time(),
            )
        except IdempotencyConflict:
            return _error_response(
                409,
                "idempotency_conflict",
                "event_id was already used for different content",
            )
        except SubjectNotFound:
            return _error_response(400, "invalid_request", "subject chain is not registered")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")

        return {
            "event_hash": stored["event_hash"],
            "chain_index": stored["details"]["chain_index"],
            "received_at": stored["details"]["received_at"],
        }

    @app.get("/v1/subjects/{id}/export")
    def export_subject(id: str, request: Request):
        subject_id = id
        if not verify_request(request, subject_id=subject_id):
            return _error_response(401, "unauthorized", "authentication required or invalid")
        try:
            entries = store.export(subject_id)
        except SubjectNotFound:
            return _error_response(404, "not_found", "subject chain is not registered")
        except DatabaseUnavailable:
            return _error_response(503, "database_unavailable", "database unavailable")
        return {
            "subject_id": subject_id,
            "entries": entries,
            "payloads": [],
            "salts": [],
            "proofs": [],
            "receipts": [],
        }

    return app


app = create_app()
