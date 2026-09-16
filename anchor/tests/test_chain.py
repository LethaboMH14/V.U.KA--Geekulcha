"""anchor/chain.py — hash-chain construction, sim_ fixtures only."""

from anchor.chain import EvidenceEntry, append_entry, compute_event_hash


def _entry(**overrides):
    defaults = dict(
        action="sim_action", actor_id="sim_actor", target_type="entity",
        target_id="sim_target", details={}, ts="2026-09-16T00:00:00Z", prev_hash=None,
    )
    defaults.update(overrides)
    return EvidenceEntry(**defaults)


def test_event_hash_is_deterministic():
    a = _entry()
    b = _entry()
    assert a.event_hash == b.event_hash == compute_event_hash(a)


def test_event_hash_changes_if_any_field_changes():
    a = _entry(details={"x": 1})
    b = _entry(details={"x": 2})
    assert a.event_hash != b.event_hash


def test_first_entry_links_to_none():
    chain = append_entry(
        [], action="a", actor_id="op", target_type="entity", target_id="t",
        details={}, ts="2026-09-16T00:00:00Z",
    )
    assert chain[0].prev_hash is None


def test_second_entry_links_to_first_event_hash():
    chain = append_entry(
        [], action="a", actor_id="op", target_type="entity", target_id="t",
        details={}, ts="2026-09-16T00:00:00Z",
    )
    chain = append_entry(
        chain, action="b", actor_id="op", target_type="entity", target_id="t",
        details={}, ts="2026-09-16T00:01:00Z",
    )
    assert chain[1].prev_hash == chain[0].event_hash


def test_append_does_not_mutate_original_chain():
    original = append_entry(
        [], action="a", actor_id="op", target_type="entity", target_id="t",
        details={}, ts="2026-09-16T00:00:00Z",
    )
    length_before = len(original)
    _ = append_entry(
        original, action="b", actor_id="op", target_type="entity", target_id="t",
        details={}, ts="2026-09-16T00:01:00Z",
    )
    assert len(original) == length_before


def test_to_dict_matches_frozen_evidence_entry_shape():
    entry = _entry()
    d = entry.to_dict()
    assert set(d.keys()) == {"action", "actor_id", "target_type", "target_id", "details", "ts", "prev_hash", "event_hash"}
