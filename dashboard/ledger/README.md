# dashboard/ledger/: VUKA Ledger

The public-ledger page. Banks, insurers and members use it to check a VUKA record's fingerprint against the Hedera testnet topic, in the browser, without trusting VUKA. Spec: `docs/VUKA-2-SPEC.md` §4, §6, §10 and §17. Module contract: `CONTRACT.md`.

**Everything shown is live.** The page reads the ANCHOR server's public routes (`GET /v1/anchor/latest`, `GET /v1/anchor/proof/{head}`, `WS /ws/panel`) and the public Hedera testnet mirror for the pinned topic `0.0.10687280`. The UI never imports `sample/`, which exists only as a test fixture for `test/`.

## Run it

Serve the **repository root** as static files, because the pages import `../shared/*.js` and fetch `../contracts/keys/*.json` (one more `../` from `ledger/`):

```sh
python3 -m http.server 8765   # from the repo root
# home: http://localhost:8765/dashboard/   app: http://localhost:8765/dashboard/ledger/
```

All paths are relative (resolved with `import.meta.url`), so the same files work on GitHub Pages, where `.github/workflows/ledger-pages.yml` assembles `dashboard/**`, `shared/*.js` and `contracts/keys/*.json`, and the site root redirects to the home page: `https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/` (app: `…/dashboard/ledger/`). The security scorecard sits at the site root (`../security.html` from the home page) only when a `security-score` run on `main` has one to carry; when it is missing (always, when serving a checkout), the home page links to that workflow's runs on GitHub instead.

**CORS.** The two `GET` routes answer a browser only if its origin is listed in the server's `VUKA_DASHBOARD_ORIGINS` (App Service application setting, comma-separated, no wildcard). For the GitHub Pages deployment it must include `https://lethabomh14.github.io`, and `http://localhost:8765` for local use. `/ws/panel` and the Hedera mirror are not affected by that setting.

Server override: `?server=https://…` in the address, or Settings (saved in this browser only). Only `https://` is accepted, and `http://` only for localhost.

## Home page (`dashboard/index.html`, `home.css`, `home.js`)

The front door for judges, partners and investigators (`dashboard/IA.md`). It reuses this folder's `carbon.css`, `ledger.css`, `hashscan.css` and fonts. The hero's **Verify a record** opens `ledger/#verify`; **Open the ledger** and **See the live ledger** open `ledger/#overview`. Its live proof strip reads the Hedera mirror in the browser (`lib/sources.js`): the pinned topic, the latest `0x01` root's sequence and age, and the pinned key manifest hashed exactly as the app does (`shared/keys.js`) and matched to its `0x02` message. Each item shows real data or says plainly that it is unavailable.

## Routes (the app)

A hash router shows one view at a time; Back and Forward work, each view sets the title ("Verify: VUKA Ledger") and moves focus to its heading. An inline script in `<head>` picks the view before `app.js` loads, so a deep link never paints Overview first. `#ledger` → `#overview`, `#how` → `#method`, anything unknown → `#overview`. Live connections open once for the whole app.

| Route | What it shows | Source |
|---|---|---|
| `#overview` | Connection state for each source (Azure API, live feed, Hedera mirror) with one summary notice when any fails and the raw errors under Details. Latest confirmed anchor, checked against the mirror. The pinned key manifest hashed in the browser and matched to its `0x02` message. Topic and network epoch. The newest 5 topic messages, with "View all anchors". | server, mirror |
| `#verify` | Drop, choose or paste the export that VIGIL shares (Settings → My record → Share with a bank or insurer); the header paste field lands here too. `lib/pipeline.js` streams its checks into `terminal.js`. The result card shows a state pill and a **Fingerprint to keep** (root, head, topic, sequence, consensus time, running hash, network/epoch, manifest, checked-at) with Copy all. VIGIL's share dialog links here. | pins from `contracts/keys/`, proof from the server, message from the mirror |
| `#anchors` | Every topic message read (up to 100), newest first, each linked to HashScan and to the mirror record. With no `0x01` roots it says "No record fingerprints anchored on this topic yet" with the real message count; never a placeholder. | mirror |
| `#activity` | The live `/ws/panel` feed and an events-per-minute chart, with Reconnect. | `/ws/panel` |
| `#method` | Inline SVG of the system, the mathematical model, what a match proves and does not prove, and duress privacy. | static |
| `#settings` | Server URL, network (testnet only), theme. Reached from the gear button. | this browser |

Result states follow `CONTRACT.md`: **live-verified**, **unavailable** (the chain verifies, but there is no confirmed anchor or the mirror could not be read) and **failed** (with the first broken entry). The page never passes `archived: true`, because it has no stored copies.

## Rules this page keeps

- It renders network and export data with `textContent` only. Links built from network data are pattern-checked first (topic id, consensus timestamp, sequence).
- Exports never leave the browser: it reads them with `FileReader`, with no upload.
- Payload kinds appear only for `sim_` subjects, with a SIMULATED chip, in the feed and in the trace.
- If a module fails to load (`lib/sources.js`, `lib/pipeline.js`, `terminal.js`, `shared/*.js`), the page names it in a visible notice and keeps working without it. A plain log replaces a missing terminal.
- Theme: the light and dark tokens in `DESIGN.md` (IBM Plex, hairlines, one accent, status as a dot plus text), following `prefers-color-scheme` unless the viewer chooses Light or Dark in Settings. The page respects reduced motion and shows visible focus.

## Files

- `../index.html`, `../home.css`, `../home.js`: the home page.
- `index.html`, `app.js`: the app's views, router, diagram and glue. `carbon.css`, `ledger.css`, `views.css`, `hashscan.css` (loaded last): tokens and look, shared with the home page.
- `lib/sources.js`, `lib/pipeline.js`, `sample/`, `test/`: network clients, verification trace, fixture and tests.
- `terminal.js`, `terminal.css`: the terminal component.
