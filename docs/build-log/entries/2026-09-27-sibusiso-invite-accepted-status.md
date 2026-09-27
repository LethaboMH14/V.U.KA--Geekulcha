## 2026-09-27 | Sibusiso, with Claude Code assistant | Bug fix | The member's invite screen now shows when the guardian accepted | PROPOSED

**Research** — In the team's VIGIL end-to-end run on Azure (27 Sep), the member's invite screen kept counting down after the guardian had accepted:
- The server shows `POST /v1/guardians/accept` 201 at 02:33:44.
- The member's phone then created a second invite at 02:34:43.

The cause: `InviteShare` (`app/src/ui/screens.tsx`) only ran a 10-minute countdown, and Settings listed "Code issued …". Nothing ever asked the server whether the invite was used, and the server had no route for a member to ask.

**Real data / references** — App Service `default_docker.log`, 27 Sep 02:33–02:39 UTC. `server/guardians.py` statuses. §9 decoy and duress-removal rules.

**Business reasoning** — Inviting a guardian is part of the demo. The member must see "Guardian added" when it happens, and never be nudged into issuing extra invites.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Server** (`feat/lethabo-guardian-delivery`): `GET /v1/guardians`, device-signed. It returns the member's invites as `waiting | accepted | expired | removed`, with invite and accept times.
  - **Coercion-safe (§9):** the decoy flag is never returned, and `removal_scheduled` reads as `accepted`. So neither a duress invite nor a duress removal (which does nothing) differs from a normal one.
  - It is in `contracts/openapi.yaml` and the contract path inventory.
- **App:**
  - `device.guardianStatuses()` returns null when the status can't be checked: simulated build, an older server, or offline.
  - The invite screen asks every 3 s until the code is accepted or expires, then shows "Guardian added".
  - Settings shows each invite's status.

Evidence (FACT):
- **Server tests** (`server/tests/test_guardian_lifecycle.py`): waiting→accepted, expiry, a decoy reading identically, a duress removal reading identically, and a signed caller required.
- **App test** (`device.test.ts`): statuses are parsed, and null comes back on a 404.
- **App suites:** jest 280/280, and `tsc --noEmit` is clean.

Decision: None accepted.

Needs/blockers: Lethabo (app owner) to review after the fact; merged at the lead's request for the demo.

Business handoff: install the new VIGIL.apk that CI publishes from `main`. The member's invite screen then turns to "Guardian added" within about 3 s of the guardian accepting.

Next: deploy the server route; install the CI-built VIGIL.apk; repeat the invite on two phones.
