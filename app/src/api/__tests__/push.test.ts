/**
 * Guardian push (src/api/push.ts). Firebase is a jest mock here: "not
 * configured" (no apps, as a build without google-services.json) or
 * "configured" (one app). No real FCM token or server is involved.
 */
import {createDevice, simBackend, type Backend} from '../device';

const mockApps: object[] = [];
jest.mock('@react-native-firebase/app', () => ({__esModule: true, firebase: {apps: mockApps}, default: {apps: mockApps}}));

const mockMessaging = {
  getToken: jest.fn(async () => 'fcm-token-1'),
  refresh: null as null | ((t: string) => unknown),
  onTokenRefresh: jest.fn((l: (t: string) => unknown) => {
    mockMessaging.refresh = l;
    return () => undefined;
  }),
  onMessage: jest.fn(() => () => undefined),
  onNotificationOpenedApp: jest.fn(() => () => undefined),
  getInitialNotification: jest.fn(async () => null),
  setBackgroundMessageHandler: jest.fn(),
  deleteToken: jest.fn(async () => undefined),
};
jest.mock('@react-native-firebase/messaging', () => ({__esModule: true, default: () => mockMessaging}));

import {dropGuardianPush, pushAvailable, registerGuardianPush, registerGuardianBackgroundHandler, startGuardianPush} from '../push';

type Req = {method: string; path: string; body: string; keyId?: string};

/** A guardian phone whose server we control. */
async function guardianPhone(fail = false) {
  const requests: Req[] = [];
  const b: Backend = {
    ...simBackend(),
    simulated: false,
    request: async <T,>(_u: string, method: string, path: string, body: string, keyId?: string) => {
      requests.push({method, path, body, keyId});
      if (path === '/v1/guardians/accept') return {guardian_id: 'g1234567'} as T;
      if (fail && path.endsWith('/token')) throw new Error('503 database_unavailable: database unavailable');
      return {receipt_id: 'r', state: 'accepted'} as T;
    },
  };
  const dev = createDevice(b);
  await dev.becomeGuardian('abcd1234-123456', 'Thabo');
  const enrol = JSON.parse(requests[0].body);
  requests.length = 0;
  return {dev, requests, enrol};
}

beforeEach(() => {
  mockApps.length = 0;
  mockMessaging.getToken.mockClear();
  mockMessaging.getToken.mockImplementation(async () => 'fcm-token-1');
  mockMessaging.refresh = null;
});

test('without Firebase configured nothing is sent and polling stays', async () => {
  const {dev, requests, enrol} = await guardianPhone();
  expect(pushAvailable()).toBe(false);
  expect(await registerGuardianPush({dev})).toBe('not_configured');
  expect(mockMessaging.getToken).not.toHaveBeenCalled();
  expect(requests).toHaveLength(0);
  expect(enrol.fcm_token).toBe('sim_poll_while_open');
  expect(dev.profile?.guardian?.push).toBeUndefined();
  // No listeners and no background handler either.
  startGuardianPush({onAlert: jest.fn(), onOpen: jest.fn()}, dev)();
  registerGuardianBackgroundHandler();
  expect(mockMessaging.onTokenRefresh).not.toHaveBeenCalled();
  expect(mockMessaging.setBackgroundMessageHandler).not.toHaveBeenCalled();
});

test('configured: one guardian-signed PUT with the token, not repeated, re-sent on refresh', async () => {
  mockApps.push({name: '[DEFAULT]'});
  const {dev, requests} = await guardianPhone();
  expect(pushAvailable()).toBe(true);
  expect(await registerGuardianPush({dev})).toBe('sent');
  expect(requests).toEqual([
    {method: 'PUT', path: '/v1/guardians/g1234567/token', body: JSON.stringify({fcm_token: 'fcm-token-1'}), keyId: dev.profile!.guardian!.keyId},
  ]);
  expect(requests[0].keyId).toMatch(/^gdn_/);
  // Same token again (start-up, enrolment): nothing sent.
  expect(await registerGuardianPush({dev})).toBe('unchanged');
  expect(requests).toHaveLength(1);
  // FCM refreshes the token: sent once more.
  const stop = startGuardianPush({onAlert: jest.fn(), onOpen: jest.fn()}, dev);
  await mockMessaging.refresh!('fcm-token-2');
  expect(await registerGuardianPush({dev, token: 'fcm-token-2'})).toBe('unchanged');
  expect(requests.map(r => JSON.parse(r.body).fcm_token)).toEqual(['fcm-token-1', 'fcm-token-2']);
  stop();
});

test('a failed PUT stores nothing, so the server keeps the placeholder and it is retried', async () => {
  mockApps.push({name: '[DEFAULT]'});
  const failing = await guardianPhone(true);
  expect(await registerGuardianPush({dev: failing.dev})).toBe('failed');
  expect(failing.dev.profile?.guardian?.push).toBeUndefined();
  expect(await registerGuardianPush({dev: failing.dev})).toBe('failed');
  expect(failing.requests).toHaveLength(2);
  // No token from FCM: nothing sent at all.
  mockMessaging.getToken.mockImplementation(async () => {
    throw new Error('SERVICE_NOT_AVAILABLE');
  });
  const {dev, requests} = await guardianPhone();
  expect(await registerGuardianPush({dev})).toBe('failed');
  expect(requests).toHaveLength(0);
});

test('a phone with no guardian slot sends nothing', async () => {
  mockApps.push({name: '[DEFAULT]'});
  const dev = createDevice({...simBackend(), simulated: false});
  expect(await registerGuardianPush({dev})).toBe('not_guardian');
  expect(mockMessaging.getToken).not.toHaveBeenCalled();
});

test('a foreground guardian push calls onAlert; a tap calls onOpen; other messages are ignored', async () => {
  mockApps.push({name: '[DEFAULT]'});
  const {dev} = await guardianPhone();
  const onAlert = jest.fn();
  const onOpen = jest.fn();
  startGuardianPush({onAlert, onOpen}, dev);
  const onMessage = (mockMessaging.onMessage.mock.calls.at(-1) as unknown as [(m: object) => Promise<void>])[0];
  const opened = (mockMessaging.onNotificationOpenedApp.mock.calls.at(-1) as unknown as [(m: object) => void])[0];
  await onMessage({data: {outbox_idempotency_key: 'k1'}});
  await onMessage({data: {}});
  opened({data: {outbox_idempotency_key: 'k1'}});
  expect(onAlert).toHaveBeenCalledTimes(1);
  expect(onOpen).toHaveBeenCalledTimes(1);
});

test('stopping being a guardian deletes this phone\'s push token; without Firebase there is none', async () => {
  mockMessaging.deleteToken.mockClear();
  expect(await dropGuardianPush()).toBe('not_configured');
  expect(mockMessaging.deleteToken).not.toHaveBeenCalled();
  mockApps.push({name: '[DEFAULT]'});
  expect(await dropGuardianPush()).toBe('dropped');
  expect(mockMessaging.deleteToken).toHaveBeenCalledTimes(1);
  mockMessaging.deleteToken.mockImplementationOnce(async () => {
    throw new Error('SERVICE_NOT_AVAILABLE');
  });
  expect(await dropGuardianPush()).toBe('failed');
});
