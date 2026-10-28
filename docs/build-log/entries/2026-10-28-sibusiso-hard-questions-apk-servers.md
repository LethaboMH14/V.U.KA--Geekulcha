## 2026-10-28 | Sibusiso, with Claude Code assistant | Claude Code (assistant) | Answers to the staged-distress and money-back questions; latest VIGIL APK; server check | PROPOSED

**Research** — Read `docs/STAGED-DURESS-DEFENCE.md` in full and `docs/venture/01-B2B-ENTERPRISE.md` in full. Read `docs/EVIDENCE.md` (digital banking crime, ombud complaints, UK reimbursement, insurer cover rows) and `docs/venture/research/2026-10-18-web-banks-insurers.md` (SABRIC and ombud section). Read the `vigil-demo` release metadata through the GitHub API, the `server.json` it serves, and `app/README.md` ("Run the demo").

**Real data / references** —
- **Latest VIGIL APK:** `VIGIL.apk` on the `vigil-demo` release (the asset the QR links to), uploaded 27 Sep 2026. Downloaded in full. SHA-256 `01b4534d081a231df339a5feb50e49e650889b95e47a08b7197e555df5a23bd9`, which matches GitHub's digest (`FACT`). Its manifest names package `com.teamsonar.vuka` and version `0.0.16` (`FACT`, string read from the binary manifest; nothing was run). `app/android/app/build.gradle` on this branch also says 0.0.16. **The release notes still describe 0.0.15**, so they are stale.
- **The release is a pre-release**, so GitHub's "latest release" API returns 404 (`FACT`).
- **Server discovery:** `server.json` (updated 15 Oct 2026) points every installed app at a Cloudflare quick tunnel on a presenter's PC: "Demo fallback: ANCHOR on the presenter PC via Cloudflare tunnel (Azure subscription disabled). Simulation subjects (sim_) only." (`FACT`, the file as served).
- **Server checks from this sandbox, 28 Oct, about 05:46–06:05 UTC:** the Azure ANCHOR host, the presenter-PC tunnel and the GitHub Pages ledger were all refused by the session proxy (403 on CONNECT; policy denial or upstream failure). **Their state is unknown, not "down"** (`FACT` for the refusal). The local simulated preview (port 8790, sandbox only) was restarted and answered 200.
- `app/README.md` step 1 tells people to check out the server branch from PR #99. The server has been on `main` since #131 (`git log -- server/main.py`), so that step is stale.
- Figures in the answers file are copied with their tags from `EVIDENCE.md`, `01` and the research notes. No new figure was introduced. The two spoken answers are 111 and 106 words, about 45 seconds each at 150 words a minute (`ESTIMATE`; not timed aloud).

**Business reasoning** — Staged claims and "will I get my money back?" are the first questions a bank, insurer or judge will ask. An answer that says what the record can't show, and quotes no unmeasured uplift, keeps the conversation credible with the fraud and claims teams who would buy.

**Competitor reference** — Discovery Bank's Panic Code misuse fee (R1,000, `REPORTED`) is cited as a precedent for partner-set misuse terms. Capitec's Feature Lock delay and the Standard Bank and Absa new-beneficiary holds (`REPORTED`) are cited to show banks already accept short holds.

Changed:
- `docs/venture/11-HARD-QUESTIONS.md` (new): spoken answers, the seven fraud-defence layers with their limits, a today-versus-VUKA comparison, what banks and insurers can do, the vendor gate, and next steps.
- This entry.
- The APK is in the session scratchpad and was sent to the user. It is not committed.

Evidence: the commands and API reads above. `git diff --check` and `node scripts/check-docs.mjs` run before the commit. **Not run:** installing the APK on a phone; any server health check (refused by the proxy); a timed read of the answers.

Decision: none.

**Review gates (`MASTER-CONTEXT` §10).** 1 Fraud red-team: the staged-distress answer is the red-team answer, and it states that VUKA doesn't detect staging. 2 Build for use: no claim that anything runs with a real bank; the bank side is simulated. 3 Economic integrity: no recovery percentage; every figure is tagged and traced. 4 Privacy: records are shared only with consent; a missing record is never evidence. Criteria **S**, **B**, **T**.

Needs/blockers:
- **Servers (D9):** the assistant cannot start the Azure server (subscription disabled) or the presenter-PC tunnel. Starting the tunnel and running `scripts/publish-server.mjs` changes what every installed app follows, so a founder does it, on the presenter's PC, with the server's `.env` (credentials are not handled by the assistant).
- Lethabo: update the release notes to say 0.0.16, and correct `app/README.md` step 1 to `main`.
- Re-open the ombud case articles before the R103,092 case is quoted.

Business handoff: `docs/venture/11-HARD-QUESTIONS.md` is the answer sheet for the showcase Q&A.

Next: the presenter reads both answers aloud once against a timer before 15:00.
