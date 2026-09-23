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

**Closure — 23 Sep 2026, 19:10 UTC.** The "Ipeleng's recorded security review" line above is closed by this entry (the original line is left as written, per this file's append-only rule; this is the closure record, not an edit to it). Ipeleng posted her required `RULES.md` security/contract review on PR #43 as a formal GitHub review — **verdict APPROVE WITH CONDITIONS**. Full text: `docs/reviews/IPELENG-PR43-REVIEW.md`, committed via PR #45. Scope: `docs/VUKA-2-SPEC.md` §4, §7, §8, §9, §13; ADR-0036, ADR-0037; `docs/STAGED-DURESS-DEFENCE.md`. Explicitly out of scope: §12 (the contract — Sibusiso's own domain), economics, the archive move.

| Condition | Owner | Due | Note |
|---|---|---|---|
| **B1** — remaining guardians notified of additions/scheduled removals, naming the other party; ADR-0036(5) qualified to the single-session case; §17 line for the multi-session replacement risk; T24 extended | Lethabo (spec), Ipeleng (test) | Before the §8/§9 meeting closes (Thu) | Blocker |
| **B2** — §17 gains: a compromised server can suppress or fabricate escalation; independent witnesses are the guardian's own-key ack and the bank's own systems | Lethabo | Before the §8/§9 meeting closes (Thu) | Blocker |
| **B3** — §17 gains: possession of the unlocked phone forces a `no_answer` escalation including the bank signal; `signal_detected` carries location | Lethabo | Before the §8/§9 meeting closes (Thu) | Blocker |
| **S1** — `bank_signal_sent` records the triggering outcome (`duress_pin` / `no_answer` / `contact_lost`) | **Sibusiso**, with contract v2 | No date set | Should-fix, does not block merge |
| **S2** — onboarding recommends ≥2 guardians; §17 lone-guardian line | Vukosi / Mutarisi | No date set | Should-fix, does not block merge |
| **S3** — privacy-policy text: residuals and cooling-off verbatim, hash permanence, guardian departure lifecycle, bank named as a recipient before real integration | Ipeleng | No date set | Should-fix, does not block merge |
| **S4** — extend the 24 h post-recovery freeze to bulk export (`GET /v1/subjects/{id}/export`) | Lethabo, with §9 | No date set | Should-fix, does not block merge |

None of B1–S4 blocks the PR #43 merge that already happened (`8c621dfc`, 19:24:39 UTC) — Ipeleng's review says so directly, and the merge landed after her review was posted.

**Follow-up, 23 Sep 2026.** The spec text for B1, B2, B3, S1, S2 and S4 is proposed in the PR from branch `docs/pr43-review-followups`. S1 still needs Sibusiso to confirm it in contract v2; S4 and the recovery row still need Lethabo and Ipeleng to confirm them at P3.L8. S3, the privacy policy, stays with Ipeleng. The conditions close only once that PR merges.
