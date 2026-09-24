## Problem and resulting behaviour

WBS ID / owner / criterion: P3.V6 / Vukosi / T, B
Built, specified, simulated or blocked: **Offline instrument built with synthetic tests; real measurement blocked.**
What changed for a household, operator or reviewer: M1/M2/M3 reports expose counts, configuration and method; malformed inputs fail closed. The latest local proposal suppresses M3 percentiles until 30 attempts are delivered and awaits Khutso's confirmation. Review record: `docs/workflows/vukosi/p7a-measurement-instrument/REVIEW.md`.

## Evidence and verification

- Commands actually run and results: `py -3.12 -m unittest discover -s scripts/tests -v` PASS (42/42 on rebased P7a, including inherited P2a tests); docs, intake, 13 repository contract tests, Gitleaks and `git diff --check` PASS.
- Source / sample size / assumptions for changed claims: inline `sim_` JSON only; no model inference, audio, dataset, real result, threshold recommendation or new CSV. This is not a measurement.
- Screens and failure states, when relevant: no UI. Invalid input exits 2; unreadable input exits 3; insufficient delivered M3 samples expose counts without percentiles.
- Business handoff: not applicable until a separately governed real measurement exists.
- Rollback: revert the P7a commits or remove its isolated worktree/branch; no real result or media is stored.

## Review

Claude's review at `docs/workflows/vukosi/p7a-measurement-instrument/REVIEW.md` is an AI review, not human approval; it predates the proposed M3 delivered gate. Lethabo's review is pending. All checklist items intentionally remain unchecked.

- [ ] No secrets, private data or old history imported; provenance reviewed
- [ ] Intake gate evidence satisfied before feature work
- [ ] Relevant tests, document checks and secret scans pass
- [ ] Shared contract consumers reviewed any interface change
- [ ] Personal file and BUILD-LOG updated
- [ ] Lethabo review recorded
- [ ] Sibusiso review recorded
- [ ] Nonauthor domain/security review where required; no self-approval
- [ ] Built/sim_/specified labels match actual evidence
