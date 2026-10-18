"""PROPOSED POST /v1/devices/recover; SIMULATED subjects, real PostgreSQL."""
import base64
import json
from datetime import timedelta

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

from server.recovery import provision_recovery_code
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_slice3_events import sim_api  # noqa: F401  (fixture)

CODE = "sim apple banana cherry date elder fig grape honey ice"


def provision(store, subject, now, code=CODE):
    with store._connection() as conn, conn.cursor() as cur:
        provision_recovery_code(cur, subject, code, now)


def recover(client, code, new_key):
    spki = new_key.public_key().public_bytes(Encoding.DER, PublicFormat.SubjectPublicKeyInfo)
    body = json.dumps({"recovery_code": code, "new_device_key": base64.b64encode(spki).decode()})
    return client.post("/v1/devices/recover", content=body, headers={"Content-Type": "application/json"})


def test_correct_code_swaps_the_device_key_and_appends_two_server_events(sim_api):
    store, client, subject, old_key, event, post, now, connect = sim_api
    provision(store, subject, now[0])
    new_key = ec.generate_private_key(ec.SECP256R1())
    response = recover(client, CODE, new_key)
    assert response.status_code == 202, response.json()
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT signer_key_id, revoked_at IS NOT NULL FROM signer_keys WHERE subject_id=%s ORDER BY signer_key_id", (subject,))
        rows = dict(cur.fetchall())
        assert rows[old_key] is True
        active = [k for k, revoked in rows.items() if not revoked]
        assert len(active) == 1 and active[0] != old_key
    entries = store.export(subject)
    kinds = [e["action"] for e in entries]
    assert "key_revoked" in kinds
    revoked_entry = next(e for e in entries if e["action"] == "key_revoked")
    assert revoked_entry["details"]["revoked_key_id"] == old_key
    # genesis(0) + key_revoked(1) + recovery_performed(2), server_event, immediately after
    assert len(entries) == 3
    assert entries[2]["action"] == "server_event"


def test_wrong_code_is_refused_with_a_generic_error(sim_api):
    store, client, subject, old_key, event, post, now, connect = sim_api
    provision(store, subject, now[0])
    response = recover(client, "wrong words entirely here nine ten more words", ec.generate_private_key(ec.SECP256R1()))
    assert response.status_code == 401
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT revoked_at FROM signer_keys WHERE signer_key_id=%s", (old_key,))
        assert cur.fetchone() == (None,)


def test_unknown_handle_gets_the_same_shape_as_a_wrong_code(sim_api):
    store, client, subject, old_key, event, post, now, connect = sim_api
    never_provisioned = recover(client, "zulu yankee xray whiskey victor uniform tango sierra romeo quebec", ec.generate_private_key(ec.SECP256R1()))
    assert never_provisioned.status_code == 401
    assert never_provisioned.json()["code"] == "invalid_signature"


def test_rate_limit_after_five_attempts_in_an_hour(sim_api):
    store, client, subject, old_key, event, post, now, connect = sim_api
    provision(store, subject, now[0])
    for i in range(5):
        wrong = f"sim apple wrong{i} tail words that never match the rest"
        assert recover(client, wrong, ec.generate_private_key(ec.SECP256R1())).status_code == 401
    sixth = recover(client, CODE, ec.generate_private_key(ec.SECP256R1()))
    assert sixth.status_code == 401
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT revoked_at FROM signer_keys WHERE signer_key_id=%s", (old_key,))
        assert cur.fetchone() == (None,)


def test_recovery_is_blocked_during_an_open_incident(sim_api):
    from server.tests.test_slice3_events import signal
    store, client, subject, old_key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    provision(store, subject, now[0])
    response = recover(client, CODE, ec.generate_private_key(ec.SECP256R1()))
    assert response.status_code == 400
    assert response.json()["code"] == "recovery_blocked_incident_open"


def test_successful_recovery_sets_a_24h_freeze_and_records_a_guardian_notice(sim_api):
    store, client, subject, old_key, event, post, now, connect = sim_api
    provision(store, subject, now[0])
    assert recover(client, CODE, ec.generate_private_key(ec.SECP256R1())).status_code == 202
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT frozen_until FROM device_freezes WHERE subject_id=%s", (subject,))
        (frozen_until,) = cur.fetchone()
        assert frozen_until - now[0] >= timedelta(hours=23, minutes=59)
        cur.execute("SELECT kind FROM guardian_notifications WHERE subject_id=%s", (subject,))
        assert cur.fetchone() == ("device_recovered",)


def test_export_is_refused_while_frozen(sim_api):
    from server.recovery import set_freeze
    store, client, subject, key, event, post, now, connect = sim_api
    with connect() as conn, conn.cursor() as cur:
        set_freeze(cur, subject, now[0])
    from server.tests.test_export_hold import authorise_export, get_export
    authorise_export(event, post, key, subject)
    response = get_export(client, subject, key, now)
    assert response.status_code == 403
    assert response.json()["code"] == "pin_authorisation_required"
