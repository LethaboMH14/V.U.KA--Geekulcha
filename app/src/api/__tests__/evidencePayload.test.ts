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
