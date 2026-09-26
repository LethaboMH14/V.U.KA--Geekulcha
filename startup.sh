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
exec "$PY" -m uvicorn server.main:app --host 0.0.0.0 --port "${PORT:-8000}"
