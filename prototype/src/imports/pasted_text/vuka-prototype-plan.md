Plan an interactive, end-to-end prototype for VUKA, a South African personal-safety app. Build nothing yet. Propose the screen map, components, design tokens and the build order, then wait for my go-ahead.

What VUKA is (the plan must respect this)
VUKA has two parts:

VIGIL is an Android app for journeys. When the user arms a journey, it listens on the phone for distress sounds (screaming, shouting, glass breaking; gun-like sounds are PROPOSED). When it hears one, it shows a quiet "Journey check" asking for a PIN.
The user has two PINs. The normal PIN records a normal response. It doesn't prove the person is safe (it can be forced) and never closes an incident on its own. The duress PIN looks and behaves exactly the same on screen, but silently alerts the user's chosen guardians. It also sends a proposed risk signal to a partner bank, and the bank decides whether to add friction. In this demo the bank is SIMULATED.
If nobody answers the check-in, guardians are alerted.
ANCHOR writes every event into a tamper-evident personal record. Only typed 33-byte messages (a type byte plus a fingerprint) go on a public ledger (Hedera testnet), and no personal data goes on chain. Anyone can later verify when something was recorded. It never proves what happened.
The product is calm, honest and checkable. It never claims to prevent crime or to be "court-admissible", and never shows a "confidence %" or any probability of coercion.

Visual direction
Style: modern glassmorphism with soft 3D elevation. Rounded cards (20–24 px radius), frosted panels with background blur (16–24 px), a 1 px light inner edge at 18% white, and soft, wide shadows. The canvas behind the phone mockups is a clean light grey #F0F2F5.
Type: IBM Plex Sans throughout, in SemiBold, Medium and Regular.
Screen title: SemiBold 22–24.
Section header: Medium 16.
Essential phone copy is at least 16, and secondary labels at least 14.
Technical readings use IBM Plex Mono: hashes, times, scores, sequence numbers. Example: score 8120 bp · uncalibrated. They are 12 when decorative and 14 when the user must read them.
Icons: Phosphor. Regular weight in lists; Duotone weight on elevated hero cards. 24 px in touch targets.
Themes. The member chooses one in Settings. Each is a background artwork plus accent tokens:
Night contour (default): fine topographic contour lines, like terrain on a map, in slate blue at 35% on midnight, with a soft teal glow behind the active card. Record and verify screens add a faint linked-node chain motif (the hash chain).
Aurora: soft indigo, teal and violet light fields on midnight.
Guardian mesh: sparse linked light points in periwinkle on midnight.
White: plain, clean light background; glass becomes white frosted panels with a hairline border.
Modes, applied with every theme:
Midnight (dark, default): interiors #121820 → #1C2330, titles #FFFFFF, headers #E0E0E0, labels #C5CEE0.
Daylight (light).
High-contrast outdoor: near-white on black or black on white, no background art, no blur, 2 px strokes, and body text at least 16.
Colour meaning:
Deep forest green is reserved only for "verified" and "received". Nothing else is green.
Dark: #0D5C3A fill, #86EFAC text (5.7:1), #22C55E border only.
Light: #DCFCE7 fill, #065F46 text (7.0:1).
No red, no warning orange and no alarm styling on any member-facing screen. Pending or uncalibrated items stay neutral cool grey or blue.
One urgent colour, amber, exists only in guardian mode, for "Don't call or text them. Call 10111.": #FEF3C7 fill with #92400E text (6.4:1), in every mode.
State is never shown by colour alone: every status has an icon and a word.
Blur (Lethabo's choice: real blur everywhere in the design): every glass surface also has a solid frosted-tint twin (the same colours at 92% opacity, no blur).
The app shows real blur only on named, tested device profiles: Android 12+ (API 31+) and at least 55 fps sustained while a journey is armed (sensing running) and My Record is scrolling, for at least 10 minutes, recorded as evidence.
Unknown or struggling devices default to a fully opaque twin (100%), as does High-contrast mode.
The Settings toggle can only turn blur off.
Contrast is measured against the worst-case patch of background art behind each panel, on both the blurred and the solid version.
Accessibility: touch targets at least 48 px. Text contrast meets WCAG AA in every theme and mode, measured on the glass. Where it fails, increase the panel opacity. Motion: a gentle 200–250 ms ease-out for elevation and glow; nothing flashes or pulses.
The duress rule (non-negotiable)
The Journey check is quiet and plain in every theme and mode: flat, no glow, no elevated glass, no background art, no countdown, no alarming words.
One frame serves both the normal and the duress PIN. There is no duress variant, and none may be created. The result screen "Checked in · Journey continues" is one frame too.
While an incident is open, the member's phone never shows a guardian acknowledgement, a bank action or an incident entry, and never a notice that something is hidden. That covers My Record, notifications, previews and delivery chips.
Record metadata is held identically after ANY PIN entry at ANY prompt, normal or duress. New entries, receipts, the entry count, the anchor-proof card, the root and the sequence number stop updating for the next 6 hours in both cases, then update together. That way a normal PIN and a duress PIN look the same afterwards too. Needs Lethabo and Ipeleng's confirmation at P3.L8; annotate it as such.
"Download my record" is unavailable while the incident is open.
After closure, the incident shows only behind a fresh normal PIN. A duress-PIN session always sees the sanitised view.
Duress no-ops look identical to success. A guardian removal, a deletion or a recovery attempted under the duress PIN shows the same success toast, list state and Settings state as a normal one. A duress addition looks accepted (it creates a decoy). Draw only the immediate states. What a removed guardian or deleted data looks like after the 24-hour or 72-hour delay is an open decision for Lethabo and Ipeleng. Don't design those later states yet; add a placeholder frame marked OPEN.
The frame shows visual intent only. Parity of haptics, request shape and timing is checked in the React Native build (test T15). Annotate this on the Journey check frame.
No review controls on the phone. State switchers and review toggles sit outside the phone frame, on the canvas, and never appear on the mirrored demo phone.
The theme and mode never change because of duress.
Screens to plan
Each gets its loading, error, queued, no-network and empty states before the happy path.

Member app (VIGIL):

Welcome: what it does in three lines, and "Discreet, not invisible: Android shows a microphone dot."
Permissions: microphone, notifications, location (optional).
A separate denial outcome for each: mic or notifications denied means refuse to arm, with the reason; location denied means arming still works, without location.
The V4 fallback: when full-screen alerts aren't allowed, the check-in arrives as a high-priority notification.
Set PINs: normal PIN, then duress PIN, each with a plain explanation. A recovery code shown once (a 10-word card), only if recovery exists.
Guardians:
a list with pending and accepted states, and a recommendation of at least two guardians who don't live with you;
an invite with a 6-digit code and QR: single use, valid 10 minutes, 5 attempts. Include the expired and locked-out states;
"What your guardians will see";
PIN-gated changes; a removal shows "Scheduled: takes effect in 24 hours".
Home / Start journey (disarmed).
Journey active:
"Listening on this phone" and guardians ready;
"Last server contact 22:14" (a confirmed receipt, not a local heartbeat);
a no-network state: "No network. Alerts need data. Events wait on this phone and are lost if it's wiped before they're sent.";
End journey.
Journey check (quiet, plain): "Journey check", "Enter your PIN to continue", 4-digit dots and a keypad. One frame.
Checked in: "Checked in · Journey continues". One frame.
My Record:
a timeline of the member's own events (journey started, "Scream-like sound · uncalibrated" with a mono score line, check-in answered). Gun-like sounds appear only as sample data tagged PROPOSED;
delivery chips (queued → received only);
an anchor-proof card with three states: Live-verified · testnet (green), Archived: not independent (grey), Unavailable (grey). In the prototype, every result is tagged SIMULATED; "live-verified" is reserved for a real mirror-node check;
a root hash and sequence number in mono;
"Verify independently" and "Download my record".
Evidence assessment (only after an incident closes, and only behind a fresh PIN):
the reasons in plain words, each with its points in mono;
the total points, the response tier and the corroboration level (E0–E3);
this fixed statement: "Uncalibrated design tally. Not a probability or a finding about any person. A low total is not evidence that no coercion occurred."
No bands, gauges, percentages or colour scales.
Settings: theme and mode picker, a blur-fallback toggle, privacy notice, "Delete my data" (PIN plus a 72-hour cooling-off notice), recovery, and "About the record".
System states:
after a reboot the journey is disarmed; a notification offers "Re-arm" as the user's own action;
no network;
the persistent "VUKA journey active" notification. 12b. Server-owned outcomes on the member's phone. "No answer", a late normal PIN, a late duress PIN and lost contact each leave the member's screen unchanged: a late PIN still shows the same "Checked in". These outcomes appear only in guardian mode.
Guardian mode (same app, different role):

Enter an invite code, or scan the QR, with wrong-code, expired and locked-out states.
Consent: the privacy notice ("what is recorded about you: when you open an alert and how you respond") with an explicit acknowledge step. Annotation: the guardian's responses and notification-token updates are signed on the guardian's own device.
Standby: who you protect, and whether alerts are on.
Alert (the one urgent screen):
lead card in amber: "Don't call or text them. Call 10111.";
who, and why in plain words (for example "Scream-like sound, then no answer in 60 s");
the time in mono;
a location card only if the detection has a location fix: a static map snippet with accuracy and its age ("fix 2 min old"), age-stamped and greyed once stale. Otherwise "Location unavailable";
the alert's reason: "no answer to a check-in", "duress PIN entered", "duress PIN entered (late)" or "contact lost", with a "(late) answered" update when a late normal PIN arrives. The alert is never withdrawn;
primary action: "Call 10111" (opens the dialer); after the dialer returns, offer "I called 10111" (a signed acknowledgement), then I'm handling it and Stand down. Stand down opens a confirmation: "Only stand down if you know they're safe.";
a locked "Call them" button: "Unlocks after stand-down or when the incident closes".
Acknowledged: your response recorded, with the incident timeline as the guardian sees it.
Notification designs: the high-priority push alert, and the SMS fallback text.
Web (desktop, 1440 × 900):

/verify: a drop zone for a record file, then a result chip in one of three states (live-verified, archived, unavailable; the prototype tags each SIMULATED), or a failure naming the first broken entry by index. Plus a proof path (the list of hashes), the Hedera sequence and timestamp, and "What this proves: when, not what". Daylight and White by default; all modes available.
/panel (live demo): a dense, crt.sh-style table of opaque hashes, chain index, receipts and HashScan links, updating live. Event kinds and reasons appear only for simulated demo subjects, tagged SIMULATED.
Demo stage (1920 × 1080): the phone mirrored on the left, and /panel on the right showing the same events arriving live side by side. Every simulated item is labelled SIMULATED.
Insurer view (concept only): a member-granted, incident-only record package with guardians shown as "Guardian A". Tag the frame DESIGNED, NOT BUILT.
Theme gallery page: screens 6, 9, 16 and 19 in each of the four themes × three modes, plus the blur-fallback versions.

Components and tokens to propose
Components:
a glass card in three elevations;
a flat card for the Journey check;
status chips (verified, received, queued, neutral);
timeline item, PIN keypad, primary and secondary buttons (48 px), anchor-proof card, reason row (label + mono points);
map snippet, QR block, code input, toast, bottom sheet, list row;
notification card, table row (web), drop zone (web).
Tokens: colour per theme and mode, type scale, spacing (4-pt grid), radius (12, 20, 24), blur (0, 16, 24), elevation shadows (3 levels) and motion.
Copy rules (every string)
Plain, calm, short.
Never use: "invisible", "proof of duress", "court-admissible", "unhackable", "prevents crime", "sent" on its own, "confidence", "probability", "likelihood", "gunshot detected" (say "gun-like sound").
Tag simulated data SIMULATED, and anything not yet built PROPOSED. Every demo data surface keeps its tag visible.
Use South African examples: 10111, rand, local names such as Thandi and Sipho.
Propose the plan now: the screen map, the flows (including the server-outcome branches in 12b and 16), the component list, the token structure, and the build order in four slices:

A: tokens (Night contour × Midnight first) and components.
B: the safety-critical flows: member screens 5–10 and 12b, and guardian screens 13–18.
C: onboarding and settings (1–4, 11, 12).
D: web (19–21, then 22).
STOP after D. It is the Sunday-critical set.
E (optional polish, only if time allows): the other themes and modes, and the theme gallery. Night contour × Midnight, plus the White × Daylight verify page, are enough to submit.
Build nothing until I say "Build slice A".