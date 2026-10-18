import {whyLine} from '../whyLine';

describe('guardian why line', () => {
  it('names what was noticed and the band, in words', () => {
    expect(whyLine({band: 'strong', reasons: ['scream_single', 'snatch']})).toBe('VIGIL noticed a scream and the phone grabbed: strong signs.');
  });
  it('never shows a number, and falls back to plain words for a reason this phone does not know', () => {
    const line = whyLine({band: 'some', reasons: ['glass_or_breaking', 'impact', 'new_reason']})!;
    expect(line).toBe('VIGIL noticed breaking glass, the phone hit hard and new reason: some signs.');
    expect(line).not.toMatch(/\d/);
  });
  it('says nothing when there is no detection evidence', () => {
    expect(whyLine(null)).toBeNull();
    expect(whyLine(undefined)).toBeNull();
    expect(whyLine({band: 'faint', reasons: []})).toBeNull();
  });
});
