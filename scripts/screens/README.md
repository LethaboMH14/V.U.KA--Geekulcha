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

## Showcase (presenter laptop)

Shows the real UI live in its SIMULATED preview, with no server. Say aloud that it is the simulated preview.

```sh
cd scripts/screens
npm install --legacy-peer-deps
npm install --no-save playwright && npx playwright install chromium   # only if Playwright isn't installed
node build.mjs ./showcase-web
cd showcase-web && python3 -m http.server 8790      # Windows: python -m http.server 8790
# in a second terminal, from scripts/screens:
node showcase.cjs        # opens a phone-sized window, runs the test onboarding, stops on Home
```

On Home, **Preview: show a check-in** opens a check-in. Test PINs: normal 1357, duress 2468. **Settings → Guardian view** shows what a guardian sees. A page reload clears the in-memory state; run `showcase.cjs` again. `showcase-web/` is a build output: don't commit it.

## Journey recording (for slide videos)

`record-journey.cjs` records the Thandi journey through the simulated preview at 1920×1080, with captions beside the phone. It is a browser recording, not a phone recording, and the title and end cards say so. Captions follow `docs/venture/09-AFRETEC-SHOWCASE.md` §4; the Thandi journey is an illustrative composite.

```sh
cd scripts/screens && node build.mjs <build>            # the preview must be served on 8790 from <build>
node record-journey.cjs <out>                           # writes page@*.webm and timings.json
SETUP=$(node -p "require('<out>/timings.json').setupEndMs/1000")
ffmpeg -y -ss "$SETUP" -i <out>/page@*.webm -an -vf fps=30,format=yuv420p -c:v libx264 -crf 18 <out>/clip.mp4
python3 journey-cards.py <build>/fonts <out>            # card-title, card-problem, card-cant, card-measured (PNG)
ffmpeg -y -loop 1 -t 5 -i <out>/card-title.png -loop 1 -t 6 -i <out>/card-problem.png -i <out>/clip.mp4 \
  -loop 1 -t 6 -i <out>/card-cant.png -loop 1 -t 7 -i <out>/card-measured.png \
  -filter_complex "[0:v]fps=30,format=yuv420p,setsar=1,fade=t=in:st=0:d=0.5,fade=t=out:st=4.5:d=0.5[v0];[1:v]fps=30,format=yuv420p,setsar=1,fade=t=in:st=0:d=0.5,fade=t=out:st=5.5:d=0.5[v1];[2:v]fps=30,format=yuv420p,setsar=1[v2];[3:v]fps=30,format=yuv420p,setsar=1,fade=t=in:st=0:d=0.5,fade=t=out:st=5.5:d=0.5[v3];[4:v]fps=30,format=yuv420p,setsar=1,fade=t=in:st=0:d=0.5,fade=t=out:st=6.5:d=0.5[v4];[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[out]" \
  -map "[out]" -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart -an <out>/final.mp4
```

The result is silent (no audio track), about 66 seconds. No narration: a voice-over is a separate decision. `setupEndMs` trims the set-up. The measured card's figures are from `docs/eval/cem1-measurements.md`; change a figure only when that file changes.
