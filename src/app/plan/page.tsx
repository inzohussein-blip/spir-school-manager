"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { getTeachers, getSubjects, getLevels, getCurriculum, levelName, currentYear } from "@/lib/school/store";
import { getHolidays } from "@/lib/school/leaves";
import { getPlans, savePlans, schoolWeeks, distribute, expectedPercent, actualPercent, type Plan, type PlanUnit } from "@/lib/school/plan";
import { newId } from "@/lib/local/util";
import { PageTitle, Modal, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function PlansPage() {
  const [d, reload] = useLive(() => ({ plans: getPlans(), teachers: getTeachers().filter((t) => t.active), subjects: getSubjects(), levels: getLevels(), cur: getCurriculum(), hs: getHolidays(), year: currentYear() }), null);
  const [f, setF] = useState<{ teacherId: string; subjectId: string; levelId: string; lines: string } | null>(null); const [tid, setTid] = useState("");
  if (!d) return null;
  const { plans, teachers, subjects, levels, hs, year } = d;
  const weeks = schoolWeeks(hs);
  const shown = plans.filter((p) => !tid || p.teacherId === tid);
  function create() {
    if (!f || !year || !f.teacherId || !f.subjectId || !f.levelId) return;
    const units: PlanUnit[] = f.lines.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [title, n] = l.split("|"); return { id: newId(), title: title.trim(), lessons: Math.max(1, Number(n) || 4), done: 0 }; });
    const plan: Plan = { id: newId(), teacherId: f.teacherId, subjectId: f.subjectId, levelId: f.levelId, yearId: year.id, units: distribute(units, weeks) };
    savePlans([plan, ...plans]); setF(null); reload();
  }
  const subjectsForLevel = (lv: string) => d.cur.filter((r) => r.levelId === lv).map((r) => subjects.find((s) => s.id === r.subjectId)!).filter(Boolean);
  return (
    <div>
      <PageTitle icon={<ClipboardList className="size-6 text-brand" />} title="الخطط السنوية" sub={`${weeks.length} أسبوع دراسي فعلي في العام الحالي بعد خصم العطل.`}>
        <select value={tid} onChange={(e) => setTid(e.target.value)} className={`w-48 ${inp}`}><option value="">كل المدرسين</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <button onClick={() => setF({ teacherId: teachers[0]?.id ?? "", levelId: levels[0]?.id ?? "", subjectId: subjectsForLevel(levels[0]?.id ?? "")[0]?.id ?? "", lines: "" })} disabled={!year || !teachers.length || !levels.length} className={btnPrimary}><Plus className="size-4" /> خطة جديدة</button>
      </PageTitle>
      {!year ? <Empty>أنشئ العام الدراسي أولاً من محطة الإعداد.</Empty> : !shown.length ? <Empty>لا خطط بعد. أضف خطة لمدرس ومادة وصف؛ اكتب الوحدات سطراً لكل وحدة (اختيارياً: «العنوان | عدد الدروس»).</Empty> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{shown.map((p) => { const act = actualPercent(p), exp = expectedPercent(p, weeks), late = exp - act > 10; return (
          <div key={p.id} className={card}>
            <div className="flex items-start justify-between gap-2"><div><div className="font-bold">{subjects.find((s) => s.id === p.subjectId)?.name} — {levelName(levels.find((l) => l.id === p.levelId))}</div><div className="text-xs text-muted">{teachers.find((t) => t.id === p.teacherId)?.name} · {p.units.length} وحدة</div></div>
              <button onClick={() => window.confirm("حذف الخطة؟") && (savePlans(plans.filter((x) => x.id !== p.id)), reload())} aria-label="حذف" className="text-red-600"><Trash2 className="size-4" /></button></div>
            <div className="mt-3 text-xs text-muted">المنجز <b className="tabular-nums text-ink">{act}%</b> مقابل المتوقع <b className="tabular-nums text-ink">{exp}%</b></div>
            <div className="relative mt-1 h-2.5 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${late ? "bg-red-500" : "bg-brand"}`} style={{ width: `${act}%` }} /><div className="absolute inset-y-0 w-0.5 bg-ink/60" style={{ insetInlineStart: `${exp}%` }} /></div>
            {late && <div className="mt-1 text-xs text-red-600">متأخرة عن الخطة</div>}
            <Link href={`/plan/view#${p.id}`} className={`${btnGhost} mt-3`}>فتح الخطة</Link>
          </div>); })}</div>
      )}
      {f && (
        <Modal title="خطة سنوية جديدة" onClose={() => setF(null)} wide>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium">المدرس<select value={f.teacherId} onChange={(e) => setF({ ...f, teacherId: e.target.value })} className={`mt-1 ${inp}`}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
            <label className="text-sm font-medium">الصف<select value={f.levelId} onChange={(e) => setF({ ...f, levelId: e.target.value, subjectId: subjectsForLevel(e.target.value)[0]?.id ?? "" })} className={`mt-1 ${inp}`}>{levels.map((l) => <option key={l.id} value={l.id}>{levelName(l)}</option>)}</select></label>
            <label className="text-sm font-medium">المادة<select value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value })} className={`mt-1 ${inp}`}>{subjectsForLevel(f.levelId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          </div>
          <label className="mt-3 block text-sm font-medium">الوحدات / الفصول (سطر لكل وحدة، «العنوان | عدد الدروس»)<textarea rows={8} value={f.lines} onChange={(e) => setF({ ...f, lines: e.target.value })} placeholder={"الوحدة الأولى: الأعداد | 8\nالوحدة الثانية: الجمع والطرح | 10"} className={`mt-1 ${inp}`} /></label>
          <div className="mt-3 flex gap-2"><button onClick={create} disabled={!f.subjectId} className={btnPrimary}>إنشاء وتوزيع على الأسابيع</button><button onClick={() => setF(null)} className={btnGhost}>إلغاء</button></div>
        </Modal>
      )}
    </div>
  );
}
