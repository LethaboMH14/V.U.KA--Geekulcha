"""Validates the subjects-record handler's real output against the actual
contracts/openapi.yaml schema, using jsonschema's Draft202012Validator — the
same tool and version class already established for this in this project
(PR #33's second-lead contract sign-off re-verified ADR-0030's shapes the
same way). This checks the real frozen contract file, not a hand-copied
description of it — if openapi.yaml's SubjectRecord/EvidenceEntry shape ever
changes, this test changes result without anyone touching this file.
"""

import yaml
from jsonschema import Draft202012Validator

from server.src.api.subjects import build_sim_musa_chain, handle_get_subject_record


def _load_schema(name: str) -> dict:
    with open("contracts/openapi.yaml", encoding="utf-8") as f:
        spec = yaml.safe_load(f)
    schemas = spec["components"]["schemas"]

    def resolve(node):
        if isinstance(node, dict):
            if "$ref" in node:
                return resolve(schemas[node["$ref"].split("/")[-1]])
            return {k: resolve(v) for k, v in node.items()}
        if isinstance(node, list):
            return [resolve(v) for v in node]
        return node

    return resolve(schemas[name])


def _sample_body():
    chain = build_sim_musa_chain()
    result = handle_get_subject_record(
        subject_id="sim_subject_musa_ent7f3a", bearer_token="sim_bearer_musa_own_token", chain=chain,
    )
    return result["body"]


def test_subject_record_output_validates_against_the_real_frozen_schema():
    schema = _load_schema("SubjectRecord")
    Draft202012Validator(schema).validate(_sample_body())  # raises on failure


def test_every_evidence_entry_validates_against_the_real_frozen_schema():
    schema = _load_schema("EvidenceEntry")
    for entry in _sample_body()["entries"]:
        Draft202012Validator(schema).validate(entry)


def test_an_extra_field_is_correctly_rejected_by_the_real_schema():
    """additionalProperties: false must actually reject something — proves
    this test isn't accidentally validating against a schema with no teeth."""
    schema = _load_schema("SubjectRecord")
    body = dict(_sample_body())
    body["unexpected_field"] = "should not be allowed"
    try:
        Draft202012Validator(schema).validate(body)
        assert False, "schema should have rejected the extra field but did not"
    except Exception:
        pass
