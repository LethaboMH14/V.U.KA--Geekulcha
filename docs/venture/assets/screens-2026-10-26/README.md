# Deck screenshots, 26 Oct 2026: what they are and what they are not

**What they are** (`FACT`): browser renderings of the real VIGIL UI code (`app/App.tsx` and `app/src/ui/`, `main` at 7e4648d), bundled with react-native-web by `scripts/screens/`, in the app's own **SIMULATED preview** mode (`simBackend`: PINs held in memory, nothing signed or sent). The fonts are the app's own IBM Plex files.

**What they are not:**
- Not photos or screen recordings of an Android phone. Ask for device screenshots before any slide says "on a phone".
- Not a live system. No server was reachable and nothing was sent.
- Android-only modules (Firebase, Google sign-in, blur, WebView, microphone, signer) are stubbed. The permissions screen shows "Allowed" only because the shim grants every permission; it is not used in the decks.

**Captions are baked into every composite** so the caveat travels with the image.

| File | Shows | Notes |
|---|---|---|
| `vigil-journey-4up.png` | Active → check-in → "Checked in" → guardian view | Screen 3 after a normal PIN and after a duress PIN was pixel-identical in this rendering (n = 1 each, `PIL.ImageChops`); timing and network not tested. Screen 4 is the app's guardian-view preview (Settings → Guardian view, member "Lerato" is the app's built-in preview name), **not** a live alert caused by screen 3: no guardian existed in this run |
| `vigil-home-framed.png` | Home, Active | The app's own copy says "Listening on this phone, all the time" (ADR-0046). See D7 |
| `vigil-guardian-framed.png` | Guardian view, Alert state | "SIMULATED PREVIEW · NO CALLS PLACED" is the app's own label |
| `vigil-checkin-guardian-2up.png` | Check-in and guardian view | Same caveats |
| `dash-banks.png` | Dashboard home, "For banks and insurers" | Rendered from `dashboard/index.html` |
| `dash-verify.png` | Ledger Verify view, waiting for a record | The red "Hedera testnet" chip means the mirror was unreachable from the sandbox (proxy denied `testnet.mirrornode.hedera.com`); no live data shown |
| `raw/` | The uncomposed screenshots | 824 × 1784 (phone, 412 × 892 at 2×) and 2560 × 1600 (dashboard, 1280 × 800 at 2×) |

**Not captured:** the guardian invite (it needs the server even in preview: "VIGIL's server couldn't be reached"); the live ledger (no route to Hedera); any device-only behaviour.

**Test data only:** member "Demo Member", `demo@example.com`, test PINs. No real person's data.

**To reproduce:** see `scripts/screens/README.md`.
