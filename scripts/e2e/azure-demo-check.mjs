#!/usr/bin/env node
/**
 * Live demo check against the deployed ANCHOR server (API only, no database):
 * the app's own device layer (app/build-e2e, see README.md) on a member phone
 * and a guardian phone runs every demo step: sign-up registration at the
 * email code step, guardian invite accepted, wrong-PIN heads-up, duress alert
 * (the server then sends the sim_bank signal), stand down, journey end, and an
 * export whose head becomes provable on Hedera (the ledger's live-verified
 * path). Sends no real email. Printed 14/14 on Azure on 27 Sep (0.0.16 code).
 *
 * Usage: node scripts/e2e/azure-demo-check.mjs https://vuka-anchor-server.azurewebsites.net
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
writeFileSync(join(build, 'node_modules', 'react-native', 'index.js'), 'module.exports = {NativeModules: {}, Platform: {constants: {}}};\n');
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


const t0 = Date.now();
// 1. Sign-up (#122): the code step registers the phone early; the record step keeps it.
const m = {d: createDevice(backend(await softwareSigner(), {p: null}))};
let signUpMsg = '';
try { await m.d.sendSignUpCode('not-an-email', '0.0.16'); } catch (e) { signUpMsg = String(e.message); }
check('sign-up: phone registered on Azure at the code step', !!m.d.profile?.subjectId && m.d.profile?.earlySignUp === true, m.d.profile?.subjectId);
check('sign-up: a bad address gets plain words (no email sent)', /valid email/.test(signUpMsg), signUpMsg);
await m.d.setPins('1234', '9876');
const prof = await m.d.register('Thandi', '0.0.16');
await m.d.setServer(base);
await m.d.flush();
check('sign-up: "Start your record" keeps that registration and adds the name', prof.firstName === 'Thandi' && !prof.earlySignUp && m.d.delivery().queued === 0);
m.subject = prof.subjectId;

// 2. Guardian invite (#118).
const inv = await m.d.inviteGuardian('1234');
const g = await guardianPhone();
await g.becomeGuardian(inv.code, 'Thandi');
check('invite: member sees "accepted"', (await m.d.guardianStatuses())?.[inv.guardianId] === 'accepted');

// 3. Wrong PIN heads-up (#120), then the right PIN.
const j1 = await m.d.startJourney('0.0.16');
const c1 = await detection(m.d, j1);
check('check-in: wrong PIN shows only "Try again"', (await c1.enter('0000')) === 'retry');
await m.d.flush();
const a1 = await alertsOf(g, 1, 30);
check('guardian: wrong_pin heads-up arrives', a1.some(a => a.trigger === 'wrong_pin'), JSON.stringify(a1.map(a => a.trigger)));
check('check-in: right PIN accepted', (await c1.enter('1234')) === 'checked');
await m.d.flush();

// 4. Duress PIN on a new detection: guardians told as duress (bank signal goes server-side).
const c2 = await detection(m.d, j1);
check('check-in: duress PIN looks exactly like a normal one', (await c2.enter('9876')) === 'checked');
await m.d.flush();
let a2 = [];
for (let i = 0; i < 30 && !a2.some(a => a.trigger === 'duress_signal'); i++) { await wait(1000); a2 = await g.guardianAlerts(); }
check('guardian: duress alert arrives', a2.some(a => a.trigger === 'duress_signal'), JSON.stringify(a2.map(a => a.trigger)));

// 5. Guardian stands down (closes the incident), member ends the journey.
const incident = a2.find(a => a.trigger === 'duress_signal')?.incident_id;
let stood = false;
try { await g.acknowledge(incident, 'stand_down'); stood = true; } catch (e) { stood = String(e); }
check('guardian: stand down recorded', stood === true, String(stood));
check('journey: ends with the normal PIN', (await m.d.endJourney(j1, '1234')) === 'ended');
await m.d.flush();

// 6. Export and its Hedera anchor (the ledger's "live-verified" path).
check('export: PIN accepted', (await m.d.authoriseExport('1234')) === 'ok');
await m.d.flush();
const signer = null;
const exp = await m.d.checkMyRecord().then(r => r.exp).catch(e => ({error: String(e)}));
const head = exp?.entries?.at?.(-1)?.event_hash;
check('export: the member record comes back and checks out on the phone', !!head, exp?.error ?? `${exp?.entries?.length} entries`);
let proof = 0;
for (let i = 0; i < 30 && head; i++) { proof = (await fetch(`${base}/v1/anchor/proof/${head}`)).status; if (proof === 200) break; await wait(5000); }
check('anchor: the exported head is provable on Hedera (ledger live-verified)', proof === 200, `proof ${proof}`);
const failed = results.filter(ok => !ok).length;
console.log(`\n${results.length - failed}/${results.length} passed in ${Math.round((Date.now() - t0) / 1000)} s (subject ${m.subject})`);
process.exit(failed ? 1 : 0);
