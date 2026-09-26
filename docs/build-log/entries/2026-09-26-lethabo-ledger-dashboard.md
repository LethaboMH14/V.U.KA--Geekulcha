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
