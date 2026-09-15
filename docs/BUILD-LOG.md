# Shared build log

Append-only factual record. Mandatory at every meaningful code, document, interface, configuration, test-evidence or status change; also every blocker, handoff and decision. Fix mistakes with a new correction entry. Do not store secrets, personal incident data or fabricated human actions. If multiple people append concurrently, retain all entries during merge.

## Entry format

```text
Date/time with timezone | actual author | tool/model | WBS/task | status
Changed: files and user-visible or operational effect
Evidence: command/result or review link; distinguish not run
Decision: ID and approval state, or none
Needs/blockers: named owner and evidence required
Business handoff: path or not applicable with reason
Next: owner, task, proposed date
```

## 2026-09-12 | Codex assistant | model identifier not independently recorded | audit-pack | authored, human review pending

Changed: README, eight audit documents, seven planning packages, standing rules, brief, overlap register, security configuration and document checker. Created from the supplied prompt pack against clean base `464d0c4e8af12897f27619620742aaa69c9332ca`; no old history imported.

Evidence: initial checkout contained only README and MIT LICENSE. External tax/privacy/platform sources linked in the audit. Final executable verification is recorded in the appended verification entry, not implied here.

Decision: proposals only; no human approvals. Historical build evidence remains unverified.

Needs/blockers: account owners and Ipeleng supply revocation evidence; Lethabo supplies data-remediation record and original documents; both leads accept proposed assignments. No feature port authorised by evidence yet.

Business handoff: docs/audit/06-business-translation.md and templates/BUSINESS-HANDOFF.md.

Next: both leads review pack and security gate before feature work.

## 2026-09-12 | Codex assistant | model identifier not independently recorded | audit-pack verification | local checks passed

Changed: added executable document/intake checks, checksum-pinned Gitleaks installer and real pre-commit integration tests. Local clone uses `.githooks` and a readable local Git exclude file. No application feature code was imported.

Evidence: `node scripts/check-docs.mjs` passed all eight word budgets, local Markdown links, seven packages, thirty-five WBS leaves, fifteen calendar days, twelve wireframe specs, six Mermaid blocks, both OWASP matrices, forty edge cases, twenty objections and red-team counts. This validates structure, not factual completeness. `node scripts/test-security.mjs` passed actual isolated Git commits: clean content accepted; synthetic leak rejected; clean unstaged replacement did not hide a staged leak; clean replacement accepted; blocked feature intake rejected; missing scanner rejected. Gitleaks 8.24.3 full-worktree and existing-history scans found no leaks. The first worktree scan detected a vendor README's example credential inside the ignored downloaded tool directory; that unnecessary vendor README was removed and the installer now extracts only the executable. An inaccessible global ignore file initially made Gitleaks abort; local fixture/clone Git configuration now uses the readable local exclude file.

Decision: local tooling verified, remote CI and branch protection not verified. Remediation JSON remains blocked; no approvals fabricated.

Needs/blockers: original credentials/data remediation, absent application/evidence/documents, both-lead review and remote gate setup remain with named owners in EVIDENCE and SECURITY.

Business handoff: no new household capability; this change makes intake and documentation errors easier to detect before feature work.

Next: review and publish the approved branch through the documented workflow; no push, merge or visibility change performed during authoring.

## 2026-09-12 | Claude Sonnet 5 | claude-sonnet-5 | Task 1 — coordination scaffolding | authored, both-leads review pending

Changed: merged `origin/docs/astra-audit-alignment` (PR #1, Sibusiso) into a new branch `docs/task1-coordination-scaffolding` off `main`, keeping RULES.md, AGENTS.md, team/*.md, the security stack (`.gitleaks.toml`, `.githooks/pre-commit`, `.github/workflows/checks.yml`, `scripts/check-*.mjs`, `scripts/test-security.mjs`), and `docs/audit/**`. Restored `docs/HANDOVER.md` (survived the merge unmodified) and rewrote README.md to keep every honesty-critical section the branch had dropped — the four-layer table, "How much AI is in this", "What currently fails", "Claims we refuse to make", TRL, and "How to check this rather than believe it" — while folding in the branch's more cautious framing (R299 modelled not quoted, predecessor figures stated as supplied not reproduced). Moved `BUILD-LOG.md` to `docs/BUILD-LOG.md` per `docs/HANDOVER.md` §7 and fixed the four references to it (`AGENTS.md`, `RULES.md`, `scripts/check-docs.mjs`). Replaced `BRIEF.md`'s competing gate calendar with `docs/HANDOVER.md` §6's gates so exactly one calendar exists between those two files (`docs/audit/05-team-operating-system.md`'s finer-grained WBS still has a 2-day mismatch on the clean-intake date — flagged as G16, not resolved unilaterally). Ported all 25 architecture decision records from both predecessor repositories' `origin/main` into `docs/adr.md`: BEACON's ADR-0001–0007 kept unchanged (every existing citation in this repository's docs already uses that numbering), Team-Sonar-Vuka's ADR-0001–0018 renumbered ADR-0008–0025 with every internal cross-reference rewritten to match, and a provenance table at the top mapping every new ID to source, original ID, title and date. Recorded the renumbering itself as ADR-0026, which supersedes `CLAUDE.md` §12's original ADR-0020–0025 plan. Created `docs/OPEN-GAPS.md` consolidating the G1–G10 register from `CLAUDE.md` §11 / `docs/00-SPEC.md` §7 with the five still-open items from `docs/SDLC-GAP-ANALYSIS.md` §4 (wireframes, model licence register, model cards, OpenAPI spec, operator training) as G11–G15, plus G16 for the gate-calendar mismatch, with owners mapped to the current seven-person roster. Updated `docs/EVIDENCE.md` with the exact re-derivation commands and results for the three "clone and count" figures in README: 25 ADRs confirmed exactly; commits corrected from 207 to 224 (BEACON 90 + Vuka 134 on `origin/main`); "440 tests" found to have no reproducing command (510 test-function definitions found instead, a different measure, stated as such rather than left unreproducible). Closed `docs/HANDOVER.md` §11 open question 1 (Ndumiso Skhosana attribution) — confirmed resolved by Lethabo in chat on 12 September 2026, no wording change needed, marked resolved rather than deleted.

Evidence: `git remote -v` on the working branch shows only `origin` — no predecessor remote added, no history imported, consistent with `docs/HANDOVER.md` §3 rule 1. ADR citation check — `grep -rhoE "ADR-[0-9]{4}" docs/00-SPEC.md docs/01-ARCHITECTURE.md docs/AI-AUTONOMY.md docs/ANCHOR-RATIONALE.md docs/ANCHOR-RATIONALE-ADDENDUM.md docs/SDLC.md docs/TECH-STACK.md docs/USER-JOURNEY.md docs/PLAIN-WORDS.md | sort -u` against the IDs defined in `docs/adr.md` — every citation resolves, none dangling. `docs/adr.md` contains exactly 25 numbered entries (`grep -c "^## ADR-" docs/adr.md` → 25) plus ADR-0026 recording the renumbering. Commit and ADR counts re-run against both predecessors' `origin/main` with commands recorded in `docs/EVIDENCE.md`. `node scripts/check-docs.mjs` and `node scripts/test-security.mjs` not yet re-run against the moved `docs/BUILD-LOG.md` path in this session — **next owner must confirm both pass before merge.**

Decision: none authorised by this entry. This lands on a branch for both-leads review per `RULES.md` — no direct commit to `main`.

Needs/blockers: both leads' review before merge. `node scripts/check-docs.mjs` re-run against the moved BUILD-LOG path. G16 (gate-calendar mismatch between `BRIEF.md`/`docs/HANDOVER.md` and `docs/audit/05-team-operating-system.md`) needs Sibusiso and Lethabo to reconcile — not resolved by this entry, only flagged. R1–R4 (credential rotation, password change, history purge) remain the actual blocker before any application code lands, per `docs/HANDOVER.md` §3 rule 2 — this entry is documentation and coordination scaffolding only, no application code.

Business handoff: not applicable — this is repository coordination infrastructure, no household-facing capability changed.

Next: open a PR from `docs/task1-coordination-scaffolding` against `main`, referencing and effectively superseding PR #1. Both leads review. Task 2 (secret scanning as hook + CI) is functionally delivered by this branch already (ported from the audit-alignment branch) — verify it actually blocks a planted secret before treating G6 as closed.

## 2026-09-12 | Claude Sonnet 5 | claude-sonnet-5 | G16 resolution | authored, Lethabo (lead) directed the recheck

Changed: `docs/OPEN-GAPS.md` — G16 (flagged gate-calendar mismatch) re-examined at Lethabo's direction and closed, not by picking one calendar over the other but by re-checking both: `docs/TEAM.md`'s gate windows (Clean 13–16, Align 17–19, Govern 17–21, Calibrate 20–23, Harden 22–24) close exactly on `docs/HANDOVER.md` §6's gate dates. The WBS item originally flagged (1.4, clean-intake evidence, due Sep 14) is evidence-assembly work inside the Clean window, finishing before the gate itself closes on the 16th — not a competing date. The original G16 flag was a misread of one WBS line in isolation against the milestone date; corrected rather than defended.

Evidence: `grep -n "Clean\|Align\|Govern\|Calibrate\|Harden" docs/TEAM.md` — all five windows quoted and cross-checked against `docs/HANDOVER.md` §6 line by line.

Decision: G16 closed by Lethabo (lead) in chat, 12 September 2026.

Needs/blockers: none remaining from this item.

Business handoff: not applicable.

Next: request Sibusiso's review on PR #2 given he authored the WBS and PR #1 which #2 supersedes.

## 2026-09-12 | Claude Sonnet 5 | claude-sonnet-5 | G17 discovered — branch protection blocked | authored

Changed: `SECURITY.md` and `docs/OPEN-GAPS.md` — recorded a new, verified finding (G17): branch protection on `main` cannot currently be configured because the repository is private on GitHub's free tier. Also recorded that CI now has an evidenced green remote run on PR #2 (both `secret-scan` and `document-contracts` jobs `SUCCESS`), which SECURITY.md previously flagged as unevidenced.

Evidence: `gh pr view 2 --json statusCheckRollup` — both jobs `SUCCESS`, checked 12 Sep 2026. `gh api repos/LethaboMH14/V.U.KA--Geekulcha/branches/main/protection` → `403: Upgrade to GitHub Pro or make this repository public to enable this feature`. `gh repo view --json isPrivate` → `true`. All three commands and their exact output recorded in `SECURITY.md`.

Decision: none authorised by this entry — flagged for Sibusiso, who owns branch protection per SECURITY.md's existing text.

Needs/blockers: repository must go public (or gain GitHub Pro) before branch protection requiring the CI jobs and nonauthor review can be enforced. Until then, passing CI is advisory only — nothing stops a direct push to main.

Business handoff: not applicable.

Next: Sibusiso sets branch protection the moment the repository is public or on Pro, requiring both CI jobs and the review rule in RULES.md.

## 2026-09-13 | Claude Sonnet 5 | claude-sonnet-5 | G6/G7 — repos made private | authored, Lethabo directed and confirmed

Changed: `docs/OPEN-GAPS.md` G6 and G7 rows updated with exact findings and a partial-mitigation status. Located the three secret-bearing files (confirmed only in `Team-Sonar---Vuka-`'s history/HEAD, not in `BEACON` — corrects `CLAUDE.md`'s claim that the EskomSePush token was "in BOTH repos") and the proprietary dataset files (confirmed in both `BEACON` and `Team-Sonar---Vuka-`, still on `main` as of today). Made both `LethaboMH14/BEACON` and `LethaboMH14/Team-Sonar---Vuka-` private on Lethabo's explicit go-ahead (`gh repo edit --visibility private`), verified with `gh repo view --json isPrivate` → `true` for both.

Evidence: `git log --all --diff-filter=A --name-only` located the files across all branches after they didn't appear in a plain working-tree search. Exact line numbers cross-checked against `CLAUDE.md` §0's original claims — `weather_ingestion.py:7` and `acled_ingestion.py:6-7` match exactly; `esp_pipeline.py:51` matches for line number but the "in both repos" claim does not hold. `gh repo view` before and after confirms both repos flipped from `PUBLIC` to `PRIVATE`.

Decision: repos made private — Lethabo (lead), 13 Sep 2026, in chat, after I reported the live exposure and asked before acting.

Needs/blockers: **rotation is still outstanding and is not something this session can do** — the WeatherAPI key, EskomSePush token and the password (which the account pattern suggests belongs to Ndumiso, not on this team) all need the account holder directly. History purge (`git filter-repo`) is staged conceptually but not executed — needs rotation confirmed first, then explicit go-ahead to force-push, since it's irreversible for any existing clone/fork. Password value is not recorded in this repository or this log, by design.

Business handoff: not applicable — this is remediation of a predecessor-project exposure, not a household-facing change.

Next: Lethabo/Ndumiso rotate the three credentials; confirm here; then stage and execute the history purge with explicit sign-off before any force-push.

## 2026-09-13 | Claude Sonnet 5 | claude-sonnet-5 | G6/G7 closed — history purged, rotated, force-pushed, verified | authored, Lethabo directed and confirmed each step

Changed: `docs/OPEN-GAPS.md` — G6 and G7 marked closed; new G18 recorded (both predecessor repos intentionally kept private going forward, per `CLAUDE.md` D15, not a temporary state). Executed the full remediation: mirror-cloned both `BEACON` and `Team-Sonar---Vuka-` fresh into a scratch directory (never touched the working checkouts); ran `git filter-repo --invert-paths` to remove `Gradhack_Insure_Data.xlsx`, `claims_cleaned.csv`, `claims_cleaned.xlsx` from every branch of both; ran `git filter-repo --replace-text` to redact the WeatherAPI key, EskomSePush token, ACLED email and password (Team-Sonar-Vuka), and — found only during this pass, not in the original remediation list — a Roboflow API key committed to `BEACON`'s `vision/.env`. Confirmed the file existed in BEACON at a different path than `CLAUDE.md` originally described (root level, not `vuka/data-pipeline/`), and confirmed it carried the *same already-rotated* WeatherAPI/EskomSePush values as Team-Sonar-Vuka, not separate live ones. Force-pushed both rewritten histories (`git push --mirror --force`) after Lethabo confirmed no other clones existed and gave explicit go-ahead.

Evidence: `git log --all --diff-filter=A --name-only` across every branch of both mirrors confirms both dataset paths and all four secret strings are gone. `gitleaks git --redact --log-opts="--all"` on both mirrors before push: zero leaks. After push, independently re-verified against **fresh clones from GitHub** (not the mirrors used to push) — `gitleaks git --log-opts="--all"` zero leaks on both, `gitleaks dir` zero leaks on both working trees. GitHub API (`git/trees/main?recursive=true`) confirms the dataset files are absent from both live repos; `contents/.../weather_ingestion.py` and `contents/.../acled_ingestion.py` fetched directly from the API confirm the redacted placeholder text is what is actually live, not what a local mirror merely claims. All original branches on both repos survived the rewrite (5 on BEACON, 24 on Vuka) — nothing dropped.

Decision: repos rotated (Lethabo/account holders, confirmed in chat) then purged and force-pushed (Lethabo, explicit go-ahead in chat, 13 Sep 2026, after confirming no other local clones existed).

Needs/blockers: none remaining for G6/G7. The Roboflow key rotation should be double-checked by whoever owns that Roboflow account, since this session confirmed only that the value in `.env` matched what the account holder rotated — not independently verified against the Roboflow dashboard.

Business handoff: not applicable — remediation of predecessor-project exposures, not a household-facing change.

Next: none required. Both repos remain private per G18; do not restore public visibility without a fresh reason and review.

## 2026-09-13 | Claude Sonnet 5 | claude-sonnet-5 | G11 — wireframes committed | authored

Changed: committed 12 of the 14 exported priority-screen wireframes to `docs/wireframes/`, ported from the BEACON design handoff (`design/exports/design_handoff_beacon/screens/`, predecessor codebase, `origin/main`). Added `docs/wireframes/README.md` — an index mapping each screen to a specific step in one of the four journeys in `docs/USER-JOURNEY.md`, honest about which mappings are exact (e.g. Verify Queue → J1 19:43:15 and J4 16:22) versus contextual (e.g. Executive Analytics → not journey-specific, business/impact view only). Two of the 14 files — `support.js` and `ios-frame.jsx`, the design tool's own rendering helpers, referenced by the `.dc.html` files but explicitly marked "not meant to ship" in the source bundle's own README — are held back rather than committed, because their extensions trip the same `scripts/check-intake.mjs` gate that Task 3's scaffolding is waiting on both leads to clear. Documented this limitation plainly in the wireframes README rather than silently shipping partial rendering. Updated `docs/OPEN-GAPS.md` G11 to reflect the screens closed, the two helper files still pending.

Evidence: `grep -liE "api[_-]?key|password|token|secret"` over all 12 `.dc.html` files before committing — no matches, consistent with the source README's claim these use mock data only. `node scripts/check-docs.mjs` passes (exit 0). `node scripts/check-intake.mjs --staged`, run with ONLY the wireframes and `docs/OPEN-GAPS.md` staged (Task 3's unrelated scaffolding explicitly unstaged first, to avoid conflating the two): [result recorded by the commit itself — see the pre-commit hook output].

Decision: none — a `.dc.html`/`.md` commit, no contract or locked decision touched.

Needs/blockers: `support.js` and `ios-frame.jsx` land once the intake gate clears (same blocker as Task 3, tracked in `docs/OPEN-GAPS.md`). Mutarisi/Lethabo still own recreating these designs pixel-perfectly against the actual stack (`docs/HANDOVER.md` Task 6) — this commit only makes the existing reference visible, it does not build the real screens.

Business handoff: not applicable — no capability changed, design reference only.

Next: Task 6 (recreate against the real stack) once the application layers exist to recreate them in.

## 2026-09-13 | Claude Sonnet 5 | claude-sonnet-5 | Figma workspace — 2 flagship screens + FigJam board | authored

Changed: at the user's request for "a professional and easy workflow," built two live Figma files (not committed to the repo — Figma has no repo-friendly export for editable files; linked from `docs/wireframes/README.md` instead). **Design file** (`figma.com/design/pZYQ3m68SWIMFqaOk8kN3R`): a real design-token foundation (21 colour variables bound to Figma Variables, matching the source design brief's hex values exactly — verified via `git show` on `theme 3 discovery`'s `design/exports/design_handoff_beacon/README.md`, not invented), community-library components imported from Figma Community (Button/Card from "Simple Design System", Chip from "Material 3 Design Kit" — found via `get_libraries`/`search_design_system`, not hand-drawn), two fully-built flagship screens (Verify Queue, Member Alert Detail) matching the source brief's exact layout specification, and the remaining 10 screens as correctly-sized frames carrying their real spec content as placeholder text. **FigJam board** (`figma.com/board/1vj9NC9ylnlG7God607Ls0`): five sections — the four journeys, the 12-screen index, the seven-person roster, G11–G15 open items, and a live participatory area for the team's own stickies.

Notable findings during the build: (1) Apple's official "iOS and iPadOS 26" community library blocks programmatic component instantiation via the Plugin API (`Not permitted to upsert from library`) — a real licensing restriction, not a bug; Member Alert Detail's status bar/home indicator are hand-built plain equivalents instead, which are not copyrighted assets. (2) A real bug, not a rendering artifact: every bare `figma.createAutoLayout()` call defaults to opaque white fill unless explicitly cleared — this produced white boxes behind roughly a third of Verify Queue's text before being diagnosed via a structural fill-audit (not guessed) and fixed by clearing 17 stray fills, sparing the one frame (the selected queue row) where white is intentional. Later frames were built with `fills=[]` set explicitly from the start, avoiding a repeat.

Evidence: every colour value cross-checked against the source repo's actual design-system documentation. Both flagship screens screenshotted and visually verified after the fill fix — no artifacts remain. `docs/wireframes/README.md` updated with both file links, `node scripts/check-docs.mjs` re-run and passing (exit 0).

Decision: none — a design-reference and coordination artifact, no contract or locked decision touched. Neither Figma file is committed to the repo (nothing to commit — they're hosted, linked).

Needs/blockers: the two remaining iOS system-chrome elements (status bar, home indicator) on any future mobile screen should use the same hand-built approach, not attempt to import from the iOS 26/27 community libraries. The 10 placeholder screens still need Task 6's actual build-out.

Business handoff: not applicable — design tooling, no household-facing capability changed.

Next: Mutarisi picks up the design file to build out the remaining 10 screens using the established token/component system; team uses the FigJam board's open-items area for live questions.

## 2026-09-14 | Claude Sonnet 5 | claude-sonnet-5 | kickoff + team operating system + corrections context | authored, Lethabo directed

Changed: Landing the coordination layer so all seven people can start in parallel. **New:** `docs/MASTER-CONTEXT.md` (theme, four selection criteria with the "not yet published" warning, the showcase, the honesty ledger, claim-tagging vocabulary — owned by Khutso); `docs/CHECKLIST.md` (every Phase 1/2/blockchain-track item from `docs/PLAN.md` entered day one, owner, criterion tag, state, amendment log — owned by Khutso); `docs/PLAN.md` (the full execution plan: corrections, PSiRA/POPIA/RICA/CPSI findings, the pipeline, per-person specs, the blockchain-track section); `docs/SESSION-PROMPT.md` (the universal one-word-different session prompt, pointing at each person's own team file); `docs/KICKOFF.md` (the team greeting). **Edited:** all seven `team/<name>.md` files gain a `## Agent operating spec` block (identity, reviewer, effort, behaviour, domain rules, current task, done-means) so the universal prompt has something to pull; `templates/BUSINESS-HANDOFF.md` gains four fields (canvas block, cost to build/run, journey step + screen ID, one-sentence commercial why); `RULES.md` and `AGENTS.md` gain a criteria-recall block and the claim-tagging vocabulary, both pointing at MASTER-CONTEXT as the first read; `docs/EVIDENCE.md` gains the corrected market figures (4:1 replacing "2.7m vs 180k", R87bn industry/R7bn government, both cited to PSiRA 2024/25 and SAPS Mar 2025) and the anchoring-cost correction (R1.30 was computed off Hedera's pre-2026 price; Hedera repriced 8x in January 2026, giving ~R9-10/month at current price, or ~R0 if OpenTimestamps is primary); `docs/OPEN-GAPS.md` gains G19 (PSiRA structure), G20 (POPIA s27/s57), G21 (draft Gated Access Areas Code), G22 (the R1.30 figure); `docs/ANCHOR-RATIONALE.md` gains the blockchain-track section — TradeLens pre-empt, five named precedents (Certificate Transparency, El Salvador/OpenTimestamps, WFP Building Blocks, BanQu, Standard Bank's Hedera node), the ECTA s15 and FSCA/SARB positions, three precision fixes and three rehearsed attack answers — and corrects its own stale R1.30/$0.0001 references inline; `docs/HANDOVER.md` repo-map corrected for the archive move below. **Moved:** the August submission (`VUKA-Pitch-Deck.pdf`, `.pptx`, `VUKA-Architecture.html`, 24 `slides/Slide*.JPG`, and the three `docs/pdf/*.pdf` generated documents — all carrying "27 ADRs", "440 tests", "2.7m vs 180k" and bare "TRL 5") to `submission/archive-2026-08/` via `git mv`, with a new README there mapping each stale claim to its correction and stating what replaced the archive. Personal AI tooling, agent configs and command routing were deliberately kept out of this repo per standing decision — only content lands here.

Evidence: `node scripts/check-docs.mjs` exits 0 (all eight audit docs within word budgets, all seven team files carry required markers, `BRIEF.md` within its 500-word budget, no broken local markdown links repo-wide including through the archive move). `node scripts/check-intake.mjs` exits 0 ("documentation/repository tooling only"). `grep` confirms no remaining `submission/VUKA-*` or `docs/pdf/` path references outside `docs/HANDOVER.md` (now corrected) and the new archive itself.

Decision: none new — this operationalises decisions already recorded (TRL 4 position pending ADR-0027, the market-figure and anchoring-cost corrections, the "one current version, dated archive for the rest" repo-hygiene rule). PSiRA/POPIA/blockchain findings recorded here as open gaps (G19-G22) are analysis, not yet ADRs; Ipeleng and Sibusiso still own writing the ADRs themselves per `docs/CHECKLIST.md` P2.1-P2.4.

Needs/blockers: ADR-0027 (TRL, Lethabo) and the PSiRA/POPIA ADRs (Ipeleng) are still to be written — this entry provides the evidence and checklist rows, not the ADRs themselves. `team/sibusiso.md`'s own stale figure (noted in `docs/PLAN.md` repo-cleanup table) is left for Sibusiso to correct in his own session, not touched here, so his authorship of his file's history is preserved.

Business handoff: not applicable — coordination and documentation infrastructure, no household-facing capability changed. Four new business-handoff fields are themselves part of this change (`templates/BUSINESS-HANDOFF.md`).

Next: open PR from `docs/kickoff-and-team-operating-system` requesting both leads. Once merged, each person pulls, runs `docs/SESSION-PROMPT.md` with their own name, and starts their Phase 1 item per `docs/CHECKLIST.md`.

## 2026-09-14 | Claude Sonnet 5 | claude-sonnet-5 | Task 3 — scaffold the repo map, landed | authored

Changed: created the full directory structure from `docs/HANDOVER.md` §8 — `app/{android/{service,modules,assets/models},src/{sensors,brain,evidence,api,ui}}`, `appliance/{vision,audio}`, `server/src/{api,ws,suspicion,risk,routing,db,auth,middleware,notify}`, `anchor/`, `brain/`, `data/{ingest,geocode,enrich,forecast,eval}`, `dashboard/`, `shared/`, `ml/eval/`. Every leaf directory has a `.gitkeep`; every top-level directory named in HANDOVER §8 has a `README.md` explaining its layer, its non-negotiable rules pulled from `docs/00-SPEC.md`/`docs/AI-AUTONOMY.md`/`RULES.md`, and the specific open gap in `docs/OPEN-GAPS.md` that blocks a real claim about what lands there. No application code — Task 3 is scaffolding only; Task 4 (the port) is separate and not started.

This work was staged on 2026-09-13 but held uncommitted because `scripts/check-intake.mjs` blocked it — `docs/security/intake-gate.json` was still `"status": "blocked"`, with no lead approvals recorded. Rather than bypass the hook or fabricate an approval, it sat staged overnight while Sibusiso reviewed and merged PR #2, then signed the remediation gate himself (`docs/reviews/LETHABO-PR2-REVIEW.md`, `docs/security/intake-gate.json` → `"status": "approved"`, both leads' entries recorded — Lethabo's correctly labelled as author acceptance, Sibusiso's as independent review). Re-tested `check-intake.mjs --staged` against this same scaffolding once the gate opened: passes.

Evidence: directory structure matches `docs/HANDOVER.md` §8 exactly (`find app appliance server anchor brain data dashboard shared ml -type f`, 38 files). `node scripts/check-docs.mjs` passes. `node scripts/check-intake.mjs --staged` passes against the now-approved gate.

Decision: gate approval — Sibusiso and Lethabo, recorded in `docs/security/intake-gate.json` and `docs/reviews/LETHABO-PR2-REVIEW.md`, 13 September 2026. Scaffolding itself — no contract or locked decision touched.

Needs/blockers: none for this task. Task 4 (the actual port, `shared/contract.ts` first) is next per `docs/HANDOVER.md` §7's sequencing.

Business handoff: not applicable — no capability changed, structure only.

Next: Task 4, the port.

## 2026-09-15 16:30 SAST | Codex acting for Sibusiso | GPT-5 | WBS 3.1 / G14 | implementation proposed; second-lead review pending

Changed: created `contracts/events.schema.json` v0.1.0 with exactly the frozen event properties plus the explicit version, `additionalProperties: false`, and no privileged state field. Added zero-dependency `package.json` using `node --test` and `test/events-contract.test.mjs` with exact-shape acceptance and rejection tests. Added `contracts/openapi.yaml` v3.1 for only the endpoints in `docs/00-SPEC.md` §4, including roles/security, errors, pagination, idempotency, receipt states, WebSocket separation and F14/F15 showcase markers. The review action enum intentionally contains `verify_concern`, `dismiss` and `whitelist`; it does not expose a `flagged` setter.

Evidence: `node --test test/events-contract.test.mjs` → 3 tests passed; `npm test` → 4 tests passed (the existing security integration test plus the three event tests). OpenAPI text was inspected for the specified paths and absence of `flagged`/`flag` action values; a YAML parser is not installed, so semantic YAML validation remains outstanding.

Decision: Sibusiso approved the runner and instructed continuation. The contracts are implementation-proposed, not jointly frozen: Lethabo's review and a versioned ADR are required by `RULES.md` before consumers rely on them as immutable.

Needs/blockers: Vukosi may build against the exact v0.1.0 event envelope; his needs field was updated. Lethabo must review the verify action naming and F14/F15 contract; Ipeleng must review signature, deletion and privacy boundaries. No anchor code or SC.1 implementation was touched.

Business handoff: `templates/BUSINESS-HANDOFF.md` not changed; this defines interfaces and test evidence, not a household-facing capability.

Next: Lethabo and both leads review the proposed contract/ADR; then add OpenAPI semantic validation and proceed to WBS 3.3.

## 2026-09-15 17:35 SAST | Codex acting for Sibusiso | GPT-5 | WBS 3.3 runtime check | blocked, no governance code added

Changed: created and pushed branch `feat/sibusiso-3.3-human-gate` from the contract branch. Updated Sibusiso's current task to reflect the verified runtime blocker. No server or governance implementation was added.

Evidence: `node --version` → `v24.18.0`. `python3 --version` returned command not recognized; `where.exe python3`, `where.exe python`, and `where.exe py` each reported no files found. `docs/TECH-STACK.md` specifies Python 3.11 with FastAPI + WebSockets for the server; Node is used for repository scripts and contract tests. The server scaffold remains README plus `.gitkeep` files.

Decision: retain the documented Python/FastAPI stack. Do not substitute Node or add untested governance code to bypass the missing runtime.

Needs/blockers: Sibusiso provisions Python 3.11 (or an explicitly approved CI-only runtime) before porting WBS 3.3. Lethabo and both leads still review and approve the WBS 3.1 contract/ADR. The branch is ready for a separate blocker PR.

Business handoff: not applicable; no capability changed.

Next: provision the documented runtime, then add human-gate tests before implementation; open a PR from `feat/sibusiso-3.3-human-gate`.

## 2026-09-15 17:35 SAST | Codex acting for Sibusiso | GPT-5 | WBS 3.3 human-gate proof path | implemented, review pending

Changed: added `server/src/auth/governance.py` as a small side-effect-free human-gate module and `test/governance_contract_test.py` with six standard-library unittest cases. Accepted review receipts identify the operator and resulting state; refused privileged attempts are returned as evidence; whitelist, disarm, threshold change and delete require two distinct operator signatures; `verify_concern` preserves `watch_candidate`. Updated `server/README.md` and Sibusiso's task record.

Evidence: the initial test run failed with `ModuleNotFoundError: No module named 'server.src.auth.governance'` before implementation. After implementation, bundled Python `3.12.14` ran `python -m unittest test/governance_contract_test.py` with `Ran 6 tests ... OK`. System `python3`, `python`, `py` and pytest are unavailable; the repository's documented Python 3.11+ requirement is met by the bundled 3.12 interpreter. No anchor code or SC.1 implementation was touched.

Decision: retain `verify_concern` rather than expose a `flag` action; this keeps the contract free of a privileged state setter and follows the session hard constraint. Lethabo and both leads must review/approve the contract and ADR before the contract is final.

Needs/blockers: Lethabo reviews the human-gate semantics and proof wording; Ipeleng reviews signature and privacy boundaries. F14 subject access remains the next feature task and requires the anchor/proof implementation later in the sequence.

Business handoff: not applicable; this is a tested governance boundary, not a household-facing release.

Next: run full repository checks, push this branch, then open a separate PR for WBS 3.3 review.

## 2026-09-15 17:50 SAST | Codex acting for Sibusiso | GPT-5 | G15 operator duty material | proposed, review pending

Changed: added `docs/OPERATOR-DUTY.md` and checklist row P2.17. The card defines the human authority boundary, review procedure, refusal-as-evidence rule, two-distinct-signature handling, privacy restrictions, pre-pilot training evidence and demo acceptance. Updated G15 to distinguish drafted material from actual operator training.

Evidence: documentation-only change; no operator, service partner, user or trainer activity is asserted. The card preserves `sim_` labels and does not claim legal approval, production readiness or completed training.

Decision: none. Lethabo, Ipeleng and the responsible service partner must review the duty and privacy boundaries before pilot use.

Needs/blockers: training completion evidence, named service operator, tenant authority and legal/security review remain outstanding. Anchor and SC.1 remain untouched under the session scope.

Business handoff: not applicable; this is operational safety material supporting the human-gate capability.

Next: Lethabo reviews product wording; Ipeleng reviews privacy/abuse boundaries; Sibusiso maintains the tested implementation and evidence receipt contract.

## 2026-09-15 17:55 SAST | Codex acting for Sibusiso | GPT-5 | WBS 3.1 OpenAPI contract checks | implemented, review pending

Changed: added `test/openapi-contract.test.mjs`, a zero-dependency structural contract test for the v3.1 OpenAPI document. It checks the documented path inventory, F14/F15 showcase markers, idempotency/pagination/receipt controls, first-broken-index wording, WebSocket separation and the absence of a `flag`/`flagged` setter.

Evidence: `npm test` runs the existing security integration, three event-shape tests and the new OpenAPI checks. This test does not replace a full YAML/OpenAPI parser; semantic validation remains a CI/tooling follow-up when an approved dependency or validator is selected.

Decision: none. The contract remains proposed pending Lethabo review, both-lead approval and an ADR.

Needs/blockers: no anchor or SC.1 work was performed under the session scope. The OpenAPI action naming still requires the review recorded in PR #6.

Business handoff: not applicable; contract verification only.

Next: maintain the review branch and await Lethabo's contract decision before implementing dependent interfaces.

### 2026-09-15 18:05 SAST — P2.3/G20 privacy boundary

Added `docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md` as proposed architecture: transient embeddings are compared only against the consented enrolment set and every non-match is discarded without retaining biometric payloads. Updated P2.3 and G20 to show the boundary is proposed; implementation evidence, privacy review and ADR remain outstanding. No anchor or SC.1 code was touched.

## 2026-09-15 17:35 SAST | Codex acting for Sibusiso | GPT-5 | PR handoff / WBS 3.3 readiness | blocked, no claim of PR creation

Changed: attempted to create the requested GitHub pull request for `feat/sibusiso-3.1-contract-freeze`; no repository files changed by the attempt. Updated Sibusiso's blocker list with the authentication and runtime facts.

Evidence: `gh pr create --base main --head feat/sibusiso-3.1-contract-freeze ...` returned `gh auth login` / `GH_TOKEN` required. The branch remains pushed at commit `495e547`. `py -V` and `py -3 -c "import sys; print(sys.version)"` both returned that the command was not recognized. The server scaffold contains only README and `.gitkeep` files; no governance implementation is present to test.

Decision: no bypass of GitHub authentication and no untested runtime selection. The PR can be opened from the pushed branch at `https://github.com/LethaboMH14/V.U.KA--Geekulcha/compare/main...feat/sibusiso-3.1-contract-freeze?expand=1` after an authenticated GitHub session.

Needs/blockers: Lethabo must review the contract and approve or revise the action naming; both leads must approve the contract and ADR. Python 3.11 or an approved local/CI runtime is needed before WBS 3.3 governance code is ported and tested.

Business handoff: not applicable; this is a handoff blocker record.

Next: authenticate GitHub and open the PR; then provision the documented Python runtime or choose an explicitly approved CI-only verification path before WBS 3.3.

### 2026-09-15 18:20 SAST — P2.15 OpenTimestamps calendar decision

Recorded the prototype decision in `docs/OTS-CALENDAR-DECISION.md`: self-hosting and `ots upgrade` are deferred because they are not implemented or rehearsed. Public calendars remain a dependency; timestamp state must remain pending until independently verifiable. No anchor or SC.1 code was touched.

### 2026-09-15 18:35 SAST — P2.14 blockchain attack rehearsal

Added `docs/BLOCKCHAIN-ATTACK-REHEARSAL.md` with the three required objections, current cost qualification, independent-verification rationale, and an explicit deferred answer for public-calendar dependency. Live evidence checkpoint remains outstanding.

### 2026-09-15 18:50 SAST — P2.11 anchoring-cost reconciliation

Added `docs/ANCHOR-COST-RECONCILIATION.md` with the corrected Hedera arithmetic and the OpenTimestamps direct-fee qualification. P2.11 remains in progress until the team selects the demonstrated system and sweeps the stale figure from presentation material.

### 2026-09-15 18:55 SAST — P2.4 s57 decision record

Added `docs/POPIA-S57-DECISION-RECORD.md` to capture the open prior-authorisation question, required counsel findings, and the safe pre-pilot boundary. No legal conclusion or pilot approval is inferred.

### 2026-09-15 19:05 SAST — P2.11 stale-claim inventory

Scanned active repository content for `R1.30`; remaining hits are recorded in `docs/ANCHOR-COST-SWEEP.md` with owner handoffs. Protected and shared files were not silently edited.

### 2026-09-15 19:20 SAST — WBS 4.5 checkpoint preparation

Added `docs/EVIDENCE-CHECKPOINT-RUNBOOK.md` defining entry gates, demonstration sequence, safety checks, scope-cut states, and dual-lead sign-off. The checkpoint itself has not run and no snapshot is tagged.

### 2026-09-15 19:35 SAST — WBS 7.2 fallback rehearsal preparation

Added `docs/FALLBACK-HOTFIX-RUNBOOK.md` with a reversible isolated rehearsal, evidence capture, safety constraints, and acceptance criteria. No shared history was reset and no production rollback was performed.

### 2026-09-15 19:45 SAST — Sibusiso operating record refresh

Updated `team/sibusiso.md` so `Current task` and the running log reflect the pushed privacy, anchoring, rehearsal and readiness work. F14/SC.1 remains gated pending contract approval and session scope.

### 2026-09-15 19:55 SAST — Sibusiso review handoff

Added `docs/SIBUSISO-REVIEW-HANDOFF.md` with the pushed commit inventory, verification results, and the four decisions required from leads and owners before the next gated implementation step.

### 2026-09-15 20:10 SAST — P2.17 operator training checklist

Added `docs/OPERATOR-TRAINING-CHECKLIST.md` covering machine-ceiling, refusal evidence, two-signature actions, verifier output, privacy boundaries, anchor states, and rollback rehearsal. Training evidence is not yet recorded.

### 2026-09-15 20:25 SAST — WBS 3.1 approval record

Added `docs/CONTRACT-APPROVAL-RECORD.md` with the exact lead, second-lead, consumer, ADR, version, and commit fields required before the proposed contracts can be called frozen.

### 2026-09-15 21:15 SAST — checklist ownership check

Checked `team/khutso.md` for P2.16/P2.17 assignment collisions; none were present. Khutso remains the owner of `docs/CHECKLIST.md`, so the rows remain subject to his review even though no duplicate IDs were found.
## 2026-09-15 | Codex assistant on behalf of Khutso Mothopa | GPT-5 | role self-review | proposed, review pending

Changed: `team/khutso.md` — recorded Khutso's evidence-based role feedback, reserved the role-review and build-log paths, reconciled the immediate P1.1/P1.3 evidence work with the formal WBS 1.4 proposed/not-started status, and stated the reviewer/dependency boundary. No product code, contract, approval, or completion status was changed.

Evidence: current `main` is clean at `e2365f3`; `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` passed, while `node scripts/test-security.mjs` was not runnable because this clone has no installed Gitleaks. The review records the repository's existing stale-claim sweep and open evidence dependencies; no new measurement is asserted.

Decision: none. This is a coordination and self-review entry requested by Khutso; all five sequenced WBS leaves remain proposed/not started and no human availability or approval is inferred.

Needs/blockers: P1.1, P1.2 and P1.3 require the corrected claim sweep and personally checked source/command evidence. Clean-intake evidence depends on the account owners and both leads; predecessor test/TRL reproduction depends on Sibusiso; contract and subject-rights changes remain subject to `docs/OVERLAPS.md` and owner decisions.

Business handoff: not applicable — no household capability changed. This entry serves C3 by making role accountability and evidence boundaries checkable; trust remains conditional on reproducible claims.

Next: Sibusiso first review, then both leads review this PR. No merge is requested until the required reviews and checks are recorded.
## 2026-09-15 | Codex assistant on behalf of Khutso Mothopa | GPT-5 | review correction — WBS 1.4 | proposed, re-review pending

Changed: `team/khutso.md` — corrected WBS 1.4 from proposed/not started to done after Sibusiso identified the existing approved intake gate and both recorded lead approvals. Revised the role-review status language so the remaining four sequenced WBS leaves stay proposed/not started. No product code, contract, or other WBS completion status changed.

Evidence: `docs/security/intake-gate.json` has `status: approved`, with non-empty `lethabo` and `sibusiso` lead-approval entries. Sibusiso's PR #5 review requested this factual correction; no new measurement or source claim is introduced.

Decision: none. This is a review correction within PR #5, not a new governance decision.

Needs/blockers: P1.1, P1.2 and P1.3 remain open; the remaining four sequenced WBS leaves require their own dependencies and acceptance evidence. Local Gitleaks remains unavailable, while the PR's remote secret scan is the relevant check.

Business handoff: not applicable — no household capability changed. This correction serves C3 by keeping task status aligned with checkable evidence.

Next: request Sibusiso's re-review, then both leads' review before merge.

## 2026-09-17 | Sibusiso (Claude session) | P2.15 | closed — ADR-0028

Changed: decided and recorded whether to self-host an OpenTimestamps calendar (`docs/CHECKLIST.md` P2.15, owner Sibusiso). Decision: no. Recorded as `docs/adr.md` ADR-0028 — self-hosting a calendar server solves submission/verification-time dependency more expensively than necessary; the actual mitigation is (a) submitting every root to multiple public calendars (already the OTS client default) and (b) a scheduled `ots upgrade` pass in `anchor/publish.py` that converts pending timestamps to complete, self-verifying-against-Bitcoin proofs as soon as their confirmation lands. Corrected `docs/ANCHOR-RATIONALE.md`'s attack-3 rehearsed answer, which previously conflated "self-host a calendar" with "run `ots upgrade`" as one mitigation — they are different-weight commitments, and only the second is actually needed. Baked the decision into `anchor/README.md`'s `publish.py` row and non-negotiables so Task 5's implementer inherits the design without re-deriving it. Closed `docs/CHECKLIST.md` P2.15.

Evidence: `anchor/` contains only `README.md` — Task 5 has not started, so this is a design decision made ahead of implementation, not a retrofit. `node scripts/check-docs.mjs` passed.

Decision: made unilaterally by Sibusiso, within his explicit authority — `docs/ANCHOR-RATIONALE.md`'s original text already named this "Sibusiso's call" before this session touched it. Does not require both-lead sign-off under `docs/OVERLAPS.md` (it is not a change to `contracts/` or any frozen shape), but Lethabo can review since it touches `docs/ANCHOR-RATIONALE.md`, a shared evidence/deck surface.

Needs/blockers: this is a design decision, not an implementation. `anchor/publish.py` (Task 5) must actually build multi-calendar submission and the `ots upgrade` schedule before the attack-3 answer can be claimed live in any demo or deck — per the honesty ledger, state "pending calendar aggregation" honestly until then.

Business handoff: not applicable — no household capability changed, this closes an open decision blocking honest claim-making about the anchor's reliability story.

Next: P2.12/P2.13 (Hedera governance-model and HBAR-fee framing corrections, due Sep 17, still open) and Task 5 itself (`anchor/`, blocked behind WBS 3.3 in the port sequence).

## 2026-09-17 | Sibusiso (Claude session) | reconcile duplicate P2.11/P2.15 work on this branch | merged main, deleted superseded files

Changed: merged origin/main (Khutso's PR #5) into this branch — only conflict was the same append-only BUILD-LOG.md pattern as prior merges, resolved by keeping both chronologically. Deleted `docs/OTS-CALENDAR-DECISION.md`, `docs/ANCHOR-COST-RECONCILIATION.md`, `docs/ANCHOR-COST-SWEEP.md` — all three duplicated work already completed more thoroughly in PR #7 (P2.11, full repo sweep, closed) and PR #8 (P2.15, ADR-0028, an actual decision rather than "deferred"). Re-pointed `docs/CHECKLIST.md` P2.11 and P2.15 rows at PR #7/#8. Corrected `docs/BLOCKCHAIN-ATTACK-REHEARSAL.md` (P2.14), which linked to the now-deleted `docs/OTS-CALENDAR-DECISION.md` and stated the pre-correction R1.30 framing — updated both answers to match the swept figures and ADR-0028.

Evidence: `node scripts/check-docs.mjs` passed. `npm test` → 8/8 pass (event contract, OpenAPI contract, security integration). `python -m unittest discover -s test -p "governance_contract_test.py"` → 8/8 pass (human gate + discard-by-default), confirming Codex's WBS 3.3 / P2.3 work survived the merge intact. Note: `where.exe python`/`py` found real installations (Python 3.13, 3.14, launcher) in this session's PATH, contradicting the earlier build-log entries reporting no Python available — environment-specific, not a repository fact; the bundled-3.12-workaround entries stay as an accurate record of what was true in that session.

Decision: PR #7 and PR #8 are authoritative for P2.11/P2.15 — this branch's independent, weaker duplicates are removed rather than reconciled line-by-line, since neither added anything the merged versions don't already cover.

Needs/blockers: PR #6, #7, #8 all still await Lethabo's review. This branch's WBS 3.3 (human gate) and P2.3 (discard-by-default) work is untouched by this reconciliation and ready for its own PR.

Business handoff: not applicable — reconciliation and duplicate removal only.

Next: open a PR for WBS 3.3 (server/src/auth/governance.py, test/governance_contract_test.py, test/openapi-contract.test.mjs) — real, tested progress that's been sitting unpushed.

## 2026-09-17 | Sibusiso (Claude session) | P2.11 / G22 | closed

Changed: swept the stale ~R1.30/month anchoring figure everywhere it still appeared live — `anchor/README.md`, `docs/00-SPEC.md` (N8, alternative/cadence rows), `docs/01-ARCHITECTURE.md` (9 occurrences across diagrams and tables), `docs/08-BUSINESS.md`, `docs/HANDOVER.md`, `docs/LEAN-CANVAS.md`, `docs/SDLC.md`, `docs/TECH-STACK.md` (Hedera per-message price). Picked OpenTimestamps as the named primary chain — it was already the diagrammed default throughout `docs/01-ARCHITECTURE.md` and named "Chain" (not "Alternative") in `docs/00-SPEC.md` and `docs/TECH-STACK.md`, so this corrects the cost line to match a decision already made, not a new one. Corrected figure: **~R0/month** (OpenTimestamps, public calendar servers), Hedera fallback recomputed at current price (`$0.0008/message`, repriced Jan 2026) ≈ **R9–10/month**. Closed `docs/CHECKLIST.md` P2.11 and `docs/OPEN-GAPS.md` G22; updated `docs/MASTER-CONTEXT.md`'s live-status table from `ESTIMATE`/"under review" to `FACT`.

Evidence: the reconstruction itself (720 × $0.0008 = $0.576/month ≈ R9–10 at ~R16.24/USD) was already done and correct in `docs/EVIDENCE.md` and `docs/ANCHOR-RATIONALE.md` on 14 September — this entry is the sweep applying that correction everywhere the old number was still live, not a new calculation. Left `docs/ANCHOR-RATIONALE.md`'s rehearsed-attack section and `docs/CHECKLIST.md` P2.14 untouched — both intentionally quote the old wrong number as the gotcha question a judge might ask, not as a live claim. Left `docs/PLAN.md`, `docs/EVIDENCE.md`, `docs/audit/*`, `docs/BUILD-LOG.md`'s own prior entries and `submission/archive-2026-08/README.md` untouched — historical/planning record, not live claims. `node scripts/check-docs.mjs` passed; `git diff --stat` confirms every table's pipe count is unchanged (no row broken).

Decision: OpenTimestamps as primary is not a new decision — `docs/00-SPEC.md`'s own "Chain" row and every architecture diagram already named it as such, with Hedera consistently listed as "Alternative"/"fallback." This closes the gap between what the architecture already decided and what the cost line stated.

Needs/blockers: the ~R0 figure for OpenTimestamps assumes public volunteer calendar servers, which is the subject of `docs/CHECKLIST.md` P2.15 (self-host a calendar and run `ots upgrade`, still open, due Sep 18) and the third rehearsed attack in `docs/ANCHOR-RATIONALE.md`. If P2.15 is not resolved before demo day, the ~R0 figure still holds (it's the cost, not the reliability claim) but the "no single point of failure" framing needs the honest caveat already written in `docs/ANCHOR-RATIONALE.md` attack 3.

Business handoff: not applicable — no household capability changed, cost figure correction only.

Next: P2.15 (self-host OTS calendar decision, due Sep 18) and P2.12/P2.13 (Hedera governance-model and HBAR-fee framing, due Sep 17, still open).
## 2026-09-15 | Claude (Sibusiso's session) | naming conflict — contracts/ vs shared/contract.ts | resolved, doc-only

Changed: `shared/README.md` rewritten to state the frozen contract lives in `contracts/events.schema.json` + `contracts/openapi.yaml` (built under WBS 3.1 this same day), not the originally-planned `shared/contract.ts`, which is retired but the file kept as a pointer so nobody re-reserves it. Corrected the two `shared/contract.ts` references in `docs/HANDOVER.md` (the ownership table and the Task 4 port order) to point at `contracts/`.

Evidence: `docs/OVERLAPS.md` already named `contracts/events.schema.json` and `contracts/openapi.yaml` as the shared surface before `shared/README.md` was ever written (PR #3, merged before PR #6 was opened) — `contracts/` was the older and now the actually-built location; `shared/contract.ts` was never created. Verified via `grep -rn "shared/contract" docs/ RULES.md AGENTS.md` — no remaining references after this change.

Decision: keep the built, tested artifact (`contracts/`) and correct the docs to match it, rather than reformatting a working JSON/YAML contract into TypeScript to match a reservation that predates the actual build. Sibusiso's call, made explicitly when asked.

Needs/blockers: this is a doc correction only; the contract itself remains implementation-proposed pending Lethabo's review and an ADR, per the existing WBS 3.1 entry above.

Business handoff: not applicable — no capability changed, single source of truth restored.

Next: Lethabo's review of the contract (action naming) and both-lead ADR sign-off, unchanged from the prior entry.

## 2026-09-15 18:30 SAST | opencode / GLM | claude-sonnet-5 | G12 closed — model licence register | authored, Lethabo directed

Changed: created `docs/MODEL-LICENCES.md` — the full G12 model licence register, verified against the two predecessor repos (`BEACON`, `Team-Sonar---Vuka-`) cloned fresh read-only. All four model packages plus both ML runtimes inventoried with sha256 where available, licence type, commercial position, and risk classification. Closed G12 in `docs/OPEN-GAPS.md`, ticked P1.7 in `docs/CHECKLIST.md`, updated `team/lethabo.md` current task. Approved PR #6 (Sibusiso's WBS 3.1 contract freeze) with a finding: `flagged` missing from Entity state enum in `contracts/openapi.yaml`.

Evidence: YAMNet TFLite sha256 verified identical across both repos (`10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de`). BEACON requirements inspected — YOLOv8 (`ultralytics>=8.2`, yolov8n.pt), InsightFace (`insightface>=0.7`, buffalo_l), fast-plate-ocr (`>=0.3`, cct-s-v2-global), ai-edge-litert (`>=2.1`), onnxruntime (`>=1.17`). EasyOCR confirmed not used (explicitly commented out in requirements.txt, zero imports). fast-plate-ocr licence confirmed MIT on PyPI. Three models auto-download weights at runtime with unpinned versions — sha256 not verifiable from repo alone; flagged as unresolved.

Decision: Lethabo approved PR #6 (contract freeze) with M1 finding for Sibusiso to fix `flagged` enum before ADR freeze. The model register finds two HIGH risks: InsightFace buffalo_l weights are non-commercial-research-only (incompatible with VUKA's commercial target), and YOLOv8 AGPL-3.0 is incompatible with VUKA's MIT licence unless (a) a commercial Ultralytics licence is obtained, (b) a non-copyleft detector is substituted, or (c) the server is released under AGPL-3.0. Both risks are published in the register; they are not resolved by this entry.

Needs/blockers: no blocker from this entry. The two licensing risks are published but unresolved — they must be addressed before deployment, not before the hackathon demo per `docs/HANDOVER.md`. P1.4 ADR-0027 and P1.6 competitor block remain open (due 16 Sep).

Business handoff: not applicable — no household capability changed. The register serves C3 (progress) by closing the flagged G12 gap before G0 (16 Sep), and C2 (innovation) by demonstrating that VUKA knows the difference between "we use this model" and "we have checked whether we may."

Next: ADR-0027 (TRL 4 + ceiling), then competitor block with Babatunde (`docs/CHECKLIST.md` P1.4, P1.6).

## 2026-09-15 19:40 SAST | opencode / GLM | claude-sonnet-5 | ADR-0027 — TRL settled at 4 | authored, Lethabo directed

Changed: appended **ADR-0027** to `docs/adr.md` — the TRL decision: system **TRL 4** (validated in a laboratory, in the predecessor codebase, historical evidence), two subsystems **argued at 5** (the append-only evidence chain; the on-device sensing path — `yamnet.tflite` sha256 verified across both predecessors 15 Sep 2026), four reasons not at 6 (G10 hardware, G1 fusion weights, G8 pentest, G9 bias eval), ceiling named. Swept the two contradicting positions: `docs/00-SPEC.md` §6 ("Assessed TRL: 5" → 4, evidence table reframed with historical tags) and `docs/01-ARCHITECTURE.md` §11.1 ("We state TRL 5" → 4, criteria table reframed, ladder diagram now highlights T4, G-10 rows aligned). Fixed a stale citation found during the sweep: `01-ARCHITECTURE` §11.1 cited "ADR-0025" for the TRL-5 position, but ADR-0025 is the ported Discovery Safety Revamp bundle — no ADR ever recorded a TRL position; §12.4's ADR index listed six decisions (0020–0025) that do not exist at those numbers (superseded by ADR-0026's renumbering) — the index now lists actual ADRs and says so. Tick `P1.4` in `docs/CHECKLIST.md`, updated `team/lethabo.md`.

Evidence: `git grep -n "TRL" docs/ README.md BRIEF.md` run before and after — the three contradictory positions (00-SPEC "Assessed TRL: 5", 01-ARCHITECTURE "We state TRL 5", EVIDENCE "do not publish TRL 5 as locally verified") now resolve to one position: 4, subsystems argued at 5, four reasons not at 6, ADR-0027. Latency figure (318 ms p95, n = 10) kept as historical, not reproduced here, per `docs/EVIDENCE.md`.

Decision: ADR-0027 is the single TRL record. Consumer-facing copy states "TRL 4, met and verified" with "in the predecessor codebase" attached (as `README.md` already does). Internal records carry the reproduction caveat: the port (Task 4) and Khutso's evidence reproduction (3.5, due 19 Sep) must re-establish the results before any local-verification wording is used. A later ADR is required to move the number.

Needs/blockers: none from this entry. PR #10 (Sibusiso, WBS 3.3) requested changes — the `flagged` state-machine divergence must be resolved by Sibusiso (conform code to record, or propose the ADR superseding the state machine first). PR #9 (G12 register) awaits Sibusiso's review. PRs #7/#8 await Sibusiso merging main. ADR-0028 (OTS calendar) is claimed by PR #8 — number reserved, not written.

Business handoff: `templates/BUSINESS-HANDOFF.md` not changed; TRL 4 + ceiling is already the business-facing claim in `README.md` — this entry makes it the only TRL position in the repo. Serves C3 (progress: the number a judge can believe) and C2 (innovation: publishing four reasons not at 6 is the differentiator).

Next: the competitor block with Babatunde (`docs/CHECKLIST.md` P1.6, due 16 Sep) — the top unmet organiser instruction.

## 2026-09-15 20:10 SAST | opencode / GLM | claude-sonnet-5 | P1.6 — competitor block | authored, Lethabo directed

Changed: created `docs/COMPETITORS.md` — the competitor awareness document the organisers instructed. Five competitors mapped: **Vumacam** (2,000+ ANPR cameras, Fidelity ADT partnership, 9.68m plates/day — active Information Regulator complaint by Intelwatch/Right2Know as live SA precedent), **Flock** (ALPR false-positive precedent, registered-owner lookups, no checkable evidence), **ShotSpotter** (Cape Town Lavender Hill deployment, published 30–50% false-positive rates, evidence challenged in US courts), **community WhatsApp groups** (the most widely deployed SA safety infrastructure — closed broadcast, no evidence, no decay), and **Fidelity ADT** (largest armed response — trust-me model, no independently checkable record). Each competitor maps a documented criticism to a VUKA mechanism with the design reference. Separate section on structural unfair advantage (public anchor — the anti-Flock argument as a mechanism). Honesty section: what we do not claim (pricing pending Babatunde, "prevents crime" refused, no "worse than" comparisons). Updated LEAN-CANVAS UVP with competitor-awareness line referencing the new doc. Ticked P1.6 in `docs/CHECKLIST.md`, updated `team/lethabo.md`.

Evidence: `docs/PLAN.md` §B2 already contained a Vumacam mapping table as a precursor; the PLAN.md "repo-wide grep returns zero" claim written on 14 Sep was stale by the time the PLAN author wrote the Vumacam references into the same file. P1.6 now has a dedicated consumer-facing document; PLAN.md B2's status note will be corrected in a later clean-sweep pass (Khutso P1.9). Pricing data (Fidelity ADT/Vumacam actual monthly rates) remains Babatunde's P1.13, due 18 Sep.

Decision: the competitor block follows the organiser instruction "make the UVP show competitor awareness" by matching every documented criticism to a named VUKA mechanism, naming competitors by name, conceding what they do better (scale, revenue, commercial channels), and refusing the marketing trap of claiming "better." The Intelwatch/Right2Know IR complaint against Vumacam is the strongest single piece of evidence: an active legal challenge to exactly the product class VUKA competes in, and VUKA's design answers every documented concern in the complaint. `FACT`.

Needs/blockers: Babatunde to supply actual competitor pricing when he joins 17 Sep (P1.13). The competitor block is architectural and positioning; the economic argument (compare R299 modelled to actual Vumacam/ADT rates) belongs in the business case, not here.

Business handoff: `templates/BUSINESS-HANDOFF.md` not changed; the competitor block is positioning, not a household-facing capability. Serves C2 (innovation: competitor-aware positioning is what the organisers asked for) and C4 (user journey: the structural unfair advantage is the answer to "would a real user trust this?" — their alternative is a WhatsApp group with no evidence and a camera network with no checkable record).

Next: P1.5 — Sonke project overview rewrite (lead with the AI answer, four layers, corrected figures, TRL 4 with ceiling — due 16 Sep), and P1.8 — confirm prize/deployment premise with `sonke@geekulcha.dev`.

## 2026-09-15 20:30 SAST | opencode / GLM | claude-sonnet-5 | P1.5 Sonke overview + P1.8 prize confirmation + organiser email | authored, Lethabo directed

Changed: created `docs/SONKE-OVERVIEW.md` — the project overview for the Sonke workspace. Leads with Musa's and Thandi's real stories, not "AI-powered." States "the load-bearing parts contain no ML" in the opening. Follows with a four-layer table each answering "the AI answer" (KHAYA sensors, UMOJA server, the human gate, ANCHOR evidence chain — exactly the organiser's "not impressive to say AI-powered" instruction). Includes corrected figures (4:1 security-to-police, R87bn industry, R299 modelled, TRL 4 per ADR-0027), competitor-awareness reference, the honesty section (what we refuse to say), and team roster. Written for judge readability — judges read 150 project overviews; this one is structured for scanning. Updated P1.5 to ☑ in `docs/CHECKLIST.md`.

Also updated **P1.8** (prize/deployment premise): the 15 Sep 2026 email from Tiyani Nghonyama (Lead Facilitator, Geekulcha Annual Hackathon) confirms **cash prizes for top 3 with Telkom support + international partnerships** — `FACT`. The "90-day deployment assumption" was based on a believed contradiction with the official page's "there will be cash prizes" statement; the email confirms prizes and the contradiction is resolved. Deployment premise remains `ASSUMPTION` pending response from `sonke@geekulcha.dev`. P1.8 status: ◐ (prizes confirmed, deployment still pending).

Evidence: email from Tiyani Nghonyama, Lead Facilitator, 15 Sep 2026, read in full. Key organiser instructions validated our architecture: *"Stop saying 'Solution X is AI-powered'. Make your project overview reflect real-life stories, that's what makes your solution authentic. Use of AI is not impressive at this hackathon — we are looking for solutions that have a sense of reality and can be used after the hackathon."* The Sonke overview directly answers every clause of that instruction. `FACT`

Decision: the Sonke overview is the public-facing summary — to be pasted into the Sonke workspace when edits are accepted. The README remains the technical orientation; the Sonke overview is the story. P1.5 is the capstone of Phase 1 corrections: all four Phase 1 items (G12/P1.7, ADR-0027/P1.4, competitor block/P1.6, Sonke overview/P1.5) are now closed or in PR review (three PRs awaiting Sibusiso).

New organiser information from the email:
- **150 teams continental** — Kenya, Botswana, Malawi declared competing. Competition scale larger than assumed.
- **Quantum Tech — 5 bonus points** — new criterion not in Phase 1 plan. Team should discuss: VUKA's hash-chain architecture with Merkle-tree anchoring could be framed as "designed for post-quantum migration" (hash-based signature schemes are post-quantum candidates), but this is a stretch and requires team decision before claiming.
- **Judging criteria to be published Friday 19 Sep** — P1.9 rules-lawyer dispatch triggers then. `docs/MASTER-CONTEXT.md` and all CHECKLIST criterion tags should be refreshed the same day.
- **Schedule loaded Friday** — will need to adjust WBS dates if they conflict.

Needs/blockers: three PRs (#9 G12 register, #11 ADR-0027, #13 competitor block) await Sibusiso's review. PR #10 (Sibusiso WBS 3.3) request-changes outstanding. P1.8 deployment premise confirmation with `sonke@geekulcha.dev` still pending. P1.9 rules-lawyer triggers Friday 19 Sep. Quantum Tech bonus — team discussion needed.

Business handoff: `docs/SONKE-OVERVIEW.md` is the bridge between the architecture and the judges — it answers "who are you and why should anyone believe what you claim?" Serves all four criteria: C1 (team roster visible), C2 (the AI answer is the differentiator), C3 (corrected figures, TRL 4), C4 (Musa and Thandi are the real user journeys the organisers asked for).

Next: support Ipeleng's PSiRA/POPIA position papers (P2.1–P2.4); judging criteria review Friday 19 Sep (P1.9 rules-lawyer); begin port (Task 4) after Sibusiso's PR reviews clear.
