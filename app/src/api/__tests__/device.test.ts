import {createDevice, simBackend, type Backend} from '../device';
import type {EventSubmission} from '../events';

/** A simulated backend whose "server" we control, so the queue can be tested. */
function harness(post?: Backend['post']) {
  const base = simBackend();
  const received: {seq: number; json: string}[] = [];
  const sent: EventSubmission[] = [];
  const b: Backend = {
    ...base,
    simulated: false,
    received: async () => received,
    markReceived: async (seq, json) => {
      received.push({seq, json});
      return base.markReceived(seq, json);
    },
    post:
      post ??
      (async (_url, entry) => {
        sent.push(entry);
        return {event_hash: 'a'.repeat(64), chain_index: sent.length - 1, received_at: '2026-09-25T20:00:00Z'};
      }),
  };
  return {b, sent, received, device: createDevice(b)};
}

async function onboarded(h: ReturnType<typeof harness>) {
  await h.device.setPins('1234', '9876');
  await h.device.register('Lerato', '0.0.6');
  await h.device.flush();
}

test('registration is the genesis entry and carries the public key', async () => {
  const h = harness();
  await onboarded(h);
  expect(h.sent).toHaveLength(1);
  expect(h.sent[0].action).toBe('registration');
  expect(h.sent[0].payload.kind).toBe('registration');
  expect(h.sent[0].details.signer_pubkey).toBeDefined();
  expect(h.device.profile?.subjectId).toMatch(/^sim_subj_/);
});

test('normal and duress PINs give the same screen result and the same payload shape', async () => {
  const h = harness();
  await onboarded(h);
  const c = await h.device.openCheckin('sim_jny_x');
  expect(await c.enter('1234')).toBe('checked');
  const c2 = await h.device.openCheckin('sim_jny_x');
  expect(await c2.enter('9876')).toBe('checked');
  await h.device.flush();
  const results = h.sent.filter(e => e.payload.kind === 'checkin_result');
  expect(results.map(e => e.payload.result)).toEqual(['normal_pin', 'duress_pin']);
  // Same keys, same value lengths: nothing about the request size differs.
  const [a, b] = results.map(e => e.payload);
  expect(Object.keys(a).sort()).toEqual(Object.keys(b).sort());
  expect(String(a.result).length).toBe(String(b.result).length);
});

test('wrong PINs: three "retry", then every entry shows checked (T47)', async () => {
  const h = harness();
  await onboarded(h);
  const c = await h.device.openCheckin('sim_jny_x');
  expect(await c.enter('0000')).toBe('retry');
  expect(await c.enter('0000')).toBe('retry');
  expect(await c.enter('0000')).toBe('retry');
  expect(await c.enter('0000')).toBe('checked');
  await h.device.flush();
  expect(h.sent.filter(e => e.payload.kind === 'checkin_result')).toHaveLength(0);
});

test('ending a journey records a scoped pin_authorised then journey_ended', async () => {
  const h = harness();
  await onboarded(h);
  expect(await h.device.endJourney('sim_jny_x', '5555')).toBe('retry');
  expect(await h.device.endJourney('sim_jny_x', '9876')).toBe('ended');
  await h.device.flush();
  const kinds = h.sent.map(e => e.payload.kind);
  expect(kinds.slice(-2)).toEqual(['pin_authorised', 'journey_ended']);
  const auth = h.sent.find(e => e.payload.kind === 'pin_authorised')!.payload;
  expect(auth).toMatchObject({action: 'end_journey', target_id: 'sim_jny_x', mode: 'duress'});
  expect(String(auth.mode).length).toBe('normal'.length);
});

test('the local record never holds the PIN mode', async () => {
  const h = harness();
  await onboarded(h);
  const c = await h.device.openCheckin('sim_jny_x');
  await c.enter('9876');
  await h.device.flush();
  const text = JSON.stringify(await h.device.myRecord());
  expect(text).not.toMatch(/duress|normal_pin/);
});

test('a refusal keeps the event queued and the pass moves on; a network failure stops it', async () => {
  let calls = 0;
  const h = harness(async (_u, entry) => {
    calls++;
    if (entry.payload.kind === 'journey_armed') throw new Error('400 invalid_request: nope');
    if (entry.payload.kind === 'journey_ended') throw new Error('Network request failed');
    return {event_hash: 'b'.repeat(64), chain_index: calls, received_at: '2026-09-25T20:00:00Z'};
  });
  await onboarded(h);
  await h.device.journeyArmed('sim_jny_x', '0.0.6');
  await h.device.signal({kind: 'signal_detected', pv: 1, journey_id: 'sim_jny_x'});
  await h.device.flush();
  let d = h.device.delivery();
  expect(d.queued).toBe(1); // journey_armed, refused, kept
  expect(d.lastError).toMatch(/^400/);
  await h.device.endJourney('sim_jny_x', '1234');
  await h.device.flush();
  d = h.device.delivery();
  expect(d.lastError).toMatch(/Network/);
  expect(d.queued).toBeGreaterThanOrEqual(2);
});
