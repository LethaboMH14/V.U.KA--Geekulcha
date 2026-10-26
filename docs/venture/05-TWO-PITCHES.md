# 5 · Two pitches: investors and judges

> **E-Hub insight 5 (15 Oct 2026):** *"We need to have two pitches: for potential investors (they care about how this makes them money) and for judges (they care about tech/business feasibility, scalability, community impact)."*
> **Status:** `PROPOSED` scripts. Base wording: Lethabo's war-room revision 2 (`docs/WAR-ROOM-PITCH.md` on branch `lethabo/war-room-mentor-refinements`), which already removed lines the build couldn't back. **Every figure below is either sourced or tagged; the numbers in §5 must be settled (D1, D2) before either pitch is given again.** Serves B, I, T.

---

## 1 · One story, two audiences

Both pitches tell the same true story. What changes is the last third: **where the money comes from** for investors, **why it works and who it helps** for judges.

| | Investors | Judges (YouthX, Easies, showcases) |
|---|---|---|
| They decide | Whether to put money in, and on what terms | Whether VUKA wins against other ventures |
| They test | Market, who pays, unit economics, the ask, team, defensibility | Feasibility (does it work?), scalability, community impact, innovation |
| Length | 3 minutes + Q&A; deck of about 10 slides | 2 minutes (or the format's limit) + Q&A; live demo if allowed |
| End on | The ask and the first pilot | The person it protects and what we need next |

**Rules for both:**
- Say "imagine", never "this happened to".
- Name what is SIMULATED, and call testnet "testnet".
- Say what the record **can't** show: it proves *when* a signal existed, not *what* happened.
- Never claim "proof of duress", "invisible", unqualified "always on", "court-admissible", "prevents crime", an accuracy without method and n, or a partnership that isn't signed.
- Never present something on a branch, or off the air, as working today.
- "Not measured" is a complete answer.

**Before either pitch is given:** D1, D2 and D9 are settled, and a fresh end-to-end run on the company server is recorded. Until then, show the dated September recording and say so aloud.

## 2 · What each audience will be checking

**The research on competition criteria could not run** (18 Oct 2026). The shared web-search budget ran out and the cloud session couldn't reach the organisers' sites. So the criteria below are what is known, and the fastest route to the rest is to **ask the organisers directly**.

- **Nedbank YouthX Awards 2026.**
  - **The email** (`FACT`, Sibusiso's YouthX email) says VUKA "officially made the YouthX Awards top 50" and that next-stage details will follow by email. It gives no date, format or criteria.
  - **The call for entries** (`REPORTED`, Hype Magazine, https://hypemagazine.co.za/?p=119155) gives ages 18–26, entries closing 9 Oct 2026, and **winners on 21 Nov 2026**. It lists mentorship through Nedbank's enterprise development team; earlier coverage put the 2025 prize at up to R200,000.
  - **Judging criteria and the stages between now and 21 Nov are unknown.** *Action: reply to the YouthX email and ask for the next stage's format, time limit and scoring rubric.* A youth award run through a bank's enterprise development is likely to weigh viability, youth ownership, jobs and community impact (`ASSUMPTION`).
- **Investec's The Easies and Caplia.**
  - **Unresearched:** what the Easies is, its 2026 criteria, its deadlines (including the extension), and how Caplia builds its 700-point score.
  - **Known gaps:** the readiness score was 327/700 on 5 Oct, and the handover lists five gaps: full-time status, equity split, two-plus years of domain experience, real interviews, and letters of intent (`docs/SIBUSISO-HANDOVER.md`).
  - **Two of the gaps are paperwork:**
    - The founders' record already says PILOT CORE is held **50/50** (`scripts/build_financial_model.py`), so the "equity split" gap is probably a missing **signed shareholders' agreement**.
    - **Dated interviews and non-binding letters of intent** can be gathered in weeks: insurer claims and fraud staff, bank fraud teams, GBV organisations, campus security, potential members.
  - **The other gaps:** set a full-time date for each founder, and name domain advisors for the experience gap. Then re-score on Caplia and record the date and the score.
- **Investors at E-Hub-style events.** The questions in §6.
- **South African expectations** (`ASSUMPTION`, verify before use):
  - **B-BBEE:** banks and insurers buy under the Financial Sector Code, so a supplier's B-BBEE level matters to them and opens their enterprise and supplier development funding. A micro enterprise can usually prove its level by sworn affidavit. **The repo doesn't record PILOTCORE's status; only the founders can state it.**
  - **Jobs and impact metrics:** youth and social-impact judges look for them.

## 3 · The investor pitch (3 minutes; trim to fit)

> *Spoken. About 520 words, about 3.5 minutes at 150 words a minute, so trim [Why now] or [Plan] to fit a 3-minute slot. [Brackets] are slides or actions. Spoken figures: 17,061 and R2.4bn are `FACT` (`docs/EVIDENCE.md`); R14.28, 71% and R570 are `ESTIMATE` (`scripts/economics_vigil_anchor.py`); R20 is an `ASSUMPTION`.*

**[Problem]** Imagine Thandi. Friday evening, a mall car park in Pretoria. Two men get into her car, hold her phone to her face, and she types the amount they tell her. On Monday her bank shows her phone, her face, her PIN: she authorised it. Her insurer asks for proof she was forced. She has none.

That is a coerced transfer. South Africa recorded **17,061 kidnappings in 2023/24**, up 264% since 2014/15, 44% of them during a hijacking. Digital banking crime cost **R2.4 billion in 2025**.

**[Who loses money]** The bank and the insurer can't tell Thandi from someone who made the story up. So they pay a fraudster, or they fight a real victim, and both cost them. In one case before the ombud, a bank's fraud system *did* flag the payments and called the customer, who confirmed them, because they were being held. *[`REPORTED`, Business Report, 18 Mar 2025: re-open the article before using this line.]*

**[Why now]** Banks have started building this themselves: Discovery Bank's panic code works inside its own app. But it must be typed, and it works in one bank. VUKA is designed to work with any bank that accepts its signal, to notice when you can't answer, and to leave a record a stranger can check.

**[Product]** VUKA is two things. **VIGIL**, on her phone, listens while she has it switched on, for breaking glass or a scream, though screams are mostly missed today. Then it asks a quiet check-in. She answers with her normal PIN, or with her duress PIN, which is designed to look exactly the same; then her guardians are alerted. **ANCHOR** keeps a signed record of every step, fingerprinted on Hedera's public testnet (mainnet comes before a paid pilot), so a bank or insurer can check *when* it happened without trusting us. VUKA can't prove she was forced; it proves when her signal existed and that it hasn't changed since. It ran end to end on Android in September. We're moving the server to a company-owned account in South Africa, and the bank side is simulated.

**[Business model]** There's no charge to the member; the partner pays **about twenty rand per member per month**. For scale: FNB has sold an in-app panic button at R19.90 a month, paid by its customers (2022 price, being re-checked). The pilot tests whether a partner will pay instead. Each member contributes **R14.28 a month after variable costs, a 71% margin**. Anchoring the whole network costs **at most about R570 a month, however many members we have**. That's why it scales.

**[Plan]** One partner: ninety days observe-only with a few hundred volunteers, then up to five thousand members over a year, measured on false alarms, alert times and claims touched. Then three partners and fifty thousand members. Break-even is **[the number from the canonical model, D1]** members.

**[Traction, honestly]** Built at Geekulcha in September; top 50 of the Nedbank YouthX Awards; demonstrated at the Wits E-Hub. No partner has signed yet; that's what this round is for.

**[Ask]** We're raising **[the re-sized ask, D2]** to get two full-time founders to a signed pilot: the penetration test, production hosting in South Africa, and the integration work. And if you know the person at a bank or insurer who owns coerced-transfer losses, that introduction is worth as much as the cheque.

## 4 · The judges' pitch (2 minutes)

> *Spoken. About 260 words, leaving time for the demo.*

**[Who it's for]** Imagine Thandi again: a woman in a car with two men, her phone in their hands. Every safety app asks her to press a button. She can't.

**[What VUKA does]** While she has it switched on, VUKA listens on her phone for signs of distress, like breaking glass or a scream. It never raises an alarm on a sound alone; it asks her a quiet check-in. If she's fine, her normal PIN. If she's being watched, her duress PIN: **the screen is designed to look exactly the same**, and the people she chose are told "Don't call or text them. Call 10111." If she can't answer, they're told too.

**[Demo]** *[Only once D9 is done and a fresh end-to-end run is recorded; otherwise play the dated September recording and say so. Glass sound → check-in → duress PIN → the guardian's phone lights up → the record verifies on the public page. Say "simulated bank" and "testnet" aloud.]*

**[Feasible]** In September it ran end to end on Android phones against our cloud server, and an automated check of the whole server path passed fourteen of fourteen steps on a rerun. The only AI is a small sound classifier on the phone. No audio is recorded or uploaded; only a sound label and its score leave the phone.

**[Scalable]** Each person has their own signed chain, and the public anchoring cost is capped at about R570 a month for the whole network, whether we have five thousand members or five hundred thousand.

**[Impact]** There's no charge to the person in danger. It's designed for express kidnapping and for abuse at home, where pressing a button isn't possible, and we're taking it to GBV organisations and a campus pilot next.

**[Honest]** Our scream detection is weak today, and we measure it in public. That's the work for the next three months.

## 5 · Numbers to settle before either pitch (D1, D2)

**Three models are in circulation** (business audit, 18 Oct):

| Model | Break-even at R20 | Where |
|---|---|---|
| `main` (`scripts/economics_vigil_anchor.py`) | **10,973** (re-run 25 Oct 2026; 10,901 was an earlier `main` figure) | `docs/MASTER-CONTEXT.md` §8 |
| War-room branch (itemised costs) | **10,973** | the Caplia/Figma deck. **`scripts/build_financial_model.py`, already on `main`, also uses these inputs**, so `main` holds two conflicting models; its funding label "TIA grant + angel target" echoes the unsourced canvas figures (§8) |
| Canvas branch (R50 price) | 3,774 at R50 | superseded by the R20 decision |

**All three pay five R30,000 stipends**, for a hackathon team of seven. The company has two founders. Re-running the war-room model with only the stipend count changed (`ESTIMATE`, scratch copies, 18 Oct; inputs otherwise unchanged):

| Founders paid | Fixed cost / month | Break-even at R20 |
|---|---:|---:|
| 5 (current models) | R156,683.98 | 10,973 |
| 3 | R96,683.98 | 6,771 |
| **2** | **R66,683.98** | **4,670** |

**The ask.** R1,884,583 today (war-room branch): 95.5% of it is the five stipends for 12 months. In its own cash model it still runs out, with cash lowest at −R114,328 (May 2028). With **two** founders and no other change, the cash needed before the pilot pays (`ESTIMATE`, `scripts/build_financial_model.py` with stipends at 2 × R30,000 and no funding):

| First pilot payment | Cash needed before it |
|---|---:|
| May 2027 (the model's assumption) | ≈ R404,000 |
| Nov 2027 | ≈ R804,000 |
| May 2028 | ≈ R1,204,000 |

These exclude what a launch actually adds: the penetration test, counsel, production hosting in South Africa North, SMS, and integration engineering. **Recommendation:** keep the ask near its current size but rebuild it bottom-up (two founders until a realistic first-revenue date, plus those launch costs, plus an explicit contingency line) in `scripts/build_financial_model.py`, merge one model to `main`, and quote only what the script prints.

## 6 · Questions investors and judges will ask, and the honest answers

| Question | Answer |
|---|---|
| "How accurate is it?" | *(Quote only once these figures are promoted to `docs/EVIDENCE.md`; until then, "not measured in the field".)* On public test clips (FSD50K), a check-in opens for 46.0% of glass (n = 139) and 54.6% of gunshots (n = 108), but **only 6.5% of screams (n = 108)**. The field false-alarm rate is not measured yet. The duress PIN and the Emergency button don't depend on sound at all |
| "Who has signed?" | Nobody yet. The first pilot proposal goes to insurers and banks this quarter ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)) |
| "Why would a bank pay R20?" | FNB has sold an in-app panic button at R19.90 a month, paid by its customers (2022 price, being re-checked). Ours is designed for when you can't press. The price is our proposal; the pilot tests it |
| "Why a blockchain?" | Only so a stranger can check *when* a record existed without trusting us. Only a 33-byte fingerprint goes on it, never names, locations or event details. It runs on Hedera testnet today |
| "What if the phone is switched off?" | If it's off before anything is detected, nothing escalates. We say so ([`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md) adds tamper signals) |
| "What's your uptime?" | Not measured yet. The probe and the targets are in [`04-SLA.md`](04-SLA.md). Our student cloud account was disabled, so we're moving to a company-owned server in South Africa (state this only once confirmed: [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §0) |
| "Discovery Bank already has a panic code." | Yes, and it shows banks want this. It works inside one bank and must be typed. VUKA is designed to work with any bank that accepts its signal (the bank side is simulated today), to notice when you can't answer, to alert the people you chose, and to leave a record a stranger can check |
| "Capitec's CIO says duress PINs backfire once criminals know about them." | It's a fair point. Our two PINs are designed to look identical on the phone, and the bank's response uses delays criminals already expect. We haven't yet tested that an attacker can't tell them apart, and we're fixing two prompts where the duress PIN doesn't yet raise the alarm. A missed check-in and a wrong PIN also alert guardians, so the PIN isn't the only route. We're testing the argument with GBV organisations |
| "Who else does this?" | Panic buttons through AURA (FNB GuardMe, OUTsurance, Discovery 911), and Valor, a voice-activated panic app that says it alerts bank fraud desks. VUKA notices when you can't press, alerts the people you chose, and keeps a record a stranger can check. It doesn't dispatch armed response |
| "Is it lawful?" | No audio is recorded or uploaded: a 3-second buffer on the phone is classified and discarded, and only a label and score leave it. Our reading, which counsel is checking, is that this is low risk under RICA, and the member is a party while carrying the phone. That's one reason we propose journey mode as the default (D7) |
| "Why you two?" | Built it with five teammates over the two weeks around the Geekulcha hackathon, then kept going. One of us owns the backend and ledger, the other the product and app |

## 7 · Practice and ownership (proposed)

- **Investor pitch:** Sibusiso leads, Lethabo answers product questions.
- **Judges' pitch:** Lethabo leads the story and the demo, Sibusiso answers the record and the money.
- Rehearse both against a timer, recorded, by **mid November**, so the YouthX version is ready before **21 Nov** (`REPORTED` date).

## 8 · Funding routes to check (proposed order)

The web research for this section didn't run (§2). Rows are `ASSUMPTION` unless tagged, and **no amount, deadline or eligibility rule here goes into a deck until it is checked on the organiser's own page.** The canvas branch's "TIA up to R1.2M + angel R800k" is unsourced and must not be quoted.

| Order | Route | Fit now |
|---|---|---|
| 1 | **Non-dilutive.** A YouthX prize if won. **TIA seed funding**, which runs through implementing partners such as university technology-transfer offices, with no direct application (`REPORTED`: Wits and TIA news, Aug 2026; a TIA pre-seed call with Propella closed 16 Oct 2026). **NYDA** grants (youth 18–35). SAB Foundation social-innovation awards. The Innovation Hub's Gauteng Accelerator Programme | High: ask the Wits E-Hub for the TIA route |
| 2 | **Bank enterprise and supplier development**, Nedbank through the YouthX relationship first | High once B-BBEE status is confirmed |
| 3 | **Angels through African Business Angel Network member groups**, once a letter of intent exists | Medium |
| 4 | **Accelerators** (Founders Factory Africa, Google for Startups Accelerator: Africa, card-network fintech programmes), after pilot traction | Later |

Typical South African pre-seed cheque sizes aren't quoted until checked against a published survey (for example SAVCA's).
