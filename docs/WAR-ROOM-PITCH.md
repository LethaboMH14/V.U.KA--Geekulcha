# VUKA — War Room Pitch

> **Spoken target:** 3–5 minutes (war room). **Actual: 765 spoken words (~5.1 min at 150 words/min).** One job per beat.
> **Companion files:** `context.md` · `pitch-deck-outline.md` · `docs/reviews/ANCHOR-ACCESS-MODEL-ADR-PROPOSAL.md`.
> **Read `docs/MASTER-CONTEXT.md` §2 for the judging criteria** (I 15 · T 15 · U 10 · S 10 · B 15 · Q 5).
> **Revision 2 (26 Sep, evening):** aligned to the war-room mentor feedback below, and to the app we ship (Mutarisi's native Android app, `feature/integrate`). Babatunde's structure, sources and economics are kept. Lines the build cannot back were corrected; the list is under "Lines removed from revision 1".

## Mentor feedback, and where each point is answered

War-room session, 26 Sep, mentor Katleho Madaba (Boxfusion). Feedback as written on the card:

| # | Mentor point | Answered in |
|---|---|---|
| M1 | "Great innovative idea" | Kept: Beat 5 (two halves, one record) is unchanged in substance |
| M2 | How do you tell **daily distress** from **genuine distress**? | **New Beat 4B**, plus the measured numbers in Part 2 |
| M3 | Specify it's **Android only for now, not iOS** | Beat 3 (one line) and Part 2 |
| M4 | Mention how **users' privacy** is considered | **New Beat 4D** |
| M5 | "Seeing an **MVP** of the app would have been the cherry on top" | **New Beat 4C**: the live app on a phone, plus the download QR on the slide |
| M6 | Give us a **story line** with the problem statement | Beats 1–2 rewritten as one person's evening, same facts |

## Beats

| Beat | Job | Criterion |
|---|---|---|
| 1 · Story | One person, one evening: the problem as it happens | I, B |
| 2 · Problem | Why nothing today fixes it | I, B |
| 3 · Solution | What VUKA is, and that it's Android today | I |
| 4A · How it works | Activate, listen, ask | T, U |
| 4B · Everyday noise vs real distress | The mentor's question, answered with the mechanism | T, U |
| 4C · The MVP | Show it, live | U, T |
| 4D · Privacy | What we never keep | S |
| 4E · The record | Where it lives; one matched record | T, S, B |
| 5 · Why it works | Two halves, one record | I, T |
| 6A · The money | Who pays, how much | B |
| 6B · Why the insurer pays | Fake claims: the claim and the proof | B, I |
| 7 · Compliance | Deployability, ECTA | S, B |
| 8 · Ask | Confident close | B |

---

## Part 1 — The Pitch

### Beat 1 — Story

*(Illustrative story, not a case. Say "imagine", never "this happened to".)*

Imagine Thandi. Friday, 7 pm, outside a mall in Pretoria, two men get into her car. No weapon shown. They hold her phone to her face, it opens, and she types the amount they tell her. Then an ATM for the daily limit, and a street she doesn't know.

On Monday the bank shows her the transaction: her phone, her face, her PIN. Her insurer asks for proof she was forced. She has none. Her word, against a payment that says she did it.

### Beat 2 — Problem

That's coerced transfer; at its worst, express kidnapping. The bank holds the transaction, not the duress. The insurer can't tell Thandi from someone who made the story up, so it pays a fraudster or fights a real victim. And every tool fails her: a panic button needs a free hand, a bank's duress PIN works inside one bank, a fraud score is a guess after the fact.

### Beat 3 — Solution

VUKA notices duress without a button, and proves when it happened, so a bank or an insurer can check the record without trusting us. It's an Android app today. Not iOS yet: iOS doesn't let an app keep listening in the background the way Android does.

### Beat 4A — How it works

Before a trip that feels risky, Thandi taps **Activate**. That's the last button. VIGIL listens on the phone for a scream, a shout, breaking glass or a gunshot. It doesn't wait to be asked. But it doesn't raise an alarm on a sound either. It asks her first.

### Beat 4B — Everyday noise vs real distress

So how does it tell a loud Friday night from a real emergency? A sound alone never alerts anyone. It opens a quiet **Journey check** on her screen. If she's fine, she enters her normal PIN and nothing is sent. If she's being watched, she enters her **duress PIN** instead. The screen looks exactly the same, and her guardians are alerted silently. If nobody answers, her guardians are alerted too. So a dropped glass costs her one PIN, and a real emergency reaches a person. The machine never decides on its own that she's in danger.

### Beat 4C — The MVP

*(Show it on the phone. The download QR is on the slide.)*

This is the app, live. I tap Activate. [Glass or shout.] The Journey check opens. I enter the duress PIN: same screen, same "Checked in". On my teammate's phone, the guardian alert arrives, with a button that opens the dialer on 10111. And every step is already in my record.

### Beat 4D — Privacy

What we never keep: audio. The sound is judged on the phone in a three-second buffer and thrown away. Only a label like "Glass" is written down. Listening only happens after Activate, with a notification showing the whole time. Nothing personal goes on the public ledger, only a fingerprint. And she can delete her data: the content goes, the fingerprint stays, so nobody can pretend the record never existed.

### Beat 4E — The record

Every step is signed on her phone, chained, and a 32-byte fingerprint is anchored to a public ledger. She does nothing extra. The record she holds is the same chain a bank, an insurer or a court would audit.

### Beat 5 — Why it works

This problem has two halves: noticing the duress, and proving it. Detection tools notice, but leave nothing a bank can act on. Evidence tools prove, but can't notice. Everybody owns one half. VUKA notices with nothing pressed at the moment it matters, and proves when it happened, in one record anyone can verify.

### Beat 6A — The money

Two people pay. The victim pays nothing. The insurer pays twenty rand per member, per month. The bank pays per case, against about five thousand rand to fight one dispute at the Ombud. Both pay because it saves them more than it costs. Those prices are our proposal; the pilot tests them.

### Beat 6B — Why the insurer pays

Today a coerced-transfer claim is a story, so the insurer pays blind or fights blind. With VUKA, a real coercion leaves a record made at the time, which can't be backdated or quietly edited. A made-up claim doesn't have one, and a missing record is never held against anyone. Testing claims pays: ASISA members prevented R1.4 billion of fraud in 2024.

### Beat 7 — Compliance

We use an existing public network. No token, no customer crypto, no money moved; only a fingerprint touches the ledger. The record is built to maximise the ECTA section 15 reliability factors. Our reading is that no financial-services licence is needed; counsel is confirming.

### Beat 8 — Ask

Here's what we want from this room. One insurer, five thousand members, twelve months: let's measure what this is worth. One bank, so we can cost a single dispute. And if you know the person who owns this problem, introduce us. We're not asking you to believe us. We're asking you to check us.

---

## Part 2 — Q&A Prep (not spoken)

### Everyday noise vs real distress: the full answer (M2)

**The mechanism** (the shipped app, `feature/integrate`, `app/src/main/java/za/co/vuka/app/detect/`, and the server):
1. **Listening only after Activate**, as a foreground service with a visible notification. Deactivate needs the PIN.
2. **Each sound class has its own bar** (for example Screaming 0.45, Shout 0.60, Glass 0.35). A gunshot must also beat its look-alike neighbours. `DetectionEngine.kt`, ruleset "vigil-detect v2 (uncalibrated)".
3. **Voices need about 1.5 s**: two windows that share no audio must both clear the bar. Glass and gunshots count in one window.
4. **One check-in at a time**, and no second check-in within 30 s.
5. **A sound only opens a check-in.** Normal PIN: nothing goes to guardians. Duress PIN: identical screen, guardians alerted (`server/event_effects.py`, `duress_pin` → alarm). No answer: the server waits 60 s plus a 30 s grace, then alerts guardians (`server/escalation.py`, `PROPOSED` timings).
6. **The machine never decides.** The most a sound can do is ask the member. A person (the member or a guardian) makes every consequential decision (D13).

**The numbers.** Say them if asked, and don't round them up. `FACT`, measured 26 Sep, `docs/eval/cem1-measurements.md` on `feat/lethabo-vigil-events`. Same YAMNet model and the same V4 rules as the shipped app:

| Public test set | What it measures | Result |
|---|---|---|
| FSD50K eval, Glass (n = 139) | a check-in opens | 46.0% |
| FSD50K eval, Gunshot (n = 108) | a check-in opens | 54.6% |
| FSD50K eval, Shatter (n = 70) | a check-in opens | 72.9% |
| FSD50K eval, **Screaming** (n = 108) | a check-in opens | **6.5%** |
| ESC-50 everyday sounds | false check-ins per hour of audio | 1.8 (folds 1–3) · 7.3 (folds 4–5) |

- **Screams are mostly missed**, and we say so. Most scream clips in the test set are too short for the 1.5 s voice rule. That's the designed trade-off (a short scream is missed so a short shout doesn't prompt), and it's now measured.
- **The false-check-in rate is a stress test, not a field rate.** ESC-50 is back-to-back isolated sounds, far denser than a real evening. A field rate needs venue recordings, which we haven't made.
- **Thresholds are UNCALIBRATED starting values.** A tuned setting was tried and didn't hold up on held-out data, so nothing was changed.
- **When the sound is missed:** the duress PIN at a check-in, the Emergency button and the Quick Settings tile all work without any sound being detected.

### Android only (M3)

- **Android only for now.** VIGIL keeps the microphone open in the background during an active journey. Android allows that through a foreground service with a visible notification; iOS doesn't allow it at the depth needed (locked decision D2).
- **minSdk 24 (Android 7.0), targetSdk 37** (`app/build.gradle.kts`).
- **Tested so far on the Android emulator.** The physical-phone run is on the demo checklist below. Don't say "tested on phones" until it's done.
- **Don't quote an Android market share on stage** unless a sourced figure is added to `docs/EVIDENCE.md` first.

### Privacy (M4): the detail behind Beat 4D

- **No audio stored**, anywhere. The ring buffer is three seconds and zeroed as it goes (`AudioPipeline.kt`). YAMNet gives a label and a score on the phone.
- **What goes to our server:** signed events (activated, a sound class, check-in opened, the check-in outcome, guardian acknowledgement). Payloads are encrypted at rest with a **server-held key** today. A victim-held key is `PROPOSED`, not built.
- **What goes on the public ledger:** a 32-byte Merkle root. No identity, no content.
- **Guardians** get the alert, not a copy of the record (a guardian-held backup is `PROPOSED`).
- **Sign-up details:** the server account API that stores email, phone and names encrypted is on `feature/integrate` but **not deployed to Azure**. Don't describe server accounts as live.
- **Deletion:** payload removed, hash retained (ADR-0023). POPIA Information Officer registration is **pending**, so say "built for POPIA", never "POPIA-compliant".
- **Location:** this build doesn't share location. Don't claim it.

### MVP (M5): demo checklist

| Step | Status before going on stage |
|---|---|
| App installed from the release link on two phones | ☐ |
| Member phone: sign up, both PINs set, guardian invited | ☐ |
| Guardian phone: enrolled with the invite code | ☐ needs `/v1/guardians/accept` to return 201 on Azure. It returned 503 earlier on 26 Sep (server signing key); Sibusiso holds the fix |
| Activate → a glass or shout sound → Journey check opens | ☐ |
| Duress PIN → identical "Checked in" → guardian alert arrives on the second phone | ☐ Alerts arrive while the guardian app is open; FCM push isn't wired yet |
| Record screen shows the signed events | ☐ |
| **Fallback:** a recorded video of the same run | ☐ |

### Proof bank: every claim mapped to its source

| Pitch line | Source |
|---|---|
| Express kidnapping / forced transfer; she authorises it under threat | NFO and iTOO descriptions (FAnews, 19 Sep 2024); OBS Annual Report 2022 |
| She can't prove coercion; a reported victim was refused a refund | NFO express-kidnapping case, via FAnews, 19 Sep 2024 |
| "Thandi" | **Illustrative composite** of the cases above. Not a real person, not a case |
| The bank holds the transaction, not the duress | Mechanism; SABRIC 2025 (banking app ≈89% of digital-banking-crime cases) |
| Insurers lose to fraudulent claims | ASISA 2024: 16,520 fraud/dishonesty cases detected; R1.4bn prevented; R131.6m lost |
| Banking disputes rising, slow, costly | NFO Annual Report 2025 (743 formal cases/month, +25.4%); OBS 2024 (R4,962.38/formal case); The Citizen, 16 Mar 2026 (~61 days) |
| A panic button needs a free hand | Namola ("hold for 2 seconds"); FNB GuardMe ("push the mobile panic button") |
| A bank's duress PIN only works inside that bank | Discovery Bank Panic Code, MyBroadband, 27 Mar 2025 |
| A fraud score is after the fact | Verisk ClaimSearch, FRISS, Shift Technology (claim-scoring, not evidence) |
| Half the market detects, no proof | Google Personal Safety; Apple Check In; Blackline G7 |
| The other half proves, no detection | OpenTimestamps; Bernstein; Truepic / C2PA |
| A sound only opens a check-in; duress PIN identical; no answer → guardians | `DetectionEngine.kt`, `CheckinActivity.kt`, `server/event_effects.py`, `server/escalation.py` |
| Detection numbers | `docs/eval/cem1-measurements.md` (FSD50K eval, ESC-50) |
| No audio stored; 3 s buffer | `AudioPipeline.kt`; locked decision D7 |
| A 32-byte fingerprint to public ledgers (Hedera + Bitcoin) | `docs/VUKA-2-SPEC.md` §10; ADR-0035. **No Hedera root confirmed from the Azure server yet** (topic 0.0.10687280 held manifest messages only on 26 Sep). Say "anchored", not "live on Hedera", until a root is on the topic |
| Nothing personal on the ledger; deletable | spec §10 and §13; ADR-0023 |
| R20 per member/month (`ASSUMPTION`); per-case fee `PROPOSED`; break-even 10,973 at R20 (`ESTIMATE`); anchors: GuardMe R19.90 (FNB, Apr 2022), iTOO R22.50 | `scripts/economics_vigil_anchor.py`; `docs/ECONOMICS-VIGIL-ANCHOR.md`; `docs/EVIDENCE.md` |
| Not a financial service; no crypto; no tokens | ADR-0034/0035; `context.md`. Our reading, counsel to confirm |
| Built for the ECT Act | ECTA 25 of 2002 s15(3)(a)–(c) |

### Lines removed from revision 1, and why

| Removed | Why |
|---|---|
| "Nothing to press. Nothing to enter." | The member taps Activate and answers a check-in with a PIN. Replaced by "Activate is the last button" and the check-in explanation |
| "It goes to their phone, and to their guardians' phone — so it survives if the phone is stolen." | Guardians receive the alert, not a copy of the record (`PROPOSED`) |
| "…and they hold the key." | The payload key is server-held today. A victim-held key is `PROPOSED` |
| "We know exactly what counts as a duress signal — defined by law, confirmed with duress experts." | No source in the repo. Bring it back only with a named expert and the legal source |
| "it is POPIA-compliant" | Information Officer registration is pending. Use "built for POPIA" |
| "impossible to fake later" | We claim tamper-evident, not tamper-proof: "can't be backdated or quietly edited" |
| "there is nothing to license" | Our reading, not a clearance. Counsel is confirming it |
| "it flags three things: the location…" | This build doesn't share location |
| "The bank pays fifteen rand per case" | Per-case fee is `PROPOSED`; the spoken line now says "per case" and names it as our proposal |

### How fake claims work, and what VUKA actually changes
- **Today, a coerced-transfer claim is just a story.** Someone says they were forced. There's no record of the coercion. The insurer has only their word, a police case (which can be fabricated), and a bank transaction that shows the transfer was **authorised**. So the insurer **pays blind, or fights blind.**
- **VUKA doesn't prove the duress was real.** The anchor proves *when*, not *what*. It's **not a lie detector.** It gives the claim **a record made at the time**, signed by the device and anchored so it **can't be backdated or edited without detection**.
- **For a real victim:** the insurer can verify the timeline and settle faster and cheaper.
- **For a faker:** to match, they'd need the same signed, anchored record from the moment it happened: the app activated, a real detection or check-in, a device key signing it. Because the anchor locks the story early, their account also has to survive **every other record** (CCTV, cell towers, the bank's own device fingerprint). Faking becomes harder and riskier; some fakes are deterred or caught.
- **The line we never cross:** the **absence** of a VUKA record is **never** evidence against a claimant. A genuine victim whose phone was off must not be penalised. **VUKA is a verification input, not a verdict.**
- **So the insurer's saving** is fewer fakes paid (deterred or caught) **plus** genuine claims settled faster and cheaper. Both are **pilot measurements, not promises.**

### How each stakeholder makes or saves money (the honest mechanism)
- **The money is gone.** Once a coerced transfer settles and the criminal withdraws it, VUKA **doesn't recover it**, and we never claim to. The value is *before* and *around* the payout, not the stolen cash.
- **Both payers still profit without recovering a cent.** The insurer saves the value of the **fake claims it would otherwise pay** (plus handling time). The bank saves the **cost of the disputes it no longer escalates** (plus customer churn).
- **Why it has to be on the whole book (the logic, not a demand).** A fraudster won't opt into a test. If VUKA were optional, the people most likely to fake a claim would be the ones who don't have it. So the insurer extends it across the book, the way cover is conditioned on a working device. On the whole book, a claim **without** a record is the exception, not a loophole.
- **The insurer's actuary test:** it saves more than twelve times the price per member, per year. The pilot measures it.
- **The bank saves** because a verified record **resolves a dispute without escalation**: an Ombud case costs the system **~R4,962** and **~61 days**, and **disbelieved customers leave**. The bank isn't liable for the loss today (no mandatory reimbursement in SA), so its cost is dispute handling and churn, not the stolen money.
- **Where money can still be saved:** the **PROPOSED bank protective signal** (ADR-0037) would let the bank hold new-beneficiary or large transfers on a duress signal. It's partner-dependent and **not live**.
- **The victim** gets the proof and, where covered, faster reimbursement.

### Governance tokens and deployment economics
- **We issue no token**: no governance token, no coin, no ICO. Hedera is governed by its council; there's nothing to trade. A token would add securities, tax and AML exposure for no product benefit (ADR-0034/0035).
- **The only token involved is the network's own utility token (HBAR)**, held in small quantity to pay message fees. That's an operating cost, not a security, and not a CASP activity (no advice, intermediary, exchange or custody).
- **Deployment cost is bounded and fixed:** the anchoring ceiling is **R569.47/month** at any member count (`ESTIMATE`, spec §10): hourly roots ≈ R9.34/month (720 × $0.0008 × R16.2075), immediate roots capped ≈ R560.13/month; OpenTimestamps → Bitcoin is free. Printed by `scripts/economics_vigil_anchor.py`.

### POPIA / ECT Act detail (kept out of the pitch)
- **POPIA s26:** biometric information (read to include voice and video) is *special personal information*; a duress event is personal information. **Nothing personal or biometric goes on-chain.** Correction and deletion at **ss 24–25**; deleting the off-chain payload is the erasure mechanism. Information Officer registration is **pending**.
- **ECTA s15(3)(a)–(c):** weight turns on how the record was generated, how its integrity was maintained, and how the originator was identified. Never say "court-admissible". Say **"built to maximise the ECTA s15 reliability factors."** Attestation is **`stored_unverified`** (gap G32).
- **Access model:** the public hash is open to anyone. The payload is encrypted with a server-held key today. Bank, insurer and court access are `PROPOSED` (no endpoint). Guardians receive alerts only. The record the victim holds and the record an auditor checks are the same chain.

---

*Spoken word count:* Part 1 minus headings and the italic stage directions, counted by script on 26 Sep; re-count after any edit.
