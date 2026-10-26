## 2026-10-26 | Sibusiso, with Claude Code assistant | Claude Code | Real app screenshots, judges' deck built, investor deck edits staged | PROPOSED

**Research** — Continued from `2026-10-25-sibusiso-ehub-alignment-audit.md`. Read `app/App.tsx`, `app/src/ui/screens.tsx`, `onboarding.tsx`, `signup.tsx`, `theme.ts` and the native-module call sites to render the real UI in a browser; read the Canva element trees of `DAHY_VcrKis` (investor) and the new `DAHZIXLh5mk` (judges).

**Real data / references** —
- Screens rendered from `main` at 7e4648d with `scripts/screens/` (react-native-web, the app's own SIMULATED preview, the app's IBM Plex fonts). Test account only (Demo Member, `demo@example.com`, test PINs).
- After a normal PIN and after a duress PIN, the "Checked in" screen was pixel-identical in this rendering (`PIL.ImageChops` difference bounding box `None`; n = 1 each). Not a device test; timing and network not covered.
- The app's own copy, as rendered: Home says "Listening on this phone, all the time"; permissions say "Location · optional — shares a fix with guardians if you don't answer a check-in"; after a check-in Home says the phone "sends its location until [time]. Your guardians see it only if they were alerted."
- The guardian invite needs the server even in preview ("VIGIL's server couldn't be reached"), so it was not captured.
- The session proxy denied `www.canva.com` (direct upload), `testnet.mirrornode.hedera.com` and `vuka-anchor-server.azurewebsites.net` (status endpoint, `connect_rejected`). Images reached Canva through their public GitHub URLs at commits `9778445` and `38197af` instead.
- Re-check of the repo copy: the Home screen re-rendered from `scripts/screens/` differs from the committed one only in the animated waveform rows (501–523).

**Business reasoning** — The E-Hub panel and every judge will ask to see the product. Stock phone mock-ups invite the question "is this real?". Screens rendered from the shipped UI code, each captioned as a browser rendering, answer it without claiming a device run. Restoring the tags the generator dropped keeps the judges' deck inside the honesty ledger.

Changed:
- `docs/venture/assets/screens-2026-10-26/` (new): captioned composites, navy variants, raw screenshots, provenance README.
- `scripts/screens/` (new): build, shim, driver, composer and README to reproduce them.
- `docs/venture/07-EHUB-ALIGNMENT-AUDIT.md`: location resolved (the app shares an optional fix after a check-in); "always on" is the app's own copy (ADR-0046, D7); screenshots exist; deck status.
- `docs/venture/05-TWO-PITCHES.md` §5: `main` prints 10,973, not 10,901.
- Canva: judges' deck `DAHZIXLh5mk` generated (10 slides); corrections staged. Investor deck `DAHY_VcrKis`: edits staged (12 slides). **Neither transaction is committed**; both wait for Sibusiso's approval of the preview.

Evidence:
- `node build.mjs` built; `node drive.cjs …` reached each screen; screenshots viewed.
- `git diff --check` clean; `node scripts/check-docs.mjs` passed (exit 0).

Decision: none.

Needs/blockers:
- Sibusiso: approve or amend the two Canva previews; then they are committed.
- Device screenshots for any "on a phone" claim; the demo video (`08-DEMO-VIDEO-PLAN.md`) still needs real phones and a server (D9).
- Lethabo: the 5-minute pitch's "doesn't share location" line.
