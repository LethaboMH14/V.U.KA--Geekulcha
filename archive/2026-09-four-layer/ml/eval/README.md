# ml/eval/ — calibration, false-alarm budget, bias evaluation

The harness that turns "we believe this model is fair/calibrated" into a number
someone else can check. Satisfies E6, G1, G9 (`docs/00-SPEC.md` §2.3, §7).

**Empty scaffold.** No code lands here yet — see `docs/HANDOVER.md` Task 4.

## Files to be added

| File | Does |
|---|---|
| `calibration.py` | Reliability diagram + Expected Calibration Error (ECE) for `brain/`'s fusion output. **Must be run on real data and published, including if it looks bad** — this is G1 in `docs/OPEN-GAPS.md`, gated at G4 · Calibrate (23 Sep) |
| `fa_budget.py` | False-alarm budget tracker against N9 (≤ 1 false alert per camera-week) |
| `bias_eval.py` | Demographic performance evaluation on the face-matching pipeline. **Currently not run** — this is G9 in `docs/OPEN-GAPS.md`, gated at G5 · Harden (24 Sep). Until it runs, the stated answer to the NIST FRVT demographic differentials (up to ~2 orders of magnitude false-positive rate difference) is itself untested, and must not be presented as answered |

## Non-negotiable, before any code lands here

- **A reliability diagram that isn't run on real data is not a reliability diagram.** The parameter file it evaluates (`brain/`'s fusion weights) must self-label `PROVISIONAL — NOT fit on real data` until this harness actually runs against labelled data.
- **Publish the numbers that embarrass us.** It is the only reason anyone should believe the ones that don't (`CLAUDE.md` §5, principle 12).
- Face-match thresholds (0.55 candidate, 0.65 verify-suggest, cosine similarity) are **targets, uncalibrated**, until this harness runs — never state a false-match rate anywhere without it.
