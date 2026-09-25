#!/usr/bin/env node
/**
 * Replays harness windows through the phone's own detection engine
 * (app/src/brain/detect, compiled, not reimplemented) and reports, with n:
 *
 *  - per clip: recall on positives (a record in the right family), and which
 *    negatives were recorded;
 *  - --stream: the negatives played back to back as one continuous armed
 *    session, through one engine state, so cooldown and duplicate rules act
 *    as they do on a phone: records and prompts per hour.
 *
 * Usage:
 *   node scripts/eval/run-engine.mjs <windows.jsonl> [--folds 4,5] [--ruleset-json <file>]
 * Requires the engine compiled to app/build-eval (see scripts/eval/README.md).
 */
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const engine = require(join(root, 'app', 'build-eval', 'index.js'));

const arg = name => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const folds = arg('--folds')?.split(',');
// How long a prompted check-in stays open in the stream replay (the member's window to answer).
const checkinMs = Number(arg('--checkin-ms') ?? 60000);
const rsFile = arg('--ruleset-json');
const ruleset = rsFile ? {...engine.RULESET_V1, ...JSON.parse(readFileSync(rsFile, 'utf8'))} : engine.RULESET_V1;

const clips = readFileSync(process.argv[2], 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(l => JSON.parse(l))
  .filter(c => !folds || folds.includes(String(c.fold)));
const familyOf = label => engine.TARGETS.find(t => t.label === label)?.family;

// ---------------------------------------------------------------- per clip ---
let posN = 0, posHit = 0, posWrong = 0, negN = 0, negSeconds = 0, negRecords = 0;
const negByCategory = {};
const examples = [];
for (const c of clips) {
  let state = engine.initialState();
  const records = [];
  for (const w of c.windows) {
    const out = engine.step(state, {type: 'audio', window: w}, ruleset);
    state = out.state;
    if (out.decision?.record) records.push(out.decision.candidate);
  }
  if (c.label === 'negative') {
    negN++;
    negSeconds += c.seconds;
    negRecords += records.length;
    if (records.length) {
      negByCategory[c.category] = (negByCategory[c.category] ?? 0) + records.length;
      examples.push(`${c.clip} (${c.category}) -> ${records.map(f => `${f.class_label} ${f.score_bp}`).join(', ')}`);
    }
  } else {
    posN++;
    const want = c.label.replace('positive_', '');
    if (records.some(f => familyOf(f.class_label) === want)) posHit++;
    else if (records.length) posWrong++;
  }
}

// --------------------------------------------------------- continuous stream ---
// Negatives back to back: window numbers and times continue across clips.
let state = engine.initialState();
let seqBase = 0, msBase = 0, streamRecords = 0, streamPrompts = 0, openUntil = -1;
for (const c of clips.filter(x => x.label === 'negative')) {
  for (const w of c.windows) {
    const endMs = w.endMs + msBase;
    if (openUntil >= 0 && endMs >= openUntil) {
      state = engine.step(state, {type: 'checkin', open: false}, ruleset).state;
      openUntil = -1;
    }
    const out = engine.step(state, {type: 'audio', window: {...w, seq: w.seq + seqBase, endMs}}, ruleset);
    state = out.state;
    if (out.decision?.record) streamRecords++;
    if (out.decision?.prompt) {
      streamPrompts++;
      state = engine.step(state, {type: 'checkin', open: true}, ruleset).state;
      openUntil = endMs + checkinMs;
    }
  }
  seqBase += c.windows.length ? c.windows[c.windows.length - 1].seq : 0;
  msBase += Math.round(c.seconds * 1000);
}

const pct = (p, q) => (q ? ((100 * p) / q).toFixed(1) : 'n/a');
const hours = negSeconds / 3600;
const perHour = x => (hours ? (x / hours).toFixed(1) : 'n/a');
console.log(`ruleset ${ruleset.id} v${ruleset.version} (calibrated: ${ruleset.calibrated})${folds ? `, folds ${folds.join(',')}` : ''}`);
console.log(`positives: ${posHit}/${posN} recorded in the right family (${pct(posHit, posN)}%); ${posWrong} recorded as another family only`);
console.log(`negatives, per clip: ${negRecords} records in ${negN} clips (${hours.toFixed(3)} h) = ${perHour(negRecords)} per hour`);
if (Object.keys(negByCategory).length) console.log(`  by category: ${JSON.stringify(negByCategory)}`);
examples.slice(0, 12).forEach(e => console.log(`  ${e}`));
console.log(`negatives, host replay as one stream (check-in open ${checkinMs} ms after each prompt; clip tails and cross-clip windows not modelled): ${streamRecords} records, ${streamPrompts} prompts in ${hours.toFixed(3)} h = ${perHour(streamPrompts)} prompts per hour`);
