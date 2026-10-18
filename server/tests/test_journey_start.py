"""PROPOSED POST /v1/journeys (server-issued journey_id); SIMULATED subjects, real PostgreSQL."""
import re
import uuid

from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_server_slice1 import make_signed_headers
from server.tests.test_slice3_events import sim_api  # noqa: F401  (fixture)

UUID4 = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")


def start_journey(client, key):
    headers = make_signed_headers("POST", "/v1/journeys", b"", key_id=key)
    return client.post("/v1/journeys", content=b"", headers=headers)


def test_journey_id_is_server_issued_and_distinct(sim_api):
    store, client, subject, key, *_ = sim_api
    a = start_journey(client, key)
    b = start_journey(client, key)
    assert a.status_code == 201 and b.status_code == 201
    ja, jb = a.json()["journey_id"], b.json()["journey_id"]
    assert UUID4.match(ja) and UUID4.match(jb) and ja != jb
    assert store.get_journey_subject(ja) == subject
    assert store.get_journey_subject(jb) == subject


def test_created_journey_accepts_a_journey_targeted_event(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    journey_id = start_journey(client, key).json()["journey_id"]
    detection = event({"kind": "signal_detected", "pv": 1, "journey_id": journey_id}, journey=journey_id)
    assert post(detection).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT journey_id FROM incident_signals s JOIN signal_deadlines t USING(signal_event_id)")
        assert cur.fetchall() == [(journey_id,)]


def test_start_journey_needs_a_registered_device_key(sim_api):
    store, client, subject, key, *_ = sim_api
    from cryptography.hazmat.primitives.asymmetric import ec
    unknown_key = ec.generate_private_key(ec.SECP256R1())
    headers = make_signed_headers("POST", "/v1/journeys", b"", key_id="sim_key_unknown", private_key=unknown_key)
    response = client.post("/v1/journeys", content=b"", headers=headers)
    assert response.status_code == 401
    assert response.json()["code"] == "invalid_signature"


def test_guardian_key_cannot_start_a_journey(sim_api):
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
    store, client, subject, key, *_ = sim_api
    guardian_key = ec.generate_private_key(ec.SECP256R1())
    guardian_spki = guardian_key.public_key().public_bytes(Encoding.DER, PublicFormat.SubjectPublicKeyInfo)
    import base64
    store.enroll_signer_key(subject, "sim_guardian_key_1", "guardian", base64.b64encode(guardian_spki).decode(), "sim_guardian_1")
    headers = make_signed_headers("POST", "/v1/journeys", b"", key_id="sim_guardian_key_1", private_key=guardian_key)
    response = client.post("/v1/journeys", content=b"", headers=headers)
    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_replayed_nonce_is_refused_and_does_not_create_a_second_journey(sim_api):
    store, client, subject, key, *_ = sim_api
    from server.tests.test_server_slice1 import make_signed_headers as headers_fn
    headers = headers_fn("POST", "/v1/journeys", b"", key_id=key, nonce="sim_fixed_nonce")
    first = client.post("/v1/journeys", content=b"", headers=headers)
    second = client.post("/v1/journeys", content=b"", headers=headers)
    assert first.status_code == 201
    assert second.status_code == 401
