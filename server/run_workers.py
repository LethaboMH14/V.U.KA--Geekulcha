"""One process that runs all background work.

Every second: the deadline and contact-lost scheduler tick, then due
guardian_alert and bank_signal outbox rows, then one anchor-batch
coordinator tick. Guardian alerts go through Firebase Cloud Messaging when
FCM_PROJECT_ID and FCM_ACCESS_TOKEN are both set (per guardian: a real
device token gets a push, a `sim_` placeholder keeps in-app delivery, see
RoutingGuardianNotifier), otherwise through the SIMULATED notifier. Bank
signals go over a real HTTP call to a live sim_bank at VUKA_SIM_BANK_URL,
default http://127.0.0.1:8001.

The anchor coordinator always uses the real Hedera transport
(anchor/publish.py -> anchor/hedera-sidecar) — this codebase never fabricates
a ledger receipt, not even for local development (see server/anchoring.py).
With no HEDERA_OPERATOR_ID/HEDERA_OPERATOR_KEY/HEDERA_SUBMIT_KEY configured
and the sidecar's `npm ci` not run, batches are still created from real
chain heads but stay `submitted`/unconfirmed — that is the honest state, not
an error. `/v1/anchor/latest` and `/v1/anchor/proof/{head}` only return data
once a batch actually confirms against the public mirror, which needs those
real testnet credentials. See anchor/hedera-sidecar/README.md for how to get
them; never put them in chat or commit them.

anchor_request rows are still not claimed via the outbox lease (see
claim_due's `kinds` filter below) because the batch coordinator marks them
`done` itself, directly, once their chain head is captured in a snapshot —
claiming them here as well would race the coordinator's own SQL.

Run: python -m server.run_workers
"""
import logging
import os
import time
from contextlib import closing
from datetime import datetime, timezone

from anchor.publish import publish_root
from server.anchoring import BatchCoordinator, reconcile_mirror_root
from server.bank_worker import SimBankHTTP, deliver_bank_signal
from server.db import PostgresDatabase
from server.guardian_notifier import RoutingGuardianNotifier, SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.outbox import claim_due
from server.scheduler import tick
from server.src.notify.fcm import FcmConfig, FcmSender


def _default_bank_sender():
    return SimBankHTTP(os.environ.get("VUKA_SIM_BANK_URL", "http://127.0.0.1:8001"))


def fcm_configured(environ=os.environ):
    return bool(environ.get("FCM_PROJECT_ID", "").strip() and environ.get("FCM_ACCESS_TOKEN", "").strip())


def guardian_notifier(store, now, environ=os.environ):
    if fcm_configured(environ):
        return RoutingGuardianNotifier(store._connection, lambda: now, FcmSender(FcmConfig.from_env(environ)))
    return SimulatedGuardianNotifier(store._connection, lambda: now)


def step(store, now, *, bank_sender=None, batches=None, environ=os.environ):
    """One tick. The notifier shares this tick's clock: delivery evidence must
    never be stamped later than the time the worker acknowledges it."""
    # Each stage is isolated: on 26 Sep a scheduler failure (no server signing
    # key on Azure) raised out of this step every second, so guardian alerts,
    # bank signals and anchoring never ran for anyone.
    try:
        tick(store, now)
    except Exception:
        logging.exception("vuka: scheduler tick failed; delivery and anchoring continue")
    try:
        # Location fixes live 24 h past their incident's close (ADR-0048).
        from server.locations import purge_closed
        with closing(store._connection()) as conn, conn, conn.cursor() as cur:
            purge_closed(cur, now)
    except Exception:
        logging.exception("vuka: location purge failed; delivery and anchoring continue")
    notifier = guardian_notifier(store, now, environ)
    # Guardian alerts are claimed on their own, so a bank outage (every
    # bank_signal failing) can never hold back a duress alert.
    with closing(store._connection()) as conn, conn, conn.cursor() as cur:
        rows = claim_due(cur, now=now, kinds=("guardian_alert",))
    with closing(store._connection()) as conn, conn, conn.cursor() as cur:
        rows += claim_due(cur, now=now, kinds=("bank_signal",))
    delivered = 0
    for row in rows:
        try:
            if row["kind"] == "guardian_alert":
                ok = deliver_guardian_alert(store._connection, notifier, row, now)
            else:
                ok = deliver_bank_signal(store, row, now, bank_sender or _default_bank_sender())
            if ok:
                delivered += 1
        except Exception:  # one bad row must not stop delivery; its lease expires and it retries
            logging.exception("%s %s failed", row["kind"], row["idempotency_key"])
    if batches is not None:
        try:
            status = batches.tick(now)
        except Exception:
            logging.exception("anchor batch tick failed")
        else:
            # The coordinator returns a status and never raises for transport
            # failures, so without this a stuck batch leaves no trace at all.
            # Only changes are printed; the worker ticks every second.
            if status != getattr(batches, "last_logged_status", None):
                print(f"vuka: anchor status {status}", flush=True)
                batches.last_logged_status = status
    return delivered


def main():
    store = PostgresDatabase()
    store.initialize()
    now = datetime.now(timezone.utc)
    batches = BatchCoordinator(store._connection, publisher=publish_root, reconcile=reconcile_mirror_root)
    batches.initialize(now)
    print("vuka: guardian alerts via " + ("FCM push (sim_ tokens stay in-app)" if fcm_configured() else "SIMULATED in-app delivery"), flush=True)
    while True:
        try:
            step(store, datetime.now(timezone.utc), batches=batches)
        except Exception:
            logging.exception("worker tick failed")
        time.sleep(1)


if __name__ == "__main__":
    main()
