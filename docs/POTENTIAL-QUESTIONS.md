# VUKA — Potential Questions (Q&A bank)

> **Owner:** Babatunde Adelusi. **Status:** `PROPOSED`. **Not spoken.** The full answer behind every claim in `docs/WAR-ROOM-PITCH.md`. Contains the deep reasoning the pitch cannot hold, so the pitch stays punchy and we never get caught out.
> **Rule:** in the pitch we sell; here we prove. Every figure carries a tag and a source.

---

## 1 · The insurer's money, and fake claims

### 1.1 Why do insurers pay fake claims today?
Because they cannot verify a coercion. A coerced transfer looks exactly like a voluntary one: a completed, authenticated payment — unlocked phone, opened app, money moved. A fraudster can claim they were forced, backed by a police statement. The insurer has **no record of the duress** to test it against, so it **pays, or fights blind**. Fraud is real and large: ICB puts **5–12% of all claims** as fraudulent (`FACT` ⚑); ASISA members detected **16,520 fraud cases in 2024**, preventing **R1.4bn** (`FACT`).

### 1.2 How are fake claims orchestrated?
| Method | What the fraudster does |
|---|---|
| **Invention** | Makes up an event — a fictitious mugging, hijacking or kidnapping — backed by a **false police statement**. |
| **Staging** | Orchestrates the scene (an accomplice screams; a "distress" moment is produced) so there is something to point to. |
| **Voluntary participation (moral hazard)** | Willingly parts with the money — a scam, a bad deal — then claims it was **coerced**. |
| **Pre-inception loss** | Claims for a loss that happened **before** the policy started. |
| **Inflation** | A real event, **padded** — claiming for more than was lost. |
| **Syndicates** | Repeat claims across insurers, **identity theft**, and **inside knowledge of the red flags**. |
| **Virtual kidnapping** | Convinces the **family** a kidnapping happened (no real abduction). |
*Sources: ICB Annual Reports 2024/2025; Nedbank; Santam (insurance-crime); Kelly Insurance K&R exclusions; FBI virtual-kidnapping alert (2025).*

### 1.3 What VUKA disrupts — and where it is weak
| Method | VUKA | Why |
|---|---|---|
| **Invention** | **Strong** | There was no coercion, so no detection and **no record** — one cannot be produced after the fact. |
| **Staging** | **Good** | The faker must arm the app and trigger a **real detection**, and the record must agree with CCTV, cell towers and the bank's device data. |
| **Pre-inception loss** | **Good** | The anchor **timestamps the event**; a pre-policy loss has a record dated before inception, or none. |
| **Syndicates / identity theft** | **Partial** | Device signatures + one ledger make repeat, anonymous, cross-insurer claims harder — not impossible. |
| **Inflation** | **Weak** | VUKA records the **duress signal, not the value**. |
| **Voluntary participation** | **Weakest** | If the money was given willingly, there is no duress to detect. Needs ubiquity + the bank hold. |

### 1.4 The claim we can defend
> **VUKA kills the invented and staged coercion claim** — the fraudster cannot produce a record, made at the time, that survives the rest of the evidence. It does **not** stop every fake (a policyholder who willingly pays is not detected), which is why the saving stays a **pilot measurement** (the actuary test: insurer saves ≥ 12 × price).

### 1.5 "The money is gone — so how does anyone profit?"
- **The money is gone.** Once a coerced transfer settles and is withdrawn, VUKA **does not recover it** — and we never claim to.
- **Both payers still profit, without recovering a cent.** The insurer saves the value of the **fake claims it would otherwise pay** plus handling; the bank saves the **cost of the disputes it no longer escalates** plus churn.
- **The only path to recovering the money:** the **PROPOSED bank protective signal** (ADR-0037) — a hold on new-beneficiary/large transfers on a duress signal, before they clear. Partner-dependent, **not live**.

### 1.6 Why the whole book (ubiquity logic)
A fraudster will not opt into a test. If VUKA were optional, the people most likely to fake a claim would be the ones who don't have it — so the insurer extends it across the book, the way cover is conditioned on a working device. On the whole book, a claim **without** a record is the exception, not a loophole. **"Everyone needs VUKA" is a consequence of the anti-fraud logic, not an assertion.**

---

## 2 · Blockchain compliance & eligibility in South Africa

### 2.1 Can we legally use / host a blockchain here?
**Yes.** No South African law requires a licence to **use** a public distributed ledger, or to **host a node or a mirror**. The regulated activities are narrower:
- **CASP licensing (FAIS / FSCA).** Applies to **financial services in respect of crypto assets** — advice, intermediary and investment management. The FSCA declared crypto assets a financial product in Oct 2022; CASP licensing began 1 Jun 2023. **We do not render any of those services.**
- **FIC Act (AML/CFT).** CASPs are accountable institutions. **On our reading, we are not a CASP** — we do not exchange, custody or transfer value.
- **What we actually do:** we anchor a **33-byte typed hash** to an existing public network (Hedera) and read it back from a public mirror. **We do not create or operate a consensus network.**
- **Holding HBAR:** we hold a **small amount of the network's own utility token (HBAR)** to pay message fees — an operating cost, not an investment, and not a CASP activity.

### 2.2 Operational gates (not licences)
- **Exchange control.** Buying HBAR to fund fees may touch SARB exchange-control rules (the AD Manual restricts cross-border transfers to purchase crypto assets). **Confirm the funding route with counsel / SARB guidance.**
- **POPIA.** Nothing personal on-chain; only a hash. **Information Officer registration pending** (`docs/POPIA-IO-REGISTRATION.md`).
- **RICA.** No interception; raw audio never stored (`docs/RICA-POSITION.md`).
- **NPS Act / SARB.** We do not move money; not a payment-system participant.

### 2.3 What we can say confidently
> **We can deploy this in South Africa. There is nothing to license: we don't build or run a blockchain, we hold no customer crypto, and we move no money.** *(Our reading of the definitions, not a regulator's clearance — counsel to confirm; `docs/ANCHOR-RATIONALE.md` §"FSCA/SARB".)*

---

## 3 · ECTA (evidence)

### 3.1 What ECTA is — and is not
The **ECTA** is the **Electronic Communications and Transactions Act 25 of 2002** (spell it out in full on any slide). It is South Africa's **general law on electronic records and transactions** — it predates blockchain and applies to **any "data message"**, in any context. It is **not** a financial or blockchain statute.
- Do **not** confuse it with the **Electronic Communications Act 36 of 2005 (ECA)** — that is the telecoms/broadcasting law, and it is not our hook.

### 3.2 Why it is our hook — s15
- **s15(1):** a data message is **not inadmissible merely because it is electronic**.
- **s15(2):** the court gives it **due evidential weight**.
- **s15(3)** — the weight turns on: **(a)** how it was **generated, stored or communicated**; **(b)** how its **integrity was maintained**; **(c)** how the **originator was identified**; (d) any other factor.
- Our signed, hash-chained, independently anchored record attacks exactly (a), (b) and (c).

### 3.3 Phrasing
> **Say:** "built to maximise the **ECTA** (Electronic Communications and Transactions Act) **section 15** reliability factors."
> **Never say:** "court-admissible." ECTA makes a data message admissible in principle; whether a court accepts a given record is for the court. Our claim is the statutory factors, not the outcome.

---

## 4 · Tokens & deployment economics
- **We issue no token** — no governance token, no coin, no ICO. Hedera is governed by its council. A token would add securities, tax and AML exposure for zero benefit (ADR-0034/0035).
- **Only token involved:** the network's utility token (**HBAR**) for fees.
- **Cost:** anchored ceiling **R569.47/month at any member count** (`ESTIMATE`, spec §10) — hourly ≈ R9.34, immediate capped ≈ R560.13; OpenTimestamps → Bitcoin free. Printed by `scripts/economics_vigil_anchor.py`.

---

## 5 · Privacy & the access model
- **POPIA s26:** biometric information (incl. voice/video) is special personal information. **Nothing personal or biometric on-chain** — a keyed hash of a pseudonym. Correction/deletion ss 24–25; erasure = delete the off-chain payload. **No audio stored** (YAMNet emits a label and a score; raw audio discarded).
- **Access:** the **hash** is public (anyone verifies); the **evidence** is encrypted to a **victim-held key**. **Bank/insurer** pull it per case on her consent; **court/SAPS** on legal process; **guardians** are a **blind backup**. **The record the victim holds and the one the bank/insurer/court audits are the same chain — so they always match.**

---

## 6 · Technical honesty (what is not yet proven)
- **VIGIL detection** — recall, false alarms, latency, battery, heartbeat, delivery, false `no_answer`: **not measured** (M1–M7, spec §16). "Not measured" is the answer until Vukosi posts n.
- **ANCHOR** — **not deployed** (slice 1 only); the verify page is slice-1 work.
- **Attestation** — **`stored_unverified`** (gap G32): a signature proves a key was used, not that the microphone heard a real event.
- **The claims-reduction** — a **pilot measurement**, not a promise.

---

## 7 · Competition (one line each)
- **Detection tools** (Google Personal Safety, Apple Check In, panic apps) notice — but produce **no proof**.
- **Evidence tools** (OpenTimestamps, Bernstein, Truepic/C2PA) prove — but **detect nothing**.
- **Duress PINs** (Discovery Bank Panic Code) work only if you can **type**, inside **one bank**.
- **Insurer fraud tools** (Verisk, FRISS, Shift, Bdeo) **score** claims — they don't create a contemporaneous record.
- **Everybody owns one half. Nobody owns both.** That is VUKA.

---

## 8 · Sources
- ASISA media releases 2022–2024 (fraud/dishonesty cases; R1.4bn prevented; R131.6m lost).
- ICB Annual Reports 2024/2025; ICB "About us" (5–12% of claims).
- NFO Annual Report 2025; OBS Annual Report 2024; The Citizen, 16 Mar 2026.
- SABRIC Annual Banking Crime Statistics 2025.
- FSCA/FAIS CASP licensing (FSCA press releases, 2024–2026); FIC Act (CASPs as accountable institutions).
- ECTA (Act 25 of 2002) s15; ECA (Act 36 of 2005) — for the distinction.
- POPIA (Act 4 of 2013) ss 24–26; `docs/POPIA-IO-REGISTRATION.md`; `docs/RICA-POSITION.md`.
- `docs/ANCHOR-RATIONALE.md`; `docs/VUKA-2-SPEC.md` §10, §13, §16; `docs/STAGED-DURESS-DEFENCE.md`; ADR-0034/0035/0037.
- Nedbank; Santam; Kelly Insurance (K&R exclusions); FBI virtual-kidnapping alert (2025).
