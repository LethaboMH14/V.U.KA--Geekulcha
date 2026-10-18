# Insight 3 evidence base: stronger distress signals that are lawful in South Africa and comfortable to carry

**As of 18 Oct 2026. This is research for PILOT CORE (Pty) Ltd, not legal advice. It serves T (technical), S (security and ethics) and U (user trust).** It answers one question: would a real user trust VUKA and keep it on their phone? This was a read-only task: no repository file was created, edited or committed.

Tags: **FACT** = verified, with a source. **ESTIMATE** = derived, with the assumptions named. **ASSUMPTION** = believed, not checked. **PROPOSED** = designed, not built. **REPORTED** = a third-party claim not checked independently. **⚑** = from model recall, not re-verified this session.

---

## 0 · Method and provenance limits (read this first)

- **No primary statute text could be read this session.**
  - WebFetch could reach only `developer.android.com`.
  - These all failed DNS (ENOTFOUND), and direct HTTPS through the proxy also failed: justice.gov.za, gov.za, inforegulator.org.za, saflii.org, lawlibrary.org.za, acts.co.za, support.google.com, play.google.com, support.apple.com, arxiv.org.
  - This is the same blocker recorded in `docs/RICA-POSITION.md:5` on 16 Sep 2026.
  - RICA and POPIA wording below comes from secondary sources that quote the Acts (law firms, an *Obiter* law-journal note, a copy of RICA on internet.org.za), read through search-engine extracts. Where two or more independent sources agree, it is marked "secondary ×2".
- **The shared web-search budget for this turn ran out partway through the work.** §4–§6 (comparable products, accuracy research, comfort research) are therefore mostly **model recall** (training data to mid-2026). They are tagged REPORTED⚑ or ASSUMPTION⚑ and **must be verified before any of it reaches a judge, investor or partner**.
- **Android rules in §3 are FACT.** They were read directly from developer.android.com on 18 Oct 2026. Google Play Help pages were seen only through search extracts, so they are **REPORTED**.

---

## 1 · RICA (Act 70 of 2002)

### 1.1 What the Act says (secondary wording, not the Gazette text)

- **"Communication"** includes both a direct and an indirect communication. *Secondary ×2:* [internet.org.za copy](https://www.internet.org.za/ricpci.html), [De Rebus 2014](https://www.saflii.org/za/journals/DEREBUS/2014/6.html).
- **"Direct communication"** has two limbs. Source: [internet.org.za](https://www.internet.org.za/ricpci.html), [Cell C RICA explainer](https://www.cellc.co.za/cellc/static-content/PDF/RICA.pdf).
  - (a) An oral communication, other than an indirect one, between two or more persons, which occurs in the immediate presence of everyone taking part.
  - (b) An utterance by someone taking part in an indirect communication, if another person in their immediate presence can hear it.
- **"Indirect communication"** is a transfer of information (speech, data, text, images, signals, radio spectrum) by a postal service or telecommunication system.
- **"Intercept"** is defined this way (*secondary ×3:* [Obiter note](https://obiter.mandela.ac.za/article/download/14813/19037/88104), [CDH alert, 24 Feb 2026](https://www.cliffedekkerhofmeyr.com/en/news/publications/2026/South-Africa/Dispute-Resolution/dispute-resolution-alert-24-february-Big-brother-in-the-boardroom-Is-bugging-the-office-lawful-under-RICA), Law Insider):
  - "the aural or other acquisition of the **contents** of any communication through the use of any means, including an interception device, **so as to make some or all of the contents of a communication available to a person other than the sender or recipient** or intended recipient";
  - it includes monitoring by a monitoring device, inspecting the contents of an indirect communication, and diverting one.
- **"Party to the communication"** (for s4), in a direct communication, includes anyone **"in whose immediate presence such direct communication occurs and is audible to the person concerned, regardless of whether or not the direct communication is specifically directed to him or her"**. *Secondary ×3:* internet.org.za, [CDH 2020](https://www.cliffedekkerhofmeyr.com/en/news/publications/2020/Employment/Employment-Alert-5-October-2020-Section-4-of-RICA-The-big-brother-constant-and-the-admissibility-of-secret-recordings.html), [Boshoff Inc](https://boshoffinc.co.za/can-someone-record-me-without-my-permission/).
- **s2, the prohibition:** no person may intentionally intercept, attempt to intercept, or authorise or procure anyone else to intercept, at any place in the Republic, any communication in the course of its occurrence or transmission. Exceptions are in s3 onwards. Source: [Obiter](https://obiter.mandela.ac.za/article/download/14813/19037/88104).
- **s4, party exception:** any person other than a law-enforcement officer may intercept a communication they are a party to, unless they do it to commit an offence. Source: [Michalsons](https://www.michalsons.com/blog/complying-with-rica/1157), CDH 2020.
- **s5, consent exception:** any person other than a law-enforcement officer may intercept a communication if **one of the parties gave prior consent in writing**, unless it is done to commit an offence. Source: [Deale Attorneys](https://deale.co.za/secret-recordings/), Michalsons.
- **Offence and penalty (s49, s51):** up to a R2 million fine or 10 years' imprisonment (ASSUMPTION⚑). The "listed equipment" ban (s44–s45) covers only devices the Minister declares to be primarily useful for interception (ASSUMPTION⚑). Both need checking against the Gazette.
- **Current commentary agrees.** CDH, 24 Feb 2026: a participant may generally record a conversation, while a non-party recording secretly without written consent is generally an offence. POPIA still applies even when a recording is lawful.

### 1.2 Is on-device classification of ambient sound "interception"?

**No South African court decision or commentary was found on on-device sound-event classification, smart speakers or always-listening phones.** A targeted search returned only general RICA and POPIA pieces. The closest public record is Parliament's ShotSpotter briefing:

- The vendor told MPs the system "did not use microphones", used acoustic sensors tuned to "booms, pops and bangs", and kept one second of audio before and after an event. MPs asked whether it could record private conversations. Source: [PMG](https://pmg.org.za/committee-meeting/26334/).
- Cape Town's ShotSpotter system was reported offline or ended in mid-2026 (REPORTED: [allAfrica, 31 Jul 2026](https://allafrica.com/stories/202607310048.html); [BusinessTech](https://businesstech.co.za/news/trending/868295/cape-towns-r30-million-police-tech-under-fire/)).

Team reading, element by element (ESTIMATE, for counsel to confirm):

1. **Is there a "communication"?** Glass, gunshots, impacts and car alarms carry no oral exchange between people, so they are very likely **not communications at all**. A scream or a shouted "Help!" can be an oral communication, so it may be a *direct communication*. Bystander speech certainly is.
2. **Is "contents" acquired?** YAMNet scores the spectrum against sound classes. It decodes no words. Whether "screaming: 0.71" counts as *contents* is untested.
3. **"So as to make … contents available to a person other than the sender or recipient."** Only a label and a score leave the phone. Nothing is heard by a person, stored or sent as audio. **This is the strongest argument that VUKA is outside the definition**, but it is untested.
4. **Intention (s2 says "intentionally").** VUKA is built to detect events, not to acquire speech. For non-speech classes this supports the reading. For keyword spotting it does not, because decoding words is the purpose.
5. **The s4 backstop (new; not in `docs/RICA-POSITION.md`).**
   - The member carrying the phone is a "party" to any direct communication audible to them, even one not directed at them. Even if classification were interception, the member, as a party, may intercept.
   - This backstop **only holds while the member is with the phone**. A phone left on a table while the member is in another room (likely under ADR-0046's "listening until paused") loses it.
   - Whether the software provider can shelter under the member's s4 position is untested.
6. **s5 consent covers only communications the member is a party to.** The member's in-app consent is probably "writing" through ECTA s12 data messages (ASSUMPTION⚑). Bystanders cannot consent.

**Legal-risk reading (ESTIMATE):**

| Signal type | Risk | Why |
|---|---|---|
| Non-speech classes | **Low** | Most likely not a "communication"; nothing made available but a label |
| Scream or shout classification, label only | **Low to moderate** | Strongest while the member is present (s4) |
| On-device keyword spotting | **Moderate to high** | Acquires word content by design; s4 helps only while the member is a party |
| Any audio recording or upload | **High** | Also a POPIA content question |

### 1.3 AmaBhungane, and the RICA Amendment Bill (2025–2026)

**The judgment:**
- *AmaBhungane Centre for Investigative Journalism NPC v Minister of Justice and Correctional Services* [2021] ZACC 3, **delivered 4 Feb 2021**. Sources: [lawlibrary](https://lawlibrary.org.za/akn/za/judgment/zacc/2021/3/eng@2021-02-04/source), [ConCourt](https://www.concourt.org.za/index.php/judgement/383-amabhungane-centre-for-investigative-journalism-npc-and-another-v-minister-of-justice-and-correctional-services-and-others-minister-of-police-v-amabhungane-centre-for-investigative-journalism-npc-and-others-cct278-19-cct279-19).
  - **Correction:** `docs/RICA-POSITION.md:22` says 3 Feb.
- It confirmed that RICA is unconstitutional for lacking adequate privacy safeguards, and that bulk surveillance is unlawful ([CDH, 16 Feb 2021](https://www.cliffedekkerhofmeyr.com/en/news/publications/2021/Dispute/Dispute-Resolution-Alert-16-February-2021-An-end-to-secret-state-surveillance-under-RICA.html)).
  - The five defects (ASSUMPTION⚑): no post-surveillance notification; a designated judge without enough independence; ex parte process; no rules for managing intercepted data; no special protection for lawyers and journalists.
- The declaration was suspended for 36 months, to 4 Feb 2024 ([Parliament](https://www.parliament.gov.za/press-releases/media-statement-justice-and-correctional-services-committee-calls-comment-rica-amendment-bill)).
- **Bearing on VUKA:** it is about state surveillance, so the bearing is marginal. For insight 2, it means **SAPS cannot use VUKA as a listening channel**. Any police access to VUKA data has to go through lawful process.

**The Amendment Bill:**

| Date | Step | Source |
|---|---|---|
| 31 Oct 2023 | Justice committee adopted the A-version | [PMG](https://pmg.org.za/committee-meeting/37457/) |
| 21 Nov 2024 | President referred it back under Constitution s79(1): the s25A(2)(b) post-surveillance notification could be suspended indefinitely, with no review | [gov.za](https://www.gov.za/news/media-statements/president-cyril-ramaphosa-refers-rica-amendment-bill-national-assembly-21-nov), [SAnews](https://www.sanews.gov.za/south-africa/president-ramaphosa-refers-rica-amendment-bill-national-assembly) |
| Feb–Mar 2025 | Committee sought clarity from the Presidency | [Parliament](https://www.parliament.gov.za/press-releases/media-statement-justice-committee-will-request-clarity-presidency-rica-reservations), [PMG 40307](https://pmg.org.za/committee-meeting/40307/) |
| 25 Jul 2025 | ConCourt *President v Speaker* [2025] ZACC 12 granted supplementary interim relief: a deemed designated-judge arrangement and continued notification, journalist and lawyer protections | [SAFLII](https://www.saflii.org/za/cases/ZACC/2025/12.html), [FW de Klerk Foundation](https://fwdeklerk.org/president-of-the-republic-of-south-africa-v-speaker-of-the-national-assembly-2025-zacc-12/) |
| Feb 2026 | Parliament papers list the Bill for a joint committee sitting | [Parliament ATC, 2 Feb 2026](https://www.parliament.gov.za/storage/app/media/Docs/zlist/01dc2qim7s3wqnmmu3dveienpv6wrbuj22.pdf) |

- ITLawCo said RICA was "entirely inoperable" from Sep 2024 until the 2025 order (REPORTED, one firm).
- **No evidence was found that the Bill has been enacted as of 18 Oct 2026.** Its scope is state interception oversight; nothing found touches on-device classification on private devices.

---

## 2 · POPIA (Act 4 of 2013)

**Primary text:** the Information Regulator hosts it at `inforegulator.org.za/wp-content/uploads/2025/08/PROTECTION-OF-PERSONAL-INFORMATION-ACT-4-OF-2013.pdf`. It was unreachable this session.

- **Location is ordinary personal information.** The s1 definition lists "location information, online identifier" among its examples ([Baker McKenzie](https://resourcehub.bakermckenzie.com/en/resources/global-data-and-cyber-handbook/emea/south-africa/topics/key-definitions)). Location is not special personal information.
- **Lawful processing (ss8–25, s11):**
  - s11(1) gives six grounds with **no hierarchy** ([Werksmans, Privacy Day 2026](https://werksmans.com/privacy-day-2026-moving-beyond-the-consent-myth-under-popia)).
  - For VUKA: the member's **consent** (s11(1)(a)), plus **"protects a legitimate interest of the data subject"** (s11(1)(d)). Under (d), processing is not undone when consent is withdrawn, but the member can object under s11(3) ([CDH 2020](https://www.cliffedekkerhofmeyr.com/news/publications/2020/Employment/Employment-Alert-23-November-2020-Objection-and-withdrawal-of-consent-in-the-age-of-information.html)).
  - Guardians: their own consent plus a s18 notice.
  - Bystanders: a sound class with no identity, never stored or linked, is **unlikely to be "identifiable" personal information** (ESTIMATE).
- **Special personal information (s26) and biometrics:**
  - s26 covers belief, race, trade union, politics, **health or sex life, biometric information**, and criminal behaviour relating to alleged offences ([Information Regulator guidance note, 28 Jun 2021](https://inforegulator.org.za/wp-content/uploads/2020/07/InfoRegSA-GuidanceNote-Processing-SpecialPersonalInformation-20210628.pdf)).
  - s1 defines **"biometrics"** as "a technique of **personal identification** based on physical, physiological or behavioural characterisation including … **voice recognition**" (*secondary ×3*, e.g. [Bowmans/Black Sash](https://blacksash.org.za/wp-content/uploads/2023/09/Bowmans_BlackSash_POPI.pdf)).
  - So: **classifying *what* sound occurred is not biometric. Matching *whose* voice it is would be.** This supports `docs/security/POPIA-ONE-PAGER.md:23`.
  - **Speaker-specific "safe word" matching would be biometric** and would need a s27 ground: s27(1)(a) consent, or s27(2) Regulator authorisation.
  - **Open counsel question:** is a PIN-timing baseline a "behavioural characterisation"? It is biometric only if it is used to identify the person.
  - **Fall or injury inference** may be **health** information (ESTIMATE).
  - An incident record about a robbery describes a third party's alleged offence, not the member's. VUKA must **never record attacker descriptions, voices or plates**, because that would be criminal-behaviour special personal information.
- **s18 notice** (contents ASSUMPTION⚑): what is collected and from where; who is responsible; the purpose; whether it is voluntary; the consequences of not providing it; any cross-border transfer and its protection; recipients; the rights of access, correction and objection; and the right to complain to the Regulator. The current notice still says South Africa North (`docs/venture/03-DISTRESS-SIGNALS.md:49`).
- **s57 prior authorisation** (new risk for the business-to-business (B2B) model in insight 1):
  - Processing "information on criminal behaviour or on unlawful or objectionable conduct **on behalf of third parties**" needs the Regulator's prior authorisation. Sources: [Regulator guidance note, 11 Mar 2021](https://inforegulator.org.za/wp-content/uploads/2020/07/InfoRegSA-GuidanceNote-PriorAuthorisation-20210311-1.pdf), [ENS](https://www.ensafrica.com/news/detail/3958/popia-and-the-prior-authorisation-conundrum-).
  - So does transferring special personal information to a foreign third party without adequate protection.
  - Processing may not start until the Regulator responds (s58(2), REPORTED).
  - **Incident or duress records processed for a bank or insurer could fall under s57(1)(b).** This is a counsel question, not a conclusion.
- **s71 automated decisions:**
  - A decision with legal consequences or substantial effect must not be based **solely** on automated processing that profiles a person (including location, health, conduct), unless the s71(2) contract or code exceptions apply with safeguards ([Bowmans](https://bowmanslaw.com/insights/south-africa-ai-in-the-workplace-2-of-6-popia-considerations/)).
  - A guardian alert is low risk.
  - **An automatic bank action on a duress PIN, or insurer pricing from VUKA events, is squarely in scope.** It needs a human step, or a contract with a way for the member to make representations.
- **s72 cross-border transfer (Azure UAE North):**
  - A transfer is allowed if the recipient is bound by law, binding corporate rules or an agreement giving adequate protection, or with consent, or if it is necessary for a contract ([popia.co.za s72](https://popia.co.za/section-72-transfers-of-personal-information-outside-republic/); [Coetzee, PER 2024](https://www.saflii.org/za/journals/PER/2024/48.html)).
  - **South Africa publishes no adequacy list**, so this is a self-assessment ([MJK 2026](https://mjkinc.co.za/doing-business-in-south-africa/popia-data-protection), REPORTED).
  - The Regulator plans a guidance note on transfers ([Werksmans, May 2026](https://werksmans.com/south-africas-information-regulator-what-the-2025-26-annual-performance-plan-means-for-business-as-presented-to-the-portfolio-committee-on-5-may-2026/); [Michalsons](https://www.michalsons.com/blog/guidance-note-on-cross-border-transfers-to-from-south-africa/77246)).
  - The UAE PDPL is Federal Decree-Law 45 of 2021 (ASSUMPTION⚑).
- **Regulator guidance relevant to VUKA:**
  - Special personal information guidance (Jun 2021) and prior authorisation guidance (Mar 2021).
  - Amended POPIA Regulations, in force **17 Apr 2025** (GN 6126, GG 52523): objections by email, SMS, WhatsApp or phone; correction and deletion outcomes within 30 days ([Bowmans](https://bowmanslaw.com/insights/south-africa-popia-regulations-get-a-makeover-what-you-need-to-know/)).
  - A draft **gated-access code** (gazette, Mar–Apr 2026) names biometric systems, including facial recognition, as high-risk ([Regulator PDF](https://inforegulator.org.za/wp-content/uploads/2026/04/GG-NOTICE-CODE-OF-CONDUCT-ON-GATED-ACCESSES-WITH-COMMENTS-20.3.2026.pdf)).
  - **No Regulator guidance specific to biometrics or apps was found.**
- **Enforcement:**
  - **No enforcement action against a safety or tracking app was found.**
  - Recent notices: WhatsApp LLC (2025), for giving South African users different terms from EU users ([Silicon Africa](https://siliconafrica.org/south-africas-information-regulator/)); Central Johannesburg TVET College (May 2026), for special personal information sharing and breach reporting ([Mondaq](https://www.mondaq.com/southafrica/data-protection/1796688/information-regulators-first-enforcement-notice-for-2026)); Sibanye Stillwater and others ([Regulator, Jun 2026](https://inforegulator.org.za/wp-content/uploads/2026/06/MEDIA-STATEMENT-INFORMATION-REGULATOR-ISSUES-ENFORCEMENT-NOTICES-FOR-THE-CONTRAVENTIONS-OF-POPIA-AND-PAIA-BY-PUBLIC-AND-PRIVATE-BODIES.pdf)); and an earlier SAPS notice ([PDF](https://inforegulator.org.za/wp-content/uploads/2020/07/ENFORCEMENT-NOTICE-SAPS-MATTER-04052363.pdf)).
  - Ignoring an enforcement notice can bring up to R10 million or 10 years (REPORTED).

---

## 3 · Android and Google Play rules (2026)

All FACT from developer.android.com, 18 Oct 2026, unless marked.

- **Foreground service (FGS) types:**
  - A microphone FGS needs `FOREGROUND_SERVICE_MICROPHONE` and the `RECORD_AUDIO` permission. A location FGS needs `FOREGROUND_SERVICE_LOCATION` plus coarse or fine location, with location services on ([service-types](https://developer.android.com/develop/background-work/services/fgs/service-types)).
  - Since Android 14, every FGS must declare its type, and apps must **declare their FGS types in Play Console → Policy → App content** ([fgs-types-required](https://developer.android.com/about/versions/14/changes/fgs-types-required)).
- **While-in-use restriction (Android 14+):**
  - A microphone, camera or location FGS **cannot be created while the app is in the background**. It must be started while an activity is visible, or under one of these exemptions: started by a system component, an app-widget tap, a notification tap, a PendingIntent from another visible app, a device-owner policy app, a `VoiceInteractionService`, or the `START_ACTIVITIES_FROM_BACKGROUND` permission ([restrictions-bg-start](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start)).
  - **High-priority FCM, exact alarms, geofence or activity transitions, and a battery-optimisation exemption let an app start a general FGS from the background, but they do not grant microphone access.**
  - **Implication:** a guardian or server cannot remotely switch on VUKA's listening. That is a comfort property worth stating, after a device check (ASSUMPTION until tested).
  - The Quick Settings tile opens an activity (`HelpTileService.kt`), which is the correct path.
- **Boot:** a `BOOT_COMPLETED` receiver may not launch a microphone FGS (since Android 14); Android 15 extends the list. ([Android 15 changes](https://developer.android.com/about/versions/15/behavior-changes-15))
- **Android 15 `dataSync` cap:** a `dataSync` FGS may run **6 hours in 24**. VUKA's guardian standby uses `dataSync` (`LocationModule.kt:182`, `AndroidManifest.xml:59`), so on target SDK 35 or higher it will time out. High-priority FCM is the documented route for time-sensitive notifications under Doze ([Doze](https://developer.android.com/training/monitoring-device-state/doze-standby)).
- **Android 16:** jobs started from an FGS now count against job quotas ([fgs/changes](https://developer.android.com/develop/background-work/services/fgs/changes)).
- **Android 17:** background audio playback and volume changes silently fail unless the app has an FGS with while-in-use capability, or holds the exact-alarm permission and uses `USAGE_ALARM` ([bg-audio](https://developer.android.com/about/versions/17/changes/bg-audio)). Any audible siren or "fake call" feature must be designed for this.
- **Target SDK:** **from 31 Aug 2026, new apps and updates must target API 36** ([target-sdk](https://developer.android.com/google/play/requirements/target-sdk)). **VUKA targets API 34** (`app/android/build.gradle:6`), which currently blocks any Play submission (insight 6).
- **Full-screen intents:** since Android 14, `USE_FULL_SCREEN_INTENT` is limited to calling and alarm apps, and **Play revokes the default grant** for others. Apps must check `canUseFullScreenIntent` ([Android 14 changes](https://developer.android.com/about/versions/14/behavior-changes-14)). VUKA declares it (`AndroidManifest.xml:11`).
- **Microphone indicator and toggles (Android 12+):**
  - A status-bar icon appears **whenever an app accesses the microphone**, and the Privacy Dashboard shows a timeline of access.
  - A device-wide microphone toggle gives apps **silent audio** and also **rate-limits motion sensors**. An emergency call turns the microphone back on. ([explaining-access](https://developer.android.com/training/permissions/explaining-access); [Android 12](https://developer.android.com/about/versions/12/behavior-changes-all))
  - So "discreet, not invisible" is enforced by the platform. VUKA must detect silent audio and tell the member.
- **Sensors:**
  - From Android 9, background apps get **no accelerometer or gyroscope events**, so motion signals must run inside the FGS.
  - From Android 12, sampling is capped at 200 Hz without `HIGH_SAMPLING_RATE_SENSORS`, and always rate-limited when the microphone toggle is off ([sensors overview](https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview)).
- **Doze:**
  - Doze suspends network access, ignores wake locks and defers alarms and jobs. High-priority FCM is still delivered.
  - The exemption table lists **"Safety app: Apps that keep their users and their families safe" as an acceptable case** for `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.
  - Play prohibits asking for the exemption directly unless the app's core function is affected ([Doze](https://developer.android.com/training/monitoring-device-state/doze-standby)).
- **Location policy (REPORTED, Play Help via search extracts):**
  - Play requires an in-app **prominent disclosure** before the runtime permission prompt, visible during normal use, saying what is collected, used and shared. Background location is allowed only for core features, and review needs a video ([User Data](https://support.google.com/googleplay/android-developer/answer/10144311); [Permissions](https://support.google.com/googleplay/android-developer/answer/16558241); [Android Developers Blog, 2020](https://android-developers.googleblog.com/2020/11/tips-for-getting-your-app-approved-for-background-location-access.html), which lists physical safety as a qualifying benefit).
  - **From 27 Jan 2027:** the location button becomes the recommended minimum scope for precise location, and **geofencing is no longer an approved FGS use case** ([play-policies](https://developer.android.com/distribute/play-policies), FACT). One extract says the location button is mandatory on Android 17+ (REPORTED; verify).
  - VUKA requests foreground location only, for 30 minutes after a check-in, which is the lower-risk pattern.
- **FGS declaration (REPORTED):** for each type, describe the feature and the effect on users if it is delayed or interrupted, and give a video link. For a microphone FGS, the video shows the **user starting it** ([Play Help 13392821](https://support.google.com/googleplay/android-developer/answer/13392821)).
- **Stalkerware policy (REPORTED):**
  - Play bans apps that monitor **another individual**.
  - Only apps designed for parental (including family) or enterprise monitoring may distribute, with a persistent notification, a unique icon, disclosure in the listing, and the `isMonitoringTool` flag. They may not be used to track a spouse "even with their knowledge" ([Stalkerware policy](https://support.google.com/googleplay/android-developer/answer/10065487); [isMonitoringTool](https://support.google.com/googleplay/android-developer/answer/12955211)).
  - VUKA is started by the member about the member, and location is time-boxed and goes to guardians only after a check-in. **That reads as personal safety, not monitoring.** This is still ASSUMPTION Q-C6 until a Play review.
- **"Personal safety" and health app requirements:** **not verified** (budget exhausted). No dedicated Play "personal safety" programme was confirmed. A health-apps declaration would matter only if VUKA added fall or health signals (ASSUMPTION⚑).
- **Data safety form:** data processed only on the device is not declared as "collected" (ASSUMPTION⚑). Labels and scores that leave the phone must be declared.
- **Power button:**
  - Android gives apps no power-key event. VUKA's draft counts screen-on and screen-off events (commit `a270d1a`, branch `lethabo/native-guardian-watch-and-sos`: "Four, because Android's SOS uses five").
  - **A five-press Android SOS passes VUKA's four-press threshold first, so both fire.** Samsung's own SOS also uses repeated side-key presses, with a count that depends on the One UI version (ASSUMPTION⚑).

---

## 4 · Comparable products: signals and comfort design

All REPORTED⚑, from model recall; verify before external use.

| Product | Signals | How comfort is handled | Published accuracy |
|---|---|---|---|
| **Google Personal Safety (Pixel)** | **Car crash detection:** location, motion sensors and nearby sounds; asks "Are you OK?", then calls emergency services and shares location. **Safety Check:** a user-set timer that shares location with contacts if unanswered. **Emergency SOS:** power button pressed 5+ times; countdown, call, share location, optional video. **Theft Detection Lock** (2024): on-device model using motion, Wi-Fi and Bluetooth spots a snatch-and-run and locks the screen | Armed by the user or by context; a countdown or confirmation before escalating; on-device processing claims | None found with n. Crash-detection availability in South Africa unverified |
| **Apple** | **Crash Detection** (iPhone 14+, Watch S8+): high-g accelerometer, gyroscope, barometer, GPS, microphone sound level, while driving; countdown then call. Apple said it was trained on over 1 million hours of driving and crash data. **Emergency SOS** (5 presses or hold). **Check In** (timer or arrival). Watch fall detection | Context-gated (driving), countdown, on device | No sensitivity or n published. Rollercoaster (2022) and ski-slope (2023) false calls were widely reported and followed by updates |
| **Samsung** | SOS via repeated side-key presses; can attach photos and a **short audio recording** sent to contacts | The user sets it up | None |
| **Life360** | Crash Detection (driving above about 25 mph) | **Lesson:** The Markup (Dec 2021) reported Life360 sold precise location data to brokers. It then said it would stop selling to most brokers. Insurer-linked buyers were part of the story | None |
| **bSafe** | Voice-activated SOS with a custom phrase; records audio and video on SOS; "Follow me" | The user picks the phrase; the recording is overt | None found |
| **Noonlight** | Hold a button; release, then enter a PIN within about 10 s, or dispatchers call and send help | A dead-man pattern, like VUKA's hold-for-help plus PIN | None |
| **Namola (SA)** | Manual panic button to a 24/7 centre that dispatches SAPS or partners | Manual only | None |
| **AURA (SA)** | Manual panic button to on-demand private armed response; sold through banks and insurers (the repo notes "FNB GuardMe/Aura") | Manual only; a **B2B precedent** for insight 1 | None |
| **Scream-detection apps** | No consumer app was found that publishes scream accuracy with method and n (GAP) | | YAMNet's model card reports AudioSet mAP 0.306 (REPORTED⚑). **VUKA (FACT):** screams opened a check-in in 6.5% of FSD50K eval clips (n = 108) under V4, and 10.2% under CEM-1 (`docs/eval/cem1-measurements.md:14`) |

**The pattern across these products:** every mainstream product either needs a press, is armed by the user (timer, journey), or is gated by context (driving). All of them confirm through a countdown before escalating. **None of them listens to ambient sound all day for distress.** Google's crash detection and Apple's Crash Detection use microphone *sound level* only inside a driving context.

---

## 5 · Research on extra on-device signals

All REPORTED⚑ unless marked FACT.

- **Fall detection:** Bagalà et al. 2012 (*PLoS ONE*) tested 13 published accelerometer algorithms on **29 real-world falls from 9 people**. Mean sensitivity was **about 57%** and specificity about 83%, with many false alarms a day. Algorithms tuned on staged falls did not transfer to real life.
- **Phone snatch:**
  - Google's Theft Detection Lock is a consumer precedent for an on-device, motion-only snatch detector, with no published accuracy.
  - VUKA logs the Liu et al. 2018 40 m/s² rule at weight 0 (`docs/adr.md:625`, FACT).
  - No field false-alarm rates were found.
- **Struggle or violence from the accelerometer:** only small studies with staged actions; **no field data found** (GAP).
- **Abnormal route or speed (hijacking):**
  - Trajectory-anomaly work (e.g. iBAT, Zhang et al., UbiComp 2011, taxi GPS) needs **long location histories** and does not transfer to South African hijacking.
  - The Activity Recognition Transition API offers `IN_VEHICLE` enter and exit events with device-dependent latency (FACT, [transitions](https://developer.android.com/develop/sensors-and-location/location/transitions)). It gives context without a location history.
- **Keyword spotting:**
  - Benchmarks such as Speech Commands (Warden 2018, about 105k one-second clips, 35 words) are closed-set and clean.
  - High lab accuracy does not carry over to shouted, stressed, multilingual speech on a South African street.
  - Smart-speaker false wake-ups have been measured in studies such as Dubois et al., PETS 2020, using TV dialogue.
- **Timers (Safety Check, Check In):** these are deterministic. Their false alarms are forgotten check-outs, and no published rates were found.

---

## 6 · Comfort and acceptance research

All REPORTED⚑.

- **Lau, Zimmerman and Schaub (CSCW 2018):** interviews with 17 smart-speaker users and 17 non-users. Non-users cited distrust and privacy. Users had incomplete mental models and rarely used mute.
- **Malkin et al. (PoPETs 2019):** a survey of 116 owners. Many did not know recordings were kept; most rejected secondary uses such as advertising and wanted deletion.
- **Freed et al. (CHI 2018):** 39 survivors and 50 professionals. **Chatterjee et al. (IEEE S&P 2018):** "dual-use" apps, family locators among them, are used by abusive partners. **Implication:** a guardian may be the abuser, so time-boxed location and a duress PIN that never reveals itself matter.
- **Eisenhut et al. (*BMJ Global Health* 2020)** and **Maxwell et al. (*Violence Against Women* 2020):** safety apps are rarely evaluated, mostly panic buttons, and criticised for putting the burden of safety on women.
- **Africa or South Africa:** **no peer-reviewed study found** on accepting listening safety apps (GAP). Local signals of sensitivity: Parliament's ShotSpotter questions about private conversations (PMG) and the Right2Know/Intelwatch complaint against Vumacam (`docs/COMPETITORS.md:32`).

---

## 7 · Per-signal matrix

Legal and comfort ratings are ESTIMATE (the team's reading of secondary text). Platform constraints are FACT (§3) unless marked.

| Signal (status) | Lawful basis and risk (RICA / POPIA) | Platform constraints | Comfort risk | Accuracy evidence | Recommendation |
|---|---|---|---|---|---|
| **Non-speech sounds:** glass, shatter, gun-like; unmapped smash/crash, tyre squeal, car alarm (built) | RICA **low**: not a communication; label only. POPIA: member's personal information under s11(1)(a) and (d); not special | Microphone FGS started on screen; mic icon visible; Play FGS declaration and video; Doze exemption acceptable for safety apps | Medium | **FACT** (V4, FSD50K eval): glass 46.0% (n = 139), shatter 72.9% (n = 70), gunshot 54.6% (n = 108). False check-ins 1.8–7.3 an hour on ESC-50 (lab proxy). Field rate not measured | **Adopt (keep).** Measure the field false-alarm rate; add unmapped classes as supporting evidence only |
| **Scream or shout** (built) | RICA **low to moderate**: a scream may be a direct communication; s4 covers it while the member is present. POPIA: not biometric | Same as above | Medium to high | **FACT:** scream 6.5% (n = 108); 27/108 clips too short ever to confirm. Shout not measured | **Keep, but don't pitch it as the main trigger.** Prototype a scream-specific rule and a consented South African corpus |
| **On-device "safe word" keyword spotting** (parked) | RICA **moderate to high**: decodes word content. POPIA: speaker-specific matching = biometric (s26/s27) | Same microphone FGS; the review video must show the user enabling it | **High** | No South African field data; benchmarks don't transfer | **Avoid now.** Prototype only after a written counsel opinion; never speaker ID, never a transcript |
| **Duress PIN and PIN check-in** (built; sign-in screen gap D6) | No RICA question. POPIA s71 applies if a bank or insurer acts on it automatically | None | Low | Recall under stress not measured | **Adopt now.** Fix D6; run a usability test with a stated n |
| **Manual:** hold-for-help, Emergency button, Quick Settings tile (built) | Consent | The tile opens an activity, so the while-in-use rule is met | Low | Pocket presses not measured | **Adopt.** Add a hold or confirmation step |
| **Power button 4× in 3 s** (draft) | None | No power-key API; counts screen on and off; **co-fires with Android's 5-press SOS**; OEM SOS counts vary (⚑) | Low | None | **Prototype** on Samsung A-series and stock Android before shipping |
| **"Check on me" timer** (PROPOSED) | None; consent | Run the timer server-side to avoid Doze; deliver by high-priority FCM | **Lowest** | Deterministic; comparable to Google Safety Check and Apple Check In (⚑) | **Adopt now: the first new signal** |
| **Motion:** snatch, impact, thrown (built, corroboration only) | None; member's personal information, non-identifying | Only inside the FGS (Android 9+); 200 Hz cap; rate-limited when the mic toggle is off | Low to medium | Not measured; Theft Detection Lock precedent (⚑) | **Prototype** a look-ahead window; keep it corroboration-only until measured |
| **Tamper and connectivity:** shutdown, airplane mode, SIM out, battery, network, only while armed (PROPOSED) | Minimal | Receivers registered while the FGS runs (⚑) | Low | Not measured | **Prototype** |
| **Media playing on the phone, as evidence *against* a prompt** (PROPOSED) | None | AudioManager state (⚑) | Low; it cuts false prompts | Not measured | **Adopt** (cheap) |
| **Fall detection** (none) | POPIA: an inferred injury may be health information | Health FGS needs body-sensor permissions if a wearable is used | Medium | Real-world sensitivity about 57% on 29 falls (⚑) | **Avoid**; leave it to OEMs and watches |
| **Struggle or violence from motion** (none) | Low | FGS | Medium | No field evidence | **Avoid as a trigger**; research only |
| **Abnormal route or speed (hijacking)** (parked) | POPIA: continuous location history and profiling; s71; a heavier s18 notice | Background location, prominent disclosure, review video; Play location changes on 27 Jan 2027 | **High** | None for South Africa | **Avoid** continuous tracking. Use a member-declared journey with an ETA (the timer instead); prototype `IN_VEHICLE` only as context |
| **Speaker or voice ID** (none) | Biometric special personal information | n/a | High | n/a | **Avoid** |

---

## 8 · What this adds to the repository's current position

1. **RICA s4:** the member is a "party" to direct communications audible to them. This **strengthens journey mode** and **weakens "listening until paused" when the phone is left unattended** (decision D7, `docs/venture/03-DISTRESS-SIGNALS.md:78-87`).
2. **The AmaBhungane date is 4 Feb 2021**, not 3 Feb (`docs/RICA-POSITION.md:22`).
3. **New counsel questions:** POPIA **s57(1)(b)** for incident data processed for banks and insurers; **s71** for any automatic bank or insurer action.
4. **Three platform problems block a Play launch:**
   - target SDK 34 against Play's required API 36;
   - a `dataSync` guardian standby that hits Android 15's 6-hour cap;
   - `USE_FULL_SCREEN_INTENT`, which Play limits to calling and alarm apps.
5. **The power-button design co-fires with Android's 5-press SOS.**
6. **Detect the device microphone toggle** (silent audio) and tell the member; motion corroboration also degrades then.


## KEY FACTS
- [REPORTED] RICA's definition of 'intercept' requires acquiring the contents of a communication 'so as to make some or all of the contents … available to a person other than the sender or recipient or intended recipient'. It includes monitoring by a monitoring device. — https://obiter.mandela.ac.za/article/download/14813/19037/88104 ; https://www.cliffedekkerhofmeyr.com/en/news/publications/2026/South-Africa/Dispute-Resolution/dispute-resolution-alert-24-february-Big-brother-in-the-boardroom-Is-bugging-the-office-lawful-under-RICA (secondary quotation, read 2026-10-18; Gazette text not readable)
- [REPORTED] For s4, a 'party to the communication' in a direct communication includes anyone in whose immediate presence it occurs and is audible to them, whether or not it is directed at them. — https://www.internet.org.za/ricpci.html ; https://www.cliffedekkerhofmeyr.com/en/news/publications/2020/Employment/Employment-Alert-5-October-2020-Section-4-of-RICA-The-big-brother-constant-and-the-admissibility-of-secret-recordings.html (2026-10-18)
- [REPORTED] RICA s2 prohibits intentionally intercepting any communication in the course of its occurrence or transmission. s4 lets a non-law-enforcement party intercept, and s5 allows interception with a party's prior written consent; both exclude interception done to commit an offence. — https://www.michalsons.com/blog/complying-with-rica/1157 ; https://deale.co.za/secret-recordings/ (2026-10-18)
- [FACT] No South African court decision or commentary was found on whether on-device sound-event classification, smart speakers or always-listening phones amount to RICA interception. — web searches run 2026-10-18 (see report §1.2) (2026-10-18)
- [REPORTED] At a parliamentary briefing, the ShotSpotter vendor said the system did not use microphones and kept one second of audio before and after an event. MPs asked whether it could record private conversations. — https://pmg.org.za/committee-meeting/26334/ (briefing date not captured)
- [FACT] AmaBhungane v Minister of Justice [2021] ZACC 3 was delivered on 4 Feb 2021. The repo's RICA paper says 3 Feb. — https://lawlibrary.org.za/akn/za/judgment/zacc/2021/3/eng@2021-02-04/source ; docs/RICA-POSITION.md:22 (2021-02-04)
- [REPORTED] The President referred the RICA Amendment Bill back to the National Assembly on 21 Nov 2024 over the s25A(2)(b) post-surveillance notification. — https://www.gov.za/news/media-statements/president-cyril-ramaphosa-refers-rica-amendment-bill-national-assembly-21-nov (2024-11-21)
- [REPORTED] The ConCourt granted supplementary interim relief on RICA in President v Speaker [2025] ZACC 12 on 25 Jul 2025. — https://www.saflii.org/za/cases/ZACC/2025/12.html (2025-07-25)
- [REPORTED] No evidence was found that the RICA Amendment Bill has been enacted. It was still listed on a parliamentary committee agenda in Feb 2026. — https://www.parliament.gov.za/storage/app/media/Docs/zlist/01dc2qim7s3wqnmmu3dveienpv6wrbuj22.pdf (2026-10-18)
- [REPORTED] POPIA defines biometrics as a technique of personal identification based on physical, physiological or behavioural characterisation, including voice recognition. Classifying a sound type without identifying the speaker is therefore not biometric on this definition. — https://blacksash.org.za/wp-content/uploads/2023/09/Bowmans_BlackSash_POPI.pdf ; docs/security/POPIA-ONE-PAGER.md:23 (2026-10-18)
- [REPORTED] POPIA lists location information among its examples of ordinary personal information; it is not special personal information. — https://resourcehub.bakermckenzie.com/en/resources/global-data-and-cyber-handbook/emea/south-africa/topics/key-definitions (2026-10-18)
- [REPORTED] POPIA s57 requires the Information Regulator's prior authorisation to process criminal-behaviour or unlawful-conduct information on behalf of third parties, and to transfer special personal information abroad without adequate protection. — https://inforegulator.org.za/wp-content/uploads/2020/07/InfoRegSA-GuidanceNote-PriorAuthorisation-20210311-1.pdf ; https://www.ensafrica.com/news/detail/3958/popia-and-the-prior-authorisation-conundrum- (2021-03-11)
- [REPORTED] South Africa publishes no official adequacy list for POPIA s72 transfers, and the Information Regulator plans a guidance note on transfers. — https://mjkinc.co.za/doing-business-in-south-africa/popia-data-protection ; https://werksmans.com/south-africas-information-regulator-what-the-2025-26-annual-performance-plan-means-for-business-as-presented-to-the-portfolio-committee-on-5-may-2026/ (2026-05)
- [REPORTED] The amended POPIA Regulations took effect on 17 Apr 2025 (GN 6126, GG 52523). — https://bowmanslaw.com/insights/south-africa-popia-regulations-get-a-makeover-what-you-need-to-know/ (2025-04-17)
- [REPORTED] No Information Regulator enforcement action against a safety or tracking app was found. Recent notices cover WhatsApp (2025), Central Johannesburg TVET College (May 2026) and Sibanye Stillwater. — https://inforegulator.org.za/wp-content/uploads/2026/06/MEDIA-STATEMENT-INFORMATION-REGULATOR-ISSUES-ENFORCEMENT-NOTICES-FOR-THE-CONTRAVENTIONS-OF-POPIA-AND-PAIA-BY-PUBLIC-AND-PRIVATE-BODIES.pdf ; https://www.mondaq.com/southafrica/data-protection/1796688/information-regulators-first-enforcement-notice-for-2026 (2026-06)
- [FACT] From Android 14, an app cannot create a microphone, camera or location foreground service while it is in the background. The listed exemptions are a system component, a widget or notification tap, a PendingIntent from a visible app, a device owner, a VoiceInteractionService, or START_ACTIVITIES_FROM_BACKGROUND. — https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start (2026-10-18)
- [FACT] A BOOT_COMPLETED receiver cannot launch a microphone foreground service (since Android 14). On Android 15, a dataSync foreground service is capped at 6 hours in 24. — https://developer.android.com/about/versions/15/behavior-changes-15 (2026-10-18)
- [FACT] From 31 Aug 2026, new apps and updates on Google Play must target API 36. VUKA targets API 34. — https://developer.android.com/google/play/requirements/target-sdk ; app/android/build.gradle:6 (2026-10-18)
- [FACT] VUKA's guardian standby runs as a dataSync foreground service, which on Android 15+ is subject to the 6-hour-in-24 cap. — app/android/app/src/main/java/com/teamsonar/vuka/detect/LocationModule.kt:182 ; app/android/app/src/main/AndroidManifest.xml:59 (2026-10-18)
- [FACT] From Android 14, USE_FULL_SCREEN_INTENT is limited to calling and alarm apps, and Play revokes the default grant for other apps. VUKA declares the permission. — https://developer.android.com/about/versions/14/behavior-changes-14 ; app/android/app/src/main/AndroidManifest.xml:11 (2026-10-18)
- [FACT] On Android 12+, a status-bar icon appears whenever an app accesses the microphone. With the device microphone toggle off, apps get silent audio and motion sensors are rate-limited. — https://developer.android.com/training/permissions/explaining-access ; https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview (2026-10-18)
- [FACT] From Android 9, background apps receive no accelerometer or gyroscope events. From Android 12, sampling is capped at 200 Hz without HIGH_SAMPLING_RATE_SENSORS. — https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview (2026-10-18)
- [FACT] Android's Doze documentation lists 'Safety app: apps that keep their users and their families safe' as an acceptable case for requesting a battery-optimisation exemption. — https://developer.android.com/training/monitoring-device-state/doze-standby (2026-10-18)
- [FACT] On Android 17, background audio playback and volume changes fail silently unless the app runs a foreground service with while-in-use capability, or holds the exact-alarm permission and uses USAGE_ALARM. — https://developer.android.com/about/versions/17/changes/bg-audio (2026-10-18)
- [FACT] From 27 Jan 2027, geofencing is removed as an approved foreground-service use case and the location button becomes the recommended minimum scope for precise location. — https://developer.android.com/distribute/play-policies (announced 2026-04-15)
- [REPORTED] Google Play bans apps that monitor another individual. Only parental (including family) or enterprise monitoring apps may distribute, with a persistent notification, a unique icon, disclosure in the listing and the isMonitoringTool flag. — https://support.google.com/googleplay/android-developer/answer/10065487 ; https://support.google.com/googleplay/android-developer/answer/12955211 (policy effective 2020-10-01; current wording not fetched)
- [FACT] VUKA's draft power-button help fires on 4 presses within 3 s, counted from screen-on and screen-off events. Android's own Emergency SOS uses 5 presses, so a 5-press SOS also crosses VUKA's threshold. — git commit a270d1a (branch lethabo/native-guardian-watch-and-sos), PowerPresses.kt (2026-09-27)
- [FACT] VUKA's measured catch rates (FSD50K eval, ruleset V4): screaming 6.5% (n=108), glass 46.0% (n=139), shatter 72.9% (n=70), gunshot 54.6% (n=108). False check-ins were 1.8–7.3 per hour on ESC-50 everyday sounds, a lab proxy rather than a field rate. — docs/eval/cem1-measurements.md:10-24 (2026-09-26)
- [REPORTED] Bagalà et al. 2012 tested 13 accelerometer fall-detection algorithms on 29 real-world falls and found mean sensitivity of about 57%. — model recall (PLoS ONE 2012); not re-verified, web-search budget exhausted (2012)
- [REPORTED] Lau, Zimmerman and Schaub interviewed 17 smart-speaker users and 17 non-users; non-users cited privacy and distrust. — model recall (CSCW 2018); not re-verified (2018)
- [REPORTED] The Markup reported in Dec 2021 that Life360 sold precise location data to data brokers; Life360 then said it would stop selling to most of them. — model recall; not re-verified (2021-12 / 2022-01)

## CONFLICTS/GAPS
- No primary statute text (RICA, POPIA, the ECT Act) could be read. Only developer.android.com was reachable by WebFetch; gov.za, justice.gov.za, inforegulator.org.za, saflii, lawlibrary, acts.co.za and support.google.com all failed DNS. All statutory wording is secondary quotation, as already recorded in docs/RICA-POSITION.md.
- The shared web-search budget ran out partway through. Comparable products (§4), accuracy research (§5) and comfort research (§6) are mostly model recall, tagged REPORTED⚑ or ASSUMPTION⚑, and must be verified before external use.
- Date conflict: docs/RICA-POSITION.md:22 dates AmaBhungane to 3 Feb 2021; lawlibrary's version identifier is 2021-02-04.
- RICA Amendment Bill status in 2026 is unclear beyond a Feb 2026 committee agenda listing. No vote, assent or final text was found.
- Sources disagree on the 2025 ConCourt order: ITLawCo calls it an interim order of indefinite duration restoring operability, while the SAFLII headnote stresses that the earlier interim remedy lapsed.
- Play location and foreground-service deadlines conflict: the official pages say 27 Jan 2027, while SDK-vendor GitHub issues cite Oct 2026 or Aug 2026. One extract says the location button is mandatory on Android 17+, which is not confirmed.
- No Information Regulator guidance specific to biometrics or apps was found, and no enforcement action against a safety or tracking app.
- No South African or African peer-reviewed study was found on accepting listening or monitoring safety apps.
- No consumer scream-detection product publishing accuracy with method and n was found.
- Shout/yell detection, field false-alarm rate, battery life, duress-PIN recall under stress and motion signals remain unmeasured for VUKA (docs/venture/03-DISTRESS-SIGNALS.md:18-20).
- Platform conflicts with the launch plan: target SDK 34 against Play's API 36 requirement; a dataSync guardian standby against Android 15's 6-hour cap; USE_FULL_SCREEN_INTENT declared although Play limits it to calling and alarm apps; the 4-press power button co-fires with Android's 5-press SOS.
- ADR-0046 (listening until paused) conflicts with the s4 'party' backstop, which only holds while the member is with the phone, and with the comparator pattern of user-armed or context-armed sensing.
- Whether a QS-tile tap or a notification tap reliably starts the microphone foreground service on Samsung One UI and Android 16 is untested on a device.
- Whether Google Play treats VUKA as personal safety rather than monitoring (Q-C6) is still an ASSUMPTION until a Play review.

## RECS
- Adopt the 'check on me' timer as the first new signal. Run it on the server (to avoid Doze) and deliver by high-priority FCM. It uses no audio, has the lowest legal and comfort risk, and mirrors Google Safety Check and Apple Check In.
- Make journey mode the default in decision D7. RICA s4 covers the member only while they are with the phone, every comparable product is armed by the user or by context, and Android already requires listening to be started on screen.
- Keep the non-speech and scream classes, but publish only measured numbers with method and n. Stop presenting scream detection as the main trigger; the duress PIN, the Emergency button and the timer carry the product.
- Park on-device keyword spotting and any speaker or voice ID. Send counsel a written question on keyword spotting under RICA s1/s2/s4 and on biometrics under POPIA s1/s26/s27 before any prototype.
- Add to the counsel pack: (a) whether a label-only output means 'contents' are made available under RICA; (b) whether the provider can rely on the member's s4 'party' status; (c) whether in-app consent counts as s5 written consent through ECT Act s12; (d) POPIA s57(1)(b) prior authorisation for incident data processed for banks or insurers; (e) s71 for any automatic bank or insurer action; (f) a s72 basis for Azure UAE North, or a move to South Africa North with an updated s18 notice.
- Fix the Play launch blockers: raise targetSdk to 36; replace the dataSync guardian standby with high-priority FCM; handle a denied USE_FULL_SCREEN_INTENT gracefully; record the Play foreground-service video showing the member starting protection on screen; request the battery-optimisation exemption under the documented 'safety app' case.
- Detect the device microphone toggle (silent audio) and a killed service, and tell the member at once. Say 'discreet, not invisible' and explain the status-bar mic icon in onboarding.
- Test the 4-press power button against Android's 5-press SOS and Samsung's SOS on the target budget devices before shipping. Do not use an accessibility service as a workaround.
- Prototype the content-free signals next: tamper and connectivity events while armed, media playing on the phone as evidence against a prompt, and a motion look-ahead window. Keep motion as corroboration only until it is measured.
- Avoid fall detection, struggle detection from motion, and continuous route learning for hijacking. Use a member-declared journey with an ETA instead, with IN_VEHICLE transitions as context only.
- Build comfort into the product: a one-screen plain-language explanation of what VUKA hears and sends; a public commitment never to sell location or derived data (the Life360 lesson); guardians can never start listening or locating on demand; the member can remove a guardian at any time; a duress PIN that never reveals itself.
- Before any figure in §4–§6 reaches a judge, investor or partner, verify each ⚑ item, and run a small consented South African comfort study (for example, women commuters) with n stated, because no African evidence was found.