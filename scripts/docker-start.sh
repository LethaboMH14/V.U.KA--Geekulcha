#!/bin/sh
# Container entrypoint: outbox workers + API on $PORT.
#
# Settings come from the environment (see .env.backup.example). A backup server
# has its OWN Ed25519 server key; its public half is pinned in a manifest that
# is passed as VUKA_BACKUP_MANIFEST_JSON (made by scripts/make-backup-keys.py)
# and written next to the app here, because most hosts can't mount files.
set -eu

export VUKA_SIM_ONLY=1

if [ -n "${VUKA_BACKUP_MANIFEST_JSON:-}" ]; then
  printf '%s' "$VUKA_BACKUP_MANIFEST_JSON" > /tmp/backup_manifest.json
  export VUKA_SERVER_MANIFEST_PATH=/tmp/backup_manifest.json
  echo "vuka: using this server's own key manifest"
fi

missing=""
for k in DATABASE_URL VUKA_PAYLOAD_KEY_B64 VUKA_SERVER_ED25519_KEY_B64; do
  eval "v=\${$k:-}"
  [ -n "$v" ] || missing="$missing $k"
done
if [ -n "$missing" ]; then
  echo "vuka: missing settings:$missing (see .env.backup.example)" >&2
fi

if [ "${VUKA_SKIP_WORKERS:-0}" != "1" ]; then
  python -m server.run_workers &
fi
exec python -m uvicorn server.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips='*'
