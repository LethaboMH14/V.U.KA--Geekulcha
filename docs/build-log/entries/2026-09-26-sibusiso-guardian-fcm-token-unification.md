## 2026-09-26 | Sibusiso, with Claude Code assistant | Fix | reconcile #95's FCM tokens with #96's guardian registry | PROPOSED

**Research** — Khutso's #96 review: this PR (#95) stored accepted guardian FCM tokens and looked them up in its own `guardian_fcm_tokens` table, while #96's guardian lifecycle enrols guardians into `server/guardians.py`'s `guardians` table (identity, `decoy`, `status`, and already an `fcm_token` column). No enrollment-to-delivery mapping connected them, so an accepted guardian could never receive a real FCM alert.

**Real data / references** — `server/guardians.py` (#96), `server/guardian_notifier.py` (this PR).

**Business reasoning** — Two parallel guardian records is exactly the kind of split that drifts. Unifying on one table means decoy exclusion and removal, already correct in `alerting_guardians()`, apply to FCM delivery for free instead of needing a second implementation.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**): merged #96 into this branch. `FcmGuardianNotifier.recipients()` now calls `alerting_guardians()` (the same function the simulated notifier uses); `.deliver()` reads `fcm_token` from `guardians` by `guardian_id`, filtered to `NOT decoy AND status IN ('active','removal_scheduled')`. Removed the `guardian_fcm_tokens` table entirely; `fcm_notification_receipts` (delivery-dedupe, a separate concern) is unchanged.

Changed: `server/guardian_notifier.py`; `server/tests/test_fcm_guardian_notifier.py` (new).

Evidence (FACT, real PostgreSQL): 3 new tests — recipients include an accepted guardian and exclude a duress-mode decoy; deliver sends to the guardian's own token from `guardians` (end to end through invite → accept → outbox → FCM), with a replay returning the same receipt and no second send; deliver refuses a decoy and an unenrolled guardian, with no send attempted. Full suite after merge: 285 pytest / 0 skipped, 50 node. 2 mutation checks (decoy exclusion in `recipients`, decoy filter in `deliver`) each broke a test.

Decision: None accepted.

Needs/blockers: Khutso's still-open FCM_PROJECT_ID/FCM_ACCESS_TOKEN provisioning and a real device token, per his own PR body; no FCM delivery is claimed here either.

Business handoff: Not applicable.

Next: Khutso re-reviews; his own build-log entry documenting the old `guardian_fcm_tokens` design is left as his historical record, not edited.
