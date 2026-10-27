## 2026-10-27 | Sibusiso, with Claude Code assistant | Claude Code (assistant) | AFRETEC showcase prep: check the simulated preview offline, check the decks as saved (`09` §6) | PROPOSED

**Research** — Read this session: `AGENTS.md`; `docs/MASTER-CONTEXT.md` §6 (ledger) and §10 (gates); `docs/venture/07-EHUB-ALIGNMENT-AUDIT.md`; `docs/venture/09-AFRETEC-SHOWCASE.md`; `scripts/screens/README.md`, `showcase.cjs`, `drive.cjs`, `onboarding-flow.txt`; the guardian and check-in code in `app/src/ui/screens.tsx` (the Settings row near line 1002, `GuardianPreview` near line 1505); the 26 Oct build-log entries. **Not re-read this session:** `05-TWO-PITCHES.md`, `BRIEF.md`, `RULES.md`, `EVIDENCE.md`, `SECURITY.md`, `VUKA-2-SPEC.md`, `OVERLAPS.md`, `AGENT-ROUTING.md`, the team file. Canva decks were read with the read-only tool; no editing transaction was opened.

**Real data / references** —
- Checkout: the local branch on arrival was `claude/busy-wright-gp7es2` at `7e4648d`. The handover branch `claude/eloquent-cannon-fag7ao` is at `d6024c2` on origin and holds the venture files. A local branch of that name now tracks it. Nothing was pushed.
- `npm install --legacy-peer-deps` in `scripts/screens`: exit 0. `package-lock.json` unchanged. `node_modules/` is gitignored.
- `node build.mjs <scratchpad>/showcase-web`: built. The build sits in the session scratchpad, not in the repo.
- `HEADLESS=1 node showcase.cjs` against that build on `127.0.0.1:8790`: "On Home. Test PINs: normal 1357, duress 2468." Exit 0. n = 1.
- Same run with every request except `127.0.0.1:8790` aborted by a Playwright route: "non-local requests aborted: 0". n = 1. The preview made no outside request on the onboarding path.
- Check-in, aborted requests included, n = 1 each: normal PIN 1357 gives "Checked in · VIGIL keeps listening". Duress PIN 2468 gives the same text. The two screenshots are pixel-identical (`PIL.ImageChops`, difference bounding box `None`). This is still a browser rendering: no device, no timing, no network.
- Guardian view, aborted requests included: Settings → Guardian view opens in Standby ("GUARDIAN · LERATO", "All quiet"). The Alert state reads "Lerato may need help" and "Don't call or text Lerato. Call 10111." The name is the demo fixture's.
- Home, rendered: "Listening on this phone, all the time." This is the app's own copy (ADR-0046, decision D7).
- Walkthrough in `09` §4, the quoted block: 220 words (`FACT`, counted). At 130–150 words a minute it is about 1.5–1.7 minutes of speech, before the pause for the check-in beat (`ESTIMATE`; nobody has timed it aloud).
- Ledger page `lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/`, from this sandbox: `CONNECT tunnel failed, response 403` (`FACT`, this sandbox only; not tested from the venue network).
- Canva, read-only, saved versions: judges' deck `DAHZIXLh5mk`, 10 pages. Claim tags present; "No endorsement and no SAPS contact yet"; service levels marked "(proposed)"; "Not yet on a company-owned server". This is the corrected text that `07` §6 describes as staged. Investor deck `DAHY_VcrKis`, 10 pages saved. Still says "Tamper-proof by design", has the break-even placeholder "[to be confirmed from the single canonical model]", a title line "Demonstrated at the Wits E-Hub", and a phone label "Live Recording securely". Transaction `5387951267738664542` reads without error and still reports 10 pages, so the 12-slide staging could not be confirmed from here (`FACT`, tool output).

**Business reasoning** — The showcase is on 28 Oct, and no company-controlled server exists (`06` §0). A labelled simulated preview that runs with no outside requests is the one demo that cannot fail on the day. The deck text is what a delegate keeps, so it must match the ledger before anyone is shown it.

**Competitor reference** — Not applicable.

Changed:
- `docs/build-log/entries/2026-10-27-sibusiso-afretec-prep-verification.md` (new): this entry.
- No change to the decks, to `09`, to any contract or to any code. `scripts/screens/node_modules/` was created by the install (ignored). The scratch scripts for the offline and flow checks are in the session scratchpad, not the repo.

Evidence: the commands and results above. `git diff --check` run before the commit. **Not run:** the presenter-laptop run; any device run; a Ledger check from the venue network; a timed rehearsal of §4.

Decision: none.

**Review gates (`MASTER-CONTEXT` §10), for this entry.** 1 Fraud red-team: the test PINs are shown as test PINs and the screens say "SIMULATED"; no record proves duress. 2 Build for use: browser rendering only; the phone demo stays off (`09` §3, row 4). 3 Economic integrity: no new figure. 4 Privacy: the guardian alert uses a demo name; its wording is D12, which needs a GBV review. Criterion **U** (it runs with no server) and **S** (the labels match what the app does). For a delegate, the preview shows the screen that does not change and says it is a simulation. Phone use is not measured.

Needs/blockers:
- Sibusiso: approve the investor preview before anyone says "commit investor". Confirm whether the judges' deck corrections are already saved, since the saved text suggests they are.
- Sibusiso: the rehearsal lines. Home says "all the time" while `09` §4 says "until she switches it off". The alert says "Lerato" while `09` §4 says "them". Both need a decision (D7, D12).
- Sibusiso: whether to draft the E-Hub questions (`09` §1) as an email. Nothing has been sent.
- Both founders: D9 (server) before any phone demo.

Business handoff: not applicable; nothing leaves the repo.

Next: Presenter runs `node showcase.cjs` on the laptop once with the network off. Rehearse `09` §4 against a timer, twice. Assistant: none until Sibusiso answers the questions above.
