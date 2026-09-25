"""PROPOSED GET /v1/guardians/me/alerts: SIMULATED delivery, real PostgreSQL."""
from server.guardian_notifier import SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.incidents import request_alarm
from server.outbox import claim_due
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_guardian_lifecycle import accept, add_real_guardian, device_call, invite
from server.tests.test_server_slice1 import make_signed_headers
from server.tests.test_slice3_events import signal, sim_api  # noqa: F401  (fixture)


def raise_and_deliver(sim_api, trigger="no_answer"):
    _, _, subject, _, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents")
        incident = cur.fetchone()[0]
        request_alarm(cur, incident, trigger=trigger, now=now[0])
        rows = [r for r in claim_due(cur, now=now[0]) if r["kind"] == "guardian_alert"]
    notifier = SimulatedGuardianNotifier(connect, lambda: now[0])
    for row in rows:
        assert deliver_guardian_alert(connect, notifier, row, now[0])
    return incident


def alerts(client, gkey, gkid):
    headers = make_signed_headers("GET", "/v1/guardians/me/alerts", b"", key_id=gkid, private_key=gkey)
    return client.get("/v1/guardians/me/alerts", headers=headers)


def test_a_guardian_reads_the_alert_delivered_to_them(sim_api):
    store, client, *_ = sim_api
    _gid, gkey, gkid = add_real_guardian(sim_api)
    store, client, subject, *_ = sim_api
    assert alerts(client, gkey, gkid).json() == {"subject_id": subject, "alerts": []}
    incident = raise_and_deliver(sim_api)
    body = alerts(client, gkey, gkid).json()
    assert [a["incident_id"] for a in body["alerts"]] == [incident]
    assert body["alerts"][0]["trigger"] == "no_answer"
    assert body["alerts"][0]["closed_at"] is None
    # Nothing from the member's payloads rides along.
    assert set(body["alerts"][0]) == {"incident_id", "trigger", "delivered_at", "opened_at", "closed_at", "close_reason"}


def test_a_decoy_guardian_sees_the_same_empty_shape(sim_api):
    store, client, *_ = sim_api
    add_real_guardian(sim_api)
    decoy = invite(sim_api, mode="duress")
    response, dkey, dkid = accept(client, decoy["invite_code"])
    assert response.status_code == 201
    raise_and_deliver(sim_api)
    assert alerts(client, dkey, dkid).json() == {"subject_id": sim_api[2], "alerts": []}


def test_a_device_key_cannot_read_guardian_alerts(sim_api):
    store, client, subject, key, *_ = sim_api
    assert device_call(client, "GET", "/v1/guardians/me/alerts", key).status_code == 403


def test_the_worker_step_delivers_and_completes_the_outbox_row(sim_api):
    from server.run_workers import step
    store, client, subject, key, event, post, now, connect = sim_api
    _gid, gkey, gkid = add_real_guardian(sim_api)
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents")
        request_alarm(cur, cur.fetchone()[0], trigger="no_answer", now=now[0])
    assert step(store, now[0]) == 1
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT state FROM outbox WHERE kind='guardian_alert'")
        assert cur.fetchone()[0] == "done"
    assert len(alerts(client, gkey, gkid).json()["alerts"]) == 1
