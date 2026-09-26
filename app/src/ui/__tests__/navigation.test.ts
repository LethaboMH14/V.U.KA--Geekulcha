import {recordDestination} from '../navigation';

describe('record tab routing', () => {
  it('opens the simulated record preview directly', () => {
    expect(recordDestination(true)).toBe('record');
  });

  it('requires the PIN gate on a real device', () => {
    expect(recordDestination(false)).toBe('recordPin');
  });
});
