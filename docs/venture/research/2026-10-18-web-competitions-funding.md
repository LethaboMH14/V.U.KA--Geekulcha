# Evidence base for insight (5): two pitches, and the competitions and funding VUKA is in

**As of 18 Oct 2026. Read-only. No repo file was edited, committed or pushed.**
**Serves:** B (Business and Presentation), and I, T and S through what judges check. **"Would a real user trust and use this?"** Judges and investors ask this in their own words. Both pitches below answer it with measured evidence and named gaps, not adjectives.

---

## 0 · Read this first: the web research did not run

I could not do the web research in this session, so **none of the competition or funding facts below were checked on the web this session.**

- **WebSearch:** every call returned "this turn's web search budget is used up (limit: 200 WebSearch calls per turn, shared by every agent in it)". I made no successful search.
- **WebFetch:** direct fetches failed with `getaddrinfo ENOTFOUND` for `theeasies.com`, `www.theeasies.com`, `caplia.com`, `www.nedbank.co.za`, `www.tia.org.za`, `www.ycombinator.com` and `en.wikipedia.org`.
- **curl:** one plain fetch of `https://theeasies.com/` through the configured proxy returned `CONNECT tunnel failed, response 403`. The session's network policy denies these hosts.
- **To fix it:** raise the search limit (`CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`), or send a follow-up message after this turn. Then allow the hosts above under Network access in the cloud environment's settings (environment menu, then Edit, then Allowed domains; see https://code.claude.com/docs/en/cloud-environments#network-access) and re-run this research.

**What this report uses instead**, tagged strictly:
- `FACT`: the repo, and the two screenshots of the YouthX email that Sibusiso shared in this session (`<session-images>/1.png` and `<session-images>/2.png`).
- `REPORTED`: claims the repo already records from earlier web work.
- `ASSUMPTION`: my background knowledge (training data to about mid-2026), **not checked**. Each such row names where to verify it. **Those URLs are candidates I could not load and may be wrong.**
- No date, prize, criterion or ticket size is presented as verified unless it comes from the repo or the email.

---

## 1 · Nedbank YouthX Awards 2026

| Item | What is known | Tag · source |
|---|---|---|
| VUKA's status | "Congratulations! You've officially made the YouthX Awards top 50 … a place among 50 young entrepreneurs." | `FACT`: YouthX email to Sibusiso Khumalo, screenshots `images/1.png` and `2.png` (shared 18 Oct 2026); `docs/venture/README.md:16` |
| Next stage | "Keep an eye on your inbox for important updates and information about the next stage of the awards." The email gives **no date, format or criteria** for that stage. | `FACT`: same email |
| Eligibility | South Africans aged 18–26 | `REPORTED`: `docs/venture/05-TWO-PITCHES.md:23`, `docs/build-log/entries/2026-10-18-sibusiso-venture-plan-e-hub.md:18` (Hype Magazine coverage of the call for entries; **the URL is not recorded in the repo**) |
| Entries closed | 9 Oct 2026 | `REPORTED`: same |
| Finalists | Pitch to an independent panel | `REPORTED`: `05-TWO-PITCHES.md:23` |
| Winners announced | 21 Nov 2026 | `REPORTED`: same; `docs/venture/README.md:62` |
| Prizes | Cash; mentorship through Nedbank's enterprise development team; the top 3 attend the One Young World Summit | `REPORTED`: same. The amount, the number of winners and the 2026 summit's date and venue are **unverified** |
| Judging criteria | **Unknown.** Not in the email, the repo or any verified source | gap |
| Stages between top 50 and the awards night | **Unknown** | gap |
| What past finalists pitched | **Unknown** (no web access) | gap |

**Inference** (`ASSUMPTION`): a youth award run through a bank's enterprise-development team is likely to weight:
- whether the business is viable and youth-owned;
- jobs and community impact;
- whether the founder can grow with mentorship.

Prepare for questions on ownership, B-BBEE status and jobs (§6).
**Fastest check:** reply to the YouthX email and ask for the next-stage format, time limit and scoring rubric.
**Verify at** (candidate, not loaded): `https://www.nedbank.co.za` (search "YouthX").

## 2 · Investec's The Easies and Caplia

| Item | What is known | Tag · source |
|---|---|---|
| Entry | Sibusiso entered Investec's The Easies; the Caplia deck was prepared for it | `FACT` (founder's record): `docs/venture/README.md:15`, `docs/SIBUSISO-HANDOVER.md:481` |
| Caplia readiness score | 327/700 on 5 Oct 2026, taken before the deck changes | `FACT` (founders' record): `docs/SIBUSISO-HANDOVER.md:474`. The repo has no screenshot, and the business audit tags the same number `REPORTED` (`scratchpad/research/repo-business.md:316`) |
| As a percentage | 46.7% of the maximum | `ESTIMATE` (327 ÷ 700) |
| Gaps Caplia flagged | Full-time status, equity split, 2+ years of domain experience, real interviews, LOIs | `FACT` (founders' record): `docs/SIBUSISO-HANDOVER.md:474` |
| What The Easies is; 2026 categories, eligibility, criteria, prizes | **Unknown**. Not verified this session | gap |
| Timeline, and the reported extension | **Unknown**. The extension is unverified | gap |
| How Caplia scores (dimensions, weights, the 700 scale) and its formal link to The Easies | **Unknown** beyond the gap list above | gap |

**What the gap list implies** (`ESTIMATE`, inferred from the five gaps, not from Caplia's own documentation): Caplia scores standard readiness areas:
- team commitment (full-time);
- the cap table (equity split);
- founder–market fit (domain experience);
- customer validation (interviews, LOIs).

**Two of these can be fixed with paperwork now:**
- **Equity split.** The founders' own record already says PILOT CORE (Pty) Ltd is held 50/50 by Sibusiso and Lethabo (`scripts/build_financial_model.py:61`, `FACT` (founders' record, not checked against CIPC)). The gap is probably a missing signed shareholders' agreement, not a missing decision.
- **Interviews and LOIs.** Dated discovery interviews and non-binding letters of intent can be gathered in weeks, not months.

**Fastest check:** Sibusiso's entry confirmation email and the Caplia dashboard or help pages.
**Verify at** (candidate, not loaded): `https://theeasies.com`, `https://caplia.com`.

## 3 · Wits E-Hub Tech & AI Day (15 Oct 2026) and Wits follow-on routes

- `FACT` (founder's record, `docs/venture/README.md:17`): VUKA was demonstrated at the Wits E-Hub Tech & AI Day and Tech Demo Showcase during Entrepreneurship Week, with VCs, funders and ecosystem partners present. The six insights in the task come from there.
- `ASSUMPTION`, unverified: Wits' wider ecosystem includes:
  - the **Tshimologong Precinct** in Braamfontein, Wits' digital-innovation precinct, which runs incubation and acceleration programmes for tech start-ups;
  - **Wits Enterprise**, the university's commercialisation and technology-transfer arm (the name and structure may have changed);
  - the student-entrepreneurship programmes run under the E-Hub itself.

  University technology-transfer offices have also been a channel for the TIA Seed Fund (§4).
- **IP caution** (`ASSUMPTION`): VUKA was built at the Geekulcha hackathon. The repo says the team came from "four universities" (`docs/MASTER-CONTEXT.md:5`); it does not say which. Before using any university programme, check whether its IP policy could claim anything that was built with university resources.
- **Fastest check:** ask the E-Hub organisers for:
  - the list of follow-on programmes;
  - introductions to the VCs and funders who attended;
  - whether either founder is eligible as a Wits student.

  **Verify at** (candidate): `https://www.wits.ac.za`, `https://tshimologong.joburg`.

## 4 · South African early-stage funding routes

**Every row below is `ASSUMPTION`, from background knowledge and unverified.** Amounts are left out wherever I am not confident of them. The repo's own funding figures are unsourced: the canvas branch's "TIA up to R1.2M + angel R800k" (`scratchpad/research/repo-business.md:314`).

| Route | What it is (unverified) | Fit for a two-founder, pre-revenue safety-tech company | Verify at (candidate) |
|---|---|---|---|
| **TIA Seed Fund** (Technology Innovation Agency) | Non-dilutive funding for proof of concept and prototypes, historically routed through university technology-transfer offices and partner institutions | **High**, if a partner institution will sponsor it. Amount unverified; do not quote the canvas R1.2m | tia.org.za |
| **SEFA → Small Enterprise Development and Finance Agency (SEDFA)** | Merger of SEFA, SEDA and the Co-operative Banks Development Agency under the National Small Enterprise Amendment Act (2024). Mostly loans and credit, plus business support | **Low** for pre-revenue tech (debt); **medium** for SEDA-style non-financial support | search "SEDFA" |
| **NYDA Grant Programme** | Grants and business support for youth-owned businesses. NYDA defines youth as 18–35, not YouthX's 18–26 | **Medium**: small grants, but non-dilutive and fast | nyda.gov.za |
| **Knife Capital / Grindstone** | Cape Town VC firm; Grindstone was its accelerator for tech businesses already earning revenue | **Low now**; revisit after the first pilot revenue. Check whether Grindstone still runs | knifecap.com |
| **Founders Factory Africa** | Johannesburg venture builder and accelerator backed by corporates including Standard Bank. Sector programmes, fintech among them | **Medium** through the fintech and coerced-transfer angle, once there is a pilot or LOI | foundersfactory.africa |
| **Startupbootcamp AfriTech** | Cape Town accelerator; **current status uncertain**, possibly inactive | **Unknown**; check whether it still runs | — |
| **Google for Startups Accelerator: Africa** | Equity-free cohort programme for start-ups that already have traction; recent cohorts emphasise AI | **Later**: after the closed beta and measured usage | startup.google.com |
| **Visa / Mastercard fintech programmes** (e.g. Visa's Africa fintech accelerator, Mastercard Start Path) | For fintechs with a product in market | **Later**, through the bank-integration angle | visa.co.za / mastercard.com |
| **Standard Bank / ABSA / Nedbank** enterprise and supplier development | Banks fund and mentor black-owned SMEs, partly for B-BBEE enterprise- and supplier-development points (Financial Sector Code) | **High** for Nedbank, given the YouthX relationship. **Needs PILOTCORE's B-BBEE status confirmed** (§6) | each bank's ED/ESD page |
| **ABAN** (African Business Angel Network) | A federation of angel networks; it introduces founders to angel groups but does not invest itself | **Medium**, as a route to angels once an LOI exists | abanangels.org |
| Also worth checking | SAB Foundation Social Innovation Awards (social impact, a GBV fit); The Innovation Hub's Gauteng Accelerator Programme (GAP) Innovation Competition; MTN Business App of the Year; Allan Gray Orbis Foundation; LaunchLab; Savant (deep-tech pre-seed); SA SME Fund | Social-impact awards fit the judges' pitch | each organiser's site |

**Typical pre-seed tickets in South Africa, 2025–2026** (`ASSUMPTION`, unverified):
- angel or pre-seed rounds roughly in the low hundreds of thousands to a few million rand;
- grants and competition prizes usually smaller.

**Do not quote any range in a pitch** until it is checked against a published source such as the SAVCA Venture Capital Industry Survey (savca.co.za).
VUKA's current ask is R1,884,583 (`ESTIMATE`, `docs/venture/05-TWO-PITCHES.md:83`). It is being re-sized under D2 because 95.5% of it is five stipends for a two-founder company.

## 5 · What investors assess and what award judges assess

**Published rubric in hand: Geekulcha** (`FACT`, `docs/MASTER-CONTEXT.md:44-51`):

| Criterion | Weight |
|---|---:|
| I · Innovation and Creativity | 15 |
| T · Technical Implementation | 15 |
| U · Usability and Design | 10 |
| S · Security and Ethics | 10 |
| B · Business and Presentation ("as a judge, are you buying?") | 15 |
| Q · Bonus: Quantum Tech | 5 |

**YouthX and Easies rubrics:** not found (§1, §2).

**What the E-Hub panel told the founders** (`FACT`, founder's record): investors care how VUKA makes them money; judges care about technical and business feasibility, scalability and community impact.

| Dimension | Investor's question | Judge's question | VUKA's evidence today (tag · source) | Gap to close |
|---|---|---|---|---|
| Problem and market | How big, who pays, why now? | Is the problem real and local? | 17,061 kidnappings in 2023/24; R2.4bn digital banking crime in 2025 (`FACT`, `docs/EVIDENCE.md`, `05-TWO-PITCHES.md:33`) | No numeric TAM/SAM/SOM (`repo-business.md:286`). Build it bottom-up and tag it `ESTIMATE` |
| Business model and unit economics | Price, margin, break-even | Is the business feasible? | R20 per member per month (`ASSUMPTION`); R14.28 contribution and 71% margin (`ESTIMATE`); anchoring capped at about R569 a month (`ESTIMATE`) | Three models in circulation. **D1:** merge one to `main` |
| Traction | Revenue, users, LOIs | Has it been tested? | YouthX top 50 (`FACT`, email); E-Hub demo (`FACT`); live API demo check 14/14 on Azure (`FACT`, `docs/SIBUSISO-HANDOVER.md:467`) | No LOI, interview log or partner (`FACT`, `repo-business.md:138`) |
| Technology | Defensibility; technical risk | Does it work? Is it innovative? Can it scale? | Duress PIN, on-device classifier, signed per-member chain anchored on Hedera testnet (`FACT`); screams open a check-in on 6.5% of FSD50K clips, n = 108 (`FACT`, `docs/eval/cem1-measurements.md`) | Mainnet, penetration test (G8), measured SLA, field false-check rate |
| Team | Full time? Equity? Domain experience? | Can this team deliver? | Two founders, 50/50 (`FACT`, founders' record) | Full-time date, a signed shareholders' agreement, domain advisors |
| Impact | Mostly a risk filter (ESG) | **Central:** community impact, who benefits | Free to the person at risk (`PROPOSED` model); designed for express kidnapping and GBV (`PROPOSED`) | Impact metrics defined but not yet measured; NGO and SAPS routes are `PROPOSED` (`02-SAPS-AND-NGOS.md`) |
| Lawfulness and comfort | Regulatory risk | Ethics; would people install it? | 3-second buffer on the phone, classified and discarded; nothing recorded or uploaded; the RICA position is "our reading", with counsel confirming (`05-TWO-PITCHES.md:101`) | POPIA Information Officer registration pending; counsel opinion |
| The ask and exit | Amount, terms, milestones, return | Not asked | R1,884,583 (`ESTIMATE`); it runs out of cash in its own model (lowest −R114,328) | **D2:** re-size from the two-founder cost base |

## 6 · How to structure each pitch

**Recognised investor-deck outlines** (`ASSUMPTION`: background knowledge, sources not loaded this session):
- **Sequoia**, "Writing a Business Plan" (sequoiacap.com): company purpose → problem → solution → why now → market potential → competition → business model → team → financials → vision.
- **Y Combinator** seed-deck guidance (ycombinator.com/library, Aaron Harris and Kevin Hale): what you do in one line → problem → solution → traction → unique insight → business model → market → competition → team → the ask. Slides should be legible, simple and obvious.
- **Guy Kawasaki's 10/20/30 rule:** 10 slides, 20 minutes, 30-point font.

**South African expectations** (`ASSUMPTION`, verify before use):
- **B-BBEE status.** Under the amended Codes, an Exempted Micro Enterprise (turnover below R10m) can prove its status with a sworn affidavit:
  - Level 1 if 100% black-owned;
  - Level 2 if at least 51% black-owned;
  - otherwise Level 4.

  Banks and insurers buy under the Financial Sector Code, so a supplier's level matters to them, and it also opens enterprise- and supplier-development funding. **The repo does not record PILOTCORE's B-BBEE status. The founders must confirm it themselves; do not infer it.**
- **POPIA posture.** Information Officer registration is recorded as pending (`repo-business.md:295`).
- **Impact metrics a judge can check.** People enrolled, guardians per member, time from alert to acknowledgement, field false-check rate, NGO partners, and jobs created. All are `PROPOSED` until measured.

## 7 · Requirement profile of each audience

| | Investors (angels, VCs, Caplia-style readiness) | Award judges (YouthX, Easies, showcases) |
|---|---|---|
| Decide | Whether to invest, and on what terms | Rank VUKA against other ventures |
| Must-haves | One canonical model; a re-sized ask with use of funds and milestones; evidence of who pays (interviews, LOIs); full-time founders and a signed equity split; defensibility; the risks named | A working demo; technical feasibility; a scalability argument; a measurable community-impact plan; innovation; lawful and comfortable to use; a youth founder story |
| Red flags (from this repo) | Three models; five stipends for two founders; the ask runs out in its own model; no LOI | Unqualified claims ("proof of duress", "always on", "court-admissible", an accuracy without method and n); simulated parts not named |
| Evidence they will check | Script output on `main`; the Caplia gap list | The live demo with "SIMULATED" said aloud; the verify page (testnet); the public detection measurements |

## 8 · Calendar, Oct 2026 – early 2027

| Date | Event | Tag |
|---|---|---|
| 9 Oct 2026 (past) | YouthX entries closed | `REPORTED` |
| 15 Oct 2026 (past) | Wits E-Hub Tech & AI Day / Tech Demo Showcase | `FACT` (founder) |
| by end Oct 2026 | D1 (one model) and D2 (re-sized ask) decided, so the numbers are settled before any pitch | `PROPOSED`: `docs/venture/README.md:60` |
| Oct–Nov 2026, date unknown | YouthX "next stage" information, by email | `FACT` that it was promised; timing unknown |
| The Easies deadline / extension | **Unknown**. Sibusiso to confirm from his entry confirmation | gap |
| mid Nov 2026 | Both pitches rehearsed, timed and recorded | `PROPOSED`: `05-TWO-PITCHES.md:110` |
| about the third week of Nov 2026 | Global Entrepreneurship Week: likely events at Wits, Tshimologong and elsewhere | `ASSUMPTION` |
| Nov 2026 | Africa Tech Festival, Cape Town (start-up pitch tracks) | `ASSUMPTION`; dates unverified |
| 21 Nov 2026 | YouthX winners announced; PILOTCORE website live | `REPORTED` (date) / `PROPOSED` (website) |
| Dec 2026 | Closed beta; first bank or insurer meeting; written pilot proposal | `PROPOSED`: `docs/venture/README.md:63` |
| Q1 2027 | Application windows for SAB Foundation Social Innovation Awards and the GAP Innovation Competition usually open around this time | `ASSUMPTION`; check each organiser |
| Q1–Q2 2027 | TIA seed calls through a partner institution; NYDA grants (rolling) | `ASSUMPTION` |
| mid 2027 | Google for Startups Accelerator: Africa applications usually open | `ASSUMPTION` |

## 9 · What each pitch should emphasise

**Investor pitch** (about 10–12 slides in YC/Sequoia order, 3 minutes plus Q&A). Sibusiso leads (`PROPOSED`, `05-TWO-PITCHES.md:108`).
1. **One line:** VUKA notices duress on the phone without a button and keeps an independently checkable record of when it happened. Banks and insurers pay; the person at risk does not.
2. **Problem and why now:** coerced transfers, using only the `FACT` figures already in `docs/EVIDENCE.md`.
3. **Who pays:** the B2B offer to insurers and banks, anchored on existing products priced at R19.90 to R22.50 a month (`FACT`: FNB GuardMe, press 2022; iTOO from R22.50). Present R20 as the hypothesis the pilot tests.
4. **Unit economics from the single merged model** (D1): contribution per member, break-even for **two** founders (4,670 at R20, `ESTIMATE`, until the script on `main` prints the real figure), and the anchoring cost ceiling.
5. **Traction, honestly:** YouthX top 50, the E-Hub demo, the 14/14 live check, and then **the Caplia gaps closed** (shareholders' agreement, full-time date, an interview log, LOIs). The LOI slide matters most.
6. **Defensibility,** framed as `PROPOSED`. Name the competition inside the banks (Discovery Bank's Panic Code, FNB GuardMe).
7. **The re-sized ask (D2):** use of funds (two founders, penetration test, SA hosting, counsel, integration, contingency) and the milestone it buys (a signed pilot).
8. **The risks named:** screams at 6.5% (n = 108), testnet, no penetration test yet, no SLA measured yet.

**Judges' pitch** (2 minutes or the format's limit; live demo if allowed). Lethabo leads (`PROPOSED`).
1. **The person:** "imagine" framing, never "this happened to".
2. **Innovation:** a duress PIN that looks identical to the normal one, plus a record anchored on a public ledger.
3. **Feasibility:** the live demo with "SIMULATED bank" said aloud, and the 14/14 end-to-end check on Azure (27 Sep).
4. **Scalability:** a signed chain per member, and public anchoring capped at about R569 a month (`ESTIMATE`).
5. **Community impact:** free to the person at risk; GBV and express-kidnapping use cases; NGO, campus and SAPS routes (`PROPOSED`); the impact metrics to be measured.
6. **Lawful and comfortable:** on-device, nothing recorded or uploaded, counsel confirming.
7. **Honest limits and the next 90 days.**

**Both pitches:** never claim "proof of duress", "invisible", unqualified "always on", "court-admissible", "prevents crime", an accuracy without method and n, or any partnership that is not signed. Do not use Nedbank, YouthX or Investec logos without written permission (`docs/venture/PILOTCORE-WEBSITE-BRIEF.md:19`).


## KEY FACTS
- [FACT] Web research was not possible this session: every WebSearch call returned 'web search budget is used up (limit: 200 WebSearch calls per turn, shared by every agent)'. WebFetch failed with ENOTFOUND for theeasies.com, caplia.com, nedbank.co.za, tia.org.za, ycombinator.com and en.wikipedia.org, and a curl to theeasies.com got CONNECT 403 from the proxy. — this session's tool results (2026-10-18)
- [FACT] VUKA (Sibusiso Khumalo) 'officially made the YouthX Awards top 50'; information about the next stage will come by email. The email states no date, format or criteria. — YouthX email screenshots <session-images>/1.png and 2.png; docs/venture/README.md:16 (2026-10-18)
- [REPORTED] YouthX 2026: open to South Africans aged 18–26; entries closed 9 Oct 2026; winners announced 21 Nov 2026; prizes include cash, mentorship through Nedbank enterprise development and, for the top 3, the One Young World Summit. The source URL (Hype Magazine) is not recorded in the repo. — docs/venture/05-TWO-PITCHES.md:23; docs/build-log/entries/2026-10-18-sibusiso-venture-plan-e-hub.md:18 (2026-10-18)
- [FACT] YouthX judging criteria and the stages after the top 50 are unknown: they are not in the email, the repo or any verified source. — email screenshots; grep of repo docs/ (2026-10-18)
- [FACT] Caplia investor-readiness score was 327/700 on 5 Oct 2026, before the deck changes. — docs/SIBUSISO-HANDOVER.md:474 (founders' record; tagged REPORTED in the scratchpad business audit repo-business.md:316) (2026-10-05)
- [ESTIMATE] 327/700 is 46.7% of Caplia's maximum. — arithmetic on docs/SIBUSISO-HANDOVER.md:474 (2026-10-18)
- [FACT] The gaps Caplia flagged are full-time status, equity split, 2+ years of domain experience, real interviews, and LOIs. — docs/SIBUSISO-HANDOVER.md:474 (2026-10-07)
- [FACT] PILOT CORE (Pty) Ltd, Reg. 2026/122060/07, is held 50/50 by Sibusiso Khumalo and Lethabo Hoaeane (founders' record, not checked against CIPC). This suggests the Caplia 'equity split' gap is a documentation gap. — scripts/build_financial_model.py:61 (2026-10-07)
- [FACT] Sibusiso entered Investec's The Easies; the Caplia deck was prepared for it. The Easies' categories, criteria, timeline, extension and prizes are unverified. — docs/venture/README.md:15; docs/SIBUSISO-HANDOVER.md:481 (2026-10-18)
- [FACT] VUKA was demonstrated at the Wits E-Hub Tech & AI Day and Tech Demo Showcase on 15 Oct 2026, with VCs, funders and ecosystem partners present. — docs/venture/README.md:17 (founder's record) (2026-10-15)
- [FACT] Geekulcha's published rubric: Innovation 15, Technical Implementation 15, Usability 10, Security and Ethics 10, Business and Presentation 15, Quantum bonus 5. — docs/MASTER-CONTEXT.md:44-51 (2026-09-23)
- [ESTIMATE] The current funding ask is R1,884,583; 95.5% of it is five R30,000 stipends for 12 months, and in its own cash model cash falls to −R114,328 (May 2028). — docs/venture/05-TWO-PITCHES.md:83; scratchpad research repo-business.md:306-308 (2026-10-18)
- [ESTIMATE] With two founder stipends of R30,000, break-even is 4,670 members at R20. — docs/venture/05-TWO-PITCHES.md:81 (2026-10-18)
- [ASSUMPTION] The canvas branch's funding figures, 'TIA up to R1.2M + angel R800k', are unsourced. — origin/docs/babatunde-canvas-and-deck:docs/BUSINESS-CANVAS.md Blocks 8-10, via scratchpad repo-business.md:314 (2025-09-25)
- [FACT] The live API demo check passed 14/14 on Azure. — docs/SIBUSISO-HANDOVER.md:467 (2026-09-27)
- [FACT] Screams open a check-in on 6.5% of FSD50K clips (n = 108); glass 46.0% (n = 139); gunshot 54.6% (n = 108). — docs/eval/cem1-measurements.md; docs/build-log/entries/2026-10-18-sibusiso-venture-plan-e-hub.md:17 (2026-09-26)
- [FACT] No LOI, interview record or partner commitment exists in the repo. — scratchpad research repo-business.md:138; docs/venture/01-B2B-ENTERPRISE.md:4 (2026-10-18)
- [ASSUMPTION] The TIA Seed Fund provides non-dilutive proof-of-concept funding, historically channelled through university technology-transfer offices and partner institutions; amount unverified. — background knowledge; verify at tia.org.za (not loaded) (2026-10-18)
- [ASSUMPTION] SEFA, SEDA and the Co-operative Banks Development Agency were merged into the Small Enterprise Development and Finance Agency (SEDFA) under the National Small Enterprise Amendment Act (2024). — background knowledge; not verified this session (2026-10-18)
- [ASSUMPTION] NYDA defines youth as 18–35 and offers grants and business support to youth-owned businesses. — background knowledge; verify at nyda.gov.za (not loaded) (2026-10-18)
- [ASSUMPTION] An EME (turnover below R10m) proves B-BBEE status by sworn affidavit: Level 1 if 100% black-owned, Level 2 if at least 51%, otherwise Level 4. Banks buy under the Financial Sector Code. PILOTCORE's status is not recorded in the repo. — background knowledge (Amended Codes of Good Practice); verify at bbbeecommission.co.za (not loaded) (2026-10-18)
- [ASSUMPTION] Standard investor-deck outlines are Sequoia (purpose, problem, solution, why now, market, competition, business model, team, financials, vision) and YC (one-liner, problem, solution, traction, insight, business model, market, competition, team, ask). — background knowledge; sequoiacap.com/article/writing-a-business-plan and ycombinator.com/library (not loaded) (2026-10-18)
- [ASSUMPTION] Typical South African pre-seed and angel tickets in 2025–26 run from the low hundreds of thousands to a few million rand. Do not quote this until it is checked against the SAVCA VC survey. — background knowledge; verify at savca.co.za (not loaded) (2026-10-18)

## CONFLICTS/GAPS
- Nothing about the competitions or funding was checked on the web this session: the shared WebSearch budget was exhausted and the network policy denied every host I tried. Every external claim is REPORTED (from the repo) or ASSUMPTION.
- The repo's YouthX facts (ages 18–26, 9 Oct close, 21 Nov winners, prizes, One Young World for the top 3, an independent finalist panel) cite 'Hype Magazine coverage', but no URL is recorded anywhere in the repo, and the top-50 email confirms none of them.
- YouthX judging criteria, the format of the next stage (pitch length, live or online, demo allowed) and the stages between the top 50 and 21 Nov are unknown. 05-TWO-PITCHES.md §2 says 'research pending'.
- The Easies is unresearched: what it is, its 2026 categories, eligibility, criteria, timeline and the reported extension, prizes, and its formal link to Caplia.
- How Caplia's 700-point score is built (dimensions and weights) is unknown. The five-gap list is the only evidence of what it measures.
- Tagging is inconsistent: docs/venture/README.md:14 tags the Caplia 327/700 score FACT (founders' record), while the scratchpad business audit tags it REPORTED. The repo holds no screenshot.
- The Caplia 'equity split' gap conflicts with scripts/build_financial_model.py:61, which records the founders 50/50. The likely gap is a missing signed shareholders' agreement, not a missing split.
- The canvas branch's 'TIA up to R1.2M + angel R800k' is unsourced and must not reach a deck.
- Two youth definitions apply: YouthX 18–26 (REPORTED) and NYDA 18–35 (ASSUMPTION). Eligibility for each route needs checking per founder.
- PILOTCORE's B-BBEE status is not recorded. It matters for selling to banks and insurers (Financial Sector Code) and for their enterprise- and supplier-development funding, and only the founders can state it.
- The Wits follow-on programmes (Tshimologong, Wits Enterprise, the E-Hub's own programmes) and any IP-policy implications are unverified, and the repo does not say which universities the founders attend.
- The calendar of external deadlines for Nov 2026 to early 2027 (GEW, Africa Tech Festival, SAB Foundation, GAP, Google for Startups) is ASSUMPTION only. No date is verified.

## RECS
- Re-run this research with web access: raise CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION or send a follow-up message, and allow theeasies.com, caplia.com, nedbank.co.za, tia.org.za, nyda.gov.za, wits.ac.za, tshimologong.joburg, savca.co.za and the accelerator sites under the environment's Network access (cloud environment settings, then Edit, then Allowed domains). Record each verified fact with its URL and date in docs/EVIDENCE.md.
- Ask the organisers directly; it is faster and authoritative. Reply to the YouthX email asking for the next-stage format, time limit and scoring rubric. Pull The Easies deadline and extension from Sibusiso's entry confirmation and the Caplia dashboard. Ask the Wits E-Hub organisers for the follow-on programme list and introductions to the VCs and funders who attended.
- Close the Caplia gaps before re-scoring. Record a signed 50/50 shareholders' agreement. Set a full-time date for each founder. Log at least 10 dated discovery interviews (insurer claims/fraud staff, bank fraud teams, GBV NGOs, campus security, potential members) without personal data. Seek 1–3 non-binding LOIs (an NGO, a campus, an insurer innovation team). Name domain advisors to offset the 2+ years of experience gap. Then re-score on Caplia and record the date and the new score.
- Settle D1 (one canonical model on main) and D2 (re-sized ask from the two-founder cost base, launch costs and a contingency line) before giving either pitch again. Quote only what the merged script prints.
- Investor pitch: use the YC/Sequoia order, 10–12 slides, and end on the ask and the milestone it buys (a signed pilot). Put the LOI and interview evidence and the corrected unit economics up front, and name the risks: screams at 6.5% (n = 108), testnet, no penetration test, no measured SLA.
- Judges' pitch: lead with the person and community impact. Run the live demo with 'SIMULATED' said aloud and cite the 14/14 Azure check as feasibility evidence. Use the capped anchoring cost for scalability, add an impact-metrics slide (PROPOSED until measured), state the lawful, on-device design, and close with honest limits and the 90-day plan.
- Add the South African layer to both decks: B-BBEE status as an EME by affidavit (the founders state it; do not infer it), the POPIA position (Information Officer registration pending), and jobs and impact measures that YouthX and the social-impact awards are likely to weigh (ASSUMPTION).
- Proposed funding sequence: non-dilutive first (a YouthX prize if won, NYDA, TIA seed through a partner institution, SAB Foundation, GAP); then bank enterprise-development routes (Nedbank through the YouthX relationship); then angel pre-seed (through ABAN-member networks) once an LOI exists; then accelerators (Founders Factory Africa, Google for Startups: Africa) after pilot traction. Verify every eligibility rule and amount first.
- Do not put any YouthX, Nedbank or Investec logos, unverified prize amounts or unverified deadlines into the decks or on the PILOTCORE website until they are verified with a URL.