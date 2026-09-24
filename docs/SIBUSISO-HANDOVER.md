# Current local handoff

## Today's progress, 2026-09-23 — summary for whoever picks this up next

Started the day with PR #43 open (the VIGIL+ANCHOR pivot, ADR-0034–0038) and two AI
reviews outstanding. Ended it with: **all five ADRs formally accepted by Sibusiso**,
**every blocking finding from both reviews fixed and independently re-verified**
(not just reported), **the vectors/canonicalizer sub-task of contract v2 built,
tested and committed locally**, **Ipeleng's formal security review posted — APPROVE
WITH CONDITIONS**, and **contract v2's remaining scope (`contracts/openapi.yaml`)
now clear to start**. Seven PR commits landed today (`c81f2f53` → `370d466a` →
`11d57611` → `4ae5ebe0` → `3855a3d8` → `0c6d202e` → `7ddbf40`), each read and checked
against the actual diff before being trusted, not taken on the author's word. `main`
was fast-forwarded to `0cdd372c`. Babatunde and Lethabo also settled the economics
model today (anchoring cost capped at R569.47/month regardless of volume; break-even
rounds up; price under active actuarial rebuild, decision due Friday) — none of it
blocks contract v2. Cline ran out of credits partway through a second sub-task
(PIN-authority shapes) with zero progress made — handed to Luna Low, clean start.

**Where it stands now:** `RULES.md`'s security/contract review gate is **cleared** —
Ipeleng posted a formal `APPROVED` review, scoped explicitly to exclude §12 (the
contract itself, which is Sibusiso's own domain as contract owner, already reviewed
and approved by him). Her 3 blockers (guardian-notification wording, two honesty-ledger
lines) don't touch any wire-format field or endpoint shape, so starting
`contracts/openapi.yaml` now won't need rework once they land. One paperwork loose
end: `docs/ADR-ACCEPTANCE-RECORD.md` still shows her review as "Pending" until Lethabo
appends the conditions there — technical gate is clear regardless. See the FACT log
below for the full trail with commit SHAs, timestamps and what was independently
checked at each step.

---

FACT: Codex reviewed PR #43 at c81f2f53312035c331a2f347590d21f873293294 and posted 18 findings (7 blockers, 10 should-fix, 1 nit). Claude independently reviewed the same pinned head — REQUEST CHANGES (2 high, 3 medium, 3 low, 4 nits), tasks/pr-43/reviews/c81f2f533120-0cdd372c/review.md — then independently confirmed 17/18 Codex findings (S10 confirmed in substance, citation corrected).
FACT: Lethabo's amendment (370d466a, 16:02:52Z) answered every B1–B7/S1–S10/N1 finding. Claude re-reviewed it fresh — tasks/pr-43/reviews/370d466a-c81f2f53/review.md: B2/B3/B4/B6/B7 confirmed genuinely fixed; B5 honestly partial (pending P3.L8); B1 only partially fixed at that point (actor_id still unbound).
FACT: Two further commits (11d57611 onboarding docs, 4ae5ebe0 archived the four-layer lineage to archive/2026-09-four-layer/ and closed G29 — organisers confirmed pre-event building on 23 Sep) touched nothing in the spec, ADRs, RULES.md or contracts. A third small commit (3855a3d8) added a "leads step in on at-risk work" rule to RULES.md — also unrelated to B1/B5.

**DECISION MADE — 2026-09-23, 16:56 UTC.** Sibusiso read both reviews and every amendment himself, then formally accepted ADR-0034, 0035, 0036, 0037, 0038 as a posted, APPROVED GitHub PR review (https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43, posted as Sibusiso-K at PR head 3855a3d8), with two explicit conditions: (a) ADR-0036 accepted, but its PIN-verification mechanism (B5) is a pre-condition for **implementing** §9, not for the acceptance itself, tracked as P3.L8; (b) `actor_id` must be bound into the signed statement (B1) before contract v2's schemas/vectors are written — not before merge.

FACT: Lethabo answered both conditions in the next commit (0c6d202e, 17:43:04Z). Claude independently re-verified against the actual diff, not the claim: **`actor_id` is now genuinely inside the signed statement** (`docs/VUKA-2-SPEC.md` §4 — confirmed by reading the diff directly). A new `docs/ADR-ACCEPTANCE-RECORD.md` (append-only) now records Sibusiso's acceptance per ADR with its exact conditions, matching what was actually agreed — no overclaiming found. All five ADRs in `docs/adr.md` now read `Status: Accepted (2026-09-23) by Sibusiso as second lead`.
FACT: Babatunde also reviewed and accepted the pivot (comment, 17:38:59Z) — agreed S5/S6/the rounding fix; flagged the anchoring-cost model as needing reconciliation before he calls `docs/ECONOMICS-VIGIL-ANCHOR.md` frozen (his own item, not a contract-v2 blocker). Lethabo's reply (17:43:04Z) showed the coalescing cap already answers it (R569.47/month ceiling regardless of volume) — Babatunde's acceptance of the economics doc specifically is still pending his own read of that reply.

**DONE — vectors/canonicalizer sub-task, 2026-09-23 ~20:22 SAST.** Sibusiso authorized this specific slice; the branch move that I couldn't do myself (blocked by this session's permission classifier) was done by Sibusiso directly (`git reset --hard` to `0c6d202e`), then Cline implemented it. Claude independently re-verified before accepting the report — not just read Cline's summary:
- Read `anchor/canonical.py` and `anchor/merkle.py` line by line against the exact §5/§6 text quoted in `01-task.md`. Correct on every rule.
- Ran `pytest anchor/tests/` independently: **70/70 pass**, not reused from Cline's own log.
- `git status --short` after: exactly the 4 allowed files, nothing outside scope (no `contracts/openapi.yaml`, no `shared/`, `anchor/chain.py` v1 untouched).
- `node scripts/check-docs.mjs` and `git diff --check` both pass.
- Commit `a3c09bb` confirmed on `feat/sibusiso-contract-v2` (based on `0c6d202e`), file list matches exactly, `git branch -vv` confirms **no upstream configured — not pushed anywhere**.

FACT: Babatunde (18:30:46Z) and Lethabo consolidated every economics question from both reviews today — anchoring cost capped at R569.47/month regardless of check-in volume (coalescing, not a reconciliation Khutso needs to do); break-even uses `math.ceil`; the historical predecessor-relay 318 ms (n = 10) figure and R1.09bn formally retired from the pitch; price (R20/R50/R100) still being modelled against the actuary test, decision due Friday. Babatunde's own words: "Not blocking merge on my end. Ipeleng's security review is the remaining requirement." Independent confirmation of what this file already tracked.

FACT: Claude pinged Ipeleng directly on the PR thread at Sibusiso's explicit request (18:30:50Z): https://github.com/LethaboMH14/V.U.KA--Geekulcha/pull/43#issuecomment-5800599434 — summarized status for her (ADRs accepted, B1 fixed, vectors sub-task done locally), named `RULES.md`'s requirement, stated no urgency.

FACT: Claude fixed a real but minor `git diff --check` finding (trailing blank line at EOF, introduced by the archival commit, in 9 files under `archive/2026-09-four-layer/`) and pushed it directly to `docs/vigil-anchor-pivot` (`7ddbf40`, 20:59 SAST) — trivial, content-free, no design decision, done openly per `RULES.md`'s "leads step in" rule. `git diff --check` against the original base is now clean end to end. Confirmed Cline made zero progress on the PIN-authority sub-task (no new files, clean tree at `a3c09bb`) before running out of credits — nothing to reconcile, the packet (`01-task.md`, "Sub-task 2") hands to Luna Low unchanged.

FACT: Claude posted a substantive reply to Babatunde's pricing-model rebuild (18:49:46Z) as Sibusiso (issuecomment-5801132862): confirmed the deployability requirement he raised is already satisfied by the accepted design (public mirror-node verification, no VUKA service needed) but not yet built; caught a real claim-tagging error — his `docs/MARKET-DATA.md` table labels "R5.72/member operational cost" as `FACT` when the script itself tags all three inputs behind it `ESTIMATE`.

**Ipeleng's formal review posted — 2026-09-23, 19:10:48Z. Verdict: APPROVE WITH CONDITIONS.** Re-verified by her against every branch move today, including the whitespace fix. Claude independently checked her strongest finding (B1, a multi-session guardian-takeover gap: an attacker forcing a normal-PIN add of himself on day 1 becomes "the replacement" that unlocks removing the real guardian on day 2) directly against the spec/ADR text — confirmed real and previously unflagged, building on the exact question Sibusiso's own earlier review left open.
- 3 blockers, due before Thursday's §8/§9 meeting closes, none touching a wire-format field: B1 (guardian-notification wording), B2 (server-trust honesty-ledger line), B3 (unlocked-phone honesty-ledger line).
- 4 should-fix, owners named: **S1 is Sibusiso's** (`bank_signal_sent` provenance, with contract v2), S2 Vukosi/Mutarisi, S3 Ipeleng, S4 Lethabo.
- Her scope explicitly excludes §12 (the contract) — named as Sibusiso's own domain.
- `docs/ADR-ACCEPTANCE-RECORD.md` still shows her review as "Pending" until Lethabo appends the conditions there — paperwork, not a technical gate.

**RULES.md's security/contract review requirement is now satisfied.** Contract v2's
remaining scope — `contracts/openapi.yaml`, `contracts/keys/`, `test/openapi-contract.test.mjs`
— is clear to start. Nothing in Ipeleng's 3 blockers changes a schema shape, so starting
now won't need rework once they land.

**PR #43 MERGED — 2026-09-23, 19:24:39Z, by Lethabo (`8c621dfc`).** Three commits landed right before merge that Claude verified directly rather than trusting the messages: a real ordering-bug fix in §7 (event_id idempotency lookup now runs before the nonce check, so a lost-response retry gets its receipt instead of being wrongly rejected), a consolidated "duress signal" definition closing a self-consistency gap, and a real security fix nobody had flagged yet (the member's phone was going to show "guardian acknowledged" during an open incident — an information leak to a coercer holding the phone; now suppressed until the incident closes). `main` is live at the pivot from this point on.

**Reviewed 4 more PRs opened around the merge (#44 Sibusiso, #45 Ipeleng, #46 Babatunde/Lethabo pricing, #47 Khutso evidence audit) plus re-checked #39 (legacy anchor code, now CONFLICTING against main).** Findings posted as PR comments on all five (Sibusiso-K account): #44/#45/#46 clean; #47's evidence audit is careful primary-source work but surfaced a real live conflict — `SECURITY.md` says the intake/remediation gate is "blocked," `docs/security/intake-gate.json` says `"status": "approved"` with both leads' names and a 2026-09-13 date already on it. Ipeleng tagged directly to confirm the 9-13 remediation still holds before the wording gets fixed — **not yet resolved, still open**. #39 flagged for a decision with Lethabo: rebase, or close it now that the vectors sub-task supersedes its v1 canonicalizer.

**Closed the ADR-ACCEPTANCE-RECORD.md "Pending" line — 2026-09-23, 21:0x SAST, pushed directly to `main` (`847225e`).** Sibusiso did this himself rather than waiting on Lethabo — append-only, original line untouched, added a closure table with Ipeleng's B1–B3 (owner Lethabo, due Thursday) and S1–S4 (S1 Sibusiso's, with contract v2). Told Lethabo on the PR thread.

**P3.A2 Hedera spike — DONE, 2026-09-23 ~22:50 SAST, written up and pushed to `main` (`de876dd`).** Sibusiso created a real testnet account via the portal (credentials handled via clipboard → local untracked file → deleted after use, never in chat). Claude ran the actual spike: installed `hiero-sdk-python`, hit and fixed a real protobuf gencode/runtime version conflict, created a topic with a `submitKey` (`0.0.10687280`), submitted a message, read it back byte-identical from the public mirror node. **Runtime decision: `hiero-sdk-python`, no Node sidecar needed.** Recorded the SDK's actual method names (differ from the spec's implied API) for whoever writes `anchor/publish.py`. Note: Codex was separately attempting the same spike in its own environment and hit a connection reset reaching the mirror node — its build-log entry records that failed attempt; Claude's succeeded and is the one written up.

**Sub-task 2 (PIN-authority shape + guardian governance) — DONE, committed locally (`0996717`), NOT pushed.** Independently re-verified: `anchor/pin_authority.py` and `anchor/guardian_governance.py` match the scoped §9 shapes exactly, 96/96 tests pass (re-run directly, not from a log), file scope exactly matches the two modules plus their tests, no PIN verification or signing code present. Appears to have been done by Codex, not Luna Low, per its own build-log entry — the code is correct regardless of which tool wrote it.

**Sub-task 3 (`contracts/openapi.yaml` v2) — DONE, committed locally (`f9d57f6`), NOT pushed.** Independently re-verified: 17/17 new contract tests pass (re-run directly), all v1 paths/schemas preserved with `deprecated: true` markers (8 of them) on the UMOJA surface, `BankSignal.triggering_outcome` present with the exact three-value enum — **this is Ipeleng's S1 requirement, done**. `contracts/keys/README.md` documents the key-manifest format without any key material. `node scripts/check-docs.mjs` and `git diff --check` both clean.

**Branch state:** `feat/sibusiso-contract-v2` is 3 commits ahead of `origin` (`a3c09bb`, `0996717`, `f9d57f6`) — only Sub-task 1 is on GitHub; Sub-tasks 2 and 3 are local-only, correctly not pushed per every task packet's instruction. Confirmed directly via `gh api .../branches/feat/sibusiso-contract-v2`.

Cline: ran out of credits early with zero progress on Sub-task 2; Codex and/or Luna Low
picked it up and finished both remaining sub-tasks. Not currently active on anything.
Claude: all three contract-v2 sub-tasks independently re-verified against the actual
repo state, not trusted from any tool's self-report. Nothing currently in flight.
Codex: attempted Sub-task 2 and the Hedera spike in parallel with Claude — Sub-task 2's
code is correct and already verified; the spike attempt failed in its environment
(mirror-node connection reset) where Claude's succeeded. No action needed from Codex
right now unless a fresh PR revision needs checking.
Sibusiso: contract v2's schema work (Sub-tasks 1–3) is **fully done, locally, unpushed**.
Real remaining items: (1) push `feat/sibusiso-contract-v2` when ready to open that PR —
not yet authorized/done; (2) chase Ipeleng on the SECURITY.md/intake-gate.json conflict
(#47); (3) decide with Lethabo what happens to PR #39; (4) P3.A3–P3.A6 and P3.Q1 (the
actual ANCHOR server, deployment, export/proof, root signing) are all still ☐ on
`docs/CHECKLIST.md` at `main` — none started yet, all still ahead.

The existing work/VUKA main checkout was fast-forwarded to 0cdd372c earlier; `main` has
since moved to `de876dd` (2026-09-23, ~22:50 SAST) with PR #43 merged in between.
New task worktrees use resolved remote refs; refresh before trusting any cached diff.

---

## 2026-09-24 progress

**PR #51 opened — `feat/sibusiso-contract-v2` pushed to GitHub, all three contract-v2 sub-tasks now on the remote.** Pushed the branch Sibusiso had been holding locally (vectors/canonicalizer, PIN-authority/guardian governance, `contracts/openapi.yaml` v2) and opened the PR.

**PR #39 — precise breakdown posted to Lethabo, not a blind "close it."** Checked file-by-file rather than accepting the framing that Sub-task 1 supersedes it outright: only `anchor/chain.py` (91 lines) is actually superseded by the new canonicaliser. `anchor/verify.py`, `anchor/subject.py`, and `server/src/api/subjects.py` (~214 lines combined) are untouched by any contract-v2 sub-task. Decision on rebase vs. close still pending from Lethabo.

**P3.A4 — Azure infrastructure provisioned end-to-end for the ANCHOR server deploy target.** Claude in Chrome for Azure for Students signup (Wits SSO); Azure CLI installed via `pip install azure-cli` after the MSI installer failed repeatedly (root cause: this session's Administrators token is deny-only, a sandbox restriction, not fixable). `az login` (standard browser flow, not device-code — Wits' Conditional Access Policy blocks device-code) authenticated against subscription `Azure for Students` (`c75ad031-7423-4c2f-b913-8594694c7c98`). South Africa North is blocked by a subscription-level `sys.regionrestriction` policy (confirmed via `az policy assignment list` — only italynorth, uaenorth, indiasouthcentral, spaincentral, austriaeast are allowed); used **UAE North** on Sibusiso's go-ahead. Provisioned: resource group `vuka-anchor-rg`, App Service `vuka-anchor-server` (Python 3.13, Always-On, HTTPS-only, confirmed `Running`), PostgreSQL Flexible Server `vuka-anchor-db` (public access enabled, firewall rule `AllowAzureServices` for `0.0.0.0`–`0.0.0.0`). `DATABASE_URL` wired into the Web App's Application Settings (never written to a file). Password shown once to Sibusiso on request (locally generated, his own resource) and not otherwise logged.

**P3.A3 slice 1 — DONE, independently re-verified, folded into PR #51.** Scoped narrowly given P3.A3's real size: FastAPI skeleton (`server/main.py`), PostgreSQL persistence (`server/db.py`, `chain_entries` table, `UNIQUE(subject_id, chain_index)`), `POST /v1/events` and `GET /v1/subjects/{id}/export` only. Auth is an explicit `verify_request()` stub (`# TODO slice 2`), not real authentication — escalation, Hedera anchoring, `/healthz`, `/ws/panel`, guardian/PIN endpoints all explicitly deferred to slices 2/3, not built. Reported done by Codex; independently verified directly, not trusted from the summary: ran `pytest server/tests/` myself — 8/8 pass, including idempotent-retry, changed-content-409, concurrent-append lock, and an explicit auth-stub test. Grepped the code directly: `FOR UPDATE` row lock confirmed at `server/db.py:49`; `verify_request()`'s docstring honestly states it "always allows access... does not verify signatures, credentials." Committed `f6ed648`.

**PR #51 merge conflict — resolved.** Pushing the slice-1 commit onto `feat/sibusiso-contract-v2` flipped PR #51 to `CONFLICTING` because 21 files had landed on `main` in parallel (Lethabo/Babatunde/Ipeleng: `SECURITY.md`, new security docs, a second edit to `team/sibusiso.md`, `docs/ADR-ACCEPTANCE-RECORD.md`, pricing docs). Used `git merge-tree --write-tree origin/main HEAD` to confirm exactly one real conflict, in `team/sibusiso.md` — both sides had only edited the "Current task" status line at different times; not a real contradiction. Merged `origin/main` into the branch, combined both "Current task" lines (kept the ADR-acceptance/contract-v2 history and made P3.A3 slice-1 the current line), kept all of Lethabo's non-conflicting additions ("My AI workflow," "Review authority," the UMOJA-archive-path fix, the §10 key-manifest wording fix) verbatim. Re-ran the full check suite post-merge before pushing: **21/21 `node --test`, 8/8 `pytest server/tests/`, `check-docs.mjs` clean, `git diff --check` clean.** Merge commit `b07f118` pushed to `feat/sibusiso-contract-v2`; PR #51 confirmed back to `MERGEABLE` (21 files, head `b07f118`).

**Handover doc pushed to `docs/SIBUSISO-HANDOVER.md` on `main` (`cef4def`) — and immediately broke CI.** `check-docs.mjs`'s `document-contracts` gate failed on a retired "318ms" latency figure with no sample size — I hadn't run the check against this specific file before pushing directly to `main`, my mistake. Khutso (via Codex) caught it and opened PR #59 with the correct one-line fix (labels it historical predecessor-relay data, n=10, matching `docs/MASTER-CONTEXT.md`). Approved #59.

**Full PR triage run, 2026-09-24 — 6 PRs reviewed and approved as Sibusiso-K:**
- **#47** (Khutso, P3.K1 evidence) — all findings from two rounds of `CHANGES_REQUESTED` genuinely fixed across several follow-up commits (actor_id binding was already in; this covers SABRIC/UK-APP flagging, FIPS-204 date distinction, audit-authorship wording, smartphone-duty valuation basis, and the crime-displacement paper's exact Table 1 counts). Its CI `document-contracts` shows `fail` — inherited from the `main` breakage above, not a PR47 defect; clears once #59 merges. **Approved.**
- **#54** (Khutso, SAPS FY24/25+FY25/26 totals, P3.K2) — arithmetic verified (346,182+361,560+385,936+358,360=1,452,038), sources properly scoped, my earlier file-count nit fixed. **Approved.**
- **#56** (Ipeleng, PIN-authority-rules doc / ADR-0040 draft, P3.L8) — restates §8/§9/ADR-0036 without changing the frozen contract; 8 real open items correctly deferred to Thursday's Lethabo checkpoint rather than asserted as decided. **Approved.**
- **#58** (Ipeleng, `shared/canonical.js`+`der.js`+`merkle.js`, P3.S2) — the required JS-side twin of my Python `anchor/canonical.py`/`merkle.py`; she cross-checked it directly against real Python output (10/10 canonical cases, 8/8 Merkle roots byte-identical). T01/T02 vectors it's waiting on already exist on PR #51 (`contracts/vectors/canonical.json`+`merkle.json`) — pinged her on the PR that they'll unskip once #51 merges. **Approved.**
- **#59** (CI fix) and **#60** (Khutso's P3 criterion-coverage sweep) — both small, honest, no overclaiming. **Approved.**

**Merged 2026-09-24: #47, #54, #56, #58, #60.** #59 closed as superseded — `main` already carried its fix directly (`b8b40a6`, pushed before #59 could land).

**P3.A1 — DONE.** Contract v2 + canonical/Merkle vectors were already on `feat/sibusiso-contract-v2`; the one gap (pinned mock server, named in `docs/VUKA-2-SPEC.md`'s Thu-24 handoff row) is now closed. Verified live: `npx @stoplight/prism-cli@5.16.0 mock contracts/openapi.yaml` mocks every v2 path including deprecated v1 UMOJA routes, `/healthz` returns 200. Added `scripts/mock-server.sh` (`npm run mock`) and `contracts/README.md`, pushed to PR #51 (`8d447b5`), CI green. Not ticked on `docs/CHECKLIST.md` yet — still gated on both-leads review of #51 per team discipline, not merged.

**P3.S20 / T30 — accepted, posted to Lethabo for the Thursday-noon checkpoint.** The only drafted option (PR #56, PIN-AUTHORITY-RULES.md §8 item 5): export requires a fresh PIN authorisation for action `export`; during an open incident or under a duress authorisation, export ends at the last head before the incident — a chain prefix still verifies, keeping the no-op convincing. Posted acceptance on PR #56's thread; awaiting Lethabo's agreement at the checkpoint before it's final.

**Five Codex task packets written, 2026-09-24 — implementation work, not decisions:**
- `sibusiso-workflow/tasks/anchor-server-slice2/01-task.md` — P3.A3 slice 2: real signed-request auth (Ed25519, §7), journey-to-subject binding. Most time-critical — blocks P3.A6's 09:00 deadline.
- `sibusiso-workflow/tasks/azure-deploy/01-task.md` — P3.A6: actually deploy server-min to the already-provisioned App Service (infra from P3.A4 is ready; nothing deployed yet). Equally time-critical.
- `sibusiso-workflow/tasks/anchor-server-slice3/01-task.md` — P3.A3 slice 3: durable escalation/outbox (§8) + Hedera anchoring (§10), using the proven SDK method names from the P3.A2 spike.
- `sibusiso-workflow/tasks/export-proof/01-task.md` — P3.A5: export + public proof, gated on the T30 decision above.
- `sibusiso-workflow/tasks/ci-security-gates/01-task.md` — P3.S14/S17: `.github/workflows/checks.yml` currently only runs secret-scan + document-contracts (confirmed by direct read) — adds scoped `node --test`/pytest/vitest, semgrep, SCA (npm audit, pip-audit, osv-scanner) with a documented waiver path.

Not posted to GitHub — matching every earlier task packet this session (vectors, PIN-authority, anchor-server slice 1), Codex picks these up directly from the local files, no GitHub noise needed. Handing off to Codex itself is Sibusiso's own step; this session has no tool to message Codex directly (checked via `ListAgents`, no such peer).

**#47, #54, #56, #58, #60 — approved then merged at Sibusiso's explicit request.** #59 closed as superseded (see above).

**P3.S14/S17 — DONE, PR #62.** Codex implemented all five task packets' most self-contained item first: `.github/workflows/checks.yml` gained `tests` (root `node --test` scoped correctly to `test/**/*.test.mjs`, `shared/`'s own `npm test`, pytest when Python tests exist), `npm-audit`, `python-audit`, `semgrep` (pinned 1.177.0, `p/security-audit`, documented choice), `osv-scan` (digest-pinned v2.6.0). All 7 checks green on both push and PR triggers — verified directly against the diff, not the summary: action/tool pins justified, the `node --test` scoping avoids the exact bare-recursive mistake that would've picked up `shared/`'s vitest files, negative-test claim (disposable `lodash@4.17.20` fixture, `npm audit` exit 1) consistent with build-log evidence. `docs/security/SCA-WAIVERS.md` added, correctly records the other four packets as blocked with real technical reasons. Couldn't formally approve (GitHub blocks self-approval — PR opened under Sibusiso-K); left a verification comment instead, tagged Ipeleng (CI/security co-owner per `docs/OVERLAPS.md`) and Lethabo.

**Real blocker found, not a Codex failure: no device-key registry is defined.** Codex correctly refused to guess one when scoping P3.A3 slice 2 — flagged in `SCA-WAIVERS.md` that `contracts/keys/README.md` only covers the server's own key manifest, not device/guardian enrollment, and slice 1's auth stub can't safely be replaced without it. Confirmed directly against `docs/VUKA-2-SPEC.md`: §4 requires a registered key per `signer_key_id` (line 139-140) and a `signer_pubkey` on registration (line 141) but never specifies where that's persisted or how the active key is resolved at verification time. This was blocking slice 2, slice 3, P3.A6 deploy and P3.A5 — everything downstream of slice 1.

**§4a drafted and posted — PR #64, then merged by Lethabo.** `PROPOSED`: a `signer_keys` table (subject_id, signer_key_id, role, public_key, revoked_at), reuses §4's existing SPKI/base64 encoding (no new format), enrollment via registration/guardian-accept/recovery (all already named in §4/§9), journey-to-subject ownership checked before auth succeeds, deliberately no "most-recent-wins" key resolution.

**PR #64 and #62 — both merged by Lethabo, 2026-09-24 ~11:23.**
- **#64:** her review confirmed §4a "fills a real gap... adds no new encoding," flagged one nit — the addendum cited §4 by line number, which drifts as the doc changes. Fixed: now cites by bullet name ("the signed-statement bullet", "the Registration entries bullet") instead. She also named the real remaining gate: **§4a doesn't count as accepted until Ipeleng reviews it**, since it governs §7 request authentication. Pinged Ipeleng directly on PR #51 with the full summary.
- **#62:** her review confirmed all 7 gates pass and the waiver record is "narrow and time-bound, the right shape." **This closes P3.S14 and P3.S17.**
- Both merges landed on `main` while PR #51 was open, which re-broke it via the same `team/sibusiso.md` "Current task" conflict as before (git history: `main` keeps touching that one line in parallel with contract-v2 branch work). Resolved the same way — merged `main` in, fixed the citation nit in the same pass, re-verified (104 pytest, 20 node --test), pushed (`5d9fe27`). PR #51 confirmed `MERGEABLE` again.

**Four more PRs reviewed and approved as Sibusiso-K, 2026-09-24:**
- **#63** (Khutso's requirements trace) — my earlier `CHANGES_REQUESTED` (V1/V4/G5 test-mapping errors) fixed, and the correction went further: expanded the honest test-gap count from 11 to 17 rows with clause-level justification (e.g. T17 checks permission refusal, not explicit arming). Approved.
- **#57** (ADR-0039) — my scalar-type finding fixed exactly: "All values are integers" corrected to "every numeric field is an integer... the other fields are strings." Verified directly against the PR's copy of the spec. Approved.
- **#66** (Lethabo's UI prototype, `prototype/`, 8795 lines) — new. Spot-checked the two safety-critical claims in the PR description against actual code rather than trusting the description: duress parity holds (`JourneyCheck`'s `handleComplete` is unconditional, `PinKeypad` has zero normal/duress branching); color rule holds (grepped all member-facing files, zero real red hits, amber confined to `GuardianView.tsx` and its documentation swatch). CI green, scope isolated to `prototype/`. Approved.
- **#65** (Babatunde's economics v2) — checked for movement since my `CHANGES_REQUESTED` (unsupported R5,090 base-cost attribution). No new commit — still waiting on him, nothing more to do.

**Still open / unblocked-for-Sibusiso:**
- **Ipeleng's §4a security review** — pinged on PR #51. This is now the single blocker on P3.A3 slice 2 and everything downstream (slice 3 → P3.A6 → P3.A5 → P3.L4).
**PR #51 CI fixed end to end, 2026-09-24 ~14:12 — 14/14 checks green for the first time.** PR #62's new `tests` job caught three real, previously-latent problems the moment T01/T02 stopped being skipped and Python tests actually ran:
- `shared/test/vectors.test.js`'s shape sketch didn't match the real `contracts/vectors/*.json` (golden/rejections vs. positive/rejection) — reconciled per the file's own documented escape hatch, plus fixed a latent UTF-16-vs-UTF-8 bug in `canonicalHexOf` that was never exercised before.
- `server/` had no `requirements.txt` — CI installed `pytest` but never the app's own deps.
- The obvious pin (`fastapi==0.115.6`) pulled in `starlette==0.41.3` with 14 CVEs; the fix (`starlette==1.3.1`) broke `TestClient` (needs `httpx2`, not `httpx`) and `osv-scan` caught two more transitive CVEs (`anyio` 9.3 critical, `idna`). Final pinned set verified clean via real `pip-audit` runs, real imports, and `server/tests/` 8/8 — not just guessed.

**PR #39 closed, 2026-09-24.** Lethabo's direction: rebase, drop `anchor/chain.py` (superseded by contract v2's `canonical.py`/`merkle.py`), keep `verify.py`/`subject.py`/`server/src/api/subjects.py` as a starting point. Read all three — they're built on the dropped v1 `EvidenceEntry` dataclass, so cherry-picking them as-is would need an immediate rewrite. Instead folded the reusable logic (verify.py's first-broken-index walk algorithm, subject.py's SC.1 showcase shape and its `sim_`/`not_submitted` honesty discipline) directly into the `export-proof` task packet, explicitly excluded the placeholder auth and Musa fixture (superseded by §4a and a VIGIL fixture). Closed with the explanation on the PR thread.

**PR #67 opened — Lethabo's P3.L8 checkpoint decisions, covering Ipeleng's security lane while she's away.** Resolves all 8 open items in `docs/PIN-AUTHORITY-RULES.md` §8, including T30/export (more precise than the version I posted as "accepted" earlier — adds a 6h post-incident hold on top of the open-incident hold), G33 (member-ended closure requires all-normal check-ins + no guardian alert + no duress), G34 (fallback `no_answer` deadline), G35 (PIN-gated journey end), T47 (wrong-PIN handling). Verified the actual spec diff line-by-line against the summary table — internally consistent, all 14 CI checks green, honestly adds a new residual risk to §17 rather than hiding it (a coercer who learns the real PIN can end a false alarm; the duress PIN is the defense). **ADR-0041 amends the already-accepted ADR-0036 (how an incident closes) — needs Sibusiso's explicit acceptance as second lead before it binds.** Not accepted yet; this is a decision, not something to wave through.

**PR #67 (ADR-0041) — accepted and merged, 2026-09-24 ~12:26.** Reviewed the actual spec diff line-by-line against the decision table (not just the summary): G33's three-part member-ended-closure gate, G34's fallback deadline, G35's PIN-gated journey end, and — the real refinement on what I'd informally accepted on PR #56 — T30's pre-incident hold now extends 6h past the last PIN entry, not just "while open." Internally consistent, 14/14 CI green, honestly adds a new residual risk to §17 (a coercer who learns the real PIN can end a false alarm) rather than hiding it. Posted a formal APPROVE as second lead, no conditions. Lethabo merged immediately after (`2394284`). This closes P3.S20 and the last three open PIN-authority gaps. Didn't reconflict PR #51 — #67 never touched `team/sibusiso.md`.

**Still blocked: Ipeleng's §4a security review.** Checked directly — no comments, reviews or activity from her anywhere on the repo since the ping this morning. PR #67's own description states Lethabo is "covering the security lane while Ipeleng is away," which may explain the silence and means waiting on Ipeleng specifically could stall indefinitely. **Asked Lethabo directly on PR #51 to cover this review too, the same way she covered P3.L8** — named it as the single blocker on P3.A3 slice 2 → slice 3 → P3.A6 → P3.A5 → P3.L4. Posted, awaiting her response.

**Still open / unblocked-for-Sibusiso:**
- **§4a security review** — now asked of Lethabo directly (above), not just Ipeleng. This is the one thing blocking every remaining Sep-25 ANCHOR-server task.
- Ipeleng's SECURITY.md/intake-gate.json conflict (#47's original finding) — posted, awaiting her confirmation, not yet resolved.
- PR #65 (Babatunde) — `CHANGES_REQUESTED` stands, no fix pushed.
- PR #51 — CI fully green (14/14); still needs Lethabo's actual approval (not just her comment) per `RULES.md`'s both-leads rule. Merging it also unblocks Ipeleng's #58 vectors (T01/T02 currently skip until #51 lands).
- P3.L4 (thin end-to-end slice, joint with Lethabo/Vukosi/Ipeleng) — not packetized; genuinely blocked on P3.A3/A6 landing first.
