# VUKA after the hackathon: the venture plan

> **Status:** `PROPOSED`, 18 Oct 2026. Written by Sibusiso's Claude Code assistant from what Sibusiso shared on 18 Oct, the repository, and a research pass the same day (§6). **Nothing here is decided until both founders agree it**, in the PR that adds this folder or a later one.
> **Founders:** Sibusiso Khumalo and Lethabo Hoaeane, **PILOT CORE (Pty) Ltd** ("PILOTCORE"), which produces VUKA.
> **Rules that still apply:** claim tags (`FACT` · `ESTIMATE` · `ASSUMPTION` · `PROPOSED`, plus `REPORTED` for third-party claims not checked first-hand) and the honesty ledger in [`docs/MASTER-CONTEXT.md`](../MASTER-CONTEXT.md) §6–§7. What changes is the audience: partners, investors and award judges instead of one hackathon panel (§4).

---

## 0 · Read first: VUKA has no server of record it controls

The file every installed VIGIL follows to find its server was replaced by the `Sibusiso-K` account on 15 Oct (`FACT`, Releases API). It now points to a tunnel on a presenter's PC, noting **"Azure subscription disabled"** (`REPORTED`: the asset's own note). Until a company-owned server is back, a member can't start a journey, and the demo record probably can't show LIVE-VERIFIED (`ASSUMPTION`: code path read, not checked live). Details and the first actions: [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §0. Decision **D9** below.

## 1 · What happened since the hackathon

| When | What | Tag / source |
|---|---|---|
| 25–27 Sep 2026 | VUKA (VIGIL + ANCHOR) built and demonstrated at the Geekulcha Annual Hackathon, Blockchain for Impact Use track | `FACT`: `docs/MASTER-CONTEXT.md` §1, `docs/SIBUSISO-HANDOVER.md` |
| 5–7 Oct 2026 | Caplia investor-readiness score 327/700 (5 Oct, before the deck changes); Figma investor deck reworked for two founders under PILOTCORE; financial model script added | `FACT` (founders' record): `docs/SIBUSISO-HANDOVER.md` "2026-10-07" |
| Oct 2026 | Entered Investec's **The Easies** awards (the reason for the Caplia deck) | `FACT` (Sibusiso, 18 Oct) |
| Oct 2026 | Selected for the **Nedbank YouthX Awards 2026 top 50** | `FACT`: YouthX email to Sibusiso Khumalo, shared 18 Oct. No public list yet, so it is quoted as the email says |
| 15 Oct 2026 | Demonstrated at the **Wits E-Hub Tech & AI Day and Tech Demo Showcase** (Entrepreneurship Week), with VCs, funders and ecosystem partners present | `FACT` (Sibusiso, 18 Oct) |
| 15 Oct 2026 | The apps' server discovery file moved to a presenter-PC tunnel: "Azure subscription disabled" | `FACT` that `Sibusiso-K` uploaded it (Releases API); `REPORTED` for the note; the reason isn't in the repo yet |
| 18 Oct 2026 | Sibusiso and Lethabo decide to keep building VUKA as a business | `FACT` (Sibusiso, 18 Oct) |

## 2 · The six things the E-Hub showcase taught us, and where each is answered

| # | Feedback (as Sibusiso recorded it) | Plan | Owner (proposed) |
|---|---|---|---|
| 1 | Turn VUKA into a **B2B enterprise model** selling to insurers and Nedbank; collaborate and **integrate VIGIL and VUKA into their systems** | [`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) | Sibusiso (partners, ANCHOR APIs), Lethabo (SDK, product) |
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
| **D9** | **A server of record the company owns:** a pay-as-you-go Azure subscription in PILOT CORE's name, in **South Africa North**, with keys backed up. Student subscriptions are non-commercial, are disabled when the credit runs out, carry no contractual SLA and here can't use South Africa North | Members are unprotected without it. It also removes the UAE cross-border transfer for primary data; s72 for other processors (push, email, hosting of the verify page) still needs counsel's view (`ASSUMPTION`) | `06-LAUNCH-ROADMAP.md` §0; `04-SLA.md` §4 |
| D1 | **One canonical economics model on `main`.** Three are in circulation (break-even 10,901 on `main`, 10,973 in the Caplia deck from an unmerged branch, and an older R50 model), and all pay five hackathon stipends for a two-founder company | An investor checks the deck against the model | `05-TWO-PITCHES.md` §5 |
| D2 | **Re-size the funding ask** (R1,884,583 today) from a two-founder cost base, launch costs and a realistic first-revenue date | The current ask runs out of cash in its own model (lowest −R114,328) | `05-TWO-PITCHES.md` §5 |
| D3 | **Lead buyer:** a bank first (Nedbank, with a risk signal into fraud operations, observe-only) or an insurer first (iTOO/Hollard, claim verification) | It decides the first integration we build | `01-B2B-ENTERPRISE.md` §5–§6 |
| D4 | **Done 18 Oct:** `main` turned green (#130) and the server merged onto `main` (#131). Left: deploy only from `main`, and add app tests and an Android build to CI. A trial merge of PR #99 conflicts only in four documents | No partner can review, and no launch can ship, code that isn't on `main` | `06-LAUNCH-ROADMAP.md` §3 |
| D5 | **One app.** VIGIL (React Native, `main`) and the native VUKA app (`feature/integrate`) both exist | Two apps halve the work on each | `06-LAUNCH-ROADMAP.md` §3 |
| D6 | **Fix the duress gaps at sign-in and sign-out.** A duress PIN at "Welcome back", or at sign-out while listening is paused, raises nothing; spec V6 says it must. This needs new PIN actions in the contract | A safety rule the product currently breaks | `06-LAUNCH-ROADMAP.md` §4 |
| D7 | **Listening model:** ADR-0046 (listening until paused) or **journey mode as the default** (recommended after the legal and comparable-product research) | Comfort, battery, RICA's party exception, and the honesty ledger | `03-DISTRESS-SIGNALS.md` §6 |
| D8 | **`docs/MASTER-CONTEXT.md` v4** for the business phase: new audiences, the two-founder team, today's figures. Owner Khutso, or the founders if Khutso has moved on | Every tool reads it first; it still describes a hackathon weekend | this file §4 |
| D10 | **Company housekeeping:** move accounts (Azure, Firebase, Brevo, Hedera, Cloudflare, the GitHub repository) to the company; a signed shareholders' agreement; counsel on assigning the seven contributors' IP to PILOT CORE and on keeping the code public under MIT; confirm B-BBEE status | Investors and bank procurement check all of these; the shareholders' agreement closes a Caplia gap | `06-LAUNCH-ROADMAP.md` §2; `05-TWO-PITCHES.md` §2 |
| D11 | **No hand-off to armed response without a new ADR.** Offering VIGIL as a trigger for an insurer's AURA or Secura dispatch contradicts accepted ADR-0036(1) (guardians only) and `RULES.md` (no autonomous dispatch). At most, a responder would be an opt-in contact the member chooses | It decides which insurer offers we can make | `01-B2B-ENTERPRISE.md` §5 |
| D12 | **The guardian alert's wording (spec G4):** keep "Call 10111" as the lead, and add a separate "support and advice lines (they do not send help)" block, after a GBV organisation reviews it and every number is test-dialled | Safety-critical copy; 10111's reported response times | `02-SAPS-AND-NGOS.md` §1 |

## 4 · What stays the same, and what changes

**Stays:** the thesis (*VIGIL notices, ANCHOR proves when*), "machines notice, people decide" (ADR-0034), no generative model in the product (ADR-0038), the honesty ledger, claim tags, the four review gates, and `sim_` / SIMULATED for anything simulated.

**Changes:**
- **The criteria.** The hackathon's I/T/U/S/B/Q weights no longer decide anything. In their place: what a partner's vendor-risk team asks ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md) §7), what an investor asks, and the published rubric of each award, once we have it ([`05-TWO-PITCHES.md`](05-TWO-PITCHES.md) §2).
- **The team.** Seven members became two founders. The work done by the other five stays credited in `team/` and in the build log; nothing is rewritten. `RULES.md` now says the team is two leads and the reviewers are Lethabo and Sibusiso only (#128, 18 Oct).
- **"Built" means deployable.** After the hackathon, a feature counts as built when it is on `main`, deployed, and measured, not when it works on a branch.

## 5 · The next 90 days at a glance (proposed)

| By | What | File |
|---|---|---|
| this week | Check the Azure subscription and credit; record what happened on 15 Oct; confirm key backups; decide D9 | 06 §0 |
| end Oct 2026 | Company-owned server live in South Africa North; D1, D2, D5 decided; SLA probe live; CPSI debrief and Wits introductions requested; website domain chosen | 06, 05, 04, 02, website brief |
| 1–30 Nov 2026 | Duress fixes (D6), real push and SMS fallback shipped (all four S1 items in 06 §2); GBV design reviews held before the 16 Days of Activism (25 Nov); pitches rehearsed; YouthX next-stage rubric requested | 06, 02, 05 |
| 21 Nov 2026 | YouthX winners announced (`REPORTED` date); company website live | 05, website brief |
| Dec 2026 | Partner safeguarding protocol and ethics clearance agreed; then the closed beta with consenting testers from that partner; target API 36 and the other Play blockers cleared; first bank or insurer meeting; written pilot proposal | 06, 02, 01 |
| Jan 2027 | Pilot agreement drafted with the SLA targets from `04-SLA.md`; penetration test booked; SAPS approached at station level (after the Madlanga report, 16 Nov) | 01, 04, 02 |

## 6 · How the research was done, and its limits

- **Read directly (`FACT`):**
  - the repository, its branches, PRs, CI runs and release assets, in a read-only audit on 18 Oct 2026;
  - Android's developer documentation;
  - Microsoft's SLA document (1 Oct 2026 edition);
  - the Microsoft, Hedera, GitHub and OpenSLO documentation repositories at named commits.
- **Seen only through search extracts (`REPORTED`):** most other web pages, including banks', regulators', SAPS and Parliament pages. The cloud session couldn't open them directly, so **each URL must be re-opened before it is quoted to a partner, judge or investor.**
- **Recalled, not checked:** a few items the session couldn't search (comparable products' signals, some research papers, FCM and SMS gateway SLAs). They are marked as recalled where used.
- **Checked again:** an adversarial review of the plan against these notes, the repository and the honesty ledger (18 Oct; four reviewers, about 100 findings). The fixes are in this PR.
- **Not done:** the competition criteria (YouthX, the Easies, Caplia) and South Africa North prices. The shared search budget ran out and the sites were unreachable; ask the organisers directly.
- **The full research notes**, with every URL, are in [`research/`](research/README.md).
