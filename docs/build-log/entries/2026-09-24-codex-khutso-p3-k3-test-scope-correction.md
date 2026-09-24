## 2026-09-24 | Codex assistant acting at Khutso Mothopa's request | PR #63 review correction | P3.K3 | re-review pending

**Research** — Read Sibusiso's `CHANGES_REQUESTED` review on PR #63 against every §2 requirement and the literal T01–T24 oracles in `docs/VUKA-2-SPEC.md` §15. Compared the draft trace with the branch and `main` before revising mappings. The original P3.K3 build-log entry remains unchanged as the historical draft record.

**Real data / references** — The specification has 32 §2 requirement IDs and 24 §15 test IDs. Seventeen requirements have no direct §15 test for their defining behavior: V2, V3, V4, V8, V9, V10, G2, G4, G5, G6, A1, A4, A7, S4, P1, P2 and D2. V1 has a direct test for permission refusal (T17) but not for explicit foreground arming. Other partial mappings name the exact clause their test exercises. Contract v2 and its vectors remain on PR #51; the shared JS modules are on `main`.

**Business reasoning** — Correctly scoped test links prevent the team from reporting a requirement as verified when only a nearby workflow has been exercised. This supports published T, S and B criteria and a reviewer's ability to trust the acceptance record.

**Competitor reference** — Not applicable; this is trace accuracy.

Changed: `docs/REQUIREMENTS-TRACE.md` now distinguishes direct clause coverage from test gaps on all 32 rows. V1, V2, V4 and G5 address Sibusiso's explicit findings. A1, A4, A5, A6, V7, V8, G1, S1 and D3 also had overbroad or incorrect mappings or source descriptions and were narrowed. The summary replaces the unsound 11-gap claim with the bounded 17-row count.

Evidence: The 32 rows and 17 named defining-behavior gaps were checked against the §2/§15 tables; the final diff was critiqued before push. `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `git diff --check`, and `.tools/gitleaks.exe dir --redact --no-banner .` exited 0 on 24 Sep. No test execution, implementation completion or reviewer acceptance is inferred.

Decision: None. Test ownership and acceptance remain with Sibusiso and both leads.

Needs/blockers: Sibusiso re-reviews the corrected PR #63 head; the 17 direct-test gaps and partial-clause gaps need explicit test specifications or a documented acceptance decision.

Business handoff: Use the exact clause scope in the trace when planning implementation and tests; `specified` and `partial` do not mean passed.

Next: Verify the amended trace, push PR #63 and request Sibusiso's re-review. Keep P3.K3 open until accepted.
