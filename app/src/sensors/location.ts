/**
 * Location for the 30 minutes after a check-in (ADR-0048, PROPOSED).
 *
 * After ANY check-in opens (either PIN, and before any answer) the phone
 * sends a fix every 30 s for 30 minutes. It never knows whether an alert was
 * raised (T30), so its behaviour is the same after a duress PIN as after a
 * normal one (V5). The server keeps a fix only while guardians have been
 * alerted and drops it otherwise.
 *
 * The window keeps running with the screen locked: a headless task keeps
 * JavaScript timers alive (the member's listening service already keeps
 * the app in the foreground class).
 */
import {AppRegistry, NativeModules, PermissionsAndroid, Platform} from 'react-native';

export type Fix = {lat_e7: number; lon_e7: number; acc_m: number; fix_age_ms: number};

type Native = {
  current(maxAgeMs: number): Promise<Fix | null>;
  keepAwake(task: string, seconds: number, standby: boolean): void;
};
const native: Native | undefined = NativeModules.VigilLocation;

export const WINDOW_MS = 30 * 60_000;
export const EVERY_MS = 30_000;
export const KEEP_ALIVE_TASK = 'VigilKeepAlive';

/** Registered once, in index.js: a task that only waits, so timers keep running. */
export function registerKeepAlive(): void {
  AppRegistry.registerHeadlessTask(KEEP_ALIVE_TASK, () => async (data: {seconds?: number}) => {
    await new Promise(r => setTimeout(r, Math.max(1, data?.seconds ?? 60) * 1000));
  });
}

/** Asks once; listening works without it (the guardian simply sees no map). */
export async function askLocation(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).catch(() => 'denied');
  return r === PermissionsAndroid.RESULTS.GRANTED;
}

export async function currentFix(maxAgeMs = 30_000): Promise<Fix | null> {
  if (!native) return null;
  return native.current(maxAgeMs).catch(() => null);
}

/** Keep JS timers alive in the background for `seconds` (standby: a guardian, with its own notice). */
export function keepAwake(seconds: number, standby = false): void {
  native?.keepAwake(KEEP_ALIVE_TASK, seconds, standby);
}

let timer: ReturnType<typeof setInterval> | null = null;
let until = 0;

/**
 * Start (or extend) the 30-minute window. `send` uploads one fix; failures
 * are only missed fixes. Returns when the window ends.
 */
export function startWindow(send: (fix: Fix) => Promise<void>, now = Date.now()): number {
  until = now + WINDOW_MS;
  const tick = async () => {
    if (Date.now() >= until) return stopWindow();
    const fix = await currentFix();
    if (fix) await send(fix).catch(() => undefined);
  };
  if (!timer) timer = setInterval(() => void tick(), EVERY_MS);
  keepAwake(WINDOW_MS / 1000 + 60);
  void tick();
  return until;
}

export function stopWindow(): void {
  if (timer) clearInterval(timer);
  timer = null;
  until = 0;
}

/** When the current window ends (ms since epoch), or 0. */
export const windowUntil = (): number => (until > Date.now() ? until : 0);
