/**
 * Builds the `signal_detected` payload, pv 1, exactly as spec §18 tables it:
 * the fields, their types and ranges, and nothing else (additionalProperties
 * false). Every number is an integer, because this object is canonicalised,
 * salted, committed and signed (§4, §5), and a float would fail in both the
 * JS and the Python canonicaliser. It throws rather than emit a bad payload.
 *
 * When contract v2 freezes `contracts/payloads/signal_detected.v1.json`, that
 * schema becomes the binding check and this builder is tested against its
 * golden vector.
 */
import {TARGETS} from './classes';
import type {Candidate} from './engine';
import type {Corroboration} from './motion';

export type Location = {lat_e7: number; lon_e7: number; acc_m: number; fix_age_ms: number};

export type SignalDetectedV1 = {
  kind: 'signal_detected';
  pv: 1;
  journey_id: string;
  sense: 'sound';
  class_label: string;
  class_index: number;
  score_bp: number;
  threshold_bp: number;
  window_ms: 975;
  model_sha256: string;
  app_version: string;
  corroboration: Corroboration[];
  location?: Location;
};

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isSafeInteger(x);
const inRange = (x: unknown, lo: number, hi: number) => isInt(x) && x >= lo && x <= hi;

function fail(msg: string): never {
  throw new Error(`signal_detected v1: ${msg}`);
}

export function buildSignalDetected(args: {
  journeyId: string;
  candidate: Candidate;
  corroboration: readonly Corroboration[];
  modelSha256: string;
  appVersion: string;
  location?: Location;
}): SignalDetectedV1 {
  const {journeyId, candidate: c, corroboration, modelSha256, appVersion, location} = args;

  if (typeof journeyId !== 'string' || journeyId.length === 0) fail('journey_id must be a non-empty string');
  const target = TARGETS.find(t => t.label === c.class_label);
  if (!target) fail(`class_label "${c.class_label}" is not one of the nine classes`);
  if (target.index !== c.class_index) fail(`class_index ${c.class_index} does not match "${c.class_label}" (${target.index})`);
  if (!inRange(c.score_bp, 0, 10000)) fail('score_bp must be an integer 0–10000');
  if (!inRange(c.threshold_bp, 0, 10000)) fail('threshold_bp must be an integer 0–10000');
  if (!/^[0-9a-f]{64}$/.test(modelSha256)) fail('model_sha256 must be 64 lowercase hex characters');
  if (!/^\d+\.\d+\.\d+$/.test(appVersion)) fail('app_version must be a semantic version');
  if (corroboration.length > 4) fail('at most 4 corroboration items');

  const items = corroboration.map(m => {
    if (m.sense !== 'motion') fail('corroboration sense must be "motion"');
    if (!['impact', 'shake', 'snatch'].includes(m.pattern)) fail('corroboration pattern');
    if (!inRange(m.peak_mg, 0, 16000)) fail('peak_mg must be an integer 0–16000');
    if (!inRange(m.duration_ms, 1, 10000)) fail('duration_ms must be an integer 1–10000');
    if (!inRange(m.offset_ms, -10000, 0)) fail('offset_ms must be an integer −10000–0');
    if (typeof m.rule_version !== 'string' || !m.rule_version) fail('rule_version');
    // A fresh object with exactly the schema's keys, nothing inherited or extra.
    return {sense: 'motion' as const, pattern: m.pattern, peak_mg: m.peak_mg, duration_ms: m.duration_ms, offset_ms: m.offset_ms, rule_version: m.rule_version};
  });

  const payload: SignalDetectedV1 = {
    kind: 'signal_detected',
    pv: 1,
    journey_id: journeyId,
    sense: 'sound',
    class_label: c.class_label,
    class_index: c.class_index,
    score_bp: c.score_bp,
    threshold_bp: c.threshold_bp,
    window_ms: 975,
    model_sha256: modelSha256,
    app_version: appVersion,
    corroboration: items,
  };

  if (location) {
    if (!inRange(location.lat_e7, -900000000, 900000000)) fail('location.lat_e7');
    if (!inRange(location.lon_e7, -1800000000, 1800000000)) fail('location.lon_e7');
    if (!inRange(location.acc_m, 0, Number.MAX_SAFE_INTEGER)) fail('location.acc_m');
    if (!inRange(location.fix_age_ms, 0, Number.MAX_SAFE_INTEGER)) fail('location.fix_age_ms');
    payload.location = {lat_e7: location.lat_e7, lon_e7: location.lon_e7, acc_m: location.acc_m, fix_age_ms: location.fix_age_ms};
  }
  return payload;
}

/** True when no number anywhere in `v` is a non-integer (the §5 rule). */
export function integersOnly(v: unknown): boolean {
  if (typeof v === 'number') return Number.isSafeInteger(v);
  if (Array.isArray(v)) return v.every(integersOnly);
  if (v && typeof v === 'object') return Object.values(v).every(integersOnly);
  return true;
}
