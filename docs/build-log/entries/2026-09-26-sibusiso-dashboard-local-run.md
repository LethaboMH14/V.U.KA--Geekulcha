## 2026-09-26 | Sibusiso, with Claude Code assistant | Implementation | CORS for a dashboard, .env.example, README/docs refresh | PROPOSED

**Research** — Sibusiso wants Lethabo to (a) run this server on her own device and (b) connect a dashboard to it. Checked what stood in the way of each: no `.env.example` existed; `server/README.md` was stale (still described the pre-slice-3 server); no CORS middleware existed at all, so a browser dashboard's `fetch()` calls would be silently blocked by the browser regardless of server logic; no doc described which endpoints are safe for a public dashboard to call.

**Real data / references** — `server/streams.py` (`/ws/panel`'s real message shape); `contracts/openapi.yaml` (`/v1/anchor/latest`, `/v1/anchor/proof/{head}`, both already public/no-auth); the `antenv` startup gotcha found and fixed earlier today, documented here so it isn't rediscovered.

**Business reasoning** — Every signed-request route is already safe to leave reachable from any origin, because CORS only affects whether a *browser* can read a response, not whether a request can be forged; a browser without the device/guardian private key still cannot produce a valid §7/§9 signature no matter the origin. So CORS only needed to widen *reach* for the three routes with no signature requirement at all.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**): `VUKA_DASHBOARD_ORIGINS` env var, comma-separated, GET-only, `allow_credentials=False`, never a wildcard. Unset defaults to common local dev ports so a fresh checkout works with no configuration.

Changed: `server/main.py` (CORS middleware, applied only when at least one origin is configured); `.env.example` (new); `server/README.md` (rewritten: current feature list, two-process local run, the antenv gotcha, real-vs-simulated summary); `docs/DASHBOARD-INTEGRATION.md` (new: the three dashboard-safe routes, message shapes, a vanilla-JS example, explicit "what this is not for").

Evidence (FACT, real PostgreSQL): `server/tests/test_dashboard_cors.py` 5/5 — a configured origin gets the CORS grant on both a simple GET and a preflight OPTIONS; an unconfigured origin gets none (the request still succeeds, just without the header a browser needs to expose the body to JS); no `Access-Control-Allow-Credentials` is ever sent; CORS does not widen a signed POST route to allow the method; leaving `VUKA_DASHBOARD_ORIGINS` empty disables the middleware entirely. Full suite: 288 passed (one unrelated pre-existing failure was traced to leftover rows in the shared local test database from today's manual smoke-testing, not this change — confirmed by truncating the test tables and rerunning clean).

Decision: None accepted.

Needs/blockers: a *member* or *guardian* browser dashboard (not the public feed) is out of scope here — it needs the browser to hold and use a signing key, a separate task.

Business handoff: Not applicable.

Next: none pending on this item.
