## 2026-10-27 | Sibusiso, with Claude Code assistant | Claude Code (assistant) | Explainer video: the journey in the simulated preview, replacing the 0.0.15 demo cut | PROPOSED

**Research** — Read the uploaded `VIGIL-0.0.15-demo-89s` cut frame by frame (contact sheet, every 4 s), and its audio level. Read `scripts/screens/record-journey.cjs`, `README.md`, `docs/venture/08-DEMO-VIDEO-PLAN.md`, `docs/venture/09-AFRETEC-SHOWCASE.md` §3–§4, `docs/EVIDENCE.md` (digital banking crime and kidnappings rows), `docs/eval/cem1-measurements.md`, and `app/android/.../detect/AudioPipeline.kt` (its header comment on what is kept in memory). Checked the 110,074 figure against `docs/ECONOMICS-VIGIL-ANCHOR.md` and `EVIDENCE.md`.

**Real data / references** —
- Old cut, `VIGIL-0.0.15-demo-89s`: 89 s, 1280×720, H.264 with an AAC track (mean −21.4 dB, max −0.6 dB). The audio was not transcribed and is not reused. Frames show: "ALWAYS ON" and "VIGIL listens on the phone. No audio ever leaves it." captions; a "LIVE-VERIFIED" badge on a ledger screen; "Nobody has to trust us" and "Anyone can check her record in a browser" (both need the server, which is not running, `06` §0); "110,074 incidents in one year, SABRIC 2025", which `EVIDENCE.md` marks secondary (⚑) and `ECONOMICS-VIGIL-ANCHOR.md` lists as FACT; a "Team SONAR" credit; an install QR (the target was not checked). **Not reused. Recommend it is withdrawn from any showcase or submission use.**
- `EVIDENCE.md`: R2.4bn gross losses, calendar 2025 (`FACT`, SABRIC 2025). 17,061 kidnappings in FY2023/24, up 264% from 4,692 in 2014/15; 44% during a hijacking (`FACT`, SAPS via ISS Africa, 3 Dec 2024).
- `AudioPipeline.kt`: "Raw audio never leaves memory: a 3 s ring buffer, zeroed on stop, and nothing is written anywhere." Read today; not run on a device (`ASSUMPTION` until a device run).
- `docs/eval/cem1-measurements.md`, as recorded (`FACT`, not re-run): glass 46.0% (n = 139), gunshot 54.6% (n = 108), shatter 72.9% (n = 70), scream 6.5% (n = 108). ESC-50 false check-ins 1.8/h (folds 1–3) and 7.3/h (folds 4–5), a stress test, not a field rate. Thresholds uncalibrated.
- New cut, `journey-v3` (scratchpad, not committed): recorded in the browser from the app's real code in its simulated preview. Setup trimmed at `setupEndMs` 14 874 ms. Clip 41.8 s. Final file 65.97 s, 1920×1080, 30 fps, no audio stream (`ffprobe`).
- The preview made no outside request in the earlier offline runs (n = 1 each, `docs/build-log/entries/2026-10-27-sibusiso-afretec-prep-verification.md`). Not repeated for this recording.

**Business reasoning** — The old cut's claims would not survive a delegate's first question: it uses "always on", a live badge, and a server-dependent verify line the team cannot demonstrate on 28 Oct. A video that says it is a simulated preview and shows the real screens is the only one the team can show with no server, and it is honest about what the judges and funders will ask.

**Competitor reference** — Not applicable.

Changed:
- `scripts/screens/record-journey.cjs`: captions rewritten to `09` §4 and the ledger (`MASTER-CONTEXT` §6). Home: "listens from Activate until she deactivates it", with the "all the time" wording flagged as under review (D7). Duress: "identical in this preview, one run". Guardian: "a fixed preview, not a set-up guardian (this demo account has none)" and the GBV review pending (D12).
- `scripts/screens/journey-cards.py` (new): title, problem, "What it can't do" and "Measured, not claimed" cards. Every figure carries its source on the card. Reproduces the four PNGs byte-for-byte from the scratchpad run.
- `scripts/screens/README.md`, "Journey recording": the exact build, record, trim and join commands.
- This entry.
- The final MP4 is in the session scratchpad and was sent to the user. It is not committed (binary; the repo keeps recipes).

Evidence:
- `node record-journey.cjs` exit 0 (setup 14.9 s, total 58.5 s). `ffmpeg` join exit 0. `ffprobe`: 1920×1080, 30 fps, 65.97 s, no audio stream.
- Frame review: the captions and the Alert copy render; the measured card's four figures match `cem1-measurements.md`.
- `python3 -I journey-cards.py` against the scratchpad build reproduces the four cards exactly.
- `git diff --check` and `node scripts/check-docs.mjs` run before the commit.
- **Not run:** a phone recording; a timed read-through; any check from the venue network; the Ledger shot (needs the network this sandbox cannot reach, `07` §8).

Decision: none. The narration decision is open (below).

**Review gates (`MASTER-CONTEXT` §10), for this video.** 1 Fraud red-team: no record proves duress; the video says "it can't prove she was forced" and "a missing record is never evidence against anyone". 2 Build for use: browser rendering on a laptop; no claim about a 2–3 GB phone; the phone demo stays off. 3 Economic integrity: the only figures are the detection numbers (with n) and the two 2023/24–2025 crime figures with sources; the R570 and break-even figures are not in the video. 4 Privacy: the demo name "Lerato" and the test member are fixtures; the guardian wording is under D12. Criterion **S** (honest labels, measured numbers with n) and **U** (it runs with no server, so the judges can see the screens).

Needs/blockers:
- Sibusiso: approve the video before it goes to anyone. It has no narration (a voice-over costs ElevenLabs credits; it needs a go, and the script must be checked against `MASTER-CONTEXT` §6 first).
- Sibusiso: decide whether to withdraw the `0.0.15` cut everywhere it was shared (the upload was given to me; I have not shared it).
- D7 (the "all the time" Home wording) and D12 (the guardian alert wording, GBV review) are still open; the video says so on screen.
- D9: any phone footage needs a company-owned server.

Business handoff: not applicable. The video is not published or sent to anyone by the assistant.

Next: Sibusiso reviews the MP4 and says yes or no. If yes, a 90-second version with the same captions can follow the `09` §4 timing, and the decision on a voice-over goes to both founders.
