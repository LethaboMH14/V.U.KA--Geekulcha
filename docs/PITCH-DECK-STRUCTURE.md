# VUKA — Pitch deck structure (sales-grade)

> **Owner:** Babatunde Adelusi. **Status:** `PROPOSED` — content for the Figma deck. 12 slides. Each slide names its judging criterion letters (I · T · U · S · B · Q), a one-line sell, 3–5 bullets, a source line for every figure, and a delivery note. **Figma MCP is not connected in this environment** (no `mcp` config; see the PR), so this is Figma-ready markdown, not a live Figma write.
> **Rules:** tier and E-level only (no score); never "free to users" (use "free to the uninsured; funded through the insurer's premium for policyholders"); never present 1,000 members as feasible; the bank signal is `PROPOSED`; the anchor proves *when*, not *what*.

---

## Slide 1 — Title
**Criterion:** — · **Deliver:** say the product in six words.

- **Title:** VUKA — Verifiable Proof of Duress
- **Subtitle:** Team SONAR · Geekulcha Annual Hackathon 2026 · Blockchain for Impact Use
- **Headline:** *When you can't ask for help, VIGIL notices.*
- **Source:** n/a.
- **Speaker note:** pause after the tagline; let the room read it.

## Slide 2 — The Problem
**Criterion:** I, B · **Sell:** the victim performs the crime against herself.

- **Headline:** *Every record says she authorised it.*
- A person is forced to authorise a bank transfer at gunpoint.
- Every record says she did it — her face, her finger, her phone.
- There is no record of the coercion. Only the transaction.
- **Source:** n/a (problem framing).
- **Delivery note:** slow, one sentence per bullet.

## Slide 3 — Everyone Loses
**Criterion:** I, B · **Sell:** no party can win without a shared record.

| Who | How they lose |
|---|---|
| The victim | Loses the money, then the burden of proof. |
| The insurer | Pays fraudsters, or fights real victims. |
| The bank | Holds the transaction, not the duress. |

- **Headline:** *Three parties, one missing record.*
- **Source:** n/a.
- **Delivery note:** point at each row; the bank row is the setup for Slide 5.

## Slide 4 — How the Insurer Pays Fraud
**Criterion:** B · **Sell:** a staged claim is indistinguishable from a real one.

- **Headline:** *Fraud and truth look identical on paper.*
- A fraudster stages a hijacking and claims the account was drained.
- The bank confirms the transfer was authorised — phone unlocked, app opened, money moved.
- The insurer cannot disprove it. No duress record exists.
- **Source:** n/a (mechanism).
- **Delivery note:** this is the insurer's pain; land it before the solution.

## Slide 5 — How the Bank Loses
**Criterion:** B · **Sell:** R4,962 to resolve what it cannot see.

- **Headline:** *743 disputes a month. Up 25% in a year.*
- No proof of coercion → the bank cannot refund → the customer escalates.
- **743** Ombud cases/month, **+25%** y/y; **R4,962** per escalated case; **~61 days** to resolve.
- Fraud complaints nearly doubled; disbelieved customers leave.
- **Source:** NFO Annual Report 2025; OBS Annual Report 2024 (2023 data); NFO via The Citizen, 16 Mar 2026.
- **Delivery note:** give the three numbers, then stop.

## Slide 6 — The Gap
**Criterion:** I · **Sell:** there is no product for the person who cannot ask.

- **Headline:** *Every safety product needs a free hand.*
- Panic buttons, apps, calls — all need a free hand and a private moment.
- Coercion removes both.
- **Source:** n/a.
- **Delivery note:** one beat of silence before the solution.

## Slide 7 — The Solution
**Criterion:** I, T · **Sell:** detection without a button; proof without trust.

- **Headline:** *VIGIL notices. ANCHOR proves when.*
- **VIGIL:** Android, on-device; sound shape, motion, vehicle link; no button.
- **ANCHOR:** a signed per-person chain; a 33-byte typed message to the ledger (immediate roots coalesced per 60 s + one hourly root).
- A stranger can verify the record without trusting us.
- **Source:** spec §8, §10; ADR-0035.
- **Delivery note:** "without trusting us" is the line that matters.

## Slide 8 — The Flow
**Criterion:** T, U · **Sell:** five steps, one human decision.

- **Headline:** *Detection → Record → Anchor → Verify → Decide.*
1. VIGIL detects duress on the phone.
2. One transaction writes the guardian alert, bank signal and anchor request (durable before delivery).
3. ANCHOR publishes the root.
4. The insurer/bank checks the fingerprint — it matches or it doesn't.
5. A human at the institution reads the verified record and decides.
- **Source:** spec §8, §10.
- **Delivery note:** count the five steps on your fingers.

## Slide 9 — Why Blockchain
**Criterion:** T, I · **Sell:** load-bearing, not decorative.

- **Headline:** *Remove it and the insurer must trust us.*
- Without it, the insurer trusts VUKA's database — a promise, not evidence.
- With it, the insurer verifies without trusting us.
- **R569.47/month** for the entire network, fixed, never grows `ESTIMATE`.
- No tokens. No personal data on-chain.
- **Source:** spec §10; `scripts/economics_vigil_anchor.py`.
- **Delivery note:** name the fixed cost; it is the commercial punchline.

## Slide 10 — The Business Model
**Criterion:** B · **Sell:** two payers, two reasons, real margin.

- **Headline:** *R50 a member. R15 a case.*
- Insurer: **R50/member/month** (`ASSUMPTION`, undecided); actuary test saves ≥ 12 × price.
- Bank: **R15/case** (`PROPOSED`), later phase; R15 is 0.3% of a R4,962 escalation.
- Break-even at R50: **3,774** (5 stipends) / **5,503** (7). Profit **R3.42M/yr at 10,000** members `ESTIMATE`.
- **Source:** `scripts/economics_vigil_anchor.py` (v2); OBS 2024.
- **Delivery note:** lead with the two payers, not the mechanism.

## Slide 11 — The Ask
**Criterion:** B · **Sell:** one pilot proves it; one cheque starts it.

- **Headline:** *One insurer pilot. One bank conversation. One verified claim.*
- Pilot: one insurer, **5,000 members, 12 months**, measuring the claims reduction (≥10% scales).
- Seed: **R2M** `ASSUMPTION` (unsourced build-up) — operations, compliance, first-year go-to-market.
- We are not asking you to believe us. We are asking you to check us.
- **Source:** economics model.
- **Delivery note:** the ask is a pilot, not a purchase order.

## Slide 12 — Closing
**Criterion:** I · **Sell:** the one line they repeat.

- **Headline:** *It forgets you. It never forgets what it did.*
- The anchor proves *when*, not *what*.
- The absence of a VUKA record is never evidence against anyone.
- **Source:** MASTER-CONTEXT §6.
- **Delivery note:** say it, then stop talking.

---

## Q&A prep (two hardest questions per slide, with the honest answer)

**Slide 2–3 (Problem):**
1. *"Isn't this just express kidnapping, which is rare?"* → Coerced transfers are a subset of unknown size; 44% of 17,061 kidnappings (2023/24) happen during a hijacking. We do not claim R2.4bn is ours.
2. *"Why hasn't a bank solved this?"* → The bank holds the transaction, not the duress; it has no record of the coercion.

**Slide 4–5 (Losses):**
1. *"Are the Ombud numbers coerced transfers?"* → No — they are all banking disputes. Coerced-transfer volume is not public; the pilot measures it.
2. *"Is R4,962 a refund?"* → No — it is the cost per escalated case (levy-funded), a proxy for the cost of escalation.

**Slide 7–9 (Solution/Why blockchain):**
1. *"Why not a signed database — you don't need a blockchain."* → A database run by a party to the dispute doesn't solve trust for the other side. The public anchor removes us as the single trusted party over our own history.
2. *"Hedera is a permissioned council, not decentralised."* → Correct — we say so. That is why the Bitcoin/OpenTimestamps second anchor exists and why the review recommends signed checkpoints and consistency proofs.

**Slide 10 (Business model):**
1. *"Where does R50 come from — why would an insurer pay 2.5× a panic button?"* → Different product class: verified duress evidence, not a panic feature. The insurer sets its own number via the actuary test; we state the threshold.
2. *"What if claims reduction is 0%?"* → Then the insurer still buys retention/differentiation and faster, cheaper dispute resolution; the claims saving is a pilot measurement, not our promise.

**Slide 11 (Ask):**
1. *"Where does the R2M go — and where did the number come from?"* → It is a working `ASSUMPTION`, not yet built up; the build-up is a follow-up.
2. *"Why fund you over the incumbents?"* → The moat (a compounding, publicly verifiable history) and a two-payer model; we start with one pilot, not a platform.
