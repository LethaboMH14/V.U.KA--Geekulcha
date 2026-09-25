#!/usr/bin/env node
/**
 * End to end against a running ANCHOR server (PR #51): the app's own event
 * client (app/src/api/events.ts, compiled) with a WebCrypto P-256 signer
 * standing in for Android Keystore. It registers a sim_ subject (genesis),
 * appends subject events, retries one (idempotency), and checks a tampered
 * request is refused.
 *
 * Usage: node scripts/e2e/anchor-e2e.mjs http://127.0.0.1:8000
 * Requires: app/build-e2e (see scripts/e2e/README.md).
 */
import {createHash, webcrypto} from 'node:crypto';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const api = require(join(root, 'app', 'build-e2e', 'app', 'src', 'api', 'events.js'));
const base = process.argv[2] ?? 'http://127.0.0.1:8000';

/** Raw 64-byte r||s to DER, as Android Keystore returns signatures. */
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
  let counter = 0;
  return {
    identity: async () => ({publicKey: spki.toString('base64'), keyId}),
    // WebCrypto ECDSA already returns raw r||s.
    sign: async text => Buffer.from(await webcrypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, kp.privateKey, Buffer.from(text, 'utf8'))).toString('base64'),
    signDer: async text => rawToDer(Buffer.from(await webcrypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, kp.privateKey, Buffer.from(text, 'utf8')))).toString('base64'),
    randomBytes: async n => Buffer.from(webcrypto.getRandomValues(new Uint8Array(n))).toString('base64'),
    commitment: async (salt, text) => createHash('sha256').update(Buffer.concat([Buffer.from(salt, 'base64'), Buffer.from(text, 'utf8')])).digest('hex'),
    sha256Hex: async text => createHash('sha256').update(text, 'utf8').digest('hex'),
    nextCounter: async () => ++counter,
  };
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({name, ok});
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const signer = await softwareSigner();
const {keyId} = await signer.identity();
const subjectId = `sim_subj_${keyId.slice(4, 12)}`;
const actorId = `sim_member_${keyId.slice(4, 12)}`;
const ts = () => api.rfc3339(new Date());

const health = await fetch(`${base}/healthz`).then(r => r.json()).catch(e => ({error: String(e)}));
check('server healthz', !health.error, JSON.stringify(health));

// 1. Genesis registration enrols the device key.
const reg = await api.buildEvent({
  signer, subjectId, actorId, action: 'registration', targetType: 'subject', targetId: subjectId, ts: ts(), genesis: true,
  payload: {kind: 'registration', pv: 1, app_version: '0.0.6', model_sha256: '10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de', android_api: 34, device_model: 'e2e-host'},
});
const r0 = await api.postEvent(base, signer, reg).catch(e => ({error: String(e)}));
check('genesis registration accepted, chain index 0', r0.chain_index === 0, JSON.stringify(r0));

// 2. A subject event appends to the chain with a server receipt.
const ev = await api.buildEvent({
  signer, subjectId, actorId, action: 'device_event', targetType: 'subject', targetId: subjectId, ts: ts(),
  payload: {kind: 'signal_detected', pv: 1, journey_id: 'sim_jny_e2e', sense: 'sound', class_label: 'Glass', class_index: 435, score_bp: 8516, threshold_bp: 3500, window_ms: 975, model_sha256: '10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de', app_version: '0.0.6', corroboration: []},
});
const r1 = await api.postEvent(base, signer, ev).catch(e => ({error: String(e)}));
check('signal_detected appended at chain index 1', r1.chain_index === 1 && /^[0-9a-f]{64}$/.test(r1.event_hash ?? ''), JSON.stringify(r1));

// 3. A retry of the same event returns the original receipt (idempotency, §7).
const r1b = await api.postEvent(base, signer, ev).catch(e => ({error: String(e)}));
check('retry returns the same receipt', r1b.event_hash === r1.event_hash && r1b.chain_index === 1, JSON.stringify(r1b));

// 4. A payload changed after signing is refused (commitment mismatch).
const tampered = {...ev, payload: {...ev.payload, score_bp: 9999}, details: {...ev.details, event_id: (await api.buildEvent({signer, subjectId, actorId, action: 'device_event', targetType: 'subject', targetId: subjectId, ts: ts(), payload: {kind: 'x', pv: 1}})).details.event_id}};
const r2 = await api.postEvent(base, signer, tampered).catch(e => ({error: String(e)}));
check('tampered payload refused', Boolean(r2.error) && /400|401/.test(r2.error), r2.error ?? JSON.stringify(r2));

// 5. A request signed by an unknown key is refused.
const stranger = await softwareSigner();
const r3 = await api.postEvent(base, stranger, ev).catch(e => ({error: String(e)}));
check('unknown key refused', Boolean(r3.error) && /401/.test(r3.error), r3.error ?? JSON.stringify(r3));

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
