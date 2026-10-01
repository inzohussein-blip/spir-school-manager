"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Plus, Trash2, Star } from "lucide-react";
import { getYears, saveYears, getTerms, saveTerms, newYear, type Year, type Term } from "@/lib/school/store";
import { newId } from "@/lib/local/util";
import { PageTitle, inp, card, btnPrimary, btnGhost, Empty } from "@/components/school/ui";

export default function YearsPage() {
  const [years, setYears] = useState<Year[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [start, setStart] = useState(String(new Date().getMonth() >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1));
  useEffect(() => { setYears(getYears()); setTerms(getTerms()); }, []);
  const putYears = (v: Year[]) => { setYears(v); saveYears(v); };
  const putTerms = (v: Term[]) => { setTerms(v); saveTerms(v); };

  function create() {
    const y = Number(start);
    if (!y || years.some((x) => x.name.startsWith(String(y)))) return;
    const n = newYear(y);
    putYears([...years.map((x) => ({ ...x, current: false })), n.year]);
    putTerms([...terms, ...n.terms]);
  }
  function remove(y: Year) {
    if (!window.confirm(`حذف العام ${y.name} وفصوله؟`)) return;
    const left = years.filter((x) => x.id !== y.id);
    if (y.current && left.length) left[left.length - 1] = { ...left[left.length - 1], current: true };
    putYears(left); putTerms(terms.filter((t) => t.yearId !== y.id));
  }
  return (
    <div>
      <PageTitle icon={<CalendarRange className="size-6 text-brand" />} title="العام الدراسي والفصول" sub="العام الحالي هو الذي تعمل عليه كل المحطات (الجداول والنتائج والحضور). الفصول (الدراسية) تقسّم النتائج." />
      <div className={`${card} mb-5 flex flex-wrap items-end gap-3`}>
        <label className="text-sm font-medium">عام جديد يبدأ في أكتوبر من سنة
          <input dir="ltr" inputMode="numeric" value={start} onChange={(e) => setStart(e.target.value.replace(/\D/g, "").slice(0, 4))} className={`mt-1 w-28 ${inp}`} />
        </label>
        <button onClick={create} className={btnPrimary}><Plus className="size-4" /> إنشاء العام وفصليه</button>
        <span className="text-xs text-muted">ينشئ فصلين (أول وثانٍ) بتواريخ معتادة تعدّلها بعد ذلك.</span>
      </div>
      {!years.length && <Empty>لا عام دراسي بعد. أنشئ العام الحالي أعلاه.</Empty>}
      <div className="grid gap-4">
        {[...years].reverse().map((y) => (
          <div key={y.id} className={`${card} ${y.current ? "border-brand" : ""}`}>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="text-lg font-bold tabular-nums" dir="ltr">{y.name}</div>
              {y.current ? <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">العام الحالي</span>
                : <button onClick={() => putYears(years.map((x) => ({ ...x, current: x.id === y.id })))} className={btnGhost}><Star className="size-4" /> اجعله الحالي</button>}
              <button onClick={() => remove(y)} aria-label="حذف العام" className="ms-auto grid size-8 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">بداية العام<input type="date" value={y.start} onChange={(e) => putYears(years.map((x) => x.id === y.id ? { ...x, start: e.target.value } : x))} className={`mt-1 ${inp}`} /></label>
              <label className="text-sm font-medium">نهاية العام<input type="date" value={y.end} onChange={(e) => putYears(years.map((x) => x.id === y.id ? { ...x, end: e.target.value } : x))} className={`mt-1 ${inp}`} /></label>
            </div>
            <div className="mt-4 text-sm font-semibold">الفصول الدراسية</div>
            <div className="mt-2 grid gap-2">
              {terms.filter((t) => t.yearId === y.id).map((t) => (
                <div key={t.id} className="grid items-center gap-2 sm:grid-cols-[1fr_9rem_9rem_2rem]">
                  <input value={t.name} onChange={(e) => putTerms(terms.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))} className={inp} />
                  <input type="date" value={t.start} onChange={(e) => putTerms(terms.map((x) => x.id === t.id ? { ...x, start: e.target.value } : x))} className={inp} />
                  <input type="date" value={t.end} onChange={(e) => putTerms(terms.map((x) => x.id === t.id ? { ...x, end: e.target.value } : x))} className={inp} />
                  <button onClick={() => putTerms(terms.filter((x) => x.id !== t.id))} aria-label="حذف الفصل" className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
                </div>
              ))}
              <button onClick={() => putTerms([...terms, { id: newId(), yearId: y.id, name: "فصل جديد", start: y.start, end: y.end }])} className={`${btnGhost} w-fit`}><Plus className="size-4" /> إضافة فصل</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
