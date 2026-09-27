#!/usr/bin/env node
/**
 * End to end for #118 (the member's invite screen sees "accepted") and #120
 * (a wrong PIN at a check-in is a heads-up to guardians, never duress, never
 * the bank), with the app's own device layer (app/build-e2e, see README.md)
 * on a member phone and a guardian phone, against a server built from
 * feat/lethabo-guardian-delivery with its workers running. Server state is
 * read back from PostgreSQL.
 *
 * Usage: node scripts/e2e/wrong-pin-e2e.mjs http://127.0.0.1:8000
 * Requires: app/build-e2e, psql on PATH (or VUKA_PSQL), and DATABASE_URL for
 * the server's database.
 */
import {execFileSync} from 'node:child_process';
import {createHash, webcrypto} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const build = join(root, 'app', 'build-e2e');
// device.ts imports react-native for NativeModules; under Node there are none.
mkdirSync(join(build, 'node_modules', 'react-native'), {recursive: true});
writeFileSync(join(build, 'node_modules', 'react-native', 'index.js'), 'module.exports = {NativeModules: {}, Platform: {constants: {}}};
');
const require = createRequire(import.meta.url);
const api = require(join(build, 'app', 'src', 'api', 'events.js'));
const {createDevice} = require(join(build, 'app', 'src', 'api', 'device.js'));
const base = process.argv[2] ?? 'http://127.0.0.1:8000';
const dbUrl = process.env.DATABASE_URL;
const psql = process.env.VUKA_PSQL ?? 'psql';
const sql = q => execFileSync(psql, ['-At', '-d', dbUrl, '-c', q], {encoding: 'utf8'}).trim();
const esc = s => s.replace(/'/g, "''");

function rawToDer(raw) {
  const int = b => { let i = 0; while (i < b.length - 1 && b[i] === 0) i++; let v = b.subarray(i); if (v[0] & 0x80) v = Buffer.concat([Buffer.from([0]), v]); return Buffer.concat([Buffer.from([0x02, v.length]), v]); };
  const body = Buffer.concat([int(raw.subarray(0, 32)), int(raw.subarray(32))]);
  return Buffer.concat([Buffer.from([0x30, body.length]), body]);
}
async function softwareSigner() {
  const kp = await webcrypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign', 'verify']);
  const spki = Buffer.from(await webcrypto.subtle.exportKey('spki', kp.publicKey));
  const keyId = 'dev_' + createHash('sha256').update(spki).digest('hex').slice(0, 16);
  const raw = async t => Buffer.from(await webcrypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, kp.privateKey, Buffer.from(t, 'utf8')));
  let counter = 0;
  return {
    identity: async () => ({publicKey: spki.toString('base64'), keyId}),
    sign: async t => (await raw(t)).toString('base64'),
    signDer: async t => rawToDer(await raw(t)).toString('base64'),
    randomBytes: async n => Buffer.from(webcrypto.getRandomValues(new Uint8Array(n))).toString('base64'),
    commitment: async (salt, t) => createHash('sha256').update(Buffer.concat([Buffer.from(salt, 'base64'), Buffer.from(t, 'utf8')])).digest('hex'),
    sha256Hex: async t => createHash('sha256').update(t, 'utf8').digest('hex'),
    nextCounter: async () => ++counter,
  };
}
function backend(signer, pinsRef) {
  let seq = 0, queue = [], profile = null;
  const received = [];
  return {
    simulated: false, signer,
    enqueue: async j => (queue.push({seq: ++seq, json: j}), seq), pending: async () => queue.slice(),
    markReceived: async (s, r) => { queue = queue.filter(i => i.seq !== s); received.push({seq: s, json: r}); return true; },
    received: async () => received.slice(),
    setProfile: async j => ((profile = j), true), getProfile: async () => profile,
    pinsSet: async () => pinsRef.p !== null, setPins: async (n, x) => ((pinsRef.p = {n, x}), true),
    verify: async p => (!pinsRef.p ? 'wrong' : p === pinsRef.p.n ? 'normal' : p === pinsRef.p.x ? 'duress' : 'wrong'),
    post: (url, entry) => api.postEvent(url, signer, entry),
    request: (url, method, path, body, keyId) => api.signedRequest(url, signer, method, path, body, undefined, keyId),
    discover: async () => base,
  };
}
async function memberPhone(tag) {
  const d = createDevice(backend(await softwareSigner(), {p: null}));
  await d.setPins('1234', '9876');
  const p = await d.register(`sim ${tag}`, '0.0.6');
  await d.setServer(base);
  await d.flush();
  return {d, subject: p.subjectId};
}
async function guardianPhone() {
  return createDevice(backend(await softwareSigner(), {p: null}));
}
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };
const wait = ms => new Promise(r => setTimeout(r, ms));
async function detection(d, journey) {
  const signalId = await d.signal(journey, {kind: 'signal_detected', pv: 1, journey_id: journey});
  const c = await d.openCheckin(journey, signalId);
  await c.shown();
  return c;
}
async function alertsOf(g, want, tries = 20) {
  let a = [];
  for (let i = 0; i < tries; i++) { a = await g.guardianAlerts(); if (a.length >= want) break; await wait(1000); }
  return a;
}

// ---- #118: the member's phone sees its invite accepted --------------------------
const m = await memberPhone('wrong-pin e2e');
const inv = await m.d.inviteGuardian('1234');
check('#118 invite: code issued', typeof inv === 'object' && !!inv.guardianId);
check('#118 invite: member sees "waiting" before the guardian accepts', (await m.d.guardianStatuses())?.[inv.guardianId] === 'waiting');
const g = await guardianPhone();
await g.becomeGuardian(inv.code, 'Lerato');
check('#118 invite: member sees "accepted" right after', (await m.d.guardianStatuses())?.[inv.guardianId] === 'accepted');
// A decoy needs the second PIN, which is itself an alarm (V6), so it gets its own member.
const md = await memberPhone('decoy e2e');
const realInv = await md.d.inviteGuardian('1234');
await (await guardianPhone()).becomeGuardian(realInv.code, 'Lerato');
const decoyInv = await md.d.inviteGuardian('9876'); // second PIN: a decoy
const decoy = await guardianPhone();
await decoy.becomeGuardian(decoyInv.code, 'Lerato');
const statuses = await md.d.guardianStatuses();
check('#118 coercion-safe: a decoy reads exactly like a real guardian', statuses?.[decoyInv.guardianId] === 'accepted' && statuses?.[realInv.guardianId] === 'accepted', JSON.stringify(statuses));
const g2 = await guardianPhone(); // a second real guardian for m, to prove every real guardian is told
const inv2 = await m.d.inviteGuardian('1234');
await g2.becomeGuardian(inv2.code, 'Lerato');

// ---- #120: a wrong PIN is a heads-up to guardians, never duress, never the bank ---
const journey = await m.d.startJourney('0.0.6');
const c = await detection(m.d, journey);
check('#120 phone: a wrong PIN shows only "Try again"', (await c.enter('0000')) === 'retry');
await m.d.flush();
const a1 = await alertsOf(g, 1);
check('#120 guardian: heads-up arrives with trigger wrong_pin', a1.length === 1 && a1[0].trigger === 'wrong_pin', JSON.stringify(a1.map(a => a.trigger)));
check('#120 guardian: every real guardian is told', (await alertsOf(g2, 1)).some(a => a.trigger === 'wrong_pin'));
const bankFor = subject => sql(`SELECT count(*) FROM outbox o JOIN incidents i ON o.reference_id = i.incident_id::text WHERE o.kind='bank_signal' AND i.subject_id='${esc(subject)}'`);
check('#120 server: no bank signal, no duress', bankFor(m.subject) === '0' &&
  sql(`SELECT has_duress::text||'/'||coalesce(bank_trigger,'none') FROM incidents WHERE subject_id='${esc(m.subject)}'`) === 'false/none');
check('#120 server: the check-in is still undecided (deadline still applies)', sql(`SELECT coalesce(outcome,'open') FROM checkins WHERE checkin_id='${esc(c.checkinId)}'`) === 'open');
check('#120 phone: a second wrong PIN also shows "Try again"', (await c.enter('1111')) === 'retry');
check('#120 phone: then the right PIN is accepted', (await c.enter('1234')) === 'checked');
await m.d.flush();
await wait(3000);
const a2 = await g.guardianAlerts();
check('#120 guardian: still exactly one heads-up for this incident', a2.filter(a => a.trigger === 'wrong_pin').length === 1, JSON.stringify(a2.map(a => a.trigger)));
check('#120 server: outcome normal_pin; still no bank signal', sql(`SELECT outcome FROM checkins WHERE checkin_id='${esc(c.checkinId)}'`) === 'normal_pin' &&
  bankFor(m.subject) === '0');
const recorded = Number(sql(`SELECT count(*) FROM chain_entries WHERE subject_id='${esc(m.subject)}' AND action='device_event' AND target_id='${esc(journey)}'`));
check('#120 record: the wrong PINs are signed chain entries', recorded >= 5, `${recorded} journey entries`);

// T47 unchanged: from the 4th entry, "Checked in" and nothing more recorded.
const m2 = await memberPhone('t47 e2e');
const j2 = await m2.d.startJourney('0.0.6');
const c2 = await detection(m2.d, j2);
const answers = [];
for (const pin of ['0000', '1111', '2222', '3333', '4444']) answers.push(await c2.enter(pin));
await m2.d.flush();
check('T47 phone: Try again x3, then Checked in', JSON.stringify(answers) === JSON.stringify(['retry', 'retry', 'retry', 'checked', 'checked']), answers.join(','));
const beforeCount = m2.d.delivery();
check('T47 phone: every recorded event reached the server', beforeCount.queued === 0, beforeCount.lastError ?? '');

const failed = results.filter(ok => !ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
