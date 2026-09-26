# VUKA — War Room Pitch

> **Spoken target:** ≤560 words. **Actual: 550.** One job per beat, drafted to a hard budget.
> **Companion files:** `context.md` · `pitch-deck-outline.md` · `docs/reviews/ANCHOR-ACCESS-MODEL-ADR-PROPOSAL.md`.
> **Read `docs/MASTER-CONTEXT.md` §2 for the judging criteria** (I 15 · T 15 · U 10 · S 10 · B 15 · Q 5).

## Word budget (spoken)

| Beat | Job | Criterion | Words |
|---|---|---|---:|
| 1 · Hook | Make them feel the problem | I, B | 97 |
| 2 · Problem | Why nothing today fixes it | I, B | 93 |
| 3 · Solution | What VUKA is | I | 32 |
| 4 · How it works | The mechanism | T, U | 100 |
| 5 · Why it works | The sale | I, T | 77 |
| 6 · Business | There is a business | B | 50 |
| 7 · Compliance | Neutralise the four objections | S | 39 |
| 8 · Ask | Confident close | B | 55 |
| | | **Total** | **543** |

---

## Part 1 — The Pitch

### Beat 1 — Hook

People are forced to move their own money under threat. It happens in many scenarios — in cars, in homes, at ATMs, on the street, in taxis. The attacker doesn't need a weapon. He needs her thumb and her phone. She makes the transfer. Her face. Her fingerprint. Her phone. And when she tries to prove she was forced — there is nothing. No record of the threat. Just a payment that says she did it. This is coerced transfer. It can happen to anyone whose phone is their bank. And it leaves the same hole every time.

### Beat 2 — Problem

That's coercion — and at its worst, express kidnapping. Nothing today fixes it. The bank holds the transaction, not the duress, so it cannot resolve what it cannot see. The insurer pays first, and a forced transfer looks exactly like a normal one — so it pays a fraudster or fights a real victim. Every tool fails the same way. A panic button needs a free hand. A duress PIN, you must type. A fraud score is a guess, after the fact. An affidavit is just her word. She did everything right, and she still loses.

### Beat 3 — Solution

VUKA notices duress without a button, and proves when it happened — so a bank or an insurer can check the record without trusting us. She gets what she never had: proof.

### Beat 4 — How it works

She starts a journey. VIGIL listens on the phone — for a scream, a shout, breaking glass. It doesn't scream back. It asks a quiet question: a Journey check. She answers with her normal PIN. Or with a duress PIN — and it looks exactly the same. Same screen, same timing. The man beside her sees nothing. But her guardians are alerted, and a record is created. Signed. Chained to her alone. A fingerprint of it goes to public ledgers. Not her name. Not her voice. A fingerprint anyone can check. And the record itself stays with her. She holds the key.

### Beat 5 — Why it works

Here's why it wins. Look at everyone else. Half the market detects, but gives you no proof. The other half proves, but detects nothing. A bank's duress PIN works only if you can type, inside one bank. Everybody owns one half. Nobody owns both. VUKA is the only design that notices without her lifting a finger, and hands back a record a stranger can check. For the first time, she holds evidence someone else can verify.

### Beat 6 — Business

Two people pay. The insurer pays per member, per month — about fifty rand. The bank pays per case — fifteen rand — when it pulls a verified record. She pays nothing. Break-even is three thousand seven hundred and seventy-four members. The model carries the infrastructure cost from the first rand.

### Beat 7 — Compliance

Nothing personal ever touches the ledger — only a fingerprint, and she holds the key. Blockchain is legal here; we are not a financial service and we hold no crypto. No tokens, no coin. Built for the ECT Act.

### Beat 8 — Ask

Here's what we want from this room. One insurer, five thousand members, twelve months — let's measure what this is worth. One bank, so we can cost a single dispute. And if you know the person who owns this problem, introduce us. We're not asking you to believe us. We're asking you to check us.

---

## Part 2 — Q&A Prep (not spoken)

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
| R50 per member/month (working); R15 per case (proposed); break-even 3,774; infra carried by the model | `scripts/economics_vigil_anchor.py`; `docs/ECONOMICS-VIGIL-ANCHOR.md` |
| Blockchain is legal here; not a financial service; no crypto; no tokens | ADR-0034/0035; `context.md` |
| Built for the ECT Act | ECTA 25 of 2002 s15(3)(a)–(c) |

### Governance tokens — the rationale
**None.** The ledger anchors a hash; there is nothing to trade. A token would create securities, tax and AML obligations for zero product benefit. **No token, no coin, no ICO** (ADR-0034/0035).

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
- **Access model:** public hash; evidence encrypted to a **victim-held key**; bank/insurer per-case on her consent; court/SAPS on legal process; guardians are a **blind backup**.
