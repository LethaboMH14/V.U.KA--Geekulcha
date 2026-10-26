## 2026-10-26 | Sibusiso, with Claude Code assistant | Claude Code | Refocus from FNB to the AFRETEC E-Hub Tech Showcase (28 Oct) | PROPOSED

**Research** — Sibusiso's instruction (26 Oct): leave the SSDLC and everything from the FNB hackathon; prepare for the AFRETEC demo day. Read his calendar entry for the event, the Wits AFRETEC pages through a web search, and the earlier plans (`05`, `07`, `08`).

**Real data / references** —
- Calendar entry "AFRETEC E-Hub Tech Showcase (Wits E-Hub)", Wed 28 Oct, from 15:00 SAST: "Showcase VUKA / PILOTCORE to AFRETEC conference delegates". Its 17:00 end is marked in the entry as an assumption (`FACT` for the entry).
- AFRETEC: a pan-African network of six universities; Wits takes part and the E-Hub hosts its student-entrepreneurship work (`REPORTED`, search extract of wits.ac.za pages). No public page for this showcase was found.
- `HEADLESS=1 node scripts/screens/showcase.cjs` against a local build: "On Home. Test PINs: normal 1357, duress 2468."

**Business reasoning** — The delegates are an academic and partner audience: they reward measurement and honesty over a sales pitch, so the judges' pitch and deck fit. With no company server, the only demo that cannot fail is the real UI in its labelled simulated preview, so it is the default; the phone demo is attempted only if a server is up and tested.

Changed:
- `docs/venture/09-AFRETEC-SHOWCASE.md` (new): event facts and unknowns, deck choice, ranked demo options, a two-minute walkthrough, Q&A, Tuesday checklist.
- `scripts/screens/showcase.cjs` (new) and a "Showcase" section in `scripts/screens/README.md`; `.gitignore` ignores the build output.
- `docs/venture/07-EHUB-ALIGNMENT-AUDIT.md` and `08-DEMO-VIDEO-PLAN.md`: FNB, SSDLC and Lean Canvas items removed. Earlier build-log entries are left as written.

Evidence: `git diff --check` clean; `node scripts/check-docs.mjs` passed.

Decision: none.

Needs/blockers: approval of the two staged Canva previews; the E-Hub's answers on format and time; a decision on the phone demo (needs D9).
