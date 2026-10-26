// Drive the SIMULATED preview by visible text. Usage: node step.cjs out.png "click:Get started" "fill:0:0712345678" ...
const {chromium} = require('playwright');
(async () => {
  const [, , out, ...steps] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 412, height: 892}, deviceScaleFactor: 2});
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 200)));
  await p.goto('http://127.0.0.1:8790/', {waitUntil: 'networkidle'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1200);
  let i = 0;
  for (const s of steps) {
    const [op, ...rest] = s.split(':');
    const arg = rest.join(':');
    if (op === 'click') await p.getByText(arg, {exact: true}).last().click({timeout: 5000});
    else if (op === 'clickre') await p.getByText(new RegExp(arg)).last().click({timeout: 5000});
    else if (op === 'role') await p.getByRole('button', {name: arg}).first().click({timeout: 5000});
    else if (op === 'fill') { const [idx, ...v] = arg.split(':'); await p.locator('input,textarea').nth(Number(idx)).fill(v.join(':')); }
    else if (op === 'type') await p.keyboard.type(arg, {delay: 60});
    else if (op === 'keys') { for (const ch of arg) { await p.getByText(ch, {exact: true}).last().click(); await p.waitForTimeout(80); } }
    else if (op === 'wait') await p.waitForTimeout(Number(arg));
    else if (op === 'shot') await p.screenshot({path: arg});
    await p.waitForTimeout(700);
    i++;
  }
  await p.screenshot({path: out});
  console.log((await p.innerText('body')).replace(/\n+/g, ' | ').slice(0, 1200));
  if (errs.length) console.log('---ERRS', errs.slice(0, 8).join('\n'));
  await b.close();
})().catch(e => { console.error('FAIL', e.message.split('\n')[0]); process.exit(1); });
