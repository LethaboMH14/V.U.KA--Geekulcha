# PR #10 Security Review — Ipeleng

**Reviewer:** Ipeleng Constance Modise
**Date:** 2026-09-15
**Branch reviewed:** `feat/sibusiso-3.3-human-gate`
**Verdict:** APPROVE with findings

## Scope

Security review of Sibusiso's PR #10 — WBS 3.3 human-gate / operator approval path. Focus: privacy boundaries (POPIA), privilege-escalation surfaces, audit-trail integrity, and whether the operator flow can be abused to bypass consent.

## Findings

### 🔴 D — OPERATOR-DUTY contradicts governance code

`docs/OPERATOR-DUTY.md` says an operator's approval decision is **final and cannot be overridden**. `governance.py` implements the opposite: the machine state machine retains the right to flag a candidate back to `watch` state after operator approval. This is a real divergence, not a wording nit — whichever way it resolves, the other artefact must change. Blocks merge.

**Owner:** Sibusiso. Fix: conform code to the duty card, or propose an ADR superseding the state machine first.

### 🔴 H — Wrong comparison operator in `retain_consented_match`

`governance.py` line 118 uses `embedding == candidate` — this compares object identity, not content, so it returns False even for byte-identical lists. The discard-by-default boundary silently never retains a consented match, which is a **fail-safe** behaviour but is not the documented behaviour and is not a deliberate design choice. Blocks merge because the code does not do what the record claims it does.

**Owner:** Sibusiso. Fix: replace with `list(embedding) == list(candidate)` or a proper deep-equality check, and add a test that proves the retained state is reached when consent is given.

### 🟡 A — PR introduces new retained state without an ADR

The PR adds a `retained_with_consent` state. This is a new privacy boundary — the state machine now has two long-lived personal-data states (`retained`, `retained_with_consent`). An ADR should record why two states are needed rather than one. Non-blocking; flag for the ADR review pass.

### 🟡 B — Retention period for `retained_with_consent` not specified

The PR says the state is "retained with consent" but does not say for how long, or what happens when consent is withdrawn. POPIA s11(1)(a) requires consent to be the lawful basis — a state with no expiry and no withdrawal path is not a consent state, it is just a longer-lived retention. Needs a retention period and a documented withdrawal path.

### 🟡 C — No test for consent withdrawal

The PR adds tests for entering `retained_with_consent` but none for leaving it. If withdrawal is untested, the withdrawal path is a documented-only control. Abuse cases are executable tests, not prose.

### 🟢 E — Minor: audit log entry lacks a timestamp field

The audit event emitted on state transition to `retained_with_consent` carries no timestamp field. If it relies on the outer log wrapper, that is fine — but the field should be named in the schema so the wrapper is not silently dropped later.

### 🟢 F — Skipped (Ipeleng's own task)

Finding F — the POPIA s57 analysis gap — is identified during review but is **Ipeleng's own task** under P2.1/P2.2, not Sibusiso's. Removed as a merge blocker. The analysis will be delivered in the POPIA position paper.

### 🟡 G — Refusal logging writes free text, not structured refusal reason

`governance.py` logs a refusal as a free-text string in the audit event. Free-text refusals cannot be counted, cannot be trended, and cannot be used as evidence in a review pass ("refused action is evidence, not an error to swallow" — but only if it is queryable evidence). Needs a refusal-reason enum.

### 🟡 I — Duress code path not covered by this PR

`OPERATOR-DUTY.md` mentions duress as an operator obligation, and WBS 4.3 owns duress abuse cases, but this PR's human-gate path does not distinguish a duress approval from a genuine one. If an operator under duress can approve a retained-with-consent transition, the consent state is forgeable under coercion. Out of scope for this PR but must be recorded as a known gap before merge — not silently inherited.

### 🟢 J — openapi.yaml response for retained_with_consent transition undocumented

The `/candidate/approve` operation's 200 response schema does not mention that the response body may now carry a `retained_with_consent` state. Any consumer building against the OpenAPI contract will not know this state exists.

### 🟢 K — `retain_consented_match` lacks a docstring

The function is the consent boundary itself and has no docstring. Given the honesty-ledger rule, the boundary function should state what it does, what lawful basis it relies on (POPIA s11(1)(a)), and what it refuses.

## Verdict

**APPROVE with findings** — 2 blocking (D, H), 4 medium (A, B, C, G, I), 3 low (E, J, K).

The architecture is sound: the human gate is real, the discard-by-default boundary is the right shape, and the two-signature rule holds. D and H must be fixed before merge — D because a duty card that contradicts the code is a governance failure, H because the code does not do what the record claims. The rest are non-blocking and can be picked up in the follow-on passes (A in the ADR review, B/C in the POPIA paper, G/I as recorded gaps, E/J/K as low-effort hygiene).

**Next:** Sibusiso resolves D and H, then re-requests review.