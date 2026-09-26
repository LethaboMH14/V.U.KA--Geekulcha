# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users
- **Members**: people in South Africa at risk of coerced banking, where someone is forced to unlock their phone and transfer money. They use VIGIL mostly **at night and on the move**: evening commutes, taxis and e-hailing, walking to a car. The light is often low, or it's a dark vehicle, and sometimes bright sun. Many use **budget Android phones** (2 GB class) with small screens, and some are older users. Their job: start a journey, forget about it, and answer a check-in quickly when asked.
- **Guardians**: the people a member trusts to be alerted. They use the same APK in guardian mode.
- **Evaluators this weekend** (confirmed 24 Sep 2026): **judges** seeing the app on a demo projector, next to the live record panel, and **bank and insurer partners** judging whether it looks credible and regulated.

## Product Purpose
VIGIL notices likely duress through on-device sound detection and a check-in, answered with a normal PIN or a duress PIN. It alerts guardians, can send a (simulated) risk signal to a bank, and keeps a record that a stranger can check without trusting VUKA. Success is when a member is helped without having to ask, and nothing on the phone reveals that they asked.

## Positioning
Other safety products need the member to act: press a button, open an app, make a call. VIGIL needs no free hand. Its duress PIN looks identical to the normal PIN, so a coercer holding the phone learns nothing. Every decision is written to a signed, hash-linked record anchored on a public ledger. VUKA can be **verified rather than trusted**.

## Operating Context
- A member arms a journey, which is explicit and in the foreground, and ends it with a PIN.
- A detection opens a flat check-in. The member answers with a PIN, or doesn't answer.
- A coercer may be physically present, may hold the unlocked phone, may watch the screen, and may even be one of the member's guardians.
- Demo: the app is shown on a projector next to the live record panel. Data is labelled SIMULATED.

## Capabilities and Constraints
- React Native 0.74.5, Android only (`app/`), with Kotlin native modules to come. The web prototype in `prototype/` is the design reference, not shipped code.
- **Duress parity is absolute.** The Journey check and "Checked in" screens are one frame for both PINs: pixels, motion, haptics, timing and request shape are all the same (spec V5, T15).
- **Discretion (confirmed):** to anyone glancing at the phone, VIGIL should look like **a calm everyday utility**, not an obvious safety product. No alarm-red, no shouting safety branding.
- Colour carries meaning: green only for received or verified; amber only in guardian mode; no red on member screens.
- The phone never holds the verifiable record (ADR-0043, proposed). My Record shows a plain journey list.
- The member's device never shows guardian or bank activity during an incident (V8).
- No demo controls on the phone in release builds.
- Permissions: INTERNET, plus the microphone and notifications at journey time. No camera, SMS, background location or boot receiver.

## Brand Commitments
- Names: **VUKA** (the platform, isiZulu for "wake up"); **VIGIL** (the phone layer); **ANCHOR** (the record).
- The voice is plain, calm and honest. Required lines include "Discreet, not invisible", "gun-like sound" (never "gunshot detected"), and "Don't call or text them. Call 10111."
- Honesty ledger: never "unhackable", "court-admissible", "prevents crime", "unbiased AI", "pentested" or any uncalibrated figure.

## Evidence on Hand
- The approved design reference is the web prototype (`prototype/`, PR #66) and its Figma export.
- The security programme and evidence scorecard are in PR #78 and `docs/security/`.
- **Absences that must not be faked:** no user research with real members yet (planned: 5 consent-based conversations), no calibrated detection accuracy, no testimonials and no partner logos.

## Product Principles
1. **Nothing on the phone reveals a signal.** Any screen, state or motion that could differ by PIN is a defect.
2. **Quiet by default, clear when it matters.** Ordinary at a glance; unambiguous when the member needs to act.
3. **Checkable, not impressive.** Every claim on screen can be traced to evidence; simulation is labelled.
4. **Built for the real scene:** night, movement, one hand, a budget phone, bright sun as the exception.

## Accessibility & Inclusion
- WCAG 2.2 AA contrast, measured, not assumed. Touch targets of 48 dp or larger. System font scaling respected, with the keypad capped so it stays usable.
- TalkBack: headings, merged rows and a live region on "Checked in". A TalkBack pass on a real device (T17) is still owed.
- Older users and small screens: large type for the essential actions, and no information conveyed by colour alone.
