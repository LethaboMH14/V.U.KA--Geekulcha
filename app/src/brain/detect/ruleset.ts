/**
 * The detection ruleset: every number the engine decides with, in one place.
 *
 * UNCALIBRATED. These are starting values, not measured ones (spec V3, §16).
 * They are replaced only by values the measurement harness produces
 * (`scripts/eval/`), recorded in docs/EVIDENCE.md with method and n, and a
 * change here bumps `version`. Nothing on screen may present them as tuned.
 *
 * All values are integers: basis points (0–10000) for scores, milliseconds for
 * time, milli-g for acceleration. No float reaches a signed payload (§5).
 */
import type {Family} from './classes';

export type Ruleset = {
  readonly id: string;
  readonly version: number;
  readonly calibrated: false;
  /** Per-class threshold, by YAMNet label. */
  readonly thresholdBp: Readonly<Record<string, number>>;
  /**
   * How a family is confirmed. `separation` 0: one window at or above threshold
   * confirms (impulses: glass and gun-like sounds are shorter than a window).
   * `separation` 2: the current window AND the window two before it must both
   * hit. With 50 % overlap those two share no audio, so one brief sound can't
   * confirm itself; a voice must last about 1.5 s (a stated trade-off: a very
   * short scream is missed).
   */
  readonly confirm: Readonly<Record<Family, {separation: 0 | 2}>>;
  /** A second record of the same family within this long is a duplicate. */
  readonly recordGapMs: number;
  /** No second check-in prompt within this long of the last one (records continue). */
  readonly cooldownMs: number;
  /** YAMNet's window length (spec §18 `window_ms`). */
  readonly windowMs: 975;
  /** Motion corroboration look-back, [−lookbackMs, 0] (ADR-0039(4)). */
  readonly motionLookbackMs: 10000;
  /** At most this many corroboration items in a payload (§18). */
  readonly maxCorroboration: 4;
  readonly motionRuleVersion: string;
  readonly motion: {
    /** Impact: one frame whose peak reaches this. */
    readonly impactPeakMg: number;
    /** Shake: this many consecutive frames at or above the std and crossings below. */
    readonly shakeFrames: number;
    readonly shakeStdMg: number;
    readonly shakeCrossings: number;
    /** Snatch: a peak in [snatchPeakMg, impactPeakMg) right after this long stationary. */
    readonly snatchPeakMg: number;
    readonly snatchStillMs: number;
    /** Activity: stationary below this std; walking within the band and cadence. */
    readonly stationaryStdMg: number;
    readonly walkingStdMinMg: number;
    readonly walkingStdMaxMg: number;
    /** Walking cadence as crossings per 200 ms frame, inclusive band. */
    readonly walkingCrossingsMin: number;
    readonly walkingCrossingsMax: number;
    /** Frames used to judge activity just before a pattern. */
    readonly activityFrames: number;
  };
};

export const RULESET_V1: Ruleset = {
  id: 'vigil-detect',
  version: 1,
  calibrated: false,
  // Starting values. Voice classes sit higher than impulses because shouting
  // and yelling are common in ordinary life (taxi ranks, sport, a TV); glass
  // and gun-like sounds are rare enough that a lower bar costs less. The
  // harness replaces every one of these.
  thresholdBp: {
    Shout: 6000,
    Yell: 6000,
    Screaming: 4500,
    'Gunshot, gunfire': 3500,
    'Machine gun': 3500,
    Fusillade: 3500,
    Glass: 3500,
    Shatter: 3000,
    Breaking: 4000,
  },
  confirm: {
    voice: {separation: 2},
    glass: {separation: 0},
    gun: {separation: 0},
  },
  recordGapMs: 5000,
  cooldownMs: 30000,
  windowMs: 975,
  motionLookbackMs: 10000,
  maxCorroboration: 4,
  motionRuleVersion: 'motion-rules.v1',
  motion: {
    impactPeakMg: 3000,
    shakeFrames: 3,
    shakeStdMg: 500,
    shakeCrossings: 4,
    snatchPeakMg: 1800,
    snatchStillMs: 2000,
    stationaryStdMg: 60,
    walkingStdMinMg: 100,
    walkingStdMaxMg: 600,
    walkingCrossingsMin: 1,
    walkingCrossingsMax: 3,
    activityFrames: 10,
  },
};
