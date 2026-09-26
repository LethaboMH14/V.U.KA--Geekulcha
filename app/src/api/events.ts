/**
 * Builds format-v2 events and signed requests exactly as the ANCHOR server
 * verifies them (spec §4, §5, §7; server/main.py on PR #51):
 *
 *  - commitment = hex(SHA-256(salt(16 bytes) || canonical(payload)))
 *  - details.sig = signature over canonical({domain: "vuka.event.v2", subject_id,
 *    actor_id, target_type, target_id, action, source_ts, signer_key_id,
 *    counter, event_id, commitment})
 *  - request headers sign canonical({method, path, ts, body_sha256, nonce})
 *
 * Two signature encodings, as the server and the stranger's verifier
 * (shared/verify.js) require: the EVENT signature (details.sig) is DER, as
 * Android Keystore produces it; the REQUEST signature header is raw r||s.
 * Both come from the same P-256 key. The signer is an interface
 * so the same code runs on the phone (Android Keystore) and in host tests.
 */
import {canonicalJson} from '../../../shared/canonical.js';

export interface Signer {
  identity(): Promise<{publicKey: string; keyId: string}>;
  /** Signs the UTF-8 bytes of `text`; returns raw r||s, base64 (request headers). */
  sign(text: string): Promise<string>;
  /** Signs the UTF-8 bytes of `text`; returns DER, base64 (the event statement, details.sig). */
  signDer(text: string): Promise<string>;
  randomBytes(n: number): Promise<string>;
  /** hex(SHA-256(base64decode(salt) || UTF-8(text))) */
  commitment(saltB64: string, text: string): Promise<string>;
  sha256Hex(text: string): Promise<string>;
  nextCounter(): Promise<number>;
}

export type EventPayload = {kind: string; pv: number; [k: string]: unknown};

export type EventSubmission = {
  action: string;
  actor_id: string;
  target_type: 'journey' | 'subject';
  target_id: string;
  details: {
    v: 2;
    signer: 'device' | 'guardian';
    signer_key_id: string;
    counter: number;
    event_id: string;
    commitment: string;
    sig: string;
    signer_pubkey?: string;
  };
  ts: string;
  payload: EventPayload;
  salt: string;
};

/** RFC 3339 with seconds and an offset (the server rejects anything else). */
export const rfc3339 = (d: Date): string => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

/** A lowercase v4 UUID from native random bytes. */
export async function uuid(signer: Signer): Promise<string> {
  const b = Array.from(base64ToBytes(await signer.randomBytes(16)));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64ToBytes(s: string): Uint8Array {
  const clean = s.replace(/=+$/, '');
  const out: number[] = [];
  let buf = 0;
  let bits = 0;
  for (const ch of clean) {
    const v = B64.indexOf(ch);
    if (v < 0) throw new Error('invalid base64');
    buf = (buf << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buf >> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

export async function buildEvent(args: {
  signer: Signer;
  subjectId: string;
  actorId: string;
  action: string;
  targetType: 'journey' | 'subject';
  targetId: string;
  payload: EventPayload;
  ts: string;
  /** The genesis registration carries the public key so the server can enrol it. */
  genesis?: boolean;
  /** A guardian signs with the same Keystore key under its guardian key id (G5). */
  as?: {role: 'guardian'; keyId: string};
}): Promise<EventSubmission> {
  const {signer} = args;
  const id = await signer.identity();
  const publicKey = id.publicKey;
  const keyId = args.as?.keyId ?? id.keyId;
  const salt = await signer.randomBytes(16);
  const commitment = await signer.commitment(salt, canonicalJson(args.payload));
  const counter = await signer.nextCounter();
  const eventId = await uuid(signer);
  const statement = {
    domain: 'vuka.event.v2',
    subject_id: args.subjectId,
    actor_id: args.actorId,
    target_type: args.targetType,
    target_id: args.targetId,
    action: args.action,
    source_ts: args.ts,
    signer_key_id: keyId,
    counter,
    event_id: eventId,
    commitment,
  };
  const sig = await signer.signDer(canonicalJson(statement));
  return {
    action: args.action,
    actor_id: args.actorId,
    target_type: args.targetType,
    target_id: args.targetId,
    details: {
      v: 2,
      signer: args.as?.role ?? 'device',
      signer_key_id: keyId,
      counter,
      event_id: eventId,
      commitment,
      sig,
      ...(args.genesis ? {signer_pubkey: publicKey} : {}),
    },
    ts: args.ts,
    payload: args.payload,
    salt,
  };
}

/** Headers for a signed request (§7). `body` must be the exact bytes sent. */
export async function signedHeaders(signer: Signer, method: string, path: string, body: string, ts: string, keyIdOverride?: string): Promise<Record<string, string>> {
  const keyId = keyIdOverride ?? (await signer.identity()).keyId;
  const nonce = await signer.randomBytes(16);
  const statement = {method: method.toUpperCase(), path, ts, body_sha256: await signer.sha256Hex(body), nonce};
  return {
    'Content-Type': 'application/json',
    'X-Vuka-Key-Id': keyId,
    'X-Vuka-Ts': ts,
    'X-Vuka-Nonce': nonce,
    'X-Vuka-Signature': await signer.sign(canonicalJson(statement)),
  };
}

export type Receipt = {event_hash: string; chain_index: number; received_at: string};

/**
 * Any signed request (§7). `body` is sent exactly as given (it is what the
 * signature covers). Throws "<status> <code>: <message>" on a refusal, or the
 * fetch error when there is no network.
 */
export async function signedRequest<T>(
  baseUrl: string,
  signer: Signer,
  method: string,
  path: string,
  body: string,
  now: () => Date = () => new Date(),
  keyId?: string,
): Promise<T> {
  const headers = await signedHeaders(signer, method, path, body, rfc3339(now()), keyId);
  const res = await fetch(baseUrl.replace(/\/$/, '') + path, {method, headers, body: body.length ? body : undefined});
  const text = await res.text();
  const json = (text ? JSON.parse(text) : {}) as T & {code?: string; message?: string};
  if (!res.ok) throw new Error(`${res.status} ${json.code ?? 'error'}: ${json.message ?? ''}`);
  return json;
}

/** POST one event. Returns the receipt, or throws with the server's error code. */
export async function postEvent(baseUrl: string, signer: Signer, entry: EventSubmission, now: () => Date = () => new Date()): Promise<Receipt> {
  const body = canonicalJson(entry);
  const path = '/v1/events';
  const headers = await signedHeaders(signer, 'POST', path, body, rfc3339(now()), entry.details.signer_key_id);
  const res = await fetch(baseUrl.replace(/\/$/, '') + path, {method: 'POST', headers, body});
  const json = (await res.json()) as Receipt & {code?: string; message?: string};
  if (!res.ok) throw new Error(`${res.status} ${json.code ?? 'error'}: ${json.message ?? ''}`);
  return json;
}
