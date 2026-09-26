/**
 * The phone's check of the escalation payloads before they are signed and
 * queued: spec §4b and §4b.1, `contracts/payloads/*.v1.json` (PROPOSED, on
 * Sibusiso's slice-3 branch, PR #89). Each kind lists every field it may
 * carry, so nothing extra can ride along (additionalProperties: false). The
 * server validates the same schemas; this check only stops the phone from
 * queuing an event the server is certain to refuse.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const B64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

type Rule = (v: unknown) => boolean;
const str = (min: number, max: number): Rule => v => typeof v === 'string' && v.length >= min && v.length <= max;
const oneOf = (...xs: unknown[]): Rule => v => xs.includes(v);
const match = (re: RegExp): Rule => v => typeof v === 'string' && re.test(v);
const intMin = (n: number): Rule => v => typeof v === 'number' && Number.isSafeInteger(v) && v >= n;
const intIn = (lo: number, hi: number): Rule => v => typeof v === 'number' && Number.isSafeInteger(v) && v >= lo && v <= hi;
const HEX64 = /^[0-9a-f]{64}$/;
const REASON = /^[a-z][a-z0-9_]{0,39}$/;
const reasons: Rule = v =>
  Array.isArray(v) &&
  v.length <= 8 &&
  v.every(r => r && typeof r === 'object' && Object.keys(r).sort().join() === 'db,name' && match(REASON)(r.name) && intIn(-100, 100)(r.db));

const SCHEMAS: Record<string, Record<string, Rule>> = {
  evidence_observed: {
    kind: oneOf('evidence_observed'),
    pv: oneOf(1),
    journey_id: str(1, 128),
    cem_version: oneOf('CEM-1'),
    ruleset_digest: match(HEX64),
    decision: oneOf('record', 'prompt'),
    tally_db: intIn(-1000, 1000),
    band: oneOf('faint', 'some', 'strong', 'very strong', 'overwhelming'),
    k_pct: intIn(0, 100),
    reasons,
  },
  checkin_opened: {
    kind: oneOf('checkin_opened'),
    pv: oneOf(1),
    checkin_id: match(UUID),
    journey_id: str(1, 128),
    signal_event_id: match(UUID),
    window_s: oneOf(20, 60),
  },
  checkin_result: {
    kind: oneOf('checkin_result'),
    pv: oneOf(1),
    checkin_id: match(UUID),
    result: oneOf('normal_pin', 'duress_pin'),
    attempt: intMin(1),
  },
  journey_ended: {
    kind: oneOf('journey_ended'),
    pv: oneOf(1),
    journey_id: str(1, 128),
  },
  guardian_ack: {
    kind: oneOf('guardian_ack'),
    pv: oneOf(1),
    incident_id: match(UUID),
    action: oneOf('called_10111', 'handling', 'stand_down'),
  },
  pin_authorised: {
    kind: oneOf('pin_authorised'),
    pv: oneOf(1),
    action: oneOf('end_journey', 'export', 'delete', 'add_guardian', 'remove_guardian'),
    target_id: str(1, 128),
    mode: oneOf('normal', 'duress'),
    nonce: str(1, 128),
    sig: v => typeof v === 'string' && v.length >= 4 && B64.test(v),
    signer_key_id: str(1, 256),
  },
};

const CLASS_LABEL = /^[A-Za-z][A-Za-z ,()-]{0,63}$/;
const candidate: Rule = v =>
  !!v &&
  typeof v === 'object' &&
  !Array.isArray(v) &&
  Object.keys(v).sort().join() === 'class_index,class_label,level,score_bp,threshold_bp' &&
  match(CLASS_LABEL)((v as Record<string, unknown>).class_label) &&
  intIn(0, 520)((v as Record<string, unknown>).class_index) &&
  intIn(0, 10000)((v as Record<string, unknown>).score_bp) &&
  intIn(0, 10000)((v as Record<string, unknown>).threshold_bp) &&
  oneOf('record', 'prompt')((v as Record<string, unknown>).level);
const observations: Rule = v => Array.isArray(v) && v.length <= 4 && v.every(o => o === 'snatch_liu');
const pinReasons: Rule = v =>
  Array.isArray(v) &&
  v.length === 2 &&
  v[0]?.name === 'pin_retry' &&
  v[1]?.name === 'pin_slow' &&
  v.every(r => Object.keys(r).sort().join() === 'db,name' && (r.db === 0 || r.db === 2));

/**
 * evidence_observed pv2 (ADR-0047, PROPOSED): one schema per decision, so a
 * record carries no signal, a prompt names exactly its signal, and PIN
 * evidence has no aggregate fields at all (fixed shape for both PINs).
 */
const EVIDENCE_V2: Record<string, Record<string, Rule>> = {
  record: {
    ...SCHEMAS.evidence_observed,
    pv: oneOf(2),
    decision: oneOf('record'),
    context: oneOf('on', 'off'),
    observations,
    candidate,
    signal_event_id: v => v === null,
  },
  prompt: {
    ...SCHEMAS.evidence_observed,
    pv: oneOf(2),
    decision: oneOf('prompt'),
    context: oneOf('on', 'off'),
    observations,
    candidate,
    signal_event_id: match(UUID),
  },
  pin: {
    kind: oneOf('evidence_observed'),
    pv: oneOf(2),
    journey_id: str(1, 128),
    cem_version: oneOf('CEM-1'),
    ruleset_digest: match(HEX64),
    decision: oneOf('pin'),
    checkin_id: match(UUID),
    reasons: pinReasons,
  },
};

function schemaFor(payload: {kind: string; [k: string]: unknown}): Record<string, Rule> | undefined {
  if (payload.kind === 'evidence_observed' && payload.pv === 2) {
    const s = EVIDENCE_V2[String(payload.decision)];
    if (!s) throw new Error('evidence_observed: "decision" has an invalid value');
    return s;
  }
  return SCHEMAS[payload.kind];
}

/** Throws naming the first problem; kinds without a schema here pass through. */
export function checkPayload(payload: {kind: string; [k: string]: unknown}): void {
  const schema = schemaFor(payload);
  if (!schema) return;
  for (const k of Object.keys(payload)) {
    if (!(k in schema)) throw new Error(`${payload.kind}: field "${k}" is not allowed`);
  }
  for (const [k, ok] of Object.entries(schema)) {
    if (!(k in payload)) throw new Error(`${payload.kind}: "${k}" is required`);
    if (!ok(payload[k])) throw new Error(`${payload.kind}: "${k}" has an invalid value`);
  }
}
