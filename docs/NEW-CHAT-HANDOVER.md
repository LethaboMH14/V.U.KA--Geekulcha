# New chat handover: VUKA report and pitch deck (Sibusiso)

Paste everything below the line into a new Claude chat.

---

I'm Sibusiso Khumalo, second lead and backend/ledger owner on **VUKA** (Team SONAR, Geekulcha Hackathon 2026). In this chat I'm **iterating on and improving our report**. Later, I'll build the **pitch deck in Figma through the Figma MCP**.

## Project folders
- **Remote repo:** https://github.com/LethaboMH14/V.U.KA--Geekulcha (owner: Lethabo, LethaboMH14)
- **Local main worktree** (docs, app, the report): `C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA` (branch `main`)
- **Local server worktree** (the backend Azure runs): `C:\Users\lovilocal.adm\Documents\Codex\2026-09-12\git-github-com-lethabomh14-v-u\work\VUKA-accounts` (detached; push with `HEAD:feat/lethabo-guardian-delivery`)
- Git over SSH sometimes can't resolve github.com from this PC. Push and pull over HTTPS: `git push https://github.com/LethaboMH14/V.U.KA--Geekulcha.git <branch>`.

## Where the report material is
- **Submission pack:** PR #119, branch `lethabo/submission-pack`, still open. It holds `docs/submission/VUKA-GKHack26-submission.pdf` (16-slide PDF), `docs/submission/SONKE-FIELDS.md`, `docs/submission/vuka-architecture.html/.png/.json`, and a build-log entry.
- **Sources of truth:**
  - `README.md` (summary and repo map)
  - `docs/VUKA-2-SPEC.md` (build spec)
  - `docs/adr.md` (decisions)
  - `docs/EVIDENCE.md` (what's measured; never claim anything unmeasured)
  - `docs/MASTER-CONTEXT.md` (§6: what we will not claim)
  - `docs/ECONOMICS-VIGIL-ANCHOR.md`
  - `docs/SIBUSISO-HANDOVER.md` (everything built and verified, with dates)
- **Demo evidence for the report:** `docs/demo/`. It has a real VIGIL record that shows LIVE-VERIFIED (Hedera testnet message #62, 2026-09-27 11:58:39 UTC) and a tampered copy that fails at entry #3, plus a README.

## What VUKA is (one paragraph)
**VIGIL** is the Android app (React Native; `app/` on `main`; package `com.teamsonar.vuka`; version 0.0.16). During a journey it listens on the phone (YAMNet) for a scream, a shout or breaking glass. It then asks for a discreet PIN check-in: a normal PIN, or a duress PIN that looks identical. If the check-in isn't answered, the wrong PIN is entered, or the duress PIN is used, the server alerts the member's guardians, and on duress it also asks the (simulated) bank to hold transfers. **ANCHOR** is the backend on Azure. It keeps each member's record as a signed chain of events and anchors the record fingerprints on **Hedera** (topic `0.0.10687280`). The **VUKA Ledger** website (https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/ledger/) lets anyone verify an exported record in their own browser: it proves **when** the record existed and that it hasn't changed since. It does not prove **what** happened.

## Live state (last checked 27 Sep)
- **Azure:** API `https://vuka-anchor-server.azurewebsites.net`. App Service `vuka-anchor-server` and PostgreSQL `vuka-anchor-db`, both in resource group `vuka-anchor-rg`. Always On, a `/healthz` health check and auto-heal are enabled.
- **Deployed server:** `431f887` on the server branch, plus later handover-only commits. The app talks to the server address in `server.json` on the `vigil-demo` release. That file **must point to Azure**; Lethabo sometimes switches it to a laptop tunnel.
- **Tested end to end on Azure (14/14):**
  - email sign-up codes (Brevo);
  - guardian invite showing "Guardian added";
  - wrong-PIN heads-up to guardians;
  - duress alert, plus the simulated bank's hold;
  - stand down;
  - export, then provable on Hedera.
  - Rerun with `node scripts/e2e/azure-demo-check.mjs https://vuka-anchor-server.azurewebsites.net`, after compiling `app/build-e2e` (see `scripts/e2e/README.md`).
- **Known limits (don't overclaim):**
  - SMS codes are simulated.
  - Google sign-in has no code step.
  - The FCM push token is unused; guardians keep the app open.
  - A duress PIN at the "Welcome back" sign-in screen doesn't raise the alarm (known bug).
  - YAMNet on the phone is Lethabo's to sort out. The model is the registered one (`10c95ea3…`). Measured glass recall is 68.8% on held-out ESC-50 clips; screams and gunshots haven't been measured.
- **Numbers in use:**
  - about R20 per member per month, funded by a bank (an assumption);
  - break-even at 10,901 members;
  - anchoring costs at most about R570 a month for the whole network.

## How I work
- **Writing:** plain language for judges, short sentences, Rand for money. Mark every claim `FACT`, `ESTIMATE` or `ASSUMPTION`, as `docs/EVIDENCE.md` does. Never claim "proof of duress", "invisible", "always on" or "court-admissible".
- **Commits:** commit and push continuously (several people share the repo). Update `docs/SIBUSISO-HANDOVER.md` at the end of each session.
- **Secrets:** never paste or ask for keys or passwords in chat.
- **Pitch deck:** I'll do it in Figma via the Figma MCP. Keep the report's structure and wording ready to lift into slides: problem → VIGIL → ANCHOR and the Ledger → demo → business model → team.

**First task:** open the report (start with PR #119's `docs/submission/` and `README.md`), read `docs/EVIDENCE.md` and `docs/SIBUSISO-HANDOVER.md`, then tell me how you'd tighten the report.
