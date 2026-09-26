"""PROPOSED (Lethabo, 25 Sep): what a guardian's own phone can read.

A guardian app asks, with its own key, for the alerts VIGIL has delivered to
that guardian. It reads only delivery evidence already written by the
notifier (SIMULATED receipts today; an FCM adapter's receipts later), so a
decoy guardian, who is never delivered to, sees an empty list in exactly the
same shape as a real guardian with no alerts (§9).

Nothing about the member's payloads is returned but the incident id (for the
signed guardian_ack), why the alert was raised, and when. For an incident that
began with a detection, `why` adds the phone's evidence band and up to three
reason names (PROPOSED, ADR-0047): words, never a number or a probability.
"""
from server.payload_store import decrypt_payload

TRIGGERS = ("duress_signal", "no_answer", "contact_lost")


def guardian_for_key(cur, signer_key_id):
    """The live guardian behind a key, or None (removed or unknown keys see nothing)."""
    cur.execute(
        """SELECT guardian_id FROM guardians WHERE signer_key_id=%s
           AND status IN ('active','removal_scheduled')""",
        (signer_key_id,),
    )
    row = cur.fetchone()
    return row[0] if row else None


WHY_REASONS = 3


def why_for(cur, incident_id, payload_key):
    """The band and strongest reasons behind the incident's latest explained detection."""
    if payload_key is None:
        return None
    cur.execute(
        """SELECT p.subject_id, p.event_id, p.nonce, p.ciphertext
           FROM incident_signals s
           JOIN evidence_links e ON e.signal_event_id = s.signal_event_id
           JOIN private_payloads p ON p.subject_id = e.subject_id AND p.event_id = e.event_id
           WHERE s.incident_id::text = %s
           ORDER BY e.received_at DESC, e.event_id DESC LIMIT 1""",
        (incident_id,),
    )
    row = cur.fetchone()
    if row is None:
        return None
    subject_id, event_id, nonce, ciphertext = row
    try:
        payload = decrypt_payload(payload_key, subject_id=subject_id, event_id=event_id,
                                  nonce=bytes(nonce), ciphertext=bytes(ciphertext))["payload"]
    except Exception:
        return None
    if payload.get("kind") != "evidence_observed":
        return None
    names = [r["name"] for r in payload.get("reasons", []) if r.get("db", 0) > 0][:WHY_REASONS]
    return {"band": payload["band"], "reasons": names}


def alerts_for(cur, guardian_id, limit=20, payload_key=None):
    """Alerts delivered to this guardian, newest first."""
    cur.execute(
        """SELECT i.incident_id::text, o.idempotency_key, r.delivered_at, i.opened_at,
                  i.closed_at, i.close_reason
           FROM sim_notification_receipts r
           JOIN outbox o ON o.idempotency_key = r.idempotency_key AND o.kind = 'guardian_alert'
           JOIN incidents i ON i.incident_id::text = o.reference_id
           WHERE r.guardian_ref = %s
           ORDER BY r.delivered_at DESC, o.idempotency_key
           LIMIT %s""",
        (guardian_id, limit),
    )
    out = []
    for incident_id, key, delivered_at, opened_at, closed_at, close_reason in cur.fetchall():
        trigger = key.rsplit(":", 1)[-1]
        out.append({
            "incident_id": incident_id,
            "trigger": trigger if trigger in TRIGGERS else "unknown",
            "delivered_at": delivered_at.isoformat(),
            "opened_at": opened_at.isoformat(),
            "closed_at": closed_at.isoformat() if closed_at else None,
            "close_reason": close_reason,
            "why": why_for(cur, incident_id, payload_key),
        })
    return out
