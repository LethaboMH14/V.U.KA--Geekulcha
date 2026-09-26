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
