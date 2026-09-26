"""Transactional event effects. Caller already owns subject_heads row lock."""
from datetime import timedelta

from anchor.payloads import PayloadError, validate_payload
from server import escalation, incidents, pin_records
from server.outbox import enqueue
from server.pin_records import EventRefused, require_authorisation, store_authorisation
from server.server_signing import sign_server_entry

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS checkins (
    checkin_id TEXT PRIMARY KEY, signal_event_id TEXT UNIQUE NOT NULL,
    subject_id TEXT NOT NULL, journey_id TEXT NOT NULL, incident_id UUID NOT NULL,
    outcome TEXT CHECK(outcome IN ('normal_pin','duress_pin','no_answer'))
);
CREATE TABLE IF NOT EXISTS ended_journeys (
    journey_id TEXT PRIMARY KEY, subject_id TEXT NOT NULL, ended_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS evidence_links (
    event_id TEXT PRIMARY KEY, subject_id TEXT NOT NULL, journey_id TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL, signal_event_id TEXT UNIQUE
);
ALTER TABLE evidence_links ADD COLUMN IF NOT EXISTS pv INTEGER NOT NULL DEFAULT 1;
"""
# PROPOSED (ADR-0047): evidence_observed links to the signal it explains. Only
# ids are kept here; the reasons stay in the encrypted private payload, so
# deleting the member's data removes them too. pv 2 names its signal exactly
# (decision "prompt"); pv 1 (older apps) was queued just before its signal and
# is linked to the next signal on its journey within 120 s.
EVIDENCE_LINK_WINDOW = timedelta(seconds=120)


def anchor_intent(cur, event_id, now):
    enqueue(cur, idempotency_key="anchor:" + event_id, kind="anchor_request", reference_id=event_id, not_before=now)


def append_server(cur, store, subject_id, payload, now):
    from psycopg2.extras import Json
    from server.db import _with_server_fields
    cur.execute("SELECT chain_index,event_hash FROM subject_heads WHERE subject_id=%s", (subject_id,))
    index, prev_hash = cur.fetchone()
    entry = sign_server_entry(subject_id, "subject", subject_id, payload, now, index + 1)
    stored = _with_server_fields(entry, chain_index=index + 1, prev_hash=prev_hash.strip(), received_at=now.isoformat().replace("+00:00", "Z"))
    cur.execute("""INSERT INTO chain_entries(subject_id,chain_index,action,actor_id,target_type,target_id,details_json,ts,prev_hash,event_hash)
        VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", (subject_id, index + 1, stored["action"], stored["actor_id"], stored["target_type"], stored["target_id"], Json(stored["details"]), stored["ts"], stored["prev_hash"], stored["event_hash"]))
    cur.execute("UPDATE subject_heads SET chain_index=%s,event_hash=%s WHERE subject_id=%s", (index + 1, stored["event_hash"], subject_id))
    store._store_private_payload(cur, subject_id, entry, now)
    anchor_intent(cur, entry["details"]["event_id"], now)
    return stored


def proposed_require_known_checkin(cur, subject_id, checkin_id):
    """PROPOSED: retryable 409; never create a row from a result alone."""
    cur.execute("SELECT signal_event_id,journey_id,incident_id::text,outcome FROM checkins WHERE checkin_id=%s AND subject_id=%s FOR UPDATE", (checkin_id, subject_id))
    row = cur.fetchone()
    if row is None:
        raise EventRefused("checkin_unknown", 409)
    return row


def close_incident(cur, store, subject_id, incident_id, reason, now):
    cur.execute("UPDATE incidents SET closed_at=%s,close_reason=%s WHERE incident_id=%s AND closed_at IS NULL RETURNING incident_id", (now, reason, incident_id))
    if cur.fetchone() is None:
        return False
    append_server(cur, store, subject_id, {"kind": "incident_closed", "pv": 1, "reason": reason}, now)
    return True


DEVICE_KINDS = {"signal_detected", "checkin_opened", "checkin_result", "journey_ended", "pin_authorised", "evidence_observed"}
GUARDIAN_KINDS = {"guardian_ack"}


def apply_event(cur, store, subject_id, entry, stored, now):
    payload = entry["payload"]
    kind = payload["kind"]
    if kind not in DEVICE_KINDS | GUARDIAN_KINDS:
        if kind in {"no_answer", "contact_lost", "answered_late", "incident_closed"}:
            raise EventRefused("invalid_signature", 401)
        return
    expected_signer = "device" if kind in DEVICE_KINDS else "guardian"
    if entry["details"]["signer"] != expected_signer:
        raise EventRefused("invalid_signature", 401)
    if expected_signer == "device":
        from server.contact import record_contact
        record_contact(cur, subject_id, now)
    if kind != "signal_detected":
        if kind == "pin_authorised" and payload.get("action") not in {"export", "end_journey", "delete", "add_guardian", "remove_guardian"}:
            raise EventRefused("action_not_supported")
        try:
            validate_payload(kind, payload)
        except PayloadError as exc:
            raise EventRefused("invalid_request") from exc
    event_id = entry["details"]["event_id"]
    if kind in {"signal_detected", "checkin_opened", "journey_ended", "evidence_observed"}:
        if entry["target_type"] != "journey" or payload.get("journey_id") != entry["target_id"]:
            raise EventRefused("invalid_request")
    if kind == "evidence_observed":
        # Recorded and anchored with the hour. No incident, no deadline, no outbox.
        if payload["pv"] == 1:
            cur.execute("INSERT INTO evidence_links(event_id,subject_id,journey_id,received_at,pv) VALUES(%s,%s,%s,%s,1)",
                        (event_id, subject_id, entry["target_id"], now))
            return
        from server.evidence import EvidenceShapeError, check_v2
        try:
            check_v2(payload)
        except EvidenceShapeError as exc:
            raise EventRefused("invalid_request") from exc
        if payload["decision"] == "prompt":
            # Exactly its own signal, already received on this journey (else retry).
            cur.execute("SELECT 1 FROM signal_deadlines WHERE signal_event_id=%s AND subject_id=%s AND journey_id=%s",
                        (payload["signal_event_id"], subject_id, entry["target_id"]))
            if cur.fetchone() is None:
                raise EventRefused("signal_unknown", 409)
            cur.execute("SELECT 1 FROM evidence_links WHERE signal_event_id=%s", (payload["signal_event_id"],))
            if cur.fetchone() is not None:
                raise EventRefused("invalid_request")
            cur.execute("INSERT INTO evidence_links(event_id,subject_id,journey_id,received_at,signal_event_id,pv) VALUES(%s,%s,%s,%s,%s,2)",
                        (event_id, subject_id, entry["target_id"], now, payload["signal_event_id"]))
        elif payload["decision"] == "pin":
            cur.execute("SELECT 1 FROM checkins WHERE checkin_id=%s AND subject_id=%s AND journey_id=%s",
                        (payload["checkin_id"], subject_id, entry["target_id"]))
            if cur.fetchone() is None:
                raise EventRefused("checkin_unknown", 409)
        return
    if kind == "signal_detected":
        cur.execute("""UPDATE evidence_links SET signal_event_id=%s WHERE event_id=(
            SELECT event_id FROM evidence_links WHERE subject_id=%s AND journey_id=%s
              AND pv = 1 AND signal_event_id IS NULL AND received_at >= %s
            ORDER BY received_at DESC, event_id DESC LIMIT 1)""",
                    (event_id, subject_id, entry["target_id"], now - EVIDENCE_LINK_WINDOW))
        incident_id = incidents.incident_for_signal(cur, subject_id, now, stored["prev_hash"])
        escalation.schedule_signal(cur, signal_event_id=event_id, subject_id=subject_id, journey_id=entry["target_id"], received_at=now)
        cur.execute("INSERT INTO incident_signals VALUES(%s,%s)", (event_id, incident_id))
        return
    if kind == "checkin_opened":
        cur.execute("SELECT incident_id::text FROM incident_signals WHERE signal_event_id=%s", (payload["signal_event_id"],))
        row = cur.fetchone()
        if row is None:
            raise EventRefused("invalid_request")
        try:
            outcome = escalation.record_opened(cur, signal_event_id=payload["signal_event_id"], subject_id=subject_id,
                journey_id=entry["target_id"], checkin_id=payload["checkin_id"], window_s=payload["window_s"], received_at=now)
        except ValueError as exc:
            raise EventRefused("invalid_request") from exc
        cur.execute("INSERT INTO checkins VALUES(%s,%s,%s,%s,%s,%s)", (payload["checkin_id"], payload["signal_event_id"], subject_id, entry["target_id"], row[0], outcome))
        return
    if kind == "checkin_result":
        signal, journey, incident_id, outcome = proposed_require_known_checkin(cur, subject_id, payload["checkin_id"])
        if entry["target_type"] != "journey" or entry["target_id"] != journey:
            raise EventRefused("invalid_request")
        result = payload["result"]
        cur.execute("UPDATE incidents SET last_pin_at=%s WHERE incident_id=%s", (now, incident_id))
        if outcome is None and not (result == "normal_pin" and payload["attempt"] >= 4):
            cur.execute("UPDATE checkins SET outcome=%s WHERE checkin_id=%s", (result, payload["checkin_id"]))
            cur.execute("UPDATE signal_deadlines SET outcome=%s WHERE signal_event_id=%s AND outcome IS NULL", (result, signal))
        elif outcome == "no_answer":
            append_server(cur, store, subject_id, {"kind": "answered_late", "pv": 1, "checkin_id": payload["checkin_id"], "result": result}, now)
        if result == "duress_pin":
            incident_id = incidents.incident_for_signal(cur, subject_id, now, stored["prev_hash"])
            incidents.request_alarm(cur, incident_id, trigger="duress_signal", now=now)
        anchor_intent(cur, event_id, now)
        return
    if kind == "guardian_ack":
        cur.execute("SELECT 1 FROM incidents WHERE incident_id=%s AND subject_id=%s", (payload["incident_id"], subject_id))
        if cur.fetchone() is None:
            raise EventRefused("invalid_request")
        if payload["action"] == "stand_down":
            incidents.stand_down(cur, payload["incident_id"], now)
            close_incident(cur, store, subject_id, payload["incident_id"], "stand_down", now)
        return
    if kind == "pin_authorised":
        store_authorisation(cur, subject_id, entry, now)
        if payload["mode"] == "duress":
            incident_id = incidents.incident_for_signal(cur, subject_id, now, stored["prev_hash"])
            incidents.request_alarm(cur, incident_id, trigger="duress_signal", now=now)
        cur.execute("UPDATE incidents SET last_pin_at=%s WHERE subject_id=%s AND closed_at IS NULL", (now, subject_id))
        anchor_intent(cur, event_id, now)
        return
    mode = require_authorisation(cur, subject_id, "end_journey", payload["journey_id"], now, consume=True)
    cur.execute("SELECT 1 FROM ended_journeys WHERE journey_id=%s", (payload["journey_id"],))
    if cur.fetchone() is not None:
        raise EventRefused("pin_authorisation_required", 403)
    cur.execute("INSERT INTO ended_journeys VALUES(%s,%s,%s)", (payload["journey_id"], subject_id, now))
    if mode == "duress":
        incident_id = incidents.incident_for_signal(cur, subject_id, now, stored["prev_hash"])
        incidents.request_alarm(cur, incident_id, trigger="duress_signal", now=now)
    else:
        cur.execute("""SELECT incident_id::text FROM incidents i WHERE subject_id=%s AND closed_at IS NULL
            AND NOT has_duress AND NOT EXISTS(SELECT 1 FROM guardian_deliveries d WHERE d.incident_id=i.incident_id)
            AND NOT EXISTS(SELECT 1 FROM incident_signals s JOIN signal_deadlines t USING(signal_event_id)
                WHERE s.incident_id=i.incident_id AND t.outcome IS DISTINCT FROM 'normal_pin')""", (subject_id,))
        row = cur.fetchone()
        if row:
            close_incident(cur, store, subject_id, row[0], "member_ended", now)
    anchor_intent(cur, event_id, now)


def fire_due_for_subject(cur, store, subject_id, now):
    cur.execute("""SELECT d.signal_event_id,s.incident_id::text FROM signal_deadlines d
        JOIN incident_signals s USING(signal_event_id) WHERE d.subject_id=%s
        AND d.outcome IS NULL AND COALESCE(opened_due_at,fallback_due_at)<=%s
        ORDER BY signal_event_id""", (subject_id, now))
    for signal_id, incident_id in cur.fetchall():
        if escalation.claim_timeout(cur, signal_event_id=signal_id, now=now):
            cur.execute("UPDATE checkins SET outcome='no_answer' WHERE signal_event_id=%s AND outcome IS NULL", (signal_id,))
            append_server(cur, store, subject_id, {"kind": "no_answer", "pv": 1, "signal_event_id": signal_id}, now)
            incidents.request_alarm(cur, incident_id, trigger="no_answer", now=now)
