"""Guardian outbox acknowledgement and delivery-gated bank scheduling."""
from contextlib import closing
from server.incidents import bank_after_delivery, gap
from server.outbox import mark_done


def deliver_guardian_alert(connect, notifier, row, now, *, after_deliver=lambda: None):
    """Receiver delivery precedes atomic evidence + sender acknowledgement.

    A crash between these stages retries the stable receiver idempotency key.
    Only verified delivery results can start the S1 three-minute timer.
    """
    if row["kind"] != "guardian_alert":
        raise ValueError("not a guardian alert")
    incident_id = row["reference_id"]
    with closing(connect()) as conn, conn, conn.cursor() as cur:
        cur.execute("SELECT subject_id FROM incidents WHERE incident_id=%s", (incident_id,))
        subject_id = cur.fetchone()[0]
    recipients = notifier.recipients(subject_id)
    results = []
    for guardian in recipients:
        result = notifier.deliver({**row, "subject_id": subject_id, "guardian_ref": guardian})
        if result.delivered:
            if not result.evidence_ref or result.delivered_at is None or result.delivered_at.utcoffset() is None or result.delivered_at > now:
                raise ValueError("delivery evidence is invalid")
            results.append((guardian, result))
    after_deliver()
    with closing(connect()) as conn, conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
        cur.execute("SELECT 1 FROM outbox WHERE idempotency_key=%s AND state='inflight' AND lease_token=%s AND lease_until>%s FOR UPDATE", (row["idempotency_key"], row["lease_token"], now))
        if cur.fetchone() is None:
            return False
        if not results:
            gap(cur, incident_id, "sim_no_guardians" if not recipients else "sim_delivery_failed", now)
            return False
        for guardian, result in results:
            cur.execute("""INSERT INTO guardian_deliveries
                (outbox_id,incident_id,guardian_ref,delivered_at,evidence_ref,simulated)
                VALUES(%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING""", (row["idempotency_key"], incident_id, guardian, result.delivered_at, result.evidence_ref,
                                                                      notifier.simulated if result.simulated is None else result.simulated))
        bank_after_delivery(cur, incident_id)
        # Retry incomplete recipient sets, but do not postpone the timer once
        # at least one chosen guardian has real adapter evidence.
        if len(results) == len(recipients):
            return mark_done(cur, idempotency_key=row["idempotency_key"], lease_token=row["lease_token"], now=now)
        return False
