/**
 * The detection engine's referee. Every rule has a fixture: a window that
 * should fire, one that shouldn't, and the reason it gives either way.
 */
import {
  GUN_NEIGHBOURS,
  RULESET_V1 as R,
  TARGETS,
  buildSignalDetected,
  checkLabels,
  corroborate,
  initialState,
  integersOnly,
  step,
  type AudioWindow,
  type EngineState,
  type Input,
  type MotionFrame,
} from '..';
// The one JS canonicaliser the app and the verify page share (spec §5).
import {canonicalJson} from '../../../../../shared/canonical.js';

const idx = (label: string) => TARGETS.findIndex(t => t.label === label);

/** A window with one target class at `bp` and the rest at 0. */
function win(seq: number, label: string | null, bp: number, endMs = seq * 488): AudioWindow {
  const targetBp = TARGETS.map(() => 0);
  if (label) targetBp[idx(label)] = bp;
  return {seq, endMs, targetBp, topIndex: label ? TARGETS[idx(label)].index : 494, topBp: bp, gunNeighbourBp: 0};
}

function run(inputs: Input[], state: EngineState = initialState()) {
  const decisions = [];
  for (const i of inputs) {
    const out = step(state, i, R);
    state = out.state;
    if (out.decision) decisions.push(out.decision);
  }
  return {state, decisions};
}

const audio = (w: AudioWindow): Input => ({type: 'audio', window: w});
const SHA = '10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de';

describe('class table', () => {
  it('matches the model label list, and fails closed on a moved label', () => {
    const labels = Array.from({length: 521}, (_, i) => `c${i}`);
    for (const t of [...TARGETS, ...GUN_NEIGHBOURS]) labels[t.index] = t.label;
    expect(checkLabels(labels)).toEqual([]);
    const moved = [...labels];
    moved[427] = 'Gunshot, gunfire';
    moved[421] = 'Firecracker';
    expect(checkLabels(moved)).toContain('label "Gunshot, gunfire" is at 427, expected 421');
    expect(checkLabels(labels.slice(0, 520)).length).toBeGreaterThan(0);
  });

  it('is sorted by index, so ties go to the lowest index', () => {
    const idxs = TARGETS.map(t => t.index);
    expect(idxs).toEqual([...idxs].sort((a, b) => a - b));
  });

  it('has a threshold for every class', () => {
    for (const t of TARGETS) expect(Number.isSafeInteger(R.thresholdBp[t.label])).toBe(true);
    expect(R.calibrated).toBe(false);
  });
});

describe('impulses (glass, gun-like) confirm in one window', () => {
  it('records and prompts on one glass window at or above threshold, with its reasons', () => {
    const {decisions} = run([audio(win(1, 'Shatter', R.thresholdBp.Shatter))]);
    const d = decisions[0];
    expect(d.record).toBe(true);
    expect(d.prompt).toBe(true);
    expect(d.candidate).toMatchObject({class_label: 'Shatter', class_index: 437, score_bp: R.thresholdBp.Shatter});
    expect(d.reasons.map(r => r.rule)).toEqual(['top', 'threshold', 'winner', 'confirm', 'motion']);
  });

  it('does not record one basis point below threshold, and names the closest miss', () => {
    const t = R.thresholdBp['Gunshot, gunfire'];
    const {decisions} = run([audio(win(1, 'Gunshot, gunfire', t - 1))]);
    expect(decisions[0].record).toBe(false);
    expect(decisions[0].reasons.at(-1)).toEqual({rule: 'threshold', class_label: 'Gunshot, gunfire', score_bp: t - 1, threshold_bp: t, pass: false});
  });
});

describe('gun-like sounds must beat their excluded neighbours', () => {
  it('does not record when Explosion or Cap gun outscores the gunshot (fireworks, cans)', () => {
    const w = {...win(1, 'Gunshot, gunfire', 8516), gunNeighbourBp: 9180};
    const {decisions} = run([audio(w)]);
    expect(decisions[0].record).toBe(false);
    expect(decisions[0].reasons).toContainEqual({rule: 'gun_neighbour', class_label: 'Gunshot, gunfire', score_bp: 8516, neighbour_bp: 9180, pass: false});
  });

  it('states the threshold comparison truthfully when the neighbour rule is what excluded it', () => {
    const w = {...win(1, 'Gunshot, gunfire', 4141), gunNeighbourBp: 6680};
    const d = run([audio(w)]).decisions[0];
    expect(d.record).toBe(false);
    expect(d.reasons).toContainEqual({rule: 'threshold', class_label: 'Gunshot, gunfire', score_bp: 4141, threshold_bp: R.thresholdBp['Gunshot, gunfire'], pass: true});
  });

  it('records when the gunshot is the stronger of the two', () => {
    const w = {...win(1, 'Gunshot, gunfire', 8516), gunNeighbourBp: 4000};
    expect(run([audio(w)]).decisions[0].record).toBe(true);
  });

  it('applies only to gun-like classes', () => {
    const w = {...win(1, 'Glass', 8000), gunNeighbourBp: 9900};
    expect(run([audio(w)]).decisions[0].record).toBe(true);
  });
});

describe('voices need two windows that share no audio', () => {
  const s = R.thresholdBp.Screaming;
  it('does not record a single scream window', () => {
    const {decisions} = run([audio(win(1, 'Screaming', 9000))]);
    expect(decisions[0].record).toBe(false);
    expect(decisions[0].reasons).toContainEqual({rule: 'confirm', family: 'voice', window_seqs: [-1, 1], separation: 2, pass: false});
  });

  it('does not let one brief sound confirm itself in two overlapping windows', () => {
    // A 0.5 s shout lands in two adjacent (overlapping) windows at most.
    const {decisions} = run([audio(win(1, 'Screaming', s + 500)), audio(win(2, 'Screaming', s + 500)), audio(win(3, null, 0))]);
    expect(decisions.map(d => d.record)).toEqual([false, false, false]);
  });

  it('records when the voice is still there two windows later, across voice classes', () => {
    const {decisions} = run([audio(win(1, 'Shout', 7000)), audio(win(2, null, 0)), audio(win(3, 'Screaming', s))]);
    expect(decisions.map(d => d.record)).toEqual([false, false, true]);
    expect(decisions[2].candidate?.class_label).toBe('Screaming');
  });

  it('treats a missing (unclassified) window as a miss, not a pass', () => {
    const {decisions} = run([audio(win(1, 'Yell', 7000)), audio(win(4, 'Yell', 7000))]);
    expect(decisions.map(d => d.record)).toEqual([false, false]);
  });
});

describe('one class per window, without masking', () => {
  it('a loud class below its own bar does not hide a quieter one that clears its bar', () => {
    const w = win(1, 'Shout', R.thresholdBp.Shout - 1);
    (w.targetBp as number[])[idx('Glass')] = R.thresholdBp.Glass;
    const d = run([audio(w)]).decisions[0];
    expect(d.record).toBe(true);
    expect(d.candidate?.class_label).toBe('Glass');
  });

  it('takes the highest qualifying score', () => {
    const w = win(1, 'Glass', 3600);
    (w.targetBp as number[])[idx('Shatter')] = 9000;
    expect(run([audio(w)]).decisions[0].candidate?.class_label).toBe('Shatter');
  });

  it('breaks a tie towards the lowest YAMNet index', () => {
    const w = win(1, 'Glass', 5000);
    (w.targetBp as number[])[idx('Gunshot, gunfire')] = 5000;
    expect(run([audio(w)]).decisions[0].candidate?.class_index).toBe(421);
  });
});

describe('recording is evidence; prompting is rate-limited', () => {
  const t = 5000;
  it('records a new event after the record gap but does not prompt again inside the cooldown', () => {
    const {decisions} = run([
      audio(win(1, 'Glass', t, 1000)),
      audio(win(2, 'Glass', t, 1000 + R.recordGapMs - 1)),
      audio(win(3, 'Glass', t, 1000 + R.recordGapMs)),
      audio(win(4, 'Glass', t, 1000 + R.cooldownMs)),
    ]);
    expect(decisions.map(d => [d.record, d.prompt])).toEqual([
      [true, true],
      [false, false],
      [true, false],
      [true, true],
    ]);
    expect(decisions[2].reasons).toContainEqual({rule: 'cooldown', since_ms: R.recordGapMs, cooldown_ms: R.cooldownMs, prompt: false});
  });

  it('records but never prompts while a check-in is open', () => {
    const {decisions} = run([{type: 'checkin', open: true}, audio(win(1, 'Glass', 9000))]);
    expect(decisions[0].record).toBe(true);
    expect(decisions[0].prompt).toBe(false);
    expect(decisions[0].reasons).toContainEqual({rule: 'checkin_open', prompt: false});
  });

  it('keeps different families apart for duplicates', () => {
    const {decisions} = run([audio(win(1, 'Glass', t, 1000)), audio(win(2, 'Gunshot, gunfire', t, 1500))]);
    expect(decisions.map(d => d.record)).toEqual([true, true]);
  });
});

describe('input validation', () => {
  it('rejects a float score rather than guessing', () => {
    const w = win(1, 'Glass', 5000);
    (w.targetBp as number[])[0] = 12.5;
    expect(() => step(initialState(), audio(w), R)).toThrow(/integer/);
  });
});

describe('determinism', () => {
  it('gives identical decisions for identical inputs', () => {
    const inputs: Input[] = [audio(win(1, 'Shout', 7000)), audio(win(2, 'Yell', 6500)), audio(win(3, 'Glass', 3600))];
    expect(JSON.stringify(run(inputs).decisions)).toBe(JSON.stringify(run(inputs).decisions));
  });
});

// ---------------------------------------------------------------- motion ---

/** Frames every 200 ms ending at `endMs`, all with the same shape. */
function frames(count: number, endMs: number, f: Omit<MotionFrame, 'endMs'>): MotionFrame[] {
  return Array.from({length: count}, (_, i) => ({...f, endMs: endMs - (count - 1 - i) * 200}));
}
const still = {peakMg: 1010, stdMg: 10, crossings: 0};
const walk = {peakMg: 1300, stdMg: 250, crossings: 2};
const car = {peakMg: 1200, stdMg: 90, crossings: 6};

describe('motion corroboration', () => {
  it('records an impact after walking, with a look-back offset', () => {
    const f = [...frames(12, 5000, walk), {endMs: 5200, peakMg: 4200, stdMg: 900, crossings: 3}];
    const c = corroborate(f, 6000, R);
    expect(c).toEqual([{sense: 'motion', pattern: 'impact', peak_mg: 4200, duration_ms: 200, offset_ms: -800, rule_version: 'motion-rules.v1'}]);
  });

  it('records nothing in a vehicle, however hard the bump', () => {
    const f = [...frames(12, 5000, car), {endMs: 5200, peakMg: 6000, stdMg: 900, crossings: 3}];
    expect(corroborate(f, 6000, R)).toEqual([]);
  });

  it('records a snatch after two seconds still', () => {
    const f = [...frames(12, 5000, still), {endMs: 5200, peakMg: 2200, stdMg: 400, crossings: 2}];
    expect(corroborate(f, 5400, R).map(c => c.pattern)).toEqual(['snatch']);
  });

  it('counts one shake as one item', () => {
    const shake = {peakMg: 2500, stdMg: 700, crossings: 5};
    const f = [...frames(12, 5000, still), ...frames(5, 6000, shake)];
    const c = corroborate(f, 6200, R);
    expect(c.filter(x => x.pattern === 'shake')).toHaveLength(1);
  });

  it('ignores anything older than ten seconds', () => {
    const f = [...frames(12, 5000, walk), {endMs: 5200, peakMg: 4200, stdMg: 900, crossings: 3}];
    expect(corroborate(f, 5200 + R.motionLookbackMs, R)).toEqual([]);
  });

  it('never opens a check-in on its own', () => {
    let s = initialState();
    for (const fr of [...frames(12, 5000, walk), {endMs: 5200, peakMg: 9000, stdMg: 2000, crossings: 5}]) {
      const out = step(s, {type: 'motion', frame: fr}, R);
      expect(out.decision).toBeNull();
      s = out.state;
    }
  });

  it('is attached to a sound detection', () => {
    let s = initialState();
    for (const fr of [...frames(12, 5000, walk), {endMs: 5200, peakMg: 4200, stdMg: 900, crossings: 3}]) {
      s = step(s, {type: 'motion', frame: fr}, R).state;
    }
    const d = step(s, audio(win(1, 'Glass', 5000, 6000)), R).decision;
    expect(d?.record).toBe(true);
    expect(d?.corroboration.map(c => c.pattern)).toEqual(['impact']);
  });
});

// --------------------------------------------------------------- payload ---

describe('signal_detected pv1', () => {
  const fired = () => run([audio(win(1, 'Shatter', 5234, 1000))]).decisions[0];

  it('has exactly the spec fields, integers only, and canonicalises', () => {
    const d = fired();
    const p = buildSignalDetected({journeyId: 'jny_1', candidate: d.candidate!, corroboration: d.corroboration, modelSha256: SHA, appVersion: '0.0.6'});
    expect(Object.keys(p).sort()).toEqual(
      ['app_version', 'class_index', 'class_label', 'corroboration', 'journey_id', 'kind', 'model_sha256', 'pv', 'score_bp', 'sense', 'threshold_bp', 'window_ms'].sort(),
    );
    expect(p).toMatchObject({kind: 'signal_detected', pv: 1, sense: 'sound', class_label: 'Shatter', class_index: 437, score_bp: 5234, window_ms: 975});
    expect(integersOnly(p)).toBe(true);
    expect(() => canonicalJson(p)).not.toThrow();
  });

  it('carries location only when given, as integers', () => {
    const d = fired();
    const p = buildSignalDetected({
      journeyId: 'jny_1', candidate: d.candidate!, corroboration: [], modelSha256: SHA, appVersion: '0.0.6',
      location: {lat_e7: -257479000, lon_e7: 281893000, acc_m: 12, fix_age_ms: 3400},
    });
    expect(p.location).toEqual({lat_e7: -257479000, lon_e7: 281893000, acc_m: 12, fix_age_ms: 3400});
    expect(() => canonicalJson(p)).not.toThrow();
  });

  it('refuses a mismatched class, a float, a bad hash or too many items', () => {
    const c = fired().candidate!;
    const base = {journeyId: 'j', corroboration: [], modelSha256: SHA, appVersion: '1.0.0'};
    expect(() => buildSignalDetected({...base, candidate: {...c, class_index: 427}})).toThrow(/does not match/);
    expect(() => buildSignalDetected({...base, candidate: {...c, score_bp: 50.5}})).toThrow(/integer/);
    expect(() => buildSignalDetected({...base, candidate: c, modelSha256: 'ABC'})).toThrow(/hex/);
    const item = {sense: 'motion' as const, pattern: 'impact' as const, peak_mg: 3000, duration_ms: 200, offset_ms: -100, rule_version: 'motion-rules.v1'};
    expect(() => buildSignalDetected({...base, candidate: c, corroboration: [item, item, item, item, item]})).toThrow(/at most 4/);
  });
});
