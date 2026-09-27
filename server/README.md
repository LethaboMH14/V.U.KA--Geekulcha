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

The repository-root `requirements.txt` includes the pinned server dependencies for
an Azure App Service build. `startup.sh` starts `server.main:app` on the platform's
`PORT` (default 8000); the App Service startup command is `bash startup.sh`.
These files prepare deployment only. The current server has a tested generic
PostgreSQL outbox table and an isolated Hedera submission adapter, but no event
handler enqueues escalation effects or batches yet. It still lacks PIN-authority
verification, PIN-authorised export, integrated anchoring and public proof.
The storage and auth path has passed a local real-PostgreSQL test; Azure,
guardian/bank receiver deduplication and security review remain outstanding.
Do not expose it as a finished service.
