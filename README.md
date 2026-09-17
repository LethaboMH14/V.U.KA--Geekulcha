# VUKA

**You are not alone. You don't have to ask.**

VUKA — isiZulu for *wake up* — is a proposed community-safety network for South Africa, built on one property no competitor has: **it can be verified rather than trusted.**

Every decision this system makes about a person is written to a hash-linked record. Every hour, a 32-byte summary of those records is published to a public chain that has never heard of us. That does not make a record true. It proves the record existed *before anyone had a reason to change it* — and anyone, including someone who actively distrusts us, can check it without our cooperation.

**Team SONAR** · Geekulcha Annual Hackathon 2026 · Blockchain for Impact Use · Sector: Safety · `#GKHack26`

---

## The problem

You cannot open a bank account in South Africa without installing the app. So the authentication factor and the asset now sit in the same object, in the victim's own hand, secured by a biometric that can be compelled by force. The attack adapted: unlock, open the app, transfer, then drive to an ATM for the daily limit. **The victim performs the transaction, and every record the bank holds says they authorised it.**

Every existing safety product requires the user to *ask* — a button, an app, a call. All of it needs a free hand and a moment of privacy. **Coercion removes both.**

## The four layers

| Layer | Scope | What it guarantees |
|---|---|---|
| **VIGIL** | The person — Android, on-device, offline-first | Help that starts without her hands |
| **UMOJA** | The street — service, entity graph, risk layer | Whitelist before watchlist |
| **KHAYA** | The property — edge appliance, vision and acoustics | An alarm you stop switching off |
| **ANCHOR** | The record — hash chain, signatures, public anchor | Checkable by someone who distrusts us |

## How much artificial intelligence is in this

Less than you would expect, deliberately.

**Total autonomy in perception. Zero autonomy in consequence.** The system may decide what it is looking at entirely on its own. It may never decide what happens to a person.

The parts of this system that carry the weight contain **no machine learning at all** — the human gate, the two-signature rule, the hash chain, the public anchor, the three-second audio buffer. They are rules, hardware and mathematics, and they behave identically whether a model is right or wrong. Machine learning is one input among several, and it is never permitted to reach a conclusion about a person.

Two boundaries are enforced in code rather than in policy, so a change of mind cannot quietly weaken them:

- **The machine's ceiling is `watch_candidate`.** No code path sets `flagged`. Only `human_verify()` with an operator ID can. Grep for it — the absence is the test.
- **A whitelisted entity accumulates no suspicion**, so one operator able to whitelist alone could quietly switch off surveillance of one person. Whitelisting, camera disarm, threshold changes and record deletion therefore require **two-of-two signatures**, and the attempt is itself an anchored event.

Four AI-adjacent features were designed and then refused on the record: auto-dispatch on soft evidence, remote gate unlock, any countermeasure that injures, and a responder bounty. See [`docs/AI-AUTONOMY.md`](docs/AI-AUTONOMY.md).

---

## Status of this repository

**Documentation, coordination scaffolding and repository controls are complete and live here now.** This repository contains no application code and no fabricated appliance yet. Source is being ported file by file, with review and secret scanning, from two predecessor repositories built in July 2026. The predecessor history is deliberately **not** imported: this repository starts clean and stays clean.

The figures below are measurements taken in the predecessor codebases, which is the code being ported — **they are supplied results, not yet reproduced inside this repository.** Every figure is stated with the exact command that reproduces it in [`docs/EVIDENCE.md`](docs/EVIDENCE.md); none is rounded up.

### Built — exists, has been measured, or is verified against source

- Coordination scaffolding for seven people across four AI coding tools: [`RULES.md`](RULES.md), [`AGENTS.md`](AGENTS.md), one file per person in [`team/`](team/README.md), an append-only [`docs/BUILD-LOG.md`](docs/BUILD-LOG.md)
- Secret scanning live as **both** a pre-commit hook and a CI gate — see [`SECURITY.md`](SECURITY.md)
- A document-contract checker (`node scripts/check-docs.mjs`) that fails CI if a document's own claims drift from what the repository can show
- All four layers **implemented in the predecessor codebase** to a working, end-to-end state — porting into this repository is in progress
- Detection to alert render: **318 ms p95, 273 ms p50**, against a 2,000 ms budget — **measured over ten runs, n = 10**, in the predecessor codebase
- Hash-linked evidence chain with a verifier that recomputes every entry *and* every pointer, and returns the **first broken link by index** rather than a pass/fail boolean — predecessor codebase
- The human gate and the whitelist governance boundary, enforced in code — predecessor codebase
- **25 architecture decision records**, append-only, ported into [`docs/adr.md`](docs/adr.md) with a provenance table, dated before this hackathon was announced
- Risk layer over public SAPS open crime data, covering 17 of 18 target towns

### Designed, not built

- The VIGIL, UMOJA, KHAYA and ANCHOR application code, inside this repository — the port is in progress, see [`docs/HANDOVER.md`](docs/HANDOVER.md)
- Hourly Merkle batching, Ed25519 per-party signing, and publication via OpenTimestamps
- Subject access: a person requesting their own file with a verifiable anchor proof
- Deletion that removes the payload and retains the hash
- Five of six suspicion factors — one is implemented in the predecessor codebase, the rest are documented stubs
- The KHAYA appliance as fabricated hardware
- The proposed KHAYA bundle price of **R299/month is a model, not a quote.** Availability, response service, payment terms and deployment approval are unverified

### What currently fails

Published here because it is the only reason to believe the numbers that don't.

- **The crime forecast loses to a constant baseline** — MAE 0.484 against 0.246
- Fusion weights are hand-set from a cost matrix, not fitted. The parameter file self-labels *"PROVISIONAL — NOT fit on real data"*
- Face-match thresholds of 0.55 and 0.65 cosine are targets and are **uncalibrated**
- Bias evaluation has not been run on the face pipeline, so our stated answer to the NIST FRVT demographic differentials is itself **untested**
- No independent penetration test
- No computer-vision model we trained ourselves — vision is integration of pretrained models
- POPIA obligations not yet discharged: no retention TTL, no subject-access path, no deletion route

The full register, with an owner and a closing date against every item, is in [`docs/OPEN-GAPS.md`](docs/OPEN-GAPS.md) and [`docs/SDLC-GAP-ANALYSIS.md`](docs/SDLC-GAP-ANALYSIS.md).

### Claims we refuse to make

*"identifies criminals"* · *"court-admissible"* · *"unbiased AI"* · *"unhackable"* · *"prevents crime"* · any uncalibrated precision figure.

Anything simulated carries a `sim_` prefix, in the code and when we say it aloud.

---

## Technology readiness

**TRL 4, met and verified.** Components validated in a laboratory environment, in the predecessor codebase, running end to end on real hardware with a measured latency path and a contract-tested interface.

Two subsystems in the predecessor codebase — the evidence chain and the on-device sensing path — reached **TRL 5** there. What caps the system as it stands here is that **the appliance hardware has not been fabricated**, and application code has not yet landed in this clean repository. We would rather state that than round up.

---

## How to check this rather than believe it

| Claim | Check it by |
|---|---|
| 30 accepted + 2 proposed ADR records | [`docs/adr.md`](docs/adr.md) — clone and count by status |
| 318 ms p95, n = 10 | [`docs/EVIDENCE.md`](docs/EVIDENCE.md) — command and predecessor source |
| Commit and test counts | [`docs/EVIDENCE.md`](docs/EVIDENCE.md) — exact commands, not a bare number |
| No code path sets `flagged` | Grep for it, once the port lands. That is the test |
| The forecast fails its baseline | [`docs/OPEN-GAPS.md`](docs/OPEN-GAPS.md) — the numbers are in the repository |
| Secret scanning actually blocks a secret | `node scripts/test-security.mjs` — exercises the real failure path, not an assertion |
| Documents don't overclaim their own status | `node scripts/check-docs.mjs` |
| A whitelisted entity accumulates no suspicion | Read `factor_f1_recurrence`, once ported. It is four lines |

Rows referencing paths not yet present are pending the port described in [`docs/HANDOVER.md`](docs/HANDOVER.md).

---

## Documentation

| Document | What it is |
|---|---|
| [`docs/HANDOVER.md`](docs/HANDOVER.md) | **Start here if you are picking up implementation** — state, hard rules, verified numbers, what to build in order |
| [`BRIEF.md`](BRIEF.md) | One page to read before each session |
| [`RULES.md`](RULES.md) | Standing rules for every person and every AI tool |
| [`AGENTS.md`](AGENTS.md) | How to drive an AI coding tool here — Claude Code, Codex, Cline alike |
| [`SECURITY.md`](SECURITY.md) | Secret-scanning setup, required before the first code commit |
| [`docs/00-SPEC.md`](docs/00-SPEC.md) | Numbered requirements, frozen contracts, and the requirement-to-test map |
| [`docs/01-ARCHITECTURE.md`](docs/01-ARCHITECTURE.md) | The architecture of record — all four layers, the trust boundary, the data tiers. 105 pages |
| [`docs/adr.md`](docs/adr.md) | 25 architecture decision records, append-only, with a provenance table |
| [`docs/OPEN-GAPS.md`](docs/OPEN-GAPS.md) | The gap register, kept current |
| [`docs/BUILD-LOG.md`](docs/BUILD-LOG.md) | Append-only log of every behaviour change |
| [`docs/EVIDENCE.md`](docs/EVIDENCE.md) | Every number in this README, with the command that reproduces it |
| [`docs/audit/`](docs/audit/README.md) | Eight-part audit and alignment pack — economics, journeys, production readiness, red-team |
| [`docs/TECH-STACK.md`](docs/TECH-STACK.md) | Every technology with the reason it was chosen — and what we refused to use |
| [`docs/TEAM.md`](docs/TEAM.md) | Seven builders, four universities, and the gaps that are still real |
| [`docs/SDLC.md`](docs/SDLC.md) | How the work is done — spec-driven, with verification mapped back to the requirement |
| [`docs/SDLC-GAP-ANALYSIS.md`](docs/SDLC-GAP-ANALYSIS.md) | What is wrong with our own process, written by us |
| [`docs/USER-JOURNEY.md`](docs/USER-JOURNEY.md) | Four journeys through one machine — including the subject's |
| [`docs/AI-AUTONOMY.md`](docs/AI-AUTONOMY.md) | Where AI sits, and where it is forbidden |
| [`docs/ANCHOR-RATIONALE.md`](docs/ANCHOR-RATIONALE.md) | Why one narrow blockchain use survived and three were refused |
| [`docs/08-BUSINESS.md`](docs/08-BUSINESS.md) | Market, unit economics, go-to-market |
| [`docs/LEAN-CANVAS.md`](docs/LEAN-CANVAS.md) | Nine blocks, with numbers rather than adjectives |
| [`docs/PLAIN-WORDS.md`](docs/PLAIN-WORDS.md) | The whole system without jargon |
| [`team/README.md`](team/README.md) | One file per builder — owns, current task, blockers |
| [`submission/`](submission/) | The pitch deck and the interactive architecture view |

---

## Team SONAR

Seven builders across four universities.

| | University | Role |
|---|---|---|
| **Lethabo Hoaeane** | University of South Africa | Profiler — architecture, product, UX. Co-lead |
| **Sibusiso Khumalo** | University of the Witwatersrand | Backend Developer — service, ledger, CI. Co-lead |
| **Babatunde Adelusi** | University of Pretoria | Business Developer |
| **Mutarisi Chibaya** | University of Pretoria | Frontend Developer |
| **Khutso Mothopa** | University of the Witwatersrand | System Analyst |
| **Vukosi Khoza** | University of the Witwatersrand | IoT Developer |
| **Ipeleng Constance Modise** | Tshwane University of Technology | Security Designer |

---

## Licence

MIT. See [`LICENSE`](LICENSE).

The core is deliberately open so that someone else can carry this if we stop. A safety record may need to be verifiable in ten years, and that is not a promise one team should be the only party able to keep.

---

> ### It forgets you. It never forgets what it did.
