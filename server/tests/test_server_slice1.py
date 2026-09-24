"""In-memory ANCHOR API tests; all fixtures are synthetic and labelled sim_."""

from __future__ import annotations

import copy
import hashlib
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient

from anchor.canonical import canonical
from server.db import (
    CREATE_SCHEMA_SQL,
    LOCK_HEAD_SQL,
    GENESIS_HASH,
    IdempotencyConflict,
    SubjectNotFound,
    _request_fingerprint,
    _with_server_fields,
)
from server.main import create_app, verify_request


SIM_SUBJECT_ID = "sim_subject_123"
SIM_SOURCE_TIME = "2026-09-24T06:00:00Z"


class MemoryDatabase:
    """Thread-safe test adapter; it does not substitute for PostgreSQL testing."""

    def __init__(self):
        self.rows: dict[str, list[dict]] = {}
        self.fingerprints: dict[str, str] = {}
        self.locks: dict[str, threading.Lock] = {}
        self.lock_guard = threading.Lock()
        self.initialize_called = False
        self.seed_subject(SIM_SUBJECT_ID)

    def initialize(self):
        self.initialize_called = True

    def _lock_for(self, subject_id):
        with self.lock_guard:
            return self.locks.setdefault(subject_id, threading.Lock())

    def seed_subject(self, subject_id):
        sim_event_id = str(uuid.uuid4())
        genesis = {
            "action": "sim_subject_registered",
            "actor_id": "sim_device_1",
            "target_type": "subject",
            "target_id": subject_id,
            "details": {
                "v": 2,
                "signer": "device",
                "signer_key_id": "sim_key_1",
                "counter": 0,
                "event_id": sim_event_id,
                "commitment": "a" * 64,
                "sig": "c2ln",
                "received_at": SIM_SOURCE_TIME,
                "chain_index": 0,
                "signer_pubkey": "cHVi",
            },
            "ts": SIM_SOURCE_TIME,
            "prev_hash": GENESIS_HASH,
        }
        genesis["event_hash"] = hashlib.sha256(canonical(genesis)).hexdigest()
        self.rows[subject_id] = [genesis]
        self._lock_for(subject_id)

    def append(self, subject_id, entry, received_at):
        lock = self.locks.get(subject_id)
        if lock is None:
            raise SubjectNotFound(subject_id)
        fingerprint = _request_fingerprint(entry)
        event_id = entry["details"]["event_id"]
        with lock:
            if event_id in self.fingerprints:
                if self.fingerprints[event_id] != fingerprint:
                    raise IdempotencyConflict(event_id)
                for entries in self.rows.values():
                    for stored in entries:
                        if stored["details"]["event_id"] == event_id:
                            return copy.deepcopy(stored), False
            time.sleep(0.01)
            head = self.rows[subject_id][-1]
            stored = _with_server_fields(
                entry,
                chain_index=head["details"]["chain_index"] + 1,
                prev_hash=head["event_hash"],
                received_at=received_at,
            )
            self.rows[subject_id].append(stored)
            self.fingerprints[event_id] = fingerprint
            return copy.deepcopy(stored), True

    def export(self, subject_id):
        if subject_id not in self.rows:
            raise SubjectNotFound(subject_id)
        return copy.deepcopy(self.rows[subject_id])


def make_entry(*, sim_event_id=None, action="checkin_result", target_type="subject"):
    return {
        "action": f"sim_{action}" if not action.startswith("sim_") else action,
        "actor_id": "sim_device_1",
        "target_type": target_type,
        "target_id": SIM_SUBJECT_ID if target_type == "subject" else "sim_journey_9",
        "details": {
            "v": 2,
            "signer": "device",
            "signer_key_id": "sim_key_1",
            "counter": 1,
            "event_id": sim_event_id or str(uuid.uuid4()),
            "commitment": "b" * 64,
            "sig": "c2ln",
            # These fields are supplied by the contract but overwritten by the server.
            "received_at": SIM_SOURCE_TIME,
            "chain_index": 999,
        },
        "ts": SIM_SOURCE_TIME,
        "prev_hash": "d" * 64,
        "event_hash": "e" * 64,
    }


def test_append_then_export_round_trip_uses_canonical_hash_and_server_position():
    database = MemoryDatabase()
    client = TestClient(create_app(database))

    response = client.post("/v1/events", json=make_entry())

    assert response.status_code == 201
    receipt = response.json()
    assert receipt["chain_index"] == 1
    assert receipt["received_at"] != SIM_SOURCE_TIME
    assert receipt["received_at"].endswith("Z")

    exported = client.get(f"/v1/subjects/{SIM_SUBJECT_ID}/export")
    assert exported.status_code == 200
    record = exported.json()
    assert record["subject_id"] == SIM_SUBJECT_ID
    assert [entry["details"]["chain_index"] for entry in record["entries"]] == [0, 1]
    assert record["entries"][1]["prev_hash"] == record["entries"][0]["event_hash"]
    stored = record["entries"][1]
    digest_input = {key: value for key, value in stored.items() if key != "event_hash"}
    assert hashlib.sha256(canonical(digest_input)).hexdigest() == stored["event_hash"]
    assert record["payloads"] == []
    assert record["salts"] == []
    assert record["proofs"] == []
    assert record["receipts"] == []


def test_identical_event_id_retry_returns_original_receipt():
    client = TestClient(create_app(MemoryDatabase()))
    entry = make_entry()

    first = client.post("/v1/events", json=entry)
    retry = client.post("/v1/events", json=entry)

    assert first.status_code == retry.status_code == 201
    assert retry.json() == first.json()


def test_reused_event_id_with_changed_content_returns_409():
    client = TestClient(create_app(MemoryDatabase()))
    entry = make_entry()
    first = client.post("/v1/events", json=entry)
    changed = copy.deepcopy(entry)
    changed["details"]["commitment"] = "f" * 64

    second = client.post("/v1/events", json=changed)

    assert first.status_code == 201
    assert second.status_code == 409


def test_two_concurrent_appends_to_one_subject_get_distinct_ordered_indices():
    client = TestClient(create_app(MemoryDatabase()))
    payloads = [make_entry(), make_entry()]

    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda body: client.post("/v1/events", json=body), payloads))

    assert [response.status_code for response in responses] == [201, 201]
    assert sorted(response.json()["chain_index"] for response in responses) == [1, 2]
    entries = client.get(f"/v1/subjects/{SIM_SUBJECT_ID}/export").json()["entries"]
    assert [entry["details"]["chain_index"] for entry in entries] == [0, 1, 2]
    assert all(
        entries[index]["prev_hash"] == entries[index - 1]["event_hash"]
        for index in (1, 2)
    )


def test_journey_target_is_refused_without_subject_binding():
    client = TestClient(create_app(MemoryDatabase()))

    response = client.post("/v1/events", json=make_entry(target_type="journey"))

    assert response.status_code == 400
    assert "subject binding" in response.json()["message"]


def test_malformed_hash_and_unknown_fields_are_rejected_before_append():
    client = TestClient(create_app(MemoryDatabase()))
    invalid_hash = make_entry()
    invalid_hash["event_hash"] = "not-a-hash"
    unknown_field = make_entry()
    unknown_field["unexpected"] = "sim_value"

    bad_hash_response = client.post("/v1/events", json=invalid_hash)
    bad_field_response = client.post("/v1/events", json=unknown_field)

    assert bad_hash_response.status_code == 400
    assert bad_field_response.status_code == 400


def test_postgres_append_uses_row_lock_and_unique_chain_position():
    assert "FOR UPDATE" in LOCK_HEAD_SQL.upper()
    assert "PRIMARY KEY (subject_id, chain_index)" in CREATE_SCHEMA_SQL
    assert "UNIQUE (subject_id, chain_index)" in CREATE_SCHEMA_SQL


def test_request_authentication_is_explicitly_a_stub():
    assert "TODO slice 2" in verify_request.__doc__
