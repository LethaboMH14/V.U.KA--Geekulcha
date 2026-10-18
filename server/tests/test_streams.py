"""PROPOSED /ws/panel and /ws/member; SIMULATED subjects, real PostgreSQL."""
import pytest
from starlette.websockets import WebSocketDisconnect

from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_server_slice1 import make_signed_headers
from server.tests.test_slice3_events import pin_payload, signal, sim_api  # noqa: F401  (fixture)


@pytest.fixture(autouse=True)
def _fast_poll(monkeypatch):
    monkeypatch.setenv("VUKA_STREAM_POLL_SECONDS", "0.05")


def test_panel_streams_new_appends_opaquely_with_kind_only_for_sim(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    with client.websocket_connect("/ws/panel") as ws:
        from datetime import timedelta
        now[0] += timedelta(seconds=1)  # the stream starts after everything already stored
        assert post(signal(event)).status_code == 201
        message = ws.receive_json()
    assert set(message) == {"subject", "chain_index", "event_hash", "received_at", "kind", "simulated"}
    assert message["kind"] == "signal_detected" and message["simulated"] is True
    assert subject not in str(message)  # never the real subject id


def test_panel_hides_kind_for_non_sim_subjects(sim_api):
    from server import streams
    store, *_ = sim_api
    with store._connection() as conn, conn.cursor() as cur:
        cur.execute("""INSERT INTO chain_entries(subject_id,chain_index,action,actor_id,target_type,target_id,details_json,ts,prev_hash,event_hash)
            VALUES('real_subject',0,'registration','a','subject','real_subject','{"received_at":"2099-01-01T00:00:00Z","event_id":"x"}','t',%s,%s)""",
                    ("0" * 64, "f" * 64))
    messages, _ = streams.panel_batch(store, ("2000-01-01T00:00:00Z", "", -1))
    real = [m for m in messages if m["event_hash"] == "f" * 64]
    assert real and "kind" not in real[0] and "simulated" not in real[0]


def member_headers(key, nonce=None):
    headers = make_signed_headers("GET", "/ws/member", b"", key_id=key, nonce=nonce)
    return headers


def test_member_stream_needs_a_valid_signed_handshake(sim_api):
    store, client, subject, key, *_ = sim_api
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/ws/member") as ws:
            ws.receive_json()
    headers = member_headers(key)
    headers["X-Vuka-Signature"] = headers["X-Vuka-Signature"][:-4] + "AAA="
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/ws/member", headers=headers) as ws:
            ws.receive_json()


def test_member_stream_is_opaque_and_own_subject(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    with client.websocket_connect("/ws/member", headers=member_headers(key)) as ws:
        from datetime import timedelta
        now[0] += timedelta(seconds=1)
        entry = event(pin_payload(key, subject, action="export"), subject_target=True)
        assert post(entry).status_code == 201
        message = ws.receive_json()
    assert set(message) == {"chain_index", "event_hash", "received_at"}


def test_member_stream_withholds_events_after_the_pre_incident_head(sim_api):
    from server import streams
    store, client, subject, key, event, post, now, connect = sim_api
    start = ("2000-01-01T00:00:00Z", "", -1)
    assert post(signal(event)).status_code == 201  # opens an incident; pre-incident head = index 0
    messages, _ = streams.member_batch(store, subject, start, now[0])
    assert [m["chain_index"] for m in messages] == [0]
