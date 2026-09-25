## 2026-09-25 | Claude Code (assistant, at the request of the operator on branch feature/ui) | Claude Code / claude-opus-5-5 | Android onboarding UI — step 6 Permissions | built, not device-tested

**Research** — Read `prototype/src/index.css` (ivory tokens), `prototype/src/pages/onboarding/{Permissions,VerifyCode,shared}.tsx`, `components/ui/{GlassCard,Button,StatusChip}.tsx`, `contexts/OnboardingContext.tsx`, and every file under `app/src/main`. Audited the existing Android onboarding against the prototype palette.

**Real data / references** — Not applicable. No figures. Colour values are copied from `index.css` `:root` (FACT: source file).

**Business reasoning** — The phone app must really hold microphone and notification permission before VIGIL can arm. The screen asks for the phone's real runtime permissions instead of simulating them, which the pitch needs to be credible.

**Competitor reference** — Not applicable.

Changed:
- New: `PermissionsFragment.kt`, `fragment_permissions.xml`, `item_permission_row.xml`, the icons `ic_microphone`, `ic_bell`, `ic_map_pin`, `ic_gear`, `ic_caret_left` and `ic_warning_circle`, and `bg_status_dot.xml`. The colour `vuka_border_subtle` (#F0ECE4) is added.
- `AndroidManifest.xml`: adds RECORD_AUDIO, POST_NOTIFICATIONS, and COARSE and FINE location. Adds no USE_FULL_SCREEN_INTENT; that decision needs a human because Play policy restricts it.
- `nav_graph.xml`: adds the `permissionsFragment` destination. Nothing links to it yet because VerifyCodeFragment does not exist.
- Fixed 3 existing build breaks on the branch: `dialog_google_account_choose.xml` was missing `xmlns:app`. `GoogleAccountChooserDialog` called `setFragmentResult` with no receiver and never inflated its layout. `fragment_guardian_enrol.xml` referenced the colours `vuka_bg_dark` and `vuka_text_primary`, which do not exist.
- Deviation from the prototype: a chip reads "Not asked yet" until the system dialog has appeared once. This avoids reporting a permission as refused before anyone was asked.

Evidence: `./gradlew :app:assembleDebug` → EXIT=0 and produced `app-debug.apk`. It failed before the 3 fixes. Not run on a device or emulator (`adb devices` listed no device). No unit or instrumented tests were added.

Decision: none.

Needs/blockers: VerifyCodeFragment (step 5) is missing, so the Permissions screen cannot be reached through the flow. SetPins (step 7) is missing; for now Continue shows a Toast. A human must decide on USE_FULL_SCREEN_INTENT.

Business handoff: not applicable — internal UI build step.

Next: superseded by the follow-up below.

### Follow-up (same day): VerifyCode (step 5) and three palette fixes

Changed:
- New files: `VerifyCodeFragment.kt`, `fragment_verify_code.xml` and `values/styles.xml` (the CodeBox and KeypadKey styles), plus the drawables `bg_keypad_key` and `ic_backspace`. The navigation now runs PhoneNumber → VerifyCode → Permissions. PhoneNumber's placeholder Toast is removed.
- The verification is SIMULATED and says so on screen. No SMS is sent and any 6 digits continue. The wrong, expired and locked states are rendered, but nothing triggers them until a real check exists.
- Palette fixes:
  - `bg_button_primary`: the gradient was inverted. #2A4A73 is now at the top and #1A3354 at the bottom.
  - `bg_input_field`: the stroke is now `vuka_input_border` (#6F747D), the colour `index.css` requires for WCAG 1.4.11 contrast.
  - `bg_glass_card`: the corner radius is now 28dp to match `.glass-*`. This changes every screen that uses a card.

Evidence: `./gradlew :app:assembleDebug` → EXIT=0. Not run on a device. No tests were added.

Needs/blockers: an SMS provider is needed before verification can be real. SetPins (step 7) does not exist yet. A human must still decide on USE_FULL_SCREEN_INTENT.

Next: the operator chooses the next screen. No date is proposed.

### Follow-up 2 (same day): SetPins (step 7) and InviteGuardians (step 8). The onboarding flow is complete.

**Research** — Read `SetPins.tsx`, `InviteGuardians.tsx`, `PinKeypad.tsx` and `BottomSheet.tsx`. Checked `docs/COERCION-SCENARIOS.md` D07 ("Recovery is on the cut line; if it is cut, no code is shown") and `docs/CHECKLIST.md` P3.V3 (keystore work, owned by Vukosi).

Changed:
- New: `SetPinsFragment.kt` (with `SetPinsViewModel`), `InviteGuardiansFragment.kt`, `InviteGuardianSheet.kt` and `SimulatedQrView.kt`. New layouts: `fragment_set_pins`, `fragment_invite_guardians`, `dialog_invite_guardian` and `item_guardian_row`. New drawables: `ic_lock`, `ic_shield_warning`, `ic_users`, `ic_eye`, `ic_arrow_right`, `ic_x`, `bg_pin_dot_*` and `divider_subtle`. New styles: PIN key, PIN dot and StatusChip. `item_permission_row` now uses the StatusChip style.
- Navigation: Permissions → SetPins → InviteGuardians. Finish setup shows a Toast because Home does not exist on Android yet.
- **PINs are NOT STORED.** They are confirmed on screen and kept only in a screen-scoped ViewModel, never in a saved-state Bundle. They are cleared on Continue. `TODO(P3.V3)` marks where the keystore-backed store should receive them.
- **Recovery:** this builds the prototype's recovery-cut variant (a PROPOSED card, no words), following D07. The prototype's fixed ten words are not shown, because they would recover nothing.
- **Guardian invites are SIMULATED**, and the sheet says so. Completing an invite adds an "Invite N · Pending" row. The prototype's demo names (Sipho Ndlovu and others) are not used, so the list never shows a person who was not invited.
- Differences from the prototype: the prototype's no-network notice is omitted (the app has no network check yet). The PIN keypad resets after each 4-digit entry, whereas the prototype leaves 4 dots filled after a "must differ" error.

Evidence: `./gradlew :app:assembleDebug` → EXIT=0. `./gradlew :app:lintDebug` → EXIT=0 with 0 errors; warnings are hardcoded strings, SmallSp, UnusedAttribute, Overdraw and NestedWeights. Not run on a device. No tests were added.

Needs/blockers: P3.V3 PIN storage (Vukosi). Recovery stays cut until someone decides otherwise. There is no invite backend. There is no Home screen on Android. A human must still decide on USE_FULL_SCREEN_INTENT.

Next: the operator chooses whether Home (VigilHome) comes next. No date is proposed.

### Follow-up 3 (same day): Home screen (VigilHome), Ready and Journey active states

**Research** — Read `VigilHome.tsx`, `ListeningLine.tsx` and `BottomNav.tsx`.

**Business reasoning** — A safety app that looks armed when it isn't is the worst failure it can have. It hurts the user and it hurts judges' trust. On this screen, honest copy is worth more than a faithful copy of the prototype.

Changed:
- New: `ui/home/HomeFragment.kt` (with `HomeViewModel`), `ui/home/ListeningLine.kt`, `fragment_home.xml`, `ic_shield_chevron`, `ic_waveform` and `ic_dots_three_circle`. Finish setup now opens Home and clears onboarding from the back stack.
- **Ready**: built as designed. It has the time-of-day greeting, first name, the Ready hero with Start journey, the guardian counts and the microphone disclosure.
- **Journey active is SIMULATED, with honest copy.** It deliberately departs from the prototype. The eyebrow reads "VIGIL · SIMULATED" rather than "listening", and the body reads "Not listening. This build doesn't include the listener yet." The server chip reads "Not connected" rather than "Server reached", and the hardcoded "Last server contact 22:14 SAST" is dropped. The footer says no guardian will be contacted. The listening line is drawn still, because a drifting wave would signal listening.
- **Not built:** Journey check and Checked in, which need a detection trigger and stored PINs (P3.V3). Also not built: BottomNav, whose only other tab (ANCHOR/MyRecord) does not exist.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. Not run on a device. No tests were added.

Needs/blockers: the listener (foreground mic service plus detection) and the server/alert path are needed before Journey active can be real. P3.V3 is needed for Journey check. Nothing persists, so the app starts at Welcome on every launch.

Next: the operator chooses the next item. No date is proposed.

### Follow-up 4 (same day): guardian Enrol, Standby and Acknowledged

**Research** — Read `pages/guardian/{Enrol,Standby,Acknowledged}.tsx`, `TimelineItem.tsx`, and the ScannerFrame in `shared.tsx`.

Changed:
- Replaced the `EnrolFragment` stub. New: `StandbyFragment.kt` (with `LeaveGuardianSheet`), `AcknowledgedFragment.kt` and their layouts, plus `dialog_leave_guardian.xml`, `item_timeline.xml`, 9 icons, 3 drawables and the colour `vuka_link` (#1E3A5F, from `index.css`).
- Navigation: Welcome "I'm a guardian" → Enrol → Standby, which clears the back stack. Standby → Acknowledged. Leave → Welcome.
- **Enrol**: code entry or a scan tab, then an explicit consent checkbox. The code is SIMULATED: any 6 digits continue, and the scanner opens no camera. Both are labelled on screen. The wrong, expired and locked states are not built.
- **Standby — deviates from the prototype.** It shows no member name ("Not linked yet") in place of the demo name. Alerts reads "Not connected" instead of an On/Off toggle. Last test alert reads "None yet" instead of a hardcoded 2026-09-18 timestamp. "Send a test alert" is disabled, because the prototype's "Test alert sent" toast would be false.
- **Acknowledged — a SIMULATED EXAMPLE**, reached from a preview link on Standby that the prototype doesn't have. It has no timestamps (AGENTS.md rule 4). The seal and the "received" steps are neutral instead of green, because green is reserved for real verification (StatusChip.tsx). It reads "Not signed" instead of "Signed on this device". "Call them" stays locked, as designed.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. Not run on a device. No tests were added.

Needs/blockers: an invite backend (code lookup and member link), the alert server (alerts and test alerts), guardian device signing, and a real alert screen (GuardianView, not built) that would lead to Acknowledged.

Next: the operator chooses the next item. No date is proposed.

### Follow-up 5 (same day): guardian alert screen (GuardianView)

**Research** — Read `pages/GuardianView.tsx`. The prototype already marks this screen SIMULATED.

Changed:
- New: `GuardianAlertFragment.kt` (with `StandDownSheet`), `fragment_guardian_alert.xml`, `dialog_stand_down.xml`, `ic_phone`, `ic_prohibit` and `bg_amber_card`. Adds the colours `vuka_amber_fill` (#FEF3C7) and `vuka_amber_text` (#92400E) from `index.css`, used only on this screen.
- Navigation: the Standby preview link now opens this alert, reading "Preview what an alert looks like". After a response, a "See the timeline" link opens Acknowledged. Acknowledged's "Back to standby" now pops to Standby explicitly.
- Kept from the prototype: the SIMULATED chip, the amber "Don't call or text them. Call 10111." card, Who/Why, the location card, the new → called → handling → stood-down flow with its confirmation sheet, and "Call them" locked.
- Deviations:
  - "Example member" replaces the demo name, and the made-up "22:14 SAST" is dropped.
  - "Signed on this device" in green became neutral text: "Response recorded. Not signed: device signing isn't built yet."
  - The stood-down seal is neutral, not green.
  - **"Call 10111" does not open the dialer in this preview**, so a demo screen cannot start a real police call. The code comment says a real alert should use ACTION_DIAL tel:10111, which pre-fills the number and never places the call.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors, before the two small follow-up fixes. The follow-up rebuild → EXIT=0. Not run on a device. No tests were added.

Needs/blockers: real alert delivery (push/SMS to the guardian's device), guardian device signing of responses, and the incident state that would unlock "Call them" after stand-down.

### Follow-up 6 (same day): bottom nav, Record (ANCHOR), Settings and the Midnight theme

**Research** — Read `pages/MyRecord.tsx`, `pages/settings/Settings.tsx`, `AnchorProofCard.tsx`, `BottomNav.tsx`, `anchor/README.md` (ANCHOR being built from 24 Sep, owner Sibusiso), `docs/PRIVACY-POLICY.md` and `docs/security/POPIA-ONE-PAGER.md` (both PROPOSED).

**Real data / references** — Midnight colour values are copied from `index.css` `[data-theme='midnight']` (FACT: source file). The document text is copied from `docs/PRIVACY-POLICY.md` (PROPOSED).

**Business reasoning** — The Record and Settings pages let a judge see the evidence and rights story on the phone. Because the app only shows what is real (local entries, not anchored; a PROPOSED notice), a judge who checks it will find it true.

Changed:
- **Bottom nav**: a Home / Record / Settings pill in `activity_main.xml`, styled like BottomNav.tsx, wired in `MainActivity`. It shows only on those three destinations.
- **Journey state** moved to an activity-scoped `JourneyViewModel`, so it survives tab switches and theme changes. `HomeViewModel` is removed. Start/End journey now appends timestamped entries.
- **Record** (`ui/record/RecordFragment.kt`, `fragment_record.xml`, `item_proof_row.xml`): the timeline shows this phone's real journey taps, labelled "on this phone only · not anchored", newest first. The evidence line is qualified ("Once anchored…"). Proof details read "Not anchored · Not connected", with empty hash/sequence/recorded rows. The prototype's example entries, hash `a3f8…c219` and sequence `#4121` are not shown.
- **Settings** (`ui/settings/SettingsFragment.kt`, with `EditNameSheet`):
  - Profile: the name can be edited, with YourName's validation. The phone number is shown but read-only until SMS exists.
  - Guardians: the invites, plus "Invite a guardian", which reuses InviteGuardianSheet.
  - Appearance: the theme choice.
  - Documents and your rights: Privacy notice, Your rights and About the record.
  - Privacy and data: Recovery and Delete my data, each saying why it is unavailable. The prototype's any-PIN-succeeds gate is not built.
- **Documents** (`DocumentFragment.kt`, `res/raw/doc_*.txt`): the text is copied word for word from `docs/PRIVACY-POLICY.md` with only the `[Source: …]` references removed. A PROPOSED / not-legal-advice banner appears on every document. One change: "About the record" uses the policy's "32-byte root in a typed 33-byte message", not the prototype's "33-byte fingerprint of each entry". The raw files must be updated by hand when the policy changes.
- **Theme**: `values-night/colors.xml` holds the Midnight palette, and `values-night/themes.xml` now keeps VUKA's theme items (before, dark mode dropped them). `ThemePrefs` saves Ivory / Midnight / System and applies it through `AppCompatDelegate` before the first frame. Ivory is the default. Silver is not offered, because a third palette needs every layout moved to theme attributes.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors, before the final cleanup. The rebuild after the cleanup → EXIT=0. **Not run on a device. Midnight has not been checked visually on any screen.** No tests were added.

Needs/blockers: ANCHOR integration (Sibusiso) for real anchoring, verification and export. P3.V3 for the PIN-gated settings. Nothing persists except the theme, so the record and profile reset on relaunch. A human needs to approve the privacy notice (owner Ipeleng; still PROPOSED) and set a contact route.

### Follow-up 7 (same day): verify-first onboarding, stay signed in, PIN-gated actions

**Research** — Read `docs/PIN-AUTHORITY-RULES.md` (PROPOSED, ADR-0040), `VUKA-2-SPEC.md` §2 (G1), §9 and §17, `OPEN-GAPS.md` G24, ADR-0008, ADR-0041 (G35, T47), and the `CHECKLIST.md` row P3.V3 (Vukosi: Keystore signer).

**Business reasoning** — Phone-first verification matches the apps members already use. PIN gates on protection-weakening actions are the product's anti-coercion promise, which a judge can now try on the phone.

Changed:
- **Onboarding order (both journeys)**: Welcome → Sign in (Google/email or phone) → Phone number (step 3) → Verify code (4) → **new number**: Your name (5, pre-filled on the Google journey) → Permissions → Set PINs → Invite guardians → Home. A **number already registered on this phone** goes to a new `WelcomeBackFragment` (PIN sign-in) → Home. The used code is popped, so Back from the next step returns to the phone number. The phone screen shows the chosen Google account on the email journey. The chooser now returns an email (SIMULATED).
- **Stay signed in**: new `auth/AccountStore` (app-private SharedPreferences) holds the profile and session. `OnboardingViewModel` is now an `AndroidViewModel` that loads from and saves to it. `MainActivity` sets the graph's start destination from the session: Home, guardian Standby or Welcome. Guardian enrol and leave save and clear the session.
- **PIN authority**: new `auth/PinAuthority` interface. **`InterimPinStore`** (salted PBKDF2-HMAC-SHA1, 50,000 iterations, constant-time compare against both hashes) **stands in for the spec's Argon2id + Keystore store (P3.V3, Vukosi)**. It is not that store, and a 4-digit PIN is brute-forceable offline from the app's files. SetPins now saves through it.
- **PIN gates** (`auth/PinGateSheet`): the same sheet for normal and duress PINs, and the same "Try again" for a wrong one (T47). Gated: **ending a journey** (ADR-0041), **inviting a guardian** (G1: onboarding and Settings), and **Sign out of this phone** (new Settings → Account row). Every duress outcome looks identical on screen. Duress calls `DuressSignals.raise()`, which is a no-op until an alert path exists: **a duress PIN currently alerts no one**. Duress sign-out leaves a running journey going unseen. The duress invite decoy is server-side and not built.
- **Backups**: `backup_rules.xml` and `data_extraction_rules.xml` now exclude `vuka_pin_interim.xml` (PIN hashes never leave the phone) and `vuka_account.xml` (restored without its PINs, every gate would fail).
- "Delete my data" now says it needs the ANCHOR server. The sign-out row makes no claim that guardians are notified, because nothing can notify them yet.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. The rebuild after the backup-rule edit → EXIT=0. Not run on a device. No tests were added: the PIN store, gates and session routing have **no automated tests**.

Needs/blockers:
- Vukosi (P3.V3) to replace `InterimPinStore` behind `PinAuthority`, with Ipeleng on the cryptography.
- A decision on duress sign-out semantics.
- An alert path so `DuressSignals` sends something.
- Account lookup across phones, and recovery on a new phone (spec §9), both of which need the server.
- Journey entries are still in memory only.

### Follow-up 8 (same day): manual panic, with a hold button on Home and a Quick Settings tile

**Research** — ADR-0008 lists "manual panic" as a feature. `VUKA-2-SPEC.md` defines no panic event, so there is nothing yet to send.

**Business reasoning** — A member in danger needs help within seconds, without signing in. The honest fallback to 10111 keeps a useful action on screen until alerts are connected.

Changed:
- New `panic/` package:
  - `Panic` records the alert, then calls `AlertPath.sendPanic()`, **a no-op until a panic event is added to the spec (team decision) and an alert path exists**.
  - `HoldToAlertButton` fires only after a 2-second continuous hold. Releasing cancels, and there's haptic feedback on start and on firing. TalkBack users get a "Send alert" accessibility action that fires directly.
  - `PanicActivity` is the panic screen, shown over the lock screen (`showWhenLocked`). It runs in its own task (`taskAffinity=""`), is excluded from Recents, and shows nothing private.
  - `PanicTileService` is the Quick Settings tile "VUKA alert". It works from the lock screen without an unlock, and is unavailable unless someone is signed in as a member. It uses the PendingIntent `startActivityAndCollapse` on API 34+ and the Intent overload below that, with the lint check suppressed for that case.
- **The panic screen tells the truth.** "Call 10111 now", followed by "alerts aren't connected in this build yet. Your guardians have not been contacted", with a "NOT SENT" chip. The main button opens the dialer with 10111 filled in (ACTION_DIAL never places the call).
- Home: a hold-for-help button in both the Ready and Journey active states.
- **Record is now saved on the phone**: new `ui/record/RecordStore` (SharedPreferences, process-wide, shared by the panic activity and the tabs). It records journey start/end and "Alert raised · not sent". `JourneyViewModel` is now an `AndroidViewModel` backed by it. Whether a journey is running is still not saved.
- Backups: `vuka_record.xml` is excluded as well, because it holds panic times and the privacy notice doesn't mention Google backup.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. The first run failed on `StartActivityAndCollapseDeprecated`, which was fixed with a suppression on the pre-34 branch. The rebuild after the backup-rule edit → EXIT=0. **Not run on a device**: the hold gesture, the tile, and the screen showing over the lock screen have not been tried on hardware. No tests were added.

Needs/blockers: a panic event in the spec (team decision) and an alert path. The journey-notification action waits for the real foreground listening service (Vukosi). A home-screen widget is not built.

### Follow-up 9 (same day): "Delete profile from this phone" (Settings → Account)

Changed: a PIN-gated row that wipes the saved profile and session (`AccountStore.clear`), the interim PIN hashes (`InterimPinStore.clear`), the record (`RecordStore.clear`), a running journey (`JourneyViewModel.reset`) and the theme choice (`ThemePrefs.reset` → Ivory), then returns to Welcome. The operator requested it so onboarding can be re-run for testing. **A duress PIN only signs out**, following PIN-AUTHORITY-RULES §3 ("Delete evidence under duress: looks done, does nothing"). This is local only: the spec's real deletion (72-hour cooling-off, guardians notified, residuals kept) needs the server and is still not built. If the PIN is forgotten, Android's "Clear storage" for the app does the same wipe.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. Not run on a device.

### Follow-up 10 (same day): operator feedback on the button artifact, guardian invite PIN, themes and the guardian alert

**Research** — Reproduced on the operator's emulator (`emulator-5554`) with `adb` screenshots before changing anything.

Changed:
- **Grey rectangle behind "Get started"**: this was Android's default focus highlight around a button whose custom background had no focus or press state. `bg_button_primary` and `bg_back_button` are now ripples with rounded masks. They show rounded press feedback, and the rectangle is gone (seen on the emulator after the fix).
- **No PIN when inviting a guardian during onboarding**: the PINs were set in the previous step, which counts as the fresh authorisation spec G1 asks for. Settings invites still need the PIN. This is my reading of the operator's "password on guardian setup".
- **Silver theme**: new `values/attrs.xml` defines six theme attributes (bg base, elevated, border ×3, action). The 69 layout and drawable references now use `?attr/`. Ivory and Midnight map them to the existing colours, and `ThemeOverlay.Vuka.Silver` supplies the index.css Silver values. `ThemePrefs` now offers Ivory / Silver / Midnight / System and recreates the activity when needed. `vukaColor()` resolves the swappable tokens in code. Silver was checked on the emulator. As in the prototype it is subtle, and "System" matches Ivory on a phone in light mode.
- **Guardian alert**:
  - Added a back button and "Back to standby".
  - The call-lock caption now gives the reason (their phone ringing could endanger them) and says the guardian can still use their phone freely.
  - Stand-down is a plain "Are they safe?" dialog: "Yes, stand down" stands down immediately, and "No" leaves the alert unchanged. The bottom sheet was removed.
  - After stand-down, "Call them" unlocks (spec G4) and opens the dialer. The preview has no member number, so the dialer opens empty.
- Checked end to end on the emulator: guardian enrol → Standby → alert preview → Call 10111 → I called → Stand down → Yes. The screen showed "Stood down" and an enabled "Call them".

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. Emulator screenshots were taken of Welcome, the stand-down dialog, the stood-down state and Home in Silver. Midnight and the member PIN flows were not re-checked on the emulator this round. The emulator's app data was wiped at the end (it starts at Welcome).

### Follow-up 11 (same day): "Stop being a guardian", and the primary-button tint bug

Changed:
- Guardian Standby: the bottom "Leave as guardian" button, which the operator read as possibly meaning "exit the app", is replaced by a **"Your guardian role"** section. It holds a settings-style row, **"Stop being a guardian"**, with the sublabel "You won't get their alerts any more". The confirmation sheet is now titled "Stop being a guardian?", states the consequence (alerts stop, the phone returns to the start screen, and a new invite is needed to rejoin), and offers opposite choices: "Stop being a guardian" / "Keep being a guardian" in place of Leave / Cancel.
- **Bug fixed in all 13 custom-background MaterialButtons**: the layouts set `android:backgroundTint="@null"`, which MaterialButton ignores, so the theme's primary colour tinted over `bg_button_primary`. In normal screens this looked like flat ink and hid the gradient; in bottom sheets the button was almost invisible (seen on the emulator). They now use `app:backgroundTint="@null"`, and the gradient renders as designed.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. Emulator screenshots of Standby and of the confirmation sheet before and after the tint fix.

Needs/blockers: **Guardian self-removal is not in the spec.** PIN-AUTHORITY-RULES covers only removals the member makes: a 24 h delay, silence, and never leaving zero guardians. Undecided: whether the member is told when a guardian steps down, and what happens if that guardian was their last one. Both need a spec decision (owners: Ipeleng/Lethabo).

### Follow-up 12 (same day): one person can be both a member and a guardian

**Research** — `VUKA-2-SPEC.md` G1 ("Guardian mode (same APK)") and §4a (a guardian key separate from the device key). Nothing in the spec makes the two roles exclusive.

Changed:
- `AccountStore`: the exclusive `session` (NONE/MEMBER/GUARDIAN) is replaced by two independent flags, `memberSignedIn` and `guardianEnrolled`. The old value migrates on first read; this was checked on the emulator, where `GUARDIAN` became `guardian_enrolled=true`. Member sign-out leaves the guardian role alone, and "Delete profile" still wipes both.
- Start screen: member → Home (their guardian role is reached from Settings); guardian-only → Standby; neither → Welcome.
- **Member → also a guardian**: Settings has a new "Guardian for others" section with "Protect someone" (enrol with an invite code) or, once enrolled, "Guardian standby". Enrolling from Settings keeps the member app underneath (new action `action_guardianEnrol_to_standbyKeepMember`). Standby shows a back button ("Back to my VUKA") when a member account exists.
- **Guardian → also a member**: guardian-only Standby shows "Set up VUKA for yourself" ("You stay their guardian"), which runs member onboarding.
- **Stop being a guardian**: for a member, it returns to their Home, and the sheet says "Your own VUKA account and guardians aren't affected". For a guardian-only phone, it returns to Welcome as before.
- Welcome's "I'm a guardian" on an already-enrolled phone goes to Standby instead of a second enrolment.

Evidence: `./gradlew :app:assembleDebug :app:lintDebug` → EXIT=0, 0 lint errors. **Run end to end on `emulator-5554`**:
1. Guardian-only Standby → "Set up VUKA for yourself".
2. Full member onboarding: phone, code, name, permissions (all allowed), PINs 1111/2222, Finish.
3. Home, with both flags true.
4. Settings → "Guardian for others" → Guardian standby, whose back button returned to Settings.
5. Stop being a guardian → Home, with `member_signed_in=true` and `guardian_enrolled=false`.

Not exercised: "Protect someone" from Settings (enrolment while signed in as a member).

Needs/blockers: whether the member is told when a guardian steps down, and the last-guardian case (spec gap, noted in follow-up 11). With one phone per person, a guardian's alerts and the member's own journey share the device, so the spec owners should confirm that V8 (no guardian acknowledgements shown on a member phone during an incident) only concerns acknowledgements of that member's own incidents.
