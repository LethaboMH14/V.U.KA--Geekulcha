// Showcase helper: opens the real VIGIL UI (browser rendering, SIMULATED preview)
// in a visible phone-sized window, runs the test onboarding, and leaves it on Home.
// Nothing is signed or sent. Say so aloud when showing it.
//
// Usage (after `node build.mjs <dir>` and serving <dir> on port 8790):
//   node showcase.cjs            # visible window, stays open until you close it
//   HEADLESS=1 node showcase.cjs # check it reaches Home without a window
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const url = process.env.VIGIL_URL || 'http://127.0.0.1:8790/';
const headless = process.env.HEADLESS === '1';
const steps = fs
  .readFileSync(path.join(__dirname, 'onboarding-flow.txt'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .concat(['click:Done', 'wait:1500', 'click:Finish setup', 'wait:2000']);

(async () => {
  const browser = await chromium.launch({headless, args: ['--window-size=430,960']});
  const page = await browser.newPage({viewport: {width: 412, height: 892}});
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.evaluate(() => document.fonts.ready);
  for (const s of steps) {
    const [op, ...rest] = s.split(':');
    const arg = rest.join(':');
    if (op === 'click') await page.getByText(arg, {exact: true}).last().click({timeout: 5000});
    else if (op === 'fill') {
      const [i, ...v] = arg.split(':');
      await page.locator('input,textarea').nth(Number(i)).fill(v.join(':'));
    } else if (op === 'keys') {
      for (const ch of arg) await page.getByText(ch, {exact: true}).last().click();
    } else if (op === 'wait') await page.waitForTimeout(Number(arg));
    await page.waitForTimeout(400);
  }
  const home = await page.getByText('Preview: show a check-in').count();
  console.log(home ? 'On Home. Test PINs: normal 1357, duress 2468.' : 'Did not reach Home; finish onboarding by hand.');
  if (headless) await browser.close();
})().catch(e => {
  console.error('showcase failed:', e.message.split('\n')[0]);
  process.exit(1);
});
