"""PROPOSED (ADR-0048): where the member is, only while guardians have been alerted.

The phone sends a fix every 30 s for 30 minutes after any check-in opens,
after either PIN alike (V5): it must never know whether an alert was raised
(T30). The server keeps a fix only while the member has an open incident for
which a guardian alert was requested; every other fix is dropped at once and
never stored or logged. The phone gets the same 202 either way.

Stored fixes are read only through the alerts route, by an active guardian
the alert was delivered to. They stop at incident close and are purged 24 h
after it, and with the rest of the member's data on subject deletion.
"""
from datetime import timedelta

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS incident_locations (
    id BIGSERIAL PRIMARY KEY,
    incident_id UUID NOT NULL, subject_id TEXT NOT NULL, journey_id TEXT NOT NULL,
    lat_e7 INTEGER NOT NULL, lon_e7 INTEGER NOT NULL, acc_m INTEGER NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL, received_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS incident_locations_by_incident ON incident_locations(incident_id, captured_at);
"""

RETENTION = timedelta(hours=24)
TRAIL = 20
FIELDS = {"lat_e7", "lon_e7", "acc_m", "fix_age_ms", "ts"}


def valid_fix(body) -> bool:
    """Exactly the fields, integers in range (spec §5: no floats)."""
    if not isinstance(body, dict) or set(body) != FIELDS:
        return False
    ints = {"lat_e7": (-900_000_000, 900_000_000), "lon_e7": (-1_800_000_000, 1_800_000_000),
            "acc_m": (0, 100_000), "fix_age_ms": (0, 3_600_000)}
    for k, (lo, hi) in ints.items():
        v = body[k]
        if type(v) is not int or not lo <= v <= hi:
            return False
    return isinstance(body["ts"], str)


def store_fix(cur, subject_id, journey_id, fix, now) -> bool:
    """Keep the fix only while an alerted incident is open. Returns whether it was kept."""
    cur.execute(
        """SELECT i.incident_id FROM incidents i
           WHERE i.subject_id=%s AND i.closed_at IS NULL
             AND EXISTS (SELECT 1 FROM outbox o WHERE o.kind='guardian_alert' AND o.reference_id=i.incident_id::text)""",
        (subject_id,),
    )
    row = cur.fetchone()
    if row is None:
        return False
    cur.execute(
        """INSERT INTO incident_locations(incident_id,subject_id,journey_id,lat_e7,lon_e7,acc_m,captured_at,received_at)
           VALUES(%s,%s,%s,%s,%s,%s,%s,%s)""",
        (row[0], subject_id, journey_id, fix["lat_e7"], fix["lon_e7"], fix["acc_m"],
         now - timedelta(milliseconds=fix["fix_age_ms"]), now),
    )
    return True


def location_for(cur, incident_id):
    """The last fix and a short trail (oldest first), or None."""
    cur.execute(
        """SELECT lat_e7, lon_e7, acc_m, captured_at FROM incident_locations
           WHERE incident_id::text=%s ORDER BY captured_at DESC, id DESC LIMIT %s""",
        (incident_id, TRAIL),
    )
    rows = cur.fetchall()
    if not rows:
        return None
    lat, lon, acc, at = rows[0]
    return {
        "last": {"lat_e7": lat, "lon_e7": lon, "acc_m": acc, "at": at.isoformat()},
        "trail": [{"lat_e7": r[0], "lon_e7": r[1], "at": r[3].isoformat()} for r in reversed(rows)],
    }


def purge_closed(cur, now) -> int:
    """Fixes of incidents closed more than 24 h ago."""
    cur.execute(
        """DELETE FROM incident_locations l USING incidents i
           WHERE l.incident_id=i.incident_id AND i.closed_at IS NOT NULL AND i.closed_at < %s""",
        (now - RETENTION,),
    )
    return cur.rowcount


def purge_subject(cur, subject_id) -> int:
    cur.execute("DELETE FROM incident_locations WHERE subject_id=%s", (subject_id,))
    return cur.rowcount
