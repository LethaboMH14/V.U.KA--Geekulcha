"""SIMULATED subjects; real PostgreSQL transactions and cryptographic checks."""
import base64
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta

import pytest
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec, ed25519
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, PrivateFormat, NoEncryption
from fastapi.testclient import TestClient

from anchor.canonical import canonical
from anchor.verify import first_broken_index
from server.db import PostgresDatabase
from server.event_effects import fire_due_for_subject
from server.main import create_app
from server.tests.sim_postgres import sim_database, SIM_RECEIVED
from server.tests.test_server_slice1 import make_entry, make_genesis_registration, sign_event_entry, signed_post, SIM_PRIVATE_KEY


@pytest.fixture
def sim_api(sim_database, monkeypatch):
    now = [SIM_RECEIVED]
    monkeypatch.setattr("server.main._server_time", lambda: now[0].isoformat())
    sim_server_key = ed25519.Ed25519PrivateKey.generate()
    monkeypatch.setenv("VUKA_SERVER_ED25519_KEY_B64", base64.b64encode(sim_server_key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())).decode())
    monkeypatch.setattr("server.server_signing._pinned_public_key", lambda: sim_server_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw))
    store = PostgresDatabase("sim_url", connect=lambda *_: sim_database(), payload_key_b64=base64.b64encode(bytes(range(32))).decode())
    subject = "sim_subject_" + uuid.uuid4().hex
    registration = make_genesis_registration(subject)
    key = registration["details"]["signer_key_id"]
    with TestClient(create_app(store)) as client:
        assert signed_post(client, registration, ts=now[0].isoformat()).status_code == 201
        store.bind_journey("sim_journey_a", subject)
        store.bind_journey("sim_journey_b", subject)
        counter = [0]
        def event(payload, *, journey="sim_journey_a", subject_target=False):
            counter[0] += 1
            entry = make_entry(action="device_event", target_type="subject" if subject_target else "journey")
            entry["target_id"] = subject if subject_target else journey
            entry["payload"] = payload
            entry["details"].update(signer_key_id=key, counter=counter[0])
            sign_event_entry(entry, subject_id=subject)
            return entry
        def post(entry):
            return signed_post(client, entry, ts=now[0].isoformat())
        yield store, client, subject, key, event, post, now, sim_database


def pin_payload(key, target, *, mode="normal", action="end_journey", nonce=None):
    payload = {"kind": "pin_authorised", "pv": 1, "action": action, "target_id": target,
               "mode": mode, "nonce": nonce or "sim_pin_" + uuid.uuid4().hex, "signer_key_id": key}
    statement = {k: payload[k] for k in ("action", "target_id", "mode", "nonce")}
    payload["sig"] = base64.b64encode(SIM_PRIVATE_KEY.sign(canonical(statement), ec.ECDSA(hashes.SHA256()))).decode()
    return payload


def signal(event, journey="sim_journey_a"):
    return event({"kind": "signal_detected", "pv": 1, "journey_id": journey}, journey=journey)


def opened(event, detection, checkin=None):
    return event({"kind": "checkin_opened", "pv": 1, "journey_id": detection["target_id"],
                  "signal_event_id": detection["details"]["event_id"], "checkin_id": checkin or str(uuid.uuid4()), "window_s": 20}, journey=detection["target_id"])


def test_proposed_missing_opened_retry_late_duress_still_alerts(sim_api):
    store, _, subject, _, event, post, now, connect = sim_api
    detection = signal(event)
    assert post(detection).status_code == 201
    checkin = str(uuid.uuid4())
    result = event({"kind": "checkin_result", "pv": 1, "checkin_id": checkin, "result": "duress_pin", "attempt": 1})
    rejected = post(result)
    assert rejected.status_code == 409
    assert rejected.json()["code"] == "checkin_unknown"
    assert len(store.export(subject)) == 2
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM checkins")
        assert cur.fetchone()[0] == 0
    now[0] += timedelta(seconds=91)
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        fire_due_for_subject(cur, store, subject, now[0])
    assert post(opened(event, detection, checkin)).status_code == 201
    assert post(result).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT bank_trigger,has_duress FROM incidents")
        assert cur.fetchall() == [("duress_signal", True)]
        cur.execute("SELECT outcome FROM checkins")
        assert cur.fetchall() == [("no_answer",)]
        cur.execute("SELECT not_before FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == now[0]
    assert first_broken_index(store.export(subject)) is None


def test_pin_signature_replay_ownership_and_expiry(sim_api):
    store, _, subject, key, event, post, now, connect = sim_api
    good = pin_payload(key, "sim_journey_a")
    forged = {**good, "mode": "duress"}
    bad = post(event(forged))
    assert bad.status_code == 401
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM pin_authorisations")
        assert cur.fetchone()[0] == 0
    assert post(event(pin_payload(key, "sim_not_owned"))).status_code == 403
    # "delete" is itself a supported action as of the deletion route (server/deletion.py);
    # this checks an action still outside that set is refused.
    assert post(event(pin_payload(key, subject, action="add_guardian"), subject_target=True)).json()["code"] == "action_not_supported"
    receipt = post(event(good))
    assert receipt.status_code == 201, receipt.text
    assert set(receipt.json()) == {"event_hash", "chain_index", "received_at"}
    assert post(event(good)).status_code == 401
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT expires_at FROM pin_authorisations")
        assert cur.fetchone()[0] == now[0] + timedelta(seconds=120)
    now[0] += timedelta(seconds=121)
    ended = event({"kind": "journey_ended", "pv": 1, "journey_id": "sim_journey_a"})
    assert post(ended).json()["code"] == "pin_authorisation_required"


def test_proposed_two_concurrent_ends_consume_one_authorisation(sim_api):
    store, _, subject, key, event, post, now, connect = sim_api
    assert post(event(pin_payload(key, "sim_journey_a"))).status_code == 201
    requests = [event({"kind": "journey_ended", "pv": 1, "journey_id": "sim_journey_a"}) for _ in range(2)]
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(post, requests))
    assert sorted(r.status_code for r in responses) == [201, 403]
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM pin_authorisations WHERE consumed_at IS NOT NULL")
        assert cur.fetchone()[0] == 1
    assert len(store.export(subject)) == 3


def test_proposed_cross_journey_detections_share_incident_bank_once(sim_api):
    _, _, _, _, event, post, _, connect = sim_api
    for journey in ("sim_journey_a", "sim_journey_a", "sim_journey_b"):
        detection = signal(event, journey)
        assert post(detection).status_code == 201
        opening = opened(event, detection)
        assert post(opening).status_code == 201
        assert post(event({"kind": "checkin_result", "pv": 1, "checkin_id": opening["payload"]["checkin_id"], "result": "duress_pin", "attempt": 1}, journey=journey)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM incidents")
        assert cur.fetchone()[0] == 1
        cur.execute("SELECT count(*) FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == 1


def test_proposed_incident_index_blocks_duplicate_open_rows_and_signal_race(sim_api):
    from psycopg2 import IntegrityError
    _, _, subject, _, event, post, _, connect = sim_api
    requests = [signal(event), signal(event, "sim_journey_b")]
    with ThreadPoolExecutor(max_workers=2) as pool:
        assert [r.status_code for r in pool.map(post, requests)] == [201, 201]
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM incidents WHERE subject_id=%s AND closed_at IS NULL", (subject,))
        assert cur.fetchone()[0] == 1
    with pytest.raises(IntegrityError):
        with connect() as conn, conn.cursor() as cur:
            cur.execute("INSERT INTO incidents(incident_id,subject_id,pre_incident_head,opened_at,last_signal_at) SELECT %s,subject_id,pre_incident_head,opened_at,last_signal_at FROM incidents WHERE subject_id=%s", (str(uuid.uuid4()), subject))


def test_proposed_signal_after_close_opens_new_incident_and_last_signal_moves(sim_api):
    from server.event_effects import close_incident
    store, _, subject, _, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    now[0] += timedelta(hours=5)
    assert post(signal(event, "sim_journey_b")).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT last_signal_at,incident_id::text FROM incidents")
        last_signal, incident_id = cur.fetchone()
        assert last_signal == now[0]
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        assert close_incident(cur, store, subject, incident_id, "stand_down", now[0])
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*),count(*) FILTER(WHERE closed_at IS NULL) FROM incidents")
        assert cur.fetchone() == (2, 1)


def test_proposed_other_journey_duress_prevents_member_ended_closure(sim_api):
    _, _, _, key, event, post, _, connect = sim_api
    detection = signal(event)
    assert post(detection).status_code == 201
    opening = opened(event, detection)
    assert post(opening).status_code == 201
    assert post(event({"kind": "checkin_result", "pv": 1, "checkin_id": opening["payload"]["checkin_id"], "result": "duress_pin", "attempt": 1})).status_code == 201
    assert post(event(pin_payload(key, "sim_journey_b"), journey="sim_journey_b")).status_code == 201
    assert post(event({"kind": "journey_ended", "pv": 1, "journey_id": "sim_journey_b"}, journey="sim_journey_b")).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT closed_at FROM incidents")
        assert cur.fetchone() == (None,)


def test_end_authorisation_exact_target_and_mode_receipt_shape(sim_api):
    _, _, subject, key, event, post, _, connect = sim_api
    normal = post(event(pin_payload(key, subject, action="export"), subject_target=True))
    duress = post(event(pin_payload(key, subject, action="export", mode="duress"), subject_target=True))
    assert normal.status_code == duress.status_code == 201
    assert {k: type(v) for k,v in normal.json().items()} == {k: type(v) for k,v in duress.json().items()}
    assert "mode" not in str(normal.json()) and "mode" not in str(duress.json())
    assert post(event(pin_payload(key, "sim_journey_a"))).status_code == 201
    wrong_target = event({"kind": "journey_ended", "pv": 1, "journey_id": "sim_journey_b"}, journey="sim_journey_b")
    assert post(wrong_target).status_code == 403
