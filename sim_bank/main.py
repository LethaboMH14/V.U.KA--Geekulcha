"""SIMULATED bank for S1 (PROPOSED). Never a real bank; every receipt says sim: true.

Implements the contract on #51 (`/sim_bank/v1/risk-signal`, `/sim_bank/v1/release`)
with the same rules as the in-test model in `test/sim-bank-contract.test.mjs`:
- the request must carry ANCHOR's Ed25519 signature over
  canonical({method, path, ts, body_sha256, nonce}), verified only against the
  pinned key in contracts/keys/manifest.json;
- the Idempotency-Key header must equal the signed body's idempotency_key;
- same key + same body replays the receipt; same key + different body is 409;
- risk-signal opens one hold per new key and names it with hold_ref;
- release lifts exactly the named hold of the named subject.

State is in memory: a restart forgets holds. That is a stated limitation of a
simulation, not a hidden one.
"""
from __future__ import annotations

import base64
import binascii
import hashlib
import json
import threading
from datetime import datetime, timezone
from pathlib import Path

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from fastapi import FastAPI, Request
from starlette.responses import JSONResponse

from anchor.canonical import canonical

MAX_SKEW_SECONDS = 120
_MANIFEST = Path(__file__).resolve().parents[1] / "contracts" / "keys" / "manifest.json"


def _pinned_key() -> Ed25519PublicKey:
    """The manifest holds base64 SPKI DER (shared/keys.js)."""
    from cryptography.hazmat.primitives.serialization import load_der_public_key
    manifest = json.loads(_MANIFEST.read_text(encoding="utf8"))
    key = load_der_public_key(base64.b64decode(manifest["server_ed25519_public_key"], validate=True))
    if not isinstance(key, Ed25519PublicKey):
        raise ValueError("manifest server key is not Ed25519")
    return key


def _error(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"code": code, "message": message})


def create_app(public_key: Ed25519PublicKey | None = None, clock=None) -> FastAPI:
    app = FastAPI(title="sim_bank (SIMULATED)")
    key = public_key or _pinned_key()
    now = clock or (lambda: datetime.now(timezone.utc))
    lock = threading.Lock()
    state = {"receipts": {}, "holds": {}, "seq": 0, "nonces": set()}
    app.state.sim_state = state

    def authenticate(request: Request, raw: bytes):
        ts = request.headers.get("X-Vuka-Ts")
        nonce = request.headers.get("X-Vuka-Nonce")
        sig = request.headers.get("X-Vuka-Server-Signature")
        if not (ts and nonce and sig):
            return _error(401, "unauthorized", "signed headers are required")
        statement = {"method": "POST", "path": request.url.path, "ts": ts,
                     "body_sha256": hashlib.sha256(raw).hexdigest(), "nonce": nonce}
        try:
            key.verify(base64.b64decode(sig, validate=True), canonical(statement))
            sent = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except (InvalidSignature, ValueError, binascii.Error):
            return _error(401, "unauthorized", "server signature is invalid")
        if abs((sent - now()).total_seconds()) > MAX_SKEW_SECONDS:
            return _error(401, "unauthorized", "request timestamp is outside the allowed window")
        if nonce in state["nonces"]:
            return _error(401, "unauthorized", "nonce was already used")
        state["nonces"].add(nonce)
        return None

    def parse(request: Request, raw: bytes, required: set[str]):
        try:
            body = json.loads(raw)
        except ValueError:
            return None, _error(400, "invalid_request", "body is not JSON")
        if not isinstance(body, dict) or set(body) != required or not all(
            isinstance(body[k], str) and body[k] for k in required
        ):
            return None, _error(400, "invalid_request", "body shape is invalid")
        if not body["subject_id"].startswith("sim_"):
            return None, _error(400, "invalid_request", "sim_bank accepts sim_ subjects only")
        if request.headers.get("Idempotency-Key") != body["idempotency_key"]:
            return None, _error(400, "idempotency_key_mismatch", "Idempotency-Key must equal the signed body key")
        return body, None

    def replay(path: str, body: dict, raw: bytes):
        memo = state["receipts"].get(path + "|" + body["idempotency_key"])
        if memo is None:
            return None
        if memo["body_sha256"] != hashlib.sha256(raw).hexdigest():
            return _error(409, "idempotency_conflict", "same key with a different body")
        return JSONResponse(status_code=202, content=memo["receipt"])

    def remember(path: str, body: dict, raw: bytes, receipt: dict) -> JSONResponse:
        state["receipts"][path + "|" + body["idempotency_key"]] = {
            "body_sha256": hashlib.sha256(raw).hexdigest(), "receipt": receipt}
        return JSONResponse(status_code=202, content=receipt)

    @app.post("/sim_bank/v1/risk-signal")
    async def risk_signal(request: Request):
        raw = await request.body()
        with lock:
            refused = authenticate(request, raw)
            if refused:
                return refused
            body, refused = parse(request, raw, {"subject_id", "triggering_outcome", "idempotency_key"})
            if refused:
                return refused
            if body["triggering_outcome"] not in ("duress_signal", "no_answer", "contact_lost"):
                return _error(400, "invalid_request", "triggering_outcome is not a qualifying S1 trigger")
            prior = replay(request.url.path, body, raw)
            if prior is not None:
                return prior
            state["seq"] += 1
            hold_ref = f"sim_hold_{state['seq']}"
            state["holds"][hold_ref] = {"subject_id": body["subject_id"], "released": False,
                                        "triggering_outcome": body["triggering_outcome"]}
            receipt = {"receipt_id": f"sim_r_{state['seq']}", "state": "accepted", "sim": True, "hold_ref": hold_ref}
            return remember(request.url.path, body, raw, receipt)

    @app.post("/sim_bank/v1/release")
    async def release(request: Request):
        raw = await request.body()
        with lock:
            refused = authenticate(request, raw)
            if refused:
                return refused
            body, refused = parse(request, raw, {"subject_id", "hold_ref", "idempotency_key"})
            if refused:
                return refused
            prior = replay(request.url.path, body, raw)
            if prior is not None:
                return prior
            hold = state["holds"].get(body["hold_ref"])
            if hold is None or hold["subject_id"] != body["subject_id"]:
                return _error(404, "unknown_hold", "no such hold for this subject")
            if hold["released"]:
                return _error(409, "hold_already_released", "hold was already released")
            hold["released"] = True
            state["seq"] += 1
            receipt = {"receipt_id": f"sim_r_{state['seq']}", "state": "accepted", "sim": True}
            return remember(request.url.path, body, raw, receipt)

    @app.get("/healthz")
    async def healthz():
        return {"status": "ok", "sim": True}

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8100)
