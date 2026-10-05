"use client";

import Link from "next/link";
import { ArrowUpRight, Plus, GraduationCap, CalendarDays } from "lucide-react";
import { schoolSnapshot, attendanceSeries, rateOf, yearProgress } from "@/lib/school/stats";
import { getTimetable, getTeachers, teacherLoad, sectionLabel, levelName } from "@/lib/school/store";
import { getHolidays } from "@/lib/school/leaves";
import { getPlans } from "@/lib/school/plan";
import { actualPercent } from "@/lib/school/plan";
import { PillBars, Gauge } from "@/components/school/charts";
import { PageTitle, Empty, useLive } from "@/components/school/ui";
import { AR_DAYS, todayYmd } from "@/lib/local/util";

const tile = "rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)]";
const chip = (t: string, c: string) => <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${c}`}>{t}</span>;

/** The dashboard body; `portal` makes it read-only (no links into the stations). */
export function DashboardView({ portal = false }: { portal?: boolean }) {
  const A = (p: React.ComponentProps<typeof Link>) => (portal ? <div className={p.className}>{p.children}</div> : <Link {...p} />);
  const [d] = useLive(() => {
    const snap = schoolSnapshot(); const tt = getTimetable(); const week = attendanceSeries(14).filter((x) => x.rate !== null).slice(-7);
    const nextHoliday = getHolidays().filter((h) => h.to >= todayYmd()).sort((a, b) => a.from.localeCompare(b.from))[0];
    const plans = getPlans(); const planPct = plans.length ? Math.round(plans.reduce((n, p) => n + actualPercent(p), 0) / plans.length) : 0;
    return { snap, tt, week, nextHoliday, planPct, plans: plans.length, month: rateOf(attendanceSeries(30)), year: yearProgress(), teachers: getTeachers().filter((t) => t.active) };
  }, null);
  if (!d) return null;
  const { snap, tt, week } = d;
  const kpis = [
    { t: "إجمالي الطلاب", v: snap.students.length, n: `${snap.boys} ذكور · ${snap.girls} إناث`, dark: true, href: "/students" },
    { t: "المدرسون", v: snap.teachers.length, n: "في الكادر الفعّال", href: "/teachers" },
    { t: "الشعب الدراسية", v: snap.sections.length, n: `${snap.levels.length} صفاً في المنهج`, href: "/classes" },
    { t: "الحضور (آخر 30 يوماً)", v: `${d.month}%`, n: d.month ? "من الأيام المحضَّرة" : "لم يُحضَّر بعد", href: "/attendance" },
  ];
  const lessonsToday = (() => { const dow = new Date().getDay(); return Object.keys(tt).filter((k) => Number(k.split("|")[1]) === dow).length; })();
  return (
    <div>
      <PageTitle icon={null} title="لوحة التحكم" sub="كل ما يخص مدرستك في مكان واحد وبصورة هادئة.">
        {!portal && <>
        <Link href="/classes" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-brand to-brand-dark px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_-8px_var(--color-brand)]"><Plus className="size-4" /> شعبة جديدة</Link>
        <Link href="/students" className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-surface px-5 py-2.5 text-sm font-medium"><GraduationCap className="size-4" /> تسجيل طلاب</Link>
        </>}
      </PageTitle>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <A key={k.t} href={k.href} className={`relative block rounded-3xl p-5 ${k.dark ? "bg-gradient-to-br from-[#14733f] to-[#0b4527] text-white shadow-[0_18px_30px_-16px_#0e5530]" : "bg-surface shadow-[var(--shadow-card)]"}`}>
            <div className="flex items-start justify-between"><div className={`text-sm font-medium ${k.dark ? "text-white/90" : ""}`}>{k.t}</div>
              <span className={`grid size-9 place-items-center rounded-full border ${k.dark ? "border-white/60 bg-white text-brand-dark" : "border-line"}`}><ArrowUpRight className="size-4" /></span></div>
            <div className="mt-3 text-3xl font-extrabold tabular-nums sm:text-5xl">{k.v}</div>
            <div className={`mt-3 text-xs ${k.dark ? "text-white/75" : "text-muted"}`}>{k.n}</div>
          </A>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr_1fr]">
        <div className={tile}>
          <div className="mb-3 text-lg font-bold">الحضور في آخر أيام الدوام</div>
          {week.length ? <PillBars items={week.map((w, i) => ({ label: AR_DAYS[new Date(w.date + "T00:00:00").getDay()].replace("ال", ""), value: w.rate ?? 0, note: i === week.length - 1 || (w.rate ?? 0) === Math.max(...week.map((x) => x.rate ?? 0)) ? `${w.rate}%` : undefined, tone: i === week.length - 1 ? "dark" : (w.rate ?? 0) >= 90 ? "mid" : (w.rate ?? 0) >= 75 ? "soft" : "hatch" }))} /> : <Empty>لا تحضير مسجّل بعد. ابدأ من محطة الحضور.</Empty>}
        </div>
        <div className={`${tile} flex flex-col`}>
          <div className="text-lg font-bold">تذكير</div>
          <div className="mt-3 text-2xl font-extrabold leading-snug text-brand">{d.nextHoliday ? d.nextHoliday.name : lessonsToday ? `${lessonsToday} حصة مجدولة اليوم` : "لا مواعيد قريبة"}</div>
          <div className="mt-2 text-xs text-muted">{d.nextHoliday ? <>العطلة القادمة: <span className="tabular-nums" dir="ltr">{d.nextHoliday.from}{d.nextHoliday.to !== d.nextHoliday.from ? ` → ${d.nextHoliday.to}` : ""}</span></> : "أضف العطل الرسمية من محطة الإجازات لتظهر هنا."}</div>
          {!portal && <Link href="/classes/timetable" className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand to-brand-dark px-4 py-3 text-sm font-semibold text-white"><CalendarDays className="size-4" /> فتح جدول الشعبة</Link>}
        </div>
        <div className={tile}>
          <div className="mb-3 flex items-center justify-between"><div className="text-lg font-bold">الشعب</div>{!portal && <Link href="/classes" className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs"><Plus className="size-3" /> جديد</Link>}</div>
          <ul className="grid gap-3">{snap.sections.slice(0, 6).map((s) => (
            <li key={s.id} className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-brand-light text-sm font-bold text-brand-dark">{s.name}</span>
              <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{sectionLabel(s, snap.levels)}</div><div className="text-[11px] text-muted">{snap.students.filter((x) => x.sectionId === s.id).length} من {s.capacity} طالب</div></div></li>))}
            {!snap.sections.length && <li className="text-sm text-muted">لا شعب بعد.</li>}</ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr_1fr]">
        <div className={tile}>
          <div className="mb-3 flex items-center justify-between"><div className="text-lg font-bold">الكادر التدريسي</div>{!portal && <Link href="/teachers" className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs"><Plus className="size-3" /> إضافة مدرس</Link>}</div>
          <ul className="grid gap-3">{d.teachers.slice(0, 5).map((t) => { const n = teacherLoad(tt, t.id); const full = n === t.load; const over = n > t.load;
            return <li key={t.id} className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full text-sm font-bold text-white" style={{ background: t.color }}>{t.name.slice(0, 1)}</span>
              <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{t.name}</div><div className="truncate text-[11px] text-muted">{t.specialty || "—"} · {n} من {t.load} حصة</div></div>
              {over ? chip("فوق النصاب", "border-red-300 text-red-600") : full ? chip("مكتمل", "border-emerald-400 text-emerald-700") : n ? chip("جارٍ", "border-amber-400 text-amber-600") : chip("بلا حصص", "border-rose-300 text-rose-500")}</li>; })}
            {!d.teachers.length && <li className="text-sm text-muted">لا مدرسين بعد.</li>}</ul>
        </div>
        <div className={tile}>
          <div className="mb-2 text-lg font-bold">تقدم الخطط السنوية</div>
          <Gauge percent={d.planPct} label={d.plans ? `من ${d.plans} خطة` : "لا خطط بعد"} />
          <div className="mt-3 flex justify-center gap-4 text-[11px] text-muted"><span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-brand-dark" /> منجز</span><span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-line" /> متبقٍّ</span></div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e5530] to-[#06331c] p-5 text-white shadow-[0_18px_30px_-16px_#0e5530]">
          <div className="text-sm font-medium text-white/85">العام الدراسي</div>
          {d.year ? <>
            <div className="mt-3 text-5xl font-extrabold tabular-nums" dir="ltr">{d.year.done}<span className="text-2xl text-white/60">/{d.year.total}</span></div>
            <div className="mt-1 text-xs text-white/70">يوم دوام مضى من العام</div>
            <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-l from-[#9be3bd] to-[#3fbf7f]" style={{ width: `${d.year.percent}%` }} /></div>
            <div className="mt-2 text-end text-sm font-bold tabular-nums">{d.year.percent}%</div>
          </> : <div className="mt-4 text-sm text-white/75">أنشئ العام الدراسي من محطة الإعداد.</div>}
        </div>
      </div>
    </div>
  );
}
