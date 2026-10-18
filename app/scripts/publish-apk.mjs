#!/usr/bin/env node
/**
 * Replaces VIGIL.apk on the vigil-demo release with a freshly built release
 * APK. The asset name stays VIGIL.apk, so the published download link and the
 * QR code (VIGIL-download-qr.png) keep working unchanged.
 *
 *   cd app/android && ./gradlew assembleRelease     (signed with the team key)
 *   cd .. && node scripts/publish-apk.mjs [path/to/app-release.apk] [--dry-run]
 *
 * Prints the SHA-256 for the release notes (T20 needs it). Needs the GitHub
 * CLI (`gh auth login`). It never signs anything and never reads the key.
 */
import {spawnSync} from 'node:child_process';
import {copyFileSync, createReadStream, existsSync, mkdtempSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const REPO = 'LethaboMH14/V.U.KA--Geekulcha';
const TAG = 'vigil-demo';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const src = args.find(a => !a.startsWith('--')) ?? join('android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');

if (!existsSync(src)) {
  console.error(`No APK at ${src}. Build it first: cd android && ./gradlew assembleRelease`);
  process.exit(2);
}
const sha = await new Promise((ok, fail) => {
  const h = createHash('sha256');
  createReadStream(src).on('data', d => h.update(d)).on('end', () => ok(h.digest('hex'))).on('error', fail);
});
const mb = (statSync(src).size / 1e6).toFixed(1);
console.log(`${src}\n  ${mb} MB\n  sha256 ${sha}`);

const dir = mkdtempSync(join(tmpdir(), 'vigil-apk-'));
const out = join(dir, 'VIGIL.apk');
copyFileSync(src, out);
if (dryRun) {
  console.log('--dry-run: not uploaded.');
  process.exit(0);
}
const up = spawnSync('gh', ['release', 'upload', TAG, out, '--clobber', '--repo', REPO], {stdio: 'inherit', shell: process.platform === 'win32'});
if (up.status !== 0) {
  console.error('gh release upload failed. Is the GitHub CLI installed and logged in (gh auth login)?');
  process.exit(up.status ?? 1);
}
console.log(`Published. Download link (the QR opens this):\n  https://github.com/${REPO}/releases/download/${TAG}/VIGIL.apk`);
console.log('Put the sha256 above in the release notes.');
