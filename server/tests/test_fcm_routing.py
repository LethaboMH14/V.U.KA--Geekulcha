"""Wiring FCM into the worker without breaking the in-app alert list.
Real PostgreSQL; the FCM transport is a SIMULATED fixture (no network)."""
import json

from server.guardian_notifier import RoutingGuardianNotifier, SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.incidents import request_alarm
from server.outbox import claim_due
from server.run_workers import guardian_notifier
from server.src.notify.fcm import FcmConfig, FcmError, FcmSender
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_guardian_alerts import alerts
from server.tests.test_guardian_lifecycle import add_real_guardian
from server.tests.test_slice3_events import signal, sim_api  # noqa: F401  (fixture)

REAL_TOKEN = "dGVzdC1kZXZpY2U6APA91bSimulatedButRealShapedToken"


def sender(calls, fail=False):
    def transport(path, body, headers, timeout):
        if fail:
            raise FcmError("FCM returned HTTP 401")
        calls.append(json.loads(body)["message"]["token"])
        return {"name": "projects/sim/messages/1"}
    return FcmSender(FcmConfig("sim_project", "sim_access"), transport=transport)


def raise_with(sim_api, notifier):
    _, _, subject, _, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents")
        request_alarm(cur, cur.fetchone()[0], trigger="no_answer", now=now[0])
        rows = claim_due(cur, now=now[0], kinds=("guardian_alert",))
    for row in rows:
        assert deliver_guardian_alert(connect, notifier, row, now[0])


def delivery_flags(connect):
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT simulated FROM guardian_deliveries")
        return [r[0] for r in cur.fetchall()]


def test_a_placeholder_token_stays_in_app_and_never_calls_fcm(sim_api):
    _, client, *_, now, connect = sim_api
    _gid, gkey, gkid = add_real_guardian(sim_api)  # enrols with fcm_token "sim_fcm", like the app
    calls = []
    raise_with(sim_api, RoutingGuardianNotifier(connect, lambda: now[0], sender(calls)))
    assert calls == []
    assert delivery_flags(connect) == [True]
    assert len(alerts(client, gkey, gkid).json()["alerts"]) == 1


def test_a_real_device_token_gets_a_push_and_still_shows_in_app(sim_api):
    _, client, *_, now, connect = sim_api
    gid, gkey, gkid = add_real_guardian(sim_api)
    with connect() as conn, conn.cursor() as cur:
        cur.execute("UPDATE guardians SET fcm_token=%s WHERE guardian_id=%s", (REAL_TOKEN, gid))
    calls = []
    raise_with(sim_api, RoutingGuardianNotifier(connect, lambda: now[0], sender(calls)))
    assert calls == [REAL_TOKEN]
    assert delivery_flags(connect) == [False]
    # The in-app list must show FCM-delivered alerts too, not only simulated ones.
    assert len(alerts(client, gkey, gkid).json()["alerts"]) == 1


def test_an_expired_fcm_credential_never_loses_the_alert(sim_api):
    _, client, *_, now, connect = sim_api
    gid, gkey, gkid = add_real_guardian(sim_api)
    with connect() as conn, conn.cursor() as cur:
        cur.execute("UPDATE guardians SET fcm_token=%s WHERE guardian_id=%s", (REAL_TOKEN, gid))
    raise_with(sim_api, RoutingGuardianNotifier(connect, lambda: now[0], sender([], fail=True)))
    assert delivery_flags(connect) == [True]
    assert len(alerts(client, gkey, gkid).json()["alerts"]) == 1


def test_the_worker_uses_fcm_only_when_both_settings_are_present(sim_api):
    store, *_, now, _connect = sim_api
    both = {"FCM_PROJECT_ID": "sim_project", "FCM_ACCESS_TOKEN": "sim_access"}
    assert isinstance(guardian_notifier(store, now[0], both), RoutingGuardianNotifier)
    for partial in ({}, {"FCM_PROJECT_ID": "sim_project"}, {"FCM_ACCESS_TOKEN": "sim_access"},
                    {"FCM_PROJECT_ID": " ", "FCM_ACCESS_TOKEN": "sim_access"}):
        assert isinstance(guardian_notifier(store, now[0], partial), SimulatedGuardianNotifier)
