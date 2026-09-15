# WBS 4.5 — integrated evidence checkpoint

Purpose: decide whether the tested snapshot is ready for the showcase, or cut scope without weakening a safety or honesty claim.

## Entry gate

- Contract PR has Lethabo’s review and both-lead approval/ADR status recorded.
- `npm test`, bundled-Python governance tests, document checks, intake checks, and gitleaks all pass.
- Every claimed capability is labelled built, specified, simulated, or deferred.
- No personal data, raw audio, images, or embeddings are present in exported evidence.

## Checkpoint sequence

1. Sibusiso records commit SHA, branch, test commands and outputs.
2. Each owner demonstrates only their assigned path and records the exact artifact or command.
3. The two leads review the safety constraints: no machine `flagged` setter, first-broken-link-by-index verifier, refusal evidence, and two-signature privileged actions.
4. The team records each result as **pass**, **cut scope**, or **blocked**, with an owner and follow-up date.
5. Sibusiso publishes the accepted SHA and refuses to tag any untested snapshot.

## Exit record

The checkpoint is complete only when both leads sign the result and every cut or blocked item is reflected in `docs/CHECKLIST.md` and `docs/OPEN-GAPS.md`. This runbook is preparation; it is not evidence that the checkpoint has passed.
