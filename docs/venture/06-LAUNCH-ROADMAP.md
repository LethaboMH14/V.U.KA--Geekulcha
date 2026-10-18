# 6 · From hackathon demo to a launch real people can rely on

> **E-Hub insight 6 (15 Oct 2026):** *"The build needs to be launched soon and developed more."*
> **Status:** state of the build `FACT` with sources (a read-only audit of the repository, its branches, PRs, CI runs and release assets on 18 Oct 2026); the plan `PROPOSED`. "Launched" means **a closed beta on the Play Store's testing track with consenting testers**, then a partner pilot. A public launch comes after the pilot. Serves T, S, U, B.

---

## 0 · Most urgent: VUKA has no server of record it controls

The release file every installed VIGIL follows to find its server (`server.json` on the `vigil-demo` release) was changed on **15 Oct 2026** to a Cloudflare tunnel on a presenter's PC, with the note *"Demo fallback: ANCHOR on the presenter PC via Cloudflare tunnel (Azure subscription disabled)"* (`REPORTED`: the asset's own note; who changed it isn't recorded). Nothing in the repository records the outage, its cause, or the state of the data and keys.

Microsoft's own documentation says an Azure for Students subscription is **disabled when its credit is used up or expires**, and is meant only for education, non-commercial research and demonstration (`FACT`, Microsoft docs; see [`04-SLA.md`](04-SLA.md) §4.2). Until a server the company controls is back:
- **a member is unprotected**: a journey can't start without a server (`app/src/api/device.ts`, `startJourney`);
- **the demo record can't show LIVE-VERIFIED again**, because exports carry empty proofs and the verify page fetches the Merkle path from the server (`docs/demo/VIGIL-record-demo.json`; `dashboard/ledger/lib/sources.js`);
- **moving servers drops guardian links**: the app follows an unsigned `server.json`, and a move to a new server re-registers the member and needs guardians to be invited again (`device.ts`).

**First action (Sibusiso, this week):** check the subscription's state and credit; write down what happened; confirm whether the payload encryption key has a backup (none is recorded); then decide decision **D9** in the README (a paid subscription owned by PILOT CORE, in South Africa North).

## 1 · What exists today (`FACT`)

| Part | State | Source |
|---|---|---|
| **VIGIL app** (React Native 0.74.5, `com.teamsonar.vuka`, versionCode 16 / 0.0.16) | On `main`. `tsc` clean and **jest 285/285** on 18 Oct. **targetSdk 34** | `app/android/app/build.gradle`; audit run |
| **Native VUKA app** (Kotlin, `za.co.vuka.app`, targetSdk 37) | A separate codebase, about 7,000 lines, on `feature/integrate` and draft PR #114 only; never run on a device | PR #114 |
| **ANCHOR server** (FastAPI, PostgreSQL, Hedera sidecar, `sim_bank`) | **On a branch only**: the head of a five-PR stack (#51 → #85 → #89 → #96 → #99), 155 commits ahead of `main`. Azure ran `431f887`, an ancestor of #99's head. On `main`, `server/` and `anchor/` are placeholders | `git rev-list`, `git merge-base` |
| Server tests | 212 passed, 2 skipped and 150 needing PostgreSQL (not runnable in the audit sandbox) at #99's head; #99's CI `tests` job passed with a Postgres service on 27 Sep; its `secret-scan` and `semgrep` jobs failed | audit run; CI |
| End to end on Azure (27 Sep) | **14/14** steps in one run; wrong-PIN heads-up 5/5 live; export provable on Hedera 17 s after export (n = 1) | `docs/SIBUSISO-HANDOVER.md` |
| Public verify page | On `main`, GitHub Pages; ledger tests 42/42; last deploy 14 Oct | audit run |
| Hedera | **Testnet only**: topic `0.0.10687280`; testnet resets clear topics (G31) | `contracts/keys/verify-pins.json` |
| Distribution | A sideloaded APK on the prerelease `vigil-demo`; **no Play Store listing**. The `vigil-apk.yml` CI build failed 4 of 4 times on 27 Sep for lack of signing secrets, so no CI-built APK has shipped | GitHub Releases and Actions APIs |
| `main`'s CI | **Red since 25 Sep.** At `main`'s head, `document-contracts`, `secret-scan`, `npm-audit` and `osv-scan` fail. Open PRs #124 and #125 each fix what the other still fails | GitHub Actions API |

## 2 · Safety and launch blockers, in order

**S1 — a person in danger could get no alarm while believing they're protected**

1. **No server of record** (§0).
2. **A duress PIN at "Welcome back" (sign-in) raises nothing**, and **neither does a duress PIN at sign-out while listening is paused**. Both break V6. A test currently asserts the sign-in behaviour (`app/src/api/__tests__/device.test.ts`), so the fix replaces it (§4).
3. **Guardians receive alerts only while their app runs.** The published build has no Firebase, the server's push token is hand-refreshed hourly, and the guardian standby uses a `dataSync` foreground service, which **Android 15 caps at 6 hours in 24** (`FACT`, developer.android.com). Real push plus SMS fallback ([`04-SLA.md`](04-SLA.md) §4.3).
4. **Listening can stop silently.** The sensing service is `START_NOT_STICKY` and nothing restarts it; the device microphone toggle gives apps silent audio (`FACT`, developer.android.com). The member must be told either way.

**S2 — silent failure, or exposure a partner or the law won't accept**

5. **Code of record:** combine #124 and #125 into one PR that turns `main` green; then one consolidation PR from #99 to `main`. A trial merge conflicts **only in four documents** (`docs/CHECKLIST.md`, `docs/SIBUSISO-HANDOVER.md`, `docs/adr.md`, `team/khutso.md`), with no code conflicts; on the merged tree, root tests pass 68/68 and `shared/` 151/151 (audit, 18 Oct). Then add app jest and `tsc`, the ledger tests and an Android build to CI, and deploy only from `main` (D4).
6. **One app** (D5, §3).
7. **Signed server discovery,** and a server move that keeps guardian links.
8. **Exports that verify without us:** embed inclusion proofs and receipts in each export (the fields exist and are empty), so a record verifies from Hedera even when VUKA's server is down.
9. **Law and data:** privacy notice and terms rewritten; Information Officer registered for PILOT CORE; retention TTL built; deletion and PIN recovery in the app (the server has both endpoints; the app has neither); hosting region settled (POPIA s72); a review of whether a shared export should show a past incident's duress result (`2026-09-26-lethabo-ledger-dashboard.md`).
10. **Worker heartbeat in `/healthz`**, a watchdog, and the probe running from `main` ([`04-SLA.md`](04-SLA.md)).

**Play Store blockers** (`FACT` from developer.android.com unless tagged)

11. **Target API 36.** From 31 Aug 2026, new apps and updates must target API 36; VIGIL targets 34.
12. **`USE_FULL_SCREEN_INTENT`** is limited to calling and alarm apps since Android 14, and Play revokes the default grant for others. VIGIL declares it, so the check-in must work when it is denied.
13. **Foreground-service declarations** in Play Console for the microphone and location services, with a video showing the member starting protection on screen (`REPORTED`, Play Help via search extract).
14. **A Play Console account and Play App Signing in the company's name,** and the signing secrets in CI.

**Before a partner pilot**

15. Independent **penetration test** (G8).
16. **Hedera mainnet** with a funded operator account (separate from the submit key) and a balance alarm.
17. A real bank or insurer endpoint in place of `sim_bank` ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)).
18. Field measurements M2–M8 on a budget phone ([`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md)).

**Company housekeeping** (D10 in the README)

19. **Accounts:** Azure, Firebase, Brevo, the Hedera portal and Cloudflare sit on personal accounts; the GitHub repository is under Lethabo's personal account. Nothing is held by PILOT CORE (`FACT`, audit). Move each to company-owned accounts.
20. **IP and licence:** the repository is **public** under the MIT licence, "Copyright (c) 2026 Lethabo Masilo Hoaeane" (`LICENSE`). Seven people contributed. Before an investor or partner relies on the code, counsel should advise on assigning contributors' IP to PILOT CORE and on whether the code stays MIT-licensed in public.
21. **Release hygiene:** the `vigil-demo` release is titled 0.0.8, its notes describe 0.0.15, and debug-signed native APKs sit beside VIGIL.apk.
22. **Dependencies:** `npm audit` on `main` reports 76 advisories in `app/` (1 critical, `shell-quote`), mostly in build tooling (`FACT`, 18 Oct). PR #125 starts on these.

## 3 · Two code-of-record decisions (D4, D5)

**D4 — merge the server onto `main`.** The reviewed branch and the running system have drifted apart: a partner's security review, a new contributor and every AI tool read `main` and find placeholders. Proposed order: (1) green `main` (#124 + #125 together, with a written disposition for the two advisories that have no patched version); (2) one consolidation PR from #99's head; (3) close #51, #85, #89, #95 and #96 with a note saying where their work went, and close the stale app PRs #77, #86, #88, #112 and #121; (4) delete the 27 remote branches already fully merged. Reviews: both founders, plus a recorded cross-family AI review for security and contract changes, because the third human reviewers named in `RULES.md` are no longer assumed.

**D5 — one app.** VIGIL (React Native) is the published demo app, with CEM-1, motion and the latest sign-up flow. The native app has the power-button help and guardian watch work (#114). Proposed: **VIGIL is the app**; port power-button help to it, testing it against Android's own 5-press SOS (a 5-press SOS also crosses a 4-press threshold); archive the native app as lineage. Its Docker, Render and Neon hosting recipe can be taken on its own. Lethabo owns this decision.

## 4 · The duress fix at sign-in and sign-out (D6), specified

**Today:** `device.signIn(pin)` accepts either PIN and records nothing; `device.signOut` with no journey running checks the PIN and ignores which one it was. Spec V6: a duress PIN at any prompt emits a `pin_authorised` with `mode: duress`.

**Why it isn't a one-line fix:** `pin_authorised` allows only `end_journey`, `export`, `delete`, `add_guardian` and `remove_guardian`, in the payload schema and in two server allow-lists (`contracts/payloads/pin_authorised.v1.json`, `server/event_effects.py`, `server/pin_records.py`, on the server branch). Adding actions is a contract change: **both founders and an ADR**.

**Proposed change:**
- **Contract:** add actions `sign_in` and `sign_out`, each targeting the member's own subject id.
- **App:** both screens record `pin_authorised(action, subjectId, mode)` for **both** PINs and flush it the same way, so request shape and timing can't reveal which PIN was used (V5, T15 harness). Screens unchanged.
- **Server:** accept both actions for the member's own subject. Normal mode is recorded and nothing else happens. Duress mode is a duress signal: open or keep an incident, alert guardians, send the S1 bank signal once.
- **Tests:** replace the test that asserts sign-in sends nothing; add duress sign-in and duress sign-out (guardians alerted, bank signal once), normal sign-in and sign-out (no alert), request-shape parity, and a wrong PIN that still shows "Try again" and sends nothing.
- **Edge case to decide:** offline. The authorisation queues like every other event and the alarm goes out on reconnection; say so on the honesty slide.

## 4a · Smaller fixes worth doing in the same pass

- The onboarding line about when guardians hear (a wrong PIN also sends a heads-up).
- `contact_in_use` (`409`) shown as "Couldn't reach VIGIL's server"; give it its own message.
- `check-docs` fails on `main` because one build-log file name has dots in its slug (`2026-09-27-lethabo-vigil-0.0.16.md`). #124 renames it; Lethabo's call, since it's her entry.

## 5 · Phases and dates (proposed)

| Phase | When | Done means |
|---|---|---|
| **0 · Recover and stabilise** | now → mid Nov 2026 | A company-owned server in South Africa North; keys backed up; `main` green; D4 and D5 decided and the server on `main`; the S1 items in §2 fixed and tested; SLA probe live; privacy notice rewritten; IO registered |
| **1 · Closed beta** | mid Nov 2026 → Jan 2027 | Target API 36 and the other Play blockers cleared; Play Console closed testing; 20–50 consenting testers from one campus or NGO partner, under that partner's protocol ([`02-SAPS-AND-NGOS.md`](02-SAPS-AND-NGOS.md)); field false alarms, battery and delivery measured; a weekly build |
| **2 · Pilot-ready** | Feb → Apr 2027 | Penetration test done; mainnet; real push and SMS; exports that verify without our server; the pilot SLA met for 30 consecutive days by the probe |
| **3 · Partner pilot** | from May 2027 (the financial model's assumption) | Observe-only first, then up to 5,000 members ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) §6) |

## 6 · How we work now that it's two founders

- **Every change still goes through a PR,** reviewed by the other founder. Security and contract changes also get a recorded cross-family AI review.
- **A weekly release cadence** in the beta: a tagged build, release notes, and the probe's weekly score.
- **One public roadmap** (this file), updated in the same PR that changes it.
