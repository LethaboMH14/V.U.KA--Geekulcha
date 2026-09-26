# VUKA — War Room Pitch

> **Spoken target:** 3 minutes (competition round 1). **Actual: 327 words (~2:20 at 140 wpm).** Six beats, hard caps. Under 3:00.
> **Companion files:** `context.md` · `pitch-deck-outline.md` · `docs/reviews/ANCHOR-ACCESS-MODEL-ADR-PROPOSAL.md`.
> **Read `docs/MASTER-CONTEXT.md` §2 for the judging criteria** (I 15 · T 15 · U 10 · S 10 · B 15 · Q 5).

## Word budget (spoken)

| Beat | Job | Cap | Words |
|---|---|---|---:|
| 1 · Hook | Make them feel the problem | 55 | 52 |
| 2 · Problem | Why nothing fixes it | 65 | 48 |
| 3 · Solution | What VUKA is (3-sec test) | 45 | 37 |
| 4 · How It Works (user view, demo) | What the user experiences | 80 | 79 |
| 5 · Why It Wins | The single differentiator | 70 | 70 |
| 6 · The Ask | Who pays + what we want | 45 | 41 |
| | | **Total** | **327** |

---

## Part 1 — The Pitch

### Beat 1 — The Hook

Imagine someone you love, alone at night, forced to hand over their phone. A stranger makes them open their banking app, and transfer their money. Their face. Their fingerprint. Their phone. Then he is gone — and there is no proof they were forced. Just a payment that says they did it.

### Beat 2 — The Problem

Nobody can tell a forced transfer from a willing one. In 2025, South Africans lost two point four billion rand to digital banking crime. If you have no proof, you cannot dispute your transaction — and the criminal wins. So now you are frustrated, and your money is gone.

### Beat 3 — The Solution

VUKA changes that. It notices duress without a button, and records when it happened. This is now proof that a bank, an insurer or a court can check. Now, for the first time, the victim is believed.

### Beat 4 — How It Works for the User (the demo)

A journey begins — then a scream. VUKA quietly asks: are you okay? A normal PIN says yes, and nothing is recorded. No answer — or the secret duress PIN — says no: a record is written, and their guardians are warned. That is how we tell everyday noise from real danger: the person answers, or the silence does. VUKA runs on Android only. We built this for POPIA: no name, no location, no voice is ever made public.

### Beat 5 — Why It Wins

Our direct competitors are detection tools: FNB GuardMe needs a panic press; Discovery's duress code needs a PIN. They only work if you can touch the screen. Under threat, you can't — so you have no proof. Evidence tools show something existed, but to dispute, you need proof you were coerced. VUKA does both: it detects on its own, and hands back proof anyone can check. That is why we win.

### Beat 6 — The Ask

The insurer pays twenty rand per member, per month, and stops paying fake claims. The bank pays per case, and settles disputes on evidence. The victim pays nothing. Switch VUKA on, and help fund the one point nine million rand pilot.

---

## Part 2 — Q&A Prep (not spoken)

### Cut from the 3-minute pitch — mapped to its beat
- **Beat 2:** R2.4bn digital banking crime, 2025 (SABRIC 2025, `FACT`); 110,000+ incidents; 17,061 kidnappings (2023/24), +264%, 44% during a hijacking; ASISA 16,520 cases / R1.4bn prevented; ICB 5–12% fraudulent; Ombud ~R4,962 / ~61 days **[evidence needed]**.
- **Beat 3:** Android-first, iOS a reduced subset (ADR-0008); the record cannot be backdated or edited.
- **Beat 4:** the demo is `SIMULATED`; on-device **offline** sound model, **no audio stored**; detection **not measured** (M1–M7); journey mode; normal PIN vs duress PIN; the duress screen is pixel-identical; guardians get the **alert only**; a **32-byte hash** on Hedera + daily OpenTimestamps→Bitcoin; payload encrypted and deletable; bank/insurer access **per case on consent — `PROPOSED`**.
- **Beat 5:** competitor detail — Discovery Bank Panic Code, FNB GuardMe, OpenTimestamps, Truepic, C2PA; "no tool we found does both."
- **Beat 6:** R20 between GuardMe R19.90 and iTOO R22.50; break-even 10,973 (469 product-only); actuary test R240/member/year; bank per-case fee R15 `PROPOSED`; the R1,884,583 build-up.
- **Always:** no tokens; not a financial service; POPIA + ECTA s15; the absence of a record is never evidence against anyone.

### Proof bank — every claim mapped to its source

| Pitch line | Source |
|---|---|
| Express kidnapping / forced transfer; she authorises it under threat | NFO and iTOO descriptions (FAnews, 19 Sep 2024); OBS Annual Report 2022 |
| She cannot prove coercion; a reported victim was refused a refund | NFO express-kidnapping case, via FAnews, 19 Sep 2024 |
| The bank holds the transaction, not the duress | Mechanism; SABRIC 2025 (banking app ≈89% of digital-banking-crime cases) |
| Insurers lose to fraudulent claims | ASISA 2024: 16,520 fraud/dishonesty cases detected; R1.4bn prevented; R131.6m lost |
| Fraud is a large share of claims | ICB: 5–12% of all claims submitted (`FACT` ⚑) |
| Banking disputes rising, slow, costly | NFO Annual Report 2025 (743 formal cases/month, +25.4%); OBS 2024 (R4,962.38/formal case); The Citizen, 16 Mar 2026 (~61 days) |
| A panic button needs a free hand | Namola ("hold for 2 seconds"); FNB GuardMe ("push the mobile panic button") |
| A duress PIN must be typed, and only inside one bank | Discovery Bank Panic Code, MyBroadband, 27 Mar 2025 |
| A fraud score is after the fact | Verisk ClaimSearch, FRISS, Shift Technology (claim-scoring, not evidence) |
| Half the market detects, no proof | Google Personal Safety; Apple Check In; Blackline G7 |
| The other half proves, no detection | OpenTimestamps; Bernstein; Truepic / C2PA |
| A 32-byte fingerprint to public ledgers (Hedera + Bitcoin) | `docs/VUKA-2-SPEC.md` §10; ADR-0035 |
| Nothing personal on the ledger; encrypted off-chain; deletable; she holds the key | spec §10 and §13; POPIA s26 |
| R20 per member/month (`ASSUMPTION`); per-case fee `PROPOSED`; break-even 10,973 at R20 (`ESTIMATE`); anchors: GuardMe R19.90 (FNB, Apr 2022), iTOO R22.50 | `scripts/economics_vigil_anchor.py`; `docs/ECONOMICS-VIGIL-ANCHOR.md`; `docs/EVIDENCE.md` |
| First-year funding ask **R1,884,583** (product/ledger R80,918 + one-off R3,665 + 5-person team R1,800,000 @ R30,000/month) | `scripts/economics_vigil_anchor.py`; `docs/MARKET-DATA.md` §4 |
| Blockchain is legal here; not a financial service; no crypto; no tokens | ADR-0034/0035; `context.md` |
| Built for the ECT Act | ECTA 25 of 2002 s15(3)(a)–(c) |

### How fake claims work — and what VUKA actually changes
- **Today, a coerced-transfer claim is just a story.** Someone says they were forced. There is no record of the coercion — the insurer has only their word, a police case (which can be fabricated), and a bank transaction that shows the transfer was **authorised**. So the insurer **pays blind, or fights blind.**
- **VUKA does not prove the duress was real** — the anchor proves *when*, not *what*. It is **not a lie detector.** What it does is give the claim **a record made at the time** — signed by the device, and anchored so it **cannot be backdated or edited**.
- **For a real victim:** the insurer can verify the timeline and settle faster and cheaper.
- **For a faker:** to match, they must have produced that same signed, anchored record at the moment it happened — the app armed, a real detection triggered, a device key signing it. And because the anchor locks the story early, their account has to survive **every other record** — CCTV, cell towers, the bank's own device fingerprint. Faking becomes harder and riskier; some fakes are deterred or caught.
- **The line we never cross:** the **absence** of a VUKA record is **never** evidence against a claimant. A genuine victim whose phone was off must not be penalised. **VUKA is a verification input, not a verdict.**
- **So the insurer's saving** = fewer fakes paid (deterred or caught) **plus** genuine claims settled faster and cheaper. Both are **pilot measurements, not promises.**

### How each stakeholder makes or saves money (the honest mechanism)
- **The money is gone.** Once a coerced transfer settles and the criminal withdraws it, VUKA **does not recover it** — and we never claim to. The value is *before* and *around* the payout, not the stolen cash.
- **Both payers still profit, without recovering a cent.** The insurer saves the value of the **fake claims it would otherwise pay** (plus handling time). The bank saves the **cost of the disputes it no longer escalates** (plus customer churn). **Neither saving depends on clawing the money back.**
- **Why it has to be on the whole book — the logic, not a demand.** A fraudster will not opt into a test. If VUKA were optional, the people most likely to fake a claim would be the ones who don't have it — so the insurer extends it across the book, the way cover is conditioned on a working device. On the whole book, a claim **without** a record is the exception, not a loophole. (This is why "everyone needs VUKA" is a *consequence* of the anti-fraud logic, not an assertion.)
- **The insurer saves** by **not paying fakes** it can now evidence against, and by **settling genuine claims faster and cheaper**. Genuine claims are ones it owed anyway; the saving is the **fabricated share plus handling time**. The pilot measures it — the actuary test is that the insurer saves more than twelve times the price per member, per year.
- **The bank saves** because a verified record **resolves a dispute without escalation**: an Ombud case costs the system **~R4,962** and **~61 days**, and **disbelieved customers leave**. The bank is **not liable for the loss today** (no mandatory reimbursement in SA), so its cost is dispute handling and churn — not the stolen money.
- **Where money can still be saved:** the **PROPOSED bank protective signal** (ADR-0037) lets the bank place its own hold on new-beneficiary or large transfers on a duress signal — so where the transfer has **not yet cleared or been withdrawn, funds can be frozen**. That is the only path to recovering the money itself; it is partner-dependent and **not yet live**.
- **The victim** gets the proof — and, where covered, faster reimbursement: the thing they never had.

### The funding ask — what we need, and how it is built
- **R1,884,583 for the first 12 months** (`ESTIMATE`): itemised product/ledger **R80,917.68** (12 × R6,743.14) + one-off insurance/registration **R3,665** (PI R2,615 + cyber R450 + CIPC R600) + a **5-person team at R30,000/month = R1,800,000** (`ASSUMPTION`).
- **The technology is R80,918/year** — the rest is the team. This is a runway, not a technology cost.
- **The ask on stage is distribution, not a member number:** an insurer or bank that switches VUKA on for its customers.
- **Legal counsel and the Hedera mainnet HBAR float are unpriced** and sit inside the contingency.

### Governance tokens & deployment economics — the rationale
- **We issue no token** — no governance token, no coin, no ICO. Hedera is governed by its council; there is nothing to trade. A token would add securities, tax and AML exposure for zero product benefit (ADR-0034/0035).
- **The only token involved is the network's own utility token (HBAR),** held in small quantity to pay message fees. That is an operating cost, not a security, and not a CASP activity (no advice, intermediary, exchange or custody).
- **Deployment cost is bounded and fixed:** the anchoring ceiling is **R569.47/month** at any member count (`ESTIMATE`, spec §10) — hourly roots ≈ R9.34/month, immediate roots capped ≈ R560.13/month; OpenTimestamps → Bitcoin is free. Printed by `scripts/economics_vigil_anchor.py`.
- **SA deployability:** the anchor records a hash — we do not process payments, move money, or hold customer assets. *(Counsel confirm — tracked with Ipeleng.)*

### Infrastructure cost — the breakdown
- **Anchoring ceiling: R569.47/month, fixed at any member count** (`ESTIMATE`, spec §10).
  - Hourly roots: 720 × $0.0008 × R16.2075 ≈ **R9.34/month**.
  - Immediate roots, capped: 43,200 × $0.0008 × R16.2075 ≈ **R560.13/month**.
- **OpenTimestamps → Bitcoin:** free.
- Printed by `scripts/economics_vigil_anchor.py`; a bounded fixed cost, never per member.

### POPIA / ECT Act detail (kept out of the pitch)
- **POPIA s26:** biometric information (read to include voice and video) is *special personal information*; a duress event is personal information. **Nothing personal or biometric goes on-chain** — we anchor a keyed hash of a pseudonym. Correction/deletion at **ss 24–25**; deleting the off-chain payload is the erasure mechanism. Information Officer registration is **pending**.
- **No audio is stored** — YAMNet emits a label and a score on-device; raw audio is discarded.
- **ECTA s15(3)(a)–(c):** weight turns on how the record was generated, how its integrity was maintained, and how the originator was identified. Never say "court-admissible"; we say **"built to maximise the ECTA s15 reliability factors."** Attestation is **`stored_unverified`** (gap G32).
- **Access model:** the public hash is open to anyone; the evidence stays encrypted to a **victim-held key**; the **bank/insurer** pull it per case on her consent; a **court/SAPS** compels production on legal process; guardians are a **blind backup**. **Critically, the proof the victim holds and the record the bank, insurer or court audits are the same chain — so they always match.**
