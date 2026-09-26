import {createDevice, JourneyStartError, recoveryChannel, simBackend, type Backend} from '../device';
import type {EventSubmission} from '../events';
import {checkPayload} from '../payloads';
import {createHash} from 'crypto';
import {canonicalJson} from '../../../../shared/canonical.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const JOURNEY = '3f0c2a9e-7b1d-4e5a-9c8f-2d6b4a1e0f73';

type Req = {method: string; path: string; body: string};

/** A simulated backend whose "server" we control, so the queue can be tested. */
function harness(opts: {post?: Backend['post']; request?: Backend['request']} = {}) {
  const base = simBackend();
  const received: {seq: number; json: string}[] = [];
  const sent: EventSubmission[] = [];
  const requests: Req[] = [];
  const b: Backend = {
    ...base,
    simulated: false,
    received: async () => received,
    markReceived: async (seq, json) => {
      received.push({seq, json});
      return base.markReceived(seq, json);
    },
    post:
      opts.post ??
      (async (_url, entry) => {
        sent.push(entry);
        return {event_hash: 'a'.repeat(64), chain_index: sent.length - 1, received_at: '2026-09-25T20:00:00Z'};
      }),
    request:
      opts.request ??
      (async <T,>(_url: string, method: string, path: string, body: string) => {
        requests.push({method, path, body});
        return (path === '/v1/journeys' ? {journey_id: JOURNEY} : {}) as T;
      }),
  };
  return {b, sent, received, requests, device: createDevice(b)};
}

async function onboarded(h: ReturnType<typeof harness>) {
  await h.device.setPins('1234', '9876');
  await h.device.register('Lerato', '0.0.6');
  await h.device.flush();
}

const kinds = (h: ReturnType<typeof harness>) => h.sent.map(e => e.payload.kind);

test('registration is the genesis entry and carries the public key', async () => {
  const h = harness();
  await onboarded(h);
  expect(h.sent).toHaveLength(1);
  expect(h.sent[0].action).toBe('registration');
  expect(h.sent[0].details.signer_pubkey).toBeDefined();
  expect(h.device.profile?.subjectId).toMatch(/^sim_subj_/);
});

test('a journey is started on the server and journey_armed targets it', async () => {
  const h = harness();
  await onboarded(h);
  expect(await h.device.startJourney('0.0.6')).toBe(JOURNEY);
  await h.device.flush();
  expect(h.requests[0]).toEqual({method: 'POST', path: '/v1/journeys', body: ''});
  const armed = h.sent.find(e => e.payload.kind === 'journey_armed')!;
  expect(armed.target_type).toBe('journey');
  expect(armed.target_id).toBe(JOURNEY);
});

test('no journey starts without the server: offline and refused are told apart', async () => {
  const offline = harness({request: async () => Promise.reject(new Error('Network request failed'))});
  await onboarded(offline);
  await expect(offline.device.startJourney('0.0.6')).rejects.toMatchObject({reason: 'offline'});
  const refused = harness({request: async () => Promise.reject(new Error('401 invalid_signature: nope'))});
  await onboarded(refused);
  const e = await refused.device.startJourney('0.0.6').catch(x => x);
  expect(e).toBeInstanceOf(JourneyStartError);
  expect(e.reason).toBe('refused');
});

test('heartbeats carry an activity bucket and a timestamp, never location', async () => {
  const h = harness();
  await onboarded(h);
  await h.device.heartbeat(JOURNEY, 'walking');
  const beat = h.requests.find(r => r.path.endsWith('/heartbeat'))!;
  expect(beat.path).toBe(`/v1/journeys/${JOURNEY}/heartbeat`);
  expect(Object.keys(JSON.parse(beat.body)).sort()).toEqual(['speed_bucket', 'ts']);
  expect(h.device.delivery().lastContactAt).toBeDefined();
});

test('a check-in names its signal, is recorded when shown, and targets the journey', async () => {
  const h = harness();
  await onboarded(h);
  const signalId = await h.device.signal(JOURNEY, {kind: 'signal_detected', pv: 1, journey_id: JOURNEY});
  const c = await h.device.openCheckin(JOURNEY, signalId);
  await c.shown();
  await c.shown(); // idempotent
  await h.device.flush();
  const opened = h.sent.filter(e => e.payload.kind === 'checkin_opened');
  expect(opened).toHaveLength(1);
  expect(opened[0].payload).toEqual({
    kind: 'checkin_opened',
    pv: 1,
    checkin_id: c.checkinId,
    journey_id: JOURNEY,
    signal_event_id: signalId,
    window_s: 60,
  });
  expect(c.checkinId).toMatch(UUID);
  expect(opened[0].target_type).toBe('journey');
  // The signal is always queued before the check-in it caused (§4b).
  expect(kinds(h).indexOf('signal_detected')).toBeLessThan(kinds(h).indexOf('checkin_opened'));
});

test('normal and duress PINs give the same screen result and the same payload shape', async () => {
  const h = harness();
  await onboarded(h);
  const a = await h.device.openCheckin(JOURNEY, '0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70');
  expect(await a.enter('1234')).toBe('checked');
  const b = await h.device.openCheckin(JOURNEY, '1f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70');
  expect(await b.enter('9876')).toBe('checked');
  await h.device.flush();
  const results = h.sent.filter(e => e.payload.kind === 'checkin_result');
  expect(results.map(e => e.payload.result)).toEqual(['normal_pin', 'duress_pin']);
  const [p, q] = results.map(e => e.payload);
  expect(Object.keys(p).sort()).toEqual(['attempt', 'checkin_id', 'kind', 'pv', 'result']);
  expect(Object.keys(p).sort()).toEqual(Object.keys(q).sort());
  expect(String(p.result).length).toBe(String(q.result).length);
  expect(results.every(e => e.target_type === 'journey' && e.action === 'device_event')).toBe(true);
});

test('a result entered before the check is marked shown still follows its checkin_opened', async () => {
  const h = harness();
  await onboarded(h);
  const c = await h.device.openCheckin(JOURNEY, '0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70');
  await c.enter('1234');
  await h.device.flush();
  expect(kinds(h).slice(-3)).toEqual(['checkin_opened', 'checkin_result', 'evidence_observed']);
});

describe('CEM-1 PIN evidence (ADR-0047, PROPOSED)', () => {
  const SIGNAL = '0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70';

  test('follows every accepted answer, same fixed shape and length for both PINs', async () => {
    const bodies: string[] = [];
    for (const pin of ['1234', '9876']) {
      const h = harness();
      await onboarded(h);
      const c = await h.device.openCheckin(JOURNEY, SIGNAL);
      await c.shown();
      expect(await c.enter(pin, 1500)).toBe('checked');
      await h.device.flush();
      const ev = h.sent.filter(e => e.payload.kind === 'evidence_observed');
      expect(ev).toHaveLength(1);
      expect(ev[0].payload).toMatchObject({pv: 2, decision: 'pin', reasons: [{name: 'pin_retry', db: 0}, {name: 'pin_slow', db: 0}]});
      bodies.push(canonicalJson({...ev[0].payload, checkin_id: 'x'}));
    }
    expect(bodies[0]).toBe(bodies[1]);
  });

  test('a wrong PIN first gives pin_retry, for either PIN', async () => {
    for (const pin of ['1234', '9876']) {
      const h = harness();
      await onboarded(h);
      const seen: unknown[] = [];
      const c = await h.device.openCheckin(JOURNEY, SIGNAL, {onPinObserved: p => seen.push(p)});
      expect(await c.enter('0000', 900)).toBe('retry');
      expect(await c.enter(pin, 1100)).toBe('checked');
      await h.device.flush();
      const ev = h.sent.find(e => e.payload.kind === 'evidence_observed')!;
      expect(ev.payload.reasons).toEqual([{name: 'pin_retry', db: 2}, {name: 'pin_slow', db: 0}]);
      expect(seen).toEqual([{retry: true, slow: false}]);
    }
  });

  test('pin_slow only against the member’s own baseline of at least 8 entries', async () => {
    const h = harness();
    await onboarded(h);
    for (let i = 0; i < 8; i++) {
      const c = await h.device.openCheckin(JOURNEY, SIGNAL);
      await c.enter('1234', 1000 + (i % 3) * 40);
    }
    const seen: {retry: boolean; slow: boolean}[] = [];
    const c = await h.device.openCheckin(JOURNEY, SIGNAL, {onPinObserved: p => seen.push(p)});
    await c.enter('9876', 4000);
    expect(seen).toEqual([{retry: false, slow: true}]);
    expect(h.device.profile?.pinTimes).toHaveLength(9);
  });

  test('a failed evidence write never blocks the answer, and nothing counts', async () => {
    const h = harness();
    await onboarded(h);
    const enqueue = h.b.enqueue;
    let calls = 0;
    h.b.enqueue = async json => {
      calls += 1;
      if (JSON.parse(json).payload.kind === 'evidence_observed') throw new Error('disk full');
      return enqueue(json);
    };
    const seen: unknown[] = [];
    const c = await h.device.openCheckin(JOURNEY, SIGNAL, {onPinObserved: p => seen.push(p)});
    expect(await c.enter('9876', 1200)).toBe('checked');
    await h.device.flush();
    expect(kinds(h).slice(-2)).toEqual(['checkin_opened', 'checkin_result']);
    expect(seen).toEqual([]);
    expect(calls).toBeGreaterThanOrEqual(3);
  });

  test('enter() never waits on the network, whichever PIN', async () => {
    for (const pin of ['1234', '9876']) {
      let release: () => void = () => undefined;
      const hang = new Promise<void>(r => (release = r));
      const h = harness({
        post: async () => {
          await hang;
          return {event_hash: 'a'.repeat(64), chain_index: 0, received_at: '2026-09-25T20:00:00Z'};
        },
      });
      await h.device.setPins('1234', '9876');
      await h.device.register('Lerato', '0.0.6');
      const c = await h.device.openCheckin(JOURNEY, SIGNAL);
      // Resolves although every POST is still hanging.
      await expect(c.enter(pin, 1000)).resolves.toBe('checked');
      release();
    }
  });
});

describe('check-in countdown bound', () => {
  const {checkinRemainingMs} = jest.requireActual('../device');
  test('no number until the server has checkin_opened', () => {
    expect(checkinRemainingMs(1000, {openedQueuedAt: 0, openedReceived: false})).toBeNull();
  });
  test('never beyond either server deadline, with a 5 s margin', () => {
    // opened at 10 s, signal at 0: fallback (90 s) binds before opened+70 (80 s)? no: 80 < 90.
    expect(checkinRemainingMs(10_000, {signalQueuedAt: 0, openedQueuedAt: 10_000, openedReceived: true})).toBe(65_000);
    // signal much earlier (opened delayed): the fallback binds.
    expect(checkinRemainingMs(60_000, {signalQueuedAt: 0, openedQueuedAt: 55_000, openedReceived: true})).toBe(25_000);
    // receipt came back after the fallback: time's up at once.
    expect(checkinRemainingMs(100_000, {signalQueuedAt: 0, openedQueuedAt: 5_000, openedReceived: true})).toBe(0);
  });
});

test('wrong PINs (T47): three "retry", then "checked"; attempt counts every entry', async () => {
  const h = harness();
  await onboarded(h);
  const c = await h.device.openCheckin(JOURNEY, '0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70');
  expect(await c.enter('0000')).toBe('retry');
  expect(await c.enter('0000')).toBe('retry');
  expect(await c.enter('0000')).toBe('retry');
  expect(await c.enter('0000')).toBe('checked');
  expect(await c.enter('1234')).toBe('checked');
  await h.device.flush();
  const results = h.sent.filter(e => e.payload.kind === 'checkin_result');
  expect(results).toHaveLength(1);
  expect(results[0].payload.attempt).toBe(5);
});

test('ending a journey: a scoped, inner-signed pin_authorised, then journey_ended', async () => {
  const h = harness();
  await onboarded(h);
  expect(await h.device.endJourney(JOURNEY, '5555')).toBe('retry');
  expect(await h.device.endJourney(JOURNEY, '9876')).toBe('ended');
  await h.device.flush();
  expect(kinds(h).slice(-2)).toEqual(['pin_authorised', 'journey_ended']);
  const auth = h.sent.find(e => e.payload.kind === 'pin_authorised')!;
  expect(auth.target_type).toBe('subject');
  expect(auth.payload).toMatchObject({action: 'end_journey', target_id: JOURNEY, mode: 'duress', signer_key_id: 'dev_simulated00'});
  expect(Object.keys(auth.payload).sort()).toEqual(['action', 'kind', 'mode', 'nonce', 'pv', 'sig', 'signer_key_id', 'target_id']);
  const ended = h.sent.find(e => e.payload.kind === 'journey_ended')!;
  expect(ended.payload).toEqual({kind: 'journey_ended', pv: 1, journey_id: JOURNEY});
  expect(ended.target_id).toBe(JOURNEY);
});

test('the local record never holds the PIN mode', async () => {
  const h = harness();
  await onboarded(h);
  const c = await h.device.openCheckin(JOURNEY, '0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70');
  await c.enter('9876');
  await h.device.endJourney(JOURNEY, '9876');
  await h.device.flush();
  expect(JSON.stringify(await h.device.myRecord())).not.toMatch(/duress|normal_pin|"normal"/);
});

test('the phone refuses to queue a payload the contract forbids', () => {
  expect(() => checkPayload({kind: 'checkin_opened', pv: 1, checkin_id: 'x', journey_id: 'j', signal_event_id: 'y', window_s: 30})).toThrow();
  expect(() => checkPayload({kind: 'journey_ended', pv: 1, journey_id: 'j', mode: 'duress'})).toThrow(/not allowed/);
  expect(() => checkPayload({kind: 'checkin_result', pv: 1, checkin_id: '7c1d3f0e-5b2a-4c8e-9a61-2f4d8e0b1c33', result: 'no_answer', attempt: 1})).toThrow();
  // The schema examples on the slice-3 branch pass.
  checkPayload({kind: 'checkin_opened', pv: 1, checkin_id: '7c1d3f0e-5b2a-4c8e-9a61-2f4d8e0b1c33', journey_id: 'sim_journey_1', signal_event_id: '0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70', window_s: 20});
  checkPayload({kind: 'checkin_result', pv: 1, checkin_id: '7c1d3f0e-5b2a-4c8e-9a61-2f4d8e0b1c33', result: 'normal_pin', attempt: 1});
  checkPayload({kind: 'journey_ended', pv: 1, journey_id: 'sim_journey_1'});
  checkPayload({kind: 'pin_authorised', pv: 1, action: 'export', target_id: 'sim_subject', mode: 'normal', nonce: 'sim_nonce', sig: 'MAA=', signer_key_id: 'sim_key'});
});

test('an event queued while a send is under way goes out in the same pass', async () => {
  let release: () => void = () => undefined;
  const gate = new Promise<void>(r => (release = r));
  const sent: string[] = [];
  const h = harness({
    post: async (_u, entry) => {
      if (entry.payload.kind === 'registration') await gate;
      sent.push(String(entry.payload.kind));
      return {event_hash: 'c'.repeat(64), chain_index: sent.length, received_at: '2026-09-25T20:00:00Z'};
    },
  });
  await h.device.setPins('1234', '9876');
  const reg = h.device.register('Lerato', '0.0.6'); // starts a flush that waits on the gate
  await reg;
  await h.device.signal(JOURNEY, {kind: 'signal_detected', pv: 1, journey_id: JOURNEY});
  release();
  await h.device.flush();
  expect(sent).toEqual(['registration', 'signal_detected']);
  expect(h.device.delivery().queued).toBe(0);
});

test('a refusal keeps the event queued and the pass moves on; a network failure stops it', async () => {
  const h = harness({
    post: async (_u, entry) => {
      if (entry.payload.kind === 'journey_armed') throw new Error('400 invalid_request: nope');
      if (entry.payload.kind === 'journey_ended') throw new Error('Network request failed');
      return {event_hash: 'b'.repeat(64), chain_index: 1, received_at: '2026-09-25T20:00:00Z'};
    },
  });
  await onboarded(h);
  await h.device.startJourney('0.0.6');
  await h.device.signal(JOURNEY, {kind: 'signal_detected', pv: 1, journey_id: JOURNEY});
  await h.device.flush();
  let d = h.device.delivery();
  expect(d.queued).toBe(1); // journey_armed, refused, kept
  expect(d.lastError).toMatch(/^400/);
  await h.device.endJourney(JOURNEY, '1234');
  await h.device.flush();
  d = h.device.delivery();
  expect(d.lastError).toMatch(/Network/);
  expect(d.queued).toBeGreaterThanOrEqual(2);
});

test('My record needs the PIN: both PINs authorise export for this subject, the same way', async () => {
  const h = harness();
  await onboarded(h);
  expect(await h.device.authoriseExport('0000')).toBe('retry');
  expect(await h.device.authoriseExport('1234')).toBe('ok');
  expect(await h.device.authoriseExport('9876')).toBe('ok');
  await h.device.flush();
  const auths = h.sent.filter(e => e.payload.kind === 'pin_authorised');
  expect(auths.map(e => e.payload.mode)).toEqual(['normal', 'duress']);
  expect(auths.every(e => e.payload.action === 'export' && e.payload.target_id === h.device.profile?.subjectId)).toBe(true);
});

test('setProfileDetails keeps trimmed details on this phone only: nothing queued, sent or recorded', async () => {
  const h = harness();
  const saved: string[] = [];
  const setProfile = h.b.setProfile;
  h.b.setProfile = async j => {
    saved.push(j);
    return setProfile(j);
  };
  await onboarded(h);
  await h.device.setAccount({kind: 'phone', contact: '+27825550101', verified: false}, 'Mokoena');
  const before = {pending: (await h.b.pending()).length, sent: h.sent.length, requests: h.requests.length, queued: h.device.delivery().queued};

  const p = await h.device.setProfileDetails({name: '  Thandi ', surname: ' Dlamini  ', phone: '+27 71 234 5678', email: ' thandi@example.co.za '});
  expect(p).toMatchObject({firstName: 'Thandi', surname: 'Dlamini', contacts: {phone: '+27712345678', email: 'thandi@example.co.za'}});
  expect(JSON.parse(saved[saved.length - 1])).toMatchObject({firstName: 'Thandi', surname: 'Dlamini', contacts: {phone: '+27712345678'}});
  // The sign-up record and the chain identity are untouched.
  expect(p.account).toEqual({kind: 'phone', contact: '+27825550101', verified: false});
  expect(p.subjectId).toMatch(/^sim_subj_/);

  // Rejected edits change nothing.
  await expect(h.device.setProfileDetails({name: ' ', surname: 'Dlamini'})).rejects.toThrow(/first name and surname/);
  await expect(h.device.setProfileDetails({name: 'x'.repeat(31), surname: 'Dlamini'})).rejects.toThrow(/first name/);
  await expect(h.device.setProfileDetails({name: 'Thandi', surname: 'Dlamini', phone: '+27012345678'})).rejects.toThrow(/9 digits/);
  await expect(h.device.setProfileDetails({name: 'Thandi', surname: 'Dlamini', email: 'nope@x'})).rejects.toThrow(/email/);
  // A member who had a number or email keeps at least one.
  await expect(h.device.setProfileDetails({name: 'Thandi', surname: 'Dlamini', phone: '', email: ''})).rejects.toThrow(/Keep a mobile number or an email/);
  expect(h.device.profile?.firstName).toBe('Thandi');

  await h.device.flush();
  expect((await h.b.pending()).length).toBe(before.pending);
  expect(h.sent.length).toBe(before.sent);
  expect(h.requests.length).toBe(before.requests);
  expect(h.device.delivery().queued).toBe(before.queued);
});

test('a member who signed up without a number or email may leave both empty', async () => {
  const h = harness();
  await onboarded(h);
  const p = await h.device.setProfileDetails({name: 'Lerato', surname: 'Nkosi'});
  expect(p.firstName).toBe('Lerato');
  expect(p.surname).toBe('Nkosi');
});

test('ending a journey queues both events before sending either', async () => {
  const order: string[] = [];
  const h = harness({
    post: async (_u, entry) => {
      order.push(`${String(entry.payload.kind)}@${h.device.delivery().queued}`);
      return {event_hash: 'd'.repeat(64), chain_index: 1, received_at: '2026-09-25T20:00:00Z'};
    },
  });
  await onboarded(h);
  await h.device.endJourney(JOURNEY, '1234');
  await h.device.flush();
  // When pin_authorised was sent, journey_ended was already waiting behind it.
  expect(order.find(o => o.startsWith('pin_authorised'))).toBe('pin_authorised@2');
});

test('a failed evidence write is never an accepted outcome (the screen shows "Try again")', async () => {
  const h = harness();
  await onboarded(h);
  const c = await h.device.openCheckin(JOURNEY, '0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70');
  await c.shown();
  h.b.enqueue = async () => Promise.reject(new Error('keystore unavailable'));
  await expect(c.enter('9876')).rejects.toThrow(/keystore/);
  await expect(c.enter('1234')).rejects.toThrow(/keystore/);
  await expect(h.device.endJourney(JOURNEY, '1234')).rejects.toThrow(/keystore/);
});

test('My record shows only the server’s held export, however many receipts the phone holds', async () => {
  const sha = (t: string) => createHash('sha256').update(t, 'utf8').digest('hex');
  // A held export: two entries (registration, journey_armed); the phone holds more receipts.
  const entries: Record<string, unknown>[] = [];
  const payloads: {event_id: string; payload: unknown}[] = [];
  const salts: {event_id: string; salt: string}[] = [];
  let prev = '0'.repeat(64);
  for (const [i, kind] of ['registration', 'journey_armed'].entries()) {
    const id = `00000000-0000-4000-8000-00000000000${i}`;
    const payload = {kind, pv: 1};
    const salt = Buffer.alloc(16, 7).toString('base64');
    const commitment = createHash('sha256').update(Buffer.concat([Buffer.from(salt, 'base64'), Buffer.from(canonicalJson(payload), 'utf8')])).digest('hex');
    const e = {action: 'device_event', details: {event_id: id, commitment}, ts: '2026-09-25T20:00:00Z', prev_hash: prev};
    const event_hash = sha(canonicalJson(e));
    entries.push({...e, event_hash});
    payloads.push({event_id: id, payload});
    salts.push({event_id: id, salt});
    prev = event_hash;
  }
  const held = {subject_id: 'sim_subj_x', entries, payloads, salts, proofs: [], receipts: []};
  // The phone's receipts sit past the held head (as during an open incident).
  let n = 10;
  const h = harness({
    post: async () => ({event_hash: 'b'.repeat(64), chain_index: n++, received_at: '2026-09-25T20:00:00Z'}),
    request: async <T,>(_u: string, method: string, path: string) =>
      (method === 'GET' && path.endsWith('/export') ? held : path === '/v1/journeys' ? {journey_id: JOURNEY} : {}) as T,
  });
  h.b.signer.sha256Hex = async t => sha(t);
  h.b.signer.commitment = async (salt, t) =>
    createHash('sha256').update(Buffer.concat([Buffer.from(salt, 'base64'), Buffer.from(t, 'utf8')])).digest('hex');
  await onboarded(h);
  const c = await h.device.openCheckin(JOURNEY, '0f8a2b6c-91d4-4e7a-b3c5-6d1e9f2a4b70');
  await c.enter('9876');
  await h.device.flush();
  expect((await h.device.myRecord()).length).toBeGreaterThan(2);
  const {check, rows} = await h.device.checkMyRecord();
  expect(check.ok).toBe(true);
  expect(rows.map(r => r.kind)).toEqual(['registration', 'journey_armed']);
  expect(JSON.stringify(rows)).not.toMatch(/duress|normal_pin/);
});

test('a moved demo server is followed without restarting the app', async () => {
  const urls: string[] = [];
  const h = harness({
    post: async (url, entry) => {
      urls.push(url);
      if (url === 'https://old.example') throw new Error('Network request failed');
      return {event_hash: 'a'.repeat(64), chain_index: 0, received_at: '2026-09-25T20:00:00Z'};
    },
  });
  let where = 'https://old.example';
  h.b.discover = async () => where;
  await h.device.setPins('1234', '9876');
  await h.device.register('Lerato', '0.0.6');
  await h.device.flush();
  expect(h.device.delivery().queued).toBe(1);
  where = 'https://new.example';
  // The first failure already looked it up once; a minute later it looks again.
  const realNow = Date.now;
  Date.now = () => realNow() + 61_000;
  try {
    await h.device.flush();
    await h.device.flush();
  } finally {
    Date.now = realNow;
  }
  expect(urls.at(-1)).toBe('https://new.example');
  expect(h.device.delivery().queued).toBe(0);
  expect(h.device.profile?.serverUrl).toBe('https://new.example');
});

describe('following the demo server to a different server', () => {
  const TUNNEL_A = 'https://aaa-bbb.trycloudflare.com';
  const TUNNEL_B = 'https://ccc-ddd.trycloudflare.com';
  const AZURE = 'https://vuka-anchor-server.azurewebsites.net';

  async function setup(where: {v: string}, fail: (url: string) => boolean) {
    const posts: {url: string; kind: string}[] = [];
    const h = harness({
      post: async (url, entry) => {
        posts.push({url, kind: String(entry.payload.kind)});
        if (fail(url)) throw new Error('Network request failed');
        return {event_hash: 'a'.repeat(64), chain_index: 0, received_at: '2026-09-26T12:00:00Z'};
      },
    });
    h.b.discover = async () => where.v;
    await h.device.setPins('1234', '9876');
    await h.device.register('Lerato', '0.0.12');
    await h.device.flush();
    return {h, posts};
  }

  const later = async (f: () => Promise<void>) => {
    const realNow = Date.now;
    Date.now = () => realNow() + 61_000;
    try {
      await f();
    } finally {
      Date.now = realNow;
    }
  };

  test('a restarted tunnel is the same server: no new registration', async () => {
    const where = {v: TUNNEL_A};
    let down = '';
    const {h, posts} = await setup(where, u => u === down);
    expect(h.device.profile?.registeredOn).toBe(TUNNEL_A);
    down = TUNNEL_A;
    where.v = TUNNEL_B;
    await h.device.signal(JOURNEY, {kind: 'journey_armed', pv: 1, journey_id: JOURNEY, app_version: '0.0.12'});
    await later(() => h.device.flush());
    await h.device.flush();
    expect(posts.filter(p => p.kind === 'registration')).toHaveLength(1);
    expect(h.device.profile?.registeredOn).toBe(TUNNEL_B);
    expect(posts.at(-1)).toEqual({url: TUNNEL_B, kind: 'journey_armed'});
  });

  test('moving to Azure: stranded events parked, registered again there, record view restarts', async () => {
    const where = {v: TUNNEL_A};
    let down = '';
    const {h, posts} = await setup(where, u => u === down);
    down = TUNNEL_A;
    await h.device.signal(JOURNEY, {kind: 'journey_armed', pv: 1, journey_id: JOURNEY, app_version: '0.0.12'});
    await h.device.flush();
    expect(h.device.delivery().queued).toBe(1);
    where.v = AZURE;
    await later(() => h.device.flush());
    await h.device.flush();
    const regs = posts.filter(p => p.kind === 'registration');
    expect(regs.map(r => r.url)).toEqual([TUNNEL_A, AZURE]);
    // The old journey's event never went to Azure: parked on the phone, not sent, not lost.
    expect(posts.filter(p => p.url === AZURE && p.kind === 'journey_armed')).toHaveLength(0);
    expect(h.device.delivery().queued).toBe(0);
    expect(h.device.profile).toMatchObject({serverUrl: AZURE, registeredOn: AZURE});
    expect(h.device.profile?.chainFromSeq).toBeGreaterThan(1);
    const mine = await h.device.myRecord();
    expect(mine.map(r => r.kind)).toEqual(['registration']);
  });

  test('a profile from before this was tracked is adopted, not re-registered', async () => {
    const h = harness();
    await h.b.setProfile(JSON.stringify({v: 1, role: 'member', firstName: 'Lerato', subjectId: 'sim_subj_x', actorId: 'sim_member_x', serverUrl: AZURE}));
    await h.b.setPins('1234', '9876');
    h.b.discover = async () => AZURE;
    await h.device.load();
    expect(h.device.profile?.registeredOn).toBe(AZURE);
    expect(h.sent).toHaveLength(0);
  });
});

describe('a member who is also someone else\'s guardian', () => {
  test('keeps their own record; alerts and answers use the guarded member\'s record', async () => {
    const requests: {path: string; keyId?: string}[] = [];
    const h = harness({
      request: async <T,>(_u: string, method: string, path: string, _body: string, keyId?: string) => {
        requests.push({path, keyId});
        if (path === '/v1/guardians/accept') return {guardian_id: 'g1234567'} as T;
        if (path === '/v1/guardians/me/alerts') return {subject_id: 'sim_subj_other', alerts: []} as T;
        return (path === '/v1/journeys' ? {journey_id: JOURNEY} : {}) as T;
      },
    });
    await onboarded(h);
    const own = h.device.profile!.subjectId;
    await h.device.becomeGuardian('abcd1234-123456', 'Thabo');
    expect(h.device.profile).toMatchObject({role: 'member', subjectId: own, guardian: {guardianId: 'g1234567', memberName: 'Thabo'}});
    await h.device.guardianAlerts();
    expect(h.device.profile?.subjectId).toBe(own);
    expect(h.device.profile?.guardian?.memberSubjectId).toBe('sim_subj_other');
    await h.device.acknowledge('6c1f7e0e-2f4b-4a55-9b1a-0d1c2e3f4a5b', 'handling');
    const ack = h.sent.find(e => e.payload.kind === 'guardian_ack')!;
    expect(ack.target_id).toBe('sim_subj_other');
    expect(ack.actor_id).toBe('guardian_g1234567');
    // Their own listening still starts on their own record.
    expect(await h.device.startJourney('0.0.13')).toBe(JOURNEY);
  });
});

test('hold-for-help sends the same detection a sound would, marked manual', async () => {
  const h = harness();
  await onboarded(h);
  const id = await h.device.help(JOURNEY, '0.0.13');
  await h.device.flush();
  const sig = h.sent.find(e => e.details.event_id === id)!;
  expect(sig.payload).toEqual({kind: 'signal_detected', pv: 1, journey_id: JOURNEY, sense: 'manual', app_version: '0.0.13'});
  expect(sig.target_type).toBe('journey');
});

describe('account on this phone (Mutarisi’s sign-in, password and recovery)', () => {
  /** A real salted SHA-256, as the phone's signer computes it (the simulated one hashes to zeros). */
  const realHash = (h: ReturnType<typeof harness>) => {
    h.b.signer.commitment = async (salt, t) =>
      createHash('sha256').update(Buffer.concat([Buffer.from(salt, 'base64'), Buffer.from(t, 'utf8')])).digest('hex');
  };
  /** A member who signed up by email with a password, the code sent to their email. */
  async function emailMember() {
    const h = harness();
    realHash(h);
    const saved: string[] = [];
    const setProfile = h.b.setProfile;
    h.b.setProfile = async j => {
      saved.push(j);
      return setProfile(j);
    };
    await onboarded(h);
    const password = await h.device.hashPassword('correct horse');
    await h.device.setAccount({kind: 'email', contact: 'Thandi@Example.co.za', phone: '+27825550101', verified: false}, 'Dlamini', {password, recovery: 'email'});
    return {h, saved};
  }
  const traffic = async (h: ReturnType<typeof harness>) => ({pending: (await h.b.pending()).length, sent: h.sent.length, requests: h.requests.length, queued: h.device.delivery().queued});

  test('a password is kept only as a salted SHA-256, and verifies only with its email', async () => {
    const {h, saved} = await emailMember();
    const p = h.device.profile!;
    expect(p.password?.salt).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    const expected = createHash('sha256').update(Buffer.concat([Buffer.from(p.password!.salt, 'base64'), Buffer.from('correct horse', 'utf8')])).digest('hex');
    expect(p.password?.hash).toBe(expected);
    // The typed password is never stored, anywhere the profile was written.
    expect(saved.some(j => j.includes('correct horse'))).toBe(false);
    // A second hash of the same password gets a fresh salt.
    const again = await h.device.hashPassword('correct horse');
    expect(again.salt).not.toBe(p.password?.salt);
    await expect(h.device.hashPassword('short')).rejects.toThrow(/at least 8/);

    expect(await h.device.findAccount({kind: 'email', email: ' thandi@example.CO.ZA ', password: 'correct horse'})).toBe(true);
    expect(await h.device.findAccount({kind: 'email', email: 'thandi@example.co.za', password: 'wrong horse'})).toBe(false);
    expect(await h.device.findAccount({kind: 'email', email: 'other@example.co.za', password: 'correct horse'})).toBe(false);
    // A simulated Google sign-in can't skip an email password.
    expect(await h.device.findAccount({kind: 'google', email: 'thandi@example.co.za'})).toBe(false);
    expect(await h.device.findAccount({kind: 'phone', phone: '+27825550101'})).toBe(true);
    expect(await h.device.findAccount({kind: 'phone', phone: '+27825550102'})).toBe(false);
  });

  test('Google sign-in matches the account email saved on this phone; nothing matches on a new phone', async () => {
    const h = harness();
    expect(await h.device.findAccount({kind: 'google', email: 'thandi@example.co.za'})).toBe(false);
    await onboarded(h);
    await h.device.setAccount({kind: 'google', contact: 'thandi@example.co.za', verified: false}, 'Dlamini');
    expect(await h.device.findAccount({kind: 'google', email: 'THANDI@example.co.za'})).toBe(true);
    expect(await h.device.findAccount({kind: 'google', email: 'someone@example.co.za'})).toBe(false);
    expect(await h.device.findAccount({kind: 'phone', phone: '+27825550101'})).toBe(false);
  });

  test('forgot password: only this phone’s email account, a new salted hash, never the PINs', async () => {
    const {h} = await emailMember();
    const old = h.device.profile!.password;
    expect(h.device.canResetPassword('someone@example.co.za')).toBe(false);
    expect(h.device.canResetPassword('thandi@example.co.za')).toBe(true);
    await expect(h.device.resetPassword('someone@example.co.za', 'new password')).rejects.toThrow(/no VIGIL account/);
    await expect(h.device.resetPassword('thandi@example.co.za', 'short')).rejects.toThrow(/at least 8/);
    await h.device.resetPassword('thandi@example.co.za', 'new password');
    expect(h.device.profile!.password?.salt).not.toBe(old?.salt);
    expect(await h.device.findAccount({kind: 'email', email: 'thandi@example.co.za', password: 'correct horse'})).toBe(false);
    expect(await h.device.findAccount({kind: 'email', email: 'thandi@example.co.za', password: 'new password'})).toBe(true);
    // The PINs are untouched.
    expect(await h.device.signIn('1234')).toBe('ok');
    expect(await h.device.signIn('9876')).toBe('ok');
  });

  test('recovery: the sign-up channel by default, only a contact on the profile, falls back when one is removed', async () => {
    const {h} = await emailMember();
    expect(recoveryChannel(h.device.profile)).toBe('email');
    await h.device.setRecovery('phone');
    expect(recoveryChannel(h.device.profile)).toBe('phone');
    await h.device.setProfileDetails({name: 'Lerato', surname: 'Dlamini', email: 'thandi@example.co.za'});
    // The number was removed: codes go to the email instead.
    expect(recoveryChannel(h.device.profile)).toBe('email');
    await expect(h.device.setRecovery('phone')).rejects.toThrow(/Add that contact/);
  });

  test('sign-in, password and recovery actions queue, send and record nothing', async () => {
    const {h} = await emailMember();
    await h.device.flush();
    const before = await traffic(h);
    await h.device.findAccount({kind: 'email', email: 'thandi@example.co.za', password: 'correct horse'});
    await h.device.findAccount({kind: 'google', email: 'thandi@example.co.za'});
    await h.device.findAccount({kind: 'phone', phone: '+27825550101'});
    await h.device.hashPassword('another password');
    await h.device.resetPassword('thandi@example.co.za', 'new password');
    await h.device.setRecovery('phone');
    expect(await h.device.signIn('0000')).toBe('retry');
    expect(await h.device.signIn('1234')).toBe('ok');
    await h.device.flush();
    expect(await traffic(h)).toEqual(before);
  });

  test('sign-out with listening on is the pause path: the same signed end_journey for both PINs; keys, profile and queue stay', async () => {
    const outs: {mode: unknown; kinds: unknown[]}[] = [];
    for (const pin of ['1234', '9876']) {
      const {h} = await emailMember();
      await h.device.startJourney('0.0.14');
      await h.device.flush();
      const from = h.sent.length;
      const subjectId = h.device.profile!.subjectId;
      expect(await h.device.signOut(JOURNEY, '0000')).toBe('retry');
      expect(h.device.signedOut).toBe(false);
      expect(await h.device.signOut(JOURNEY, pin)).toBe('ok');
      await h.device.flush();
      const mine = h.sent.slice(from);
      const auth = mine.find(e => e.payload.kind === 'pin_authorised')!;
      expect(auth.payload.action).toBe('end_journey');
      expect(auth.payload.target_id).toBe(JOURNEY);
      outs.push({mode: auth.payload.mode, kinds: mine.map(e => e.payload.kind)});
      // Signed out, not deleted.
      expect(h.device.signedOut).toBe(true);
      expect(h.device.profile).toMatchObject({subjectId, firstName: 'Lerato', password: expect.any(Object)});
      // Signing back in: the account on this phone, then the PIN (either one).
      expect(await h.device.findAccount({kind: 'email', email: 'thandi@example.co.za', password: 'correct horse'})).toBe(true);
      expect(await h.device.signIn(pin === '1234' ? '9876' : '1234')).toBe('ok');
      expect(h.device.signedOut).toBe(false);
    }
    // The screen can't tell them apart: same events, only the signed mode differs.
    expect(outs[0].kinds).toEqual(['pin_authorised', 'journey_ended']);
    expect(outs[1].kinds).toEqual(outs[0].kinds);
    expect(outs.map(o => o.mode)).toEqual(['normal', 'duress']);
  });

  test('sign-out with listening paused only checks the PIN (nothing to end); the state survives a restart', async () => {
    const {h} = await emailMember();
    await h.device.flush();
    const before = await traffic(h);
    expect(await h.device.signOut(null, '9876')).toBe('ok');
    await h.device.flush();
    expect(await traffic(h)).toEqual(before);
    // A restart reads the same sealed profile: still signed out.
    const again = createDevice(h.b);
    const {profile} = await again.load();
    expect(profile?.signedOut).toBe(true);
    expect(again.signedOut).toBe(true);
    expect(await again.signIn('1234')).toBe('ok');
    expect((await again.load()).profile?.signedOut).toBeUndefined();
  });
});
