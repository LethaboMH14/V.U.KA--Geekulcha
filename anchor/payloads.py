"""Dependency-free validation for the proposed §4b committed payloads."""

from __future__ import annotations

import json
from pathlib import Path
import re
from typing import Any

from anchor.canonical import canonical, canonicalize_json


_SCHEMA_DIR = Path(__file__).resolve().parents[1] / "contracts" / "payloads"
_SCHEMA_FILES = {
    "checkin_opened": "checkin_opened.v1.json",
    "checkin_result": "checkin_result.v1.json",
    "journey_ended": "journey_ended.v1.json",
}
_DIALECT = "https://json-schema.org/draft/2020-12/schema"
_VALIDATION_KEYWORDS = {
    "type",
    "const",
    "enum",
    "pattern",
    "minLength",
    "maxLength",
    "minimum",
    "required",
    "additionalProperties",
    "properties",
}
# These standard JSON Schema annotations carry documentation, not validation
# behaviour. They are explicitly accepted; every other keyword fails closed.
_ANNOTATION_KEYWORDS = {"$schema", "$id", "title", "description", "examples"}
_SUPPORTED_KEYWORDS = _VALIDATION_KEYWORDS | _ANNOTATION_KEYWORDS


class PayloadError(ValueError):
    """A payload is invalid or a schema uses unsupported semantics."""

    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(reason)


def _same_json_value(left: Any, right: Any) -> bool:
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(
            _same_json_value(left[key], right[key]) for key in left
        )
    if isinstance(left, list):
        return len(left) == len(right) and all(
            _same_json_value(a, b) for a, b in zip(left, right)
        )
    return left == right


def _assert_supported_schema(schema: Any, path: str = "$schema") -> None:
    if not isinstance(schema, dict):
        raise PayloadError(f"schema at {path} must be an object")
    unsupported = sorted(set(schema) - _SUPPORTED_KEYWORDS)
    if unsupported:
        raise PayloadError(f"unsupported schema keyword {unsupported[0]} at {path}")
    if "$schema" in schema and schema["$schema"] != _DIALECT:
        raise PayloadError(f"unsupported schema dialect at {path}")
    if "additionalProperties" in schema and schema["additionalProperties"] is not False:
        raise PayloadError(f"unsupported additionalProperties value at {path}")
    properties = schema.get("properties")
    if properties is not None:
        if not isinstance(properties, dict):
            raise PayloadError(f"properties at {path} must be an object")
        for name, child in properties.items():
            if not isinstance(name, str):
                raise PayloadError(f"property name at {path} must be a string")
            _assert_supported_schema(child, f"{path}.properties.{name}")
    required = schema.get("required")
    if required is not None and (
        not isinstance(required, list)
        or any(not isinstance(name, str) for name in required)
    ):
        raise PayloadError(f"required at {path} must be an array of strings")
    for keyword in ("minLength", "maxLength"):
        value = schema.get(keyword)
        if value is not None and (type(value) is not int or value < 0):
            raise PayloadError(f"unsupported {keyword} value at {path}")
    minimum = schema.get("minimum")
    if minimum is not None and (type(minimum) is not int or abs(minimum) > 2**53 - 1):
        raise PayloadError(f"unsupported minimum value at {path}")
    if "pattern" in schema:
        if not isinstance(schema["pattern"], str):
            raise PayloadError(f"pattern at {path} must be a string")
        try:
            re.compile(schema["pattern"])
        except re.error as exc:
            raise PayloadError(f"invalid pattern at {path}") from exc
    if "enum" in schema and not isinstance(schema["enum"], list):
        raise PayloadError(f"enum at {path} must be an array")
    if "type" in schema and (
        not isinstance(schema["type"], str)
        or schema["type"] not in {"object", "string", "integer"}
    ):
        raise PayloadError(f"unsupported type keyword value at {path}")


def _fail(reason: str, path: str) -> None:
    raise PayloadError(f"{reason} at {path}")


def _validate_schema(payload: Any, schema: dict, path: str = "$payload") -> None:
    _assert_supported_schema(schema)

    expected_type = schema.get("type")
    if expected_type == "object" and not isinstance(payload, dict):
        _fail("must be an object", path)
    if expected_type == "string" and not isinstance(payload, str):
        _fail("must be a string", path)
    if expected_type == "integer" and type(payload) is not int:
        _fail("must be an integer", path)

    if "const" in schema and not _same_json_value(payload, schema["const"]):
        _fail(f"must equal {schema['const']!r}", path)
    if "enum" in schema and not any(
        _same_json_value(payload, candidate) for candidate in schema["enum"]
    ):
        _fail("is not an allowed value", path)

    if "pattern" in schema and isinstance(payload, str):
        if re.search(schema["pattern"], payload) is None:
            _fail("does not match the required pattern", path)
    if "minLength" in schema and isinstance(payload, str):
        if len(payload) < schema["minLength"]:
            _fail(f"must contain at least {schema['minLength']} code points", path)
    if "maxLength" in schema and isinstance(payload, str):
        if len(payload) > schema["maxLength"]:
            _fail(f"must contain at most {schema['maxLength']} code points", path)
    if "minimum" in schema and type(payload) is int:
        if payload < schema["minimum"]:
            _fail(f"must be at least {schema['minimum']}", path)

    if "required" in schema:
        if not isinstance(payload, dict):
            _fail("must be an object to satisfy required fields", path)
        for name in schema["required"]:
            if name not in payload:
                _fail(f"is missing required property {name!r}", path)

    if "properties" in schema:
        if not isinstance(payload, dict):
            _fail("must be an object to satisfy properties", path)
        for name, value in payload.items():
            property_schema = schema["properties"].get(name)
            if property_schema is None:
                if schema.get("additionalProperties") is False:
                    _fail(f"contains unsupported property {name!r}", path)
                continue
            _validate_schema(value, property_schema, f"{path}.{name}")

    if schema.get("additionalProperties") is False and "properties" not in schema:
        if not isinstance(payload, dict):
            _fail("must be an object for additionalProperties check", path)
        _fail("additionalProperties false requires properties", path)


def _load_schema(kind: str) -> dict:
    filename = _SCHEMA_FILES.get(kind)
    if filename is None:
        raise PayloadError(f"unsupported payload kind {kind!r}")
    try:
        schema = json.loads((_SCHEMA_DIR / filename).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise PayloadError(f"could not load schema for {kind!r}") from exc
    _assert_supported_schema(schema)
    return schema


def validate_payload(kind: str, payload: Any) -> Any:
    """Validate one parsed payload against its checked-in §4b schema.

    JSON Schema annotations are permitted as metadata. Any unrecognized
    validation keyword or unsupported schema value raises instead of being
    silently ignored.
    """
    schema = _load_schema(kind)
    return validate_schema(payload, schema)


def validate_schema(payload: Any, schema: dict) -> Any:
    """Validate against a supplied schema; exported for fail-closed tests."""
    try:
        canonical(payload)
    except (TypeError, ValueError) as exc:
        raise PayloadError(f"invalid canonical payload: {exc}") from exc
    _validate_schema(payload, schema)
    return payload


def validate_payload_json(kind: str, json_text: str) -> Any:
    """Validate raw JSON, rejecting duplicate keys/floats before parsing it."""
    if not isinstance(json_text, str):
        raise PayloadError("payload JSON must be text")
    try:
        canonicalize_json(json_text)
        payload = json.loads(json_text)
    except (ValueError, json.JSONDecodeError) as exc:
        raise PayloadError(f"invalid canonical payload JSON: {exc}") from exc
    return validate_payload(kind, payload)
