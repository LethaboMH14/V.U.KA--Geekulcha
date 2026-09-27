"""PROPOSED (ADR-0048) location sharing: kept only while guardians are alerted,
same answer to the phone either way, read only by the alerted guardian,
purged 24 h after close and on subject deletion."""
import json
from datetime import timedelta

from server.deletion import request_deletion, purge_payloads
from server.locations import purge_closed
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_evidence_observed import duress_and_deliver
from server.tests.test_guardian_alerts import alerts
from server.tests.test_guardian_lifecycle import add_real_guardian, device_call
from server.tests.test_slice3_events import signal, sim_api  # noqa: F401  (fixture)

JOURNEY = "sim_journey_a"


def fix(lat=-261234567, lon=280567890, acc=12, age=1500, ts="2026-09-25T00:00:00Z"):
    return json.dumps({"lat_e7": lat, "lon_e7": lon, "acc_m": acc, "fix_age_ms": age, "ts": ts}).encode()


def send(sim_api, body):
    _, client, _, key, *_ = sim_api
    return device_call(client, "POST", f"/v1/journeys/{JOURNEY}/location", key, body)


def stored(connect):
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM incident_locations")
        return cur.fetchone()[0]


def test_no_alert_nothing_kept_and_the_same_answer(sim_api):
    connect = sim_api[7]
    dropped = send(sim_api, fix())
    assert dropped.status_code == 202
    assert stored(connect) == 0
    # A detection alone (no alert requested) still keeps nothing.
    _, _, _, _, event, post, *_ = sim_api
    assert post(signal(event)).status_code == 201
    again = send(sim_api, fix())
    assert again.status_code == 202 and stored(connect) == 0
    assert set(dropped.json()) == set(again.json()) == {"receipt_id", "state"}


def test_kept_while_alerted_and_shown_to_the_alerted_guardian(sim_api):
    _, client, _, _, event, post, now, connect = sim_api
    _gid, gkey, gkid = add_real_guardian(sim_api)
    detection = signal(event)
    assert post(detection).status_code == 201
    duress_and_deliver(sim_api, detection)
    kept = send(sim_api, fix(lat=-261000000, lon=280000000, acc=20))
    assert kept.status_code == 202 and set(kept.json()) == {"receipt_id", "state"}
    assert send(sim_api, fix(lat=-261000100, lon=280000100, acc=8, age=0)).status_code == 202
    assert stored(connect) == 2
    loc = alerts(client, gkey, gkid).json()["alerts"][0]["location"]
    assert loc["last"]["lat_e7"] == -261000100 and loc["last"]["acc_m"] == 8
    assert [p["lat_e7"] for p in loc["trail"]] == [-261000000, -261000100]


def test_refuses_floats_extra_fields_and_out_of_range(sim_api):
    for bad in (
        json.dumps({"lat_e7": -26.1, "lon_e7": 28, "acc_m": 1, "fix_age_ms": 0, "ts": "2026-09-25T00:00:00Z"}).encode(),
        json.dumps({"lat_e7": 1, "lon_e7": 1, "acc_m": 1, "fix_age_ms": 0, "ts": "2026-09-25T00:00:00Z", "speed": 3}).encode(),
        fix(lat=900_000_001),
        fix(acc=-1),
    ):
        assert send(sim_api, bad).status_code == 400


def test_stops_at_close_and_purges_24_h_after(sim_api):
    store, client, subject, _, event, post, now, connect = sim_api
    _gid, gkey, gkid = add_real_guardian(sim_api)
    detection = signal(event)
    assert post(detection).status_code == 201
    duress_and_deliver(sim_api, detection)
    assert send(sim_api, fix()).status_code == 202
    incident = alerts(client, gkey, gkid).json()["alerts"][0]["incident_id"]
    # The guardian stands down: the incident closes, nothing more is kept.
    with connect() as conn, conn.cursor() as cur:
        cur.execute("UPDATE incidents SET closed_at=%s, close_reason='stand_down' WHERE incident_id=%s", (now[0], incident))
    assert send(sim_api, fix()).status_code == 202
    assert stored(connect) == 1
    with connect() as conn, conn.cursor() as cur:
        assert purge_closed(cur, now[0] + timedelta(hours=23)) == 0
        assert purge_closed(cur, now[0] + timedelta(hours=25)) == 1
    assert stored(connect) == 0


def test_subject_deletion_removes_every_fix(sim_api):
    store, client, subject, _, event, post, now, connect = sim_api
    add_real_guardian(sim_api)
    detection = signal(event)
    assert post(detection).status_code == 201
    duress_and_deliver(sim_api, detection)
    assert send(sim_api, fix()).status_code == 202
    assert stored(connect) == 1
    with connect() as conn, conn.cursor() as cur:
        request_deletion(cur, subject, now[0])
        purge_payloads(cur, subject, now[0])
    assert stored(connect) == 0
