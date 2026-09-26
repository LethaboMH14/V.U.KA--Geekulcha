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
# (anchor/hedera-sidecar). App Service's Python image has no Node runtime and
# this app's own content is re-extracted to a fresh /tmp path on every
# deploy/restart, so neither a system `node` nor the sidecar's node_modules
# can be relied on to already be there. /home is the one path Azure actually
# persists ("Any data outside '/home' is not persisted" - App Service's own
# boot banner), so a working Node lives there once and is reused on every
# later boot instead of re-fetched. Only attempted on the real Azure/Oryx
# path (antenv present); a bare local `bash startup.sh` skips this entirely.
#
# This whole install (and the sidecar's own `npm ci` below) runs entirely in
# the background, never blocking uvicorn from starting. A first real deploy
# of this without backgrounding it made Azure kill the container outright:
# the sidecar's ~100 dependencies took over three minutes to install from a
# cold npm cache, which blew straight through Azure's startup probe window
# ("No listening ports were detected in the container") even though the
# Node download+checksum+extract step itself only took about five seconds.
# VUKA_NODE_BINARY is exported up front, unconditionally, at its final path
# -- it does not need the file to exist yet when run_workers.py starts,
# only by the time a real anchor batch actually tries to submit, which the
# escalation/outbox timing gives this background job plenty of room for.
#
# Every step logs a "vuka:" line, success or failure, so the App Service log
# always shows how far this got (grep for "vuka:").
if [ -x "antenv/bin/python" ]; then
  NODE_VERSION="24.18.0"
  VUKA_HOME="/home/vuka"
  NODE_DIR="$VUKA_HOME/node-v${NODE_VERSION}-linux-x64"
  # Written only after extraction finishes. A boot killed mid-extract (Azure
  # kills a container that misses its startup probe, and /home is a slow
  # network share) can leave bin/node present but npm incomplete; no marker
  # means "not a complete install", so it is wiped and reinstalled.
  NODE_MARKER="$NODE_DIR/.vuka-install-complete"
  export VUKA_NODE_BINARY="$NODE_DIR/bin/node"
  (
    echo "vuka: node setup starting (cached install at $NODE_DIR)"
    if [ -f "$NODE_MARKER" ] && "$NODE_DIR/bin/node" --version >/dev/null 2>&1; then
      echo "vuka: node $("$NODE_DIR/bin/node" --version) already installed"
    else
      echo "vuka: installing pinned Node v${NODE_VERSION} into $NODE_DIR (one-time, cached under /home)"
      rm -rf "$NODE_DIR"
      NODE_TMP="$(mktemp -d)"
      TARBALL="node-v${NODE_VERSION}-linux-x64.tar.gz"
      if curl -fsSL --max-time 120 -o "$NODE_TMP/$TARBALL" "https://nodejs.org/dist/v${NODE_VERSION}/$TARBALL" \
         && curl -fsSL --max-time 60 -o "$NODE_TMP/SHASUMS256.txt" "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" \
         && (cd "$NODE_TMP" && grep " $TARBALL\$" SHASUMS256.txt | sha256sum -c -); then
        mkdir -p "$VUKA_HOME"
        if tar -xzf "$NODE_TMP/$TARBALL" -C "$VUKA_HOME"; then
          chmod +x "$NODE_DIR/bin/node" "$NODE_DIR/bin/npm" "$NODE_DIR/bin/npx" 2>/dev/null || true
          touch "$NODE_MARKER"
          echo "vuka: node $("$NODE_DIR/bin/node" --version 2>/dev/null) installed"
        else
          echo "vuka: node extract failed; anchor batches will stay unconfirmed this boot" >&2
        fi
      else
        # Never let a network hiccup or a checksum mismatch take down the
        # API; anchor batches simply stay unconfirmed until this succeeds
        # on a later boot, the same honest state as missing credentials.
        echo "vuka: node download or checksum failed; anchor batches will stay unconfirmed this boot" >&2
      fi
      rm -rf "$NODE_TMP"
    fi
    # The sidecar's own node_modules is never packaged (deliberately --
    # scripts/build-deploy-package.py refuses to ship one) and can't
    # survive the fresh-/tmp-path-per-deploy issue above either, so it is
    # installed fresh every boot into the app's own ephemeral copy -- only
    # the downloaded package tarballs are cached (in /home), not
    # node_modules itself.
    SIDECAR_DIR="$(dirname "$0")/anchor/hedera-sidecar"
    if [ ! -f "$NODE_MARKER" ]; then
      echo "vuka: skipping sidecar install (no complete node install)" >&2
    elif [ ! -f "$SIDECAR_DIR/package.json" ]; then
      echo "vuka: skipping sidecar install ($SIDECAR_DIR/package.json not found)" >&2
    elif [ -d "$SIDECAR_DIR/node_modules" ]; then
      echo "vuka: sidecar dependencies already present in $SIDECAR_DIR"
    else
      echo "vuka: installing sidecar dependencies in $SIDECAR_DIR"
      if ( cd "$SIDECAR_DIR" && PATH="$NODE_DIR/bin:$PATH" npm ci --ignore-scripts --no-audit --no-fund --cache "$VUKA_HOME/npm-cache" ); then
        echo "vuka: sidecar ready; Hedera anchoring can submit"
      else
        echo "vuka: sidecar npm ci failed; anchor batches will stay unconfirmed this boot" >&2
      fi
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
