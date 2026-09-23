# PSiRA Position Paper — what VUKA may lawfully do, and who must be registered

> Serves **C2, C3** — `docs/CHECKLIST.md` `P2.1` (due 16 Sep, owner Ipeleng). Closes the documentation half of `docs/OPEN-GAPS.md` **G19**.
>
> **Status: team position, not legal advice.** `docs/PLAN.md` §C1 already records the bottom line: this structure *needs an attorney's opinion before final go-to-market messaging*. This paper organises the statutory analysis, states the position we will operate under until counsel says otherwise, and lists the exact questions counsel must answer. Statutory wording below is paraphrased from the team's recorded research and marked ⚑ where the consolidated text must be verified — primary sources were unreachable from this working environment on 15 Sep 2026 (SAFLII HTTP 403; psira.co.za unreachable; gov.za attachment 404) — see §9.

---

## 1 · The question, stated honestly

The business docs answer the PSiRA question today with one line: *"we integrate with armed response, we do not dispatch"* (`docs/08-BUSINESS.md` §3, now superseded — this paper replaces it). `docs/PLAN.md` §C1 already called that **probably insufficient**, and it is. The question the Act actually asks is not *"do we send armed vehicles?"* It is:

> **Are we rendering a "security service" as defined in s1 of the Private Security Industry Regulation Act 56 of 2001?**

If yes, s20(1)(a) prohibits rendering it unregistered — whatever the technology stack is made of. Dispatch is one activity in the definition; it is not the definition.

---

## 2 · The statutory hook

Private Security Industry Regulation Act 56 of 2001 (as amended, consolidated to 9 Aug 2015 — SAFLII). The provisions that decide our case:

| Provision | What it says (paraphrased from recorded research) | Consequence for VUKA |
|---|---|---|
| **s1 "security service"** | An enumerated list of activities, including **installing or servicing security equipment** and **monitoring signals from electronic security equipment**. "Security equipment" **expressly includes alarms and CCTV** | KHAYA is the former. UMOJA is the latter. Both are in the definition's ordinary reach |
| **s1 "security equipment"** | Equipment designed or adapted for detection/prevention of offences; expressly covers alarms and CCTV | KHAYA (YOLOv8 vision + YAMNet acoustic + siren/floodlight appliance) is squarely security equipment |
| **s1 "security service provider"** | Defined to **include a person who is not registered** — and, per the recorded research, one who holds themselves out as rendering such a service | Being unregistered is not a carve-out. It is the offence condition |
| **s20(1)(a)** | Blanket prohibition: no person may render a security service unless registered with the Authority | **No SaaS exemption. No "software only" proviso. No platform carve-out.** |
| **s38** | Penalty: first conviction carries up to **5 years** imprisonment (and/or fine) | This is not a compliance-line item. It is the build/operate gate |

**The limb counsel must verify first ⚑.** The 2014 Amendment Act (18 of 2014) is recorded as having **widened** s1 to also catch *manufacturing, importing, supplying or exporting of security equipment*. If that reading of the consolidated text holds, then **"VUKA is merely the technology supplier" is not automatically an exit** — manufacturing and supplying KHAYA may itself be an enumerated security-service activity, requiring registration in its own right even under the partner-of-record structure in §4.4. This is the difference between a contract fix and a registration obligation. Verify against the Act text before anything else (§9).

---

## 3 · Layer-by-layer application

Applying s1 to each of the four layers (`docs/00-SPEC.md` §3) plus the human gate:

| Layer | What it does | s1 limb it touches | Exposure reading |
|---|---|---|---|
| **KHAYA** (the property) | Edge appliance: YOLOv8 person/vehicle/weapon classification, YAMNet acoustic gate, siren/floodlight deterrent with human confirm + cancel window, tamper + signed heartbeat | **Installing or servicing security equipment** — a CCTV/alarm-class device deployed at premises | **In scope.** Deployment, commissioning, repair and firmware maintenance are all "servicing". Someone registered must perform them |
| **UMOJA** (the street) | Ingests signed sightings from KHAYA/VIGIL; entity resolution, suspicion scoring, risk layer, **human verification gate**, notification | **Monitoring signals from electronic security equipment** — a server collecting detection signals and presenting them to operators for verification performs the function of a control room, whatever it is called | **In scope.** "We are software" does not answer s20(1)(a); PSiRA's consumer notice identifies electronic security/monitoring services within scope (`docs/audit/02-economics.md`) |
| **VIGIL** (the person) | On-device sensing, duress credential, offline queue — an app the member installs themselves | Not equipment installed or serviced by VUKA; sensing sits upstream of the monitored service | **Probably out of scope on its own ⚑** — but duress events flow into UMOJA, so if UMOJA's monitoring is in scope, the service it feeds is regulated regardless |
| **ANCHOR** (the record) | Hash chain, OpenTimestamps publication | None — record-keeping, not a security activity | **Out of scope** |
| **The flag gate** (UMOJA operators) | `verify_concern` / `dismiss` / two-signature whitelist (`docs/OPERATOR-DUTY.md`) | Monitoring includes the human verification step; the operators performing it render part of the service | **The operator question is §4.3** |

The honest summary: **two of VUKA's four layers sit within the definition's ordinary reach — and they are the commercially load-bearing ones.** A structure that only protects the armed-response leg does not protect the platform.

---

## 4 · The position — the four answers `P2.1` asks for

### 4.1 Trigger — when does this bite?

The obligation attaches to **rendering, not to revenue or scale**. On the current channel plan (`docs/08-BUSINESS.md` §4, Phase 1 "Prove": 20–50 honest installations through GKSS chapters and our own street), **VUKA itself installs KHAYA and itself operates UMOJA's verification loop — the trigger is already pulled by the pilot as planned.** The partner-of-record structure does not remove the trigger; it relocates *who renders*. Until a partner is signed, **VUKA is the renderer** and must either register or not yet operate.

### 4.2 Registration category

**Position:** registration is required in the PSiRA business category covering **electronic security monitoring**, and separately in the category covering **installation/servicing of security equipment** — both for the partner of record (Variants 1–2) and for VUKA in the pilot fallback.

- The **exact category identifiers and current fee schedule** must come from PSiRA's registration regulations — not guessed here ⚑.
- Order of magnitude from the recorded research (`docs/PLAN.md` §C1 ⚑): **~R7,900 business registration · ~R250 individual**. **The cost is process and time, not money.**
- Practical gate: registration and vetting are **not instant**. The pilot start date must include registration lead time. *"Register when we find a partner"* is a calendar risk, not a budget line.

### 4.3 Do individual flag-gate reviewers need registration?

**Position: assume yes until counsel says no.** Reviewers who `verify_concern` or `dismiss` are performing part of a monitoring security service. Operating position:

1. **Partner runs the gate** (Variant 1) — its control-room staff are the partner's regulated workforce under its PSiRA registration; VUKA supplies the duty card and training material only (`docs/OPERATOR-DUTY.md`, `docs/OPERATOR-TRAINING-CHECKLIST.md`).
2. **VUKA staff operate the gate** (pilot, or Variant 2) — each reviewer holds **individual registration** (≈R250 ⚑) and, if PSiRA prescribes a grade or training standard for monitoring work, that too, **before touching a live queue**. Cost is trivial; process is the cost.
3. **Build consequence (proposed, not yet an ADR):** `server/src/auth/operators` onboarding should capture each operator's **PSiRA individual registration number, grade and expiry** as activation fields — the way `docs/MODEL-LICENCES.md` gates model weights. An unregistered reviewer is a refused privileged action — evidence, not an error to swallow. Until that exists, the honest status is: **no live queue; pilot blocked at G-gate.**

This also lands the escalation row in `docs/OPERATOR-DUTY.md` §Escalation: the PSiRA-registered company is the party rendering the service; VUKA is their technology supplier and the record.

### 4.4 The contracting structure — partner of record

The structure (from `docs/PLAN.md` §C1, aligned with the *"sell **through** security companies, not against them"* channel call, `docs/08-BUSINESS.md` §4):

> **The PSiRA-registered security company is the party legally rendering the monitoring and flag service. VUKA is its licensed technology supplier.**

| | Variant 1 — partner operates the gate | Variant 2 — VUKA operates under delegation | Fallback — VUKA registers itself |
|---|---|---|---|
| **Who is registered** | Partner (monitoring + response + install categories) | Partner **plus** VUKA staff individually registered | VUKA (monitoring category; install category too if it touches hardware) |
| **Who touches KHAYA hardware** | Partner's installers; VUKA as supplier ⚑ (§2 caveat — supply may itself be in scope) | Settled in the agreement | VUKA installers, registered |
| **Who runs the flag gate** | Partner control room, under `OPERATOR-DUTY.md` | VUKA operators, under a **written delegated-authority agreement** ⚑ Q5 | VUKA operators, individually registered |
| **Use when** | Channel Phase 2+ (one mid-size security company) | Only if counsel approves the delegation model | Channel Phase 1 (pilot — no partner signed yet) |
| **Risk** | Lowest; VUKA cedes the customer relationship | Medium; lawfulness of delegation is an open question | Full control; VUKA carries the compliance load |

**The fallback is the default until a partner exists.** Channel Phase 1 has no partner. So either VUKA registers for the pilot, or Phase 1 shrinks to unmonitored deployments (local deterrent only; no UMOJA verification loop rendered to others). That is a business decision to take knowingly — not to discover later.

---

## 5 · What the contract must say

The VUKA↔security-company technology-supply agreement is a compliance instrument, not only a commercial one. Minimum clauses:

1. **Provider-of-record warranty.** The partner warrants current PSiRA registration covering the categories in §4.2, warrants it stays valid for the term, and supplies its registration certificate and number — which appears in member-facing materials per PSiRA consumer-notice practice.
2. **Rendering boundary.** The agreement states the partner renders the security service and VUKA supplies technology; VUKA's marketing never claims VUKA provides the monitoring or response service. The honesty ledger applies to regulatory claims too (`docs/00-SPEC.md` §5).
3. **Data rules as operational clauses.** The POPIA roles flow through the same agreement: the partner as the party receiving verified alerts, VUKA as the platform. `P2.2`–`P2.4` define the responsible-party split; this contract must not contradict the discard-by-default boundary.
4. **Sub-delegation terms** (Variant 2 only): written delegation of the gate function, the VUKA operator roster disclosed to the partner, and the partner's supervisory duty stated.
5. **Escalation and inquiry routing.** Matches `docs/OPERATOR-DUTY.md` §Escalation: regulator and law-enforcement contact lands with the registered party; VUKA supplies the anchored evidence chain per the subject-access contract.
6. **Audit and evidence.** The partner accepts the evidence chain (sightings → verification → notification → anchor) as the shared service record; neither party edits history — that is ADR-0002's human-gate premise made contractual.

---

## 6 · Direction of travel — assume the gap narrows, not widens

- **PSiRA's 2022 research** (recorded in `docs/PLAN.md` §C1 ⚑ — obtain the document for the counsel pack, Q6) argues for a **wider** remit over technology providers, not a narrower one. Our structure must not depend on the gap staying open.
- **PSiRA's consumer information notice** identifies electronic security/monitoring services within its regulation (`docs/audit/02-economics.md` carries the link).
- The **Information Regulator's draft Code of Conduct for Gated Access Areas** (G21, `P2.6`) already reaches **owners *and their technology service providers*** at gated premises. Two regulators converging on technology providers is the pattern; "software only" is a shrinking hiding place.

---

## 7 · Open questions for counsel

| # | Question | Why it matters | Evidence needed |
|---|---|---|---|
| Q1 | Quote s1 against the consolidated Act: is *manufacturing, importing, supplying or exporting of security equipment* an enumerated security-service activity post-2014? | Decides whether VUKA-as-supplier needs its own registration **even under Variant 1** | Consolidated Act text (§9 access note) |
| Q2 | Does "monitoring signals" extend to a server + browser verification gate — no classic control room? | Decides whether UMOJA-as-operated is itself a rendering | Act text + consumer notice + counsel opinion |
| Q3 | Which registration categories and current fees apply to (a) monitoring, (b) install/servicing, (c) equipment supply — and what is the processing time? | The pilot calendar and the compliance budget | PSiRA registration regulations + current fee schedule |
| Q4 | Must individual gate reviewers register, and at what grade or training standard? | The operator-activation build in §4.3 | Counsel opinion + PSiRA individual-registration rules |
| Q5 | Is Variant 2 (VUKA operators under written delegation from a registered partner) lawful? | Decides the pilot staffing model | Counsel opinion |
| Q6 | Obtain and file PSiRA's 2022 research document; is a bill or amendment in progress that would catch UMOJA outright? | Direction of travel; go-to-market messaging | The document itself + counsel's legislative tracking |
| Q7 | Does the insurer-bundle channel (Phase 3) change the provider of record? | Phase 3 marketing claims | Counsel opinion |
| Q8 | Confirm the ~R7,900 / ~R250 figures and any renewal obligations | Replace the ⚑ marks in this paper | PSiRA fee schedule |

---

## 8 · Consequences downstream

- **`P2.2`/`P2.3`/`P2.4` (POPIA):** the responsible-party split between VUKA and the partner is set by this paper's contracting structure — the POPIA paper and the discard-by-default ADR must name the same provider of record.
- **`P2.5` (Information Officer):** VUKA registers as IO regardless of variant; the partner is separately accountable for its own processing.
- **`P2.6` (Gated Access Code):** the draft Code's "technology service provider" limb covers us whatever the PSiRA answer is — compliance with it is not conditional on the partner structure.
- **`docs/01-ARCHITECTURE.md` regulatory table** ("PSiRA … may apply to us depending on the service model — to be confirmed before commercial pilot") remains accurate; this paper is the confirmation path.

---

## 9 · Provenance and verification log

- **Recorded team research this paper builds on:** `docs/PLAN.md` §C1; `docs/OPEN-GAPS.md` G19; `docs/audit/02-economics.md` (PSiRA consumer-notice citation and CPA cross-check).
- **Primary-source access on 15 Sep 2026:** SAFLII consolidated Act (HTTP 403), psira.co.za (unreachable), gov.za attachment (404), search engines (bot-walled). **No statutory wording in this paper should be quoted to a third party until Q1–Q3 are verified against the Act text.**
- **This paper is not legal advice** and creates no compliance claim. The honesty ledger (`docs/00-SPEC.md` §5) applies: until counsel reports, the only honest public claim is *"structure proposed, registration questions open, live monitoring blocked at G-gate until answered."*
- **Authored:** 15 Sep 2026 — Ipeleng (via Cline assistant), for `docs/CHECKLIST.md` `P2.1`. Reviewed by: pending Lethabo, then both leads.