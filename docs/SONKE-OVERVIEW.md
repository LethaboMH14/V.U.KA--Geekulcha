# Sonke Project Overview — VUKA

> **STALE — do not quote.** This page still describes the retired four-layer design and contains retired figures. It is being rewritten for VIGIL + ANCHOR under checklist row P3.B10 (Babatunde, reviewer Lethabo, due Thu 24 Sep 20:00).

> **Superseded in part — 23 Sep 2026.** VUKA is now **VIGIL + ANCHOR** (ADR-0034). Anything here about KHAYA, UMOJA, cameras, entities, the R299 model or the four-layer design is parked lineage, not the current product. Current spec: `docs/VUKA-2-SPEC.md` · economics: `docs/ECONOMICS-VIGIL-ANCHOR.md` · context: `docs/MASTER-CONTEXT.md`.

> This is what judges read on the workspace. Lead with the real story, not "AI-powered." The organisers said: *"Stop saying 'Solution X is AI-powered.' Make your project overview reflect real-life stories — that's what makes your solution authentic. Use of AI is not impressive at this hackathon — we are looking for solutions that have a sense of reality and can be used after the hackathon, by real people."* — Tiyani Nghonyama, Lead Facilitator, 15 Sep 2026. `FACT`

---

## What VUKA is

**VUKA is a community-safety network that a stranger can verify without our help.** It is built for South African estates, suburbs and streets — the places where WhatsApp is the safety infrastructure and armed response is the only escalation. It works by layering a checkable safety record on top of a community that already exists.

Every other safety product — the camera network, the patrol car, the WhatsApp group — operates on a **trust-me model**. The evidence belongs to the provider. VUKA publishes what it did somewhere we cannot reach: a public hash chain that anyone can check without logging in, without asking us, and without our cooperation.

**The load-bearing parts — the human gate, the two-signature rule, the hash chain, the public anchor, the three-second audio ring buffer — contain no machine learning at all.** AI supplies uncertain inputs. It never decides what happens to a person.

---

## The real story — three minutes that make the difference

**Musa** works as a gardener at an estate in Centurion. He comes on Mondays, Wednesdays and Fridays, 7:00 to 15:00. On his first day through the gate, KHAYA — the camera-and-sensor unit on the entrance pillar — sees a face it doesn't recognise. It records the sighting. On the third visit, recurrence fires: same face, same gate, three visits in two weeks, not whitelisted. The machine does the only thing it is allowed to do: it marks him `watch_candidate`.

**That is the machine's ceiling.** It cannot accuse. It cannot dispatch. It cannot flag.

An operator — a security company officer working for the estate — opens the queue. She sees the sightings, the vehicle plate, the time pattern. She recognises a delivery schedule. She dismisses. The dismissal is written to the evidence chain. Musa never knew he was reviewed.

**Thandi** lives on the same estate. Her car leaves every morning at 8:10 and returns at 17:30. On the evening of 19 March, at 21:43, a different car enters with a plate the system has never seen. Nineteen minutes later, it leaves. Two days later, Thandi discovers her flat was burgled. She opens the VUKA member app. She requests her file. She receives every sighting, every decision, and a proof package — a Merkle path to a public anchor — that verifies against a public verifier with no cooperation from us. She hands it to her insurer. She hands it to the police. She handed them a record they can check, not a claim they have to trust.

---

## The four layers — and none of them is just AI

| Layer | What it does | The AI answer |
|---|---|---|
| **KHAYA** · the sensors | RGB camera, microphone, on-device processing. Runs on a Raspberry Pi-class appliance. The on-device model — a lightweight acoustic classifier and a person detector — runs in an Android app. No cloud dependency; works offline | Two pretrained models serve as **uncertain inputs**. They detect a person or classify a sound. They do not identify anyone and they do not decide anything |
| **UMOJA** · the server | Monitors the region. Detects patterns — is the same entity appearing at the same gate on the same schedule? Does the plate move with the face? — and stops at `watch_candidate` | **The fusion engine is a calibrated log-odds model with hand-set weights.** It is not a neural network. It is a decision table you can read, with every factor and its contribution laid out |
| **The human gate** | An operator reviews. She sees evidence, not a verdict. She dismisses, verifies concern, or whitelists. Whitelist requires **two distinct authorised signatures**. The refused single-signature attempt is itself anchored | **No code path sets `flagged`.** Only an identified human may escalate. A biometric match is a lead for a human, never a verdict |
| **ANCHOR** · the evidence chain | Every sighting, every human review, every whitelist and every refused attempt is a sequential entry in an append-only hash chain. Periodically anchored to a public verifier via OpenTimestamps | **Zero AI.** Pure cryptography. A Merkle tree + a public commitment. No model, no training, no uncertainty |

---

## The numbers that are currently right

| Figure | Value | Tag |
|---|---|---|
| Private security officers vs police in SA | **637,675 active vs 155,231 sworn — roughly 4:1** | `FACT` — PSiRA 2024/25; SAPS Mar 2025 |
| Private security industry size | **R87bn (2024)**, government segment R7bn | `FACT` — Stats SA |
| Target price | **R299/month** per household, modelled, not quoted | `ESTIMATE` |
| Technology readiness | **TRL 4**, two subsystems argued at TRL 5, ceiling named — ADR-0027 | `ASSESSED` |
| Architecture decisions | **27** | `FACT` — `docs/adr.md` |
| Detection → alert render | **318 ms p95, n = 10**, budget 2,000 ms | `FACT` — historical, predecessor-verified |

---

## What competitors know that we do not

Vumacam operates 2,000+ ANPR cameras across South Africa. Fidelity ADT has the largest armed-response fleet in the country. The WhatsApp group on your street has zero cost and everyone is already in it. **We know who they are, what they do better, and why our model is different** — see `docs/COMPETITORS.md` for the full mapping of every documented criticism of an incumbent to a VUKA mechanism designed to answer it.

---

## Why a real user would trust this

Because they can check it themselves. Not log in. Not ask us. Not take our word. Run a proof against a public verifier and see with their own eyes that the hash chain is intact and anchored.

And because the machine cannot accuse them. The worst it can do is mark them for review — and if they are reviewed and cleared, the clearance is itself part of the permanent record, and nobody can delete it.

---

## What we refuse to say

We do not claim to identify criminals. We do not claim to prevent crime. We do not claim our system is unbiased, unhackable, or court-admissible. We do not round our readiness up. We publish the four specific reasons we are not at TRL 6, because that is precisely the behaviour the hackathon theme is asking for.

---

## The team — seven people, four universities

| Person | University | Role |
|---|---|---|
| **Lethabo Hoaeane** | UNISA | Co-lead — architecture, product, UX, final review |
| **Sibusiso Khumalo** | Wits | Co-lead — server, anchor, CI, demo orchestration |
| **Mutarisi Chibaya** | Pretoria | Member-facing and operator screens |
| **Vukosi Khoza** | Wits | Sensors, edge runtime, hardware, power |
| **Ipeleng Constance Modise** | TUT | Security design, threat model, red team |
| **Khutso Mothopa** | Wits | Requirements, evidence, traceability |
| **Babatunde Ojo** | Pretoria | Business case, economics, presentation |

---

*Written for the Sonke workspace, 15 September 2026. Version controlled in `docs/SONKE-OVERVIEW.md`. Update this file when figures change; paste to Sonke when the workspace accepts edits.*