## 2026-09-26 | Sibusiso, with Claude Code assistant | Bug fix | A held record's fingerprint was never anchored, so the ledger could never verify it | PROPOSED

**Research** — End-to-end check of the VUKA Ledger dashboard (`main` 76cec98, #103/#104/#106/#107) against the deployed server code (`798f010`). The live ledger had only ever exercised the 404 path, because no anchor has confirmed on Azure yet. So the whole flow was run locally:
- the deployed server and its worker, with a throwaway server key and a clearly labelled local fixture anchor publisher whose receipt points at mirror sequence 999999, which does not exist;
- the app's own journey e2e (`scripts/e2e/journey-e2e.mjs --save-export`) to produce a real member export;
- the ledger served from `main` on localhost and pointed at that server with `?server=`.

The ledger verified every hash, link and signature. But it reported "UNAVAILABLE: this record's latest fingerprint hasn't been anchored yet; anchoring runs at least hourly. Try again later", and for this record that would never change:
- **The hold.** The server held the export at the incident's `pre_incident_head` (`server/export_view.py`, ADR-0041, 6 h). The export showed 2 entries while the server holds 11. That's correct by design.
- **The gap.** `server/anchoring.py`'s coordinator snapshots only current `subject_heads`, and the detection supersedes the pre-incident head at once. So it was in no batch, and `GET /v1/anchor/proof/{head}` answered 404 permanently.
- **Who is affected.** Every detection opens an incident, even one answered with the normal PIN. So any member who shares a record within 6 h of any detection (the "Share with a bank or insurer" flow in #105) hands over a record no bank can verify.

**Real data / references** — Local run: 3 batches confirmed and 7 leaves anchored. The member's latest head was in a batch; the held head was in none; the proof endpoint returned 404.

**Business reasoning** — The ledger's whole value to a bank is checking a shared record against the public root. "Try again later", forever, for the most common record a member would share is a demo-breaking failure. It also undermines trust in the product.

**Competitor reference** — Not applicable.

Decision (**PROPOSED**):
- **Anchor request.** `server/incidents.py::incident_for_signal` queues an `anchor_request` (`anchor:pre_incident:<incident_id>`) when it opens an incident, the same way `checkin_result` and PIN events already do.
- **Snapshot.** `BatchCoordinator.tick()` includes every incident's `pre_incident_head` not yet in a batch, alongside current heads.
- **Privacy.** Unchanged: leaves remain opaque hashes, and only the 33-byte root is published. The hold's purpose is intact, since the held head is still a genuine earlier head of the same chain.

Evidence (FACT, real PostgreSQL):
- **New test.** `server/tests/test_anchor_reads.py::test_a_held_records_fingerprint_is_anchored_and_provable` posts a detection, runs one coordinator tick, and checks that `GET /v1/anchor/proof/{pre_incident_head}` returns 200 with an audit path that recomputes the confirmed root.
- **Mutation-tested.** Removing the incident's anchor request (the tick then reports `not_due`), or dropping `pre_incident_head` from the snapshot (the proof returns 404), each fails that test.
- **Browser re-run** with the fix, on a fresh database, app e2e 36/36:
  - the held head got a proof within a minute;
  - the ledger UI ran chain, head, leaf, audit path and recomputed root `31ccaa41…ed3b252b`, byte-identical to the root the server batched;
  - it then correctly refused to call the record verified, because the fixture's mirror message doesn't exist. The server's receipt alone can never produce "live-verified".

Decision: None accepted.

Needs/blockers: real anchoring on Azure is still blocked on the stuck batch (a manual reset, then the sidecar's now-logged failure reason). Only then can the positive path be shown live: an Azure export, verified as "live-verified" on the Pages ledger.

Business handoff: Not applicable.

Next: deploy; after the reset, verify an Azure-exported record on the live ledger end to end.
