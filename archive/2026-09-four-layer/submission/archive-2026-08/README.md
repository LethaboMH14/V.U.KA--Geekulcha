# Archive — superseded, August 2026

Everything in this folder is the **August submission**: `VUKA-Pitch-Deck.pdf`, `VUKA-Pitch-Deck.pptx`, `VUKA-Architecture.html`, the 24 `slides/Slide*.JPG` exports, and the three generated `pdf/` documents (`VUKA-SDLC.pdf`, `VUKA-SDLC-Gap-Analysis.pdf`, `VUKA-System-Architecture.pdf`).

**It is not current. Do not present it as current.** It carries figures corrected on 14 September 2026:

| Claim in this archive | Now corrected to |
|---|---|
| "~2.7m registered security officers vs 180k police" | **~637,675 active vs 155,231 sworn / 187,681 total ≈ 4:1** — see `docs/EVIDENCE.md` |
| "27 ADRs" | **25** — see `docs/EVIDENCE.md` |
| "440 test cases" | **Unreproducible as stated.** 510 test-function definitions found by `git grep`, or run the suites — see `docs/EVIDENCE.md` |
| "TRL 5" | **TRL 4**, two subsystems argued at 5, ceiling named — see ADR-0027, `docs/EVIDENCE.md` |
| "R1.30/month" anchoring cost | Computed off Hedera's pre-2026 price; corrected to ~R9–10/month (Hedera, current price) or ~R0 (OpenTimestamps primary) — see `docs/EVIDENCE.md` "Anchoring cost" and `docs/ANCHOR-RATIONALE.md` |
| No named competitor anywhere | Vumacam comparison now in `docs/PLAN.md` §B2 and `docs/ANCHOR-RATIONALE.md` |

**Why it's kept, not deleted:** it is a real artefact of real work, and the team operating rule is that the repo holds exactly one *current* version of any claim while superseded material moves to a dated, clearly-labelled archive — never silently vanishes. `docs/BUILD-LOG.md` and `docs/EVIDENCE.md` legitimately keep old figures too, as historical record with the correction alongside; this folder is the same principle applied to the generated deck and PDFs.

**What replaced it:** `docs/PLAN.md` (the current plan), `docs/MASTER-CONTEXT.md` (theme, criteria, showcase), `docs/EVIDENCE.md` (current figures with provenance), `docs/ANCHOR-RATIONALE.md` (the blockchain-track argument, corrected). A new deck build, when produced, replaces the files here as the live submission artefact — this folder does not get new files added to it going forward; it is a snapshot of one dated moment.

Moved here 14 September 2026, `docs/BUILD-LOG.md` has the entry.
