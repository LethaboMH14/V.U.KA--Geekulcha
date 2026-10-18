"""PROPOSED guardian_ack via POST /v1/events (supersedes the non-chain /v1/alerts/{id}/ack);
SIMULATED subjects, real PostgreSQL."""
import base64
import uuid

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

from anchor.canonical import canonical
from server.incidents import request_alarm
from server.outbox import claim_due
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_server_slice1 import encode_entry, make_entry, make_genesis_registration, make_signed_headers, sign_event_entry, signed_post
from server.tests.test_slice3_events import sim_api, signal  # noqa: F401  (fixture)


def enroll_guardian(store, subject):
    guardian_key = ec.generate_private_key(ec.SECP256R1())
    spki = base64.b64encode(guardian_key.public_key().public_bytes(Encoding.DER, PublicFormat.SubjectPublicKeyInfo)).decode()
    key_id = "sim_guardian_key_" + uuid.uuid4().hex
    actor_id = "sim_guardian_" + uuid.uuid4().hex
    store.enroll_signer_key(subject, key_id, "guardian", spki, actor_id)
    return guardian_key, key_id, actor_id


def guardian_ack(client, guardian_key, key_id, actor_id, subject, counter, *, incident_id, action, ts):
    entry = make_entry(action="device_event", target_type="subject")
    entry["target_id"] = subject
    entry["actor_id"] = actor_id
    entry["ts"] = ts
    entry["payload"] = {"kind": "guardian_ack", "pv": 1, "incident_id": incident_id, "action": action}
    entry["details"].update(signer_key_id=key_id, signer="guardian", counter=counter)
    sign_event_entry(entry, subject_id=subject, private_key=guardian_key)
    body = encode_entry(entry)
    headers = make_signed_headers("POST", "/v1/events", body, key_id=key_id, private_key=guardian_key, ts=ts)
    headers["Content-Type"] = "application/json"
    return client.post("/v1/events", content=body, headers=headers)


def open_incident_with_pending_bank(sim_api, *, trigger="no_answer"):
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents WHERE subject_id=%s", (subject,))
        incident = cur.fetchone()[0]
        request_alarm(cur, incident, trigger=trigger, now=now[0])
        cur.execute("INSERT INTO sim_guardians VALUES(%s,'sim_guardian')", (subject,))
        rows = claim_due(cur, now=now[0])
    from server.guardian_notifier import SimulatedGuardianNotifier
    from server.guardian_worker import deliver_guardian_alert
    row = next(r for r in rows if r["kind"] == "guardian_alert")
    assert deliver_guardian_alert(connect, SimulatedGuardianNotifier(connect, lambda: now[0]), row, now[0])
    return incident


def test_stand_down_closes_incident_and_cancels_a_pending_no_answer_bank_signal(sim_api):
    store, client, subject, key, *_, now, connect = sim_api
    incident = open_incident_with_pending_bank(sim_api, trigger="no_answer")
    guardian_key, key_id, actor_id = enroll_guardian(store, subject)
    response = guardian_ack(client, guardian_key, key_id, actor_id, subject, 1, incident_id=incident, action="stand_down", ts=now[0].isoformat())
    assert response.status_code == 201
    with store._connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT closed_at IS NOT NULL, close_reason FROM incidents WHERE incident_id=%s", (incident,))
        assert cur.fetchone() == (True, "stand_down")
        cur.execute("SELECT state FROM outbox WHERE kind='bank_signal' AND reference_id=%s", (incident,))
        assert cur.fetchone() == ("done",)


def test_stand_down_cannot_cancel_a_duress_bank_signal(sim_api):
    store, client, subject, key, *_, now, connect = sim_api
    incident = open_incident_with_pending_bank(sim_api, trigger="duress_signal")
    guardian_key, key_id, actor_id = enroll_guardian(store, subject)
    response = guardian_ack(client, guardian_key, key_id, actor_id, subject, 1, incident_id=incident, action="stand_down", ts=now[0].isoformat())
    assert response.status_code == 201
    with store._connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT closed_at IS NOT NULL FROM incidents WHERE incident_id=%s", (incident,))
        assert cur.fetchone() == (True,)
        cur.execute("SELECT state FROM outbox WHERE kind='bank_signal' AND reference_id=%s", (incident,))
        assert cur.fetchone() != ("done",)  # stand_down never marks a duress bank signal done


def test_handling_and_called_10111_are_recorded_without_closing_the_incident(sim_api):
    store, client, subject, key, *_, now, connect = sim_api
    incident = open_incident_with_pending_bank(sim_api, trigger="no_answer")
    guardian_key, key_id, actor_id = enroll_guardian(store, subject)
    for n, action in enumerate(("called_10111", "handling"), start=1):
        r = guardian_ack(client, guardian_key, key_id, actor_id, subject, n, incident_id=incident, action=action, ts=now[0].isoformat())
        assert r.status_code == 201, r.json()
    with store._connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT closed_at FROM incidents WHERE incident_id=%s", (incident,))
        assert cur.fetchone() == (None,)


def test_a_device_key_cannot_submit_a_guardian_ack(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT incident_id::text FROM incidents WHERE subject_id=%s", (subject,))
        incident = cur.fetchone()[0]
    entry = event({"kind": "guardian_ack", "pv": 1, "incident_id": incident, "action": "stand_down"}, subject_target=True)
    assert post(entry).status_code == 401


def test_guardian_cannot_ack_another_subjects_incident(sim_api):
    store, client, subject, key, *_, now, connect = sim_api
    incident = open_incident_with_pending_bank(sim_api, trigger="no_answer")
    other_subject = "sim_other_" + uuid.uuid4().hex
    registration = make_genesis_registration(other_subject)
    reg_resp = signed_post(client, registration, ts=now[0].isoformat())
    assert reg_resp.status_code == 201, reg_resp.json()
    guardian_key, key_id, actor_id = enroll_guardian(store, other_subject)
    response = guardian_ack(client, guardian_key, key_id, actor_id, other_subject, 1, incident_id=incident, action="stand_down", ts=now[0].isoformat())
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_request"

