"""PROPOSED live streams: /ws/panel (public) and /ws/member (the subject's own device).

Both poll chain_entries rather than use an in-process pub/sub. The scheduler and
outbox workers are separate processes, so only the database sees every append.

/ws/panel: every accepted append as {subject: opaque, chain_index, event_hash,
received_at}. The kind (from the decrypted payload) is added ONLY for sim_
subjects, labelled simulated. Subject ids are replaced by a salted hash that
changes every process start, so the panel cannot be used to follow a person.

/ws/member: the authenticated subject's own entries, opaque (no kind: a kind or
result on the phone could tell a coercer that duress was entered, V5/V8), and
cut at the pre-incident head while the T30 hold applies (V8, ADR-0041).
"""
import hashlib
import os

from server.payload_store import decrypt_payload

_PANEL_SALT = os.urandom(16)


def opaque_subject(subject_id: str) -> str:
    return hashlib.sha256(_PANEL_SALT + subject_id.encode("utf-8")).hexdigest()[:16]


def _cursor_now(cur):
    # Compared as timestamptz: ISO strings with and without fractional seconds
    # do not sort correctly as text.
    cur.execute("""SELECT COALESCE(max((details_json->>'received_at')::timestamptz), '-infinity')::text
                   FROM chain_entries""")
    # Start after everything already stored, including rows sharing the latest instant
    # ("~" sorts after ASCII ids under the C collation used in the query).
    return (cur.fetchone()[0], "~" * 64, 2 ** 62)


def start_cursor(store):
    connection = store._connection()
    try:
        with connection, connection.cursor() as cur:
            return _cursor_now(cur)
    finally:
        connection.close()


_NEW_ROWS_SQL = """SELECT subject_id, chain_index, event_hash, details_json->>'received_at' AS received_at,
        details_json->>'event_id' AS event_id
    FROM chain_entries
    WHERE ((details_json->>'received_at')::timestamptz, subject_id COLLATE "C", chain_index)
          > (%s::timestamptz, %s COLLATE "C", %s)
    {extra}
    ORDER BY (details_json->>'received_at')::timestamptz, subject_id COLLATE "C", chain_index
    LIMIT 100"""


def _kind(cur, store, subject_id, event_id):
    cur.execute("SELECT nonce, ciphertext FROM private_payloads WHERE subject_id=%s AND event_id=%s",
                (subject_id, event_id))
    row = cur.fetchone()
    if row is None:
        return None
    private = decrypt_payload(store._payload_key(), subject_id=subject_id, event_id=event_id,
                              nonce=bytes(row[0]), ciphertext=bytes(row[1]))
    return private["payload"].get("kind")


def panel_batch(store, cursor):
    """Returns (messages, new_cursor)."""
    connection = store._connection()
    try:
        with connection, connection.cursor() as cur:
            cur.execute(_NEW_ROWS_SQL.format(extra=""), cursor)
            rows = cur.fetchall()
            messages = []
            for subject_id, index, event_hash, received_at, event_id in rows:
                message = {"subject": opaque_subject(subject_id), "chain_index": index,
                           "event_hash": event_hash.strip(), "received_at": received_at}
                if subject_id.startswith("sim_"):
                    message["kind"] = _kind(cur, store, subject_id, event_id)
                    message["simulated"] = True
                messages.append(message)
            if rows:
                last = rows[-1]
                cursor = (last[3], last[0], last[1])
            return messages, cursor
    finally:
        connection.close()


def member_batch(store, subject_id, cursor, now):
    from server.export_view import held_head_index
    connection = store._connection()
    try:
        with connection, connection.cursor() as cur:
            held = held_head_index(cur, subject_id, now)
            extra = "AND subject_id = %s" + (" AND chain_index <= %s" if held is not None else "")
            params = (*cursor, subject_id) + ((held,) if held is not None else ())
            cur.execute(_NEW_ROWS_SQL.format(extra=extra), params)
            rows = cur.fetchall()
            messages = [{"chain_index": index, "event_hash": event_hash.strip(), "received_at": received_at}
                        for _s, index, event_hash, received_at, _e in rows]
            if rows:
                last = rows[-1]
                cursor = (last[3], last[0], last[1])
            return messages, cursor
    finally:
        connection.close()
