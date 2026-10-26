// Browser shim for screenshots only: react-native-web plus Android-only APIs stubbed.
// SIMULATED preview: no native modules, nothing signed or sent.
export * from 'react-native-web';
import * as RNW from 'react-native-web';
export const Platform = {
  ...RNW.Platform,
  OS: 'android',
  Version: 34,
  select: o => ('android' in o ? o.android : o.native !== undefined ? o.native : o.default),
};
export const NativeModules = {};
export class NativeEventEmitter {
  addListener() { return {remove() {}}; }
  removeAllListeners() {}
  removeSubscription() {}
}
export const PermissionsAndroid = {
  PERMISSIONS: new Proxy({}, {get: (_t, k) => `android.permission.${String(k)}`}),
  RESULTS: {GRANTED: 'granted', DENIED: 'denied', NEVER_ASK_AGAIN: 'never_ask_again'},
  request: async () => 'granted',
  requestMultiple: async list => Object.fromEntries(list.map(k => [k, 'granted'])),
  check: async () => true,
};
const RNWStatusBar = RNW.StatusBar;
export const StatusBar = Object.assign(props => (RNWStatusBar ? RNWStatusBar(props) : null), RNWStatusBar || {}, {currentHeight: 24});
export const BackHandler = {addEventListener: () => ({remove() {}}), removeEventListener() {}, exitApp() {}};
