## 2026-09-26 | Claude Code (assistant) for operator mutarisi | Claude Code / claude-opus-5-5 | Android UI copy and flow | done, not device-tested

**Research** — Read HomeFragment, fragment_home.xml, JourneyViewModel, GuardianAlertFragment, GuardianAlerts, AcknowledgedFragment, RecordFragment. Existing pattern kept: ending still goes through the PIN gate (ADR-0041).

**Real data / references** — Not applicable; no factual claims or figures added.

**Business reasoning** — Fewer words and one fewer tap in an emergency: a guardian under stress should not have to confirm a call they just pressed.

**Competitor reference** — Not applicable.

Changed:
- Home: "Start journey" → "Activate"; active state title "Journey active" → "Active"; "End journey" → "Deactivate" (still PIN-gated). Supporting copy and Record labels ("Activated · simulated" / "Deactivated") updated to match.
- Guardian alert: pressing "Call 10111" now records the call at once and moves to the handling state. The "I called 10111" confirmation step and `Ack.CALLED` are removed. Timeline example reads "Called 10111 — recorded when Call was pressed" instead of "self-reported". The preview still does not open the dialer.

Evidence: `./gradlew :app:compileDebugKotlin -q` → exit 0. Not run on a device or emulator.

Decision: none (requested by operator).

Needs/blockers: none.

Business handoff: not applicable — UI copy/flow only.

Next: operator to check both flows on a device.

### Follow-up, same day: stand down without calling 10111

Changed: the guardian alert offers "Stand down" from the start, under "Call 10111", for when the notification alone was enough. The "Are they safe?" confirmation adds "10111 won't be called from this alert." when used before calling. `GuardianAlerts.called` records whether Call 10111 was pressed; the status reads "Stood down without calling 10111. You confirmed they're safe." in that case, and the example timeline link (which shows "Called 10111") is hidden. Stand down is still confirmed and "Call them" still only unlocks after it (spec G4).

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; on emulator-5554: Simulate an incoming alert → Stand down → Yes, stand down; screenshots show the button, the dialog text and the new status line. Call-then-stand-down path not re-checked on device.

### Follow-up, same day: Home stays on one layout

Changed: Home no longer swaps to a separate "Journey active" screen. The hero card's button toggles in place: ink "Activate →" pill, then an outlined "Deactivate ×" pill (new `bg_button_secondary.xml`), still PIN-gated (ADR-0041). The card's label/title/body switch to the existing simulated wording ("VIGIL · SIMULATED", "Active", "Not listening. This build doesn't include the listener yet."). Hold for help, Guardians ready and the guardian row stay visible in both states. The old active-state block (with its "Not connected" guardian list) was removed; `ListeningLine.kt` is now unused.

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; on emulator-5554 tapped Activate (screenshot shows same layout with Deactivate), then Deactivate opened the PIN sheet. Correct-PIN deactivation not tried (PIN unknown to the assistant).

### Follow-up, same day: listening wave while Active

Changed: the hero card shows `ListeningLine` under "Active", and the wave now drifts (2.4 s loop, edge fade held in place). It is hidden in Ready, stops when off-screen, and stays still when the phone's animations are off. This reverses the earlier "drawn still on purpose" choice at the operator's request; the card keeps "VIGIL · SIMULATED" and "Not listening. This build doesn't include the listener yet." beside it, and that wording must stay until a real listener exists.

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; on emulator-5554 two screenshots 0.6 s apart after Activate differ in the wave region and not in the rest of the page.

### Follow-up, same day: guardian Call 10111 opens the dialer

Changed: the guardian alert's "Call 10111" now opens the phone dialer with 10111 filled in (`ACTION_DIAL`), matching the panic screen, and still records the press on the first tap. The button and its note ("Opens your phone's dialer with 10111 ready. Press call there.") stay visible after the first press so the dialer can be reopened. Status reads "You pressed Call 10111, recorded." rather than claiming a call happened.

Why not call directly: Android's `Intent.ACTION_CALL` reference states it cannot be used for emergency numbers; apps must use `ACTION_DIAL`, so the second press in the dialer is required. The operator confirmed matching this behaviour in both places.

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; on emulator-5554 Simulate an incoming alert → Call 10111 opened com.google.android.dialer with 10111 entered (call not placed); returning showed the recorded status, Call 10111 and Stand down.

### Follow-up, same day: one-tap Emergency button replaces Hold for help

Changed: Home's 2-second "Hold for help" (`HoldToAlertButton`, now deleted) is replaced by an outlined "Emergency · call 10111" button. One tap records the panic (`Panic.raise`, source renamed `HOME_BUTTON`) and opens the dialer with 10111 (`ACTION_DIAL`); it no longer goes via the panic screen (the Quick Settings tile still does). Caption: "Opens your dialer with 10111 ready. Press call there." Record label is now "Emergency alert · not sent"; Record empty text and doc_record.txt updated.

Trade-off: the hold existed so a pocket or stray tap couldn't raise an alert. A stray tap still can't place a call (Android requires the press in the dialer), but it now writes a panic entry to the record, and once the alert path exists (`AlertPath.sendPanic`, still a no-op) a single tap would alert guardians. The spec has no rule on hold vs tap; this is the operator's choice and the team should revisit it before the alert path is connected.

Evidence: `./gradlew :app:assembleDebug -q` → exit 0; on emulator-5554 one tap opened com.google.android.dialer with 10111 entered (call not placed), and Record then listed "Emergency alert · not sent".
