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


def deliver(sim_api):
    _, _, _, _, _, _, now, connect = sim_api
    with connect() as conn, conn.cursor() as cur:
        rows = [r for r in claim_due(cur, now=now[0]) if r["kind"] == "guardian_alert"]
    notifier = SimulatedGuardianNotifier(connect, lambda: now[0])
    for row in rows:
        assert deliver_guardian_alert(connect, notifier, row, now[0])


def duress_and_deliver(sim_api, detection):
    """The real duress path: the check-in opens, the member gives the duress PIN."""
    from server.tests.test_slice3_events import opened as _opened
    _, _, _, _, event, post, _, _ = sim_api
    op = _opened(event, detection)
    assert post(op).status_code == 201
    assert post(event({"kind": "checkin_result", "pv": 1, "checkin_id": op["payload"]["checkin_id"],
                       "result": "duress_pin", "attempt": 1}, journey=detection["target_id"])).status_code == 201
    deliver(sim_api)
    return op


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
    detection = signal(event)
    assert post(detection).status_code == 201
    duress_and_deliver(sim_api, detection)
    alert = alerts(client, gkey, gkid).json()["alerts"][0]
    assert alert["why"] == {"band": "strong", "reasons": ["scream_single", "snatch", "shout_or_yell"]}


# ---- pv 2 (ADR-0047 step b): one shape per decision, exact binding ---------------
import uuid as _uuid

from server.tests.test_slice3_events import opened

DIGEST2 = "ea136b846bec3eb00c41c4dec181661abb9deabf038fcf32b38738d4cee5983b"
CAND = {"class_label": "Shout", "class_index": 6, "score_bp": 3100, "threshold_bp": 3000, "level": "record"}


def ev2(event, journey="sim_journey_a", **over):
    payload = {"kind": "evidence_observed", "pv": 2, "journey_id": journey, "cem_version": "CEM-1",
               "ruleset_digest": DIGEST2, "decision": "record", "tally_db": 4, "band": "faint", "k_pct": 0,
               "context": "on", "reasons": [{"name": "shout_or_yell", "db": 4}], "observations": [],
               "candidate": CAND, "signal_event_id": None}
    payload.update(over)
    return event({k: v for k, v in payload.items() if v is not ...}, journey=journey)


def pin_ev(event, checkin, journey="sim_journey_a", reasons=None):
    return event({"kind": "evidence_observed", "pv": 2, "journey_id": journey, "cem_version": "CEM-1",
                  "ruleset_digest": DIGEST2, "decision": "pin", "checkin_id": checkin,
                  "reasons": reasons or [{"name": "pin_retry", "db": 2}, {"name": "pin_slow", "db": 0}]}, journey=journey)


def test_v2_record_only_detection_has_no_server_effect(sim_api):
    """R1: a record-only (T0) detection never starts a deadline, an incident or an alert."""
    _, _, _, _, event, post, now, connect = sim_api
    before = counts(connect)
    assert post(ev2(event, observations=["snatch_liu"])).status_code == 201
    after = counts(connect)
    assert (after["incidents"], after["signal_deadlines"], after["outbox"]) == (before["incidents"], before["signal_deadlines"], before["outbox"])


def test_v2_shapes_are_enforced_per_decision(sim_api):
    _, _, _, _, event, post, *_ = sim_api
    sig = str(_uuid.uuid4())
    assert post(ev2(event, signal_event_id=sig)).status_code == 400  # record naming a signal
    assert post(ev2(event, decision="prompt")).status_code == 400  # prompt without its signal
    assert post(ev2(event, reasons=[{"name": "impact", "db": 0}])).status_code == 400  # zero weight in reasons
    assert post(ev2(event, observations=["heart_rate"])).status_code == 400
    assert post(ev2(event, candidate=...)).status_code == 400  # assessed fields required
    assert post(pin_ev(event, str(_uuid.uuid4()), reasons=[{"name": "pin_slow", "db": 0}, {"name": "pin_retry", "db": 2}])).status_code == 400
    bad_pin = pin_ev(event, str(_uuid.uuid4()))
    bad_pin = event(dict(bad_pin["payload"], tally_db=2))
    assert post(bad_pin).status_code == 400  # no aggregate fields on PIN evidence
    assert post(event({"kind": "evidence_observed", "pv": 3, "journey_id": "sim_journey_a"})).status_code == 400


def test_v2_prompt_binds_exactly_its_own_signal(sim_api):
    store, client, subject, _, event, post, now, connect = sim_api
    # Unknown signal: retryable, not stored.
    assert post(ev2(event, decision="prompt", signal_event_id=str(_uuid.uuid4()))).status_code == 409
    detection = signal(event)
    assert post(detection).status_code == 201
    sig = detection["details"]["event_id"]
    assert post(ev2(event, decision="prompt", signal_event_id=sig, candidate=dict(CAND, level="prompt"))).status_code == 201
    # A second prompt evidence for the same signal is refused.
    assert post(ev2(event, decision="prompt", signal_event_id=sig, candidate=dict(CAND, level="prompt"))).status_code == 400
    # A record-only evidence arriving later never borrows the link.
    assert post(ev2(event)).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM evidence_links WHERE signal_event_id=%s", (sig,))
        assert cur.fetchone()[0] == 1
        # Record-only evidence is never in the link table at all.
        cur.execute("SELECT count(*) FROM evidence_links WHERE pv=2 AND signal_event_id IS NULL")
        assert cur.fetchone()[0] == 0


def test_v2_pin_evidence_needs_its_checkin(sim_api):
    _, _, _, _, event, post, *_ = sim_api
    assert post(pin_ev(event, str(_uuid.uuid4()))).status_code == 409
    detection = signal(event)
    assert post(detection).status_code == 201
    op = opened(event, detection)
    assert post(op).status_code == 201
    assert post(pin_ev(event, op["payload"]["checkin_id"])).status_code == 201


def test_v2_why_reads_only_exactly_bound_evidence(sim_api):
    store, client, subject, _, event, post, now, connect = sim_api
    _gid, gkey, gkid = add_real_guardian(sim_api)
    # Unrelated record-only evidence first: must never become the alert's "why".
    assert post(ev2(event, reasons=[{"name": "gun_like_single", "db": 8}], tally_db=8, band="some")).status_code == 201
    detection = signal(event)
    assert post(detection).status_code == 201
    duress_and_deliver(sim_api, detection)
    assert alerts(client, gkey, gkid).json()["alerts"][0]["why"] is None
    sig = detection["details"]["event_id"]
    assert post(ev2(event, decision="prompt", signal_event_id=sig, candidate=dict(CAND, level="prompt"),
                    reasons=[{"name": "shout_or_yell", "db": 4}, {"name": "glass_or_breaking", "db": 4}], tally_db=8, band="some")).status_code == 201
    assert alerts(client, gkey, gkid).json()["alerts"][0]["why"] == {"band": "some", "reasons": ["shout_or_yell", "glass_or_breaking"]}


def test_why_is_the_evidence_of_the_detection_that_raised_the_alert(sim_api):
    """A no-answer alert for detection A never shows a later detection B's reasons."""
    from datetime import timedelta
    from server.event_effects import fire_due_for_subject
    store, client, subject, _, event, post, now, connect = sim_api
    _gid, gkey, gkid = add_real_guardian(sim_api)
    a = signal(event)
    assert post(a).status_code == 201
    assert post(ev2(event, decision="prompt", signal_event_id=a["details"]["event_id"], candidate=dict(CAND, level="prompt"),
                    reasons=[{"name": "shout_or_yell", "db": 4}, {"name": "glass_or_breaking", "db": 4}], tally_db=8, band="some")).status_code == 201
    assert post(opened(event, a)).status_code == 201
    b = signal(event)
    assert post(b).status_code == 201
    assert post(ev2(event, decision="prompt", signal_event_id=b["details"]["event_id"], candidate=dict(CAND, level="prompt"),
                    reasons=[{"name": "gun_like_single", "db": 8}], tally_db=8, band="some")).status_code == 201
    ob = opened(event, b)
    assert post(ob).status_code == 201
    assert post(event({"kind": "checkin_result", "pv": 1, "checkin_id": ob["payload"]["checkin_id"],
                       "result": "normal_pin", "attempt": 1})).status_code == 201
    now[0] += timedelta(seconds=120)
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject,))
        fire_due_for_subject(cur, store, subject, now[0])
    deliver(sim_api)
    got = alerts(client, gkey, gkid).json()["alerts"]
    assert [x["trigger"] for x in got] == ["no_answer"]
    assert got[0]["why"] == {"band": "some", "reasons": ["shout_or_yell", "glass_or_breaking"]}


def test_exact_v2_evidence_replaces_an_old_pv1_guess(sim_api):
    _, _, _, _, event, post, _, connect = sim_api
    assert post(evidence(event)).status_code == 201  # pv1, queued before its signal by an older app
    detection = signal(event)
    assert post(detection).status_code == 201  # pv1 guess links to it
    sig = detection["details"]["event_id"]
    assert post(ev2(event, decision="prompt", signal_event_id=sig, candidate=dict(CAND, level="prompt"))).status_code == 201
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT pv FROM evidence_links WHERE signal_event_id=%s", (sig,))
        assert cur.fetchall() == [(2,)]
