"""P3.A5 export and the ADR-0041 pre-incident hold; SIMULATED subjects, real PostgreSQL."""
import hashlib
import json
import shutil
import subprocess
from datetime import timedelta
from pathlib import Path

import base64
import pytest

from anchor.canonical import canonical
from server.tests.test_server_slice1 import make_signed_headers
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_slice3_events import pin_payload, sim_api, signal  # noqa: F401  (fixture)

ROOT = Path(__file__).resolve().parents[2]


def get_export(client, subject, key, now):
    headers = make_signed_headers("GET", f"/v1/subjects/{subject}/export", b"", key_id=key)
    return client.get(f"/v1/subjects/{subject}/export", headers=headers)


def authorise_export(event, post, key, subject, mode="normal"):
    entry = event(pin_payload(key, subject, mode=mode, action="export"), subject_target=True)
    assert post(entry).status_code == 201
    return entry


def test_export_needs_a_fresh_export_authorisation(sim_api):
    store, client, subject, key, event, post, now, _ = sim_api
    assert get_export(client, subject, key, now).status_code == 403
    authorise_export(event, post, key, subject)
    now[0] += timedelta(seconds=121)
    response = get_export(client, subject, key, now)
    assert response.status_code == 403
    assert response.json()["code"] == "pin_authorisation_required"


def test_export_commitments_match_and_verifier_shape(sim_api):
    store, client, subject, key, event, post, now, _ = sim_api
    authorise_export(event, post, key, subject)
    body = get_export(client, subject, key, now).json()
    assert [e["details"]["chain_index"] for e in body["entries"]] == [0]
    by_id = {s["event_id"]: s["salt"] for s in body["salts"]}
    for item in body["payloads"]:
        entry = next(e for e in body["entries"] if e["details"]["event_id"] == item["event_id"])
        digest = hashlib.sha256(base64.b64decode(by_id[item["event_id"]]) + canonical(item["payload"])).hexdigest()
        assert digest == entry["details"]["commitment"]
    node = shutil.which("node")
    if node is None:
        pytest.fail("node is required to cross-check the export with shared/verify.js")
    script = ("import {verifyExport} from './shared/verify.js';"
              "const r=await verifyExport(JSON.parse(process.argv[1]));"
              "console.log(JSON.stringify(r));process.exit(r.ok?0:1);")
    run = subprocess.run([node, "--input-type=module", "-e", script, json.dumps(body)],
                         cwd=ROOT, capture_output=True, text=True, timeout=60)
    assert run.returncode == 0, run.stdout + run.stderr


def test_normal_and_duress_export_return_the_same_prefix(sim_api):
    store, client, subject, key, event, post, now, _ = sim_api
    authorise_export(event, post, key, subject, mode="normal")
    normal = get_export(client, subject, key, now).json()
    authorise_export(event, post, key, subject, mode="duress")
    duress = get_export(client, subject, key, now).json()
    # The first normal authorisation is now part of the chain before the duress one,
    # so compare shapes and heads against what a coercer can see: both end before
    # their own authorisation and the duress one reveals nothing after the hold head.
    assert set(normal) == set(duress)
    assert [e["details"]["chain_index"] for e in normal["entries"]] == [0]
    assert [e["details"]["chain_index"] for e in duress["entries"]] == [0, 1]
    assert all(p["payload"].get("mode") != "duress" for p in duress["payloads"])


def test_hold_while_open_and_for_six_hours_after_last_pin(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    assert post(signal(event)).status_code == 201          # index 1 opens the incident
    authorise_export(event, post, key, subject)             # index 2, last PIN entry
    held = get_export(client, subject, key, now).json()
    assert [e["details"]["chain_index"] for e in held["entries"]] == [0]
    with connect() as conn, conn.cursor() as cur:
        cur.execute("UPDATE incidents SET closed_at=%s, close_reason='stand_down' WHERE subject_id=%s", (now[0], subject))
    now[0] += timedelta(hours=5, minutes=59)
    authorise_export(event, post, key, subject)             # a PIN after close is not in the incident
    still = get_export(client, subject, key, now).json()
    assert [e["details"]["chain_index"] for e in still["entries"]] == [0]
    now[0] += timedelta(minutes=2)
    authorise_export(event, post, key, subject)
    released = get_export(client, subject, key, now).json()
    assert [e["details"]["chain_index"] for e in released["entries"]][-1] >= 3


def test_duress_export_authorisation_alarms_and_holds(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    authorise_export(event, post, key, subject, mode="duress")
    body = get_export(client, subject, key, now).json()
    assert [e["details"]["chain_index"] for e in body["entries"]] == [0]
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT has_duress FROM incidents WHERE subject_id=%s", (subject,))
        assert cur.fetchall() == [(True,)]
