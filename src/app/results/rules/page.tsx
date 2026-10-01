"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Plus, Trash2, RotateCcw } from "lucide-react";
import { getTerms, currentYear, type Term } from "@/lib/school/store";
import { getRules, saveRules, DEFAULT_RULES, type ResultRules } from "@/lib/school/results";
import { newId } from "@/lib/local/util";
import { PageTitle, inp, card, btnGhost } from "@/components/school/ui";

export default function RulesPage() {
  const [r, setR] = useState<ResultRules | null>(null); const [terms, setTerms] = useState<Term[]>([]);
  useEffect(() => { setR(getRules()); const y = currentYear(); setTerms(getTerms().filter((t) => !y || t.yearId === y.id)); }, []);
  if (!r) return null;
  const put = (n: ResultRules) => { setR(n); saveRules(n); };
  const sum = r.components.reduce((n, c) => n + c.weight, 0);
  return (
    <div>
      <PageTitle icon={<SlidersHorizontal className="size-6 text-brand" />} title="قواعد التقويم" sub="تُطبَّق على كل المواد والصفوف: مكوّنات درجة الفصل، النجاح، الدور الثاني، والتقديرات.">
        <button onClick={() => window.confirm("إعادة القواعد الافتراضية؟") && put(DEFAULT_RULES())} className={btnGhost}><RotateCcw className="size-4" /> الافتراضي</button>
      </PageTitle>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={card}>
          <div className="mb-3 text-sm font-semibold">النجاح</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">درجة النجاح في المادة (من 100)<input type="number" value={r.passMark} onChange={(e) => put({ ...r, passMark: Number(e.target.value) || 0 })} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm font-medium">أقصى عدد مواد راسبة للدور الثاني<input type="number" min={0} value={r.secondRoundMax} onChange={(e) => put({ ...r, secondRoundMax: Math.max(0, Number(e.target.value) || 0) })} className={`mt-1 ${inp}`} /></label>
          </div>
          <p className="mt-2 text-[11px] text-muted">راسب في أكثر من هذا العدد = راسب؛ وفي مادة أو أكثر ضمنه = ناجح بالدور الثاني (مكمّل). القواعد الرسمية تختلف بين المراحل، فاضبطها حسب تعليمات الوزارة.</p>
        </div>
        <div className={card}>
          <div className="mb-3 text-sm font-semibold">مكوّنات درجة الفصل <span className={`text-xs font-normal ${sum === 100 ? "text-brand-dark" : "text-red-600"}`}>(المجموع {sum}%)</span></div>
          <div className="grid gap-2">{r.components.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_5rem_2rem] items-center gap-2">
              <input value={c.name} onChange={(e) => put({ ...r, components: r.components.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x) })} className={inp} />
              <input type="number" min={0} max={100} value={c.weight} onChange={(e) => put({ ...r, components: r.components.map((x) => x.id === c.id ? { ...x, weight: Number(e.target.value) || 0 } : x) })} className={inp} />
              <button onClick={() => put({ ...r, components: r.components.filter((x) => x.id !== c.id) })} aria-label="حذف" className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
            </div>))}</div>
          <button onClick={() => put({ ...r, components: [...r.components, { id: newId(), name: "مكوّن جديد", weight: 0 }] })} className={`${btnGhost} mt-3`}><Plus className="size-4" /> إضافة مكوّن</button>
          <p className="mt-2 text-[11px] text-muted">تغيير المكوّنات بعد إدخال درجات يُبقي الدرجات المدخلة مربوطة بالمكوّن نفسه.</p>
        </div>
        <div className={card}>
          <div className="mb-3 text-sm font-semibold">وزن الفصول في المعدل السنوي</div>
          {!terms.length ? <p className="text-xs text-muted">أنشئ الفصول الدراسية أولاً.</p> : <div className="grid gap-2">{terms.map((t) => (
            <label key={t.id} className="grid grid-cols-[1fr_5rem] items-center gap-2 text-sm">{t.name}
              <input type="number" min={0} max={100} value={r.termWeights[t.id] ?? Math.round(100 / terms.length)} onChange={(e) => put({ ...r, termWeights: { ...r.termWeights, [t.id]: Number(e.target.value) || 0 } })} className={inp} /></label>))}</div>}
        </div>
        <div className={card}>
          <div className="mb-3 text-sm font-semibold">التقديرات</div>
          <div className="grid gap-2">{[...r.bands].sort((a, b) => b.min - a.min).map((b, i) => (
            <div key={i} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-2">
              <input type="number" value={b.min} onChange={(e) => put({ ...r, bands: r.bands.map((x) => x === b ? { ...x, min: Number(e.target.value) || 0 } : x) })} className={inp} aria-label="من" />
              <input value={b.label} onChange={(e) => put({ ...r, bands: r.bands.map((x) => x === b ? { ...x, label: e.target.value } : x) })} className={inp} />
              <button onClick={() => put({ ...r, bands: r.bands.filter((x) => x !== b) })} aria-label="حذف" className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
            </div>))}</div>
          <button onClick={() => put({ ...r, bands: [...r.bands, { min: 0, label: "تقدير" }] })} className={`${btnGhost} mt-3`}><Plus className="size-4" /> إضافة تقدير</button>
        </div>
      </div>
    </div>
  );
}
