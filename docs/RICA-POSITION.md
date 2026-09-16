# RICA position — the ring buffer already answers the interception question, and the bright line is "never attach audio"

> Serves **C3** — `docs/CHECKLIST.md` `P2.6` sibling `P2.7` (due 19 Sep, owner Ipeleng). Companion record; **no new ADR** — nothing in the architecture changes (§4).
>
> **Status: team position, not legal advice.** As with the PSiRA paper, no primary source was *readable* this session: the official RICA PDF is reachable (`justice.gov.za/legislation/acts/2002-070.pdf` — title metadata confirms Act 70 of 2002) but downloads as an encrypted, unparseable binary in this environment, the same limitation the POPIA paper recorded for the gov.za Act PDF; SAFLII, lawlibrary.org.za and polity.org.za return HTTP 403; gov.za hosts the **Bill** (`b50b-010.pdf`), not the Act. **This paper therefore contains no verbatim statutory quotes.** Every statutory characterisation below is ⚑ and rests on recorded team research plus orientation-level secondary sources (named as such in §7). The positions that matter — audio never persists, labels not audio, no audio attached to any record — are **verified facts of this repository's own architecture**, not statutory claims, and they are what carry this deliverable.

---

## 1 · The question P2.7 asks

`docs/PLAN.md` §C4 states the premise: RICA targets *communications*; the ShotSpotter precedent shows gunshot-acoustic detection deliberately positioned outside interception; VUKA's design "is the same choice, arrived at independently". The question to answer on the record is:

> **Does anything in RICA, as far as it can be determined this session, reach a household acoustic sensor that classifies gunshot signatures in a 3-second in-memory ring buffer, never persists audio, and emits only a classification label — and what is the bright line the team must hold so that never changes?**

The honest complication mirrors P2.6: the statutory text could not be read this session, so the paper records what is verifiable (the architecture), what is recorded research (⚑), and the exact questions counsel must answer — rather than guessing at definitions.

---

## 2 · What RICA regulates, as far as verifiable this session (all ⚑)

- **Scope, from recorded research and secondary orientation:** RICA (Act 70 of 2002, in force 22 Jan 2003) regulates the **interception of communications**, the **monitoring of radio signals and radio frequency spectrums**, and the **provision of communication-related information (CRI)** — traffic data held in the records of **telecommunication service providers**. It prohibits providing telecom services that cannot be intercepted, requires TSPs to store CRI, and **prohibits manufacturing, assembling, possessing, selling, purchasing or advertising interception equipment without an exemption certificate**. (Secondary-source orientation: Wikipedia's RICA article — which itself carries an "original research" banner and is **not relied on** for any position; named only so the counsel pack knows where the orientation came from.)
- **Constitutional context:** on 3 Feb 2021 the Constitutional Court (the *AmaBhungane* litigation) found RICA's bulk-surveillance provisions deficient on privacy grounds. Bearing on VUKA is marginal (no bulk interception, no TSP role) — logged as counsel Q4 for completeness, not argued here.
- **The load-bearing unknowns:** the exact wording of the s1 definitions ("communication", "interception", "indirect communication") and the s2 prohibition — unreadable this session — decide Q1–Q3 below. The retrieval route for the counsel pack is the official PDF URL recorded above.

## 3 · What the architecture does — verified, not asserted

From this repository's own records (no ⚑ needed — these are build facts):

| Design fact | Where | Why it matters for RICA |
|---|---|---|
| **Raw audio is never persisted** — 3-second ring buffer, continuously overwritten; **no code path to disk exists** | `docs/01-ARCHITECTURE.md` §6.5 T0 row; ASR-6 ("audio must never be persisted"); E3 | There is no stored audio for any interception, evidence, or retention question to attach to |
| **Label-not-audio** — YAMNet emits a classification; only the label survives | T0→T1 boundary; `docs/MODEL-CARDS.md` YAMNet card (demographic rows honestly "not measured") | What crosses the persistence boundary is an event classification, not recorded sound |
| **The sensor detects acoustic events** — the audio factor exists to catch gunshots, glass, aggression events around the household; no speech transcription exists in the design | `docs/00-SPEC.md` E7/E8; architecture data-flow | Event detection is the ShotSpotter logic — the system is not in the communications business |
| **The evidence chain carries labels, decisions and hashes — never audio** | T2 definition; anchoring design | Nothing in any anchored record can be an audio clip |

**The precedent, stated honestly:** the ShotSpotter/SoundThinking locators are acoustic sensors deployed for gunshot localisation (secondary orientation: sensors at ~20–25 per square mile with 4G backhaul — Wikipedia, ⚑). `docs/PLAN.md` §C4's recorded research names the South African deployments (**Cape Town 2016, Lavender Hill 2022**) and quotes the *"does not use microphones"* phrasing — both remain **recorded team research, not re-verified this session** (⚑; retrieval for the counsel pack logged as Q5). The structural point does not depend on the quote: a gunshot classifier that never stores communications is positioned outside interception *by design*, and VUKA's ring buffer is that positioning made concrete.

---

## 4 · The team position — two bright lines, and why no ADR is needed

1. **Never attach an audio clip as evidence.** Attaching recorded audio to any record would create a RICA interception question over the *acquisition* *and* a POPIA question over the *content* — voice recognition is expressly biometric (`docs/PLAN.md` §C4). The evidence chain already carries labels, decisions and hashes; this paper makes the "never audio" rule explicit as an operator and records rule, to be carried into `docs/OPERATOR-DUTY.md`'s evidence guidance and the partner contract's data clause (PSiRA paper §6).
2. **Audio never persists.** The ring buffer is an architecture constraint (ASR-6, E3) — any change requires a fresh ADR, not a configuration. This is the same prepared-versus-forever distinction ADR-0031 draws for embeddings.

**Why no new ADR:** both bright lines are already accepted architecture (ASR-6, T0) or existing evidence-chain design; ADR-0032 demonstrated the pattern for *new* floors. This paper records a statutory *position* on an unchanged design — an ADR restating ASR-6 would manufacture the appearance of a new decision where there is none. If counsel's answer to Q1 forces a design change, that change gets the ADR.

---

## 5 · The honest open point — transient acquisition

The ring buffer means nothing *persists*; it does not mean nothing is *acquired*. During each 3-second window the appliance processes acoustic signal in memory. Whether that transient, in-memory processing — which decodes **no** speech and stores **no content** — constitutes "interception" of a "communication" under RICA's definitions is the one question this paper cannot answer without the statutory text (counsel Q1). The working position: the appliance is an **event-classification sensor**, not an interception device; it acquires no "communication" because it extracts no message content. But the honesty ledger does not let a comfortable position masquerade as a verified one — so the working position is labelled a position, held *until counsel reports*, and the design is built so that even the worst answer to Q1 costs nothing: nothing is stored, nothing is transmitted as audio, nothing becomes evidence.

---

## 6 · Consequences

- **Operator duty and training:** the never-attach-audio rule joins the duty card's evidence guidance at the next operator-material touch (owner: Lethabo/Sibusiso — noted, not edited in this pass).
- **Partner contract:** the data clause carries both no-audio-retention and (from ADR-0032) the 30-day floor to the provider-of-record's side.
- **Showcase (SC.1–SC.5):** unaffected — synthetic events, no audio assets leave the building; the recorded fallback (SC.4) uses local assets produced for the demo, not captured household audio.
- **Ipeleng's legal stack:** P2.1 (PSiRA), P2.2 (POPIA + ADR-0031), P2.5 (IO registration, prepared), P2.6 (GACA review + ADR-0032) and P2.7 (this paper) are now **authored**; what remains for each is human review (Lethabo → leads), counsel's answers, and her live 1.1 holder-confirmation review.

---

## 7 · Counsel questions (this paper's own numbering)

| Q | Question | Why it decides something |
|---|---|---|
| **Q1** | Does a household acoustic sensor that classifies gunshot signatures in-memory (3-second window, no persistence, no speech decoding) "intercept" a "communication" under RICA s1/s2 as defined? | The only question that could force a design change; the architecture is built so the worst answer costs nothing |
| **Q2** | Is such an appliance "interception equipment" for RICA's possession/exemption-certificate prohibition? | A compliance-formality question; the certificate route exists if it applies |
| **Q3** | Confirm no telecommunication-service-provider / CRI-storage duties attach to VUKA's architecture (the sensor is not a TSP and stores no indirect communications) | Keeps the CRI machinery out of scope formally, not just practically |
| **Q4** | Does the 3 Feb 2021 Constitutional Court (*AmaBhungane*) invalidation of RICA's bulk provisions bear on any VUKA position at all? | Orientation only — VUKA performs no bulk interception and holds no CRI |
| **Q5** | Retrieve and verify: the official Act PDF (`justice.gov.za/legislation/acts/2002-070.pdf`), the ShotSpotter South-Africa deployment record (Cape Town 2016, Lavender Hill 2022), and the exact wording behind the *"does not use microphones"* claim | Converts this paper's ⚑ marks into verified text for the counsel pack |

---

## 8 · Provenance and verification log

- **Recorded research this paper builds on:** `docs/PLAN.md` §C4; `docs/CHECKLIST.md` P2.7; `docs/01-ARCHITECTURE.md` (ASR-5, ASR-6, T0 tier, §6.5 retention schedule, E8); `docs/00-SPEC.md` (E3, E7, E9); `docs/MODEL-CARDS.md` (YAMNet card); `docs/PSIRA-POSITION.md` §6 (contract clauses).
- **Primary-source access, 16 Sep 2026:** `justice.gov.za/legislation/acts/2002-070.pdf` **reachable but binary** — downloads (255 KB) with RICA's full title in its PDF metadata, but the content is Flate-encoded and unparseable in this environment (identical to the POPIA paper's gov.za experience); the URL is recorded here as the retrieval route for the counsel pack. `justice.gov.za/legislation/acts/` (index) HTTP 403. `lawlibrary.org.za` HTTP 403. `polity.org.za` HTTP 403. The gov.za RICA page hosts the **Bill** only (`b50b-010.pdf`, 3.4 MB). SAFLII not re-attempted (403 precedent from both prior sessions). Web searches for the full text and for ShotSpotter corroboration returned no usable results.
- **Secondary orientation only (not relied on):** Wikipedia's RICA article (which carries an "original research" banner) and its ShotSpotter/SoundThinking article — used to orient §2 and the ShotSpotter note; no position in this paper rests on them.
- **Every statutory characterisation is ⚑ pending counsel verification against the Act text.** The Cape Town 2016 / Lavender Hill 2022 deployment dates and the *"does not use microphones"* wording remain recorded team research, not re-verified.
- **Not legal advice.** The two bright lines are build facts of this repository, stated as engineering constraints; the statutory positions are the team's working position until counsel reports, and the honesty ledger applies.