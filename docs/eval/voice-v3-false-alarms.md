# Voice ruleset v3: false-alarm check (14 Oct 2026)

Compares the shipped v2 voice rules (Shout/Yell 6000, Screaming 4500, voice
`separation: 2`) with v3 (3500/3500/3000, `separation: 1`) on the same audio,
using the phone's own engine, tracker and grader (`scripts/eval/run-cem.mjs`).
Glass and gun-like bars are identical in both.

**Status: a false-alarm stress proxy only. Short-call recall is NOT measured.**

## Method
- Audio: ESC-50, the 824 clips in `scripts/eval/esc50-cliplist.txt` (40 glass
  breaking; 784 other categories, 1.09 h). Audio is not committed.
- Model: registered YAMNet `10c95ea3…`, phone windowing (`yamnet_windows.py`).
- Each clip is scored from a fresh state. Per-hour figures are a dense,
  isolated-event stress proxy, not a field false-alarm rate.

## Result (784 non-glass clips, 1.09 h)
| | v2 (before) | v3 (after) |
|---|---|---|
| Check-in prompts per hour, V4 level | 4.6 | 6.4 |
| Check-in prompts per hour, with CEM-1 lifts | 11.9 | 13.8 |
| Record-only evidence per hour | 1.8 | 1.8 |
| Glass catch rate (40 clips), V4 / CEM-1 | 82.5% / 92.5% | 82.5% / 92.5% |

Only **2 of 784** clips changed their V4 prompts, both from nothing to
"Screaming": one `coughing` clip (`1-58792-A-24`) and one `laughing` clip
(`4-132816-A-26`).

## What this does and does not show
- It shows glass behaviour is unchanged, and that the new voice bars add
  about 1.8 prompts per hour on this audio, from coughing and laughing.
- ESC-50 contains **no shouts, yells or screams**, so this cannot show that a
  short "Help!" now triggers. That recall is still **not measured**; it needs
  licensed or team-recorded voice clips (FSD50K eval, or M2 recordings).
- ESC-50 also has little dense speech, shouting or crowd noise, so the real
  rate in taxi ranks, sport or near a TV is unknown.
- Values remain UNCALIBRATED. Do not call them tuned or validated.
