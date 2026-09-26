import copy

from anchor.verify import first_broken_index
from server.db import _with_server_fields


def _chain():
    entries = []
    previous = "0" * 64
    for index in range(3):
        entry = {
            "action": "sim_signal_detected", "actor_id": "sim_device",
            "target_type": "journey", "target_id": "sim_journey",
            "details": {"event_id": f"sim_event_{index}", "counter": index},
            "ts": "2026-09-24T20:00:00Z",
        }
        stored = _with_server_fields(entry, chain_index=index, prev_hash=previous,
                                     received_at="2026-09-24T20:00:01Z")
        entries.append(stored)
        previous = stored["event_hash"]
    return entries


def test_intact_prefix_and_full_chain_return_no_broken_index():
    entries = _chain()
    assert first_broken_index(entries) is None
    assert first_broken_index(entries[:2]) is None
    assert first_broken_index([]) == 0


def test_each_tamper_reports_its_first_zero_based_index():
    original = _chain()
    for changed_index in range(len(original)):
        entries = copy.deepcopy(original)
        entries[changed_index]["details"]["event_id"] = "sim_tampered"
        assert first_broken_index(entries) == changed_index


def test_wrong_link_index_and_hash_are_located():
    for change in [
        lambda e: e[1].update(prev_hash="f" * 64),
        lambda e: e[1]["details"].update(chain_index=9),
        lambda e: e[1].update(event_hash="not-a-hash"),
        lambda e: e[1].pop("details"),
    ]:
        entries = _chain()
        change(entries)
        assert first_broken_index(entries) == 1
