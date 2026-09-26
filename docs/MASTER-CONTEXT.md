# MASTER CONTEXT — read first, every session, by every person and every tool

> One page. It does not change shape. If you read nothing else before starting work, read this.
>
> Seven people across four universities are driving different AI tools that share no memory with each other. This file is the memory. **Owner: Khutso Mothopa.** Anyone may propose a change; Khutso makes it, in a PR, with a `docs/build-log/entries/` file.
>
> **v3 — 23 September 2026.** Rewritten by Lethabo (co-lead) for the VIGIL + ANCHOR pivot (ADR-0034 to ADR-0038) and the **published** judging criteria. Khutso reviews and owns it from here.

---

## 1 · The event, and what it actually asks of us

| | |
|---|---|
| Event | **Geekulcha Annual Hackathon 2026** — Fri 25 Sep 16:00 to Sun 27 Sep 16:00, Centurion + virtual |
| Hosted with | **CPSI** (Centre for Public Service Innovation), powered by **Telkom** |
| Our track | **Blockchain for Impact Use** — *"Putting Blockchain for practical and impactful use — teams are challenged to come up with commercially viable use cases."* |
| Theme | **BUILD FOR USE** — "every solution must be genuinely ready for real-world deployment: with identified users, a validated problem, security-by-design, a sustainability plan, and measurable impact" |
| Team | **SONAR** — seven members, four universities |
| **Final submission** | **Sunday 27 September, 09:00 SAST.** No submission, no pitching. (The old "15:00" is wrong.) |

**The theme is a question, and it is the only question:**

> ### "Would a real user trust and use this?"

**Programme deadlines** (Sonke programme export, 23 Sep):

| When | What |
|---|---|
| Fri 14:00–15:30 | Arrive with ID and **an item to donate**; virtual check-in from 15:30 |
| Fri 19:00–20:00 | Problem statement with mentors — **no more than 2 paragraphs, real data cited** |
| Sat 11:00–12:00 | DevLabs — every team represented |
| **Sat 12:29–12:30** | **Submit the updated SSDLC** (our internal deadline: 11:00) |
| Sat 14:00–17:00 | War Room — 12 minutes with the panel |
| Sat night | **Lean Business Canvas on Sonke, with figures** |
| **Sun 08:59–09:00** | **FINAL SUBMISSION**: more than 10 slides (problem justification with charts and pictures, solution, user journey story, technological architecture, competitive analysis, **data privacy policies**) + **demo video under 90 s** |
| Sun 10:00–12:30 | **3-minute sales pitch**; the panel rules "pay full prize / pay half prize / not buying" |
| Sun 13:15–15:30 | Top 12: 5-minute demo-focused presentation + 3 minutes Q&A |

---

## 2 · The judging criteria — published

| | Criterion | Weight | What it asks |
|---|---|---:|---|
| **I** | Innovation and Creativity | 15 | New or improved, creatively thought through, impact on intended users |
| **T** | Technical Implementation | 15 | Fit for purpose? Does it work? Technologies fit for scale? Efficient? |
| **U** | Usability and Design | 10 | Easy to use, appealing, easy flow, **can it be used tomorrow?** |
| **S** | Security and Ethics | 10 | Risks and mitigations, policies, considerate |
| **B** | Business and Presentation | 15 | A sound business case, market potential — **"as a judge, are you buying?"** |
| **Q** | Bonus: Quantum Tech | 5 | Outlined (2), implemented and integrated (more) |

**Every piece of work names its criterion letter.** The old C1–C4 selection criteria are retired; rows tagged C1–C4 before 23 Sep keep their tags as history.

---

## 3 · What the organisers actually said

> **"Still very worried about the overuse of AI in your solution which tends to move off from the sense of reality and provide an uneasiness to scale afterwards."**

**Our answer:** the only model VUKA ships is a small on-device sound classifier that outputs a label and a score (ADR-0038). Everything load-bearing — the check-in, the guardians, the signed hash chain, the public anchor — contains **no machine learning at all**. No LLM, no RAG, no agent framework.

---

## 4 · The product and the thesis, in one line each

> **When you can't ask for help, VIGIL notices. When nobody believes you, ANCHOR proves when.**
>
> **The anchor proves when, not what.** Every design decision makes the system more **checkable**, not more capable.

- **VIGIL** — an Android app that notices duress during a journey the user starts, asks a discreet "Journey check", and alerts the people the user chose.
- **ANCHOR** — one signed hash chain per person; every PIN-gated outcome anchored to Hedera within about a minute; a stranger can verify an exported record without trusting us.
- **Parked, not deleted:** KHAYA, UMOJA, cameras, faces, private-security dispatch (ADR-0034).
- **Spec:** `VUKA-2-SPEC.md`. **Fraud defence:** `STAGED-DURESS-DEFENCE.md`. **Money:** `ECONOMICS-VIGIL-ANCHOR.md`.

---

## 5 · The showcase — the one thing to demonstrate

### *A person's duress record, verified by a stranger.*

Nomsa's night, `SIMULATED` and labelled: a scream is detected → "Journey check" → she enters her duress PIN and the screen looks exactly like a normal check-in → her guardians are alerted with "Don't call or text them. Call 10111." → `sim_bank` holds new beneficiaries with a routine message → the check-in outcome is anchored to Hedera **before** the transfer attempt → a stranger drops her exported record on the verify page, and every hash, signature, Merkle path and ledger timestamp checks out, straight from the public mirror node.

Phone mirrored beside the live panel: **the screen that doesn't change, next to the ledger that does.**

---

## 6 · The honesty ledger — claims we refuse to make

| Never say | Say instead |
|---|---|
| "proof of duress" / "proves she was coerced" | "proves **when** the signal existed, and that it hasn't changed" |
| "invisible" / "the attacker sees nothing" | "**discreet** — Android's microphone indicator is visible" |
| "always on" / "works offline" | "**journey mode**; detection works offline, **delivery needs data**" |
| "court-admissible" | "built to maximise the ECTA s15 reliability factors" |
| "unhackable" · "unbiased AI" · "prevents crime" | — (no pentest; no bias evaluation; unmeasured) |
| any detection accuracy | "not measured" until `VUKA-2-SPEC.md` §16 publishes it with n |
| "a VUKA record is required for a claim" | "**the absence of a record is never evidence against anyone**" |
| "we push criminals toward physical crime" | nothing — the evidence doesn't support it |

**And three positive obligations:**
- Anything simulated carries `sim_` in code and **SIMULATED** on screen, and is named aloud. Testnet is called testnet.
- **"If the phone is switched off before anything is detected, nothing escalates"** goes on the honesty slide.
- **"Not measured" is a complete and acceptable answer.**

---

## 7 · Claim tagging — mandatory in every artefact

| Tag | Means |
|---|---|
| `FACT` | Verified, with the command or source that produces it |
| `ESTIMATE` | Calculated from stated assumptions, which are named |
| `ASSUMPTION` | Believed, not checked — and we say who would check it |
| `PROPOSED` | Designed, not built |

---

## 8 · The figures that are currently right

Full provenance in `EVIDENCE.md` ("Verified 23 September 2026").

| Figure | Value | Tag |
|---|---|---|
| Digital banking crime, SA | **R2.4bn gross losses (calendar 2025)**; incident and banking-app-share details remain secondary in `EVIDENCE.md` | `FACT` (gross losses); ⚑ (detailed figures) — SABRIC 2025 reporting |
| Kidnappings | **17,061 (2023/24)**, up 264% since 2014/15; **44% during a hijacking** | `FACT` — SAPS via ISS Africa |
| Bank fraud attempts rising | **75%** of SA banking leaders (vendor survey) | `FACT` — BioCatch, May 2026 |
| Price anchor | FNB GuardMe **R19.90/month** (press report, Apr 2022); iTOO express-kidnapping cover **from R22.50/month** (2026) | `FACT` — re-check GuardMe's current price |
| VUKA price | **~R20 per member per month**, partner-funded; app free | `ASSUMPTION` — the starting point, set 23 Sep. Babatunde owns it and may revise it during the build |
| Break-even | **10,973 members at R20** (rounded up; fixed cost itemised, incl. the anchoring ceiling and 5 stipends). The product alone (no stipends) breaks even at **469**. If the price or costs change, quote whatever the script prints | `ESTIMATE` — `scripts/economics_vigil_anchor.py` |
| Anchoring cost, whole network | **at most ≈ R570/month** (hourly R9.34 + immediate roots capped at one a minute), whatever the member count | `ESTIMATE` — Hedera $0.0008/message, R16.21/USD |
| Detection accuracy, latency, battery | **Not measured** — `VUKA-2-SPEC.md` §16 | — |
| ADRs | **37** | `FACT` — `git grep -c "^## ADR-" docs/adr.md` |
| TRL | **4** (ADR-0027), to be re-argued for VIGIL once the port runs | `ASSESSED` |

> 🔴 **Dead numbers — if you see these anywhere, they are wrong:** "R1.9bn / 97,975" as current · "85% of banks" · "R100 per member" · "10,861" or "10,901" as break-even (it is 10,973, rounded up) · "three independent signatures" (it is two independent principals) · "3% claims reduction saves R20.7m" · R1.09bn as a market or a saving · "Santam 3.7m policyholders" · "94% net margin" · the 318 ms (n = 10) historical figure presented as VIGIL's speed · "2.7m security officers" · "27 ADRs" · "440 tests" · bare "TRL 5" · "R1.30/month".

---

## 9 · Where everything else lives

| Need | Read |
|---|---|
| The one-page orientation | `../BRIEF.md` |
| Standing rules for every person | `../RULES.md` |
| Instructions for every AI tool | `../AGENTS.md` |
| **Your own work order** | `../team/<yourname>.md` |
| The build specification | `VUKA-2-SPEC.md` |
| Why a faked event doesn't win | `STAGED-DURESS-DEFENCE.md` |
| Who pays and why | `ECONOMICS-VIGIL-ANCHOR.md` |
| What we said we'd do, ticked | `CHECKLIST.md` (section P3) |
| What is true and how we know | `EVIDENCE.md` |
| What is broken, published | `OPEN-GAPS.md` |
| Decisions and why | `adr.md` (ADR-0034 to ADR-0038 for the pivot); who accepted them: `ADR-ACCEPTANCE-RECORD.md` |
| What changed and why | `build-log/entries/` |
| Shared files — claim before editing | `OVERLAPS.md` |

---

## 10 · The recall rule — four review gates before anything reaches a judge

Before any iteration, any new concept and any artefact that reaches a judge, re-read this file and pass four gates:

1. **Fraud red-team** — how could someone misuse this feature to stage an event or fool a bank or insurer? Is the answer in `STAGED-DURESS-DEFENCE.md`?
2. **Build for use** — does it work on a budget 2–3 GB Android phone, with bad signal, for a stressed person at night? Or is it decoration?
3. **Economic integrity** — does it keep the R20 model honest, and does every number trace to `scripts/economics_vigil_anchor.py` or `EVIDENCE.md`?
4. **Privacy by design** — does it collect less, keep less, hide nothing from the user and nothing about duress from anyone who shouldn't know?

Then name the **criterion letter** (I / T / U / S / B / Q) and how the work answers **"Would a real user trust and use this?"** If it serves none, say so and drop it.

> **It forgets you. It never forgets what it did.**
