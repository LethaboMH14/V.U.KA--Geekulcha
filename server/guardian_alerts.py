"""PROPOSED (Lethabo, 25 Sep): what a guardian's own phone can read.

A guardian app asks, with its own key, for the alerts VIGIL has delivered to
that guardian. It reads only delivery evidence already written by the
notifier (SIMULATED receipts today; an FCM adapter's receipts later), so a
decoy guardian, who is never delivered to, sees an empty list in exactly the
same shape as a real guardian with no alerts (§9).

Nothing about the member's payloads is returned: only the incident id (for
the signed guardian_ack), why the alert was raised, and when.
"""

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


def alerts_for(cur, guardian_id, limit=20):
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
        })
    return out
