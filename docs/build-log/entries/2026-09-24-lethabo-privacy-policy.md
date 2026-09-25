## 2026-09-24 | Lethabo (co-lead, acting security lead), via Claude Code assistant | Privacy policy and POPIA one-pager (P3.S6) | PROPOSED — review pending

**Research** — Drafted from:
- `docs/VUKA-2-SPEC.md` §2, §3, §8, §9, §10, §13 and §17;
- `docs/PIN-AUTHORITY-RULES.md`, and ADR-0036, ADR-0040 and ADR-0041;
- Ipeleng's PR #43 review, condition S3;
- `docs/POPIA-POSITION.md`, `docs/POPIA-IO-REGISTRATION.md` and `docs/security/COMPLIANCE-GOVERNANCE.md`.

An independent honesty review checked every claim against those sources. It found no invented contacts or registrations and no "secure" or "compliant" claims. Its two findings are fixed here:
- the 0.975 s window is a fixed model property, not a proposal;
- the accepted retention, deletion, removal and hold periods are labelled "specified", not "PROPOSED".

**Real data / references** — No measurement. Every value cites its spec section or ADR.

**Business reasoning** — The deck needs a privacy slide, and a bank or insurer partner will ask for this first. Stating plainly what we can't yet claim is the strongest position.

**Competitor reference** — Not applicable.

Changed:
- `docs/PRIVACY-POLICY.md` (new, member-facing): the prototype status (Hedera testnet; `sim_bank` SIMULATED); what we collect and never collect; recipients; retention; deletion with a permanent hash and residuals; duress behaviour stated safely; the guardian lifecycle; POPIA rights including the pre-incident hold; security limits (internal test only, G8).
- `docs/security/POPIA-ONE-PAGER.md` (new): the eight POPIA conditions → how VUKA meets each → the evidence path → what's still open.

Evidence: `node scripts/check-docs.mjs` passes.

Decision: None. The UNDEFINED items are listed at the end of each file: the contact route, the legal entity, the Google sign-in data detail, the rights process, deleting a departed guardian's data, the hosting region, and the adult-only rule.

Needs/blockers: the team sets a contact route. The Information Officer registration stays "prepared, not submitted" until an entity and head exist.

Business handoff: Babatunde can take the privacy slide from `PRIVACY-POLICY.md` §1–§3 as written, labelled as a prototype.

Next: review, then an in-app notice built from the same text.
