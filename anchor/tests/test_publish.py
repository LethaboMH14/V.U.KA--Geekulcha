"""Hedera sidecar process boundary; real submission requires operator keys."""

import json
import subprocess
from types import SimpleNamespace

import pytest

from anchor.publish import AnchorPublicationError, publish_manifest, publish_root


def test_sidecar_pre_submit_exit_is_distinct_from_ambiguous_failure():
    from anchor.publish import AnchorNotSubmitted
    with pytest.raises(AnchorNotSubmitted):
        publish_root(bytes(32), runner=lambda *_a, **_kw: SimpleNamespace(returncode=2, stdout=""))


def test_a_process_that_never_started_is_also_not_submitted():
    """Regression: a missing node binary (or any OSError launching it) used to
    be folded into the same ambiguous AnchorPublicationError as a genuinely
    uncertain failure, which server/anchoring.py's BatchCoordinator never
    auto-retries out of -- the batch would stay `submitted` forever, even
    once the actual environment problem (e.g. Node not yet installed) was
    fixed. No subprocess ever ran here, so there is no possible way it
    reached Hedera; this must be exactly as retryable as returncode 2."""
    from anchor.publish import AnchorNotSubmitted

    def never_starts(*_a, **_kw):
        raise FileNotFoundError("node")

    with pytest.raises(AnchorNotSubmitted):
        publish_root(bytes(32), runner=never_starts)


def test_a_process_that_timed_out_stays_ambiguous_not_auto_retryable():
    """Unlike the OSError case above, a timeout means the process WAS
    running and may have reached the SDK's execute() call before being
    killed -- this must stay the genuinely-ambiguous AnchorPublicationError,
    never AnchorNotSubmitted, so the coordinator reconciles instead of
    blindly resubmitting a root that might already be on-chain."""
    from anchor.publish import AnchorNotSubmitted

    def times_out(*_a, **_kw):
        raise subprocess.TimeoutExpired(cmd="node", timeout=90)

    with pytest.raises(AnchorPublicationError) as exc_info:
        publish_root(bytes(32), runner=times_out)
    assert not isinstance(exc_info.value, AnchorNotSubmitted)


def test_root_invokes_sidecar_without_putting_keys_in_arguments():
    root = bytes.fromhex("ab" * 32)
    seen = {}

    def fake_run(command, **kwargs):
        seen["command"] = command
        seen["kwargs"] = kwargs
        return SimpleNamespace(returncode=0, stdout=json.dumps({
            "kind": "root", "confirmed_by": "public_mirror", "topic_epoch": 1,
            "topic_id": "0.0.10687280", "sequence_number": 2,
            "consensus_timestamp": "1790197443.416460104", "running_hash": "abc",
            "message_hex": "01" + "ab" * 32,
        }))

    receipt = publish_root(root, runner=fake_run)
    assert receipt["sequence_number"] == 2
    assert seen["command"][1].endswith("cli.mjs")
    assert json.loads(seen["kwargs"]["input"]) == {
        "kind": "root", "root_hex": "ab" * 32,
    }
    assert seen["kwargs"]["capture_output"] is True


def test_malformed_root_rejected_before_process_launch():
    with pytest.raises(ValueError, match="exactly 32"):
        publish_root(b"short", runner=lambda *_args, **_kwargs: None)


def test_sidecar_failure_is_not_reported_as_confirmed():
    def failed(_command, **_kwargs):
        return SimpleNamespace(returncode=1, stdout="")

    with pytest.raises(AnchorPublicationError, match="reconcile before retry"):
        publish_manifest(runner=failed)


def test_wrong_root_receipt_rejected():
    def wrong(_command, **_kwargs):
        return SimpleNamespace(returncode=0, stdout=json.dumps({
            "kind": "root", "confirmed_by": "public_mirror", "topic_epoch": 1,
            "topic_id": "0.0.10687280", "sequence_number": 2,
            "consensus_timestamp": "1790197443.416460104", "running_hash": "abc",
            "message_hex": "01" + "cd" * 32,
        }))

    with pytest.raises(AnchorPublicationError, match="receipt is invalid"):
        publish_root(bytes.fromhex("ab" * 32), runner=wrong)


def test_the_sidecars_own_reason_is_logged_but_nothing_else_from_stderr(caplog):
    """A failed submission must say why in the server log, but only through
    cli.mjs's own sanitised line: other stderr output (an SDK stack, a Node
    warning) could carry credentials and is never logged."""
    from anchor.publish import AnchorNotSubmitted
    stderr = ("(node:1) Warning: sim_secret_0xdeadbeef\n"
              "Hedera sidecar failed: dependencies not installed (run npm ci)\n")
    with caplog.at_level("WARNING"), pytest.raises(AnchorNotSubmitted):
        publish_root(bytes(32), runner=lambda *_a, **_kw: SimpleNamespace(returncode=2, stdout="", stderr=stderr))
    assert "exit 2: dependencies not installed (run npm ci)" in caplog.text
    assert "deadbeef" not in caplog.text
