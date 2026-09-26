"""Isolated Hedera transport for the ANCHOR outbox.

This module does not schedule batches or mark them confirmed. The durable
coordinator must persist an intent before invoking it and reconcile an
ambiguous failure before retrying a submission.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path
from typing import Any, Callable


_SIDECAR = Path(__file__).parent / "hedera-sidecar" / "cli.mjs"
_PINS = Path(__file__).parent.parent / "contracts" / "keys" / "verify-pins.json"
_HEX_32 = re.compile(r"^[0-9a-f]{64}$")


class AnchorPublicationError(RuntimeError):
    """Publication could not be confirmed; reconcile before retrying."""


class AnchorNotSubmitted(AnchorPublicationError):
    """No Hedera side effect could possibly have occurred: either the sidecar
    process never started at all, or it positively reported failure before
    its SDK execute call. Distinct from a genuinely ambiguous failure (the
    process was running and may have reached the SDK call before we lost
    track of it) -- the durable coordinator treats this as safe to retry."""


def _publish(
    request: dict[str, str], *,
    runner: Callable[..., Any] = subprocess.run,
    node_binary: str | None = None,
    sim_stub: bool = False,
) -> dict[str, Any]:
    command = [node_binary or os.environ.get("VUKA_NODE_BINARY", "node"), str(_SIDECAR)]
    if sim_stub:
        command.append("--sim-stub")
    try:
        result = runner(
            command,
            input=json.dumps(request, separators=(",", ":")),
            text=True,
            capture_output=True,
            timeout=90,
            check=False,
        )
    except OSError as exc:
        # The process never started (missing binary, permission denied, ...).
        # There is no possible way the SDK's execute() call happened, so this
        # carries the exact same "definitely not submitted" guarantee as the
        # sidecar's own exit-code-2 signal below -- not the ambiguous case a
        # plain AnchorPublicationError means to the durable coordinator,
        # which never auto-retries out of that state.
        raise AnchorNotSubmitted("sidecar could not be started; nothing was submitted") from exc
    except subprocess.TimeoutExpired as exc:
        # The process WAS running and may have reached the SDK call before
        # being killed -- genuinely ambiguous, unlike the OSError case above.
        raise AnchorPublicationError("sidecar timed out; reconcile before retry") from exc
    if result.returncode == 2:
        raise AnchorNotSubmitted("sidecar stopped before submission")
    if result.returncode != 0:
        # The SDK exception and process environment may include credentials.
        raise AnchorPublicationError("Hedera submission unconfirmed; reconcile before retry")
    try:
        if len(result.stdout) > 4096:
            raise ValueError("sidecar response too large")
        receipt = json.loads(result.stdout)
        pins = json.loads(_PINS.read_text(encoding="utf-8"))
        expected_message = (
            "01" + request["root_hex"] if request["kind"] == "root"
            else "02" + pins["manifest_fingerprint_hex"]
        )
        if (
            receipt["confirmed_by"] != "public_mirror"
            or receipt["kind"] != request["kind"]
            or receipt["topic_id"] != pins["topic_id"]
            or receipt["topic_epoch"] != pins["topic_epoch"]
            or not isinstance(receipt["sequence_number"], int)
            or receipt["sequence_number"] < 1
            or receipt["message_hex"] != expected_message
            or not _HEX_32.fullmatch(receipt["message_hex"][2:])
            or not isinstance(receipt["consensus_timestamp"], str)
            or not isinstance(receipt["running_hash"], str)
        ):
            raise ValueError("sidecar receipt failed validation")
    except (ValueError, KeyError, TypeError, AttributeError) as exc:
        raise AnchorPublicationError("sidecar receipt is invalid; reconcile before retry") from exc
    return receipt


def publish_manifest(*, runner: Callable[..., Any] = subprocess.run) -> dict[str, Any]:
    """Submit the pinned 0x02 fingerprint and require public mirror read-back."""
    return _publish({"kind": "manifest"}, runner=runner)


def publish_root(root: bytes, *, runner: Callable[..., Any] = subprocess.run, sim_stub: bool = False) -> dict[str, Any]:
    """Submit a 0x01 root only after the sidecar verifies the 0x02 message."""
    if not isinstance(root, bytes) or len(root) != 32:
        raise ValueError("root must be exactly 32 bytes")
    return _publish({"kind": "root", "root_hex": root.hex()}, runner=runner, sim_stub=sim_stub)
