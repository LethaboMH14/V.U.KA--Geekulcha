"""PROPOSED (ADR-0047) evidence_observed: accepted, chained, no server effect,
and the guardian's alert says why in words."""
from server.guardian_notifier import SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.incidents import request_alarm
from server.outbox import claim_due
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_guardian_alerts import alerts
from server.tests.test_guardian_lifecycle import add_real_guardian
from server.tests.test_slice3_events import signal, sim_api  # noqa: F401  (fixture)

DIGEST = "41c9f661465fdcfa27aa2109edafad2f9e759f5303b5a51c97ac1ed0a032a9b3"


def evidence(event, journey="sim_journey_a", **over):
    payload = {"kind": "evidence_observed", "pv": 1, "journey_id": journey, "cem_version": "CEM-1",
               "ruleset_digest": DIGEST, "decision": "prompt", "tally_db": 12, "band": "strong", "k_pct": 0,
               "reasons": [{"name": "scream_single", "db": 7}, {"name": "snatch", "db": 5},
                           {"name": "shout_or_yell", "db": 4}, {"name": "impact", "db": 4},
                           {"name": "media_context", "db": -6}]}
    payload.update(over)
    return event(payload, journey=journey)


def counts(connect):
    with connect() as conn, conn.cursor() as cur:
        out = {}
        for table in ("incidents", "outbox", "signal_deadlines", "evidence_links"):
            cur.execute(f"SELECT count(*) FROM {table}")
            out[table] = cur.fetchone()[0]
        return out


def test_evidence_is_chained_with_no_incident_deadline_or_outbox(sim_api):
    _, _, _, _, event, post, _, connect = sim_api
    before = counts(connect)
    assert post(evidence(event, decision="record")).status_code == 201
    after = counts(connect)
    assert after["outbox"] == before["outbox"]
    assert after["incidents"] == before["incidents"]
    assert after["signal_deadlines"] == before["signal_deadlines"]
    assert after["evidence_links"] == before["evidence_links"] + 1
    # Hourly anchoring only: no immediate anchor request, no alert.
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM outbox WHERE kind = 'anchor_request'")
        anchors = cur.fetchone()[0]
    assert anchors == 0


def test_evidence_is_refused_when_malformed_or_aimed_at_another_journey(sim_api):
    _, _, _, _, event, post, _, connect = sim_api
    assert post(evidence(event, confidence=93)).status_code == 400
    assert post(evidence(event, band="likely")).status_code == 400
    bad = evidence(event)
    other = event(dict(bad["payload"], journey_id="sim_journey_b"), journey="sim_journey_a")
    assert post(other).status_code == 400


def test_the_guardian_sees_the_band_and_three_reason_names_never_numbers(sim_api):
    store, client, subject, _, event, post, now, connect = sim_api
    _gid, gkey, gkid = add_real_guardian(sim_api)
    assert post(evidence(event)).status_code == 201
    assert post(signal(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        cur.execute("SELECT incident_id::text FROM incidents")
        incident = cur.fetchone()[0]
        request_alarm(cur, incident, trigger="duress_signal", now=now[0])
        rows = [r for r in claim_due(cur, now=now[0]) if r["kind"] == "guardian_alert"]
    notifier = SimulatedGuardianNotifier(connect, lambda: now[0])
    for row in rows:
        assert deliver_guardian_alert(connect, notifier, row, now[0])
    alert = alerts(client, gkey, gkid).json()["alerts"][0]
    assert alert["why"] == {"band": "strong", "reasons": ["scream_single", "snatch", "shout_or_yell"]}
