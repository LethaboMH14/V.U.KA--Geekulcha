# server/ — ANCHOR server

A FastAPI + PostgreSQL service providing:
- signed-request auth;
- per-subject chain appends;
- a durable, server-owned escalation state machine with a transactional outbox;
- guardian delivery (FCM, with SMS as a fallback);
- anchoring;
- the subject export.

It is specified in `docs/VUKA-2-SPEC.md` §7, §8, §9 and §12.

**Status:** being built from 24 Sep 2026 (owner: Sibusiso; guardian delivery by Khutso). The four-layer server scaffold and the UMOJA human-gate module are archived in `archive/2026-09-four-layer/server/`.
