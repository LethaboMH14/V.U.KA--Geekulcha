"""Public, no-auth reads over confirmed anchor batches (GET /v1/anchor/*).

These never touch subject data: `anchor_batches.leaves` holds only chain-head
hex hashes (§6), never payloads. Read-only; the BatchCoordinator that writes
this table lives in server/anchoring.py and is not started here.
"""
import json
from pathlib import Path

from anchor.merkle import build_merkle_proof
from server.anchoring import validate_receipt

_MANIFEST_PATH = Path(__file__).resolve().parents[1] / "contracts" / "keys" / "manifest.json"


class ProofNotFound(LookupError):
    """No confirmed batch contains this head."""


def key_manifest() -> dict:
    return json.loads(_MANIFEST_PATH.read_text(encoding="utf8"))


def latest_anchor(cursor) -> dict | None:
    """The most recently confirmed batch's receipt, or None if none exists yet."""
    cursor.execute(
        "SELECT receipt FROM anchor_batches WHERE state='confirmed' ORDER BY created_at DESC LIMIT 1"
    )
    row = cursor.fetchone()
    if row is None:
        return None
    receipt = row[0]
    fields = ("topic_id", "sequence_number", "consensus_timestamp", "running_hash", "topic_epoch")
    return {key: receipt[key] for key in fields}


def anchor_proof(cursor, head_hex: str) -> dict:
    """Merkle audit path + receipt for a confirmed chain head. Raises ProofNotFound."""
    cursor.execute(
        "SELECT root_hex, leaves, receipt FROM anchor_batches "
        "WHERE state='confirmed' AND leaves ? %s ORDER BY created_at LIMIT 1",
        (head_hex,),
    )
    row = cursor.fetchone()
    if row is None:
        raise ProofNotFound(head_hex)
    root, leaves, receipt = row
    validate_receipt(receipt, root.strip())
    fields = ("topic_id", "sequence_number", "consensus_timestamp", "running_hash", "topic_epoch")
    return {
        "proof": build_merkle_proof([bytes.fromhex(h) for h in leaves], leaves.index(head_hex)),
        "receipt": {key: receipt[key] for key in fields},
    }
