"use client";

import { useState } from "react";
import { Layers, Plus, Trash2 } from "lucide-react";
import { getLevels, getStudents, levelName } from "@/lib/school/store";
import { getFeeSettings, saveFeeSettings, getDiscounts, saveDiscounts, type FeeSettings, type Discount } from "@/lib/school/fees";
import { CURRENCY } from "@/lib/utils";
import { PageTitle, inp, card, btnPrimary, useLive } from "@/components/school/ui";

export default function PlansPage() {
  const [d, reload] = useLive(() => ({ levels: getLevels(), set: getFeeSettings(), dis: getDiscounts(), students: getStudents().filter((s) => s.status === "active") }), null);
  const [nd, setNd] = useState<Discount>({ studentId: "", percent: 0, amount: 0, reason: "" });
  if (!d) return null;
  const put = (s: FeeSettings) => { saveFeeSettings(s); reload(); };
  return (
    <div>
      <PageTitle icon={<Layers className="size-6 text-brand" />} title="قسط الصفوف والخصومات" sub="القسط الشهري لكل صف، ورسم التسجيل، وخصومات الطلاب (الإخوة، المتفوقين، أبناء الموظفين…)." />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={card}>
          <div className="mb-3 text-sm font-semibold">القسط الشهري لكل صف ({CURRENCY})</div>
          <div className="grid gap-2">{d.levels.map((l) => <label key={l.id} className="grid grid-cols-[1fr_9rem] items-center gap-2 text-sm">{levelName(l)}
            <input inputMode="numeric" dir="ltr" value={d.set.monthly[l.id] ?? ""} onChange={(e) => { const v = Number(e.target.value.replace(/\D/g, "")); const m = { ...d.set.monthly }; if (v) m[l.id] = v; else delete m[l.id]; put({ ...d.set, monthly: m }); }} className={inp} /></label>)}
            {!d.levels.length && <p className="text-xs text-muted">حمّل الصفوف أولاً من محطة الإعداد.</p>}</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">رسم التسجيل ({CURRENCY})<input inputMode="numeric" dir="ltr" value={d.set.registration || ""} onChange={(e) => put({ ...d.set, registration: Number(e.target.value.replace(/\D/g, "")) || 0 })} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm font-medium">آخر يوم للسداد في الشهر<input type="number" min={1} max={28} value={d.set.dueDay} onChange={(e) => put({ ...d.set, dueDay: Math.min(28, Math.max(1, Number(e.target.value) || 5)) })} className={`mt-1 ${inp}`} /></label>
          </div>
        </div>
        <div className={card}>
          <div className="mb-3 text-sm font-semibold">الخصومات</div>
          <div className="grid gap-2 sm:grid-cols-[1fr_5rem_6rem]">
            <select value={nd.studentId} onChange={(e) => setNd({ ...nd, studentId: e.target.value })} className={inp}><option value="">اختر الطالب…</option>{d.students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            <input type="number" min={0} max={100} placeholder="%" value={nd.percent || ""} onChange={(e) => setNd({ ...nd, percent: Number(e.target.value) || 0 })} className={inp} />
            <input inputMode="numeric" dir="ltr" placeholder={`مبلغ`} value={nd.amount || ""} onChange={(e) => setNd({ ...nd, amount: Number(e.target.value.replace(/\D/g, "")) || 0 })} className={inp} />
          </div>
          <div className="mt-2 flex gap-2"><input value={nd.reason} onChange={(e) => setNd({ ...nd, reason: e.target.value })} placeholder="السبب (أخ، متفوّق…)" className={inp} />
            <button disabled={!nd.studentId || (!nd.percent && !nd.amount)} onClick={() => { saveDiscounts([...d.dis.filter((x) => x.studentId !== nd.studentId), nd]); setNd({ studentId: "", percent: 0, amount: 0, reason: "" }); reload(); }} className={btnPrimary}><Plus className="size-4" /></button></div>
          <ul className="mt-3 grid gap-1.5 text-sm">{d.dis.map((x) => <li key={x.studentId} className="flex items-center justify-between border-b border-line pb-1.5 last:border-0"><span>{d.students.find((s) => s.id === x.studentId)?.name ?? "—"} <span className="text-xs text-muted">{x.percent ? `${x.percent}%` : ""}{x.amount ? ` ${x.amount} ${CURRENCY}` : ""} {x.reason}</span></span>
            <button onClick={() => { saveDiscounts(d.dis.filter((y) => y !== x)); reload(); }} aria-label="حذف الخصم" className="text-red-600"><Trash2 className="size-4" /></button></li>)}
            {!d.dis.length && <li className="text-xs text-muted">لا خصومات.</li>}</ul>
          <p className="mt-2 text-[11px] text-muted">يُطبَّق الخصم على المستحقات التي تُنشأ بعد تسجيله.</p>
        </div>
      </div>
    </div>
  );
}
