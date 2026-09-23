## 2026-09-23 | Lethabo (co-lead), via Claude Code assistant | Spec fixes from Vukosi's review of PR #43 | PROPOSED — for Sibusiso (contract owner) and Ipeleng (security) to confirm

**Research** — Read the Codex-assisted review posted by Vukosi on PR #43 at head `7ddbf40`. It raised two findings, and both were confirmed against `docs/VUKA-2-SPEC.md`:
- **Retry vs replay.** §4 said an identical retry returns its original receipt, but §7 said a nonce is never accepted twice. A retry resends the same signed bytes, so a phone whose response was lost would be rejected as a replay and never get its receipt.
- **No `duress_pin` kind.** V6, S1, §7, §8 and §10 all referred to a `duress_pin` event, but §3 has no such kind. Duress travels inside `checkin_result` and `pin_authorised`. A duress PIN entered after `no_answer` was undefined.

**Real data / references** — None. This is a specification correction.

**Business reasoning** — Both gaps would have given two builders incompatible servers, one day before contract v2 freezes. The second could have lost an alarm on the late-duress path.

**Competitor reference** — Not applicable.

Changed: `docs/VUKA-2-SPEC.md`:
- §7 now has an **order of checks**: authenticate the request, then look up by `event_id` and return the original receipt for identical content (409 for different content), and only then run the nonce, counter and clock-skew checks.
- §4's idempotency bullet points to that order. Nonces "never create new state twice".
- §3 defines a **duress signal**:
  - a `checkin_result` with `result: duress_pin`;
  - a `pin_authorised` with `mode: duress`;
  - an `answered_late` whose late result is `duress_pin`.
- There is no separate `duress_pin` kind. "On `duress_pin`" in the spec and in ADR-0036/0037 means a duress signal.
- V6, S1, the §7 clock-skew exemption, the §8 incident-opening list and the §10 immediate-anchoring list now use that definition.
- §8: a late result is still appended as the device-signed `checkin_result`, then as `answered_late`. A late duress PIN alerts guardians ("duress PIN entered") and sends the bank signal once, while the phone shows its normal outcome.
- T06 covers a retry after a lost response. T09 covers a late duress PIN.

Evidence: `node scripts/check-docs.mjs` passed. `node --test "test/**/*.test.mjs"`: 10 passed, 0 failed.

Decision: This clarifies accepted ADR-0036/0037 without changing them. No ADR text was edited.

Needs/blockers: Sibusiso confirms that the order of checks matches contract v2 (Thu 12:00). Ipeleng confirms the late-duress path in her review.

Business handoff: None. No figures changed.

Next: contract v2 reflects the order of checks and the duress-signal definition.
