# 6 · From hackathon demo to a launch real people can rely on

> **E-Hub insight 6 (15 Oct 2026):** *"The build needs to be launched soon and developed more."*
> **Status:** the state of the build is `FACT`, with sources, from a read-only audit of the repository, its branches, PRs, CI runs and release assets on 18 Oct 2026. The plan is `PROPOSED`. "Launched" means **a closed beta on the Play Store's testing track with consenting testers**, then a partner pilot. A public launch comes after the pilot. Serves T, S, U, B.

---

## 0 · Most urgent: VUKA has no server of record it controls

The release file every installed VIGIL follows to find its server (`server.json` on the `vigil-demo` release) was replaced by the **`Sibusiso-K` account at 07:17:44 UTC on 15 Oct 2026** (`FACT`, GitHub Releases API). It now points to a Cloudflare tunnel on a presenter's PC, with the note *"Demo fallback: ANCHOR on the presenter PC via Cloudflare tunnel (Azure subscription disabled)"* (`REPORTED`: the asset's own note). The reason, and the state of the data and keys, are not recorded in the repository.

Microsoft's documentation says an Azure for Students subscription is **disabled when its credit runs out or expires**, and is meant only for education, non-commercial research and demonstration (`FACT`, Microsoft docs; [`04-SLA.md`](04-SLA.md) §4.2). Until a server the company controls is back:
- **a member is unprotected.** A journey can't start without a server (`app/src/api/device.ts`, `startJourney`).
- **the demo record probably can't show LIVE-VERIFIED.** Exports carry empty proofs, and the verify page fetches the Merkle path from the server (`docs/demo/VIGIL-record-demo.json`; `dashboard/ledger/lib/sources.js`). `ASSUMPTION`: the code path was read, not checked live.
- **moving servers drops guardian links.** The app follows an unsigned `server.json`. A move to a new server re-registers the member, and guardians must be invited again (`device.ts`).

**First action for Sibusiso, this week:**
1. Write down in the repo what happened to the Azure subscription.
2. Check its state and remaining credit.
3. Confirm whether the payload encryption key has a backup (none is recorded).
4. Decide **D9** in the README together with Lethabo: a paid subscription owned by PILOT CORE, in South Africa North.

## 1 · What exists today (`FACT`)

| Part | State | Source |
|---|---|---|
| **VIGIL app** (React Native 0.74.5, `com.teamsonar.vuka`, versionCode 16 / 0.0.16) | On `main`. `tsc` clean and **jest 285/285** on 18 Oct. **targetSdk 34** | `app/android/app/build.gradle`; audit run |
| **Native VUKA app** (Kotlin, `za.co.vuka.app`, targetSdk 37) | A separate codebase of about 7,000 lines, on `feature/integrate` and draft PR #114 only. Never run on a device | PR #114 |
| **ANCHOR server** (FastAPI, PostgreSQL, Hedera sidecar, `sim_bank`) | **On a branch only**: the head of a five-PR stack (#51 → #85 → #89 → #96 → #99), 155 commits ahead of `main`. The last deployed commit, `431f887`, is an ancestor of #99's head. On `main`, `server/` and `anchor/` are placeholders | `git rev-list`, `git merge-base` |
| Server tests | At #99's head: 212 passed, 2 skipped, and 150 that need PostgreSQL (not runnable in the audit sandbox). #99's CI `tests` job passed with a Postgres service on 27 Sep; its `secret-scan` and `semgrep` jobs failed | audit run; CI |
| End to end on Azure (26–27 Sep) | The API-only demo check passed **14/14** on a rerun, after one run failed at step 1 (a client-side "couldn't reach"). Wrong-PIN heads-up 5/5 live (27 Sep). Export provable on Hedera 17 s after export (n = 1, 26 Sep) | `docs/SIBUSISO-HANDOVER.md` |
| Public verify page | On `main`, served by GitHub Pages; ledger tests 42/42; last deploy 14 Oct | audit run |
| Hedera | **Testnet only**: topic `0.0.10687280`. Testnet resets clear topics (G31) | `contracts/keys/verify-pins.json` |
| Distribution | A sideloaded APK on the prerelease `vigil-demo`; **no Play Store listing**. The `vigil-apk.yml` CI build failed 4 of 4 times on 27 Sep for lack of signing secrets, so no CI-built APK has shipped | GitHub Releases and Actions APIs |
| `main`'s CI | **Red since 26 Sep** (last green 25 Sep, 22:35 UTC). At `main`'s head, `document-contracts`, `secret-scan`, `npm-audit` and `osv-scan` fail. Open PRs #124 and #125 each fix what the other still fails | GitHub Actions API |

## 2 · Safety and launch blockers, in order

**S1 — a person in danger could get no alarm while believing they're protected**

1. **No server of record** (§0).
2. **A duress PIN at sign-out while listening is paused raises nothing**, and neither does **a duress PIN at "Welcome back" (sign-in)**. Both break V6.
   - `device.test.ts:826-840` asserts that the duress PIN (`9876`) at a paused sign-out sends nothing.
   - `device.test.ts:779-793` asserts that a normal-PIN sign-in sends nothing.
   - The fix replaces both (§4).
3. **Guardians receive alerts only while their app runs.**
   - The server's push token was refreshed by hand every hour, and whether the published APK includes Firebase isn't recorded.
   - The guardian standby uses a `dataSync` foreground service. Android 15 caps that at **6 hours in 24 for apps targeting API 35 or higher** (`FACT`, developer.android.com), so VIGIL hits the cap as soon as it moves to API 36 (item 11).
   - The fix is real push plus SMS fallback ([`04-SLA.md`](04-SLA.md) §4.4, changes 5 and 6).
4. **Listening can stop silently.** The sensing service is `START_NOT_STICKY` and nothing restarts it. The device microphone toggle gives apps silent audio (`FACT`, developer.android.com). The member must be told in either case.

**S2 — silent failure, or exposure a partner or the law won't accept**

5. **Code of record:**
   - Combine #124 and #125 into one PR that turns `main` green.
   - Then open one consolidation PR from #99 to `main`. A trial merge conflicts **only in four documents** (`docs/CHECKLIST.md`, `docs/SIBUSISO-HANDOVER.md`, `docs/adr.md`, `team/khutso.md`) and has no code conflicts. On the merged tree, root tests pass 68/68 and `shared/` 151/151 (audit, 18 Oct).
   - Add app jest and `tsc`, the ledger tests and an Android build to CI, and deploy only from `main` (D4).
6. **One app** (D5, §3).
7. **Signed server discovery,** and a server move that keeps guardian links.
8. **Exports that verify without us:** embed inclusion proofs and receipts in each export (the fields exist and are empty), so a record verifies from Hedera even when VUKA's server is down.
9. **Law and data:**
   - Rewrite the privacy notice and terms.
   - Register the Information Officer for PILOT CORE.
   - Build the retention TTL.
   - Put deletion and PIN recovery in the app (the server has both endpoints; the app has neither).
   - Settle the hosting region (POPIA s72).
   - Scope export contents: today a shared export shows an earlier incident's duress result (`2026-09-26-lethabo-ledger-dashboard.md`).
10. **Worker heartbeat in `/healthz`**, a watchdog, and the probe running from `main` ([`04-SLA.md`](04-SLA.md)).

**Play Store blockers** (`FACT` from developer.android.com unless tagged)

11. **Target API 36.** From 31 Aug 2026, new apps and updates must target API 36. VIGIL targets 34.
12. **`USE_FULL_SCREEN_INTENT`** has been limited to calling and alarm apps since Android 14, and Play revokes the default grant for other apps. VIGIL declares it, so the check-in must still work when it is denied.
13. **Foreground-service declarations** in Play Console for the microphone and location services, with a video showing the member starting protection on screen (`REPORTED`, Play Help via search extract).
14. **A Play Console account and Play App Signing in the company's name,** with the signing secrets in CI.

**Before a partner pilot**

15. An independent **penetration test** (G8).
16. **Hedera mainnet,** with a funded operator account (separate from the submit key) and a balance alarm.
17. A real bank or insurer endpoint in place of `sim_bank` ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)).
18. Field measurements M2–M8 on a budget phone ([`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md)).

**Company housekeeping** (D10 in the README)

19. **Accounts:** Azure, Firebase, Brevo, the Hedera portal and Cloudflare sit on personal accounts, and the GitHub repository is under Lethabo's personal account. Nothing is held by PILOT CORE (`FACT`, audit). Move each one to a company-owned account.
20. **IP and licence:** the repository is **public** under the MIT licence, "Copyright (c) 2026 Lethabo Masilo Hoaeane" (`LICENSE`), and seven people contributed. Before an investor or partner relies on the code, counsel should advise on assigning contributors' IP to PILOT CORE and on whether the code stays MIT-licensed in public.
21. **Release hygiene:** the `vigil-demo` release is titled 0.0.8, its notes describe 0.0.15, and debug-signed native APKs sit beside VIGIL.apk.
22. **Dependencies:** `npm audit` on `main` reports 76 advisories in `app/` (1 critical, in `shell-quote`), mostly in build tooling (`FACT`, 18 Oct). PR #125 starts on these.

## 3 · Two code-of-record decisions (D4, D5)

**D4 — merge the server onto `main`.** The reviewed branch and the last deployed system have drifted apart: a partner's security review, a new contributor and every AI tool read `main` and find placeholders. Proposed order:
1. Turn `main` green: #124 and #125 together, with a written disposition for the two advisories that have no patched version.
2. Open one consolidation PR from #99's head.
3. Close #51, #85, #89, #95 and #96 with a note saying where their work went, and close the stale app PRs #77, #86, #88, #112 and #121.
4. Delete the 27 remote branches already fully merged.

Reviews: see §6.

**D5 — one app.** VIGIL (React Native) is the published demo app, with CEM-1, motion and the latest sign-up flow. The native app has the power-button help and guardian watch work (#114). Proposed:
- **VIGIL is the app.**
- Port power-button help to it, and test it on real phones against Android's own 5-press SOS before shipping.
- Archive the native app as lineage. Its Docker, Render and Neon hosting recipe can be kept on its own.

Lethabo leads this decision; both founders agree it.

## 4 · The duress fix at sign-in and sign-out (D6), specified

**Today:**
- `device.signIn(pin)` accepts either PIN and records nothing.
- `device.signOut` with no journey running checks the PIN and ignores which one it was.

Spec V6 says a duress PIN at any prompt emits a `pin_authorised` with `mode: duress`.

**Why it isn't a one-line fix:** `pin_authorised` allows only `end_journey`, `export`, `delete`, `add_guardian` and `remove_guardian`. That list lives in the payload schema and in two server allow-lists (`contracts/payloads/pin_authorised.v1.json`, `server/event_effects.py`, `server/pin_records.py`, all on the server branch). Adding actions is a contract change, so it needs **both founders and an ADR**.

**Proposed change:**
- **Contract:** add actions `sign_in` and `sign_out`, each targeting the member's own subject id.
- **App:** both screens record `pin_authorised(action, subjectId, mode)` for **both** PINs and flush it the same way, so request shape and timing can't reveal which PIN was used (V5, T15 harness). The screens stay as they are.
- **Server:** accept both actions for the member's own subject. In normal mode the event is recorded and nothing else happens. In duress mode it is a duress signal: open or keep an incident, alert guardians, and send the S1 bank signal once.
- **Tests:**
  - Replace `device.test.ts:826-840` (duress at a paused sign-out sends nothing) and `:779-793` (sign-in sends nothing).
  - Add duress sign-in and duress sign-out: guardians alerted, bank signal sent once.
  - Add normal sign-in and sign-out: no alert.
  - Add request-shape parity between the two PINs.
  - Add a wrong PIN that still shows "Try again" and sends nothing.
- **Edge case to decide:** offline. The authorisation queues like every other event, and the alarm goes out when the phone reconnects. Say so on the honesty slide.

## 4a · Smaller fixes worth doing in the same pass

- The onboarding line about when guardians hear: a wrong PIN also sends a heads-up.
- `contact_in_use` (`409`) is shown as "Couldn't reach VIGIL's server". Give it its own message.
- `check-docs` fails on `main` because one build-log file name has dots in its slug (`2026-09-27-lethabo-vigil-0.0.16.md`). #124 renames it. Lethabo's call, since it's her entry.

## 5 · Phases and dates (proposed)

| Phase | When | Done means |
|---|---|---|
| **0 · Recover and stabilise** | now → end Nov 2026 | A company-owned server in South Africa North; keys backed up; `main` green; D4 and D5 decided and the server on `main`; **all four S1 items in §2 fixed and tested**, including real push and SMS fallback; SLA probe live; privacy notice rewritten; IO registered |
| **1 · Closed beta** | from Dec 2026, **once the partner's safeguarding protocol and ethics clearance are agreed** ([`02-SAPS-AND-NGOS.md`](02-SAPS-AND-NGOS.md) §6), to about Feb 2027 | Target API 36 and the other Play blockers cleared; Play Console closed testing; 20–50 consenting testers from that one partner; field false alarms, battery and delivery measured; a weekly build |
| **2 · Pilot-ready** | Feb → Apr 2027 | Penetration test done; mainnet; exports that verify without our server; the pilot SLA met for 30 consecutive days by the probe |
| **3 · Partner pilot** | after a signed pilot letter, observe-only first ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) §6) | The financial model assumes paid members from May 2027; with a first meeting in Dec 2026, that is optimistic |

## 6 · How we work now that it's two founders (`PROPOSED`)

- **Every PR is now lead-authored.** `RULES.md` says a lead-authored PR needs the other lead's approval, the author's recorded self-review and **a nonauthor domain reviewer**. With two founders there is no third person.
- **Proposed rule change:** the other founder reviews every PR. Security and contract changes also get a recorded cross-family AI review, or an outside reviewer. This needs both founders' recorded decision and an edit to `RULES.md`; until then the existing rule stands.
- **A weekly release cadence in the beta:** a tagged build, release notes, and the probe's weekly score.
- **One public roadmap** (this file), updated in the same PR that changes it.
