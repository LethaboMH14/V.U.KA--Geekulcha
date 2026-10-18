## 2026-09-27 | Lethabo (co-lead), via Claude Code assistant | Final submission pack: 16-slide PDF, architecture diagram, Sonke fields | PROPOSED — for both leads and Babatunde

**Research** — `docs/MASTER-CONTEXT.md:36`: the 09:00 final submission needs more than 10 slides (problem justification with charts and pictures, solution, user journey story, technological architecture, competitive analysis, data privacy policies) plus a demo video under 90 s. Judging criteria: Innovation 15, Technical 15, Usability & Design 10, Security & Ethics 10, Business & Presentation 15, Quantum bonus 5. The plan was reviewed adversarially twice before any slide was written (findings applied: slide count, no stale sources, fee-ceiling wording, demo labelling).

**Real data / references** — Babatunde's registers: `docs/PROBLEM-STATEMENT-EVIDENCE.md` (branch `docs/babatunde-canvas-and-deck`), `docs/MARKET-DATA.md`, `docs/ECONOMICS-VIGIL-ANCHOR.md` and the output of `scripts/economics_vigil_anchor.py` (branch `docs/babatunde-war-room-and-access-model`); proof bank in `docs/WAR-ROOM-PITCH.md`; detection numbers `docs/eval/cem1-measurements.md` (app repo); security `docs/security/*`; live probes on 27 Sep (Azure `/healthz` 200, HTTP→HTTPS 301, TLS 1.3); Hedera testnet root #8; Sibusiso's handover `e287b1a` (first sign-up code delivered, n = 1). `docs/LEAN-CANVAS.md` (marked stale) and `docs/COMPETITORS.md` were not quoted.

**Business reasoning** — The judges score the submission, not the repo; every figure on it carries a tag and a source so it can be checked.

**Competitor reference** — Slide 10, from the war-room proof bank.

Changed: `docs/submission/VUKA-GKHack26-submission.pdf` (16 slides), `vuka-architecture.html` / `.png` / `.json` (archify, showcase validation 9/9 checks, 0 errors, 0 warnings), `SONKE-FIELDS.md`.

Evidence: every slide names its sources in its footer; charts are computed from the sourced figures (adoption curve recomputed from the published formula, p = 0.03, q = 0.38); an automated check found no content running into the footer on any of the 16 pages.

Decision: none. Lethabo uploads to Sonke.

Needs/blockers: the demo video (46 s) is uploaded by Lethabo with the PDF.

Business handoff: Babatunde — the business, market and go-to-market slides use your numbers unchanged; the kidnapping figure is cited to SAPS via ISS as in your register.

Next: real-app 30 s and 90 s videos after submission.
