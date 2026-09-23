"""Minimal synthetic KHAYA edge producer for WBS 3.2.

This module deliberately produces only the frozen v0.1.0 event envelope.  It
does not read sensors, classify people, control a deterrent, or contact a
server.  The queue is a small at-least-once JSONL spool for the offline-replay
acceptance test; it is not a claim about power-loss or concurrent-writer
durability.
"""

from __future__ import annotations

import itertools
import json
import os
import re
import tempfile
from collections.abc import Callable, Mapping
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import TypeAlias


Event: TypeAlias = dict[str, object]
Clock: TypeAlias = Callable[[], datetime]
IdFactory: TypeAlias = Callable[[], str]
Consumer: TypeAlias = Callable[[Event], bool]

SCHEMA_VERSION = "0.1.0"
SCHEMA_PATH = Path(__file__).resolve().parents[1] / "contracts" / "events.schema.json"
UTC_TIMESTAMP = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$"
)


class EventValidationError(ValueError):
    """Raised when an event cannot be admitted to the synthetic queue."""


class QueueCorruptionError(ValueError):
    """Raised when a JSONL queue cannot be read without guessing."""


def _utc_timestamp(value: datetime) -> str:
    if value.tzinfo is None or value.utcoffset() is None:
        raise EventValidationError("timestamps must be timezone-aware")
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


@lru_cache(maxsize=1)
def _load_schema() -> Mapping[str, object]:
    try:
        value = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise EventValidationError(f"cannot load event schema {SCHEMA_PATH}") from exc
    if not isinstance(value, dict):
        raise EventValidationError("event schema must be a JSON object")
    return value


def validate_sim_event(
    event: Mapping[str, object], *, schema: Mapping[str, object] | None = None
) -> None:
    """Validate against the checked-in schema, without duplicating its shape."""

    active_schema = schema or _load_schema()
    required_value = active_schema.get("required")
    properties_value = active_schema.get("properties")
    if not isinstance(required_value, list) or not isinstance(properties_value, dict):
        raise EventValidationError("event schema must define required and properties")
    required = set(required_value)
    properties = properties_value
    if not all(isinstance(name, str) for name in required):
        raise EventValidationError("event schema required names must be strings")
    if set(event) != required:
        missing = sorted(required - set(event))
        extra = sorted(set(event) - required)
        raise EventValidationError(
            f"event fields differ from v0.1.0; missing={missing}, extra={extra}"
        )
    for field, definition_value in properties.items():
        if not isinstance(definition_value, dict) or field not in event:
            continue
        value = event[field]
        expected_type = definition_value.get("type")
        if expected_type == "string":
            if not isinstance(value, str):
                raise EventValidationError(f"{field} must be a string")
            minimum = definition_value.get("minLength", 0)
            if isinstance(minimum, int) and len(value) < minimum:
                raise EventValidationError(f"{field} is shorter than the schema minimum")
        elif expected_type == "boolean" and not isinstance(value, bool):
            raise EventValidationError(f"{field} must be a Boolean")
        if "const" in definition_value and value != definition_value["const"]:
            raise EventValidationError(f"{field} does not match its schema constant")
        allowed = definition_value.get("enum")
        if isinstance(allowed, list) and value not in allowed:
            raise EventValidationError(f"{field} is not an allowed schema value")
        if definition_value.get("format") == "date-time" and (
            not isinstance(value, str) or UTC_TIMESTAMP.fullmatch(value) is None
        ):
            raise EventValidationError(f"{field} must be a UTC timestamp ending in Z")

    if "sim_" not in required:
        raise EventValidationError(
            "the approved schema has no required sim_ marker; synthetic output is refused"
        )
    if event["sim_"] is not True:
        raise EventValidationError("synthetic events must set sim_ to true")
    for field in ("event_id", "tenant"):
        if field in event and not str(event[field]).startswith("sim_"):
            raise EventValidationError(f"{field} must be visibly synthetic")


def make_sim_event(
    *,
    event_id: str,
    tenant: str,
    source_time: datetime,
    received_time: datetime,
    freshness: str = "fresh",
) -> Event:
    """Construct one deterministic event using the schema's required fields."""

    values: dict[str, object] = {
        "version": SCHEMA_VERSION,
        "event_id": event_id,
        "tenant": tenant,
        "source_time": _utc_timestamp(source_time),
        "received_time": _utc_timestamp(received_time),
        "sim_": True,
        "freshness": freshness,
    }
    schema = _load_schema()
    required_value = schema.get("required")
    if not isinstance(required_value, list) or not all(
        isinstance(name, str) for name in required_value
    ):
        raise EventValidationError("event schema required names must be strings")
    unsupported_required = set(required_value) - set(values)
    if unsupported_required:
        raise EventValidationError(
            "producer has no value for new required schema fields: "
            f"{sorted(unsupported_required)}"
        )
    event = {name: values[name] for name in required_value}
    validate_sim_event(event)
    return event


def _canonical_line(event: Mapping[str, object]) -> str:
    return json.dumps(event, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


class EventQueue:
    """FIFO JSONL queue with visible corruption and acknowledgement boundaries."""

    def __init__(self, path: Path) -> None:
        self.path = Path(path)

    def _read(self) -> list[Event]:
        if not self.path.exists():
            return []
        try:
            text = self.path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            raise QueueCorruptionError(f"cannot read queue {self.path}") from exc

        events: list[Event] = []
        for line_number, line in enumerate(text.splitlines(), start=1):
            if not line.strip():
                raise QueueCorruptionError(f"blank queue line {line_number}")
            try:
                value = json.loads(line)
            except json.JSONDecodeError as exc:
                raise QueueCorruptionError(
                    f"malformed JSON on queue line {line_number}"
                ) from exc
            if not isinstance(value, dict):
                raise QueueCorruptionError(f"queue line {line_number} is not an object")
            try:
                validate_sim_event(value)
            except EventValidationError as exc:
                raise QueueCorruptionError(
                    f"invalid event on queue line {line_number}"
                ) from exc
            events.append(dict(value))
        return events

    def pending(self) -> list[Event]:
        """Return all queued events, failing closed on malformed content."""

        return self._read()

    def enqueue(self, event: Mapping[str, object]) -> None:
        """Append and flush one event before reporting it as queued."""

        validate_sim_event(event)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        line = _canonical_line(event) + "\n"
        try:
            with self.path.open("a", encoding="utf-8", newline="\n") as queue_file:
                queue_file.write(line)
                queue_file.flush()
                os.fsync(queue_file.fileno())
        except OSError as exc:
            raise OSError(f"could not append event to {self.path}") from exc

    def _replace(self, events: list[Event]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                newline="\n",
                dir=self.path.parent,
                prefix=f".{self.path.name}.",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                for event in events:
                    temporary_file.write(_canonical_line(event) + "\n")
                temporary_file.flush()
                os.fsync(temporary_file.fileno())
            os.replace(temporary_path, self.path)
            temporary_path = None
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)

    def replay(self, consumer: Consumer) -> int:
        """Replay FIFO and remove only events acknowledged by ``consumer``."""

        acknowledged = 0
        while True:
            events = self._read()
            if not events:
                return acknowledged
            if not consumer(events[0]):
                return acknowledged
            self._replace(events[1:])
            acknowledged += 1


class SyntheticEdgeProducer:
    """Injectable producer used by deterministic fixtures and queue tests."""

    def __init__(
        self,
        queue: EventQueue,
        *,
        tenant: str = "sim_tenant_001",
        clock: Clock | None = None,
        id_factory: IdFactory | None = None,
    ) -> None:
        self.queue = queue
        self.tenant = tenant
        self._clock = clock or (lambda: datetime.now(timezone.utc))
        sequence = itertools.count(1)
        self._id_factory = id_factory or (
            lambda: f"sim_event_{next(sequence):06d}"
        )

    def capture(self, *, freshness: str = "fresh") -> Event:
        """Create and queue one synthetic observation."""

        source_time = self._clock()
        received_time = self._clock()
        event = make_sim_event(
            event_id=self._id_factory(),
            tenant=self.tenant,
            source_time=source_time,
            received_time=received_time,
            freshness=freshness,
        )
        self.queue.enqueue(event)
        return event
