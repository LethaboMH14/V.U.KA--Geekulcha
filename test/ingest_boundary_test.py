"""Acceptance tests for the P2.3 discard-by-default embedding boundary.

Evidence required by ``docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md``: a non-match
leaves no embedding in the persistence boundary, a consented match retains a
match result with its consent reference, and the audit record contains no
biometric payload. The G3 retention-bound check proves the retained record is
bounded, not open-ended.

Standard-library unittest only — pytest is not available in this environment.
"""

import unittest

from server.src.api.ingest import (
    EMBEDDING_MATCH_RETENTION_SECONDS,
    Enrolment,
    receive_sensor_embedding,
)


def _enrolments():
    return [
        Enrolment(
            resident_id="sim_subject_1",
            consent_ref="consent_001",
            tenant="sim_tenant_a",
            purpose="access_control",
            embedding=(1, 2),
        ),
        Enrolment(
            resident_id="sim_subject_2",
            consent_ref="consent_002",
            tenant="sim_tenant_b",
            purpose="access_control",
            embedding=(3, 4),
        ),
        Enrolment(
            resident_id="sim_subject_3",
            consent_ref="consent_003",
            tenant="sim_tenant_a",
            purpose="suspicion_screening",
            embedding=(5, 6),
        ),
    ]


class IngestBoundaryTests(unittest.TestCase):
    def test_consented_match_retains_match_result_and_consent_reference(self):
        receipt = receive_sensor_embedding(
            embedding=(1, 2),
            tenant="sim_tenant_a",
            purpose="access_control",
            enrolments=_enrolments(),
            observed_at=1000,
        )
        self.assertTrue(receipt.retained)
        self.assertEqual(receipt.persistence_record["consent_ref"], "consent_001")
        self.assertEqual(receipt.persistence_record["resident_id"], "sim_subject_1")
        self.assertNotIn("embedding", receipt.persistence_record)

    def test_nonmatch_embedding_leaves_nothing_in_persistence_boundary(self):
        receipt = receive_sensor_embedding(
            embedding=(9, 9),
            tenant="sim_tenant_a",
            purpose="access_control",
            enrolments=_enrolments(),
            observed_at=1000,
        )
        self.assertFalse(receipt.retained)
        self.assertEqual(
            set(receipt.persistence_record),
            {"event_type", "tenant", "purpose", "observed_at"},
        )

    def test_audit_event_contains_no_biometric_payload(self):
        for embedding in [(1, 2), (9, 9)]:
            receipt = receive_sensor_embedding(
                embedding=embedding,
                tenant="sim_tenant_a",
                purpose="access_control",
                enrolments=_enrolments(),
                observed_at=1000,
            )
            for record in (receipt.persistence_record, receipt.evidence_event):
                flat = repr(record)
                self.assertNotIn(str(embedding), flat)
                self.assertNotIn(str(list(embedding)), flat)
                self.assertNotIn("embedding", record)
            self.assertFalse(receipt.evidence_event["embedding_persisted"])

    def test_cross_tenant_and_purpose_enrolments_do_not_unlock(self):
        for embedding, tenant in [((3, 4), "sim_tenant_a"), ((5, 6), "sim_tenant_a"), ((1, 2), "sim_tenant_b")]:
            receipt = receive_sensor_embedding(
                embedding=embedding,
                tenant=tenant,
                purpose="access_control",
                enrolments=_enrolments(),
                observed_at=1000,
            )
            self.assertFalse(receipt.retained)

    def test_empty_enrolment_set_discards(self):
        receipt = receive_sensor_embedding(
            embedding=(1, 2),
            tenant="sim_tenant_a",
            purpose="access_control",
            enrolments=[],
            observed_at=1000,
        )
        self.assertFalse(receipt.retained)

    def test_ambiguous_match_is_refused_not_guessed(self):
        duplicated = _enrolments() + [
            Enrolment(
                resident_id="sim_subject_9",
                consent_ref="consent_009",
                tenant="sim_tenant_a",
                purpose="access_control",
                embedding=(1, 2),
            )
        ]
        with self.assertRaises(ValueError):
            receive_sensor_embedding(
                embedding=(1, 2),
                tenant="sim_tenant_a",
                purpose="access_control",
                enrolments=duplicated,
                observed_at=1000,
            )

    def test_retained_record_carries_retention_bound(self):
        receipt = receive_sensor_embedding(
            embedding=(1, 2),
            tenant="sim_tenant_a",
            purpose="access_control",
            enrolments=_enrolments(),
            observed_at=1000,
        )
        self.assertEqual(
            receipt.persistence_record["retention_expires_at"],
            1000 + EMBEDDING_MATCH_RETENTION_SECONDS,
        )
        self.assertEqual(receipt.evidence_event["retention_seconds"], EMBEDDING_MATCH_RETENTION_SECONDS)

    def test_retention_bound_is_within_recorded_direction_of_travel(self):
        seven_days = 7 * 24 * 60 * 60
        thirty_days = 30 * 24 * 60 * 60
        self.assertGreaterEqual(EMBEDDING_MATCH_RETENTION_SECONDS, seven_days)
        self.assertLessEqual(EMBEDDING_MATCH_RETENTION_SECONDS, thirty_days)

    def test_tenant_and_purpose_are_required(self):
        for kwargs in [
            {"tenant": "", "purpose": "access_control"},
            {"tenant": "sim_tenant_a", "purpose": ""},
            {"tenant": None, "purpose": "access_control"},
            {"tenant": "sim_tenant_a", "purpose": None},
        ]:
            with self.assertRaises(ValueError):
                receive_sensor_embedding(
                    embedding=(1, 2),
                    enrolments=_enrolments(),
                    observed_at=1000,
                    **kwargs,
                )


if __name__ == "__main__":
    unittest.main()