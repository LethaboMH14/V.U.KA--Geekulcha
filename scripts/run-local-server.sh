#!/usr/bin/env bash
# Runs the ANCHOR server locally for app development: the outbox workers plus
# uvicorn on :8000, against a local PostgreSQL. A phone or emulator reaches it
# after `adb reverse tcp:8000 tcp:8000` at http://localhost:8000
# (in the app: Settings → VUKA server → This computer).
#
# One-time setup (Windows paths shown; any PostgreSQL 16+ works):
#   python -m venv .venv && .venv/Scripts/python -m pip install -r requirements.txt
#   initdb -D .venv/pgdata -U vuka --auth=trust -E UTF8 --locale=C
#   pg_ctl -D .venv/pgdata -o "-p 55441 -c listen_addresses=127.0.0.1" -l .venv/pg.log start
#   createdb -h 127.0.0.1 -p 55441 -U vuka vuka
#
# Codes (email/SMS one-time codes) are delivered by SMTP / Twilio when their
# settings are present (see server/notify.py). Without them, VUKA_DEV_OTP_LOG=1
# prints codes to THIS console only (never to the app or an API response).
# Simulation subjects only (VUKA_SIM_ONLY=1). Never point this at real people.
set -euo pipefail
cd "$(dirname "$0")/.."

PY=".venv/Scripts/python"
[ -x "$PY" ] || PY=".venv/bin/python"

export DATABASE_URL="${DATABASE_URL:-postgresql://vuka@127.0.0.1:55441/vuka}"
if [ -z "${VUKA_PAYLOAD_KEY_B64:-}" ]; then
  [ -f .venv/payload_key.txt ] || "$PY" -c "import os,base64;print(base64.b64encode(os.urandom(32)).decode())" > .venv/payload_key.txt
  export VUKA_PAYLOAD_KEY_B64="$(cat .venv/payload_key.txt)"
fi
# Server-signed entries (guardian_added, no_answer, alarms…) need the Ed25519 key
# that matches the pinned manifest. The real key is not in the repo, so a local
# server uses its own throwaway key and a dev manifest next to it.
if [ -z "${VUKA_SERVER_ED25519_KEY_B64:-}" ]; then
  if [ ! -f .venv/dev_manifest.json ]; then
    "$PY" - <<'PYDEV'
import base64, json
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, PublicFormat, NoEncryption
key = Ed25519PrivateKey.generate()
manifest = json.loads(Path("contracts/keys/manifest.json").read_text(encoding="utf8"))
manifest["server_ed25519_public_key"] = base64.b64encode(key.public_key().public_bytes(Encoding.DER, PublicFormat.SubjectPublicKeyInfo)).decode()
Path(".venv/dev_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf8")
Path(".venv/dev_server_key.txt").write_text(base64.b64encode(key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())).decode())
PYDEV
  fi
  export VUKA_SERVER_ED25519_KEY_B64="$(cat .venv/dev_server_key.txt)"
  export VUKA_SERVER_MANIFEST_PATH="$(pwd -W 2>/dev/null || pwd)/.venv/dev_manifest.json"
fi
export VUKA_SIM_ONLY=1
export VUKA_DEV_OTP_LOG="${VUKA_DEV_OTP_LOG:-1}"

"$PY" -m server.run_workers &
exec "$PY" -m uvicorn server.main:app --host 0.0.0.0 --port "${PORT:-8000}"
