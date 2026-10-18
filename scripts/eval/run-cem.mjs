#!/usr/bin/env node
/**
 * CEM-1 measurement (ADR-0047 step d): the phone's engine, tracker and
 * grader, compiled from source, run over YAMNet windows from
 * yamnet_windows.py, once with the V4 rule and once with CEM-1.
 *
 * Per clip, from a fresh state (no evidence carried between clips, so a lift
 * here comes from the clip's own sounds; accumulation across clips is not
 * measured):
 *   prompt  - a check-in would open (V4-level prompt, or a CEM-1 lift)
 *   record  - evidence is recorded without a check-in
 *
 * Positives (FSD50K eval: Screaming, Gunshot, Glass/Shatter; ESC-50
 * glass_breaking): catch rate per class. Negatives (ESC-50, every other
 * category): prompts per hour of audio.
 *
 * Build first (never committed):
 *   cd app && npx tsc src/brain/cem/grader.ts src/brain/cem/tracker.ts src/brain/cem/index.ts \
 *     src/brain/detect/index.ts --outDir build-eval --rootDir src --module commonjs --target es2020 \
 *     --moduleResolution node --skipLibCheck && cd ..
 * Run:
 *   node scripts/eval/run-cem.mjs windows.jsonl [--folds 4,5] [--json out.json]
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const detect = require(join(root, 'app', 'build-eval', 'brain', 'detect', 'index.js'));
const {createTracker} = require(join(root, 'app', 'build-eval', 'brain', 'cem', 'tracker.js'));
const {createGrader} = require(join(root, 'app', 'build-eval', 'brain', 'cem', 'grader.js'));

const arg = name => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const folds = arg('--folds')?.split(',');
// Sweep knobs (measurement only; the shipped ruleset changes only by ADR):
//   --record-fraction f   record threshold = floor(prompt threshold x f)
//   --voice-separation n  voice confirmation: this window and the one n before (0 = one window)
//   --half even|odd       FSD50K split by clip id parity (tune on one half, validate on the other)
const base = detect.RULESET_V1;
const frac = arg('--record-fraction') ? Number(arg('--record-fraction')) : null;
const sep = arg('--voice-separation') !== undefined ? Number(arg('--voice-separation')) : null;
const R = {
  ...base,
  ...(frac !== null ? {recordThresholdBp: Object.fromEntries(Object.entries(base.thresholdBp).map(([k, v]) => [k, Math.floor(v * frac)]))} : {}),
  ...(sep !== null ? {confirm: {...base.confirm, voice: {separation: sep}}} : {}),
};
const half = arg('--half');

const clips = readFileSync(process.argv[2], 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(l => JSON.parse(l))
  .filter(c => !folds || folds.includes(String(c.fold)))
  .filter(c => !half || c.fold !== 'fsd50k-eval' || (parseInt(c.clip, 10) % 2 === 0) === (half === 'even'));

function run(c, rule) {
  let state = detect.initialState();
  const tracker = createTracker(R);
  const grader = createGrader({tracker, rule, subjectIsSim: true});
  let prompts = 0;
  let lifts = 0;
  let records = 0;
  const count = acts => {
    for (const a of acts) {
      if (a.type === 'prompt') {
        prompts++;
        if (a.lifted) lifts++;
        // The member answers; the check-in closes (as the stream replay does).
        grader.checkinClosed();
        state = detect.step(state, {type: 'checkin', open: false}, R).state;
      } else records++;
    }
  };
  for (const w of c.windows) {
    const out = detect.step(state, {type: 'audio', window: w}, R);
    state = out.state;
    if (!out.decision) continue;
    tracker.observe(out.decision, w);
    count(grader.window(out.decision, w.endMs, []));
  }
  count(grader.stop());
  return {prompts, lifts, records};
}

const positive = c => c.category !== undefined && !/^negative$/.test(c.label) && c.label !== 'negative';
const rows = {};
let negSeconds = 0;
const neg = {v4: 0, cem1: 0, cem1Lifts: 0, cem1Records: 0, clips: 0};
for (const c of clips) {
  const v4 = run(c, 'v4');
  const cem = run(c, 'cem1');
  if (positive(c)) {
    const k = c.category;
    rows[k] ??= {n: 0, v4: 0, cem1: 0, lifted: 0, recordedOnly: 0};
    rows[k].n++;
    if (v4.prompts) rows[k].v4++;
    if (cem.prompts) rows[k].cem1++;
    if (!v4.prompts && cem.prompts) rows[k].lifted++;
    if (!cem.prompts && cem.records) rows[k].recordedOnly++;
  } else {
    neg.clips++;
    negSeconds += c.seconds;
    neg.v4 += v4.prompts;
    neg.cem1 += cem.prompts;
    neg.cem1Lifts += cem.lifts;
    neg.cem1Records += cem.records;
  }
}

const pct = (a, n) => (n ? `${((100 * a) / n).toFixed(1)}%` : 'n/a');
const hours = negSeconds / 3600;
const perHour = x => (hours ? (x / hours).toFixed(1) : 'n/a');
console.log(`clips: ${clips.length}${folds ? ` (folds ${folds.join(',')})` : ''}`);
console.log('\nCatch rate (a check-in opens), per class:');
console.log('class                 n    V4        CEM-1     lifted  record-only');
for (const [k, r] of Object.entries(rows).sort()) {
  console.log(
    `${k.padEnd(20)} ${String(r.n).padStart(4)}  ${pct(r.v4, r.n).padEnd(8)}  ${pct(r.cem1, r.n).padEnd(8)}  ${String(r.lifted).padStart(6)}  ${String(r.recordedOnly).padStart(6)}`,
  );
}
if (neg.clips) {
  console.log(`\nNegatives: ${neg.clips} clips, ${hours.toFixed(2)} h of audio (dense isolated events: a stress proxy, not a field rate)`);
  console.log(`  prompts/hour  V4 ${perHour(neg.v4)}   CEM-1 ${perHour(neg.cem1)} (of which lifts ${perHour(neg.cem1Lifts)})`);
  console.log(`  record-only evidence/hour under CEM-1: ${perHour(neg.cem1Records)}`);
}
const json = arg('--json');
if (json) writeFileSync(json, JSON.stringify({clips: clips.length, folds: folds ?? null, positives: rows, negatives: {...neg, hours}}, null, 2));
