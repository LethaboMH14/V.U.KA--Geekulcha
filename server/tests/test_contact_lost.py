"""PROPOSED subject-wide contact_lost clock; SIMULATED subjects, real PostgreSQL."""
import json
import uuid
from datetime import timedelta

from server.contact import fire_contact_lost
from server.guardian_notifier import SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.outbox import claim_due
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_server_slice1 import make_signed_headers
from server.tests.test_slice3_events import opened, sim_api, signal  # noqa: F401  (fixture)


import pytest


@pytest.fixture(autouse=True)
def _enable_contact_lost(monkeypatch):
    monkeypatch.setenv("VUKA_CONTACT_LOST_ENABLED", "1")


def heartbeat(client, key, journey="sim_journey_a", body=None):
    raw = json.dumps(body or {"speed_bucket": "walking", "ts": "2026-09-25T00:00:00Z"}).encode()
    headers = make_signed_headers("POST", f"/v1/journeys/{journey}/heartbeat", raw, key_id=key)
    headers["Content-Type"] = "application/json"
    return client.post(f"/v1/journeys/{journey}/heartbeat", content=raw, headers=headers)


def tick(store, connect, subject, now):
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        return fire_contact_lost(cur, store, subject, now)


def test_heartbeat_route_accepts_and_refuses(sim_api):
    store, client, subject, key, *_ = sim_api
    assert heartbeat(client, key).status_code == 202
    assert heartbeat(client, key, body={"speed_bucket": "walking", "ts": "x"}).status_code == 400
    assert heartbeat(client, key, body={"speed_bucket": "walking", "ts": "2026-09-25T00:00:00Z", "lat": 1}).status_code == 400
    assert heartbeat(client, key, journey="sim_journey_unknown").status_code == 404


def test_clock_starts_at_incident_open_without_any_heartbeat(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    assert not tick(store, connect, subject, now[0] + timedelta(seconds=89))
    assert tick(store, connect, subject, now[0] + timedelta(seconds=90))
    assert not tick(store, connect, subject, now[0] + timedelta(seconds=500))  # once per incident
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT kind FROM outbox WHERE kind='guardian_alert' AND idempotency_key LIKE %s", ("%:contact_lost",))
        assert cur.fetchall() == [("guardian_alert",)]


def test_heartbeat_on_any_journey_keeps_subject_in_contact(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event, "sim_journey_a")).status_code == 201
    now[0] += timedelta(seconds=80)
    assert heartbeat(client, key, journey="sim_journey_b").status_code == 202
    assert not tick(store, connect, subject, now[0] + timedelta(seconds=89))
    assert tick(store, connect, subject, now[0] + timedelta(seconds=90))


def test_no_contact_lost_once_every_journey_has_ended(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        for journey in ("sim_journey_a", "sim_journey_b"):
            cur.execute("INSERT INTO ended_journeys VALUES(%s,%s,%s)", (journey, subject, now[0]))
    assert not tick(store, connect, subject, now[0] + timedelta(hours=1))


def test_g33_contact_lost_after_all_normal_pins_never_sends_bank(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    detection = signal(event)
    assert post(detection).status_code == 201
    checkin = str(uuid.uuid4())
    assert post(opened(event, detection, checkin)).status_code == 201
    result = event({"kind": "checkin_result", "pv": 1, "checkin_id": checkin, "result": "normal_pin", "attempt": 1})
    assert post(result).status_code == 201
    assert tick(store, connect, subject, now[0] + timedelta(seconds=90))
    with connect() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO sim_guardians VALUES(%s,'sim_guardian')", (subject,))
        rows = claim_due(cur, now=now[0] + timedelta(seconds=90))
    row = next(r for r in rows if r["kind"] == "guardian_alert")
    now[0] += timedelta(seconds=91)
    assert deliver_guardian_alert(connect, SimulatedGuardianNotifier(connect, lambda: now[0]), row, now[0])
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == 0


def test_contact_lost_with_unanswered_checkin_sends_bank_after_delivery(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201       # no answer yet: not all-normal
    assert tick(store, connect, subject, now[0] + timedelta(seconds=90))
    with connect() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO sim_guardians VALUES(%s,'sim_guardian')", (subject,))
        rows = claim_due(cur, now=now[0] + timedelta(seconds=90))
    row = next(r for r in rows if r["kind"] == "guardian_alert")
    now[0] += timedelta(seconds=91)
    assert deliver_guardian_alert(connect, SimulatedGuardianNotifier(connect, lambda: now[0]), row, now[0])
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT not_before FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == now[0] + timedelta(minutes=3)


def test_contact_lost_is_off_by_default(sim_api, monkeypatch):
    monkeypatch.delenv("VUKA_CONTACT_LOST_ENABLED", raising=False)
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    assert not tick(store, connect, subject, now[0] + timedelta(hours=1))
