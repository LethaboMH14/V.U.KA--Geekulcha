import {assess, band, decay, inWords, type ReasonName} from '..';
import golden from './golden.json';

describe('CEM-1 reproduces the CEM-0 catalogue exactly (golden oracle)', () => {
  const cases = golden.scenarios as {id: string; signals: {reason: string; t: number}[]; eval_t: number; pos: number; neg: number; total: number; k_pct: number; band: string}[];
  it('has the phone-observable scenarios', () => {
    expect(cases.length).toBeGreaterThanOrEqual(30);
  });
  for (const c of cases) {
    it(`${c.id}: total ${c.total}, K ${c.k_pct}%, ${c.band}`, () => {
      const a = assess(c.signals.map(s => ({reason: s.reason as ReasonName, t: s.t})), c.eval_t);
      expect({pos: a.pos, neg: a.neg, total: a.total, k: a.k_pct, band: a.band}).toEqual({pos: c.pos, neg: c.neg, total: c.total, k: c.k_pct, band: c.band});
    });
  }
});

describe('decay', () => {
  it('halves every 120 s, rounded half-up', () => {
    expect(decay(7, 0)).toBe(7);
    expect(decay(7, 120)).toBe(4); // 3.5 → 4
    expect(decay(12, 240)).toBe(3);
    expect(decay(-6, 120)).toBe(-3);
  });
});

describe('band and words', () => {
  it('maps totals to the CEM-0 bands', () => {
    expect([band(4), band(5), band(11), band(12), band(19), band(20)]).toEqual(['faint', 'some', 'some', 'strong', 'strong', 'very strong']);
  });
  it('explains in plain words, strongest first, never a number', () => {
    const a = assess(
      [
        {reason: 'snatch', t: 0},
        {reason: 'scream_single', t: 3},
      ],
      5,
    );
    expect(inWords(a)).toBe('a scream and the phone grabbed');
    expect(inWords(a)).not.toMatch(/\d/);
  });
  it('motion alone scores nothing (H3: look-back corroboration only)', () => {
    expect(assess([{reason: 'snatch', t: 0}], 1).total).toBe(0);
  });
});
