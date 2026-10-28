## 2026-10-28 | Sibusiso, with Claude Code assistant | Claude Code (assistant) | Judges' deck slide 7: enterprise framing for the cost line | PROPOSED

**Research** — Read slide 7 of the saved judges' deck (`DAHZIXLh5mk`) through the Canva tools; `docs/venture/01-B2B-ENTERPRISE.md` §5–§6 (offers N1–N3, N2's hard parts, pricing); `docs/venture/05-TWO-PITCHES.md` §5 (fixed-cost models); `docs/venture/04-SLA.md` §4.4.

**Real data / references** —
- Sibusiso asked to change slide 7's business model to "the 570 a month" because the direction is B2B enterprise. R570 a month is the public-anchoring cost ceiling (`ESTIMATE`, `scripts/economics_vigil_anchor.py`), a cost and not a price. The fixed-cost models are R156,683.98 a month with five stipends and R66,683.98 with two (`ESTIMATE`, `05` §5), so a flat R570 charge could not fund the company. Asked which reading was meant; Sibusiso chose "enterprise framing, keep both costs".
- Slide 7 now keeps "Public anchoring: at most about R570 a month, whatever the member count" and reads "Enterprise route: backend inside the partner's systems (PROPOSED). Until then, our hosting at scale: R7,860 to R8,360 a month before VAT". The footer adds "Partner-hosted backend: PROPOSED (docs/venture/01-B2B-ENTERPRISE.md §5, offer N2)." The staged render fit the slide; the saved version was committed on 28 Oct (`committed` per the Canva tool).
- Slide 7's presenter notes were rewritten to match: the enterprise line, how the money works (about R20 per protected member per month, `ASSUMPTION`, plus a proposed integration fee), "do not call R570 our price", and who hosts it today (nobody; no company-owned server, `06` §0).

**Business reasoning** — The buyers are bank and insurer teams. Telling judges that the backend could run inside a partner's systems, while still showing our own hosting cost until that happens, matches the B2B direction without hiding a real cost.

**Competitor reference** — Not applicable.

Changed: Canva slide 7 (cost line, footer, notes); `docs/venture/10-JUDGES-PITCH-SCRIPT.md` slide 7 stage notes; this entry. The spoken line and word count (357) are unchanged.

Evidence: Canva render checked before saving. `git diff --check` and `node scripts/check-docs.mjs` run before the commit. Not checked: the saved render at full resolution (Canva thumbnails can be stale).

Decision: none. **The investor deck's "The B2B model" slide (its slide 7) is a different slide and was not changed.** It still shows R20 per member per month and the R570 anchoring tile, and that deck is uncommitted.

**Review gates (`MASTER-CONTEXT` §10).** 3 Economic integrity: both costs stay on the slide with their tags; R570 is not presented as a price; the partner-hosted route is `PROPOSED`. Criteria **B**, **T**.

Needs/blockers: both founders on whether a partner-hosted backend is a real plan (needs counsel, security review and a partner); the investor deck's slide 7 if the same framing is wanted there.

Business handoff: not applicable.

Next: Sibusiso says whether the investor deck's "The B2B model" slide should get the same wording.
