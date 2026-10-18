#!/usr/bin/env node
/**
 * Puts the registered YAMNet model into the APK's assets, or refuses.
 *
 * The model is never committed (*.tflite is gitignored). This script fetches it
 * from Google's official TF Hub listing (served from Kaggle Models), checks the
 * sha256 and size against the model register (docs/MODEL-LICENCES.md row M1),
 * and only then writes it, atomically, with the label list extracted from the
 * model's own metadata. A mismatch leaves any existing good file untouched and
 * exits non-zero.
 *
 * Usage: node scripts/fetch-model.mjs [--from <local .tflite>]
 *   --from   verify and install a local copy instead of downloading.
 */
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateRawSync} from 'node:zlib';

const MODEL = {
  url: 'https://tfhub.dev/google/lite-model/yamnet/classification/tflite/1?lite-format=tflite',
  sha256: '10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de',
  bytes: 4126810,
  labelsEntry: 'yamnet_label_list.txt',
  labelCount: 521,
};

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', 'android', 'app', 'src', 'main', 'assets', 'models');

/** The last stored or deflated entry named `name` in a zip appended to `buf`. */
function unzipEntry(buf, name) {
  // Find the end-of-central-directory record, then walk the central directory.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('no zip metadata in the model');
  const count = buf.readUInt16LE(eocd + 10);
  const cdSize = buf.readUInt32LE(eocd + 12);
  // Offsets in the directory are relative to where the zip starts inside the file.
  const cdStart = eocd - cdSize;
  const zipBase = cdStart - buf.readUInt32LE(eocd + 16);
  let p = cdStart;
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad zip directory');
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = zipBase + buf.readUInt32LE(p + 42);
    const entryName = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (entryName === name) {
      const dataStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const data = buf.subarray(dataStart, dataStart + csize);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return inflateRawSync(data);
      throw new Error(`unsupported zip method ${method}`);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`${name} not found in the model metadata`);
}

async function main() {
  const fromIdx = process.argv.indexOf('--from');
  let buf;
  if (fromIdx > 0) {
    buf = readFileSync(process.argv[fromIdx + 1]);
  } else {
    const res = await fetch(MODEL.url, {redirect: 'follow'});
    if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
  }

  const sha = createHash('sha256').update(buf).digest('hex');
  if (sha !== MODEL.sha256 || buf.length !== MODEL.bytes) {
    console.error(`REFUSED: got sha256 ${sha} (${buf.length} bytes); the register says ${MODEL.sha256} (${MODEL.bytes} bytes).`);
    process.exit(2);
  }

  const labels = unzipEntry(buf, MODEL.labelsEntry).toString('utf8').split(/\r?\n/).filter(Boolean);
  if (labels.length !== MODEL.labelCount) {
    console.error(`REFUSED: ${labels.length} labels, expected ${MODEL.labelCount}.`);
    process.exit(2);
  }

  mkdirSync(assets, {recursive: true});
  for (const [file, data] of [
    ['yamnet.tflite', buf],
    ['yamnet_labels.txt', Buffer.from(labels.join('\n') + '\n', 'utf8')],
  ]) {
    const tmp = join(assets, `.${file}.tmp`);
    writeFileSync(tmp, data);
    renameSync(tmp, join(assets, file));
  }
  console.log(`Installed YAMNet ${sha.slice(0, 12)}… (${buf.length} bytes, ${labels.length} labels) into assets/models.`);
}

main().catch(e => {
  console.error(`REFUSED: ${e.message}`);
  process.exit(2);
});
