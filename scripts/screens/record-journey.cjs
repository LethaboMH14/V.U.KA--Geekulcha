// Records the Thandi user journey through the real VIGIL UI in its SIMULATED preview,
// with captions beside the phone. Output is a browser recording, not a phone recording.
// Nothing is signed or sent. Setup is recorded too, so the caller can trim it using the
// timestamps printed at the end (setupEndMs).
//
// Usage: node record-journey.cjs <outDir>   (app must be served at VIGIL_URL, default :8790)
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const outDir = path.resolve(process.argv[2] || 'journey-out');
const url = process.env.VIGIL_URL || 'http://127.0.0.1:8790/';
const flow = fs
  .readFileSync(path.join(__dirname, 'onboarding-flow.txt'), 'utf8')
  .split('\n')
  .filter(Boolean);

const CAPTIONS = {
  setup: 'Setting up a test member (trimmed from the video).',
  home: '1 · Before a risky trip, Thandi activates VIGIL. Activate is the last button she presses. It listens until she deactivates it, and Android shows the microphone dot.',
  check:
    '2 · A sound such as breaking glass never raises an alarm on its own. It opens a quiet check-in. In this preview a button opens it; in use, the sound does. No audio is stored.',
  normal: '3 · Her normal PIN. The check-in closes and nothing is sent to anyone.',
  duress:
    '4 · Her duress PIN. The screen is the same "Checked in" screen. What her guardians receive is shown next.',
  guardian:
    '5 · Her guardian\'s phone, in the preview: "Don\'t call or text Lerato. Call 10111." The guardian chooses what to do. VUKA dispatches no one.',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(outDir, {recursive: true});
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: {width: 1920, height: 1080},
    recordVideo: {dir: outDir, size: {width: 1920, height: 1080}},
  });
  const page = await context.newPage();
  const started = Date.now();
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.evaluate(() => document.fonts.ready);

  // Layout: phone on the left, captions on the right. Applied outside React's root.
  await page.addStyleTag({
    content: `
      html, body { margin:0; height:100%; background:#061426 !important; overflow:hidden; }
      #root { position:absolute !important; left:200px !important; top:94px !important; width:412px !important;
        height:892px !important; border-radius:30px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,.5); }
      #cap { position:absolute; left:760px; top:300px; width:960px; color:#f1f1f1;
        font-family:'IBMPlexSans-Regular', sans-serif; font-size:36px; line-height:1.4; }
      #cap .tag { font-family:'IBMPlexMono-Regular', monospace; font-size:16px; letter-spacing:.12em;
        color:#56d6b8; margin-bottom:18px; text-transform:uppercase; }
      #cap .foot { position:absolute; top:880px; font-size:22px; color:#aab6c6; line-height:1.4; width:960px; }
    `,
  });
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.id = 'cap';
    d.innerHTML = '<div class="tag">VIGIL · simulated preview</div><div class="txt"></div>' +
      '<div class="foot">Browser rendering of the app\'s real code. SIMULATED: nothing is signed or sent. ' +
      'Not a phone recording. Testnet and simulated bank, as stated.</div>';
    document.body.appendChild(d);
  });
  const caption = async key => {
    await page.evaluate(t => (document.querySelector('#cap .txt').textContent = t), CAPTIONS[key]);
  };

  // Set-up (trimmed later).
  await caption('setup');
  for (const s of flow) {
    const [op, ...rest] = s.split(':');
    const arg = rest.join(':');
    if (op === 'click') await page.getByText(arg, {exact: true}).last().click({timeout: 8000});
    else if (op === 'fill') {
      const [i, ...v] = arg.split(':');
      await page.locator('input,textarea').nth(Number(i)).fill(v.join(':'));
    } else if (op === 'keys') for (const ch of arg) await page.getByText(ch, {exact: true}).last().click();
    else if (op === 'wait') await sleep(Number(arg));
    await sleep(250);
  }
  await page.getByText('Done', {exact: true}).last().click({timeout: 8000}).catch(() => {});
  await sleep(800);
  await page.getByText('Finish setup', {exact: true}).last().click({timeout: 8000}).catch(() => {});
  await page.waitForFunction(() => document.body.innerText.includes('Preview: show a check-in'), null, {timeout: 20000});
  const setupEndMs = Date.now() - started;

  // 1 · Home, listening.
  await caption('home');
  await sleep(9000);

  // 2 · Quiet check-in opens.
  await caption('check');
  await page.getByText('Preview: show a check-in', {exact: true}).last().click();
  await page.waitForFunction(() => document.body.innerText.includes('Enter your PIN to continue'), null, {timeout: 10000});
  await sleep(6000);

  // 3 · Normal PIN.
  await caption('normal');
  for (const ch of '1357') await page.getByText(ch, {exact: true}).last().click() && await sleep(180);
  await page.waitForFunction(() => document.body.innerText.includes('Checked in'), null, {timeout: 10000});
  await sleep(3000);
  await page.waitForFunction(() => document.body.innerText.includes('Preview: show a check-in'), null, {timeout: 20000});
  await sleep(2500);

  // 4 · Duress PIN, same screen.
  await caption('duress');
  await page.getByText('Preview: show a check-in', {exact: true}).last().click();
  await page.waitForFunction(() => document.body.innerText.includes('Enter your PIN to continue'), null, {timeout: 10000});
  await sleep(2000);
  for (const ch of '2468') await page.getByText(ch, {exact: true}).last().click() && await sleep(180);
  await page.waitForFunction(() => document.body.innerText.includes('Checked in'), null, {timeout: 10000});
  await sleep(4000);
  await page.waitForFunction(() => document.body.innerText.includes('Preview: show a check-in'), null, {timeout: 20000});
  await sleep(1500);

  // 5 · Guardian view, alert state.
  await caption('guardian');
  await page.getByRole('button', {name: 'Settings'}).first().click();
  await sleep(1500);
  await page.getByText('Preview what a guardian sees (simulated)', {exact: true}).last().click();
  await sleep(1500);
  await page.getByText('Alert', {exact: true}).last().click();
  await sleep(9000);

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();
  const meta = {videoPath, setupEndMs, totalMs: Date.now() - started};
  fs.writeFileSync(path.join(outDir, 'timings.json'), JSON.stringify(meta, null, 2));
  console.log(JSON.stringify(meta, null, 2));
})().catch(e => {
  console.error('record failed:', e.message.split('\n')[0]);
  process.exit(1);
});
