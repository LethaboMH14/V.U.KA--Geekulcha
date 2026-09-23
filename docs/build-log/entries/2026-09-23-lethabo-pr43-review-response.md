## 2026-09-23 | Lethabo (co-lead), via Claude Code assistant | PR #43 review response | PROPOSED — binds on second-lead acceptance

**Research** — Read Sibusiso's second-lead review of PR #43 (amendments A1–A3, shortfalls 1–6, questions 1–4) and the independent review he ran and posted (blockers B1–B7, should-fix S1–S10, nit N1). Checked each finding against the spec, PR #39's `anchor/chain.py` and `anchor/verify.py`, and the economics script before accepting it.

**Real data / references** — Break-even recomputed with `math.ceil`: 10,901 members at R20, including the anchoring ceiling (`python3 scripts/economics_vigil_anchor.py`). Hedera mirror-node message endpoint (`GET /api/v1/topics/{id}/messages/{sequence}`); RFC 6962 §2.1 for the Merkle split.

**Business reasoning** — Anchoring is now a bounded fixed cost (at most ≈ R570/month, whatever the member count), which keeps the "fixed, not per user" claim true when immediate anchors scale with check-ins. Rounding break-even up means no judge can find a member short.

**Competitor reference** — Not applicable; this entry changes protocol, schedule and cost-model correctness.

Changed: `docs/VUKA-2-SPEC.md` revision 2:
- the signed statement binds subject, target, action and source time (B1);
- verification compares mirror message bytes with the recomputed root, against a pinned topic and key manifest (B2);
- outcome arbitration plus a transactional outbox (B3);
- server-owned deadline authority, nonce and counter rules (B4);
- PIN authorisations, incident closure, key revocation and guardian enrolment authority (B5);
- immediate roots for every PIN-gated outcome, coalesced per 60 s (B6);
- minimal deliverables before their consumers (B7);
- format v2 with a legacy v1 path (S1);
- batch snapshot and retry, head-keyed public proof, n = 0 rejected (S2);
- typed 33-byte ledger messages for roots and key fingerprints (S3);
- a Needs column and T21–T24 (S4);
- evidence levels counted in principals (S5);
- the attestation claim narrowed (S6);
- M3 measures display time on the guardian phone (S8);
- testnet epochs and live/archived/unavailable states (S9).

Plus:
- ADR-0034 names what it supersedes or parks (A1) and fixes the formula wording (A3).
- ADR-0035 adds typed messages, coalescing and the testnet reset plan (A2).
- ADR-0036 adds PIN authority, incident closure, key revocation, a 24 h silent removal delay and never-zero guardians (shortfall 4, decided by Lethabo).
- Economics: ceiling rounding and the anchoring ceiling (S7).
- Pre-build fallback and APK fallback, with Mutarisi as backup owner (shortfalls 1–2).
- Sibusiso's T08 fallback (shortfall 3).
- Babatunde's validation task (shortfall 5).
- RULES comment→rule additions.
- Checklist: 5 new P3 rows.
- OPEN-GAPS: G31 and G32.
- Sibusiso's reviewer line fixed (N1).
- The unauditable "45 findings resolved" assurance removed (S10, decided by Lethabo).

Evidence: `node scripts/check-docs.mjs`, `node scripts/check-intake.mjs`, `python3 scripts/economics_vigil_anchor.py`, `git diff --check` — run before commit.

Decision: ADR-0034 to ADR-0038 still Proposed; Sibusiso's acceptance binds them.

Needs/blockers: the organiser answer (Lethabo, Thu 12:00); the removal-rule and PIN-authority details agreed with Ipeleng by Thu 12:00.

Business handoff: `docs/ECONOMICS-VIGIL-ANCHOR.md` — break-even is **10,901** at R20, and anchoring is at most ≈ R570/month. Babatunde runs 5 user conversations and 1 bank or insurer approach (P3.B7).

Next: Sibusiso's decision on the ADRs; vectors Thu 09:00.
