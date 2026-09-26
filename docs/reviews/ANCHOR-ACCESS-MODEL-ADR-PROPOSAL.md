# Proposed ADR — ANCHOR access model (public hash, role-gated evidence)

> **Author of this proposal:** Babatunde Adelusi (business/economics), 26 Sep 2026. **Status:** `PROPOSED` — a draft for **Lethabo** (ADR author) to file, **Sibusiso** (second lead) to accept, and **Ipeleng** (security/legal) to review. **This document files no ADR and changes no accepted one.** It extends ADR-0035; it does not supersede it.
> **Revision note (26 Sep, after Sibusiso's second-lead response):** narrowed to what the built server actually implements. Items the build does not support are now listed as **open design questions**, not decisions — see "Open design questions (unbuilt)".
> **Why it is needed:** the war-room context (`context.md`) proposed a closed enterprise ledger visible only to stakeholders. That contradicts ADR-0035 (Hedera + OpenTimestamps) and `docs/ANCHOR-RATIONALE.md` (a ledger owned by the parties to a dispute proves nothing to the other side). It also creates a POPIA problem it was meant to solve. This proposal records the corrected model.

---

## Context

- **ADR-0035** (accepted, 23 Sep 2026) chose **Hedera Consensus Service** as the primary anchor with **OpenTimestamps → Bitcoin** as the second, permissioned **write** (a server-held `submitKey`) and a public topic. It did not spell out the **read/access model** for the *evidence*.
- **`docs/ANCHOR-RATIONALE.md`** argues that verification must not require trusting a party to the dispute; a closed ledger reintroduces exactly that.
- **The B2B2C pitch (insurer + bank) needs a role model** that covers the victim, guardians, bank, insurer, court/SAPS and regulators, each on a different legal basis — but the built server implements only the member's own record and the guardian alert.
- **POPIA s26** makes biometric information — read to include voice/video — *special personal information*. A data-rich private ledger raises the erasure/correction problem (ss 24–25); a hash-only public anchor does not.

## Decision (proposed)

**The anchor is public to read and permissioned to write. Only the parts the server already implements are recorded here as decisions; the evidence access model is designed, not built, and is listed below as open design questions.**

**Recorded now — matches ADR-0035 and the server built on #89/#96:**

1. **Anchor (on-ledger):** a 32-byte root + a key-manifest hash, published by VUKA's server only (**permissioned write, public read**). Anyone may verify the hash from an independent mirror — **no identity, no content on chain**. (`GET /v1/anchor/proof/{head}` and `/v1/anchor/latest` are public.)
6. **Erasure:** deleting the off-chain payload and salt is the POPIA mechanism (`DELETE /v1/subjects/{id}/data`); the fact an event happened, and its hash, remain verifiable.
7. **No tokens.** No coin, no ICO (ADR-0034/0035).
8. **Optional enterprise mode:** a bank/consortium may run its own **read node / mirror** inside its perimeter for procurement comfort — **the public anchor remains the root of trust; it is not replaced.**

**Policy intent, tagged `PROPOSED` (no enforcement claim):**

4. **Access bases:** the **hash** is public (anyone); the **victim** accesses her own record through the app; **bank/insurer** access is intended per-case and purpose-limited on her consent (or legal process); **court/SAPS** on legal process; **regulators** under statutory authority. **No bank, insurer, court or regulator endpoint exists** — the only record reader today is the member's own device, with a fresh PIN and the T30 hold.

## Open design questions (unbuilt) — not decisions

Each is `PROPOSED` and needs an owner, a threat model and Ipeleng's security/legal review before it can become a decision.

- **2 — Encryption to a victim-held key.** The server currently encrypts payloads with a **server-held** AES-256-GCM key (`VUKA_PAYLOAD_KEY_B64`). The escalation engine (§8) must read `checkin_result.result`, `pin_authorised.mode` and `signal_event_id` to know a duress PIN was entered and to alert guardians and the bank. A victim-held key is therefore only possible for fields the server never needs to act on. **Open:** the explicit field-tier split (server-readable vs victim-key-only). Owner: Sibusiso.
- **3 — Guardians as a backup node.** The built §9 recovery is a 10-word code verified with Argon2id, a new device, the old key revoked, and a 24 h freeze. Guardians hold **no copy** of the record today — the guardian alert returns only the incident id, trigger and times. **Open:** whether guardians hold ciphertext at all, and if so the key derivation, rotation and revocation, the lifecycle of every copy, and how deletion/retention applies to each; a guardian-held ciphertext is a second copy of special personal information on a device the victim does not control. Owner: Lethabo + Ipeleng. (Also Khutso's review, point 3.)
- **5 — Anchoring every access.** Only the member's own export is on-chain today, as a `pin_authorised` for action `export`. **Open:** what an "access event" records, who may read it, and how it is handled given the chain is **per subject** — anchored access events are linkable to that subject by design. Owner: Sibusiso + Ipeleng.
- **Role matrix and third-party flows.** The matrix below is the intended model; **none of it is enforced** and no endpoint exists.

### Role matrix (proposed, not built)

| Role | Intended access to the victim's record | Basis | Status |
|---|---|---|---|
| Victim | Full, through her own device | She is the data subject | Built (app) |
| Guardian | **None** to the record; alert only | Her invitation; their s18 notice | Built (alert only) |
| Bank | Per case, scoped | Her consent (or legal process) | `PROPOSED` — no endpoint |
| Insurer | Per claim, scoped | Her consent (or legal process) | `PROPOSED` — no endpoint |
| Court / SAPS | On production | Legal process | `PROPOSED` — no endpoint |
| Regulator | As mandated | Statutory authority | `PROPOSED` — no endpoint |
| Anyone | Hash only | Public | Built |

## Consequences

- **Spec (§8, §9, §13) / contract v2 (Sibusiso):** the victim-held-key and guardian-backup questions are now explicit open items (2 and 3) rather than assumptions; the guardian alert carries the alert, **not** the record.
- **Verify page (Ipeleng):** verification of the **hash** is public; opening the **evidence** is not built beyond the member's own export.
- **Finance/business (Babatunde):** the per-case bank model and per-claim insurer access remain **`PROPOSED` policy intent**, not enforced product.
- **Legal (Ipeleng/counsel):** the POPIA/ECTA/CASP positions remain *our reading*, pending counsel.

## Proposed ADR text (for Lethabo to file)

> **ADR-00XX (proposed): ANCHOR is a permissioned-write, public-read anchor; erasure deletes the payload; no tokens; an optional enterprise read-node may be offered; third-party evidence access is designed and `PROPOSED`, not built.**
> **Status:** Proposed. **Extends** ADR-0035; **does not supersede** it. **Owner:** Lethabo Hoaeane (author) with Sibusiso Khumalo (implementation).
> **Context:** ADR-0035 fixed the ledger and the on-chain footprint but not the access model for the evidence; `ANCHOR-RATIONALE.md` requires verification that does not trust a party to the dispute; POPIA s26 restricts biometric/special personal information; the insurer/bank pitch needs a defined role model, and the built server defines only part of it.
> **Decision:** (1) public-read anchor, permissioned write; (2) deletion of the off-chain payload and salt is the erasure mechanism, while the hash remains verifiable; (3) no tokens; (4) an optional enterprise read-node may be offered without replacing the public root of trust; (5) per-case bank/insurer access on consent is recorded as `PROPOSED` policy intent, with no enforcement claim. Victim-held encryption, guardian-held backups, access-event anchoring and the third-party role matrix are **open design questions**, listed above, not decided here.
> **Consequences:** see above; spec §8/§9/§13 and contract v2 unchanged by this ADR pending the open questions; the public-hash / private-evidence split stands.
> **Acceptance:** both leads; Ipeleng's recorded security/legal review. Recorded in `docs/ADR-ACCEPTANCE-RECORD.md`.

## Proposed acceptance-record row (for `docs/ADR-ACCEPTANCE-RECORD.md`)

| ADR | Proposed by | Accepted by | When | Record | Conditions |
|---|---|---|---|---|---|
| ADR-00XX — public-read anchor, payload-deletion erasure, no tokens, optional enterprise mirror; third-party access `PROPOSED` | Lethabo (co-lead) | **Pending** — Sibusiso (second lead) | — | The PR that adds it | Ipeleng's security/legal review; open design questions 2, 3 and 5 each get an owner and a threat model; counsel confirms the POPIA/CASP readings |

## What this proposal does NOT change
- It does **not** edit `docs/adr.md` or any accepted ADR (that is Lethabo's, with Sibusiso's acceptance).
- It does **not** change the ledger choice (Hedera + OpenTimestamps), the on-chain footprint (33-byte typed messages), or the cost model.
- It makes **no claim** of deployment, measurement, admissibility or legal clearance.
- It makes **no claim** that the evidence is encrypted to a victim-held key, that guardians hold a usable backup, or that third-party access or access-anchoring is built.
