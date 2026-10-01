"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getSections, getLevels, getTeachers, getTimetable, getCurriculum, getSubjects, allConflicts, subjectCount, sectionLabel } from "@/lib/school/store";
import { PageTitle, card, useLive } from "@/components/school/ui";

export default function ConflictsPage() {
  const [d] = useLive(() => ({ sections: getSections(), levels: getLevels(), teachers: getTeachers(), tt: getTimetable(), cur: getCurriculum(), subjects: getSubjects() }), null);
  if (!d) return null;
  const { sections, levels, teachers, tt, cur, subjects } = d;
  const clashes = allConflicts(tt, sections, levels, teachers);
  const mismatches = sections.flatMap((s) => cur.filter((r) => r.levelId === s.levelId).map((r) => ({ s, r, have: subjectCount(tt, s.id, r.subjectId) })).filter((x) => x.have !== x.r.weekly));
  const over = teachers.filter((t) => t.active && t.load > 0).map((t) => ({ t, n: Object.values(tt).filter((x) => x.teacherId === t.id).length })).filter((x) => x.n > x.t.load);
  const ok = !clashes.length && !mismatches.length && !over.length;
  return (
    <div>
      <PageTitle icon={<AlertTriangle className="size-6 text-brand" />} title="التعارضات ومطابقة المنهج" sub="مدرس أو قاعة في مكانين، وحصص لا تطابق المنهج، ومدرسون فوق نصابهم." />
      {ok && <div className={`${card} flex items-center gap-2 text-brand-dark`}><CheckCircle2 className="size-5" /> لا تعارضات، وكل الجداول مطابقة للمنهج.</div>}
      {clashes.length > 0 && <div className={`${card} mb-4`}><div className="mb-2 font-semibold text-red-600">تعارضات ({clashes.length})</div><ul className="grid gap-1 text-sm">{clashes.map((c, i) => <li key={i}>• {c.text}</li>)}</ul></div>}
      {over.length > 0 && <div className={`${card} mb-4`}><div className="mb-2 font-semibold text-amber-700">مدرسون فوق النصاب</div><ul className="grid gap-1 text-sm">{over.map((x) => <li key={x.t.id}>• {x.t.name}: {x.n} حصة والنصاب {x.t.load}</li>)}</ul></div>}
      {mismatches.length > 0 && <div className={card}><div className="mb-2 font-semibold text-amber-700">حصص لا تطابق المنهج ({mismatches.length})</div>
        <ul className="grid gap-1 text-sm">{mismatches.map((m) => <li key={m.s.id + m.r.id}>• {sectionLabel(m.s, levels)} — {subjects.find((x) => x.id === m.r.subjectId)?.name}: {m.have} من {m.r.weekly}</li>)}</ul></div>}
    </div>
  );
}
