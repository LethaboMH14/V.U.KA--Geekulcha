## 2026-09-25 | Lethabo (co-lead), via Claude Code assistant | VIGIL sign-up, both PINs, the encrypted event queue and My record | PROPOSED — for Mutarisi (screens), Sibusiso (event targets, contract v2) and Ipeleng (PIN storage, duress parity)

**Research** — Spec V5–V8, §3 (event kinds), §8 (T47 wrong PINs, G35 PIN-gated end), §9 (PIN authority), and the server on PR #51 (`/v1/events`, counter and clock-skew rules). The server enforces unique counters, not their order, and checks skew on the request timestamp. So a queued event can be sent late or out of order and still be accepted.

**Real data / references** — The events are the ones the ANCHOR server on PR #51 verifies. The client was proved against it earlier today (`scripts/e2e/anchor-e2e.mjs`, 6/6). This change was not yet run end to end on the emulator when it was pushed; see Next.

**Business reasoning** — This makes the member journey real from first launch: sign-up, both PINs, and every journey, check and PIN signed on the phone and kept until the server confirms receipt. The member can see their own record and its fingerprint (F14's phone side).

**Competitor reference** — None.

Changed:
- **Onboarding** (`app/src/ui/onboarding.tsx`):
  - welcome, first name, the everyday PIN twice, then a second (duress) PIN twice, which must differ;
  - then the genesis `registration` entry;
  - the name stays on the phone, and the registration payload doesn't carry it.
- **PINs** (`PinModule.kt`):
  - an Argon2id hash per PIN (19 MiB, 2 passes, 1 lane, Bouncy Castle `bcprov-jdk15to18`), sealed with an AES-GCM key held in Android Keystore;
  - verification always derives both hashes and compares both in constant time.
- **Event queue** (`QueueModule.kt`, `app/src/api/device.ts`):
  - one AES-GCM-sealed file per signed event, ordered by sequence number, in no-backup storage;
  - an event leaves the queue only on a server receipt, and the receipt is kept;
  - a refused event (4xx) stays queued with its reason shown, and the pass carries on;
  - a network failure stops the pass, and it retries every 30 s.
- **Events** (§3):
  - `journey_armed`, `signal_detected` (from the detector), `checkin_opened`, `checkin_result`, `pin_authorised` (`end_journey`) and `journey_ended`.
- **Duress parity** (V5):
  - screens receive only "done" or "try again";
  - the mode exists only inside the signed payload;
  - `normal_pin`/`duress_pin` and `normal`/`duress` are equal lengths;
  - the local record names entries by kind only.
- **Wrong PINs at a check-in** (T47):
  - three identical "Try again"s, then every entry shows "Checked in".
- **My record** (`app/src/ui/record.tsx`):
  - every received entry with its chain index and hash;
  - the fingerprint is the newest entry's hash;
  - the public anchor is stated as not yet published.
- **Network:**
  - release builds are HTTPS-only (`net_release.xml`);
  - test builds (`-PvigilTestFeed=true`) may use plain HTTP to 10.0.2.2 and localhost only (`net_test.xml`).
- **Metro** now watches `shared/`, so the app bundles the repo's one canonical-JSON implementation.

Evidence:
- `npx jest`: 38/38 pass (6 new device tests);
- `npx tsc --noEmit`: clean;
- the release JS bundle builds;
- `compileReleaseKotlin` passes.

Decision:
- **Journey events target the subject and carry `journey_id` in the payload.** PR #51 has no `POST /v1/journeys`, so a journey-targeted entry has no owner to check against. When that route lands, one constant (`JOURNEY_TARGET`) changes. Sibusiso to confirm in contract v2.
- **Journey and check-in ids are phone-generated**, with `sim_jny_`/`sim_chk_` prefixes.

Needs / blockers:
- Sibusiso: `POST /v1/journeys`, and the escalation that acts on `checkin_result`/`pin_authorised`.
- Guardians remain simulated.

Business handoff: A member can sign up and hold their own record with a fingerprint anyone can recompute. The public anchor proof is not live, and it must not be claimed.

Next:
- run the full flow on the emulator against the local server and record the result here;
- Ipeleng: review PIN storage and parity;
- Mutarisi: review the onboarding screens.
