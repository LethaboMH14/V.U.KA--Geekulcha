# Demo fallback and scoped hotfix procedure

Owner: Sibusiso Khumalo  
WBS: 7.2  
Status: procedure prepared; rehearsal awaits the runnable demo and WBS 7.1 venue checklist.

## Trigger

Use this procedure when the live demo loses power, network, a required service, or a verified safety boundary. A failure is a reason to reduce scope, not to bypass review or claim a simulated path is live.

## Fallback order

1. Announce the affected capability and its last confirmed state in the run log.
2. Stop the affected live path and preserve the last known receipt/evidence record.
3. Switch to the pre-recorded or local visual fallback in `docs/wireframes/` and label every event `sim_`.
4. Demonstrate the human review decision and its limitation verbally; never imply dispatch, delivery, identity or prevention occurred.
5. If the fallback cannot show the authority boundary, skip that scenario and continue with an unaffected journey.

## Hotfix rules

- Prefer rollback or disabling the broken demo path over editing it during the event.
- A hotfix must have one named change, one owner, a reversible commit, a second-person review, a security scan and a focused verification result.
- Do not change `contracts/`, governance transitions, signer requirements, retention/deletion semantics or CI rules during a hotfix without both-lead review and an ADR.
- Never use `--no-verify`, insert real credentials, disable scans, or grant a temporary bypass.
- Record the commit, reviewer, commands, result, remaining limitation and rollback target in `docs/BUILD-LOG.md`.

## Rehearsal acceptance

WBS 7.2 passes only when a teammate can follow this procedure from a known-good snapshot, trigger an offline or service-loss fallback, roll back a scoped change, and show that authority, review and scanning controls were not bypassed. The rehearsal must run against the actual demo snapshot; this document alone is not evidence of a successful rehearsal.
