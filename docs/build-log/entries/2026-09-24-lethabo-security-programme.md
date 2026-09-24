## 2026-09-24 | Lethabo (co-lead, acting security lead), via Claude Code assistant | Security, compliance and governance programme; ADR-0043 proposed | PROPOSED — review loop in progress

**Research** — Three research passes against primary sources, saved in the repo with literal quotes and URLs, or ⚑ where unverified:
- `docs/security/research/SA-LAW.md`: POPIA s1, s11, s18, s19, s21–s24, s26, s27, s57, s69, s72 and s107; the Cybercrimes Act s54; ECTA; the Harassment Act; the Joint Standard; Information Regulator guidance.
- `STANDARDS.md`: MASVS 2.1.0, ASVS 5.0.0, API Top 10 2023, SSDF 1.1, LINDDUN, CVSS 4.0, SLSA 1.2, Android 14 and Hedera HCS.
- `THREAT-DATA.md`: SABRIC 2025, SAPS kidnapping figures, overlay and accessibility malware, attestation relay, stalkerware abuse of safety apps, testnet resets.

**Real data / references** — No measurement. The programme is a plan. Revision 1 was attacked by an independent red-team review: 30 findings, all dispositioned in §11. Three proposed device controls were cut or rewritten because they were unsafe or infeasible.

**Business reasoning** — A security-literate judge tests the claims. This programme states what holds, what doesn't, and what can be shown live.

**Competitor reference** — Not applicable.

Changed:
- `docs/security/SECURITY-PROGRAMME.md` (new).
- `docs/security/research/` (new: the three evidence files).
- `docs/adr.md`: ADR-0043 (Proposed). A guardian stand-down never ends a duress incident; a silent armed journey notifies guardians.
- `docs/PIN-AUTHORITY-RULES.md`: a banner saying the spec governs where it differs.
- `docs/security/PENTEST-PLAN.md`: PT-32 is 404, aligned with T49.

Evidence: `node scripts/check-docs.mjs` passes.

Decision: None until ADR-0043 is accepted.

Needs/blockers:
- Sibusiso decides ADR-0043.
- A second-model adversarial review of revision 2 is scheduled.
- The Actions billing block stops CI on this PR.

Business handoff: Babatunde's security slide draws from §1, §9 and §10 only.

Next: the review round, then the builds from §5 in priority order.
