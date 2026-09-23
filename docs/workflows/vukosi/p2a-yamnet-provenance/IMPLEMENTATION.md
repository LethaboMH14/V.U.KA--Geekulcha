# P2a implementation evidence — 2026-09-23

Status: **PROPOSED implementation, locally tested; not reviewed or released.** Criterion T/S: a real user should be able to trust that the named detector uses the registered model and exact classes. This work creates a provenance gate; it does not establish sensing accuracy. All `sim_` inputs below are synthetic. No model, class map, or audio was obtained or committed.

Executor: Codex / GPT-6 (runtime variant not exposed to this task). `BASE_SHA`: `0c6d202e811618011bab5047f7eb18d3ea910af2`. Branch: `feat/vukosi-p3v2-yamnet`; worktree: `C:\Users\khoza\Desktop\Geekulture-vukosi-p2a`. `HEAD_SHA` of the implementation is recorded in the closing evidence commit below; the final evidence commit SHA is reported in the handoff because a commit cannot contain its own SHA.

## Scope and provenance

Read the uncommitted TASK.md from `C:\Users\khoza\Desktop\Geekulture-vukosi-workflow` **read-only**. It is absent from the supplied BASE_SHA; the suggested preparatory commit was not made because Vukosi explicitly supplied that SHA and forbade edits to the source checkouts. Only TASK §4 paths changed. The script has no default model URL and requires caller-supplied sources. `docs/MODEL-LICENCES.md` M1 is parsed read-only. The real model source remains undecided (`ASSUMPTION`), so the registered 4,126,810-byte model size is a register claim, **not measured here**. No class-map commit SHA or observed real-asset digest exists yet.

## Red → green (offline)

The test file was written before `scripts/fetch_models.py`. Every test patches `socket.socket` to reject network use.

Command: `py -3.12 --version` → `Python 3.12.7`.

Initial command: `py -3.12 -m unittest discover -s scripts/tests -v` → exit 1:

```text
test_fetch_models (unittest.loader._FailedTest.test_fetch_models) ... ERROR
ModuleNotFoundError: No module named 'fetch_models'
Ran 1 test in 0.001s
FAILED (errors=1)
```

After the first implementation, the same command exited 1: 16 tests ran with 1 failure and 1 error because the register parser selected the summary row as well as M1. The parser was narrowed to the M1 row. This was an implementation failure, not a model-digest mismatch.

Final command: `py -3.12 -m unittest discover -s scripts/tests -v` → exit 0:

```text
test_u12_reject_bad_header_index_and_duplicate_index ... ok
test_u13_predecessor_indices_are_not_hidden_constants ... ok
test_u14_valid_interpreter_input_details ... ok
test_u15_invalid_interpreter_input_details ... ok
test_u16_basis_point_rounding ... ok
test_u17_invalid_scores ... ok
test_u18_cli_mismatch_leaves_no_destination ... ok
test_u19_cli_missing_interpreter_is_not_run ... ok
test_u1_single_register_row ... ok
test_u2_reject_missing_duplicate_and_malformed_digest ... ok
test_u3_real_register_digest ... ok
test_u4_u5_verify_file_and_report_observed_digest ... ok
test_u6_bad_install_preserves_existing_destination ... ok
test_u7_bad_install_never_creates_destination ... ok
test_u8_shuffled_rows_and_nonstandard_indices ... ok
test_u9_u10_u11_missing_duplicated_and_partial_labels ... ok
----------------------------------------------------------------------
Ran 16 tests in 1.276s
OK
```

The 16 methods contain the packet's U1–U19 cases, including grouped subtests. Their inputs are synthetic; the pass result proves only the host-side logic under those conditions.

## Repository checks

Node: `C:\Users\khoza\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`, `node --version` → `v24.19.0`.

| Check | Status | Actual command and output |
|---|---|---|
| R1 | PASS | `git check-ignore -v app/android/app/src/main/assets/models/yamnet.tflite app/android/app/src/main/assets/models/yamnet_class_map.csv` → `.gitignore:29:*.tflite` and `.gitignore:18:*.csv`, respectively. |
| R2 | FAIL | `git ls-files '*.tflite' '*.csv'` → `research/results/anchor-scale-scenarios.csv`. This tracked CSV predates this branch; it is not a model/class-map asset. Removing it is outside §4. |
| R3a | PASS | `node scripts/check-docs.mjs` → `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.` |
| R3b | PASS | `node scripts/check-intake.mjs` → `Intake gate has evidence references and approval records; reviewers must verify their authenticity.` This does not assert that this assistant verified human signatures. |
| R3c | PASS | `node --test "test/**/*.test.mjs"` → 10 tests, 10 pass, 0 fail. |
| R4 | PASS | `& 'C:\Users\khoza\Desktop\Geekulture\.tools\gitleaks.exe' dir --redact --config .gitleaks.toml .` → `scanned ~1766851 bytes (1.77 MB) in 1.67s`; `no leaks found`. |
| Whitespace | PASS | `git diff --check` → exit 0, no output. |

## Live checks

| Check | Status | Evidence / reason |
|---|---|---|
| L1 real model source and registered digest | NOT RUN | Vukosi has not designated or authorised a model source. No model downloaded/copied, so no observed model digest or size. The synthetic mismatch CLI test is not L1. |
| L2 real class map and independent six indices | NOT RUN | No pinned class-map commit was resolved or fetched; no real class-map SHA exists. Synthetic label-lookup tests are not L2. |
| L3 real interpreter input | NOT RUN | Requires a verified real model and Vukosi's explicit approval to install `ai_edge_litert`; neither is present. The synthetic missing-interpreter test is not L3. |

## Deviation and handoff

The supplied `BASE_SHA` excludes the uncommitted TASK.md; the executor read it from the other checkout without editing or committing there. The dated build-log entry uses the actual local date, 2026-09-23, rather than the §4 example date. R2 is an inherited false-for-this-repository condition, not silently waived. No package was installed, no URL invented, and no live-model claim made. Lethabo/human review remains pending. Next: Vukosi decides the model source and any interpreter-install approval; the reviewer checks this commit and R2 scope before any merge.

Implementation `HEAD_SHA` (first local commit): PENDING UNTIL COMMIT. Final evidence commit SHA: see handoff response.
