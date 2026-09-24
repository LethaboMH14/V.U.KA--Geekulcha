## Problem and resulting behaviour

WBS ID / owner / criterion: P3.V1 / Vukosi / T, S
Built, specified, simulated or blocked: **Built locally; blocked from release signing and human approval.**
What changed for a household, operator or reviewer: reviewers get a pinned React Native 0.74.5 Android scaffold, an unsigned release build, and a strict release-manifest permission oracle. Generated iOS scope was removed. Review record: [P1a REVIEW.md](REVIEW.md).

## Evidence and verification

- Commands actually run and results: `npm ci --prefix app` PASS; `node --test app/scripts/check-manifest.test.mjs` PASS (18/18); `:app:assembleDebug` PASS; `:app:assembleRelease` PASS; `apksigner verify` reports `DOES NOT VERIFY`; release manifest `--allowlist` PASS; docs, intake, contract tests and Gitleaks PASS after rebase.
- Source / sample size / assumptions for changed claims: synthetic `sim_` manifest fixtures only; no product measurement. Device checks in this protocol run are NOT RUN because the phone was not required.
- Screens and failure states, when relevant: no new screen. Debug-only cleartext and overlay permission are informational and not the release build. Release signing, T17, T20 and budget-phone behaviour remain unverified.
- Business handoff: not applicable; this is build-integrity groundwork.
- Rollback: revert the P1a commits or remove its isolated worktree/branch; no shared or production system changes.

## Review

Claude's [P1a review](REVIEW.md) is an AI review, not human approval. Lethabo's review is pending. All checklist items intentionally remain unchecked.

- [ ] No secrets, private data or old history imported; provenance reviewed
- [ ] Intake gate evidence satisfied before feature work
- [ ] Relevant tests, document checks and secret scans pass
- [ ] Shared contract consumers reviewed any interface change
- [ ] Personal file and BUILD-LOG updated
- [ ] Lethabo review recorded
- [ ] Sibusiso review recorded
- [ ] Nonauthor domain/security review where required; no self-approval
- [ ] Built/sim_/specified labels match actual evidence
