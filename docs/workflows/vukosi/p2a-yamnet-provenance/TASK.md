# Packet P2a: YAMNet provenance gate and class map by label

**PROPOSED packet, prepared 23 Sep 2026 by the Claude Code assistant (`claude-opus-5-5`) at Vukosi's request.** It is not yet accepted by Vukosi, and there is no human approval. Part of work-order item 2 / **P3.V2** (due Sep 24, issued). The deadline is the work order's, not a new commitment.

## 1 · Criterion and trust answer

**T** (does it work, and is it fit for purpose) and **S** (supply-chain integrity). *Would a real user trust this?* Only if the detector on their phone is the exact model we evaluated, listening for the classes we say it is. The predecessor mapped the wrong YAMNet indices (`docs/EVIDENCE.md:36`). This packet makes that failure impossible to ship silently. It also builds the instrument **before** any accuracy claim.

Four gates: **fraud:** not applicable, no event path. **Budget phone:** not applicable, host-side tooling only. **Economics:** no figure. **Privacy:** no audio anywhere in this packet, and no personal data.

## 2 · Pins

| Pin | Value |
|---|---|
| Spec | `docs/VUKA-2-SPEC.md` V3 and §16 M1 at PR #43 head `0c6d202e811618011bab5047f7eb18d3ea910af2` (open, not merged) |
| Contract | None consumed. **Independent of contract v2, `shared/`, P3.L8 and R1–R3** |
| Model register | `docs/MODEL-LICENCES.md` row M1: sha256 `10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de`, 4,126,810 bytes (read-only for this packet) |
| Expected indices (independent oracle) | `docs/EVIDENCE.md:36` `FACT`: Shout 6, Yell 9, Screaming 11, Glass 435, Shatter 437, Breaking 464 |
| Base | Local commit of branch `docs/vukosi-vigil-workflow` (on `0c6d202`), recorded as `BASE_SHA` in IMPLEMENTATION.md. Rebase onto `main` after #43 merges |
| Python | `py -3.12` → `C:\Users\khoza\AppData\Local\Programs\Python\Python312` (3.12.7). **Standard library only** for the script and its tests |

## 3 · Objective

`scripts/fetch_models.py` does four things. It obtains `yamnet.tflite` and `yamnet_class_map.csv`. It refuses any model whose sha256 differs from the register. It resolves the six detector classes **by display name**, never by position. It provides the two host-side checks later Android and eval work reuse: interpreter input-details validation and basis-point conversion.

**Non-goals.** No Android/Kotlin code, and no RN project. No `eval_yamnet.py`, audio, clip lists or thresholds. No CI job (P3.V5). No edit to `docs/MODEL-LICENCES.md`, `docs/EVIDENCE.md` or `.gitignore`. No package installation without Vukosi's explicit OK (§7 L3). No accuracy or latency statement.

## 4 · Allowed files (declared in `team/vukosi.md` and `docs/OVERLAPS.md`)

- `scripts/fetch_models.py` (new; the script path Vukosi's work order already assigns)
- `scripts/tests/test_fetch_models.py` (new)
- `docs/workflows/vukosi/p2a-yamnet-provenance/IMPLEMENTATION.md` (new)
- `team/vukosi.md`: running-log line only
- `docs/build-log/entries/2026-09-24-codex-p2a-yamnet-provenance.md` (new; use the actual date)

Anything else means stop and record it as a blocker. Downloads go only to `app/android/app/src/main/assets/models/`. That directory is **never committed**: `*.tflite` and `*.csv` are already gitignored (review C1, C3).

## 5 · Interface (PROPOSED; our own script, not a contract)

```text
registered_sha256(register_text: str) -> str
    Parse the single "YAMNet TFLite" row of MODEL-LICENCES.md; return the 64-hex digest.
    Raise RegisterError if zero rows, more than one row, or not exactly 64 lowercase hex.
verify_file(path, expected_sha256) -> str             # returns observed digest
    Raise DigestMismatch(observed, expected) on mismatch.
install_verified(src_bytes_or_path, dest_path, expected_sha256)
    Write to a temp file in dest's directory, verify, then os.replace. On mismatch: temp deleted,
    dest untouched (an existing good file stays), DigestMismatch raised.
class_indices_by_label(csv_text, labels=("Screaming","Shout","Yell","Glass","Shatter","Breaking")) -> dict[str,int]
    Header must be exactly index,mid,display_name. Exact, case-sensitive display_name match.
    Raise ClassMapError on a missing label, a duplicated label, a non-integer or duplicated index, or a bad header.
assert_input_details(details: list[dict]) -> None
    Exactly one input; dtype float32 (numpy.float32 or the string "float32"); shape [15600] or [1, 15600].
    Raise InputShapeError otherwise.
score_to_bp(score: float) -> int
    floor(score * 10000 + 0.5). Reject bool, NaN, ±inf, <0, >1 with ValueError. No clamping.
CLI  py -3.12 scripts/fetch_models.py (--model-file PATH | --model-url URL)
                                     (--class-map-file PATH | --class-map-url URL)
                                     [--dest DIR] [--check-interpreter]
     exit 0 verified · 2 verification failed · 3 prerequisite missing ("NOT RUN: <reason>")
     prints: observed model sha256, class-map sha256 and source, the six label→index pairs.
```

`--check-interpreter` imports `ai_edge_litert`. If it is absent, the script exits 3 with `NOT RUN`. It never passes silently. There is no default URL in code unless Vukosi supplies a source of record (§6).

## 6 · Inputs and provenance

| Input | Source | Status |
|---|---|---|
| `yamnet.tflite` | **Source of record undecided (review C2).** Candidates: (a) the authorised predecessor file `Team-Sonar---Vuka-/app/android/app/src/main/assets/models/yamnet.tflite`, the copy the register digest was measured on; (b) a public TF Hub/Kaggle YAMNet TFLite URL **supplied by Vukosi** | `ASSUMPTION`: no candidate verified. The executor does not search for or invent a URL |
| `yamnet_class_map.csv` | `tensorflow/models`, `research/audioset/yamnet/yamnet_class_map.csv`, pinned to a commit resolved at run time: `git ls-remote https://github.com/tensorflow/models HEAD` → `https://raw.githubusercontent.com/tensorflow/models/<sha>/research/audioset/yamnet/yamnet_class_map.csv` | `ASSUMPTION` until fetched. Record the commit SHA and file sha256 (first-use record, cross-checked by the reviewer's independent download) |
| Unit-test fixtures | Inline strings in the test file, named `sim_`. Not derived from real audio | Synthetic |

## 7 · Acceptance oracle: write it first, run it red, then implement

**Offline unit tests** (`scripts/tests/test_fetch_models.py`, `unittest`). Every test runs with `socket.socket` patched to raise, so any network access fails the test.

| # | Case | Expected |
|---|---|---|
| U1 | `sim_` register with one YAMNet row | returns the digest |
| U2 | register with no row / two rows / 63-character digest / digest containing an uppercase or non-hex character | `RegisterError` each |
| U3 | the real `docs/MODEL-LICENCES.md` | returns `10c95ea3…17de` exactly |
| U4 | file whose bytes hash to the expected digest | returns the digest |
| U5 | one byte changed | `DigestMismatch`, observed ≠ expected in the message |
| U6 | `install_verified` with bad bytes and an existing good dest | dest unchanged (same digest before/after), no temp file left in dir |
| U7 | `install_verified` with bad bytes, no dest | dest does not exist afterwards |
| U8 | `sim_` class map with the six labels at **non-standard** indices and rows shuffled | returns those fixture indices, proving the lookup is by label, not position |
| U9 | fixture missing `Screaming` | `ClassMapError` |
| U10 | fixture with `Glass` twice | `ClassMapError` |
| U11 | fixture with `Wine glass` and `Glass breaking` but no exact `Glass` | `ClassMapError` (no substring match) |
| U12 | wrong header / non-integer index / duplicated index | `ClassMapError` each |
| U13 | fixture where the predecessor indices 427/395/195/39 carry the labels | mapping ≠ `{Shout:6,…}`, and the returned values are the fixture's, not constants |
| U14 | details `[{"shape":[15600],"dtype":"float32"}]` and `[1,15600]` | pass |
| U15 | `[1,16000]`, `[15600,1,1]` with float16, `int8`, two inputs, zero inputs | `InputShapeError` each |
| U16 | `score_to_bp`: 0→0, 1→10000, 0.12345→1235, 0.99994→9999, 0.99995→10000 | exact |
| U17 | `score_to_bp`: −0.0001, 1.0001, NaN, inf, `True` | `ValueError` each |
| U18 | CLI with `--model-file` pointing at wrong bytes | exit code 2, dest absent |
| U19 | CLI `--check-interpreter` with `ai_edge_litert` unimportable (patched) | exit code 3, stdout contains `NOT RUN` |

**Repository checks:**

- R1: `git check-ignore -v app/android/app/src/main/assets/models/yamnet.tflite app/android/app/src/main/assets/models/yamnet_class_map.csv` names both paths.
- R2: `git ls-files '*.tflite' '*.csv'` returns nothing.
- R3: the existing `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs` and `node --test "test/**/*.test.mjs"` still pass.
- R4: `gitleaks dir --redact --config .gitleaks.toml .` reports no leaks.

**Live checks.** Each one is **NOT RUN** until actually executed, with its output recorded:

- **L1.** Fetch/copy the model from the source Vukosi designates, and confirm the digest equals the register. **On a mismatch: stop.** Record the observed digest and size. Do **not** edit the register. Hand the decision to Vukosi (C2).
- **L2.** Real class map: the six indices equal `docs/EVIDENCE.md:36` exactly.
- **L3.** `--check-interpreter` on the real model. This needs `ai_edge_litert`. Install it **only after Vukosi says yes**, into a gitignored `.venv/`, with the exact version recorded. Pass or fail is the outcome; "not run" is also acceptable.

## 8 · Commands (PROPOSED; record the actual commands and output)

```bash
git worktree add ../Geekulture-vukosi-p2a -b feat/vukosi-p3v2-yamnet <BASE_SHA>
cd ../Geekulture-vukosi-p2a
py -3.12 -m unittest discover -s scripts/tests -v          # must FAIL first (red), then pass
py -3.12 scripts/fetch_models.py --model-file <authorised path> --class-map-url <pinned raw URL>
git check-ignore -v app/android/app/src/main/assets/models/yamnet.tflite app/android/app/src/main/assets/models/yamnet_class_map.csv
git ls-files '*.tflite' '*.csv'
<node> scripts/check-docs.mjs && <node> scripts/check-intake.mjs && <node> --test "test/**/*.test.mjs"
C:/Users/khoza/Desktop/Geekulture/.tools/gitleaks.exe dir --redact --config .gitleaks.toml .
git diff --check
```

`<node>` is whatever Node the executor actually used. Record its path and version. The only one found so far is Playwright's bundled v22.13.1.

## 9 · Dependencies and owners

| Needed | Owner | Blocks |
|---|---|---|
| Source of record for `yamnet.tflite`, and authorised predecessor-file access if (a) | Vukosi (review: Lethabo) | L1, L3 only; U1–U19 proceed |
| OK to install `ai_edge_litert` into `.venv/` | Vukosi | L3 only |
| None from Sibusiso/Ipeleng/Mutarisi/Khutso | n/a | n/a |

## 10 · Evidence, rollback and handoff

- **IMPLEMENTATION.md** records: executor tool and **actual model name**; `BASE_SHA` and `HEAD_SHA`; the red run output (tests failing before the implementation); the green run output; R1–R4 output; L1–L3 as PASS / FAIL / NOT RUN with the reason; observed digests and class-map commit; deviations from this TASK. Summaries are no substitute for pasted outputs.
- **The executor commits locally** (`feat(vukosi): P3.V2 YAMNet provenance gate and class map by label`). No push, no PR, no release.
- **Rollback:** `git worktree remove ../Geekulture-vukosi-p2a` and `git branch -D feat/vukosi-p3v2-yamnet`. No shared file changes, nothing published.
- **Review:** Claude reviews `HEAD_SHA` in a separate checkout (`git worktree add --detach ../Geekulture-vukosi-review <HEAD_SHA>`), independently re-downloads the class map, and writes `REVIEW.md`. Findings go back to the executor, and the new SHA is reviewed again. AI review ≠ Lethabo's review.
- **Downstream:** the P1 scaffold packet consumes `assert_input_details`/`score_to_bp` semantics for the Kotlin side. `eval_yamnet.py` (M1) reuses the verified model and mapping. Khutso receives nothing until a measurement exists.

## 11 · Executor prompt (Codex, suggested GPT-6 Sol medium; record the actual model)

```text
I am Vukosi Khoza. Implement ONLY docs/workflows/vukosi/p2a-yamnet-provenance/TASK.md.
Read docs/MASTER-CONTEXT.md, AGENTS.md, RULES.md, team/vukosi.md and that TASK in full first.
Work in a NEW worktree ../Geekulture-vukosi-p2a on branch feat/vukosi-p3v2-yamnet from the BASE_SHA I give you;
never edit C:/Users/khoza/Desktop/Geekulture-vukosi-workflow or C:/Users/khoza/Desktop/Geekulture.
Touch only TASK §4 files. Python 3.12 standard library only (py -3.12). Write the §7 unit tests first,
run them and keep the failing output, then implement until they pass. Unit tests must not use the network.
Never commit yamnet.tflite, the class map or any audio; never edit docs/MODEL-LICENCES.md, docs/EVIDENCE.md
or .gitignore; do not install packages unless I say yes in chat. If the model digest does not match the
register, stop and report the observed digest - do not "fix" the register. Do not invent a model URL.
Record actual commands, outputs, your tool and model name, BASE_SHA and HEAD_SHA in IMPLEMENTATION.md,
add the running-log line and new build-log entry, commit locally, and stop. No push, PR, comment or release.
Report every live check as PASS, FAIL or NOT RUN with the reason.
```
