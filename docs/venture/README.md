# VUKA after the hackathon: the venture plan

> **Status:** `PROPOSED`, 18 Oct 2026. Written by Sibusiso's Claude Code assistant from what Sibusiso shared on 18 Oct, the repository, and a web research pass the same day. **Nothing here is decided until both founders agree it**, in the PR that adds this folder or a later one.
> **Founders:** Sibusiso Khumalo and Lethabo Hoaeane, **PILOT CORE (Pty) Ltd** ("PILOTCORE"), which produces VUKA.
> **Rules that still apply:** claim tags (`FACT` · `ESTIMATE` · `ASSUMPTION` · `PROPOSED`) and the honesty ledger in [`docs/MASTER-CONTEXT.md`](../MASTER-CONTEXT.md) §6–§7. What changes is the audience: partners, investors and award judges instead of one hackathon panel (§4).

---

## 1 · What happened since the hackathon

| When | What | Tag / source |
|---|---|---|
| 25–27 Sep 2026 | VUKA (VIGIL + ANCHOR) built and demonstrated at the Geekulcha Annual Hackathon, Blockchain for Impact Use track | `FACT` — `docs/MASTER-CONTEXT.md` §1, `docs/SIBUSISO-HANDOVER.md` |
| 5–7 Oct 2026 | Caplia investor-readiness score 327/700 (5 Oct, before deck changes); Figma investor deck reworked for two founders under PILOTCORE; financial model script added | `FACT` (founders' record) — `docs/SIBUSISO-HANDOVER.md` "2026-10-07" |
| Oct 2026 | Entered Investec's **The Easies** awards (the reason for the Caplia deck) | `FACT` (Sibusiso, 18 Oct) |
| Oct 2026 | Selected for the **Nedbank YouthX Awards 2026 top 50** | `FACT` — YouthX email to Sibusiso Khumalo, shared 18 Oct; no public list yet, so it is quoted as the email says |
| 15 Oct 2026 | Demonstrated at the **Wits E-Hub Tech & AI Day and Tech Demo Showcase** (Entrepreneurship Week), with VCs, funders and ecosystem partners present | `FACT` (Sibusiso, 18 Oct) |
| 18 Oct 2026 | Sibusiso and Lethabo decide to keep building VUKA as a business | `FACT` (Sibusiso, 18 Oct) |

## 2 · The six things the E-Hub showcase taught us, and where each is answered

| # | Feedback (as Sibusiso recorded it) | Plan | Owner (proposed) |
|---|---|---|---|
| 1 | Turn VUKA into a **B2B enterprise model** selling to insurers and Nedbank; collaborate and **integrate VIGIL and ANCHOR into their systems** | [`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) | Sibusiso (partners, ANCHOR APIs), Lethabo (SDK, product) |
| 2 | Approach **SAPS** and get backing from aligned **South African NGOs** | [`02-SAPS-AND-NGOS.md`](02-SAPS-AND-NGOS.md) | Lethabo and Sibusiso |
| 3 | **Strengthen the signs of distress** that trigger VUKA; lawful, and comfortable to have on a phone | [`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md) | Lethabo (detection), Sibusiso (server) |
| 4 | Get VUKA to the **best SLA score** possible | [`04-SLA.md`](04-SLA.md), plus the probe in `scripts/sla/` | Sibusiso |
| 5 | **Two pitches**: investors (how it makes money) and judges (feasibility, scalability, community impact) | [`05-TWO-PITCHES.md`](05-TWO-PITCHES.md) | Sibusiso (investor), Lethabo (judges) |
| 6 | **Launch the build soon** and keep developing it | [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) | both |
| — | (18 Oct) Lethabo starts the **PILOTCORE company website** | [`PILOTCORE-WEBSITE-BRIEF.md`](PILOTCORE-WEBSITE-BRIEF.md) | Lethabo |

## 3 · Decisions only the two founders can make

Each is argued in the file named. None is made here.

| # | Decision | Why it can't wait | Where |
|---|---|---|---|
| D1 | **One canonical economics model on `main`.** Three are in circulation (break-even 10,901 on `main`, 10,973 in the Caplia deck from an unmerged branch, and an older R50 model). The model still pays five hackathon stipends for a two-founder company | An investor checks the deck against the model | `05-TWO-PITCHES.md` §5 |
| D2 | **Re-size the funding ask** (R1,884,583 today) from a two-founder cost base, launch costs and a realistic first-revenue date | The current ask runs out of cash in its own model (lowest −R114,328) | `05-TWO-PITCHES.md` §5 |
| D3 | **Lead buyer:** a bank first (Nedbank, through the YouthX relationship) or an insurer first | It decides the first integration we build | `01-B2B-ENTERPRISE.md` §5 |
| D4 | **Merge the running server onto `main`.** The code Azure runs is on `feat/lethabo-guardian-delivery` (PR #99); `main` holds placeholders | No partner can review, and no launch can ship, code that isn't on `main` | `06-LAUNCH-ROADMAP.md` §3 |
| D5 | **One app.** VIGIL (React Native, `main`) and the native VUKA app (`feature/integrate`) both exist | Two apps halve the work on each | `06-LAUNCH-ROADMAP.md` §3 |
| D6 | **Fix the sign-in duress gap** (a duress PIN at "Welcome back" signs in without raising the alarm; spec V6 says it must) — needs a new PIN action in the contract | It is a safety rule the product currently breaks | `06-LAUNCH-ROADMAP.md` §4 |
| D7 | **Listening model:** ADR-0046 (always on until paused) or back to journey mode, as the default people will be comfortable with | Comfort and battery, and the honesty ledger forbids an unqualified "always on" | `03-DISTRESS-SIGNALS.md` §6 |
| D8 | **`docs/MASTER-CONTEXT.md` v4** for the business phase: new audiences, the two-founder team, today's figures. Owner Khutso, or the founders if Khutso has moved on | Every tool reads it first; it still describes a hackathon weekend | this file §4 |

## 4 · What stays the same, and what changes

**Stays:** the thesis (*VIGIL notices, ANCHOR proves when*), "machines notice, people decide" (ADR-0034), no generative model in the product (ADR-0038), the honesty ledger, claim tags, the four review gates, and `sim_` / SIMULATED for anything simulated.

**Changes:**
- **The criteria.** The hackathon's I/T/U/S/B/Q weights no longer decide anything. In their place: what a partner's vendor-risk team asks, what an investor asks, and the published rubric of each award. `05-TWO-PITCHES.md` §2 lists them.
- **The team.** Seven members became two founders. The work done by the other five stays credited in `team/` and in the build log; nothing is rewritten. Review rules in `RULES.md` that need "both leads" still work with two founders. Rules that name a third reviewer (for example Ipeleng for security) need a replacement, either an outside reviewer or a cross-family AI review recorded as such, never a silent skip.
- **"Built" means deployable.** After the hackathon, a feature counts as built when it is on `main`, deployed, and measured, not when it works on a branch.

## 5 · The next 90 days at a glance (proposed)

| By | What | File |
|---|---|---|
| end Oct 2026 | D1, D2, D4, D5 decided; running server merged to `main`; SLA probe live; website domain chosen | 05, 06, 04, website brief |
| mid Nov 2026 | Sign-in duress fix and real push delivery shipped; first NGO and campus-safety conversations held and recorded; pitches rehearsed | 06, 02, 05 |
| 21 Nov 2026 | YouthX awards night (`REPORTED` date, Nedbank call for entries); company website live | 05, website brief |
| Dec 2026 | Closed beta on the Play Store's testing track with consenting testers; first bank or insurer meeting; written pilot proposal | 06, 01 |
| Jan 2027 | Pilot agreement drafted, with the SLA targets from `04-SLA.md` and the penetration test booked | 01, 04 |
