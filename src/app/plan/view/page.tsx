"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Plus, Trash2, Wand2, Printer } from "lucide-react";
import { getTeachers, getSubjects, getLevels, levelName } from "@/lib/school/store";
import { getHolidays } from "@/lib/school/leaves";
import { getPlans, savePlans, schoolWeeks, distribute, expectedPercent, actualPercent, type Plan, type PlanUnit } from "@/lib/school/plan";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { newId } from "@/lib/local/util";
import { PageTitle, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function PlanView() {
  const [d, reload] = useLive(() => ({ plans: getPlans(), teachers: getTeachers(), subjects: getSubjects(), levels: getLevels(), hs: getHolidays() }), null);
  const [id, setId] = useState("");
  useEffect(() => { const h = location.hash.slice(1); if (h) setId(h); }, []);
  if (!d) return null;
  const plan = d.plans.find((p) => p.id === id) ?? d.plans[0];
  if (!plan) return (<div><PageTitle icon={<ClipboardList className="size-6 text-brand" />} title="الخطة" /><Empty>لا خطط. أنشئ خطة من الصفحة الرئيسية للمحطة.</Empty></div>);
  const weeks = schoolWeeks(d.hs);
  const put = (p: Plan) => { savePlans(d.plans.map((x) => x.id === p.id ? p : x)); reload(); };
  const upd = (u: PlanUnit) => put({ ...plan, units: plan.units.map((x) => x.id === u.id ? u : x) });
  const sub = d.subjects.find((s) => s.id === plan.subjectId)?.name; const lv = levelName(d.levels.find((l) => l.id === plan.levelId)); const teacher = d.teachers.find((t) => t.id === plan.teacherId)?.name;
  const range = (u: PlanUnit) => u.from === undefined || u.to === undefined || !weeks[u.from] ? "—" : `${weeks[u.from].start} → ${weeks[u.to]?.end ?? ""}`;
  return (
    <div>
      <PageTitle icon={<ClipboardList className="size-6 text-brand" />} title={`خطة ${sub} — ${lv}`} sub={`${teacher} · المنجز ${actualPercent(plan)}% مقابل المتوقع ${expectedPercent(plan, weeks)}%`}>
        <select value={plan.id} onChange={(e) => { setId(e.target.value); history.replaceState(null, "", `#${e.target.value}`); }} className={`w-64 ${inp}`}>{d.plans.map((p) => <option key={p.id} value={p.id}>{d.subjects.find((s) => s.id === p.subjectId)?.name} — {levelName(d.levels.find((l) => l.id === p.levelId))}</option>)}</select>
        <button onClick={() => put({ ...plan, units: distribute(plan.units, weeks) })} className={btnGhost}><Wand2 className="size-4" /> إعادة التوزيع على الأسابيع</button>
        <button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة</button>
      </PageTitle>
      <SchoolSheet title={`الخطة السنوية — ${sub} / ${lv}`} landscape>
        <p className="mb-2 text-xs text-gray-600">المدرس: <b>{teacher}</b> · الأسابيع الدراسية الفعلية: {weeks.length}</p>
        <table className="w-full border-collapse text-[12px]"><thead><tr className="bg-gray-100 text-center"><th className="border border-gray-300 p-1.5">#</th><th className="border border-gray-300 p-1.5 text-start">الوحدة / الفصل</th><th className="border border-gray-300 p-1.5">الدروس</th><th className="border border-gray-300 p-1.5">الفترة المخططة</th><th className="border border-gray-300 p-1.5">الأهداف</th><th className="border border-gray-300 p-1.5">الإنجاز %</th><th className="no-print border border-gray-300 p-1.5" /></tr></thead>
          <tbody>{plan.units.map((u, i) => (
            <tr key={u.id}><td className="border border-gray-300 p-1 text-center tabular-nums">{i + 1}</td>
              <td className="border border-gray-300 p-1"><input value={u.title} onChange={(e) => upd({ ...u, title: e.target.value })} className="w-full bg-transparent print:border-0" /></td>
              <td className="border border-gray-300 p-1 text-center"><input type="number" min={1} value={u.lessons} onChange={(e) => upd({ ...u, lessons: Math.max(1, Number(e.target.value) || 1) })} className="w-14 bg-transparent text-center" /></td>
              <td className="border border-gray-300 p-1 text-center tabular-nums" dir="ltr">{range(u)}</td>
              <td className="border border-gray-300 p-1"><input value={u.objectives ?? ""} onChange={(e) => upd({ ...u, objectives: e.target.value })} className="w-full bg-transparent" /></td>
              <td className="border border-gray-300 p-1 text-center"><input type="number" min={0} max={100} value={u.done} onChange={(e) => upd({ ...u, done: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} className="w-16 bg-transparent text-center" /></td>
              <td className="no-print border border-gray-300 p-1 text-center"><button onClick={() => put({ ...plan, units: plan.units.filter((x) => x.id !== u.id) })} aria-label="حذف الوحدة" className="text-red-600"><Trash2 className="size-4" /></button></td></tr>))}</tbody></table>
        <button onClick={() => put({ ...plan, units: [...plan.units, { id: newId(), title: "وحدة جديدة", lessons: 4, done: 0 }] })} className={`${btnGhost} no-print mt-3`}><Plus className="size-4" /> إضافة وحدة</button>
        <div className="mt-10 grid grid-cols-3 gap-6 text-center text-[11px] text-gray-600">{["المدرس", "المشرف التربوي", "مدير المدرسة"].map((l) => <div key={l}><div className="h-8" /><div className="border-t border-gray-400 pt-1">{l}</div></div>)}</div>
      </SchoolSheet>
    </div>
  );
}
