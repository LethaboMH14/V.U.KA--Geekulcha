import {groupRecord, groupStatus, ZERO_HASH} from '../recordGroups';
import type {RecordRow} from '../../api/device';

const h = (i: number) => String(i).padStart(2, '0').repeat(32);
const rows = (...kinds: string[]): RecordRow[] =>
  kinds.map((kind, index) => ({index, kind, ts: `2026-09-26T10:${String(index).padStart(2, '0')}:00Z`, hash: h(index), fromThisPhone: false}));

const shape = (gs: ReturnType<typeof groupRecord>) => gs.map(g => ({session: g.session, open: g.open, idx: g.entries.map(e => e.index)}));

describe('My record grouping', () => {
  it('makes each journey_armed → journey_ended one session, entries outside a journey their own records, newest first', () => {
    const gs = groupRecord(
      rows('registration', 'journey_armed', 'signal_detected', 'pin_authorised', 'journey_ended', 'pin_authorised', 'journey_armed', 'journey_ended'),
      null,
    );
    expect(shape(gs)).toEqual([
      {session: true, open: false, idx: [6, 7]},
      {session: false, open: false, idx: [5]},
      {session: true, open: false, idx: [1, 2, 3, 4]},
      {session: false, open: false, idx: [0]},
    ]);
    expect(gs.map(g => g.id)).toEqual([6, 5, 1, 0]);
    // Every entry appears exactly once.
    expect(gs.flatMap(g => g.entries.map(e => e.index)).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps a journey with no end in the record as an open session (a held export can end mid-journey)', () => {
    const gs = groupRecord(rows('registration', 'journey_armed', 'signal_detected', 'checkin_opened'), null);
    expect(shape(gs)).toEqual([
      {session: true, open: true, idx: [1, 2, 3]},
      {session: false, open: false, idx: [0]},
    ]);
  });

  it('closes an unended session when a new journey starts', () => {
    const gs = groupRecord(rows('journey_armed', 'signal_detected', 'journey_armed', 'journey_ended'), null);
    expect(shape(gs)).toEqual([
      {session: true, open: false, idx: [2, 3]},
      {session: true, open: true, idx: [0, 1]},
    ]);
  });

  it('treats a journey_ended with no start as its own record', () => {
    expect(shape(groupRecord(rows('journey_ended', 'registration'), null))).toEqual([
      {session: false, open: false, idx: [1]},
      {session: false, open: false, idx: [0]},
    ]);
  });

  it('links each entry to the one before it, the first to 64 zeros', () => {
    const [newer, older] = groupRecord(rows('registration', 'journey_armed', 'journey_ended'), null);
    expect(older.entries[0].prevHash).toBe(ZERO_HASH);
    expect(newer.entries.map(e => e.prevHash)).toEqual([h(0), h(1)]);
    expect(newer.entries.every(e => e.linkChecked)).toBe(true);
  });

  it('sorts by index and does not invent a link across a gap', () => {
    const r = rows('registration', 'journey_armed', 'journey_ended');
    const gs = groupRecord([r[2], r[0]], null);
    expect(gs.map(g => g.entries[0].prevHash)).toEqual([null, ZERO_HASH]);
  });

  it('propagates the first broken index: intact before, broken here, can’t confirm after', () => {
    const gs = groupRecord(
      rows('registration', 'journey_armed', 'signal_detected', 'journey_ended', 'pin_authorised', 'journey_armed', 'journey_ended'),
      2,
    );
    expect(gs.map(g => [g.id, g.status])).toEqual([
      [5, 'broken_earlier'],
      [4, 'broken_earlier'],
      [1, 'broken_here'],
      [0, 'intact'],
    ]);
    const session = gs[2];
    expect(session.entries.map(e => e.linkChecked)).toEqual([true, false, false]);
  });

  it('marks a single-entry record broken when it is the first broken entry', () => {
    expect(groupStatus(4, 4, 4)).toBe('broken_here');
    expect(groupStatus(4, 4, 5)).toBe('intact');
    expect(groupStatus(4, 4, 3)).toBe('broken_earlier');
    expect(groupStatus(4, 6, null)).toBe('intact');
  });

  it('returns nothing for an empty record', () => {
    expect(groupRecord([], null)).toEqual([]);
  });
});
