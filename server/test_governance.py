import unittest

from governance import Decision, GovernanceError, human_verify


class GovernanceContractTests(unittest.TestCase):
    def test_machine_ceiling_requires_operator_identity(self):
        with self.assertRaises(GovernanceError):
            human_verify("observed", "flag", Decision("", "machine output"))

    def test_flag_requires_reason(self):
        self.assertEqual(human_verify("watch_candidate", "flag", Decision("op-1", "reviewed evidence")), "flagged")
        with self.assertRaises(GovernanceError):
            human_verify("watch_candidate", "flag", Decision("op-1", ""))

    def test_whitelist_requires_two_distinct_signers(self):
        with self.assertRaises(GovernanceError):
            human_verify("watch_candidate", "whitelist", Decision("op-1", "resident", "op-1"))
        with self.assertRaises(GovernanceError):
            human_verify("watch_candidate", "whitelist", Decision("op-1", "resident"))
        self.assertEqual(human_verify("watch_candidate", "whitelist", Decision("op-1", "resident", "op-2")), "whitelisted")

    def test_terminal_states_cannot_be_redecided(self):
        with self.assertRaises(GovernanceError):
            human_verify("whitelisted", "dismiss", Decision("op-1", "review"))


if __name__ == "__main__":
    unittest.main()
