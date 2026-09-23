## 2026-09-23 | Sibusiso Khumalo (second lead), via Claude Code assistant | close the Ipeleng-review Pending line | closure record, append-only

**Research** — Read `docs/ADR-ACCEPTANCE-RECORD.md` at `main` (`8c621df`, post-PR-#43-merge) and Ipeleng's posted review (`docs/reviews/IPELENG-PR43-REVIEW.md`, committed via PR #45; GitHub review body independently re-verified word-for-word against the committed file before this entry was written). Confirmed the record's own rule — append only, never edit a past row — and left the original "Pending" line exactly as written.

**Real data / references** — Ipeleng's GitHub review, `19:10:48 UTC`, verdict APPROVE WITH CONDITIONS, scoped to §4/§7/§8/§9/§13, ADR-0036/0037 and the duress-defence doc; explicitly excludes §12 (the contract).

**Business reasoning** — `RULES.md` requires a linkable record for every assurance; leaving the acceptance record showing "Pending" after the review had already landed and the PR had already merged would misstate the repository's own governance state to the next reader.

**Competitor reference** — not applicable.

Changed: `docs/ADR-ACCEPTANCE-RECORD.md` — appended a closure section for the "Ipeleng's recorded security review... Pending" line, with a table of her three blockers (B1–B3, due before the §8/§9 meeting closes Thursday) and four should-fix items (S1–S4) with their named owners, including S1 (bank-signal provenance) assigned to Sibusiso with contract v2. No existing row or line was edited.

Evidence: `git diff --stat` shows 14 insertions, 0 deletions, one file; `git diff --check` exit 0; content cross-checked against `docs/reviews/IPELENG-PR43-REVIEW.md` line by line before writing.

Decision: none — this is a closure/paperwork record, not a new ADR or design decision. No ADR touched.

Needs/blockers: B1–B3 still need Lethabo's spec-text changes before Thursday's §8/§9 meeting; S1 is Sibusiso's own follow-up item for contract v2.

Business handoff: not applicable.

Next: Lethabo lands B1–B3 in the spec; Sibusiso folds S1 into the `contracts/openapi.yaml` v2 work already scoped in `tasks/contract-v2/01-task.md`.
