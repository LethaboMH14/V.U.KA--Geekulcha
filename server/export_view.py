"""P3.A5 member-device export with ADR-0041's pre-incident hold (T30).

Caller holds the subject_heads row lock, so the chain cannot move under the
read. PROPOSED detail (Sibusiso, 25 Sep): the export always ends before the
authorising pin_authorised event, so a normal and a duress authorisation
return the same prefix even when no incident was open beforehand.
"""
from datetime import timedelta

from server.db import _row_entry
from server.payload_store import decrypt_payload
from server.pin_records import EventRefused

HOLD_AFTER_LAST_PIN = timedelta(hours=6)


def _authorising_index(cur, subject_id, now):
    cur.execute("""SELECT event_id FROM pin_authorisations
        WHERE subject_id=%s AND action='export' AND target_id=%s
          AND expires_at > %s AND consumed_at IS NULL
        ORDER BY expires_at DESC, event_id DESC LIMIT 1""", (subject_id, subject_id, now))
    row = cur.fetchone()
    if row is None:
        raise EventRefused("pin_authorisation_required", 403)
    cur.execute("SELECT chain_index FROM chain_entries WHERE subject_id=%s AND details_json->>'event_id'=%s",
                (subject_id, row[0]))
    return cur.fetchone()[0]


def held_head_index(cur, subject_id, now):
    """Pre-incident head index of the earliest incident still under hold, or None.

    Held while open, and until 6 h after its last PIN entry, whichever ends later.
    """
    cur.execute("""SELECT pre_incident_head FROM incidents
        WHERE subject_id=%s AND (closed_at IS NULL OR (last_pin_at IS NOT NULL AND last_pin_at + %s > %s))
        ORDER BY opened_at ASC LIMIT 1""", (subject_id, HOLD_AFTER_LAST_PIN, now))
    row = cur.fetchone()
    if row is None:
        return None
    cur.execute("SELECT chain_index FROM chain_entries WHERE subject_id=%s AND event_hash=%s",
                (subject_id, row[0].strip()))
    return cur.fetchone()[0]


def _anchor_material(cur, head_hex):
    cur.execute("SELECT to_regclass('anchor_batches') IS NOT NULL")
    if not cur.fetchone()[0]:
        return [], []
    from server.anchoring import build_merkle_proof, validate_receipt
    cur.execute("""SELECT root_hex,leaves,receipt FROM anchor_batches
        WHERE state='confirmed' AND leaves ? %s ORDER BY created_at LIMIT 1""", (head_hex,))
    row = cur.fetchone()
    if row is None:
        return [], []
    root, leaves, receipt = row
    validate_receipt(receipt, root.strip())
    proof = build_merkle_proof([bytes.fromhex(h) for h in leaves], leaves.index(head_hex))
    fields = ("topic_id", "sequence_number", "consensus_timestamp", "running_hash", "topic_epoch")
    return [proof], [{k: receipt[k] for k in fields}]


def build_export(cur, store, subject_id, now):
    head = _authorising_index(cur, subject_id, now) - 1
    held = held_head_index(cur, subject_id, now)
    if held is not None:
        head = min(head, held)
    cur.execute("""SELECT action,actor_id,target_type,target_id,details_json,ts,prev_hash,event_hash
        FROM chain_entries WHERE subject_id=%s AND chain_index<=%s ORDER BY chain_index""", (subject_id, head))
    columns = ("action", "actor_id", "target_type", "target_id", "details_json", "ts", "prev_hash", "event_hash")
    entries = [_row_entry(dict(zip(columns, row))) for row in cur.fetchall()]
    event_ids = [e["details"].get("event_id") for e in entries if e["details"].get("event_id")]
    payloads, salts = [], []
    if event_ids:
        cur.execute("SELECT event_id,nonce,ciphertext FROM private_payloads WHERE subject_id=%s AND event_id = ANY(%s)",
                    (subject_id, event_ids))
        found = {r[0]: r for r in cur.fetchall()}
        for event_id in event_ids:
            if event_id not in found:
                continue
            _, nonce, ciphertext = found[event_id]
            private = decrypt_payload(store._payload_key(), subject_id=subject_id, event_id=event_id,
                                      nonce=bytes(nonce), ciphertext=bytes(ciphertext))
            payloads.append({"event_id": event_id, "payload": private["payload"]})
            salts.append({"event_id": event_id, "salt": private["salt"]})
    proofs, receipts = _anchor_material(cur, entries[-1]["event_hash"]) if entries else ([], [])
    return {"subject_id": subject_id, "entries": entries, "payloads": payloads,
            "salts": salts, "proofs": proofs, "receipts": receipts}
