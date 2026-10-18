# 1 · VUKA as an enterprise product for insurers and banks

> **E-Hub insight 1 (15 Oct 2026):** *"Look to turning VUKA into a B2B enterprise business model to sell to insurers and Nedbank. It would be better to collab with them and integrate VIGIL and VUKA to their system."* (Sibusiso's note, 18 Oct)
> **Status:** `PROPOSED`. Nothing here is built beyond what §2 marks `FACT`. **No bank or insurer has agreed to anything.** The YouthX top 50 is an award stage run through Nedbank's enterprise development. It is not a commercial relationship, and we never present it as one. Serves B, T, S.
> **About the sources:** the web research ran on 18 Oct 2026 from a cloud session that couldn't open web pages directly. Every web claim comes from a search extract of the named page, so it is tagged `REPORTED`, even when the page is a bank's or a regulator's own. **Re-open each URL before quoting it to a partner, judge or investor.** Full notes: [`research/2026-10-18-web-banks-insurers.md`](research/2026-10-18-web-banks-insurers.md). That file tags official pages `FACT`; read those as `REPORTED`.

---

## 1 · What actually changes

VUKA was already partner-funded on paper: *"A partner pays about R20 per member per month"* (`docs/ECONOMICS-VIGIL-ANCHOR.md` §1). The E-Hub feedback moves it a level deeper:

| | Before (hackathon) | After (this plan) |
|---|---|---|
| Where VUKA sits | A separate app the partner switches on | **Inside the partner's systems**: their app, their fraud operations, their claims process |
| What the partner buys | A benefit to offer customers | A capability: an earlier, covert warning during a coerced transfer, and a record their investigators can check |
| Who we talk to | "A bank or insurer" | Named teams inside one institution (§4) |
| What has to exist | A demo | An integration surface, a pilot agreement, an SLA ([`04-SLA.md`](04-SLA.md)) and the vendor paperwork (§7) |

## 2 · What already exists to build on (`FACT`)

- **The bank protective-hold signal** (ADR-0037, accepted). The signal goes on a duress signal, or on `no_answer` with no guardian stand-down within 3 minutes. VUKA sends a signed risk signal and **the bank decides**; the signal is never sent from detection alone. The rest of ADR-0037 binds the bank's side too:
  - holds use friction criminals already expect;
  - nothing names the duress during the event;
  - release instructions are shown only after safety.

  It is written and tested against `sim_bank` (SIMULATED), **on the server branch only**. It is not on `main`, and not deployed since the server was lost (open gap G30; [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §0).
- **Evidence levels.** Banks and insurers see a tier, an E-level and reasons, never a score (`docs/VUKA-2-SPEC.md`).
- **Third-party access is designed, not built** (ADR-0039). Three gates in `docs/OPEN-GAPS.md` hold it back: G36 (selective disclosure), G37 (safe release) and G38 (human review only, no automated pricing, no adverse inference from a missing record).
- **An access-model proposal** on the unmerged branch `docs/babatunde-war-room-and-access-model`: an optional read-node inside a bank's perimeter, and per-case access with the member's consent (`PROPOSED`).
- **Escalation goes to guardians only** (ADR-0036(1), accepted). There is no autonomous dispatch (`RULES.md`), and private-security dispatch is parked (ADR-0034). §5 explains what this means for the response platforms below.

## 3 · The market VUKA walks into (`REPORTED` unless tagged)

### 3.1 Nedbank

- **3.0 million active Money app clients** in FY2025, up 14%, and 8 million clients across the group (Nedbank FY2025 results, 3 Mar 2026).
- **App security today:** fraud-awareness screens when the app opens during a call, in-app Approve-it, MoneyGuard (SMS Y/N on flagged card transactions), card freeze and virtual cards. **No Nedbank panic, duress or kidnapping feature was found**, and no personal-safety or kidnap product from Nedbank Insurance (absence of evidence, 18 Oct).
- **It has embedded a third-party security SDK before.** Entersekt's mobile authentication has run in Nedbank's apps since 2012 (vendor case study).
- **API Marketplace:** OAuth 2.0, a sandbox, a register-interest route and a Value Added Services API. There is **no public API that receives a third-party risk signal** into its fraud engine, so offer N1 below would be a custom integration (`ASSUMPTION`).
- **YouthX** gives mentorship through Nedbank's enterprise development team (Hype Magazine coverage of the 2026 call). Use it to ask for introductions to Digital Channels and Financial Crime Risk, and nothing more.

### 3.2 What other banks already do

| Bank | Feature | Why it matters to VUKA |
|---|---|---|
| **Discovery Bank** | **Panic Code**: entered instead of the security code. The app looks normal while the fraud team is alerted silently, location is shared, and armed response may be sent; transactions keep processing. A client who entered it by mistake was charged a **R1,000 misuse fee** (full fee R2,000; EWN, 4 Jun 2025) | The closest in-bank precedent: built in-house, and reportedly being patented. It works inside one bank and must be typed |
| **FNB** | **GuardMe**: an in-app panic button powered by AURA, R19.90 per member per month after 3 free months, **paid by the customer** (2022 press; **2026 status unconfirmed**) | The price anchor VUKA uses |
| **Capitec** | Real-time payment risk warnings; a branch-only hidden account; a "trusted approver" (sources conflict on whether it is in development or rolling out). Its CIO argues **a duress PIN makes clients less safe** once criminals know it exists (blog, 1 Aug 2026) | The strongest counter-argument to VUKA's design. It goes in both pitches (§8) |
| **Standard Bank, Absa** | Payments to new beneficiaries held for 2 hours (Standard Bank), or 1 hour for the first two payments (Absa) | Banks already accept a short hold as normal |
| **Valor** (third party) | A voice-activated panic app that claims to alert users' bank fraud desks, with unnamed partner banks (Engineering News, Mar 2025) | **The closest direct competitor** found |

**The gap a covert signal could fill, in one public case:** a kidnapped client lost **R103,092**. The bank's fraud system flagged the payments and **called the client, who confirmed them under duress**. The ombud found the bank not negligent, and the bank paid part of the loss as goodwill (Business Report, 18 Mar 2025). A signal sent earlier through a separate, covert channel would give the fraud team something to weigh against that "yes".

### 3.3 How insurers and platforms already buy safety

| Who | Product | Paid how |
|---|---|---|
| **iTOO Special Risks** (underwritten by Hollard) | [My]Cylution personal cyber cover, with express kidnapping in the higher tiers. **Prices conflict:** "from R22.50/month" on a page about three years old, R85–R325/month on a broker page | A priced policy. **The only insurer found selling retail express-kidnapping and theft-of-funds cover**, so the natural first fit for claim verification |
| **OUTsurance** | Help@OUT panic assistance, powered by AURA | Free to policyholders |
| **Momentum Insure** | Safety Alert panic button | Free to car and home policyholders |
| **Discovery Insure** | Discovery 911 (AURA for security, Netcare911 for medical), launched Jun 2026 | A priced add-on (R55–R140/month in one extract; re-check) |
| **King Price** | "code red" in-app panic button, with Secura | A nominal monthly fee |
| **AURA** | The armed-response layer behind many of these. Sold per user per month through banks, insurers and apps, by API inside the partner's app or as a white label (company claims) | B2B2C |

**Five payment patterns are in use:**
- the customer pays through the bank;
- the insurer absorbs it as a value-add;
- the insurer sells an add-on;
- the platform absorbs it (Uber, Bolt);
- a sponsor funds a non-profit.

AURA is the shared response layer. **VUKA does not dispatch anyone** (§2), so it is not a second response network. Whether it could ever hand off to one is decision D11 (§5).

## 4 · Who inside the institution buys

All `ASSUMPTION` until a conversation confirms it. Each meeting should replace a guess with a team name and a date.

| Team | What VUKA gives them | First question they'll ask |
|---|---|---|
| **Fraud and financial crime** (bank) | A signed early signal during an open incident (N1) | "How many false signals per thousand customers?" (not measured: [`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md)) |
| **Digital channels** (bank app) | VIGIL inside their app (N2) | "What does it do to battery and to app-store review?" |
| **Claims and special investigations** (insurer) | A record made at the time, which their investigator can check without trusting us (N3, I1) | "Does a missing record count against a claimant?" Never (G38) |
| **Product** (insurer) | A safety benefit to bundle (I2) | "What does it cost per policy, and does it lower claims?" The actuary test: the insurer must save at least 12 × the monthly price per member per year |
| **Enterprise development** | A door to the right business owner, not a buyer | "Who should you meet?" |

## 5 · The offers

Each offer is a separate product decision. **D3** in the README picks which to lead with.

**To Nedbank:**
- **N1. The risk signal into fraud operations, starting observe-only.** *Recommended first ask.*
  - A signed webhook (ADR-0037 `BankSignal`) with a pseudonymous partner reference and the trigger (`duress_signal`, `no_answer` or `contact_lost`).
  - Nedbank's own people and rules decide what happens, and the signal never causes an action on its own.
  - **Partner terms, from ADR-0037:** no call or message to the member that mentions the signal while an incident is open; holds use routine wording ("payment scheduled", a new-beneficiary hold); the release instruction is shown only after safety. In the ombud case above, the bank phoned the client while the client was being held. A call about a VUKA signal could put a captive member in danger.
  - Lead with the ombud case in §3.2.
- **N2. VIGIL as a value-added service in the Money app**, on the GuardMe model. A white-label build or deep link first, an SDK later, priced against R19.90.
- **N3. ANCHOR records for disputes and ombud complaints**, with the member's consent. The disputes team checks *when* a signal existed and that it hasn't changed, never *what* happened. The absence of a record is never evidence against a customer.

**To an insurer** (start with iTOO/Hollard):
- **I1. Claim verification** for theft-of-funds and express-kidnapping claims. Measure investigation time and claims touched.
- **I2. VIGIL bundled with cover** as a value-add, priced per policy.

**Industry bodies alongside this track:** SABRIC (banking crime) and Business Against Crime South Africa. See [`02-SAPS-AND-NGOS.md`](02-SAPS-AND-NGOS.md) §3.

**Not offered without a new decision (D11): a hand-off to armed response.** OUTsurance, Momentum, King Price and Discovery already pay AURA or Secura to send armed response from a panic button. Feeding VIGIL's duress PIN or missed check-in into that dispatch **contradicts accepted ADR-0036(1)** (escalation to guardians only) and `RULES.md` (no autonomous dispatch). It also brings private-security regulation (PSiRA) back in. And it is a safety risk: armed response arriving at a hostage scene, set off by a false `no_answer`. False check-ins run at 1.8–16.5 per hour on a dense lab proxy (`docs/eval/cem1-measurements.md`). If the founders want it, it needs a superseding ADR, a PSiRA review and a safety review first. At most, a responder would be an **opt-in contact the member chooses, treated like a guardian**, never dispatched from detection or `no_answer` alone.

**Hard parts, stated:**
- An always-listening microphone inside a bank's app is a new review for the bank's app-store listing and for customer comfort.
- One codebase first: VUKA has two app codebases today (D5).
- Duress parity must hold inside someone else's app. The partner's analytics must never log which PIN was used.
- The bank must map our member to its customer without VUKA holding banking data.
- If Cybercrimes Act s54 is in force (sources up to 2024 say it isn't; check the Gazette), the bank's own reporting duty is separate, and our signal is not that report.

## 6 · How the money works, and the first pilot

| Line | Today | Proposed |
|---|---|---|
| Per member per month | R20, `ASSUMPTION`, not validated with any buyer | The opening number; the pilot tests it |
| Integration or set-up fee | none | **Add one** (`PROPOSED`, unpriced). Enterprise integrations carry a set-up fee for the engineering above |
| Per verification | R15 per case, `PROPOSED` | Price separately. At R15 the war-room model needs **10,446 cases a month** to cover fixed costs (`ESTIMATE`), so it is never the model on its own |

**Bank first or insurer first (D3).** Bank first suits N1 and N2, and the bank feels the coerced transfer directly. Insurer first suits I1, with a clean actuary story. Recommendation: **open both conversations, and build for whichever signs a pilot letter first.**

**Pilot shape** (`PROPOSED`; planning figures, not commitments):

| Phase | Length | What happens |
|---|---|---|
| **0 · Paperwork** | about 6 weeks | Close the vendor gate (§7). Write the interface specification from the `BankSignal` contract, including the ADR-0037 partner terms |
| **1 · Observe-only** | 90 days | Up to about **300 consenting staff or volunteers**. Signals go to a named fraud-operations queue, and the partner takes **no automatic action** |
| **2 · Live input** | 9–12 months | Up to **5,000** consenting members. The signal becomes a live risk input, and the partner decides any hold. For an insurer, measure claims touched and investigation time |

In Phase 1, measure:
- false check-ins per member per week;
- p95 alert delivery;
- the stand-down rate;
- fraud-operations minutes per signal;
- a member-comfort survey.

**Terms:**
- a paid pilot or a set-up fee;
- exit thresholds agreed with the partner;
- deletion of the partner's members' data on exit;
- no detection-accuracy claim without a method and n.

**Timeline note:** the financial model assumes 5,000 *paying* members from May 2027 (`scripts/build_financial_model.py`). With a first meeting in Dec 2026 and the phases above, that is optimistic. D2 should use a later date.

## 7 · The vendor gate: what a bank or insurer will check

**The rules they work under** (`REPORTED`, via search extracts; verify before quoting):

| Instrument | What it means for VUKA |
|---|---|
| **Joint Standard 1 of 2023**, IT governance and risk management (FSCA and Prudential Authority); effective 15 Nov 2024 | Vendors are pulled into the bank's or insurer's IT-risk framework |
| **Joint Standard 2 of 2024**, cybersecurity and cyber resilience; effective 1 Jun 2025 | Third parties get the same monitoring and access limits as staff; contracts define security roles; data is returned or deleted at the end; penetration testing |
| **Joint Communication 5 of 2026**, the incident-notification template; effective 1 Sep 2026 | The partner's first notice to its regulators is due **within 24 hours** of classifying a material incident. VUKA must tell the partner well inside that ([`04-SLA.md`](04-SLA.md), S9) |
| **Guidance Note G5/2014** (bank outsourcing); **Directive D3/2018 and G5/2018** (cloud and offshoring of data, banks); **Joint Communication 2 of 2025** (cloud and offshoring, all institutions) | Offshore data needs justification, regulator access and an exit plan |
| **Joint Standard 1 of 2024**, outsourcing by insurers; commenced 1 Dec 2024 | Material outsourcing needs due diligence and notice to both regulators |
| **POPIA:** s21, a written operator contract is mandatory (the Regulator found against Dis-Chem for lacking one); s72, cross-border transfers; s57, prior authorisation ([`03-DISTRESS-SIGNALS.md`](03-DISTRESS-SIGNALS.md) §3.2); s71, automated decisions | Each needs counsel before partner data flows |

**Typical due diligence:**
- a security questionnaire;
- ISO 27001, or a SOC 2 report;
- recent penetration-test results;
- a business continuity and disaster recovery plan;
- incident-notification SLAs;
- a list of our own sub-processors.

**Where VUKA stands:**

| Item | State | Owner |
|---|---|---|
| Server of record under the company's control | **No** ([`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §0) | Sibusiso |
| Independent penetration test | Not done (G8) | both founders |
| POPIA Information Officer registration | Prepared, not submitted | the company |
| Operator agreement (s21) and data-processing terms | Not drafted | counsel |
| Data residency (s72, D3/2018) | Data was last known to be in Azure UAE North (Sep 2026). Its state since the subscription was disabled on 15 Oct is unknown. The 15 Oct demo ran the server on a presenter's PC. Both need a documented position; the privacy notice still says South Africa North | Sibusiso |
| SLA with measured uptime | Targets proposed; probe written; no baseline | Sibusiso |
| Running code on `main` | Not yet (D4) | both |
| Accounts and IP held by the company | No (D10) | both |

## 8 · What we say, and what we don't

**Say:**
- "We are preparing a pilot proposal for insurers and banks."
- "The bank signal is written and tested against a simulated bank on a development branch. It isn't on our main code line or deployed yet."
- "Discovery Bank's panic code shows banks want this inside their app. VUKA is designed to work with any bank that accepts its signal (today the bank side is simulated), to notice when you can't type, and to leave a record a stranger can check."

**Answer the counter-argument head-on.** Capitec's CIO is right that an attacker can demand a publicised duress PIN. Our answer:
- The two PINs are *designed* to look identical on the phone.
- The bank's response uses delays criminals already expect.
- A missed check-in and a wrong PIN also alert guardians, so the PIN isn't the only route.

We haven't yet tested that an attacker can't tell the PINs apart. We are fixing two prompts where the duress PIN doesn't yet raise the alarm (D6). And we will test the argument with GBV organisations rather than assume it away.

**Don't say:**
- "partnering with Nedbank";
- "in talks with", before a meeting has happened and is recorded;
- any partner logo, without written permission;
- "integrated with" any real bank;
- any accuracy figure without its method and n;
- anything implying a VUKA record proves duress, or that a missing record counts against anyone.
