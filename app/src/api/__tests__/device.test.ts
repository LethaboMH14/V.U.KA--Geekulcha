import {createDevice, JourneyStartError, simBackend, type Backend} from '../device';
import type {EventSubmission} from '../events';
import {checkPayload} from '../payloads';

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
  expect(kinds(h).slice(-2)).toEqual(['checkin_opened', 'checkin_result']);
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
