"""Durable Merkle snapshots. Only mirror-bound receipts confirm a batch.

Run with ``python -m server.anchoring`` alongside the API. No credentials are
loaded from files. A failed/ambiguous sidecar invocation stays submitted for
reconciliation; blindly retrying could violate the one-message/minute ceiling.
"""
from __future__ import annotations

from contextlib import closing
import json
import base64
import os
import re
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
import http.client
import ssl
from urllib.parse import urlparse

from anchor.merkle import build_merkle_proof, build_merkle_root
from anchor.publish import AnchorNotSubmitted, AnchorPublicationError, publish_root

PINS = json.loads((Path(__file__).resolve().parents[1] / "contracts/keys/verify-pins.json").read_text())
COORDINATOR_LOCK = 864203  # Fixed namespace; never Python's randomized hash().
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS anchor_batches (
    batch_id UUID PRIMARY KEY,
    root_hex CHAR(64) NOT NULL,
    leaves JSONB NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('pending','submitted','confirmed','failed')),
    created_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    receipt JSONB
);
CREATE TABLE IF NOT EXISTS anchor_clock (
    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
    last_attempt_at TIMESTAMPTZ,
    last_snapshot_at TIMESTAMPTZ NOT NULL
);
"""


def _aware(now):
    if not isinstance(now, datetime) or now.utcoffset() is None:
        raise ValueError("clock must be timezone-aware")


def validate_receipt(receipt, root_hex):
    """Defence in depth after publish_root's actual mirror read-back."""
    if (
        not isinstance(receipt, dict)
        or receipt.get("confirmed_by") != "public_mirror"
        or receipt.get("kind") != "root"
        or receipt.get("message_hex") != "01" + root_hex
        or receipt.get("topic_id") != PINS["topic_id"]
        or receipt.get("topic_epoch") != PINS["topic_epoch"]
        or type(receipt.get("sequence_number")) is not int
        or receipt["sequence_number"] < 1
        or not isinstance(receipt.get("consensus_timestamp"), str)
        or re.fullmatch(r"[0-9]+\.[0-9]{1,9}", receipt["consensus_timestamp"]) is None
        or not isinstance(receipt.get("running_hash"), str)
        or not receipt["running_hash"]
    ):
        raise AnchorPublicationError("receipt does not bind the pinned root")


def reconcile_mirror_root(root_hex, submitted_at, *, fetch=None):
    """Read pinned-topic messages since submission intent; never infer absence.

    None leaves the intent unresolved. It is NOT permission to resubmit. Only
    a matching typed message read from the mirror can recover confirmation.
    """
    origin = "https://testnet.mirrornode.hedera.com"
    if PINS["network"] != "testnet":
        raise AnchorPublicationError("only pinned testnet reconciliation is supported")
    def fetch_json(url):
        # http.client, not urllib: only the pinned HTTPS mirror host is reachable.
        parts = urlparse(url)
        if parts.scheme != "https" or parts.netloc != "testnet.mirrornode.hedera.com":
            raise AnchorPublicationError("invalid mirror URL")
        conn = http.client.HTTPSConnection(parts.netloc, timeout=10, context=ssl.create_default_context())
        try:
            conn.request("GET", parts.path + ("?" + parts.query if parts.query else ""))
            response = conn.getresponse()
            if response.status != 200:
                raise AnchorPublicationError(f"mirror returned HTTP {response.status}")
            return json.load(response)
        finally:
            conn.close()
    fetch = fetch or fetch_json
    seconds = int(submitted_at.timestamp())
    url = f"{origin}/api/v1/topics/{PINS['topic_id']}/messages?order=asc&limit=100&timestamp=gte:{seconds}"
    expected = bytes.fromhex("01" + root_hex)
    seen = set()
    for _ in range(100):
        if url in seen or urlparse(url).scheme != "https" or urlparse(url).netloc != "testnet.mirrornode.hedera.com":
            raise AnchorPublicationError("invalid mirror pagination")
        seen.add(url)
        page = fetch(url)
        for message in page["messages"]:
            try:
                decoded = base64.b64decode(message["message"], validate=True)
            except (ValueError, KeyError):
                continue
            if decoded != expected:
                continue
            receipt = {key: message[key] for key in ("topic_id", "sequence_number", "consensus_timestamp", "running_hash")}
            receipt.update(kind="root", confirmed_by="public_mirror", message_hex=expected.hex(), topic_epoch=PINS["topic_epoch"])
            validate_receipt(receipt, root_hex)
            return receipt
        next_url = page.get("links", {}).get("next")
        if not next_url:
            return None
        url = origin + next_url if next_url.startswith("/") else next_url
    return None  # Bounded scan; no negative confirmation or blind retry.


class BatchCoordinator:
    """One dedicated connection owns the scheduler lock across commits.

    `publisher` and `reconcile` are trusted transport adapters, never request
    inputs. Reconciliation must itself fetch/verify the public mirror. None
    means not resolved, not permission to submit again.
    """
    def __init__(self, connect, *, publisher=publish_root, reconcile=None):
        self.connect = connect
        self.publisher = publisher
        self.reconcile = reconcile

    def initialize(self, now):
        _aware(now)
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)
            cur.execute("INSERT INTO anchor_clock(singleton,last_snapshot_at) VALUES(TRUE,%s) ON CONFLICT DO NOTHING", (now,))

    def tick(self, now):
        """Take a current-head snapshot when hourly or an immediate effect is due.

        Returns operational state only. No receipt is invented for stub runs.
        """
        _aware(now)
        from psycopg2.extras import Json
        conn = self.connect()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT pg_try_advisory_lock(%s)", (COORDINATOR_LOCK,))
                if not cur.fetchone()[0]:
                    conn.rollback()
                    return "other_worker"
            conn.commit()
            with conn, conn.cursor() as cur:
                cur.execute("SELECT batch_id::text,root_hex,state,submitted_at FROM anchor_batches WHERE state <> 'confirmed' ORDER BY created_at,batch_id LIMIT 1 FOR UPDATE")
                batch = cur.fetchone()
                cur.execute("SELECT last_attempt_at,last_snapshot_at FROM anchor_clock WHERE singleton FOR UPDATE")
                last_attempt, last_snapshot = cur.fetchone()
                if batch is None:
                    # Outbox intent and all covered chain appends are committed
                    # before this snapshot transaction starts.
                    cur.execute("SELECT idempotency_key FROM outbox WHERE kind='anchor_request' AND state <> 'done' AND not_before <= %s FOR UPDATE", (now,))
                    requests = [r[0] for r in cur.fetchall()]
                    if not requests and now < last_snapshot + timedelta(hours=1):
                        return "not_due"
                    if last_attempt is not None and now < last_attempt + timedelta(seconds=60):
                        return "coalesced"
                    cur.execute("""SELECT h.event_hash FROM subject_heads h
                        WHERE NOT EXISTS (SELECT 1 FROM anchor_batches b,
                            jsonb_array_elements_text(b.leaves) AS leaf
                            WHERE leaf = h.event_hash)
                        ORDER BY h.event_hash""")
                    leaves = [r[0].strip() for r in cur.fetchall()]
                    cur.execute("UPDATE anchor_clock SET last_snapshot_at=%s WHERE singleton", (now,))
                    if leaves:
                        batch_id = str(uuid.uuid4())
                        root = build_merkle_root([bytes.fromhex(h) for h in leaves]).hex()
                        cur.execute("INSERT INTO anchor_batches(batch_id,root_hex,leaves,state,created_at) VALUES(%s,%s,%s,'pending',%s)", (batch_id, root, Json(leaves), now))
                        batch = (batch_id, root, "pending", None)
                    # Each request is now represented by a durable snapshot (or
                    # its head is already in a previous batch). No network yet.
                    for key in requests:
                        cur.execute("UPDATE outbox SET state='done',delivered_at=%s,lease_token=NULL,lease_until=NULL WHERE idempotency_key=%s", (now, key))
                    if batch is None:
                        return "empty"
            batch_id, root, state, submitted_at = batch
            root = root.strip()
            if state == "submitted":
                if self.reconcile is None:
                    return "reconciliation_required"
                receipt = self.reconcile(root, submitted_at)
                if receipt is None:
                    return "reconciliation_required"
            else:
                if last_attempt is not None and now < last_attempt + timedelta(seconds=60):
                    return "coalesced"
                with conn, conn.cursor() as cur:
                    cur.execute("UPDATE anchor_batches SET state='submitted',submitted_at=%s WHERE batch_id=%s", (now, batch_id))
                    cur.execute("UPDATE anchor_clock SET last_attempt_at=%s WHERE singleton", (now,))
                # Intent persists before any SDK side effect. An uncertain
                # failure leaves it submitted, never confirmed or resubmitted.
                try:
                    receipt = self.publisher(bytes.fromhex(root))
                except AnchorNotSubmitted:
                    with conn, conn.cursor() as cur:
                        cur.execute("UPDATE anchor_batches SET state='failed' WHERE batch_id=%s", (batch_id,))
                    return "retry_pending"
                except AnchorPublicationError:
                    return "reconciliation_required"
            validate_receipt(receipt, root)
            with conn, conn.cursor() as cur:
                cur.execute("UPDATE anchor_batches SET state='confirmed',receipt=%s WHERE batch_id=%s", (Json(receipt), batch_id))
            return "confirmed"
        finally:
            # Closing the dedicated connection releases the session lock even
            # when validation or transport fails. Each tick acquires it afresh.
            conn.close()

    def proof(self, head_hex):
        """Private-data-free proof components; no HTTP surface is added here."""
        if not isinstance(head_hex, str) or re.fullmatch(r"[0-9a-f]{64}", head_hex) is None:
            raise ValueError("head must be lowercase 32-byte hex")
        with closing(self.connect()) as conn, conn, conn.cursor() as cur:
            cur.execute("SELECT root_hex,leaves,receipt FROM anchor_batches WHERE state='confirmed' AND leaves ? %s ORDER BY created_at LIMIT 1", (head_hex,))
            row = cur.fetchone()
        if row is None:
            return None
        root, leaves, receipt = row
        validate_receipt(receipt, root.strip())
        return {"proof": build_merkle_proof([bytes.fromhex(h) for h in leaves], leaves.index(head_hex)),
                "receipt": {key: receipt[key] for key in ("topic_id", "sequence_number", "consensus_timestamp", "running_hash", "topic_epoch")}}


def sim_stub_publish(_root):
    """SIMULATED unavailable transport: never fabricate a mirror receipt."""
    return publish_root(_root, sim_stub=True)


def main():
    import argparse
    import psycopg2
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sim-stub", action="store_true")
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()
    url = os.environ["DATABASE_URL"]
    worker = BatchCoordinator(lambda: psycopg2.connect(url),
                              publisher=sim_stub_publish if args.sim_stub else publish_root,
                              reconcile=None if args.sim_stub else reconcile_mirror_root)
    worker.initialize(datetime.now(timezone.utc))
    while True:
        print(worker.tick(datetime.now(timezone.utc)), flush=True)
        if args.once:
            return
        time.sleep(1)


if __name__ == "__main__":
    main()
