import unittest

from server.src.auth.governance import human_verify, retain_consented_match


class HumanGateContractTests(unittest.TestCase):
    def test_nonmatch_embedding_is_discarded(self):
        self.assertIsNone(retain_consented_match((9, 9), enrolled_embeddings=[(1, 2)]))

    def test_consented_embedding_is_retained(self):
        embedding = (1, 2)
        self.assertEqual(embedding, retain_consented_match(embedding, enrolled_embeddings=[embedding]))
    def test_verify_concern_requires_named_human_and_keeps_machine_ceiling(self):
        receipt = human_verify(
            current_state="watch_candidate",
            action="verify_concern",
            operator_id="op_001",
            reason="evidence reviewed",
            signature="sig_001",
            tenant="sim_tenant_001",
            target_id="sim_entity_001",
        )
        self.assertTrue(receipt.accepted)
        self.assertEqual(receipt.resulting_state, "flagged")
        self.assertEqual(receipt.evidence_event["actor_id"], "op_001")

    def test_whitelist_without_distinct_cosignature_is_refused_and_recorded(self):
        receipt = human_verify(
            current_state="watch_candidate",
            action="whitelist",
            operator_id="op_001",
            reason="known resident",
            signature="sig_001",
            tenant="sim_tenant_001",
            target_id="sim_entity_001",
        )
        self.assertFalse(receipt.accepted)
        self.assertEqual(receipt.resulting_state, "watch_candidate")
        self.assertEqual(receipt.evidence_event["action"], "human_verify_refused")

    def test_whitelist_requires_two_distinct_signatures(self):
        receipt = human_verify(
            current_state="watch_candidate",
            action="whitelist",
            operator_id="op_001",
            reason="known resident",
            signature="sig_001",
            co_signature="op_002:sig_002",
            tenant="sim_tenant_001",
            target_id="sim_entity_001",
        )
        self.assertTrue(receipt.accepted)
        self.assertEqual(receipt.resulting_state, "whitelisted")

    def test_same_operator_cannot_supply_both_signatures(self):
        receipt = human_verify(
            current_state="watch_candidate",
            action="delete",
            operator_id="op_001",
            reason="subject request",
            signature="sig_001",
            co_signature="op_001:sig_002",
            tenant="sim_tenant_001",
            target_id="sim_subject_001",
        )
        self.assertFalse(receipt.accepted)
        self.assertEqual(receipt.evidence_event["action"], "human_verify_refused")

    def test_invalid_action_is_rejected(self):
        with self.assertRaises(ValueError):
            human_verify(
                current_state="watch_candidate",
                action="flag",
                operator_id="op_001",
                reason="invalid action",
                signature="sig_001",
                tenant="sim_tenant_001",
                target_id="sim_entity_001",
            )

    def test_only_verify_concern_produces_flagged(self):
        receipt = human_verify(
            current_state="watch_candidate", action="verify_concern",
            operator_id="op_001", reason="evidence reviewed", signature="sig_001",
            tenant="sim_tenant_001", target_id="sim_entity_001",
        )
        self.assertEqual(receipt.resulting_state, "flagged")
        for action in ("dismiss", "whitelist", "disarm", "threshold_change", "delete"):
            receipt = human_verify(
                current_state="watch_candidate", action=action,
                operator_id="op_001", reason="reviewed", signature="sig_001",
                co_signature="op_002:sig_002" if action in {"whitelist", "disarm", "threshold_change", "delete"} else None,
                tenant="sim_tenant_001", target_id="sim_entity_001",
            )
            self.assertNotEqual(receipt.resulting_state, "flagged")


if __name__ == "__main__":
    unittest.main()
