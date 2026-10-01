"use client";

import { Printer } from "lucide-react";
import { getSections, getLevels, getSubjects, getTeachers, getTimetable, getPeriods, getInfo, slotKey, sectionLabel } from "@/lib/school/store";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { TimetableGrid } from "@/components/school/TimetableGrid";
import { PageTitle, Empty, btnPrimary, useLive } from "@/components/school/ui";

export default function PrintAll() {
  const [d] = useLive(() => ({ sections: getSections(), levels: getLevels(), subjects: getSubjects(), teachers: getTeachers(), tt: getTimetable(), periods: getPeriods(), info: getInfo() }), null);
  if (!d) return null;
  const { sections, levels, subjects, teachers, tt, periods, info } = d;
  return (
    <div>
      <PageTitle icon={<Printer className="size-6 text-brand" />} title="طباعة جداول كل الشعب" sub="جدول لكل شعبة في صفحة A4 أفقية مستقلة.">
        <button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة الكل</button>
      </PageTitle>
      {!sections.length || !periods.length ? <Empty>لا شعب أو حصص بعد.</Empty> : sections.map((s, i) => (
        <SchoolSheet key={s.id} title={`جدول ${sectionLabel(s, levels)}`} breakBefore={i > 0}>
          <TimetableGrid print days={info.workDays} periods={periods} cell={(day, no) => {
            const x = tt[slotKey(s.id, day, no)]; if (!x) return null;
            const sub = subjects.find((q) => q.id === x.subjectId); const t = teachers.find((q) => q.id === x.teacherId);
            return <div><div className="font-semibold">{sub?.name}</div>{t && <div className="text-[10px] text-gray-600">{t.name}</div>}</div>;
          }} />
        </SchoolSheet>
      ))}
    </div>
  );
}
