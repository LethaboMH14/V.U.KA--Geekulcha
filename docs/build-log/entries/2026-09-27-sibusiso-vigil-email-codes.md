## 2026-09-27 | Sibusiso, with Claude Code assistant | Feature | VIGIL's sign-up sends and checks real email codes | PROPOSED

**Research** — The lead confirmed VIGIL is the demo app. VIGIL's "Verify code" step was SIMULATED ("any 6 digits continue"). The real email codes built today (#115, #116 fixes, Brevo on Azure) were reachable only from the native VUKA apps. The server only issues a code to a registered, signed phone, and VIGIL registered the phone later, after the name and PINs.

**Real data / references** — `app/src/ui/signup.tsx` CodeStep, `app/src/ui/onboarding.tsx`, `app/src/api/device.ts` register(), and server/accounts.py on feat/lethabo-guardian-delivery.

**Business reasoning** — Sign-up is the first thing a judge sees. It should send a real code, not a simulated one.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Real email codes.** On the email route of sign-up, "Verify code" first registers the phone's key (if it isn't registered yet). It then asks the server to email a real 6-digit code, and checks the digits with the server.
- **One registration per phone.** "Start your record" keeps that early registration (one genesis per key) and only adds the name.
- **Plain-words errors.** Wrong, expired, locked, rate-limited and offline cases are shown in plain words, never as the provider's text.
- **Unchanged:** text-message codes (no SMS provider), sign-in and the simulated build stay as before.

Evidence (FACT):
- **Unit tests:** `device.test.ts` +2 (one genesis across the early and later registration; send, wrong and right codes; plain-words errors). jest 285/285; `tsc` is clean.
- **End to end, local deploy-branch server** (the dev code log stands in for the inbox), **8/8:**
  - the phone registers and a code is issued;
  - a real code goes out;
  - a wrong code is refused and the right one verifies;
  - the record step adds the name;
  - exactly one genesis;
  - the email is verified on the account;
  - a journey then starts normally.

Decision: None accepted.

Needs/blockers: Lethabo builds and uploads VIGIL.apk (the signing secrets are still not in CI).

Business handoff: the demo sign-up uses **email**. The code arrives from the Brevo sender (check spam).

Next: build VIGIL 0.0.16 and install it over 0.0.15 on both phones.
