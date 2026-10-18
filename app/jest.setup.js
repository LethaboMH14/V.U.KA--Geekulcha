// React Native's own BackHandler mock (the preset's default lacks addEventListener).
jest.mock('react-native/Libraries/Utilities/BackHandler', () =>
  require('react-native/Libraries/Utilities/__mocks__/BackHandler'),
);

// The blur view is native; in tests it is a plain view.
jest.mock('@react-native-community/blur', () => {
  const {View} = require('react-native');
  return {BlurView: View};
});
jest.mock('react-native-webview', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {WebView: React.forwardRef((props, ref) => React.createElement(View, props))};
});

// Firebase and Google sign-in are native; in tests they are "not configured"
// (no google-services.json), exactly as a build without Firebase behaves.
// Tests that need them configured override these with jest.doMock.
jest.mock('@react-native-firebase/app', () => {
  const app = () => {
    throw new Error("No Firebase App '[DEFAULT]' has been created");
  };
  app.apps = [];
  return {__esModule: true, default: {apps: [], app}, firebase: {apps: [], app}, getApps: () => []};
});
jest.mock('@react-native-firebase/messaging', () => {
  const m = () => ({
    getToken: jest.fn(async () => 'fcm-test-token'),
    onTokenRefresh: jest.fn(() => () => undefined),
    onMessage: jest.fn(() => () => undefined),
    onNotificationOpenedApp: jest.fn(() => () => undefined),
    getInitialNotification: jest.fn(async () => null),
    setBackgroundMessageHandler: jest.fn(),
    requestPermission: jest.fn(async () => 1),
    registerDeviceForRemoteMessages: jest.fn(async () => undefined),
  });
  return {__esModule: true, default: m};
});
jest.mock('@react-native-firebase/auth', () => {
  const a = () => ({
    signInWithCredential: jest.fn(async () => ({user: {email: 'thandi@example.com', displayName: 'Thandi Dlamini', uid: 'uid-test'}})),
    signOut: jest.fn(async () => undefined),
    currentUser: null,
  });
  a.GoogleAuthProvider = {credential: jest.fn(() => ({providerId: 'google.com'}))};
  return {__esModule: true, default: a};
});
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({data: {idToken: 'id-token-test', user: {email: 'thandi@example.com', name: 'Thandi Dlamini'}}})),
    signOut: jest.fn(async () => undefined),
  },
  statusCodes: {SIGN_IN_CANCELLED: '12501', IN_PROGRESS: 'IN_PROGRESS', PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE'},
}));
