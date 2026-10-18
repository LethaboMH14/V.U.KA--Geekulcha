/**
 * Checks the member's export on the phone, with the phone's own SHA-256
 * (spec §4, §5; F14). It follows `shared/verify.js` step for step for the parts
 * that need only hashing:
 *
 *  - every entry links to the one before it (the first to 64 zeros);
 *  - every event hash is SHA-256 of the canonical entry without `event_hash`;
 *  - every payload matches its commitment, SHA-256(salt(16 bytes) || canonical payload);
 *
 * and adds the one check only the phone can make: every receipt this phone
 * kept, up to the export's head, is in the chain at the same index with the
 * same hash. Signatures and the public anchor are not checked here (React
 * Native has no WebCrypto); the stranger's verifier does those, and the screen
 * says so. The first broken entry is reported by index, never as a bare "no".
 */
import {canonicalJson} from '../../../shared/canonical.js';

const ZERO_HASH = '0'.repeat(64);

export type Hasher = {
  sha256Hex(text: string): Promise<string>;
  /** hex(SHA-256(base64decode(salt) || UTF-8(text))) */
  commitment(saltB64: string, text: string): Promise<string>;
};

type Entry = {prev_hash: string; event_hash: string; details: {event_id?: string; commitment?: string}; [k: string]: unknown};
export type Export = {
  subject_id: string;
  entries: Entry[];
  payloads: {event_id: string; payload: unknown}[];
  salts: {event_id: string; salt: string}[];
  proofs: unknown[];
  receipts: unknown[];
};

export type Receipt = {event_id: string; event_hash: string; chain_index: number};

export type RecordCheck = {
  ok: boolean;
  entries: number;
  /** Index of the first entry that fails, or null. */
  firstBroken: number | null;
  reason: string | null;
  /** Receipts on this phone that fall inside the export, and how many matched. */
  mine: {inside: number; matched: number};
  /** Entries whose payload was deleted (hash kept, §13). */
  payloadRemoved: number;
  /** True only when the export carries an anchor proof for its head. */
  anchored: boolean;
  head: string | null;
};

function without(entry: Entry): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const k of Object.keys(entry)) if (k !== 'event_hash') copy[k] = entry[k];
  return copy;
}

const saltBytes = (b64: string) => {
  const clean = b64.replace(/=+$/, '');
  return Math.floor((clean.length * 6) / 8);
};

export async function checkRecord(exp: Export, h: Hasher, mine: readonly Receipt[]): Promise<RecordCheck> {
  const entries = Array.isArray(exp?.entries) ? exp.entries : [];
  const payloads = new Map((exp?.payloads ?? []).map(p => [p.event_id, p.payload]));
  const salts = new Map((exp?.salts ?? []).map(s => [s.event_id, s.salt]));
  let payloadRemoved = 0;
  const fail = (i: number, reason: string): RecordCheck => ({
    ok: false,
    entries: entries.length,
    firstBroken: i,
    reason,
    mine: {inside: 0, matched: 0},
    payloadRemoved,
    anchored: false,
    head: null,
  });
  if (entries.length === 0) return fail(0, 'The export has no entries.');

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const expected = i === 0 ? ZERO_HASH : entries[i - 1].event_hash;
    if (e.prev_hash !== expected) return fail(i, 'It doesn’t link to the entry before it.');
    if ((await h.sha256Hex(canonicalJson(without(e)))) !== e.event_hash) return fail(i, 'Its hash doesn’t match its contents.');
    const id = e.details?.event_id;
    const hasPayload = id !== undefined && payloads.has(id);
    const hasSalt = id !== undefined && salts.has(id);
    if (hasPayload !== hasSalt) return fail(i, 'Its payload and salt don’t come together.');
    if (!hasPayload) {
      payloadRemoved++;
      continue;
    }
    const salt = salts.get(id!)!;
    if (saltBytes(salt) !== 16) return fail(i, 'Its salt isn’t 16 bytes.');
    if ((await h.commitment(salt, canonicalJson(payloads.get(id!)))) !== e.details.commitment) {
      return fail(i, 'Its payload doesn’t match the commitment that was signed.');
    }
  }

  // The phone's own receipts: each one inside the export must be exactly there.
  const inside = mine.filter(r => r.chain_index < entries.length);
  for (const r of inside) {
    const e = entries[r.chain_index];
    if (e.event_hash !== r.event_hash || e.details?.event_id !== r.event_id) {
      return {...fail(r.chain_index, 'It isn’t the entry this phone was given a receipt for.'), mine: {inside: inside.length, matched: 0}};
    }
  }

  return {
    ok: true,
    entries: entries.length,
    firstBroken: null,
    reason: null,
    mine: {inside: inside.length, matched: inside.length},
    payloadRemoved,
    anchored: Array.isArray(exp.proofs) && exp.proofs.length > 0,
    head: entries[entries.length - 1].event_hash,
  };
}
