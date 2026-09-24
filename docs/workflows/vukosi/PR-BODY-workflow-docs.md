## Problem and resulting behaviour

WBS ID / owner / criterion: Vukosi workflow and packet reviews / Vukosi / T, S
Built, specified, simulated or blocked: **Specified and reviewed by AI; human approval pending.**
What changed for a household, operator or reviewer: packet tasks, blockers, proposed standing rules and review records make implementation boundaries and unverified claims inspectable. Review files: `docs/reviews/VUKOSI-PR43-READINESS.md`, `docs/reviews/VUKOSI-WORKFLOW-CLAUDE-REVIEW.md`, `docs/workflows/vukosi/p1a-rn-scaffold/REVIEW.md`, `docs/workflows/vukosi/p2a-yamnet-provenance/REVIEW.md`, `docs/workflows/vukosi/p7a-measurement-instrument/REVIEW.md`.

## Evidence and verification

- Commands actually run and results: `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `node --test "test/**/*.test.mjs"`, Gitleaks and `git diff --check` are run before the local paperwork commit; actual result is recorded in the accompanying build-log entry.
- Source / sample size / assumptions for changed claims: repository tasks, reviews and observed local command output only. No user research, product measurement or live model claim.
- Screens and failure states, when relevant: not applicable; documentation-only.
- Business handoff: proposed rules and packet PR bodies reduce review ambiguity; adoption remains a lead decision.
- Rollback: revert the small paperwork commits or remove this isolated worktree/branch.

## Review

Claude reviews linked above are AI reviews, not human approval. Lethabo's review is pending. P2a live checks L1–L3 are **NOT RUN**. All checklist items intentionally remain unchecked.

- [ ] No secrets, private data or old history imported; provenance reviewed
- [ ] Intake gate evidence satisfied before feature work
- [ ] Relevant tests, document checks and secret scans pass
- [ ] Shared contract consumers reviewed any interface change
- [ ] Personal file and BUILD-LOG updated
- [ ] Lethabo review recorded
- [ ] Sibusiso review recorded
- [ ] Nonauthor domain/security review where required; no self-approval
- [ ] Built/sim_/specified labels match actual evidence
