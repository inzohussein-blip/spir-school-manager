const { chromium } = require('playwright-core'); const seed = require('./seed.cjs');
const BASE = process.env.BASE || 'http://localhost:3102'; const OUT = process.env.OUT || '/tmp/claude-0/shots';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); if (process.env.UI) await ctx.addInitScript((u) => localStorage.setItem('school-ui', u), process.env.UI);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
  await seed(page, BASE);
  for (const [p, n] of [['/dashboard', 'dash'], ['/dashboard/analytics', 'analytics'], ['/plan/board', 'board'], ['/students', 'students'], ['/classes/timetable', 'tt'], ['/welcome', 'welcome']]) {
    await page.goto(BASE + p); await page.waitForTimeout(1200); await page.screenshot({ path: `${OUT}/${process.env.UI ? process.env.UI + '-' : ''}${n}.png`, fullPage: true });
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
