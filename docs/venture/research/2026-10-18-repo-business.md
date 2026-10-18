# VUKA business model and figures as of 18 Oct 2026 (read-only audit)

**Scope and method.** I checked out nothing, edited nothing and committed nothing. I read `origin/main` (= HEAD `1aa8830`) and fetched 4 unmerged branches as remote-tracking refs, then read them with `git show`. I ran:
- `python3 scripts/economics_vigil_anchor.py` (main).
- `scripts/build_financial_model.py` from a scratchpad copy, so the xlsx was written to `<session-scratchpad>/fm/docs/finance/VUKA-financial-model.xlsx` and not into the repo. openpyxl 3.1.5 was already installed.
- Each branch's economics script, from scratchpad copies.

I printed no secrets. **Note:** three untracked files appeared in the working tree at 12:56:41 UTC during this run: `.github/workflows/sla-probe.yml`, `scripts/sla/` and `test/sla-probe.test.mjs`. Concurrent work created them, not this audit, and I left them untouched.

**Three models are in circulation:**
1. **Main** (merged). Break-even **10,901**.
2. **`docs/babatunde-war-room-and-access-model`** (unmerged, 26 Sep). Break-even **10,973** and the **R1,884,583** ask. Sibusiso's 7 Oct handover says the Caplia/Figma deck and the financial model use this one (`docs/SIBUSISO-HANDOVER.md:473-475`).
3. **`docs/babatunde-canvas-and-deck`** (unmerged, 24–26 Sep). Working price R50, break-even 3,774 at R50, "R2M seed". The 26 Sep R20 decision superseded its price.

**The deck number (10,973) is not on main.** Main's `docs/MASTER-CONTEXT.md:130` and `docs/NEW-CHAT-HANDOVER.md:49` still say 10,901.

---

## (a) The model today

### a.1 Who pays

| Item | Main | War-room branch (deck basis) | Tag |
|---|---|---|---|
| End user | "The app is free to users" (`docs/ECONOMICS-VIGIL-ANCHOR.md:15`). This wording is banned by `docs/PRICING-WORKING.md:14` and `docs/MARKET-DATA.md:81`. Use "free to the uninsured; funded through the insurer's premium for policyholders" | "The victim pays nothing" (`origin/docs/babatunde-war-room-and-access-model:docs/WAR-ROOM-PITCH.md:45`) | PROPOSED |
| Volume payer | A partner, **bank or insurer**, pays **~R20 per member per month** as a value-added benefit (`docs/ECONOMICS-VIGIL-ANCHOR.md:16`; `docs/MASTER-CONTEXT.md:129`) | The **insurer** pays **R20/member/month**, single tier, "DECIDED 26 Sep 2026… R20 is final" (`origin/docs/babatunde-war-room-and-access-model:docs/PRICING-WORKING.md:17`) | ASSUMPTION (willingness to pay unvalidated; no partner signed — `scripts/economics_vigil_anchor.py:26`) |
| Evidence payer | A per-record fee when an evidence pack is pulled, unpriced (`docs/ECONOMICS-VIGIL-ANCHOR.md:17`) | The **bank pays R15 per case** (`…WAR-ROOM-PITCH.md:56`). Lethabo's revision says "per case" aloud and calls it "our proposal" (`origin/lethabo/war-room-mentor-refinements:docs/WAR-ROOM-PITCH.md:87,195`) | PROPOSED |
| Price anchors | FNB GuardMe R19.90/mo (press, Apr 2022, re-check); iTOO [My]Cylution from R22.50/mo (`docs/EVIDENCE.md:23-24`) | same | FACT (GuardMe is a dated press figure ⚑) |

Main's own SA-ANCHOR doc still lists **five B2B revenue lines** (§a.6). The Lean Canvas R299/R99/R35/R40 model is stale and must not be quoted (`docs/LEAN-CANVAS.md:3`).

### a.2 Unit costs and margin

| Figure | Main | War-room branch | Tag / source |
|---|---:|---:|---|
| Variable cost /member/month (cloud R0.15 + support R5.00 + compliance R0.57) | R5.72 | R5.72 | ESTIMATE (`scripts/economics_vigil_anchor.py:15-17`). The branch says support is a *step* cost and compliance is a *fixed* cost allocated per member |
| Contribution /member/month at R20 | R14.28 | R14.28 | ESTIMATE |
| Contribution margin at R20 | 71.4% | 71.4% | ESTIMATE (script output) |
| Fixed cost /month | **R155,659.47** = R155,090 lump (5 × R30,000 stipends + R5,090 "tools/hosting/insurance") + anchoring ceiling R569.47 | **R156,683.98**, itemised: stipends 150,000; Azure App 153.81; Postgres 194.49; anchoring 569.47; cyber 450; PI 217.92; accountant 4,400; tools 648.30; CIPC 50 | ESTIMATE; stipends ASSUMPTION. The branch tags the other lines FACT, but `docs/MARKET-DATA.md:5` says §4 rows lack URL/date and must be read as ⚑ secondary |
| Product-only fixed (no stipends) | — | R6,683.98, break-even **469** | ESTIMATE (branch script output) |
| Anchoring, whole network | hourly R9.34 + immediate cap R560.13 = **ceiling R569.47/mo**; ~R259.32 immediate at 10k members | same | ESTIMATE ($0.0008/msg FACT × USD/ZAR 16.2075 on 22 Sep 2026) |

### a.3 Break-even and margins at R20

| Figure | Main (script printed today) | War-room branch (script printed today) |
|---|---:|---:|
| Break-even at R20 (rounded up) | **10,901** | **10,973** |
| …at R10 / R15 / R19.90 / R22.50 / R25 | 36,370 / 16,774 / 10,978 / 9,277 / 8,074 | 36,609 / 16,885 / 11,050 / 9,338 / 8,127 |
| …at R50 / R100 | 3,516 / 1,652 | not printed |
| Break-even at R20 with 7 stipends | — | 15,174 |
| Operating margin at 10k / 25k / 50k / 100k | −6.4% / 40.3% / 55.8% / 63.6% | −6.9% / 40.1% / 55.7% / 63.6% |
| Annual operating profit at 25k / 50k / 100k | R2.42m / R6.70m / R15.27m | R2.40m / R6.69m / R15.26m |
| Monthly position at 5k / 10k / 25k | — | −R85,284 / −R13,884 / +R200,316 |
| Cases at R15 to cover fixed cost alone | 10,378/month | 10,446/month |
| Actuary test (the insurer must save ≥ 12 × price) | r* = 12p/c | R240/member/year |
| Bass reference, 1M-customer channel | 1% in ~3.8 mo; break-even (1.09%) ~4.1 mo; 5% ~15.9 mo; 10% ~27.0 mo | same (1.1%) |

All of these are ESTIMATE. The channel size is ASSUMPTION. The Bass parameters are FACT, but they are a durables-era reference, not a forecast.

### a.4 Funding ask (branch only; main has none)

**R1,884,583 for the first 12 months** (ESTIMATE; team size ASSUMPTION). Source: `origin/docs/babatunde-war-room-and-access-model:docs/ECONOMICS-VIGIL-ANCHOR.md:63`, `docs/POTENTIAL-QUESTIONS.md:59` and `docs/WAR-ROOM-PITCH.md:99-100`. Commit `605c5bf`, 26 Sep 22:43.

| Use of funds | Amount | Share | Tag |
|---|---:|---:|---|
| 5-person team at R30,000/month × 12 | R1,800,000 | 95.5% | ASSUMPTION |
| Product/ledger, "12 × R6,743.14" | R80,917.68 | 4.3% | ESTIMATE |
| One-off: PI year 1 R2,615 + cyber first month R450 + CIPC R600 | R3,665 | 0.2% | FACT-derived |
| Legal counsel (POPIA/ECTA/blockchain) and Hedera mainnet HBAR float | unpriced, "inside the contingency" | — | quote needed |

Spoken in the pitch as "the one point nine million rand pilot" (`…WAR-ROOM-PITCH.md:45`). It is absent from Lethabo's branch, which predates `605c5bf`.

**Arithmetic defects in the ask (ESTIMATE, my calculation):**
- The branch script prints product-only fixed cost of **R6,683.98**, not R6,743.14. 12 × 6,683.98 = R80,207.76, so **R709.92 a year has no explanation**.
- The R3,665 one-off repeats PI, cyber and CIPC, which are already in the monthly fixed cost (PI R217.92/mo, cyber R450/mo, CIPC R50/mo). That is a double count in a cash model.
- No contingency line exists; the three components sum exactly to the ask.
- Rebuilt from the script, the ask is R1,883,872.76.

### a.5 Runway (`scripts/build_financial_model.py`)

Printed line: `break-even 10973 | lowest cash -114328 | negative from Apr 2028 | first positive Jun 2028`. This matches the handover (`docs/SIBUSISO-HANDOVER.md:475`).

**Inputs:**
- Start Nov 2026 (ASSUMPTION).
- Opening cash R0, tagged FACT ("no funds raised", `build_financial_model.py:20`).
- R1,884,583 arrives in month 1 (ASSUMPTION).
- 5,000 paying members from May 2027 (ASSUMPTION).
- Linear ramp to 50,000 by Apr 2029 (ASSUMPTION).
- Bank per-case revenue set to 0.
- VAT and tax excluded.
- Fixed cost R156,683.99 (lines 12-23).

**Outputs (ESTIMATE):**
- Peak burn R160,349 in month 1.
- Burn of R85,284/month during the pilot.
- Cash goes negative in **Apr 2028 (month 18)**, lowest **−R114,328 in May 2028**.
- First net-positive month **Jun 2028**.
- Cash of R6.41m by Oct 2029.

**Runway:**
- With no revenue, the ask covers **12.0 months** of costs.
- With the modelled pilot revenue, it covers **17 months** (to Mar 2028).
- An ask of roughly **R1.999m** would keep cash at zero or above in this model (ESTIMATE).

The model also names the company: "PILOT CORE (Pty) Ltd (Reg. 2026/122060/07)… Founders and directors: Sibusiso Khumalo, Lethabo Hoaeane (50/50)" (`build_financial_model.py:61`). That is the founders' own record; I did not check it against CIPC. Yet the model still carries **5 stipends**. Illustratively (ESTIMATE, not in the repo), 2 founders at R30,000 gives fixed cost of R66,683.98 and break-even of **4,670**; 3 stipends gives 6,771.

### a.6 Other numbers on branches

**Canvas branch** (`origin/docs/babatunde-canvas-and-deck:docs/BUSINESS-CANVAS.md`, `docs/PITCH-DECK-STRUCTURE.md`, script v2). It carries the same script as `docs/babatunde-economics-v2`.
- Price: insurer R50 "working number, undecided" (ASSUMPTION); bank R15/case (PROPOSED).
- Cost model v2: variable cost R0.15; support as a step cost; fixed cost R160,088.64.
- Break-even: R50 → 3,774 (5 stipends) / 5,503 (7) / 4,342 including VAT. R20 → 11,995.
- Profit: R3.42M a year at 10k members; margin 57.1% at 10k and 86.4% at 100k.
- Funding: **R2M seed** (ASSUMPTION, unsourced), from **TIA up to R1.2M + angel R800k** (ASSUMPTION ⚑, unsourced).
- Pilot: one insurer, 5,000 members, 12 months; it scales if claims fall by ≥10%.

**Main SA-ANCHOR pack** (`docs/SA-ANCHOR-SCALE-SECURITY-BUSINESS.md:134-177`). It lists five unpriced revenue hypotheses:
- A. Security-company accountability licence.
- B. Insurer claim-proof API or enterprise integration fee.
- C. Estate governance subscription.
- D. Bank coerced-transfer evidence API or case fee. The doc calls this "a later partnership experiment, not near-term revenue".
- E. Third-party proof infrastructure.

It adds a commercial proof plan: interview an estate, a PSiRA operator and an insurer claims manager; run a 30-day shadow pilot; price below the measured dispute-handling saving.

### a.7 TAM/SAM/SOM, go-to-market and pipeline

- **TAM/SAM/SOM.** The only definitions are qualitative and tagged ASSUMPTION "needs sources" (`origin/docs/babatunde-canvas-and-deck:docs/BUSINESS-CANVAS.md:87-89`):
  - TAM: all SA short-term policyholders + all SA retail-banking customers.
  - SAM: mid-to-high-value policyholders with mobile banking at the three target insurers.
  - SOM: one insurer pilot at 5,000, scaling to 50,000 over 24 months.
  - `docs/EVIDENCE-VERIFICATION.md` on that branch marks them **N — not verified**.
  - **No numeric TAM/SAM/SOM exists anywhere in the repo.** Any numbers on the Figma "Market" slide (`docs/SIBUSISO-HANDOVER.md:473`) have no repo source.
- **Go-to-market** (canvas Block 7). Insurer bundling comes first. Then a direct Play Store app as the funnel, a bank partnership as a later phase, and GKSS/Geekulcha for community adoption.
  - Named targets: Santam (>1m policyholders, <24% share — FACT, `docs/EVIDENCE.md:22`); Discovery Insure (runs Vitality Drive); King Price (ASSUMPTION, unsourced); Absa (R129m H1 2026 — FACT ⚑, secondary); Standard Bank.
  - Path to scale: 1 pilot → 5,000 members; 3 insurers → 50,000; Kenya/Nigeria → 500,000+ (ASSUMPTION).
- **Pipeline.**
  - No LOI, interview or partner commitment is recorded. The handover lists "real interviews and LOIs" among the Caplia gaps the repo cannot fill (`docs/SIBUSISO-HANDOVER.md:474`).
  - Caplia readiness was 327/700 on 5 Oct, before the deck changes (REPORTED).
  - The P3.B7 user conversations and the bank/insurer approach are still open (`docs/EVIDENCE.md:80`).

---

## (b) Conflicts between main and the branches

1. **Break-even: 10,901 on main vs 10,973 on the branch.** Same price (R20) and variable cost (R5.72); fixed cost is R1,024.51/month higher on the branch.
   - Main lumps non-stipend operations at R5,090 (business-plan ESTIMATE).
   - The branch itemises them at R6,114.51 from `docs/MARKET-DATA.md` §4. The R4,400 accountant retainer is most of it.
   - R1,024.51 ÷ R14.28 adds about 72 members.
   - Main `docs/MASTER-CONTEXT.md:130,136` calls 10,901 correct. The unmerged branch edit lists 10,901 as a dead number. `docs/NEW-CHAT-HANDOVER.md:49` says 10,901, while the Caplia deck and the financial model say 10,973.
2. **Other break-evens still in circulation:** 11,995 at R20 and 3,774 at R50 (canvas v2, which uses a different cost structure: R0.15 variable plus step support).
3. **Price history:**
   - 23 Sep: R20 starting point (main ECONOMICS).
   - `docs/PRICING-WORKING.md:17` on main still says "Working number: R50… decides by Fri 25 Sep" (stale).
   - Canvas branch: R50.
   - War-room branch, 26 Sep: "R20 final; no R50", because R50 sits above both comparables (`…POTENTIAL-QUESTIONS.md` §1.8).
4. **Who pays:** main says bank *or* insurer pays R20. The war-room branch says the insurer pays R20 and the bank pays per case. `docs/NEW-CHAT-HANDOVER.md:48` says "funded by a bank".
5. **The ask:**
   - R1,884,583 (war-room branch and the financial model).
   - R2M seed via TIA R1.2M + angel R800k (canvas, unsourced).
   - "R1.9 million pilot" (spoken).
   - Absent from main's economics doc and from Lethabo's branch.
6. **Wording:** "Free to users" appears in main ECONOMICS §1 and is banned by main PRICING-WORKING and MARKET-DATA.
7. **Tags that run ahead of the register:**
   - `docs/ECONOMICS-VIGIL-ANCHOR.md` §6 tags 110,074 incidents, 89%/70.5%, and "+80% smartphones after duty on phones under R2,500 removed" as FACT. `docs/EVIDENCE.md:13,26` flags these ⚑ secondary and says the duty threshold is the *export price*, not retail.
   - The branch tags itemised costs FACT, against `docs/MARKET-DATA.md:5`.
   - USD/ZAR is 16.2075 in the script and EVIDENCE, but 16.21 in `MARKET-DATA.md:40`.
8. **Access model inside the war-room branch:**
   - Its pitch Part 2 says the evidence "stays encrypted to a victim-held key; guardians are a blind backup".
   - Its own ADR proposal says the payload key is **server-held** and guardians hold **no copy** (`docs/reviews/ANCHOR-ACCESS-MODEL-ADR-PROPOSAL.md`).
   - Lethabo's revision 2 corrected this.
9. **Product behaviour vs pitch:**
   - ADR-0046 (Proposed, 25 Sep) makes VIGIL listen from set-up until paused with a PIN (`docs/adr.md:578`). The pitch says "tap Activate before a trip", and the honesty ledger forbids an unqualified "always on".
   - ADR-0048 (Proposed; runs only for simulation subjects) shares location for 30 minutes after a check-in. The pitch says "this build doesn't share location".
10. **Competitor scale:** Vumacam is "2,000+ cameras, ~9.68m plates/day" tagged FACT in stale `docs/COMPETITORS.md:21`, vs "7,000+ cameras, ~12m reads/day" as a company claim in `docs/SA-ANCHOR-SCALE-SECURITY-BUSINESS.md:18`.
11. **Segments:** SA-ANCHOR treats security companies and estates as buyers. The canvas branch says "Not served: private security companies; estates".
12. **Problem-cost anchors (branch-only, not in `docs/EVIDENCE.md`):**
    - R4,962.38 is the **ombud's levy-funded cost per formal case**, not a bank's cost. The annex itself says so. Lethabo's Beat 6A says "about five thousand rand to fight one dispute at the Ombud".
    - The ASISA R1.4bn / 16,520 cases cover **life insurers and investment companies**, not the short-term insurers who would buy VUKA.

---

## (c) What is already B2B/B2B2C, and what "enterprise integration" changes

**Already in the docs:**
- The model is **B2B2C and partner-funded** today. A bank or insurer switches VIGIL on for its customers and pays per member per month; the user does not pay (`docs/ECONOMICS-VIGIL-ANCHOR.md:15-17`).
- **Bank protective-hold signal (ADR-0037, accepted 23 Sep).**
  - VUKA sends a signed risk signal to an integrated bank, and the bank decides what to do. It is never sent from detection alone.
  - Only `sim_bank` exists (SIMULATED). "No real bank integration is claimed; the partner API is PROPOSED" (`docs/adr.md:438-444`; `docs/VUKA-2-SPEC.md:63,357`).
- **Evidence levels.** Banks and insurers see a tier, an E-level and reasons, never a score (`docs/VUKA-2-SPEC.md:108,556`).
- **Access model (branch ADR proposal).**
  - Public-read, permissioned-write anchor.
  - An **optional enterprise read-node/mirror inside a bank's perimeter**, with the public anchor still the root of trust.
  - Bank and insurer access per case on the victim's consent. This is PROPOSED: "No bank, insurer, court or regulator endpoint exists".
- **Revenue hypotheses:** five B2B lines in SA-ANCHOR §8, including "insurer claim-proof API or enterprise integration fee" and "third-party proof infrastructure".

**What the 15 Oct insight changes (PROPOSED analysis):**
1. **Where the product sits.** "Integrate VIGIL and ANCHOR into their systems" moves VIGIL from a standalone app the partner switches on to an SDK or white-label inside a bank or insurer app. ANCHOR moves from an export the victim holds to an API wired into fraud and claims systems.
   - None of the integration surface is built. There is no partner API beyond `sim_bank`, no third-party endpoint, and victim-held keys are not built.
   - An always-listening microphone inside a bank app is a new Play-policy and user-comfort question. It ties directly to insight 3 and to ADR-0046's own estimate of ~90 PIN checks per 16-hour day, which is not measured in the field.
2. **Pricing structure.** An enterprise deal normally needs a platform/integration fee plus a per-member or per-verification fee. The repo has only per-member (R20) and per-case (R15).
   - **Per-case alone cannot fund the company** (ESTIMATE). At R15 it needs 10,446 cases a month. That is about **14×** the ~743 formal banking cases a month that reach the ombud (NFO 2025, branch-only, unconfirmed). The bank's internal dispute volume is higher and unknown.
3. **Lead payer flips if Nedbank comes first.** The branch treats the bank as a "later phase" evidence payer and the insurer as the volume payer. A bank-first deal needs the per-member price justified to a bank (retention, dispute handling). The actuary test is insurer-specific.
4. **Enterprise procurement gates the repo does not meet yet:**
   - Independent penetration test (G8, "before the first paying partner", `docs/OPEN-GAPS.md:10,34`).
   - POPIA Information Officer registration (pending).
   - Counsel on CASP and exchange-control for the HBAR float (our reading only).
   - Operator/responsible-party contracts (SA-ANCHOR §6).
   - Insurance adequate for enterprise contracts (PI is R2.5m).
   - **No SLA is defined anywhere** (grep of spec, gaps, economics and README), which is insight 4. The untracked SLA-probe files from concurrent work are the first sign of one.
5. **The cost base would change.** Integration engineering, 24/7 support and production hosting are listed as missing from the script (canvas Block 8).

---

## (d) Competitor tables as the repo has them

**Price shelf (main `docs/ECONOMICS-VIGIL-ANCHOR.md` §3; `docs/MARKET-DATA.md` §3):**

| Product | Price | Repo's read |
|---|---|---|
| FNB GuardMe (Aura) | R19.90/mo after a 3-month trial (Apr 2022 press — re-check) | A bank already sells safety in-app, but it needs a press |
| iTOO [My]Cylution | from R22.50/mo (top tier R300) | Already insures express kidnapping; a partner or an objection |
| Vehicle trackers (Tracker, Netstar, Cartrack) | R89–R335/mo (aggregator ⚑) | Policyholders already pay for insurer-linked safety tech |
| Discovery Insure Vitality Drive | R150 once-off activation | An insurer already runs a phone-telematics safety programme |

**Current VIGIL+ANCHOR positioning (war-room branch `docs/POTENTIAL-QUESTIONS.md` §7; Lethabo's proof bank):**

| Category | Examples | Gap the repo claims |
|---|---|---|
| Detection / panic tools | Google Personal Safety, Apple Check In, Namola, FNB GuardMe, Blackline G7 | Notice, but produce no proof; need a press |
| Evidence tools | OpenTimestamps, Bernstein, Truepic/C2PA | Prove, but detect nothing |
| Bank duress PIN | Discovery Bank Panic Code (MyBroadband, 27 Mar 2025) | Must be typed; works inside one bank only |
| Insurer fraud tools | Verisk ClaimSearch, FRISS, Shift Technology, Bdeo | Score claims after the fact; create no contemporaneous record |

The repo's line is "Everybody owns one half. Nobody owns both." It is a positioning claim, not verified.

**ANCHOR-only comparison (main `docs/SA-ANCHOR-SCALE-SECURITY-BUSINESS.md` §7):** Vumacam Proof/SafeCity, NAVIC, Fidelity and other response companies, a conventional audit DB, and full on-chain evidence systems. All scale figures there are company claims.

**Stale four-layer table (`docs/COMPETITORS.md`):** Vumacam, Flock, ShotSpotter, WhatsApp groups, Fidelity ADT. It is superseded in part, and its "R87bn private security market (Stats SA)" is untagged. Do not reuse it for VIGIL+ANCHOR.

---

## (e) Numbers to avoid

**On main's dead list (`docs/MASTER-CONTEXT.md:136`):**
- "R1.9bn / 97,975" as current.
- "85% of banks".
- "R100 per member".
- "10,861".
- "three independent signatures".
- "3% claims reduction saves R20.7m".
- R1.09bn as a market or a saving.
- "Santam 3.7m".
- "94% net margin".
- 318 ms (n = 10) as VIGIL's speed.
- "2.7m security officers".
- "27 ADRs", "440 tests", bare "TRL 5", "R1.30/month".

**Branch addition:** "10,901" — dead only if the war-room model is merged.

**Also avoid, from this audit:**
- **Stale models and prices:** R155,659.47 together with 10,973 (mixed models); R50 / 3,774 / R3.42M / 57.1% / 86.4%; the R299/R99/R35/R40/R12,000/R5,500 Lean Canvas prices.
- **Unsourced funding and market claims:** "R2M seed" and "TIA R1.2M + angel R800k"; "85% of SA adults bank on a phone"; "~13,600 coerced transfers/year"; King Price discounts; numeric TAM/SAM/SOM.
- **Forbidden wording in branch decks:**
  - The canvas branch's deck title "Verifiable **Proof of Duress**".
  - "Stops paying fake claims" and "Now the victim is believed" (war-room spoken pitch).
  - "VUKA kills the invented and staged coercion claim" (Q&A §1.4).
  - "She holds the key" / "victim-held key" (not built).
  - "POPIA-compliant", "nothing to license" (our reading only), "tamper-proof".
- **Detection figures without method and n.** Quote only with n: ESC-50 held-out glass recall 11/16 (68.8%); FSD50K scream 6.5% (n=108); 7.3 false records/h on a stress proxy (`docs/EVIDENCE.md:55-70`; `docs/eval/cem1-measurements.md`). Screams are mostly missed.
- **Mislabelled anchors:** R4,962 presented as a bank's cost; ASISA life-insurer figures presented as short-term insurer fraud.
- **Mis-tagged figures:**
  - "A digital banking crime every five minutes" is derived from the ⚑ 110,074 figure (≈ 4.77 min). Tag it ESTIMATE ⚑.
  - 110,074, 89% and 70.5% stay ⚑; R2.4bn is the only FACT.
  - The 2024 incident count is 97,975, not 64,000.
  - The claims ratio is 51.4%, not 53–54%, and its page is still owed.

---

## (f) Gaps an investor would probe

1. **No validated willingness to pay.** R20 is a decided ASSUMPTION; no interview, LOI or partner exists. The actuary test (R240/member/year) has no claims-cost input, because frequency and severity "must come from the insurer's own data" (`docs/MARKET-DATA.md` §6).
2. **The team cost does not match the company.** 95.5% of the ask is 5 stipends for a 2-founder company.
3. **The ask is short in its own model.** Cash bottoms at −R114,328, there is no contingency line, legal and HBAR are unpriced, there are small double counts, and VAT and tax are excluded.
4. **The pilot assumes paid revenue.** 5,000 paying members from May 2027 with no signed partner, which is ~7 months from model start, and enterprise sales cycles are typically long (ASSUMPTION).
5. **No market size.** TAM/SAM/SOM are qualitative; coerced-transfer volume "is not public" (canvas Block 5). The R2.4bn SABRIC figure is explicitly not the market.
6. **Unit-cost basis.** Support at 1 agent per 5,000 members is an unverified ASSUMPTION. Cloud at R0.15 is an allowance, not measured.
7. **Technology readiness:**
   - Detection is weak on screams and not measured in the field (M1–M7).
   - The anchor runs on Hedera **testnet** only.
   - Attestation is `stored_unverified` (G32).
   - No pentest (G8).
   - No SLA, no measured uptime.
   - "Always on" (ADR-0046) has unmeasured battery cost and an estimated ~90 false checks a day.
8. **Lawfulness and comfort (insight 3):** POPIA IO registration pending, location sharing (ADR-0048) awaiting privacy review, and the CASP/exchange-control position is counsel-pending.
9. **Moat claims are positioning.** The "compounding anchored history" moat and "nobody owns both halves" are unverified, and Discovery Bank's Panic Code and FNB GuardMe sit inside the very banks VUKA would sell to.
10. **Governance.** Main and the branches carry three different models, and the deck quotes an unmerged one.


## KEY FACTS
- [ESTIMATE] Main's break-even is 10,901 members at R20. Fixed cost R155,659.47/month, variable R5.72, contribution margin 71.4% — scripts/economics_vigil_anchor.py:14-18,40-42 (run 2026-10-18); docs/ECONOMICS-VIGIL-ANCHOR.md:24-27; docs/MASTER-CONTEXT.md:130 (2026-10-18 (origin/main 1aa8830))
- [ESTIMATE] The war-room branch's break-even is 10,973 at R20. Itemised fixed cost R156,683.98/month; product-only R6,683.98 (break-even 469); 7 stipends gives 15,174 — origin/docs/babatunde-war-room-and-access-model:scripts/economics_vigil_anchor.py (run from scratchpad copy 2026-10-18); same branch docs/ECONOMICS-VIGIL-ANCHOR.md:25-34 (2026-09-26)
- [ESTIMATE] 10,901 vs 10,973: fixed cost differs by R1,024.51/month. Main lumps non-stipend ops at R5,090; the branch itemises R6,114.51 (accountant R4,400, Azure R348.30, cyber R450, PI R217.92, tools R648.30, CIPC R50) — scripts/economics_vigil_anchor.py:14 vs origin/docs/babatunde-war-room-and-access-model:scripts/economics_vigil_anchor.py FIXED_ITEMS (2026-10-18)
- [ASSUMPTION] Price decided 26 Sep 2026: single tier, R20 per member per month, paid by the insurer, 'R20 is final' — origin/docs/babatunde-war-room-and-access-model:docs/PRICING-WORKING.md:17; docs/POTENTIAL-QUESTIONS.md §1.8 (2026-09-26)
- [PROPOSED] Bank per-case fee R15 is proposed and unpriced on main. At R15, 10,378 (main) or 10,446 (branch) cases/month are needed to cover fixed cost alone — docs/ECONOMICS-VIGIL-ANCHOR.md:17,106; scripts/economics_vigil_anchor.py:88; origin/docs/babatunde-war-room-and-access-model:docs/WAR-ROOM-PITCH.md:56 (2026-10-18)
- [ESTIMATE] Funding ask R1,884,583 for 12 months = team R1,800,000 (5 x R30,000 x 12, 95.5%) + product/ledger R80,917.68 (4.3%) + one-off R3,665 (0.2%). Legal counsel and HBAR float unpriced — origin/docs/babatunde-war-room-and-access-model:docs/ECONOMICS-VIGIL-ANCHOR.md:63; docs/WAR-ROOM-PITCH.md:99-100; commit 605c5bf (2026-09-26)
- [ESTIMATE] The ask's product line (12 x R6,743.14) does not match the script's product-only R6,683.98: R709.92/year unexplained. The R3,665 one-off double counts PI, cyber and CIPC already in monthly fixed cost — my arithmetic against origin/docs/babatunde-war-room-and-access-model:scripts/economics_vigil_anchor.py output (2026-10-18)
- [ESTIMATE] Financial model: with R1,884,583 in Nov 2026 and 5,000 paying members from May 2027, cash goes negative Apr 2028, lowest -R114,328 (May 2028), first net-positive month Jun 2028 — scripts/build_financial_model.py:12-23,117 (run 2026-10-18 from scratchpad copy); docs/SIBUSISO-HANDOVER.md:475 (2026-10-18)
- [ESTIMATE] The ask covers 12.0 months of costs with no revenue, or 17 months (to Mar 2028) with the modelled pilot revenue. About R1.999m would keep cash at zero or above in that model — derived from scripts/build_financial_model.py outputs (2026-10-18)
- [FACT] Opening cash R0: no funds raised — scripts/build_financial_model.py:20 (2026-10-07)
- [FACT] Company: PILOT CORE (Pty) Ltd, Reg. 2026/122060/07; founders and directors Sibusiso Khumalo and Lethabo Hoaeane, 50/50 (the founders' own record, not checked against CIPC here) — scripts/build_financial_model.py:61 (2026-10-07)
- [ESTIMATE] Illustrative: at 2 founder stipends of R30,000, fixed cost is R66,683.98 and break-even is 4,670 members at R20 (not in the repo) — my arithmetic on the war-room branch inputs (2026-10-18)
- [ESTIMATE] Anchoring ceiling R569.47/month for the whole network (hourly R9.34 + immediate cap R560.13), whatever the member count — scripts/economics_vigil_anchor.py:36; docs/MASTER-CONTEXT.md:131 (2026-09-22 fee/FX)
- [ASSUMPTION] Canvas branch: working price R50, break-even 3,774 (5 stipends) / 5,503 (7); R2M seed from TIA up to R1.2M + angel R800k, both unsourced — origin/docs/babatunde-canvas-and-deck:docs/BUSINESS-CANVAS.md Blocks 8-10; docs/EVIDENCE-VERIFICATION.md (2026-09-25)
- [ASSUMPTION] TAM/SAM/SOM exist only as qualitative definitions, with no numbers; marked not verified — origin/docs/babatunde-canvas-and-deck:docs/BUSINESS-CANVAS.md:87-89; docs/EVIDENCE-VERIFICATION.md (2026-09-25)
- [REPORTED] Caplia investor-readiness score 327/700 on 5 Oct, before deck changes. Gaps: full-time status, equity split, domain experience, interviews and LOIs — docs/SIBUSISO-HANDOVER.md:474 (2026-10-05)
- [PROPOSED] The bank protective-hold signal is accepted as a design (ADR-0037), but no real bank integration exists; the partner API is PROPOSED and only sim_bank (SIMULATED) is built — docs/adr.md:438-444; docs/VUKA-2-SPEC.md:357 (2026-09-23)
- [PROPOSED] Bank, insurer, court and regulator access to records is PROPOSED with no endpoint. An optional enterprise read-node inside a bank perimeter is proposed — origin/docs/babatunde-war-room-and-access-model:docs/reviews/ANCHOR-ACCESS-MODEL-ADR-PROPOSAL.md (2026-09-26)
- [FACT] No independent penetration test (G8): scheduled before the first paying partner — docs/OPEN-GAPS.md:10,34 (2026-10-18)
- [FACT] No SLA or availability target is defined in the spec, open gaps, economics doc or README — grep of docs/VUKA-2-SPEC.md, docs/OPEN-GAPS.md, docs/ECONOMICS-VIGIL-ANCHOR.md, README.md (2026-10-18)
- [FACT] Digital banking crime R2.4bn gross losses in 2025. The 110,074 incidents and the 89%/70.5% app shares are secondary — docs/EVIDENCE.md:13; docs/MASTER-CONTEXT.md:125 (SABRIC released 2026-08-11)
- [FACT] Price anchors: FNB GuardMe R19.90/month (press, Apr 2022, re-check); iTOO [My]Cylution from R22.50/month — docs/EVIDENCE.md:23-24 (2022-04 / 2026)
- [FACT] Detection: held-out ESC-50 glass recall 11/16 (68.8%); FSD50K screams trigger a check-in on 6.5% of clips (n=108); 7.3 false records/h on a stress proxy — docs/EVIDENCE.md:55-70; docs/eval/cem1-measurements.md (2026-09-26)
- [ESTIMATE] ADR-0046 (Proposed) makes VIGIL listen from set-up until paused, with an estimated ~90 PIN checks per 16-hour day until thresholds are tuned. Not field-measured — docs/adr.md:578-600 (2026-09-25)
- [ESTIMATE] The per-case-only model needs ~14x the national ombud formal banking case volume (10,446 vs ~743/month) — derived; 743/month from origin/docs/babatunde-canvas-and-deck:docs/PROBLEM-STATEMENT-EVIDENCE.md:73 (NFO 2025, not in docs/EVIDENCE.md) (2026-10-18)

## CONFLICTS/GAPS
- Break-even 10,901 (main MASTER-CONTEXT §8, NEW-CHAT-HANDOVER:49) vs 10,973 (war-room branch, Caplia/Figma deck, financial model) vs 11,995 at R20 and 3,774 at R50 (canvas v2). The deck quotes an unmerged model.
- Price: main PRICING-WORKING:17 still says the working number is R50; main ECONOMICS says R20 (23 Sep starting point); the canvas branch uses R50; the war-room branch says R20 final (26 Sep). The decision lives only on an unmerged branch.
- Payer: bank-or-insurer pays R20 (main) vs insurer R20 + bank per case (war-room) vs 'funded by a bank' (NEW-CHAT-HANDOVER:48).
- 'Free to users' in main ECONOMICS §1 contradicts the ban in main PRICING-WORKING:14 and MARKET-DATA:81.
- Ask: R1,884,583 (war-room, financial model) vs R2M seed with TIA R1.2M + angel R800k (canvas, unsourced) vs 'R1.9m pilot' (spoken). Absent from main's economics doc and from Lethabo's branch.
- Ask arithmetic: R709.92/yr unexplained (12 x 6,743.14 vs script 6,683.98); R3,665 one-off double counts PI/cyber/CIPC; 'contingency' is named but has no line.
- The financial model runs out of cash in Apr 2028 (trough -R114,328), so the ask does not fund the company to break-even under its own assumptions.
- The model carries 5 stipends while the company is 2 founders (PILOT CORE, 50/50).
- Tags exceed the register: the branch tags itemised costs FACT though MARKET-DATA.md:5 says §4 rows are secondary until linked; ECONOMICS §6 tags 110,074 / 89% / 70.5% / +80% smartphones FACT though EVIDENCE.md flags them ⚑ and corrects the duty basis (export price, not retail).
- USD/ZAR 16.2075 (script, EVIDENCE) vs 16.21 (MARKET-DATA:40).
- The war-room pitch Part 2 claims a victim-held key and guardian 'blind backup'; its own ADR proposal says the key is server-held and guardians hold no copy (corrected on Lethabo's branch).
- ADR-0046 (Proposed, always listening) and ADR-0048 (Proposed, location sharing, sim-only) conflict with pitch lines 'tap Activate before a trip' and 'this build doesn't share location', and with the honesty ledger on unqualified 'always on'.
- R4,962.38 is the ombud's levy-funded system cost per formal case, not a bank's cost; ASISA fraud figures cover life insurers and investment companies, not short-term insurers. Neither figure is in docs/EVIDENCE.md.
- Vumacam scale: 2,000 cameras / 9.68m plates (COMPETITORS.md, tagged FACT) vs 7,000 cameras / 12m reads (SA-ANCHOR, company claim).
- Segments: SA-ANCHOR targets security companies and estates; the canvas branch lists them as 'Not served'.
- No numeric TAM/SAM/SOM, go-to-market pipeline, LOI or interview record exists in the repo; Figma Market and Pipeline slide figures cannot be traced to a source.
- No SLA, availability target or measured uptime exists; pentest G8 open; POPIA IO registration pending; CASP and exchange-control positions are 'our reading', pending counsel.
- Insurer claims frequency and severity, claims reduction r, the free-to-paying ratio and support staffing (1 agent per 5,000) are all unmeasured.
- The Nedbank YouthX top 50, Investec Easies entry and the 15 Oct Wits E-Hub feedback appear only in the task context; nothing in the repo records them (REPORTED).
- Three untracked files (.github/workflows/sla-probe.yml, scripts/sla/, test/sla-probe.test.mjs) appeared during this run from concurrent work. This audit did not create them and left them untouched.

## RECS
- Founders pick one canonical model and merge it to main in one PR. The war-room itemised model (10,973) is the natural base because the deck already uses it. Then update MASTER-CONTEXT §8 (break-even and dead-numbers list), PRICING-WORKING (R20 decided), NEW-CHAT-HANDOVER:48-49 and ECONOMICS §1 wording ('free to the uninsured; funded through the insurer's premium'), with a build-log entry.
- Fix the ask before it reaches an investor: rebuild it from the script output (R1,883,872.76 before fixes), remove the R3,665 double count or the matching monthly lines, add an explicit contingency line for legal counsel and the HBAR float, and size it so the model's trough is covered (about R2.0m on current assumptions). Quote runway as both 12.0 months (no revenue) and 17 months (with pilot revenue, ASSUMPTION).
- Re-run economics_vigil_anchor.py and build_financial_model.py for the 2-founder company as a scenario: 2 stipends gives about 4,670 break-even (ESTIMATE). Have the founders decide salaries rather than inheriting the hackathon's 5 x R30,000.
- For the B2B enterprise deck: add a platform/integration fee line and price per-verification separately. Do not present R15 per case as a business model; it needs about 10,446 cases a month to cover fixed cost. State that the bank API, third-party access endpoints and victim-held keys are PROPOSED.
- Build TAM/SAM/SOM bottom-up from FACT anchors (e.g. Santam >1m policyholders, one partner's app base) and tag every result ESTIMATE. Remove any unsourced Figma market figures. Record any Nedbank or insurer conversations and LOIs in the repo with dates.
- Use only the canonical figures (a) R20 ASSUMPTION, R5.72 / R14.28 / 71.4% ESTIMATE, break-even per merged script, anchoring ceiling R569.47 ESTIMATE, R2.4bn FACT, 17,061 kidnappings FACT, GuardMe R19.90 (2022) / iTOO R22.50 FACT; keep 110,074 and 89% flagged as secondary.
- Strip honesty-ledger violations from the branch decks before reuse: 'Verifiable Proof of Duress', 'stops paying fake claims', 'kills the invented claim', 'victim is believed', 'she holds the key', 'POPIA-compliant', 'nothing to license'. Use Lethabo's revision 2 wording as the base.
- For insights 3 and 4: set ADR-0046/0048 acceptance and the field false-check rate (M1–M3) as preconditions for any enterprise pilot. Define an SLA with a measured uptime source (the concurrent sla-probe work may supply it). Close pentest G8 and POPIA IO registration before integrating with a bank or insurer.