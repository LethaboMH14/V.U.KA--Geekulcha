# VUKA interactive prototype (design reference)

**Status:** `PROPOSED` design reference, 24 Sep 2026. It is **not** the shipped app. It's a web (React) prototype of every VIGIL, guardian and ANCHOR screen, built so the team can agree how the product looks and behaves before `app/` (React Native 0.74) is built. Everything that looks like a result is **SIMULATED**, and anything not yet built is tagged **PROPOSED** on screen.

## Run it

```bash
cd prototype
npm ci
npx vite --host 127.0.0.1 --port 5174
```

Open http://127.0.0.1:5174. The demo controls **beside** the phone (never on it) switch role, theme, journey state, PIN type, anchor result, network and every error state.

## What's in it

| Route | Screens |
|---|---|
| `/welcome` → `/welcome/guardians` | Onboarding in 8 steps:<br>1. welcome<br>2. sign-in with Google (SIMULATED) or phone<br>3. name<br>4. +27 phone<br>5. SMS code, with resend, wrong, expired and locked-out states<br>6. permissions, with a denial outcome for each<br>7. normal PIN, duress PIN and a one-time recovery code<br>8. guardian invites with code and QR |
| `/` | Home: ready, journey active (with the listening line), the Journey check, and checked in |
| `/anchor` | My Record: the timeline, and the anchor-proof card in its three states |
| `/settings` | Theme and blur; guardian changes behind a PIN (removal after 24 h); delete my data (72 h cooling-off) |
| `/guardian/*` | Enrol (code or scan, then consent), standby, the alert ("Don't call or text them. Call 10111."), and acknowledged |
| `/verify` | Check a record yourself: three result states, a failure naming the first broken entry, the proof path, and the insurer view (**DESIGNED, NOT BUILT**) |
| `/panel` | The live anchor stream. Event types appear only for `sim_` subjects |
| `/stage` and `/stage?present` | The phone and the live panel side by side, plus a full-screen presentation mode (Esc exits) |

## Rules the screens follow (from `docs/VUKA-2-SPEC.md`)

- **One Journey check screen and one "Checked in" screen**, identical for the normal and duress PIN (V5). The check-in has no navigation, glass or motion. Parity of haptics, request shape and timing is tested in the React Native build (T15).
- While an incident is open, the member's phone shows **no guardian or bank activity** and no "hidden" notice (V8). A duress-PIN change looks identical to a normal one (§9).
- **Colour carries meaning:**
  - green is reserved for verified or received;
  - amber appears only in guardian mode;
  - there is no red on member screens;
  - every status pairs an icon with a word.
- **Accessibility:** WCAG AA contrast measured on the glass (secondary text at 4.9:1 or better; input borders at 3:1 or better); `main`, `h1` and a skip link; 44 px targets or larger; reduced motion respected.
- **Honesty copy:**
  - "Discreet, not invisible";
  - "gun-like sound", never "gunshot detected";
  - no score or probability shown to insurers (ADR-0039 draft, #57).

## Design system

Tokens are in `src/index.css`. The **Ivory** theme is the default; **Silver** and **Midnight** are alternates. Type is IBM Plex Sans, Mono and Serif (the serif is used only for the record statement). Icons are Phosphor. Surfaces are glass with a double-bezel hero card, ink-tinted shadows from one light source, 2.5% film grain, and spring motion.

## Next

Mutarisi and Vukosi rebuild these screens in `app/src/ui/` (React Native), against contract v2 (#51) and the native modules. The prototype is the reference for layout, copy and states. Its code is not ported line by line.
