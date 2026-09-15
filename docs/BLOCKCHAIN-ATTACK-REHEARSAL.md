# P2.14 — blockchain attack rehearsal

Prepared script for the evidence checkpoint. Claims tagged as implemented must be demonstrated from the repository; deferred work is stated plainly.

**Q: Walk me through the anchoring cost.**

OpenTimestamps is the primary chain (already named "Chain", not "Alternative", throughout docs/00-SPEC.md and docs/TECH-STACK.md) — ~R0/month, public calendar servers, no wallet or token. Hedera is the fallback: repriced from $0.0001 to $0.0008/message in January 2026, giving ~R9-10/month at current price for the whole network. Name the system, state the current price. Full reconstruction and the swept correction: docs/EVIDENCE.md "Anchoring cost", docs/ANCHOR-RATIONALE.md's rehearsed answer, PR #7.

**Q: Why not use a private signed hash chain?**

A private chain can show that our own system saw an ordering, but it does not provide an independent public temporal commitment. The value of the public anchor is that a subject or auditor can verify the proof without cooperation from VUKA. This does not make the anchor prove truth, identity, or motive; it proves commitment existence by a time.

**Q: OpenTimestamps depends on volunteer calendar servers.**

Correct, and the answer is not "self-host a calendar" (ADR-0028 rejected that — it's infrastructure this project doesn't need). It's two ordinary client behaviours: submit every root to multiple public calendars (the OTS client default), and run `ots upgrade` promptly once a submission's Bitcoin confirmation lands, after which that proof is fully self-verifying with no ongoing calendar dependency. Neither is implemented yet — anchor/ is Task 5, not started. State plainly that roots are pending calendar aggregation until anchor/publish.py actually runs this. Full answer: docs/ANCHOR-RATIONALE.md's rehearsed attack 3, docs/adr.md ADR-0028.

Rehearsal evidence: record the presenter, date, exact command or public verifier result, and whether the claim was built, specified, simulated, or deferred. Do not substitute a screenshot for a verifiable proof.
