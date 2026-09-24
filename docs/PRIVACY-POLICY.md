# VUKA privacy notice

**PROPOSED · Owner: Ipeleng · Lethabo covering from 24 Sep 2026**

**Status — FACT:** VUKA is a hackathon prototype on Hedera **testnet**. `sim_bank` is **SIMULATED**. There are no real bank integrations. Team SONAR has no registered legal entity. Information Officer registration is **prepared, not submitted**. Contact route: **UNDEFINED — team to set**. [Source: `docs/security/COMPLIANCE-GOVERNANCE.md` §1; `docs/POPIA-IO-REGISTRATION.md` §§1, 7; `docs/VUKA-2-SPEC.md` §§10, 17]

This notice explains what the prototype is designed to process. Most product controls are specified or in build; this notice does not claim they are all operating. Your data is not proof that an event happened as described. **The anchor proves when, not what.** [Source: `docs/security/SSDLC.md` §§0, 11; `docs/VUKA-2-SPEC.md` §17]

## Who handles the information

**FACT:** Team SONAR is responsible for the prototype's purposes and design. The team has no registered legal entity. The Information Officer registration path is prepared but has not been submitted. Contact route: **UNDEFINED — team to set**. The responsible legal person before incorporation is a recorded counsel question. [Source: `docs/security/COMPLIANCE-GOVERNANCE.md` §§1, 8; `docs/POPIA-IO-REGISTRATION.md` §§1, 2, 7]

| Recipient | What they receive | Source |
|---|---|---|
| Your chosen guardians | Alerts and location attached to a `signal_detected` event; they can acknowledge an alert. | `VUKA-2-SPEC.md` §§2, 3, 8 |
| Bank | The S1 risk signal, only on the defined triggers. A real bank must be named here before any real integration. Today the recipient is `sim_bank` only, and it is SIMULATED. | `VUKA-2-SPEC.md` §§2, 3; Ipeleng PR #43 review, S3; ADR-0037 |
| Hedera | A public anchor containing a 32-byte root in a typed 33-byte message. It contains no personal data. The anchor does not contain your event payload. | `VUKA-2-SPEC.md` §§10, 17 |
| Hosting | The ANCHOR service and encrypted stored data. Planned region: Azure South Africa North, if the student subscription allows. | `VUKA-2-SPEC.md` §13; `docs/security/COMPLIANCE-GOVERNANCE.md` §2 (PO-11) |
| Google | Optional Google sign-in may share basic account profile information at sign-in. Firebase Cloud Messaging (FCM) carries guardian notifications. | `VUKA-2-SPEC.md` §13; Google sign-in data fields: UNDEFINED — needs a decision |
| SMS gateway | Guardian alert fallback messages when the gateway is available. | `VUKA-2-SPEC.md` §§2, 13 |

## What the prototype collects

| Information | What that means | Source |
|---|---|---|
| Onboarding | Your name and a +27 phone number. Google sign-in is optional; Google shares basic account profile information at sign-in. **We do not ask for an ID number.** | `VUKA-2-SPEC.md` §2; exact Google fields: UNDEFINED — needs a decision |
| Journey | Heartbeats while journey mode is armed. A heartbeat carries a speed bucket, not location. Location is attached only to `signal_detected`. | `VUKA-2-SPEC.md` §§2, 3 (V9) |
| Sound detection | A sound label and score from on-device classification. Audio is processed in a **0.975-second** in-memory window (the model's fixed input size, spec V3); audio is not stored or sent. The current spec does not define ring-buffer behavior. | `VUKA-2-SPEC.md` §§2, 13 (V3); sound processing is not speaker identification: `docs/STAGED-DURESS-DEFENCE.md` §8 |
| PIN | A hash used on your device to verify the PIN. The PIN itself does not leave the device. | `VUKA-2-SPEC.md` §9 |
| Guardian | Guardian name, phone number and FCM notification token, plus their signed acknowledgements. | `VUKA-2-SPEC.md` §§2, 3, 9; Ipeleng PR #43 review, S3 |
| Evidence chain | Event payloads, salts, actor and journey identifiers, coarse event classes, times, hashes, public keys, signatures and receipts needed to check the chain. | `VUKA-2-SPEC.md` §§3, 4, 13 |

**Never collected:** audio recordings, camera images, background location, ID numbers, and contacts beyond guardians you choose. VUKA operates in a journey you start; it is not always-on. [Source: `VUKA-2-SPEC.md` §§2 (V1, V2, V9, V10), 13, 17]

## How long information stays

**Retention (specified; not yet verified as implemented):** Payloads and salts are kept for **90 days**, unless you place a dispute hold. After deletion, these residuals remain: **“the coarse class, time, actor id, journey id, hashes and public keys”**. They remain for the integrity of the evidence chain you asked us to keep. Hashes are permanent: a hash cannot be reversed into your data, but it stays in the chain. [Source: `VUKA-2-SPEC.md` §13; Ipeleng PR #43 review, S3]

## Deletion and duress

You can request deletion with your PIN. There is a **72-hour cooling-off period** (specified). Guardians are notified. After that, the payloads and salts are removed; the residuals listed above remain so the chain can still be checked. [Source: `VUKA-2-SPEC.md` §§9, 13]

If you are forced to request deletion with a duress PIN, **it will look deleted but your record is protected**: the request does nothing, and guardians can see the true status. If a duress action has a delay, the phone keeps showing success even after the delay passes. This is intended to avoid alerting a person who may be holding your phone. [Source: `VUKA-2-SPEC.md` §9; ADR-0041]

## Guardians

You add a guardian by creating an invite with a fresh PIN authorisation. The guardian accepts and sees a privacy notice before their data is used. Existing guardians are notified of an addition and told who was added. [Source: `VUKA-2-SPEC.md` §§2 (G1, G6), 9]

Removing a guardian is scheduled and takes effect after a **24-hour** (specified) delay. Until then, the guardian continues receiving alerts. The last guardian cannot be removed until a replacement has accepted. Remaining guardians are told who is scheduled for removal; the guardian being removed is not told. On a separate request to delete a departed guardian's data, their pairing and FCM token are deleted; their signed acknowledgements remain on your chain. Whether scheduled removal automatically triggers that separate deletion is UNDEFINED — needs a decision. [Source: `VUKA-2-SPEC.md` §9; Ipeleng PR #43 review, S3]

Under duress, an addition creates a decoy guardian that receives no alerts, while real guardians are notified. A removal request under duress looks successful but does nothing. [Source: `VUKA-2-SPEC.md` §9]

## Your choices and rights

The spec uses your consent for your journey data, and each guardian's own consent for their data. A guardian receives a privacy notice at acceptance. [Source: `VUKA-2-SPEC.md` §§2 (G6), 13]

| Right or choice | What the prototype specifies | Source |
|---|---|---|
| Access | Request your record export. While an incident is open and for **six hours** (specified) after its last PIN entry, your phone shows a verifiable prefix ending before the incident. After recovery, bulk export is frozen for **24 hours** (specified). | `VUKA-2-SPEC.md` §9; ADR-0041 |
| Correction | **UNDEFINED — needs a decision.** The chain is append-only; the repo does not define a correction request process. | `VUKA-2-SPEC.md` §§3, 13 |
| Deletion | PIN-gated request, **72-hour** (specified) cooling-off, then payload and salt removal; residuals remain. | `VUKA-2-SPEC.md` §§9, 13 |
| Objection | The repo does not define an objection process. Contact route: **UNDEFINED — team to set**. | `docs/security/COMPLIANCE-GOVERNANCE.md` §2 (PO-4, PO-10); contact: UNDEFINED |
| Complaint | You may complain to the Information Regulator of South Africa. The repo provides no general contact route to include here. | `docs/security/COMPLIANCE-GOVERNANCE.md` §§5, 8 |

## Limits you should know

VUKA is discreet, not invisible: Android shows a microphone indicator while a journey is armed. Detection works offline, but delivery needs data. If the phone is switched off before anything is detected, nothing escalates. A signature shows that a key was used; it does not prove the event was genuine. The prototype has an internal test plan, **not an independent penetration test**. It is not described as “secure”, “unhackable” or “court-admissible”. [Source: `VUKA-2-SPEC.md` §17; `docs/security/SSDLC.md` G8]

Children: the repo says the demo and any pilot are for adults aged 18 and over, with no child accounts. **PROPOSED**. [Source: `docs/security/COMPLIANCE-GOVERNANCE.md` §2 (PO-13)]

**Not legal advice. Prepared for a hackathon prototype.**

### UNDEFINED — needs a decision

- Team contact route; responsible legal person before incorporation.
- Google sign-in fields shared and exact Google sign-in flow.
- Ring-buffer contents and lifetime; `VUKA-2-SPEC.md` §2 (V3) specifies an in-memory classification window but does not mention a ring buffer.
- Correction procedure and objection procedure.
- Whether scheduled guardian removal itself triggers deletion of pairing and FCM token, or whether a separate request is required.
- Whether the prototype will be limited to adults (18+) as a binding product rule; current statement is PROPOSED.
- Hosting region if Azure South Africa North is unavailable, and the applicable cross-border basis.
- Real bank's identity and recipient terms before any real integration.
- Current implementation status of each specified collection, retention, deletion and access control.
