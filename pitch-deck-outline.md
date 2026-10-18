# VUKA War Room Pitch Outline

## Structure (Modular, ~3 Minutes Spoken)

1. **The Hook (15s):** One person's evening (illustrative, labelled as such) that frames express kidnapping and forced transfers in SA. Make the judge feel the urgency.
2. **The Problem (30s):** The specific pain point. Human language, not corporate jargon.
3. **The Solution (45s):** Introduce VUKA. What it is, how it works in one sentence, what makes it different. Say it's Android only for now, and how everyday noise is told apart from real distress (the Journey check).
4. **The Demo (Live or Recorded):** 3-4 must-see moments that prove the product works.
5. **Business Model & Traction (30s):** How VUKA makes money. Who pays. What proof we have.
6. **The Compliance Advantage (30s):** POPIA, ECTA and the **permissioned-write, public-read** anchor framed as a competitive moat — not a burden. Position VUKA as **tamper-evident, built to maximise the ECTA s15 reliability factors, and verifiable by a third party without trusting us.** (Never "court-admissible", "tamper-proof" or "legally bulletproof".)
7. **The Ask (15s):** What we want from the war room — feedback, connections, pilot partners, funding.

## The Access Model (say it in the compliance beat)
- **Public:** the **hash** — anyone can verify it; no identity, no content.
- **Victim:** full access to her own record through the app. **The payload key is server-held today**; encryption to a victim-held key is `PROPOSED`, not built.
- **Guardian (alert recipient, not a reader):** receives the **alert** only; guardians hold **no copy** of the record today. A guardian-held encrypted backup is `PROPOSED` with an undefined lifecycle, not built.
- **Bank / insurer:** `PROPOSED` — designed per-case, purpose-limited on her consent (or legal process); no endpoint exists.
- **Court / SAPS:** `PROPOSED` — production on legal process; no endpoint exists.
- **Every access is itself anchored:** `PROPOSED` — only the member's own export is anchored today; access events would be linkable per subject.

## The 5 Pillars of Duress (SA Common Law)
*(draft — confirm the exact formulation, and any case citation, with counsel before use)*
- A threat of imminent or inevitable harm
- A causal link between the threat and the transaction
- The threat is unlawful or contra bonos mores
- The victim's will is overborne — she acts against her free will
- [Confirm with counsel; do not cite a case name until verified]

## Proof Bank (Every Claim Needs One)
| Claim | Proof |
|-------|-------|
| [Claim about VUKA] | [Evidence] |
| [Claim about market] | [Evidence] |
| [Claim about tech] | [Evidence] |

## Demo Must-Haves
*(Mentor feedback, war room 26 Sep: "Seeing an MVP of the app would have been the cherry on top." Full checklist in `docs/WAR-ROOM-PITCH.md` Part 2.)*
- [ ] Activate → a glass or shout sound → the Journey check opens on the phone
- [ ] Duress PIN → the same "Checked in" screen as the normal PIN → the guardian alert arrives on a second phone
- [ ] The Record screen shows the signed events; a recorded video of the same run as fallback

## Mentor refinements (war room, 26 Sep) — must be visible in the deck
- **Story line:** open on one person's evening (illustrative, labelled), not on statistics.
- **Daily vs genuine distress:** a sound only opens a Journey check; normal PIN = nothing sent; duress PIN = identical screen + silent guardian alert; no answer = guardians alerted. Measured catch rates on the Q&A card.
- **Android only for now, not iOS** — one line on the solution slide.
- **Privacy:** no audio kept (3-second buffer on the phone), listening only after Activate, only a fingerprint on the ledger, deletion keeps the hash.
- **MVP:** the live app, plus the download QR on the slide.

---
*Compliance note: claims in this deck must stay inside the honesty ledger (`docs/MASTER-CONTEXT.md` §6) — tag every figure `FACT` / `ESTIMATE` / `ASSUMPTION` / `PROPOSED`, keep `sim_`/SIMULATED labels, and never claim a capability the demo does not perform.*
