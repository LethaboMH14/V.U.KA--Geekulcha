"""PROPOSED (27 Sep): a wrong PIN at a check-in alerts guardians, never as duress
and never the bank. SIMULATED subjects, real PostgreSQL."""
import uuid
from datetime import timedelta

from server.incidents import bank_after_delivery
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_slice3_events import opened, signal, sim_api  # noqa: F401  (fixture)


def wrong(event, checkin, attempt=1):
    return event({"kind": "checkin_wrong_pin", "pv": 1, "checkin_id": checkin, "attempt": attempt})


def open_checkin(sim_api):
    store, _, subject, _, event, post, now, connect = sim_api
    detection = signal(event)
    assert post(detection).status_code == 201
    checkin = str(uuid.uuid4())
    assert post(opened(event, detection, checkin)).status_code == 201
    return checkin


def outbox(connect, kind):
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT idempotency_key FROM outbox WHERE kind=%s ORDER BY idempotency_key", (kind,))
        return [r[0] for r in cur.fetchall()]


def test_the_first_wrong_pin_alerts_guardians_once_never_the_bank(sim_api):
    store, _, subject, _, event, post, now, connect = sim_api
    checkin = open_checkin(sim_api)
    for attempt in (1, 2, 3):
        assert post(wrong(event, checkin, attempt)).status_code == 201
    alerts = outbox(connect, "guardian_alert")
    assert len(alerts) == 1 and alerts[0].endswith(":wrong_pin")
    assert outbox(connect, "bank_signal") == []
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT bank_trigger, has_duress FROM incidents")
        assert cur.fetchall() == [(None, False)]
        cur.execute("SELECT outcome FROM checkins")
        assert cur.fetchall() == [(None,)]  # still undecided: the deadline still applies


def test_a_wrong_pin_then_the_right_pin_keeps_the_heads_up_and_closes_nothing(sim_api):
    store, _, subject, _, event, post, now, connect = sim_api
    checkin = open_checkin(sim_api)
    assert post(wrong(event, checkin)).status_code == 201
    right = event({"kind": "checkin_result", "pv": 1, "checkin_id": checkin, "result": "normal_pin", "attempt": 2})
    assert post(right).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT outcome FROM checkins")
        assert cur.fetchall() == [("normal_pin",)]
    assert outbox(connect, "bank_signal") == []


def test_a_wrong_pin_after_the_outcome_is_decided_alerts_nobody(sim_api):
    store, _, subject, _, event, post, now, connect = sim_api
    checkin = open_checkin(sim_api)
    right = event({"kind": "checkin_result", "pv": 1, "checkin_id": checkin, "result": "normal_pin", "attempt": 1})
    assert post(right).status_code == 201
    assert post(wrong(event, checkin, 2)).status_code == 201
    assert outbox(connect, "guardian_alert") == []


def test_a_wrong_pin_for_an_unknown_checkin_is_refused(sim_api):
    store, _, subject, _, event, post, now, connect = sim_api
    assert post(wrong(event, str(uuid.uuid4()))).status_code == 409


def test_the_bank_timer_ignores_the_wrong_pin_heads_up(sim_api):
    """S1: after no_answer, the bank waits 3 minutes from the no_answer alert,
    not from an earlier wrong-PIN alert."""
    store, _, subject, _, event, post, now, connect = sim_api
    checkin = open_checkin(sim_api)
    assert post(wrong(event, checkin)).status_code == 201
    t0 = now[0]
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT incident_id::text FROM incidents")
        incident_id = cur.fetchone()[0]
        cur.execute("""INSERT INTO guardian_deliveries (outbox_id,incident_id,guardian_ref,delivered_at,evidence_ref,simulated)
                       VALUES (%s,%s,'sim_g',%s,'sim_evidence',TRUE)""", ("guardian:" + incident_id + ":wrong_pin", incident_id, t0))
        cur.execute("UPDATE incidents SET bank_trigger='no_answer' WHERE incident_id=%s", (incident_id,))
        bank_after_delivery(cur, incident_id)
        cur.execute("SELECT count(*) FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == 0  # only the wrong-PIN alert was delivered: no bank timer yet
        later = t0 + timedelta(seconds=70)
        cur.execute("""INSERT INTO guardian_deliveries (outbox_id,incident_id,guardian_ref,delivered_at,evidence_ref,simulated)
                       VALUES (%s,%s,'sim_g',%s,'sim_evidence',TRUE)""", ("guardian:" + incident_id + ":no_answer", incident_id, later))
        bank_after_delivery(cur, incident_id)
        cur.execute("SELECT not_before FROM outbox WHERE kind='bank_signal'")
        assert cur.fetchone()[0] == later + timedelta(minutes=3)
