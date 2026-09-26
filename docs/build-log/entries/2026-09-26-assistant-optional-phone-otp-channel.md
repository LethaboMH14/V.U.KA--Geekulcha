## 2026-09-26 | Claude Code (assistant) for operator mutarisi | Claude Code / claude-opus-5-5 | Android onboarding: optional phone on email route | done, not device-tested

**Research** — Read SignInFragment, EmailSignUpFragment, PhoneNumberFragment, VerifyCodeFragment, OnboardingViewModel, AccountStore and the Settings phone row.

**Real data / references** — Not applicable; no figures added.

**Business reasoning** — Lets people without a number they want to share (or who signed up by email) finish sign-up, so fewer drop out at step 3.

**Competitor reference** — Not applicable.

Changed:
- Phone number screen: on the Google and email routes the number is now optional ("Skip for now"). Phone route and sign-in still require it.
- Verify code screen: "Text message / Email" is shown on every sign-up route (hidden on sign-in). A skipped number defaults the code to email. Picking a channel with nothing on file opens a dialog to enter that email or +27 number (validated), then "sends" the code there (SIMULATED — no SMS or email is sent, as before).
- `AccountStore.isRegistered` no longer matches a blank number, so a skipped number can't land on "Welcome back".
- Sign-up copy and KDoc updated to say the number is optional on Google/email.

Evidence: `./gradlew :app:compileDebugKotlin -q` → exit 0. Not run on a device or emulator.

Decision: operator request. This departs from the earlier "every route verifies the +27 number" wording in SignInFragment; whether the spec (docs/VUKA-2-SPEC.md) should change to match is for a human to confirm.

Needs/blockers: a member with no number has no SMS path for alerts; Settings shows "Not set · can't be changed yet". Adding a number later is not built.

Business handoff: not applicable — onboarding flow only.

Next: operator to try the email route with Skip, and the phone route choosing Email.

### Follow-up, same day: pop-up styling

Changed: app-wide `materialAlertDialogTheme` → `ThemeOverlay.Vuka.Dialog` (values/styles.xml, both themes.xml): surface card, 28dp corners, ink bold title, secondary body text, `bg_button_primary` pill for the main action, quiet secondary-colour text button for the other. Applies to every MaterialAlertDialog (No account found, Are they safe?, etc.). The add-email/number pop-up now uses `dialog_contact_input.xml`: FieldLabel, Widget.Vuka.TextField, +27 pill and the forms' InlineError box.

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; installed on emulator-5554, opened the "Add your email" pop-up from the code screen and checked the normal and invalid-email states by screenshot (light/Ivory theme only; Midnight and Silver not checked).
