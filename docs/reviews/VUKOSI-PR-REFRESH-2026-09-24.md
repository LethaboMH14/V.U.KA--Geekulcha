# PR refresh and review, 24 Sep 2026 (early)

**Reviewer:** Claude Code assistant (`claude-sonnet-5`) at Vukosi's request. AI review only: **no GitHub comment, review or approval was posted** (`gh` is not logged in). Sources: `git fetch origin`, `git ls-remote origin 'refs/pull/*'` and the commits. **NOT RUN / not visible:** GitHub review threads, comments, CI and mergeability for every PR. Continues [the 23 Sep refresh](VUKOSI-PR-REFRESH-2026-09-23.md).

## What moved

`origin/main` is now `bc698dc` (was `41a8877`). Merged since: #44 (Sibusiso tool workflow), #46 (pricing), #48 (PR #43 review follow-ups), #49 (Ipeleng SSDLC), #50 (coercion catalogue), #53 (market data). Open and new: #51 contract v2 (head still `f9d57f6`, unchanged), #54 (Khutso K2 replacement), #55 (Ipeleng primary-source quotes), **#56 (P3.L8 PIN-authority rules, head `c0a8ff3`)**, **#57 (ADR-0039, head `d407e5d`)**. My branch merges onto `main` with no conflicts (`git merge-tree`), but that is a dry run, not a rebase.

## My earlier findings against `main` (`bc698dc`)

| Finding | Now |
|---|---|
| R1 lost-response retry | Fixed (spec §7 order of checks) |
| R1 widened: offline-queued event over 120 s | **Still open.** Skew exemption (spec line 199) still covers only `checkin_opened`, `checkin_result`, `pin_authorised` |
| R2 call button on a normal PIN | **Fixed.** `team/mutarisi.md:67` now says calling unlocks only after `stand_down` or incident closure (spec G4) |
| R3 reboot re-arm trigger | **Still open.** V10 unchanged |
| R4 `shared/` 12:00 vs 14:00 | Not re-checked |
| C5, C6, C7 (contract v2) | **Still open.** #51 has no new commits |
| Ipeleng B1 (guardian notifications) | Written into the spec (§9, T24, §17) |

## New findings

### C8: P2: #51 contradicts the merged spec on `expires_at`
`main` (from #48) says the device signs `{action, target_id, mode, nonce}` and **never** `expires_at`, because the device cannot know server receipt time; the server records `expires_at = received_at + 120 s`. #51's `PinAuthorisation` still lists `expires_at` as a **required** device-supplied field. The spec marks it "Sibusiso confirms in contract v2". **Required:** drop `expires_at` from the request schema. Owner: Sibusiso.

### C9: P2: #56 restates superseded text as the "one written surface"
`docs/PIN-AUTHORITY-RULES.md` at #56 head says an incident opens on `duress_pin` (line 53) and restates S1 and the clock-skew rule using `duress_pin` as an event kind. `main` removed that kind: a *duress signal* is a `checkin_result` with `result: duress_pin`, or a `pin_authorised` with `mode: duress` (spec §3). #56 branched from `cbbd40c`, before the fix, so its copy of `team/mutarisi.md:67` and the rules page both carry the old wording (its Mutarisi line still says "or a normal PIN"). **Impact:** if #56 merges as-is, two documents disagree about the same rule, and R2 could be reintroduced. **Required:** rebase #56 onto `main` and regenerate the rules page from the current spec. Owner: Ipeleng. Reviewer: Lethabo.

### Note on #57 (ADR-0039, Proposed, binds on acceptance by Sibusiso and Ipeleng)
It widens Vukosi's scope **if accepted**:
- Gun-like classes 421, 422, 423 mapped by label, plus an argmax rule with ties to the lowest index (T25). **P2a's `DETECTOR_LABELS` has six labels** and would need three more. Do not change it until the ADR is accepted.
- A stretch accelerometer detector (`impact`, `shake`, `snatch`), corroboration only, never opens a check-in (T26, T29: 30 min screen-off on a budget phone, M8).
- Device fields (app version, model hash, API level, device model) and versioned payloads (`pv`, per-kind schemas in `contracts/payloads/`).
- `signal_detected` payload gains `class_label`, `class_index`, `score_bp`, `threshold_bp`. The P7a M1 config is compatible in spirit but not checked against it.
Not read in full: the §18 evidence-assessment design and the third-party access gates, which are outside Vukosi's scope.

## Other
- `team/vukosi.md` changed on `main` (item 5: add `shared/` to Metro `watchFolders`). That is for the signer packet, not P1a. My local edits touch other regions and merge cleanly.
- #52, #54, #55, #47: docs and evidence by other owners. Commit subjects only. **Not reviewed.**
- The open item in spec §8 ("decided at P3.L8 Thu 12:00": a normal PIN then `contact_lost` after a false detection contradicts the duress-defence doc) is a Lethabo/Ipeleng decision. Not resolved by this review.

## What Vukosi should do
1. Send C5–C9 to Sibusiso and Ipeleng before the 12:00 meeting.
2. Do not update P2a for ADR-0039 until it is accepted.
3. Rebase the workflow and packet branches onto `main` once you decide to publish. The packet-P1a base commit stays valid.
