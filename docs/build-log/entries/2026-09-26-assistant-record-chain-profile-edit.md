## 2026-09-26 | Claude Code (assistant) for operator mutarisi | Claude Code / claude-opus-5-5 | Android: on-phone record hash chain; Settings profile editor | done, partly device-tested

**Research** — Read RecordStore, RecordFragment, fragment_record.xml, SettingsFragment (EditNameSheet), InterimPasswordStore, raw/doc_record.txt, and docs/VUKA-2-SPEC.md on ANCHOR (§5 canonical form: "There is no Kotlin canonicaliser"; §10 anchoring is server-side to Hedera).

**Real data / references** — SHA-256 via `java.security.MessageDigest`. No figures added.

**Business reasoning** — The record is the product's evidence promise; showing on the phone that entries can't be quietly edited makes that promise visible before ANCHOR is live, and self-service profile edits cut support requests.

**Competitor reference** — Not applicable.

Changed:
- Record: `RecordStore` is now a SHA-256 hash chain on the phone (`v1|seq|kind|time|detail|prevHash`, genesis = 64 zeros). Older kind|time records are chained once on load. New kind `PROFILE_UPDATED` whose detail names the fields changed, never the values. Record tab shows "Chain intact · N entries" or "Chain broken at #k", each entry's #seq and short hash, and the chain head/sequence/last entry in Proof details. Copy states it is chained on this phone and not anchored; `doc_record.txt` updated to match, including that someone with full phone access could rebuild the chain.
- NOT blockchain anchoring: nothing is sent to Hedera. That needs the ANCHOR server (spec §10), which isn't connected. This chain is not ANCHOR's canonical format and must not be presented as ANCHOR evidence.
- Settings: Profile card with an initials avatar, name and "Edit profile · needs your PIN", plus mobile number and email rows. `EditProfileSheet` (replaces `EditNameSheet`; `dialog_edit_name.xml` removed, `dialog_edit_profile.xml` added) edits first name, surname, +27 number and email with the forms' validation; at least one of number/email must remain. A changed email is carried into `InterimPasswordStore` so email sign-in keeps working. Changed contacts are saved without a code (no SMS/email service); the sheet says so.

Evidence: `./gradlew :app:assembleDebug -q` → exit 0. On emulator-5554: Record showed "Chain intact · 10 entries" after migrating existing entries; changing entry #3's timestamp by 1 ms in `shared_prefs/vuka_record.xml` (via run-as) showed "Chain broken at #3"; the backup was restored and the tab read intact again. Settings profile card rendered (TD avatar, name, number "Not set", email). Tapping it opens the PIN sheet; the edit sheet itself was not opened on device (assistant doesn't know the emulator PIN) and profile saving is build-checked only.

Decision: operator request. Requiring the PIN to edit contact details is the assistant's choice (same pattern as inviting a guardian); a human should confirm. Whether an unverified number/email change is acceptable before SMS/email exist is also for a human.

Needs/blockers: real anchoring needs ANCHOR server + Hedera (owners per docs/VUKA-2-SPEC.md). Privacy notice doesn't yet mention the on-phone chain.

Business handoff: not applicable — no pricing or cost change.

Next: operator to open Edit profile with their PIN, change a field, and check a "Profile updated" entry appears in Record.

### Follow-up, same day: records you open; big profile circle

Changed: the Record tab lists records newest first (`RecordGroup`): each Activate → Deactivate is one "Active session" containing what happened during it; a profile change or a Hold for help alert outside a session is its own record. Each row shows start time, end or "Still active", event count and chain status. Tapping opens `RecordDetailFragment` (new nav destination `recordDetailFragment`), a view-only page: "View only" chip, chain check for that record (intact / broken here / can't confirm because it breaks earlier), and each event with time, #seq, full fingerprint and the fingerprint it links to (selectable to copy, not editable). Grouping is computed from the chain; nothing stored changes. Settings Profile is now a 104dp initials circle, name and "Edit profile · needs your PIN"; the separate number and email rows were removed (they're edited in the sheet).

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; on emulator-5554 the Record tab showed 5 "Active session" rows (chain intact); opening the newest showed #9 Activated and #10 Deactivated with full fingerprints and "Chain intact"; Settings showed the TD circle. Standalone profile/panic records not seen on device (none exist on this emulator yet).

### Follow-up, same day: bare profile circle; one "Welcome back"

Changed: Settings profile is no longer in a card and has no "Profile" label: a 120dp initials circle with a pencil badge (new `ic_pencil.xml`, ink pill background) and the full name below; tapping still needs the PIN before Edit profile opens (stated in the content description). The PIN screen after sign-in said "Welcome back" twice (header and card); the header is now "Enter your PIN", and its body no longer says "This number" (wrong for the Google and email routes).

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; Settings screenshot on emulator-5554 shows the circle, pencil badge and name. The PIN screen change is build-checked only (reaching it needs sign-out, which needs the PIN).

### Follow-up, same day: visual clean-up; Proof details removed

Changed: no arrow on "Get started" (welcome), "Finish setup" (invite guardians) or Activate; no × on Deactivate. Steps 3 (Phone number) and 5 (Your name) now use the same icon back button as the other screens (ImageView `ic_caret_left`, content description "Back") instead of a text "←". Record's "Proof details" card is removed, with its code and `item_proof_row.xml` (operator: the records and their chain check are the proof). Its "not anchored" statement moved into the chain status box: "Chained on this phone; not yet published to Hedera."

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; on emulator-5554 Home shows "Activate" with no arrow, and Record shows no Proof details, the new chain-status wording, and a "Terms accepted · Terms v0-draft and Privacy notice" record (from a sign-up the operator did, confirming the consent entry). Not seen on device: Get started, steps 3 and 5, Finish setup and Deactivate (build-checked).

### Follow-up, same day: centred headers; decorative icon and "Delete my data" removed

Changed: Home's greeting and first name are centred, and the decorative three-dots icon is removed (it did nothing; `ic_dots_three_circle.xml` deleted as unused). Settings shows only a centred "Settings" title (the "VUKA" label is gone). The "Delete my data" row under Privacy and data is removed (operator: it belongs with "Delete profile from this phone"). Server-side deletion (spec §9's 72-hour schedule) is not built; when ANCHOR exists it should be wired into Delete profile, as the code comment now says.

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; on emulator-5554 Home shows the centred greeting with no icon, Settings shows the centred title, and Privacy and data lists only Recovery, with Delete profile under Account.

### Follow-up, same day: Settings title removed

Changed: the "Settings" title is removed; the page starts with the profile circle (top margin dropped to 0). The bottom tab still labels the screen "Settings".

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; screenshot on emulator-5554 shows the page opening on the TD circle.
