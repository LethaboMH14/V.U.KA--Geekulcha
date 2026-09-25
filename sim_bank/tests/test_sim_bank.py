"""sim_bank over real HTTP semantics (TestClient) plus one live-socket S1 end-to-end run."""
import base64
import hashlib
import json
import socket
import threading
import time
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, NoEncryption, PrivateFormat, PublicFormat
from fastapi.testclient import TestClient

from anchor.canonical import canonical
from sim_bank.main import create_app

SERVER_KEY = Ed25519PrivateKey.generate()
OTHER_KEY = Ed25519PrivateKey.generate()
RISK, RELEASE = "/sim_bank/v1/risk-signal", "/sim_bank/v1/release"


def signed(path, body, *, key=SERVER_KEY, header_key=None, ts=None):
    raw = json.dumps(body).encode()
    ts = ts or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    nonce = str(uuid.uuid4())
    statement = {"method": "POST", "path": path, "ts": ts, "body_sha256": hashlib.sha256(raw).hexdigest(), "nonce": nonce}
    headers = {"X-Vuka-Ts": ts, "X-Vuka-Nonce": nonce, "Content-Type": "application/json",
               "X-Vuka-Server-Signature": base64.b64encode(key.sign(canonical(statement))).decode(),
               "Idempotency-Key": header_key if header_key is not None else body["idempotency_key"]}
    return raw, headers


@pytest.fixture
def bank():
    return TestClient(create_app(public_key=SERVER_KEY.public_key()))


def post(bank, path, body, **kw):
    raw, headers = signed(path, body, **kw)
    return bank.post(path, content=raw, headers=headers)


risk = lambda k, s="sim_a", t="duress_signal": {"subject_id": s, "triggering_outcome": t, "idempotency_key": k}  # noqa: E731
rel = lambda k, h, s="sim_a": {"subject_id": s, "hold_ref": h, "idempotency_key": k}  # noqa: E731


def test_wrong_signing_key_is_refused(bank):
    assert post(bank, RISK, risk("k1"), key=OTHER_KEY).status_code == 401


def test_changed_idempotency_header_is_refused(bank):
    r = post(bank, RISK, risk("k1"), header_key="k-other")
    assert r.status_code == 400 and r.json()["code"] == "idempotency_key_mismatch"


def test_same_key_different_body_is_409(bank):
    assert post(bank, RISK, risk("k1")).status_code == 202
    assert post(bank, RISK, risk("k1", t="no_answer")).status_code == 409


def test_repeated_signal_returns_the_original_receipt_and_one_hold(bank):
    first = post(bank, RISK, risk("k1")).json()
    again = post(bank, RISK, risk("k1")).json()
    assert first == again and first["sim"] is True
    assert len(bank.app.state.sim_state["holds"]) == 1


def test_release_one_of_two_holds(bank):
    a = post(bank, RISK, risk("k1")).json()["hold_ref"]
    b = post(bank, RISK, risk("k2")).json()["hold_ref"]
    assert post(bank, RELEASE, rel("k3", a)).status_code == 202
    holds = bank.app.state.sim_state["holds"]
    assert holds[a]["released"] and not holds[b]["released"]
    r = post(bank, RELEASE, rel("k4", a))
    assert r.status_code == 409 and r.json()["code"] == "hold_already_released"


def test_unknown_or_foreign_hold_is_404(bank):
    a = post(bank, RISK, risk("k1")).json()["hold_ref"]
    assert post(bank, RELEASE, rel("k2", "sim_hold_999")).status_code == 404
    assert post(bank, RELEASE, rel("k3", a, s="sim_b")).json()["code"] == "unknown_hold"


def test_stale_timestamp_and_non_sim_subject_are_refused(bank):
    old = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat().replace("+00:00", "Z")
    assert post(bank, RISK, risk("k1"), ts=old).status_code == 401
    assert post(bank, RISK, risk("k2", s="real_subject")).status_code == 400


def test_restart_forgets_holds_stated_limitation():
    """In-memory by design: a new process has no holds. Proven, not hidden."""
    first = TestClient(create_app(public_key=SERVER_KEY.public_key()))
    post(first, RISK, risk("k1"))
    second = TestClient(create_app(public_key=SERVER_KEY.public_key()))
    assert second.app.state.sim_state["holds"] == {}


def test_real_manifest_key_loads_as_raw_ed25519():
    from server.server_signing import _pinned_public_key
    from sim_bank.main import _pinned_key
    raw = _pinned_public_key()
    assert len(raw) == 32
    assert _pinned_key().public_bytes(Encoding.Raw, PublicFormat.Raw) == raw


def _free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def test_end_to_end_s1_over_a_real_socket(monkeypatch):
    """ANCHOR's own SimBankHTTP client and signer against a live sim_bank process."""
    import uvicorn
    from server import bank_worker, server_signing
    monkeypatch.setenv("VUKA_SERVER_ED25519_KEY_B64", base64.b64encode(
        SERVER_KEY.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())).decode())
    monkeypatch.setattr(server_signing, "_pinned_public_key",
                        lambda: SERVER_KEY.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw))
    app = create_app(public_key=SERVER_KEY.public_key())
    port = _free_port()
    server = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning"))
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    for _ in range(100):
        if server.started:
            break
        time.sleep(0.05)
    try:
        body = canonical({"subject_id": "sim_e2e", "triggering_outcome": "no_answer", "idempotency_key": "bank:e2e"})
        ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        nonce = str(uuid.uuid4())
        statement = {"method": "POST", "path": RISK, "ts": ts, "body_sha256": hashlib.sha256(body).hexdigest(), "nonce": nonce}
        headers = {"X-Vuka-Ts": ts, "X-Vuka-Nonce": nonce, "Idempotency-Key": "bank:e2e",
                   "X-Vuka-Server-Signature": server_signing.sign_server_bytes(canonical(statement))}
        receipt = bank_worker.SimBankHTTP(f"http://127.0.0.1:{port}").send(body, headers)
        assert receipt["sim"] is True and receipt["hold_ref"].startswith("sim_hold_")
        assert app.state.sim_state["holds"][receipt["hold_ref"]]["triggering_outcome"] == "no_answer"
    finally:
        server.should_exit = True
        thread.join(timeout=5)
