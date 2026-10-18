# 1 · VUKA as an enterprise product for insurers and banks

> **E-Hub insight 1 (15 Oct 2026):** *"Look to turning VUKA into a B2B enterprise business model to sell to insurers and Nedbank. Collaborate with them and integrate VIGIL and VUKA into their systems."*
> **Status:** `PROPOSED`. Nothing here is built beyond what §2 marks `FACT`. **No bank or insurer has agreed to anything.** The YouthX top 50 is an award stage run through Nedbank's enterprise development, not a commercial relationship, and is never presented as one. Serves B, T, S.
> **About the sources:** the web research ran on 18 Oct 2026 from a cloud session that couldn't open web pages directly; every web claim comes from a search extract of the named page. They are tagged `REPORTED` even when the page is a bank's or regulator's own, and **each URL must be re-opened before it is quoted to a partner, judge or investor.**

---

## 1 · What actually changes

VUKA was already partner-funded on paper: *"A partner pays about R20 per member per month"* (`docs/ECONOMICS-VIGIL-ANCHOR.md` §1). The E-Hub feedback moves it a level deeper:

| | Before (hackathon) | After (this plan) |
|---|---|---|
| Where VUKA sits | A separate app the partner switches on | **Inside the partner's systems**: their app, their fraud operations, their claims process |
| What the partner buys | A benefit to offer customers | A capability: an earlier warning during a coerced transfer, a record their investigators can check, a trigger for the response service they already pay for |
| Who we talk to | "A bank or insurer" | Named teams inside one institution (§4) |
| What has to exist | A demo | An integration surface, a pilot agreement, an SLA ([`04-SLA.md`](04-SLA.md)) and the vendor paperwork (§7) |

## 2 · What already exists to build on (`FACT`)

- **The bank protective-hold signal** (ADR-0037, accepted). On a duress signal, or on `no_answer` with no guardian stand-down within 3 minutes, VUKA sends a signed risk signal and **the bank decides**. It is never sent from detection alone. Only `sim_bank` exists (SIMULATED; open gap G30).
- **Evidence levels.** Banks and insurers see a tier, an E-level and reasons, never a score (`docs/VUKA-2-SPEC.md`).
- **Third-party access is designed, not built** (ADR-0039), gated by G36 (selective disclosure), G37 (safe release) and G38 (human review only, no automated pricing, no adverse inference from a missing record) in `docs/OPEN-GAPS.md`.
- **An access-model proposal** on the unmerged branch `docs/babatunde-war-room-and-access-model`: an optional read-node inside a bank's perimeter, per-case access on the member's consent (`PROPOSED`).
- **Five unpriced revenue hypotheses** in `docs/SA-ANCHOR-SCALE-SECURITY-BUSINESS.md` §8.

## 3 · The market VUKA walks into (`REPORTED` unless tagged)

### 3.1 Nedbank

- **3.0 million active Money app clients** in FY2025, up 14%; 8 million clients across the group (Nedbank FY2025 results, 3 Mar 2026: https://group.nedbank.co.za/news-and-insights/press/2026/a-transformation-year-as-nedbank-positions-for-growth.html).
- Its app security features are fraud-awareness screens when the app opens during a call, in-app Approve-it, MoneyGuard (SMS Y/N on flagged card transactions), card freeze and virtual cards (https://personal.nedbank.co.za/home/fraud-awareness/banking-safely/money-app-security.html). **No Nedbank panic, duress or kidnapping feature was found**, and no Nedbank Insurance personal-safety or kidnap product (absence of evidence, 18 Oct).
- **It has embedded a third-party security SDK before:** Entersekt's mobile authentication has run in Nedbank's apps since 2012 (vendor case study).
- **API Marketplace:** OAuth 2.0, a sandbox, a register-interest route and a Value Added Services API (https://api-marketplace.nedbank.co.za/). There is **no public API that receives a third-party risk signal** into its fraud engine, so offer B below would be a custom integration (`ASSUMPTION`).
- **YouthX** gives mentorship through Nedbank's enterprise development team (Hype Magazine coverage of the 2026 call). Use it to ask for introductions to Digital Channels and Financial Crime Risk, nothing more.

### 3.2 What other banks already do

| Bank | Feature | Why it matters to VUKA |
|---|---|---|
| **Discovery Bank** | **Panic Code**: entered instead of the security code, the app looks normal while the fraud team is alerted silently, location is shared, and armed response may be sent; transactions keep processing. A client who entered it by mistake was charged a **R1,000 misuse fee** (full fee R2,000) (EWN, 4 Jun 2025) | The closest in-bank precedent, built in-house and reportedly being patented. It works inside one bank and must be typed |
| **FNB** | **GuardMe**: an in-app panic button powered by AURA, R19.90 per member per month after 3 free months (2022 press; **2026 status unconfirmed**) | The price anchor VUKA already uses |
| **Capitec** | Real-time payment risk warnings; a branch-only hidden account; a "trusted approver" reported in development. Its CIO argues **a duress PIN makes clients less safe** once criminals know it exists (blog, 1 Aug 2026) | The strongest counter-argument to VUKA's design; it goes in both pitches (§8) |
| **Standard Bank / Absa** | Payments to new beneficiaries held for 2 hours (Standard Bank) or 1 hour for the first two (Absa) | Banks already accept a short hold as normal |
| **Valor** (third party) | A voice-activated panic app that claims to alert users' bank fraud desks, with unnamed partner banks (Engineering News, Mar 2025) | **The closest direct competitor** found |

**The gap VUKA fills, in one public case:** a kidnapped client lost **R103,092**. The bank's fraud system flagged the payments and **called her, and she confirmed them under duress**. The ombud found the bank not negligent; the bank paid part as goodwill (Business Report, 18 Mar 2025). A signal through a separate, covert channel gives the fraud team something to weigh against that "yes".

### 3.3 How insurers and platforms already buy safety

| Who | Product | Paid how |
|---|---|---|
| **iTOO Special Risks** (underwritten by Hollard) | [My]Cylution personal cyber cover; express kidnapping in the higher tiers. **Prices conflict**: "from R22.50/month" on a page about three years old, R85–R325/month on a broker page | A priced policy. **The only insurer found selling retail express-kidnapping and theft-of-funds cover**, so the natural first fit for claim verification |
| **OUTsurance** | Help@OUT panic assistance, powered by AURA | Free to policyholders |
| **Momentum Insure** | Safety Alert panic button | Free to car and home policyholders |
| **Discovery Insure** | Discovery 911 (AURA for security, Netcare911 for medical), launched Jun 2026 | A priced add-on (R55–R140/month in one extract; re-check) |
| **King Price** | "code red" in-app panic button with Secura | A nominal monthly fee |
| **AURA** | The response layer behind many of these, sold per user per month through banks, insurers and apps, by API inside the partner's app or as a white label (company claims) | B2B2C |

**Five payment patterns are in use:** the customer pays through the bank; the insurer absorbs it as a value-add; the insurer sells an add-on; the platform absorbs it (Uber, Bolt); a sponsor funds a non-profit. **AURA is the shared response layer.** VUKA should position as **the trigger and the verifiable record that feed AURA or a bank**, not as a second response network (`PROPOSED`).

## 4 · Who inside the institution buys

`ASSUMPTION` until a conversation confirms it; each meeting replaces a guess with a team name and a date.

| Team | What VUKA gives them | First question they'll ask |
|---|---|---|
| **Fraud and financial crime** (bank) | A signed early signal during an open incident (offer B) | "How many false signals per thousand customers?" (not measured: [`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md)) |
| **Digital channels** (bank app) | VIGIL inside their app (offer A) | "What does it do to battery and to app-store review?" |
| **Claims and special investigations** (insurer) | A record made at the time that their investigator can check without trusting us (offer C) | "Does a missing record count against a claimant?" Never (G38) |
| **Product** (insurer) | A safety benefit to bundle, or a trigger for their existing panic button | "What does it cost per policy, and does it lower claims?" (the actuary test: the insurer must save at least 12 × the monthly price per member per year) |
| **Enterprise development** | A door to the right business owner, not a buyer | "Who should you meet?" |

## 5 · The offers

Each is a separate product decision; **D3** in the README picks which to lead with.

**To Nedbank:**
- **N1, the risk signal into fraud operations (offer B), starting observe-only.** A signed webhook (ADR-0037 `BankSignal`) with a pseudonymous partner reference and the trigger (`duress_signal`, `no_answer` or `contact_lost`). Nedbank's own people and rules decide; the signal never causes an action on its own. Lead with the ombud case in §3.2. *Recommended first ask.*
- **N2, VIGIL as a value-added service in the Money app (offer A)**, on the GuardMe model: a white-label build or deep link first, an SDK later; priced against R19.90. Pair with an existing responder rather than building response. Whether AURA accepts third-party triggers is unverified.
- **N3, ANCHOR records for disputes and ombud complaints (offer C)**, on the member's consent: the disputes team checks *when* a signal existed and that it hasn't changed, never *what* happened.

**To an insurer** (start with iTOO/Hollard; OUTsurance, Momentum and King Price as value-add partners):
- **I1, claim verification (offer C)** for theft-of-funds and express-kidnapping claims; measure investigation time and claims touched.
- **I2, VIGIL bundled with cover** as a value-add, priced per policy.
- **I3, the trigger for the insurer's existing panic button**: VIGIL's check-in, no-answer deadline and covert duress PIN feed their AURA or Secura dispatch.

**And one channel conversation:** AURA itself, which already runs the panic layer for FNB, OUTsurance, Discovery Insure and Uber. One integration could reach several institutions.

**Hard parts, stated:**
- **An always-listening microphone inside a bank's app** is a new review for the bank's app-store listing and for customer comfort.
- **One codebase first:** VUKA has two app codebases today (D5).
- **Duress parity must hold inside someone else's app.** The partner's analytics must never log which PIN was used.
- **The bank must map our member to its customer** without VUKA holding banking data.
- **The Cybercrimes Act:** a bank's own reporting duty under s54 is separate; our signal is not that report.

## 6 · How the money works, and the first pilot

| Line | Today | Proposed |
|---|---|---|
| Per member per month | R20, `ASSUMPTION`, not validated with any buyer | The opening number; the pilot tests it |
| Integration or set-up fee | none | **Add one** (`PROPOSED`, unpriced): enterprise integrations carry a set-up fee for the engineering above |
| Per verification | R15 per case, `PROPOSED` | Price separately. At R15 the war-room model needs **10,446 cases a month** to cover fixed costs (`ESTIMATE`), so it is never the model on its own |

**Bank first or insurer first (D3).** Bank first suits N1 and N2, and the bank feels the coerced transfer directly. Insurer first suits I1, with a clean actuary story. Recommendation: **open both conversations and build for whichever signs a pilot letter first.**

**Pilot shape (`PROPOSED`; planning figures, not commitments):**
- **Phase 0, about 6 weeks: paperwork.** Close the vendor gate (§7) and write the interface specification from the `BankSignal` contract.
- **Phase 1, 90 days: observe-only.** Up to about **300 consenting staff or volunteers**. Signals go to a named fraud-operations queue, and the partner takes **no automatic action**. Measure:
  - false check-ins per member per week;
  - p95 alert delivery;
  - stand-down rate;
  - minutes of fraud-operations time per signal;
  - a member-comfort survey.
- **Phase 2, 9–12 months:** up to **5,000** consenting members (the financial model's assumption). The signal becomes a live risk input and the partner decides any hold. For an insurer, measure claims touched and investigation time.
- **Terms:** a paid pilot or set-up fee; exit thresholds agreed with the partner; deletion of the partner's members' data on exit. No detection-accuracy claim without a method and n.

## 7 · The vendor gate: what a bank or insurer will check

**The rules they work under** (`REPORTED`, via search extracts; verify before quoting):

| Instrument | What it means for VUKA |
|---|---|
| **Joint Standard 1 of 2023**, IT governance and risk management (FSCA and Prudential Authority), effective 15 Nov 2024 | Vendors are pulled into the bank's or insurer's IT-risk framework |
| **Joint Standard 2 of 2024**, cybersecurity and cyber resilience, effective 1 Jun 2025 | Third parties get the same monitoring and access limits as staff; contracts define security roles; data returned or deleted at the end; penetration testing |
| **Joint Communication 5 of 2026**, incident-notification template, effective 1 Sep 2026 | The partner's first notice to its regulators is due **within 24 hours** of classifying a material incident; VUKA must tell the partner well inside that ([`04-SLA.md`](04-SLA.md) S9) |
| **Guidance Note G5/2014** (bank outsourcing); **Directive D3/2018 and G5/2018** (cloud and offshoring of data, banks); **Joint Communication 2 of 2025** (cloud and offshoring, all institutions) | Offshore data needs justification, regulator access and an exit plan. **This bites on VUKA's data sitting in UAE North** |
| **Joint Standard 1 of 2024**, outsourcing by insurers, commenced 1 Dec 2024 | Material outsourcing needs due diligence and notice to both regulators |
| **POPIA s21**: a written operator contract is mandatory (the Regulator found against Dis-Chem for lacking one); **s72** cross-border transfers; **s57** prior authorisation (see [`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md) §3); **s71** automated decisions | Each needs counsel before partner data flows |

**Typical due diligence:** a security questionnaire; ISO 27001 (or a SOC 2 report); recent penetration-test results; a business continuity and disaster recovery plan; incident-notification SLAs; and a list of our own sub-processors.

**Where VUKA stands:**

| Item | State | Owner |
|---|---|---|
| Server of record under the company's control | **No** ([`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §0) | Sibusiso |
| Independent penetration test | Not done (G8) | both founders |
| POPIA Information Officer registration | Prepared, not submitted | the company |
| Operator agreement (s21) and data-processing terms | Not drafted | counsel |
| Data residency (s72, D3/2018): data in Azure UAE North | **Undocumented**; the privacy notice still says South Africa North | Sibusiso |
| SLA with measured uptime | Targets proposed, probe built, no baseline | Sibusiso |
| Running code on `main` | Not yet (D4) | both |
| Accounts and IP held by the company | No (D10) | both |

## 8 · What we say, and what we don't

- **Say:** "We are preparing a pilot proposal for insurers and banks." "The bank signal is built against a simulated bank today." "Discovery Bank's panic code shows banks want this inside their app; VUKA works across banks, notices when you can't type, and leaves a record anyone can check."
- **Answer the counter-argument head-on:** Capitec's CIO is right that a publicised duress PIN can be demanded by an attacker. VUKA's answer is that the two PINs look identical and the attacker can't tell which was entered. A missed check-in and a wrong PIN also alert guardians, so the PIN is not the only route. We will test the argument with GBV organisations rather than assume it away.
- **Don't say:** "partnering with Nedbank", "in talks with" before a meeting has happened and is recorded, any partner logo without written permission, "integrated with" any real bank, or any accuracy figure without its method and n.
