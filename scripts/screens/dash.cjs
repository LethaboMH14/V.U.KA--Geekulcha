const {chromium} = require('playwright');
const out = (process.argv[2] || '.') + '/';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1280, height: 800}, deviceScaleFactor: 2});
  await p.goto('http://127.0.0.1:8765/dashboard/', {waitUntil: 'load'});
  await p.waitForTimeout(6000);
  await p.screenshot({path: out + 'dash-home.png'});
  console.log('HERO:', (await p.innerText('body')).replace(/\n+/g, ' | ').slice(0, 900));
  await p.locator('#banks').scrollIntoViewIfNeeded();
  await p.evaluate(() => document.querySelector('#banks').scrollIntoView({block: 'start'}));
  await p.waitForTimeout(800);
  await p.screenshot({path: out + 'dash-banks.png'});
  await p.goto('http://127.0.0.1:8765/dashboard/ledger/#verify', {waitUntil: 'load'});
  await p.waitForTimeout(6000);
  await p.screenshot({path: out + 'dash-verify.png'});
  console.log('VERIFY:', (await p.innerText('main') .catch(() => p.innerText('body'))).replace(/\n+/g, ' | ').slice(0, 700));
  await b.close();
})();
