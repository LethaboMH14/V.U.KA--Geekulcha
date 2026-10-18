/**
 * The CEM-1 transition list (ADR-0047 review artefact).
 *
 * Every phone-observable CEM-0 catalogue scenario (golden.json) is turned
 * into real audio windows and motion frames and run through the engine,
 * tracker and grader twice: under V4 and under CEM-1. Each scenario is run
 * with its sounds at the V4 level (as the catalogue assumes) and again just
 * above the record threshold (quieter sounds V4 never records).
 *
 * Asserted: nothing that prompts under V4 stops prompting (no T1 → T0).
 * Listed: every change, which can only be a lift (T0 → T1) or new
 * record-only evidence. `WRITE_TRANSITIONS=1 npx jest transitions` writes
 * docs/eval/cem1-transitions.md.
 */
import {writeFileSync, mkdirSync} from 'fs';
import {join} from 'path';
import {CONTEXT, RULESET_V1 as R, TARGETS, initialState, step, type AudioWindow, type EngineState, type Input, type MotionFrame} from '../../detect';
import {createGrader, type GradeAction, type PromptRule} from '../grader';
import {createTracker} from '../tracker';
import {band} from '..';
import golden from './golden.json';

type Scenario = {id: string; signals: {reason: string; t: number}[]; eval_t: number};
type Level = 'v4' | 'record';

const BASE_MS = 20_000;
const CLASS: Record<string, {label: string; hits: number[]}> = {
  // Offsets (ms) of the windows that must hit, ending at the signal time.
  scream_single: {label: 'Screaming', hits: [-1000, -500, 0]},
  scream_sustained: {label: 'Screaming', hits: [-2000, -1500, -1000, -500, 0]},
  shout_or_yell: {label: 'Shout', hits: [-1000, -500, 0]},
  glass_or_breaking: {label: 'Shatter', hits: [0]},
  gun_like_single: {label: 'Gunshot, gunfire', hits: [0]},
  gun_like_repeated: {label: 'Gunshot, gunfire', hits: [-500, 0]},
};
const CONTEXT_LABEL: Record<string, string> = {
  distress_vocal: 'Crying, sobbing',
  media_context: 'Television',
  crowd_context: 'Crowd',
  children_playing: 'Children playing',
  laughter: 'Laughter',
  siren_nearby: 'Siren',
};
const MOTION = new Set(['impact', 'snatch', 'shake_sustained']);
/** Reasons with no phone sensor behind them in this build (no YAMNet class mapped). */
const NOT_ON_PHONE = new Set(['smash_crash', 'tyre_squeal_or_skid', 'car_alarm']);

function streams(s: Scenario, level: Level): Input[] {
  const endMs = BASE_MS + Math.max(s.eval_t, ...s.signals.map(x => x.t), 0) * 1000 + 3000;
  const snap = (ms: number) => Math.round(ms / 500) * 500;
  const target = new Map<number, {label: string; bp: number}>();
  const context = new Map<number, Record<string, number>>();
  const frames = new Map<number, Partial<MotionFrame>>();
  for (const sig of s.signals) {
    const at = BASE_MS + sig.t * 1000;
    const c = CLASS[sig.reason];
    if (c) {
      const bp = level === 'v4' ? Math.min(10000, R.thresholdBp[c.label] + 500) : R.recordThresholdBp[c.label] + 100;
      for (const off of c.hits) target.set(snap(at + off), {label: c.label, bp});
    } else if (CONTEXT_LABEL[sig.reason]) {
      const w = snap(at);
      context.set(w, {...(context.get(w) ?? {}), [CONTEXT_LABEL[sig.reason]]: 6000});
    } else if (MOTION.has(sig.reason)) {
      const f = Math.round(at / 200) * 200;
      if (sig.reason === 'impact') frames.set(f, {peakMg: 3500, stdMg: 40, crossings: 0});
      if (sig.reason === 'snatch') frames.set(f, {peakMg: 2000, stdMg: 40, crossings: 0});
      if (sig.reason === 'shake_sustained') for (const k of [f - 400, f - 200, f]) frames.set(k, {peakMg: 1500, stdMg: 600, crossings: 5});
    }
  }
  const inputs: {ms: number; input: Input}[] = [];
  for (let ms = 200; ms <= endMs; ms += 200) {
    const f = frames.get(ms) ?? {};
    inputs.push({ms, input: {type: 'motion', frame: {endMs: ms, peakMg: f.peakMg ?? 1000, stdMg: f.stdMg ?? 10, crossings: f.crossings ?? 0}}});
  }
  let seq = 0;
  for (let ms = 500; ms <= endMs; ms += 500) {
    const t = target.get(ms);
    const targetBp = TARGETS.map(x => (t && x.label === t.label ? t.bp : 0));
    const ctx = context.get(ms) ?? {};
    const w: AudioWindow = {
      seq: ++seq,
      endMs: ms,
      targetBp,
      topIndex: t ? TARGETS.find(x => x.label === t.label)!.index : 494,
      topBp: t?.bp ?? 0,
      gunNeighbourBp: 0,
      contextBp: CONTEXT.map(c => ctx[c.label] ?? 0),
    };
    inputs.push({ms: ms + 0.5, input: {type: 'audio', window: w}});
  }
  return inputs.sort((a, b) => a.ms - b.ms).map(x => x.input);
}

type Outcome = {tier: 'T1' | 'T0' | '—'; lifted: boolean; why: string};

function run(s: Scenario, level: Level, rule: PromptRule): Outcome {
  const tracker = createTracker(R);
  const grader = createGrader({tracker, rule, subjectIsSim: true});
  let state: EngineState = initialState();
  const acts: GradeAction[] = [];
  for (const input of streams(s, level)) {
    const out = step(state, input, R);
    state = out.state;
    if (input.type !== 'audio' || !out.decision) continue;
    tracker.observe(out.decision, input.window);
    acts.push(...grader.window(out.decision, input.window.endMs, []));
  }
  acts.push(...grader.stop());
  const prompt = acts.find(a => a.type === 'prompt');
  const last = prompt ?? acts[acts.length - 1];
  const why = last
    ? `${band(last.assessment.total)} · P ${last.assessment.pos} · K ${last.assessment.k_pct}% · ${last.assessment.reasons.map(r => `${r.reason} ${r.db > 0 ? '+' : ''}${r.db}`).join(', ')}`
    : '';
  // V4 baseline: V4 records nothing below its thresholds, so its T0 is V4-level records only.
  if (rule === 'v4') {
    const v4 = acts.filter(a => a.type !== 'record');
    return {tier: v4.some(a => a.type === 'prompt') ? 'T1' : v4.length ? 'T0' : '—', lifted: false, why};
  }
  return {tier: prompt ? 'T1' : acts.length ? 'T0' : '—', lifted: Boolean(prompt && prompt.type === 'prompt' && prompt.lifted), why};
}

const scenarios = (golden.scenarios as Scenario[]).filter(s => s.signals.every(x => !NOT_ON_PHONE.has(x.reason)));
const skipped = (golden.scenarios as Scenario[]).filter(s => s.signals.some(x => NOT_ON_PHONE.has(x.reason))).map(s => s.id);

describe('CEM-1 transition list', () => {
  const rows: string[] = [];
  let lifts = 0;
  let newRecords = 0;

  for (const s of scenarios) {
    for (const level of ['v4', 'record'] as Level[]) {
      it(`${s.id} (${level} level): nothing that prompts under V4 stops prompting`, () => {
        const before = run(s, level, 'v4');
        const after = run(s, level, 'cem1');
        if (before.tier === 'T1') expect(after.tier).toBe('T1');
        const change = before.tier === after.tier ? '' : `${before.tier} → ${after.tier}${after.lifted ? ' (lift)' : ''}`;
        if (after.lifted) lifts++;
        if (before.tier === '—' && after.tier === 'T0') newRecords++;
        rows.push(`| ${s.id} | ${level === 'v4' ? 'V4 level' : 'record level'} | ${before.tier} | ${after.tier} | ${change || 'same'} | ${after.why || 'nothing detected'} |`);
      });
    }
  }

  afterAll(() => {
    if (process.env.WRITE_TRANSITIONS !== '1') return;
    const out = join(__dirname, '..', '..', '..', '..', '..', 'docs', 'eval');
    mkdirSync(out, {recursive: true});
    writeFileSync(
      join(out, 'cem1-transitions.md'),
      [
        '# CEM-1 transition list (ADR-0047, PROPOSED)',
        '',
        'Generated by `app/src/brain/cem/__tests__/transitions.test.ts` (`WRITE_TRANSITIONS=1 npx jest transitions`). Do not edit by hand.',
        '',
        'Every phone-observable scenario from the CEM-0 catalogue (docs/COERCION-SCENARIOS.md, 32 in `golden.json`) is turned into audio windows and motion frames and run through the real engine, tracker and grader, once under V4 and once under CEM-1. Each runs with its sounds at the V4 level (as the catalogue assumes) and again just above the UNCALIBRATED record threshold (half the prompt threshold).',
        '',
        `**Result: no T1 → T0 transitions.** ${lifts} lift(s) T0 → T1 and ${newRecords} scenario-level(s) that V4 would not record at all now leave record-only evidence (T0). Tiers: T1 = a check-in opens; T0 = record only; — = nothing recorded.`,
        '',
        `Not run (no phone sensor for a reason in them in this build): ${skipped.join(', ')}.`,
        '',
        'Other properties are pinned by `grader.test.ts`: one prompt slot, V4 first, a lift never silences V4, record-level evidence waits 1 s for context, stop settles as record-only, non-simulation subjects never lift.',
        '',
        '| Scenario | Sounds at | V4 | CEM-1 | Change | CEM-1 evidence at the decision |',
        '|---|---|---|---|---|---|',
        ...rows,
        '',
      ].join('\n'),
    );
  });
});
