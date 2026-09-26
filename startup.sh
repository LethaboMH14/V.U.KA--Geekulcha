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

# anchor/publish.py shells out to `node` for real Hedera submission
# (anchor/hedera-sidecar). App Service's Python image has no Node runtime, and
# this app's own content is re-extracted to a fresh /tmp path on every boot.
#
# Where things live, and why:
# - /home is the only path Azure persists, but it is network storage, which
#   Microsoft documents as slow for many small files (an extracted Node,
#   node_modules, an npm cache). So /home holds exactly one file, the Node
#   tarball, downloaded once.
# - Node is extracted, and the sidecar's dependencies installed, on local
#   disk (/tmp) every boot. On Azure (26 Sep, 13:16 UTC) extraction took
#   ~20 s and the sidecar's `npm ci` ~2 min, all in the background.
# - Container logging must be on (az webapp log config
#   --docker-container-logging filesystem) to see any of this after the
#   site starts; with it off, only the startup window is kept.
# - The tarball's SHA-256 is pinned below (verified against nodejs.org's
#   SHASUMS256.txt when this version was chosen) and checked before every
#   extraction, so a cached or downloaded file is never trusted unverified.
#
# All of it runs in the background: an early version ran `npm ci` in the
# foreground and Azure killed the container for missing its startup probe.
# VUKA_NODE_BINARY is exported up front at its final path; it only has to
# exist by the time a real anchor batch submits. Every step logs a "vuka:"
# line, success or failure (grep the App Service log for "vuka:"). Only the
# Azure/Oryx path (antenv present) does this; a local `bash startup.sh` uses
# whatever `node` is already on PATH.
if [ -x "antenv/bin/python" ]; then
  NODE_VERSION="24.18.0"
  NODE_SHA256="783130984963db7ba9cbd01089eaf2c2efb055c7c1693c943174b967b3050cb8"
  TARBALL="node-v${NODE_VERSION}-linux-x64.tar.gz"
  VUKA_HOME="/home/vuka"
  NODE_CACHE="$VUKA_HOME/$TARBALL"
  NODE_LOCAL="/tmp/vuka-node"
  NODE_DIR="$NODE_LOCAL/node-v${NODE_VERSION}-linux-x64"
  export VUKA_NODE_BINARY="$NODE_DIR/bin/node"
  (
    echo "vuka: node setup starting"
    if [ -f "$NODE_CACHE" ] && echo "$NODE_SHA256  $NODE_CACHE" | sha256sum -c --status -; then
      echo "vuka: using cached Node tarball"
    else
      echo "vuka: downloading pinned Node v${NODE_VERSION} (one-time, cached as a single file under /home)"
      mkdir -p "$VUKA_HOME"
      NODE_TMP="$(mktemp -d)"
      if curl -fsSL --max-time 120 -o "$NODE_TMP/$TARBALL" "https://nodejs.org/dist/v${NODE_VERSION}/$TARBALL" \
         && echo "$NODE_SHA256  $NODE_TMP/$TARBALL" | sha256sum -c --status - \
         && cp "$NODE_TMP/$TARBALL" "$NODE_CACHE.partial" && mv "$NODE_CACHE.partial" "$NODE_CACHE"; then
        echo "vuka: Node tarball downloaded and checksum verified"
      else
        # Never let a network hiccup or a checksum mismatch take down the
        # API; anchor batches stay unconfirmed until a later boot succeeds.
        echo "vuka: node download or checksum failed; anchor batches will stay unconfirmed this boot" >&2
      fi
      rm -rf "$NODE_TMP"
    fi
    if [ -f "$NODE_CACHE" ] && mkdir -p "$NODE_LOCAL" && tar -xzf "$NODE_CACHE" -C "$NODE_LOCAL" \
       && "$NODE_DIR/bin/node" --version >/dev/null 2>&1; then
      echo "vuka: node $("$NODE_DIR/bin/node" --version) ready on local disk"
      # The sidecar's own node_modules is never packaged (deliberately:
      # scripts/build-deploy-package.py refuses to ship one), so it is
      # installed fresh each boot into the app's own ephemeral copy, with a
      # local npm cache (npm's default cache is under $HOME, i.e. /home).
      SIDECAR_DIR="$(dirname "$0")/anchor/hedera-sidecar"
      if [ ! -f "$SIDECAR_DIR/package.json" ]; then
        echo "vuka: skipping sidecar install ($SIDECAR_DIR/package.json not found)" >&2
      elif [ -d "$SIDECAR_DIR/node_modules" ]; then
        echo "vuka: sidecar dependencies already present in $SIDECAR_DIR"
      else
        echo "vuka: installing sidecar dependencies in $SIDECAR_DIR"
        if ( cd "$SIDECAR_DIR" && PATH="$NODE_DIR/bin:$PATH" npm ci --ignore-scripts --no-audit --no-fund --cache /tmp/vuka-npm-cache ); then
          echo "vuka: sidecar ready; Hedera anchoring can submit"
        else
          echo "vuka: sidecar npm ci failed; anchor batches will stay unconfirmed this boot" >&2
        fi
      fi
    else
      echo "vuka: node not available this boot; skipping sidecar install" >&2
    fi
  ) &
else
  echo "vuka: no antenv (not the Azure/Oryx path); using whatever node is on PATH"
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
