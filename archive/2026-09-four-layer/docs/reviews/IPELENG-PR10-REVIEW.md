# PR #10 Security Review — Ipeleng

**Reviewer:** Ipeleng Constance Modise
**Date:** 2026-09-15
**Corrected:** 2026-09-16 — rework after Lethabo's request-changes on PR #27
**Branch reviewed:** `feat/sibusiso-3.3-human-gate` (merged as PR #10, 2026-09-15)
**Verdict:** APPROVE with notes — no blocking findings

## Scope

Security review of Sibusiso's PR #10 — WBS 3.3 human-gate / operator approval path. Focus: privacy boundaries (POPIA), privilege-escalation surfaces, audit-trail integrity, and whether the operator flow can be abused to bypass consent.

## Correction record

The 15 Sep version of this review carried findings that do not describe the code they cite. Lethabo's review on PR #27 refuted them against `origin/main` with grep evidence; Sibusiso confirmed the two blocking findings do not hold. This rework retracts every ungrounded finding, keeps the two that survive, and adds the one real gap the original missed. The retracted findings stay visible below with per-finding evidence — nothing is deleted.

Evidence base for this rework (run 16 Sep): `git show origin/main:server/src/auth/governance.py`; targeted `git grep` against `origin/main`; `python -m unittest discover -s test -p "governance_contract_test.py"` — 8 tests, all pass.

## Retracted findings

| # | Original claim | Why retracted | Evidence |
|---|---|---|---|
| D (was blocking) | OPERATOR-DUTY.md says approval is "final and cannot be overridden"; governance.py "flags back to watch" after approval | Neither cited text exists in any tracked file | `git grep -in "cannot be overridden\|flags back to watch" origin/main` → zero matches |
| H (was blocking) | `embedding == candidate` compares object identity, not content, so a consented match is never retained | Wrong about Python: `==` invokes `__eq__` (content equality); `is` is identity. The consented-match test passes | `test/governance_contract_test.py` — `test_consented_embedding_is_retained` passes (8/8 OK) |
| A | New `retained_with_consent` state needs an ADR | The state does not exist. Actual states: `watch_candidate`, `flagged`, `dismissed`, `whitelisted` | `git grep -n "retained_with_consent" origin/main` → zero matches |
| B | Retention period for `retained_with_consent` unspecified | Cited state does not exist | same as A |
| C | No test for consent withdrawal | Withdrawal path for a state that does not exist | same as A |
| E | Audit event for the `retained_with_consent` transition lacks a timestamp | Cited transition does not exist | same as A |
| J | `/candidate/approve` response schema does not document the new state | The endpoint does not exist | `git grep -n "candidate/approve" origin/main` → zero matches |
| K | `retain_consented_match` lacks a docstring | Stale: the merged function carries a docstring stating the boundary | `git show origin/main:server/src/auth/governance.py` |

F was already removed in the original version — the POPIA s57 analysis is Ipeleng's own P2.1/P2.2 deliverable, not Sibusiso's merge blocker — and stays removed.

## Surviving findings

### 🟡 G — Operator-supplied refusal reason is free text (narrowed)

The refusal event is properly structured — `action`, `actor_id`, `target_type`, `target_id`, `requested_action`, `detail` — but the operator-supplied `reason` is a free-text string. Free-text reasons cannot be counted or trended across refusals. Recommend a closed `reason_code` enum beside the free-text reason so refusal evidence stays queryable. Non-blocking.

### 🟡 I — Duress path not distinguished (kept, reframed)

The human-gate path does not distinguish a duress approval from a genuine one. WBS 4.3 owns duress abuse cases, and the plan rule is that duress states must be visually identical to normal ones. Out of scope for PR #10 and non-blocking — but it stays a recorded gap, not silently inherited. Owner: WBS 4.3.

## New finding

### 🟡 R — `retain_consented_match` has no production caller (the real gap the original missed)

The function is defined (`governance.py:118`) and tested, but nothing in the server imports it: the discard-by-default boundary is demonstrated, not wired. An ingest path that receives embeddings today does not route them through this gate.

**Owner:** Sibusiso — this is exactly the P2.3 remainder: wire the boundary into the ingest path and prove by test that non-consented embeddings are discarded there, plus the G3 retention-bound check.

**Port-time note (Lethabo):** for real embeddings (numpy arrays), `==` is element-wise and `any()` over the result is fragile and slow — use `np.array_equal` or a cosine-similarity threshold with tolerance when the boundary is wired in.

## What holds (verified against main)

- The human gate is real: `verify_concern` is the only path to `flagged`, and it requires a named operator, reason and signature.
- The two-signature rule holds: destructive actions refuse when the co-signature is missing, malformed, or belongs to the same operator.
- A refused attempt returns evidence (`human_verify_refused`) instead of being swallowed — the refusal-is-evidence design holds.
- The machine ceiling holds: no machine path assigns `flagged`.

## Verdict

**APPROVE with notes** — no blocking findings.

PR #10 merged 2026-09-15, so nothing here blocks anything. The architecture holds: two-signature rule, refusal-as-evidence, machine ceiling. Two hygiene items (G, I) and one real gap (R — the boundary is not yet wired into ingest) carry forward. R is owned by P2.3, not by a re-review of this PR.

**Next:** Sibusiso wires the discard-by-default boundary into ingest (P2.3 implementation test + G3 retention-bound check). This rework answers Lethabo's PR #27 change request; no re-review of PR #10 is needed.