"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Users, Search, Phone } from "lucide-react";
import { getStudents, getSections, getLevels, getTeachers, getSubjects, getTimetable, teacherLoad, sectionLabel, STUDENT_STATUS, CONTRACT_LABEL } from "@/lib/school/store";
import { PageTitle, Empty, inp, card, useLive } from "@/components/school/ui";
import { money, CURRENCY } from "@/lib/utils";

const norm = (t: string) => t.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

export function StudentsList() {
  const [d] = useLive(() => ({ students: getStudents(), sections: getSections(), levels: getLevels() }), null);
  const [q, setQ] = useState(""); const [sec, setSec] = useState(""); const [limit, setLimit] = useState(60);
  const shown = useMemo(() => (d?.students ?? []).filter((s) => (!sec || s.sectionId === sec) && (!q.trim() || norm(`${s.name} ${s.no} ${s.guardian ?? ""}`).includes(norm(q.trim())))), [d, q, sec]);
  if (!d) return null;
  return (
    <div>
      <PageTitle icon={<GraduationCap className="size-6" />} title="الطلاب" sub={`${d.students.filter((s) => s.status === "active").length} طالب مستمر من ${d.students.length}`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1"><Search className="pointer-events-none absolute start-3 top-3 size-4 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو الرقم أو ولي الأمر…" className={`${inp} ps-9`} /></div>
        <select value={sec} onChange={(e) => setSec(e.target.value)} className={`max-w-56 ${inp}`}><option value="">كل الشعب</option>{d.sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s, d.levels)}</option>)}</select>
      </div>
      {!shown.length ? <Empty>لا طلاب.</Empty> : (
        <div className={`${card} overflow-x-auto !p-0`}>
          <table className="w-full text-sm"><thead><tr className="border-b border-line bg-canvas text-xs text-muted"><th className="p-3 text-start">رقم</th><th className="p-3 text-start">الاسم</th><th className="p-3 text-start">الشعبة</th><th className="p-3 text-start">ولي الأمر</th><th className="p-3 text-start">الهاتف</th><th className="p-3 text-start">الحالة</th></tr></thead>
            <tbody>{shown.slice(0, limit).map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0"><td className="p-3 tabular-nums">{s.no}</td><td className="p-3 font-medium">{s.name}</td><td className="p-3">{sectionLabel(d.sections.find((x) => x.id === s.sectionId), d.levels)}</td><td className="p-3">{s.guardian || "—"}</td><td className="p-3 tabular-nums" dir="ltr">{s.phone || "—"}</td><td className="p-3 text-xs">{STUDENT_STATUS[s.status]}</td></tr>))}</tbody></table>
          {shown.length > limit && <div className="border-t border-line p-3 text-center"><button onClick={() => setLimit((l) => l + 100)} className="rounded-full border border-ink/15 px-4 py-2 text-sm">عرض المزيد ({shown.length - limit})</button></div>}
        </div>
      )}
    </div>
  );
}

export function TeachersList() {
  const [d] = useLive(() => ({ teachers: getTeachers(), subjects: getSubjects(), tt: getTimetable() }), null);
  if (!d) return null;
  const hasSalary = d.teachers.some((t) => t.salary);
  return (
    <div>
      <PageTitle icon={<Users className="size-6" />} title="الكادر التدريسي" sub={`${d.teachers.filter((t) => t.active).length} مدرس فعّال`} />
      {!d.teachers.length ? <Empty>لا مدرسين.</Empty> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{d.teachers.map((t) => (
          <div key={t.id} className={`${card} flex gap-3 ${t.active ? "" : "opacity-60"}`}>
            <span className="grid size-11 shrink-0 place-items-center rounded-full text-lg font-bold text-white" style={{ background: t.color }}>{t.name.slice(0, 1)}</span>
            <div className="min-w-0 flex-1 text-sm"><div className="font-bold">{t.name}</div><div className="text-xs text-muted">{t.specialty || "—"} · {CONTRACT_LABEL[t.contract ?? "permanent"]}</div>
              <div className="mt-1.5 flex flex-wrap gap-1">{t.subjectIds.map((id) => <span key={id} className="rounded-full bg-canvas px-2 py-0.5 text-[11px]">{d.subjects.find((s) => s.id === id)?.name}</span>)}</div>
              <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted"><span>الحصص: <b className="text-ink tabular-nums">{teacherLoad(d.tt, t.id)}</b> / {t.load}</span>{t.phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone className="size-3" />{t.phone}</span>}{hasSalary && t.salary ? <span>الراتب: <b className="text-ink">{money(t.salary)}</b> {CURRENCY}</span> : null}</div></div>
          </div>))}</div>
      )}
    </div>
  );
}
