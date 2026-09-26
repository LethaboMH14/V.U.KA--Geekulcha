"""One process that runs all background work.

Every second: the deadline and contact-lost scheduler tick, then due
guardian_alert and bank_signal outbox rows (guardian alerts through the
SIMULATED notifier, since FCM is not wired here; bank signals over a real
HTTP call to a live sim_bank at VUKA_SIM_BANK_URL, default
http://127.0.0.1:8001), then one anchor-batch coordinator tick.

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
from server.guardian_notifier import SimulatedGuardianNotifier
from server.guardian_worker import deliver_guardian_alert
from server.outbox import claim_due
from server.scheduler import tick


def _default_bank_sender():
    return SimBankHTTP(os.environ.get("VUKA_SIM_BANK_URL", "http://127.0.0.1:8001"))


def step(store, now, *, bank_sender=None, batches=None):
    """One tick. The notifier shares this tick's clock: delivery evidence must
    never be stamped later than the time the worker acknowledges it."""
    tick(store, now)
    notifier = SimulatedGuardianNotifier(store._connection, lambda: now)
    with closing(store._connection()) as conn, conn, conn.cursor() as cur:
        rows = claim_due(cur, now=now, kinds=("guardian_alert", "bank_signal"))
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
            batches.tick(now)
        except Exception:
            logging.exception("anchor batch tick failed")
    return delivered


def main():
    store = PostgresDatabase()
    store.initialize()
    now = datetime.now(timezone.utc)
    batches = BatchCoordinator(store._connection, publisher=publish_root, reconcile=reconcile_mirror_root)
    batches.initialize(now)
    while True:
        try:
            step(store, datetime.now(timezone.utc), batches=batches)
        except Exception:
            logging.exception("worker tick failed")
        time.sleep(1)


if __name__ == "__main__":
    main()
