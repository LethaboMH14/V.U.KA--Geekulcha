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

**Rules for both:** say "imagine", never "this happened to"; name what is SIMULATED; never claim "proof of duress", "invisible", "court-admissible", "prevents crime", an accuracy without method and n, or a partnership that isn't signed. "Not measured" is a complete answer.

## 2 · What each audience will be checking

- **Nedbank YouthX Awards 2026.** Open to South Africans aged 18–26. Entries closed 9 Oct 2026; finalists pitch to an independent panel; **winners announced 21 Nov 2026**; prizes include cash, mentorship through Nedbank's enterprise development team and, for the top 3, the One Young World Summit (`REPORTED`, 2026 call for entries in Hype Magazine; not yet checked against Nedbank's own page). Judging criteria: research pending, follow-up commit.
- **Investec's The Easies** and **Caplia** (readiness score 327/700 on 5 Oct). The handover names the gaps Caplia scores that the repo can't fill: full-time status, equity split, two-plus years of domain experience, real interviews and letters of intent (`docs/SIBUSISO-HANDOVER.md`). Criteria and deadlines: research pending, follow-up commit.
- **Investors at E-Hub-style events.** The questions in §6.

## 3 · The investor pitch (3 minutes)

> *Spoken. About 430 words. [Brackets] are slides or actions.*

**[Problem]** Imagine Thandi. Friday evening, a mall car park in Pretoria. Two men get into her car, hold her phone to her face, and she types the amount they tell her. On Monday her bank shows her phone, her face, her PIN: she authorised it. Her insurer asks for proof she was forced. She has none.

That is a coerced transfer. South Africa recorded **17,061 kidnappings in 2023/24**, up 264% in ten years, 44% of them during a hijacking. Digital banking crime cost **R2.4 billion in 2025**.

**[Who loses money]** The bank and the insurer can't tell Thandi from someone who made the story up. So they pay a fraudster, or they fight a real victim, and both cost them.

**[Product]** VUKA is two things. **VIGIL**, on her phone, notices duress without a button: a scream, breaking glass, or her duress PIN, which looks exactly like her normal one. Her guardians are alerted silently. **ANCHOR** keeps a signed record of every step, fingerprinted on a public ledger, so a bank or insurer can check *when* it happened without trusting us. It works today on Android; the bank side is simulated until a partner connects.

**[Business model]** The member pays nothing. The insurer or bank pays **about twenty rand per member per month**, the same shelf as panic buttons banks already sell for R19.90. Each member contributes **R14.28 a month after variable costs, a 71% margin**. Anchoring the whole network costs **at most about R570 a month, however many members we have**. That's why it scales.

**[Plan]** One partner, five thousand members, twelve months, measured: false alarms, alert times, claims touched. Then three partners and fifty thousand members. Break-even is **[the number from the canonical model, D1]** members.

**[Traction, honestly]** Built at Geekulcha in September; top 50 of the Nedbank YouthX Awards; demonstrated at the Wits E-Hub. No partner has signed yet; that's what this round is for.

**[Ask]** We're raising **[the re-sized ask, D2]** to get two full-time founders to a signed pilot: the penetration test, production hosting in South Africa, and the integration work. And if you know the person at a bank or insurer who owns coerced-transfer losses, that introduction is worth as much as the cheque.

## 4 · The judges' pitch (2 minutes)

> *Spoken. About 300 words. Demo if allowed.*

**[Who it's for]** Imagine Thandi again: a woman in a car with two men, her phone in their hands. Every safety app asks her to press a button. She can't.

**[What VUKA does]** VUKA listens on her phone for signs of distress: a scream, breaking glass. It never raises an alarm on a sound alone; it asks her a quiet check-in. If she's fine, her normal PIN. If she's being watched, her duress PIN: **the screen looks exactly the same**, and the people she chose are told "Don't call or text them. Call 10111." If she can't answer, they're told too.

**[Demo]** *[Glass sound → check-in → duress PIN → the guardian's phone lights up → the record verifies on the public page. Say "simulated bank" aloud.]*

**[Feasible]** It ran end to end on Android against our cloud server on 27 September, fourteen steps out of fourteen, and every step is in a record anyone can check. The only AI is a small sound classifier on the phone; nothing is recorded or uploaded.

**[Scalable]** Each person has their own signed chain, and the public anchoring cost is capped at about R570 a month for the whole network, whether we have five thousand members or five hundred thousand.

**[Impact]** It's free to the person in danger. It's designed for express kidnapping and for abuse at home, where pressing a button isn't possible, and we're taking it to GBV organisations and a campus pilot next.

**[Honest]** Our scream detection is weak today, and we measure it in public. That's the work for the next three months.

## 5 · Numbers to settle before either pitch (D1, D2)

**Three models are in circulation** (business audit, 18 Oct):

| Model | Break-even at R20 | Where |
|---|---|---|
| `main` (`scripts/economics_vigil_anchor.py`) | **10,901** | `docs/MASTER-CONTEXT.md` §8 |
| War-room branch (itemised costs) | **10,973** | the Caplia/Figma deck and `scripts/build_financial_model.py` |
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
| "How accurate is it?" | On public test clips (FSD50K), a check-in opens for 46.0% of glass (n = 139) and 54.6% of gunshots (n = 108), but **only 6.5% of screams (n = 108)**. Field false-alarm rate not measured yet. The duress PIN and the Emergency button work with no sound at all |
| "Who has signed?" | Nobody yet. The first pilot proposal goes to insurers and banks this quarter ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)) |
| "Why would a bank pay R20?" | The bank already sells panic buttons at R19.90; ours works when you can't press. The price is our proposal; the pilot tests it |
| "Why a blockchain?" | Only so a stranger can check *when* a record existed without trusting us. Only 33-byte fingerprints go on it, never personal data |
| "Is it legal to listen?" | Nothing is recorded or sent; a 3-second buffer on the phone is classified and discarded. Our reading is that this isn't interception under RICA; counsel is confirming |
| "What if the phone is switched off?" | If it's off before anything is detected, nothing escalates. We say so ([`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md) adds tamper signals) |
| "What's your uptime?" | Not measured yet; the probe starts with this PR, and the targets are in [`04-SLA.md`](04-SLA.md) |
| "Why you two?" | Built it in a weekend with five teammates, then kept going; one owns the backend and ledger, one the product and app |

## 7 · Practice and ownership (proposed)

- **Investor pitch:** Sibusiso leads, Lethabo answers product questions.
- **Judges' pitch:** Lethabo leads the story and the demo, Sibusiso answers the record and the money.
- Rehearse both against a timer, recorded, by **mid November**, so the YouthX version is ready before **21 Nov** (`REPORTED` date).
