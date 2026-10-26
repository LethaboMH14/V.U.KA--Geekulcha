// Bundles the real VIGIL UI (app/App.tsx) for a browser with react-native-web.
// SIMULATED preview only: no native modules, nothing signed or sent.
// Usage: npm install --legacy-peer-deps && node build.mjs [outDir]
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const repo = path.resolve(here, '../..');
const nm = path.join(here, 'node_modules');
const stub = path.join(here, 'shim/stub.js');
const out = path.resolve(process.argv[2] ?? path.join(os.tmpdir(), 'vigil-web'));
fs.mkdirSync(path.join(out, 'fonts'), {recursive: true});

const entry = path.join(out, 'entry.js');
fs.writeFileSync(entry, `import {AppRegistry} from 'react-native';
import App from ${JSON.stringify(path.join(repo, 'app/App'))};
AppRegistry.registerComponent('vigil', () => App);
AppRegistry.runApplication('vigil', {rootTag: document.getElementById('root')});
`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  outfile: path.join(out, 'app.js'),
  format: 'iife',
  loader: {'.js': 'jsx', '.png': 'dataurl'},
  resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.jsx', '.json'],
  nodePaths: [nm],
  alias: {
    'react-native': path.join(here, 'shim/react-native.js'),
    react: path.join(nm, 'react'),
    'react-dom': path.join(nm, 'react-dom'),
    'react-native-svg': path.join(nm, 'react-native-svg'),
    '@react-native-firebase/app': stub,
    '@react-native-firebase/auth': stub,
    '@react-native-firebase/messaging': stub,
    '@react-native-google-signin/google-signin': stub,
    '@react-native-community/blur': stub,
    'react-native-webview': stub,
  },
  define: {__DEV__: 'false', 'process.env.NODE_ENV': '"production"', global: 'window'},
  logLevel: 'error',
});

// The app's own fonts (IBM Plex, OFL). On Android the family is the file name.
const fontDir = path.join(repo, 'app/android/app/src/main/assets/fonts');
const faces = fs.readdirSync(fontDir).filter(f => f.endsWith('.ttf')).map(f => {
  fs.copyFileSync(path.join(fontDir, f), path.join(out, 'fonts', f));
  return `@font-face{font-family:'${f.replace(/\.ttf$/, '')}';src:url(fonts/${f}) format('truetype');font-display:block}`;
});
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VIGIL (SIMULATED preview, browser rendering)</title>
<style>${faces.join('')} html,body{margin:0;height:100%;background:#000}#root{display:flex;flex-direction:column;height:100%;width:100%}</style>
</head><body><div id="root"></div><script src="app.js"></script></body></html>
`);
console.log(`built ${out}`);
