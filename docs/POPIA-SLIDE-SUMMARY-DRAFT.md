# VUKA privacy one-pager — for Babatunde's pitch (DRAFT)

**Owner:** Ipeleng Constance Modise (security and privacy). **Drafted** 23 September 2026 (via Cline assistant) for Babatunde's Friday deadline. Sources: `archive/2026-09-four-layer/docs/POPIA-POSITION.md` (moved to the archive on the pivot branch; content preserved), the pivot's `docs/POPIA-IO-REGISTRATION.md`, `docs/VUKA-2-SPEC.md` §13, ADR-0031. Not legal advice; ⚑ marks statutory points pending counsel's Gazette verification. Check every line against the sources before it goes on a slide.

---

**The one slide line:** *VUKA collects the minimum, keeps it the shortest time, shows the public nothing, and never identifies anyone.*

## What we collect — and what we never do

| Collected | Never collected |
|---|---|
| Sound **labels and scores** only — the 3-second audio buffer is never stored, and audio is never attached to evidence | Raw audio — not stored, full stop |
| Location **only** on a detected signal; speed bucket only on heartbeats | Camera images, contacts beyond the chosen guardians, banking credentials |

## The legal base, in four lines

- **Your data — your consent** (POPIA s11(1)(a) ⚑). You can export your full record and delete it (your PIN + a 72-hour cooling-off; guardians notified).
- **Guardians — their own consent**, plus a POPIA s18 privacy notice they acknowledge when they accept.
- **Bystanders — nothing.** VIGIL classifies *what sound* occurred, never *who* spoke; POPIA's biometric definition (voice recognition = identifying a person) does not bite on what-happened labels. The camera/face product that would have needed the s27 biometric analysis was parked and archived together with that analysis (ADR-0031, ADR-0034).
- **The public ledger gets hashes only** — 33-byte messages, no personal data ever (spec §10).

## Retention (say it plainly)

- Payloads and salts: **90 days**, unless you place a dispute hold.
- After deletion, what remains: coarse event class, time, ids, hashes, public keys — **permanent by design**, so your evidence chain stays verifiable. The privacy policy states this verbatim.

## Governance line for the slide

Information Officer registration: **path prepared — free, online, under 30 minutes; the submission itself is a legal act the leads perform before any pilot** (unregistered, POPIA puts every duty on the head personally). Honest wording for the slide: "prepared, not yet submitted".

## Honesty lines (keep them on the slide)

- "Discreet, not invisible" — the microphone indicator is visible while a journey is armed.
- The anchor proves **when**, not what. Never "court-admissible" — say "built to the ECTA s15 reliability factors" (s15(3) was read from primary text on 23 Sep).
- ⚑ every other statutory quote is pending counsel's verification against the Gazette.
