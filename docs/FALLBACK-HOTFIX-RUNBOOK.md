# WBS 7.2 — fallback and scoped-hotfix rehearsal

This is a rehearsal procedure. It does not authorise a production rollback, force-push, `--no-verify`, or an authority bypass.

## Prepare

1. Record the tested commit SHA and the last known-good SHA.
2. Confirm the change is reversible and identify the exact affected path.
3. Confirm the two-lead review/approval requirement for any contract or privileged-action change.
4. Export only synthetic fixtures; never copy personal data, raw audio, images, or embeddings into the rehearsal bundle.

## Rehearse

1. Apply a deliberately scoped defect in an isolated branch or worktree.
2. Run the documented checks and capture the first failing command and output.
3. Revert the isolated change with a reviewed commit; do not reset shared history.
4. Re-run the full checks and compare the resulting SHA with the recorded good snapshot.
5. Record the operator, reviewer, timestamps, commands, outcome, and any unresolved risk.

## Acceptance

The rehearsal passes only when rollback restores the checks, the safety constraints remain intact, and both leads accept the record. A failed rehearsal is evidence: preserve the failure and cut the affected scope until a new reviewed fix is tested.
