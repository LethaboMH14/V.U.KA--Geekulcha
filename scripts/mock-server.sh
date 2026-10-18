#!/usr/bin/env bash
# P3.A1 — pinned mock server for contracts/openapi.yaml v2.
# Named in docs/VUKA-2-SPEC.md's Thu-24 handoff row: clients (Vukosi, Mutarisi,
# Ipeleng) mock against this instead of a real ANCHOR server.
set -euo pipefail
cd "$(dirname "$0")/.."
exec npx --yes @stoplight/prism-cli@5.16.0 mock contracts/openapi.yaml --port "${PORT:-4020}"
