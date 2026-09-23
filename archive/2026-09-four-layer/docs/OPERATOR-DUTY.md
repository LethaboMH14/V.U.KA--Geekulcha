# Human-gate operator duty card

Status: **PROPOSED** operating material for the WBS 3.3 proof path. It is not a licence, legal opinion or production training certification. A named service operator and security/legal reviewer must approve it before any pilot.

## The operator's authority boundary

The system supplies uncertain inputs and a `watch_candidate`. The operator decides whether the evidence supports a human action. The operator never treats a score, face embedding, plate text, forecast or model label as a verdict. No action claims that a person committed a crime.

The operator must refuse or defer when evidence is stale, contradictory, incomplete, outside the tenant, obtained without an accepted basis, or unsafe to investigate. When the operator is unavailable, the queue remains at `watch_candidate`; workload is not a reason to lower the proof standard.

## Review procedure

For each candidate:

1. Confirm the tenant, candidate ID, source time, received time and freshness state.
2. Read the evidence items and their uncertainty notes. Do not request or attach raw audio, face images or unrelated personal data.
3. Check whether the candidate is duplicated, already dismissed or already whitelisted.
4. Record a plain-language reason tied to the available evidence. Do not write a conclusion about guilt, intent or identity.
5. Choose `verify_concern` to record human review while preserving the candidate state, or choose `dismiss` when the evidence does not support further action.
6. Use `whitelist`, `disarm`, `threshold_change` or `delete` only for the approved scope and only with a second distinct authorised operator.
7. Check the returned receipt. A refusal is a recorded outcome and must be handed to the evidence path; never catch it and retry silently.

## Two-signature rule

The first operator and co-signer must be two distinct, authenticated principals with authority in the same tenant and scope. They must sign the same action and reason. A second signature from the same person, an unrecognised principal or a different scope is a refusal. The refusal remains evidence.

No operator may ask another person to sign an action they have not reviewed. No operator may pre-sign a blank or reusable request. A signature is not proof that the underlying event was true; it proves who accepted the recorded action.

## Required refusal reasons

Use a specific reason and preserve the candidate for review when any of these applies:

| Condition | Operator action |
|---|---|
| Missing operator identity or signature | Refuse and record the attempt |
| Missing reason | Refuse and record the attempt |
| Stale or conflicting evidence | Defer or dismiss with reason; do not escalate |
| Single signature for a destructive action | Refuse and record the attempt |
| Same principal supplied both signatures | Refuse and record the attempt |
| Cross-tenant or out-of-scope request | Refuse and record the attempt |
| Request for raw audio, face image or public-chain personal data | Refuse and escalate to the security owner |
| System receipt is `pending`, `gap` or otherwise unconfirmed | Do not describe it as delivered or confirmed |

## Evidence and privacy

The evidence event records who acted, what action was requested, which tenant and target were in scope, when it happened, the reason and the refusal or acceptance result. The event payload must not contain raw audio, face images, credentials or personal incident narratives that do not belong in the audit record.

The public anchor receives a commitment only. It does not receive the subject's name, location, image, audio, embedding, plate text or operator note. Subject access and deletion follow the approved privacy route; this card does not itself authorise disclosure or deletion.

## Training and assessment before pilot

Before a real operator handles a pilot queue, the service owner should provide:

- a role and tenant access record;
- a supervised walkthrough using `sim_` candidates;
- a signed acknowledgement of the authority boundary and two-signature rule;
- a refusal exercise for stale, conflicting, cross-tenant and single-signature requests;
- a subject-rights and incident-escalation briefing;
- a review by the security owner and the registered service partner.

The team must record completion evidence and the trainer. This document is not evidence that any person has completed training.

## Demonstration acceptance

The demo may claim this duty path only when a nonauthor reviewer can reproduce:

- a named human review that transitions to `flagged` for `verify_concern`;
- a dismissal with a reason;
- a single-signature whitelist refusal whose event is retained;
- a two-distinct-operator whitelist acceptance;
- an invalid action refusal or rejection;
- a receipt that distinguishes accepted, refused, pending and unconfirmed states;
- a subject-access pull via `GET /v1/subjects/{id}/record` demonstrating that a wrongly-reviewed concern is provably correctable.

All demo records use `sim_` identifiers and are named as simulated. No production safety promise follows from this rehearsal.

## Operator error and remedy

An operator who verifies concern incorrectly — e.g. misreading evidence, reviewing the wrong entity, or failing to recognise a delivery pattern — creates a `flagged` event that is permanently recorded. The remedy is not deletion. The remedy is the **subject-access path**: the affected person (or their estate representative) pulls their own file, receives the full decision history with a verifiable proof, and the record shows:

- the original `verify_concern` event and its operator;
- any subsequent dismissal or correction by a second operator (two signatures required);
- the complete chain from sighting to resolution.

No row is removed. The correction is visible to the same public verifier that can check any other event. This is by design — a system that can hide its operator errors is a system nobody can trust to have none.

## Escalation paths

| Situation | Operator action | Next step |
|---|---|---|
| Subject disputes a review | Do not argue. Record the dispute as evidence. Point the subject to the member app's subject-access path (F14) | Estate/security company oversees remedy; VUKA's role is the record, not the adjudication |
| Law enforcement requests access | Do not grant access. Refer to the service owner and security officer | The registered security company (PSiRA s20) is the party rendering the service; VUKA is their technology supplier. Ipeleng's PSiRA position paper (`P2.1`) governs |
| Regulator inquiry (POPIA s51) | Preserve all records. Do not modify or delete. Notify Ipeleng (security owner) and the service owner | PSiRA-registered company responds; VUKA supplies the anchored evidence chain per the subject-access contract |
| Raw audio or face image demand | Refuse and escalate to security owner | "Vectors not images" (`E2`) is architectural; the 3-second ring buffer records labels, never raw audio |
| Receipt shows `pending`, `gap` or unconfirmed | Do not describe it as delivered. Record the state and queue for the next anchor cycle | `anchor/publish.py` confirms after `ots upgrade` (ADR-0028); until then, state the honest status |
