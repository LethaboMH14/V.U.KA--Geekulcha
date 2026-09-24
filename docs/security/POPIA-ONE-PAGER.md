# VUKA and POPIA — partner and judge summary

**PROPOSED · Owner: Ipeleng · Lethabo covering from 24 Sep 2026**  
**FACT:** Team SONAR is a hackathon prototype with no registered legal entity. Information Officer registration is **prepared, not submitted**. Contact: **UNDEFINED — team to set**. VUKA is on Hedera **testnet**; `sim_bank` is **SIMULATED**; there are no real bank integrations. [Source: `COMPLIANCE-GOVERNANCE.md` §1; `POPIA-IO-REGISTRATION.md` §§1, 7; `VUKA-2-SPEC.md` §§10, 17]

**Serves S (Security & Ethics) and B (Business & Presentation).** It gives a judge or partner a checkable account of the prototype and open work. A real member should understand what persists before trusting it. Nothing here claims the prototype is fully built or legally compliant. [Source: `MASTER-CONTEXT.md` §§2, 6; `SSDLC.md` §§0, 11]

## POPIA conditions (ss 8–25)

| Condition | How VUKA addresses it | Evidence in repo | Still open |
|---|---|---|---|
| Accountability | Team SONAR is identified; IO status is stated honestly. | `COMPLIANCE-GOVERNANCE.md` §1; `POPIA-IO-REGISTRATION.md` §7 | No entity; head/IO designation and registration; Q-C1 |
| Processing limitation | Consent is the stated basis; collection is minimised. | `VUKA-2-SPEC.md` §§2, 13 | Counsel: residuals after consent withdrawal (Q-C2); implementation evidence |
| Purpose specification | Journey safety, guardian alerts and a checkable evidence chain. | `VUKA-2-SPEC.md` §§2, 3, 13 | Confirm complete purposes and notices with counsel |
| Further processing limitation | Recipients and evidence uses are bounded in the spec. | `VUKA-2-SPEC.md` §§9, 13; `COMPLIANCE-GOVERNANCE.md` §2 | Operator terms Q-C3; foreign processing basis Q-C4 |
| Information quality | Signed, ordered events and corrections by append-only evidence. | `VUKA-2-SPEC.md` §§3–7, 12 | No member correction procedure is specified; Q-C7 on whether public roots are personal information |
| Openness | Member and guardian notices are required; this policy is proposed. | `VUKA-2-SPEC.md` §§2 (G6), 13; this file | Contact route and final notice review; IO not registered |
| Security safeguards | Encrypted payloads and salts, PIN authority, threat model and internal tests are specified. | `VUKA-2-SPEC.md` §§7–9, 13; `SSDLC.md` §§4, 10–14 | Internal test only; no independent penetration test (G8); control implementation remains in build |
| Data subject participation | Export and deletion are specified; guardians are notified of relevant changes. | `VUKA-2-SPEC.md` §§9, 13; PR #43 review S3 | Correction and objection paths; complaint route is not defined in repo |

## Special personal information: biometrics

The archived team position paper (`archive/2026-09-four-layer/docs/POPIA-POSITION.md`, §§1, 5) addresses the former face-matching design and records unresolved s27/s33 counsel questions. For VIGIL, the current design classifies **what sound occurred**, not **who spoke**: labels and scores, no voiceprints or speaker recognition, and no retained audio. The team position is therefore that this VIGIL flow does not process biometric information as voice recognition. Ordinary personal-information conditions (ss8–25) apply to the sound window while it exists in memory; on the specified design, the special biometric-information restrictions (ss26–33) are not triggered. This is a position, not legal advice. A move to identify speakers would need counsel review before implementation. [Source: `STAGED-DURESS-DEFENCE.md` §8; `VUKA-2-SPEC.md` §§2–3, 13; archived `POPIA-POSITION.md` §§1, 5]

Recorded counsel questions: **Q-C1** responsible party before incorporation; **Q-C2** basis for residuals after withdrawal; **Q-C3** operator contracts; **Q-C4** cross-border basis for FCM; **Q-C5** Cybercrimes Act ECSP status; **Q-C6** Google Play stalkerware policy; **Q-C7** whether salted/hashed public roots are personal information. The archived position paper separately records Q1–Q5 for the former face/biometrics design; it is not a VIGIL biometric feature. [Source: `COMPLIANCE-GOVERNANCE.md` §8; archived `POPIA-POSITION.md` §§8–10]

**Status and limits:** Retention (specified; not yet verified as implemented) for payloads and salts is **90 days**, unless a dispute hold is placed. A deletion request has a **72-hour cooling-off** (specified); residuals remain: “the coarse class, time, actor id, journey id, hashes and public keys”. Hashes stay permanently. A bank must be named before any real integration; today there is only `sim_bank`. Hedera receives a 32-byte root in a 33-byte typed message and no personal data. **The anchor proves when, not what.** [Source: `VUKA-2-SPEC.md` §§9, 10, 13, 17; Ipeleng PR #43 review S3]

**Internal testing is not an independent penetration test.** No claim of “secure”, “unhackable” or “court-admissible”. [Source: `SSDLC.md` G8, §§0, 11]

### UNDEFINED — needs a decision

- Responsible legal person before incorporation; Information Officer designation and submission.
- Contact route; Google sign-in fields and exact flow.
- Legal basis for permanent residuals after consent withdrawal (Q-C2).
- Operator contracts (Q-C3), cross-border basis for Google/FCM (Q-C4), and Azure region if South Africa North is unavailable.
- Member correction, objection and complaint processes; general Information Regulator contact route for this notice.
- Whether public salted/hashed roots are personal information (Q-C7).
- Ring-buffer contents and lifetime; current VUKA spec only states an in-memory classification window.
- Whether guardian pairing and FCM token deletion occurs automatically on scheduled removal or needs a separate request.
- Real bank identity and terms before integration.
- Whether the adult-only scope is adopted as a binding rule; current repo entry is PROPOSED.
- Current implementation status of each collection, retention, deletion and access control; listed controls remain specified/in build pending evidence.
