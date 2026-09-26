## 2026-09-26 | Sibusiso, with Claude Code assistant | Bug fix | An export made straight after the member's last event could never be verified on the ledger | PROPOSED

**Research** — This is the first live positive-path check after the first real root landed on Azure (mirror seq 5, 19:52:33 UTC). The steps:
1. A fresh `sim_subj_7130efa4`, driven by the app's own compiled device layer, registered on Azure.
2. It walked a journey and ended it, then authorised an export with its PIN.
3. It received a 4-entry export that the stranger verifier (`shared/verify.js`) passes offline.

But `GET /v1/anchor/proof/{head}` for that export's head stayed 404. It was polled every 20 s for 10 minutes, through the confirmed batch at seq 7 (19:57:33). At 19:58:13 the coordinator then reported `empty`: every current head was already anchored.

The cause is in `server/export_view.py`. An export ends at the entry *before* its own `pin_authorised` event (so normal and duress authorisations return the same prefix). That authorisation calls `anchor_intent`, which triggers a batch, but the batch snapshot took only current heads, which by then is the authorisation itself. So the export's head is a leaf only if some batch happened to snapshot in the gap between the member's last event and their export PIN. In a demo, where the journey ends and the export follows seconds later, it never is, and the public ledger says "not anchored yet" forever. It is the same class of gap as the held-export head fixed earlier today.

**Real data / references** —
- Azure `default_docker.log`, 19:57–20:08 UTC: `anchor status confirmed` then `empty`; 30 × `GET /v1/anchor/proof/08a62c09… 404`.
- `/v1/anchor/latest` seq 7.

**Business reasoning** — "Paste your record into the public ledger and see it verified" is the demo's proof moment. It has to work for a record exported a minute ago, not only for one exported hours after the member's last event.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Batch snapshot.** It now also takes the `prev_hash` of every `export` `pin_authorised` chain entry (via `pin_authorisations`), next to current heads and incidents' `pre_incident_head`. The authorisation already requests an anchor, so the export's head lands in the next batch (about a minute). Anything already anchored is still skipped, and leaves stay opaque hashes.
- **Sidecar error message.** `reason.mjs` now names a half-installed package by its package name. On Azure it printed the full `/tmp/<build>/…/node_modules/@hiero-ledger/sdk/index.` path while `npm ci` was still running.

Evidence (FACT):
- **Export-head test.** `server/tests/test_anchor_reads.py::test_an_exported_records_head_is_anchored_even_when_exported_at_once` failed before the change with the same `404 no confirmed anchor contains this head` as Azure. It now passes: the proof verifies against the confirmed root, and a re-fetched export carries the proof inline.
- **Sidecar test.** `anchor/hedera-sidecar/reason.test.mjs` has a new case using the exact Azure message; it failed before and passes now.
- **Suites.** Sidecar 13/13. Full Python suite: see the commit.

Decision: None accepted.

Needs/blockers: none.

Business handoff: Tell the demo team that after exporting, the ledger shows the record as not yet anchored for up to about a minute, then live-verified.

Next: deploy; re-run the live check with a fresh `sim_` member; expect LIVE-VERIFIED on the Pages ledger.
