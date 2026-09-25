"""S1 outbox sender for the separately owned sim_bank service."""
import hashlib
import json
import uuid
from contextlib import closing
from urllib.request import Request, urlopen

from anchor.canonical import canonical
from server.event_effects import append_server
from server.outbox import mark_done
from server.server_signing import sign_server_bytes

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS bank_requests (
    incident_id UUID PRIMARY KEY, body JSONB NOT NULL
);
"""


class SimBankHTTP:
    """No simulated response: this adapter requires a real sim_bank receipt."""
    def __init__(self, base_url):
        self.base_url = base_url.rstrip("/")

    def send(self, body, headers):
        request = Request(self.base_url + "/sim_bank/v1/risk-signal", data=body,
                          headers={**headers, "Content-Type": "application/json"}, method="POST")
        with urlopen(request, timeout=10) as response:
            receipt = json.load(response)
        if receipt.get("sim") is not True or not isinstance(receipt.get("hold_ref"), str) or not receipt["hold_ref"]:
            raise ValueError("sim_bank returned no simulated hold receipt")
        return receipt


def deliver_bank_signal(store, row, now, sender):
    """Freeze the signed body before sending; retries cannot change its meaning."""
    from psycopg2.extras import Json
    incident_id = row["reference_id"]
    with closing(store._connection()) as conn, conn, conn.cursor() as cur:
        cur.execute("SELECT subject_id FROM incidents WHERE incident_id=%s", (incident_id,))
        subject_id = cur.fetchone()[0]
        if not subject_id.startswith("sim_"):
            raise ValueError("sim_bank requires sim_ subjects")
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
        cur.execute("SELECT bank_trigger FROM incidents WHERE incident_id=%s", (incident_id,))
        trigger = cur.fetchone()[0]
        body = {"subject_id": subject_id, "triggering_outcome": trigger, "idempotency_key": row["idempotency_key"]}
        cur.execute("INSERT INTO bank_requests VALUES(%s,%s) ON CONFLICT DO NOTHING", (incident_id, Json(body)))
    with closing(store._connection()) as conn, conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM subject_heads WHERE subject_id=%s FOR UPDATE", (subject_id,))
        cur.execute("SELECT bank_sent_at,stand_down_at,bank_trigger FROM incidents WHERE incident_id=%s", (incident_id,))
        sent, stood_down, current_trigger = cur.fetchone()
        cur.execute("SELECT 1 FROM outbox WHERE idempotency_key=%s AND state='inflight' AND lease_token=%s AND lease_until>%s AND not_before<=%s FOR UPDATE", (row["idempotency_key"], row["lease_token"], now, now))
        if cur.fetchone() is None:
            return False
        if sent is not None or (stood_down is not None and current_trigger != "duress_signal"):
            return mark_done(cur, idempotency_key=row["idempotency_key"], lease_token=row["lease_token"], now=now)
        cur.execute("SELECT body FROM bank_requests WHERE incident_id=%s", (incident_id,))
        body = canonical(cur.fetchone()[0])
        ts = now.isoformat().replace("+00:00", "Z")
        nonce = str(uuid.uuid4())
        statement = {"method": "POST", "path": "/sim_bank/v1/risk-signal", "ts": ts,
                     "body_sha256": hashlib.sha256(body).hexdigest(), "nonce": nonce}
        headers = {"X-Vuka-Ts": ts, "X-Vuka-Nonce": nonce,
                   "X-Vuka-Server-Signature": sign_server_bytes(canonical(statement)),
                   "Idempotency-Key": row["idempotency_key"]}
        receipt = sender.send(body, headers)
        if receipt.get("sim") is not True or not isinstance(receipt.get("hold_ref"), str) or not receipt["hold_ref"]:
            raise ValueError("bank receipt is invalid")
        cur.execute("UPDATE incidents SET bank_sent_at=%s,hold_ref=%s WHERE incident_id=%s", (now, receipt["hold_ref"], incident_id))
        append_server(cur, store, subject_id, {"kind": "bank_signal_sent", "pv": 1,
            "triggering_outcome": json.loads(body)["triggering_outcome"], "hold_ref": receipt["hold_ref"],
            "idempotency_key": row["idempotency_key"]}, now)
        return mark_done(cur, idempotency_key=row["idempotency_key"], lease_token=row["lease_token"], now=now)
