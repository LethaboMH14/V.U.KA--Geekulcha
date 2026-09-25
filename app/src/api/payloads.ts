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

const SCHEMAS: Record<string, Record<string, Rule>> = {
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
  pin_authorised: {
    kind: oneOf('pin_authorised'),
    pv: oneOf(1),
    action: oneOf('end_journey', 'export'),
    target_id: str(1, 128),
    mode: oneOf('normal', 'duress'),
    nonce: str(1, 128),
    sig: v => typeof v === 'string' && v.length >= 4 && B64.test(v),
    signer_key_id: str(1, 256),
  },
};

/** Throws naming the first problem; kinds without a schema here pass through. */
export function checkPayload(payload: {kind: string; [k: string]: unknown}): void {
  const schema = SCHEMAS[payload.kind];
  if (!schema) return;
  for (const k of Object.keys(payload)) {
    if (!(k in schema)) throw new Error(`${payload.kind}: field "${k}" is not allowed`);
  }
  for (const [k, ok] of Object.entries(schema)) {
    if (!(k in payload)) throw new Error(`${payload.kind}: "${k}" is required`);
    if (!ok(payload[k])) throw new Error(`${payload.kind}: "${k}" has an invalid value`);
  }
}
