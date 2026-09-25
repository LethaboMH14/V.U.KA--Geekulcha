# VUKA — Business Canvas

> **Owner:** Babatunde Adelusi (business/economics). **Status:** `PROPOSED`. **Supersedes** `docs/LEAN-CANVAS.md` (stale, four-layer; kept for history).
> **What this is:** the commercial case for VIGIL + ANCHOR, in ten blocks. Every block sells, names its judging criterion letters (I · T · U · S · B · Q) and its audience, and tags every figure `FACT` / `ESTIMATE` / `ASSUMPTION` with a source.
> **Two decisions are open and change the headline numbers:** the **price** (working number R50) and the **stipend count** (5 vs 7). Both are Babatunde's/team's to set.
> **The honest frame:** the anchor proves *when*, not *what*. Claims savings is a pilot measurement, not a promise.
> **Money figures** are printed by `scripts/economics_vigil_anchor.py` (v2). If this page and the script disagree, the script wins.

---

## BLOCK 1 — Problem
**Criterion:** I, B · **Audience:** judge, insurer, bank

> **A person is forced to authorise a bank transfer at gunpoint. Every record says they did it. Nobody can prove otherwise.**

| Who | How they lose |
|---|---|
| The victim | Loses the money — then carries the debt and the burden of proof. |
| The insurer | Cannot tell a real claim from a staged one: pays fraudsters, or fights real victims. |
| The bank | Holds the transaction, not the duress. Cannot resolve what it cannot see. |

- Evidence: **~13,600 coerced transfers/year** `ESTIMATE` ⚑ (SAPS + ISS, calculated — **not yet in `docs/EVIDENCE.md`; confirm with Khutso**).
- **R2.4bn** digital banking crime, 2025, across **110,074** incidents `FACT` (SABRIC 2025).
- **743** Ombud disputes/month, **+25%** y/y `FACT` (NFO Annual Report 2025).
- **R4,962** per escalated case `FACT` (OBS Annual Report 2024, 2023 data); **~61 days** to resolve a fraud complaint `FACT` (NFO via The Citizen, 16 Mar 2026).
- **Scope caveat:** SABRIC's R2.4bn is **all** digital banking crime, mostly social engineering — **not** coerced transfers, and **not** our market.

---

## BLOCK 2 — Solution
**Criterion:** I, T, U · **Audience:** judge, technical reviewer, user

> **VUKA detects duress without a button and anchors a verifiable record so insurers and banks can act on it.**

- **VIGIL** — Android app. Detects duress on the device (sound shape, motion pattern, vehicle-link break). No button, no free hand needed. Free to the uninsured; funded through the insurer's premium for policyholders.
- **ANCHOR** — publishes a **33-byte typed message** to the Hedera Consensus Service: immediate roots coalesced to at most one per 60 s, plus one hourly root (spec §10). Cost **R569.47/month** fixed at the ceiling, any member count `ESTIMATE`.
- **The flow:** detection → durable record (one transaction writes the guardian alert, bank signal and anchor request — spec §8) → anchor → verify → a human decides.
- **What VUKA is not:** not surveillance, no hardware, no autonomous escalation, no score on a slide.

---

## BLOCK 3 — Unique Value Proposition
**Criterion:** I · **Audience:** judge, insurer, bank

> **Every other safety product asks you to trust it. VUKA can be verified.**

| Alternative | What it does | VUKA's difference |
|---|---|---|
| Panic button / safety app | Needs a button press | Works without asking |
| Claims-verification tool | Verifies evidence *after* a claim | Creates evidence *before* the financial consequence |
| Bank fraud detection | Flags suspicious transactions after the fact | Records the duress that caused the transaction |

- **"Verifiable, not trusted":** the ledger holds a **fingerprint**, not the evidence; the victim holds the record; the insurer verifies the fingerprint. Nobody sees anything they shouldn't.
- **What the record proves:** the record existed at a specific time, and has not been altered since. **What it does not prove:** that the duress was real. A human at the institution decides what it means.
- **Why a database fails:** the insurer would have to trust VUKA. **Why the anchor succeeds:** it doesn't.

---

## BLOCK 4 — Unfair Advantage (the moat)
**Criterion:** I, S · **Audience:** investor, judge

> **The anchored history compounds. A competitor launching later starts at zero and can never catch up.**

- **The moat that compounds:** from the hour we start publishing, the verifiable record grows. You cannot retroactively insert entries into a public chain. Features are copyable; **provable history is not**.
- The record **survives device theft**: it lives in the per-subject signed chain and is anchored publicly, not only on the phone (spec §8, §10).
- **Hash-linked chain**, hourly fingerprint on a public ledger; **a stranger can verify without trusting us**.
- **No AI accuses anyone; no escalation; no score on a slide.** Machines notice; people decide.
- **Cost per network: R569.47/month, fixed — never grows** `ESTIMATE`. No hardware, no manufacturing, no inventory. Software only.

---

## BLOCK 5 — Customer Segments (the market)
**Criterion:** B · **Audience:** investor, insurer, bank

> **Two payers. Two models. Two reasons to buy. One platform that reaches millions.**

**Insurer — the volume payer (first phase):**
- **R50** per enrolled member per month. Working number, **undecided** `ASSUMPTION`.
- Buys product value: retention, differentiation, faster verification, less fraud leakage.
- Actuary test: the insurer saves ≥ **12 × price = R600/member/year**; at R50 that needs a **30%** reduction at R2,000 relevant claims/member/yr, or **12%** at R5,000 `ESTIMATE`.
- Targets: **Santam** (market share **under 24%**; **more than 1 million** policyholders `FACT` — Santam investor relations), **Discovery Insure** (runs Vitality Drive `FACT`), **King Price** (discounts for safety devices `ASSUMPTION` — unsourced).

**Bank — the evidence payer (later phase):**
- **R15 per case** `PROPOSED`, **not a subscription**.
- Buys dispute-resolution speed and reduced Ombud exposure. The bank holds the transaction record, not the duress record.
- Anchor: **R4,962** per escalation `FACT` (OBS 2024); R15 is **0.3%** of that `ESTIMATE`.
- Targets: **Absa** (R129m digital-fraud losses H1 2026 for Absa and its customers `FACT` ⚑ — BusinessTech, 18 Aug 2026), **Standard Bank**.
- **Coerced-transfer volume is not public. Say so.**

**Users (do not pay):** anyone whose phone is their bank. **85% of SA adults bank on a phone** `ASSUMPTION` ⚑ (**unsourced — find a source or drop it**).

**Market sizing `ASSUMPTION` (needs sources):**
- **TAM:** all SA short-term-insurance policyholders + all SA retail-banking customers.
- **SAM:** mid-to-high-value policyholders with mobile banking at the three target insurers.
- **SOM:** one insurer pilot at **5,000** members, scaling to **50,000** over 24 months.

**Not served:** private security companies; estates; high-income consumers.

---

## BLOCK 6 — Key Metrics (proof it works)
**Criterion:** T, S · **Audience:** judge, technical reviewer, insurer

> **What we measure — and what we refuse to measure.**

- **Detection → alert render:** target ≤2.0 s p95. Current: **M3 due Saturday**; **nothing is quoted until Vukosi posts it** (spec §16). VIGIL latency is M3.
- **Anchor liveness:** target 100% of hours published. **Chain integrity:** target 100% verifier passes. **Record survival after theft:** target 100% recoverable.
- **Monthly churn:** target <5%.
- **Claims settlement (insurer):** weeks → days. **Dispute resolution (bank):** ~61 days → faster (pilot measurement).
- **Pitch rule:** **tier and E-level only. No score, no percentage, no "likelihood."**

---

## BLOCK 7 — Distribution Channels (go-to-market)
**Criterion:** B, U · **Audience:** investor, insurer, bank

> **One insurer deal reaches 5,000 members. One bank deal reaches every dispute in their queue.**

- **Insurer bundling (primary):** the policyholder gets it as a benefit; the insurer pays per member per month. One integration reaches thousands; CAC collapses.
- **Direct consumer app:** VIGIL on the Play Store. The funnel. No hardware, no cost.
- **Bank partnership (later phase):** per case for verifiable records; reaches every dispute the bank already handles.
- **Community:** GKSS university chapters + Geekulcha's network for early adoption.
- **Why this wins:** fighting insurers means paying to acquire households one at a time; selling *through* them means one deal, thousands of users, near-zero marketing rand.

---

## BLOCK 8 — Cost Structure
**Criterion:** B · **Audience:** investor, insurer

> **Software only. Cost per user falls as the network grows.**

**Fixed ops base (excl. stipends, anchoring, compliance, support):** **R9,519.17/month** `ESTIMATE` — hosting R2,500, email R800, Sage R240, business insurance R700, monitoring R400, ticketing R450, accountant R4,400, CIPC R29.17.

| Line | Value | Tag | Note |
|---|---:|---|---|
| Stipends (5 × R30,000) | R150,000 | `ASSUMPTION` | 5 or 7 to be decided |
| Anchoring ceiling (whole network) | R569.47 | `ESTIMATE` | spec §10; fixed at any size |
| Support | R25,000/mo per 5,000 members | `ESTIMATE` | step cost |
| Compliance | R68,000/yr ÷ members | `ESTIMATE` | ~R0.57/member/mo at 10,000 |
| Cloud (per member) | R0.15 | `ESTIMATE` | the only per-member variable in v2 |

- **Fixed monthly before member-dependent steps:** **R160,088.64** `ESTIMATE` (stipends R150,000 + ops base R9,519.17 + anchoring R569.47). *(The earlier "R155,659.47" total is the retired pre-v2 figure and is not used.)*
- **The key insight:** marginal cost falls with scale — anchoring is a fixed ceiling (R569.47/month at any size), hosting fits the same tier at 10k as at 1k, and only support scales, in steps.
- **Missing from the script (flagged):** SMS fallback, 24/7 cover, production hosting, cyber + PI, UIF/SDL, payment terms, currency exposure, bank integration post-`sim_bank`.
- **Stipend gap:** 5 vs 7. **OPEN.** Break-even at R50: **3,774** (5 stipends) vs **5,503** (7).

---

## BLOCK 9 — Revenue Streams (the money)
**Criterion:** B · **Audience:** investor, insurer, bank

> **R50 per member per month from insurers. R15 per case from banks. Break-even at 3,774 members. Profit at 10,000.**

- **Insurer:** R50/member/month. Working number, **undecided** `ASSUMPTION`. Actuary test: insurer saves ≥ 12 × price.
- **Bank:** R15/case `PROPOSED`. No subscription; pays only when it pulls a verified record.
- **Break-even at R50** `ESTIMATE` (script, rounded up): **3,774** members (5 stipends) / **5,503** (7 stipends); VAT-inclusive (5): 4,342.
- **Feasibility** (5 stipends): at **1,000** members **no price works at any r**; at 5,000, feasible at r ≥ 10% (+R3.90); at 10,000, r ≥ 10% (+R20.21).
- **The lucrative table** — R50, 5 stipends, no free members, `ESTIMATE` (script v2 — `operating_margin_pct` / `annual_profit`):

| Members | Monthly revenue | Monthly cost | Monthly profit | Annual profit | Op. margin |
|---:|---:|---:|---:|---:|---:|
| 5,000 | R250,000 | R188,852 | R61,148 | R733,773 | 24.5% |
| 10,000 | R500,000 | R214,595 | R285,405 | **R3.42M** | 57.1% |
| 50,000 | R2,500,000 | R420,590 | R2,079,410 | R24.95M | 83.2% |
| 100,000 | R5,000,000 | R678,089 | R4,321,911 | R51.86M | 86.4% |

*(Monthly cost = fixed + variable + payroll. Note `docs/ECONOMICS-VIGIL-ANCHOR.md` §2's older margin table — 42.8%/69.6% — does **not** match the script; the script is the source of truth and that table needs correcting.)*

- **Path to scale:** 1 pilot → 5,000 members; 3 insurers → 50,000; pan-African (Kenya, Nigeria) → 500,000+ `ASSUMPTION`.
- **What we refuse to sell:** risk scores (redlining), personal data/biometrics/footage, tokens.

---

## BLOCK 10 — The Ask (pilot + investment)
**Criterion:** B · **Audience:** investor, insurer

> **One insurer pilot to prove the claims reduction. Seed funding to reach the first year.**

- **The pilot ask:** one insurer, **5,000 members, 12 months**, measuring the claims reduction. If ≥ **10%**, the deal scales. *(Claims reduction is a pilot measurement, not a promise.)*
- **The investment ask:** **R2M seed** `ASSUMPTION` (unsourced — needs a build-up) to fund operations, compliance and the first-year go-to-market.
- **Where it comes from:** TIA Seed Fund (up to R1.2M, grant) + angel investor (R800k) `ASSUMPTION` ⚑ (**unsourced — confirm TIA terms and the angel before use**).
- **Why an investor says yes:** **operating margin 57.1% at 10,000 and 86.4% at 100,000** members `ESTIMATE` (script); break-even at **3,774**; one insurer deal reaches it; pan-African expansion is a copy of the model; the moat compounds from hour one.
- **We are not asking you to believe us. We are asking you to check us.**
