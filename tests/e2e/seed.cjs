// Fills a browser context with a realistic school (IndexedDB "lab-local"/kv) for screenshots and demos.
const NAMES = ['أحمد','محمد','علي','حسين','زينب','فاطمة','مريم','سارة','يوسف','عمر','نور','هدى','كرار','مصطفى','رقية','آية'];
const FATH = ['حسن','جاسم','كاظم','حميد','عباس','صالح','ناصر','رشيد'];
const id = (p, i) => `${p}${i}`;
module.exports = async function seed(page, base) {
  await page.goto(base + '/setup'); await page.waitForTimeout(1500);
  const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString('en-CA');
  const y0 = new Date().getMonth() >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const year = { id: 'y1', name: `${y0}-${y0 + 1}`, start: `${y0}-10-01`, end: `${y0 + 1}-06-30`, current: true };
  const subjects = ['التربية الإسلامية','اللغة العربية','اللغة الإنكليزية','الرياضيات','العلوم','الاجتماعيات'].map((n, i) => ({ id: id('sub', i), name: n, color: ['#0284c7','#16a34a','#d97706','#db2777','#7c3aed','#0d9488'][i] }));
  const levels = [{ id: 'l1', stage: 'primary', name: 'الأول الابتدائي', order: 0 }, { id: 'l2', stage: 'primary', name: 'الثاني الابتدائي', order: 1 }, { id: 'l3', stage: 'intermediate', name: 'الأول المتوسط', order: 2 }, { id: 'l4', stage: 'secondary', name: 'الرابع الإعدادي', branch: 'علمي', order: 3 }];
  const curriculum = levels.flatMap((l) => subjects.map((s, i) => ({ id: `${l.id}${s.id}`, levelId: l.id, subjectId: s.id, weekly: [2, 5, 3, 4, 3, 2][i], max: 100 })));
  const periods = []; let t = 480, no = 1; const f = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  for (let i = 0; i < 6; i++) { periods.push({ id: 'p' + no, no: no++, start: f(t), end: f(t + 45) }); t += 45; if (i === 2) { periods.push({ id: 'p' + no, no: no++, start: f(t), end: f(t + 20), isBreak: true }); t += 20; } }
  const sections = [['s1', 'l1', 'أ'], ['s2', 'l1', 'ب'], ['s3', 'l2', 'أ'], ['s4', 'l3', 'أ'], ['s5', 'l4', 'أ']].map(([i, l, n]) => ({ id: i, levelId: l, name: n, capacity: 35 }));
  const teachers = ['سعاد كريم','علي حسن','نبيل صالح','هدى جاسم','مرتضى عباس','رنا فاضل','حيدر ناصر'].map((n, i) => ({ id: id('t', i), name: n, specialty: ['عربي','رياضيات','علوم','إنكليزي','إسلامية','اجتماعيات','رياضيات'][i], subjectIds: [subjects[i % 6].id], load: 24, active: true, color: ['#0284c7','#16a34a','#d97706','#db2777','#7c3aed','#0d9488','#dc2626'][i], contract: 'permanent' }));
  const students = Array.from({ length: 140 }, (_, i) => ({ id: id('st', i), no: String(i + 1), name: `${NAMES[i % 16]} ${FATH[i % 8]} ${FATH[(i * 3) % 8]} ${NAMES[(i * 5) % 16]}`, gender: i % 2 ? 'f' : 'm', status: 'active', enrolledAt: day(-(i % 45) * 2 - 3), sectionId: sections[i % 5].id }));
  const tt = {}; sections.forEach((s, si) => { for (let d = 0; d < 5; d++) for (let n = 1; n <= 6; n++) { const k = (d * 6 + n + si) % 6; tt[`${s.id}|${d}|${n}`] = { subjectId: subjects[k].id, teacherId: teachers[(k + si) % 7].id }; } });
  const roll = {}; for (let i = 0; i < 90; i++) { const dt = day(-i); const dow = new Date(dt + 'T00:00:00').getDay(); if (dow === 5 || dow === 6) continue; students.forEach((s, j) => { const r = ((j * 7 + i * 13) % 100); roll[`${dt}|${s.id}`] = r < 4 ? 'a' : r < 7 ? 'l' : r < 9 ? 'e' : 'p'; }); }
  const plans = [0, 1, 2, 3].map((i) => ({ id: 'pl' + i, teacherId: teachers[i].id, subjectId: subjects[i].id, levelId: 'l1', yearId: 'y1', units: Array.from({ length: 6 }, (_, u) => ({ id: `u${i}${u}`, title: ['الأعداد','الجمع','الطرح','الأشكال','القياس','مراجعة'][u] + ' — ' + subjects[i].name, lessons: 6, done: u < i + 1 ? 100 : u === i + 1 ? 50 : 0, from: u * 5, to: u * 5 + 4 })) }));
  const data = {
    'school.settings.v1': { name: 'مدرسة الأمل الأهلية', subtitle: 'مديرية تربية الكرخ', footer: '', logo: '', kind: 'private', province: 'بغداد', directorate: 'الكرخ الأولى', principal: 'أ. ليلى حسين', phone: '', gender: 'mixed', workDays: [0,1,2,3,4], shift: '' },
    'school.years.v1': [year], 'school.terms.v1': [{ id: 'tm1', yearId: 'y1', name: 'الفصل الأول', start: year.start, end: `${y0 + 1}-01-31` }, { id: 'tm2', yearId: 'y1', name: 'الفصل الثاني', start: `${y0 + 1}-02-01`, end: year.end }],
    'school.levels.v1': levels, 'school.subjects.v1': subjects, 'school.curriculum.v1': curriculum, 'school.periods.v1': periods,
    'students.list.v1': students, 'classes.sections.v1': sections, 'classes.timetable.v1': tt, 'teachers.list.v1': teachers,
    'attendance.students.v1': roll, 'plan.list.v1': plans,
    'leaves.holidays.v1': [{ id: 'h1', name: 'عطلة منتصف الفصل', from: day(6), to: day(8), kind: 'school' }],
    'leaves.staff.v1': [{ id: 'lv1', teacherId: 't1', type: 'sick', from: day(1), to: day(2), status: 'pending' }],
    'fees.settings.v1': { monthly: { l1: 150000, l2: 150000, l3: 200000, l4: 250000 }, registration: 50000, dueDay: 5 },
    'fees.payments.v1': students.slice(0, 60).map((s, i) => ({ id: 'pay' + i, no: `2026/${String(i + 1).padStart(5, '0')}`, studentId: s.id, date: day(-(i % 28)), amount: 150000 })),
    'fees.charges.v1': students.map((s, i) => ({ id: 'ch' + i, studentId: s.id, month: new Date().toLocaleDateString('en-CA').slice(0, 7), amount: 150000, kind: 'monthly', label: 'القسط الشهري' })),
  };
  await page.evaluate(async (d) => {
    const db = await new Promise((res, rej) => { const r = indexedDB.open('lab-local'); r.onsuccess = () => res(r.result); r.onerror = rej; });
    const names = [...db.objectStoreNames]; const store = names.includes('kv') ? 'kv' : names[0];
    await new Promise((res, rej) => { const tx = db.transaction(store, 'readwrite'); for (const [k, v] of Object.entries(d)) tx.objectStore(store).put(JSON.stringify(v), k); tx.oncomplete = res; tx.onerror = rej; });
    db.close();
  }, data);
};
