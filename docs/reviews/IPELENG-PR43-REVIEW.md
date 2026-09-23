# PR #43 security review — security-critical sections (Ipeleng)

**Owner and reviewer:** Ipeleng Constance Modise (security and privacy). Drafted 23 September 2026 with the Cline assistant (VS Code agent) at her request and posted by her authenticated `gh` session (v2.101.0, keyring auth) acting on her instruction; every finding is hers to confirm, edit or overrule.

**Reviewed head:** `origin/docs/vigil-anchor-pivot` @ `f997873` (spec revision 2; review-response commit `370d466`), re-verified at `0c6d202e811618011bab5047f7eb18d3ea910af2` and finally at `7ddbf40` after the branch moved twice — see Method.

**Question asked:** is anything unsafe, open to abuse, or unlawful as designed?

**Scope:** `docs/VUKA-2-SPEC.md` §4 entry format, §7 auth/time/replay, §8 escalation, §9 PIN authority/guardians/recovery, §13 privacy/retention; `docs/adr.md` ADR-0036 (governance under coercion), ADR-0037 (bank protective hold); `docs/STAGED-DURESS-DEFENCE.md`. Out of scope: §12 contract (Sibusiso), economics, the archive move.

**Method:** all six documents read at `f997873` with `git show`; six abuse scenarios walked against the text; every claimed control checked for a matching test in §15, a measure in §16, or a line in the §17 honesty ledger. The branch then moved one commit (`0c6d202`: ADR-0034–0038 statuses Proposed → Accepted by Sibusiso, recorded in a new `docs/ADR-ACCEPTANCE-RECORD.md`; `actor_id` added to the §4 device-signed statement; wording fixes out of scope). The delta was read in full and the findings re-checked against it: none changes — the `actor_id` binding strengthens finding 2's replay closure (the signature now also pins the actor to the id registered for `signer_key_id`, with T21 negative vectors covering each field). PR-thread and CI unreachability at drafting time is recorded in `docs/reviews/ASSISTANT-PR43-REVIEW.md`; nothing here relies on the PR description or the review thread. Before posting the branch moved once more (`7ddbf40`: trailing blank lines stripped at EOF in nine archived four-layer files — archive-only whitespace; nothing in scope and none of the summary's cited files touched); the findings were re-checked against it: none changes.

## Verdict: APPROVE WITH CONDITIONS

Nothing in scope is unlawful as designed. Processing sits on the user's own consent and each guardian's own consent with the s18 notice at acceptance (§13); VIGIL stores no audio and identifies nobody (RICA position; §8 of the duress doc); staging an event is an offence the design documents rather than enables (§2 of the duress doc); ⚑-marked statutory points are correctly flagged as counsel-pending — they condition the slides, not the design.

What the design gets right against the abuse cases below:

- **Replay is closed.** Per-key counters reject exact repeats; single-use nonces; `pin_authorised` is bound to one action and target and expires 120 s after **server receipt**; every deadline is computed from server receipt time, so a device timestamp can never extend anything (§4, §7, B4; T21 negative vectors).
- **The duress UX and no-ops are real.** A duress PIN at any prompt is an alarm with a pixel-identical outcome (V5, V6); under duress, removals and deletions "look done, do nothing"; additions create a decoy guardian who never receives alerts while the real guardians are told a guardian was added under duress (ADR-0036(4)).
- **The bank hold is disciplined.** Never from detection alone; immediate only on `duress_pin`; on `no_answer`/`contact_lost` only after guardians were alerted and none sent `stand_down` within 3 minutes; the bank decides; nothing visible names duress during the event (ADR-0037(1)–(4), S1, S3).
- **The public surface is nearly empty.** 33-byte typed messages on chain (§10); immediate roots coalesced to one per minute; no event kinds for real people on the panel (§5 of the duress doc, T19).
- **The honesty ledger has teeth** (§17) — the design refuses the claims it cannot support.

## Findings — six abuse cases walked

### 1 · Coerced guardian approval — forced *normal* PIN across two sessions — needs a rule fix (blocker B1)

Under a forced **duress** PIN this is well handled: adds create the decoy guardian and tell the real guardians; removals and deletions do nothing (§9 table; ADR-0036(4)).

Under a forced **normal** PIN the table allows the add ("Allowed; existing guardians notified") and schedules a silent removal effective after 24 h, with "the last guardian can't be removed **until a replacement has been accepted**". ADR-0036(5) concludes that "a coerced removal under a forced normal PIN can **never** disarm the next emergency". That holds within one forced session and fails across two:

- Session 1 (day 1): the attacker forces an add of himself as guardian (allowed — he is now a guardian) and schedules removal of a real guardian.
- Day 2: the attacker's presence means the last remaining real guardian is no longer "last"; his removal is scheduled, silently.
- Day 3: the attacker is the sole guardian. Every future alert — including the location attached to `signal_detected` (V9) — reaches him, and the victim's escalations are visible to her attacker.

Two gaps make this easier than it needs to be: nothing notifies the **remaining** guardians of a scheduled removal (the silence rule exists to protect a victim removing an abuser — it need not keep her *trusted* guardians blind), and the add notification does not state the added guardian's identity.

Fix: (i) notify remaining guardians of additions and scheduled removals, naming the other party; (ii) qualify ADR-0036(5) to the single-session case; (iii) one §17 line for the residual multi-session risk; (iv) extend T24 (or record an observation) for the replacement path. The intimate-partner-abuse property is untouched — the *removed* guardian is still never told. This is also the call Sibusiso's PR #43 review left open (his point 4: forced-`normal`-PIN guardian removal, "this is Ipeleng's call"): the spec already has both mechanisms he floats — a silent 24 h delay before removal takes effect, and the last-guardian replacement block — and the gap survives both, because across two coerced sessions the attacker's own accepted add becomes the "replacement" that unlocks the final removal. The notify-remaining-guardians rule is what closes it.

### 2 · Replay of yesterday's signed `check_in` — pass

Replaying captured signed bytes fails everywhere it matters: exact repeats are rejected by the per-key counter; nonces are never accepted twice; a reused `event_id` with different content is rejected 409 (§4, §7). A captured `pin_authorised` is dead within 120 s of server receipt and is bound to exactly one action and target (§9). The clock-skew exemption for `checkin_opened`/`checkin_result`/`pin_authorised`/`duress_pin` relaxes **only** the skew check — "authentication, key revocation (§9) and action authority still apply in full" (§7). Deadlines use server receipt time (B4), so old bytes cannot revive old windows. T21's negative vectors cover field tampering. The only residual — intercepted-but-undelivered bytes replayed later — requires a network-position attacker at send time and yields at most a late escalation of a genuine event. No change asked.

### 3 · Server suppressing escalation before the anchor — pass with an honesty line (blocker B2)

§8 makes escalation server-owned by design, and T08 proves durability against crashes. A **malicious or compromised** ANCHOR is a different threat: it can simply not write the `guardian_alert`/`bank_signal` outbox effects, or fabricate `no_answer`, `incident_closed` and `key_revoked`, because the chain is server-built and the ledger records the server's claims. The user's truthful delivery state (V8) ends at "acknowledged (guardian)" — and that acknowledgement also travels over the same server. The genuinely independent witnesses are the guardian's own-key acknowledgement (E2, G5) and the bank's own systems (ADR-0037(1)). §17 never says this; one line fixes it. Peer-to-peer guardian delivery is out of scope for this PR and is not asked for.

### 4 · A single compromised phone fabricates a bank hold — pass with an honesty line (blocker B3); provenance should-fix (S1)

Thirty seconds with the unlocked phone is escalation authority **without any PIN**: arm a journey (V1 — an explicit foreground action on a phone whose permissions are already granted), then answer nothing. The check-in window is 20 s or 60 s plus 10 s grace (§7), `no_answer` opens an incident (§8), and the bank signal goes out 3 minutes after guardians were alerted with no `stand_down` (S1; ADR-0037(2)).

The consequences are bounded: guardians see "Don't call or text them. Call 10111." (G4); a guardian can `stand_down` inside the 3-minute window and stop the bank signal; the hold itself is routine friction that never names duress (ADR-0037(3)); release costs a branch visit, not money. But two facts belong on the honesty ledger: possession of the unlocked phone is enough to fake an alarm, and `signal_detected` carries **location** (V9) — a fabricated event can send guardians, and any police they call, toward the owner's real position.

- **B3** (one §17 line): someone else holding the unlocked phone can arm a journey and force a `no_answer` escalation, including the bank signal after the 3-minute window; a false alarm can move guardians toward the recorded location.
- **S1** (should-fix, with contract v2): `bank_signal_sent` must record the triggering outcome (`duress_pin` / `no_answer` / `contact_lost`). Today both are single-principal (E1); provenance lets the bank weigh a timed-out hold differently from an explicit duress PIN, and gives an insurer's investigator the same handle.

### 5 · Lone-guardian scenario — guidance missing (should-fix S2)

The never-zero rule guarantees at least one guardian; nothing requires two. One guardian is a single point of failure — asleep, phone off, unreachable — and if that guardian is the threat (S7 governs *pairing*, not *choice*), every alert, with its location, lands on exactly one screen. The mechanism is not unsafe; the guidance is missing. Onboarding should recommend **at least two guardians who do not live with the user**, and §17 should say that a lone guardian sees every alert.

### 6 · Retention after member departure — pass with text conditions (should-fix S3)

§13 is consent-based and minimal: payloads and salts 90 days (dispute hold excepted); user deletion is PIN + 72 h cooling-off, guardians notified, chain stays verifiable (§9, P1); the never-collected list is explicit. After deletion the residual is "the coarse class, time, actor id, journey id, hashes and public keys" — permanent. That residual is personal information (actor id plus class plus time), held for "the integrity of the evidence chain the user asked us to keep" — defensible under consent **if the privacy policy states it verbatim**, which is exactly what §13 promises. Three text conditions: (i) the policy lists the residuals, the 90-day window and the 72 h cooling-off verbatim, and says plainly that the hashes are permanent; (ii) the guardian side gets a departure lifecycle — FCM token and pairing deleted on request, signed acks on the victim's chain persisting (and saying so); (iii) when a real bank integrates (not `sim_bank`), the bank joins §13's named recipients with its own POPIA accountability — today's list ("hosting…, Google, the SMS gateway, and Hedera") does not name it.

## Conditions for this approval to bind

Blockers — must be in the spec before the §8/§9 agreement closes on Thursday. All three are wording plus one notification rule; none re-opens the architecture.

- **B1 · Coerced guardian set.** Remaining guardians are notified of additions and scheduled removals, naming the other party; ADR-0036(5) is qualified to the single-session case; the multi-session replacement risk gets a §17 line; T24 is extended (or a recorded observation added) for the replacement path.
- **B2 · Server trust on the record.** §17 gains: a malicious or compromised server can suppress or fabricate escalation; the independent witnesses are the guardian's own-key acknowledgement and the bank's own systems.
- **B3 · Unlocked-phone authority.** §17 gains: possession of the unlocked phone is enough to arm a journey and force a `no_answer` escalation, including the bank signal; `signal_detected` carries location.

Should-fix — owners named; none blocks the pivot merge.

- **S1 · Bank-signal provenance** (Sibusiso, with contract v2): `bank_signal_sent` records the triggering outcome.
- **S2 · Lone-guardian guidance** (Vukosi/Mutarisi app copy): onboarding recommends at least two guardians; §17 lone-guardian line.
- **S3 · Privacy-policy text** (Ipeleng): residuals and cooling-off verbatim, permanence of hashes, guardian departure lifecycle, the bank named as a recipient before any real integration.
- **S4 · Post-recovery export freeze** (Lethabo, with §9): a forced *normal*-PIN recovery (the recovery code dictated under coercion) re-binds the subject's device to the attacker, who can then bulk-read the history via `GET /v1/subjects/{id}/export` (A5). The existing 24 h post-recovery freeze on guardian changes and deletion should extend to bulk export; guardians are already notified of a recovery. A genuine victim re-recovering after theft (S4 in the duress doc) needs the app working, not bulk export, in the first 24 h.

Per my standing rule (`team/ipeleng.md`): every signed-off abuse case gets a running test or a recorded "not measured" observation. B1 → T24 extension; B2 → T08 stands for durability plus a recorded observation that suppression-resistance is not claimed; B3 → recorded observation (nothing automatable); S1 → contract test; S2/S3 → copy and document checks; S4 → recovery-endpoint test or "recorded as cut". Anything unmeasured by Thursday is recorded as **not measured**, which is a valid answer.

## Appendix — the 30-minute §8/§9 meeting (Thursday)

Lethabo's invite says 11:00; the spec's §14 table records 12:00 — fix one of the two.

1. *(5 min)* B5 mechanics confirmed: one `pin_authorised` per action+target, 120 s from server receipt, nonce; `mode` visible to the server inside the committed payload, never public (§9).
2. *(5 min)* B1: removal/add notifications to remaining guardians; ADR-0036(5) wording; T24 extension.
3. *(5 min)* Incident rules confirmed: opens on `signal_detected`/`duress_pin`/`no_answer`/`contact_lost`; closes only on a guardian `stand_down`, or automatically 6 h after the last signal; a normal PIN alone never closes (§8; ADR-0036(5a)).
4. *(5 min)* B2/B3: the two §17 lines (server trust; unlocked phone).
5. *(5 min)* S1 provenance and the 3-minute window against G4's "don't call them" — `stand_down` must stay reachable without calling the victim.
6. *(5 min)* S2–S4 owners and test IDs; record "not measured" where honest.

## What this review is not

- Not a promise that the conditions are done — posting this review does not satisfy them. `docs/ADR-ACCEPTANCE-RECORD.md` exists at `0c6d202` (Lethabo recorded Sibusiso's 23 Sep acceptance of ADR-0034–0038 there, with the B5 PIN-verification mechanism as a §9 pre-condition tracked P3.L8, and this review listed as **Pending**); Lethabo appends these conditions to that file — append-only, a new row or note, never an edit to a past row — which closes the Pending line.
- Not a second-lead acceptance of the whole spec — only the sections in Scope; the contract (§12) and the economics need their own reviewers.
- Not legal advice; ⚑ items remain counsel-pending; no compliance claim is made.
- Findings rest on the six in-scope documents read at `f997873` and re-verified against the `f997873…0c6d202` delta — not on the PR description, the review thread or CI logs.
