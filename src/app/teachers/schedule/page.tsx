"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Printer } from "lucide-react";
import { getTeachers, getSections, getLevels, getSubjects, getTimetable, getPeriods, getInfo, slotKey, levelName, teacherLoad } from "@/lib/school/store";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { TimetableGrid } from "@/components/school/TimetableGrid";
import { PageTitle, Empty, inp, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function TeacherSchedule() {
  const [d] = useLive(() => ({ teachers: getTeachers().filter((t) => t.active), sections: getSections(), levels: getLevels(), subjects: getSubjects(), tt: getTimetable(), periods: getPeriods(), info: getInfo() }), null);
  const [id, setId] = useState(""); const [all, setAll] = useState(false);
  useEffect(() => { if (d && !d.teachers.some((t) => t.id === id)) setId(d.teachers[0]?.id ?? ""); }, [d, id]);
  if (!d) return null;
  const { teachers, sections, levels, subjects, tt, periods, info } = d;
  const grid = (tid: string) => (
    <TimetableGrid print={all} days={info.workDays} periods={periods} cell={(day, no) => {
      const hit = sections.map((s) => ({ s, x: tt[slotKey(s.id, day, no)] })).find((h) => h.x?.teacherId === tid);
      if (!hit) return null;
      const sub = subjects.find((q) => q.id === hit.x.subjectId);
      return <div className="rounded-md px-1 py-1" style={{ background: (sub?.color ?? "#64748b") + "22" }}><div className="font-semibold leading-tight">{sub?.name}</div><div className="text-[10px] text-gray-600">{levelName(levels.find((l) => l.id === hit.s.levelId))} / {hit.s.name}</div></div>;
    }} />
  );
  return (
    <div>
      <PageTitle icon={<CalendarDays className="size-6 text-brand" />} title="جدول المدرس" sub="يُشتق تلقائياً من جداول الشعب؛ لتعديله عدّل جدول الشعبة.">
        {!all && <select value={id} onChange={(e) => setId(e.target.value)} className={`w-56 ${inp}`}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>}
        <button onClick={() => setAll(!all)} className={btnGhost}>{all ? "مدرس واحد" : "كل المدرسين"}</button>
        <button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة</button>
      </PageTitle>
      {!teachers.length || !periods.length ? <Empty>أضف المدرسين وحدّد الحصص أولاً.</Empty> : all
        ? teachers.map((t, i) => <SchoolSheet key={t.id} title={`جدول المدرس: ${t.name}`} breakBefore={i > 0}>{grid(t.id)}<p className="mt-2 text-[11px] text-gray-500">مجموع الحصص: {teacherLoad(tt, t.id)} من نصاب {t.load}</p></SchoolSheet>)
        : teachers.find((t) => t.id === id) && <SchoolSheet title={`جدول المدرس: ${teachers.find((t) => t.id === id)!.name}`}>{grid(id)}<p className="mt-2 text-[11px] text-gray-500">مجموع الحصص: {teacherLoad(tt, id)} من نصاب {teachers.find((t) => t.id === id)!.load}</p></SchoolSheet>}
    </div>
  );
}
