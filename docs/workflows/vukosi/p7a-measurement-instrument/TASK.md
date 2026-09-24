# Packet P7a: measurement-report instrument (M1 / M2 / M3 statistics)

**PROPOSED packet, prepared 23 Sep 2026 by the Claude Code assistant at Vukosi's request.** Not yet accepted by Vukosi, no human approval. It builds the **instrument** for P3.V6 (issued target Sat 26 18:00). It measures nothing and produces no figure.

## 1 · Criterion and trust answer

**T** and **B**. *Would a real user trust and use this?* A detection, false-alarm or latency number is trusted only if it shows how it was counted. Vukosi's rule: "Never state a number I have not measured. Build the instrument before the claim." This packet makes the honest report the only report the tooling can produce: counts before rates, "insufficient n" instead of a percentile, and lost attempts kept in the denominator.

Gates: **fraud:** not applicable. **Budget phone:** not applicable, host-side only. **Economics:** no figure. **Privacy:** no audio in code, inputs, tests or outputs. Input files hold IDs, licences, scores and timings only.

## 2 · Pins

| Pin | Value |
|---|---|
| Spec | `docs/VUKA-2-SPEC.md` §16 M1, M2, M3, plus §3 basis points. Rules: `RULES.md` ("Measured figures include method, configuration and sample size") |
| Base | `ccd2f8a0939679304465935ebc62cb6ab4645a09` (P2a HEAD, local only, stacked). New worktree `../Geekulture-vukosi-p7a`, branch `feat/vukosi-p3v6-eval-instrument`. Rebase once #43 and P2a land |
| TASK location | Uncommitted in `C:\Users\khoza\Desktop\Geekulture-vukosi-workflow`. Read it **read-only** from there |
| Python | `py -3.12`, **standard library only** |
| Dependencies | None. Independent of contract v2, `shared/`, R1–R3, the model and the toolchain |

## 3 · Objective and non-goals

Build `scripts/eval_yamnet.py`, a report generator over **precomputed result files**. It turns per-clip scores, alarm events and paired latency rows into a report where every figure carries its counts, method and configuration.

**Non-goals.** No model loading and no inference. No audio reading, and no FSD50K or ESC-50 download. No threshold tuning or recommendation. No writes to `docs/EVIDENCE.md` (Khutso owns it). No clip lists or real results committed. No `.gitignore` edit. No claim that any threshold works.

## 4 · Allowed files

- `scripts/eval_yamnet.py` (new)
- `scripts/tests/test_eval_yamnet.py` (new)
- `docs/workflows/vukosi/p7a-measurement-instrument/IMPLEMENTATION.md` (new)
- `team/vukosi.md`: running-log line only
- a new build-log entry named `docs/build-log/entries/2026-09-23-codex-p7a-measurement-instrument.md` (or the actual date)

Anything else means stop and record it as a blocker.

## 5 · Input formats (PROPOSED, ours to define; JSON only, since `*.csv` is gitignored)

```jsonc
// M1: --m1 file. One row per clip; the score is the class's max window score in integer basis points.
{"config": {"model_sha256": "<64 hex>", "threshold_bp": 6000, "class": "Screaming",
            "dataset": "FSD50K", "dataset_version": "<str>"},
 "clips": [{"clip_id": "sim_0001", "licence": "CC-BY-4.0", "score_bp": 7200}]}

// M2: --m2 file. Armed ambient runs and the alarms they raised.
{"config": {"model_sha256": "<64 hex>", "threshold_bp": 6000, "refractory_s": 10},
 "runs": [{"run_id": "sim_r1", "armed_seconds": 1800, "consent_recorded": true,
           "alarm_times_s": [12.0, 14.5, 400.0]}]}

// M3: --m3 file. One row per attempt, paired IDs; null when nothing displayed.
{"config": {"clock_offset_ms": 12, "clock_uncertainty_ms": 30, "network": "sim_wifi"},
 "attempts": [{"attempt_id": "sim_a1", "detected_at_ms": 1000, "displayed_at_ms": 1900}]}
```

Output (`--out FILE`, also printed): JSON with one `report` object per measure. Every rate object carries `numerator`, `denominator`, `n`, the `config` echo and `method` text. No rate appears without those.

## 6 · Behaviour to specify

- **M1:** `numerator` = clips with `score_bp >= threshold_bp`; `denominator` = clips. Add a Wilson 95 % interval (z = 1.959963984540054). `threshold_bp` must be an integer in [0, 10000], never a float. Every clip needs a non-empty `clip_id` and `licence`. Duplicate `clip_id` is an error. Denominator 0 → `status: "not_measured"`, never a division.
- **M2:** alarms closer than `refractory_s` to the previous *counted* alarm in the same run are merged, so one event is one alarm. `false_alarms_per_hour = counted_alarms / (sum(armed_seconds) / 3600)`. Report `counted`, `raw`, `armed_seconds_total` and the run count. Reject `consent_recorded` ≠ true. Total armed time 0 → `not_measured`. The report states that this is a **limited-sample estimate**, not a field rate.
- **M3:** latency = `displayed_at_ms - detected_at_ms - clock_offset_ms`. A `null` displayed time counts as **lost**: it stays in `n` and in `lost`, and is never dropped. **n < 30 attempts → `status: "insufficient_n"`, no median or p95, but counts still reported.** Otherwise report median, p95 (nearest-rank, over delivered only), min, max, `lost`, and the echoed clock offset and uncertainty. A negative latency after offset correction is flagged `clock_suspect` and counted, not silently clamped.
- Unknown fields, wrong types, bool where int is required, NaN or inf → exit 2 with a specific message.
- Exit codes: 0 report produced (including `not_measured` / `insufficient_n`); 2 invalid input; 3 a file could not be read.

## 7 · Acceptance oracle: write first, run red, then implement

All tests offline, using `sim_` inputs. Hand-computed expected values are given here, and the executor copies them rather than deriving them from its own code.

| # | Case | Expected |
|---|---|---|
| E1 | M1, 10 clips, 8 at or above threshold | `numerator` 8, `denominator` 10, Wilson `[0.4902, 0.9433]` (4 dp) |
| E2 | M1, 0 of 10 / 10 of 10 | `[0.0, 0.2775]` / `[0.7225, 1.0]` |
| E3 | M1, score exactly equal to threshold | counts as detected (`>=`) |
| E4 | M1, empty `clips` | `not_measured`, exit 0 |
| E5 | M1 threshold 0.6 / "6000" / true / 10001 / -1 | exit 2 each |
| E6 | M1 duplicate `clip_id`; empty `licence`; missing `clip_id` | exit 2 each |
| E7 | M2, one run, 1800 s armed, alarms at 12.0, 14.5, 400.0, `refractory_s` 10 | `raw` 3, `counted` 2, rate 4.0 per hour |
| E8 | M2, alarm exactly `refractory_s` after the counted one | counted separately (boundary is `>=`) |
| E9 | M2, two runs of 1800 s with 1 counted alarm each | 2 / 1 h = 2.0 |
| E10 | M2, `consent_recorded` false or missing; `armed_seconds` 0 / negative | exit 2 / `not_measured` (0) / exit 2 (negative) |
| E11 | M3, 29 attempts | `insufficient_n`, no percentile keys, `n` 29 |
| E12 | M3, 30 delivered with latencies 1..30 ms, offset 0 | median 15.5, p95 **29**, min 1, max 30, `lost` 0 |
| E13 | M3, 30 attempts, 3 with null display | `n` 30, `lost` 3, percentiles over the 27 delivered only, denominator still 30 |
| E14 | M3, offset makes one latency negative | `clock_suspect` count 1, value not clamped |
| E15 | M3, clock offset/uncertainty absent | exit 2 |
| E16 | Any report | contains `config`, `method`, `n`; a fixed-size structure test asserts no rate object lacks its counts |
| E17 | Any input containing a key or string value ending `.wav .mp3 .flac .ogg` | exit 2 (audio must not travel through this tool) |
| E18 | Network guard (`socket.socket` patched to raise) on the whole suite | passes |

Repository checks: `git ls-files '*.csv' '*.tflite' '*.wav'` shows only the pre-existing `research/results/anchor-scale-scenarios.csv` (say so, do not "fix" it). The docs, intake and contract checks stay green. Gitleaks finds no leaks. `git diff --check` is clean. **No live check exists** for this packet. State that nothing here is a measurement.

## 8 · Rollback, evidence, review

- Rollback: `git worktree remove ../Geekulture-vukosi-p7a` and `git branch -D feat/vukosi-p3v6-eval-instrument`. Nothing shared is changed.
- IMPLEMENTATION.md records: executor and **actual model name**, BASE_SHA and HEAD_SHA, the red run output, the green run output, the repository checks, and any deviation. Pasted outputs, not summaries.
- Commit locally. No push, PR, comment or release.
- Claude reviews HEAD in a separate checkout and writes REVIEW.md. AI review is not Lethabo's review.
- Downstream: the M1 inference runner (needs the model plus `ai_edge_litert`, after P2a's L1/L3), Khutso's EVIDENCE rows (method, config, n), Babatunde's claims.

## 9 · Executor prompt

```text
I am Vukosi Khoza. Implement ONLY docs/workflows/vukosi/p7a-measurement-instrument/TASK.md.
Read docs/MASTER-CONTEXT.md, AGENTS.md, RULES.md, team/vukosi.md and that TASK in full first. The TASK is uncommitted in
C:/Users/khoza/Desktop/Geekulture-vukosi-workflow: read it read-only from there and never edit that checkout or
C:/Users/khoza/Desktop/Geekulture or ../Geekulture-vukosi-p2a.
Create a NEW worktree ../Geekulture-vukosi-p7a on branch feat/vukosi-p3v6-eval-instrument from BASE_SHA
ccd2f8a0939679304465935ebc62cb6ab4645a09.
Touch only TASK section 4 files. Python 3.12 standard library only (py -3.12). Write the section 7 tests first with the
hand-computed expected values from the TASK, run them and keep the failing output, then implement until they pass.
Do not derive expected values from your own implementation. Tests must not use the network.
No model, audio, dataset, real result or CSV in the repo. Do not edit docs/EVIDENCE.md, docs/MODEL-LICENCES.md or .gitignore.
Do not tune or recommend a threshold. Nothing here is a measurement: say so in IMPLEMENTATION.md.
Record actual commands, outputs, your tool and model name, BASE_SHA and HEAD_SHA there, add the running-log line and a
new build-log entry, commit locally, and stop. No push, PR, comment or release. Report the pre-existing tracked CSV as
inherited, not as your failure.
```

Suggested model: GPT-6 Sol at medium. Record whichever actually runs.
