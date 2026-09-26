import {checkPayload} from '../payloads';
import {RULESET_DIGEST} from '../../brain/cem/ruleset';

const ok = {
  kind: 'evidence_observed',
  pv: 1,
  journey_id: '6c1f7e0e-2f4b-4a55-9b1a-0d1c2e3f4a5b',
  cem_version: 'CEM-1',
  ruleset_digest: RULESET_DIGEST,
  decision: 'record',
  tally_db: 9,
  band: 'some',
  k_pct: 0,
  reasons: [
    {name: 'glass_or_breaking', db: 5},
    {name: 'impact', db: 4},
  ],
};

describe('evidence_observed payload check', () => {
  it('accepts the built shape', () => expect(() => checkPayload(ok)).not.toThrow());
  it('refuses a probability riding along', () => expect(() => checkPayload({...ok, confidence: 0.93})).toThrow(/not allowed/));
  it('refuses a float weight or an extra reason field', () => {
    expect(() => checkPayload({...ok, reasons: [{name: 'impact', db: 4.5}]})).toThrow(/reasons/);
    expect(() => checkPayload({...ok, reasons: [{name: 'impact', db: 4, score: 1}]})).toThrow(/reasons/);
  });
  it('refuses more than eight reasons and an unknown band', () => {
    expect(() => checkPayload({...ok, reasons: Array.from({length: 9}, () => ({name: 'impact', db: 1}))})).toThrow(/reasons/);
    expect(() => checkPayload({...ok, band: 'likely'})).toThrow(/band/);
  });
});

describe('evidence_observed pv2: one shape per decision', () => {
  const SIG = '6c1f7e0e-2f4b-4a55-9b1a-0d1c2e3f4a5b';
  const cand = {class_label: 'Shout', class_index: 6, score_bp: 3100, threshold_bp: 3000, level: 'record'};
  const record = {...ok, pv: 2, decision: 'record', context: 'on', observations: [], candidate: cand, signal_event_id: null};
  const prompt = {...record, decision: 'prompt', candidate: {...cand, level: 'prompt'}, signal_event_id: SIG};
  const pin = {
    kind: 'evidence_observed', pv: 2, journey_id: ok.journey_id, cem_version: 'CEM-1', ruleset_digest: RULESET_DIGEST,
    decision: 'pin', checkin_id: SIG, reasons: [{name: 'pin_retry', db: 2}, {name: 'pin_slow', db: 0}],
  };

  it('accepts each decision in its own shape', () => {
    for (const p of [record, prompt, pin]) expect(() => checkPayload(p)).not.toThrow();
  });
  it('a record never names a signal; a prompt always does', () => {
    expect(() => checkPayload({...record, signal_event_id: SIG})).toThrow(/signal_event_id/);
    expect(() => checkPayload({...prompt, signal_event_id: null})).toThrow(/signal_event_id/);
  });
  it('PIN evidence carries no tally, and exactly the two PIN reasons in order', () => {
    expect(() => checkPayload({...pin, tally_db: 2})).toThrow(/not allowed/);
    expect(() => checkPayload({...pin, reasons: [{name: 'pin_slow', db: 0}, {name: 'pin_retry', db: 2}]})).toThrow(/reasons/);
    expect(() => checkPayload({...pin, reasons: [{name: 'pin_retry', db: 1}, {name: 'pin_slow', db: 0}]})).toThrow(/reasons/);
  });
  it('only known weight-0 observations', () => {
    expect(() => checkPayload({...record, observations: ['snatch_liu']})).not.toThrow();
    expect(() => checkPayload({...record, observations: ['heart_rate']})).toThrow(/observations/);
  });
  it('an unknown decision is refused', () => {
    expect(() => checkPayload({...record, decision: 'maybe'})).toThrow(/decision/);
  });
});
