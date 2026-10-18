# 3 · Stronger distress signals, lawful and comfortable

> **E-Hub insight 3 (15 Oct 2026):** *"We need to strengthen the signs of distress that trigger VUKA. The technology behind that must be lawful and people must be comfortable with having it on their phone."*
> **Status:** the inventory is `FACT`, read from the code and eval files on 18 Oct 2026. Everything in §4–§6 is `PROPOSED`. Legal statements are **the team's reading, not legal advice**. Statutory wording was read only through secondary sources (law-firm notes, a law-journal note), because the cloud session couldn't open the Acts. Android platform rules were read directly on developer.android.com (`FACT`).
> **Unchanged principles:** machines notice, people decide (ADR-0034); no generative model, RAG or agent framework (ADR-0038). Serves T, S, U.

---

## 1 · The honest starting point

| Signal | Measured (method, n) | Source |
|---|---|---|
| **Screaming** opens a check-in | **6.5%** of clips (FSD50K eval, ruleset v2, **n = 108**). 27 of the 108 are too short to ever confirm under the 1.5 s voice rule | `docs/eval/cem1-measurements.md` |
| Glass | 46.0% (FSD50K, n = 139); ESC-50 held-out 11/16 (68.8%), ruleset v1 | same; `docs/EVIDENCE.md` |
| Shatter | 72.9% (FSD50K, n = 70) | same |
| Gunshot | 54.6% (FSD50K, n = 108) | same |
| Shout / yell | **Not measured** (ESC-50 has no shouts) | `docs/EVIDENCE.md` |
| False check-ins | 1.8–7.3 per hour on ESC-50 everyday sounds at the prompt level. **A dense lab proxy, not a field rate** | `docs/eval/cem1-measurements.md` |
| Field false alarms, latency, battery, continuity, delivery, false `no_answer`, motion, duress-PIN recall under stress | **Not measured** | `docs/EVIDENCE.md` (M2–M8) |

**What this means:**
- **A real scream is usually missed**, and the phone may prompt more often than people will tolerate. `ESTIMATE`: if the lab rate held in daily life (unknown, probably not), a 16-hour active day would bring roughly 74–264 check-ins. ADR-0046 itself estimates "on the order of 90 PIN checks a day".
- **The product still holds up**, because the duress PIN, the Emergency button and the Quick Settings tile all work with no sound detected.
- **Comparable products follow one pattern.** Google's and Apple's crash detection and emergency SOS, Life360, Noonlight, Namola and AURA are each either pressed, armed by the user (a timer, a journey) or limited to a context (driving), and confirm with a countdown. **None is known to listen to ambient sound all day for distress** (`REPORTED`, from recall; verify before quoting).

The FSD50K results (26 Sep) are not yet in `docs/EVIDENCE.md`, and `docs/NEW-CHAT-HANDOVER.md` still says screams and gunshots are unmeasured. Promoting them is step 1 in §4.

## 2 · Every signal VUKA has today

| Signal | Status |
|---|---|
| **Sound:** screaming, shout/yell, glass, shatter, breaking, gun-like (with look-alike exclusions). YAMNet on the phone; a 3 s in-memory ring buffer; nothing stored or sent but a label and score | built (`main`); thresholds `UNCALIBRATED` |
| **CEM-1 graded evidence:** quieter sounds become record-only evidence, and context sounds (TV, crowd, children, laughter) count against a prompt | built in the app; ADR-0047 Proposed |
| **Motion** (impact, snatch, shake) as corroboration only; never opens a check-in alone | built; not measured |
| **PIN behaviour** (a retry, unusually slow entry) as evidence after a check-in | built; not measured |
| **Emergency button and Quick Settings tile** (the member asks for a check-in) | built; ADR-0049 Proposed |
| **Wrong PIN at a check-in:** a guardian heads-up, never duress | app on `main`; server on a branch |
| **Duress PIN at any prompt** | built, **except at sign-in and at sign-out with listening paused** (known defects, D6) |
| **`no_answer`** (about 70 s) and **`contact_lost`** (90 s without heartbeats) | on the server branch; `contact_lost` is **off by default** |
| **Power-button help** (4 presses in 3 s) | draft PR #114, native app only, not run on a device |
| **Ruleset v3** (lower voice bars; short shouts confirm) | open PR #124; changes requested by Lethabo (14 and 16 Oct); short-call recall not measured |
| Trigger words, Bluetooth drop, route deviation | parked |

## 3 · Lawful: where the reading stands

### 3.1 RICA (interception)

**What the Act says** (`REPORTED`, secondary quotation: *Obiter* law-journal note; Cliffe Dekker Hofmeyr, 24 Feb 2026):
- "Intercept" means acquiring the **contents** of a communication *so as to make some or all of them available to a person other than the sender or recipient*.
- **s4** lets a party to a communication intercept it. For a conversation held in person, a "party" includes anyone in whose immediate presence it happens and who can hear it.
- **s5** allows interception with a party's prior written consent.

**The team's reading** (`ESTIMATE`, for counsel):

| What VIGIL hears | Risk | Why |
|---|---|---|
| Glass, gunshots, impacts | **Low** | Not a communication between people at all |
| A scream or shout, label only | **Low to moderate** | It may be a communication. Only a label and score leave the phone, and nothing is made available to anyone as audio. The member, carrying the phone, is a party under s4 |
| Keyword spotting ("safe word") | **Moderate to high** | Decoding words is its purpose |
| Any audio recording or upload | **High** | Also a POPIA question about content |

- **The s4 backstop only holds while the member is with the phone.** A phone left on a table under "listening until paused" (ADR-0046) loses it. This bears directly on D7 (§6).
- **No South African court decision or commentary was found** on on-device sound classification or always-listening phones (`FACT`: searched 18 Oct 2026).
- **The RICA Amendment Bill** was referred back by the President in Nov 2024 and was still on a committee agenda in Feb 2026; it concerns state interception (`REPORTED`).
- The AmaBhungane judgment was delivered on **4 Feb 2021**; `docs/RICA-POSITION.md` says 3 Feb. That is a one-line correction for that document's owners.

### 3.2 POPIA

| Question | Reading | Open |
|---|---|---|
| **Lawful basis** | The member's consent (s11(1)(a)), plus processing that "protects a legitimate interest of the data subject" (s11(1)(d)), which survives a withdrawal of consent but can be objected to (`REPORTED`, secondary) | Information Officer registration prepared, not submitted; privacy notice is a draft |
| **Biometrics** (s26–s33) | POPIA defines biometrics as a technique of *personal identification*. Classifying **what** sound occurred is not biometric; matching **whose** voice it is would be (`REPORTED`, secondary ×3). This supports `docs/security/POPIA-ONE-PAGER.md` | A speaker-matched "safe word" would need a s27 ground. Whether the PIN-timing baseline is a "behavioural characterisation" used to identify someone needs counsel |
| **Location** | Ordinary personal information, not special (`REPORTED`, secondary). ADR-0048 calls it "special to the member", so align the wording | — |
| **Prior authorisation** (s57) | Processing information on criminal behaviour **on behalf of third parties** needs the Regulator's prior authorisation (Regulator guidance note, Mar 2021, `REPORTED`). **Incident records processed for a bank or insurer could fall under it** | A new counsel question for the B2B track ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)) |
| **Automated decisions** (s71) | A decision with substantial effect may not rest solely on automated profiling, without safeguards. A guardian alert is low risk. **An automatic bank action on a duress PIN, or insurer pricing from VUKA events, is in scope**: it needs a human step, or a contract that lets the member make representations | No s71 analysis exists in the repo |
| **Cross-border** (s72) | The server ran in **UAE North**, with no documented basis; the notice still says South Africa North. South Africa publishes no adequacy list | Move region, or document the basis |
| **Never record** | Attacker descriptions, voices or number plates: criminal-behaviour special personal information | — |

**Enforcement:** no Information Regulator action against a safety or tracking app was found (`REPORTED`).

### 3.3 Android and Google Play (`FACT` from developer.android.com, 18 Oct 2026, unless tagged)

- **Listening can't be switched on remotely.** From Android 14, a microphone foreground service can't be started while the app is in the background, apart from narrow exemptions (a notification or widget tap, among others). So a guardian or the server can't turn VUKA's listening on: **a comfort property worth saying out loud** once a device test confirms it.
- **The microphone indicator** appears whenever an app uses the microphone (Android 12+). The device-wide microphone toggle hands apps **silent audio** and rate-limits motion sensors. VUKA must detect that and tell the member.
- **Battery-optimisation exemption:** Android's Doze documentation lists "Safety app: apps that keep their users and their families safe" as an acceptable case.
- **Play blockers:**
  - target API 36 is required from 31 Aug 2026 (VUKA targets 34);
  - the guardian standby's `dataSync` service is capped at 6 hours in 24 on Android 15;
  - `USE_FULL_SCREEN_INTENT` is limited to calling and alarm apps.
  - See [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §2.
- **The power button:** a 5-press Android Emergency SOS also crosses VUKA's draft 4-press threshold, so both fire.
- **Monitoring policy:** Play bans apps that monitor another person except declared parental or enterprise tools (`REPORTED`). VUKA is started by the member, about the member, with location time-boxed after a check-in. That reads as personal safety, but stays an `ASSUMPTION` (Q-C6) until a Play review.
- **From 27 Jan 2027**, geofencing is no longer an approved foreground-service use, and the location button becomes the recommended minimum scope for precise location.

## 4 · Stronger signals, in order (`PROPOSED`)

Each passes the four gates in `docs/MASTER-CONTEXT.md` §10 before it ships, and none decides a consequence on its own.

1. **Measure before adding.**
   - Run the existing FSD50K harness on v2 against v3 (PR #124) for screams and shouts: tune on even clip ids, validate on odd ones.
   - Record a **consented** corpus of short calls in South African languages and accents ("Help!", "Nceda!", "Thusa!", "Help my!").
   - Run the venue false-alarm curve (taxi rank, TV, sport), and battery and continuity on a budget 2–3 GB phone.
   - Publish to `docs/EVIDENCE.md` with n.
2. **"Check on me" timer: the first new signal.** The member sets an arrival time. If the journey isn't ended with a PIN by then, the normal check-in opens and the existing `no_answer` path follows.
   - Run the timer **on the server**, so Doze can't delay it, and deliver it by high-priority push.
   - It covers freezing, whispered threats and silence, which no sound rule catches.
   - It uses no audio, has the lowest legal and comfort risk, and mirrors Google's Safety Check and Apple's Check In (`REPORTED`).
   - It needs a new `sense` value and an ADR, as ADR-0049 did.
3. **A scream-specific rule:** one window at a higher bar, alongside PR #124's shorter voice confirmation, aimed at the 27 short clips. Detection-threshold changes need **two-operator sign-off** (ADR-0036(8)); record it.
4. **Content-free tamper signals, only while armed or in an open incident:** shutdown, airplane mode switched on, the SIM removed, plus battery level and network type in the heartbeat. They feed `contact_lost` and guardian context, never a consequence alone. Turn `contact_lost` on once heartbeat continuity is measured.
5. **Media playing on the phone counts against a prompt.** A scream in the member's own video is the commonest everyday false alarm, and "is media playing" carries no content. Cheap.
6. **Use YAMNet classes already weighted but never mapped:** smash/crash, tyre squeal and car alarm as supporting evidence; fireworks and children shouting as evidence against a prompt. Same model; nothing new leaves the phone.
7. **Motion: also look 10 s after a sound** (a grab after a scream), and add a "phone thrown" pattern. Still corroboration only; measure first.
8. **Optional false-alarm labelling** after every check-in, identical for both PINs ("What was it? TV / sport / kids / skip"). Answers after a duress PIN are ignored. This is the consented field-calibration data insurers will ask for.
9. **Bank-side signals during an open incident** (offer N1 in [`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)): a new beneficiary, a large transfer or a limit increase raise the evidence level only; the bank decides. Gated by G36–G38 and s71.
10. **Avoid:**
    - **keyword spotting and any speaker or voice ID**, until a written counsel opinion and a new ADR;
    - **fall detection** (an inferred injury may be health information; real-world accuracy is poor);
    - **struggle detection from motion** (no field evidence);
    - **continuous route learning for hijacking** (location profiling, s71, heavy Play review). Use the member-declared timer instead.

## 5 · Comfortable: fixes that come before any new signal

- **Fix the duress defects at sign-in and sign-out** (D6, [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §4).
- **Tell the member when listening stops:** if Android kills the service (`START_NOT_STICKY`), or if the microphone toggle hands the app silent audio.
- **Correct the onboarding promise.** "Your guardians only hear from VIGIL if you don't answer, or if you use your duress PIN" is incomplete: a wrong PIN also sends a heads-up.
- **Measure pocket presses** of the one-tap Emergency button, or restore a hold.
- **Publish commitments people can hold us to:**
  - VUKA never sells location or derived data (an earlier family-locator app's location-data sales became a scandal; `REPORTED`, from recall);
  - guardians can never switch listening or location on;
  - the member can remove a guardian at any time;
  - the duress PIN never reveals itself.
- **Rewrite the privacy notice** for what the app does now, and **refresh the RICA paper** for a personal phone and bystanders. Send counsel:
  - whether a label-only output "makes contents available";
  - whether the provider can rely on the member's s4 position;
  - whether in-app consent is s5 written consent;
  - s57;
  - s71;
  - the s72 basis.
- **Ask people.** No peer-reviewed African study on accepting listening safety apps was found. Run a small, consented comfort study (for example, women who commute), with n stated.

## 6 · Decision D7: the default listening model

ADR-0046 (listening from set-up until paused with a PIN) is built in the app but still **Proposed**. It conflicts with the honesty ledger's "journey mode, not always on" and with the privacy notice, while the app says "Listening on this phone, all the time".

| Option | For | Against |
|---|---|---|
| Accept ADR-0046, said plainly (*"listens while active, until you pause it with your PIN; a restart stops it"*) | Nothing to remember before a bad moment | Battery and false check-ins unmeasured; the RICA s4 backstop is lost when the phone is left alone; no comparable product does it |
| **Journey mode as the default**, with the "check on me" timer | Shorter exposure, fewer prompts, easier consent; Android already requires listening to start on screen; matches every comparable product | The member must remember to start it |
| Member chooses at set-up | Comfort is the member's call | Two modes to test and explain |

**Recommendation, updated by the research: journey mode as the default.** "Listening until paused" becomes an opt-in once battery and false check-ins are measured on a budget phone. Lethabo owns this decision.
