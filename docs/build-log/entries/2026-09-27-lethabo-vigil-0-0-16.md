# 2026-09-27 · Lethabo · VIGIL 0.0.16: real sign-in code by email; an invite that says why no code appeared

**Changed**
- Sign-in by phone number: the number is checked against this phone's account first. When that account has an email, a real 6-digit code goes there (the sign-up path from #122, `/v1/account/otp` and `/verify`). An account with no email, and the simulated build, keep the SIMULATED text code.
- The code step no longer waits on an old stuck event: only a registration made in the same step must reach the server first.
- "Add a guardian": when the invite request fails, the PIN screen says the code couldn't be got and why (connection, or the server's HTTP status). Before, any failure read "Try again", as if the PIN were wrong, and no code appeared. A wrong PIN still reads "Try again"; the words don't depend on which PIN was used.
- The required-phone step says "We'll send a code" (it may go by email).
- versionCode 16, versionName 0.0.16.

**Evidence**
- `npx tsc --noEmit` clean; jest 285/285 (27 Sep, 08:3x SAST).
- A cross-model review found the invite status regex held literal backspace bytes and never matched; fixed, and checked in Node ("HTTP 503 unavailable" → 503; a network error → none).

**Not done / known**
- Sign-in and password-reset codes by text message stay SIMULATED (no SMS provider).
- A duress PIN at "Welcome back" (sign-in) unlocks without raising the silent alert (`device.ts`, sign-in PIN step). Pre-existing, found in review, not changed here: needs its own fix and test.
- Typing all six digits before the send response returns does not re-check them; a late check after Back can still move on. Both rare; not fixed here.

**Business handoff**: sign-in on stage can now be shown with a real emailed code, not a SIMULATED one, for accounts with an email.

**Next**: device-test sign-in and "Add a guardian" on 0.0.16 against Azure.
