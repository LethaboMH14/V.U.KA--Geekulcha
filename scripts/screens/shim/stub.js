// Android-only modules (Firebase, Google sign-in, blur, WebView): not available in a browser.
import React from 'react';
import {View} from 'react-native-web';
const noop = () => {};
const handler = {get: (_t, k) => (k === '__esModule' ? true : k === 'default' ? proxy : proxy)};
const fn = function () { return proxy; };
const proxy = new Proxy(fn, {...handler, apply: () => proxy});
export default proxy;
export const GoogleSignin = {configure: noop, hasPlayServices: async () => false, signIn: async () => { throw new Error('unavailable'); }, signOut: async () => {}};
export const statusCodes = {};
export const BlurView = ({style, children}) => React.createElement(View, {style: [style, {backgroundColor: 'rgba(20,20,24,0.6)'}]}, children);
export const WebView = ({style}) => React.createElement(View, {style});
