## 2026-09-24 | Lethabo (co-lead), via Claude Code assistant | VIGIL member screens ported to React Native | PROPOSED — for Mutarisi (UI owner) to adopt

**Research** — Ported from the design reference (`prototype/src/pages/VigilHome.tsx` and `src/index.css`, PR #66): the Ivory tokens with their audited contrast values, the double-bezel hero card, pill buttons with a trailing orb, and status chips that always pair a mark with a word.

**Real data / references** — No measurement. All data on screen is SIMULATED (sim guardians) and says so on screen.

**Business reasoning** — The demo phone needs the real screens, not the web prototype.

**Competitor reference** — Not applicable.

Changed:
- `app/src/ui/theme.ts`: the Ivory tokens, radii, type scale and the 48 dp minimum touch target.
- `app/src/ui/components.tsx`: `Card` (with the hero bezel), `Button`, `StatusChip`, `Leaf`, and a `PinKeypad` that never knows which PIN is which.
- `app/src/ui/screens.tsx`: the Home "Ready" state, "Journey active", "Journey check" (flat, one frame for both PINs) and "Checked in".
- `App.tsx`: renders these screens.

No new dependencies. Icons, blur and motion come with the native pass.

Evidence: `npx tsc --noEmit` is clean and `npx jest` passes 1/1. A signed `assembleRelease` builds (26.6 MB, arm64 and armv7).

Decision: none.

Needs/blockers:
- Mutarisi reviews against the prototype.
- `FLAG_SECURE` on the check-in and PIN screens (C-136), in the native pass.
- T15 parity harness.

Business handoff: None.

Next: onboarding and My Record, the contract v2 client, and the native Keystore signer.
