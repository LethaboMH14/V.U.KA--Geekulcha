"""In-memory ANCHOR API tests; all fixtures are synthetic and labelled sim_."""

from __future__ import annotations

import copy
import base64
import hashlib
import json
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
from fastapi.testclient import TestClient
from pydantic import ValidationError

from anchor.canonical import canonical
from server.db import NONCE_TTL, RequestReplay, RequestTimestampExpired
from server.db import (
    CREATE_SCHEMA_SQL,
    LOCK_HEAD_SQL,
    GENESIS_HASH,
    DatabaseUnavailable,
    IdempotencyConflict,
    SubjectNotFound,
    _request_fingerprint,
    _with_server_fields,
)
from server.main import EventSubmissionV2, EvidenceEntryV2, create_app


SIM_SUBJECT_ID = "sim_subject_123"
SIM_SOURCE_TIME = "2026-09-24T06:00:00Z"
SIM_PRIVATE_KEY = ec.derive_private_key(1, ec.SECP256R1())
SIM_PUBLIC_KEY = base64.b64encode(
    SIM_PRIVATE_KEY.public_key().public_bytes(
        serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
).decode("ascii")


class MemoryDatabase:
    """Thread-safe test adapter; it does not substitute for PostgreSQL testing."""

    def __init__(self):
        self.rows: dict[str, list[dict]] = {}
        self.fingerprints: dict[str, str] = {}
        self.locks: dict[str, threading.Lock] = {}
        self.lock_guard = threading.Lock()
        self.auth_lock = threading.RLock()
        self.signer_keys: dict[str, dict] = {}
        self.journey_subjects: dict[str, str] = {}
        self.used_nonces: dict[tuple[str, str], datetime] = {}
        self.used_counters: set[tuple[str, int]] = set()
        self.initialize_called = False
        self.seed_subject(SIM_SUBJECT_ID)
        self.enroll_signer_key(SIM_SUBJECT_ID, "sim_key_1", "device", SIM_PUBLIC_KEY, "sim_device_1")

    def initialize(self):
        self.initialize_called = True

    def healthcheck(self):
        return None

    def _lock_for(self, subject_id):
        with self.lock_guard:
            return self.locks.setdefault(subject_id, threading.Lock())

    def _purge_expired_nonces(self, now):
        self.used_nonces = {key: expiry for key, expiry in self.used_nonces.items() if expiry > now}

    @staticmethod
    def _stored_chain_entry(entry, *, chain_index, prev_hash, received_at, clock_skew=False):
        # Match the Postgres row projection: transport payload/salt do not live
        # in the EvidenceEntryV2 chain record.
        chain_fields = {key: value for key, value in entry.items() if key not in {"payload", "salt"}}
        return _with_server_fields(
            chain_fields,
            chain_index=chain_index,
            prev_hash=prev_hash,
            received_at=received_at,
            clock_skew=clock_skew,
        )

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
                "signer_pubkey": SIM_PUBLIC_KEY,
            },
            "ts": SIM_SOURCE_TIME,
            "prev_hash": GENESIS_HASH,
        }
        genesis["event_hash"] = hashlib.sha256(canonical(genesis)).hexdigest()
        self.rows[subject_id] = [genesis]
        self._lock_for(subject_id)

    def get_signer_key(self, signer_key_id):
        with self.auth_lock:
            key = self.signer_keys.get(signer_key_id)
            return copy.deepcopy(key) if key is not None else None

    def enroll_signer_key(self, subject_id, signer_key_id, signer_role, public_key, actor_id):
        if signer_role not in {"device", "guardian"}:
            raise ValueError("signer_role must be device or guardian")
        with self.auth_lock:
            if signer_key_id in self.signer_keys:
                raise ValueError("signer key id already exists")
            if signer_role == "device" and any(
                key["subject_id"] == subject_id
                and key["signer_role"] == "device"
                and key["revoked_at"] is None
                for key in self.signer_keys.values()
            ):
                raise ValueError("subject already has an active device key")
            self.signer_keys[signer_key_id] = {
                "subject_id": subject_id,
                "actor_id": actor_id,
                "signer_key_id": signer_key_id,
                "signer_role": signer_role,
                "public_key": public_key,
                "revoked_at": None,
                "revoked_reason": None,
            }

    def register_subject(self, subject_id, entry, received_at, *, signer_key_id, public_key, nonce, request_ts):
        with self.auth_lock:
            if subject_id in self.rows or signer_key_id in self.signer_keys:
                raise ValueError("subject or signer key already exists")
            now = _parse_test_time(received_at)
            self._purge_expired_nonces(now)
            if abs((_parse_test_time(request_ts) - now).total_seconds()) > 120:
                raise RequestTimestampExpired(request_ts)
            stored = self._stored_chain_entry(
                entry, chain_index=0, prev_hash=GENESIS_HASH, received_at=received_at
            )
            self.rows[subject_id] = [stored]
            self._lock_for(subject_id)
            self.signer_keys[signer_key_id] = {
                "subject_id": subject_id, "actor_id": entry["actor_id"],
                "signer_key_id": signer_key_id,
                "signer_role": "device", "public_key": public_key,
                "revoked_at": None, "revoked_reason": None,
            }
            self.used_nonces[(signer_key_id, nonce)] = now + NONCE_TTL
            self.used_counters.add((signer_key_id, entry["details"]["counter"]))
            return copy.deepcopy(stored), True

    def bind_journey(self, journey_id, subject_id):
        if subject_id not in self.rows:
            raise SubjectNotFound(subject_id)
        existing = self.journey_subjects.get(journey_id)
        if existing is not None and existing != subject_id:
            raise ValueError("journey is already bound to another subject")
        self.journey_subjects[journey_id] = subject_id

    def get_journey_subject(self, journey_id):
        return self.journey_subjects.get(journey_id)

    def recover_device_key(self, subject_id, prior_key_id, new_key_id, new_public_key, received_at):
        with self.auth_lock:
            prior = self.signer_keys.get(prior_key_id)
            if prior is None:
                raise ValueError("prior signer key is unknown")
            if prior["subject_id"] != subject_id or prior["signer_role"] != "device" or prior["revoked_at"] is not None:
                raise ValueError("prior signer key is not an active device key for this subject")
            if new_key_id in self.signer_keys or new_key_id == prior_key_id:
                raise ValueError("new signer key id already exists")
            prior["revoked_at"] = received_at
            prior["revoked_reason"] = "recovery"
            self.signer_keys[new_key_id] = {
                "subject_id": subject_id,
                "actor_id": prior["actor_id"],
                "signer_key_id": new_key_id,
                "signer_role": "device",
                "public_key": new_public_key,
                "revoked_at": None,
                "revoked_reason": None,
            }
            return {"action": "key_revoked", "details": {"revoked_key_id": prior_key_id}}

    def consume_request_nonce(self, *, signer_key_id, subject_id, nonce, request_ts, now):
        with self.auth_lock:
            self._purge_expired_nonces(now)
            key = self.signer_keys.get(signer_key_id)
            if key is None:
                raise ValueError("signer key is unknown")
            if key["revoked_at"] is not None:
                raise ValueError("signer key is revoked")
            if key["subject_id"] != subject_id:
                raise ValueError("signer subject mismatch")
            if abs((_parse_test_time(request_ts) - now).total_seconds()) > 120:
                raise RequestTimestampExpired(request_ts)
            nonce_key = (signer_key_id, nonce)
            expiry = self.used_nonces.get(nonce_key)
            if expiry is not None and expiry > now:
                raise RequestReplay(nonce)
            self.used_nonces[nonce_key] = now + NONCE_TTL

    def append(self, subject_id, entry, received_at, *, signer_key_id, signer_role, nonce, request_ts):
        lock = self.locks.get(subject_id)
        if lock is None:
            raise SubjectNotFound(subject_id)
        fingerprint = _request_fingerprint(entry)
        event_id = entry["details"]["event_id"]
        now = _parse_test_time(received_at)
        with self.auth_lock, lock:
            self._purge_expired_nonces(now)
            key = self.signer_keys.get(signer_key_id)
            if key is None:
                raise ValueError("signer key is unknown")
            if key["revoked_at"] is not None:
                raise SignerKeyRevoked(signer_key_id)
            if (key["subject_id"] != subject_id or key["signer_role"] != signer_role
                    or key["actor_id"] != entry["actor_id"]):
                raise SignerSubjectMismatch(signer_key_id)
            if event_id in self.fingerprints:
                if self.fingerprints[event_id] != fingerprint:
                    raise IdempotencyConflict(event_id)
                for entries in self.rows.values():
                    for stored in entries:
                            if stored["details"]["event_id"] == event_id:
                                return copy.deepcopy(stored), False
            skewed = abs((_parse_test_time(request_ts) - now).total_seconds()) > 120
            skew_exempt = entry["action"].removeprefix("sim_") in {
                "checkin_opened", "checkin_result", "pin_authorised"
            }
            if skewed and not skew_exempt:
                raise RequestTimestampExpired(request_ts)
            nonce_key = (signer_key_id, nonce)
            nonce_expiry = self.used_nonces.get(nonce_key)
            if nonce_expiry is not None and nonce_expiry > now:
                raise RequestReplay(nonce)
            counter_key = (signer_key_id, entry["details"]["counter"])
            if counter_key in self.used_counters:
                raise RequestReplay("signer counter was already used")
            self.used_nonces[nonce_key] = now + NONCE_TTL
            self.used_counters.add(counter_key)
            time.sleep(0.01)
            head = self.rows[subject_id][-1]
            stored = self._stored_chain_entry(
                entry,
                chain_index=head["details"]["chain_index"] + 1,
                prev_hash=head["event_hash"],
                received_at=received_at,
                clock_skew=skewed and skew_exempt,
            )
            self.rows[subject_id].append(stored)
            self.fingerprints[event_id] = fingerprint
            return copy.deepcopy(stored), True

    def export(self, subject_id):
        if subject_id not in self.rows:
            raise SubjectNotFound(subject_id)
        return copy.deepcopy(self.rows[subject_id])


def make_entry(*, sim_event_id=None, action="checkin_result", target_type="subject"):
    entry = {
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
        },
        "ts": SIM_SOURCE_TIME,
        "payload": {"kind": "sim_test_event", "pv": 1, "value": "sim_value"},
        "salt": base64.b64encode(bytes(range(16))).decode("ascii"),
    }
    sign_event_entry(entry)
    return entry


def sign_event_entry(entry, *, subject_id=SIM_SUBJECT_ID, private_key=SIM_PRIVATE_KEY):
    details = entry["details"]
    salt = base64.b64decode(entry["salt"], validate=True)
    details["commitment"] = hashlib.sha256(salt + canonical(entry["payload"])).hexdigest()
    statement = {
        "domain": "vuka.event.v2", "subject_id": subject_id,
        "actor_id": entry["actor_id"], "target_type": entry["target_type"],
        "target_id": entry["target_id"], "action": entry["action"],
        "source_ts": entry["ts"], "signer_key_id": details["signer_key_id"],
        "counter": details["counter"], "event_id": details["event_id"],
        "commitment": details["commitment"],
    }
    details["sig"] = base64.b64encode(
        private_key.sign(canonical(statement), ec.ECDSA(hashes.SHA256()))
    ).decode("ascii")


def _parse_test_time(value):
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.utcoffset() is None:
        raise ValueError("timestamp must include timezone")
    return parsed.astimezone(timezone.utc)


def make_signed_headers(method, path, body, *, nonce=None, ts=None, private_key=SIM_PRIVATE_KEY, key_id="sim_key_1"):
    ts = ts or datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    nonce = nonce or f"sim_nonce_{uuid.uuid4().hex}"
    statement = {
        "method": method.upper(),
        "path": path,
        "ts": ts,
        "body_sha256": hashlib.sha256(body).hexdigest(),
        "nonce": nonce,
    }
    der = private_key.sign(canonical(statement), ec.ECDSA(hashes.SHA256()))
    r, s = decode_dss_signature(der)
    raw = r.to_bytes(32, "big") + s.to_bytes(32, "big")
    return {
        "X-Vuka-Key-Id": key_id,
        "X-Vuka-Ts": ts,
        "X-Vuka-Nonce": nonce,
        "X-Vuka-Signature": base64.b64encode(raw).decode("ascii"),
    }


def encode_entry(entry):
    return json.dumps(entry, ensure_ascii=True, separators=(",", ":")).encode("utf-8")


def signed_post(client, entry, *, nonce=None, ts=None, private_key=SIM_PRIVATE_KEY):
    body = encode_entry(entry)
    headers = make_signed_headers(
        "POST", "/v1/events", body, nonce=nonce, ts=ts, private_key=private_key,
        key_id=entry["details"]["signer_key_id"],
    )
    headers["Content-Type"] = "application/json"
    return client.post("/v1/events", content=body, headers=headers)


def signed_export(client, subject_id=SIM_SUBJECT_ID, *, nonce=None, ts=None, private_key=SIM_PRIVATE_KEY, key_id="sim_key_1"):
    path = f"/v1/subjects/{subject_id}/export"
    body = b""
    headers = make_signed_headers("GET", path, body, nonce=nonce, ts=ts, private_key=private_key)
    headers["X-Vuka-Key-Id"] = key_id
    return client.request("GET", path, content=body, headers=headers)


def test_event_submission_separates_client_body_from_stored_entry_shape():
    submission = make_entry()

    parsed = EventSubmissionV2.model_validate(submission)

    assert parsed.action == submission["action"]
    assert parsed.payload.kind == "sim_test_event"
    assert parsed.salt == submission["salt"]
    assert not hasattr(parsed, "prev_hash")
    assert not hasattr(parsed.details, "received_at")
    try:
        EvidenceEntryV2.model_validate(submission)
    except ValidationError:
        pass
    else:
        raise AssertionError("client submission was accepted as a stored EvidenceEntryV2")


def test_healthz_requires_a_reachable_database():
    database = MemoryDatabase()
    client = TestClient(create_app(database))
    assert client.get("/healthz").json() == {"status": "ok", "database": "reachable"}
    database.healthcheck = lambda: (_ for _ in ()).throw(DatabaseUnavailable("down"))
    response = client.get("/healthz")
    assert response.status_code == 503


def test_append_uses_canonical_hash_and_export_fails_closed_without_pin():
    database = MemoryDatabase()
    client = TestClient(create_app(database))

    response = signed_post(client, make_entry())

    assert response.status_code == 201
    receipt = response.json()
    assert receipt["chain_index"] == 1
    assert receipt["received_at"] != SIM_SOURCE_TIME
    assert receipt["received_at"].endswith("Z")

    exported = signed_export(client)
    assert exported.status_code == 403
    assert exported.json()["code"] == "pin_authorisation_required"
    entries = database.export(SIM_SUBJECT_ID)
    assert [entry["details"]["chain_index"] for entry in entries] == [0, 1]
    assert entries[1]["prev_hash"] == entries[0]["event_hash"]
    stored = entries[1]
    digest_input = {key: value for key, value in stored.items() if key != "event_hash"}
    assert hashlib.sha256(canonical(digest_input)).hexdigest() == stored["event_hash"]


def test_identical_event_id_retry_returns_original_receipt():
    client = TestClient(create_app(MemoryDatabase()))
    entry = make_entry()

    first = signed_post(client, entry, nonce="sim_nonce_retry")
    retry = signed_post(client, entry, nonce="sim_nonce_retry")

    assert first.status_code == retry.status_code == 201
    assert retry.json() == first.json()


def test_reused_event_id_with_changed_content_returns_409():
    client = TestClient(create_app(MemoryDatabase()))
    entry = make_entry()
    first = signed_post(client, entry, nonce="sim_nonce_conflict")
    changed = copy.deepcopy(entry)
    changed["payload"]["value"] = "sim_changed"
    sign_event_entry(changed)

    second = signed_post(client, changed, nonce="sim_nonce_conflict")

    assert first.status_code == 201
    assert second.status_code == 409


def test_two_concurrent_appends_to_one_subject_get_distinct_ordered_indices():
    client = TestClient(create_app(MemoryDatabase()))
    payloads = [make_entry(), make_entry()]
    payloads[1]["details"]["counter"] = 2
    sign_event_entry(payloads[1])

    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda body: signed_post(client, body), payloads))

    assert [response.status_code for response in responses] == [201, 201]
    assert sorted(response.json()["chain_index"] for response in responses) == [1, 2]
    entries = client.app.state.database.export(SIM_SUBJECT_ID)
    assert [entry["details"]["chain_index"] for entry in entries] == [0, 1, 2]
    assert all(
        entries[index]["prev_hash"] == entries[index - 1]["event_hash"]
        for index in (1, 2)
    )


def test_journey_target_is_refused_without_subject_binding():
    client = TestClient(create_app(MemoryDatabase()))

    response = signed_post(client, make_entry(target_type="journey"))

    assert response.status_code == 401
    assert response.json()["code"] == "invalid_signature"


def test_client_submission_rejects_server_owned_chain_fields_and_unknown_fields():
    client = TestClient(create_app(MemoryDatabase()))
    client_supplied_event_hash = make_entry()
    client_supplied_event_hash["event_hash"] = "e" * 64
    client_supplied_prev_hash = make_entry()
    client_supplied_prev_hash["prev_hash"] = "d" * 64
    client_supplied_receipt_fields = make_entry()
    client_supplied_receipt_fields["details"]["received_at"] = SIM_SOURCE_TIME
    client_supplied_receipt_fields["details"]["chain_index"] = 999
    unknown_field = make_entry()
    unknown_field["unexpected"] = "sim_value"

    bad_hash_response = client.post("/v1/events", json=client_supplied_event_hash)
    bad_prev_hash_response = client.post("/v1/events", json=client_supplied_prev_hash)
    bad_receipt_fields_response = client.post("/v1/events", json=client_supplied_receipt_fields)
    bad_field_response = client.post("/v1/events", json=unknown_field)

    assert bad_hash_response.status_code == 400
    assert bad_prev_hash_response.status_code == 400
    assert bad_receipt_fields_response.status_code == 400
    assert bad_field_response.status_code == 400


def test_event_integrity_rejects_changed_payload_and_context_even_with_valid_http_signature():
    client = TestClient(create_app(MemoryDatabase()))
    changed_payload = make_entry()
    changed_payload["payload"]["value"] = "sim_tampered"
    changed_action = make_entry()
    changed_action["action"] = "sim_other_action"

    commitment_response = signed_post(client, changed_payload)
    signature_response = signed_post(client, changed_action)

    assert commitment_response.status_code == 400
    assert commitment_response.json()["code"] == "invalid_request"
    assert signature_response.status_code == 401
    assert signature_response.json()["code"] == "invalid_signature"
    assert len(client.app.state.database.export(SIM_SUBJECT_ID)) == 1


def test_enrolled_key_cannot_claim_another_actor_even_with_both_valid_signatures():
    database = MemoryDatabase()
    client = TestClient(create_app(database))
    entry = make_entry()
    entry["actor_id"] = "sim_other_actor"
    sign_event_entry(entry)

    response = signed_post(client, entry)

    assert response.status_code == 401
    assert response.json()["code"] == "invalid_signature"
    assert len(database.export(SIM_SUBJECT_ID)) == 1


def test_postgres_row_projection_hash_and_retry_fingerprint_match_the_submission():
    submission = make_entry()
    stored = _with_server_fields(
        submission, chain_index=1, prev_hash="a" * 64, received_at=SIM_SOURCE_TIME
    )

    assert "payload" not in stored and "salt" not in stored
    expected = {key: value for key, value in stored.items() if key != "event_hash"}
    assert stored["event_hash"] == hashlib.sha256(canonical(expected)).hexdigest()
    assert _request_fingerprint(submission) == _request_fingerprint(stored)


def test_postgres_append_uses_row_lock_and_unique_chain_position():
    assert "FOR UPDATE" in LOCK_HEAD_SQL.upper()
    assert "FROM subject_heads" in LOCK_HEAD_SQL
    assert "PRIMARY KEY (subject_id, chain_index)" in CREATE_SCHEMA_SQL
    assert "UNIQUE (subject_id, chain_index)" in CREATE_SCHEMA_SQL
    assert "signer_keys_one_active_device_per_subject" in CREATE_SCHEMA_SQL
    assert "CHECK (signer_role IN ('device', 'guardian'))" in CREATE_SCHEMA_SQL


def test_signed_request_helper_binds_body_bytes():
    body = encode_entry(make_entry())
    headers = make_signed_headers("POST", "/v1/events", body)
    assert headers["X-Vuka-Signature"]
    assert hashlib.sha256(body).hexdigest() in canonical({
        "method": "POST", "path": "/v1/events", "ts": headers["X-Vuka-Ts"],
        "body_sha256": hashlib.sha256(body).hexdigest(), "nonce": headers["X-Vuka-Nonce"]
    }).decode("ascii")


def test_missing_and_invalid_request_signatures_are_rejected():
    client = TestClient(create_app(MemoryDatabase()))
    entry = make_entry()

    missing = client.post("/v1/events", json=entry)
    body = encode_entry(entry)
    headers = make_signed_headers("POST", "/v1/events", body)
    headers["X-Vuka-Signature"] = base64.b64encode(b"x" * 64).decode("ascii")
    headers["Content-Type"] = "application/json"
    invalid = client.post("/v1/events", content=body, headers=headers)

    assert missing.status_code == 401
    assert missing.json()["code"] == "authentication_required"
    assert invalid.status_code == 401
    assert invalid.json()["code"] == "invalid_signature"


def test_genesis_registration_authenticates_and_enrolls_first_device_key_atomically():
    database = MemoryDatabase()
    database.rows.pop(SIM_SUBJECT_ID)
    database.signer_keys.pop("sim_key_1")
    subject_id = "sim_subject_genesis"
    entry = make_entry(action="registration")
    entry["target_id"] = subject_id
    entry["details"]["signer_key_id"] = "sim_genesis_key"
    entry["details"]["signer_pubkey"] = SIM_PUBLIC_KEY
    entry["details"]["counter"] = 0
    sign_event_entry(entry, subject_id=subject_id)
    client = TestClient(create_app(database))

    response = signed_post(client, entry)

    assert response.status_code == 201
    assert database.signer_keys["sim_genesis_key"]["subject_id"] == subject_id
    assert database.rows[subject_id][0]["details"]["chain_index"] == 0
    assert database.rows[subject_id][0]["prev_hash"] == GENESIS_HASH


def test_unknown_and_revoked_signer_keys_use_decided_auth_codes():
    database = MemoryDatabase()
    client = TestClient(create_app(database))
    unknown_entry = make_entry()
    unknown_entry["details"]["signer_key_id"] = "sim_unknown_key"
    unknown_body = encode_entry(unknown_entry)
    unknown_headers = make_signed_headers("POST", "/v1/events", unknown_body)
    unknown_headers["X-Vuka-Key-Id"] = "sim_unknown_key"
    unknown_headers["Content-Type"] = "application/json"
    unknown = client.post("/v1/events", content=unknown_body, headers=unknown_headers)

    database.signer_keys["sim_key_1"]["revoked_at"] = "2026-09-24T00:00:00Z"
    revoked = signed_post(client, make_entry())

    assert unknown.status_code == 401
    assert unknown.json()["code"] == "invalid_signature"
    assert revoked.status_code == 401
    assert revoked.json()["code"] == "key_revoked"


def test_timestamp_expiry_and_safety_event_skew_exemption():
    client = TestClient(create_app(MemoryDatabase()))
    old_ts = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(timespec="seconds").replace("+00:00", "Z")

    expired = signed_post(client, make_entry(action="ordinary_event"), ts=old_ts)
    safe = signed_post(client, make_entry(action="checkin_result"), ts=old_ts)

    assert expired.status_code == 401
    assert expired.json()["code"] == "invalid_signature"
    assert safe.status_code == 201
    stored = client.app.state.database.export(SIM_SUBJECT_ID)[-1]
    assert stored["details"]["clock_skew"] is True


def test_replayed_nonce_and_counter_are_rejected_but_identical_event_retry_survives():
    client = TestClient(create_app(MemoryDatabase()))
    same = make_entry()
    first = signed_post(client, same, nonce="sim_nonce_exact_retry")
    retry = signed_post(client, same, nonce="sim_nonce_exact_retry")
    replay = signed_post(client, make_entry(), nonce="sim_nonce_exact_retry")
    duplicate_counter_entry = make_entry()
    duplicate_counter_entry["details"]["counter"] = 1
    duplicate_counter = signed_post(client, duplicate_counter_entry, nonce="sim_nonce_new_counter_request")

    assert first.status_code == retry.status_code == 201
    assert retry.json() == first.json()
    assert replay.status_code == 401
    assert replay.json()["code"] == "invalid_signature"
    assert duplicate_counter.status_code == 401
    assert duplicate_counter.json()["code"] == "invalid_signature"


def test_journey_subject_binding_accepts_owner_and_refuses_another_subject():
    database = MemoryDatabase()
    database.seed_subject("sim_subject_other")
    database.bind_journey("sim_journey_owner", SIM_SUBJECT_ID)
    database.bind_journey("sim_journey_other", "sim_subject_other")
    client = TestClient(create_app(database))

    owned = make_entry(target_type="journey")
    owned["target_id"] = "sim_journey_owner"
    sign_event_entry(owned)
    accepted = signed_post(client, owned)
    cross_subject = make_entry(target_type="journey")
    cross_subject["target_id"] = "sim_journey_other"
    sign_event_entry(cross_subject)
    refused = signed_post(client, cross_subject)

    assert accepted.status_code == 201
    assert refused.status_code == 401
    assert refused.json()["code"] == "invalid_signature"
    assert database.rows[SIM_SUBJECT_ID][-1]["target_id"] == "sim_journey_owner"


def test_export_requires_the_matching_device_key_and_a_fresh_nonce():
    database = MemoryDatabase()
    database.seed_subject("sim_subject_other")
    database.enroll_signer_key("sim_subject_other", "sim_other_key", "device", SIM_PUBLIC_KEY, "sim_device_other")
    client = TestClient(create_app(database))

    wrong_subject = signed_export(client, "sim_subject_other", key_id="sim_key_1")
    good = signed_export(client)
    replay = signed_export(client, nonce="sim_nonce_export_replay")
    replay_again = signed_export(client, nonce="sim_nonce_export_replay")

    assert wrong_subject.status_code == 404
    assert good.status_code == 403
    assert good.json()["code"] == "pin_authorisation_required"
    assert replay.status_code == 403
    assert replay_again.status_code == 401
    assert replay_again.json()["code"] == "invalid_signature"


def test_key_revoked_event_requires_revoked_key_id_and_registry_never_accepts_server_role():
    base = make_entry(action="key_revoked")
    del base["payload"]
    del base["salt"]
    base["details"]["received_at"] = SIM_SOURCE_TIME
    base["details"]["chain_index"] = 1
    base["prev_hash"] = "d" * 64
    base["event_hash"] = "e" * 64
    base["details"]["signer"] = "server"
    base["details"]["signer_key_id"] = "sim_server_key"
    base["details"]["revoked_key_id"] = "sim_old_key"
    base["action"] = "key_revoked"

    valid = EvidenceEntryV2.model_validate(base)
    assert valid.details.revoked_key_id == "sim_old_key"
    del base["details"]["revoked_key_id"]
    try:
        EvidenceEntryV2.model_validate(base)
    except ValueError as exc:
        assert "revoked_key_id" in str(exc)
    else:
        raise AssertionError("key_revoked entry without revoked_key_id was accepted")

    database = MemoryDatabase()
    try:
        database.enroll_signer_key("sim_subject_123", "sim_server_key", "server", SIM_PUBLIC_KEY, "sim_server_1")
    except ValueError as exc:
        assert "device or guardian" in str(exc)
    else:
        raise AssertionError("server key was enrolled in signer_keys")


def test_recovery_replaces_device_key_and_emits_revocation_reference():
    database = MemoryDatabase()
    replacement = ec.derive_private_key(2, ec.SECP256R1()).public_key().public_bytes(
        serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    replacement_b64 = base64.b64encode(replacement).decode("ascii")

    event = database.recover_device_key(
        SIM_SUBJECT_ID,
        "sim_key_1",
        "sim_key_2",
        replacement_b64,
        "2026-09-24T12:00:00Z",
    )

    assert event["action"] == "key_revoked"
    assert event["details"] == {"revoked_key_id": "sim_key_1"}
    assert database.signer_keys["sim_key_1"]["revoked_at"] == "2026-09-24T12:00:00Z"
    assert database.signer_keys["sim_key_2"]["revoked_at"] is None
