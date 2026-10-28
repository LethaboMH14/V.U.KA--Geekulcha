## 2026-10-28 | Sibusiso, with Claude Code assistant | Claude Code (assistant) | NotebookLM audio brief: prompt and sources for an explainer of the build, its problems and the fixes | PROPOSED

**Research** — Read `docs/venture/06-LAUNCH-ROADMAP.md` (§0, §2 safety blockers, §5 phases), the gaps table in `docs/venture/research/2026-10-18-repo-build-state.md` (c0–c15), and the "next" line in `docs/eval/cem1-measurements.md`. The problems and fixes in the prompt come from those files, `STAGED-DURESS-DEFENCE.md`, `01` and `11`. Checked that the repository's raw files are publicly fetchable.

**Real data / references** —
- All 14 raw links, pinned to commit `f33bc0d07a9984f77eb0179520afcb4ee0661a4c`, returned HTTP 200 from this sandbox on 28 Oct (`FACT`).
- The source pack is 14 files, 36,818 words, 233,162 bytes. The files are verbatim copies taken with `git show` at that commit. A short briefing note on top restates the current state and the honesty rules.
- A pattern scan of the 14 files for key-like strings (API keys, private-key headers, tokens, passwords) found none (`FACT`, `grep`; a pattern scan, not a full secrets audit).
- The full prompt is 3,197 characters (544 words); the short version is 498 characters (81 words). NotebookLM's limit for the customize box is not known here, hence the short version.
- The optional web sources are cited in `EVIDENCE.md` and the research notes. The assistant did not re-open them on 28 Oct.
- `repo-build-state.md` c15 tagged the release asset as 0.0.16 "from timing" (`ASSUMPTION`); the manifest read on 28 Oct confirms 0.0.16 (`2026-10-28-sibusiso-hard-questions-apk-servers.md`).

**Business reasoning** — An audio explainer lets delegates, judges and partner staff hear the build and its limits without a meeting. Feeding NotebookLM only current, tagged files keeps its hosts from repeating the claims the audit found wrong (the live server, "always on", no location sharing).

**Competitor reference** — Not applicable.

Changed:
- `docs/venture/12-NOTEBOOKLM-AUDIO-BRIEF.md` (new): how to use it, the full and short prompts, the 14 sources with pinned links, optional web sources, and files not to upload with the reason for each.
- This entry.
- The source pack and a plain-text copy of both prompts are in the session scratchpad and were sent to the user. They are not committed (the pack is generated from the files above).

Evidence: the commands above. `git diff --check` and `node scripts/check-docs.mjs` run before the commit. **Not run:** NotebookLM itself (no access from here); listening to any generated audio.

Decision: none.

**Review gates (`MASTER-CONTEXT` §10).** 1 Fraud red-team: the prompt requires the hosts to say VUKA doesn't detect staging. 2 Build for use: the prompt states what runs today and what doesn't. 3 Economic integrity: the prompt forbids estimating, and every figure it names is tagged in the sources. 4 Privacy: public repository files only. Criteria **S**, **T**, **B**.

Needs/blockers: Sibusiso generates the audio in NotebookLM and listens to all of it before sharing. AI hosts can still drop an n or use a forbidden word.

Business handoff: the audio, once checked, can sit beside the judges' deck as a take-away.

Next: if the audio misstates something, add the correction to the pack's briefing note and generate it again.
