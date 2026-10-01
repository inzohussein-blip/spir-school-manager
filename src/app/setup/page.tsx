"use client";

import Link from "next/link";
import { LayoutDashboard, Check, Circle, ArrowLeft } from "lucide-react";
import { getInfo, getYears, getLevels, getSubjects, getPeriods, getStudents, getSections, getTeachers, KIND_LABEL } from "@/lib/school/store";
import { PageTitle, card, useLive } from "@/components/school/ui";

export default function SetupHome() {
  const [d] = useLive(() => ({
    info: getInfo(), years: getYears().length, levels: getLevels().length, subjects: getSubjects().length,
    periods: getPeriods().length, students: getStudents().length, sections: getSections().length, teachers: getTeachers().length,
  }), null);
  if (!d) return null;
  const steps = [
    { done: !!d.info.name.trim(), href: "/setup/school", t: "بيانات المدرسة", n: d.info.name.trim() ? `${d.info.name} — ${KIND_LABEL[d.info.kind]}` : "اكتب اسم المدرسة واختر نوعها (حكومية / أهلية)." },
    { done: d.years > 0, href: "/setup/years", t: "العام الدراسي والفصول", n: d.years ? `${d.years} عام مسجّل` : "أنشئ العام الدراسي الحالي وفصليه." },
    { done: d.levels > 0 && d.subjects > 0, href: "/setup/curriculum", t: "المراحل والصفوف والمواد", n: d.levels ? `${d.levels} صف · ${d.subjects} مادة` : "حمّل المنهج العراقي الافتراضي ثم عدّله." },
    { done: d.periods > 0, href: "/setup/periods", t: "الحصص وأيام الدوام", n: d.periods ? `${d.periods} فقرة في اليوم` : "حدّد أوقات الحصص والاستراحة وأيام الدوام." },
    { done: d.sections > 0, href: "/classes", t: "الشعب الدراسية", n: d.sections ? `${d.sections} شعبة` : "أنشئ الشعب (أ، ب…) لكل صف — من محطة الصفوف والفصول." },
    { done: d.teachers > 0, href: "/teachers", t: "المدرسون", n: d.teachers ? `${d.teachers} مدرس` : "أضف الكادر التدريسي — من محطة الكادر." },
    { done: d.students > 0, href: "/students", t: "الطلاب", n: d.students ? `${d.students} طالب` : "سجّل الطلاب ووزّعهم على الشعب — من محطة الطلاب." },
  ];
  const done = steps.filter((s) => s.done).length;
  return (
    <div>
      <PageTitle icon={<LayoutDashboard className="size-6 text-brand" />} title="الإعداد والعام الدراسي" sub="خطوات تهيئة المدرسة بالترتيب؛ كل المحطات الأخرى تقرأ ما تدخله هنا." />
      <div className={`${card} mb-5`}>
        <div className="mb-2 flex items-center justify-between text-sm"><b>اكتمل {done} من {steps.length}</b><span className="tabular-nums text-muted">{Math.round((done / steps.length) * 100)}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${(done / steps.length) * 100}%` }} /></div>
      </div>
      <ol className="grid gap-3">
        {steps.map((s, i) => (
          <li key={s.href}>
            <Link href={s.href} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)] hover:border-brand">
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${s.done ? "bg-brand text-white" : "bg-canvas text-muted"}`}>{s.done ? <Check className="size-4" /> : <Circle className="size-4" />}</span>
              <span className="min-w-0 flex-1"><span className="block font-semibold">{i + 1}. {s.t}</span><span className="block text-xs text-muted">{s.n}</span></span>
              <ArrowLeft className="size-4 text-muted" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
