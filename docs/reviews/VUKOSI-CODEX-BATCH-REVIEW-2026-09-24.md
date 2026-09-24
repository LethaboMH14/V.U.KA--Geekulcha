# Review of Codex's rebases and protocol paperwork, 24 Sep 2026

Claude Code assistant (`claude-sonnet-5`), at Vukosi's request. AI review only: not Lethabo's review, not human approval. Reviewed heads: P1a `e53cd041b351d734edcb6e26af70a966dbe19290`, P2a `c775e1cd90be995e55217dd6aebc92a97720699f`, P7a `6ea9fdc3066b511af6de9934eae97f3e1cfda819`, paperwork `bf36cd61fdb0ad23bf377091166d8f9f821eff38`.

## Verdict: the rebases and drafts are sound; four fixes before any PR is opened

**Rebases: no code changed.** `git range-diff` shows every rebased commit as an identical patch (`=`) for P1a (7 commits), P2a (2) and P7a. Reproduced on the rebased heads: P2a 16/16 and P7a 42/42 offline tests; P1a oracle 18/18, React Native exactly 0.74.5, no `app/ios` file tracked. Docs and intake checks, `git diff --check` and Gitleaks pass. I did not rebuild P1a's APKs (the patches are identical to the version I already built and reviewed).

## Findings

### B1 (P2): the branches are stacked, so the PRs will not be small
- P7a's 8 commits above `main` include **P2a's two commits** (`21fc87c`, `11e60e0`). P7a's PR would show P2a's work.
- P1a's 7 commits include the **workflow-docs commits** (`b096844`, `b1ec3ae`), so its PR would also show them.
- `RULES.md`: PRs stay small. **Suggested merge order:** (1) the workflow-docs PR, (2) P2a (already clean, 2 commits), (3) P7a rebased with P2a's commits dropped (`git rebase --onto origin/main <P2a head>`), (4) P1a rebased once the workflow-docs PR has merged. All three packets are independent of each other in code.
- `team/vukosi.md` running-log lines will collide between the code PRs (Codex's report lists them); resolve by keeping every line.

### B2 (P3): the paperwork dropped an issued target
The "Needs and blockers" edit removed the original line "Physical phones: at least two Android phones (user + guardian) and one budget 2–3 GB phone for M4/M5 → leads confirm who brings what by **Thu 24 Sep 10:00**." and replaced it with a "measurement phones" bullet that has **no date**. The `Thu 24 10:00` target was issued and should be preserved, not invented away. Restore the date in that bullet.

### B3 (P3): relative links in the PR bodies will not resolve
`[P1a REVIEW.md](REVIEW.md)` (and the P2a and P7a equivalents) is relative to the file, but a PR description is not in that folder. Use the full repo path, for example `docs/workflows/vukosi/p1a-rn-scaffold/REVIEW.md`.

### B4 (P3, optional): the P1a PR body omits the device result
It says device checks are NOT RUN in the protocol run, which is accurate for that run. My earlier independent review recorded a debug build installed and started on the Samsung SM-A736B (Android 16, API 36); the PR body could cite it as the reviewer's result, labelled as such, alongside "release install, T17 and T20 not run".

### Notes
- The optional work-order acceptance line was omitted. That is correct unless Vukosi explicitly authorises it.
- `origin/main` moved to `3a54073` after Codex's rebase; that commit touches none of our paths, so the next rebase should be trivial.
- `docs/workflows/vukosi/PROPOSED-RULE-ADDITIONS.md` is properly labelled PROPOSED and does not edit `RULES.md`.
- The PR-body review checklists are correctly left unchecked, and each states that Lethabo's review is pending and that the Claude reviews are AI reviews.

## Not verified
Any device check on the rebased heads; a rebuild of the P1a APKs; the paperwork's claims about GitHub state.
