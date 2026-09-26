"""Real PostgreSQL boundary test; set VUKA_TEST_DATABASE_URL to run it."""

from __future__ import annotations

import os
import uuid
import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from server.db import PostgresDatabase
from server.main import create_app
from server.payload_store import decrypt_payload
from server.tests.test_server_slice1 import (
    SIM_PUBLIC_KEY,
    make_entry,
    sign_event_entry,
    signed_export,
    signed_post,
)


@pytest.mark.skipif(not os.getenv("VUKA_TEST_DATABASE_URL"), reason="test PostgreSQL URL not set")
def test_postgres_signed_registration_append_retry_actor_binding_and_export():
    database_url = os.environ["VUKA_TEST_DATABASE_URL"]
    suffix = uuid.uuid4().hex
    subject_id = f"sim_pg_subject_{suffix}"
    key_id = f"sim_pg_key_{suffix}"
    sim_payload_key = bytes(range(32))
    database = PostgresDatabase(
        database_url=database_url,
        payload_key_b64=base64.b64encode(sim_payload_key).decode("ascii"),
    )

    registration = make_entry(action="registration")
    registration["target_id"] = subject_id
    registration["details"]["signer_key_id"] = key_id
    registration["details"]["signer_pubkey"] = SIM_PUBLIC_KEY
    registration["details"]["counter"] = 0
    sign_event_entry(registration, subject_id=subject_id)

    with TestClient(create_app(database)) as client:
        created = signed_post(client, registration, nonce=f"sim_pg_register_{suffix}")
        assert created.status_code == 201, created.text
        assert created.json()["chain_index"] == 0

        event = make_entry()
        event["target_id"] = subject_id
        event["details"]["signer_key_id"] = key_id
        sign_event_entry(event, subject_id=subject_id)
        appended = signed_post(client, event, nonce=f"sim_pg_append_{suffix}")
        assert appended.status_code == 201, appended.text
        assert appended.json()["chain_index"] == 1

        retry = signed_post(client, event, nonce=f"sim_pg_append_{suffix}")
        assert retry.status_code == 201, retry.text
        assert retry.json() == appended.json()

        other_actor = make_entry()
        other_actor["target_id"] = subject_id
        other_actor["actor_id"] = "sim_impersonated_actor"
        other_actor["details"]["signer_key_id"] = key_id
        other_actor["details"]["counter"] = 2
        sign_event_entry(other_actor, subject_id=subject_id)
        refused = signed_post(client, other_actor)
        assert refused.status_code == 401
        assert refused.json()["code"] == "invalid_signature"

        concurrent = []
        for counter in (2, 3):
            next_entry = make_entry()
            next_entry["target_id"] = subject_id
            next_entry["details"]["signer_key_id"] = key_id
            next_entry["details"]["counter"] = counter
            sign_event_entry(next_entry, subject_id=subject_id)
            concurrent.append(next_entry)
        received_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        def append_direct(item):
            return database.append(
                subject_id, item, received_at,
                signer_key_id=key_id, signer_role="device",
                nonce=f"sim_pg_concurrent_{item['details']['counter']}_{suffix}",
                request_ts=received_at,
            )

        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(append_direct, concurrent))
        assert sorted(row["details"]["chain_index"] for row, _created in results) == [2, 3]

        exported = signed_export(client, subject_id, key_id=key_id)
        assert exported.status_code == 403, exported.text
        assert exported.json()["code"] == "pin_authorisation_required"
        assert len(database.export(subject_id)) == 4

    import psycopg2

    with psycopg2.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT actor_id FROM signer_keys WHERE signer_key_id = %s", (key_id,))
            assert cursor.fetchone() == ("sim_device_1",)
            cursor.execute("SELECT count(*) FROM chain_entries WHERE subject_id = %s", (subject_id,))
            assert cursor.fetchone() == (4,)
            cursor.execute("SELECT chain_index FROM subject_heads WHERE subject_id = %s", (subject_id,))
            assert cursor.fetchone() == (3,)
            cursor.execute(
                "SELECT event_id, nonce, ciphertext FROM private_payloads WHERE subject_id = %s",
                (subject_id,),
            )
            encrypted = {event_id: (bytes(nonce), bytes(ciphertext)) for event_id, nonce, ciphertext in cursor.fetchall()}
            assert set(encrypted) == {
                registration["details"]["event_id"], event["details"]["event_id"],
                *(item["details"]["event_id"] for item in concurrent),
            }
            nonce, ciphertext = encrypted[event["details"]["event_id"]]
            assert b"sim_value" not in ciphertext
            assert decrypt_payload(
                sim_payload_key, subject_id=subject_id,
                event_id=event["details"]["event_id"], nonce=nonce, ciphertext=ciphertext,
            ) == {"payload": event["payload"], "salt": event["salt"]}
