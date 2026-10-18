"""PROPOSED DELETE /v1/subjects/{id}/data (F15, \u00a713/\u00a79); SIMULATED subjects, real PostgreSQL."""
from datetime import timedelta

from server.deletion import due_purges, purge_payloads
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_export_hold import authorise_export, get_export
from server.tests.test_server_slice1 import make_signed_headers
from server.tests.test_slice3_events import pin_payload, sim_api  # noqa: F401  (fixture)


def delete_data(client, key, subject, now):
    # Unlike event submission, request-header clock skew is checked against real
    # wall-clock time (server/db.py consume_request_nonce), not the fixture's
    # simulated event clock — same reason test_export_hold.get_export omits ts=.
    headers = make_signed_headers("DELETE", f"/v1/subjects/{subject}/data", b"", key_id=key)
    return client.delete(f"/v1/subjects/{subject}/data", headers=headers)


def authorise_delete(event, post, key, subject, *, mode="normal"):
    entry = event(pin_payload(key, subject, mode=mode, action="delete"), subject_target=True)
    assert post(entry).status_code == 201


def test_delete_needs_a_fresh_delete_authorisation(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    response = delete_data(client, key, subject, now)
    assert response.status_code == 403
    assert response.json()["code"] == "pin_authorisation_required"


def test_normal_delete_schedules_a_72h_purge_and_notifies_guardians(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    authorise_delete(event, post, key, subject)
    response = delete_data(client, key, subject, now)
    assert response.status_code == 202
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT purge_due_at, purged_at FROM deletion_requests WHERE subject_id=%s", (subject,))
        due, purged = cur.fetchone()
        assert purged is None
        assert due - now[0] >= timedelta(hours=71, minutes=59)
        cur.execute("SELECT kind FROM guardian_notifications WHERE subject_id=%s", (subject,))
        assert cur.fetchone() == ("deletion_requested",)


def test_duress_delete_looks_identical_and_purges_nothing(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    authorise_delete(event, post, key, subject, mode="duress")
    response = delete_data(client, key, subject, now)
    assert response.status_code == 202
    with connect() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM deletion_requests WHERE subject_id=%s", (subject,))
        assert cur.fetchone() == (0,)
        cur.execute("SELECT has_duress FROM incidents WHERE subject_id=%s", (subject,))
        assert cur.fetchone() == (True,)  # the pin_authorised event itself still raises the alarm


def test_delete_is_refused_while_frozen(sim_api):
    from server.recovery import set_freeze
    store, client, subject, key, event, post, now, connect = sim_api
    with connect() as conn, conn.cursor() as cur:
        set_freeze(cur, subject, now[0])
    authorise_delete(event, post, key, subject)
    response = delete_data(client, key, subject, now)
    assert response.status_code == 403
    assert response.json()["code"] == "pin_authorisation_required"


def test_authorisation_is_single_use(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    authorise_delete(event, post, key, subject)
    assert delete_data(client, key, subject, now).status_code == 202
    assert delete_data(client, key, subject, now).status_code == 403


def test_purge_removes_private_payloads_created_before_the_request_but_keeps_the_chain(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    authorise_export(event, post, key, subject)  # a private payload to purge
    authorise_delete(event, post, key, subject)
    assert delete_data(client, key, subject, now).status_code == 202
    later = now[0] + timedelta(hours=72, minutes=1)
    with connect() as conn, conn.cursor() as cur:
        assert due_purges(cur, later) == [subject]
        removed = purge_payloads(cur, subject, later)
        assert removed >= 1
        assert due_purges(cur, later) == []
        cur.execute("SELECT count(*) FROM chain_entries WHERE subject_id=%s", (subject,))
        chain_count_before = cur.fetchone()[0]
    entries = store.export(subject)
    assert len(entries) == chain_count_before  # chain entries and their public hashes survive


def test_purge_does_not_remove_a_payload_created_after_the_request(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    authorise_delete(event, post, key, subject)
    assert delete_data(client, key, subject, now).status_code == 202
    now[0] += timedelta(seconds=1)  # a later instant, strictly after the deletion request
    authorise_export(event, post, key, subject)  # a NEW payload, created after the deletion request
    later = now[0] + timedelta(hours=72, minutes=1)
    with connect() as conn, conn.cursor() as cur:
        purge_payloads(cur, subject, later)
        cur.execute("SELECT count(*) FROM private_payloads WHERE subject_id=%s", (subject,))
        assert cur.fetchone()[0] >= 1  # the later payload survives this purge


def test_export_still_works_after_purge_since_it_only_reads_payloads_it_finds(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    authorise_delete(event, post, key, subject)
    assert delete_data(client, key, subject, now).status_code == 202
    later = now[0] + timedelta(hours=73)
    with connect() as conn, conn.cursor() as cur:
        purge_payloads(cur, subject, later)
    now[0] = later
    authorise_export(event, post, key, subject)
    response = get_export(client, subject, key, now)
    assert response.status_code == 200

