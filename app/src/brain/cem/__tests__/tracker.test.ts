/**
 * The tracker on the real engine stream: windows go through step(), every
 * decision goes to the tracker, exactly as the phone does it.
 */
import {RULESET_V1 as R, TARGETS, initialState, step, type AudioWindow, type EngineState, type Input} from '../../detect';
import {buildEvidenceObserved, createTracker} from '../tracker';
import {RULESET_DIGEST} from '../ruleset';

const idx = (label: string) => TARGETS.findIndex(t => t.label === label);
function win(seq: number, label: string | null, bp: number, endMs = seq * 488): AudioWindow {
  const targetBp = TARGETS.map(() => 0);
  if (label) targetBp[idx(label)] = bp;
  return {seq, endMs, targetBp, topIndex: label ? TARGETS[idx(label)].index : 494, topBp: bp, gunNeighbourBp: 0};
}

function feed(inputs: Input[]) {
  const tracker = createTracker();
  let state: EngineState = initialState();
  let lastEnd = 0;
  const records = [];
  for (const i of inputs) {
    const out = step(state, i, R);
    state = out.state;
    if (i.type === 'audio' && out.decision) {
      lastEnd = i.window.endMs;
      tracker.observe(out.decision, i.window.endMs);
      if (out.decision.record) records.push(out.decision);
    }
  }
  return {tracker, records, lastEnd};
}
const audio = (w: AudioWindow): Input => ({type: 'audio', window: w});

describe('CEM-1 tracker on the engine stream', () => {
  it('one confirmed glass window: glass_or_breaking, 5 db, "some"', () => {
    const {tracker, lastEnd} = feed([audio(win(1, 'Shatter', 9000))]);
    const a = tracker.assess(lastEnd);
    expect(a.reasons.map(r => [r.reason, r.db])).toEqual([['glass_or_breaking', 5]]);
    expect(a.band).toBe('some');
  });

  it('a lone shout is faint (4 db)', () => {
    const s = R.thresholdBp.Shout + 500;
    const {tracker, lastEnd} = feed([1, 2, 3].map(n => audio(win(n, 'Shout', s))));
    expect(tracker.assess(lastEnd)).toMatchObject({total: 4, band: 'faint'});
  });

  it('three confirmed scream windows in 10 s are sustained (12), not three singles', () => {
    const s = R.thresholdBp.Screaming + 500;
    const {tracker, lastEnd, records} = feed([1, 2, 3, 4, 5].map(n => audio(win(n, 'Screaming', s))));
    // The engine records once (duplicates are dropped); the tracker still counts every confirmation.
    expect(records).toHaveLength(1);
    const a = tracker.assess(lastEnd);
    expect(a.reasons.map(r => r.reason)).toEqual(['scream_sustained']);
    expect(a.total).toBe(12);
  });

  it('a shout, then glass 20 s later: two episodes that add up', () => {
    const s = R.thresholdBp.Shout + 500;
    const {tracker, lastEnd} = feed([
      audio(win(1, 'Shout', s)),
      audio(win(2, 'Shout', s)),
      audio(win(3, 'Shout', s)),
      audio(win(50, 'Shatter', 9000, 21_000)),
    ]);
    expect(tracker.assess(lastEnd).total).toBe(9);
  });

  it('evidence decays with the 120 s half-life', () => {
    const {tracker, lastEnd} = feed([audio(win(1, 'Shatter', 9000))]);
    expect(tracker.assess(lastEnd + 120_000).total).toBe(3); // 5 × 2^-1 = 2.5 → 3
  });

  it('builds an evidence_observed record: integers, names and a band, never a probability', () => {
    const {tracker, lastEnd} = feed([audio(win(1, 'Shatter', 9000))]);
    const e = buildEvidenceObserved({journeyId: 'j1', rulesetDigest: RULESET_DIGEST, decision: 'prompt', assessment: tracker.assess(lastEnd)});
    expect(e).toEqual({
      kind: 'evidence_observed',
      pv: 1,
      journey_id: 'j1',
      cem_version: 'CEM-1',
      ruleset_digest: RULESET_DIGEST,
      decision: 'prompt',
      tally_db: 5,
      band: 'some',
      k_pct: 0,
      reasons: [{name: 'glass_or_breaking', db: 5}],
    });
  });
});
