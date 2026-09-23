# Staged duress — why a faked event does not become "ground truth"

> **Owner:** Ipeleng Constance Modise (security and privacy). **Drafted** 23 September 2026 by Lethabo's Claude Code assistant from the pivot analysis. **Status:** `PROPOSED`. Ipeleng reviews it, owns it from here, and turns every rule into an executable test in `docs/VUKA-2-SPEC.md` §15. Not legal advice. Statutory text marked ⚑ still needs a primary-source read before it goes on a slide.

---

## 1 · The problem, stated the way the lead raised it

Because an anchored record can't be edited, someone could **stage** a duress event and then use the unchangeable record as if it proved the event was real. For example: an accomplice screams near the phone, the claimant drives to an ATM and withdraws, then files for coerced-transfer reimbursement.

Blockchain people call this the **oracle problem**: a ledger guarantees what happens to data *after* it is written, never whether it was true *when* it was written.

> **The anchor proves when, not what.**
> It proves a record existed no later than a public timestamp and has not changed since. It does not prove the scream was real. Every VUKA surface — code comment, slide, pitch line — says this.

---

## 2 · Why an unchangeable record works *against* a fraudster

1. **It locks in the story before the fraudster knows what else exists.** ATM cameras, cell towers, the accomplice's phone, a vehicle tracker, the bank's own device fingerprint. A genuine victim's record agrees with the world. A staged one has to agree with every other record forever, and any mismatch is permanent.
2. **It keeps what the fraudster would rather hide.** Cancelled alerts, a normal PIN entered minutes earlier, a guardian removed at 22:50, three convenient "emergencies" last month. A hash chain makes selective deletion detectable.
3. **It turns one liar into several crimes.** Staging an event is ⚑ **cyber forgery and cyber uttering** (Cybercrimes Act 19 of 2020, s9) and, if a payout follows, ⚑ **cyber fraud** (s8). A false sworn statement to SAPS is a separate offence ⚑ (Justices of the Peace and Commissioners of Oaths Act 16 of 1963, s9 — secondary source only). Those laws exist whatever we build. We make the trail permanent.

---

## 3 · The defence stack

| Layer | What it does | What it defeats | What it cannot defeat |
|---|---|---|---|
| **1 · The money doesn't move** `PROPOSED` | With a partner bank linked, a duress signal makes the bank apply its **own** routine friction (ADR-0037) | The payoff. Faking duress blocks your own withdrawal; not faking it leaves a "normal" record that undercuts the claim | Accounts at banks that have not integrated |
| **2 · Independent witnesses** | Each party signs its own observation with its own key: device, user, guardian, bank | The lone fraudster. Staging now needs accomplices, each exposed to prosecution | A guardian who lies (who then becomes a co-accused) |
| **3 · Hardware-signed events** | P-256 keys in Android Keystore, with attestation stored | Emulators, rooted phones, scripted sensor feeds | A real scream in a real room |
| **4 · Public time before the transfer** | Every check-in outcome is anchored to Hedera within seconds | "The record was written after the transfer" | The truth of the event |
| **5 · History is part of the record** | Guardian changes, cancels and prior alerts are all chained | Hiding a switch-off or a pattern | A first-time fraudster |
| **6 · People decide consequences** | The record is one input to a human adjuster or bank officer. Nothing pays out or gets rejected automatically | Machine verdicts in either direction | Bad human judgement (which is itself audited) |
| **7 · Absence is not evidence** | Written into every partner agreement: **no claim is rejected because a VUKA record is missing** | Punishing a genuine victim whose phone was dead, off or not armed | — |

**Corroboration levels** (`docs/VUKA-2-SPEC.md` §3): C0 device signal → C1 + user check-in → **C2 + independent human signature (the minimum for any claim)** → C3 + an institution's record. The one-line rule for a claim-grade record: **three independent signatures and one public timestamp, before the money moved.**

---

## 4 · Scenarios

| # | Scenario | What happens | What ANCHOR proves | Outcome |
|---|---|---|---|---|
| **S1** | Genuine express kidnapping, bank linked `SIMULATED` | Scream detected → "Journey check" → duress PIN; the screen shows the normal outcome → guardians alerted → `sim_bank` holds new beneficiaries with routine wording → guardian calls 10111 | Signal and check-in anchored seconds later, **before** the transfer attempt | Money mostly doesn't leave. If it did, the ordering is provable |
| **S2** | Staged "clean room" | An accomplice screams; a transfer is made; a claim is filed | Only what was fed in, plus the history | Bank linked: the duress hold blocks their own payout. Not linked: no independent witness, and footage contradicts the story. Staging is itself an offence (§2) |
| **S3** | Held past the hour, phone wiped | With data: events left the phone within seconds, were chained on receipt, and check-in outcomes were anchored immediately. **With signal but no data:** events wait on the phone (no device SMS — it would sit in the attacker-readable Sent folder) | The data case survives a wipe | **If there was no data and the phone is wiped before delivery, the events are lost — we say so** |
| **S4** | Phone stolen after the alert | Server and guardian copies survive; recovery re-binds a new device (§9 rules) | Integrity of the surviving copies | Recovery is on the cut line; if cut, no code is shown and we say so |
| **S5** | False alarm (music, children) | Check-in → normal PIN → closed | The cancel is anchored too | Nobody bothered. A later "it was duress" claim contradicts the record |
| **S6** | Forced to enter the real PIN | The attacker watches and demands the normal PIN | That a normal code was entered, not that the person was safe | **A limitation**, in the honesty ledger: normal PIN = "normal code entered", not "safe" |
| **S7** | Abuser as "guardian" | Only the VIGIL user can generate a code, and additions need the PIN. Removal is silent. Location is shared only at signal time | Who was paired, when, with whose code | Closes the stalkerware path |
| **S8** | Attacker forces VUKA changes | A duress PIN at *any* prompt raises the alarm (V6). Removals and deletions look done but do nothing. Additions create a decoy guardian and notify the real ones | The duress signal and the no-op | The attacker sees success; the guardians get the alert |
| **S9** | Phone switched off before anything is detected | Nothing to detect, nothing sent | Nothing | **Nothing escalates** — on the honesty slide |
| **S10** | Guardian calls the victim during a hijack | The guardian screen and SMS lead with "Don't call or text them. Call 10111." Calling unlocks only after `stand_down` | — | Removes the most likely way a well-meaning guardian tips off the attacker |

---

## 5 · What an attacker must never be able to see

- No SMS from the device. Android writes a non-default app's sent SMS into the Sent folder.
- No difference between normal and duress PIN screens, haptics, request shapes or response times (V5; test T15).
- No distinctive public anchor timing. **Every** check-in outcome is anchored immediately, not only duress (ADR-0035).
- No readable event kinds on the public panel for real people. Kinds show only for `sim_` subjects (T19).
- A neutral check-in title: "Journey check", never "Are you safe?".
- **Stated, not hidden:** the Android microphone indicator is visible while a journey is armed. We say **"discreet, not invisible."**

---

## 6 · Banking during duress (ADR-0037)

**VUKA cannot** block a banking app (Android sandbox) or use the Accessibility API to do it (Play policy restricts that API to accessibility tools). It also cannot stop a card, an ATM, a USSD session or another phone.

**VUKA can** send a signed risk signal to a bank that has integrated. **The bank's own systems decide.** In the demo this is `sim_bank`, labelled SIMULATED.

Rules:
1. **Never reveal the duress at the point of coercion.** The US FTC's 2010 report on emergency ATM PINs ⚑ (primary text not yet read; conclusions reproduced from secondary sources) found the idea never deployed and warned it could increase danger to the victim.
2. **Use friction criminals already expect:** new-beneficiary holds, lower limits, "payment scheduled". Precedent: Capitec's Feature Lock already imposes a mandatory 4-hour delay before a locked feature can be unlocked (Capitec blog, 2024).
3. **Explain only after the person is safe.** Release needs a human in a safe place: a branch visit with ID, or a verified call-back.
4. **The bank decides; VUKA recommends.** A small "decoy" withdrawal is the bank's risk call, never ours.
5. **Triggers** (S1 in the spec): never detection alone; immediate on duress PIN; on `no_answer`/`contact_lost` only after guardians were alerted and none sent `stand_down` within 3 minutes.

| Moment | Screen text | Why |
|---|---|---|
| VIGIL after the duress PIN | The same "Checked in ✓ · Journey continues" as the normal PIN | Pixel-identical |
| Bank app, new recipient during a hold | "Payment scheduled. New recipients receive funds after our standard security period." | Routine; not attributable to the victim |
| Bank app, over the lowered limit | "This amount is above your current daily limit." | Seen every day |
| VIGIL once the user is safe | "Your bank placed a protective hold during your alert on [date] at [time]. To release it, visit a branch with your ID or call the number on the back of your card." | The release instruction comes *after* the danger |

---

## 7 · Ideas considered and rejected

| Idea | Why rejected |
|---|---|
| "Entropy correlation" / orchestration-anomaly detector (heart rate, Doppler, sensor chaos) | VIGIL has no wearable. No labelled staged-versus-real data exists, so it would be an **uncalibrated ML claim** — exactly the AI overuse the organisers warned about. A staged real struggle produces chaotic signals anyway. We keep only deterministic checks a person can read: did the signal precede the transfer; do locations agree; when did witnesses sign |
| "Encrypted shards over UDP to three decentralised stores" | Over-engineered, and it doesn't solve the offline case. What we have instead: server (chained on receipt) + guardian phones + anchoring |
| Device SMS fallback | The attacker can read the Sent folder (§5) |
| "Contact your nearest branch because duress was entered", shown during the event | Could provoke the attacker. Kept, but moved to *after* safety (§6) |
| Blocking banking apps via Accessibility | Play policy; banking trojans abuse exactly that route |
| Pitching "we push criminals toward physical crime" | Guerette & Bowers (2009, *Criminology* 47(4)): displacement appeared in 26% of observations and the opposite effect, diffusion of benefits, in 27%. Becker (1968) does not address displacement. The claim is unsupported and reads badly |

---

## 8 · Legal hooks (all ⚑ until read from primary text by Ipeleng)

| Law | What it gives us |
|---|---|
| **ECTA 25 of 2002, s15(3)** (primary text read 23 Sep) | A court weighs the reliability of how a data message was generated, stored and communicated; how its integrity was maintained; and how its originator was identified. ANCHOR is built to those factors. Say **"built to maximise the ECTA s15 reliability factors"**, never "court-admissible" |
| **Cybercrimes Act 19 of 2020, ss8–9** | Staging = cyber forgery/uttering; a payout = cyber fraud |
| **RICA 70 of 2002, s1 "intercept"** (primary text read 23 Sep) | Interception needs a *communication* whose contents are made available to someone other than the parties. On-device classification of ambient sound, with nothing stored or transmitted, very likely falls outside it. This is our reading, not an opinion — counsel question stands (`docs/RICA-POSITION.md`) |
| **POPIA s1 "biometrics"** | Covers "voice recognition", meaning identifying *who* is speaking. YAMNet classifies *what sound* occurred and identifies nobody. The 3-second buffer is still personal information while it exists, so minimality applies |
| **UK PSR APP reimbursement (from 7 Oct 2024)** | The comparison model: reimbursement is the default, with a high "gross negligence" bar. VUKA's record lowers the cost of investigating a claim; it is **not** a new bar victims must clear |
