# VUKA

**When you can't ask for help, VIGIL notices. When nobody believes you, ANCHOR proves when.**

VUKA (isiZulu for *wake up*) is a personal-safety app for South Africa with one property no competitor has: **its record can be checked by a stranger instead of trusted.**

**Team SONAR** · Geekulcha Annual Hackathon 2026 · Blockchain for Impact Use · Sector: Safety · `#GKHack26`

> **Status, stated honestly:** the build is in progress for 25–27 September 2026. This repository holds the specification, decisions, contracts, economics and governance. The Android app and the ANCHOR server are being built now against [`docs/VUKA-2-SPEC.md`](docs/VUKA-2-SPEC.md). Nothing below is claimed as working until its test or measurement is in [`docs/EVIDENCE.md`](docs/EVIDENCE.md).

---

## The problem

In South Africa your bank app is both the vault and the key, and both sit in your pocket. In an express kidnapping, criminals force you to unlock your phone and transfer your money. SAPS recorded **17,061 kidnappings in 2023/24**, up 264% in ten years, and **44% happened during a hijacking**. Digital banking crime cost South Africans **R2.4 billion in 2025** across 110,074 incidents. (Sources: SAPS via ISS Africa; SABRIC 2025.)

You make the transfer yourself, so every bank record says you authorised it. Every safety product asks you to press a button, but coercion takes away your free hand and your privacy. Afterwards there's no record of the attack. Only the transaction.

## What VUKA is

| Layer | What it does |
|---|---|
| **VIGIL** — the phone | During a journey you start, it listens on the device for a scream, a shout or breaking glass. It asks a discreet "Journey check" that you answer with your normal PIN, or a duress PIN that looks identical. If you can't answer, the **server** alerts the guardians you chose: *"Don't call or text them. Call 10111."* |
| **ANCHOR** — the record | Every event is signed by the device or person that produced it and chained per person. A typed 33-byte message is published to the **Hedera Consensus Service**, with OpenTimestamps → Bitcoin as a second anchor. Anyone can verify an exported record without trusting us. |

**The anchor proves *when*, not *what*.** It proves a record existed before the money moved and hasn't changed since. People decide what happened. How the design resists a staged, fake event is in [`docs/STAGED-DURESS-DEFENCE.md`](docs/STAGED-DURESS-DEFENCE.md).

## How much AI is in this

One small model: **YAMNet**, running on the phone, which labels a sound and gives a score. There is no LLM, no RAG and no agent framework. The check-in, the guardians, the signatures and the anchor contain **no machine learning at all** ([ADR-0038](docs/adr.md)).

## Why a blockchain, and what it costs

A bank, an insurer or a court can independently check a record's **integrity and timing** — that it hasn't changed and when it was written — without trusting VUKA or the claimant (spec §17: when, not what). Only 33-byte typed messages go on the ledger, never personal data. Anchoring costs about **R570 a month at most for the whole network**, however many members there are ([ADR-0035](docs/adr.md), [`scripts/economics_vigil_anchor.py`](scripts/economics_vigil_anchor.py)).

## Business model

The app is **free to users**. A bank or insurer partner funds about **R20 per member per month** as a value-added benefit, on the same shelf as the panic buttons banks already sell. Break-even is **10,973 members** (`ASSUMPTION` price; `ESTIMATE` costs). See [`docs/ECONOMICS-VIGIL-ANCHOR.md`](docs/ECONOMICS-VIGIL-ANCHOR.md), and run the numbers yourself:

```bash
python scripts/economics_vigil_anchor.py
```

## What we will not claim

"Proof of duress" · "invisible" (Android shows a microphone indicator — it is *discreet*) · "always on" (it runs in journey mode) · "court-admissible" · any detection accuracy before it is measured with n. **If the phone is switched off before anything is detected, nothing escalates.** The absence of a VUKA record is never evidence against anyone. The full list is in [`docs/MASTER-CONTEXT.md`](docs/MASTER-CONTEXT.md) §6.

## Repository map

| Path | What |
|---|---|
| [`docs/VUKA-2-SPEC.md`](docs/VUKA-2-SPEC.md) | The build specification: requirements, entry format, canonical form, Merkle, escalation, tests, measurements |
| [`docs/adr.md`](docs/adr.md) | Every architecture decision; ADR-0034 to ADR-0038 cover the pivot |
| [`docs/MASTER-CONTEXT.md`](docs/MASTER-CONTEXT.md) · [`BRIEF.md`](BRIEF.md) | What we are judged on, the honesty ledger, and a one-page orientation |
| [`docs/EVIDENCE.md`](docs/EVIDENCE.md) · [`docs/OPEN-GAPS.md`](docs/OPEN-GAPS.md) · [`docs/CHECKLIST.md`](docs/CHECKLIST.md) | What's true, what's broken, and what we committed to |
| `app/` | VIGIL, the Android app (being built) |
| `anchor/` · `server/` · `contracts/` · `shared/` | ANCHOR chain, server, API contract and the shared canonical-form, signature and Merkle code |
| `dashboard/` | The live ANCHOR panel and the "verify a record" page |
| [`team/`](team/START-HERE.md) | Each person's work order; start at `team/START-HERE.md` |
| [`archive/2026-09-four-layer/`](archive/2026-09-four-layer/README.md) | The earlier four-layer design (KHAYA, UMOJA), parked and kept as lineage |

## Team

Seven members from four universities. Lethabo Hoaeane and Sibusiso Khumalo are joint leads. Roles and work orders are in [`team/`](team/README.md).

## Lineage

VUKA grew out of two earlier projects, which are kept private as lineage. The four-layer design that came before this pivot is in [`archive/2026-09-four-layer/`](archive/2026-09-four-layer/README.md) and is not presented as the current product.

MIT licence.
