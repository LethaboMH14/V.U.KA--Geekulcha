## 2026-09-26 | Lethabo (co-lead), via Claude Code assistant with parallel sub-agents | VUKA Ledger: the public ledger dashboard for banks, insurers and members | PROPOSED

**Research:**
- **Spec:**
  - §4: the entry format, commitment and signed statement.
  - §5: canonical form.
  - §6: RFC 6962 Merkle tree, proof encoding, and verification steps B2 1–5.
  - §10: 33-byte typed messages, coalescing, and the live-verified / archived / unavailable states.
- **The server's public routes** on #99, from `docs/DASHBOARD-INTEGRATION.md` and `server/main.py`: `/v1/anchor/latest`, `/v1/anchor/proof/{head}` and `/ws/panel`.
- **Existing verifier code:** `shared/verify.js`, `shared/merkle.js` and the existing `dashboard/verify-min.*`.

**Real data / references:**
- The pinned topic `0.0.10687280` (testnet) and the manifest fingerprint `c1d90404…a0a2`, both from `contracts/keys/verify-pins.json`. The page re-hashes the committed manifest and matches it.
- **FACT, from Sibusiso's handover of 26 Sep:** the live topic holds only `0x02` manifest messages so far. No `0x01` root is confirmed yet, so a real record currently ends at **unavailable**, never live-verified. The page says so plainly.

**Business reasoning:** banks and insurers need to check a member's record themselves without trusting VUKA. The page is the concrete answer to "how would an insurer verify this?", and the fingerprint card is what they file.

**Competitor reference:** not applicable.

Changed:
- `dashboard/ledger/` (`b5bcf8c`, `c39ee75`, `a5039d9`):
  - `lib/sources.js`: live clients for the ANCHOR server and the Hedera testnet mirror.
  - `lib/pipeline.js`: every real verification step as a stream; the authoritative verdict comes from `shared/verify.js`.
  - `terminal.js`: plays those steps.
  - `index.html`/`app.js`/`ledger.css`: the Ledger, Verify a record, How it works and Settings views, in the VIGIL palette, light and dark.
  - `sample/`: a test fixture only; the page never loads it.
- **App** (`abecd8b`): My record → "Share with a bank or insurer" shares the phone-checked, server-held export as `{"format":"vuka-export-v2","export","shared_at"}`.
- **Hosting** (`3d0dd57`): `.github/workflows/ledger-pages.yml` publishes to GitHub Pages next to the security scorecard. `docs/LEDGER-DASHBOARD-HOSTING.md` covers it.

Evidence:
- `node --test "dashboard/ledger/test/*.test.js"`: 23/23 before review. This includes an end-to-end test that reaches live-verified with the real pins and manifest, the server's proof shape and a base64 mirror message.
- App `npx jest`: 259/259.
- The page loaded without errors at 1280 px and 400 px.
- **Not verified:** a live run. This sandbox cannot reach Azure or the mirror, and no real export has been verified yet.

Decision: none.

Needs / blockers:
- **GitHub Pages** (a repo admin): allow this branch on the `github-pages` environment, or merge the branch.
- **Azure** (Sibusiso): `VUKA_DASHBOARD_ORIGINS` must include `https://lethabomh14.github.io`.
- **A confirmed `0x01` root on the topic** (Sibusiso's stuck-batch reset). Only then can any record reach live-verified.
- **Duress exposure** (review with Ipeleng): the shared export carries full entry details, including an earlier closed incident's duress result.
- **Pages deploys:** the two deploys (`security-score.yml` and the ledger workflow) should be merged into one.

Business handoff: the dashboard and fingerprint card are demo-ready once a root lands. Babatunde can use the "How it works" view in the bank and insurer conversations.

### Addendum, 26 Sep evening: real references, home page, routed app and a connected system. Claude Code assistant, parallel sub-agents and review rounds

**Research:**
- **Design audit:** results in `dashboard/ledger/DESIGN.md`.
- **Carbon Design System:** tokens read from `@carbon/themes` 11.82.0, `@carbon/type` and `@carbon/layout` on npm.
- **HashScan's own source,** read as the look reference: `hashgraph/hedera-mirror-node-explorer` (Apache-2.0), covering `style-config.css`, `explorer.css`, `DashboardCardV2` and `Property`.
- **Product audit and information architecture:** in `dashboard/IA.md`. It covers who visits (investigator, member, judge, operator), their jobs, and what was wrong.

**Blocked:** Mobbin needs a paid plan. Dribbble, the Carbon docs site and hashscan.io are blocked by the sandbox. The Figma account holds only Material 3, Simple Design System and the Apple kits.

**Real data / references:**
- Fonts, self-hosted under SIL OFL 1.1: Inter 5.3.0, Geist Mono 5.3.0 and IBM Plex Sans 1.1.0 / Mono 2.5.0.
- Measured contrast: light body 20.38, secondary 5.02, link 5.36; dark 17.93, 7.02 and 6.32.

**Business reasoning:**
- The investigator reaches a verdict in three actions or fewer from the home page.
- The home page explains the product and proves it's live.
- VIGIL, ANCHOR and the ledger link to each other, so a judge or bank sees one system.

Changed:
- `carbon.css` (Carbon tokens) and `hashscan.css` (the HashScan look, loaded last).
- **Home page** (`dashboard/index.html`): a hero, a live Hedera proof strip, how it works, "The VUKA system", banks and insurers, privacy and security.
- **Routed app** (`dashboard/ledger/`): Overview, Verify, Anchors, Activity, Method, and Settings behind a gear. Deep links (`#verify`) are kept.
- **One summary notice** for failed sources.
- **The VIGIL Android download,** with an inline QR (decoded: equals the APK URL), and "Android only for now" for iPhone.
- **ANCHOR's live `/healthz` status,** plus links to the OpenAPI contract and the server source.
- **A site bar** on `security.html` and `verify-min.html`.
- **Pages:** the root opens the home page; one deploy (`security-score.yml` no longer deploys); fonts and licences are allowed; `sample/` is no longer published.

Evidence:
- `node --test "dashboard/ledger/test/*.test.js"`: 42/42. `node --check` passes on every `.js` file under `dashboard/`.
- A Playwright check of local serving and a rebuilt Pages layout: every internal link returns 200, and nothing scrolls sideways at 400 px.
- Review rounds found 6 problems in the latest round; clean after fixes.

Not verified:
- Live data. The sandbox cannot reach Azure or the mirror.
- `security.html` changes reach Pages only after a `security-score` run on main.
- **iOS:** needs a Mac with Xcode, an Apple Developer account for TestFlight, and a Swift port of five native modules. The owner must decide on this.
