# PIN-authority rules — what a PIN may do, what duress may not do, when an incident ends

> **Owner:** Ipeleng Constance Modise (security and privacy) with Lethabo Hoaeane (co-lead). **Drafted** 24 September 2026 for the P3.L8 Thursday-12:00 check. **Status:** `PROPOSED` — binds when Lethabo agrees it at the checkpoint (record: `docs/ADR-ACCEPTANCE-RECORD.md`, **ADR-0040** in `docs/adr.md`; drafted as ADR-0039, renumbered because Lethabo claimed ADR-0039). **Sources:** `docs/VUKA-2-SPEC.md` §8 and §9; ADR-0036. Every rule here is already specified; this page restates them in one place so the team can agree them line by line. Not legal advice.

---

## 1 · The one-sentence version

A PIN on the victim's own device is authority to **do** things; a duress PIN is authority to **pretend** things happened while raising the alarm; and neither a normal PIN nor a coercer holding the phone can ever close an incident, delete evidence immediately, or leave the user with zero guardians.

---

## 2 · PIN authority (B5)

1. The PIN is verified **on the device**, against an Argon2id hash in Keystore-wrapped storage. The PIN itself never leaves the phone.
2. A verified PIN makes the device sign a statement bound to **one specific action and target**:

   ```
   pin_authorised = {action, target_id, mode: normal|duress, expires_at: receipt + 120 s, nonce}
   ```

3. The server accepts a PIN-gated action only with a **fresh, unexpired** authorisation for **that exact action and target**. An authorisation for "remove guardian A" cannot remove guardian B; an expired one cannot be replayed.
4. `mode` sits **inside the committed payload**: the server sees it and the public never does.
5. **Device possession or a device signature alone is never PIN authority.** A thief with the unlocked phone still cannot make a PIN-gated change without the PIN.

---

## 3 · The discard boundary (the full action table)

| Action | Normal PIN | Duress PIN | During an open incident |
|---|---|---|---|
| **Add guardian** (create invite) | Allowed; existing guardians notified | **Decoy guardian:** the accept succeeds, the decoy never receives alerts, and real guardians are told "a guardian was added under duress" | Allowed; existing guardians notified |
| **Remove guardian** | **Scheduled, silent, effective after 24 h**; the removed guardian keeps receiving alerts until then. **The last guardian can't be removed** until a replacement has been accepted | **Looks done, does nothing** — a hard no-op | Deferred until the incident closes |
| **Delete evidence** | 72 h cooling-off, then removed; guardians notified | **Looks done, does nothing** — a hard no-op | Blocked |
| **Recover to a new device** | Allowed, rate-limited; guardians notified; the old key is revoked (`key_revoked`); 24 h freeze on guardian changes and deletion — and, proposed for the checkpoint (S4, review condition), the freeze also covers bulk export (`GET /v1/subjects/{id}/export`) | **Looks done, does nothing** — a hard no-op | Blocked |

Read the duress column as one rule: **under duress, every destructive or trust-changing action is a hard no-op dressed as success.** Nothing the coercer can force creates a real change except the decoy — and the decoy *adds* protection (real guardians are told) rather than removing any.

---

## 4 · Removal trade-off, stated plainly

Someone removing an abusive guardian keeps that guardian on alerts for **up to 24 h**. That is the price of the rule, and we pay it on purpose:

- a forced removal (coercer with the phone and the PIN) can't disarm the next emergency;
- nobody is ever left with zero guardians;
- the removal is **silent** (intimate-partner-abuse safety: no notification that could provoke the removed guardian).

---

## 5 · Incident lifecycle (§8)

- **An incident opens** on `signal_detected`, a duress signal, `no_answer` or `contact_lost`.
- **It closes only** on a guardian `stand_down`, or automatically 6 h after the last signal with heartbeats present and guardians notified.
- **A normal PIN alone never closes an incident**, because a coercer can force it. A late normal PIN after `no_answer` is recorded `answered_late` and **never retracts** the alert.
- `incident_closed` is a server event, anchored immediately.
- `contact_lost` fires only while an incident is open; it never fires after closure.

---

## 6 · Key revocation, enrolment and recovery

- **Key revocation:** a key is revoked at the **server receipt time** of recovery. Events signed by a revoked key and received after revocation are rejected. The revocation is a chain entry — the ledger shows the handover.
- **Guardian enrolment authority:** an invite exists only through a fresh PIN authorisation. Accepting it binds the guardian's key and FCM token; later token updates are signed by the guardian key.
- **Recovery:** a 10-word code is shown **once** at onboarding. The lookup handle is SHA-256 of the first two words; the code is verified with Argon2id. **If the recovery endpoint is cut, no code is shown at all.**
- **Two-signature rule (narrowed):** two distinct operators sign operator-initiated deletion, detection-threshold changes and signing-key rotation.

---

## 7 · What is tested, not asserted

| Test | Proves | Spec |
|---|---|---|
| **T12** | A guardian change without PIN authorisation is rejected; duress removal is a no-op; duress addition creates a decoy and notifies real guardians | S2, §9 |
| **T13** | Recovery is blocked during an open incident; a successful recovery notifies guardians and revokes the old key | §9 |
| **T16** | A duress PIN at the settings prompt raises the guardian alert and the bank signal | V6 |
| **T24** | A scheduled removal takes effect only after 24 h; removing the last guardian is refused until a replacement is accepted | §9 |
| **T30** | Export from the member device while an incident is open carries no duress tell: export needs a fresh PIN authorisation for action `export`, and the export ends at the last head before the incident (a chain prefix still verifies) | `PROPOSED` — THREAT-MODEL TM-C9; oracle written at the checkpoint |
| **T47** | Wrong PIN at the check-in and repeated guesses behave per the decided rule (attempt limit, lockout, what guardians see) | Oracle pending the checkpoint decision (THREAT-MODEL TM-C10) |

---

## 8 · Open at the checkpoint — the undecided points Thursday settles here

Nothing below is a rule yet. These are tonight's P3.L8 inputs, listed so the Thursday 12:00 checkpoint decides each one and the answer lands on this page in the same PR that records ADR-0040's acceptance.

| # | Item | The problem | The options on the table | Status |
|---|---|---|---|---|
| 1 | **G33 — normal-PIN outcome vs `contact_lost`** | A normal PIN alone never closes an incident (§5). So a false detection, then a normal PIN, then `journey_ended` or 90 s of silence fires `contact_lost`: guardians are alerted and the bank signal follows 3 minutes later. This contradicts `docs/STAGED-DURESS-DEFENCE.md` S5 ("check-in → normal PIN → closed") | (a) a normal PIN plus `journey_ended` closes the incident; (b) `contact_lost` never triggers the bank signal after a normal-PIN outcome | Open — `docs/OPEN-GAPS.md` G33; nobody implements the bank signal after a normal-PIN outcome until decided |
| 2 | **G34 — a check-in that is never shown escalates nothing** | The `no_answer` deadline starts from `checkin_opened` (§8). If notifications are revoked or the check-in never renders, `opened` never arrives, so no deadline starts and nothing escalates (coercion catalogue I01, PR #50) | (a) server-side fallback deadline from `signal_detected` receipt; (b) keep §8 as is and accept the hole | Server fallback `PROPOSED` — `docs/OPEN-GAPS.md` G34 |
| 3 | **G35 — ending a journey is not PIN-gated** | An attacker holding the phone can end the journey; heartbeats then stop legitimately and `contact_lost` never fires (coercion catalogue F06, PR #50) | (a) PIN-gate ending a journey; (b) treat a journey end while a signal is open as a continuation, not a stop | Open — `docs/OPEN-GAPS.md` G35 |
| 4 | **The recovery row and S4 export freeze** | The §9 recovery row (24 h post-recovery freeze on guardian changes and deletion, §3 above) and the S4 extension of that freeze to bulk export are proposed but unconfirmed | Confirm both as written, or amend | `PROPOSED` — review conditions S4; Lethabo and Ipeleng confirm at the checkpoint |
| 5 | **T30 — export during an open incident** | `GET /v1/subjects/{id}/export` returns the full chain to the current head, so the export payload can contain `duress_pin` in the current `checkin_result` — visible to a coercer holding the phone (THREAT-MODEL TM-C9) | Export needs a fresh PIN authorisation for action `export`; while an incident is open, or under a duress authorisation, the export ends at the last head before the incident — a chain prefix still verifies, so the no-op stays convincing | `PROPOSED` — the checkpoint decides and T30's oracle is written from it |
| 6 | **T47 — wrong-PIN behaviour and attempt limit** | Nothing is specified: a coercer with the phone can guess the PIN without limit at the check-in (THREAT-MODEL TM-C10) | Shape to decide: attempt limit, lockout length and progression, and whether a lock event is visible to guardians | Open — the checkpoint decides the numbers; T47's oracle is written from them |
| 7 | **6-hour identical-record hold after any PIN entry** | Named in tonight's review as needed; specified nowhere in the repo | Decide what "identical" covers (same action and target? the same record body?), what the hold does (hold the second record? return the first receipt? extend the earlier entry?), and which events it spans | Open — needs a written rule before it can be tested |
| 8 | **What a duress no-op shows once the delay has passed** | A duress removal "takes effect after 24 h" and a duress deletion "after 72 h" — both are hard no-ops (§3). Nothing says what the coercer sees when the promised deadline passes with nothing changed | (a) keep showing success indefinitely — correcting the lie while the phone may still be held endangers the victim; (b) a plausible "still processing" state | Open — the checkpoint picks one; (a) is the safer default |

Until a row above is decided, the spec's existing text governs and this page's §3–§6 stand as written; a decision amends the spec section and this page in the same PR.

---

## 9 · Provenance

| Source | What it carries |
|---|---|
| ADR-0036 (`docs/adr.md`) | The decision this restates — accepted 23 Sep 2026 by Sibusiso as second lead |
| `docs/VUKA-2-SPEC.md` §9 | The authoritative table and mechanisms (B5) |
| `docs/VUKA-2-SPEC.md` §8 | Incident lifecycle, outcome arbitration, exactly-once effects |
| `docs/STAGED-DURESS-DEFENCE.md` | Why the rules exist — the defence against a staged event and a coercer holding the phone |
| `docs/OPEN-GAPS.md` | G33, G34 and G35 as drafted into §8 above |
| `docs/security/THREAT-MODEL.md` | TM-C9/T30 and TM-C10/T47, the export and wrong-PIN items in §7 and §8 |
| `docs/reviews/IPELENG-PR43-REVIEW.md` | The S4 export freeze and the recovery row (§3, §8) |
| P3.L8 (`docs/CHECKLIST.md`) | This agreement task, due Thu 24 Sep 12:00 |