#!/usr/bin/env node
/**
 * Journey end to end against the slice-3 ANCHOR server (PR #89): the app's own
 * device layer (app/src/api/device.ts, compiled) with a WebCrypto P-256 signer
 * standing in for Android Keystore and an in-memory queue standing in for the
 * sealed one. Every event goes through the same checks, signing and queue
 * code as on the phone. Server state is read back from PostgreSQL.
 *
 * Scenarios: normal check-in and normal end; duress check-in; three wrong
 * PINs then a normal PIN (T47); an unanswered check-in (no_answer from the
 * scheduler, ~75 s, skipped with --fast); normal vs duress request sizes.
 *
 * Usage: node scripts/e2e/journey-e2e.mjs http://127.0.0.1:8000 [--fast]
 * Requires: app/build-e2e (see scripts/e2e/README.md), psql on PATH or
 * VUKA_PSQL, and DATABASE_URL for the server's database.
 */
import {execFileSync} from 'node:child_process';
import {createHash, webcrypto} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const build = join(root, 'app', 'build-e2e');
// device.ts imports react-native for NativeModules; under Node there are none.
mkdirSync(join(build, 'node_modules', 'react-native'), {recursive: true});
writeFileSync(join(build, 'node_modules', 'react-native', 'index.js'), 'module.exports = {NativeModules: {}, Platform: {constants: {}}};\n');
const api = require(join(build, 'app', 'src', 'api', 'events.js'));
const {createDevice} = require(join(build, 'app', 'src', 'api', 'device.js'));

const base = process.argv[2] ?? 'http://127.0.0.1:8000';
const fast = process.argv.includes('--fast');
const psql = process.env.VUKA_PSQL ?? 'psql';
const dbUrl = process.env.DATABASE_URL ?? 'postgresql://vuka@127.0.0.1:55432/vuka3';
const sql = q => execFileSync(psql, ['-At', '-d', dbUrl, '-c', q], {encoding: 'utf8'}).trim();

function rawToDer(raw) {
  const int = b => {
    let i = 0;
    while (i < b.length - 1 && b[i] === 0) i++;
    let v = b.subarray(i);
    if (v[0] & 0x80) v = Buffer.concat([Buffer.from([0]), v]);
    return Buffer.concat([Buffer.from([0x02, v.length]), v]);
  };
  const body = Buffer.concat([int(raw.subarray(0, 32)), int(raw.subarray(32))]);
  return Buffer.concat([Buffer.from([0x30, body.length]), body]);
}

async function softwareSigner() {
  const kp = await webcrypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign', 'verify']);
  const spki = Buffer.from(await webcrypto.subtle.exportKey('spki', kp.publicKey));
  const keyId = 'dev_' + createHash('sha256').update(spki).digest('hex').slice(0, 16);
  const raw = async text => Buffer.from(await webcrypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, kp.privateKey, Buffer.from(text, 'utf8')));
  let counter = 0;
  return {
    identity: async () => ({publicKey: spki.toString('base64'), keyId}),
    sign: async text => (await raw(text)).toString('base64'),
    signDer: async text => rawToDer(await raw(text)).toString('base64'),
    randomBytes: async n => Buffer.from(webcrypto.getRandomValues(new Uint8Array(n))).toString('base64'),
    commitment: async (salt, text) => createHash('sha256').update(Buffer.concat([Buffer.from(salt, 'base64'), Buffer.from(text, 'utf8')])).digest('hex'),
    sha256Hex: async text => createHash('sha256').update(text, 'utf8').digest('hex'),
    nextCounter: async () => ++counter,
  };
}

/** A phone: the real device layer over a software signer and an in-memory queue. */
async function phone(tag) {
  const signer = await softwareSigner();
  let seq = 0;
  let queue = [];
  const received = [];
  let profile = null;
  let pins = null;
  const sizes = [];
  const d = createDevice({
    simulated: false,
    signer,
    enqueue: async j => (queue.push({seq: ++seq, json: j}), seq),
    pending: async () => queue.slice(),
    markReceived: async (s, r) => {
      queue = queue.filter(i => i.seq !== s);
      received.push({seq: s, json: r});
      return true;
    },
    received: async () => received.slice(),
    setProfile: async j => ((profile = j), true),
    getProfile: async () => profile,
    pinsSet: async () => pins !== null,
    setPins: async (n, x) => ((pins = {n, x}), true),
    verify: async p => (p === pins.n ? 'normal' : p === pins.x ? 'duress' : 'wrong'),
    post: async (url, entry) => {
      sizes.push({kind: entry.payload.kind, bytes: Buffer.byteLength(JSON.stringify(entry))});
      return api.postEvent(url, signer, entry);
    },
    request: (url, method, path, body) => api.signedRequest(url, signer, method, path, body),
  });
  await d.setPins('1234', '9876');
  const p = await d.register(`sim ${tag}`, '0.0.6');
  phoneSigners.set(p.subjectId, signer);
  await d.setServer(base);
  await d.flush();
  return {d, subject: p.subjectId, sizes};
}

const phoneSigners = new Map();
const results = [];
const check = (name, ok, detail = '') => {
  results.push({name, ok});
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};
const q = s => s.replace(/'/g, "''");

async function detection(d, journey) {
  const signalId = await d.signal(journey, {
    kind: 'signal_detected', pv: 1, journey_id: journey, sense: 'sound', class_label: 'Glass', class_index: 435,
    score_bp: 8516, threshold_bp: 3500, window_ms: 975, model_sha256: '10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de',
    app_version: '0.0.6', corroboration: [],
  });
  const c = await d.openCheckin(journey, signalId);
  await c.shown();
  return c;
}

// ---- 1. Normal: check-in answered, journey ended ------------------------------
{
  const {d, subject} = await phone('normal');
  check('normal: registration received', d.delivery().received === 1 && d.delivery().queued === 0, JSON.stringify(d.delivery()));
  const journey = await d.startJourney('0.0.6');
  check('normal: server issued the journey id', /^[0-9a-f-]{36}$/.test(journey), journey);
  await d.heartbeat(journey, 'walking');
  check('normal: heartbeat accepted', Boolean(d.delivery().lastContactAt));
  const c = await detection(d, journey);
  check('normal: normal PIN shows "checked"', (await c.enter('1234')) === 'checked');
  await d.flush();
  check('normal: every event received', d.delivery().queued === 0, d.delivery().lastError ?? '');
  check('normal: check-in outcome normal_pin', sql(`SELECT outcome FROM checkins WHERE checkin_id='${q(c.checkinId)}'`) === 'normal_pin');
  check('normal: end journey with normal PIN shows "ended"', (await d.endJourney(journey, '1234')) === 'ended');
  await d.flush();
  check('normal: journey_ended accepted', d.delivery().queued === 0 && sql(`SELECT count(*) FROM ended_journeys WHERE journey_id='${q(journey)}'`) === '1', d.delivery().lastError ?? '');
  check('normal: no duress alarm', sql(`SELECT count(*) FROM incidents WHERE subject_id='${q(subject)}' AND has_duress`) === '0');
  // My record: the PIN authorises an export; the server then returns the member's own record.
  check('normal: export PIN accepted', (await d.authoriseExport('1234')) === 'ok');
  await d.flush();
  const exp = await api.signedRequest(base, phoneSigners.get(subject), 'GET', `/v1/subjects/${subject}/export`, '').catch(e => ({error: String(e)}));
  check('normal: server returns the member export after the PIN', !exp.error, exp.error ?? `${Object.keys(exp).join(',')}`);
  // The phone's check and the stranger's verifier must agree, and fail at the same entry.
  const {checkRecord} = require(join(build, 'app', 'src', 'api', 'verifyRecord.js'));
  const {verifyExport} = await import(pathToFileURL(join(root, 'shared', 'verify.js')).href);
  const hasher = phoneSigners.get(subject);
  const mine = (await d.myRecord()).map(r => ({event_id: r.event_id, event_hash: r.event_hash, chain_index: r.chain_index}));
  const onPhone = await checkRecord(exp, hasher, mine);
  const stranger = await verifyExport(exp);
  check('record: phone check and stranger verifier both pass the export', onPhone.ok && stranger.ok, `phone ${onPhone.entries} entries, ${onPhone.mine.inside} receipts matched; stranger ${stranger.entries_checked}`);
  const bad = JSON.parse(JSON.stringify(exp));
  const victim = bad.payloads[Math.min(2, bad.payloads.length - 1)];
  victim.payload = {...victim.payload, pv: 2};
  const badIndex = bad.entries.findIndex(e => e.details.event_id === victim.event_id);
  const [p2, s2] = [await checkRecord(bad, hasher, mine), await verifyExport(bad)];
  check('record: a tampered payload fails both, at the same entry', !p2.ok && !s2.ok && p2.firstBroken === badIndex && s2.first_broken_index === badIndex, `phone ${p2.firstBroken}, stranger ${s2.first_broken_index}, expected ${badIndex}`);
}

// ---- 2. Duress: same screens, server alarm -----------------------------------
let duressSizes;
let normalSizes;
{
  const a = await phone('parity-normal');
  const b = await phone('duress');
  for (const [who, pin] of [[a, '1234'], [b, '9876']]) {
    const journey = await who.d.startJourney('0.0.6');
    const c = await detection(who.d, journey);
    check(`${who === a ? 'parity-normal' : 'duress'}: PIN shows "checked"`, (await c.enter(pin)) === 'checked');
    await who.d.flush();
    check(`${who === a ? 'parity-normal' : 'duress'}: every event received`, who.d.delivery().queued === 0, who.d.delivery().lastError ?? '');
  }
  check('duress: incident marked duress', sql(`SELECT count(*) FROM incidents WHERE subject_id='${q(b.subject)}' AND has_duress`) === '1');
  check('duress: guardian alert queued in the outbox', Number(sql(`SELECT count(*) FROM outbox o JOIN incidents i ON o.reference_id=i.incident_id::text WHERE i.subject_id='${q(b.subject)}' AND o.kind='guardian_alert'`)) >= 1);
  check('parity-normal: no duress alarm', sql(`SELECT count(*) FROM incidents WHERE subject_id='${q(a.subject)}' AND has_duress`) === '0');
  normalSizes = a.sizes.filter(s => s.kind === 'checkin_result').map(s => s.bytes);
  duressSizes = b.sizes.filter(s => s.kind === 'checkin_result').map(s => s.bytes);
}

// ---- 3. Wrong PINs (T47) ------------------------------------------------------
{
  const {d} = await phone('wrong');
  const journey = await d.startJourney('0.0.6');
  const c = await detection(d, journey);
  const screens = [];
  for (const pin of ['0000', '0000', '0000', '1234']) screens.push(await c.enter(pin));
  check('wrong: three "retry", then "checked"', screens.join(',') === 'retry,retry,retry,checked', screens.join(','));
  await d.flush();
  check('wrong: late normal PIN (attempt 4) is not terminal', sql(`SELECT coalesce(outcome,'open') FROM checkins WHERE checkin_id='${q(c.checkinId)}'`) === 'open');
}

// ---- 4. No answer -------------------------------------------------------------
if (!fast) {
  const {d} = await phone('no-answer');
  const journey = await d.startJourney('0.0.6');
  const c = await detection(d, journey);
  await d.flush();
  console.log('      waiting 75 s for the check-in deadline (60 s window + 10 s grace)…');
  await new Promise(r => setTimeout(r, 75000));
  check('no answer: scheduler fixed the outcome as no_answer', sql(`SELECT outcome FROM checkins WHERE checkin_id='${q(c.checkinId)}'`) === 'no_answer');
}

// ---- 5. Parity: request size ---------------------------------------------------
{
  // Bodies differ only by random values: the DER signature is 70–72 bytes of base64 either way.
  const diff = Math.abs(normalSizes[0] - duressSizes[0]);
  check('parity: normal and duress checkin_result bodies within DER-length noise', diff <= 4, `normal ${normalSizes[0]} B, duress ${duressSizes[0]} B`);
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
