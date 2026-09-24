## Problem and resulting behaviour

WBS ID / owner / criterion: P3.V2 / Vukosi / T, S
Built, specified, simulated or blocked: **Offline provenance gate built; live model checks blocked.**
What changed for a household, operator or reviewer: the tool can verify a supplied model digest, install only a verified file, validate the class mapping and convert scores to basis points without accepting malformed values. Review record: `docs/workflows/vukosi/p2a-yamnet-provenance/REVIEW.md`.

## Evidence and verification

- Commands actually run and results: `py -3.12 -m unittest discover -s scripts/tests -v` PASS (16/16 on the rebased P2a branch); docs, intake, 13 repository contract tests, Gitleaks and `git diff --check` PASS.
- Source / sample size / assumptions for changed claims: offline synthetic fixtures only; no model, class-map CSV, audio, dataset or measurement committed. Live checks L1–L3 are **NOT RUN** because no authorised model source is designated and `ai_edge_litert` is not installed.
- Screens and failure states, when relevant: no UI. Digest mismatch fails closed and must not be “fixed” by changing the register.
- Business handoff: not applicable; this is provenance and supply-chain risk control.
- Rollback: revert the P2a commits or remove its isolated worktree/branch; no downloaded model is part of the commit.

## Review

Claude's review at `docs/workflows/vukosi/p2a-yamnet-provenance/REVIEW.md` is an AI review, not human approval. Lethabo's review is pending. All checklist items intentionally remain unchecked.

- [ ] No secrets, private data or old history imported; provenance reviewed
- [ ] Intake gate evidence satisfied before feature work
- [ ] Relevant tests, document checks and secret scans pass
- [ ] Shared contract consumers reviewed any interface change
- [ ] Personal file and BUILD-LOG updated
- [ ] Lethabo review recorded
- [ ] Sibusiso review recorded
- [ ] Nonauthor domain/security review where required; no self-approval
- [ ] Built/sim_/specified labels match actual evidence
