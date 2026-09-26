## 2026-09-26 | Babatunde Adelusi (via OpenCode assistant, DeepSeek V4.1 Flash) | War-room context — compliance + ANCHOR access model | Proposed — for leads/Ipeleng

**Research** — Read `docs/ANCHOR-RATIONALE.md`, `docs/adr.md` ADR-0034/0035/0037, `docs/VUKA-2-SPEC.md` §8/§9/§13, `docs/MASTER-CONTEXT.md` §6, `docs/OPEN-GAPS.md` (G32), `docs/RICA-POSITION.md`, `docs/POPIA-IO-REGISTRATION.md`. Checked the SA position on crypto-asset service providers (FSCA/FAIS, CASP licensing) and POPIA s26 (special personal information — biometrics incl. voice/video).

**Real data / references** — FSCA: crypto assets declared a financial product (Oct 2022); CASP licensing under FAIS since 1 Jun 2023, limited to financial services *in respect of crypto assets*; a hash is not a "digital representation of value". POPIA s26: biometric information (including voice/video) is special personal information; correction/deletion at ss 24–25. ECTA s15(3)(a)–(c): weight turns on generation, integrity and originator identification. Anchor cost: R569.47/month ceiling `ESTIMATE` (spec §10).

**Business reasoning** — For a bank/insurer sale, the access model *is* the compliance story: a public hash makes the record verifiable by a stranger, while the evidence stays consent-gated. Guardians are reframed as a blind backup (device-theft recovery), which removes a POPIA exposure and strengthens "the victim holds the record" — the line the pitch sells.

**Competitor reference** — Not applicable to this change (it is a compliance/architecture correction). The competitor landscape research (SA + global) is held for Block 3.

Changed: `context.md` (reconciled to the honesty ledger and ADR-0035; permissioned-write/public-read; tamper-evident/ECTA wording; POPIA s26 precision; "no tokens"; blind guardian backup; FSCA stated as our reading, not clearance); `pitch-deck-outline.md` (same compliance fixes; access model added; "5 pillars" marked draft-to-confirm); `docs/reviews/ANCHOR-ACCESS-MODEL-ADR-PROPOSAL.md` (new — draft ADR extending ADR-0035 for Lethabo/Sibusiso/Ipeleng); this entry.

Evidence: research above; `node scripts/check-docs.mjs` run locally. No spec, accepted ADR, contract or code changed.

Decision: none filed. The proposed ADR requires **both leads** (Lethabo author, Sibusiso acceptance) plus **Ipeleng's** security/legal review; counsel should confirm the POPIA/CASP readings.

Needs/blockers: Lethabo/Sibusiso/Ipeleng on the ADR proposal; counsel on the POPIA/CASP positions.

Business handoff: `context.md` and `pitch-deck-outline.md` to the war-room presenters; the ADR proposal to the leads.

Next: file the ADR (leads); then draft the war-room pitch against the final architecture.
