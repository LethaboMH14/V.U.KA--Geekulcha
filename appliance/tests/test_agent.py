from __future__ import annotations

import json
import unittest
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

from appliance.agent import (
    EventQueue,
    EventValidationError,
    QueueCorruptionError,
    SyntheticEdgeProducer,
    validate_sim_event,
)


ROOT = Path(__file__).parents[2]
SCHEMA_PATH = ROOT / "contracts" / "events.schema.json"
FIXTURE_PATH = Path(__file__).parent / "fixtures"
SCHEMA = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
REQUIRED_KEYS = set(SCHEMA["required"])


def assert_contract_event(event: dict[str, object]) -> None:
    """Apply the frozen schema's exact-shape constraints without new deps."""

    assert set(event) == REQUIRED_KEYS
    for name, definition in SCHEMA["properties"].items():
        if "const" in definition:
            assert event[name] == definition["const"]
        if definition.get("type") == "string":
            assert isinstance(event[name], str)
            assert len(event[name]) >= definition.get("minLength", 0)
        if definition.get("type") == "boolean":
            assert isinstance(event[name], bool)
        if "enum" in definition:
            assert event[name] in definition["enum"]
    assert event["source_time"].endswith("Z")
    assert event["received_time"].endswith("Z")


class SyntheticEdgeProducerTests(unittest.TestCase):
    def test_constructor_uses_exact_schema_and_sim_prefix(self) -> None:
        with TemporaryDirectory() as directory:
            queue = EventQueue(Path(directory) / "events.jsonl")
            clock_values = iter(
                [
                    datetime(2026, 9, 16, 10, 0, 0, tzinfo=timezone.utc),
                    datetime(2026, 9, 16, 10, 0, 1, tzinfo=timezone.utc),
                ]
            )
            producer = SyntheticEdgeProducer(queue, clock=lambda: next(clock_values))

            event = producer.capture()

            assert_contract_event(event)
            validate_sim_event(event)
            self.assertIs(event["sim_"], True)
            self.assertTrue(str(event["event_id"]).startswith("sim_"))
            self.assertTrue(str(event["tenant"]).startswith("sim_"))

    def test_valid_fixture_is_accepted(self) -> None:
        event = json.loads(
            (FIXTURE_PATH / "sim_valid_event.json").read_text(encoding="utf-8")
        )

        assert_contract_event(event)
        validate_sim_event(event)

    def test_invalid_fixture_is_rejected(self) -> None:
        event = json.loads(
            (FIXTURE_PATH / "sim_invalid_event.json").read_text(encoding="utf-8")
        )

        with self.assertRaises(EventValidationError):
            validate_sim_event(event)

    def test_enqueue_flushes_and_restart_preserves_fifo(self) -> None:
        with TemporaryDirectory() as directory:
            queue_path = Path(directory) / "events.jsonl"
            queue = EventQueue(queue_path)
            producer = SyntheticEdgeProducer(queue)

            first = producer.capture()
            second = producer.capture()
            third = producer.capture()

            self.assertTrue(queue_path.exists())
            restarted = EventQueue(queue_path)
            self.assertEqual(
                [event["event_id"] for event in restarted.pending()],
                [first["event_id"], second["event_id"], third["event_id"]],
            )

    def test_replay_stops_at_first_failed_ack_boundary(self) -> None:
        with TemporaryDirectory() as directory:
            queue = EventQueue(Path(directory) / "events.jsonl")
            producer = SyntheticEdgeProducer(queue)
            events = [producer.capture() for _ in range(3)]
            delivered: list[str] = []

            def consumer(event: dict[str, object]) -> bool:
                delivered.append(str(event["event_id"]))
                return len(delivered) == 1

            self.assertEqual(queue.replay(consumer), 1)
            self.assertEqual(
                delivered, [events[0]["event_id"], events[1]["event_id"]]
            )
            self.assertEqual(
                [event["event_id"] for event in queue.pending()],
                [events[1]["event_id"], events[2]["event_id"]],
            )

    def test_malformed_queue_is_visible_and_unchanged(self) -> None:
        fixture = (FIXTURE_PATH / "sim_queue_malformed.jsonl").read_bytes()
        with TemporaryDirectory() as directory:
            queue_path = Path(directory) / "events.jsonl"
            queue_path.write_bytes(fixture)

            with self.assertRaises(QueueCorruptionError):
                EventQueue(queue_path).pending()

            self.assertEqual(queue_path.read_bytes(), fixture)

    def test_queue_rejects_privileged_or_non_simulated_fields(self) -> None:
        event = json.loads(
            (FIXTURE_PATH / "sim_invalid_event.json").read_text(encoding="utf-8")
        )
        with TemporaryDirectory() as directory:
            with self.assertRaises(EventValidationError):
                EventQueue(Path(directory) / "events.jsonl").enqueue(event)
