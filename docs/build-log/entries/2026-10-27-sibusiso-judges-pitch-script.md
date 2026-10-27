## 2026-10-27 | Sibusiso, with Claude Code assistant | Claude Code (assistant) | Judges' pitch script for the saved judges' deck (`DAHZIXLh5mk`), for the AFRETEC showcase (`09` §2) | PROPOSED

**Research** — Read `docs/venture/05-TWO-PITCHES.md` in full (§4 judges' pitch, §5 numbers, §6 questions, §7 ownership). Read the saved text of the judges' deck through the read-only Canva tool (10 pages). Re-read `docs/venture/09-AFRETEC-SHOWCASE.md` §3–§5 and `docs/venture/07-EHUB-ALIGNMENT-AUDIT.md` §6 (the deck outline). Checked the detection figures against `docs/eval/cem1-measurements.md` (all four match). Checked the R2.4bn and 17,061 figures against `docs/EVIDENCE.md`.

**Real data / references** —
- Saved judges' deck: claim tags present; "No endorsement and no SAPS contact yet"; service levels marked "(proposed)"; "Not yet on a company-owned server" (Canva read, 27 Oct).
- Detection, as recorded (`FACT`, not re-run): glass 46.0% (n = 139), gunshot 54.6% (n = 108), shatter 72.9% (n = 70), scream 6.5% (n = 108).
- Walkthrough word count: 331 spoken words, counted from the file with `awk` (`FACT`). At 150 words a minute this is about 2 minutes 15 seconds (`ESTIMATE`; not timed aloud). Cuts for a flat two minutes: the slide 8 line (18 words) and the R2.4bn sentence on slide 2 (8 words), giving 305 words.
- R570 a month, anchoring ceiling (`ESTIMATE`, `scripts/economics_vigil_anchor.py`, as cited in the deck).

**Business reasoning** — Judges weigh feasibility, scale and honesty (`05` §2, `MASTER-CONTEXT` §10). A script that states the weakest figure (6.5% for screams, with n), the missing server and the missing endorsements is the one that can be trusted, and it avoids the lines the ledger forbids.

**Competitor reference** — Not applicable to the script. Panic-button comparisons (AURA, GuardMe, Discovery 911, Valor) are answered in `05` §6 and are not spoken in the two-minute version.

Changed:
- `docs/venture/10-JUDGES-PITCH-SCRIPT.md` (new): the spoken script for the ten slides, stage notes with tags and sources, decisions that change it (D6, D7, D9, D12), words not to use, the gates, and the corrections it found in other files.
- This entry.
- No change to `05`, `07`, `09` or any deck. The corrections are listed in the script's section 6 and not made.

Corrections found, not made:
- `05` §4 contains three lines this script drops: "passed fourteen of fourteen steps on a rerun" (not checked; the server is not running); "against our cloud server" (the cloud account was disabled on 15 Oct); "we're taking it to GBV organisations and a campus pilot next" (no organisation has agreed).
- `05` §3 and the funder deck cover say "demonstrated at the Wits E-Hub" in the past tense, before the showcase.
- Funder deck (saved): "Tamper-proof by design" still needs its staged change to "Tamper-evident".

Evidence: `git diff --check` and `node scripts/check-docs.mjs` run before the commit. **Not run:** a timed rehearsal; any review by a judge or a GBV reviewer.

Decision: none.

**Review gates (`MASTER-CONTEXT` §10).** 1 Fraud red-team: pass. The script says the record can't show what happened and that no absence of a record is evidence. 2 Build for use: pass for the simulated preview on a laptop; the phone demo is excluded (D9). 3 Economic integrity: pass for the figures spoken (R570 tagged `ESTIMATE`; no break-even or ask figure spoken, since D1 and D2 are open). 4 Privacy: open. The alert wording (D12) and the listening wording (D7) are not settled; the script says so. Criteria **B**, **T**, **S**; **I** for the Thandi story.

Needs/blockers:
- Sibusiso and Lethabo: decide D12 (alert wording) and D7 (listening wording) before the script is used. D6 (duress PIN at sign-in and sign-out) and D9 (server) are open too.
- Sibusiso: the E-Hub format and slot length (`09` §1). The script assumes two minutes.
- A timed rehearsal, twice, by the presenter.

Business handoff: not applicable. Nothing has been sent to anyone.

Next: the presenter rehearses the script against a timer and marks any line they can't say honestly. The assistant replaces the flagged lines once the decisions are made.
