# app/ — VIGIL

The Android app: journey mode, on-device YAMNet detection, the discreet "Journey check", guardian mode, and a signed, queued event record. It is specified in `docs/VUKA-2-SPEC.md` §2 (V1–V10, G1–G6), §5, §9 and §11.

**Being built from 24 Sep 2026.** Owners: Vukosi (native, sensing, signing, release build) and Mutarisi (UI; APK backup). It is a new React Native 0.74.5 project, with predecessor files ported **one at a time** and reviewed (RULES.md).

Rules that bind this folder:
- Map YAMNet classes by label, and assert the input shape.
- The model is fetched by `scripts/fetch_models.py` with a sha256 check and never committed.
- Salts and nonces come from native `SecureRandom`.
- No `CAMERA`, `SEND_SMS`, background-location or boot-receiver permissions.
- The duress path is pixel-identical to the normal one (test T15).
