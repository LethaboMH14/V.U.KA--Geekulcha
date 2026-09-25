"""PROPOSED guardian lifecycle: invite, accept, decoy, delayed removal, token. Real PostgreSQL."""
import base64
import json
from datetime import timedelta

import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

from server.guardian_effects import fire_guardian_removals
from server.guardian_notifier import SimulatedGuardianNotifier
from server.guardians import guardian_key_id
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_server_slice1 import make_signed_headers
from server.tests.test_slice3_events import pin_payload, signal, sim_api  # noqa: F401  (fixture)


def authorise(event, post, key, target, action, mode="normal"):
    entry = event(pin_payload(key, target, mode=mode, action=action), subject_target=True)
    assert post(entry).status_code == 201, post


def device_call(client, method, path, key, body=b""):
    headers = make_signed_headers(method, path, body, key_id=key)
    if body:
        headers["Content-Type"] = "application/json"
    return client.request(method, path, content=body or None, headers=headers)


def invite(sim_api, mode="normal"):
    store, client, subject, key, event, post, now, connect = sim_api
    authorise(event, post, key, subject, "add_guardian", mode)
    response = device_call(client, "POST", "/v1/guardians/invites", key)
    assert response.status_code == 201, response.json()
    return response.json()


def accept(client, code, guardian_key=None):
    guardian_key = guardian_key or ec.generate_private_key(ec.SECP256R1())
    spki = guardian_key.public_key().public_bytes(Encoding.DER, PublicFormat.SubjectPublicKeyInfo)
    body = json.dumps({"invite_code": code, "guardian_key": base64.b64encode(spki).decode(),
                       "fcm_token": "sim_fcm", "popia_s18_acknowledged": True}).encode()
    headers = make_signed_headers("POST", "/v1/guardians/accept", body, key_id=guardian_key_id(spki), private_key=guardian_key)
    headers["Content-Type"] = "application/json"
    return client.post("/v1/guardians/accept", content=body, headers=headers), guardian_key, guardian_key_id(spki)


def recipients(connect, now, subject):
    return SimulatedGuardianNotifier(connect, lambda: now[0]).recipients(subject)


def add_real_guardian(sim_api):
    store, client, *_ = sim_api
    receipt = invite(sim_api)
    response, gkey, gkid = accept(client, receipt["invite_code"])
    assert response.status_code == 201, response.json()
    return receipt["guardian_id"], gkey, gkid


def test_invite_then_accept_enrols_a_guardian_who_receives_alerts(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    before = len(store.export(subject))
    guardian_id, _gkey, gkid = add_real_guardian(sim_api)
    assert guardian_id in recipients(connect, now, subject)
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT signer_role, revoked_at FROM signer_keys WHERE signer_key_id=%s", (gkid,))
        assert cur.fetchone() == ("guardian", None)
    # pin_authorised + guardian_added (server_event)
    assert len(store.export(subject)) == before + 2


def test_invite_code_is_single_use(sim_api):
    store, client, *_ = sim_api
    receipt = invite(sim_api)
    assert accept(client, receipt["invite_code"])[0].status_code == 201
    assert accept(client, receipt["invite_code"])[0].status_code == 401


def test_invite_needs_a_fresh_add_guardian_authorisation(sim_api):
    store, client, subject, key, *_ = sim_api
    assert device_call(client, "POST", "/v1/guardians/invites", key).status_code == 403


def test_five_wrong_codes_kill_the_invite(sim_api):
    store, client, *_ = sim_api
    receipt = invite(sim_api)
    guardian_id = receipt["guardian_id"]
    for i in range(5):
        assert accept(client, f"{guardian_id}-00000{i}")[0].status_code == 401
    assert accept(client, receipt["invite_code"])[0].status_code == 401


def test_invite_expires_after_ten_minutes(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    receipt = invite(sim_api)
    now[0] += timedelta(minutes=10, seconds=1)
    assert accept(client, receipt["invite_code"])[0].status_code == 401


def test_duress_invite_is_a_decoy_real_guardians_are_told(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    real_id, *_ = add_real_guardian(sim_api)
    decoy = invite(sim_api, mode="duress")
    normal_shape = invite(sim_api)
    assert set(decoy) == set(normal_shape)  # the phone cannot tell them apart
    response, *_ = accept(client, decoy["invite_code"])
    assert response.status_code == 201
    assert decoy["guardian_id"] not in recipients(connect, now, subject)
    assert real_id in recipients(connect, now, subject)
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT kind FROM guardian_notifications WHERE subject_id=%s ORDER BY id", (subject,))
        assert ("guardian_added_under_duress",) in cur.fetchall()


def test_normal_removal_is_delayed_24h_then_revokes_the_key(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    a_id, _ka, a_kid = add_real_guardian(sim_api)
    b_id, *_ = add_real_guardian(sim_api)
    authorise(event, post, key, a_id, "remove_guardian")
    assert device_call(client, "DELETE", f"/v1/guardians/{a_id}", key).status_code == 202
    assert a_id in recipients(connect, now, subject)  # still alerted until the delay passes
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        assert fire_guardian_removals(cur, store, subject, now[0] + timedelta(hours=23, minutes=59)) == []
        assert fire_guardian_removals(cur, store, subject, now[0] + timedelta(hours=24)) == [a_id]
        cur.execute("SELECT revoked_at IS NOT NULL FROM signer_keys WHERE signer_key_id=%s", (a_kid,))
        assert cur.fetchone() == (True,)
    assert a_id not in recipients(connect, now, subject) and b_id in recipients(connect, now, subject)


def test_last_real_guardian_cannot_be_removed_and_a_decoy_is_no_replacement(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    only_id, *_ = add_real_guardian(sim_api)
    decoy = invite(sim_api, mode="duress")
    assert accept(client, decoy["invite_code"])[0].status_code == 201
    authorise(event, post, key, only_id, "remove_guardian")
    response = device_call(client, "DELETE", f"/v1/guardians/{only_id}", key)
    assert response.status_code == 409 and response.json()["code"] == "last_guardian"


def test_duress_removal_looks_done_and_does_nothing(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    a_id, *_ = add_real_guardian(sim_api)
    add_real_guardian(sim_api)
    authorise(event, post, key, a_id, "remove_guardian", mode="duress")
    assert device_call(client, "DELETE", f"/v1/guardians/{a_id}", key).status_code == 202
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT status FROM guardians WHERE guardian_id=%s", (a_id,))
        assert cur.fetchone() == ("active",)


def test_removal_is_deferred_while_an_incident_is_open(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    a_id, *_ = add_real_guardian(sim_api)
    add_real_guardian(sim_api)
    authorise(event, post, key, a_id, "remove_guardian")
    assert device_call(client, "DELETE", f"/v1/guardians/{a_id}", key).status_code == 202
    assert post(signal(event)).status_code == 201  # opens an incident
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        assert fire_guardian_removals(cur, store, subject, now[0] + timedelta(hours=25)) == []


def test_token_update_needs_that_guardians_own_key(sim_api):
    store, client, subject, key, *_ = sim_api
    g_id, gkey, gkid = add_real_guardian(sim_api)
    body = json.dumps({"fcm_token": "sim_fcm_new"}).encode()
    headers = make_signed_headers("PUT", f"/v1/guardians/{g_id}/token", body, key_id=gkid, private_key=gkey)
    headers["Content-Type"] = "application/json"
    assert client.put(f"/v1/guardians/{g_id}/token", content=body, headers=headers).status_code == 202
    assert device_call(client, "PUT", f"/v1/guardians/{g_id}/token", key, body).status_code == 403


def test_one_guardian_cannot_change_another_guardians_token(sim_api):
    store, client, subject, key, *_ = sim_api
    a_id, *_ = add_real_guardian(sim_api)
    _b_id, bkey, bkid = add_real_guardian(sim_api)
    body = json.dumps({"fcm_token": "sim_hijack"}).encode()
    headers = make_signed_headers("PUT", f"/v1/guardians/{a_id}/token", body, key_id=bkid, private_key=bkey)
    headers["Content-Type"] = "application/json"
    assert client.put(f"/v1/guardians/{a_id}/token", content=body, headers=headers).status_code == 403
