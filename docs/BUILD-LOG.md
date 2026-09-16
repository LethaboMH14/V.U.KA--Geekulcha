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

## 2026-09-15 | Sibusiso (Claude session) | P2.15 | closed — ADR-0028

Changed: decided and recorded whether to self-host an OpenTimestamps calendar (`docs/CHECKLIST.md` P2.15, owner Sibusiso). Decision: no. Recorded as `docs/adr.md` ADR-0028 — self-hosting a calendar server solves submission/verification-time dependency more expensively than necessary; the actual mitigation is (a) submitting every root to multiple public calendars (already the OTS client default) and (b) a scheduled `ots upgrade` pass in `anchor/publish.py` that converts pending timestamps to complete, self-verifying-against-Bitcoin proofs as soon as their confirmation lands. Corrected `docs/ANCHOR-RATIONALE.md`'s attack-3 rehearsed answer, which previously conflated "self-host a calendar" with "run `ots upgrade`" as one mitigation — they are different-weight commitments, and only the second is actually needed. Baked the decision into `anchor/README.md`'s `publish.py` row and non-negotiables so Task 5's implementer inherits the design without re-deriving it. Closed `docs/CHECKLIST.md` P2.15.

Evidence: `anchor/` contains only `README.md` — Task 5 has not started, so this is a design decision made ahead of implementation, not a retrofit. `node scripts/check-docs.mjs` passed.

Decision: made unilaterally by Sibusiso, within his explicit authority — `docs/ANCHOR-RATIONALE.md`'s original text already named this "Sibusiso's call" before this session touched it. Does not require both-lead sign-off under `docs/OVERLAPS.md` (it is not a change to `contracts/` or any frozen shape), but Lethabo can review since it touches `docs/ANCHOR-RATIONALE.md`, a shared evidence/deck surface.

Needs/blockers: this is a design decision, not an implementation. `anchor/publish.py` (Task 5) must actually build multi-calendar submission and the `ots upgrade` schedule before the attack-3 answer can be claimed live in any demo or deck — per the honesty ledger, state "pending calendar aggregation" honestly until then.

Business handoff: not applicable — no household capability changed, this closes an open decision blocking honest claim-making about the anchor's reliability story.

Next: P2.12/P2.13 (Hedera governance-model and HBAR-fee framing corrections, due Sep 17, still open) and Task 5 itself (`anchor/`, blocked behind WBS 3.3 in the port sequence).

## 2026-09-15 | Sibusiso (Claude session) | reconcile duplicate P2.11/P2.15 work on this branch | merged main, deleted superseded files

Changed: merged origin/main (Khutso's PR #5) into this branch — only conflict was the same append-only BUILD-LOG.md pattern as prior merges, resolved by keeping both chronologically. Deleted `docs/OTS-CALENDAR-DECISION.md`, `docs/ANCHOR-COST-RECONCILIATION.md`, `docs/ANCHOR-COST-SWEEP.md` — all three duplicated work already completed more thoroughly in PR #7 (P2.11, full repo sweep, closed) and PR #8 (P2.15, ADR-0028, an actual decision rather than "deferred"). Re-pointed `docs/CHECKLIST.md` P2.11 and P2.15 rows at PR #7/#8. Corrected `docs/BLOCKCHAIN-ATTACK-REHEARSAL.md` (P2.14), which linked to the now-deleted `docs/OTS-CALENDAR-DECISION.md` and stated the pre-correction R1.30 framing — updated both answers to match the swept figures and ADR-0028.

Evidence: `node scripts/check-docs.mjs` passed. `npm test` → 8/8 pass (event contract, OpenAPI contract, security integration). `python -m unittest discover -s test -p "governance_contract_test.py"` → 8/8 pass (human gate + discard-by-default), confirming Codex's WBS 3.3 / P2.3 work survived the merge intact. Note: `where.exe python`/`py` found real installations (Python 3.13, 3.14, launcher) in this session's PATH, contradicting the earlier build-log entries reporting no Python available — environment-specific, not a repository fact; the bundled-3.12-workaround entries stay as an accurate record of what was true in that session.

Decision: PR #7 and PR #8 are authoritative for P2.11/P2.15 — this branch's independent, weaker duplicates are removed rather than reconciled line-by-line, since neither added anything the merged versions don't already cover.

Needs/blockers: PR #6, #7, #8 all still await Lethabo's review. This branch's WBS 3.3 (human gate) and P2.3 (discard-by-default) work is untouched by this reconciliation and ready for its own PR.

Business handoff: not applicable — reconciliation and duplicate removal only.

Next: open a PR for WBS 3.3 (server/src/auth/governance.py, test/governance_contract_test.py, test/openapi-contract.test.mjs) — real, tested progress that's been sitting unpushed.

## 2026-09-15 | Sibusiso (Claude session) | P2.11 / G22 | closed

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

## 2026-09-15 21:00 SAST | opencode / GLM | claude-sonnet-5 | operator training review + P1.8 closed | authored, Lethabo directed

Changed: reviewed and corrected `docs/OPERATOR-DUTY.md` — fixed stale `verify_concern` claim (now transitions to `flagged` per Sibusiso's PR #10 F1 fix, not stays-at-`watch_candidate`), added operator error remedy section (subject-access path is the remedy, corrections visible on same chain) and escalation paths table (subject dispute, law enforcement, regulator, raw-data demands, pending states). Updated `docs/OPERATOR-TRAINING-CHECKLIST.md` item 6 (broken-link demo) to note simulation pending Task 5 anchor code. P1.8 closed (prizes confirmed FACT from Lead Facilitator email; deployment premise no longer contradicts 90-day assumption). Updated G15 to ◐ and P2.17 to ◐ in `docs/OPEN-GAPS.md` and `docs/CHECKLIST.md` — material reviewed and corrected, real training evidence still outstanding. Updated `team/lethabo.md`.

Evidence: `verify_concern` → `flagged` confirmed in `server/src/auth/governance.py:98` and `test/governance_contract_test.py::test_only_verify_concern_produces_flagged`. The stale claim in OPERATOR-DUTY line 67 ("remains at watch_candidate") was from the pre-F1-fix draft in PR #10; corrected to match the fixed code now on main. `FACT`.

Decision: the operator material is now internally consistent with the governance code. The training itself has not happened — the material is specification, not completion evidence. G15 closes when a real operator walks through the checklist with a reviewer and evidence is recorded. P1.8 closes because the organiser email resolved the prize uncertainty and the deployment assumption no longer requires external confirmation.

Needs/blockers: real operator training evidence + service-partner approval still required before G15 can close. Sibusiso should verify the `verify_concern` → `flagged` change against his governance.py code. Quantum Tech strategy and port (Task 4) remain open.

Business handoff: not applicable — the duty card is training specification, not a household-facing capability. Serves C2 (the operator training path makes the human gate checkable, not just claimed) and C3 (progress on G15 before Govern gate 21 Sep).

Next: Quantum Tech bonus strategy with Sibusiso; Task 4 port — begin with brain/ (fusion.py port from BEACON predecessor).

## 2026-09-15 21:20 SAST | opencode / GLM | claude-sonnet-5 | Quantum Tech bonus strategy | authored, Lethabo directed, Sibusiso verification pending

Changed: created `docs/QUANTUM-TECH.md` — the honest Quantum Tech bonus strategy. Maps VUKA's four cryptographic primitives (SHA-256, Merkle trees, Ed25519, HMAC) to their quantum resistance properties. The architectural argument: the anchored hash chain proves integrity independently of the signature layer; migrating Ed25519 to a post-quantum scheme (SPHINCS+, LMS/XMSS) is a signature-layer upgrade that preserves the entire anchored history. Includes: a 1-paragraph Sonke-ready summary; a "What we claim" table (all `FACT`/`ESTIMATE`/`ARGUED`); a "What we do NOT claim" table (five refused claims — "quantum-resistant," "post-quantum ready," "uses quantum computing," "SHA-256 fully quantum-proof," quantum-AI/sensing — because the organisers explicitly warned against overclaiming); Sibusiso's 5-point cryptographic verification checklist; an implementation demo option (SPHINCS+ Python, 30-minute demo proving the verifier accepts both Ed25519 and PQ signatures); and a team decision gate. Added B1 row to `docs/CHECKLIST.md` under a new "Bonus — Quantum Tech" section. Updated `team/lethabo.md`.

Evidence: SHA-256 quantum resistance analysis (Grover's algorithm: quadratic speedup, 2^256 → 2^128, NIST SP 800-208 consensus on 128-bit post-quantum security level). Merkle trees are structurally identical to SPHINCS+/LMS/XMSS hash-based signatures — `FACT`. Ed25519 is an elliptic-curve signature; Shor's algorithm breaks it — `FACT`. The architecture decoupling argument (chain integrity vs. operator identity) draws from `docs/ANCHOR-RATIONALE.md` and the two-showcase design. `ARGUED`.

Decision: none — this is proposed analysis, not an approved positioning. The team must decide whether to claim the 5 bonus points. Sibusiso must verify the cryptographic claims (SHA-256 at Grover-reduced security, Ed25519→PQ migration feasibility, verifier signature-dependency). Both leads must approve before any Quantum Tech claim appears on Sonke or in the demo. If approved: update `docs/SONKE-OVERVIEW.md` with the quantum paragraph and extend `docs/BLOCKCHAIN-ATTACK-REHEARSAL.md` with the post-quantum section. If not: the document stays as analysis; 5 points are not claimed.

Needs/blockers: Sibusiso's cryptographic verification (5-item checklist in the doc). Team decision on explain vs. implement. The implementation demo (SPHINCS+ in Python) is 30 minutes of work if the team commits to it.

Business handoff: not applicable — this is positioning strategy, not a household-facing capability. Serves bonus criterion (Quantum Tech) if the team proceeds; serves C2 (innovation) regardless by demonstrating a differentiator no other team will have prepared.

Next: Task 4 port — begin with brain/ (fusion.py port from BEACON predecessor). Sibusiso to verify Quantum Tech claims. Judging criteria Friday 19 Sep.

## 2026-09-15 21:50 SAST | opencode / GLM | claude-sonnet-5 | Task 4 port — brain/ fusion engine landed | authored, Lethabo directed

Changed: ported the first two code files from the BEACON predecessor repository into the clean repository per `docs/HANDOVER.md` Task 4 port rules: `brain/fusion.py` (Entity, recompute, human_verify, F1 recurrence + F6 modal corroboration — calibrated log-odds fusion, machine ceiling at watch_candidate) and `brain/entity_resolution.py` (confusion-aware Levenshtein distance for plate matching, anti-Flock 0/O confusion guard). Sanitization: `human_verify` action name updated from `flag` to `verify_concern` to match the v0.1.0 frozen contract (`contracts/openapi.yaml`, `server/src/auth/governance.py`); BEACON docstrings updated to VUKA references and ADR citations; CLAUDE.md references replaced per port rules. Both files confirmed clean: pure functions only, standard library dependencies, no I/O, no secrets, no file paths, no personal data. Ported the test suites from BEACON: `brain/tests/test_fusion.py` (14 tests — recurrence, whitelist suppression, machine-ceiling enforcement, human_verify with operator_id, F6 audio corroboration with hex+time window gating, frozen state after human decision) and `brain/tests/test_entity_resolution.py` (6 tests — confusion-aware matching, Flock 0/O precedent, resolution threshold). Updated `brain/README.md` from scaffold to ported state.

Evidence: `python -m pytest brain/tests/ -v` — **20/20 passed** (Python 3.11.9, pytest 8.0.0). The `test_human_verify_flag` test now uses `verify_concern` and asserts `STATE_FLAGGED`, confirming the action name alignment with the frozen contract. `test_machine_can_never_reach_flagged` still passes — recompute() never sets flagged regardless of input volume. `FACT`

Decision: these two files represent the cleanest possible port: pure functions, no external dependencies, no secrets, predecessor lineage preserved (BEACON, 2026-07-25). The port follows HANDOVER §3 rules: reviewed individually, removed prohibited content, confirmed no secrets, committed with descriptive message. F2-F5 are TODO stubs (G4/OPEN-GAPS.md) — the fusion engine is functional for F1 and F6 only; the claims-peak histogram, near-repeat kernel, dwell baseline and road-graph data are not yet available.

Needs/blockers: the remaining port steps — `server/` (governance.py already landed with PR #10; remaining handlers, API, DB models), `app/` (React Native bare + native modules from Team-Sonar-Vuka predecessor), `appliance/` (vision/ + audio/ from BEACON), `data/` (ingest, enrich, forecast, geocode, eval), and `dashboard/` (member + operator UI). Sibusiso owns the server and anchor port; Mutarisi the app; Vukosi the appliance; Khutso the data pipeline.

Business handoff: `templates/BUSINESS-HANDOFF.md` — the fusion engine is the architecture's core. Serves C3 (progress: working code, 20 passing tests, not a diagram) and C2 (the calibrated log-odds model with explicit conflict resolution is the differentiator from black-box ML systems).

Next: continue port — `server/` (Sibusiso's domain), or `appliance/vision/` (Vukosi's domain). Judging criteria publish Friday 19 Sep.

## 2026-09-15 | Sibusiso (Claude session) | date-header correction | fixed

Changed: corrected a clerical date error found across five records — this session's own P2.11/P2.15 work (three `docs/BUILD-LOG.md` headers, `docs/CHECKLIST.md` P2.11/P2.15 close dates, `docs/OPEN-GAPS.md` G22) and ADR-0028's `Accepted` date were all misdated 17 September when the actual date was 15 September. Corrected all five to 2026-09-15. This is a typo fix, not a content or decision change — the substance of ADR-0028, the P2.11 sweep, and the G22 closure is unchanged; only the date header was wrong.

Evidence: `date` on this machine at time of writing confirmed 2026-09-15. Found by cross-checking a system timestamp against what had been written into permanent records — worth a second pair of eyes catching this kind of error before it compounds (e.g., someone citing "the 17 Sep ADR" when searching by date).

Decision: corrected in place rather than superseding, since this is a clerical date-header error, not a rewrite of any decision's content — `docs/adr.md`'s "never edit, only supersede" rule protects decisions from being rewritten to dodge accountability, which this isn't.

Needs/blockers: none.

Business handoff: not applicable — recordkeeping correction only.
## 2026-09-15 22:20 SAST | opencode / GLM | claude-sonnet-5 | ADR-0029 — one fusion source; server port guard | authored, Lethabo directed

Changed: inspecting the predecessor checkout before porting `server/` surfaced a material architectural divergence. **BEACON carried two different fusion implementations and two copies of the plate matcher.** `brain/fusion.py` used calibrated log-odds (F1 `2.2`, threshold `2.0`) and the state name `watch_candidate` — but was imported **only by its own tests**; nothing in `server/` called it. The server used `server/src/suspicion/scorer.py`, which used additive weights (F1 `0.40`, threshold `0.40`) and the state name `candidate` — imported by `api/sightings.py`, `api/entities.py` and `demo_reset.py`. The server DB default comment read `# observed, candidate, flagged`; every server contract test asserted `"candidate"`. Separately, `server/src/suspicion/entity_resolution.py` was a second copy of `brain/entity_resolution.py`. Wrote **ADR-0029: One fusion and one entity-resolution implementation — the server consumes `brain/`, never a second copy.** Decision: (a) `brain/fusion.py` is the single source of fusion math; the server calls `recompute()`; `scorer.py` is not ported. (b) `brain/entity_resolution.py` is the single source of plate matching; the server's duplicate is not ported. (c) The state vocabulary is the frozen contract's (`observed`/`watch_candidate`/`flagged`/`dismissed`/`whitelisted`); `candidate` is not a valid state anywhere. (d) F2–F5 are implemented inside `brain/`'s calibrated log-odds model with `PROVISIONAL` weights (G1), not adopted from `scorer.py`'s additive model. (e) The server translates rows into `brain` `Entity` objects and persists the result — no fusion arithmetic in `server/`. (f) The shared golden fixture remains the referee. Added the port guard to `brain/README.md` and `docs/HANDOVER.md` Task 4, and a `P2.18` row to `docs/CHECKLIST.md`.

Evidence: read-only predecessor inspection (`git grep` / file reads, 15 Sep 2026). `grep -rn "brain.fusion\|from brain"` over `BEACON/` returns only the module's own tests and a docstring — the server never used it. `grep -rn "score_entity"` over `BEACON/server/` returns `api/sightings.py:349,430`, `api/entities.py:16,111`, `scripts/demo_reset.py:24,68`, and the test suite. `BEACON/server/src/db/models.py:52` defaults `state="observed"` with comment `# observed, candidate, flagged`. All findings `FACT`.

Decision: the clean repository's `brain/README.md` already required one shared fusion module ("one golden fixture is the referee for both web and native"); BEACON violated its own requirement. Porting `server/` as a file copy would import the divergence — the same sighting computing `watch_candidate` on the device and `candidate` on the server, with different scores. ADR-0029 prevents this by construction.

Needs/blockers: the `server/` port (Task 4) is now explicitly **more than a file copy** — `scorer.py` and the server's duplicate `entity_resolution.py` are deliberately excluded, and the server scoring path is rewritten to delegate to `brain/`. This is Sibusiso's implementation work; ADR-0029 is the frozen constraint on it. F2–F5 remain open (G1/G4, 23 Sep). The predecessor's `scorer.py` F2–F5 logic is a reference for the rewrite, not a source to copy.

Business handoff: not applicable — architecture governance, not a household capability. Serves C2 (a real cross-layer bug caught before it was ported) and C3 (the port is now evidence-driven and checkable).

Next: support Sibusiso's `server/` port against ADR-0029; judging criteria publish Friday 19 Sep (P1.9 rules-lawyer).

## 2026-09-15 22:40 SAST | opencode / GLM | claude-sonnet-5 | port-divergence register opened — D3 blocks the contract freeze | authored, Lethabo directed

Changed: created `docs/PORT-DIVERGENCES.md` — the register for mismatches between predecessor code and this repository's frozen contract, found while reading predecessor files before porting. Three entries. **D1** (closed, ADR-0029): the two fusion models and the `watch_candidate`/`candidate` state split. **D2** (open): `GET /v1/evidence/integrity` — the contract requires `first_broken_index` with `additionalProperties: false`, the predecessor returns `broken_at_seq`/`broken_at_id`/`total_events`; the port must map the field and resolve 1-based vs 0-based indexing. **D3** (open, material): the contract's `Sighting` is a 7-field envelope (`version`, `event_id`, `tenant`, `source_time`, `received_time`, `sim_`, `freshness`, `additionalProperties: false`) and carries **none** of the domain fields the system consumes — `brain/fusion.py` reads `camera_id`, `hex_id`, a timestamp; `scorer.py` reads `kind`, `modality`, `confidence`. Against the contract as written, `POST /v1/sightings` cannot accept a sighting the fusion can use. Linked the register from `docs/HANDOVER.md` Task 4; updated `P2.16` (contract freeze) to mark it blocked on D3; updated `team/lethabo.md`.

Evidence: read-only predecessor inspection, 15 Sep 2026. `contracts/openapi.yaml` `Sighting` + `POST /v1/sightings` and `contracts/events.schema.json`; `BEACON/server/src/api/sightings.py:48-68` (`SightingCreate`); `brain/fusion.py:64-79` (reads `camera_id`, `hex_id`, `ts`); `BEACON/server/src/db/evidence_integrity.py:27-33`; `BEACON/server/src/api/entities.py:392-404`. All `FACT`.

Decision: the register is the port's checkable gate — no `server/` file is ported before its divergence is logged. **D3 is material and needs a decision, not an assumption**: either extend `Sighting` to carry the domain fields, or nest a domain schema under the envelope (keeping transport separate from payload). That choice goes in the contract and an ADR, and it must be taken **before** `Sighting` is called frozen. This is exactly the kind of cross-layer finding that makes the contract freeze (`P2.16`) worth doing before the port, not after.

Needs/blockers: D3 resolution with Sibusiso (contract owner) + ADR — both leads. D2 is a straightforward correction in the port. The contract freeze (`P2.16`) stays `◐` until D3 is resolved. Sibusiso is active on `fix/sibusiso-date-correction`.

Business handoff: not applicable — contract governance. Serves C2 (a second real cross-layer defect caught by inspection, not by a live demo failure) and C3 (the port proceeds against a written contract with its divergences named).

Next: resolve D3 with Sibusiso; judging criteria publish Friday 19 Sep (P1.9 rules-lawyer).

## 2026-09-15 22:55 SAST | opencode / GLM | claude-sonnet-5 | D3 strengthened — the contract contradicts the repo's own architecture | authored, Lethabo directed

Changed: strengthened `docs/PORT-DIVERGENCES.md` D3 with a second finding and a recommendation. The contract's `Sighting` (7-field transport envelope) contradicts this repository's **own** architecture: `docs/01-ARCHITECTURE.md:2581` defines `Sighting` = *"One detection event: (entity, camera, hex, ts, modality, confidence)"*, and `:1431` says the same. `docs/00-SPEC.md:222` describes `POST /v1/sightings` as *"single or batch ingest; signature required."* So the contract is the odd one out — against both the predecessor payload **and** the architecture's definition. Added a **Recommendation (proposed for Sibusiso's decision)**: align the contract to the architecture — make `Sighting` the detection event per §2581, and rename the 7-field object as the transport envelope (`EventEnvelope`/`SightingEvent`) that carries it. Added the rejected alternatives with reasons (collapsing transport+domain loses consistent `sim_`/`freshness` meaning; reshaping the payload to 7 fields deletes the fields fusion needs).

Evidence: `docs/01-ARCHITECTURE.md:1431,2581`; `docs/00-SPEC.md:222`; `contracts/openapi.yaml` `Sighting`; `contracts/events.schema.json`. All `FACT`.

Decision: none made — the recommendation is proposed, not adopted. D3 remains Sibusiso's contract decision plus both leads (an ADR if the wire shape changes). Recording the architecture evidence makes the decision cheap: the repository already says what `Sighting` means.

Needs/blockers: D3 resolution with Sibusiso + ADR. `P2.16` stays `◐` until then.

Business handoff: not applicable — contract governance. Serves C2/C3 (the defect is caught and named with the repository's own evidence, before it reaches a demo).

Next: resolve D3 with Sibusiso; judging criteria Friday 19 Sep.

## 2026-09-15 23:15 SAST | opencode / GLM | claude-sonnet-5 | G13 model cards written | authored, Lethabo directed

Changed: created `docs/MODEL-CARDS.md` — one card per model on the `docs/SDLC.md` §17.4 template, plus a negative card for the non-ML fusion engine. Four model cards: **YAMNet** (acoustic; sha256 verified), **Ultralytics YOLOv8n** (object detection; AGPL-3.0), **InsightFace `buffalo_l`** (face embedding; non-commercial weights; G9 named explicitly), **fast-plate-ocr `cct-s-v2-global`** (plate text; the confidence floor recorded as a junk suppressor, not a true-positive filter). Each card states source (all pretrained — no model trained by this team, G5), input shape, intended use, out of scope, **known limitations / demographic performance = "not measured"**, calibrated = no, and where it sits in the decision path (perception only; a match/read is a lead for a human, never a verdict). Closed G13 in `docs/OPEN-GAPS.md`; added `P2.19` to `docs/CHECKLIST.md`; updated `team/lethabo.md`.

Evidence: cards cross-reference `docs/MODEL-LICENCES.md` (G12). Model facts (`FACT`): YAMNet sha256 `10c95ea3…c317de`; YOLOv8 `yolov8n.pt`, autodownloaded, pins unknown; InsightFace `buffalo_l` 512-d, cosine thresholds 0.55/0.65 are **targets**; fast-plate-ocr `cct-s-v2-global`, `MIN_CHAR_PROB = 0.50` validated as a junk suppressor (4/4 junk rejected) with **no correctly-read plates in the sample** (`BEACON/vision/plate_ocr.py` docstring). The plate-card limitation is the predecessor's own published honest limit, carried forward verbatim. `FACT`

Decision: the model cards state **"not measured"** in every demographic-performance row — the honesty ledger's required and acceptable answer (`docs/MASTER-CONTEXT.md` §6). No precision, accuracy, read-rate or demographic figure is claimed anywhere. The face card is the most important: it names G9 and records that the system's own stated control (bias evaluation) is untested. This is deliberate — a judge who sees the team state the limits of its own models is likelier to believe the claims it does make.

Needs/blockers: none. The cards are specification/limitation documentation, not measurements; no external input is required. Input shape is tagged `ESTIMATE` until read from the interpreter at port time (per the §17.4 template's own instruction).

Business handoff: `templates/BUSINESS-HANDOFF.md` not changed; this is model governance. Serves C2 (the non-ML fusion card and the stated limits are the differentiator) and C3 (G13 closed before Align).

Next: judging criteria publish Friday 19 Sep (P1.9 rules-lawyer); resolve D3 with Sibusiso.

## 2026-09-15 | Sibusiso (Claude session) | D3/D2 resolved — ADR-0030 | contract updated

Changed: resolved `docs/PORT-DIVERGENCES.md` D3 (blocking, contract owner's decision) and D2 (index-base decision) as ADR-0030. `contracts/openapi.yaml`'s `Sighting` schema — previously the bare 7-field wire envelope, contradicting both `brain/fusion.py`'s actual field usage and `docs/01-ARCHITECTURE.md`'s own definition of `Sighting` as the domain event — renamed to `EventEnvelope`; a new `Sighting` schema added for the domain payload (`camera_id`, `hex_id`, `ts`, `modality`, `confidence` required; `entity_id`, `kind`, `bbox`, `plate_text`, `plate_quality`, `embedding_ref` optional, matching the predecessor's field set Lethabo evidenced); composed as `SightingEvent` for `POST /v1/sightings`. Accepted Lethabo's D3 recommendation exactly as proposed, including his rejection of the two alternatives. `contracts/events.schema.json` needed no change — it was already envelope-only, never named `Sighting`. `IntegrityResult.first_broken_index` documented as 0-based (D2), matching the schema's existing `minimum: 0`. Updated `docs/PORT-DIVERGENCES.md` (D2/D3 status) and `docs/CHECKLIST.md` P2.16.

Evidence: verified against real code before writing the fix, not just Lethabo's register — `contracts/openapi.yaml`'s old `Sighting` schema confirmed to be the bare envelope; `docs/01-ARCHITECTURE.md`'s domain-event definition confirmed at the cited lines; `brain/fusion.py`'s `factor_f1_recurrence` confirmed to read `s["camera_id"]`. After the fix: full YAML parse via Python's `yaml.safe_load` (no YAML-parsing dependency exists in this zero-dependency repo, so this was a one-off check, not added as a test) confirms `EventEnvelope`/`Sighting`/`SightingEvent` all present, `Sighting`'s required fields exactly `[camera_id, confidence, hex_id, modality, ts]`, `POST /v1/sightings`'s request body now references `SightingEvent`. `npm test` → 11/11 (2 new tests added). `node scripts/check-docs.mjs` passes.

Decision: accepted as contract owner, per `docs/PORT-DIVERGENCES.md`'s own framing ("proposed for Sibusiso's decision"). Not yet a joint freeze — `docs/CHECKLIST.md` P2.16 stays `◐`, Lethabo's second-lead sign-off on this specific ADR is still outstanding per `docs/OVERLAPS.md`, distinct from his earlier F1 sign-off on the governance code.

Needs/blockers: Lethabo's review of ADR-0030 before `P2.16`/the contract can be called jointly frozen. D2's field-name mapping (`broken_at_seq` → `first_broken_index`) still applies whenever `server/`'s evidence-integrity endpoint is actually ported — no such endpoint exists in this repository yet.

Business handoff: not applicable — contract correction, no household capability changed. Serves C3 (a real defect caught and fixed before the port, not after a demo failure).

Next: Lethabo reviews ADR-0030; then the `server/` port (Task 4) can proceed against a contract that can actually carry what fusion needs.
## 2026-09-15 23:50 SAST | opencode / GLM | claude-sonnet-5 | reviewed PR #23 (changes requested); D4 and G23 opened | authored, Lethabo directed

Changed: reviewed Sibusiso's PR #23 (ADR-0030, resolving D3/D2) and **requested changes** on one blocking finding. `SightingEvent` is defined `allOf: [EventEnvelope, {required: [payload], additionalProperties: false, ...}]`. Both branches set `additionalProperties: false`, and in JSON Schema each subschema evaluates it within its own `properties` — so the envelope branch rejects `payload` and the payload branch rejects the seven envelope fields. The intersection is empty: **no valid `POST /v1/sightings` body exists.** Verified with `jsonschema` 4.25.1 `Draft202012Validator` against the branch's `contracts/openapi.yaml`: `EventEnvelope` alone VALID, `Sighting` alone VALID, `SightingEvent` (envelope + payload) INVALID — two "additional property not allowed" errors. Supplied a verified fix: drop `additionalProperties: false` from `EventEnvelope`, add `unevaluatedProperties: false` at the `SightingEvent` level (JSON Schema 2020-12, which OpenAPI 3.1 uses, and which is evaluated across all `allOf` branches) — re-verified: valid event VALID, extra top-level field INVALID. Also noted (non-blocking) that the two new regex tests cannot catch an unsatisfiable `allOf`, because structure ≠ satisfiability. Accepted the rest: the D3 design matches the recommendation exactly, and the D2 0-based decision is correct. Also opened **D4** in `docs/PORT-DIVERGENCES.md` (the purged proprietary claims dataset is a hard dependency of predecessor risk/suspicion code — `Claim` model, `load_claims.py`, F3 in `scorer.py`, `hotspot_pipeline/`, `data_prep/`; the port must not re-introduce it) and **G23** in `docs/OPEN-GAPS.md` (`docs/00-SPEC.md` §1.3 still quantifies from the purged dataset, while G7's closure states the repo re-bases on SAPS-only — an unverified claim/wording gap). Also reviewed and merged Sibusiso's PR #18 (clerical date correction 17 Sep → 15 Sep). Updated `docs/HANDOVER.md` Task 4 and `team/lethabo.md`.

Evidence: `jsonschema` 4.25.1 test runs (recorded in the PR review); `git grep` over the read-only predecessor checkouts for the purged filenames (`Gradhack_Insure_Data`, `claims_cleaned`, `.xlsx`) — 28 files in `BEACON`, several in `Team-Sonar---Vuka-`; `BEACON/server/src/db/models.py:176-198`, `BEACON/server/scripts/load_claims.py:2,21,36-37`, `BEACON/server/src/suspicion/scorer.py:177`; `docs/00-SPEC.md:38,43`; `docs/OPEN-GAPS.md` G7 closure. All `FACT`.

Decision: PR #23 blocked until the `SightingEvent` schema is satisfiable — a contract that cannot be called is worse than no contract. G23 is flagged before the repo goes public (G0, 16 Sep) because G7's own closure asserts a re-basing that `00-SPEC.md` §1.3 does not show; Ipeleng owns the licence question and Khutso the wording.

Needs/blockers: Sibusiso to apply the F1 fix to PR #23 (small; I re-review immediately with the validator ready). G23 needs Ipeleng (licence) and Khutso (G7 closure wording). D4 is a port guard, no action until `server/`/`data/` porting begins.

Business handoff: not applicable — contract review and gap registration. Serves C2/C3 (a third cross-layer defect caught before freeze, this time in the frozen contract itself, with a reproducible proof).

Next: re-review PR #23 after the fix; judging criteria Friday 19 Sep.

## 2026-09-16 00:20 SAST | opencode / GLM | claude-sonnet-5 | PR #23 approved+merged; lead sign-off on contract recorded | authored, Lethabo directed

Changed: re-reviewed Sibusiso's PR #23 after his F1 fix (`b6fc7f0`). Independently re-verified with `jsonschema` 4.25.1 `Draft202012Validator` against the branch's `contracts/openapi.yaml` — six cases: valid `SightingEvent` VALID; extra top-level field INVALID; missing `payload` INVALID; out-of-range `confidence` INVALID; `Sighting` extra field INVALID; valid `Sighting` VALID. The fix is exactly the recommended shape: `EventEnvelope` drops `additionalProperties: false`, `Sighting` keeps it (referenced directly as `payload`), `SightingEvent` enforces the closed shape once via `unevaluatedProperties: false`. `npm test` 11/11, `check-docs` passes. Approved and merged (ADR-0030 now on `main`; D3 closed, D2 decided 0-based). Then updated `docs/CONTRACT-APPROVAL-RECORD.md`: recorded **Lethabo's lead sign-off** on the contract (event shape, action naming, ADR-0030), dated 2026-09-15, with `ADR-0030 · b6fc7f0`. Left Sibusiso's second-lead row and the consumer-confirmation item pending, and marked the consumer item **blocked** — Vukosi's `appliance/agent.py` (PR #24) emits the envelope only and does not yet satisfy `SightingEvent`. Updated `P2.16` in `docs/CHECKLIST.md` and `team/lethabo.md`.

Evidence: the six-case `jsonschema` run (output recorded in the PR #23 approval); `npm test` → 11/11; `node scripts/check-docs.mjs` → pass. All `FACT`.

Decision: the contract's **lead** approval is now recorded; the contract is **not** frozen — two items remain, and I have left them explicit rather than inferring them: (1) Sibusiso's second-lead row (his own review and signature, which I must not write for him); (2) the consumer confirmation, which is genuinely blocked on the appliance emitting the `Sighting` payload. Recording my own sign-off while leaving his pending is the honest state — a contract frozen on one lead's signature would be exactly the kind of inferred approval the operating rules forbid.

Needs/blockers: Sibusiso's second-lead sign-off; Vukosi (via Sibusiso, his first reviewer) to reconcile PR #24 with `SightingEvent`. Judging criteria publish Friday 19 Sep (P1.9). Ipeleng's security/legal items (P2.1 PSiRA, P2.2 POPIA, P2.5 IO registration, P2.6 Code of Conduct, P2.7 RICA) remain entirely undone with no authored work — flagged to the leads.

Business handoff: not applicable — contract governance. Serves C2/C3 (the contract is now satisfiable and the ingest shape matches the architecture and the fusion).

Next: chase the two remaining contract-freeze items; judging criteria Friday 19 Sep.

## 2026-09-15, time not recorded | Ipeleng (via Cline assistant, VS Code agent) | model identifier not independently recorded | P2.1 | authored, review pending

Changed: wrote `docs/PSIRA-POSITION.md` — the P2.1 deliverable (serves C2, C3; closes the documentation half of G19). Answers the four questions the checklist row asks: (1) trigger — the obligation attaches to rendering, not revenue or scale, so the Phase-1 pilot as planned (VUKA installs KHAYA and operates UMOJA's verification loop) already pulls it; (2) registration category — electronic-security-monitoring plus install/servicing of security equipment, with category IDs and fees flagged ⚑ for counsel (recorded research figures ~R7,900 business / ~R250 individual kept indicative only); (3) flag-gate reviewers — assumed to need individual registration until counsel says otherwise, with a proposed build consequence: `server/src/auth/operators` onboarding captures PSiRA number/grade/expiry as activation fields, gated like `docs/MODEL-LICENCES.md`; (4) contracting structure — the PSiRA-registered security company is the party rendering the monitoring/flag service, VUKA is its licensed technology supplier, tabled as three variants (partner operates the gate / VUKA operates under written delegation / VUKA self-registers for the pilot) with the fallback stated as the default until a partner is signed; plus six minimum contract clauses and counsel questions Q1–Q8. Swept the superseded "we integrate with armed response, we do not dispatch" one-liner in `docs/08-BUSINESS.md` (the exact line `docs/PLAN.md` §C1 called probably insufficient) and updated the P2.1/G19 status rows and `team/Ipeleng.md`. PR #28.

Evidence: `node scripts/check-docs.mjs` passes on branch `docs/ipeleng-psira-position` (commit 5c98789). Statutory findings build on recorded team research (`docs/PLAN.md` §C1, `docs/OPEN-GAPS.md` G19, `docs/audit/02-economics.md`). Primary sources were unreachable from this environment (SAFLII 403, psira.co.za unreachable, gov.za attachment 404, search engines bot-walled) — the paper contains **no verbatim statutory quotes** and flags every exact-wording claim ⚑ for verification against the consolidated Act (paper §9); Q1 is whether the 2014 amendment's manufacture/import/supply/export limb of "security service" applies to VUKA-as-supplier.

Decision: none adopted — the paper states a team position to operate under (reviewers registered, fallback = VUKA self-registers for the pilot) and records that live monitoring is blocked at G-gate until counsel reports. This is not legal advice and creates no compliance claim; the honesty ledger applies.

Needs/blockers: counsel answers Q1–Q8 (evidence listed in the paper §7); Lethabo's review, then both leads, on PR #28; registration lead time must be added to the pilot calendar once Q3 returns.

Business handoff: not applicable — no household capability changed. Serves C2/C3 by giving the pilot and the partner contract an explicit regulatory position instead of a marketing one-liner.

Next: Ipeleng — `P2.2` POPIA position paper + ADR; `P2.5` Information Officer registration. Lethabo — review PR #28.

## 2026-09-16 00:50 SAST | opencode / GLM | claude-sonnet-5 | PR #28 approved+merged; Lean Canvas PSiRA line swept | authored, Lethabo directed

Changed: reviewed and approved Ipeleng's PR #28 — `docs/PSIRA-POSITION.md`, the `P2.1` deliverable (four answers: trigger, registration category, flag-gate reviewers, contracting structure; six minimum contract clauses; counsel questions Q1–Q8; provenance log honestly recording the primary-source access failure). Verified the cited sources exist (`docs/PLAN.md` §C1 at `:118`; PSiRA references in `docs/audit/02-economics.md`), the `docs/08-BUSINESS.md` supersession preserves the record, G19 moved to ◐ with the counsel gate stated, and `team/ipeleng.md` was updated with the tool declared. Then fixed the one instance her sweep missed: `docs/LEAN-CANVAS.md:298` still carried *"PSiRA implications reviewed: we integrate with armed response, we do not dispatch"* — the exact claim the paper declares insufficient, in a judge-facing canvas. Replaced with a pointer to the paper and the open counsel questions.

Evidence: `git grep -in "do not dispatch"` over the PR branch — the only live-doc instance outside the superseded/strike-through/historical records was `docs/LEAN-CANVAS.md:298`. `docs/PLAN.md`'s mention is the record that called the claim insufficient (kept); `BRIEF.md`/`RULES.md`/`01-ARCHITECTURE.md` "dispatch" hits are the autonomy boundary (refusing machine dispatch), a different subject. All `FACT`.

Decision: approved with one finding, then fixed the finding myself rather than blocking the PR on a one-line sweep miss — the paper is Ipeleng's deliverable and it is complete; the missed line is a mechanical sweep item in a file I have edited before. The Lean Canvas now agrees with the position paper: the one-liner is gone everywhere a judge can read it.

Needs/blockers: `P2.1` documentation half is closed; the counsel questions (Q1–Q8) remain open and gate go-to-market messaging and live monitoring. Ipeleng's `P2.2` (POPIA paper + ADR) and `P2.5` (IO registration) are next; PR #27 (her PR #10 review) still carries my changes-requested and is not reworked.

Business handoff: the Lean Canvas is judge-facing — this closes the gap between what the canvas claims and what the position paper says. Serves C2 (the compliance story is now real, not a one-liner) and C3 (G19 documentation half closed before go-to-market).

Next: Ipeleng — `P2.2` POPIA paper + ADR, `P2.5` IO registration, and the PR #27 rework. Judging criteria Friday 19 Sep.

## 2026-09-15 | Codex assistant | GPT-5 | WBS 3.2 — synthetic edge producer | implementation on branch, review pending

Changed: `appliance/agent.py` now constructs only the exact v0.1.0 event envelope from `contracts/events.schema.json` and enforces visibly synthetic `sim_` identifiers, `sim_: true`, UTC `Z` timestamps and the allowed freshness values. `EventQueue` appends flushed JSONL lines, reloads FIFO state, stops visibly on malformed content, and removes entries only after an injected consumer acknowledges them. Added `appliance/tests/test_agent.py` and three `sim_` fixtures covering schema shape, privileged-field rejection, restart/FIFO behaviour, acknowledgement boundaries and unchanged malformed queues. Updated `appliance/README.md` with the implementation boundary and explicit non-claims. Updated `team/vukosi.md` with the assistant-run status review; owner availability remains unconfirmed.

Evidence: `python -m unittest discover -s appliance/tests -p 'test_*.py' -v` → **7/7 passed** (Python 3.12.11). `python -m pytest appliance/tests -v` was attempted but could not run because this clone has no pytest module; the equivalent standard-library suite is the recorded focused result. `node --test test/events-contract.test.mjs test/openapi-contract.test.mjs` → **8/8 passed**. `node scripts/check-docs.mjs` → passed. `node scripts/check-intake.mjs` → passed. `node scripts/test-security.mjs .tools/gitleaks.exe` → passed. `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .` → no leaks found. `.tools/gitleaks.exe git --redact --config .gitleaks.toml --log-opts='--all'` → no leaks found. `git diff --check` → passed.

Decision: no contract change. The implementation consumes the merged v0.1.0 envelope without adding fields. The repository's `docs/CONTRACT-APPROVAL-RECORD.md` still records approval as pending; Sibusiso/Lethabo must reconcile that governance record before the contract is called fully frozen.

Needs/blockers: Sibusiso is the first reviewer; both leads review before merge. No live server consumer exists, so direct schema validation is the current acceptance boundary. Power-loss, disk-corruption, concurrent-writer and full-disk cases remain untested and are not claimed. Human owner availability and equipment remain unconfirmed.

Business handoff: not applicable — this is a synthetic producer and queue/replay foundation; it changes no household-facing capability and makes no hardware or sensing claim.

Next: Sibusiso reviews `feat/vukosi-3.2-edge-producer`; after approval, merge via PR, then proceed to WBS 4.2 only with an actual measurement instrument and dated BOM sources.

## 2026-09-15 | Codex assistant | GPT-5 | WBS 3.2 protocol correction | recorded, review pending

Changed: recorded an append-only process correction in `team/vukosi.md` and this log. The WBS/path declaration was entered after implementation began, rather than before the first edit as required by RULES/AGENTS. The implementation PR remains reviewable and no contract or other shared interface was changed. The affected paths are now explicitly listed in the personal file and PR #24.

Evidence: `git log -1 --oneline` → `0aaa590 feat(appliance): add synthetic edge producer`; PR #24 is open with `secret-scan:SUCCESS` and `document-contracts:SUCCESS`; `git status --short --branch` is clean relative to the branch's remote after the prior commit. This entry is a correction, not a claim that the original sequencing was compliant.

Decision: no product or contract decision; process correction only.

Needs/blockers: reviewers should note the sequencing miss when assessing protocol compliance. Sibusiso remains first reviewer, followed by both leads. Owner availability remains unconfirmed.

Business handoff: not applicable — no capability or commercial claim changed.

Next: push this correction as a follow-up commit to PR #24 and request reviewers to consider the complete append-only record.

## 2026-09-16 | Codex assistant | GPT-5 | WBS 3.2 review follow-up | rebase and review findings addressed, rereview pending

Changed: rebased `feat/vukosi-3.2-edge-producer` onto current `origin/main` (`f1246ae`), preserving all append-only mainline log entries and replaying the two existing WBS 3.2 commits. Updated `appliance/README.md` to state the transport-envelope-only boundary: `POST /v1/sightings` accepts `SightingEvent` (envelope plus required `Sighting` payload), which this WBS intentionally does not construct. Added the payload consumer-confirmation blocker to `team/vukosi.md`. Strengthened `appliance/tests/test_agent.py` to assert that injected clock values map to `source_time` and `received_time` in order.

Evidence: `git rebase origin/main` completed successfully after one `docs/BUILD-LOG.md` append-only conflict; all mainline entries were retained. `python -m unittest discover -s appliance/tests -p 'test_*.py' -v` → **7/7 passed**. `node --test test/events-contract.test.mjs test/openapi-contract.test.mjs` → **10/10 passed**. `node scripts/check-docs.mjs` → passed. `node scripts/check-intake.mjs` → passed. `node scripts/test-security.mjs .tools/gitleaks.exe` → passed. `.tools/gitleaks.exe dir --redact --config .gitleaks.toml .` → no leaks found. `git diff --check` → passed.

Decision: retain WBS 3.2 as an envelope-only synthetic producer; do not silently expand it to `SightingEvent`. Payload construction and server consumer confirmation are a separate cross-layer follow-up owned by the relevant contract/server owners. The minor clock finding is addressed by an explicit deterministic mapping assertion; the contract itself does not require `received_time` to be later than `source_time`.

Needs/blockers: PR #24 requires the refreshed branch checks and formal rereview by Sibusiso and both leads. The contract approval record's consumer item remains blocked until either payload emission is implemented or the follow-up scope is recorded by its owners. Power-loss, disk-corruption, concurrent-writer and full-disk cases remain untested and are not claimed.

Business handoff: not applicable — documentation and test-boundary clarification only; no household-facing capability changed.

Next: commit and push this follow-up, request rereview on PR #24, and wait for formal approvals before merge. Payload integration must be planned separately with Sibusiso/Khutso.

## 2026-09-16 | Codex assistant | GPT-5 | WBS 3.2 handoff | follow-up pushed and rereview requested

Changed: committed follow-up `6279d39` (`docs(appliance): clarify ingest boundary after review`) and force-updated `feat/vukosi-3.2-edge-producer` with `--force-with-lease` after the successful rebase. Re-requested Sibusiso-K and LethaboMH14 on PR #24 and posted the review-resolution summary there.

Evidence: working tree is clean; PR #24 is OPEN and CLEAN. GitHub `document-contracts` and `secret-scan` checks both completed SUCCESS on the refreshed head. Local evidence remains 7/7 producer tests, 10/10 contract tests, docs/intake/security checks passed, Gitleaks clean, and `git diff --check` passed.

Decision: implementation is ready for formal reviewer decisions; no merge was performed. WBS 3.2 remains envelope-only, and the `SightingEvent` payload/consumer-confirmation follow-up remains outside this leaf.

Needs/blockers: formal approvals and contract consumer confirmation are still pending. Unmeasured power-loss, disk-corruption, concurrent-writer and full-disk behaviours remain explicitly unclaimed.

Business handoff: not applicable — this records repository/PR state only.

Next: Sibusiso and Lethabo review PR #24; contract/server owners separately plan payload integration and update the approval/checklist records.

## 2026-09-16 | Codex assistant | GPT-5 | WBS 3.2 protocol audit | documentation alignment, formal review pending

Criterion: **C3 (progress of solution profile)**. Trust answer: a reviewer can reproduce the synthetic queue/replay evidence and see exactly where live-ingest, hardware and power claims stop; no household capability is claimed from unmeasured work.

Changed: audited the required reading order, bounded WBS declaration, overlap register, branch/PR workflow, claim labels, evidence commands, security/intake gates, business-handoff rule, reviewer requirements and append-only logging. Corrected the stale `team/vukosi.md` update date. Updated PR #24's description to match the rebased branch, current 10/10 contract evidence, current rollback guidance and pending formal approvals.

Evidence: `git status --short --branch` is clean and tracks `origin/feat/vukosi-3.2-edge-producer`; PR #24 is OPEN and CLEAN with `document-contracts` and `secret-scan` SUCCESS. No contract or production-access change was made. The original sequencing miss remains preserved in the prior correction entry; it is not relabelled as compliant.

Decision: protocol obligations currently within this WBS are satisfied or explicitly recorded as pending. No self-approval, merge, fabricated measurement, reviewer approval or hardware claim was made.

Needs/blockers: Sibusiso's second-lead review, Lethabo's formal review and consumer confirmation in `docs/CONTRACT-APPROVAL-RECORD.md` remain pending. Payload integration belongs to the contract/server owners; power-loss, disk-corruption, concurrent-writer and full-disk behaviour remain untested.

Business handoff: not applicable — this is a documentation/protocol audit and does not change household capability.

Next: await both formal reviewer decisions on PR #24; do not merge until required approvals and the contract consumer gate are resolved.

## 2026-09-16 | Codex assistant | GPT-5 | WBS 3.2 merge-gate follow-up | ownership and checklist reference recorded

Criterion: **C3 (progress of solution profile)**. Trust answer: reviewers can see the exact boundary between the tested local envelope queue and the future live-ingest payload, with an acceptance test named before implementation begins.

Changed: recorded the active coordination claim in `docs/OVERLAPS.md` and extended checklist row `P2.16` in `docs/CHECKLIST.md`. The follow-up is **PROPOSED** pending acknowledgement: Vukosi owns future synthetic `SightingEvent` payload emission; Sibusiso owns server-consumer confirmation; Khutso maintains the checklist/evidence record. The approval-record consumer item remains unchecked until a synthetic `SightingEvent` fixture is accepted by the consumer contract.

Evidence: no contract file, production access or appliance capability changed. PR #24 remains the implementation reference; its current-head checks are green. This entry records scope and acceptance only; payload integration is not implemented or measured.

Decision: retain WBS 3.2 as envelope-only and track payload integration separately. No human acknowledgement or approval is inferred from this proposed ownership record.

Needs/blockers: Khutso, Sibusiso and Vukosi must acknowledge the proposed ownership split; Sibusiso's second-lead contract row and Lethabo's final PR review remain pending. Power-loss, disk-corruption, concurrent-writer and full-disk behaviour remain untested.

Business handoff: not applicable — this is a cross-layer coordination record and changes no household-facing capability.

Next: obtain owner acknowledgement, then re-request Lethabo's final review on PR #24 after the current-head checks are visible and successful. Do not merge before the review gate is satisfied.

## 2026-09-16 | Codex assistant at Khutso Mothopa's request | GPT-5 | P1.1 market-figure correction | partial, blocked, review pending

Criterion: **C2 (innovation and creativity) and C3 (progress of solution profile)**. Trust answer: current judge-facing market copy now uses like-for-like, source-labelled measures; the correction is reproducible without treating historical records as current claims.

Changed: corrected the stale private-security-versus-police comparison in `docs/08-BUSINESS.md` and `docs/LEAN-CANVAS.md` to **~637,675 active private-security officers (31 March 2025)** versus **155,231 sworn / 187,681 total SAPS personnel (March 2025)**, derived **≈4:1**, with `FACT` provenance to the PSiRA 2024/25 Annual Report and SAPS. `docs/SONKE-OVERVIEW.md` already carried the corrected line. Updated P1.1 to complete in `docs/CHECKLIST.md` and refreshed `team/khutso.md`. No contract, security, or product capability changed.

Evidence: `rg -n -i --glob '!submission/archive-2026-08/**' '2\\.7m|2,7m|180k|180,000' .` returned only intentional historical/task references in `docs/EVIDENCE.md`, `docs/PLAN.md`, `docs/BUILD-LOG.md`, `docs/MASTER-CONTEXT.md`, `docs/CHECKLIST.md` and `team/babatunde.md`; the archived submission is excluded and remains labelled historical. No unclassified current judge-facing occurrence remains. `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs` and `git diff --check` passed.

Decision: the repository-controlled portion of P1.1 is complete; the overall checklist item remains **◐ / partial** because the external public-profile update is not edited or verifiable from this checkout. P1.2 remains shared with Babatunde; P1.3 remains open.

Needs/blockers: the public-profile owner must update and evidence the external copy before P1.1 can move to ☑. Sibusiso must review this PR first, followed by both leads. Any external Sonke publication requires its own confirmation. The old wording remains in historical/task records by design so the correction trail is auditable.

Business handoff: not applicable — market-copy correction only; no household capability changed.

Next: submit the P1.1 PR for Sibusiso's review, obtain evidence of the external public-profile update, then proceed to P1.3 while coordinating the shared P1.2 check with Babatunde.

## 2026-09-16 | Codex assistant at Khutso Mothopa's request | GPT-5 | P1.1 audit-record correction | partial, blocked, review pending

Criterion: **C3 (progress of solution profile)**. Trust answer: the checklist and evidence log now use the same completion vocabulary, so a reviewer can distinguish repository-controlled work from the unverified external publication.

Correction: the preceding P1.1 entry's sentence **"Updated P1.1 to complete in `docs/CHECKLIST.md`"** was inaccurate. `docs/CHECKLIST.md` correctly remains `◐ / partial` because the external public-profile update is not verifiable from this checkout. The prior entry is preserved for audit history; this append-only entry is the correction and no checklist state is changed.

Evidence: `docs/08-BUSINESS.md` and `docs/LEAN-CANVAS.md` contain the source-labelled replacement; `docs/SONKE-OVERVIEW.md` was already corrected. `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs` and `git diff --check` pass. No contract, security, product capability, external profile or reviewer decision changed.

Needs/blockers: the external public-profile owner must provide update evidence before P1.1 can move to `☑`. Sibusiso remains the required first reviewer, followed by both leads; no merge is permitted before that sequence.

Business handoff: not applicable — audit-record correction only.

Next: request Sibusiso's review of this correction, then request Lethabo's re-review after Sibusiso's decision.
## 2026-09-16 | Codex assistant at Khutso Mothopa's request | GPT-5 | P2.16 coordination acknowledgement | proposed, review pending

Criterion: **C3 (progress of solution profile)**, with C2/C4 protected by keeping the transport-versus-domain boundary explicit. Trust answer: a real user can trust this record only if the proposed owners, acceptance fixture and blocked consumer gate remain visible; envelope-only output is not presented as live ingest.

Changed: recorded Khutso's coordination acknowledgement for the proposed P2.16 follow-up in `team/khutso.md`, `docs/OVERLAPS.md` and `docs/CHECKLIST.md`. Vukosi remains the proposed owner of future synthetic `SightingEvent` payload emission, Sibusiso remains the proposed owner of server-consumer confirmation, and Khutso maintains the checklist/evidence record. No contract schema, production code, approval record, or P2.16 completion status changed.

Evidence: the latest mainline is `2b34d23`; PR #24 merged on 2026-09-16 with `secret-scan` and `document-contracts` checks successful. The merged `appliance/README.md` still states that the producer emits the `EventEnvelope` only, while `docs/CONTRACT-APPROVAL-RECORD.md` leaves the consumer checkbox and Sibusiso's second-lead row unchecked. Acceptance remains a synthetic `SightingEvent` fixture accepted by the consumer contract.

Decision: the ownership split remains **PROPOSED**. This entry was recorded by the Codex assistant at Khutso's explicit request; it is not a human signature, reviewer approval, consumer confirmation, contract freeze, or product-capability claim.

Needs/blockers: Sibusiso must review this coordination PR before any merge, followed by both leads. Vukosi's payload fixture and Sibusiso's consumer confirmation remain required before P2.16 can move from ◐ to complete. No power-loss, disk-corruption, concurrent-writer or full-disk behaviour is claimed.

Business handoff: not applicable — coordination only; no household capability changed.

Next: submit this PR for Sibusiso's review, then both leads' review. Do not merge until those reviews and the contract consumer evidence are recorded.
## 2026-09-16 | Sibusiso (Claude session) | P2.16 second-lead sign-off | signed

Changed: completed the second-lead row in `docs/CONTRACT-APPROVAL-RECORD.md` — reviewed `contracts/events.schema.json` and `contracts/openapi.yaml` against `docs/00-SPEC.md`, re-verified ADR-0030's `EventEnvelope`/`Sighting`/`SightingEvent` shape with `jsonschema`'s `Draft202012Validator` (the same check used to fix PR #23's F1), and confirmed `governance.py`'s `REVIEW_ACTIONS`/`DESTRUCTIVE_ACTIONS` still match `openapi.yaml`'s `VerifyRequest.action` enum exactly. Also ticked the redundant "second lead independently reviewed" checklist row, which restates the same fact under a role label rather than a name. Updated `docs/CHECKLIST.md` P2.16 to reflect both lead rows signed, one item remaining.

Evidence: `contracts/openapi.yaml:295` action enum — `verify_concern, dismiss, whitelist, disarm, threshold_change, delete`, matches `server/src/auth/governance.py:12-13`'s `DESTRUCTIVE_ACTIONS`/`REVIEW_ACTIONS` exactly. jsonschema re-run against current `main` (`f1246ae`): valid `SightingEvent` instance passes, extra top-level field rejected, missing `payload` rejected — same three cases verified when F1 was originally fixed.

Decision: consumer-confirmation row deliberately left unticked — PR #24 documents envelope-only scope honestly, but "documented as a known gap" is not the same as "confirmed," per the checklist's own wording. Left as an open decision (emit the payload, or explicitly accept envelope-only as frozen) rather than defaulting either way.

Needs/blockers: consumer confirmation is the sole remaining item before `P2.16`/the contract can be called frozen. Owned jointly with Khutso per PR #24's own BUILD-LOG entry.

Business handoff: not applicable — contract governance, no household capability changed.

Next: resolve the SightingEvent payload question with Khutso/Vukosi; then the contract is fully frozen.

## 2026-09-16 | Sibusiso (Claude session) | P2.16 sign-off evidence correction | fixed

Changed: two accuracy fixes to the P2.16 sign-off from Lethabo's PR #33 review. (1) The approval-record row cited "events.schema.json/openapi.yaml current state" as evidence, which is a mutable reference, not a fixed one -- replaced with the exact commit reviewed, `f1246ae`, matching what the checklist's own header requires ("approval date and commit SHA are recorded below"). (2) Every reference to PR #24 as "approved, mergeable" was imprecise -- it is Sibusiso-approved and technically mergeable, but Lethabo's latest review on it is CHANGES_REQUESTED, so it is not fully approved. Corrected in docs/CONTRACT-APPROVAL-RECORD.md and docs/CHECKLIST.md to state that precisely.

Evidence: `gh pr view 24 --json reviewDecision` confirmed CHANGES_REQUESTED before making this fix, not assumed. `node scripts/check-docs.mjs` passes.

Decision: fixed rather than defended -- both findings were correct on inspection.

Needs/blockers: unchanged from the prior entry -- consumer confirmation is still the sole remaining item before P2.16/the contract is frozen. PR #33 itself still needs its own nonauthor/domain review and verifiable required checks before merge, per Lethabo's review.

Business handoff: not applicable -- recordkeeping correction only.
## 2026-09-16, time not recorded | Ipeleng (via Cline assistant, VS Code agent) | model identifier not independently recorded | P2.2 | authored, review pending

Changed: wrote `docs/POPIA-POSITION.md` — the P2.2 deliverable (serves C2, C3; closes the documentation half of G20) — and appended ADR-0031 to `docs/adr.md`. The paper answers the checklist question with verbatim statutory text for the first time this project: s11(1)(f) grants a legitimate-interest ground for ordinary personal information; s27(1) grants none for special personal information — its six grounds (consent; right/obligation in law; international public law; historical/statistical/research with public-interest and consent-impossibility safeguards; deliberately made public; the ss28–33 authorisations) leave a non-consenting passer-by unauthorised on (a)–(e). "Vectors not images" is named as a minimisation technique, not a lawful basis; person-versus-animal classification is placed outside special PI entirely. New finding the recorded research had not surfaced: **s33(1)** — the only ss28–33 limb naming biometrics — conditions processing on "responsible parties who have obtained that information in accordance with the law", which is either an independent ground for lawfully-operated gate cameras or circular; the paper refuses to build on the optimistic limb and makes it counsel question Q2. Discard-by-default (Sibusiso's four-step boundary) is adopted as the architecture's answer — ADR-0031 records it as an architecture constraint, not a configuration, with consent enrolment as the sole retained lawful basis and any exception requiring a fresh ADR + IO/privacy review + the s57 analysis. Responsible-party split aligned with the PSiRA partner-of-record paper (§6 clause 3 must name the same provider of record and extend the discard rule to the partner's side). Counsel questions Q1–Q5; downstream consequences for P2.3–P2.6 stated.

Evidence: `node scripts/check-docs.mjs` passes on branch `docs/ipeleng-psira-position` (run this session before commit). Primary-source access improved over the PSiRA session: SAFLII still 403 and the gov.za Act PDF downloads but arrives as an encrypted, unparseable binary — however popia.co.za (Accessible Law) reproduces the Act as enacted in full text, and the Information Regulator site was reachable (IO registration runs through the eServices Portal; the Regulator states the head of an organisation without a registered IO is held liable for POPIA matters — feeds P2.5). All quotes are from the Accessible Law copy and stay ⚑ for counsel verification against the Gazette (paper §10); the copy renders s27(1) grounds unlettered, so the lettering in the paper is ours. Statutory findings build on recorded team research (`docs/PLAN.md` §C2, `docs/OPEN-GAPS.md` G20, `docs/POPIA-S57-DECISION-RECORD.md`, `docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md`).

Decision: ADR-0031 accepted (owner Ipeleng; review pending): discard-by-default is an architecture constraint, not a configuration — in-memory processing against consented enrolment sets only, immediate discard of non-matches, match-plus-consent-reference as the only retained artifact; person-versus-animal classification is not special-PI processing; consent enrolment is the sole lawful basis for retained match data. Not legal advice and no compliance claim; the pilot face gate stays blocked at G-gate until counsel answers Q1–Q2.

Needs/blockers: counsel answers Q1–Q5; Sibusiso's `P2.3` test (a non-match leaves no embedding across the persistence boundary); Lethabo's architecture sweep to re-point the §9.2 "vectors not images" row at the paper and ADR; Lethabo's review, then both leads, on PR #28.

Business handoff: not applicable — no household capability changed. Serves C2/C3: the business and marketing docs can now honestly say the system compares against consented residents only and discards everyone else immediately, instead of the "vectors not images" engineering claim.

Next: Ipeleng — `P2.5` register the Information Officer; `P2.6` Gated Access Areas Code review. Sibusiso — `P2.3` discard-by-default implementation test. Lethabo — review PR #28.

## 2026-09-16, time not recorded | Ipeleng (via Cline assistant, VS Code agent) | model identifier not independently recorded | P2.5 | prepared, submission pending

Changed: wrote `docs/POPIA-IO-REGISTRATION.md` — the P2.5 deliverable as a prepared path, not a completed registration (serves C3). Verified both channels this session: the eServices Portal (`eservices.inforegulator.org.za`) is live and advertises "register Information Officers" among its services (news item dated 01/05/2024), and the Regulator's legacy information-officers page still carries the manual fallback — the 01 Apr 2021 Guidance Note's "Application form for Registration of Information Officers" emailed to `Registration.IO@inforegulator.org.za`. Recorded s55's registration condition ("Officers must take up their duties ... only after the responsible party has registered them with the Regulator" ⚑) and its duties list, the head-of-organisation liability already on file from P2.2, and the s1 "head" definition in substance only (source page truncated in this environment, ⚑). Named the honest blockers: the IO must be the body's head — a designation this session will not fabricate (logged as D-IO-1 for both leads) — and no organisation legal identity (CIPC number, registered address) exists anywhere in the repo, so §6 lists the five inputs the leads must supply before submission and §7 (submission record) is deliberately empty. Downstream notes: once designated, the IO should be named in `docs/OPERATOR-DUTY.md`'s Regulator-inquiry escalation row, owns the F14 subject-access route, inherits the PAIA annual-report calendar on the same portal, and the PAIA s51 manual is the natural follow-on.

Evidence: `node scripts/check-docs.mjs` passes on branch `docs/ipeleng-psira-position` (run this session before commit). Source access: inforegulator.org.za (homepage + information-officers page) and eservices.inforegulator.org.za reachable; the portal's account-register URL returns 404 to a non-browser agent, so the form's field list is honestly recorded as not enumerated. popia.co.za (Accessible Law) s55 quoted ⚑ pending Gazette verification; its s1 page truncated in both live and Wayback-archived renders, so the "head" wording was not captured. Guidance Note PDF not retrieved (guessed URL 404; the note is referenced verbatim on the information-officers page).

Decision: none adopted — D-IO-1 (head designation) and the organisation-identity question are logged for both leads; this document prepares a statutory step and creates no compliance claim; the honesty ledger applies.

Needs/blockers: leads' conversation to fix items 1–4 of `docs/POPIA-IO-REGISTRATION.md` §6 (head designation, organisation legal identity, contact email, optional deputy); the designated IO records the submission in §7 (channel, field list, reference); Lethabo's review, then both leads, on PR #30.

Business handoff: not applicable — no household capability changed. Serves C3: the cheapest statutory gate is now a single leads' conversation plus a 30-minute form, with the liability consequence and the IO's inherited duties on record.

Next: Ipeleng — `P2.6` draft Gated Access Areas Code review; `P2.7` RICA position. Leads — D-IO-1 designation and organisation identity for the IO submission. Sibusiso — `P2.3` discard-by-default implementation test. Lethabo — review PR #28.
Next: Ipeleng — `P2.6` draft Gated Access Areas Code review; `P2.7` RICA position. Leads — D-IO-1 designation and organisation identity for the IO submission. Sibusiso — `P2.3` discard-by-default implementation test. Lethabo — review PR #30.

## 2026-09-16, time not recorded | Ipeleng (via Cline assistant, VS Code agent) | model identifier not independently recorded | P2.2+P2.5 shipping vehicle | correction entry

Correction: while verifying the P2.5 push it emerged that PR #28 was merged on 16 Sep — Lethabo's 00:50 SAST entry above records the review and the merge — and its merge head was the P2.1 commit `87d3464`. The P2.2 commits pushed in the prior session (45a8abc paper + ADR sweep, a9a5f2c team log) therefore landed on the branch after the merge point and were never on `main`; the P2.5 push continued the same branch, and the P2.2 status row's "merge pending" note was stale the moment it was written. Fix: merged `origin/main` into the branch (the concurrent BUILD-LOG appends — Lethabo's and Ipeleng's — are both retained per the log rule), and opened **PR #30** as the successor vehicle carrying P2.2 (POPIA paper + ADR-0031) and P2.5 (IO registration path): https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/30. Live pointers updated from #28 to #30 in `docs/CHECKLIST.md` (P2.2/P2.3/P2.5 rows; the P2.1 row corrected to "merged 16 Sep"), this file's P2.5 entry, `team/ipeleng.md`'s current-task and changed-this-session sections, and the footers of both POPIA documents. Append-only entries (running log, the P2.1/P2.2 BUILD-LOG entries) are left as authored — their "PR #28" mentions record the vehicle as known then; follow the links above, not the old numbers. No document content changed beyond pointers; no compliance claim made.

## 2026-09-16, time not recorded | Ipeleng (via Cline assistant, VS Code agent) | model identifier not independently recorded | WBS 1.1 | verification record written, holder-chat review pending

Changed: wrote `docs/audit/09-credential-remediation-verification.md` — the WBS 1.1 independent-assurance record for the 13 Sep credential/password remediation (`docs/OPEN-GAPS.md` G6, closed by Sibusiso; G7 dataset likewise). The record separates three things this leaf must not conflate: what was exposed (four credentials, restated strictly at G6's redaction level — no values, no account identifiers, no new location detail, per `docs/HANDOVER.md` §3 rule 3), what the holders confirmed (the chat receipts are the acceptance evidence and are not in this repository — not accessible from this session), and what forensics corroborate (every-branch `filter-repo --replace-text` purge and force-push, fresh-clone gitleaks full-history re-verification with zero leaks, GitHub API confirming the redacted trees, both repos private, this repo's CI secret-scan green). Swept the now-stale "Production remains blocked by credential/data remediation" opener in `docs/audit/04-production-readiness.md` (remediation closed 13 Sep; that document's other blockers stand), the 1.1 row in `docs/audit/05-team-operating-system.md`, `docs/PLAN.md`'s 1.1 execution note, the audit README order and `team/ipeleng.md`. The WBS leaf is deliberately NOT ticked: its criterion — redacted issuer receipts reviewed — requires Ipeleng to read the 13 Sep holder confirmations in the chat platform, which this session cannot access; record §4 lists what each confirmation must state (credential, old-credential invalidation, date) and reopens G6 for any credential whose confirmation cannot be produced. Unblocks `1.4`'s clean-intake evidence assembly up to that confirmation; added the record to `scripts/check-docs.mjs`'s audit list so its links and count stay contract-checked.

Evidence: `node scripts/check-docs.mjs` passes on branch `docs/ipeleng-psira-position` (run this session, after adding 09 to the contract list). CI: secret-scan and document-contracts green on this branch's pushes (checked via `gh` this session). No credential value was viewed, entered, transcribed or recorded at any point; no predecessor repository was cloned, fetched or added as a remote (HANDOVER rule 1); Sibusiso's 13 Sep verification is cited from the repo record, not re-run.

Decision: none adopted — the record prepares Ipeleng's review and states its limits; the honesty ledger applies. The leaf stays open until she confirms the chat review; this is the same prepared-versus-done distinction P2.5 uses, applied to a teammate's acceptance criterion rather than a statutory step.

Needs/blockers: Ipeleng's live review of the four 13 Sep holder confirmations (closes 1.1; completes 1.4's 1.1 input); Khutso assembles the clean-intake gate evidence once 1.1–1.3 are confirmed; Lethabo to review PR #30.

Business handoff: not applicable — no household capability changed. Serves the G0 "Clean" gate (16 Sep): the credential story a judge or partner can check now has an independent-assurance record stating exactly what was verified by whom, by what method, and what remains open.

Next: Ipeleng — holder-confirmation review (closes 1.1), then `P2.6` Gated Access Areas Code review; Khutso — `1.4` gate evidence; Sibusiso — `P2.3` discard-by-default implementation test; Lethabo — review PR #30.

## 2026-09-16, time not recorded | Ipeleng (via Cline assistant, VS Code agent) | model identifier not independently recorded | P2.6 | authored, review pending

Changed: wrote `docs/GATED-ACCESS-CODE-REVIEW.md` — the P2.6 deliverable (serves C2, C3; advances G21) — and appended ADR-0032 to `docs/adr.md`. The paper's load-bearing finding comes before the analysis: the draft Code of Conduct for Gated Access Areas recorded by `docs/PLAN.md` §C3 / G21 / P2.6 (published 30 Apr 2026, comments closed 14 May) could **not** be corroborated on any source reachable this session — `inforegulator.org.za`'s site search returns zero results for "Gated Access Areas" and for "access control", its codes-of-conduct page lists no 2026 entries (nearest verified artefact: the **Residential Communities Council proposed code, received 08 Sep 2023**, the s61(1)(b) industry-body route for exactly our launch market), a web search for the exact title returns nothing, and the Government Gazette is unreachable — so every characterisation of the draft stays ⚑ and traces to recorded team research only. What was verified, verbatim from the Accessible Law copy (`popia.co.za`, ⚑): s60 (Regulator-issued codes; scope levers reaching specified classes of bodies — the mechanism by which owners **and** their technology service providers get captured; automated-decision measures cross-referencing s71), s61 (Gazette notice; the draft "may be obtained from the Regulator"; submissions window; decision ≤ 13 weeks — a draft binds nobody), s73(1)(c) (breach of an issued s60 code is "interference" — the enforcement hook), and s14's minimal-retention condition. The gap analysis grades the architecture against the recorded direction of travel: the T0 ring buffer and face-crops-never-written beat any retention bound; non-incident embeddings (30 days) and location traces (7 days) sit at/inside it; case-linked embeddings (case lifetime + 90 days) and 12-month sightings exceed it **if** the code's scope reaches detection/decision records rather than only gate capture — counsel Q2, kept as named reviewable parameters rather than silently trimmed; auto-overwrite is specified-not-running (G3/E8); minimisation is already aligned by ADR-0031; the FRT justification dossier is owed before any pilot face gate unblocks.

Decision: ADR-0032 — the recorded direction of travel is adopted as a **binding internal design floor** (≤30-day auto-overwrite for gate-domain data; discard-by-default stands; FRT dossier required; the final issued text supersedes via a fresh ADR, never a config change; the partner contract carries the floor). The ADR states why the floor stands under either outcome: every element is independently compelled (s14) or already accepted (ADR-0031, ADR-0002, the honesty ledger) — building to the stricter bound cannot put the architecture on the wrong side of the final rule; building to the looser status quo could. No compliance claim made; the honesty ledger applies.

Evidence: `node scripts/check-docs.mjs` passes on branch `docs/ipeleng-psira-position` (run this session before commit). Source access: `inforegulator.org.za` reachable with the zero-hit searches recorded above; its approved-codes register lists CBA (CO 2/22) and BASA (CO 3/22) only; `popia.co.za` reachable and quoted ⚑; its s71 page confirmed s71 is automated decision-making (the s60(2)(b)(ii) cross-reference), so the codes chapter is ss60–68 as quoted in the paper.

Needs/blockers: counsel Q1 — obtain the Gazette notice and draft text via the s61(2) route, or confirm the 30 Apr 2026 publication does not exist as recorded; until answered, no statement in the repo may assert the draft's contents as fact (the ⚑ convention governs). Lethabo's review, then both leads, on PR #30. G3's implementation (Sibusiso) must encode the 30-day bound as named parameters; P2.3's discard test unchanged.

Business handoff: not applicable — no household capability changed. Serves C3 (the rule for the named launch channel is now a written design floor) and C2 (the FRT-justification dossier requirement feeds the pilot G-gate story).

Next: Ipeleng — holder-confirmation review (closes 1.1), then `P2.7` RICA position. Sibusiso — `P2.3` discard-by-default implementation test, G3 retention bound. Lethabo — review PR #30. Leads — D-IO-1 designation and organisation identity for the IO submission.

## 2026-09-16, time not recorded | Ipeleng (via Cline assistant, VS Code agent) | model identifier not independently recorded | P2.7 | authored, review pending

Changed: wrote `docs/RICA-POSITION.md` — the P2.7 deliverable (serves C3). The finding comes first: RICA's full text was **not readable** this session — the official Act PDF (`justice.gov.za/legislation/acts/2002-070.pdf`) downloads (255 KB) with RICA's full title in its PDF metadata but arrives as a Flate-encoded binary unparseable in this environment (the same limitation the POPIA paper recorded for the gov.za Act PDF); `lawlibrary.org.za`, `polity.org.za` and the justice.gov.za acts index return HTTP 403; the gov.za page hosts the **Bill** (`b50b-010.pdf`), not the Act. So the paper contains **no verbatim statutory quotes** — every statutory characterisation is ⚑, secondary orientation (Wikipedia's RICA article, which itself carries an "original research" banner; its ShotSpotter/SoundThinking article) is named and not relied on, and five counsel questions are logged: Q1 whether transient in-memory gunshot-signature classification (3-second window, no persistence, no speech decoding) "intercepts" a "communication" at all; Q2 whether the appliance is "interception equipment" for the possession/exemption-certificate prohibition; Q3 confirmation that no telecommunication-service-provider / CRI duties attach; Q4 whether the 3 Feb 2021 Constitutional Court (*AmaBhungane*) bulk-provision invalidation bears on any VUKA position; Q5 text retrieval — the official PDF URL is recorded as the counsel-pack route. What carries the deliverable without the statute: the two bright lines are verified build facts — **audio never persists** (3-second ring buffer, no code path to disk — ASR-6, T0) and **never attach an audio clip as evidence** (the T2 evidence chain carries labels, decisions and hashes only); the ShotSpotter South-Africa deployments (Cape Town 2016, Lavender Hill 2022) and the "does not use microphones" wording stay recorded team research ⚑, not re-verified this session.

Evidence: `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` pass on branch `docs/ipeleng-psira-position` (run this session before commit). Source access: justice.gov.za PDF reachable-but-binary as recorded; lawlibrary.org.za, polity.org.za and the justice.gov.za acts index 403; gov.za hosts the Bill only; SAFLII not re-attempted (403 precedent from both prior sessions).

Decision: none adopted — **no ADR**: both bright lines are already accepted architecture (ASR-6, T0) or existing evidence-chain design, and an ADR restating ASR-6 would manufacture the appearance of a new decision where there is none; if counsel's Q1 answer forces a design change, that change gets the ADR. No compliance claim; the honesty ledger applies.

Needs/blockers: counsel Q1–Q5 (Q5 converts the paper's ⚑ marks into verified text for the counsel pack). Lethabo's review, then both leads, on PR #30. The never-attach-audio rule joins `docs/OPERATOR-DUTY.md`'s evidence guidance at the next operator-material touch (Lethabo/Sibusiso).

Business handoff: not applicable — no household capability changed. Serves C3: Ipeleng's legal stack (P2.1 PSiRA, P2.2 POPIA + ADR-0031, P2.5 IO path, P2.6 GACA review + ADR-0032, P2.7 RICA) is now fully authored; remaining work on every item is human review, counsel's answers, and her live 1.1 holder-confirmation review.

Next: Ipeleng — holder-confirmation review (closes 1.1), then `4.3` operator/tenant/duress abuse cases as executable tests. Sibusiso — `P2.3` discard-by-default implementation test, G3 retention bound. Lethabo — review PR #30. Leads — D-IO-1 designation and organisation identity for the IO submission. Judging criteria publish Fri 19 Sep (P1.9).
## 2026-09-16 | Ipeleng (via Cline assistant, VS Code agent) | Cline assistant / Claude Sonnet 4.5 | PR #30 review response | corrected, re-review requested

Changed: addressed all six blocking findings in Lethabo's 16 Sep changes-requested review of PR #30, plus the required housekeeping. (1) ADR-0031 and ADR-0032 in `docs/adr.md` moved from `Accepted` to `Proposed` — neither is binding until both leads accept it (numbering stays collision-safe with ADR-0033 in Sibusiso's PR #32, either merge order). (2) `docs/CHECKLIST.md` P2.2 returned from ☑ to ◐ — the documentation leaf is written, but review/merge and counsel verification Q1–Q5 remain open; P2.6 row swept to match the reframed ADR-0032. (3) `docs/OPEN-GAPS.md` G20's current-state pointer corrected from PR #28 to PR #30. (4) ADR-0032's retention framing corrected: the ≤30-day bound is now explicitly a **team-chosen conservative internal default, not an independently compelled legal bound** (the recorded draft is unverified and unavailable; s14 requires minimality but fixes no number); *gate-domain retained data* is defined (gate-adjacent footage, ID/biometric scans, incident-less embeddings, access-event records — not case-linked post-incident evidence); the longer §6.5 retention classes (case-linked embeddings case+90, 12-month sightings) are explicitly reconciled as named, reviewable parameters pending counsel Q2 — reduced to the floor or justified by fresh ADR if Q2 puts them in scope, standing unchanged if not. `docs/GATED-ACCESS-CODE-REVIEW.md` §5/§6/§8 and the CHECKLIST P2.6 row swept to match. (5) `docs/RICA-POSITION.md` no longer calls the bright lines "verified build facts": they are **specified architecture constraints** (ASR-6/T0/E3, recorded design — no audio-path code exists in the repository yet), with executable negative tests owed at the Task-4 audio-path port and checklist 4.3; §3 retitled, header and provenance swept, CHECKLIST P2.7 and `team/ipeleng.md` updated. (6) `docs/audit/04-production-readiness.md`'s stale "No application code exists here" replaced with a scoped statement: `brain/entity_resolution.py`, `brain/fusion.py` (unit-tested) and `server/src/auth/governance.py` (contract-tested) exist, nothing is deployed or operating, and the specified-controls status is unchanged. Housekeeping: the UTF-8 BOM and extra blank line were removed from `docs/BUILD-LOG.md`; final newlines added to `docs/POPIA-POSITION.md`, `docs/POPIA-IO-REGISTRATION.md`, `docs/GATED-ACCESS-CODE-REVIEW.md`, `docs/RICA-POSITION.md` and `docs/audit/09-credential-remediation-verification.md`. Prior `team/ipeleng.md` entries were corrected in place where they repeated the Accepted/build-facts framing; the dated entries above in this log record what each session wrote and are left as written. All primary-law statements remain ⚑ pending counsel verification; no compliance claim introduced.

Evidence: `node scripts/check-docs.mjs` exit 0 and `node scripts/check-intake.mjs` exit 0 on branch `docs/ipeleng-psira-position` (run after the sweep, before commit). Byte-level check: no BOM and exactly one final newline in every file changed by the response.

Decision: none — framing and status corrections only, per review; no workstream's substance changed.

Needs/blockers: Lethabo re-review of PR #30 (re-requested with the evidence block in the PR description); both leads' acceptance required before ADR-0031/0032 may be marked Accepted; counsel questions unchanged (POPIA Q1–Q5, gated-access Q1–Q4, RICA Q1–Q5); 1.1 holder-confirmation review still Ipeleng's.

Next: Lethabo — re-review PR #30. Leads — D-IO-1 designation and organisation identity for the P2.5 submission. Ipeleng — holder confirmations close 1.1.
