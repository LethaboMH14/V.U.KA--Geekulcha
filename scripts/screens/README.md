# Deck screenshots from the real VIGIL UI (browser rendering)

Renders `app/App.tsx` in a browser with react-native-web, in the app's SIMULATED preview mode, so decks can show the real screens instead of stock mock-ups. **This is not a device build** and its output must be captioned as a browser rendering (`compose.py` bakes the caption in).

```sh
cd scripts/screens
npm install --legacy-peer-deps        # react-native-svg declares react-native as a peer; it is aliased to react-native-web
node build.mjs /tmp/vigil-web         # bundles app/App.tsx; copies the app's fonts
(cd /tmp/vigil-web && python3 -m http.server 8790 --bind 127.0.0.1 &)
mapfile -t F < onboarding-flow.txt    # test account: Demo Member, demo@example.com, test PINs
node drive.cjs /tmp/shots/vigil-home.png "${F[@]}" "click:Done" "wait:1500" "click:Finish setup" "wait:2500"
python3 compose.py /tmp/shots /tmp/deck   # framed composites with the caveat baked in
```

`drive.cjs` steps: `click:<exact text>`, `clickre:<regex>`, `role:<button name>`, `fill:<input index>:<value>`, `keys:<digits on the keypad>`, `wait:<ms>`, `shot:<path>`. `dash.cjs <outDir>` captures the dashboard from a server on port 8765 at the repository root.

**Shim** (`shim/react-native.js`): react-native-web, plus `Platform.OS = 'android'`, `NativeModules = {}`, a `PermissionsAndroid` that grants everything, and no-op `BackHandler` and `NativeEventEmitter`. **Stubs** (`shim/stub.js`): Firebase, Google sign-in, blur and WebView.
