# VUKA today: software and operations audit, and what blocks a launch to real users

**As of:** 18 Oct 2026. **Scope:** read-only. **Serves:** T (technical), S (security and ethics), B (operations a partner will check).
**Would a real user trust and use this today?** No. Today's evidence says an installed VIGIL depends on a server that the release file describes as a presenter's PC behind a Cloudflare tunnel. Guardians hear an alarm only while their app is running. A duress PIN at two prompts raises nothing. The code that runs the backend is not on `main`.

**Method.** I read the required docs, ran `git fetch origin --prune`, and compared every open PR branch with `main` and with the server branch using `git log`, `git cherry`, `git diff` and `git merge-tree` (run in a scratch mirror). I used the GitHub REST API for PRs, CI runs and release assets. I ran the test suites myself on scratch copies (`git archive` into the scratchpad), not in the repo. Live endpoints (Azure, GitHub Pages, the Hedera mirror, the tunnel) all returned **403 from this session's proxy**, so **nothing live was verified today**. PostgreSQL could not be started in this sandbox, so the 150 server tests that need it were not run. The repo working tree was not changed (`git status` is clean).

---

## Headline findings

1. **The Azure server is probably down.** `server.json` on the `vigil-demo` release is the file every installed VIGIL follows. It now points to `https://workstation-afterwards-spanking-consoles.trycloudflare.com` (updated 2026-10-15T07:17:36Z), with the note *"Demo fallback: ANCHOR on the presenter PC via Cloudflare tunnel (Azure subscription disabled)"* (`REPORTED`: the asset's own note, author not recorded). No repo file records this. `docs/venture/04-SLA.md` and `06-LAUNCH-ROADMAP.md`, both written 18 Oct, still describe Azure as running.
2. **The whole backend lives on a branch.** On `main`, `server/` and `anchor/` hold only placeholders. Azure ran `431f887` on `feat/lethabo-guardian-delivery` (PR #99). That PR is the top of a five-PR stack (#51 → #85 → #89 → #96 → #99) and is 155 commits ahead of `main` and 109 behind (`FACT`).
3. **Merging it is mechanically easy.** A trial merge of #99 into `main` conflicts in **4 docs only**: `docs/CHECKLIST.md`, `docs/SIBUSISO-HANDOVER.md`, `docs/adr.md` and `team/khutso.md`. There are no code conflicts. On the merged tree, the root Node tests pass 68/68 and shared Vitest passes 151/151. Python gives 224 passed, 2 skipped and 150 that need PostgreSQL (`FACT`, my run).
4. **`main`'s CI has been red since 25 Sep.** "Repository gates" last passed at 2026-09-25T22:35Z (`8ba6c50`). At `main`'s head `1aa8830` (14 Oct), `document-contracts`, `secret-scan`, `npm-audit` and `osv-scan` fail. PRs #124 and #125 each fix the failures the other one still has. Neither has passed, and Lethabo requested changes on both (14 and 16 Oct).
5. **The safety-critical gaps are real and confirmed in the code.** They are all detailed in (c): duress at sign-in and at sign-out with listening paused, guardian delivery only while the app runs, listening that dies silently, and no PIN recovery.

---

## (a) What VUKA is as software: built, simulated, specified only, blocked

| Capability | Status | Evidence |
|---|---|---|
| VIGIL app (React Native 0.74.5, `com.teamsonar.vuka`, versionCode 16 / 0.0.16) | **BUILT, on `main`**. About 10,202 lines of TS/TSX plus 1,684 lines of Kotlin (`FACT`, `git ls-files` count) | `app/android/app/build.gradle:91-95`. My run on 18 Oct: `tsc --noEmit` clean, **jest 285/285** in 20 suites (`FACT`) |
| On-device detection (YAMNet sha256 `10c95ea3…`, integer engine, CEM-1 graded check-ins, motion corroboration) | **BUILT**, thresholds **UNCALIBRATED**. ADR-0039 and ADR-0045 to ADR-0049 are all **Proposed** | `app/src/brain/`, `docs/adr.md:579,602,651,673` |
| Duress and normal PINs (Argon2id, sealed with a Keystore key), check-in, wrong-PIN heads-up, hold-for-help, Quick Settings tile | **BUILT** in the app, **except** duress at sign-in and at sign-out with listening paused (c1, c2) | `app/src/api/device.ts:556-562, 868-921`; `docs/build-log/entries/2026-09-25-lethabo-vigil-onboarding-queue.md:16-18` |
| Signed, encrypted event queue (Keystore signer, receipts) | **BUILT** | `QueueModule.kt`, `SignerModule.kt`, `device.ts` |
| ANCHOR server (FastAPI + PostgreSQL): signed requests, per-subject chains, outbox, escalation, guardians, accounts and OTP, export, deletion, recovery endpoint, streams | **BUILT, branch only** (#99). 26 routes plus 3 `sim_bank` routes. Server source 5,299 lines plus 4,152 test lines; `anchor/` 1,034 + 991 (`FACT`) | My run on 18 Oct at `a2e83e5`: **212 passed, 2 skipped, 150 not run (need PostgreSQL)**. PR CI `tests` job **green** at 2026-09-27T07:21Z with a Postgres 17 service; `secret-scan` and `semgrep` **red** |
| Hedera anchoring (typed 33-byte roots, Node sidecar, `0x02` key manifest) | **BUILT, branch only; testnet**. First `0x01` root was mirror seq 5 on 26 Sep at 19:52:33 UTC; the demo record's root is #62, at 27 Sep 11:58:39 UTC (`FACT` per handover) | `docs/SIBUSISO-HANDOVER.md:364`, `docs/demo/README.md` |
| Public ledger and verify page (GitHub Pages) | **BUILT, on `main`**; ledger tests **42/42** (my run). Last Pages deploy succeeded 14 Oct (`FACT`, Actions API) | `dashboard/ledger/`. A live check was blocked from this session |
| `shared/` verifier (canonical form, Merkle, DER, key pins) | **BUILT**; on `main`, **94 passed, 5 skipped** (the vector files live only on the branch). **151/151** once merged | my run |
| `sim_bank` | **SIMULATED**. It ran inside the Azure container on `127.0.0.1:8001` from 27 Sep 02:57 UTC | `docs/SIBUSISO-HANDOVER.md:429-432` |
| SMS codes and SMS guardian fallback | **SIMULATED / not configured**. `server/src/notify/sms.py:1-5` says "No provider is selected"; SMS sign-up answers 503 | handover:417 |
| Google sign-in | **SIMULATED** unless the APK is built with `google-services.json` | `app/README.md`, Firebase section |
| FCM guardian push | **BUILT but unused**. The server takes a static `FCM_ACCESS_TOKEN` (about 1 h life); the published APK has no Firebase, so guardians poll | `server/src/notify/fcm.py:65-66` (branch); `docs/NEW-CHAT-HANDOVER.md:44` |
| PIN or device recovery | **Server built, app not built**: `POST /v1/devices/recover` and recovery-code hashing exist on #99; the app says "Recovery codes aren't in this build yet" | `app/src/ui/account.tsx:24`; `server/recovery.py` (branch) |
| Data deletion and 90-day retention (POPIA, G3) | **Deletion endpoint on the server branch only, with no UI; retention not built** (only location has a 24 h TTL) | `server/deletion.py`, `server/locations.py:25` (branch); no deletion call in `app/src` |
| Post-quantum root attestation (ML-DSA-65 + Ed25519) | **BUILT on an open PR only** (#117, +936 lines on top of #99) | `git diff` |
| Native Kotlin VUKA app (`za.co.vuka.app`, targetSdk 37) | **Separate codebase, branch only** (`feature/integrate`, draft #114): 7,036 Kotlin lines in 53 files, 224 test lines, never run on a device | PR #114 body |
| Bank or insurer integration, end-to-end encryption to guardians (G28), attestation verification (G32), Hedera mainnet, OpenTimestamps | **SPECIFIED or PROPOSED only** | `docs/OPEN-GAPS.md` |
| Independent penetration test (G8), internal PT results | **Not done.** `PENTEST-PLAN.md` is `PROPOSED`; `PENTEST-RESULTS.md` exists only on the unmerged `docs/ipeleng-security-acceptance` branch | `docs/security/PENTEST-PLAN.md:3` |

---

## (b) Production and operations reality

| Area | Today | Tag / source |
|---|---|---|
| **Hosting** | Azure for Students. Resource group `vuka-anchor-rg`, App Service `vuka-anchor-server` (**Basic B1**, Python 3.13, Always On, HTTPS-only, `/healthz` health check and auto-heal) and PostgreSQL Flexible `vuka-anchor-db` (**B1ms**, v16). Region **UAE North**, because a subscription policy blocks South Africa North (allowed: italynorth, uaenorth, indiasouthcentral, spaincentral, austriaeast) | `FACT`, `docs/SIBUSISO-HANDOVER.md:109, 301, 351` |
| **Hosting status now** | `server.json` (15 Oct) says "Azure subscription disabled"; the 15 Oct showcase ran on a presenter PC via a tunnel | `REPORTED` (release asset). Cause not recorded. `ASSUMPTION`: exhausted credit or student eligibility; Sibusiso to check the portal |
| **Hosting cost** | App Service B1 about $9.49 (Dev/Test price) against about $13.14 pay-as-you-go a month; B1ms not priced in the repo | `ESTIMATE`, handover:351 |
| **DB exposure** | Public access with the firewall rule `AllowAzureServices` (0.0.0.0), which admits any Azure-hosted client to attempt a connection | `FACT`, handover:109, 376 |
| **Deploy method** | Manual. A zip from `git archive` (`scripts/build-deploy-package.py`, branch) is pushed from Sibusiso's laptop with `az`; there is no CD from CI. A backup Docker, Render and Neon recipe exists **only on `feature/integrate`** (`Dockerfile`, `render.yaml`, `docs/deploy/BACKUP-HOSTING.md`) | `FACT` |
| **Hedera** | **Testnet only.** Topic `0.0.10687280`, epoch 1, operator `0.0.10686482`, whose key is also the topic's submit key. Manifest fingerprint `f20cf84a…4830` after the 26 Sep rotation. Testnet can reset (G31). No mainnet account. Fee $0.0008 per message | `FACT`, `contracts/keys/verify-pins.json`; `docs/EVIDENCE.md:40` |
| **Verify dependency** | An export carries **empty** `proofs` and `receipts` (`docs/demo/VIGIL-record-demo.json`). The ledger fetches the Merkle path from the server (`dashboard/ledger/lib/sources.js:14,116-124`). If Azure is down, the demo record **cannot reach LIVE-VERIFIED again**, even though the root is on Hedera | `FACT` (code); outcome `ASSUMPTION` (no live check) |
| **Email** | Brevo over HTTPS (`VUKA_BREVO_API_KEY`, `VUKA_EMAIL_FROM` on Azure). Brevo's "Authorised IPs" blocking was **switched off** for the demo and is still owed to be switched back on. One real delivery on record (n = 1, 27 Sep 02:28 UTC) | `FACT`, handover:412-424 |
| **SMS** | None (no Twilio or SA gateway) | `FACT` |
| **Push** | Server-side FCM adapter with a static, hand-refreshed hourly token. The app registers a token only in a Firebase build; the published build has none | `FACT` |
| **Signing keys** | **APK:** Team SONAR upload key (cert SHA-256 `DD:FB:F9:16…`), kept on one laptop. `vigil-apk.yml` failed **4 of 4** runs on 27 Sep (secrets not set); no CI-built APK has ever shipped. **Server Ed25519:** rotated 26 Sep; private key backed up by Sibusiso; **Ipeleng's review never recorded**. **Payload AES key:** only in Azure settings; whether a backup exists is not recorded (`ASSUMPTION`: none). **Hedera key:** in Azure settings and Sibusiso's local `.env` | `FACT` except where tagged; `docs/build-log/entries/2026-09-26-sibusiso-server-key-rotation.md` |
| **Distribution** | Sideloaded APK from the prerelease `vigil-demo` (titled "VIGIL demo (0.0.8)"; notes describe 0.0.15). `VIGIL.apk` is 42,669,560 bytes, uploaded 2026-09-27T06:47Z, 20 downloads. The same release ships **debug-signed** native `VUKA.apk` and `VUKA-next.apk`. **No Play Store listing.** targetSdk is 34 (`app/android/build.gradle:6`). The manifest uses `USE_FULL_SCREEN_INTENT`, a microphone/location FGS and a dataSync FGS, each of which Play reviews | `FACT` (Releases API). Play target-API and full-screen-intent rules: `ASSUMPTION`, check current Play policy |
| **Server discovery** | Apps follow an **unsigned** `server.json` on a GitHub release (`device.ts:46, 380-390`). A move to a non-tunnel server re-registers the member and parks the queue, and **guardians must be invited again** (`device.ts:392-421`). Any two `trycloudflare.com` addresses are treated as the same server (`device.ts:427-430`) | `FACT` (code) |
| **Monitoring** | `/healthz` checks only the database (`server/main.py:439-448`, branch). Container logging was switched on 26 Sep. No paging or alerting. The SLA probe (`sla-probe.yml`) is on open PR #126 only, has no baseline, and scheduled runs start only from `main` | `FACT` |
| **CI coverage** | `checks.yml` runs root Node tests, shared Vitest and Python tests when present. **App jest/tsc, ledger tests and any Android build are not in CI.** On `main` there is no server Python to test | `FACT`, `.github/workflows/checks.yml:41-72` |
| **Accounts and ownership** | Repo owned by Lethabo's personal GitHub account (now **public**, MIT, "Copyright (c) 2026 Lethabo Masilo Hoaeane"). Azure for Students sits under Sibusiso's Wits identity. Firebase, Brevo, the Hedera portal and Cloudflare sit on personal accounts. Nothing is held by PILOT CORE (Pty) Ltd | `FACT` (API, `LICENSE:1-3`, handover). Whether the student offer permits commercial production use: `ASSUMPTION`, check |

---

## (c) Known bugs and safety gaps, with severity for a real user

**Severity scale:** S1 = a person in danger gets no alarm while they believe they are protected. S2 = silent failure, or data or legal exposure a partner would refuse. S3 = wrong or confusing behaviour that has a workaround. S4 = minor.

| # | Gap | Severity | Evidence |
|---|---|---|---|
| c0 | **No reachable server of record.** The release file reports Azure disabled; installed apps follow a presenter-PC tunnel. A journey can't start without a server (`device.ts:784-805`), so the member is unprotected | **S1** | release `server.json` (15 Oct) |
| c1 | **A duress PIN at "Welcome back" sign-in raises nothing.** `signIn` accepts either PIN and records nothing (`device.ts:743-750`), against V6 (`docs/VUKA-2-SPEC.md:39`). The test suite **asserts** this behaviour (`app/src/api/__tests__/device.test.ts:779-793`). The server's PIN-action allow-lists have no `sign_in` (`server/event_effects.py:87`, `server/pin_records.py:33`, branch), so the fix is a contract change | **S1** | `FACT` |
| c2 | **A duress PIN at sign-out with listening paused also raises nothing** (`device.ts:727-736`, no-journey branch). The venture docs list only the sign-in case | **S1** | `FACT`; `onboarding-queue.md:437` |
| c3 | **Guardians get alerts only while VIGIL runs** (polling, plus a dataSync keep-alive FGS on standby). The published build has no FCM, and the server token expires hourly. Not tested on a device; Doze and Android 15 limits on dataSync FGS are not measured | **S1** | `FACT`; FGS limits `ASSUMPTION` |
| c4 | **Listening can stop silently.** `SensingService` returns `START_NOT_STICKY` (`SensingService.kt:69,81`); nothing restarts it after a reboot (G24), and the member gets no "listening stopped" notice | **S1/S2** | `FACT` |
| c5 | **The discovery file is unsigned and auto-followed.** Anyone with write access to the release can redirect every installed app. A server move drops guardian links | **S2** | `FACT` (code) |
| c6 | **No PIN or device recovery in the app.** A lost phone or forgotten PIN loses the record and the guardians | **S2** | `account.tsx:24` |
| c7 | **Weak detection.** Screams open a check-in 6.5% of the time (n = 108); there is a high false-prompt burden (d). Ruleset v3 (#124) lowers the voice bars, but scream recall under v3 is not measured | **S2** (trust and comfort) | `docs/eval/` |
| c8 | **No SMS or offline path (G25); nothing escalates if the phone is off before detection (G26)** | **S2** (stated limit) | `OPEN-GAPS.md` |
| c9 | **`contact_lost` is off by default** (`server/contact.py:46`, branch); whether it is on in Azure is not recorded. The G34 `no_answer` fallback still runs | **S2/S3** | `FACT`; Azure value unknown |
| c10 | **A shared export shows an earlier closed incident's duress result** to whoever receives it (a bank or insurer) | **S2** (privacy and safety) | `2026-09-26-lethabo-ledger-dashboard.md:43` |
| c11 | **POPIA:** no retention TTL; deletion not in the app; privacy notice and terms are drafts; Information Officer not registered; data held in UAE North (s72) | **S2** (legal) | `OPEN-GAPS.md` G3; venture 06 |
| c12 | **Ops fragility.** `/healthz` misses a stalled worker. Two worker incidents on 26 Sep: about 11,000 failures, then 13 silent minutes with the cause unknown. One ambiguous Hedera timeout parks all anchoring until someone fixes the DB by hand (`server/anchoring.py:4,72,216`) | **S2** | `FACT` |
| c13 | **The payload key is server-held, so delivery is not end-to-end (G28); device attestation is stored but not verified (G32)** | **S2** (partner review) | `OPEN-GAPS.md` |
| c14 | **`409 contact_in_use` is shown as "Couldn't reach VIGIL's server"** (`device.ts:486-495`; `server/accounts.py:298`). Re-sign-up with the same email is blocked | **S3** | `FACT` |
| c15 | **A confusing release.** Title 0.0.8, notes for 0.0.15, asset 0.0.16 (`ASSUMPTION`, from timing), with debug-signed native APKs next to it | **S3** | Releases API |
| c16 | **The DB firewall admits any Azure tenant** (`AllowAzureServices`); the Hedera operator key doubles as the submit key | **S3** | handover |
| c17 | **OTP:** a definite provider refusal still counts toward the 3-per-15-minute cap; Brevo IP blocking is off; a free sender may land in spam | **S3** | handover:422-424 |
| c18 | **Minor:** six digits typed before the send response returns aren't re-checked; one unexplained 401 from VUKA's own signature check (27 Sep 02:25); the local email password uses one salted SHA-256 | **S4** | `2026-09-27-lethabo-vigil-0-0-16` entry; handover:425; `onboarding-queue.md:438` |

---

## (d) Measured numbers (method and n)

| Measure | Value | Method and n | Tag |
|---|---|---|---|
| Glass recall, held-out | **11/16 = 68.8%** | ESC-50 folds 4–5, ruleset `vigil-detect` v1, phone windowing replayed on the host (25 Sep). Tuning folds 1–3: 21/24 (87.5%) | `FACT`, `docs/EVIDENCE.md:61` |
| False records, held-out | 4 in 0.544 h = **7.3/h** | 392 negative clips, 49 classes | `FACT`, `EVIDENCE.md:62` |
| False prompts (host replay) | **5.5/h** held-out; 1.8/h tuning | the same negatives played as one stream; a lab proxy, not a phone | `FACT`, `EVIDENCE.md:63` |
| Check-in opens, FSD50K eval (V4 / CEM-1), ruleset v2 | Glass **46.0% / 52.5%** (n = 139); Gunshot **54.6% / 57.4%** (n = 108); **Screaming 6.5% / 10.2%** (n = 108); Shatter **72.9% / 75.7%** (n = 70) | 425 clips, fresh state per clip, 26 Sep. For screams, 29/108 clips reach the threshold, 6 confirm and 27 are too short to confirm | `FACT`, `docs/eval/cem1-measurements.md:12-19` |
| False check-ins per hour (V4 / CEM-1) | folds 1–3: 1.8 / 7.3; folds 4–5: **7.3 / 16.5** | ESC-50 negatives, 0.54 h per split, 1–9 prompts per split; Poisson intervals not computed | `FACT` |
| Ruleset v3 (unmerged #124) | V4 prompts **4.6 → 6.4/h**; CEM-1 11.9 → 13.8/h; glass catch 82.5% / 92.5% unchanged | 784 ESC-50 non-glass clips (1.09 h) and 40 glass clips, 14 Oct. Shout and scream recall not measured | `FACT` (branch `sibusiso/detect-sensitivity`, `docs/eval/voice-v3-false-alarms.md`) |
| On-device parity | identical integer scores | **n = 1** clip, emulator | `FACT` |
| Azure end-to-end demo check | **14/14** | one run on 27 Sep, plus one rerun after a client-side "couldn't reach" | `FACT` (handover:467) |
| Wrong-PIN end-to-end | 16/16 local; **5/5** live | 27 Sep, `sim_` phones | `FACT` |
| Export → provable on Hedera | **17 s** | n = 1, 26 Sep 20:31 UTC | `FACT` |
| Real email OTP | delivered and verified | n = 1 | `FACT` |
| Security evidence score | **1.9%** score, 0% confidence | `scripts/security-score.mjs` on 25 Sep sources; quote only with its commit | `FACT` (`2026-09-25-lethabo-security-scorecard.md`) |
| Field false alarms (M2), latency (M3), battery (M4), screen-off continuity (M5), delivery time, false `no_answer`, duress-PIN use under stress, uptime/SLA | **Not measured** | — | — |
| Tests, my runs on 18 Oct | `main`: app jest 285/285, tsc clean, root node 41/41, shared 94 pass / 5 skip, ledger 42/42, `check-docs` **fails** (file name `2026-09-27-lethabo-vigil-0.0.16.md`). #99: Python 212 pass / 2 skip / 150 need PostgreSQL | scratch copies via `git archive` | `FACT` |
| Dependency audit (`main`) | root: 0. shared: 1 high (`source-map-js`, GHSA-68fv-2mgg-jv7q). app: **76** (1 critical `shell-quote`, 69 high, 6 moderate, mostly build tooling) | `npm audit`, 18 Oct | `FACT` |

---

## (e) Repo hygiene: real code that sits only on branches

**On `main`:** the VIGIL app (about 10.2k TS/TSX lines and 1.7k Kotlin), `shared/` (1.1k), the ledger dashboard (3.2k JS), and a **v1-era contract** (`contracts/openapi.yaml` with 13 paths; #99's has 36).

**Only on branches (`FACT`, `git diff` / `git cherry`):**

| Work | Where | Size | State |
|---|---|---|---|
| **The running backend**: server, anchor, `sim_bank`, contract v2, payload schemas and vectors, deploy and smoke scripts, `shared/payloads.js` | #99 head (stack #51 ← #85 ← #89 ← #96 ← #99; #95 also feeds #96) | 193 files, +20,609 in total; server, anchor and `sim_bank` source 6.5k lines plus 5.3k test lines | #51 has 3 CHANGES_REQUESTED each from Khutso and Lethabo; #89 has 1 from Khutso; #99 has Khutso's CHANGES_REQUESTED (26 Sep); #99 CI: `secret-scan` and `semgrep` red (the semgrep cause is not recorded) |
| Post-quantum root attestation | #117 (base #99) | +936 | open |
| Native Kotlin app plus a forked server (36 commits apart from #99) plus Docker, Render and Neon hosting | `feature/integrate`, draft #114 | 7.0k Kotlin; +1,086 hosting and scripts | it **replaces `app/`** with a different app, so it conflicts by design |
| Detect v3, deps fixes, 0.0.17 bump | #124, #125, branch `sibusiso/vigil-0.0.17` (no PR) | +96/−38, +155/−24 | changes requested; each fails the gates the other one fixes |
| YAMNet provenance, eval instrument | #93, #94 | about 800 lines each | open |
| SLA probe and venture plan | #126 | +1,257 | open |

**Superseded and safe to close with a note:** #51, #85, #89, #95, #96 (all contained in #99); #77, #86, #88, #112, #121 (`main`'s `app/` already moved past them). **Docs-only:** #65, #78, #82, #84, #92, #97, #98, #100, #101, #102, #113, #116, #119. There are 31 open PRs and 108 non-main remote branches, of which **27 are already fully merged** and can be deleted.

**What merging takes (`ESTIMATE`, from the trial merge):**
1. **Green `main` first.** Put #124's gitleaks allowlist and file-name rename together with #125's lockfile fixes in one PR, and give a recorded disposition for `braces` and `node-forge`, which have no patched versions.
2. **Open one consolidation PR from #99's head to `main`.** Resolve the 4 doc conflicts, keep `main`'s `ledger-pages`, `security-score` and `vigil-apk` workflows, and take #99's Postgres service in `checks.yml`. Find and fix or waive the semgrep finding. Answer Khutso's #99 and #51 findings. Get both founders' review plus a recorded cross-family AI review (Ipeleng and Khutso are no longer assumed).
3. **Close the stack PRs** with pointers to where their work went.
4. **Add app jest, tsc, ledger tests and an Android assemble to CI.**
5. **Deploy only from `main`.**
6. **Decide D5 (one app)** before anything from `feature/integrate` moves. Its hosting recipe can be cherry-picked on its own.

---

## (f) Proposed ordered launch-blocker list (`PROPOSED`)

1. **Restore a server of record the company controls.** Decide the hosting account (paid, owned by PILOT CORE, South Africa North or a documented s72 basis). Recover or rotate the keys (back up the payload key). Point `server.json` at it. Until the discovery file is signed or pinned, avoid server moves, because they drop guardian links.
2. **Make `main` the code of record.** Get CI green (#124 + #125 combined), merge #99 by consolidation, put all suites in CI, and deploy from `main`.
3. **Fix the S1 safety gaps.** Add `sign_in` and `sign_out` PIN actions (a contract change: both founders and an ADR), with tests that replace `device.test.ts:779-793`. Make push real (FCM service-account flow, the app registers its token, delivery receipts) and add SMS fallback for duress and `no_answer`. Show a "listening stopped" notice and restart behaviour. Sign the discovery file and have migration keep guardians.
4. **Make operations real.** Report a worker heartbeat in `/healthz`, run the SLA probe from `main` with paging, restrict the DB network, run a backup-restore drill, and add bounded recovery for an ambiguous Hedera submit.
5. **Cover data rights and law.** In-app PIN recovery codes and deletion; a retention TTL; the privacy notice and terms; Information Officer registration; a review of export contents (past duress results); IP assignment from all seven contributors to PILOT CORE, and a licensing decision for a public MIT repo (counsel).
6. **Detection you can state with n.** Measure M2–M5 in the field on a budget phone and measure scream recall under v3. Decide ADR-0046 (always on) versus journey mode, and accept or reject ADR-0039 and ADR-0045 to ADR-0049. Until then, keep "not measured".
7. **Distribution.** One app (D5). A Play Console account in the company's name, Play App Signing, signing secrets in CI, current target API, FGS and full-screen-intent declarations, then closed testing.
8. **Before a partner pilot.** Independent pentest (G8), Hedera mainnet with a funded and alarmed account (new pins), a real bank or insurer endpoint in place of `sim_bank`, and inclusion proofs embedded in exports so a record verifies without our server.

## KEY FACTS
- [REPORTED] The release discovery file every installed VIGIL follows (server.json) points to a trycloudflare tunnel, with the note 'Demo fallback: ANCHOR on the presenter PC via Cloudflare tunnel (Azure subscription disabled)' — https://github.com/LethaboMH14/V.U.KA--Geekulcha/releases/download/vigil-demo/server.json (2026-10-15T07:17:36Z (read 2026-10-18))
- [FACT] On main, server/ and anchor/ contain only placeholders (.gitkeep and README); the ANCHOR server code is only on feat/lethabo-guardian-delivery (PR #99), which is 155 commits ahead of main and 109 behind — git ls-tree origin/main server/ anchor/; git rev-list --left-right --count origin/main...origin/feat/lethabo-guardian-delivery (2026-10-18)
- [FACT] The commit Azure ran (431f887) is an ancestor of the PR #99 head a2e83e5 — git merge-base --is-ancestor 431f887 origin/feat/lethabo-guardian-delivery (2026-10-18)
- [FACT] The server PRs form a stack: #51 (base main) <- #85 <- #89 <- #96 <- #99 <- #117; #95 targets #96's branch — GitHub REST /pulls/{n} base.ref (2026-10-18)
- [FACT] A trial merge of #99 into main conflicts only in 4 docs (docs/CHECKLIST.md, docs/SIBUSISO-HANDOVER.md, docs/adr.md, team/khutso.md); no code conflicts — git merge-tree --write-tree origin/main origin/feat/lethabo-guardian-delivery (scratch mirror) (2026-10-18)
- [FACT] On the trial-merged tree: root node tests 68/68, shared vitest 151/151, Python 224 passed, 2 skipped, 150 not run (they require PostgreSQL) — node --test; npx vitest run; pytest anchor/tests server/tests sim_bank/tests scripts/tests (scratch copy) (2026-10-18)
- [FACT] Main's 'Repository gates' last passed on 2026-09-25T22:35Z (8ba6c50); at main head 1aa8830, document-contracts, secret-scan, npm-audit and osv-scan fail — GitHub Actions REST API, checks.yml runs on main (2026-10-14 run, read 2026-10-18)
- [FACT] PR #124 head fails npm-audit and osv-scan; PR #125 head fails document-contracts, secret-scan and osv-scan; Lethabo requested changes on both (14 and 16 Oct) — GitHub check-runs for 15aa8ec and 1a543b5; /pulls/124/reviews, /pulls/125/reviews (2026-10-16)
- [FACT] vigil-apk.yml ran 4 times on main on 27 Sep and failed every time (signing secrets not set); no CI-built APK has shipped — GitHub Actions REST API, workflow vigil-apk.yml (2026-09-27)
- [FACT] CI (checks.yml) does not run app jest/tsc, the ledger dashboard tests or any Android build — .github/workflows/checks.yml:41-72 (2026-10-18)
- [FACT] VIGIL on main is versionCode 16 / 0.0.16 (com.teamsonar.vuka); targetSdk 34, minSdk 23 — app/android/app/build.gradle:91-95; app/android/build.gradle:4-6 (2026-10-18)
- [FACT] On main: app tsc clean and jest 285/285 (20 suites); root node 41/41; shared vitest 94 passed, 5 skipped; ledger tests 42/42; check-docs fails on the file name 2026-09-27-lethabo-vigil-0.0.16.md — local runs on a git-archive copy of origin/main 1aa8830 (2026-10-18)
- [FACT] PR #99 Python suite run without PostgreSQL: 212 passed, 2 skipped, 150 errors, each 'real PostgreSQL required: set VUKA_TEST_DATABASE_URL' — pytest on a git-archive copy of origin/feat/lethabo-guardian-delivery a2e83e5 (2026-10-18)
- [FACT] PR #99 CI at a2e83e5: the tests job (with a Postgres 17 service) succeeded; secret-scan and semgrep failed — GitHub check-runs for a2e83e5 (2026-09-27T07:21Z)
- [FACT] device.signIn accepts either PIN and records or sends nothing, so a duress PIN at 'Welcome back' raises no alarm — app/src/api/device.ts:743-750 (2026-10-18)
- [FACT] A test asserts that sign-in records and sends nothing for either PIN — app/src/api/__tests__/device.test.ts:779-793 (2026-10-18)
- [FACT] Spec V6: a duress PIN at any PIN prompt must emit a signed duress signal — docs/VUKA-2-SPEC.md:39 (2026-10-18)
- [FACT] Sign-out with no active journey verifies the PIN but ignores duress mode (no pin_authorised is recorded) — app/src/api/device.ts:727-736 (2026-10-18)
- [FACT] The server's pin_authorised action allow-lists contain only end_journey, export, delete, add_guardian and remove_guardian (no sign_in) — origin/feat/lethabo-guardian-delivery:server/event_effects.py:87; server/pin_records.py:33 (2026-10-18)
- [FACT] The server returns 409 contact_in_use, and the app's fallback maps unknown errors to "Couldn't reach VIGIL's server" — origin/feat/lethabo-guardian-delivery:server/accounts.py:298; app/src/api/device.ts:486-495 (2026-10-18)
- [FACT] The app follows an unsigned server.json on a GitHub release; a move to a non-tunnel server re-registers the member, parks queued events, and guardians must be invited again; any two trycloudflare hosts are treated as the same server — app/src/api/device.ts:46, 380-390, 392-421, 427-430 (2026-10-18)
- [FACT] SensingService returns START_NOT_STICKY, so there is no restart after the process is killed — app/android/app/src/main/java/com/teamsonar/vuka/detect/SensingService.kt:69,81 (2026-10-18)
- [FACT] PIN recovery is not built in the app ('Recovery codes aren't in this build yet'), while the server branch has POST /v1/devices/recover — app/src/ui/account.tsx:24; origin/feat/lethabo-guardian-delivery:server/main.py:561 (2026-10-18)
- [FACT] contact_lost is off by default (VUKA_CONTACT_LOST_ENABLED defaults to '0') — origin/feat/lethabo-guardian-delivery:server/contact.py:46 (2026-10-18)
- [FACT] /healthz reports only database reachability, not worker liveness — origin/feat/lethabo-guardian-delivery:server/main.py:439-448 (2026-10-18)
- [FACT] FCM uses a static FCM_ACCESS_TOKEN from settings (about 1 h life); no SMS provider is selected in source — origin/feat/lethabo-guardian-delivery:server/src/notify/fcm.py:65-66; server/src/notify/sms.py:1-5 (2026-10-18)
- [FACT] The demo export has empty proofs and receipts; the ledger fetches the Merkle path from the ANCHOR server (default https://vuka-anchor-server.azurewebsites.net) — docs/demo/VIGIL-record-demo.json; dashboard/ledger/lib/sources.js:14,116-124 (2026-10-18)
- [FACT] Azure: App Service B1 and PostgreSQL Flexible B1ms in UAE North; a subscription policy blocks South Africa North; the DB firewall rule AllowAzureServices is 0.0.0.0 — docs/SIBUSISO-HANDOVER.md:109, 301, 351 (2026-09-26)
- [FACT] Hedera is testnet only: topic 0.0.10687280, epoch 1, manifest fingerprint f20cf84a…4830 — contracts/keys/verify-pins.json (2026-10-18)
- [FACT] The first 0x01 root landed at mirror seq 5 on 26 Sep at 19:52:33 UTC; the demo record verified against testnet message #62 on 27 Sep at 11:58:39 UTC — docs/SIBUSISO-HANDOVER.md:364; docs/demo/README.md (2026-09-27)
- [FACT] Glass recall on held-out ESC-50 folds 4-5 is 11/16 (68.8%), ruleset v1; tuning folds 1-3 are 21/24 — docs/EVIDENCE.md:61 (2026-09-25)
- [FACT] Held-out false records 4 in 0.544 h (392 clips) = 7.3/h; host-replay false prompts 5.5/h — docs/EVIDENCE.md:62-63 (2026-09-25)
- [FACT] FSD50K eval, check-in opens (V4): Glass 46.0% n=139, Gunshot 54.6% n=108, Screaming 6.5% n=108, Shatter 72.9% n=70 — docs/eval/cem1-measurements.md:12-17 (2026-09-26)
- [FACT] Ruleset v3 raises V4 false prompts from 4.6 to 6.4/h on 784 ESC-50 non-glass clips (1.09 h); short-call recall not measured — origin/sibusiso/detect-sensitivity:docs/eval/voice-v3-false-alarms.md (2026-10-14)
- [FACT] The Azure end-to-end demo check passed 14/14 in one run — docs/SIBUSISO-HANDOVER.md:467; docs/NEW-CHAT-HANDOVER.md:33-40 (2026-09-27)
- [FACT] The vigil-demo release is a prerelease titled 'VIGIL demo (0.0.8)', with notes describing 0.0.15; VIGIL.apk is 42,669,560 bytes, uploaded 2026-09-27T06:47Z, 20 downloads; debug-signed VUKA.apk and VUKA-next.apk are on the same release — GitHub Releases API, tag vigil-demo (2026-10-18)
- [FACT] The native VUKA app (za.co.vuka.app, targetSdk 37) is 7,036 Kotlin lines in 53 files plus 224 test lines, and exists only on feature/integrate and draft #114 — git ls-tree origin/lethabo/native-guardian-watch-and-sos app/src (2026-10-18)
- [FACT] #99 branch code sizes: server 5,299 source + 4,152 test lines; anchor 1,034 + 991; sim_bank 167 + 150 — git show line counts on origin/feat/lethabo-guardian-delivery (2026-10-18)
- [FACT] There are 31 open PRs and 108 non-main remote branches; 27 of those branches are already fully merged into main — GitHub REST /pulls?state=open; git merge-base --is-ancestor per branch (2026-10-18)
- [FACT] The repository is public on GitHub — GitHub REST /repos/LethaboMH14/V.U.KA--Geekulcha visibility (2026-10-18)
- [FACT] LICENSE is MIT, 'Copyright (c) 2026 Lethabo Masilo Hoaeane' — LICENSE:1-3 (2026-10-18)
- [FACT] npm audit on main: root 0; shared 1 high (source-map-js); app 76 (1 critical shell-quote, 69 high, 6 moderate) — npm audit on a scratch copy of origin/main (2026-10-18)
- [FACT] ADR-0039 and ADR-0045 to ADR-0049 are all Status: Proposed — docs/adr.md:462-463, 567-568, 579, 602, 651, 673 (2026-10-18)
- [ESTIMATE] App Service B1 costs about $9.49/month (Dev/Test price) against about $13.14 pay-as-you-go — docs/SIBUSISO-HANDOVER.md:351 (2026-09-26)
- [ASSUMPTION] No backup of the Azure payload AES key is recorded; if the subscription stays disabled, encrypted payloads in the Azure DB may be unrecoverable — docs/SIBUSISO-HANDOVER.md:305 (key generated via a temp file, then deleted) (2026-10-18)
- [FACT] Live endpoints (Azure /healthz, GitHub Pages ledger, Hedera mirror, the tunnel) could not be checked from this session: the proxy returned 403 — curl from this session (2026-10-18)

## CONFLICTS/GAPS
- The release server.json (15 Oct) says 'Azure subscription disabled', but docs/venture/04-SLA.md, 06-LAUNCH-ROADMAP.md and docs/NEW-CHAT-HANDOVER.md (written 18 Oct or earlier) describe Azure as running. No repo file records the outage, its cause or the data or key situation.
- previous-server.json says it was updated 2026-09-27T19:43:49Z and its note says 'Demo ANCHOR server on Azure App Service', but its URL is a trycloudflare tunnel. docs/SIBUSISO-HANDOVER.md:462 says server.json was back on Azure at about 07:00 UTC on 27 Sep. So by that evening the apps were apparently pointed at a tunnel again.
- The venture docs (03 and 06) list the duress-PIN gap only at sign-in. Code shows the same gap at sign-out with listening paused (device.ts:727-736), which the 25 Sep onboarding-queue build log also records.
- docs/OPEN-GAPS.md G17 says the repo is private and branch protection is impossible; the GitHub API shows it is public. Whether branch protection is now configured could not be read (API 403).
- docs/CHECKLIST.md P3 rows (P3.A1–A6, K4, K5 and others) still show unticked although much is built on branches; the checklist and OPEN-GAPS are stale since 25–27 Sep.
- docs/NEW-CHAT-HANDOVER.md says screams and gunshots have not been measured, but docs/eval/cem1-measurements.md has FSD50K figures (screams 6.5%, n = 108). docs/EVIDENCE.md has not been updated with them.
- The release title says 0.0.8, the notes describe 0.0.15, and the VIGIL.apk asset is believed to be 0.0.16 (from upload timing; not verified by inspecting the APK).
- The handover's 'Python 376 passed' is consistent with the 376 tests I collected on the merged tree, but I could not run the 150 PostgreSQL tests here; their pass rests on CI from 27 Sep.
- The cause of the semgrep failure on PR #99 is not recorded anywhere I could find; the job log blob was unreachable (403).
- Whether VUKA_CONTACT_LOST_ENABLED was set on Azure, whether the 0.0.16 APK includes Firebase, and whether the payload key was backed up are not recorded.
- docs/demo/README.md presents LIVE-VERIFIED as reproducible, but verification needs the ANCHOR proof endpoint; with Azure down it probably will not reproduce (not checked live).
- PRs #124 and #125 each fail the CI gates the other fixes, so neither can pass alone.
- Two app codebases (RN VIGIL on main; native Kotlin on feature/integrate) both use the app/ path, and their server lines have diverged by 36 commits; there is also a native-only Docker/Render hosting recipe not present on #99.
- Ipeleng's review of the 26 Sep server key rotation, ADR-0046–0049 acceptance and the §4b payload ADR are still owed; with the team now two founders, the named third reviewers no longer exist.
- Play Store policy specifics (target API level required in Oct 2026, the USE_FULL_SCREEN_INTENT rules, FGS-type declarations) and the Azure for Students offer terms were not checked against primary sources in this pass.

## RECS
- 1. Restore a server of record under PILOT CORE's own paid account (South Africa North, or a documented POPIA s72 basis for UAE North). Record the Azure outage and its cause in the repo, back up or rotate the payload, server and Hedera keys, and point server.json at the new server. Freeze server moves until discovery is signed, because a move drops guardian links.
- 2. Get main green in one PR that combines #124's gitleaks allowlist and file rename with #125's lockfile fixes, with a written disposition for braces and node-forge.
- 3. Merge the running backend: open one consolidation PR from #99's head (a2e83e5) into main. Resolve the 4 doc conflicts, keep main's workflows, adopt #99's Postgres CI service, and fix or waive the semgrep finding. Answer Khutso's #51, #89 and #99 findings. Then close #51, #85, #89, #95 and #96 with pointers, and close the stale app PRs #77, #86, #88, #112 and #121.
- 4. Add app tsc and jest, the ledger tests and an Android assemble job to CI. Put the APK signing secrets in CI (or adopt Play App Signing) and deploy the server only from main through CI.
- 5. Fix the S1 duress gaps with an ADR and a contract change: add pin_authorised actions sign_in and sign_out, send the same-shaped event for both PINs, and have the server treat duress as a full alarm. Replace the test at app/src/api/__tests__/device.test.ts:779-793.
- 6. Make guardian delivery real: an FCM service-account token flow on the server, token registration in a Firebase build of VIGIL, per-alert delivery receipts, and SMS fallback through an SA gateway for duress and no_answer. Device-test it with the guardian app closed.
- 7. Handle silent loss of protection: show a 'listening stopped' notice and restart behaviour (the service is START_NOT_STICKY today), and sign or pin the server discovery file.
- 8. Report a worker heartbeat in /healthz, merge the SLA probe to main with paging, add bounded recovery for an ambiguous Hedera submit, tighten the PostgreSQL firewall, and run a backup-restore drill.
- 9. Ship PIN and device recovery codes and data deletion in the app, add a retention TTL, finish the privacy notice and terms, register the Information Officer, and review whether a shared export should reveal past duress outcomes.
- 10. Embed inclusion proofs and receipts in exports (the fields already exist and are empty) so a record verifies from Hedera without VUKA's server.
- 11. Measure before claiming: field false alarms, latency, battery and screen-off continuity on a budget phone, and scream and shout recall under ruleset v3 on FSD50K or recorded clips, each with n. Promote the FSD50K results into docs/EVIDENCE.md, and decide ADR-0046 (always on, qualified) against journey mode.
- 12. Decide D5 (one app). Clean up the vigil-demo release (correct title and notes; move the debug-signed native APKs elsewhere), and plan Play Console closed testing: company account, current target API, FGS and full-screen-intent declarations.
- 13. Before any partner pilot: an independent penetration test, Hedera mainnet with a funded and alarmed operator separate from the submit key, a real bank or insurer endpoint replacing sim_bank, and IP assignment from all seven contributors to PILOT CORE (Pty) Ltd, plus a decision on the public MIT licence, with counsel.