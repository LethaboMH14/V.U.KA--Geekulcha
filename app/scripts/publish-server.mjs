#!/usr/bin/env node
/**
 * Points every installed VIGIL at a server: checks that it answers /healthz,
 * then replaces server.json on the vigil-demo release (the file the app's
 * DISCOVERY_URL reads). Apps look it up again by themselves when their
 * current server stops answering (at most once a minute).
 *
 *   node scripts/publish-server.mjs https://<name>.trycloudflare.com
 *   node scripts/publish-server.mjs https://vuka-anchor-server.azurewebsites.net --note "Azure"
 *
 * Needs the GitHub CLI (`gh auth login`) with write access to the repository.
 * Refuses anything that is not https (release builds are HTTPS-only) or that
 * does not answer /healthz with 200, so a typo can't strand the phones.
 */
import {spawnSync} from 'node:child_process';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const REPO = 'LethaboMH14/V.U.KA--Geekulcha';
const TAG = 'vigil-demo';

const args = process.argv.slice(2);
const url = (args.find(a => !a.startsWith('--')) ?? '').trim().replace(/\/$/, '');
const noteAt = args.indexOf('--note');
const note = noteAt >= 0 ? args[noteAt + 1] : 'Demo ANCHOR server. Simulation subjects (sim_) only.';
const dryRun = args.includes('--dry-run');

if (!/^https:\/\/[^\s/]+$/.test(url)) {
  console.error('Usage: node scripts/publish-server.mjs https://<host> [--note "..."] [--dry-run]');
  console.error('The address must be https with no path: release builds refuse plain http.');
  process.exit(2);
}

let status = 0;
try {
  const r = await fetch(`${url}/healthz`, {signal: AbortSignal.timeout(15_000)});
  status = r.status;
} catch (e) {
  console.error(`${url}/healthz did not answer: ${e.message}`);
  process.exit(1);
}
if (status !== 200) {
  console.error(`${url}/healthz answered ${status}, not 200. server.json was not changed.`);
  process.exit(1);
}
console.log(`${url}/healthz: 200`);

const body = JSON.stringify({server: url, updated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'), note}, null, 2) + '\n';
const dir = mkdtempSync(join(tmpdir(), 'vigil-server-'));
const file = join(dir, 'server.json');
writeFileSync(file, body);
console.log(body);
if (dryRun) {
  console.log('--dry-run: not uploaded.');
  process.exit(0);
}

const up = spawnSync('gh', ['release', 'upload', TAG, file, '--clobber', '--repo', REPO], {stdio: 'inherit', shell: process.platform === 'win32'});
if (up.status !== 0) {
  console.error('gh release upload failed. Is the GitHub CLI installed and logged in (gh auth login)?');
  process.exit(up.status ?? 1);
}
console.log(`Published: https://github.com/${REPO}/releases/download/${TAG}/server.json`);
