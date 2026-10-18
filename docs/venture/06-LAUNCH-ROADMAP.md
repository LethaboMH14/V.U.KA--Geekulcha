# 6 · From hackathon demo to a launch real people can rely on

> **E-Hub insight 6 (15 Oct 2026):** *"The build needs to be launched soon and developed more."*
> **Status:** state of the build `FACT` with sources; the plan `PROPOSED`. "Launched" here means **a closed beta on the Play Store's testing track with consenting testers**, then a partner pilot. A public launch comes after the pilot, not before. Serves T, S, U, B.

---

## 1 · What exists today (`FACT`)

| Part | State | Source |
|---|---|---|
| **VIGIL app** (React Native, `com.teamsonar.vuka`) | On `main`, version **0.0.16** (27 Sep), distributed as a signed APK from a QR code; jest 285/285 at release | `docs/build-log/entries/2026-09-27-lethabo-vigil-0.0.16.md` |
| **Native VUKA app** (Kotlin, `za.co.vuka.app`) | On `feature/integrate` and draft PR #114 only; a separate codebase | `docs/SIBUSISO-HANDOVER.md` (27 Sep, 05:30 UTC update) |
| **ANCHOR server** (FastAPI, PostgreSQL, Hedera sidecar) | Running on Azure; **its code is on `feat/lethabo-guardian-delivery` (PR #99), not on `main`**. On `main`, `server/` and `anchor/` hold placeholders | `git ls-files server anchor` on `main`, 18 Oct |
| End-to-end on Azure | **14/14** steps on 27 Sep (sign-up email code, guardian invite, wrong-PIN heads-up, duress alert with the simulated bank hold, stand down, export provable on Hedera); one run | `docs/NEW-CHAT-HANDOVER.md` |
| Public verify page | Live on GitHub Pages; LIVE-VERIFIED a real record against Hedera **testnet** on 27 Sep | same |
| Measured detection | See [`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md) §1: screams 6.5% (n = 108) | `docs/eval/cem1-measurements.md` |

**Known limits on record** (`docs/NEW-CHAT-HANDOVER.md`, `docs/SIBUSISO-HANDOVER.md`): SMS codes simulated; Google sign-in has no code step; guardians must keep the app open (FCM push not used by the app); **a duress PIN at "Welcome back" doesn't raise the alarm**; signing up again with the same email after clearing storage fails (`409 contact_in_use`, shown as a network error); the bank is simulated; Hedera is testnet; hosting is Azure for Students in UAE North.

## 2 · Launch blockers, in order

**P0 — safety: a real person could be hurt or misled**

1. **Duress PIN at sign-in raises nothing** (§4). Breaks V6: "a duress PIN anywhere is an alarm".
2. **Guardians only receive alerts while their app is open.** A guardian who closed the app misses a duress alert. Real push delivery, plus SMS fallback ([`04-SLA.md`](04-SLA.md) changes 3 and 4).
3. **Listening can stop silently** if Android kills the service (`START_NOT_STICKY`); the member must be told.
4. **The onboarding promise about when guardians hear is out of date** (the wrong-PIN heads-up isn't mentioned).

**P1 — trust and law: needed before any tester who isn't on the team**

5. **Code of record.** Merge the running server onto `main` (D4), and choose one app (D5).
6. **Privacy notice rewritten** for what the app does now, and **Information Officer registered** for PILOT CORE (Pty) Ltd.
7. **Hosting region:** move to Azure South Africa North on a paid subscription, or document the POPIA s72 basis for UAE North.
8. **Worker heartbeat in `/healthz`** and the hourly probe live ([`04-SLA.md`](04-SLA.md)).
9. **`contact_in_use`** gets its own message; decide whether a verified inbox may move an email off an abandoned test account.
10. **Signing keys for the APK in CI**, so a release doesn't depend on one laptop (the 27 Sep APK build was blocked on the four signing secrets).

**P2 — needed before a partner pilot**

11. Independent **penetration test** (G8).
12. **Hedera mainnet** with a funded operator account and a balance alarm.
13. A real **bank or insurer endpoint** in place of `sim_bank` (offer B in [`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)).
14. **PIN recovery** (spec §9 recovery code), which isn't built: today a forgotten PIN can't be recovered.
15. Field measurements M2–M8 on a budget phone ([`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md) §4, item 1).

## 3 · Two code-of-record decisions (D4, D5)

**D4 — merge the server onto `main`.** Today the reviewed branch (`main`) and the running system have drifted apart: a partner's security review, a new contributor and every AI tool read `main` and find placeholders. Proposed: one consolidation PR from the branch Azure runs, reviewed by both founders, with the full Python suite and the end-to-end scripts in CI; then Azure deploys only from `main`. The older server PRs (#51, #89, #96) are closed as superseded once it lands, each with a note saying where its work went.

**D5 — one app.** VIGIL (React Native) is the published demo app, with CEM-1, motion and the latest sign-up flow. The native app has the power-button help and guardian watch work (#114). Two apps halve the effort on each and double the safety testing. Proposed: **VIGIL is the app**; port power-button help to it (measuring pocket presses), and archive the native app as lineage, as was done for KHAYA and UMOJA. Lethabo owns this decision.

## 4 · The sign-in duress fix (D6), specified

**Today:** `device.signIn(pin)` (`app/src/api/device.ts`) accepts either PIN and records nothing. Spec V6 says a duress PIN at any prompt emits a `pin_authorised` with `mode: duress`. Lethabo's 0.0.16 entry already lists it: "needs its own fix and test".

**Why it isn't a one-line fix:** `pin_authorised` allows only `end_journey`, `export`, `delete`, `add_guardian` and `remove_guardian`. That list is in the payload schema and in two server allow-lists (`contracts/payloads/pin_authorised.v1.json`, `server/event_effects.py`, `server/pin_records.py`, all on the server branch). Adding an action is a contract change: **both founders and an ADR**.

**Proposed change:**

- **Contract:** add action `sign_in`, with `target_id` set to the member's own subject id.
- **App:** `signIn` records `pin_authorised('sign_in', subjectId, mode)` for **both** PINs and flushes it the same way. The normal path must send the same event, so that request shape and timing can't reveal which PIN was used (V5, T15 harness). The screen is unchanged.
- **Server:** accept `sign_in` for the member's own subject. In normal mode it is recorded and nothing else happens. In duress mode it is a duress signal: open or keep an incident, alert guardians, and send the S1 bank signal once.
- **Tests:**
  - a duress sign-in alerts guardians and sends the bank signal once;
  - a normal sign-in alerts no one;
  - the two requests are the same size and shape;
  - a wrong PIN still shows "Try again" and sends nothing.
- **Edge case to decide:** a member signed out with no network. The authorisation queues like every other event, and the alarm goes out when the phone reconnects. Say this on the honesty slide.

## 4a · Smaller fixes worth doing in the same pass

- The onboarding line about when guardians hear (P0 item 4).
- A "listening stopped" notice when the service dies (P0 item 3).
- `check-docs` currently fails on `main` because one build-log file name has dots in its slug (`2026-09-27-lethabo-vigil-0.0.16.md`). Rename it, or relax the pattern; Lethabo's call, since it's her entry.

## 5 · Phases and dates (proposed)

| Phase | When | Done means |
|---|---|---|
| **0 · Stabilise** | now → mid Nov 2026 | D4 and D5 decided; server on `main`; P0 items 1–4 fixed and tested; SLA probe live; privacy notice rewritten; IO registered |
| **1 · Closed beta** | mid Nov 2026 → Jan 2027 | Play Console internal or closed testing; 20–50 consenting testers from one campus or NGO partner ([`02-SAPS-AND-NGOS.md`](02-SAPS-AND-NGOS.md)); field false alarms, battery and delivery measured; a weekly build |
| **2 · Pilot-ready** | Feb → Apr 2027 | Penetration test done; South Africa North; mainnet; real push and SMS; the pilot SLA met for 30 consecutive days by the probe |
| **3 · Partner pilot** | from May 2027 (the financial model's assumption) | One partner, up to 5,000 members, 12 months, measured ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) §6) |

## 6 · How we work now that it's two founders

- **Every change still goes through a PR**, reviewed by the other founder. Security and contract changes also get a cross-family AI review recorded in the PR, because the third human reviewer (Ipeleng) is no longer assumed.
- **A weekly release cadence** in the beta: a tagged build, release notes, and the probe's weekly score.
- **One public roadmap** (this file), updated in the same PR that changes it.
