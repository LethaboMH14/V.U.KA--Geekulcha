/**
 * The detection engine: the one place that decides whether a sound opens a
 * journey check (spec V4). Pure and deterministic: no clock, no I/O, no
 * randomness, integers only. The same inputs always give the same decision,
 * which is what lets the golden fixtures and the host harness act as referee.
 *
 * Every decision, fired or not, carries its reasons: each rule it evaluated,
 * with the numbers it used. There is no probability and no "coercion score"
 * here (ADR-0039 rejects a fused %); the check-in, answered by the member, is
 * the verification step.
 */
import {TARGETS, type Family, type TargetClass} from './classes';
import {corroborate, type Corroboration, type MotionFrame} from './motion';
import type {Ruleset} from './ruleset';

/** One YAMNet window from the native layer, integers only. */
export type AudioWindow = {
  /** Increasing window number; gaps mean skipped (quiet) windows. */
  readonly seq: number;
  /** Monotonic time at the window's end, in ms. */
  readonly endMs: number;
  /** Scores for TARGETS, in TARGETS order, basis points 0–10000. */
  readonly targetBp: readonly number[];
  /** The model's top class over all 521, for the reason record. */
  readonly topIndex: number;
  readonly topBp: number;
};

export type Reason =
  | {rule: 'argmax'; class_label: string; class_index: number; score_bp: number; top_index: number; top_bp: number}
  | {rule: 'threshold'; class_label: string; score_bp: number; threshold_bp: number; pass: boolean}
  | {rule: 'confirm'; family: Family; hits: number; of: number; required: number; pass: boolean}
  | {rule: 'cooldown'; since_ms: number; cooldown_ms: number; pass: boolean}
  | {rule: 'checkin_open'; pass: boolean}
  | {rule: 'motion'; items: number; lookback_ms: number};

export type Candidate = {
  readonly class_label: string;
  readonly class_index: number;
  readonly score_bp: number;
  readonly threshold_bp: number;
  readonly window_end_ms: number;
};

export type Decision = {
  readonly fire: boolean;
  readonly reasons: readonly Reason[];
  readonly candidate: Candidate | null;
  readonly corroboration: readonly Corroboration[];
};

export type EngineState = {
  /** Recent windows' hits: seq and the family that passed its threshold (or null). */
  readonly history: readonly {seq: number; family: Family | null}[];
  readonly lastFireMs: number | null;
  readonly checkinOpen: boolean;
  /** Motion frames covering at least the look-back plus the activity context. */
  readonly motion: readonly MotionFrame[];
};

export const initialState = (): EngineState => ({history: [], lastFireMs: null, checkinOpen: false, motion: []});

export type Input =
  | {type: 'audio'; window: AudioWindow}
  | {type: 'motion'; frame: MotionFrame}
  | {type: 'checkin'; open: boolean};

function validWindow(w: AudioWindow): boolean {
  const int = (x: number) => Number.isSafeInteger(x);
  return (
    int(w.seq) &&
    int(w.endMs) &&
    w.targetBp.length === TARGETS.length &&
    w.targetBp.every(b => int(b) && b >= 0 && b <= 10000) &&
    int(w.topIndex) &&
    w.topIndex >= 0 &&
    w.topIndex < 521 &&
    int(w.topBp) &&
    w.topBp >= 0 &&
    w.topBp <= 10000
  );
}

/** Argmax over the targets; ties go to the lowest index (TARGETS is index-sorted). */
function argmax(targetBp: readonly number[]): {t: TargetClass; bp: number} {
  let best = 0;
  for (let i = 1; i < targetBp.length; i++) {
    if (targetBp[i] > targetBp[best]) {
      best = i;
    }
  }
  return {t: TARGETS[best], bp: targetBp[best]};
}

const NO_FIRE = (reasons: Reason[]): Decision => ({fire: false, reasons, candidate: null, corroboration: []});

/**
 * Advance the engine by one input. Returns the new state and, for audio
 * windows, a decision. Motion and check-in inputs never fire.
 */
export function step(
  state: EngineState,
  input: Input,
  r: Ruleset,
): {state: EngineState; decision: Decision | null} {
  if (input.type === 'checkin') {
    return {state: {...state, checkinOpen: input.open}, decision: null};
  }
  if (input.type === 'motion') {
    const keepFrom = input.frame.endMs - r.motionLookbackMs - (r.motion.activityFrames + 15) * 200;
    const motion = [...state.motion, input.frame].filter(f => f.endMs > keepFrom).sort((a, b) => a.endMs - b.endMs);
    return {state: {...state, motion}, decision: null};
  }

  const w = input.window;
  if (!validWindow(w)) {
    throw new Error('invalid audio window: every field must be an in-range integer');
  }

  const reasons: Reason[] = [];
  const {t, bp} = argmax(w.targetBp);
  reasons.push({rule: 'argmax', class_label: t.label, class_index: t.index, score_bp: bp, top_index: w.topIndex, top_bp: w.topBp});

  const threshold = r.thresholdBp[t.label];
  const hit = bp >= threshold;
  reasons.push({rule: 'threshold', class_label: t.label, score_bp: bp, threshold_bp: threshold, pass: hit});

  // History of hits by window number; a skipped (quiet) window counts as a miss.
  const maxN = Math.max(...Object.values(r.confirm).map(c => c.n));
  const history = [...state.history.filter(h => h.seq > w.seq - maxN && h.seq < w.seq), {seq: w.seq, family: hit ? t.family : null}];
  const next: EngineState = {...state, history};

  if (!hit) {
    return {state: next, decision: NO_FIRE(reasons)};
  }

  const {k, n} = r.confirm[t.family];
  const hits = history.filter(h => h.seq > w.seq - n && h.family === t.family).length;
  const confirmed = hits >= k;
  reasons.push({rule: 'confirm', family: t.family, hits, of: n, required: k, pass: confirmed});
  if (!confirmed) {
    return {state: next, decision: NO_FIRE(reasons)};
  }

  if (state.checkinOpen) {
    reasons.push({rule: 'checkin_open', pass: false});
    return {state: next, decision: NO_FIRE(reasons)};
  }
  if (state.lastFireMs !== null) {
    const since = w.endMs - state.lastFireMs;
    const clear = since >= r.cooldownMs;
    reasons.push({rule: 'cooldown', since_ms: since, cooldown_ms: r.cooldownMs, pass: clear});
    if (!clear) {
      return {state: next, decision: NO_FIRE(reasons)};
    }
  }

  const corroboration = corroborate(state.motion, w.endMs, r);
  reasons.push({rule: 'motion', items: corroboration.length, lookback_ms: r.motionLookbackMs});

  return {
    state: {...next, lastFireMs: w.endMs},
    decision: {
      fire: true,
      reasons,
      candidate: {class_label: t.label, class_index: t.index, score_bp: bp, threshold_bp: threshold, window_end_ms: w.endMs},
      corroboration,
    },
  };
}
