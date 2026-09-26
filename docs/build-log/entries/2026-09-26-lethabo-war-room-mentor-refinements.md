## 2026-09-26 | Lethabo (co-lead), via Claude Code assistant | War-room pitch revision 2: mentor feedback + the shipped app | PROPOSED — for Babatunde

**Research** — Read Babatunde's `docs/WAR-ROOM-PITCH.md` and `pitch-deck-outline.md` (this branch's base, `docs/babatunde-war-room-and-access-model` @ ca8f082). Checked each spoken line against the app we ship (Mutarisi's native app, `feature/integrate` @ f9bdb29: `DetectionEngine.kt`, `CheckinActivity.kt`, `AudioPipeline.kt`, his 26 Sep build-log entries), the server (`server/event_effects.py`, `server/escalation.py`) and the measured detection numbers (`docs/eval/cem1-measurements.md` on `feat/lethabo-vigil-events`).

**Real data / references** — Mentor feedback card from the war-room session on 26 Sep (Katleho Madaba, Boxfusion): daily vs genuine distress; Android only, not iOS; users' privacy; an MVP would have been the cherry on top; give a story line with the problem statement. Detection numbers are `FACT` from the file above (FSD50K eval: Glass 46.0%, Gunshot 54.6%, Shatter 72.9%, Screaming 6.5%; ESC-50 false check-ins 1.8 and 7.3 per hour, a stress proxy). Spoken length counted by script: 765 words (~5.1 min at 150 words/min), against 759 in revision 1.

**Business reasoning** — The mentor's questions are the ones a bank or insurer buyer asks first: will it cry wolf, does it work on my customers' phones, what does it keep. Answering them in the spoken pitch, with the measured numbers ready on the Q&A card, keeps the sale inside what the demo does.

**Competitor reference** — Unchanged from revision 1 (Namola, FNB GuardMe, Discovery Bank Panic Code, Google Personal Safety, Apple Check In).

Changed:
- `docs/WAR-ROOM-PITCH.md`: Beats 1–2 are now one illustrative person's evening (labelled as a composite in the proof bank). New Beat 4B (everyday noise vs real distress: a sound only opens a Journey check; normal PIN, duress PIN, no answer). New Beat 4C (the MVP, live). New Beat 4D (privacy). Beat 3 says Android only, and why. Part 2 adds the full distress answer with the measured numbers, an Android note, the privacy detail, a demo checklist, and a table of the revision-1 lines that were removed and why.
- `pitch-deck-outline.md`: the demo must-haves are filled in; a "Mentor refinements" block is added; the hook and solution beats name the story line, Android-only and the Journey check.

Evidence: word count by script (above). No code, spec, ADR or contract changed.

Decision: none. Babatunde owns the pitch; this is offered as a PR into his branch for him to accept, edit or reject.

Needs/blockers:
- The MVP beat needs `/v1/guardians/accept` to work on Azure (503 earlier on 26 Sep; Sibusiso holds the server signing key).
- Hedera: the first root was confirmed on **testnet** at 21:57 SAST (topic 0.0.10687280, message 7). Say "Hedera testnet", never "mainnet".
- The duress-law line from revision 1 needs a named expert and a legal source before it returns.

Business handoff: to Babatunde for the war-room presenters. No pricing change.

Next: Babatunde reviews; the team runs the demo checklist on two physical phones and records the fallback video.
