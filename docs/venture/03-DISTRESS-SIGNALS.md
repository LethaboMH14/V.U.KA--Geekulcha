# 3 · Stronger distress signals, lawful and comfortable

> **E-Hub insight 3 (15 Oct 2026):** *"We need to strengthen the signs of distress that trigger VUKA. The technology behind that must be lawful and people must be comfortable with having it on their phone."*
> **Status:** the inventory is `FACT`, read from the code and eval files on 18 Oct 2026. Everything in §4–§6 is `PROPOSED`.
> **Sources and limits:**
> - Legal statements are **the team's reading, not legal advice**. Apart from the RICA "intercept" definition already in `docs/EVIDENCE.md`, statutory wording was read only through secondary sources (law-firm and law-journal notes).
> - Android platform rules were read directly on developer.android.com (`FACT`).
> - Items marked *from recall* were not researched this session; verify them before relying on them.
>
> **Unchanged principles:** machines notice, people decide (ADR-0034); no generative model, RAG or agent framework (ADR-0038). Serves T, S, U.

---

## 1 · The honest starting point

The FSD50K figures below (26 Sep) are **internal until promoted to `docs/EVIDENCE.md`** (§4, step 1). `docs/EVIDENCE.md` still says to quote no figure for screams or gunshots, so don't quote them externally before then.

| Signal | Measured (method, n) | Source |
|---|---|---|
| **Screaming** opens a check-in | **6.5%** of clips at the V4 level, **10.2%** with CEM-1 lifts as built (FSD50K eval, ruleset v2, **n = 108**). 27 of the 108 clips are too short to ever confirm under the 1.5 s voice rule. A trial of shorter voice confirmation (separation 1) did not validate: held-out scream catch 8.8%, false prompts 9.2/h against 7.3/h | `docs/eval/cem1-measurements.md` |
| Glass | Opens a check-in on 46.0% (V4) / 52.5% (CEM-1) of FSD50K clips (n = 139). Separately, **recorded as glass** on 11/16 (68.8%) of ESC-50 held-out clips (ruleset v1) | same; `docs/EVIDENCE.md` |
| Shatter | 72.9% / 75.7% (FSD50K, n = 70) | `docs/eval/cem1-measurements.md` |
| Gunshot | 54.6% / 57.4% (FSD50K, n = 108) | same |
| Shout, yell | **Not measured** (no shout clips in either test set) | `docs/EVIDENCE.md` |
| False check-ins | V4 **1.8–7.3 per hour**; with CEM-1 lifts, as built, **7.3–16.5 per hour**. ESC-50 everyday sounds, folds 1–3 / 4–5, 1–9 prompts per 0.54 h split: **a dense lab proxy, not a field rate** | `docs/eval/cem1-measurements.md` |
| Field false alarms, latency, battery, continuity, delivery, false `no_answer` | **Not measured** | `docs/EVIDENCE.md` (M2–M7) |
| Motion | **Not measured** | `docs/VUKA-2-SPEC.md` (M8) |
| Duress-PIN recall under stress | **Not measured** | `docs/COERCION-SCENARIOS.md` |

**What this means:**
- **A real scream is usually missed,** and the phone may prompt more often than people will tolerate.
  - `ESTIMATE`: if the lab rate held in daily life (unknown, probably not), a 16-hour active day would bring roughly 74–264 check-ins. That assumes 16 h × 4.6/h (v2 V4 on 784 ESC-50 clips, `docs/eval/voice-v3-false-alarms.md` on the PR #124 branch) up to 16 h × 16.5/h (CEM-1, folds 4–5).
  - ADR-0046 itself estimates "on the order of 90 PIN checks a day".
- **The non-sound triggers don't depend on detection**, but they don't protect anyone today. The duress PIN, the Emergency button and the Quick Settings tile all reach guardians only through the server, which has been down since 15 Oct (D9). They also rely on guardian alerts that arrive only while the guardian's app is open. And a duress PIN at sign-in or sign-out raises nothing (D6). Today, only the Emergency button's hand-off to the 10111 dialer works without the server.
- **Comparable products follow one pattern** (`REPORTED`, *from recall*; verify). Google's and Apple's crash detection and emergency SOS, Life360 and Noonlight are pressed, armed by the user (a timer, a journey) or limited to a context (driving), and they confirm with a countdown. Namola and AURA are manual panic buttons. bSafe offers a voice-activated SOS on a phrase the user chooses. None is known to listen to ambient sound all day for distress.

## 2 · Every signal VUKA has today

| Signal | Status |
|---|---|
| **Sound:** screaming, shout and yell, glass, shatter, breaking, gun-like (with look-alike exclusions). YAMNet on the phone in a 3 s in-memory ring buffer. **No audio is stored or sent.** Classification metadata leaves the phone: labels, scores, thresholds and, with CEM-1, evidence tallies and context labels | built (`main`); thresholds `UNCALIBRATED` |
| **CEM-1 graded evidence:** quieter sounds become record-only evidence, and context sounds (TV, crowd, children, laughter) count against a prompt | built in the app; ADR-0047 Proposed |
| **Motion** (impact, snatch, shake), as corroboration only; it never opens a check-in alone | built; not measured |
| **PIN behaviour** (a retry, unusually slow entry), as evidence after a check-in | built; not measured |
| **Emergency button and Quick Settings tile** (the member asks for a check-in) | built; ADR-0049 Proposed |
| **Wrong PIN at a check-in:** a guardian heads-up, never duress | app on `main`; server on a branch |
| **Duress PIN at any prompt** | built, **except at sign-in, and at sign-out while listening is paused** (known defects, D6) |
| **`no_answer`** (about 70 s) and **`contact_lost`** (90 s without heartbeats) | server branch; `contact_lost` is **off by default** |
| **Power-button help** (4 presses in 3 s) | draft PR #114, native app only, never run on a device |
| **Ruleset v3** (lower voice bars; short shouts confirm) | open PR #124; changes requested by Lethabo (14 and 16 Oct); short-call recall not measured |
| Trigger words, Bluetooth drop, route deviation | parked |

## 3 · Lawful: where the reading stands

### 3.1 RICA (interception)

**What the Act says:**
- **"Intercept"** means acquiring the **contents** of a communication *so as to make some or all of them available to a person other than the sender or recipient*. This definition is already in `docs/EVIDENCE.md`, read from the Act on 23 Sep (`FACT`).
- **s4** lets a party to a communication intercept it. For a conversation held in person, a "party" includes anyone in whose immediate presence it happens and who can hear it (`REPORTED`: internet.org.za copy of the Act; Cliffe Dekker Hofmeyr, 2020; Boshoff Inc).
- **s5** allows interception with a party's prior written consent (`REPORTED`: Deale Attorneys; Michalsons).

**The team's reading** (`ESTIMATE`, for counsel):

| What VIGIL hears | Risk | Why |
|---|---|---|
| Glass, gunshots, impacts | **Low** | Not a communication between people at all |
| A scream or shout, classified to a label | **Low to moderate** | It may be a communication. Only classification metadata leaves the phone, and no audio is made available to anyone. The member, carrying the phone, is a party under s4 |
| **Bystanders' ordinary speech**, classified in memory and discarded | **Open** | The commonest input VIGIL processes, and certainly a communication between other people. The position paper doesn't cover it; this is counsel question Q1 |
| Keyword spotting ("safe word") | **Moderate to high** | Decoding words is its purpose |
| Any audio recording or upload | **High** | Also a POPIA question about content |

- **The s4 backstop only holds while the member is with the phone.** A phone left on a table under "listening until paused" (ADR-0046) loses it. This bears directly on D7 (§6).
- **No South African court decision or commentary was found** on on-device sound classification or always-listening phones (searched 18 Oct 2026 through search-engine extracts only; SAFLII and the law library were unreachable).
- **The RICA Amendment Bill** was referred back by the President in Nov 2024 and was still on a committee agenda in Feb 2026. It concerns state interception (`REPORTED`).
- **The AmaBhungane judgment date:** the law library's version id reads 4 Feb 2021, while `docs/RICA-POSITION.md` says 3 Feb (`REPORTED`, via a search extract). Re-open the source before correcting that document; the correction is for its owners.

### 3.2 POPIA

| Question | Reading | Open |
|---|---|---|
| **Lawful basis** | The member's consent (s11(1)(a)), plus processing that "protects a legitimate interest of the data subject" (s11(1)(d)). The latter survives a withdrawal of consent, but the member can object to it (`REPORTED`, secondary) | Information Officer registration prepared, not submitted; privacy notice is a draft |
| **Biometrics** (s26–s33) | POPIA defines biometrics as a technique of *personal identification*. Classifying **what** sound occurred is not biometric; matching **whose** voice it is would be (`REPORTED`, three secondary sources). This supports `docs/security/POPIA-ONE-PAGER.md` | A speaker-matched "safe word" would need a s27 ground. Whether the PIN-timing baseline is a "behavioural characterisation" used to identify someone needs counsel |
| **Location** | Ordinary personal information, not special (`REPORTED`, secondary). ADR-0048 calls it "special to the member"; align the wording | — |
| **Prior authorisation** (s57) | Processing information on criminal behaviour **on behalf of third parties** needs the Regulator's prior authorisation (`REPORTED`, Regulator guidance note, Mar 2021). **Incident records processed for a bank or insurer could fall under it** | A new counsel question for the B2B track ([`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)) |
| **Automated decisions** (s71) | A decision with substantial effect may not rest solely on automated profiling without safeguards. A guardian alert is low risk. **An automatic bank action on a duress PIN, or insurer pricing from VUKA events, is in scope**: it needs a human step, or a contract that lets the member make representations | No s71 analysis exists in the repo |
| **Cross-border** (s72) | The server was last deployed in **UAE North**, with no documented basis. The notice still says South Africa North. South Africa publishes no adequacy list | Move region, or document the basis |
| **Never record** | Attacker descriptions, voices or number plates: criminal-behaviour special personal information | — |

**Enforcement:** no Information Regulator action against a safety or tracking app was found (`REPORTED`).

### 3.3 Android and Google Play

`FACT` from developer.android.com, 18 Oct 2026, unless tagged.

- **Listening can't be switched on remotely.** From Android 14, a microphone foreground service can't be started while the app is in the background, apart from narrow exemptions (a notification or widget tap, among others). So a guardian or the server can't turn VUKA's listening on. That is worth saying out loud, but **only after a device test confirms it**.
- **The microphone indicator** appears whenever an app uses the microphone (Android 12+). The device-wide microphone toggle hands apps **silent audio** and rate-limits motion sensors. VUKA must detect that and tell the member.
- **Battery-optimisation exemption:** Android's Doze documentation lists "Safety app: apps that keep their users and their families safe" as an acceptable case.
- **Play blockers:**
  - Play requires target API 36 from 31 Aug 2026; VUKA targets 34.
  - The guardian standby's `dataSync` service is capped at 6 hours in 24 for apps targeting API 35 or higher, which VUKA will hit as soon as it moves to API 36.
  - `USE_FULL_SCREEN_INTENT` is limited to calling and alarm apps.

  See [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §2.
- **The power button** (`ESTIMATE`, from `PowerPresses.kt` in draft PR #114, never run on a device): a 5-press Android Emergency SOS would also cross the draft 4-press threshold while a journey is active, so both would fire. Test it on real phones.
- **Monitoring policy** (`REPORTED`): Play bans apps that monitor another person, except declared parental or enterprise tools. VUKA is started by the member, about the member, and location is time-boxed after a check-in. That reads as personal safety, but it stays an `ASSUMPTION` (Q-C6) until a Play review.
- **From 27 Jan 2027,** geofencing is no longer an approved foreground-service use, and the location button becomes the recommended minimum scope for precise location.

## 4 · Stronger signals, in order (`PROPOSED`)

Each passes the four gates in `docs/MASTER-CONTEXT.md` §10 before it ships, and none decides a consequence on its own.

1. **Measure before adding.**
   - Run the existing FSD50K harness for **screams** on v2 against v3 (PR #124): tune on even clip ids, validate on odd ones. Cite the earlier failed separation-1 trial (§1) beside the result.
   - **Shouts need new clips.** The current list has no shout or yell clips, so add licensed FSD50K Shout and Yell clips.
   - Record a **consented** corpus of short calls in South African languages and accents ("Help!", "Nceda!", "Thusa!", "Help my!").
   - Run the venue false-alarm curve (taxi rank, TV, sport), and battery and continuity on a budget 2–3 GB phone.
   - Publish everything to `docs/EVIDENCE.md` with n.
2. **"Check on me" timer, the first new signal.** The member sets an arrival time. If the journey isn't ended with a PIN by then, the normal check-in opens and the existing `no_answer` path follows.
   - Run the timer **on the server**, so Doze can't delay it, and deliver it by high-priority push.
   - It covers freezing, whispered threats and silence, which no sound rule catches.
   - It uses no audio, has the lowest legal and comfort risk, and resembles Google's Safety Check and Apple's Check In (`REPORTED`, *from recall*).
   - It needs a new `sense` value and an ADR, as ADR-0049 did.
3. **A scream-specific rule:** one window at a higher bar, aimed at the 27 short clips. Detection-threshold changes need **two-operator sign-off** (ADR-0036(8)); record it.
4. **Content-free tamper signals, only while armed or during an open incident.**
   - Signals: the phone shutting down, airplane mode switched on, the SIM removed, and battery level and network type in the heartbeat.
   - They feed `contact_lost` and guardian context, and never trigger a consequence alone.
   - Turn `contact_lost` on once heartbeat continuity is measured.
5. **Media playing on the phone counts against a prompt.** `ASSUMPTION`: a scream in the member's own video or music is likely a common false alarm; M2 will tell. "Is media playing" carries no content, and the check is cheap.
6. **Sound classes:**
   - Map the three classes already weighted in CEM-1 but never mapped to YAMNet: smash/crash (weighted as a trigger), tyre squeal or skid, and car alarm.
   - Add **new** context weights against a prompt for fireworks (beyond the existing gun look-alike rule) and children shouting. That needs a CEM-1 entry and an ADR-0047 update.
   - Same model; nothing new leaves the phone.
7. **Motion:** also look 10 s *after* a sound (a grab after a scream), and add a "phone thrown" pattern. Still corroboration only; measure first.
8. **Optional false-alarm labelling** after every check-in, identical for both PINs: "What was it? TV / sport / kids / skip". Answers given after a duress PIN are ignored. This is the consented field-calibration data insurers will ask for.
9. **Bank-side signals during an open incident** (offer N1 in [`01-B2B-ENTERPRISE.md`](01-B2B-ENTERPRISE.md)): a new beneficiary, a large transfer or a limit increase raise the evidence level only, and the bank decides. Gated by G36–G38 and s71.
10. **Avoid:**
    - keyword spotting and any speaker or voice identification, until a written counsel opinion and a new ADR;
    - fall detection: an inferred injury may be health information, and real-world accuracy is reported to be poor (`REPORTED`, *from recall*);
    - struggle detection from motion: no field evidence;
    - continuous route learning for hijacking: location profiling, s71, and a heavy Play review. Use the member-declared timer instead.

## 5 · Comfortable: fixes that come before any new signal

- **Fix the duress defects at sign-in and sign-out** (D6, [`06-LAUNCH-ROADMAP.md`](06-LAUNCH-ROADMAP.md) §4).
- **Tell the member when listening stops,** whether Android kills the service (`START_NOT_STICKY`) or the microphone toggle hands the app silent audio.
- **Correct the onboarding promise.** "Your guardians only hear from VIGIL if you don't answer, or if you use your duress PIN" is incomplete: a wrong PIN also sends a heads-up.
- **Measure pocket presses** of the one-tap Emergency button, or restore a hold.
- **Make commitments people can hold us to,** each stated only as far as it's true:
  - **Selling data:** VUKA never sells location or derived data. An earlier family-locator app's location sales became a scandal (`REPORTED`, *from recall*).
  - **Removing a guardian:** the member can schedule a removal at any time. It takes effect after 24 hours, not during an open incident, and the last guardian stays until a replacement accepts (ADR-0036(5)). This protects against a coerced removal; the cost is that an abusive guardian keeps receiving alerts for up to 24 hours. Say it plainly.
  - **Designed, not yet tested:** "guardians can never switch listening or location on" and "the duress PIN never reveals itself". Publish neither as a promise until the background-start device test and the V5 observable-behaviour tests are recorded. A shared export also has to stop showing past duress results (build-state audit, item c10).
- **Rewrite the privacy notice** for what the app does now.
- **Refresh the RICA paper** for a personal phone and bystanders, and send counsel these questions:
  - Does a label-only output "make contents available"?
  - Can the provider rely on the member's s4 position?
  - Is in-app consent written consent under s5?
  - s57, s71 and the s72 basis.
- **Ask people.** No peer-reviewed African study on accepting listening safety apps was found (`REPORTED`; the search was cut short by its budget). Run a small, consented comfort study (for example, with women who commute), with n stated.

## 6 · Decision D7: the default listening model

ADR-0046 (listening from set-up until paused with a PIN) is built in the app but still **Proposed**. It conflicts with the honesty ledger's "journey mode, not always on" and with the privacy notice, while the app says "Listening on this phone, all the time".

| Option | For | Against |
|---|---|---|
| Accept ADR-0046, said plainly (*"listens while active, until you pause it with your PIN; a restart stops it"*) | Nothing to remember before a bad moment | Battery and false check-ins unmeasured; the RICA s4 backstop is lost when the phone is left alone; no comparable product is known to do it (`REPORTED`, *from recall*) |
| **Journey mode as the default**, with the "check on me" timer | Shorter exposure, fewer prompts, easier consent; Android already requires listening to start on screen; matches the comparable products' pattern | The member must remember to start it |
| Member chooses at set-up | Comfort is the member's call | Two modes to test and explain |

**Recommendation, updated by the research: journey mode as the default.** "Listening until paused" becomes an opt-in once battery and false check-ins are measured on a budget phone. Verify the recalled comparisons before deciding. Lethabo leads this decision; both founders agree it (README §3).
