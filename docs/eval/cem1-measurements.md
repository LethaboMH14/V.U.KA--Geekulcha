# CEM-1 measurements (step d, first pass) — 26 Sep 2026

Method: `scripts/eval/yamnet_windows.py` (the registered YAMNet, the phone's windowing, now with context scores) and `scripts/eval/run-cem.mjs` (the phone's engine, tracker and grader compiled from source). Each clip is run from a fresh state under V4 and under CEM-1.
- **Positives:** the FSD50K eval set (CC0/CC-BY; ids in `scripts/eval/fsd50k-cliplist.txt`) and ESC-50 glass_breaking.
- **Negatives:** the other ESC-50 categories. They are dense isolated events, **a stress proxy, not a field false-alarm rate**.
- **Counts are small:** 1–9 prompts per 0.54 h split, so the rates are wide. Exact Poisson intervals are still to be added.

## Catch rate: a check-in opens (FSD50K eval, all 425 clips; shipped ruleset, record threshold = ½ prompt)

| Class | n | V4 | CEM-1 |
|---|---|---|---|
| Glass | 139 | 46.0% | 52.5% |
| Gunshot/gunfire | 108 | 54.6% | 57.4% |
| **Screaming** | 108 | **6.5%** | **10.2%** |
| Shatter | 70 | 72.9% | 75.7% |

**Screams are mostly missed.** 29 of 108 scream clips have a window at or above the scream threshold, but only 6 pass the two-window voice confirmation. 27 clips are shorter than three windows, so they can never confirm. The designed trade-off ("a very short scream is missed") is now measured.

## False check-ins (ESC-50 negatives, prompts per hour of audio)

| Split | V4 | CEM-1 (½ record threshold) | of which lifts |
|---|---|---|---|
| Folds 1–3 (tune) | 1.8 | 7.3 | 5.5 |
| Folds 4–5 (validate) | 7.3 | 16.5 | 9.2 |

## Threshold sweep

The sweep was tuned on folds 1–3 plus the even FSD50K ids, and validated on folds 4–5 plus the odd ids.
- **Tuning result:** the best candidate on the tuning half was voice separation 1 with the record threshold at 0.8. It raised scream catch 3.9% → 13.7% with no extra false prompts.
- **It did not validate.** On held-out data, scream catch stayed at 8.8% and false prompts were 9.2/h against V4's 7.3/h.
- **Conclusion:** no ruleset change is justified by this data. The record threshold stays PROPOSED, and ADR-0047's cost section stands.

Next: exact intervals; a scream-specific rule (single window at a higher bar) measured the same way; venue recordings for the field rate (M2).
