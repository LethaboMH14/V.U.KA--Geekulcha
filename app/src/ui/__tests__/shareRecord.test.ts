import {buildShare, VERIFY_URL} from '../recordGroups';

const verified = {
  subject_id: 'sim_lerato',
  entries: [
    {prev_hash: '0'.repeat(64), event_hash: 'a'.repeat(64), ts: '2026-09-26T10:00:00Z', details: {event_id: 'e1', commitment: 'c1'}},
    {prev_hash: 'a'.repeat(64), event_hash: 'b'.repeat(64), ts: '2026-09-26T10:05:00Z', details: {event_id: 'e2', commitment: 'c2'}},
  ],
  payloads: [
    {event_id: 'e1', payload: {kind: 'registration', app_version: '0.0.6'}},
    {event_id: 'e2', payload: {kind: 'checkin_result', result: 'normal_pin'}},
  ],
  salts: [{event_id: 'e1', salt: 'AAAAAAAAAAAAAAAAAAAAAA=='}],
  proofs: [],
  receipts: [{event_id: 'e1', event_hash: 'a'.repeat(64), chain_index: 0}],
};

describe('Share with a bank or insurer', () => {
  it('wraps the export as vuka-export-v2 with an RFC 3339 shared_at and nothing else', () => {
    const s = buildShare(verified, Date.UTC(2026, 8, 26, 12, 34, 56, 789));
    expect(Object.keys(s).sort()).toEqual(['export', 'format', 'shared_at']);
    expect(s.format).toBe('vuka-export-v2');
    expect(s.shared_at).toBe('2026-09-26T12:34:56Z');
    expect(s.shared_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it('shares the verified export unchanged, as a deep copy', () => {
    const before = JSON.stringify(verified);
    const s = buildShare(verified, 0);
    expect(s.export).toEqual(verified);
    expect(JSON.stringify(s.export)).toBe(before);
    expect(s.export).not.toBe(verified);
    expect(s.export.entries[0]).not.toBe(verified.entries[0]);
    // Changing the share can't change what the screen checked, and vice versa.
    (s.export.payloads[1].payload as {result: string}).result = 'changed';
    expect(JSON.stringify(verified)).toBe(before);
  });

  it('round-trips through the message text exactly', () => {
    const msg = JSON.stringify(buildShare(verified, 0));
    expect(JSON.parse(msg)).toEqual({format: 'vuka-export-v2', export: verified, shared_at: '1970-01-01T00:00:00Z'});
  });

  it('points at the public ledger verify page', () => {
    expect(VERIFY_URL).toBe('https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/ledger/#verify');
  });
});
