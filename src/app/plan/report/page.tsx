"use client";

import { BarChart3 } from "lucide-react";
import { getTeachers, getSubjects, getLevels, levelName } from "@/lib/school/store";
import { getHolidays } from "@/lib/school/leaves";
import { getPlans, schoolWeeks, expectedPercent, actualPercent } from "@/lib/school/plan";
import { PageTitle, Empty, card, useLive } from "@/components/school/ui";

export default function PlanReport() {
  const [d] = useLive(() => ({ plans: getPlans(), teachers: getTeachers(), subjects: getSubjects(), levels: getLevels(), hs: getHolidays() }), null);
  if (!d) return null;
  const weeks = schoolWeeks(d.hs);
  const rows = d.plans.map((p) => ({ p, act: actualPercent(p), exp: expectedPercent(p, weeks) })).sort((a, b) => (b.exp - b.act) - (a.exp - a.act));
  return (
    <div>
      <PageTitle icon={<BarChart3 className="size-6 text-brand" />} title="تقرير تنفيذ الخطط" sub="مرتّبة من الأكثر تأخراً. الأحمر: متأخرة أكثر من 10 نقاط عن المتوقع." />
      {!rows.length ? <Empty>لا خطط.</Empty> : <div className={`${card} overflow-x-auto !p-0`}><table className="w-full text-sm"><thead><tr className="border-b border-line bg-canvas text-xs text-muted"><th className="p-3 text-start">المدرس</th><th className="p-3 text-start">المادة / الصف</th><th className="p-3">المنجز</th><th className="p-3">المتوقع</th><th className="p-3">الفرق</th></tr></thead>
        <tbody>{rows.map(({ p, act, exp }) => { const gap = exp - act; return (
          <tr key={p.id} className="border-b border-line last:border-0"><td className="p-3 font-medium">{d.teachers.find((t) => t.id === p.teacherId)?.name}</td><td className="p-3">{d.subjects.find((s) => s.id === p.subjectId)?.name} — {levelName(d.levels.find((l) => l.id === p.levelId))}</td>
            <td className="p-3 text-center tabular-nums">{act}%</td><td className="p-3 text-center tabular-nums">{exp}%</td><td className={`p-3 text-center tabular-nums ${gap > 10 ? "font-bold text-red-600" : "text-muted"}`}>{gap > 0 ? `−${gap}` : `+${-gap}`}</td></tr>); })}</tbody></table></div>}
    </div>
  );
}
