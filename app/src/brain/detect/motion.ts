/**
 * Motion corroboration (ADR-0039(4), spec §18 V11). Rules only, no model.
 *
 * Motion never opens a check-in. At the moment a sound is detected, it looks
 * back over [−10 s, 0] for three patterns, and records one only if the phone
 * was stationary or walking just before it: in a vehicle, bumps and braking
 * look like impacts, so those are not recorded at all.
 *
 * Input is the native layer's 200 ms feature frames (integers), never raw
 * samples, so the rules are testable against fixtures and identical on every
 * device.
 */
import type {Ruleset} from './ruleset';

/** One 200 ms accelerometer feature frame, integers only. */
export type MotionFrame = {
  /** Monotonic time at the frame's end, in ms. */
  readonly endMs: number;
  /** Largest |a| in the frame, milli-g. */
  readonly peakMg: number;
  /** Standard deviation of |a| in the frame, milli-g. */
  readonly stdMg: number;
  /** Sign changes of the high-passed |a| in the frame. */
  readonly crossings: number;
};

export type Activity = 'stationary' | 'walking' | 'other';
export type Pattern = 'impact' | 'shake' | 'snatch';

export type Corroboration = {
  readonly sense: 'motion';
  readonly pattern: Pattern;
  readonly peak_mg: number;
  readonly duration_ms: number;
  readonly offset_ms: number;
  readonly rule_version: string;
};

const FRAME_MS = 200;

/** Activity from the frames just before index `i` (exclusive). */
export function activityBefore(frames: readonly MotionFrame[], i: number, r: Ruleset): Activity {
  const from = Math.max(0, i - r.motion.activityFrames);
  const window = frames.slice(from, i);
  if (window.length < Math.min(3, r.motion.activityFrames)) {
    return 'other';
  }
  const m = r.motion;
  if (window.every(f => f.stdMg < m.stationaryStdMg)) {
    return 'stationary';
  }
  const walking = window.every(
    f =>
      f.stdMg >= m.walkingStdMinMg &&
      f.stdMg <= m.walkingStdMaxMg &&
      f.crossings >= m.walkingCrossingsMin &&
      f.crossings <= m.walkingCrossingsMax,
  );
  return walking ? 'walking' : 'other';
}

/**
 * Patterns in the look-back window before `detectionEndMs`, oldest first,
 * capped at `maxCorroboration` (the most recent kept). Frames must be sorted
 * by `endMs`.
 */
export function corroborate(
  frames: readonly MotionFrame[],
  detectionEndMs: number,
  r: Ruleset,
): Corroboration[] {
  const m = r.motion;
  const lo = detectionEndMs - r.motionLookbackMs;
  const found: Corroboration[] = [];
  const offset = (endMs: number) => Math.max(-r.motionLookbackMs, Math.min(0, endMs - detectionEndMs));
  const allowed = (i: number) => {
    const a = activityBefore(frames, i, r);
    return a === 'stationary' || a === 'walking';
  };

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    if (f.endMs <= lo || f.endMs > detectionEndMs) {
      continue;
    }
    if (f.peakMg >= m.impactPeakMg) {
      if (allowed(i)) {
        found.push({sense: 'motion', pattern: 'impact', peak_mg: Math.min(f.peakMg, 16000), duration_ms: FRAME_MS, offset_ms: offset(f.endMs), rule_version: r.motionRuleVersion});
      }
      continue;
    }
    if (f.peakMg >= m.snatchPeakMg) {
      const stillFrames = Math.ceil(m.snatchStillMs / FRAME_MS);
      const before = frames.slice(Math.max(0, i - stillFrames), i);
      const wasStill = before.length === stillFrames && before.every(b => b.stdMg < m.stationaryStdMg);
      if (wasStill) {
        found.push({sense: 'motion', pattern: 'snatch', peak_mg: f.peakMg, duration_ms: FRAME_MS, offset_ms: offset(f.endMs), rule_version: r.motionRuleVersion});
        continue;
      }
    }
    // Shake: a run of shakeFrames frames ending here, and not already counted
    // as part of a longer run (so one shake is one item).
    const run = frames.slice(Math.max(0, i - m.shakeFrames + 1), i + 1);
    const isShake = (x: MotionFrame) => x.stdMg >= m.shakeStdMg && x.crossings >= m.shakeCrossings;
    const prevIsShake = i - m.shakeFrames >= 0 && isShake(frames[i - m.shakeFrames]);
    if (run.length === m.shakeFrames && run.every(isShake) && !prevIsShake && allowed(i - m.shakeFrames + 1)) {
      found.push({
        sense: 'motion',
        pattern: 'shake',
        peak_mg: Math.min(Math.max(...run.map(x => x.peakMg)), 16000),
        duration_ms: m.shakeFrames * FRAME_MS,
        offset_ms: offset(f.endMs),
        rule_version: r.motionRuleVersion,
      });
    }
  }
  return found.slice(-r.maxCorroboration);
}
