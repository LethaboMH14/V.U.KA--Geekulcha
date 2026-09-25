## 2026-09-25 | Codex at Sibusiso's request | GPT-6 | P3.A3 / §4b payload-schema vectors | published; PR pending

**Research** — Rechecked live PR heads before publication: PR #51 `feat/sibusiso-contract-v2` was at `bb6a44694385b3aa2028a1a1e7ef2e1584353980`; PR #82 `docs/sibusiso-4b-checkin-journey-payloads` was at `d69cb1948e298d4c51583515228ea3a65246597a`. The new worktree locally contains both the PR #82 merge (`9e6819f`) and a later merge of PR #51's updated head (`8a07042`).

**Real data / references** — Remote branch `feat/sibusiso-payload-vectors` was created at the exact PR #51 base head `bb6a446`. GitHub created commit `ccd98b8e9a57e88ea1e1c56474bb862fcb6fc26d` on that ref. API verification returned parent `bb6a44694385b3aa2028a1a1e7ef2e1584353980`, `tree_truncated=false`, 26 changed paths checked, 26 local/remote blob SHA matches, and 0 mismatches. The remote ref resolved to `ccd98b8e9a57e88ea1e1c56474bb862fcb6fc26d`.

**Business reasoning** — Publishing the isolated branch lets the contract and consumer reviewers inspect reproducible conformance evidence without changing PR #51 or claiming the proposed payload shapes are accepted.

**Competitor reference** — Not applicable; this is internal contract verification and publication.

Changed: published the tested payload-vector branch, including the latest PR #51 head and PR #82 schemas/docs. Direct `git push` failed with `hostkeys_foreach failed for /c/Users/lovilocal.adm/.ssh/known_hosts: Permission denied`; the authenticated GitHub API path created the new ref and commit instead. No PR was opened; Claude owns that handoff. PR #51's worktree and branch were not modified.

Evidence: PR #51 / PR #82 head check via `gh pr view`; remote ref creation and `createCommitOnBranch` via `gh api`; commit/tree/blob identity verification via `gh api repos/.../git/commits`, `gh api repos/.../git/trees`, and local `git hash-object`. Checks run on the published content immediately before publication: fresh Python venv `161 passed, 2 skipped` (PostgreSQL URL unset), clean `shared/` Vitest `128 passed`, root `node --test` `50 passed`, `check-docs`, `check-intake`, `pip-audit` (`No known vulnerabilities found`), security integration checks, and Gitleaks (`no leaks found`).

Decision: none. ADR-0044 remains **PROPOSED** pending Lethabo, Ipeleng and Khutso review. No server enforcement or human sign-off is claimed.

Needs/blockers: Claude to open the PR for review. Reviewers should check the 26-file diff includes the expected PR #82 ancestry content as well as this task; all file blobs match the tested local tree. Any ASCII-only `journey_id` limit remains for the contract owners to decide.

Business handoff: `feat/sibusiso-payload-vectors`, remote head `ccd98b8e9a57e88ea1e1c56474bb862fcb6fc26d` at publication.

Next: Claude — open and route the PR; required reviewers decide ADR-0044 status. Do not add server payload enforcement until slice 3.
