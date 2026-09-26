## 2026-09-26 | Claude Code (assistant) for operator mutarisi | Claude Code / claude-opus-5-5 | Android: terms consent at sign-up; recovery contact choice; forgot password | done, partly device-tested

**Research** — Read docs/VUKA-2-SPEC.md §9 (PIN authority and recovery, ADR-0036/0041: PIN recovery is a 10-word recovery code shown once at onboarding, guardians notified, 24 h freeze, blocked during an open incident; "if the recovery endpoint is cut, no code is shown at all"), SignInFragment, SignInExistingFragment, SettingsFragment, DocumentFragment, AccountStore, InterimPasswordStore. Searched docs/ for existing terms: none (only PRIVACY-POLICY.md).

**Real data / references** — Not applicable; no figures added.

**Business reasoning** — Recorded consent before collecting personal information lowers legal risk (POPIA), and a self-service password reset reduces lock-outs without weakening the PIN's protection against a coercer.

**Competitor reference** — Not applicable.

Changed:
- Terms: "Create your account" (step 2) has a required checkbox "I agree to the Terms and the Privacy notice"; Google/email/phone stay disabled (40% alpha) until ticked. "Terms" and "Privacy notice" open the documents. On completing registration a `TERMS_ACCEPTED` entry ("Terms v0-draft and Privacy notice") is written to the hash-chained record. "Terms and conditions" also added to Settings → Documents and your rights. `res/raw/doc_terms.txt` is a PLACEHOLDER that says so on its first line; no terms exist in the repo and the assistant did not write legal terms.
- Recovery (operator decision: follow the spec): PIN recovery is unchanged and remains recovery-code only (not built). Settings → Recovery opens a new screen with Email and Mobile number cards (masked values; a missing contact is disabled), pick one, Continue. It sets where an email-password reset code goes. Default at sign-up = the channel the sign-up code went to. If the chosen contact is later removed, the other is used. The screen explains the PIN is not reset by email/text and why.
- Forgot password: "Forgot password?" under the password on sign-in opens a sheet: email → "Send code" (only if that email has an email password on this phone) → code to the recovery contact (SIMULATED, any 6 digits) + new password twice → saved; a `PASSWORD_RESET` record entry ("via email"/"via mobile number"). The PIN is still required on "Welcome back".
- Document page header label is now "VUKA" (it's opened from sign-up too, not only Settings).

Evidence: `./gradlew :app:assembleDebug -q` → exit 0. On emulator-5554 (member profile had been deleted before this test, not by the assistant): Create your account showed the unticked box with options greyed; ticking enabled them; "Terms" opened the placeholder document. Sign in showed "Sign in with Google" and "Forgot password?"; Google with no profile showed "No account found"; the reset sheet rejected the address with "no VUKA account with an email password". Not seen on device: the Recovery screen (needs a signed-in member), a successful reset, the TERMS_ACCEPTED entry.

Decision: operator chose to follow spec §9 for PIN recovery and to add the email/mobile choice for password resets only. Checkbox (not "by continuing") is the assistant's recommendation; operator did not object.

Needs/blockers: real terms text (team + legal review) and a TERMS_VERSION bump when it lands; privacy notice should mention the recovery contact and the on-phone record chain; the recovery code itself needs the recovery endpoint (spec §9).

Business handoff: not applicable — no pricing or cost change.

Next: operator to register a test account, check Settings → Recovery, and try Forgot password end to end.
