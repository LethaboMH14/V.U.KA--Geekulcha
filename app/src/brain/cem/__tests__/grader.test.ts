/**
 * The graded prompt rule on the real engine stream. Each test drives windows
 * through step() → tracker → grader, as the phone does.
 */
import {RULESET_V1 as R, initialState, step, type AudioWindow, type EngineState} from '../../detect';
import {createGrader, type GradeAction, type PromptRule} from '../grader';
import {createTracker} from '../tracker';
import {win} from '../__fixtures__/win';

function rig(opts: {rule?: PromptRule; sim?: boolean} = {}) {
  const tracker = createTracker(R);
  const grader = createGrader({tracker, rule: opts.rule ?? 'cem1', subjectIsSim: opts.sim ?? true});
  let state: EngineState = initialState();
  const actions: GradeAction[] = [];
  return {
    grader,
    tracker,
    feed(windows: AudioWindow[]) {
      for (const w of windows) {
        const out = step(state, {type: 'audio', window: w}, R);
        state = out.state;
        if (!out.decision) continue;
        tracker.observe(out.decision, w);
        const acts = grader.window(out.decision, w.endMs, []);
        actions.push(...acts);
        if (acts.some(a => a.type === 'prompt')) state = step(state, {type: 'checkin', open: true}, R).state;
      }
      return actions;
    },
    close() {
      grader.checkinClosed();
      state = step(state, {type: 'checkin', open: false}, R).state;
    },
    summary: () => actions.map(a => (a.type === 'prompt' ? `prompt${a.lifted ? '(lift)' : ''}:${a.decision.candidate?.class_label}` : `${a.type}:${a.decision.candidate?.class_label}`)),
  };
}

/** Quiet windows every 500 ms from `fromMs` for `n` windows. */
const quiet = (seq0: number, fromMs: number, n: number) => Array.from({length: n}, (_, i) => win(seq0 + i, null, 0, fromMs + i * 500));
const shoutRec = R.recordThresholdBp.Shout + 100;

describe('graded prompt rule (cem1)', () => {
  it('a lone record-level shout is record-only (P = 4 < 5)', () => {
    const r = rig();
    r.feed([win(1, 'Shout', shoutRec, 500), win(2, 'Shout', shoutRec, 1000), win(3, 'Shout', shoutRec, 1500), ...quiet(4, 2000, 4)]);
    expect(r.summary()).toEqual(['record:Shout']);
  });

  it('a V4 shout still prompts, exactly as V4', () => {
    const s = R.thresholdBp.Shout + 100;
    const r = rig();
    r.feed([win(1, 'Shout', s, 500), win(2, 'Shout', s, 1000), win(3, 'Shout', s, 1500)]);
    expect(r.summary()).toEqual(['prompt:Shout']);
  });

  it('glass, then a record-level shout 40 s later: lifted (P = 5·2^(−40/120) + 4 = 8 ≥ 5)', () => {
    const r = rig();
    r.feed([win(1, 'Shatter', 9000, 1000)]);
    r.close();
    r.feed([...quiet(2, 1500, 3), win(10, 'Shout', shoutRec, 40_000), win(11, 'Shout', shoutRec, 40_500), win(12, 'Shout', shoutRec, 41_000), ...quiet(13, 41_500, 4)]);
    expect(r.summary()).toEqual(['prompt:Shatter', 'prompt(lift):Shout']);
  });

  it('a record-level shout beside continuous TV is not lifted (K ≥ 50, P < 12)', () => {
    const tv = {Television: 6000};
    const r = rig();
    r.feed([win(1, 'Shatter', 9000, 1000)]);
    r.close();
    const ws: AudioWindow[] = [];
    for (let i = 0; i < 12; i++) ws.push(win(20 + i, i >= 2 && i <= 4 ? 'Shout' : null, i >= 2 && i <= 4 ? shoutRec : 0, 40_000 + i * 500, tv));
    r.feed(ws);
    expect(r.summary()).toEqual(['prompt:Shatter', 'record:Shout']);
  });

  it('TV that starts in the NEXT window (within 1 s) still stops the lift', () => {
    const r = rig();
    r.feed([win(1, 'Shatter', 9000, 1000)]);
    r.close();
    r.feed([
      win(20, 'Shout', shoutRec, 40_000),
      win(21, 'Shout', shoutRec, 40_500),
      win(22, 'Shout', shoutRec, 41_000),
      win(23, null, 0, 41_500, {Television: 6000}),
      ...quiet(24, 42_000, 3),
    ]);
    expect(r.summary()).toEqual(['prompt:Shatter', 'record:Shout']);
  });

  it('a V4 scream beside TV still prompts (K never suppresses V4)', () => {
    const s = R.thresholdBp.Screaming + 100;
    const tv = {Television: 9000};
    const r = rig();
    r.feed([win(1, 'Screaming', s, 500, tv), win(2, 'Screaming', s, 1000, tv), win(3, 'Screaming', s, 1500, tv)]);
    expect(r.summary()).toEqual(['prompt:Screaming']);
  });

  it('never lifts for a non-simulation subject, or under rule v4', () => {
    for (const r of [rig({sim: false}), rig({rule: 'v4'})]) {
      r.feed([win(1, 'Shatter', 9000, 1000)]);
      r.close();
      r.feed([win(10, 'Shout', shoutRec, 40_000), win(11, 'Shout', shoutRec, 40_500), win(12, 'Shout', shoutRec, 41_000), ...quiet(13, 41_500, 4)]);
      expect(r.summary()).toEqual(['prompt:Shatter', 'record:Shout']);
    }
  });

  it('one prompt slot: a pending lift and a V4 hit in the next window open one check-in', () => {
    const r = rig();
    r.feed([win(1, 'Shatter', 9000, 1000)]);
    r.close();
    // Shout confirms at record level at 41 000, then a V4 glass 500 ms later.
    r.feed([win(10, 'Shout', shoutRec, 40_000), win(11, 'Shout', shoutRec, 40_500), win(12, 'Shout', shoutRec, 41_000), win(13, 'Shatter', 9000, 41_500), ...quiet(14, 42_000, 4)]);
    const prompts = r.summary().filter(x => x.startsWith('prompt'));
    expect(prompts).toEqual(['prompt:Shatter', 'prompt:Shatter']);
    expect(r.summary()).toContain('record:Shout');
    expect(r.grader.slotReserved).toBe(true);
  });

  it('a lift never silences a later V4 detection (its own cooldown)', () => {
    const r = rig();
    r.feed([win(1, 'Shatter', 9000, 1000)]);
    r.close();
    r.feed([win(10, 'Shout', shoutRec, 40_000), win(11, 'Shout', shoutRec, 40_500), win(12, 'Shout', shoutRec, 41_000), ...quiet(13, 41_500, 4)]);
    r.close(); // the lifted check-in was answered
    const s = R.thresholdBp.Screaming + 100;
    r.feed([win(30, 'Screaming', s, 46_000), win(31, 'Screaming', s, 46_500), win(32, 'Screaming', s, 47_000)]);
    expect(r.summary()).toEqual(['prompt:Shatter', 'prompt(lift):Shout', 'prompt:Screaming']);
  });

  it('no lift within 30 s of any prompt', () => {
    const r = rig();
    r.feed([win(1, 'Shatter', 9000, 1000)]);
    r.close();
    r.feed([win(10, 'Shout', shoutRec, 10_000), win(11, 'Shout', shoutRec, 10_500), win(12, 'Shout', shoutRec, 11_000), ...quiet(13, 11_500, 4)]);
    expect(r.summary()).toEqual(['prompt:Shatter', 'record:Shout']);
  });

  it('stopping settles a pending candidate as record-only', () => {
    const r = rig();
    r.feed([win(1, 'Shatter', 9000, 1000)]);
    r.close();
    r.feed([win(10, 'Shout', shoutRec, 40_000), win(11, 'Shout', shoutRec, 40_500), win(12, 'Shout', shoutRec, 41_000)]);
    const settled = r.grader.stop();
    expect(settled.map(a => a.type)).toEqual(['record']);
    expect(r.grader.stop()).toEqual([]);
  });
});
