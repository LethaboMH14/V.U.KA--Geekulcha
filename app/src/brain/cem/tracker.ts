/**
 * Feeds the detection engine's stream into CEM-1, and builds the
 * `evidence_observed` record that goes into the member's chain before each
 * `signal_detected`.
 *
 * The tracker ingests every confirmation the engine produces, including ones
 * the engine then drops as duplicates, so three scream windows in 10 s become
 * `scream_sustained` as CEM-0 defines it. Confirmations of one kind are grouped
 * into 10 s episodes (the span CEM-0's "sustained" and "repeated" rules use),
 * and each episode is one reason, so a long sound is not counted once per
 * window. Motion comes from the engine's corroboration, which is already
 * look-back only (H3).
 *
 * Pure: no clock, no I/O. Times are the engine's monotonic milliseconds.
 */
import type {Corroboration, Decision} from '../detect';
import {CEM_VERSION, assess, type Assessment, type ReasonName, type Signal} from '.';

const EPISODE_MS = 10_000;
/** Older than this, a reason has decayed below one deciban from any weight. */
const FORGET_MS = 30 * 60_000;
/** At most this many reasons in one record, strongest first. */
export const MAX_REASONS = 8;

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

export type EvidenceObservedV1 = {
  kind: 'evidence_observed';
  pv: 1;
  journey_id: string;
  cem_version: typeof CEM_VERSION;
  ruleset_digest: string;
  decision: 'record' | 'prompt';
  tally_db: number;
  band: Assessment['band'];
  k_pct: number;
  reasons: {name: ReasonName; db: number}[];
};

export type Tracker = {
  /** Every decision the engine returns, with the end time of its window. */
  observe(d: Decision, windowEndMs: number): void;
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

/** One reason per 10 s episode of one kind, as CEM-0 section 4 defines them. */
function episodes(kind: Kind, hits: number[]): Signal[] {
  const out: Signal[] = [];
  let i = 0;
  while (i < hits.length) {
    const start = hits[i];
    const inEpisode: number[] = [];
    while (i < hits.length && hits[i] - start <= EPISODE_MS) inEpisode.push(hits[i++]);
    const t = (ms: number) => Math.floor(ms / 1000);
    if (kind === 'scream') {
      out.push(inEpisode.length >= 3 ? {reason: 'scream_sustained', t: t(inEpisode[2])} : {reason: 'scream_single', t: t(start)});
    } else if (kind === 'gun') {
      out.push(inEpisode.length >= 2 ? {reason: 'gun_like_repeated', t: t(inEpisode[1])} : {reason: 'gun_like_single', t: t(start)});
    } else {
      out.push({reason: kind === 'shout' ? 'shout_or_yell' : 'glass_or_breaking', t: t(start)});
    }
  }
  return out;
}

export function createTracker(): Tracker {
  const hits: Record<Kind, number[]> = {scream: [], shout: [], glass: [], gun: []};
  const motion = new Map<string, Signal>();
  let latest = 0;

  const forget = () => {
    const cutoff = latest - FORGET_MS;
    for (const k of Object.keys(hits) as Kind[]) hits[k] = hits[k].filter(ms => ms >= cutoff);
    for (const [key, s] of motion) if (s.t * 1000 < cutoff) motion.delete(key);
  };

  return {
    observe(d, windowEndMs) {
      latest = Math.max(latest, windowEndMs);
      const label = confirmedLabel(d);
      const kind = label ? KIND[label] : undefined;
      if (kind) hits[kind].push(windowEndMs);
      for (const c of d.corroboration) {
        const s: Signal = {reason: MOTION[c.pattern], t: Math.floor((windowEndMs + c.offset_ms) / 1000)};
        motion.set(`${s.reason}@${s.t}`, s);
      }
      forget();
    },
    assess(atMs) {
      const signals: Signal[] = [...motion.values()];
      for (const k of Object.keys(hits) as Kind[]) signals.push(...episodes(k, hits[k]));
      return assess(signals, Math.floor(atMs / 1000));
    },
  };
}

export function buildEvidenceObserved(args: {
  journeyId: string;
  rulesetDigest: string;
  decision: 'record' | 'prompt';
  assessment: Assessment;
}): EvidenceObservedV1 {
  const a = args.assessment;
  return {
    kind: 'evidence_observed',
    pv: 1,
    journey_id: args.journeyId,
    cem_version: CEM_VERSION,
    ruleset_digest: args.rulesetDigest,
    decision: args.decision,
    tally_db: a.total,
    band: a.band,
    k_pct: a.k_pct,
    reasons: a.reasons
      .filter(r => r.db !== 0)
      .slice(0, MAX_REASONS)
      .map(r => ({name: r.reason, db: r.db})),
  };
}
