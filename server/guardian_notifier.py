"""Guardian delivery boundary. Only a SIMULATED adapter is implemented."""
from contextlib import closing
from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

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
