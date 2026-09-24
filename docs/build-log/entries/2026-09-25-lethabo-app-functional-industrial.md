## 2026-09-25 | Lethabo (co-lead), via Claude Code assistant | App redesign: Functional Industrial theme, PIN-gated end, guardian preview | PROPOSED — for Mutarisi and Vukosi

**Research** — Three rounds of direction options, chosen by Lethabo: a Braun-era "functional industrial" look (warm graphite body, round keys, indicator lamps), with cobalt as the one signal colour because amber is reserved for guardian mode. Competitor scan (Namola, SaferCity Go, Life360, bSafe): arrival or journey-end notices and a guardian view are standard, and none of them triggers without a press.

**Real data / references** — Contrast computed by script (WCAG 2.x):
- title text `#ECEAE4` 14.2:1 on `#1B1C1E`;
- body `#B8B5AD` 8.3:1 on the background and 7.6:1 on panels;
- dim text `#8F8C85` 5.1:1;
- white on cobalt `#3D6FD6` 4.7:1;
- dark text on guardian amber 6.4:1.

**Business reasoning** — The phone is the demo. The Ivory look read like every other finance app. This one reads as a trusted device at night.

**Competitor reference** — Guardian "journey ended" and alert screens follow the category's arrival notices, with two differences: the ended notice says only that a PIN was entered, and the alert says VIGIL dispatches no one.

Changed:
- **Theme (replaces Ivory on the phone):**
  - graphite `#1B1C1E` and bone type;
  - one cobalt signal (the round Start key and the listening lamp);
  - green only for received or verified; amber only in guardian mode; no red on member screens.
- **Type:** Hanken Grotesk (words) and JetBrains Mono (times, counts, build label), both OFL, bundled with their licence files. IBM Plex removed.
- **Home:** the state word, a guardian list with lamps, and a round Start key on a plinth.
- **Journey active:** a breathing listening lamp (4.8 s cycle, off under the system's reduced-motion setting), a mono journey clock and a readout panel.
- **End journey now asks for the PIN (ADR-0041, G35).** It's one frame for both PINs, with no motion, and "Keep the journey going" cancels.
- **Guardian preview** (Settings → Guardian view, SIMULATED): standby, alert and ended states on the guardian's own amber ground. "Call Lerato" is inert in the preview and says so.
- **Keys:** pressing a key flips its top light and sinks it 3%. Every key, on every screen, behaves the same for both PINs.

Evidence: `npx tsc --noEmit` is clean for `src/`. The only errors are in `__tests__`, from missing jest types, and they existed before this change. `npx jest` passes 1/1, and every screen was walked through in the react-native-web preview.

Decision: the phone departs from the approved Ivory prototype (#66). Lethabo authorised the theme change. The web prototype isn't updated yet.

Needs/blockers: Mutarisi reviews it against the prototype and the P3.U1 checklist row. FLAG_SECURE (C-136) and haptics come in the native pass. A map after escalation is not built.

Business handoff: None.

Next: an emulator pass (dark theme is the only theme; font scale 1.3), then the live scorecard in Settings.
