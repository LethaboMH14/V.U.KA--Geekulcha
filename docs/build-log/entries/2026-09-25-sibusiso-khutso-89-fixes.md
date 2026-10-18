## 2026-09-25 | Sibusiso, with Claude Code assistant | Fix | #89 review fixes (Khutso, clock-skew exemption) | PROPOSED

**Research** — Khutso's review of #89 at `946b85e` and my own re-check of Ipeleng's approval. All verified in code before fixing.

**Real data / references** — Spec S1 (the bank signal records its triggering outcome), §3 (kind lives in the committed payload; `action` is the coarse class), §7 (clock-skew exemption for `checkin_opened`/`checkin_result`/`pin_authorised`).

**Business reasoning** — The bank and an insurer's investigator must see the strongest signal, a duress PIN from a phone with a wrong clock must still land, and an alarm with no heartbeat producer must not false-alarm on a working phone.

**Competitor reference** — Not applicable.

Changed:
- `server/incidents.py`: `TRIGGER_RANK` (duress > no_answer > contact_lost); `request_alarm` upgrades `bank_trigger` and never downgrades it.
- `server/bank_worker.py`: the frozen body is rebuilt when a stronger trigger arrives before a successful send, using a new idempotency key `<key>:<trigger>`. **PROPOSED trade-off:** if the weaker send's outcome was uncertain, the bank may hold twice; we prefer that to the bank never hearing duress.
- `server/db.py`: clock-skew exemption now checks `payload.kind` (it only checked `action`, which is `device_event` in v2, so it never matched a conformant client).
- `server/contact.py`: `contact_lost` is off unless `VUKA_CONTACT_LOST_ENABLED=1`, until #88 sends heartbeats.
- `scripts/gen-payload-vectors.py`: the generator change behind `d447f77`'s regenerated vectors (missed from that commit).

Evidence (FACT, real PostgreSQL): `server/tests/test_khutso_89_fixes.py` 4/4 (failed no_answer send then late duress sends duress on a new key; contact_lost then no_answer labelled no_answer; `device_event` checkin_result with a 2 h request-clock offset accepted and flagged `clock_skew`; identical genesis retry returns the original receipt — answers Vukosi's C3). Contact-lost tests run with the flag on; one test proves it is off by default. Mutation checks on the skew exemption, trigger upgrade and body rebuild each broke a test.

Decision: None accepted.

Needs/blockers: Khutso's finding 2 (no process runs the workers) is unchanged and stays a merge blocker for calling this a working alert path.

Business handoff: Not applicable.

Next: re-request Khutso's review.
