import {BURST_MS, claimPress, EMERGENCY_URL, raiseEmergency} from '../help';

describe("Home's Emergency button", () => {
  it('opens the dialer with 10111 ready, never a direct call', async () => {
    const opened: string[] = [];
    const onHelp = jest.fn();
    await expect(raiseEmergency(onHelp, async u => void opened.push(u))).resolves.toBe(true);
    expect(opened).toEqual(['tel:10111']);
    expect(EMERGENCY_URL).toBe('tel:10111');
    expect(onHelp).toHaveBeenCalledTimes(1);
  });

  it('asks for the check-in before leaving for the dialer', async () => {
    const order: string[] = [];
    await raiseEmergency(
      () => order.push('check-in'),
      async () => void order.push('dialer'),
    );
    expect(order).toEqual(['check-in', 'dialer']);
  });

  it('still asks for the check-in when no dialer opens', async () => {
    const onHelp = jest.fn();
    await expect(raiseEmergency(onHelp, () => Promise.reject(new Error('no dialer')))).resolves.toBe(false);
    expect(onHelp).toHaveBeenCalledTimes(1);
  });

  it('a burst of taps is one press', () => {
    const last = {at: null as number | null};
    expect(claimPress(last, 1000)).toBe(true);
    expect(claimPress(last, 1200)).toBe(false);
    // Each tap moves the burst on, so steady hammering stays one press.
    expect(claimPress(last, 1200 + BURST_MS - 1)).toBe(false);
    expect(claimPress(last, 1200 + 2 * BURST_MS)).toBe(true);
  });
});
