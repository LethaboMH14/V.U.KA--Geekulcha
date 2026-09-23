# ADR acceptance record

Who accepted which decision, when, and on which record. `RULES.md` requires a linkable record for every assurance. This file replaces the archived `archive/2026-09-four-layer/docs/CONTRACT-APPROVAL-RECORD.md` for decisions from ADR-0034 on. **Append only:** add a row per decision, and never edit a past row — add a correction row instead.

| ADR | Proposed by | Accepted by | When | Record | Conditions |
|---|---|---|---|---|---|
| ADR-0034 — VIGIL + ANCHOR; KHAYA/UMOJA parked | Lethabo (co-lead) | Sibusiso (second lead) | 23 Sep 2026, 16:56 UTC | PR #43 review at `3855a3d` | None |
| ADR-0035 — Hedera primary, coalesced immediate roots, typed messages, testnet epochs | Lethabo | Sibusiso | same | same | None |
| ADR-0036 — governance under coercion | Lethabo | Sibusiso | same | same | The decision is accepted. The PIN-verification mechanism (B5) is a **pre-condition for implementing** `docs/VUKA-2-SPEC.md` §9, tracked as P3.L8 (Lethabo + Ipeleng) |
| ADR-0037 — bank risk signal, never from detection alone | Lethabo | Sibusiso | same | same | None |
| ADR-0038 — no LLM / RAG / agent framework in the product | Lethabo | Sibusiso | same | same | None |

**Separate requirements recorded with the acceptance:**
- **Before contract v2's schemas or vectors are written:** `actor_id` is in the device-signed statement (`docs/VUKA-2-SPEC.md` §4). Added 23 Sep in the commit after the acceptance.
- **Before contract v2 or this PR's governance changes are called frozen:** Ipeleng's recorded security review (RULES.md). **Pending.**
- **Babatunde** accepted the pivot on 23 Sep (PR #43 comment). His acceptance of `docs/ECONOMICS-VIGIL-ANCHOR.md` as frozen is pending the event-volume reconciliation and his price modelling (he owns the price).
- Khutso's and the other owners' acceptances are theirs to record; none is inferred here.
