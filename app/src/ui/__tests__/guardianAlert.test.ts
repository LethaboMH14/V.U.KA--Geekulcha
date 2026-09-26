import {answerStatus, answerTimeline, claimAnswer, needsAttention, notRecorded, standDownQuestion} from '../guardian';

describe('guardian alert answers', () => {
  it('sends Call 10111 once per alert, however often it is pressed', () => {
    const claimed = new Set<string>();
    expect(claimAnswer(claimed, 'inc_1', 'called_10111')).toBe(true);
    expect(claimAnswer(claimed, 'inc_1', 'called_10111')).toBe(false);
    // A different alert, or a different answer, is its own claim.
    expect(claimAnswer(claimed, 'inc_2', 'called_10111')).toBe(true);
    expect(claimAnswer(claimed, 'inc_1', 'stand_down')).toBe(true);
  });

  it('never claims a call happened, only that Call 10111 was pressed', () => {
    expect(answerStatus([])).toBeNull();
    expect(answerStatus(['handling'])).toBeNull();
    expect(answerStatus(['called_10111'])).toBe('You pressed Call 10111, recorded.');
    expect(answerStatus(['called_10111', 'stand_down'])).toBe("Stood down. You confirmed they're safe.");
    expect(answerStatus(['stand_down'])).toBe("Stood down without calling 10111. You confirmed they're safe.");
  });

  it('says 10111 will not be called when standing down before calling', () => {
    expect(standDownQuestion([])).toMatch(/10111 won't be called from this alert\.$/);
    expect(standDownQuestion(['called_10111'])).toBe("Only stand down if you know they're safe.");
  });

  it('a failed write is not called recorded', () => {
    for (const a of ['called_10111', 'handling', 'stand_down'] as const) {
      expect(notRecorded(a)).toMatch(/wasn't recorded yet\. Check your data and try again\.$/);
    }
  });

  it('the response timeline shows only what happened, in order', () => {
    const open = {opened_at: '2026-09-26T19:58:00Z', closed_at: null};
    expect(answerTimeline(open, [], {})).toEqual([
      {label: 'Alert raised', at: open.opened_at},
      {label: 'Waiting on stand-down or closure', at: null},
    ]);
    const t = answerTimeline(open, ['called_10111', 'stand_down'], {called_10111: '2026-09-26T19:59:00Z', stand_down: '2026-09-26T20:07:00Z'});
    expect(t.map(s => s.label)).toEqual(['Alert raised', 'You pressed Call 10111', 'You stood down']);
    // Closed by someone else: the closure is the last row, not a stand-down that didn't happen.
    const closed = answerTimeline({...open, closed_at: '2026-09-26T20:10:00Z'}, ['handling'], {handling: '2026-09-26T20:00:00Z'});
    expect(closed.map(s => s.label)).toEqual(['Alert raised', "You're handling it", 'Alert closed']);
  });
});

describe('guardian alert banner', () => {
  const alert = (id: string, closed: string | null) => ({
    incident_id: id,
    trigger: 'no_answer' as const,
    delivered_at: '2026-09-26T10:00:00Z',
    opened_at: '2026-09-26T10:00:00Z',
    closed_at: closed,
    close_reason: closed ? 'stand_down' : null,
  });

  it('shows only for an open alert this guardian has not stood down from', () => {
    expect(needsAttention([], new Set())).toBeNull();
    expect(needsAttention([alert('inc_1', '2026-09-26T10:05:00Z')], new Set())).toBeNull();
    expect(needsAttention([alert('inc_1', null)], new Set())?.incident_id).toBe('inc_1');
    expect(needsAttention([alert('inc_1', null)], new Set(['inc_1']))).toBeNull();
  });
});
