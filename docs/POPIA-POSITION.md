# POPIA Position Paper — the s27 asymmetry, and why discard-by-default is the lawful-basis answer

> Serves **C2, C3** — `docs/CHECKLIST.md` `P2.2` (due 17 Sep, owner Ipeleng). Closes the documentation half of `docs/OPEN-GAPS.md` **G20**. Companion ADR: **ADR-0031** in `docs/adr.md`.
>
> **Status: team position, not legal advice.** `docs/PLAN.md` §C2 already records the bottom line: there is **no legitimate-interest ground for biometrics**, so the architecture must not need one. This paper organises the statutory analysis, states the position we operate under until counsel says otherwise, and lists the exact questions counsel must answer. Unlike the PSiRA paper (`docs/PSIRA-POSITION.md` §9), a full-text copy of the Act *was* reachable this session — `popia.co.za` (Accessible Law), a third-party reformatting of the Act as enacted — so the provisions below are **quoted verbatim**, not paraphrased. That copy is not a primary source; every quote stays ⚑ until counsel verifies it against the Government Gazette text (§10). Primary sources themselves remain blocked from this environment (SAFLII HTTP 403; the gov.za Act PDF downloads but arrives as an encrypted binary that cannot be parsed here; the Information Regulator's site was reachable).

---

## 1 · The question, stated honestly

The architecture docs answer the POPIA question today with one engineering claim: *"vectors not images"* (`docs/01-ARCHITECTURE.md` compliance row). `docs/PLAN.md` §C2 already called that insufficient, and it is — storage format is a minimisation technique, not a lawful basis. The question the Act actually asks is not *"is it stored as an image or a vector?"* It is:

> **Does any s27(1) ground authorise processing the biometric information of a person who never consented — including the transient, in-memory comparison we run on every passer-by?**

Our working answer: **no ground fits a non-consenting passer-by.** Which means the transient computation itself sits on the prohibition unless s33 rescues it — and the honest architecture answer is to be built so that *nothing of the non-consenting person survives the computation*, and to say plainly what is and is not authorised until counsel reports.

---

## 2 · The statutory hook

Protection of Personal Information Act 4 of 2013 (POPIA). The provisions that decide our case:

| Provision | Text (verbatim from the Accessible Law copy, ⚑ unless marked otherwise) | Consequence for VUKA |
|---|---|---|
| **s1 "responsible party"** | *"a public or private body or any other person which, alone or in conjunction with others, determines the purpose of and means for processing personal information"* | Purpose-and-means control is the test. Whoever tunes the threshold and defines the verification purpose is the responsible party (§7) |
| **s1 "biometrics"** ⚑ | Definition not re-verified verbatim this session (fetch truncated); recorded research (`docs/PLAN.md` §C2) has it enumerating fingerprints, voice prints, iris, **facial recognition**, hand, gait, "any other biometric behaviour" | Face recognition is squarely inside the statutory technique list. Verify wording (Q3) |
| **s26(1)(a)** | *"A responsible party may, subject to section 27, not process personal information concerning— … the religious or philosophical beliefs, race or ethnic origin, trade union membership, political persuasion, health or sex life or **biometric information** of a data subject"* | The prohibition is absolute on its face, subject only to s27 |
| **s11(1)** (ordinary PI) | Six grounds: consent; contract necessity; legal obligation; protection of a legitimate interest of the data subject; public-law duty; *"processing is necessary for pursuing the legitimate interests of the responsible party or of a third party to whom the information is supplied"* | Ordinary PI enjoys a legitimate-interest limb — **s11(1)(f)**, subject to the s11(3) objection |
| **s27(1)** (special PI) | Six grounds (§3) — **none of them legitimate interest** | The asymmetry in one line: the passer-by's face vector has no s11(1)(f) equivalent |
| **s27(2)–(3)** | The Regulator may, *"by notice in the Gazette, authorise a responsible party to process special personal information if such processing is in the public interest and appropriate safeguards have been put in place"* | A discretionary prior-authorisation route we will not rely on for the pilot; noted for completeness |
| **s33** | The ss28–33 limb that names **biometric information** directly — analysed in §5 | The sharpest open legal question in this paper |
| **s57(1)(a)** | Prior Regulator authorisation before linking unique identifiers across responsible parties for a new purpose | Separate gate, recorded in `docs/POPIA-S57-DECISION-RECORD.md`; not re-analysed here (`P2.4`) |

---

## 3 · The asymmetry, ground by ground

s27(1) verbatim (the Accessible Law copy renders the grounds as an unlettered list; the lettering below is ours, in citation order, pending verification):

> The prohibition on processing personal information, as referred to in section 26, does not apply if the—
> - processing is carried out with the consent of a data subject referred to in section 26;
> - processing is necessary for the establishment, exercise or defence of a right or obligation in law;
> - processing is necessary to comply with an obligation of international public law;
> - processing is for historical, statistical or research purposes to the extent that— the purpose serves a public interest and the processing is necessary for the purpose concerned; or it appears to be impossible or would involve a disproportionate effort to ask for consent, and sufficient guarantees are provided for to ensure that the processing does not adversely affect the individual privacy of the data subject to a disproportionate extent;
> - information has deliberately been made public by the data subject; or
> - provisions of sections 28 to 33 are, as the case may be, complied with.

Walked against **a non-consenting passer-by at a gate with UMOJA running**:

| Our label | Ground | Fits? |
|---|---|---|
| (a) | Consent | **No** — that is this person's defining characteristic in the scenario |
| (b) | Right/obligation in law | **No** — we are not establishing, exercising or defending a right *against the passer-by*; deterring burglary is not litigation |
| (c) | International public law | **No** |
| (d) | Historical/statistical/research | **No** — access control is none of these; and even if argued, it demands public interest *plus* impossibility or disproportionate effort of asking consent. We *can* ask — asking is exactly how residents enrol |
| (e) | Deliberately made public | **No** — walking through a gate is not the data subject deliberately making their biometric information public for processing purposes; at most it touches s12's direct-collection rule, which is a different question. Counsel to confirm the margin (Q1) |
| (f) | ss28–33 authorisations | **Open** — only s33 names biometrics (§5) |

**Finding:** on grounds (a)–(e), the transient match computation on a non-consenting passer-by has no authorisation. The s26(1)(a) prohibition bites. The lawful shape of the system therefore depends on (f)/s33 — and on the architecture never needing to hold anything the computation produced (§6).

For contrast: **ordinary** personal information (plates, timestamps, acoustic events linked to no human) is governed by s11(1), which does contain the legitimate-interest limb we cannot reach for biometrics. That is the whole asymmetry — `docs/PLAN.md` §C2's claim, now quoted from the Act's text rather than asserted.

---

## 4 · "Vectors not images" is not a lawful basis

- s26(1)(a) prohibits processing **biometric information**. An embedding is one-way-derived from a face image and is compared against a reference to single out one unique human being — it is that person's biometric information whatever its format. Deriving it is itself processing; "we never store the image" does not answer the s27 question.
- What storage format *does* legitimately buy: **minimality and security** posture (s10, s19 ⚑) and — decisively — whether anything exists *to retain at all*. That is why the architecture answer is about retention and persistence, not encoding (§6).
- **Person-versus-animal classification is not special-PI processing at all** — it does not identify a natural person (`docs/PLAN.md` §C2, verbatim: *"Detect-and-characterise without retention may fall outside POPIA entirely"*). The fusion engine's species classification may run freely. The moment a pipeline extracts a *matchable human face embedding*, s26 is engaged.

---

## 5 · s33 — the one limb that could rescue the transient computation

Verbatim:

> The prohibition on processing personal information concerning a data subject's criminal behaviour or biometric information, as referred to in section 26, does not apply if the processing is carried out by bodies charged by law with applying criminal law or by responsible parties who have obtained that information in accordance with the law.
>
> The processing of information concerning personnel in the service of the responsible party must take place in accordance with the rules established in compliance with labour legislation.
>
> The prohibition on processing any of the categories of personal information referred to in section 26 does not apply if such processing is necessary to supplement the processing of information on criminal behaviour or biometric information permitted by this section.

We are not "bodies charged by law with applying criminal law". That leaves *"responsible parties who have obtained that information in accordance with the law"* — and the honest position is **we do not know which way it cuts**:

- **Optimistic reading:** "in accordance with the law" means *lawfully obtained* — a gate camera lawfully operated on the resident-owner's property captures whoever passes, lawfully. On that reading, s33(1) may authorise a responsible party's biometric processing of lawfully-obtained biometric information — which is exactly our transient computation.
- **Pessimistic reading:** "in accordance with the law" means *obtained through processing that already had a lawful basis* — which is circular, because the processing we need the ground for *is* the processing; s33 would then give us nothing.

We will not build on the optimistic limb. Counsel must decide (Q2). Until then, the honest claim is deliberately narrow: *the transient computation is in-memory, against consented references only, with immediate discard of non-matches — and its lawfulness under s33(1) is an open question, not an assertion.*

---

## 6 · Discard-by-default is the architecture's answer

Sibusiso's boundary note (`docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md`) is adopted verbatim as the processing boundary:

1. Receive the transient sensor result **in memory**.
2. Compare it **only** against the consented enrolment set for the stated tenant and purpose.
3. Retain a match result and its **consent reference** only when the match is valid.
4. **Discard every non-match immediately.** Do not persist the embedding, raw image, or a recoverable derivative.

What each step buys legally:

| Step | POPIA function |
|---|---|
| In-memory only | Caps the passer-by's processing at the transient computation; there is no record to retain, secure, disclose or re-identify |
| Consented references only | The **enrolled resident's consent** — s27(1) ground (a) — is the sole lawful basis for anything retained. No consent, no enrolment record, no comparison target |
| Match + consent reference retained | What survives is a *decision anchored to a consent record*, not biometric data of anyone who did not consent |
| Immediate discard | Minimality (s10) satisfied by construction; re-identification risk zero because nothing is left to re-identify |

This is recorded as **ADR-0031** in `docs/adr.md`: discard-by-default is an **architecture constraint, not a configuration** — the persistence boundary cannot be opted out of by a setting, and any future exception requires a fresh ADR, Information Officer and privacy review, and the s57 prior-authorisation analysis. Acceptance evidence is still owed: `P2.3` (Sibusiso) must show a test where a non-match leaves no embedding across the persistence boundary, alongside a consented-match test and a biometric-free audit record. **The boundary is specified, not running.**

---

## 7 · The responsible-party split must match the PSiRA paper

s1 defines the responsible party by **purpose-and-means control**. Under `docs/PSIRA-POSITION.md` §4.4's partner-of-record structure:

- **The registered security partner** receives verified match events and decides what to do with them for the monitoring service — a responsible party in its own right for that stage.
- **VUKA** determines the means of the platform's processing — models, thresholds, retention, the discard boundary — and is responsible party for the enrolment and comparison stage.
- The partner contract's data clause (PSiRA paper §6, clause 3) must therefore name **the same provider of record** as this paper, extend the discard rule to the partner's side (no retained non-match embeddings, no re-enrolment of passers-by into any neighbourhood set), and route Regulator contact to the registered party. If the PSiRA answer resolves to Variant 3 (VUKA self-registers for the pilot), this split collapses into one party automatically — nothing here depends on which variant is signed.
- **Operators are reviewers, not enrolment data subjects.** The PSiRA-number activation fields (`docs/OPERATOR-DUTY.md`) are employment records, and s33(1)'s personnel paragraph ⚑ shows staff biometric processing is its own lane under labour-legislation rules — the build rule: no operator's face ever enters a tenant's enrolment set.

---

## 8 · Open questions for counsel

| # | Question | Why it matters | Evidence needed |
|---|---|---|---|
| Q1 | Verify every quote in §2–§5 against the consolidated Act text, then confirm: on grounds (a)–(e), does *any* reading authorise transient match computation against a non-consenting passer-by? Includes the margin on ground (e) — is appearing in gate footage ever "deliberately made public" by the data subject? | Decides whether the pilot's face gate can run at all | Gazette text (§10 access note) + counsel opinion |
| Q2 | s33(1): is "obtained that information in accordance with the law" (i) an independent ground for biometric processing by responsible parties holding lawfully-obtained gate imagery, or (ii) circular? If (i), what does gate-camera capture need to qualify (signage, notice, owner consent)? | The sharpest question in this paper — the difference between a lawful transient computation and a blocked one | Counsel opinion; any Information Regulator guidance on s33 |
| Q3 | Is an embedding/vector "biometric information" under s26(1)(a) regardless of storage format, and confirm the s1 "biometrics" definition wording verbatim (facial enumeration) | Kills or confirms the "vectors not images" defence formally | Act text + counsel opinion |
| Q4 | For consented residents: is s27(1)(a) consent sufficient for retained match/verification records; how does consent work for household members who are minors (competent person); what must withdrawal trigger (enrolment deletion, downstream record deletion, partner-side erasure)? | The consent enrolment flow is the system's only retained lawful basis — it has to be built right the first time | Counsel opinion + POPIA regulations on consent forms |
| Q5 | Does discard-by-default reduce the s57(1)(a) prior-authorisation exposure for cross-responsible-party linking, or does s57 bite on the linkage purpose irrespective of what is retained? | `docs/POPIA-S57-DECISION-RECORD.md` and `P2.4` remain a separate, bigger gate | Counsel opinion |

---

## 9 · Consequences downstream

- **`P2.3` (discard-by-default implementation):** the boundary in §6 is the acceptance criterion; ADR-0031 makes it an architecture constraint. The non-match test is still owed — the honest status is *specified, not running*.
- **`P2.4` (s57(1)(a)):** untouched by this paper beyond Q5; the decision record governs, and it stays open.
- **`P2.5` (Information Officer registration):** the Information Regulator's site was reachable this session — registration runs through the **eServices Portal** (`eservices.inforegulator.org.za`), and the Regulator states that where no Information Officer is designated, **the head of the organisation is held liable for all POPIA matters**. Free, online, under 30 minutes — no excuse before any pilot (`docs/CHECKLIST.md` `P2.5`).
- **`P2.6` (Gated Access Areas Code):** the draft Code's 7–30-day auto-overwrite direction is *stricter* than discard-on-non-match — it bounds retention of *matches* too. Build to the stricter bound now (`docs/OPEN-GAPS.md` G21).
- **`docs/01-ARCHITECTURE.md` §9.2 compliance row:** the "vectors not images" claim should be re-pointed at this paper and ADR-0031 at the next architecture sweep (owner Lethabo) — this paper deliberately does not edit the architecture document.

---

## 10 · Provenance and verification log

- **Recorded team research this paper builds on:** `docs/PLAN.md` §C2; `docs/OPEN-GAPS.md` G20; `docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md`; `docs/POPIA-S57-DECISION-RECORD.md`.
- **Primary-source access on 16 Sep 2026:** SAFLII consolidated Act (HTTP 403); gov.za POPIA landing page reachable — its Act PDF (`3706726-11act4of2013popi.pdf`, 385.2 KB) downloads but arrives as an encrypted, unparseable binary in this environment; Information Regulator site reachable (Information Officer registration guidance, s55 duties — used for §9's P2.5 note). **Verbatim quotes in §2–§5 are from `popia.co.za` (Accessible Law)**, which states it reproduces the Act as enacted as a reformatted website — a convenience copy, **not a primary source**. The copy's s27(1) grounds render unlettered; the lettering in §3 is ours, in citation order. Every quote stays ⚑ until counsel verifies it against the Gazette text.
- **This paper is not legal advice** and creates no compliance claim. The honesty ledger (`docs/00-SPEC.md` §5) applies: until counsel reports, the only honest public claim is *"no lawful ground asserted for transient biometric comparison of non-consenting persons; system architected to discard; pilot blocked at G-gate until counsel answers Q1–Q2."*
- **Authored:** 16 Sep 2026 — Ipeleng (via Cline assistant), for `docs/CHECKLIST.md` `P2.2`. Co-located with the PSiRA paper on PR #30 (`docs/ipeleng-psira-position`; PR #28 merged with the P2.1 commits only) so both regulatory papers review together. Reviewed by: pending Lethabo, then both leads.
