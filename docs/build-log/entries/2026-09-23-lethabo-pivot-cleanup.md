## 2026-09-23 | Lethabo (co-lead), via Claude Code assistant | Pivot clean-up | PROPOSED — binds on second-lead acceptance

**Research** — Inventoried every tracked path. Classified each as VIGIL + ANCHOR material (kept), material owners will rewrite in place (kept, with a banner), or four-layer material (archived). Checked that no test or tool reads an archived path, except `test/openapi-contract.test.mjs`, which is repointed.

**Real data / references** — The organisers confirmed on 23 Sep that pre-event building on declared lineage is allowed (reply to Lethabo; content not stored in the repo). G29 is closed, P3.L2 ticked, and the fallback in `docs/VUKA-2-SPEC.md` §14 is marked "not needed".

**Business reasoning** — A judge opening the repo now sees only the product being pitched. The README describes VIGIL + ANCHOR, states the build status honestly and gives a runnable economics command. Nothing stale can be quoted by mistake.

**Competitor reference** — Not applicable.

Changed:
- **Archived** 40 paths to `archive/2026-09-four-layer/`: the four-layer spec, architecture, business, plan, handover, team, tech-stack and user-journey docs; the legal positions for cameras and faces; the operator duty docs; the audit pack, reviews and wireframes; `appliance/`, `brain/`, `data/`, `ml/`; the UMOJA human-gate module and its test; `submission/` and the deck generators. Nothing is deleted; git history is intact.
- **Restructured** so every live file is about the pivot:
  - Team files keep the operating spec, the work order and the running log; each person's four-layer history moves to `archive/…/team/<name>-history.md`.
  - `docs/CHECKLIST.md` keeps P3 (plus P3.B8, P3.B9 and P3.K7, carried from live old rows).
  - `docs/OPEN-GAPS.md` keeps the live gaps.
  - `docs/EVIDENCE.md` keeps the 23 Sep facts. The old rows are archived with pointers (checklist rule 1 holds).
- **Rewritten:** `README.md` and the `app/`, `anchor/`, `server/`, `shared/` and `dashboard/` READMEs; an archive README.
- **Tooling:** `scripts/check-docs.mjs` skips `archive/`, retires the audit-pack checks, requires the pivot docs, and requires a work order in every team file. `npm test` now runs the contract tests only; it had been failing on `main`, because it picked up `scripts/test-security.mjs`, which needs a Gitleaks path. CODEOWNERS covers `server/` and `archive/`.

Evidence: `node scripts/check-docs.mjs` passes; `node scripts/check-intake.mjs` passes; `npm test` runs 10 tests, 10 pass; `python3 scripts/economics_vigil_anchor.py` gives break-even 10,901 at R20; `git diff --check` is clean.

Decision: part of the pivot PR (#43); binds on second-lead acceptance.

Needs/blockers: owners close or rework their stale PRs (#32, #38, #40, #41, #42 closed with comments; #39 kept for rework).

Business handoff: not applicable (no figure changed).

Next: Sibusiso's review and merge of PR #43; everyone runs START-HERE.
