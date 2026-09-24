# P7a review

**Reviewer:** Claude Code assistant (`claude-sonnet-5`). **Reviewed SHA:** `cab484ec730085093a63855303eec15697500bef` (implementation `68ee3b14176c6f40cf2e3c8a729c7cd63f95ac10`, base `ccd2f8a`), in a separate detached checkout. AI review only. It is not Lethabo's review or human approval.

## Verdict: passes TASK §7; 3 non-blocking findings to fix before this feeds any real measurement

**Reproduced:** diff touches only the five §4 files. 37 offline tests pass (`py -3.12 -m unittest discover -s scripts/tests`). The docs and intake checks pass, `node --test` gives 10/10, `git diff --check` is clean, and Gitleaks reports no leaks. The only tracked CSV is the inherited `research/results/anchor-scale-scenarios.csv`. Oracle values in the tests match the hand-computed ones in the TASK (Wilson `[0.4902, 0.9433]`, `[0.0, 0.2775]`, `[0.7225, 1.0]`; M3 median 15.5, p95 29).

## Findings

### F1: P2: an alarm outside the armed window is accepted and counted
`scripts/eval_yamnet.py:169–177`. `alarm_times_s` is only checked to be finite and ≥ 0. **Trigger:** a run with `armed_seconds` 300 and an alarm at 400.0 returned `status: measured`, `counted: 1`, `false_alarms_per_hour: 12.0` (exit 0, reproduced here). **Impact:** a logging or clock error inflates the false-alarm rate with no warning, and the report looks valid. **Required evidence:** reject (exit 2) any alarm time greater than that run's `armed_seconds`, with a test. The TASK's own E7 used an alarm at 400.0 in a 1800 s run, which stays valid.

### F2: P3: M1 lists no missed clips
`report_m1` (`:104–141`) returns counts and an interval but not which `clip_id`s fell below the threshold. The workflow's M1 acceptance asks for "per-class numerator/denominator **and failures**". **Required evidence:** add `missed_clip_ids` (IDs only, no audio), with a test. Without it, the numerator can't be audited against the clip list.

### F3: P3: audio-reference guard misses common suffixes
`AUDIO_SUFFIXES` (`:17`) matches only the four TASK named. `.m4a .aac .opus .wma .aiff .amr` pass. TASK asked for four, so this is a gap in the packet rather than a deviation. **Required evidence:** widen the list and add a test.

### Notes, not defects
- **M3 percentiles:** at n ≥ 30 attempts, p95 is computed over delivered attempts only. With 3 delivered of 30, it prints a p95 from 3 samples. This follows the TASK, but the report is misleading in that case. Consider requiring 30 *delivered* attempts, or adding a `delivered` count next to the percentiles. That is a human choice for Vukosi and Khutso.
- **M2 sample size:** nothing flags a total armed time below the 30 minutes §16 asks for. The `method` text already says "limited-sample estimate".
- The `licence` emptiness check at `:128` is dead code, because `_string` already rejects blank values. Harmless.

## Not verified
There is no live check for this packet. Nothing here is a measurement, and no real result file exists.

## Re-review of `42f1bfe7898b98fe71837c8e959c838682ee09b4` (fix `2af316672ef3e6ab37e2e4914282a1cb8f815e6b`)

**Result: F1, F2 and F3 closed. No new findings.** Claude Code assistant (`claude-sonnet-5`), separate detached checkout, AI review only.

- Diff vs `cab484e` touches only `scripts/eval_yamnet.py`, its test file, IMPLEMENTATION.md, `team/vukosi.md` and one new build-log entry. M3 code is unchanged.
- **F1:** the alarm at 400.0 in a 300 s run now exits 2 (`FAIL: … beyond armed_seconds`). An alarm at exactly 300.0 is accepted (`counted: 1`, exit 0). The TASK's E7 case still passes.
- **F2:** `missed_clip_ids` is added to the M1 report, in input order, IDs only.
- **F3:** the suffix list now includes `.m4a .aac .opus .wma .aiff .amr`.
- Reproduced: 40 offline tests OK, docs and intake checks pass, `node --test` 10/10, `git diff --check` clean, Gitleaks no leaks. The only tracked CSV is the inherited one.
- Still open (human choice, unchanged): M3 prints a p95 from delivered attempts only once n ≥ 30 attempts.
- Still not a measurement. Lethabo's review is pending.

## Review of the M3 delivered gate: `6ea9fdc3066b511af6de9934eae97f3e1cfda819` (change `76b44f2`)

**Result: correct; one low finding.** Claude Code assistant (`claude-sonnet-5`), fresh detached checkout. AI review only. It is not Lethabo's review, and the rule itself is Vukosi's recommendation pending Khutso's confirmation.

- The change: `delivered` is now always reported, and median/p95/min/max appear only when `delivered >= 30`; otherwise `insufficient_n` with reason "fewer than 30 delivered attempts". Only `scripts/eval_yamnet.py` and its tests changed.
- Reproduced: 42/42 offline tests, docs and intake checks, 13 contract tests, `git diff --check` and Gitleaks all pass. I probed the boundaries directly: 30 attempts with 3 lost gives `insufficient_n` (delivered 27); 30 with 0 lost gives median 15.5 and p95 29; 40 attempts with 10 lost gives percentiles over the 30 delivered (median 25.5, p95 39, lost 10, n 40), which I checked by hand; 30 attempts all lost gives `insufficient_n`.
- **Low:** the earlier distinct status for zero delivered attempts (`not_measured`, "no displayed attempts") was folded into `insufficient_n`. Total loss now reads like a sample-size shortfall. Suggest keeping a reason that says nothing was delivered.
- Still a measurement instrument, not a measurement. No live check exists.
