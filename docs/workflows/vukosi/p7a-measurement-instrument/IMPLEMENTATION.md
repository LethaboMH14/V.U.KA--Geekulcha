# P7a measurement-report instrument — implementation evidence

Status: implemented as a host-side instrument; no measurement was performed. Criterion **T/B**: counts, denominators, method and configuration are exposed so a reader can inspect how a reported figure would be formed. A real user should trust a number only when those inputs and its sample are available. All test records are inline `sim_` fixtures and all expected outputs below are independent hand-calculated oracles from TASK §7.

Executor: **Codex / GPT-6** (runtime variant not exposed). Branch: `feat/vukosi-p3v6-eval-instrument`; worktree: `C:\Users\khoza\Desktop\Geekulture-vukosi-p7a`. `BASE_SHA`: `ccd2f8a0939679304465935ebc62cb6ab4645a09`. `HEAD_SHA` (implementation snapshot before this evidence file was committed): `68ee3b14176c6f40cf2e3c8a729c7cd63f95ac10`. This commit contains the instrument, tests, scope declaration and build-log entry; a second documentation-only commit closes this evidence file. No files outside TASK §4 were changed.

## What the tool does

`py -3.12 scripts/eval_yamnet.py` accepts one or more `--m1`, `--m2`, `--m3` JSON input files and emits JSON to stdout and optional `--out`. It does not load a model, run inference, read audio or contact the network. M1 reports a threshold count and Wilson 95% interval; M2 merges alarm events within the per-run refractory interval and reports raw/counted alarms and rate per armed hour; M3 retains lost attempts in the denominator and reports delivery latency statistics only at 30 or more attempts. Invalid schema/data returns 2; an unreadable input returns 3. These are instrument behaviours, not product results.

The score threshold is an input field only. This work did not tune, select, or recommend one. The JSON schema is the tool's proposed interface because TASK §5 leaves it to this implementation. No model, audio, dataset, result file, CSV, or threshold recommendation was created. The only references to numeric scores/times occur in synthetic tests and hand-computed oracle cases; they are not measurements.

## Test-first evidence

Python: `py -3.12 --version` → `Python 3.12.7`.

Tests were written before `scripts/eval_yamnet.py` existed. Initial red command: `py -3.12 -m unittest discover -s scripts/tests -v` (exit 1):

```text
test_eval_yamnet (unittest.loader._FailedTest.test_eval_yamnet) ... ERROR
ImportError: Failed to import test module: test_eval_yamnet
Traceback (most recent call last):
  File "C:\Users\khoza\AppData\Local\Programs\Python\Python312\Lib\unittest\loader.py", line 396, in _find_test_path
    module = self._get_module_from_name(name)
  File "C:\Users\khoza\AppData\Local\Programs\Python\Python312\Lib\unittest\loader.py", line 339, in _get_module_from_name
    __import__(name)
  File "C:\Users\khoza\Desktop\Geekulture-vukosi-p7a\scripts\tests\test_eval_yamnet.py", line 13, in <module>
    import eval_yamnet as subject
ModuleNotFoundError: No module named 'eval_yamnet'
Ran 17 tests in 0.724s
FAILED (errors=1)
```

The first post-implementation run still failed because unittest's discovery path did not include `scripts/`; the test now adds that directory explicitly. This was a test import-path issue, not a result or measurement.

Final command: `py -3.12 -m unittest discover -s scripts/tests -v` → exit 0:

```text
test_e10_m2_requires_consent_and_positive_exposure (test_eval_yamnet.OfflineInstrumentTests.test_e10_m2_requires_consent_and_positive_exposure) ... ok
test_e11_m3_29_attempts_has_no_latency_statistics (test_eval_yamnet.OfflineInstrumentTests.test_e11_m3_29_attempts_has_no_latency_statistics) ... ok
test_e12_m3_30_latency_values_nearest_rank_hand_oracle (test_eval_yamnet.OfflineInstrumentTests.test_e12_m3_30_latency_values_nearest_rank_hand_oracle) ... ok
test_e13_m3_lost_stays_in_denominator_statistics_delivered_only (test_eval_yamnet.OfflineInstrumentTests.test_e13_m3_lost_stays_in_denominator_statistics_delivered_only) ... ok
test_e14_m3_negative_offset_corrected_latency_is_flagged_not_clamped (test_eval_yamnet.OfflineInstrumentTests.test_e14_m3_negative_offset_corrected_latency_is_flagged_not_clamped) ... ok
test_e15_m3_requires_clock_offset_and_uncertainty (test_eval_yamnet.OfflineInstrumentTests.test_e15_m3_requires_clock_offset_and_uncertainty) ... ok
test_e16_each_report_exposes_config_method_and_count_fields (test_eval_yamnet.OfflineInstrumentTests.test_e16_each_report_exposes_config_method_and_count_fields) ... ok
test_e17_audio_filename_or_extension_anywhere_is_rejected (test_eval_yamnet.OfflineInstrumentTests.test_e17_audio_filename_or_extension_anywhere_is_rejected) ... ok
test_e18_whole_suite_forbids_socket_network_use (test_eval_yamnet.OfflineInstrumentTests.test_e18_whole_suite_forbids_socket_network_use) ... ok
test_e1_m1_hand_oracle_8_of_10_wilson_interval (test_eval_yamnet.OfflineInstrumentTests.test_e1_m1_hand_oracle_8_of_10_wilson_interval) ... ok
test_e2_m1_zero_and_all_success_wilson_hand_oracle (test_eval_yamnet.OfflineInstrumentTests.test_e2_m1_zero_and_all_success_wilson_hand_oracle) ... ok
test_e3_m1_exact_threshold_counts_as_detected (test_eval_yamnet.OfflineInstrumentTests.test_e3_m1_exact_threshold_counts_as_detected) ... ok
test_e4_m1_empty_clip_list_is_not_measured (test_eval_yamnet.OfflineInstrumentTests.test_e4_m1_empty_clip_list_is_not_measured) ... ok
test_e5_threshold_must_be_integer_basis_points_in_range (test_eval_yamnet.OfflineInstrumentTests.test_e5_threshold_must_be_integer_basis_points_in_range) ... ok
test_e6_m1_clip_identity_and_licence_are_required_unique (test_eval_yamnet.OfflineInstrumentTests.test_e6_m1_clip_identity_and_licence_are_required_unique) ... ok
test_e7_m2_refractory_merges_events_and_rate_matches_hand_oracle (test_eval_yamnet.OfflineInstrumentTests.test_e7_m2_refractory_merges_events_and_rate_matches_hand_oracle) ... ok
test_e8_m2_alarm_at_refractory_boundary_counts (test_eval_yamnet.OfflineInstrumentTests.test_e8_m2_alarm_at_refractory_boundary_counts) ... ok
test_e9_m2_combines_run_exposure (test_eval_yamnet.OfflineInstrumentTests.test_e9_m2_combines_run_exposure) ... ok
test_invalid_utf8_input_returns_exit_two (test_eval_yamnet.OfflineInstrumentTests.test_invalid_utf8_input_returns_exit_two) ... ok
test_unknown_fields_wrong_types_and_nonfinite_numbers_fail (test_eval_yamnet.OfflineInstrumentTests.test_unknown_fields_wrong_types_and_nonfinite_numbers_fail) ... ok
test_unreadable_input_returns_exit_three (test_eval_yamnet.OfflineInstrumentTests.test_unreadable_input_returns_exit_three) ... ok
test_u12_reject_bad_header_index_and_duplicate_index (test_fetch_models.OfflineTests.test_u12_reject_bad_header_index_and_duplicate_index) ... ok
test_u13_predecessor_indices_are_not_hidden_constants (test_fetch_models.OfflineTests.test_u13_predecessor_indices_are_not_hidden_constants) ... ok
test_u14_valid_interpreter_input_details (test_fetch_models.OfflineTests.test_u14_valid_interpreter_input_details) ... ok
test_u15_invalid_interpreter_input_details (test_fetch_models.OfflineTests.test_u15_invalid_interpreter_input_details) ... ok
test_u16_basis_point_rounding (test_fetch_models.OfflineTests.test_u16_basis_point_rounding) ... ok
test_u17_invalid_scores (test_fetch_models.OfflineTests.test_u17_invalid_scores) ... ok
test_u18_cli_mismatch_leaves_no_destination (test_fetch_models.OfflineTests.test_u18_cli_mismatch_leaves_no_destination) ... ok
test_u19_cli_missing_interpreter_is_not_run (test_fetch_models.OfflineTests.test_u19_cli_missing_interpreter_is_not_run) ... ok
test_u1_single_register_row (test_fetch_models.OfflineTests.test_u1_single_register_row) ... ok
test_u2_reject_missing_duplicate_and_malformed_digest (test_fetch_models.OfflineTests.test_u2_reject_missing_duplicate_and_malformed_digest) ... ok
test_u3_real_register_digest (test_fetch_models.OfflineTests.test_u3_real_register_digest) ... ok
test_u4_u5_verify_file_and_report_observed_digest (test_fetch_models.OfflineTests.test_u4_u5_verify_file_and_report_observed_digest) ... ok
test_u6_bad_install_preserves_existing_destination (test_fetch_models.OfflineTests.test_u6_bad_install_preserves_existing_destination) ... ok
test_u7_bad_install_never_creates_destination (test_fetch_models.OfflineTests.test_u7_bad_install_never_creates_destination) ... ok
test_u8_shuffled_rows_and_nonstandard_indices (test_fetch_models.OfflineTests.test_u8_shuffled_rows_and_nonstandard_indices) ... ok
test_u9_u10_u11_missing_duplicated_and_partial_labels (test_fetch_models.OfflineTests.test_u9_u10_u11_missing_duplicated_and_partial_labels) ... ok
----------------------------------------------------------------------
Ran 37 tests in 1.322s
OK
```

The output above includes P7a tests and the existing P2a tests in the same discovery run. M1/M2/M3 fixtures are synthetic and the suite blocks `socket.socket`; no network test data or media is used.

## Repository checks

Node: `C:\Users\khoza\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`; `node --version` → `v24.19.0`.

| Status | Command | Actual output |
|---|---|---|
| PASS | `node scripts/check-docs.mjs` | `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.` |
| PASS | `node scripts/check-intake.mjs` | `Intake gate has evidence references and approval records; reviewers must verify their authenticity.` |
| PASS | `node --test "test/**/*.test.mjs"` | `✔` 10 tests passed; `ℹ tests 10`; `ℹ pass 10`; `ℹ fail 0`; `ℹ duration_ms 263.6867`. |
| PASS | `& 'C:\Users\khoza\Desktop\Geekulture\.tools\gitleaks.exe' dir --redact --config .gitleaks.toml .` | `no leaks found`. |
| PASS | `git diff --check` | Exit 0; no output. |
| PASS | `git ls-files '*.csv' '*.tflite' '*.wav'` reviewed against BASE_SHA | Only `research/results/anchor-scale-scenarios.csv`, already tracked at the supplied base. It is inherited and untouched, not a P7a failure. No model/audio/data files added. |

The implementation commit's pre-commit hook output was: `1 commits scanned`; `scanned ~28024 bytes (28.02 KB) in 451ms`; `no leaks found`; `Intake gate: documentation/repository tooling only.`

## Review fixes (2026-09-23)

Applied only review findings F1–F3. M2 now rejects an alarm time strictly greater than that run's `armed_seconds` with exit 2; equality is accepted. The existing E7 case (400.0 seconds in an 1800-second run) remains valid. M1 adds only `missed_clip_ids`, below-threshold clip IDs in input order. The audio suffix guard adds `.m4a`, `.aac`, `.opus`, `.wma`, `.aiff` and `.amr`. M3 percentile behaviour is unchanged pending human decision. No audio or extra report fields were added beyond `missed_clip_ids`.

Test-first red command: `py -3.12 -m unittest discover -s scripts/tests -v` → exit 1, `Ran 40 tests`, `FAILED (failures=7, errors=1)`. The red cases were F1 (`test_f1_m2_rejects_alarm_after_armed_window_but_accepts_endpoint`), F2 (`test_f2_m1_reports_only_below_threshold_ids_in_input_order`, missing `missed_clip_ids`) and F3 (`test_f3_audio_guard_rejects_additional_common_suffixes`, all six new suffixes accepted). Existing E7 passed in that run.

Green command, after implementing the three fixes: `py -3.12 -m unittest discover -s scripts/tests -v` → exit 0, `Ran 40 tests in 0.997s`, `OK`. This was the full offline Python suite; code and tests were unchanged afterward.

Post-change repository checks: `node scripts/check-docs.mjs` PASS (document contracts, required counts, local links and selected claim safeguards passed); `node scripts/check-intake.mjs` PASS (intake gate has evidence references and approval records); `node --test "test/**/*.test.mjs"` PASS (10/10); Gitleaks PASS (`no leaks found`); `git diff --check` PASS (exit 0). `git ls-files '*.csv' '*.tflite' '*.wav'` showed only the inherited, untouched `research/results/anchor-scale-scenarios.csv`; it was already tracked at the base. No model, audio, dataset, real result or new CSV was added. No measurement was performed.

Review-fix executor: **Codex / GPT-6** (runtime variant unavailable). Old `HEAD_SHA`: `cab484ec730085093a63855303eec15697500bef`. New implementation `HEAD_SHA`: `2af316672ef3e6ab37e2e4914282a1cb8f815e6b`. This note is closed in a separate evidence-only local commit. No push, PR, comment or release was made.

## Measurement status and review gates

**NOT A MEASUREMENT.** There is no model inference, audio, dataset, real result, or field observation in this packet. M1, M2 and M3 remain unmeasured until their separate acquisition and device procedures run with real inputs, configuration and sample sizes. No threshold is endorsed here.

Fraud gate: not applicable to an offline report parser; no alert, bank or person decision is made. Build-for-use gate: host-only and does not establish Android performance or device compatibility. Economic gate: no price or savings figure is produced. Privacy gate: fixtures contain synthetic IDs, licences, scores and times only; the parser rejects keys or string values ending in the listed audio extensions. The existing security remediation gate remains relevant to product feature work; P7a prepares host-side measurement tooling and changes no product access or safety path.

## Deviation and handoff

No deviation from the file scope, standard-library-only rule, offline requirement, or no-real-data boundary. The output JSON input schema was specified by this implementation as allowed in TASK §5. The required tracked CSV remains inherited from BASE_SHA. AI review is pending; human review remains separate. Next work that can produce a measurement needs the real model/runtime gate, licensed clip lists or consenting ambient data, and the device procedure; none is included here.

## M3 delivered gate — 2026-09-24

**PROPOSED:** This is Vukosi's recommendation pending Khutso's confirmation. It is not a measurement and does not publish any latency result. Executor: Codex / GPT-5 (runtime variant not exposed). Old HEAD: `42f1bfe7898b98fe71837c8e959c838682ee09b4`; implementation commit: `b98780506c2e373c4fc28f55fc1238cfd177df01`. The final evidence commit is reported externally because a commit cannot contain its own SHA.

M3 now always reports integer `delivered`. Percentiles (`median_ms`, `p95_ms`, `min_ms`, `max_ms`) appear only with at least 30 delivered attempts. With 30 or more total attempts but fewer than 30 delivered, status is `insufficient_n`, reason is `fewer than 30 delivered attempts`, `n` still includes lost attempts, and no percentile keys appear. The existing `n < 30` attempt gate, lost denominator, clock-suspect handling, and nearest-rank p95 calculation remain.

**Tests first — FACT:** `py -3.12 -m unittest discover -s scripts/tests -v` initially ran 42 tests and exited 1: 37 passed and the five new/updated M3 assertions errored because `delivered` and the delivered gate were absent. After implementation, the same full offline command ran 42 tests in 1.477 seconds and exited 0 (`OK`). The four required cases pass: 30 attempts/27 delivered is insufficient with no percentiles; 30 delivered retains median 15.5, p95 29, min 1 and max 30; 40 attempts/30 delivered/10 lost calculates over the 30 delivered values; 30 attempts/29 delivered is insufficient.

Existing tests changed, and why:

- `test_e11_m3_29_attempts_has_no_latency_statistics`: added the required always-present `delivered == 29` assertion; the existing insufficient-attempt behaviour remains.
- `test_e12_m3_30_latency_values_nearest_rank_hand_oracle`: added `delivered == 30`; the hand-computed percentile oracle is unchanged.
- `test_e13_m3_lost_stays_in_denominator_statistics_delivered_only`, renamed `test_e13_m3_30_attempts_with_27_delivered_is_insufficient`: removed the old expectation that 27 delivered values produce percentiles and now asserts the delivered gate, exact reason, counts and absence of all percentile keys.

New tests cover 40 attempts with 30 delivered and 30 attempts with 29 delivered. No expected percentile was derived from the implementation.

**Repository evidence — FACT:** docs PASS; intake PASS; contract tests 10/10 PASS; Gitleaks PASS with no leaks; `git diff --check` PASS. The only tracked restricted-data match is the inherited, untouched `research/results/anchor-scale-scenarios.csv`. No model, audio, dataset, result, new CSV, network access, threshold tuning or device check was used. Device checks are **NOT RUN** because this packet has no live check and the phone was not required.
