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

First local implementation commit: `a18dff2dd90b657d18e073f1cebbc1901e4084f7` (`git rev-parse HEAD` immediately after commit). The staged pre-commit hook reported `1 commits scanned`, `~28954 bytes (28.95 KB)`, `no leaks found`, and `Intake gate: documentation/repository tooling only.` This evidence-file update receives a second local commit; its final HEAD_SHA is in the handoff response, since a commit cannot contain its own SHA.

## P2b — Semgrep dynamic-urllib finding (2026-09-25)

Status: **FACT — locally implemented and tested; CI Semgrep result NOT RUN locally.** Criterion T/S: a user can trust that a supplied model URL cannot make the fetcher read a local file, including after an HTTP redirect. No model, CSV, audio or network call was used by these tests; no dependency was added.

Executor: Codex / GPT-6 (runtime variant not exposed to this task). `BASE_SHA`: `f05a812af04cc3c496a344246f726ca1d4481638`. The resulting commit `HEAD_SHA` is reported in the handoff because a commit cannot contain its own SHA.

The HTTPS-only scheme check remains. Fix 2 was used: `_make_https_opener()` constructs `urllib.request.OpenerDirector()` and adds only `HTTPSHandler`, `HTTPRedirectHandler`, `HTTPDefaultErrorHandler`, `HTTPErrorProcessor` and `UnknownHandler`; it does not use `build_opener`, `urlopen`, `FileHandler` or `FTPHandler`. A redirect to `file://` therefore has no file-protocol handler. The size cap and existing `PrerequisiteMissing` errors remain. No `nosemgrep` suppression was added: the unsafe handler path is structurally absent, but Semgrep was not available locally, so CI remains the oracle.

Red-first command: `py -3.12 -m unittest discover -s scripts/tests -p test_fetch_models.py -v` → exit 1, `Ran 20 tests`; the four new checks errored because `_make_https_opener` did not yet exist (`AttributeError`), while the prior 16 tests passed. This was the expected pre-implementation result. A first post-implementation run exposed two fixture-construction errors in the new tests; those fixtures were corrected before the recorded green run.

Green command: `py -3.12 -m unittest discover -s scripts/tests -v` → exit 0, `Ran 20 tests`, `OK`. The synthetic tests cover pre-open rejection of `file://` and `http://`, the absence of file/FTP handlers, a simulated HTTPS redirect to `file://`, and the unchanged read-size cap. Existing socket blocking remains active. There was no live fetch.

Local Semgrep availability check: `Get-Command semgrep -ErrorAction SilentlyContinue` → no command found; `semgrep --version` was therefore **NOT RUN**. No claim is made about the CI result.

| Check | Status | Actual command and output |
|---|---|---|
| A — offline unit suite | PASS | Red: `py -3.12 -m unittest discover -s scripts/tests -p test_fetch_models.py -v` → exit 1, `Ran 20 tests`; expected `AttributeError` for the not-yet-implemented opener in new tests. Green: `py -3.12 -m unittest discover -s scripts/tests -v` → exit 0, `Ran 20 tests`, `OK`. |
| B — docs | PASS | `node scripts/check-docs.mjs` → `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.` |
| B — intake | PASS | `node scripts/check-intake.mjs` → `Intake gate has evidence references and approval records; reviewers must verify their authenticity.` |
| B — contract tests | PASS | `node --test "test/**/*.test.mjs"` → 23 tests, 23 pass, 0 fail. |
| B — secret scan | PASS | `gitleaks dir --redact --config .gitleaks.toml .` → scanned ~3.08 MB; `no leaks found`. |
| B — whitespace | PASS | `git diff --check` → exit 0, no whitespace errors (Git emitted working-copy LF-to-CRLF notices). |
| C — Semgrep | NOT RUN | `Get-Command semgrep -ErrorAction SilentlyContinue` found no command; no package was installed. CI is the Semgrep oracle. |
| D — scope and offline boundary | PASS | Unit tests use synthetic inputs and block `socket.socket`; no model, class-map file, audio or live request used; no dependency or files outside the allowed set changed. |

## P2c — class-map index and digest gate (2026-09-26)

Status: **FACT — offline implementation and host tests pass; live model/runtime check NOT RUN.** Criterion C3 (progress of solution profile): a reviewer can verify that the detector's named labels map to the specified indices and that the exact class-map bytes are registered before installation. This makes the provenance boundary checkable, but does not establish that any live YAMNet asset was fetched or tested. Trust answer: no class map can be installed until a reviewer-sourced digest is registered; the current `PENDING` row returns a visible NOT RUN.

Executor: Codex / GPT-5 (runtime variant not exposed). `BASE_SHA`: `b2a778ab5003b7fef534e412119b9b27b3da26f4`. Final `HEAD_SHA` is reported in the handoff because a commit cannot contain its own SHA.

Changes: `class_indices_by_label` now requires `Screaming=11`, `Shout=6`, `Yell=9`, `Glass=435`, `Shatter=437`, `Breaking=464`; these are the indices specified in Khutso's finding/task, not independently measured from a real class map here. The separate M7 YAMNet class-map row was added to `docs/MODEL-LICENCES.md` with `PENDING — digest not registered`; no digest was invented or obtained. `registered_class_map_sha256` accepts exactly one lowercase 64-hex digest explicitly tagged `FACT`; missing, malformed, duplicate, `PENDING`, or `PROPOSED` rows raise `PrerequisiteMissing("class-map digest not registered")`. The CLI therefore prints `NOT RUN: class-map digest not registered`, exits 3 before reading/installing sources, and leaves the destination absent. A well-formed class map with a nonmatching registered digest fails before either asset is installed. The P2b HTTPS-only opener and its handler set were not edited.

Red → green evidence (all tests are synthetic and the test fixture blocks `socket.socket`):

- Red-first `py -3.12 -m unittest discover -s scripts/tests -v` after writing tests and before implementation: exit 1; 25 methods, 3 failures and 3 errors. Failures demonstrated wrong-index acceptance and missing-digest status; errors showed the class-map register lookup was absent. Existing-test fixture mutations were adjusted to use the newly fixed-index fixture so they continue testing malformed rows rather than stale literals.
- Additional strictness red run: the same command exited 1, 25 methods, 1 failure: a mixed PENDING plus valid duplicate M7 row was incorrectly accepted.
- Proposed-digest red run: `py -3.12 -m unittest discover -s scripts/tests -p test_fetch_models.py -k u25 -v` → exit 1 because a 64-hex row tagged `PROPOSED` was accepted; after requiring the row's `FACT` tag, the same targeted command passed 1/1.
- Final `py -3.12 -m unittest discover -s scripts/tests -v`: exit 0, `Ran 25 tests`, `OK`. Includes map remapping rejection, mismatch digest rejection with no destination, and missing digest NOT RUN with no destination.

Register format: the existing six-column pipe table supports a distinct M7 row and `registered_sha256` selects only M1/YAMNet TFLite; offline tests verify both lookups remain separate. M7 is explicitly pending until a source and digest are verified. No model, class map, audio, URL, interpreter or network request was used. Live model/runtime check: **NOT RUN**.

Semgrep-safe opener: unchanged from P2b. `git diff` inspection against base showed no changes to `_make_https_opener` or `_read_source`'s HTTPS opener path; existing tests still assert that the handler list has no file/FTP handler, file/http URLs are refused before opening, redirect-to-file is blocked, and the size cap remains.

## P2c acceptance checks

| Check | Status | Actual command/result |
|---|---|---|
| Offline suite | PASS | Red as above; green `py -3.12 -m unittest discover -s scripts/tests -v` → 25 tests, 25 pass, 0 fail. |
| Documentation contracts | PASS | `node scripts/check-docs.mjs` → `Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required.` |
| Intake | PASS | `node scripts/check-intake.mjs` → `Intake gate has evidence references and approval records; reviewers must verify their authenticity.` |
| Contract tests | PASS | `node --test "test/**/*.test.mjs"` → 23 tests, 23 pass, 0 fail. |
| Secret scan | PASS | `C:\Users\khoza\Desktop\Geekulture\.tools\gitleaks.exe dir --redact --config .gitleaks.toml .` → scanned ~3.10 MB, `no leaks found`. |
| Whitespace | PASS | `git diff --check` → exit 0; Git only printed LF-to-CRLF working-copy notices. |
| P2b opener unchanged | PASS | Diff inspection shows no opener/source-reader changes; related offline opener tests pass in the 25-test suite. |
| Live model/runtime check | NOT RUN | No model/class-map source was supplied or fetched, no digest was invented, and no runtime package was installed. |
