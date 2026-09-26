#!/usr/bin/env bash
set -euo pipefail
# Oryx installs into a virtual environment (antenv, relative to the app root)
# and only activates it for its own generated default startup command, not for
# a custom one like this. Bare `python` here would be the system interpreter,
# which has none of requirements.txt installed (exit code 3, no app output).
# Prefer antenv's python when present, so this runs identically locally (no
# antenv) and on App Service (antenv present).
PY="python"
if [ -x "antenv/bin/python" ]; then
  PY="antenv/bin/python"
fi

# run_workers.py is what actually delivers guardian alerts, bank signals and
# anchor batches (server/README.md). Without it the API alone accepts events
# but nothing in the outbox ever fires. Safe to run alongside N other copies
# of this container: the outbox lease and the anchor coordinator's advisory
# lock (server/outbox.py, server/anchoring.py) are built for concurrent
# workers. Set VUKA_SKIP_WORKERS=1 to run the API only.
if [ "${VUKA_SKIP_WORKERS:-0}" != "1" ]; then
  "$PY" -m server.run_workers &
fi

exec "$PY" -m uvicorn server.main:app --host 0.0.0.0 --port "${PORT:-8000}"
