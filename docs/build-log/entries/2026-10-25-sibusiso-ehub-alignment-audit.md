## 2026-10-25 | Sibusiso, with Claude Code assistant | Claude Code | E-Hub alignment audit (six points), demo-video plan, judges' deck outline | PROPOSED

**Research** — What was read before writing:
- The required reading in `AGENTS.md`, `docs/MASTER-CONTEXT.md` and `docs/venture/README.md`.
- The acting person's file `team/sibusiso.md` (work order and running log; no task in it covers this work, so it is recorded as assistant work at Sibusiso's request).
- `docs/venture/01` to `06`, `docs/venture/research/README.md`, `dashboard/IA.md`, `docs/WAR-ROOM-PITCH.md`, `docs/WAR-ROOM-PITCH-5MIN.md`, `docs/submission/SONKE-FIELDS.md`, `docs/LEAN-CANVAS.md` (marked stale in its header) and `docs/security/SSDLC.md` (23 Sep, `PROPOSED`).
- The Canva investor deck `DAHY_VcrKis` (text and presenter-note page list only; no edits).
- The two most recent entries in `docs/build-log/entries/`.
- App code for location and sharing (`app/src/ui/guardian.tsx`, `app/src/ui/map.tsx`, `app/src/ui/account.tsx`, `app/src/ui/record.tsx`).

**Real data / references** —
- `python3 -I scripts/economics_vigil_anchor.py` run on `origin/main` (7e4648d). It printed 10,973 members at R20 (5 stipends), 469 product-only, R14.28 contribution, R569.47 ceiling, R240 actuary test, 10,446 cases at R15 per bank, and ~4.1 months to break-even on a reference channel (`ASSUMPTION` channel, `FACT` parameters). `docs/venture/05-TWO-PITCHES.md` §5 says `main` prints 10,901; it does not. Recorded as a conflict; not edited here.
- `docs/eval/cem1-measurements.md` figures were quoted as recorded there and not re-run.
- The Canva deck's text was read on 25 Oct. The deck has 10 pages: problem on 2, product on 5, "Where we are" on 6, B2B model on 7, break-even and go-to-market on 8, the ask on 9.
- FNB App of the Year rules (26 Oct 23:59 SAST; ≤10 slides, demo login and link, ≤90 s video, SSDLC, Lean Business Canvas) are **not in the repository**. Taken from Sibusiso's message on 25 Oct.
- Real app and dashboard screenshots named in the brief (`app-13-home.png`, `dash-home.png`, `app-17-settings.png` and others) were searched for on the filesystem. **Not found.**

**Business reasoning** — The six E-Hub points are answered in the plans (`docs/venture/`) but not in any artefact a partner, judge or investor sees. The audit makes that gap visible and names the conflicts that would be caught in a partner's vendor review or a judge's questions: the Sonke fields' "server live" line, "always on" against the open listening model, the location statement, "tamper-proof" against the honesty ledger, and a stale break-even in `05`. Fixing these before the FNB submission and before any deck is shown costs less than a correction after it.

Changed:
- `docs/venture/07-EHUB-ALIGNMENT-AUDIT.md` (new): the six points × artefacts matrix, conflicts to resolve, the four review gates, the judges' deck outline (10 slides), the investor deck change list, and blockers.
- `docs/venture/08-DEMO-VIDEO-PLAN.md` (new): 90-second script, shot list, preconditions and acceptance. No recording exists and none is claimed.
- This entry.

No Canva design was created or edited. No contract, server, app or dashboard file was changed. Nothing was pushed to a partner, judge or organisation.

Evidence:
- `python3 -I scripts/economics_vigil_anchor.py` (output above).
- `git diff --check` on the staged files: clean.
- `node scripts/check-docs.mjs`: "Document contracts, required counts, local links and selected claim safeguards passed. Human fact/quality review is still required." (exit 0). This is the check that failed on 18 Oct over a dotted build-log filename; that file is no longer failing.
- Filesystem search for the named screenshots: no matches.

Decision: none. D1–D12 in `docs/venture/README.md` §3 remain for both founders. The audit proposes; it does not decide.

Needs/blockers:
- Sibusiso: re-supply the real screenshots (or approve a rebuild with the shim fixed); confirm the FNB rules text; decide whether the judges' outline is approved before a Canva design is created.
- Both founders: D1 (break-even model), D2 (the ask), D7 (listening model), D9 (company server), D6 (duress gap, a contract change).
- Lethabo: location behaviour on a device (app vs the 5-minute pitch); `05` §5 correction.
- Real Android phones for the demo video.

Next: after approval of `07` §6 and §7, build the judges' deck in Canva as a new design, and apply the investor-deck edits as one transaction with a preview before commit.
