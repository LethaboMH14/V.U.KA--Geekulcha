## 2026-09-25 | Lethabo (co-lead, acting security lead), via Claude Code assistant | Live security evidence scorecard: generated register, scorer, page, CI | PROPOSED — for Ipeleng (security) and Sibusiso (CI)

**Research** — `SECURITY-PROGRAMME.md` §12 (PR #78) defines the scorecard: evidence levels E0–E4 per control, weights from threat severity, seven categories, and "Evidence score" and "Evidence confidence", never "% secure".

**Real data / references** — The register is generated from `docs/security/SSDLC.md` (79 controls), `THREAT-MODEL.md` and, once it is on `main`, the programme's §5. Computed locally on the current `main` sources, the result is **1.9 % evidence score and 0 % evidence confidence**:
- 73 controls are at E0 and 6 at E1;
- most controls cite only documents, and the spec's T-numbered tests don't exist in code yet.

**Business reasoning** — A judge, bank or insurer can rerun the script and get the same number. A low, honest number with a clear path up is worth more than a high one nobody can check.

**Competitor reference** — Not applicable.

Changed:
- **`scripts/build-controls-register.mjs`** generates `docs/security/scorecard/controls.json`.
  - Hand-maintained fields live in `controls.overrides.json`, so regeneration never drops them.
  - `--check` fails on drift, and CI runs it.
  - Severity is never guessed: coercion rows are high, an override must carry a reason, and everything else is "unrated" at weight 1.
  - Coercion threats with no control link are listed, and the page shows them.
- **`scripts/security-score.mjs`:**
  - E1 needs an implementation path; documentation never counts;
  - E2 needs the mapped test's own passing result, bound to the scored commit by a results manifest with file hashes; skipped counts as not passed;
  - E3 needs a non-author approval record for the scored commit;
  - E4 needs an independent assessor record with a matching report hash;
  - output is byte-stable for the same inputs.
- **`dashboard/security.html` and `security.js`:** a live page with the commit, the CI run and the category bars. Register text is rendered with `textContent` only.
- **`.github/workflows/security-score.yml`** runs the register check and the scorer and publishes the result.

Evidence:
- `node --test "test/**/*.test.mjs"` passes 41/41.
- `node scripts/build-controls-register.mjs --check` passes.
- `node scripts/check-docs.mjs` passes.
- An independent code review found 8 issues and all 8 are fixed. The page display of unmapped coercion threats was added afterwards.
- The register was first hand-built, then accidentally wiped and rebuilt. It is now generated, so it can be re-derived at any time.

Decision: none.

Needs/blockers:
- The threat model has no severity column and links threats to spec IDs rather than C-nn controls, so all 79 controls are "unrated" (weight 1). Ipeleng to rate threats and add C-nn links.
- The programme's §5 controls join when #78 merges.
- Publishing to GitHub Pages needs Pages enabled.

Business handoff: quote the scorecard only with its commit and date. It is never "% secure".

Next: the threat-model severity and C-nn links; wire Settings → Security scorecard in the app to the published JSON.
