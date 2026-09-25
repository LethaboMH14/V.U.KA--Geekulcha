"""Guardian delivery boundary and secret-safe FCM adapter."""
from contextlib import closing
from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from server.src.notify.fcm import FcmSender, build_message

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS sim_guardians (
    subject_id TEXT NOT NULL CHECK(subject_id LIKE 'sim\\_%' ESCAPE '\\'),
    guardian_ref TEXT NOT NULL, PRIMARY KEY(subject_id,guardian_ref)
);
CREATE TABLE IF NOT EXISTS sim_notification_receipts (
    idempotency_key TEXT NOT NULL, guardian_ref TEXT NOT NULL,
    delivered_at TIMESTAMPTZ NOT NULL, evidence_ref TEXT NOT NULL,
    PRIMARY KEY(idempotency_key,guardian_ref)
);
CREATE TABLE IF NOT EXISTS guardian_fcm_tokens (
    subject_id TEXT NOT NULL,
    guardian_ref TEXT NOT NULL,
    fcm_token TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY(subject_id, guardian_ref)
);
CREATE TABLE IF NOT EXISTS fcm_notification_receipts (
    idempotency_key TEXT NOT NULL,
    guardian_ref TEXT NOT NULL,
    delivered_at TIMESTAMPTZ NOT NULL,
    evidence_ref TEXT NOT NULL,
    PRIMARY KEY(idempotency_key, guardian_ref)
);
CREATE TABLE IF NOT EXISTS guardian_deliveries (
    outbox_id TEXT NOT NULL, incident_id UUID NOT NULL,
    guardian_ref TEXT NOT NULL, delivered_at TIMESTAMPTZ NOT NULL,
    evidence_ref TEXT NOT NULL, simulated BOOLEAN NOT NULL,
    PRIMARY KEY(outbox_id,guardian_ref)
);
"""


@dataclass(frozen=True)
class DeliveryResult:
    delivered: bool
    evidence_ref: str | None
    delivered_at: datetime | None


class GuardianNotifier(Protocol):
    def recipients(self, subject_id: str) -> list[str]: ...
    def deliver(self, outbox_row: dict) -> DeliveryResult: ...


class SimulatedGuardianNotifier:
    """SIMULATED receiver persists dedupe before sender acknowledgement.

    This proves the adapter protocol, not FCM/SMS delivery. No public route
    seeds recipients. Caller provides a clock and a database connection factory.
    """
    simulated = True

    def __init__(self, connect, clock):
        self.connect = connect
        self.clock = clock

    @staticmethod
    def _require_sim(subject_id):
        if not isinstance(subject_id, str) or not subject_id.startswith("sim_"):
            raise ValueError("simulated notifier requires a sim_ subject")

    def recipients(self, subject_id):
        self._require_sim(subject_id)
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            cur.execute("SELECT guardian_ref FROM sim_guardians WHERE subject_id=%s ORDER BY guardian_ref", (subject_id,))
            return [r[0] for r in cur.fetchall()]

    def deliver(self, outbox_row):
        self._require_sim(outbox_row["subject_id"])
        now = self.clock()
        if now.utcoffset() is None:
            raise ValueError("delivery clock must be timezone-aware")
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            cur.execute("SELECT 1 FROM sim_guardians WHERE subject_id=%s AND guardian_ref=%s", (outbox_row["subject_id"], outbox_row["guardian_ref"]))
            if cur.fetchone() is None:
                return DeliveryResult(False, None, None)
            evidence = "sim_delivery:" + outbox_row["idempotency_key"] + ":" + outbox_row["guardian_ref"]
            cur.execute("INSERT INTO sim_notification_receipts VALUES(%s,%s,%s,%s) ON CONFLICT DO NOTHING", (outbox_row["idempotency_key"], outbox_row["guardian_ref"], now, evidence))
            cur.execute("SELECT delivered_at,evidence_ref FROM sim_notification_receipts WHERE idempotency_key=%s AND guardian_ref=%s", (outbox_row["idempotency_key"], outbox_row["guardian_ref"]))
            delivered_at, evidence = cur.fetchone()
        return DeliveryResult(True, evidence, delivered_at)


class FcmGuardianNotifier:
    """FCM implementation of the shared outbox notifier contract.

    Registration tokens are provisioned by the controlled enrollment path and
    stored in PostgreSQL. This class never accepts credentials from a request
    body and never logs token or bearer values. FCM's collapse key is derived
    from the stable outbox idempotency key, so a lease retry remains safe.
    """

    simulated = False

    def __init__(self, connect, clock, sender: FcmSender):
        self.connect = connect
        self.clock = clock
        self.sender = sender

    def recipients(self, subject_id):
        if not isinstance(subject_id, str) or not subject_id:
            raise ValueError("subject id is required")
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            cur.execute("SELECT guardian_ref FROM guardian_fcm_tokens WHERE subject_id=%s AND active=TRUE ORDER BY guardian_ref", (subject_id,))
            return [r[0] for r in cur.fetchall()]

    def deliver(self, outbox_row):
        now = self.clock()
        if now.utcoffset() is None:
            raise ValueError("delivery clock must be timezone-aware")
        key = outbox_row["idempotency_key"]
        guardian = outbox_row["guardian_ref"]
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            cur.execute("SELECT delivered_at,evidence_ref FROM fcm_notification_receipts WHERE idempotency_key=%s AND guardian_ref=%s", (key, guardian))
            existing = cur.fetchone()
            if existing:
                return DeliveryResult(True, existing[1], existing[0])
            cur.execute("SELECT fcm_token FROM guardian_fcm_tokens WHERE subject_id=%s AND guardian_ref=%s AND active=TRUE", (outbox_row["subject_id"], guardian))
            token_row = cur.fetchone()
            if token_row is None:
                return DeliveryResult(False, None, None)
            message = build_message(token=token_row[0], idempotency_key=key)
            evidence = self.sender.send(message)
            cur.execute("INSERT INTO fcm_notification_receipts VALUES(%s,%s,%s,%s) ON CONFLICT DO NOTHING", (key, guardian, now, evidence))
            cur.execute("SELECT delivered_at,evidence_ref FROM fcm_notification_receipts WHERE idempotency_key=%s AND guardian_ref=%s", (key, guardian))
            delivered_at, evidence = cur.fetchone()
        return DeliveryResult(True, evidence, delivered_at)
