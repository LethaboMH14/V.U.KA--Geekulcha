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
  /** Per-class PROMPT threshold (V4), by YAMNet label. */
  readonly thresholdBp: Readonly<Record<string, number>>;
  /**
   * Per-class RECORD threshold (CEM-1, PROPOSED, UNCALIBRATED): half the
   * prompt threshold until the step-d measurements replace it. A confirmed
   * window here and below the prompt threshold is record-only evidence
   * (never a check-in by itself, never quieter than V4).
   */
  readonly recordThresholdBp: Readonly<Record<string, number>>;
  /** A context class counts when its window score reaches this (UNCALIBRATED). */
  readonly contextThresholdBp: number;
  /**
   * How a family is confirmed. `separation` 0: one window at or above threshold
   * confirms (impulses: glass and gun-like sounds are shorter than a window).
   * `separation` 1: the current window AND the one just before it must both
   * hit. They overlap by half, so one short call ("Help!", about 0.5 s) that
   * fills the shared half confirms; a click that barely touches one window
   * doesn't. `separation` 2: the current window and the one two before it,
   * which share no audio, so a voice must last about 1.5 s.
   */
  readonly confirm: Readonly<Record<Family, {separation: 0 | 1 | 2}>>;
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
    /** Liu et al. 2018: 40 m/s² ≈ 4079 mg. Logged as an observation only (weight 0). */
    readonly liuSnatchPeakMg: number;
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
  version: 3,
  calibrated: false,
  // Starting values. v3 (14 Oct) lowers the voice bars from 6000/6000/4500
  // and confirms a voice on one short call, so a single shouted "Help!" is
  // caught. YAMNet hears the KIND of sound (a shout), not the word: "Help!"
  // and "Hey!" score alike. The cost is more check-ins from ordinary shouting
  // (taxi ranks, sport, a TV), which the PIN check-in absorbs. Glass and
  // gun-like bars are unchanged (glass recall in EVIDENCE.md is at these).
  // The harness replaces every one of these.
  thresholdBp: {
    Shout: 3500,
    Yell: 3500,
    Screaming: 3000,
    'Gunshot, gunfire': 3500,
    'Machine gun': 3500,
    Fusillade: 3500,
    Glass: 3500,
    Shatter: 3000,
    Breaking: 4000,
  },
  recordThresholdBp: {
    Shout: 1750,
    Yell: 1750,
    Screaming: 1500,
    'Gunshot, gunfire': 1750,
    'Machine gun': 1750,
    Fusillade: 1750,
    Glass: 1750,
    Shatter: 1500,
    Breaking: 2000,
  },
  contextThresholdBp: 3000,
  confirm: {
    voice: {separation: 1},
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
    liuSnatchPeakMg: 4079,
    stationaryStdMg: 60,
    walkingStdMinMg: 100,
    walkingStdMaxMg: 600,
    walkingCrossingsMin: 1,
    walkingCrossingsMax: 3,
    activityFrames: 10,
  },
};
