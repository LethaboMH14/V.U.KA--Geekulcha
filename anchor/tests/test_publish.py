"""Hedera sidecar process boundary; real submission requires operator keys."""

import json
from types import SimpleNamespace

import pytest

from anchor.publish import AnchorPublicationError, publish_manifest, publish_root


def test_sidecar_pre_submit_exit_is_distinct_from_ambiguous_failure():
    from anchor.publish import AnchorNotSubmitted
    with pytest.raises(AnchorNotSubmitted):
        publish_root(bytes(32), runner=lambda *_a, **_kw: SimpleNamespace(returncode=2, stdout=""))


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
