# 11 · Two hard questions: staged distress, and getting the money back

> **Status:** `PROPOSED`, 28 Oct 2026. Written by the Claude Code assistant for Sibusiso Khumalo, for the AFRETEC showcase and later pitches. Nothing here has been said to anyone.
> **Sources:** `docs/STAGED-DURESS-DEFENCE.md` (the fraud defence; owner Ipeleng, `PROPOSED`), `docs/venture/01-B2B-ENTERPRISE.md` (offers N1–N3, I1–I2, pilot, vendor gate), `docs/EVIDENCE.md`, `docs/venture/research/2026-10-18-web-banks-insurers.md`. Web claims in those files came from search extracts: **re-open each URL before quoting it to a partner, judge or investor.**
> **Tags:** `FACT` · `ESTIMATE` · `ASSUMPTION` · `PROPOSED` · `REPORTED`, as in `docs/MASTER-CONTEXT.md` §7. Criteria: **S** (fraud and ethics), **B** (who pays and why), **T** (what runs).

---

## Q1 · "What if people stage distress and then claim? How does VUKA stop that?"

### Say this (about 45 seconds)

> "VUKA never proves an event was real. It proves *when* a signal existed and that it hasn't changed since, so a staged record pays no one on its own. Three things work against a fraudster. If their bank is connected, a duress signal makes the bank hold the money, so faking duress blocks your own transfer. A claim-grade record needs a guardian signing with their own key before the money moved, so staging needs an accomplice who is exposed too. And the record keeps everything, including cancelled alerts and earlier normal PINs, and it has to agree with cameras and phone records forever. A person always decides; nothing pays out automatically."

### If they push: the seven layers (`STAGED-DURESS-DEFENCE.md` §3)

| # | Layer | What it defeats | Honest limit |
|---|---|---|---|
| 1 | **The money doesn't move.** A duress signal makes a connected bank apply its own routine friction (ADR-0037) | The payoff: faking duress blocks your own withdrawal; not faking it leaves a "normal" record that undercuts a later claim | `PROPOSED`. The bank side is `sim_bank`, SIMULATED. No real bank is connected. Banks that haven't integrated get nothing |
| 2 | **Independent principals.** The member's phone, a guardian and a bank each sign with their own key | The lone fraudster: staging needs accomplices, each exposed to prosecution | A guardian who lies, who then becomes a co-accused |
| 3 | **Hardware-signed events** (Android Keystore) | Changing an event's context after signing | Attestation is `stored_unverified`: a valid signature proves the key was used, **not** that the microphone heard a real event, and not that the phone wasn't rooted or emulated |
| 4 | **Public time before the transfer.** Every PIN outcome, normal or duress, is anchored on Hedera testnet within about a minute | "The record was written after the transfer" | It doesn't show the event was true. No company server is running today (`06` §0), so nothing is being anchored now |
| 5 | **History is part of the record.** Cancels, guardian changes and earlier alerts are chained | Hiding a switch-off, or a pattern ("three convenient emergencies last month") | A first-time fraudster has no history |
| 6 | **People decide.** The record is one input to a human adjuster or bank officer | Machine verdicts either way | Bad human judgement, which is itself audited |
| 7 | **Absence is not evidence.** No claim is rejected because a VUKA record is missing | Punishing a real victim whose phone was dead or off | — |

**The claim-grade rule** (`VUKA-2-SPEC.md` §3, as quoted in `STAGED-DURESS-DEFENCE.md`): at least **two independent principals** (the member's device and a guardian's own-key acknowledgement) and **one public timestamp, before the money moved**. A guardian's acknowledgement shows a second person was alerted and responded; it is not eyewitness evidence.

**Why a permanent record works against the fraudster** (`STAGED-DURESS-DEFENCE.md` §2): it fixes the story before they know what else exists (ATM cameras, cell towers, the accomplice's phone, the bank's device fingerprint). A real victim's record agrees with the world. A staged one has to agree with every other record, forever.

**The law already covers staging** (primary text read 23 Sep 2026, per `STAGED-DURESS-DEFENCE.md` §2 and §8): making false data with intent to defraud is cyber forgery, and passing it off is cyber uttering (Cybercrimes Act 19 of 2020, s9). A payout that follows is cyber fraud (s8). A false sworn statement to SAPS is a separate offence ⚑ (secondary source only). VUKA doesn't create these offences; it makes the trail permanent.

**A precedent partners already use:** Discovery Bank charged a client a R1,000 misuse fee for a mistaken Panic Code entry (EWN, 4 Jun 2025, `REPORTED`). Partners can set their own misuse terms.

### What VUKA can't stop (say it if asked)

- A first-time fraudster with an accomplice and a real scream in a real room can create a record. **VUKA does not detect staging.** The bank's or insurer's normal investigation still applies, which is why the record never triggers a payout by itself.
- We chose not to build an AI "staging detector": there is no labelled staged-versus-real data, so it would be an uncalibrated claim (`STAGED-DURESS-DEFENCE.md` §7).
- A normal PIN entered under coercion shows "normal code entered", not "safe" (scenario S6).
- **None of this has run with a real bank or insurer.** No fraud case has been measured.

---

## Q2 · "How does this help people get their money back? By how much? What can banks and insurers do?"

### Say this (about 45 seconds)

> "Today a forced transfer looks authorised: her phone, her face, her PIN. In one public ombud case, the bank's fraud team called the client, she said yes because she was being held, and the bank was found not negligent. VUKA changes two things. During the incident, a connected bank gets a covert signal and can hold the money with delays criminals already expect. Afterwards, she has a record made at the time, with a public timestamp within about a minute, that a bank, insurer or ombud can check without trusting us. We haven't measured how much that raises recovery. The pilot is designed to measure it."

The ombud case is `REPORTED` (Business Report, 18 Mar 2025, and Daily Maverick, 14 Aug 2024, via search extracts). **Re-open the article before quoting it.**

### The honest answer to "by how much?"

**Not measured.** There is no pilot, no partner and no recovery data, so we quote **no percentage**. What the pilot measures (`01` §6): holds applied, money held versus lost, claims touched, investigation time, false check-ins per member per week, alert delivery (p95), the stand-down rate, and member comfort.

### Comparison: today, and with VUKA (design, not measured)

| | Today | With VUKA (`PROPOSED`; not measured) |
|---|---|---|
| What the bank sees at the time | An authorised payment from the customer's own device. At best, a fraud call the captive customer confirms: R103,092 lost in the ombud case (`REPORTED`) | A covert, signed signal during the incident (N1). The bank applies its own routine hold. The bank decides; VUKA never acts |
| Evidence afterwards | The customer's word against the device logs | A record anchored within about a minute, with a guardian's own-key acknowledgement (two principals) |
| The ombud's test | The bank is liable for maladministration or unfair treatment, or for failing to prevent or reduce the loss (`REPORTED`, NFO, via the same articles) | A signal the bank received during the incident is a fact the ombud could weigh (`ASSUMPTION`: our reading, not legal advice; counsel to confirm) |
| One formal ombud case | About R4,962 and about 61 days (`REPORTED`). R4,962.38 is the scheme's levy-funded cost per formal case, **not** the bank's cost | Could shorten an investigation. **Not measured** |
| Scale of the problem | R2.4bn lost to digital banking crime in 2025 (`FACT`, SABRIC, gross losses). Ombud card-fraud complaints up 73%, 1,436 to 2,483, January to May only (`FACT`, NFO, 7 Aug 2025, narrow scope) | — |
| Abroad, for contrast | UK: reimbursement of qualifying authorised push-payment scams has been mandatory since 7 Oct 2024, capped at £85,000 per claim (`FACT`, UK PSR). **No SARB, FSCA, Treasury or PASA statement** says South Africa will follow | VUKA's record lowers the cost of investigating a claim. It is **not** a new bar victims must clear |

### The usual route to a refund today (general, not legal advice)

`ASSUMPTION`: the general route. Check it against the bank's and the National Financial Ombud's own pages before giving it to anyone.

1. Tell the bank at once, through its fraud line, and open a SAPS case.
2. Lodge a dispute with the bank.
3. If the bank doesn't resolve it, complain to the National Financial Ombud.
4. If the person has cover, claim from the insurer. iTOO's [My]Cylution covers theft of funds and express kidnapping. Prices conflict: "from R22.50/month" (`FACT` in `EVIDENCE.md`) against R85–R325/month on a broker page (`REPORTED`, `01` §3.3).

**Where VUKA would fit**, with the member's consent: a signed export for steps 2 and 3 (offer N3), and the same record for the insurer's investigator in step 4 (offer I1). The reviewer checks *when* a signal existed and that it hasn't changed, never *what* happened.

### What banks can do (`01` §5; all `PROPOSED`, nobody has agreed)

- **N1. Take the signal into fraud operations, starting observe-only.** A signed webhook (`BankSignal`, ADR-0037) with a pseudonymous reference and the trigger (`duress_signal`, `no_answer` or `contact_lost`). The bank's own people and rules decide. **Partner terms:** no call or message to the member about the signal while an incident is open; holds use routine wording ("payment scheduled", a new-beneficiary hold); release only after safety, by a branch visit with ID or a verified call-back. Standard Bank and Absa already hold payments to new beneficiaries for 1–2 hours (`REPORTED`), and Capitec's Feature Lock imposes a 4-hour delay (Capitec blog, 2024), so banks already accept short holds.
- **N2. Put VIGIL in their app**, on the GuardMe model: a white-label build or deep link first, an SDK later, priced against FNB GuardMe's R19.90 a month (`FACT`, 2022 press; 2026 status unconfirmed).
- **N3. Accept ANCHOR records in disputes and ombud complaints**, with the member's consent. The absence of a record is never evidence against a customer.

### What insurers can do

- **I1. Use the record in claim verification** for theft-of-funds and express-kidnapping claims. iTOO, underwritten by Hollard, is the natural first fit: the only insurer found selling retail express-kidnapping cover (`REPORTED`). Measure investigation time and claims touched.
- **I2. Bundle VIGIL with cover** as a value-add, priced per policy. The actuary test: the insurer must save at least 12 × the monthly price per member per year, so R240 at R20 (`ESTIMATE`; R20 is an `ASSUMPTION`).
- **Contract terms:** human review only, no automated pricing, no adverse inference from a missing record (gap G38).

### What they'll need from us first (the vendor gate, `01` §7)

| Item | State today |
|---|---|
| A server of record the company controls | **No** (`06` §0; D9) |
| Independent penetration test | Not done (G8) |
| POPIA Information Officer registration | Prepared, not submitted |
| Operator agreement (POPIA s21) and data-processing terms | Not drafted |
| SLA with measured uptime | Targets proposed; no baseline |

### Next steps (`PROPOSED`; `01` §6 and `06`)

1. A company-owned server in South Africa (D9). Nothing else launches until it exists.
2. Paperwork, about 6 weeks: close the vendor gate, and write the interface specification from `BankSignal`.
3. Observe-only pilot, 90 days, up to about 300 consenting staff or volunteers. No automatic action by the partner.
4. Live input, 9–12 months, up to 5,000 consenting members. The partner decides any hold.
5. Publish what was measured, with n.

Open both conversations, a bank (N1) and an insurer (I1), and build for whichever signs a pilot letter first (D3 is open). Nedbank's YouthX enterprise development is for **introductions only**: it is not a commercial relationship.

### Don't say

"Partnering with" or "integrated with" any bank or insurer · "in talks with", before a meeting has happened and is recorded · any recovery uplift or percentage · "a VUKA record proves duress" · anything implying a missing record counts against someone.

---

## Review gates (`docs/MASTER-CONTEXT.md` §10)

1. **Fraud red-team:** this file is the answer, with its limits stated (VUKA doesn't detect staging).
2. **Build for use:** no claim that anything runs with a real bank. The bank side is simulated, and no server is running.
3. **Economic integrity:** every figure is tagged and traced to `EVIDENCE.md`, `01`, or the economics script. No recovery figure is invented.
4. **Privacy by design:** records are shared only with the member's consent; a missing record is never evidence.

**Would a real user trust and use this?** A bank or insurer will trust a vendor that says what its record can't show. A member will trust a product that never makes their claim depend on having used it.
