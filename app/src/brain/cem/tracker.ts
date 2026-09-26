/**
 * Feeds the detection engine's stream into CEM-1, and builds the
 * `evidence_observed` records that go into the member's chain.
 *
 * The tracker ingests every confirmation the engine produces (both levels),
 * including ones the engine then drops as duplicates, so three scream windows
 * in 10 s become `scream_sustained` as CEM-0 defines it. Confirmations of one
 * kind are grouped into 10 s episodes, one reason each, so a long sound is not
 * counted once per window.
 *
 * Context (music, crowd, children, laughter, sirens, distress sounds) is kept
 * per window and paired with each trigger: for every trigger, at most one hit
 * of each context reason, the nearest one within CEM-0's window (±1 s for
 * context, ±10 s for distress sounds). Continuous TV therefore always sits
 * beside a later trigger. Motion comes from the engine's look-back
 * corroboration (H3). PIN reasons come only through `observePin`.
 *
 * Pure: no clock, no I/O. Times are the engine's monotonic milliseconds.
 */
import {CONTEXT, type Candidate, type ContextReason, type Corroboration, type Decision, type Ruleset} from '../detect';
import {CEM_VERSION, CONTEXT_WINDOW_S, SUPPORT_WINDOW_S, assess, type Assessment, type ReasonName, type Signal} from '.';

const EPISODE_MS = 10_000;
/** Older than this, a reason has decayed below one deciban from any weight. */
const FORGET_MS = 30 * 60_000;
/** At most this many reasons in one record, strongest first. */
export const MAX_REASONS = 8;
export const MAX_OBSERVATIONS = 4;

type Kind = 'scream' | 'shout' | 'glass' | 'gun';

const KIND: Readonly<Record<string, Kind>> = {
  Screaming: 'scream',
  Shout: 'shout',
  Yell: 'shout',
  Glass: 'glass',
  Shatter: 'glass',
  Breaking: 'glass',
  'Gunshot, gunfire': 'gun',
  'Machine gun': 'gun',
  Fusillade: 'gun',
};

const MOTION: Readonly<Record<Corroboration['pattern'], ReasonName>> = {
  impact: 'impact',
  snatch: 'snatch',
  shake: 'shake_sustained',
};

/** Weight-0 observations: recorded for explanation and experiments, never scored. */
export type Observation = 'snatch_liu';

export type EvidenceCandidate = {
  class_label: string;
  class_index: number;
  score_bp: number;
  threshold_bp: number;
  level: 'record' | 'prompt';
};

/** evidence_observed pv2, decision "record" or "prompt": one assessment. */
export type EvidenceAssessedV2 = {
  kind: 'evidence_observed';
  pv: 2;
  journey_id: string;
  cem_version: typeof CEM_VERSION;
  ruleset_digest: string;
  decision: 'record' | 'prompt';
  tally_db: number;
  band: Assessment['band'];
  k_pct: number;
  context: 'on' | 'off';
  reasons: {name: ReasonName; db: number}[];
  observations: Observation[];
  candidate: EvidenceCandidate;
  signal_event_id: string | null;
};

/**
 * evidence_observed pv2, decision "pin": what the member's entry looked like.
 * Fixed shape for every answer and both PINs (V5): the same two reasons in the
 * same order, weights 0 or 2 (single digit), no aggregate fields.
 */
export type EvidencePinV2 = {
  kind: 'evidence_observed';
  pv: 2;
  journey_id: string;
  cem_version: typeof CEM_VERSION;
  ruleset_digest: string;
  decision: 'pin';
  checkin_id: string;
  reasons: [{name: 'pin_retry'; db: 0 | 2}, {name: 'pin_slow'; db: 0 | 2}];
};

export type Tracker = {
  /** Every decision the engine returns, with its window. */
  observe(d: Decision, window: {endMs: number; contextBp?: readonly number[]}): void;
  /** PIN behaviour, only once its signed evidence is queued. */
  observePin(p: {retry: boolean; slow: boolean}, atMs: number): void;
  /** The evidence as it stands at `atMs`. */
  assess(atMs: number): Assessment;
};

/** The confirmed class of a decision, if its window confirmed one. */
function confirmedLabel(d: Decision): string | null {
  const confirmed = d.reasons.some(r => r.rule === 'confirm' && r.pass);
  if (!confirmed) return null;
  const winner = d.reasons.find(r => r.rule === 'winner');
  return winner && winner.rule === 'winner' ? winner.class_label : null;
}

type Timed = {reason: ReasonName; ms: number};

/** One reason per 10 s episode of one kind, as CEM-0 section 4 defines them. */
function episodes(kind: Kind, hits: number[]): Timed[] {
  const out: Timed[] = [];
  let i = 0;
  while (i < hits.length) {
    const start = hits[i];
    const inEpisode: number[] = [];
    while (i < hits.length && hits[i] - start <= EPISODE_MS) inEpisode.push(hits[i++]);
    if (kind === 'scream') {
      out.push(inEpisode.length >= 3 ? {reason: 'scream_sustained', ms: inEpisode[2]} : {reason: 'scream_single', ms: start});
    } else if (kind === 'gun') {
      out.push(inEpisode.length >= 2 ? {reason: 'gun_like_repeated', ms: inEpisode[1]} : {reason: 'gun_like_single', ms: start});
    } else {
      out.push({reason: kind === 'shout' ? 'shout_or_yell' : 'glass_or_breaking', ms: start});
    }
  }
  return out;
}

export function createTracker(r: Ruleset): Tracker {
  const hits: Record<Kind, number[]> = {scream: [], shout: [], glass: [], gun: []};
  const context: {reason: ContextReason; ms: number}[] = [];
  const motion = new Map<string, Signal>();
  const pins: Timed[] = [];
  let latest = 0;

  const forget = () => {
    const cutoff = latest - FORGET_MS;
    for (const k of Object.keys(hits) as Kind[]) hits[k] = hits[k].filter(ms => ms >= cutoff);
    for (let i = context.length - 1; i >= 0; i--) if (context[i].ms < cutoff) context.splice(i, 1);
    for (let i = pins.length - 1; i >= 0; i--) if (pins[i].ms < cutoff) pins.splice(i, 1);
    for (const [key, s] of motion) if (s.t * 1000 < cutoff) motion.delete(key);
  };
  const sec = (ms: number) => Math.floor(ms / 1000);

  return {
    observe(d, w) {
      latest = Math.max(latest, w.endMs);
      const label = confirmedLabel(d);
      const kind = label ? KIND[label] : undefined;
      if (kind) hits[kind].push(w.endMs);
      if (w.contextBp) {
        const seen = new Set<ContextReason>();
        CONTEXT.forEach((c, i) => {
          if (!seen.has(c.reason) && (w.contextBp?.[i] ?? 0) >= r.contextThresholdBp) {
            seen.add(c.reason);
            context.push({reason: c.reason, ms: w.endMs});
          }
        });
      }
      for (const c of d.corroboration) {
        const s: Signal = {reason: MOTION[c.pattern], t: sec(w.endMs + c.offset_ms)};
        motion.set(`${s.reason}@${s.t}`, s);
      }
      forget();
    },
    observePin(p, atMs) {
      latest = Math.max(latest, atMs);
      if (p.retry) pins.push({reason: 'pin_retry', ms: atMs});
      if (p.slow) pins.push({reason: 'pin_slow', ms: atMs});
      forget();
    },
    assess(atMs) {
      const triggers: Timed[] = [];
      for (const k of Object.keys(hits) as Kind[]) triggers.push(...episodes(k, hits[k]));
      const out = new Map<string, Signal>();
      const add = (reason: ReasonName, ms: number) => out.set(`${reason}@${sec(ms)}`, {reason, t: sec(ms)});
      for (const t of triggers) add(t.reason, t.ms);
      for (const s of motion.values()) out.set(`${s.reason}@${s.t}`, s);
      for (const p of pins) add(p.reason, p.ms);
      // Each trigger takes the nearest hit of each context reason inside its window.
      for (const t of triggers) {
        const nearest = new Map<ContextReason, number>();
        for (const c of context) {
          const limit = (c.reason === 'distress_vocal' ? SUPPORT_WINDOW_S : CONTEXT_WINDOW_S) * 1000;
          const gap = Math.abs(c.ms - t.ms);
          if (gap > limit) continue;
          const prev = nearest.get(c.reason);
          if (prev === undefined || gap < Math.abs(prev - t.ms)) nearest.set(c.reason, c.ms);
        }
        for (const [reason, ms] of nearest) add(reason, ms);
      }
      return assess([...out.values()], sec(atMs));
    },
  };
}

export function candidateOf(c: Candidate, level: 'record' | 'prompt'): EvidenceCandidate {
  return {class_label: c.class_label, class_index: c.class_index, score_bp: c.score_bp, threshold_bp: c.threshold_bp, level};
}

export function buildEvidence(args: {
  journeyId: string;
  rulesetDigest: string;
  decision: 'record' | 'prompt';
  assessment: Assessment;
  candidate: EvidenceCandidate;
  context: 'on' | 'off';
  observations: Observation[];
  signalEventId: string | null;
}): EvidenceAssessedV2 {
  const a = args.assessment;
  return {
    kind: 'evidence_observed',
    pv: 2,
    journey_id: args.journeyId,
    cem_version: CEM_VERSION,
    ruleset_digest: args.rulesetDigest,
    decision: args.decision,
    tally_db: a.total,
    band: a.band,
    k_pct: a.k_pct,
    context: args.context,
    reasons: a.reasons
      .filter(x => x.db !== 0)
      .slice(0, MAX_REASONS)
      .map(x => ({name: x.reason, db: x.db})),
    observations: args.observations.slice(0, MAX_OBSERVATIONS),
    candidate: args.candidate,
    signal_event_id: args.signalEventId,
  };
}

export function buildPinEvidence(args: {journeyId: string; rulesetDigest: string; checkinId: string; retry: boolean; slow: boolean}): EvidencePinV2 {
  return {
    kind: 'evidence_observed',
    pv: 2,
    journey_id: args.journeyId,
    cem_version: CEM_VERSION,
    ruleset_digest: args.rulesetDigest,
    decision: 'pin',
    checkin_id: args.checkinId,
    reasons: [
      {name: 'pin_retry', db: args.retry ? 2 : 0},
      {name: 'pin_slow', db: args.slow ? 2 : 0},
    ],
  };
}
