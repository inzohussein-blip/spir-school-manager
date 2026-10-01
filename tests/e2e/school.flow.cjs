// School flow: setup → curriculum → section → teacher → student → timetable (conflict check). Needs a running server.
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://localhost:3100';
let fails = 0;
const vis = async (loc) => { try { await loc.first().waitFor({ state: 'visible', timeout: 4000 }); return true; } catch { return false; } };
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => d.accept());
  const go = async (p) => { await page.goto(BASE + p); await page.waitForTimeout(700); };

  await go('/welcome');
  ok(await vis(page.getByText('الإعداد والعام الدراسي')), 'welcome lists the setup station');
  ok(await vis(page.getByText('الأقساط الشهرية')), 'welcome lists fees');

  await go('/setup/school');
  await page.getByPlaceholder('مدرسة … الابتدائية').fill('مدرسة الأمل الابتدائية');
  await page.getByPlaceholder('مدرسة … الابتدائية').blur();
  await go('/setup/years'); await page.getByRole('button', { name: /إنشاء العام/ }).click();
  ok(await vis(page.getByText('العام الحالي')), 'year created');
  await go('/setup/curriculum'); await page.getByRole('button', { name: /المنهج العراقي/ }).click();
  ok(await vis(page.getByText('الأول الابتدائي')), 'curriculum seeded');
  await go('/setup/periods'); await page.getByRole('button', { name: /حصص افتراضية/ }).click();
  ok(await vis(page.getByText('الحصة 6')), 'periods seeded');

  await go('/classes'); await page.getByRole('button', { name: /شعبة جديدة/ }).click();
  await page.getByRole('button', { name: 'حفظ', exact: true }).click();
  ok(await vis(page.getByText('الأول الابتدائي / أ')), 'section created');

  await go('/teachers'); await page.getByRole('button', { name: /مدرس جديد/ }).click();
  await page.getByRole('dialog').locator('input').first().fill('أحمد المدرس');
  await page.getByRole('dialog').getByRole('button', { name: 'اللغة العربية' }).click();
  await page.getByRole('button', { name: 'إضافة', exact: true }).click();
  ok(await vis(page.getByText('أحمد المدرس')), 'teacher created');

  await go('/students'); await page.getByRole('button', { name: /طالب جديد/ }).click();
  await page.getByRole('dialog').locator('input').first().fill('زينب علي حسن');
  await page.getByRole('dialog').locator('select').nth(1).selectOption({ index: 1 });
  await page.getByRole('button', { name: 'إضافة الطالب' }).click();
  ok(await vis(page.getByText('زينب علي حسن')), 'student created');

  await go('/classes/timetable'); if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + '/tt.png' });
  await page.locator('td.cursor-pointer').first().click();
  await page.getByRole('dialog').getByRole('button', { name: /^حفظ/ }).click();
  await page.waitForTimeout(300);
  ok(await vis(page.getByText('التربية الإسلامية')), 'timetable cell saved');
  await go('/teachers/schedule'); ok(await vis(page.getByRole('heading', { name: 'جدول المدرس' })), 'teacher schedule renders');
  await go('/classes/conflicts'); ok(await vis(page.getByRole('heading', { name: /التعارضات/ })), 'conflicts page renders');
  await go('/setup'); ok(await vis(page.getByText(/اكتمل \d من 7/)), 'setup overview renders');

  // Results: enter marks, see the sheet, print certificates.
  await go('/results');
  const inputs = page.locator('tbody input');
  await inputs.nth(0).fill('80'); await inputs.nth(1).fill('70'); await inputs.nth(2).fill('90');
  await page.waitForTimeout(300);
  ok(await vis(page.getByText('84')), 'term score computed (80*.2+70*.2+90*.6 = 84)');
  await go('/results/sheet'); ok(await vis(page.getByText('84').first()), 'sheet shows the saved subject mark');
  await go('/results/certificates'); ok(await vis(page.getByRole('heading', { name: 'شهادة نجاح' })), 'certificate preview renders');
  if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + '/cert.png' });
  await page.getByRole('button', { name: /طباعة 1 شهادة/ }).click(); await page.waitForTimeout(600);
  ok(await vis(page.getByText(/^2\d{3}\/0001$/)), 'certificate serial logged');
  // Leaves + attendance.
  await go('/leaves'); await page.getByRole('button', { name: /العطل الرسمية الثابتة/ }).click();
  ok(await vis(page.getByText('عيد العمال')), 'fixed holidays added');
  await go('/attendance'); await page.getByRole('button', { name: /الكل حاضر/ }).click(); await page.waitForTimeout(300);
  ok(await vis(page.getByText('حاضر: 1')), 'roll marks all present');
  // Plan.
  await go('/plan'); await page.getByRole('button', { name: /خطة جديدة/ }).click();
  await page.getByRole('dialog').locator('textarea').fill('الوحدة الأولى | 8\nالوحدة الثانية | 8');
  await page.getByRole('button', { name: /إنشاء وتوزيع/ }).click();
  ok(await vis(page.getByText('2 وحدة')), 'annual plan created');
  // Fees need a private school.
  await go('/setup/school'); await page.getByRole('button', { name: /أهلية/ }).click();
  await go('/fees/plans'); await page.locator('input[dir="ltr"]').first().fill('50000'); await page.waitForTimeout(300);
  await go('/fees/charges'); await page.getByRole('button', { name: /إنشاء مستحقات/ }).click();
  ok(await vis(page.getByText('القسط الشهري').first()), 'monthly charge generated');
  await go('/fees/pay'); await page.getByPlaceholder(/اسم الطالب/).fill('زينب'); await page.getByRole('button', { name: /زينب علي حسن/ }).click();
  await page.getByPlaceholder(/المبلغ/).fill('20000'); await page.getByRole('button', { name: /تسجيل وطباعة الوصل/ }).click();
  ok(await vis(page.getByText(/وصل قبض رقم/)), 'receipt issued');
  ok(errors.length === 0, 'no page errors ' + errors.join(' | '));
  await page.screenshot({ path: process.env.SHOT || '/tmp/school.png' });
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
