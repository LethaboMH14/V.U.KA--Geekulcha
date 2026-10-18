## 2026-09-24 | Lethabo (co-lead), via Claude Code assistant | App UI pass 2: critique fixes, Android hardening, fonts and icons | PROPOSED — for Mutarisi and Vukosi

**Research** — A design critique of the React Native port against the approved prototype (#66), plus Google's official `android-intent-security` skill run against the manifest.

**Real data / references** — Contrast measured by script:
- title text 14.3:1;
- secondary text 5.7:1 on the background and 6.3:1 on cards;
- dim text 5.1:1;
- the new control edge `#8F897E` 3.13:1 on ivory, which meets WCAG 1.4.11 for key and ghost-button edges (it was 1.1:1).

**Business reasoning** — The phone is the demo. A generic look undercuts it.

**Competitor reference** — Not applicable.

Changed:
- **UI:**
  - IBM Plex Sans and Mono bundled as Android font assets (OFL, with the licence file);
  - Phosphor icons (`phosphor-react-native`, MIT) on `react-native-svg` (MIT);
  - an SVG ambient light field and a gradient primary pill;
  - daylight-readable key edges;
  - a ⋯ menu leading to Settings, whose "Security & privacy" row says no number is shown until the live scorecard computes one;
  - the build label read from `package.json` (0.0.3).
- **The demo trigger** is visible only in `__DEV__` builds. Release builds keep a hidden long-press on "Journey active" (prototype rule: no demo controls on the phone).
- **Android hardening (intent-security skill):**
  - `dataExtractionRules` and `fullBackupContent` exclude everything from cloud backup and device-to-device transfer (`allowBackup=false` alone doesn't stop D2D transfer on API 31+; T42);
  - `usesCleartextTraffic="false"` stated for release (debug keeps it for Metro through `tools:replace`).
- **Jest:** `transformIgnorePatterns` and a `moduleNameMapper` work around phosphor-react-native 2.1.0's `main` field, which points at a file that exports only `Icon`. Metro reads the package's `react-native` field and is unaffected.

Evidence: `npx tsc --noEmit` is clean and `npx jest` passes 1/1. The manifest audit found only the launcher exported, the INTERNET permission only, and no providers, receivers or services.

Decision: none.

Needs/blockers: Mutarisi reviews it against the prototype. FLAG_SECURE (C-136) and Reanimated motion come in the native pass.

Business handoff: None.

Next: Settings → Security & privacy fetches the live scorecard once it's published.
