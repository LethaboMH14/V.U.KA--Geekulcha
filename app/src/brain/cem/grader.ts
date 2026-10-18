/**
 * The graded prompt rule (CEM-1, ADR-0047 PROPOSED), as a pure state machine.
 *
 * Never quieter than V4: a V4-level decision (`level: 'prompt'`) is acted on
 * exactly as before, the moment it arrives, and K never suppresses it. What
 * is new is below V4: a record-level candidate is record-only evidence (T0)
 * unless recent evidence lifts it to a check-in:
 *
 *   lift iff  rule = 'cem1'  and the subject is a simulation subject
 *         and P ≥ 5 db  and not (K ≥ 50 % and P < 12 db)
 *         and the one prompt slot is free
 *         and no prompt of any kind in the last 30 s (a lift never touches
 *             the engine's V4 cooldown, so it can never silence a V4 prompt).
 *
 * Each record-level candidate waits until the audio has run 1 s past it
 * (CEM-0's ±1 s context window, so TV in the next windows is heard), or 2 s
 * of time pass (`tick`), and is then settled. V4 decisions never wait.
 * Stopping settles anything pending as record-only: nothing prompts after
 * the member has paused.
 *
 * One prompt slot, reserved synchronously when any prompt is decided and
 * freed when the check-in closes (or the prompt could not be carried out),
 * so a pending lift and a V4 detection in neighbouring windows can never
 * open two check-ins. Under 'cem1', a V4-level detection while the slot is
 * held is covered by that check-in: it is recorded as evidence only, so an
 * answered check-in is never followed by a no-answer alarm for a detection
 * the member was never asked about. Under 'v4' nothing changes from V4.
 *
 * Pure: the caller supplies engine times (monotonic ms) and executes actions.
 */
import type {Decision} from '../detect';
import type {Assessment} from '.';
import type {Observation, Tracker} from './tracker';

export const PROMPT_P_DB = 5;
export const STRONG_P_DB = 12;
export const LIFT_K_PCT = 50;
export const LIFT_COOLDOWN_MS = 30_000;
export const SETTLE_AFTER_MS = 1_000;
export const SETTLE_TIMEOUT_MS = 2_000;

export type PromptRule = 'v4' | 'cem1';

export type GradeAction =
  /** Open a check-in: queue signal_detected, open the check, then the prompt evidence. */
  | {type: 'prompt'; decision: Decision; assessment: Assessment; observations: Observation[]; lifted: boolean}
  /**
   * V4-level record without a prompt (cooldown or an open check). `covered`:
   * a check-in is pending or open (cem1 only), so evidence alone; otherwise
   * exactly as V4 does today (signal_detected too).
   */
  | {type: 'v4_record'; decision: Decision; assessment: Assessment; observations: Observation[]; covered: boolean}
  /** Record-only evidence (T0): evidence_observed alone, never signal_detected. */
  | {type: 'record'; decision: Decision; assessment: Assessment; observations: Observation[]};

type Pending = {decision: Decision; endMs: number; observations: Observation[]};

export type Grader = {
  /** Every engine decision for an audio window, after the tracker has observed it. */
  window(d: Decision, endMs: number, observations: Observation[]): GradeAction[];
  /** The check-in the slot was reserved for has closed, or could not be opened. */
  checkinClosed(): void;
  /** Time passes without windows: settle candidates older than 2 s. */
  tick(nowMs: number): GradeAction[];
  /**
   * The member asked for help themselves (hold-for-help): take the one
   * prompt slot, so no detection opens a second check-in over it. Returns
   * false when a check-in is already pending or open.
   */
  reserve(): boolean;
  /** Listening stopped: settle anything pending as record-only. */
  stop(): GradeAction[];
  /** For tests and the transition list. */
  readonly slotReserved: boolean;
};

export function liftAllowed(a: Assessment): boolean {
  return a.pos >= PROMPT_P_DB && !(a.k_pct >= LIFT_K_PCT && a.pos < STRONG_P_DB);
}

export function createGrader(opts: {tracker: Tracker; rule: PromptRule; subjectIsSim: boolean}): Grader {
  const {tracker} = opts;
  let pending: Pending[] = [];
  let reserved = false;
  let lastPromptMs: number | null = null;
  let latestMs = 0;

  // Assessed when the decision is made (up to 1 s after the candidate), so a
  // scream that became "sustained" in those windows is counted as such.
  const settle = (p: Pending, canLift: boolean): GradeAction => {
    const assessment = tracker.assess(Math.max(p.endMs, latestMs));
    const lift =
      canLift &&
      opts.rule === 'cem1' &&
      opts.subjectIsSim &&
      !reserved &&
      (lastPromptMs === null || latestMs - lastPromptMs >= LIFT_COOLDOWN_MS) &&
      liftAllowed(assessment);
    if (lift) {
      reserved = true;
      lastPromptMs = latestMs;
      return {type: 'prompt', decision: p.decision, assessment, observations: p.observations, lifted: true};
    }
    return {type: 'record', decision: p.decision, assessment, observations: p.observations};
  };

  /** Settle, oldest first, every pending candidate that matches. */
  const settleWhere = (due: (p: Pending) => boolean, out: GradeAction[]) => {
    const keep: Pending[] = [];
    for (const p of pending) {
      if (due(p)) out.push(settle(p, true));
      else keep.push(p);
    }
    pending = keep;
  };

  return {
    window(d, endMs, observations) {
      latestMs = Math.max(latestMs, endMs);
      const out: GradeAction[] = [];
      // V4 first, the moment it arrives.
      if (d.record && d.level === 'prompt') {
        const assessment = tracker.assess(endMs);
        if (d.prompt && !reserved) {
          reserved = true;
          lastPromptMs = endMs;
          out.push({type: 'prompt', decision: d, assessment, observations, lifted: false});
        } else {
          // The engine held the prompt (cooldown / open check), or the slot is
          // taken. With a check-in pending or open (cem1), that check-in covers it.
          out.push({type: 'v4_record', decision: d, assessment, observations, covered: opts.rule === 'cem1' && reserved});
        }
      }
      // Each pending candidate settles once the audio is 1 s past it, or at
      // once if the slot is taken (it could not lift anyway).
      settleWhere(p => reserved || endMs >= p.endMs + SETTLE_AFTER_MS, out);
      if (d.record && d.level === 'record') {
        if (reserved) out.push(settle({decision: d, endMs, observations}, false));
        else pending.push({decision: d, endMs, observations});
      }
      return out;
    },
    checkinClosed() {
      reserved = false;
    },
    reserve() {
      if (reserved) return false;
      reserved = true;
      lastPromptMs = latestMs;
      return true;
    },
    tick(nowMs) {
      latestMs = Math.max(latestMs, nowMs);
      const out: GradeAction[] = [];
      settleWhere(p => reserved || nowMs >= p.endMs + SETTLE_TIMEOUT_MS, out);
      return out;
    },
    stop() {
      const out = pending.map(p => settle(p, false));
      pending = [];
      return out;
    },
    get slotReserved() {
      return reserved;
    },
  };
}
