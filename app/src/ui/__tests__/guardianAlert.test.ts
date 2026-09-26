import {answerStatus, claimAnswer, notRecorded, standDownQuestion} from '../guardian';

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
});
