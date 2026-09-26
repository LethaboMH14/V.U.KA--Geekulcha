/**
 * CEM-1 on the phone: the team's coercion evidence model (CEM-0,
 * docs/COERCION-SCENARIOS.md, scripts/coercion_scenarios.py), for the reasons
 * the phone itself can observe: sounds, sound context and motion.
 *
 * Points are integer decibans. Detector reasons halve every 120 s, computed
 * with the same exact integer rule as the Python, so both give the same total
 * for the same evidence (golden test: __tests__/golden.json). The tally is an
 * uncalibrated sum of reasons, never a probability (ADR-0039): it is shown as
 * a band word with its reasons, never as a percentage.
 *
 * Pure: no clock, no I/O. Times are integer seconds on any fixed clock.
 */

export const CEM_VERSION = 'CEM-1';
export const HALF_LIFE_S = 120;
export const LOOKBACK_S = 10;
export const SUPPORT_WINDOW_S = 10;
export const CONTEXT_WINDOW_S = 1;
export const DISTRESS_CAP = 6;
export const K_CONFLICT_PCT = 50;

type Kind = 'trigger' | 'support' | 'context' | 'motion' | 'pin';
type Spec = {db: number; kind: Kind; status: 'BUILT-SPEC' | 'ADR-0039' | 'PROPOSED' | 'CEM-1'; words: string};

/** Phone-observable reasons, as CEM-0 section 4 scores them, plus the CEM-1 PIN reasons. */
export const REASONS = {
  scream_single: {db: 7, kind: 'trigger', status: 'BUILT-SPEC', words: 'a scream'},
  scream_sustained: {db: 12, kind: 'trigger', status: 'BUILT-SPEC', words: 'sustained screaming'},
  shout_or_yell: {db: 4, kind: 'trigger', status: 'BUILT-SPEC', words: 'a shout'},
  glass_or_breaking: {db: 5, kind: 'trigger', status: 'BUILT-SPEC', words: 'breaking glass'},
  smash_crash: {db: 3, kind: 'trigger', status: 'PROPOSED', words: 'a smash or crash'},
  gun_like_single: {db: 8, kind: 'trigger', status: 'ADR-0039', words: 'a gun-like sound'},
  gun_like_repeated: {db: 12, kind: 'trigger', status: 'ADR-0039', words: 'repeated gun-like sounds'},
  distress_vocal: {db: 3, kind: 'support', status: 'PROPOSED', words: 'crying or gasping'},
  tyre_squeal_or_skid: {db: 3, kind: 'support', status: 'PROPOSED', words: 'tyres skidding'},
  car_alarm: {db: 2, kind: 'support', status: 'PROPOSED', words: 'a car alarm'},
  media_context: {db: -6, kind: 'context', status: 'PROPOSED', words: 'music or TV nearby'},
  crowd_context: {db: -5, kind: 'context', status: 'PROPOSED', words: 'a crowd nearby'},
  children_playing: {db: -4, kind: 'context', status: 'PROPOSED', words: 'children playing'},
  laughter: {db: -4, kind: 'context', status: 'PROPOSED', words: 'laughter'},
  siren_nearby: {db: 0, kind: 'context', status: 'PROPOSED', words: 'a siren'},
  impact: {db: 4, kind: 'motion', status: 'ADR-0039', words: 'the phone hit hard'},
  snatch: {db: 5, kind: 'motion', status: 'ADR-0039', words: 'the phone grabbed'},
  shake_sustained: {db: 3, kind: 'motion', status: 'ADR-0039', words: 'the phone shaken'},
  // CEM-1 additions (PROPOSED, weights provisional): behaviour at a check-in,
  // the same for both PINs. Not gated by trigger windows; they decay like the rest.
  pin_retry: {db: 2, kind: 'pin', status: 'CEM-1', words: 'a wrong PIN first'},
  pin_slow: {db: 2, kind: 'pin', status: 'CEM-1', words: 'a slower PIN than usual'},
} as const satisfies Record<string, Spec>;

export type ReasonName = keyof typeof REASONS;
export type Signal = {reason: ReasonName; t: number};
export type Contribution = {reason: ReasonName; t: number; db: number; words: string};
export type Assessment = {
  cem_version: typeof CEM_VERSION;
  pos: number;
  neg: number;
  total: number;
  k_pct: number;
  band: Band;
  conflict: boolean;
  /** Scored reasons at evaluation time, strongest first. */
  reasons: Contribution[];
};
export type Band = 'faint' | 'some' | 'strong' | 'very strong' | 'overwhelming';

/**
 * points × 2^(−dt/120), rounded half-up on the magnitude, exactly as the
 * Python: the largest n with (2n − 1)^120 × 2^dt ≤ (2|p|)^120.
 */
export function decay(points: number, dt: number): number {
  if (points === 0 || dt <= 0) return points;
  const sign = points > 0 ? 1 : -1;
  const p = BigInt(Math.abs(points));
  const H = BigInt(HALF_LIFE_S);
  const target = (2n * p) ** H;
  const scale = 2n ** BigInt(Math.floor(dt));
  let n = p;
  while (n > 0n && (2n * n - 1n) ** H * scale > target) n -= 1n;
  return sign * Number(n);
}

export function band(total: number): Band {
  if (total < 5) return 'faint';
  if (total <= 11) return 'some';
  if (total <= 19) return 'strong';
  if (total <= 29) return 'very strong';
  return 'overwhelming';
}

const roundHalfUp = (num: number, den: number) => Math.floor((2 * num + den) / (2 * den));

/** Which signals count (CEM-0 entries_for, for phone reasons). */
function scored(signals: readonly Signal[]): Signal[] {
  const trig = signals.filter(s => REASONS[s.reason].kind === 'trigger').map(s => s.t);
  return signals.filter(s => {
    const kind = REASONS[s.reason].kind;
    if (kind === 'motion') return trig.some(x => s.t <= x && x <= s.t + LOOKBACK_S); // H3: look-back only
    if (kind === 'support') return trig.some(x => Math.abs(x - s.t) <= SUPPORT_WINDOW_S);
    if (kind === 'context') return trig.some(x => Math.abs(x - s.t) <= CONTEXT_WINDOW_S);
    return true; // trigger, pin
  });
}

/** The evidence at time `at`: totals, conflict and the reasons behind them. */
export function assess(signals: readonly Signal[], at: number): Assessment {
  const sorted = [...signals].sort((a, b) => a.t - b.t || a.reason.localeCompare(b.reason));
  let distressUsed = 0;
  const reasons: Contribution[] = [];
  for (const s of scored(sorted)) {
    if (s.t > at) continue;
    let db = decay(REASONS[s.reason].db, at - s.t);
    if (s.reason === 'distress_vocal') {
      db = Math.max(0, Math.min(db, DISTRESS_CAP - distressUsed));
      distressUsed += db;
    }
    reasons.push({reason: s.reason, t: s.t, db, words: REASONS[s.reason].words});
  }
  const pos = reasons.filter(r => r.db > 0).reduce((a, r) => a + r.db, 0);
  const neg = reasons.filter(r => r.db < 0).reduce((a, r) => a - r.db, 0);
  const k = Math.max(pos, neg) === 0 ? 0 : roundHalfUp(100 * Math.min(pos, neg), Math.max(pos, neg));
  const total = pos - neg;
  return {
    cem_version: CEM_VERSION,
    pos,
    neg,
    total,
    k_pct: k,
    band: band(total),
    conflict: k >= K_CONFLICT_PCT,
    reasons: reasons.sort((a, b) => Math.abs(b.db) - Math.abs(a.db) || a.t - b.t),
  };
}

/** Plain words for a guardian or the member: "a scream and the phone grabbed". */
export function inWords(a: Assessment, max = 3): string {
  const words = a.reasons.filter(r => r.db > 0).slice(0, max).map(r => r.words);
  if (words.length === 0) return 'no clear sign';
  return words.length === 1 ? words[0] : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}
