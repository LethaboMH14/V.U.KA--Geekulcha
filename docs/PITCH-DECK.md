---
theme: default
layout: cover
title: VUKA — Verifiable Proof of Duress
info: |
  ## VUKA — Verifiable Proof of Duress
  Team SONAR · Geekulcha Annual Hackathon 2026
  25 September 2026
class: text-center
transition: slide-left
mdc: true
highlighter: shiki
---

# VUKA — Verifiable Proof of Duress

Team SONAR · Geekulcha Annual Hackathon 2026

25 September 2026

**When you can't ask for help, VIGIL notices. When nobody believes you, ANCHOR proves when.**

<!-- Owner: Babatunde Adelusi. Source of truth for the pitch. Every figure carries FACT / ESTIMATE / ASSUMPTION / PROPOSED with a source. No score, no percentage, no "likelihood" from the coercion catalogue appears here — tier and E-level only. -->

---

# Slide 1 — The Problem

A person is hijacked. The attacker forces their thumb onto the phone, unlocks the banking app, and transfers money out. The bank's records show she authorised it — her face, her finger, her phone. She now has to prove she didn't, and she can't. There is no record of the attack, only the transaction.

Every safety product ever built requires you to press a button, open an app, or make a call. All of it needs a free hand and a private moment. Coercion removes both. There is no product for the person who cannot ask.

**Figures**
- SA digital banking fraud losses (2025): **R2.4bn** `FACT` — SABRIC 2025 Annual Banking Crime Statistics
- SA digital banking fraud incidents (2025): **110,074** `FACT` ⚑ (detailed incident figures remain secondary) — SABRIC 2025
- Banks reporting increased fraud attempts: **75%** `FACT` — BioCatch, May 2026 (vendor survey; 81% among C-suite)
- Mandatory APP reimbursement in SA: **none** `FACT` — no SARB, FSCA, Treasury or PASA statement found (`docs/EVIDENCE.md`)

**Scope caveat:** SABRIC R2.4bn is all digital banking crime, mostly social engineering. It is **not** coerced transfers. Coerced transfers are a subset of unknown size, bounded above by **17,061 kidnappings in 2023/24** `FACT` — SAPS via ISS Africa. **Do not present R2.4bn as our market.**

**Who is suffering:** Individuals who bank on their phone and travel at night. Women driving alone. Late-shift commuters. Single parents. Households where a child is home alone.

---

# Slide 2 — The Solution

**VUKA — "wake up." Verifiable proof of duress. Two layers. One purpose.**

**VIGIL** (Android app, free): Detects duress on the phone without the user asking. Sound shape, motion pattern, vehicle link break. Writes a structured record, delivered in the background, discreetly. One transaction records the guardian alert, the bank signal (where required) and the anchor request, so the record is durable before any is delivered (spec §8). Download from Play Store. No hardware. Works offline on a 2GB Android phone.

**ANCHOR** (the record layer): Publishes a **33-byte typed message** to a public blockchain (Hedera) — immediate roots coalesced to at most one per 60 s, plus one hourly root (spec §10). The message is a 1-byte type plus the 32-byte Merkle root. Anyone can verify the root without trusting VUKA. Cost is **R569.47/month at the ceiling** `ESTIMATE` — spec §10 — regardless of volume.

**What VUKA is not:** Not surveillance. No hardware. No human escalation. No accusation of anyone. Not a home alarm. Not a tracking app.

**Pitch rule:** Show the tier and the E-level only. Never a score, a percentage, or a "likelihood."

---

# Slide 3 — Unique Value Proposition

**Every other safety product asks you to trust it. VUKA can be verified.**

- **Panic buttons / safety apps:** Require a button press. VUKA works without asking.
- **Claims verification tools:** Verify evidence after a claim. VUKA creates evidence before the financial consequence.
- **Bank fraud detection:** Flags suspicious transactions after the fact. VUKA records the duress that caused the transaction.

**"Verifiable, not trusted" means:** The blockchain holds a fingerprint, not the evidence. The victim holds the evidence. The insurer verifies the fingerprint. Nobody sees anything they shouldn't.

**What the record proves:** The record existed at a specific time. It hasn't been altered since.

**What the record does not prove:** That the victim is telling the truth. That the duress was real. The insurer decides what the record means.

---

# Slide 4 — Unfair Advantage

- The record **survives device theft**: it lives in the per-subject signed chain and is anchored publicly, not only on the phone (spec §8, §10).
- The record **cannot be changed**: Hash-linked chain. Hourly fingerprint on a public blockchain.
- The record is **retrievable from any device**: Victim holds the decryption key.
- The AI **does not accuse anyone**: Detects patterns. Records them. No flagging. No escalation.
- **Checkable by someone who distrusts us**: The insurer runs the math. No trust in VUKA required.
- **Designed to be deployable** `PROPOSED`: the ANCHOR server is **not yet deployed** (slice 1 only). No hardware. No manufacturing. No inventory. Software only.

---

# Slide 5 — Customer Segments

**Two payers, two models, two reasons to buy.**

**Insurer** (volume payer, first phase):
- Pays per enrolled member per month. Working number **R50, undecided** `ASSUMPTION`.
- Buys product value: retention, differentiation, faster verification, less fraud leakage.
- Actuary test: saves ≥ **12 × price** per enrolled member per year.
- "Free to the uninsured; funded through the insurer's premium for policyholders."
- Which insurers: **Santam** (market share under 24%; more than 1 million policyholders `FACT` — Santam investor relations), **Discovery Insure** (runs Vitality Drive `FACT`), **King Price** (discounts for safety devices `ASSUMPTION` — unsourced, to verify).

**Bank** (evidence payer, later phase):
- Pays **per case**. Working number **R15, PROPOSED, undecided**.
- Buys dispute-resolution speed and reduced Ombud exposure.
- The bank holds the transaction record. It does not hold the duress record. VUKA supplies the missing half.
- Anchor: **R4,962.38 per escalated banking case** `FACT` — OBS Annual Report 2024 (2023 data). R15 is **0.3%** of one escalation `ESTIMATE` (derived).
- Bank pain is real and growing: formal banking cases **+25.4% y/y** `FACT` (NFO 2025), fraud complaints **nearly doubled 2024→2025** `FACT` (The Citizen, 16 Mar 2026), fraud resolution **~61 days average** `FACT` (The Citizen, 16 Mar 2026).
- **Coerced-transfer volume is not public. Say so.**
- Bank refuses: risk scores, personal data, biometrics, footage, enforcement.

**Which banks:** **Absa** (R129m digital-fraud losses H1 2026 for Absa and its customers `FACT` ⚑ — BusinessTech, 18 Aug 2026), **Standard Bank**.

**Not served:** Private security companies. Estates. High-income consumers.

---

# Slide 6 — Key Metrics

- **Detection → alert render:** Target ≤2.0s p95. Current: **M3 due Saturday** (VIGIL). **Nothing quoted until Vukosi posts it.**
- **Anchor liveness:** Target 100% of hours published.
- **Chain integrity:** Target 100% verifier passes.
- **Record survival after theft:** Target 100% recoverable.
- **Monthly churn:** Target <5%.
- **Claims settlement time (insurer):** Weeks → days.
- **Dispute resolution time (bank):** ~61 days → faster.

**Pitch rule:** Tier and E-level only. Never a score.

---

# Slide 7 — Distribution Channels

- **Insurer bundling (primary):** Insurer bundles VUKA. Policyholder gets it free. Insurer pays per member per month.
- **Direct consumer app:** VIGIL free on Play Store. The funnel.
- **Bank partnership (later phase):** Bank pays per case for verifiable duress records.
- **Community:** GKSS university chapters and Geekulcha's network for early adoption.

**Not channels:** Private security companies. Estates.

---

# Slide 8 — Cost Structure

**VIGIL — software only. No hardware. No manufacturing. No inventory.**

**Fixed monthly** (ESTIMATE, script):
- Founder stipends (5 × R30,000): **R150,000** `ASSUMPTION`
- Hosting: **R2,500** `ESTIMATE`
- Email (Google Workspace × 5): **R800** `ESTIMATE`
- Sage accounting: **R240** `ESTIMATE`
- Business insurance: **R700** `ESTIMATE`
- Monitoring tools: **R400** `ESTIMATE`
- Support ticketing: **R450** `ESTIMATE`
- Accountant retainer: **R4,400** `ESTIMATE` (ProCompare average)
- CIPC annual (R350/yr ≈ R29.17/mo): **R29.17** `ESTIMATE`
- Blockchain anchor ceiling: **R569.47** `ESTIMATE` (spec §10)
- **Fixed monthly before member-dependent steps: R160,088.64** `ESTIMATE` (script components: R150,000 + R9,519.17 + R569.47)

**Member-dependent steps** (script v2 moved these out of the per-member variable):
- Cloud: **R0.15** per member/month `ESTIMATE` (the only per-member variable in v2)
- Support: **R25,000/month per 5,000 members** `ESTIMATE` (step; ≈ R5.00/member at a full step)
- Compliance: **R68,000/year ÷ enrolled members** `ESTIMATE` (≈ R0.57/member/month at 10,000)

**Compliance (Year 1):**
- POPIA registration: **Free** `FACT`
- POPIA ongoing legal/compliance: **R20,000/year** `ESTIMATE`
- Independent penetration test: **R48,000/year** `ESTIMATE`
- Total Year 1: **~R68,000** `ESTIMATE`

**Missing from script** (flagged, not yet in): SMS fallback, 24/7 cover, production hosting, cyber and PI insurance, UIF/SDL levies, payment terms, currency exposure, bank integration post-`sim_bank`.

**Stipend gap** (OPEN, team decision): 5 stipends for a 7-person team. Break-even at R50 moves from **3,774** to **5,503** members.

---

# Slide 9 — Revenue Streams

**Insurer** (primary): **R50 per enrolled member per month.** Working number, undecided. Decision due Friday 25 Sep. Single tier. Actuary test: insurer saves ≥ 12 × price per member per year. At R50, that is **R600/member/year**.

**Bank** (later phase): **R15 per case.** `PROPOSED`. No subscription. Anchored by R4,962 per escalated case. R15 is **0.3%** of one escalation `ESTIMATE`.

**Break-even at R50** (ESTIMATE, script, rounded up):
- 5 stipends, excl. VAT: **3,774** members
- 7 stipends, excl. VAT: **5,503** members
- 5 stipends, incl. VAT: **4,342** members

**Feasibility** (5 stipends):
- At **1,000** members: **no price works at any r.**
- At **5,000** members: feasible at **r ≥ 10%** (+R3.90 gap).
- At **10,000** members: feasible at **r ≥ 10%** (+R20.21 gap).

**Honest boundary:** mid-four-figure-member, measured-efficacy deal. **Never 1,000 members at any price. Never claims savings as a promise.**

**What we refuse to sell:** Street-level risk scores (redlining). Personal data, biometrics, footage. Tokens.

---

# Slide 10 — The Ask

**One insurer pilot. One bank conversation. One verified claim.**

We are not asking you to believe us. We are asking you to **check** us.

Everything we claim is in the repository. The tier rules. The E-levels. The script outputs. The published gaps.

---
layout: center
class: text-center
---

# Thank you

**When you can't ask for help, VIGIL notices. When nobody believes you, ANCHOR proves when.**

*It forgets you. It never forgets what it did.*

Team SONAR · Geekulcha Annual Hackathon 2026 · 25 September 2026

<!--
Global styling. Long slides scroll instead of clipping, so nothing is cut off.
Edit this deck in the browser: open the nav bar (bottom-left) and toggle the
integrated editor, or press `e`. The running dev server hot-reloads on save.
-->

<style>
:root {
  --vuka-ink: #0f172a;
  --vuka-body: #1e293b;
  --vuka-muted: #64748b;
  --vuka-accent: #0d9488;
  --vuka-accent-dark: #0f766e;
  --vuka-rule: #e2e8f0;
  --vuka-soft: #f0fdfa;
}

/* Long slides scroll instead of being cut off. */
.slidev-page,
.slidev-layout {
  overflow-y: auto;
}

.slidev-layout {
  color: var(--vuka-body);
  line-height: 1.55;
  font-size: 0.92rem;
  padding-bottom: 2.5rem;
}

/* Headings with an accent rule. */
.slidev-layout h1 {
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--vuka-ink);
  margin: 0 0 0.9rem 0;
  padding-bottom: 0.35rem;
  border-bottom: 3px solid var(--vuka-accent);
  display: inline-block;
}
.slidev-layout h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vuka-accent-dark);
  margin: 1rem 0 0.45rem;
}
.slidev-layout h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vuka-ink);
  margin: 0.75rem 0 0.35rem;
}

/* Emphasis. */
.slidev-layout strong { color: var(--vuka-accent-dark); font-weight: 700; }
.slidev-layout em { color: var(--vuka-muted); }

/* Lists. */
.slidev-layout ul,
.slidev-layout ol { padding-left: 1.15rem; }
.slidev-layout ul > li,
.slidev-layout ol > li { margin: 0.3rem 0; }
.slidev-layout ul > li::marker { color: var(--vuka-accent); }

/* Blockquote. */
.slidev-layout blockquote {
  border-left: 4px solid var(--vuka-accent);
  background: var(--vuka-soft);
  border-radius: 0 0.5rem 0.5rem 0;
  padding: 0.5rem 0.9rem;
  margin: 0.6rem 0;
}

/* Inline tags such as `FACT`. */
.slidev-layout code {
  background: #ecfeff;
  color: #155e75;
  border: 1px solid #cffafe;
  border-radius: 0.35rem;
  padding: 0.05rem 0.35rem;
  font-size: 0.82em;
  font-weight: 600;
}

/* Tables. */
.slidev-layout table { border-collapse: collapse; width: 100%; }
.slidev-layout table th {
  background: var(--vuka-accent-dark);
  color: #fff;
  text-align: left;
  padding: 0.35rem 0.6rem;
}
.slidev-layout table td {
  border-bottom: 1px solid var(--vuka-rule);
  padding: 0.35rem 0.6rem;
}

/* Cover slide. */
.slidev-layout.cover,
.slidev-layout.cover * { color: #f0fdfa; }
.slidev-layout.cover {
  background: linear-gradient(135deg, #042f2e 0%, #0f766e 55%, #14b8a6 100%);
}
.slidev-layout.cover h1 {
  color: #ffffff;
  border-bottom-color: #5eead4;
  font-size: 2.2rem;
}

/* Centered closing slide. */
.slidev-layout.center { text-align: center; }
.slidev-layout.center h1 { border-bottom: none; }
</style>
