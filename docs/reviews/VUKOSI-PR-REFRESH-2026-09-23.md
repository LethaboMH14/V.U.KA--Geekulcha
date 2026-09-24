# PR refresh and review, 23 Sep 2026 (evening)

**Reviewer:** Claude Code assistant (`claude-sonnet-5`) at Vukosi's request. AI review only: **no GitHub comment, review or approval was posted** (`gh` is not logged in), and this is not human approval. Sources: `git fetch origin`, `git ls-remote origin 'refs/pull/*'`, and the commits themselves. **NOT RUN / not visible:** GitHub review threads, comments, CI results and mergeability for every PR below.

## What moved since the Codex snapshot

| Item | Was | Now |
|---|---|---|
| `origin/main` | `0cdd372` | `41a8877` |
| #43 (pivot) | open, `0c6d202` | **merged** (`8c621df`); final head `bf98c08` |
| #45 Ipeleng security review | not yet | **merged**; verdict APPROVE WITH CONDITIONS (B1–B3, S1–S4). Closes the "Pending" line in the ADR record |
| #39, #44, #42 | open, open, closed | heads unchanged (`ee0966c`, `241e34a`, `616d012`) |
| New | n/a | #46 pricing, #47 Khutso K1, #48 POPIA, #49 Ipeleng security plan, #50 coercion catalogue, #51 **contract v2**, #52 SAPS totals |

**Consequence for our branches:** `main` now contains the VIGIL spec. `docs/vukosi-vigil-workflow` and both Codex branches (P2a `ccd2f8a`, P7a `42f1bfe`) sit on `0c6d202` and must be rebased onto `main` before publication. Main did not change `team/vukosi.md`, `docs/MODEL-LICENCES.md` or `.gitignore`, so P2a and P7a should rebase without conflict, but that is **not tested**. Packet pins that say `0c6d202` are stale.

## Status of my earlier findings against main

| Finding | Now |
|---|---|
| R1 lost-response retry | **Fixed in the spec** (§7 order of checks: `event_id` lookup before nonce/counter; T06 extended). Lethabo's entry credits Vukosi's review |
| R1 widened: offline-queued event older than 120 s | **Still open.** `VUKA-2-SPEC.md:198`: the skew exemption covers only `checkin_opened`, `checkin_result`, `pin_authorised`. A queued `signal_detected` or `journey_armed` with an unseen `event_id` is still rejected on skew. Needs Sibusiso + Ipeleng |
| R2 call button unlocks on a normal PIN | **Still open.** `team/mutarisi.md:67` on main is unchanged |
| R3 reboot re-arm trigger | **Still open.** V10 unchanged |
| R4 `shared/` 12:00 vs 14:00 | **Still open.** Checklist P3.S2 still says 12:00 |
| Ipeleng security review | **Recorded** (#45). Her conditions B1–B3 are due from Lethabo before the Thursday §8/§9 meeting closes. P3.L8 is still ☐ |

## New for Vukosi from main

- **V8 changed:** the member's phone shows queued → received only. **No guardian acknowledgement while an incident is open**, and incident events stay out of My Record until it closes. The P3.V3 queue and delivery states must follow this.
- **Duress signal:** there is no `duress_pin` kind. Duress travels as `checkin_result` with `result: duress_pin`, or `pin_authorised` with `mode: duress`.
- **Ipeleng S2 names Vukosi/Mutarisi:** onboarding recommends at least two guardians (app copy). No date set.

## #51 contract v2 (Sibusiso), head `f9d57f6`, base `0c6d202`, review status not visible

**Reproduced in a clean checkout:** `node --test` 17/17 pass, `check-docs` passes, `pytest anchor/tests` 96 passed (`unittest discover` runs 0 tests, so use pytest). This is a draft contract, and its own log says it is not frozen.

### C5: P1: `POST /v1/events` cannot be built by a phone
The request body is `EvidenceEntryV2` (`contracts/openapi.yaml`, `/v1/events` → `EvidenceEntryV2`). That schema **requires** `prev_hash`, `event_hash`, `details.received_at` and `details.chain_index`, with `additionalProperties: false`. All four are computed by the server (spec §4: "the server's receipt time… chain position"). The same schema is used for `/v1/checkins/{id}/opened` and `/result`. **Impact:** a device cannot send a valid request, and the phone's signed bytes cannot be validated against the contract. **Required:** a separate submission schema without server fields, keeping the full entry schema for export. **Owner:** Sibusiso.

### C6: P1: the request has no field for the event payload or its salt
The commitment is `SHA-256(salt ‖ canonical(payload))` (§4), and the server must know the payload `kind` and result to open incidents and escalate (§8). `EvidenceEntryV2` (checked by scoping to that schema alone) has no `payload` and no `salt`. Only the export schema carries them. **Impact:** either the server cannot act on a check-in result, or the phone invents a field. **Required:** define where payload and salt travel on submission. **Owner:** Sibusiso and Ipeleng.

### C7: P2: the request-signing envelope has no carrier
§7 has devices sign every request over `{method, path, ts, body_sha256, nonce}`. The contract's only security scheme is `bearerAuth`, and no header or parameter carries the signature, key id, timestamp or nonce. **Impact:** P3.V3 transport cannot start without guessing. **Required:** define the signing headers. **Owner:** Sibusiso and Ipeleng.

### Notes
- `/v1/journeys/{id}/heartbeat` `speed_bucket` is an unconstrained string. §V9 says a bucket. Suggest an enum.
- Heartbeats and journey routes have no 409 or idempotency behaviour, while `/v1/events` does. Confirm intended.
- Spec §12 says v2 is "not frozen until B1–B5 are reflected in the schemas". Consistent with the log.

## Other open PRs
- #44 is unchanged and unaffected. Merge order note from the Codex review still stands.
- #39 is unchanged, still a legacy v1 consumer, not a VIGIL target.
- #46–#50 and #52 are docs and evidence PRs by other owners. I read only their commit subjects. **Not reviewed.**
- #47 and #52 are Khutso's evidence work (K1 and K2). Not reviewed.

## What Vukosi should do
1. Rebase workflow and packet branches onto `main` once you've decided to publish.
2. Send C5–C7 to Sibusiso before Thursday 12:00 (contract v2). They block the signer and queue transport.
3. Raise the still-open R1 offline-queue case, R2, R3 and the R4 deadline conflict with their owners.
