/**
 * The 30-minute location window (ADR-0048): started by any check-in, the same
 * whichever PIN follows, a fix every 30 s, stopped by a pause, never sending
 * without a fix.
 */
import {NativeModules} from 'react-native';

const fix = {lat_e7: -261234567, lon_e7: 280567890, acc_m: 12, fix_age_ms: 1500};

function load(current: () => Promise<typeof fix | null>) {
  jest.resetModules();
  NativeModules.VigilLocation = {current: jest.fn(current), keepAwake: jest.fn()};
  return require('../location') as typeof import('../location');
}

const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('a check-in starts a 30-minute window: a fix now and every 30 s, then it stops', async () => {
  const loc = load(async () => fix);
  const sent: unknown[] = [];
  const t0 = Date.now();
  const until = loc.startWindow(async f => void sent.push(f), t0);
  expect(until).toBe(t0 + 30 * 60_000);
  expect(NativeModules.VigilLocation.keepAwake).toHaveBeenCalledWith('VigilKeepAlive', 1860, false);
  await flush();
  expect(sent).toHaveLength(1);
  for (let i = 0; i < 3; i++) {
    jest.advanceTimersByTime(30_000);
    await flush();
  }
  expect(sent).toHaveLength(4);
  jest.setSystemTime(t0 + 31 * 60_000);
  jest.advanceTimersByTime(30_000);
  await flush();
  expect(loc.windowUntil()).toBe(0);
  const n = sent.length;
  jest.advanceTimersByTime(120_000);
  await flush();
  expect(sent).toHaveLength(n);
});

test('pausing stops it at once', async () => {
  const loc = load(async () => fix);
  const sent: unknown[] = [];
  loc.startWindow(async f => void sent.push(f));
  await flush();
  loc.stopWindow();
  jest.advanceTimersByTime(300_000);
  await flush();
  expect(sent).toHaveLength(1);
  expect(loc.windowUntil()).toBe(0);
});

test('no fix, nothing sent (location off or refused)', async () => {
  const loc = load(async () => null);
  const sent: unknown[] = [];
  loc.startWindow(async f => void sent.push(f));
  jest.advanceTimersByTime(90_000);
  await flush();
  expect(sent).toHaveLength(0);
  loc.stopWindow();
});
