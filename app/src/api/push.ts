/**
 * Guardian push (Firebase Cloud Messaging), on top of polling, never instead.
 *
 * With Firebase configured (a build made with google-services.json), a phone
 * holding a guardian slot replaces its enrolment placeholder
 * `sim_poll_while_open` with a real FCM registration token:
 * PUT /v1/guardians/{guardian_id}/token {"fcm_token": ...}, signed with the
 * guardian key. The server's RoutingGuardianNotifier then pushes alerts on the
 * Android channel `vuka_guardian_alerts` (created natively at start-up).
 *
 * Without Firebase, or if anything here fails, nothing is sent: the server
 * keeps the placeholder and alerts arrive by polling while the app is open,
 * exactly as before. Polling also keeps running when push works. The token
 * is never logged.
 */
import {PermissionsAndroid, Platform} from 'react-native';
import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {device, type Device} from './device';

/** The server's channel id (server/src/notify/fcm.py build_message). */
export const GUARDIAN_CHANNEL = 'vuka_guardian_alerts';

export type PushResult = 'not_configured' | 'not_guardian' | 'sent' | 'unchanged' | 'failed';
type PushDevice = Pick<Device, 'profile' | 'setGuardianPushToken'>;
type Messaging = FirebaseMessagingTypes.Module;

/** True when this build has a Firebase app (google-services.json was present). */
export function pushAvailable(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-firebase/app');
    const apps = (mod.firebase ?? mod.default)?.apps;
    return Array.isArray(apps) && apps.length > 0;
  } catch {
    return false;
  }
}

function messaging(): Messaging | null {
  if (!pushAvailable()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-firebase/messaging').default() as Messaging;
  } catch {
    return null;
  }
}

/** A guardian alert from VIGIL's server (it always carries the outbox key). */
function isGuardianPush(m: FirebaseMessagingTypes.RemoteMessage | null | undefined): boolean {
  return typeof m?.data?.outbox_idempotency_key === 'string';
}

const ASKS_FOR_NOTIFICATIONS = Platform.OS === 'android' && Number(Platform.Version) >= 33;

async function askForNotifications(): Promise<void> {
  if (!ASKS_FOR_NOTIFICATIONS) return;
  const p = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  // Only when missing: the token works either way; the notice needs this.
  if (!(await PermissionsAndroid.check(p).catch(() => false))) await PermissionsAndroid.request(p).catch(() => undefined);
}

// One registration at a time (start-up, enrolment and a token refresh can overlap).
let chain: Promise<unknown> = Promise.resolve();

/**
 * Send this phone's FCM token for its guardian slot, once per token.
 * ask: request notification permission first (right after enrolment).
 * token: a refreshed token from onTokenRefresh.
 */
export function registerGuardianPush(opts: {ask?: boolean; token?: string; dev?: PushDevice} = {}): Promise<PushResult> {
  const run = chain.then(() => register(opts));
  chain = run.catch(() => undefined);
  return run;
}

async function register({ask = false, token, dev = device}: {ask?: boolean; token?: string; dev?: PushDevice}): Promise<PushResult> {
  const m = messaging();
  if (!m) return 'not_configured';
  if (!dev.profile?.guardian) return 'not_guardian';
  try {
    if (ask) await askForNotifications();
    const t = token ?? (await m.getToken());
    if (!t) return 'failed';
    return await dev.setGuardianPushToken(t);
  } catch {
    // The server keeps the placeholder; polling carries on. Nothing logged.
    return 'failed';
  }
}

/**
 * While the app runs: re-send the token when FCM refreshes it; a foreground
 * alert calls onAlert (FCM shows nothing itself while the app is in front);
 * tapping an alert's notification calls onOpen. Returns the unsubscribe.
 */
export function startGuardianPush(handlers: {onAlert(): void; onOpen(): void}, dev: PushDevice = device): () => void {
  const m = messaging();
  if (!m) return () => undefined;
  const subs: (() => void)[] = [];
  try {
    subs.push(m.onTokenRefresh(t => void registerGuardianPush({token: t, dev})));
    subs.push(
      m.onMessage(async msg => {
        if (isGuardianPush(msg) && dev.profile?.guardian) handlers.onAlert();
      }),
    );
    subs.push(
      m.onNotificationOpenedApp(msg => {
        if (isGuardianPush(msg) && dev.profile?.guardian) handlers.onOpen();
      }),
    );
  } catch {
    // Push stays off; polling is unaffected.
  }
  return () => subs.forEach(u => u());
}

/** True when the app was launched by tapping a guardian alert's notification. */
export async function openedFromGuardianPush(): Promise<boolean> {
  const m = messaging();
  if (!m) return false;
  try {
    return isGuardianPush(await m.getInitialNotification());
  } catch {
    return false;
  }
}

/**
 * index.js, at module top level before AppRegistry: with the app in the
 * background or closed, Android shows the server's notification itself on
 * `vuka_guardian_alerts`; nothing else is done here.
 */
export function registerGuardianBackgroundHandler(): void {
  const m = messaging();
  if (!m) return;
  try {
    m.setBackgroundMessageHandler(async () => undefined);
  } catch {
    // Push stays off; polling is unaffected.
  }
}
