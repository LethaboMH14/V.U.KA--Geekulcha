## 2026-09-24 | Codex assistant acting at Khutso Mothopa's request | GitHub CLI and local Git | P3.K2 | replacement PR open, review pending

**Research** — Inspected PR #52's live author, head, base, review requests and discussion; inspected PR #47's current head and compared the local branch graph. Read the current role, overlap and review rules before migrating the P3.K2 commit.

**Real data / references** — PR #52 was authored by `KhozaVu`, based on an older P3.K1 head and had no reviews or comments. GitHub CLI `auth status` identified `KhutsoMothopa` as the active account. PR #47 head was `40f1900`. The P3.K2 source values and SAPS PDF links are unchanged from the original assistant-authored evidence commit; this entry adds no new crime statistic.

**Business reasoning** — Correct attribution and a clean, current-base diff let reviewers trace ownership and assess the evidence without obsolete P3.K1 differences. This supports criteria T, S and B and the question of whether a real user would trust the claim.

**Competitor reference** — Not applicable; this changes review provenance, not a product comparison.

Changed: Replayed P3.K2 on `docs/khutso-p3-k2-saps-totals-replacement`, based on PR #47 head `40f1900`. Opened [PR #54](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/54) under `KhutsoMothopa` and requested `Sibusiso-K`. Closed [PR #52](https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/52) with a pointer to #54; its old branch remains for traceability. This entry and `team/khutso.md` record the handoff.

Evidence: `gh pr view 54` confirmed author `KhutsoMothopa`, base `docs/khutso-p3-k1-evidence-recheck`, exactly three changed files and the Sibusiso-K request. `node scripts/check-docs.mjs` passed; `node scripts/check-intake.mjs` passed with human authenticity review still required; `git diff --check origin/docs/khutso-p3-k1-evidence-recheck...HEAD` passed; `.tools/gitleaks.exe dir --redact --no-banner .` found no leaks. These checks do not constitute human source confirmation or review acceptance.

Decision: Khutso explicitly approved replacement of PR #52. No evidence or governance contract decision was made, and nothing was merged.

Needs/blockers: Sibusiso to review P3.K2 on PR #54, then both leads to review as required. P3.K1 on PR #47 still needs Khutso's personal source confirmation and reviewer acceptance; do not merge the stacked PR before its base is accepted.

Business handoff: Babatunde and Lethabo should cite the P3.K2 baseline only after evidence review, using PR #54 rather than the closed #52.

Next: Sibusiso reviews PR #54; Khutso confirms source reads; leads decide acceptance. `docs/CHECKLIST.md` remains unticked.
