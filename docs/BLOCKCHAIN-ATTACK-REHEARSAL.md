# P2.14 — blockchain attack rehearsal

Prepared script for the evidence checkpoint. Claims tagged as implemented must be demonstrated from the repository; deferred work is stated plainly.

**Q: Walk me through the anchoring cost.**

The cost depends on the selected anchor. OpenTimestamps is the primary design in the current architecture and has no wallet, token, or per-user transaction fee; public calendar operation is a service dependency. Hedera is an alternative priced system and its January 2026 repricing makes the old R1.30 figure stale. We must use the current arithmetic for whichever system is actually demonstrated.

**Q: Why not use a private signed hash chain?**

A private chain can show that our own system saw an ordering, but it does not provide an independent public temporal commitment. The value of the public anchor is that a subject or auditor can verify the proof without cooperation from VUKA. This does not make the anchor prove truth, identity, or motive; it proves commitment existence by a time.

**Q: OpenTimestamps depends on volunteer calendar servers.**

Correct. The prototype records pending state until a proof is upgraded and independently verifiable. Self-hosting a calendar and running `ots upgrade` is deferred and must not be claimed as shipped; see `docs/OTS-CALENDAR-DECISION.md`.

Rehearsal evidence: record the presenter, date, exact command or public verifier result, and whether the claim was built, specified, simulated, or deferred. Do not substitute a screenshot for a verifiable proof.
