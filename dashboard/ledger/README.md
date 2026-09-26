# dashboard/ledger/: VUKA Ledger

The public-ledger page. Banks, insurers and members use it to check a VUKA record's fingerprint against the Hedera testnet topic, in the browser, without trusting VUKA. Spec: `docs/VUKA-2-SPEC.md` §4, §6, §10 and §17. Module contract: `CONTRACT.md`.

**Everything shown is live.** The page reads the ANCHOR server's public routes (`GET /v1/anchor/latest`, `GET /v1/anchor/proof/{head}`, `WS /ws/panel`) and the public Hedera testnet mirror for the pinned topic `0.0.10687280`. The UI never imports `sample/`, which exists only as a test fixture for `test/`.

## Run it

Serve the **repository root** as static files, because the page imports `../../shared/*.js` and fetches `../../contracts/keys/*.json`:

```sh
python3 -m http.server 8765   # from the repo root
# open http://localhost:8765/dashboard/ledger/
```

All paths are relative (resolved with `import.meta.url`), so the same files work on GitHub Pages at `https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/ledger/`.

**CORS.** The two `GET` routes answer a browser only if its origin is listed in the server's `VUKA_DASHBOARD_ORIGINS` (App Service application setting, comma-separated, no wildcard). For the GitHub Pages deployment it must include `https://lethabomh14.github.io`, and `http://localhost:8765` for local use. `/ws/panel` and the Hedera mirror are not affected by that setting.

Server override: `?server=https://…` in the address, or the Settings section (saved in this browser only). Only `https://` is accepted, and `http://` only for localhost.

## Views

| Anchor | What it shows | Source |
|---|---|---|
| `#ledger` | Connection state for each source (Azure API, live feed, Hedera mirror), with the real error text when one is unreachable. Latest confirmed anchor. The pinned key manifest hashed in the browser and matched to its `0x02` message. The topic's messages as a chain of blocks, newest first, each linked to HashScan and to the mirror record. If there are no `0x01` roots, it says "No record fingerprints anchored on this topic yet" with the real message count; it never shows a placeholder block. Live activity table and an events-per-minute chart. | server, mirror, `/ws/panel` |
| `#verify` | Drop, choose or paste the export that VIGIL shares (Settings → My record → Share with a bank or insurer). `lib/pipeline.js` streams its checks into `terminal.js`. The result card shows a state pill and a **Fingerprint to keep** (root, head, topic, sequence, consensus time, running hash, network/epoch, manifest, verified-at) with Copy all. | pins from `contracts/keys/`, proof from the server, message from the mirror |
| `#how` | Inline SVG of the system, the mathematical model, what a match proves and does not prove, and duress privacy. | static |
| `#settings` | Server URL, network (testnet only), theme. | this browser |

Result states follow `CONTRACT.md`: **live-verified**, **unavailable** (the chain verifies, but there is no confirmed anchor or the mirror could not be read) and **failed** (with the first broken entry). The page never passes `archived: true`, because it has no stored copies.

## Rules this page keeps

- It renders network and export data with `textContent` only. Links built from network data are pattern-checked first (topic id, consensus timestamp, sequence).
- Exports never leave the browser: it reads them with `FileReader`, with no upload.
- Payload kinds appear only for `sim_` subjects, with a SIMULATED chip, in the feed and in the trace.
- If a module fails to load (`lib/sources.js`, `lib/pipeline.js`, `terminal.js`, `shared/*.js`), the page names it in a visible notice and keeps working without it. A plain log replaces a missing terminal.
- Theme: VIGIL's Ivory (light) and Midnight (dark) tokens from `app/src/ui/theme.ts`, following `prefers-color-scheme` unless the viewer chooses one. The page respects reduced motion and shows visible focus.

## Files

- `index.html`, `ledger.css`, `app.js`: page, views, diagram and glue (this README).
- `lib/sources.js`, `lib/pipeline.js`, `sample/`, `test/`: network clients, verification trace, fixture and tests.
- `terminal.js`, `terminal.css`: the terminal component.
