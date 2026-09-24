# IPELENG — P3.L8 REVIEW — `docs/PIN-AUTHORITY-RULES.md` + ADR-0040

**Reviewer:** Ipeleng Constance Modise (security & privacy). Self-review of her own draft before the joint §8/§9 checkpoint with Lethabo — this is the draft owner's pass, **not** an acceptance: nothing here infers Lethabo's agreement, and no decision below is decided until the checkpoint records it.

**Drafted:** 24 September 2026 with the Cline assistant (VS Code agent) at her request; every finding and position is hers to confirm, edit or overrule.

**Question asked:** does this page restate §8, §9 and ADR-0036 accurately enough to be the one surface the team agrees line by line at 11:00 — and are the eight open §8 rows ready to be decided there?

**Scope:** `docs/PIN-AUTHORITY-RULES.md` in full; ADR-0040 as added to `docs/adr.md`; the ADR-0040 row in `docs/ADR-ACCEPTANCE-RECORD.md`; the P3.L8 amendment in `docs/CHECKLIST.md`. Out of scope: contract v2 (Sibusiso), economics, the privacy-policy text (PR #43 S3 — still open, owned by Ipeleng, separately scheduled).

**Method:** the page read in full at `958b626` and every claim cross-checked against `docs/VUKA-2-SPEC.md` §8 (lines 220–233) and §9 (lines 237–259), ADR-0036 (`docs/adr.md` lines 429–434), `docs/STAGED-DURESS-DEFENCE.md` S5–S7, `docs/OPEN-GAPS.md` G33–G35, `docs/security/THREAT-MODEL.md` TM-C4/TM-C8–TM-C10 and §7, `docs/COERCION-SCENARIOS.md` (G09, G11, F06, I01, H1), the PR #43 review conditions in `docs/ADR-ACCEPTANCE-RECORD.md`, and the PR #48 follow-ups build log that corrected the `pin_authorised` signed fields. The two commits on this branch were read as diffs; the ADR and acceptance-record additions were checked against the append-only rule (no prior row touched).

**Verdict: ready for the checkpoint — amend before acceptance.** No blocking finding: nothing in the draft is unsafe, and the page is `Proposed`, binding only when Lethabo agrees it. But three cells drift from the corrected spec text, and if they are accepted as written they would mislead the builders who work from this page instead of §9. The three should-fix edits land in the same PR that records ADR-0040's acceptance — exactly what the page's §8 footer already promises ("a decision amends the spec section and this page in the same PR"). Replacement wording for each is in the findings below, ready to apply verbatim.

---

## Findings

| # | Severity | Where | The problem |
|---|---|---|---|
| **A** | Should-fix | §2, the `pin_authorised` block | `expires_at` is shown **inside the device-signed statement**. Spec §9 (corrected in PR #48, confirmed in the follow-ups build log) says the opposite: the device signs `{action, target_id, mode, nonce}` — it cannot know the server's receipt time — and **the server** records `expires_at = received_at + 120 s` alongside the signed fields. The page claims to restate §9 without changing it; this cell changes it. A builder working from this page would put a server-computed field inside the device signature. |
| **B** | Should-fix | §3, Remove guardian and Add guardian rows | The removal row never says **the remaining guardians are notified, naming the removed guardian** — the B1 control from the PR #43 review (the multi-session replacement risk, TM-C4's fix, T24's extension). The add rows say "existing guardians notified" but drop "naming the added guardian". Spec §9 as amended carries both. Without them on this page, the one surface Vukosi builds from silently drops the B1 control — the exact failure the page exists to prevent. The silence rule is untouched: the **removed** guardian is still never told. |
| **C** | Should-fix | §3, Recover row (duress column) | "Looks done, does nothing — a hard no-op" compresses the amended spec row wrongly. Spec §9's duress cell says recovery on a new device is **not available (it holds no PIN hash)**; recovery there is gated by the recovery code, guardian notification, the open-incident block and the 24 h freeze — "for Lethabo and Ipeleng to confirm at P3.L8". The coercer's recovery path is the **dictated recovery code** (TM-C8, duress doc S4), not a duress PIN; the duress-PIN no-op applies to PIN-gated prompts on the held phone. The page should say which case each sentence covers and keep the "to confirm" flag it already tracks in §8 row 4. |
| **D** | Note | §1, the one-sentence version | "…neither a normal PIN nor a coercer holding the phone can ever close an incident" overstates: §5 and spec §8 close an incident **automatically 6 h after the last signal**. A coercer can simply wait. The true claim is about *authority*: no PIN closes an incident — closure comes only from a guardian `stand_down` or the 6 h auto-close. Tighten the sentence; an agreement page read line by line should not contain a sentence a checkpoint participant can falsify from the same page's §5. |
| **E** | Note | §7, T24 row | The tested list omits the B1/T37 extension the follow-ups build log records ("T24 extended"): a scheduled removal notifies the remaining guardians, naming the removed one. Add it so §7 matches the amended spec and today's 16:00–20:00 test-spec block writes the T37 oracle from the same text. |
| **F** | Note | §8 row 7 and §9 Provenance | Row 7's "named in tonight's review" points at the PR #50 review, which exists only on GitHub — no file in `docs/reviews/` carries it, and the Provenance table does not list it. Add a provenance row (or a review file) so the reference resolves from the repo alone. |
| **G** | Note | §8 row 6 (T47) | Whatever numbers the checkpoint picks, record the constraint: wrong-PIN behaviour must be **mode-blind** (V5 parity; T15/T31). A lockout progression, timing difference, or guardian visibility that differs between a normal session and a duress session is a duress tell; equally, a lock event must not leak duress status onto the anchored public surface. Bake this into the row's answer so T47's oracle tests it. |
| **H** | Note | §5 and ADR-0036(5a) | ADR-0036 writes the trigger as the field name `duress_pin`; the page (commit `958b626`) and spec §8 now say "a duress signal (§3)" — the broader, better reading (H1: a duress PIN at any check-in, `pin_authorised` mode duress, or `answered_late` carrying one). The page is aligned; the checkpoint should note the ADR's shorthand is subsumed so nobody reads ADR-0036 narrowly later. |

**Severity scale:** no blocking findings. Should-fix = wrong or missing text that would mislead a builder if accepted as written; note = precision, traceability or decision-support.

**Replacement wording (apply in the acceptance PR):**

- **A** — replace the §2 block with ``pin_authorised (device-signed) = {action, target_id, mode: normal|duress, nonce}`` and follow it with: "The device cannot know the server's receipt time, so `expires_at` is never part of the signed statement: the server records `expires_at = received_at + 120 s` alongside the signed fields (§9). An expired authorisation cannot be replayed."
- **B** — Remove guardian (normal-PIN cell): "**Scheduled, silent, effective after 24 h**; the removed guardian keeps receiving alerts until then and is never told. **The remaining guardians are notified, naming the removed guardian.** The last guardian can't be removed until a replacement is accepted." Add guardian (both cells): "Allowed; existing guardians notified, naming the added guardian."
- **C** — Recover (duress cell): "**Not available on a new device** (it holds no PIN hash). On the held phone a duress PIN at any prompt is a duress signal (V6): the alarm raises and the outcome shown is normal. Recovery on a new device is gated by the recovery code, guardian notification, the open-incident block and the 24 h freeze instead — for Lethabo and Ipeleng to confirm at P3.L8 (§8 row 4)."
- **D** — one-sentence version: "…neither a normal PIN nor a coercer holding the phone can close an incident on demand — it closes only on a guardian `stand_down` or the 6 h auto-close (§5)."
- **E** — T24 row gains: "; a scheduled removal notifies the remaining guardians, naming the removed one (B1/T37)".
- **F** — Provenance gains: "| Ipeleng's PR #50 review (GitHub, 23 Sep) | The coercion-catalogue findings I01 and F06 (§8 rows 2–3) and the identical-record hold named in §8 row 7 |".

---

## What holds — verified accurate

- **§5 incident lifecycle** matches spec §8 line for line: opens on `signal_detected`, a duress signal, `no_answer` or `contact_lost`; closes only on guardian `stand_down` or the 6 h auto-close; a normal PIN alone never closes one; `incident_closed` is a server event anchored immediately; `contact_lost` never fires after closure.
- **§2's authority rules** match ADR-0036(2) and spec §9: on-device Argon2id verification, one `pin_authorised` per exact action and target, device possession or a bare device signature is never authority, `mode` visible to the server inside the committed payload and never public — except finding A's `expires_at` placement.
- **§3's duress columns** for add (decoy + real guardians told), remove (looks done, does nothing) and delete (looks done, does nothing) match ADR-0036(4) and the §9 table, as do the open-incident cells (add allowed with notification; removal deferred; deletion blocked; recovery blocked).
- **§4 states the price honestly**: the 24 h window in which a removed abuser still receives alerts is the accepted cost of never-disarm — matches ADR-0036(5) and coercion catalogue G11, which records the same cost including the location attachment.
- **§6** matches spec §9's mechanics: revocation at server receipt time with later-signed events rejected and the revocation on-chain; invites only through a fresh PIN authorisation; the 10-word code shown once, SHA-256 first-two-words handle, Argon2id verification, no code shown if the endpoint is cut; the narrowed two-signature rule (deletion, detection-threshold changes, signing-key rotation).
- **§7's landed tests** (T12, T13, T16, T24) are the executable form ADR-0040's consequences names; T30/T47 correctly stay `PROPOSED`/pending with their TM-C9/TM-C10 provenance.
- **§8 rows 1–3** faithfully carry OPEN-GAPS G33/G34/G35 and the spec §8 OPEN note, including the freeze ("nobody implements the bank signal after a normal-PIN outcome until decided").
- **The record-keeping is clean**: ADR-0040 is `Proposed` with Lethabo `Pending` in the acceptance record; CHECKLIST P3.L8 stays unticked with an honest status line; the renumbering from ADR-0039 is explained in the record and consistent with Lethabo's `docs/adr-0039-event-detail` claim; the acceptance-record edit is append-only; no prior row was altered.

---

## The eight checkpoint rows — proposed positions (nothing decided)

Ipeleng's proposed positions, to confirm or amend with Lethabo at 11:00. Each names what must change in the same acceptance PR. Nothing here is decided: the checkpoint's word is the decision.

1. **G33 (normal-PIN outcome vs `contact_lost`)** — propose **(a)**: a normal PIN plus `journey_ended` closes the incident, as the server-anchored `incident_closed` event, and it never retracts alerts already sent. Keep (b)'s suppression too: `contact_lost` never triggers the bank signal after a normal-PIN outcome was recorded. That answers both the false-alarm harm (S5's "check-in → normal PIN → closed") and the coercion case (a coercer forcing a normal PIN still cannot reach the bank signal). Spec §8's OPEN note is replaced; STAGED-DURESS-DEFENCE S5 is checked against the outcome; OPEN-GAPS G33 closes.
2. **G34 (a check-in that is never shown escalates nothing)** — agree with the page's `PROPOSED` server fallback: the `no_answer` deadline also starts from the server receipt of `signal_detected` (window + 10 s grace), deduplicated by idempotency key against the `checkin_opened`-based deadline so exactly one `no_answer` can ever fire (§8's outbox rules already carry the keys). I01's hole closes without trusting the notification layer.
3. **G35 (ending a journey is not PIN-gated)** — propose **(a)** with (b) as backstop: `journey_ended` needs a `pin_authorised` (a duress PIN at that prompt then raises the alarm, V6/T16 — F06's own suggestion), and the server treats a journey end while a signal is open as a continuation, not a stop. Costs a legitimate user one PIN after a false detection; buys the coercion case. Spec §8 change plus a test ID.
4. **Recovery row and S4 export freeze** — confirm both as written in the amended spec §9: the 24 h post-recovery freeze covers guardian changes, deletion **and bulk export**, and the duress cell reads per finding C. Then apply finding C's replacement text so the page matches what is being confirmed.
5. **T30 (export during an open incident)** — confirm the `PROPOSED` fix as written: a fresh `pin_authorised` for action `export`; under an open incident or a duress authorisation the export ends at the last head before the incident (a prefix still verifies, so the no-op stays convincing). Write T30's oracle from it in the 16:00–20:00 test-spec block.
6. **T47 (wrong-PIN behaviour and attempt limit)** — propose: 5 attempts, then a mode-blind escalating lockout with **fixed** durations (no timing tell), no difference in what the screen shows between modes, no lock event on the public anchored surface, and guardian visibility only through the already-open incident flow — never a new "PIN locked" guardian event (that would be a tell). The numbers are the checkpoint's to set; finding G's mode-blind constraint rides along either way.
7. **6-hour identical-record hold after any PIN entry** — needs a written rule before it can be tested, as the row says. Proposed scope to react to: a second PIN-gated action with the same action+target within 6 h returns the **first receipt** (idempotency keyed on action+target+record body) instead of creating a second record; the device shows the first receipt's outcome; the window spans `checkin_result` and `pin_authorised` pairs; and a duress repeat is byte-identical to a normal one (parity). Owner and test ID named at the checkpoint.
8. **What a duress no-op shows once the promised delay has passed** — take the page's own safer default **(a)**: keep showing success indefinitely; correcting the lie while the phone may still be held endangers the victim. One line in §17's honesty ledger records it.

**Acceptance mechanics (the page's own §8 footer rule):** one PR — the three should-fix edits above, the decided rows' answers onto the page, spec §8/§9 amendments where rows 1–6 change text, OPEN-GAPS G33–G35 statuses, ADR-0040 status → Accepted, the acceptance-record row completed with Lethabo's name and time, and CHECKLIST P3.L8 ticked only after Lethabo agrees. Until then the spec's existing text governs, exactly as the page says.

---

## Conditions tracker (carried from the PR #43 review)

- **B1** — spec text landed in PR #48 (§9 rows name the other party; ADR-0036(5) qualified to the single-session case; T24 extended). Remains open on this page until findings B and E land, and on the executable side as the **T37 oracle** in today's 16:00–20:00 test-spec block. This review does not close B1; the acceptance PR does.
- **S3** — privacy-policy text: **still open**, owner Ipeleng, undated in the acceptance record, separately scheduled in the work order. Out of scope here; not blocked by this review.

## What this review is not

Not Lethabo's acceptance, not a decision on any §8 row, not legal advice, and not a substitute for reading spec §8/§9 — the spec remains authoritative wherever this page and the spec disagree (that is finding A's whole point).

## Provenance

Written from: the review page at `958b626`; spec §8/§9 as merged in PR #48; ADR-0036 and ADR-0040 in `docs/adr.md`; `docs/ADR-ACCEPTANCE-RECORD.md`; `docs/CHECKLIST.md` P3.L8; `docs/OPEN-GAPS.md` G33–G35; `docs/STAGED-DURESS-DEFENCE.md` S5–S7; `docs/security/THREAT-MODEL.md` TM-C4/TM-C8–TM-C10 and §7; `docs/COERCION-SCENARIOS.md` (G09, G11, F06, I01, H1); the PR #43 review and its conditions; the PR #48 follow-ups build log; this branch's two commits read as diffs.

— Ipeleng Constance Modise, 24 September 2026 (drafted with the Cline assistant at her request; no human approval inferred)