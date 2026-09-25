## 2026-09-25 | Sibusiso, with Claude Code assistant | Implementation | Guardian lifecycle: invite, accept, decoy, delayed removal, token | PROPOSED

**Research** — Spec G1 (6-digit code plus QR, single use, 10 minutes, 5 attempts, rate-limited), G5/G6 (guardian-signed actions, POPIA s18), §9's PIN-authority table (normal add notifies existing guardians naming the new one; duress add is a decoy that never receives alerts while real guardians are told "a guardian was added under duress"; removal is silent, 24 h, deferred during an incident; the last guardian can't be removed until a replacement is accepted), §3 kinds `guardian_added` / `guardian_removal_scheduled` / `guardian_removed` / `decoy_added`, T14.

**Real data / references** — The four frozen request schemas in `contracts/openapi.yaml`; the transport pattern already used for end_journey, export and delete.

**Business reasoning** — Without a guardian lifecycle no real person could ever receive an alert; every alert path built today depended on a test-only table.

**Competitor reference** — Not applicable.

Decisions (**PROPOSED**, for Lethabo and Ipeleng):
- Invite and removal are bodyless and consume a fresh `pin_authorised` (`add_guardian` with `target_id` = subject id; `remove_guardian` with `target_id` = guardian id) sent through `POST /v1/events`.
- `invite_code` = `<8-hex invite id>-<6 digits>`; the QR carries it whole, and the id makes a 6-digit code look-up possible without a global search. Stored only as an Argon2id hash; 10-minute expiry, 5 attempts per invite, 20 per client IP per 10 minutes. Per-device limiting is not possible before the guardian's key is known.
- Accept is signed by the `guardian_key` in the body (proof of possession, like the device genesis bootstrap); `X-Vuka-Key-Id` must be the id derived from that key.
- "Existing guardians notified" happens at accept, when the guardian exists. Real guardians are named; a decoy triggers "guardian added under duress" instead.
- Removal notifies the remaining guardians at scheduling, not only at completion; fires only while no incident is open; a decoy never counts as a replacement for the last real guardian.
- The 24 h post-recovery freeze now also blocks invite and removal.

Changed: `server/guardians.py`, `server/guardian_effects.py` (new); `server/main.py` (four routes and a shared signed-caller helper); `server/guardian_notifier.py` (recipients = test table ∪ accepted, non-removed, non-decoy guardians); `server/scheduler.py` (fires due removals); `server/pin_records.py`, `server/event_effects.py`, `contracts/payloads/pin_authorised.v1.json` (two new actions and their target-ownership rules); `contracts/openapi.yaml` (four flags, two routes bodyless, `guardian_id`/`invite_code` receipt fields).

Evidence (FACT, real PostgreSQL): `server/tests/test_guardian_lifecycle.py` 12/12 (round trip enrols a working guardian; single-use code; authorisation required; 5 wrong codes kill the invite; 10-minute expiry; duress decoy indistinguishable on the phone, excluded from alerts, real guardians told; 24 h delayed removal then key revoked; last real guardian protected and a decoy is no replacement; duress removal no-op; removal deferred during an incident; token update by the owning guardian only). Seven mutation checks each broke a test; the token-ownership one needed a new cross-guardian test to be caught.

Decision: None accepted.

Needs/blockers: notifications are recorded, not delivered (no FCM); a browser or QR scanner client is app work.

Business handoff: Not applicable.

Next: PR, stacked on #89.
