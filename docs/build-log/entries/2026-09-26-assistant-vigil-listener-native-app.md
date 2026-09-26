## 2026-09-26 | Claude Code (assistant) for operator mutarisi | Claude Code / claude-opus-5-5 | P3.V2/V3/V4 in the native app (za.co.vuka.app): YAMNet listening on Activate | done, partly device-tested

**Research** — Operator asked to pull `feat/vukosi-p3v2-yamnet` to make Activate listen. That branch holds only `scripts/fetch_models.py` (model/class-map verification), its tests and docs: no Android code. The listener lives in the React Native app on `feat/lethabo-vigil-events` (`app/android/.../com/teamsonar/vuka/detect/`: AudioPipeline, YamnetClassifier, SensingService) with the decision engine in JS (`app/src/brain/detect/engine.ts`, `ruleset.ts`, `classes.ts`). Both apps use `app/`, so a merge would clash; operator chose to port into the native app (option 1). Read spec V1–V4, docs/MODEL-LICENCES.md M1/M7.

**Real data / references** — Model: TF Hub YAMNet TFLite, 4 126 810 bytes, sha256 `10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de`, matching register row M1 `FACT` (observed by `scripts/fetch_yamnet_app.py`). 521 labels embedded in the model; "Screaming" at 11, "Glass" at 435 `FACT`. Thresholds copied from RULESET_V1 v2 and are **uncalibrated** `ASSUMPTION` (spec V3, §16). Battery cost unmeasured.

**Business reasoning** — Makes the core product promise real on the app we ship: the phone listens while the member has turned it on, without sending audio anywhere.

**Competitor reference** — Not applicable.

Changed:
- Merged `origin/feat/vukosi-p3v2-yamnet` (scripts/docs only, no conflicts).
- `scripts/fetch_yamnet_app.py`: downloads (or takes `--model-file`) the model, checks sha256 against the register via fetch_models.py, installs atomically to `app/src/main/assets/models/yamnet.tflite` (gitignored). Vukosi's script can't install alone because the class map (M7) digest is still PENDING; the app reads labels from the zip embedded in the verified model instead.
- New `za.co.vuka.app.detect`: `YamnetClassifier` (hash-gated load, shapes asserted, targets resolved by label), `AudioPipeline` (copied; 16 kHz float, UNPROCESSED/VOICE_RECOGNITION, AGC/NS/AEC off, 3 s ring buffer zeroed, no audio stored), `DetectionEngine` (Kotlin port of the V4 prompt path: per-class thresholds, gun-neighbour rule, one winner per window, voice needs windows n and n−2, 5 s record gap, 30 s prompt cooldown; CEM-1 record level and motion NOT ported), `SensingService` (microphone foreground service, "VUKA journey active" notification, partial wake lock, START_NOT_STICKY), `Listening` state.
- Activate checks RECORD_AUDIO + POST_NOTIFICATIONS and explains if refused (V1), then starts the service; Deactivate (PIN) / delete profile stop it. Home shows "VIGIL · LISTENING" and the moving wave only while the mic is really recording; otherwise "Starting…" or "Not listening: <reason>". Copy says detection is uncalibrated and guardians aren't alerted.
- A detection writes a chained `SOUND_DETECTED` record entry (class label only) and, outside the cooldown, a neutral high-priority "Journey check" notification that opens the app. The PIN check-in (V4/V5), signing (V7) and guardian alerts are NOT built.
- LiteRT `com.google.ai.edge.litert:litert:1.4.2` (the RN app pins 1.0.1, whose x86_64 JNI lib failed Android's 16 KB page-alignment check on the emulator; 1.4.2 did not warn).
- Record: "Activated · simulated" → "Activated"; detail page shows "Heard: <class>". doc_terms.txt and code comments no longer say VIGIL doesn't listen.

Evidence: `./gradlew :app:assembleDebug :app:testDebugUnitTest -q` → exit 0; `DetectionEngineTest` 14 tests, 0 failures (cases mirror engine.test.ts). On emulator-5554: Activate → Home "VIGIL · LISTENING"; `dumpsys activity services` shows SensingService isForeground=true types=0x80 (microphone); `dumpsys audio` shows za.co.vuka.app recording VOICE_RECOGNITION 16 kHz, not silenced; app ~1 core CPU on the emulator; no inference errors logged. An emulator HAL process (android.hardwar) logged SIGABRT; VUKA kept running. Deactivate opened the PIN sheet; the assistant doesn't know the PIN, so listening was stopped with force-stop (no "Deactivated" entry for that test session). NOT verified: a real detection from real sound (the emulator can't produce one), behaviour on a physical phone, battery.

Decision: operator chose porting into the native app over moving to the RN app; which app ships is a team decision (Lethabo owns the RN app). Upgrading LiteRT past the RN app's pin is the assistant's call.

Needs/blockers: field test on a real phone with real sounds; threshold calibration (§16); the V4 check-in with PIN, signing and guardian alert path; register the class map (M7) so Vukosi's script can install end to end; keep the two apps' engines in sync or retire one.

Business handoff: not applicable — no pricing change; battery cost (M4) unmeasured.

Next: operator to test Activate on a physical phone (run `python scripts/fetch_yamnet_app.py` first on a fresh checkout) and decide with Lethabo which app carries VIGIL forward.
