import {createHash} from 'crypto';
import {canonicalJson} from '../../../../shared/canonical.js';
import {checkRecord, type Export, type Hasher} from '../verifyRecord';

const hasher: Hasher = {
  sha256Hex: async text => createHash('sha256').update(text, 'utf8').digest('hex'),
  commitment: async (salt, text) =>
    createHash('sha256').update(Buffer.concat([Buffer.from(salt, 'base64'), Buffer.from(text, 'utf8')])).digest('hex'),
};

/** A small, correctly built export: three linked entries with committed payloads. */
async function sample(): Promise<Export> {
  const entries: Export['entries'] = [];
  const payloads: Export['payloads'] = [];
  const salts: Export['salts'] = [];
  let prev = '0'.repeat(64);
  for (let i = 0; i < 3; i++) {
    const eventId = `00000000-0000-4000-8000-00000000000${i}`;
    const payload = {kind: i ? 'journey_armed' : 'registration', pv: 1, n: i};
    const salt = Buffer.alloc(16, i + 1).toString('base64');
    const entry = {
      action: i ? 'device_event' : 'registration',
      actor_id: 'sim_member_x',
      target_type: 'subject',
      target_id: 'sim_subj_x',
      details: {v: 2, event_id: eventId, commitment: await hasher.commitment(salt, canonicalJson(payload))},
      ts: '2026-09-25T20:00:00Z',
      prev_hash: prev,
    };
    const event_hash = await hasher.sha256Hex(canonicalJson(entry));
    entries.push({...entry, event_hash});
    payloads.push({event_id: eventId, payload});
    salts.push({event_id: eventId, salt});
    prev = event_hash;
  }
  return {subject_id: 'sim_subj_x', entries, payloads, salts, proofs: [], receipts: []};
}

test('a well-formed export checks, and the phone’s receipts match in place', async () => {
  const exp = await sample();
  const mine = exp.entries.map((e, i) => ({event_id: e.details.event_id!, event_hash: e.event_hash, chain_index: i}));
  // One receipt beyond the export's head (a held export): not inside, not a failure.
  mine.push({event_id: 'later', event_hash: 'f'.repeat(64), chain_index: 7});
  const r = await checkRecord(exp, hasher, mine);
  expect(r).toMatchObject({ok: true, entries: 3, firstBroken: null, mine: {inside: 3, matched: 3}, anchored: false});
  expect(r.head).toBe(exp.entries[2].event_hash);
});

test('a changed payload is caught at its index', async () => {
  const exp = await sample();
  (exp.payloads[1].payload as {n: number}).n = 99;
  expect(await checkRecord(exp, hasher, [])).toMatchObject({ok: false, firstBroken: 1});
});

test('a changed entry is caught at its index, before its successor', async () => {
  const exp = await sample();
  exp.entries[1].ts = '2026-09-25T20:00:01Z';
  expect(await checkRecord(exp, hasher, [])).toMatchObject({ok: false, firstBroken: 1});
});

test('a removed entry breaks the link at the next one', async () => {
  const exp = await sample();
  exp.entries.splice(1, 1);
  expect(await checkRecord(exp, hasher, [])).toMatchObject({ok: false, firstBroken: 1});
});

test('a server chain that disagrees with a receipt this phone holds is caught', async () => {
  const exp = await sample();
  const r = await checkRecord(exp, hasher, [{event_id: exp.entries[2].details.event_id!, event_hash: 'e'.repeat(64), chain_index: 2}]);
  expect(r).toMatchObject({ok: false, firstBroken: 2});
});

test('a deleted payload keeps its hash and is counted, not failed', async () => {
  const exp = await sample();
  exp.payloads.splice(1, 1);
  exp.salts.splice(1, 1);
  expect(await checkRecord(exp, hasher, [])).toMatchObject({ok: true, payloadRemoved: 1});
});
