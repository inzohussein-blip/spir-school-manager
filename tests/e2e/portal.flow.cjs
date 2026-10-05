// Web portal: owner creates a school code, a device syncs the seeded school, portal users log in by role.
// Needs a server started with LICENSE_ADMIN_PASSWORD=test1234 and AUTH_SECRET.
const { chromium, request } = require('playwright-core'); const { pbkdf2Sync, randomBytes } = require('node:crypto');
const { makeData } = require('./seed.cjs');
const BASE = process.env.BASE || 'http://localhost:3110'; const OWNER = process.env.OWNER_PW || 'test1234';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const user = (id, name, username, role, pw) => { const salt = randomBytes(16); return { id, name, username, role, salt: salt.toString('base64'), hash: pbkdf2Sync(pw, salt, 120000, 32, 'sha256').toString('base64'), active: true }; };
(async () => {
  const api = await request.newContext({ baseURL: BASE });
  const post = async (u, b) => (await api.post(u, { data: b })).json();
  ok((await post('/api/license/admin', { op: 'login', password: OWNER })).ok, 'owner signs in');
  const created = await post('/api/license/admin', { op: 'create', lab: 'مدرسة الاختبار', days: 30, trial: true, modules: ['setup', 'students', 'classes', 'teachers', 'results', 'leaves', 'plan', 'attendance', 'fees', 'admin'] });
  ok(created.ok && created.code, 'school code created'); const code = created.code;
  const act = await post('/api/license/activate', { code, device: 'device-portal-test-1', label: 'test' });
  ok(act.ok && act.token, 'device activated');
  // The device pushes the school's records (what «المزامنة التلقائية» does).
  const data = makeData(); data['school.portalUsers.v1'] = [user('u1', 'المدير', 'manager1', 'manager', 'Passw0rd!'), user('u2', 'المحاسب', 'acc1', 'accountant', 'Passw0rd!'), user('u3', 'المدرس', 'teach1', 'teacher', 'Passw0rd!')];
  const rows = []; const now = Date.now();
  for (const [coll, v] of Object.entries(data)) {
    if (Array.isArray(v) && v.every((e) => e && typeof e.id === 'string')) v.forEach((e, i) => rows.push({ coll, id: e.id, data: e, mtime: now, deleted: false, ord: i }));
    else rows.push({ coll, id: '_', data: v, mtime: now, deleted: false, ord: 0 });
  }
  let pushedAll = true;
  for (let i = 0; i < rows.length; i += 200) pushedAll = pushedAll && (await post('/api/company-sync', { op: 'push', token: act.token, device: 'device-portal-test-1', node: 'node-1', rows: rows.slice(i, i + 200) })).ok;
  ok(pushedAll, 'records pushed (' + rows.length + ')');

  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const login = async (username, password) => {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, extraHTTPHeaders: { 'x-forwarded-for': `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` } }); const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(BASE + '/portal'); await page.getByLabel('رمز المدرسة').fill(code); await page.getByLabel('اسم المستخدم').fill(username); await page.getByLabel('كلمة المرور').fill(password);
    await page.getByRole('button', { name: /دخول/ }).click(); return { ctx, page, errors };
  };
  // wrong password
  { const { ctx, page } = await login('manager1', 'wrong-pass'); await page.waitForTimeout(1500); ok(await page.getByText('بيانات الدخول غير صحيحة').isVisible(), 'wrong password is refused'); ok(page.url().endsWith('/portal'), 'stays on the login page'); await ctx.close(); }
  // manager
  { const { ctx, page, errors } = await login('manager1', 'Passw0rd!'); await page.waitForURL('**/portal/app/dashboard', { timeout: 15000 });
    await page.getByText('140').first().waitFor({ timeout: 10000 }); ok(true, 'manager sees the dashboard with 140 students');
    ok(await page.getByRole('link', { name: 'الأقساط' }).isVisible(), 'manager has the fees page');
    await page.goto(BASE + '/portal/app/students'); await page.getByPlaceholder(/بحث/).waitFor(); ok(await page.locator('tbody tr').count() > 20, 'students list renders');
    await page.goto(BASE + '/portal/app/results'); ok(await page.getByText('كشف').first().isVisible(), 'results sheet renders');
    ok(errors.length === 0, 'no page errors (manager) ' + errors.join('|'));
    await page.screenshot({ path: (process.env.SHOTS || '/tmp/claude-0/shots') + '/portal.png' }); await ctx.close(); }
  // teacher: no fees
  { const { ctx, page } = await login('teach1', 'Passw0rd!'); await page.waitForURL('**/portal/app/dashboard', { timeout: 15000 }); await page.getByText('140').first().waitFor({ timeout: 10000 });
    ok(!(await page.getByRole('link', { name: 'الأقساط' }).count()), 'teacher has no fees link');
    const d = await page.evaluate(async () => (await fetch('/api/portal/data')).json());
    ok(Object.keys(d.data).every((k) => !k.startsWith('fees.')) && !('school.portalUsers.v1' in d.data), 'teacher data holds no fees and no accounts');
    ok(!JSON.stringify(d.data['teachers.list.v1'] ?? '').includes('salary'), 'teacher data holds no salaries'); await ctx.close(); }
  // accountant: no results
  { const { ctx, page } = await login('acc1', 'Passw0rd!'); await page.waitForURL('**/portal/app/dashboard', { timeout: 15000 });
    const d = await page.evaluate(async () => (await fetch('/api/portal/data')).json());
    ok(Object.keys(d.data).some((k) => k.startsWith('fees.')) && Object.keys(d.data).every((k) => !k.startsWith('results.')), 'accountant data holds fees and no results'); await ctx.close(); }
  // no cookie → 401
  ok((await api.get('/api/portal/data')).status() === 401, 'data refuses a request without a session');
  await browser.close(); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
