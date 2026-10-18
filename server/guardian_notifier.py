"""Guardian delivery boundary and secret-safe FCM adapter."""
import logging
from contextlib import closing
from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from server.src.notify.fcm import FcmError, FcmSender, build_message

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
CREATE TABLE IF NOT EXISTS fcm_notification_receipts (
    -- PROPOSED (25 Sep, reconciled with #96 per Khutso's #96 review): recipients
    -- and tokens are read from server/guardians.py's `guardians` table
    -- (guardian_id, fcm_token, decoy, status), not a parallel token table —
    -- that split let the accept-invite path and the delivery path disagree
    -- about who a guardian is.
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
    # Set by a notifier that mixes adapters per guardian; None means "use the
    # notifier's own `simulated` attribute".
    simulated: bool | None = None


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
            refs = [r[0] for r in cur.fetchall()]
            from server.guardians import alerting_guardians
            return refs + alerting_guardians(cur, subject_id)  # decoys never included

    def deliver(self, outbox_row):
        self._require_sim(outbox_row["subject_id"])
        now = self.clock()
        if now.utcoffset() is None:
            raise ValueError("delivery clock must be timezone-aware")
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            cur.execute("SELECT 1 FROM sim_guardians WHERE subject_id=%s AND guardian_ref=%s", (outbox_row["subject_id"], outbox_row["guardian_ref"]))
            from server.guardians import alerting_guardians
            if cur.fetchone() is None and outbox_row["guardian_ref"] not in alerting_guardians(cur, outbox_row["subject_id"]):
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
        from server.guardians import alerting_guardians
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            return alerting_guardians(cur, subject_id)  # excludes decoy and removed guardians

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
            cur.execute("""SELECT fcm_token FROM guardians WHERE guardian_id=%s AND subject_id=%s
                           AND NOT decoy AND status IN ('active','removal_scheduled')""",
                        (guardian, outbox_row["subject_id"]))
            token_row = cur.fetchone()
            if token_row is None or not token_row[0]:
                return DeliveryResult(False, None, None)
            message = build_message(token=token_row[0], idempotency_key=key)
            evidence = self.sender.send(message)
            cur.execute("INSERT INTO fcm_notification_receipts VALUES(%s,%s,%s,%s) ON CONFLICT DO NOTHING", (key, guardian, now, evidence))
            cur.execute("SELECT delivered_at,evidence_ref FROM fcm_notification_receipts WHERE idempotency_key=%s AND guardian_ref=%s", (key, guardian))
            delivered_at, evidence = cur.fetchone()
        return DeliveryResult(True, evidence, delivered_at)


class RoutingGuardianNotifier:
    """Real FCM push for a guardian who registered a real device token;
    SIMULATED in-app delivery for one still on a `sim_` placeholder.

    The guardian app enrols with `fcm_token: 'sim_poll_while_open'` (it polls
    GET /v1/guardians/me/alerts while open) until it registers a real token
    via PUT /v1/guardians/{id}/token. Sending those placeholders to FCM
    would fail every alert, record no delivery, and empty the guardian's
    in-app alert list, so they keep the simulated path. Real tokens never
    start with `sim_`.
    """

    simulated = None  # decided per delivery, carried on DeliveryResult

    def __init__(self, connect, clock, sender: FcmSender):
        self.connect = connect
        self._fcm = FcmGuardianNotifier(connect, clock, sender)
        self._sim = SimulatedGuardianNotifier(connect, clock)

    def recipients(self, subject_id):
        if isinstance(subject_id, str) and subject_id.startswith("sim_"):
            return self._sim.recipients(subject_id)
        return self._fcm.recipients(subject_id)

    def deliver(self, outbox_row):
        from dataclasses import replace
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            cur.execute("SELECT fcm_token FROM guardians WHERE guardian_id=%s AND subject_id=%s",
                        (outbox_row["guardian_ref"], outbox_row["subject_id"]))
            row = cur.fetchone()
        token = row[0] if row else None
        if token and not token.startswith("sim_"):
            try:
                return replace(self._fcm.deliver(outbox_row), simulated=False)
            except (FcmError, OSError) as exc:
                # e.g. FCM_ACCESS_TOKEN expired (OAuth tokens last ~1 h). An alert
                # must never vanish because a push credential lapsed: a sim_
                # member's guardian still gets the in-app alert below. The
                # message is an HTTP status or network error, never a token.
                logging.warning("FCM push to guardian %s failed (%s: %s); falling back to in-app delivery",
                                outbox_row["guardian_ref"], type(exc).__name__, exc)
                if not outbox_row["subject_id"].startswith("sim_"):
                    return DeliveryResult(False, None, None)
        if outbox_row["subject_id"].startswith("sim_"):
            return replace(self._sim.deliver(outbox_row), simulated=True)
        return DeliveryResult(False, None, None)
