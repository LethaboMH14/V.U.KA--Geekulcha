/**
 * The detection engine: the one place that decides whether a sound is recorded
 * as a `signal_detected` event and whether it opens a journey check (spec V4).
 * Pure and deterministic: no clock, no I/O, no randomness, integers only. The
 * same inputs always give the same decision, which is what lets the golden
 * fixtures and the host harness act as referee.
 *
 * Every decision, recorded or not, carries its reasons: each rule it
 * evaluated, with the numbers it used. There is no probability and no
 * "coercion score" here (ADR-0039 rejects a fused %); the check-in, answered
 * by the member, is the verification step.
 *
 * Score domain: the integer basis points the native layer computed (round half
 * up). Every comparison here is on those integers, so native, host and tests
 * agree exactly.
 */
import {TARGETS, type Family, type TargetClass} from './classes';
import {corroborate, type Corroboration, type MotionFrame} from './motion';
import type {Ruleset} from './ruleset';

/** One YAMNet window from the native layer, integers only. */
export type AudioWindow = {
  /**
   * Window number, advancing by one per hop of audio captured. A gap means a
   * window was not classified (the model was busy); it counts as a miss.
   */
  readonly seq: number;
  /** Monotonic time at the window's end, in ms. */
  readonly endMs: number;
  /** Scores for TARGETS, in TARGETS order, basis points 0–10000. */
  readonly targetBp: readonly number[];
  /** The model's top class over all 521, for the reason record. */
  readonly topIndex: number;
  readonly topBp: number;
  /** Highest score among the gun-like classes' excluded neighbours (GUN_NEIGHBOURS). */
  readonly gunNeighbourBp: number;
};

export type Reason =
  | {rule: 'top'; top_index: number; top_bp: number}
  | {rule: 'gun_neighbour'; class_label: string; score_bp: number; neighbour_bp: number; pass: boolean}
  | {rule: 'threshold'; class_label: string; score_bp: number; threshold_bp: number; pass: boolean}
  | {rule: 'winner'; class_label: string; class_index: number; score_bp: number; qualifying: number}
  | {rule: 'confirm'; family: Family; window_seqs: number[]; separation: number; pass: boolean}
  | {rule: 'duplicate'; family: Family; since_ms: number; record_gap_ms: number; pass: boolean}
  | {rule: 'checkin_open'; prompt: boolean}
  | {rule: 'cooldown'; since_ms: number; cooldown_ms: number; prompt: boolean}
  | {rule: 'motion'; items: number; lookback_ms: number};

export type Candidate = {
  readonly class_label: string;
  readonly class_index: number;
  readonly score_bp: number;
  readonly threshold_bp: number;
  readonly window_end_ms: number;
};

export type Decision = {
  /** Record a `signal_detected` event (evidence), even if no prompt follows. */
  readonly record: boolean;
  /** Open the journey check. Only ever true when `record` is. */
  readonly prompt: boolean;
  readonly reasons: readonly Reason[];
  readonly candidate: Candidate | null;
  readonly corroboration: readonly Corroboration[];
};

export type EngineState = {
  /** Recent windows: seq and the family that confirmed-eligible hit (or null). */
  readonly history: readonly {seq: number; family: Family | null}[];
  readonly lastRecordMs: Readonly<Partial<Record<Family, number>>>;
  readonly lastPromptMs: number | null;
  readonly checkinOpen: boolean;
  /** Motion frames covering at least the look-back plus the activity context. */
  readonly motion: readonly MotionFrame[];
};

export const initialState = (): EngineState => ({history: [], lastRecordMs: {}, lastPromptMs: null, checkinOpen: false, motion: []});

export type Input =
  | {type: 'audio'; window: AudioWindow}
  | {type: 'motion'; frame: MotionFrame}
  | {type: 'checkin'; open: boolean};

function validWindow(w: AudioWindow): boolean {
  const int = (x: number) => Number.isSafeInteger(x);
  const bp = (x: number) => int(x) && x >= 0 && x <= 10000;
  return (
    int(w.seq) &&
    int(w.endMs) &&
    w.targetBp.length === TARGETS.length &&
    w.targetBp.every(bp) &&
    int(w.topIndex) &&
    w.topIndex >= 0 &&
    w.topIndex < 521 &&
    bp(w.topBp) &&
    bp(w.gunNeighbourBp)
  );
}

const NO: (reasons: Reason[]) => Decision = reasons => ({record: false, prompt: false, reasons, candidate: null, corroboration: []});

/**
 * Advance the engine by one input. Returns the new state and, for audio
 * windows, a decision. Motion and check-in inputs never record or prompt.
 */
export function step(state: EngineState, input: Input, r: Ruleset): {state: EngineState; decision: Decision | null} {
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

  const reasons: Reason[] = [{rule: 'top', top_index: w.topIndex, top_bp: w.topBp}];

  // Each class is judged against its own threshold first, so a loud class that
  // misses its bar can't hide a quieter one that clears its own (no masking).
  // Gun-like classes must also beat their excluded neighbours.
  const qualifying: {t: TargetClass; bp: number}[] = [];
  TARGETS.forEach((t, i) => {
    const bp = w.targetBp[i];
    const thr = r.thresholdBp[t.label];
    if (bp < thr) return;
    if (t.family === 'gun') {
      const beats = bp > w.gunNeighbourBp;
      reasons.push({rule: 'gun_neighbour', class_label: t.label, score_bp: bp, neighbour_bp: w.gunNeighbourBp, pass: beats});
      if (!beats) return;
    }
    qualifying.push({t, bp});
  });

  if (qualifying.length === 0) {
    // Report the closest miss: the highest-scoring target and its bar.
    let best = 0;
    for (let i = 1; i < TARGETS.length; i++) if (w.targetBp[i] > w.targetBp[best]) best = i;
    const t = TARGETS[best];
    reasons.push({rule: 'threshold', class_label: t.label, score_bp: w.targetBp[best], threshold_bp: r.thresholdBp[t.label], pass: false});
    const history = [...state.history.filter(h => h.seq > w.seq - 3 && h.seq < w.seq), {seq: w.seq, family: null}];
    return {state: {...state, history}, decision: NO(reasons)};
  }

  // One class per window (ADR-0039(3)): the highest qualifying score, ties to
  // the lowest YAMNet index (TARGETS is index-sorted, so first found wins).
  let win = qualifying[0];
  for (const q of qualifying) if (q.bp > win.bp) win = q;
  const threshold = r.thresholdBp[win.t.label];
  reasons.push({rule: 'threshold', class_label: win.t.label, score_bp: win.bp, threshold_bp: threshold, pass: true});
  reasons.push({rule: 'winner', class_label: win.t.label, class_index: win.t.index, score_bp: win.bp, qualifying: qualifying.length});

  const history = [...state.history.filter(h => h.seq > w.seq - 3 && h.seq < w.seq), {seq: w.seq, family: win.t.family}];
  let next: EngineState = {...state, history};

  // Confirmation: impulses in one window; voices in this window and the one
  // two before it, which share no audio with it.
  const {separation} = r.confirm[win.t.family];
  const seqs = separation === 0 ? [w.seq] : [w.seq - separation, w.seq];
  const confirmed = seqs.every(s => history.some(h => h.seq === s && h.family === win.t.family));
  reasons.push({rule: 'confirm', family: win.t.family, window_seqs: seqs, separation, pass: confirmed});
  if (!confirmed) {
    return {state: next, decision: NO(reasons)};
  }

  // Recording: one record per family per recordGapMs, so a long scream is one
  // event, not one per window.
  const lastRec = state.lastRecordMs[win.t.family];
  if (lastRec !== undefined) {
    const since = w.endMs - lastRec;
    const fresh = since >= r.recordGapMs;
    reasons.push({rule: 'duplicate', family: win.t.family, since_ms: since, record_gap_ms: r.recordGapMs, pass: fresh});
    if (!fresh) {
      return {state: next, decision: NO(reasons)};
    }
  }
  next = {...next, lastRecordMs: {...next.lastRecordMs, [win.t.family]: w.endMs}};

  // Prompting: never over an open check-in, and not again within the cooldown.
  // The event is still recorded either way (it is evidence).
  let prompt = true;
  if (state.checkinOpen) {
    prompt = false;
    reasons.push({rule: 'checkin_open', prompt: false});
  } else if (state.lastPromptMs !== null) {
    const since = w.endMs - state.lastPromptMs;
    prompt = since >= r.cooldownMs;
    reasons.push({rule: 'cooldown', since_ms: since, cooldown_ms: r.cooldownMs, prompt});
  }
  if (prompt) next = {...next, lastPromptMs: w.endMs};

  const corroboration = corroborate(state.motion, w.endMs, r);
  reasons.push({rule: 'motion', items: corroboration.length, lookback_ms: r.motionLookbackMs});

  return {
    state: next,
    decision: {
      record: true,
      prompt,
      reasons,
      candidate: {class_label: win.t.label, class_index: win.t.index, score_bp: win.bp, threshold_bp: threshold, window_end_ms: w.endMs},
      corroboration,
    },
  };
}
