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
 * A record-level candidate waits until the audio has run 1 s past it (CEM-0's
 * ±1 s context window, so TV in the next windows is heard) and is then
 * settled. V4 decisions never wait. Stopping settles anything pending as
 * record-only: nothing prompts after the member has paused.
 *
 * One prompt slot, reserved synchronously when any prompt is decided and
 * freed when the check-in closes, so a pending lift and a V4 detection in
 * neighbouring windows can never open two check-ins.
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

export type PromptRule = 'v4' | 'cem1';

export type GradeAction =
  /** Open a check-in: queue signal_detected, open the check, then the prompt evidence. */
  | {type: 'prompt'; decision: Decision; assessment: Assessment; observations: Observation[]; lifted: boolean}
  /** V4-level record without a prompt (cooldown or an open check): exactly as V4 does today. */
  | {type: 'v4_record'; decision: Decision; assessment: Assessment; observations: Observation[]}
  /** Record-only evidence (T0): evidence_observed alone, never signal_detected. */
  | {type: 'record'; decision: Decision; assessment: Assessment; observations: Observation[]};

type Pending = {decision: Decision; endMs: number; observations: Observation[]};

export type Grader = {
  /** Every engine decision for an audio window, after the tracker has observed it. */
  window(d: Decision, endMs: number, observations: Observation[]): GradeAction[];
  /** The check-in the slot was reserved for has closed. */
  checkinClosed(): void;
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
  let pending: Pending | null = null;
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
          // taken by a check-in not yet on screen: record as V4 does today.
          out.push({type: 'v4_record', decision: d, assessment, observations});
        }
      }
      // A pending record-level candidate settles once the audio is 1 s past it,
      // or at once if the slot is already taken (it could not lift anyway).
      if (pending && (reserved || endMs >= pending.endMs + SETTLE_AFTER_MS)) {
        out.push(settle(pending, true));
        pending = null;
      }
      if (d.record && d.level === 'record') {
        // Only one candidate waits at a time; an older one settles first.
        if (pending) out.push(settle(pending, true));
        pending = {decision: d, endMs, observations};
        if (reserved) {
          out.push(settle(pending, false));
          pending = null;
        }
      }
      return out;
    },
    checkinClosed() {
      reserved = false;
    },
    stop() {
      if (!pending) return [];
      const a = settle(pending, false);
      pending = null;
      return [a];
    },
    get slotReserved() {
      return reserved;
    },
  };
}
