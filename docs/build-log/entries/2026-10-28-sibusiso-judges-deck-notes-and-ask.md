## 2026-10-28 | Sibusiso, with Claude Code assistant | Claude Code (assistant) | Judges' deck: presenter notes on every slide, slide 8 figures, slide 10 ask reframed | PROPOSED

**Research** — Read the saved judges' deck (Canva `DAHZIXLh5mk`) element tree and notes through the Canva tools, `docs/venture/10-JUDGES-PITCH-SCRIPT.md`, `13-SLA-ROADMAP.md`, `01-B2B-ENTERPRISE.md` §5 (offers N1–N3, I1–I2 and the hard parts of N2), `11-HARD-QUESTIONS.md`, and `STAGED-DURESS-DEFENCE.md` §7 (the rejected wearable-correlation idea).

**Real data / references** —
- All changes were saved in Canva on 28 Oct at Sibusiso's request; each save is recorded as `committed` by the Canva tool (`FACT`).
- **Presenter notes:** slides 1–10 each carry the spoken line from `10`, tags and sources, answers if asked, and cut lines. Slide 8 carries the SLA roadmap from `13`. The saved notes were read back after the save (`FACT`).
- **Slide 8 figures:** "65 min" was clipped in Canva's render. Widening its box did not change the render; reducing the type did. All five figures (99.5%, 5 s, 10 s, 65 min, 1 hour) are now 62 px, down from 69 px (`FACT`, saved element tree). A faint red tick remains next to "65 min": moving the text off the slide left the tick in place, so it is in the background image. Sibusiso chose to leave it.
- **Slide 10 reframed (Sibusiso's direction, 28 Oct):** from a GBV-review ask to a safety, security and claims tool for banks and insurers. The slide now asks for an observe-only bank or insurer pilot, a SAPS introduction through CPSI on verified records, and a measured trial of wearable triggers (rings, earrings). It adds "Long term: our backend inside a bank's or insurer's own app" and states "PROPOSED. No bank, insurer or SAPS contact yet. Wearables not built." The not-claimed block is unchanged.
- **Script length:** 357 spoken words after the slide 10 change, about 2 minutes 23 seconds at 150 words a minute (`ESTIMATE`). Slide 1's note and `10` were updated to match.

**Business reasoning** — The buyers are bank fraud teams and insurer claims teams (`01` §4). An ask framed around their pilot, with SAPS and wearables as stated future routes, matches the B2B direction from the E-Hub, while every line still says nothing is agreed or built.

**Competitor reference** — Not applicable.

Changed:
- Canva `DAHZIXLh5mk`: notes on slides 1–10; slide 8 figure sizes; slide 10 ask text and notes; slide 1 timing note.
- `docs/venture/10-JUDGES-PITCH-SCRIPT.md`: status line, slide 10 spoken line and stage notes, total.
- This entry.

Evidence: Canva read-backs as above. `git diff --check` and `node scripts/check-docs.mjs` run before the commit. **Not run:** a timed read of the new script.

Decision: none recorded. **Two directions need a founders' decision before they are presented as plans:** wearable sensing (it reverses the rejection in `STAGED-DURESS-DEFENCE.md` §7 and adds a machine-learning claim the organisers warned about, `MASTER-CONTEXT` §3), and any SAPS role beyond member-consented exports (D11 and ADR-0036(1) say escalation goes to guardians only).

**Review gates (`MASTER-CONTEXT` §10).** 1 Fraud red-team: unchanged; the not-claimed block stays. 2 Build for use: wearables are labelled not built. 3 Economic integrity: no new figure. 4 Privacy: wearable health data flagged as likely special personal information under POPIA (`ASSUMPTION`). Criteria **B**, **T**, **S**.

Needs/blockers: both founders on the wearable direction and the SAPS role; the slide 9 "Community" slide still leads with GBV reviews and may need the same reframe.

Business handoff: the deck is the showcase deck; the PDF script copy sent on 27 Oct is now out of date for slide 10.

Next: Sibusiso reads the new slide 10 line aloud once; decide on slide 9.
