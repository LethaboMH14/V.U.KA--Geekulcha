/**
 * Real Google sign-in (src/api/google.ts): off, with no Google calls, when
 * the build has no Firebase; with Firebase, the confirmed email and name, and
 * friendly results for cancel, in-progress and missing Play services. A real
 * Google account is kept on this phone as verified, and nothing about it is
 * queued or sent to the VIGIL server.
 */
import {createDevice, simBackend, type Backend} from '../device';

const WEB_CLIENT = '1234-web.apps.googleusercontent.com';

type Google = typeof import('../google');
type Signin = typeof import('@react-native-google-signin/google-signin');

/** Fresh modules; `configured` stands in for a build made with google-services.json. */
function load(configured: boolean): {g: Google; gs: Signin['GoogleSignin']; codes: Signin['statusCodes']} {
  jest.resetModules();
  const {NativeModules} = require('react-native');
  if (configured) {
    jest.doMock('@react-native-firebase/app', () => ({__esModule: true, default: {apps: [{name: '[DEFAULT]'}]}}));
    NativeModules.VigilGoogleConfig = {webClientId: WEB_CLIENT};
  } else {
    delete NativeModules.VigilGoogleConfig;
  }
  const g = require('../google') as Google;
  const s = require('@react-native-google-signin/google-signin') as Signin;
  return {g, gs: s.GoogleSignin, codes: s.statusCodes};
}

afterEach(() => {
  jest.dontMock('@react-native-firebase/app');
});

test('without Firebase: not configured, and Google is never called', async () => {
  const {g, gs} = load(false);
  expect(g.googleAvailable()).toBe(false);
  const r = await g.googleSignIn();
  expect(r).toMatchObject({ok: false, reason: 'not_configured'});
  expect(gs.configure).not.toHaveBeenCalled();
  expect(gs.hasPlayServices).not.toHaveBeenCalled();
  expect(gs.signIn).not.toHaveBeenCalled();
});

test('Firebase without the web client id (no default_web_client_id) is not configured either', async () => {
  const {g, gs} = load(true);
  delete require('react-native').NativeModules.VigilGoogleConfig;
  expect(g.googleAvailable()).toBe(false);
  expect(await g.googleSignIn()).toMatchObject({ok: false, reason: 'not_configured'});
  expect(gs.signIn).not.toHaveBeenCalled();
});

test('configured: the web client id, then the email and name Firebase confirmed', async () => {
  const {g, gs} = load(true);
  expect(g.googleAvailable()).toBe(true);
  const r = await g.googleSignIn();
  expect(gs.configure).toHaveBeenCalledWith({webClientId: WEB_CLIENT});
  expect(gs.hasPlayServices).toHaveBeenCalled();
  expect(r).toEqual({ok: true, account: {email: 'thandi@example.com', name: 'Thandi Dlamini', uid: 'uid-test'}});
  if (r.ok) expect(g.googleName(r.account)).toEqual({first: 'Thandi', last: 'Dlamini'});
  // The chooser shows again next time.
  expect(gs.signOut).toHaveBeenCalled();
});

test('configured: v11 resolves the user itself, with given and family names', async () => {
  const {g, gs} = load(true);
  (gs.signIn as jest.Mock).mockResolvedValueOnce({
    idToken: 'id-token-v11',
    serverAuthCode: null,
    user: {id: '1', email: 'thandi@example.com', name: 'Thandi M Dlamini', givenName: 'Thandi', familyName: 'Mokoena-Dlamini', photo: null},
  });
  const r = await g.googleSignIn();
  expect(r.ok).toBe(true);
  if (r.ok) expect(g.googleName(r.account)).toEqual({first: 'Thandi', last: 'Mokoena-Dlamini'});
});

test('configured: cancel, in progress, no Play services and a missing token are results, never thrown', async () => {
  const {g, gs, codes} = load(true);
  (gs.signIn as jest.Mock).mockRejectedValueOnce(Object.assign(new Error('cancelled'), {code: codes.SIGN_IN_CANCELLED}));
  expect(await g.googleSignIn()).toMatchObject({ok: false, reason: 'cancelled', message: expect.stringMatching(/cancelled/)});
  (gs.signIn as jest.Mock).mockResolvedValueOnce({type: 'cancelled', data: null});
  expect(await g.googleSignIn()).toMatchObject({ok: false, reason: 'cancelled'});
  (gs.signIn as jest.Mock).mockRejectedValueOnce(Object.assign(new Error('busy'), {code: codes.IN_PROGRESS}));
  expect(await g.googleSignIn()).toMatchObject({ok: false, reason: 'in_progress'});
  (gs.hasPlayServices as jest.Mock).mockRejectedValueOnce(Object.assign(new Error('no gms'), {code: codes.PLAY_SERVICES_NOT_AVAILABLE}));
  expect(await g.googleSignIn()).toMatchObject({ok: false, reason: 'no_play_services'});
  (gs.signIn as jest.Mock).mockResolvedValueOnce({user: {email: 'thandi@example.com'}, idToken: null});
  expect(await g.googleSignIn()).toMatchObject({ok: false, reason: 'failed'});
  (gs.signIn as jest.Mock).mockRejectedValueOnce(new Error('DEVELOPER_ERROR 10'));
  const r = await g.googleSignIn();
  expect(r).toMatchObject({ok: false, reason: 'failed'});
  // The raw error never reaches the screen.
  if (!r.ok) expect(r.message).not.toMatch(/DEVELOPER_ERROR/);
});

test('a real Google account is kept verified on this phone; nothing is queued or sent to the VIGIL server', async () => {
  const base = simBackend();
  const sent: unknown[] = [];
  const requests: string[] = [];
  const saved: string[] = [];
  const b: Backend = {
    ...base,
    simulated: false,
    received: async () => [],
    post: async (_url, entry) => {
      sent.push(entry);
      return {event_hash: 'a'.repeat(64), chain_index: sent.length - 1, received_at: '2026-09-26T10:00:00Z'};
    },
    request: async <T,>(_url: string, method: string, path: string) => {
      requests.push(`${method} ${path}`);
      return {} as T;
    },
    setProfile: async j => {
      saved.push(j);
      return base.setProfile(j);
    },
  };
  const device = createDevice(b);
  await device.setPins('1234', '9876');
  await device.register('Thandi', '0.0.14');
  await device.flush();
  const before = {pending: (await b.pending()).length, sent: sent.length, requests: requests.length, queued: device.delivery().queued};

  await device.setAccount({kind: 'google', contact: 'thandi@example.com', verified: true}, 'Dlamini');
  expect(device.profile?.account).toEqual({kind: 'google', contact: 'thandi@example.com', verified: true});
  expect(JSON.parse(saved[saved.length - 1]).account).toMatchObject({verified: true});
  // The same matching rules as before: the account email, case-insensitively, and no other.
  expect(await device.findAccount({kind: 'google', email: 'THANDI@example.com'})).toBe(true);
  expect(await device.findAccount({kind: 'google', email: 'someone@example.com'})).toBe(false);
  await device.flush();

  expect({pending: (await b.pending()).length, sent: sent.length, requests: requests.length, queued: device.delivery().queued}).toEqual(before);
  // The email is in no signed entry.
  expect(JSON.stringify(sent)).not.toMatch(/thandi@example\.com/);
});
