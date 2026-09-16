"""anchor/verify.py — must return the FIRST broken link by 0-based index,
never a boolean. Every test here checks the index, not just is_intact."""

import dataclasses

from anchor.chain import append_entry
from anchor.verify import verify_chain


def _build_chain(n=3):
    chain = []
    for i in range(n):
        chain = append_entry(
            chain, action=f"action_{i}", actor_id="op", target_type="entity",
            target_id="t", details={"i": i}, ts=f"2026-09-16T00:0{i}:00Z",
        )
    return chain


def test_empty_chain_is_intact():
    result = verify_chain([])
    assert result.is_intact is True
    assert result.first_broken_index is None


def test_intact_chain_reports_intact():
    result = verify_chain(_build_chain(5))
    assert result.is_intact is True
    assert result.first_broken_index is None


def test_tampered_content_reports_correct_index():
    chain = _build_chain(4)
    # Tamper entry 2's details without recomputing its event_hash — this is
    # exactly what an attacker editing stored data would produce.
    tampered = dataclasses.replace(chain[2], details={"i": "TAMPERED"})
    object.__setattr__(tampered, "event_hash", chain[2].event_hash)  # keep the stale hash
    bad_chain = [chain[0], chain[1], tampered, chain[3]]
    result = verify_chain(bad_chain)
    assert result.is_intact is False
    assert result.first_broken_index == 2


def test_broken_prev_hash_link_reports_correct_index():
    chain = _build_chain(4)
    # Splice: entry 3 now claims a prev_hash that doesn't match entry 2's real hash
    spliced_3 = dataclasses.replace(chain[3])
    object.__setattr__(spliced_3, "prev_hash", "sim_wrong_hash_from_a_different_chain")
    bad_chain = [chain[0], chain[1], chain[2], spliced_3]
    result = verify_chain(bad_chain)
    assert result.is_intact is False
    assert result.first_broken_index == 3


def test_only_the_first_break_is_reported_not_every_break():
    chain = _build_chain(5)
    t1 = dataclasses.replace(chain[1], details={"i": "TAMPERED_FIRST"})
    object.__setattr__(t1, "event_hash", chain[1].event_hash)
    t3 = dataclasses.replace(chain[3], details={"i": "TAMPERED_SECOND"})
    object.__setattr__(t3, "event_hash", chain[3].event_hash)
    bad_chain = [chain[0], t1, chain[2], t3, chain[4]]
    result = verify_chain(bad_chain)
    assert result.first_broken_index == 1  # not 3 — first break wins
