## 2026-09-27 | Sibusiso, with Claude Code assistant | Feature | A wrong PIN at a check-in alerts guardians as a heads-up, never as duress | PROPOSED

**Research** — The lead asked for three things:
1. The PIN page should appear instead of a notification, and stay until a PIN is entered.
2. A wrong PIN should alert guardians, but not as duress.
3. No response within 3 minutes should escalate "to duress".

Checked against the spec:
- **Point 1** is already V4 and already built (full-screen intent where `canUseFullScreenIntent()` allows, ongoing notification, `setShowWhenLocked`/`setTurnScreenOn`). Android shows a notification instead whenever the phone is unlocked and in use.
- **Point 3** is already met faster: `no_answer` at about 70 s (window 60 s + 10 s grace), then the bank hold 3 minutes later unless a guardian stands down. The lead chose to keep it, labelled `no_answer`, not duress: a timeout is not evidence of duress (S1, "we will not claim proof of duress").
- **Point 2** was new. Before this change, the phone sent nothing on a wrong PIN.

**Real data / references** — docs/VUKA-2-SPEC.md V4, V8, §8 (T47), S1. `app/src/api/device.ts` `openCheckin`. `server/incidents.py` `request_alarm` and `bank_after_delivery`.

**Business reasoning** — A wrong PIN is a real warning sign: a typo, or someone else holding the phone. Guardians should hear about it early, but it must not claim duress, trigger the bank, or reveal anything on the phone.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**; the lead chose the first wrong PIN as the trigger):
- **Payload.** New `checkin_wrong_pin` pv 1 (`contracts/payloads/checkin_wrong_pin.v1.json`): check-in id and attempt 1–3, with no PIN material. It is registered in `anchor/payloads.py`, `shared/payloads.js` and the app's `payloads.ts`.
- **Phone.** Wrong PINs 1–3 are recorded after `checkin_opened`. The screen is unchanged ("Try again", then "Checked in" from the 4th, T47).
- **Server.** The first one, while the check-in is undecided, sends a `guardian_alert` with trigger `wrong_pin`, once per incident.
  - It never sets `bank_trigger` or enqueues a bank signal.
  - The S1 three minutes ignore `:wrong_pin` deliveries, so a heads-up can't shorten stand-down time.
- **Guardian text.** "entered a wrong PIN at a journey check. They may have mistyped, or someone else may have their phone. Don't call or text them yet: you'll be alerted again if they don't check in." The lead's draft said "check in with member", but a call or text can warn someone holding the phone.

Evidence (FACT):
- **Server:** `server/tests/test_wrong_pin_alert.py`, 5 tests:
  - the first wrong PIN alerts once, with no bank and no duress;
  - wrong then right leaves normal_pin and no bank;
  - a wrong PIN after the outcome is decided alerts nobody;
  - an unknown check-in gets 409;
  - the bank timer ignores the heads-up.
- **Shared validators:** 151/151.
- **App:** `device.test.ts` checks that attempts 1–3 are recorded, not the 4th, that they come after `checkin_opened`, and that no PIN material appears. jest 281/281; `tsc` is clean.
- **Full Python suite:** see the server commit.

Decision: None accepted.

Needs/blockers: a new VIGIL.apk needs the signing secrets (#118).

Business handoff: in the demo, a wrong PIN at the journey check makes the guardian's phone show the heads-up within seconds. The member's screen only says "Try again".

Next: deploy the server; build the APK once Lethabo adds the secrets.
