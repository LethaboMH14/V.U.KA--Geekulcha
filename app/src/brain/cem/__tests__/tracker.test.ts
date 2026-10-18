/**
 * The tracker on the real engine stream: windows go through step(), every
 * decision goes to the tracker, exactly as the phone does it.
 */
import {RULESET_V1 as R, initialState, step, type AudioWindow, type EngineState} from '../../detect';
import {buildEvidence, buildPinEvidence, candidateOf, createTracker} from '../tracker';
import {RULESET_DIGEST} from '../ruleset';
import {win} from '../__fixtures__/win';
import {canonicalJson} from '../../../../../shared/canonical.js';

function feed(windows: AudioWindow[]) {
  const tracker = createTracker(R);
  let state: EngineState = initialState();
  let lastEnd = 0;
  const records = [];
  for (const w of windows) {
    const out = step(state, {type: 'audio', window: w}, R);
    state = out.state;
    lastEnd = w.endMs;
    if (out.decision) {
      tracker.observe(out.decision, w);
      if (out.decision.record) records.push(out.decision);
    }
  }
  return {tracker, records, lastEnd};
}

describe('CEM-1 tracker on the engine stream', () => {
  it('one confirmed glass window: glass_or_breaking, 5 db, "some"', () => {
    const {tracker, lastEnd} = feed([win(1, 'Shatter', 9000)]);
    const a = tracker.assess(lastEnd);
    expect(a.reasons.map(r => [r.reason, r.db])).toEqual([['glass_or_breaking', 5]]);
    expect(a.band).toBe('some');
  });

  it('a lone shout is faint (4 db)', () => {
    const s = R.thresholdBp.Shout + 500;
    const {tracker, lastEnd} = feed([1, 2, 3].map(n => win(n, 'Shout', s)));
    expect(tracker.assess(lastEnd)).toMatchObject({total: 4, band: 'faint'});
  });

  it('record-level confirmations count too (a shout below the prompt threshold)', () => {
    const s = R.recordThresholdBp.Shout + 100;
    const {tracker, lastEnd} = feed([1, 2, 3].map(n => win(n, 'Shout', s)));
    expect(tracker.assess(lastEnd).total).toBe(4);
  });

  it('three confirmed scream windows in 10 s are sustained (12), not three singles', () => {
    const s = R.thresholdBp.Screaming + 500;
    const {tracker, lastEnd, records} = feed([1, 2, 3, 4, 5].map(n => win(n, 'Screaming', s)));
    expect(records).toHaveLength(1);
    const a = tracker.assess(lastEnd);
    expect(a.reasons.map(r => r.reason)).toEqual(['scream_sustained']);
    expect(a.total).toBe(12);
  });

  it('a shout, then glass 20 s later: two episodes that add up', () => {
    const s = R.thresholdBp.Shout + 500;
    const {tracker, lastEnd} = feed([win(1, 'Shout', s), win(2, 'Shout', s), win(3, 'Shout', s), win(50, 'Shatter', 9000, 21_000)]);
    expect(tracker.assess(lastEnd).total).toBe(9);
  });

  it('evidence decays with the 120 s half-life', () => {
    const {tracker, lastEnd} = feed([win(1, 'Shatter', 9000)]);
    expect(tracker.assess(lastEnd + 120_000).total).toBe(3);
  });
});

describe('context is paired with each trigger', () => {
  it('continuous TV beside a later shout: media_context counts (−6), K high', () => {
    const s = R.recordThresholdBp.Shout + 100;
    const tv = {Television: 6000};
    const windows: AudioWindow[] = [];
    for (let n = 1; n <= 40; n++) windows.push(win(n, n >= 30 && n <= 32 ? 'Shout' : null, n >= 30 && n <= 32 ? s : 0, n * 500, tv));
    const {tracker, lastEnd} = feed(windows);
    const a = tracker.assess(lastEnd);
    expect(a.reasons.map(r => r.reason).sort()).toEqual(['media_context', 'shout_or_yell']);
    expect(a).toMatchObject({pos: 4, neg: 6, k_pct: 67});
  });

  it('TV 1.5 s away from the trigger does not count (CEM-0: ±1 s)', () => {
    const {tracker} = feed([win(1, 'Shatter', 9000, 10_000), win(2, null, 0, 11_500, {Television: 6000})]);
    expect(tracker.assess(11_500).neg).toBe(0);
  });

  it('context in the NEXT window within 1 s counts', () => {
    const {tracker} = feed([win(1, 'Shatter', 9000, 10_000), win(2, null, 0, 10_900, {Music: 6000})]);
    expect(tracker.assess(10_000).neg).toBe(6);
  });

  it('context on its own scores nothing', () => {
    const {tracker, lastEnd} = feed([win(1, null, 0, 1000, {Television: 9000, Crowd: 9000})]);
    expect(tracker.assess(lastEnd)).toMatchObject({pos: 0, neg: 0, total: 0});
  });

  it('a context score below the context threshold is ignored', () => {
    const {tracker} = feed([win(1, 'Shatter', 9000, 10_000, {Television: R.contextThresholdBp - 1})]);
    expect(tracker.assess(10_000).neg).toBe(0);
  });
});

describe('PIN reasons', () => {
  it('count only once observed, and decay', () => {
    const t = createTracker(R);
    expect(t.assess(5_000).pos).toBe(0);
    t.observePin({retry: true, slow: true}, 5_000);
    expect(t.assess(5_000)).toMatchObject({pos: 4, total: 4});
    expect(t.assess(125_000).pos).toBe(2); // each 2 × 2^-1 = 1
  });

  it('pin evidence has one fixed shape and length for every answer', () => {
    const lens = [false, true].flatMap(retry =>
      [false, true].map(
        slow => canonicalJson(buildPinEvidence({journeyId: 'j'.repeat(36), rulesetDigest: RULESET_DIGEST, checkinId: 'c'.repeat(36), retry, slow})).length,
      ),
    );
    expect(new Set(lens).size).toBe(1);
    expect(Object.keys(buildPinEvidence({journeyId: 'j', rulesetDigest: RULESET_DIGEST, checkinId: 'c', retry: false, slow: false})).sort()).toEqual(
      ['checkin_id', 'cem_version', 'decision', 'journey_id', 'kind', 'pv', 'reasons', 'ruleset_digest'].sort(),
    );
  });
});

describe('evidence_observed pv2', () => {
  it('builds integers, names and a band, never a probability', () => {
    const {tracker, lastEnd, records} = feed([win(1, 'Shatter', 9000)]);
    const e = buildEvidence({
      journeyId: 'j1',
      rulesetDigest: RULESET_DIGEST,
      decision: 'prompt',
      assessment: tracker.assess(lastEnd),
      candidate: candidateOf(records[0].candidate!, 'prompt'),
      context: 'on',
      observations: ['snatch_liu'],
      signalEventId: '6c1f7e0e-2f4b-4a55-9b1a-0d1c2e3f4a5b',
    });
    expect(e).toEqual({
      kind: 'evidence_observed',
      pv: 2,
      journey_id: 'j1',
      cem_version: 'CEM-1',
      ruleset_digest: RULESET_DIGEST,
      decision: 'prompt',
      tally_db: 5,
      band: 'some',
      k_pct: 0,
      context: 'on',
      reasons: [{name: 'glass_or_breaking', db: 5}],
      observations: ['snatch_liu'],
      candidate: {class_label: 'Shatter', class_index: 437, score_bp: 9000, threshold_bp: R.thresholdBp.Shatter, level: 'prompt'},
      signal_event_id: '6c1f7e0e-2f4b-4a55-9b1a-0d1c2e3f4a5b',
    });
  });
});
