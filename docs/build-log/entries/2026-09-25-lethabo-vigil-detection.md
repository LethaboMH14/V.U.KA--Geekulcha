## 2026-09-25 | Lethabo (co-lead), via Claude Code assistant | VIGIL on-device detection: engine, native YAMNet capture, measurement harness | PROPOSED — for Vukosi (sensing), Sibusiso (payload, contract v2) and Ipeleng (privacy)

**Research** — The predecessor repos (Team-Sonar---Vuka-, BEACON) were read to decide, per piece, whether to take, adapt or rebuild:
- **Taken:** BEACON's glass-break lessons (automatic gain and noise suppression off; the classifier has the veto).
- **Rebuilt:** VUKA's AudioModule (wrong class indices, a 1 s window, the deprecated Task library, float scores) and MotionModule (sampled at about 5 Hz).
- **Reference only:** VUKA's log-odds fusion with area priors. ADR-0039 rejects a fused percentage, and area priors would be redlining.

An adversarial review of the plan (10 findings) shaped the final rules.

**Real data / references** — The model's provenance is confirmed: TF Hub `google/lite-model/yamnet/classification/tflite/1` has sha256 `10c95ea3…17de` and 4,126,810 bytes, the register value. Its embedded label list confirms indices 6, 9, 11, 421–423, 435, 437 and 464; the predecessor's 427 was "Firecracker". The interpreter reports a float32 input of 15,600 samples, not the 15,360 in the old notes. ESC-50 measurements are in `docs/EVIDENCE.md`, with n and a held-out split.

**Business reasoning** — Detection is the one thing VIGIL does without the member asking. A bank or insurer will ask how often it is wrong. This entry gives the first honest answer and names what isn't measured yet.

**Competitor reference** — None of the apps surveyed on 24 Sep triggers without a press.

Changed:
- **`app/src/brain/detect` (pure, deterministic, integers only), for every audio window:**
  - each class is judged against its own threshold, and the highest qualifying class wins (ties go to the lowest index);
  - gun-like classes must beat their excluded neighbours (Explosion, Cap gun, Fireworks, Firecracker, Artillery fire);
  - impulses confirm in one window; voices confirm in two windows that share no audio;
  - recording (evidence) is separate from prompting (30 s cooldown, never over an open check-in);
  - motion corroboration looks back 10 s, only while stationary or walking;
  - every decision lists its reasons;
  - it produces the `signal_detected` pv1 payload, checked against `shared/canonical.js`.

  31 engine tests.
- **Native (Kotlin):**
  - a microphone foreground service with the neutral notification (V2);
  - LiteRT YAMNet, hash-checked at load, with shapes read from the interpreter and classes resolved by label;
  - fixed-cadence 50 % windows with no gate, and AGC, noise suppression and echo cancellation off;
  - a 3 s in-memory ring buffer, zeroed when done;
  - a 50 Hz accelerometer;
  - a bounded replay until JS attaches, and a partial wake lock while armed;
  - a test-clip feed only in builds made with `-PvigilTestFeed=true`.
- **Arming** asks for the microphone and notification permissions and explains any refusal (V1). A detection opens the same Journey check as every other path.
- **Tooling:**
  - `app/scripts/fetch-model.mjs` installs the model only if its sha256 matches;
  - `scripts/eval/` holds the harness;
  - `@types/jest` is added, so test files typecheck.

Evidence:
- `npx tsc --noEmit` is clean, and `npx jest` passes 32 of 32 (31 engine tests plus the app smoke test).
- **Emulator** (API 34, x86_64):
  - the service runs as a microphone foreground service;
  - a real ESC-50 glass clip was DETECTED on the device (Glass 8516 ≥ 3500);
  - fireworks were rejected by the neighbour rule (Gunshot 4141 against Explosion 6680);
  - one clip gave identical integer scores on the phone and the host.
- **ESC-50 held out (folds 4–5):** glass 11/16; 7.3 false records per hour; 5.5 false prompts per hour. These are in `docs/EVIDENCE.md`.

Decision: **ADR-0045** (Lethabo, 25 Sep): one class per window, chosen from the classes that clear their own thresholds; this clarifies ADR-0039(3). The payload is unchanged. It binds when Sibusiso accepts it with ADR-0039.

Needs/blockers:
- **Not measured:** gunshot and voice recall (ESC-50 has none of these clips); field false alarms (M2); battery (M4); screen-off continuity (M5, T29); a real phone.
- **Detection is not operational end to end yet: recorded events are not signed, queued or sent** (the V7 Keystore signer and V8 queue are not built).
- The JS engine stops if the app process dies; a headless task would fix this.
- The check-in notice's full-screen intent (V4) is built but not yet tested on a locked phone.
- Thresholds stay uncalibrated.

Business handoff: the evidence table in `docs/EVIDENCE.md` is the only source for detection claims.

Next: a glass "top class" check, tried on folds 1–3 and validated on fresh audio; a real-phone pass; the Keystore signer and queue.
