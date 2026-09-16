"""server/src/api/subjects.py — the GET /v1/subjects/{id}/record handler.

Framework-agnostic: exercises handle_get_subject_record directly, no HTTP
client or FastAPI app needed since neither exists in this checkout yet.
"""

from server.src.api.subjects import build_sim_musa_chain, handle_get_subject_record


def test_valid_bearer_and_known_subject_returns_200_with_full_record():
    chain = build_sim_musa_chain()
    result = handle_get_subject_record(
        subject_id="sim_subject_musa_ent7f3a", bearer_token="sim_bearer_musa_own_token", chain=chain,
    )
    assert result["status"] == 200
    assert result["body"]["subject_id"] == "sim_subject_musa_ent7f3a"
    assert len(result["body"]["entries"]) == 3
    assert result["body"]["proof"]["chain_integrity"]["is_intact"] is True


def test_missing_bearer_token_returns_401():
    chain = build_sim_musa_chain()
    result = handle_get_subject_record(subject_id="sim_subject_musa_ent7f3a", bearer_token=None, chain=chain)
    assert result["status"] == 401


def test_malformed_bearer_token_returns_401():
    chain = build_sim_musa_chain()
    result = handle_get_subject_record(
        subject_id="sim_subject_musa_ent7f3a", bearer_token="not_a_valid_token", chain=chain,
    )
    assert result["status"] == 401


def test_unknown_subject_with_valid_auth_returns_404():
    chain = build_sim_musa_chain()
    result = handle_get_subject_record(
        subject_id="sim_subject_nobody", bearer_token="sim_bearer_musa_own_token", chain=chain,
    )
    assert result["status"] == 404


def test_response_body_has_no_extra_keys_beyond_frozen_schema():
    chain = build_sim_musa_chain()
    result = handle_get_subject_record(
        subject_id="sim_subject_musa_ent7f3a", bearer_token="sim_bearer_musa_own_token", chain=chain,
    )
    assert set(result["body"].keys()) == {"subject_id", "entries", "proof"}
    for entry in result["body"]["entries"]:
        assert set(entry.keys()) == {"action", "actor_id", "target_type", "target_id", "details", "ts", "prev_hash", "event_hash"}


def test_musa_chain_matches_the_canonical_scenario_in_docs():
    """Cross-check against the exact story in docs/ANCHOR-RATIONALE.md Scenario 3
    and the Figma "My Record" screen, so a demo walkthrough is consistent
    everywhere a judge might look."""
    chain = build_sim_musa_chain()
    actions = [e.action for e in chain]
    assert actions == ["watch_candidate_proposed", "human_verify_accepted", "human_verify_accepted"]
    assert chain[1].actor_id == "op_A41"
    assert chain[1].details["reason"] == "recognised delivery route"
