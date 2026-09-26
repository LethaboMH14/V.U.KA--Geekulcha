# VUKA Privacy Policy -- GKHack26 Build

> **Owner:** Ipeleng Constance Modise. **Status:** DRAFT -- 25 Sep 2026. **Due:** Sat 26 Sep 18:00. **Not legal advice.**
>
> **Companions:** docs/security/COMPLIANCE-GOVERNANCE.md, docs/VUKA-2-SPEC.md §13, docs/STAGED-DURESS-DEFENCE.md, docs/RICA-POSITION.md.

## 1. Who We Are

**Data Controller:** Team SONAR (VUKA project), Geekulcha Annual Hackathon 2026. No company registration exists yet; the responsible party is the natural persons building VUKA. See docs/security/COMPLIANCE-GOVERNANCE.md §1 Q-C1.

**Information Officer:** Not yet registered. Path prepared in docs/POPIA-IO-REGISTRATION.md. Leads (Lethabo, Sibusiso) to designate.

## 2. What We Collect (and What We Don't)

| Category | Collected? | Purpose | Legal Basis (POPIA) |
|----------|------------|---------|---------------------|
| Journey data (timestamps, location on signal_detected only) | Yes | Safety escalation, evidence chain | Consent (s11(1)(a)) at journey arming |
| Guardian identity (name, FCM token) | Yes | Alert delivery | Guardian's own consent at acceptance (G6) |
| PIN entries (normal/duress -- never the PIN value itself) | Yes | Escalation outcome | Consent (s11(1)(a)) at onboarding |
| Audio classifications (YAMNet labels + scores, 0.975s windows) | Yes | Duress detection | Consent (s11(1)(a)) at journey arming |
| Raw audio | Never | -- | -- |
| Camera images | Never | -- | -- |
| Contacts (beyond chosen guardians) | Never | -- | -- |
| Banking credentials | Never | -- | -- |
| Background location | Never | -- | -- |
| IMEI, serial, Android ID, phone number | Never | -- | -- |

## 3. How We Use Your Data

| Purpose | Data Used | Retention |
|---------|-----------|-----------|
| Journey safety monitoring | Audio classifications, location (on signal only), timestamps | 90 days (see §5) |
| Guardian alerting | Guardian identity, journey status, escalation outcome | 90 days |
| Evidence chain integrity | Hashes, public keys, coarse classes, timestamps, actor IDs | Permanent (see §5) |
| Anchoring to public ledger | Merkle roots (33-byte messages, no personal data) | Permanent (Hedera + OpenTimestamps) |
| Risk signal to partner bank | bank_signal_sent (trigger type only, no personal data) | 90 days |

## 4. Data Sharing

| Recipient | Data Shared | Purpose | Safeguards |
|-----------|-------------|---------|------------|
| Chosen Guardians | Alert content (Don't call or text them. Call 10111.), journey status | Safety escalation | Guardian's own consent; no location unless signal_detected |
| Partner Bank (simulated in build) | bank_signal_sent (trigger type only, no personal data) | Protective hold on transactions | PIN-gated; trigger type recorded; no personal data |
| Hedera Consensus Service | 33-byte messages: 0x01 || Merkle root, 0x02 || SHA-256(key manifest) | Public timestamping | No personal data ever on chain |
| OpenTimestamps | Daily Merkle roots -> Bitcoin | Second anchor | Hashes only |
| Firebase Cloud Messaging | FCM tokens, alert payloads | Push delivery | Google privacy policy; tokens rotated |
| SMS Gateway (if enabled) | None in build -- push only | -- | -- |

No data shared with: insurers (simulated only), advertisers, analytics platforms, other users.

## 5. Retention & Deletion

| Data Category | Retention | Deletion Mechanism | What Remains After Deletion |
|---------------|-----------|-------------------|----------------------------|
| Payloads & salts (journey events, check-ins, PIN entries) | 90 days | DELETE /v1/subjects/{id}/data -- 72h cooling-off, then payload + salt removed | Coarse class, timestamp, actor ID, journey ID, hashes, public keys |
| Guardian FCM tokens | Until guardian removed + 90 days | Guardian removal flow (§9) | None |
| Merkle roots & anchors | Permanent | Never deleted | Hashes only (no personal data) |
| Public key registrations | Until key revoked + 90 days | Key revocation flow (§9) | Public key hash in chain |
| Anchored Merkle roots (Hedera + OpenTimestamps) | Permanent | Never deleted | Hashes only |

Legal basis for permanent retention of hashes/keys: Integrity of the evidence chain the user asked us to keep (POPIA s19; ECTA s15 reliability factors). Stated in this policy.

Cooling-off period: 72 hours after deletion request before payload/salt removal. During this window, the user can cancel deletion.

## 6. Your Rights (POPIA)

| Right | How to Exercise |
|-------|-----------------|
| Access | GET /v1/subjects/{id}/export -- full chain export |
| Rectification | Not applicable (chain is append-only); new entries correct errors |
| Erasure | DELETE /v1/subjects/{id}/data -- 72h cooling-off, then payloads/salts removed |
| Objection | Withdraw consent at any time -- journey ends, no new data collected |
| Portability | Export is machine-readable JSON (verify page compatible) |
| Complaint | Contact Information Officer (once registered) or SA Information Regulator |

## 7. Security Safeguards (POPIA s19)

| Measure | Implementation |
|---------|----------------|
| Encryption at rest | Payloads + salts encrypted; keys in Android Keystore / server HSM |
| Minimal collection | No raw audio, camera, contacts, banking creds, background location |
| App-level | Android Keystore P-256 (StrongBox); SecureRandom for salts/nonces; no JS crypto |
| Transport | HTTPS only (release builds); pinned mirror host; request signing (§7) |
| Anchoring | Merkle roots only; no personal data on chain |
| Access control | PIN-gated actions; two-operator rule for privileged ops |
| Incident response | POPIA breach runbook in docs/security/SSDLC.md §12 |

## 8. Special Protections

### Duress Parity (V5, V6, Spec §17)
- Normal PIN and duress PIN produce identical screens, haptics, request shapes, response delays
- Nothing an attacker can observe reveals duress was signaled
- Guardian alert leads with: Don't call or text them. Call 10111.

### Staged Duress Defence
- Anchor proves when, not what
- Hash chain makes selective deletion detectable
- Independent witnesses: guardian's own-key ack + bank's countersignature
- See docs/STAGED-DURESS-DEFENCE.md

### Children / Vulnerable Persons
- Not targeted by VUKA; if onboarded, guardian consent required (POPIA s34-35)

## 9. Cross-Border Transfers

| Transfer | Mechanism | POPIA s72 Basis |
|----------|-----------|-----------------|
| Hedera (US-based consensus) | Public hashes only | s72(1)(a) -- consent via onboarding; hashes not personal data |
| OpenTimestamps -> Bitcoin | Public hashes only | Same as above |
| Firebase Cloud Messaging (Google, US) | FCM tokens + alert payloads | s72(1)(a) -- guardian consent at acceptance (G6) |
| Hosting (Azure SA North if student sub allows) | Encrypted payloads | s72(1)(a) -- consent; else s72(1)(b) contract |

## 10. Contact

Information Officer (to be designated): Leads Lethabo Hoaeane / Sibusiso Khumalo  
Project: VUKA -- Team SONAR, Geekulcha Annual Hackathon 2026  
Repository: https://github.com/LethaboMH14/V.U.KA--Geekulcha  
Security Contact: security@vuka.example (placeholder)

## 11. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 (DRAFT) | 25 Sep 2026 | Ipeleng Constance Modise | Initial draft per S3 requirement (PR #43) |

Next review: Sat 26 Sep 18:00 (programme deadline). Not legal advice. Counsel questions Q-C1-Q-C7 tracked in docs/security/COMPLIANCE-GOVERNANCE.md §8.
