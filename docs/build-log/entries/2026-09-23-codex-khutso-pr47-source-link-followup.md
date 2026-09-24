## 2026-09-23 | Codex assistant acting at Khutso Mothopa's request | web and local repository | P3.K1 / PR #47 | follow-up drafted; reviewer acceptance pending

**Research** — Compared Lethabo's PR #47 review with current commit `9d6a9d0` and the evidence, audit, team and master-context text. Followed the FIPS 204 Federal Register link from NIST's official publication page and inspected the notice's `DATES` section.

**Real data / references** — [NIST FIPS 204](https://csrc.nist.gov/pubs/fips/204/final) gives 13 August 2024 as its publication date. [Federal Register notice 2024-17956](https://www.federalregister.gov/d/2024-17956) gives 14 August 2024 as its effective date. The prior `2024-17918` citation did not reach that notice. The detailed SABRIC incident and app-share figures remain secondary according to the P3.K1 audit; no new primary support was established here.

**Business reasoning** — Fixing a broken primary citation and preventing a headline page from promoting secondary figures as unqualified facts reduces the chance that a judge or partner finds a contradiction in VUKA's evidence chain.

**Competitor reference** — Not applicable; this changes source provenance and claim status, not a product comparison.

Changed: `docs/EVIDENCE.md` now links the correct Federal Register notice. `docs/MASTER-CONTEXT.md` keeps the sourced R2.4bn gross-loss figure but sends readers to the qualified detail in `docs/EVIDENCE.md`. The P3.K1 audit records the exact date language and previous link error; `team/khutso.md` corrects the PR status and records this follow-up.

Evidence: NIST's publication page and linked Federal Register `DATES` section were opened and compared. `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `git diff --check`, and `.tools/gitleaks.exe dir --redact --no-banner .` all exited 0. These automated checks do not establish human fact review. No human review acceptance or Khutso personal source confirmation is inferred.

Decision: None; this narrows claim presentation and repairs a citation within the existing P3.K1 scope.

Needs/blockers: Sibusiso and then the leads must review the new PR #47 head. Khutso's personal confirmation of source reads remains pending. No checklist item is ticked.

Business handoff: Babatunde and Lethabo should use the qualified master-context and evidence rows for any presentation figures.

Next: Codex assistant to push the follow-up; Sibusiso to review PR #47, with Lethabo/lead acceptance afterward.
