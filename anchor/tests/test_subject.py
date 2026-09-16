"""anchor/subject.py — SubjectRecord assembly and the sim_ honesty boundary."""

from anchor.chain import append_entry
from anchor.subject import get_subject_record


def _two_subject_chain():
    chain = append_entry(
        [], action="a", actor_id="op", target_type="entity", target_id="sim_subject_musa",
        details={}, ts="2026-09-16T00:00:00Z",
    )
    chain = append_entry(
        chain, action="b", actor_id="op", target_type="entity", target_id="sim_subject_thandi",
        details={}, ts="2026-09-16T00:01:00Z",
    )
    chain = append_entry(
        chain, action="c", actor_id="op", target_type="entity", target_id="sim_subject_musa",
        details={}, ts="2026-09-16T00:02:00Z",
    )
    return chain


def test_returns_only_the_requested_subjects_entries():
    record = get_subject_record(_two_subject_chain(), "sim_subject_musa")
    assert len(record["entries"]) == 2
    assert all(e["target_id"] == "sim_subject_musa" for e in record["entries"])


def test_unknown_subject_returns_empty_entries_not_an_error():
    record = get_subject_record(_two_subject_chain(), "sim_subject_nobody")
    assert record["entries"] == []
    assert record["subject_id"] == "sim_subject_nobody"


def test_proof_reports_chain_integrity_of_the_whole_chain_not_just_the_subject():
    record = get_subject_record(_two_subject_chain(), "sim_subject_musa")
    assert record["proof"]["chain_integrity"]["is_intact"] is True
    assert record["proof"]["chain_length"] == 3  # whole chain, not just Musa's 2 entries


def test_proof_honestly_labels_the_anchor_as_not_submitted():
    record = get_subject_record(_two_subject_chain(), "sim_subject_musa")
    assert record["proof"]["anchor"]["state"] == "not_submitted"
    assert "sim_" in record["proof"]["anchor"]["note"]


def test_record_shape_matches_frozen_subjectrecord_schema():
    record = get_subject_record(_two_subject_chain(), "sim_subject_musa")
    assert set(record.keys()) == {"subject_id", "entries", "proof"}
