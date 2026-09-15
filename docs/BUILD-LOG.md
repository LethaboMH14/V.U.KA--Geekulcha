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
