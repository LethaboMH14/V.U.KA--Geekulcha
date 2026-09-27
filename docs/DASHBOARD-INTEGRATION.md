# Connecting a dashboard to ANCHOR

PROPOSED — 26 Sep 2026. This describes the surface deliberately built to be
safe for a browser-hosted dashboard to call directly. It is not a general
guide to the whole API; most routes need a signed request (§7) and are not
meant for this.

## The three routes to build against

### 1. `GET /v1/anchor/latest` — the most recent confirmed anchor

No auth. Returns the latest Merkle root that has been confirmed on the
public ledger, plus the key manifest used to verify it.

```json
{
  "receipt": {
    "topic_id": "0.0.10687280",
    "sequence_number": 42,
    "consensus_timestamp": "1790294400.000000001",
    "running_hash": "…",
    "topic_epoch": 1
  },
  "key_manifest": { "server_ed25519_public_key": "…base64 SPKI…" }
}
```

`404 not_found` if nothing has been confirmed yet (nothing runs the anchor
batch worker in this deployment today — see `server/README.md`'s "What is
real vs. simulated" — so expect this until that's wired up).

### 2. `GET /v1/anchor/proof/{head_hash}` — the Merkle audit path for one head

No auth. `head_hash` is a lowercase 64-hex chain-entry hash (you'll get these
from the panel stream below). Returns the audit path from that head to the
confirmed root, plus the same receipt shape as above.

`400 invalid_request` for a malformed hash, `404 not_found` if that head
isn't in any confirmed batch.

### 3. `WS /ws/panel` — the live feed

No auth, no query params. Connect and read JSON text frames as they arrive
(the server polls the database roughly once a second —
`VUKA_STREAM_POLL_SECONDS` in `.env.example` controls this).

Every accepted event on the whole server produces one message:

```json
{
  "subject": "a1b2c3d4e5f6a7b8",
  "chain_index": 3,
  "event_hash": "…64 hex…",
  "received_at": "2026-09-26T07:46:29.009924Z"
}
```

`subject` is **not** the real subject id — it's a hash salted with a value
generated fresh each time the server process starts, specifically so the
panel cannot be used to build a profile of one person across a longer
window than a single process lifetime. Don't try to correlate it across
server restarts; it isn't meant to be stable.

For `sim_`-prefixed subjects only, two more fields are added:

```json
{
  "subject": "a1b2c3d4e5f6a7b8",
  "chain_index": 3,
  "event_hash": "…",
  "received_at": "…",
  "kind": "signal_detected",
  "simulated": true
}
```

`kind` is the event type (`signal_detected`, `checkin_result`, `guardian_ack`,
…). This only appears for `sim_` subjects — never for anything else — so a
demo dashboard showing "what's happening" needs to filter to `simulated:
true` rows to have anything meaningful to show, and must never assume a
non-simulated row will ever carry a `kind`.

## A minimal example (vanilla JS, no framework)

```js
const ws = new WebSocket("wss://vuka-anchor-server.azurewebsites.net/ws/panel");
ws.onmessage = (event) => {
  const row = JSON.parse(event.data);
  if (row.simulated) {
    console.log(`${row.kind} on ${row.subject} at ${row.received_at}`);
  }
};

const latest = await fetch("https://vuka-anchor-server.azurewebsites.net/v1/anchor/latest")
  .then((r) => (r.ok ? r.json() : null));
```

## CORS

The three routes above send CORS headers for whatever origins are listed in
`VUKA_DASHBOARD_ORIGINS` (comma-separated, no wildcard, GET-only). Unset
defaults to common local dev ports (`localhost:5173`, `localhost:3000`) so a
fresh checkout works immediately; for a deployed dashboard, set this to its
real origin as an App Service application setting. WebSocket connections
aren't subject to browser CORS the same way plain `fetch` calls are, so
`/ws/panel` works cross-origin regardless — CORS only matters for the two
`GET` routes.

## What this is not for

Everything else — `/v1/subjects/{id}/export`, `/v1/guardians/me/alerts`,
posting events, journeys, guardians — requires a §7 or §9 signed request
from a real device or guardian key. No amount of CORS configuration changes
this: a browser without the private key cannot produce a valid signature,
so these routes simply reject the request regardless of origin. If you want
a *member* or *guardian* dashboard (not the public activity feed above),
that's a different, harder problem — the browser would need to hold and use
a signing key the same way the phone app does — and should be scoped as its
own task rather than added to this one.
