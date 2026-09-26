# Proposed ADR — ANCHOR access model (public hash, role-gated evidence)

> **Author of this proposal:** Babatunde Adelusi (business/economics), 26 Sep 2026. **Status:** `PROPOSED` — a draft for **Lethabo** (ADR author) to file, **Sibusiso** (second lead) to accept, and **Ipeleng** (security/legal) to review. **This document files no ADR and changes no accepted one.** It extends ADR-0035; it does not supersede it.
> **Why it is needed:** the war-room context (`context.md`) proposed a closed enterprise ledger visible only to stakeholders. That contradicts ADR-0035 (Hedera + OpenTimestamps) and `docs/ANCHOR-RATIONALE.md` (a ledger owned by the parties to a dispute proves nothing to the other side). It also creates a POPIA problem it was meant to solve. This proposal records the corrected model.

---

## Context

- **ADR-0035** (accepted, 23 Sep 2026) chose **Hedera Consensus Service** as the primary anchor with **OpenTimestamps → Bitcoin** as the second, permissioned **write** (a server-held `submitKey`) and a public topic. It did not spell out the **read/access model** for the *evidence*.
- **`docs/ANCHOR-RATIONALE.md`** argues that verification must not require trusting a party to the dispute; a closed ledger reintroduces exactly that.
- **The B2B2C pitch (insurer + bank) needs a role model** that covers the victim, guardians, bank, insurer, court/SAPS and regulators, each on a different legal basis.
- **POPIA s26** makes biometric information — read to include voice/video — *special personal information*. A data-rich private ledger raises the erasure/correction problem (ss 24–25); a hash-only public anchor does not.

## Decision (proposed)

**The anchor is public to read; the evidence is role- and consent-gated.**

1. **Anchor (on-ledger):** a 32-byte root + a key-manifest hash, published by VUKA's server only (**permissioned write, public read**). Anyone may verify the hash from an independent mirror — **no identity, no content on chain**.
2. **Evidence (off-ledger):** encrypted to a **victim-held key**; access is role-gated by the matrix below.
3. **Guardians are a blind backup, not a reader.** They receive the **alert** and hold an **encrypted copy** of the record for device-theft recovery. Recovery happens when **the victim enters her own credentials on the guardian's device**; the guardian holds ciphertext they have no key for.
4. **Access bases:**
   - **Public** — the hash (anyone).
   - **Consent** — the victim, for herself, and for **bank/insurer** on a per-case, purpose-limited basis (POPIA s11(1)(a)).
   - **Legal process** — **court/SAPS** on production (subpoena / s205 CPA / warrant) and **regulators** under statutory authority.
   - **Storage only** — guardians.
5. **Every access is itself an anchored event** (who pulled what, when, under which authority).
6. **Erasure:** deleting the off-chain payload and salt is the POPIA mechanism; the fact an event happened, and its hash, remain verifiable.
7. **No tokens.** No coin, no ICO (ADR-0034/0035).
8. **Optional enterprise mode:** a bank/consortium may run its own **read node / mirror** inside its perimeter for procurement comfort — **the public anchor remains the root of trust; it is not replaced.**

### Role matrix

| Role | Access to the victim's record | What they get | Basis |
|---|---|---|---|
| Victim | Full | The whole record (she holds the key) | She is the data subject |
| Guardian | **None** | The alert + an **encrypted backup copy** | Her invitation; their own consent (s18 notice) |
| Bank | Per case, scoped | Timeline + anchor proof, purpose-limited to the dispute | Her consent (or legal process) |
| Insurer | Per claim, scoped | Same, purpose-limited to the claim | Her consent (or legal process) |
| Court / SAPS | On production | The record + anchor proof | Legal process |
| Regulator | As mandated | As mandated | Statutory authority |
| Anyone | Hash only | No identity, no content | Public |

## Consequences

- **Spec (§8, §9, §13) / contract v2 (Sibusiso):** the guardian's role as **backup node vs alert recipient** is made explicit; the guardian alert carries the alert, **not** the record; the guardian acknowledgement stays a separate guardian-key-signed event (the E2 witness) and does not grant read access; the export/proof bundle carries the per-case, purpose-limited scope.
- **Verify page (Ipeleng):** verification of the **hash** is public; opening the **evidence** requires the victim's key or an authorised, logged pull.
- **Finance/business (Babatunde):** supports the per-case bank model (R15/case) and per-claim insurer access; no new cost.
- **Legal (Ipeleng/counsel):** confirms the POPIA/ECTA/CASP positions as *our reading*, pending counsel.

## Proposed ADR text (for Lethabo to file)

> **ADR-00XX (proposed): ANCHOR is a permissioned-write, public-read anchor; the evidence is role- and consent-gated; guardians are a blind backup.**
> **Status:** Proposed. **Extends** ADR-0035; **does not supersede** it. **Owner:** Lethabo Hoaeane (author) with Sibusiso Khumalo (implementation).
> **Context:** ADR-0035 fixed the ledger and the on-chain footprint but not the access model for the evidence; `ANCHOR-RATIONALE.md` requires verification that does not trust a party to the dispute; POPIA s26 restricts biometric/special personal information; the insurer/bank pitch needs a defined role model.
> **Decision:** (1) public-read anchor, permissioned write; (2) evidence encrypted to a victim-held key; (3) role-gated access on consent (bank/insurer) and legal process (court/regulator); (4) guardians are blind backup, not readers; (5) every access is anchored; (6) deletion of the payload is the erasure mechanism; (7) no tokens; (8) an optional enterprise read-node may be offered without replacing the public root of trust.
> **Consequences:** see above; spec §8/§9/§13 and contract v2 updated by Sibusiso; verify-page split by Ipeleng.
> **Acceptance:** both leads; Ipeleng's recorded security/legal review. Recorded in `docs/ADR-ACCEPTANCE-RECORD.md`.

## Proposed acceptance-record row (for `docs/ADR-ACCEPTANCE-RECORD.md`)

| ADR | Proposed by | Accepted by | When | Record | Conditions |
|---|---|---|---|---|---|
| ADR-00XX — public-read anchor, role-gated evidence, blind guardian backup | Lethabo (co-lead) | **Pending** — Sibusiso (second lead) | — | The PR that adds it | Ipeleng's security/legal review; counsel confirms the POPIA/CASP readings |

## What this proposal does NOT change
- It does **not** edit `docs/adr.md` or any accepted ADR (that is Lethabo's, with Sibusiso's acceptance).
- It does **not** change the ledger choice (Hedera + OpenTimestamps), the on-chain footprint (33-byte typed messages), or the cost model.
- It makes **no claim** of deployment, measurement, admissibility or legal clearance.
