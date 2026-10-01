"use client";

import { useState } from "react";
import { ArrowUpCircle, Check } from "lucide-react";
import { getStudents, saveStudents, getSections, getLevels, sectionLabel, type Section } from "@/lib/school/store";
import { todayYmd } from "@/lib/local/util";
import { PageTitle, Empty, inp, card, btnPrimary, useLive } from "@/components/school/ui";

/** The usual next section: same name in the next level (same branch), else the first section of it. */
function suggest(src: Section, sections: Section[], levels: ReturnType<typeof getLevels>): string {
  const lv = levels.find((l) => l.id === src.levelId);
  const next = lv && levels.find((l) => l.order > lv.order && l.stage === lv.stage && (l.branch ?? "") === (lv.branch ?? "")) ||
    (lv && levels.find((l) => l.order > lv.order && (l.branch ?? "") === (lv.branch ?? "")));
  if (!next) return "graduate";
  return (sections.find((s) => s.levelId === next.id && s.name === src.name) ?? sections.find((s) => s.levelId === next.id))?.id ?? "";
}

export default function PromotePage() {
  const [d] = useLive(() => ({ sections: getSections(), levels: getLevels(), students: getStudents() }), null);
  const [plan, setPlan] = useState<Record<string, string>>({});
  const [done, setDone] = useState("");
  if (!d) return null;
  const { sections, levels, students } = d;
  const active = students.filter((s) => s.status === "active");
  const dest = (s: Section) => plan[s.id] ?? suggest(s, sections, levels);

  function run() {
    if (!window.confirm("سينقل الطلاب الناجحون كما في الجدول. لا تنفّذ قبل اعتماد النتائج (الراسبون: اختر «يبقون في شعبتهم»). متابعة؟")) return;
    let moved = 0, grads = 0;
    const next = getStudents().map((st) => {
      if (st.status !== "active" || !st.sectionId) return st;
      const src = sections.find((x) => x.id === st.sectionId); if (!src) return st;
      const to = dest(src);
      if (to === "stay" || to === "") return st;
      if (to === "graduate") { grads++; return { ...st, status: "graduated" as const, leftAt: todayYmd() }; }
      moved++; return { ...st, sectionId: to };
    });
    saveStudents(next); setDone(`نُقل ${moved} طالب وتخرّج ${grads}.`);
  }
  return (
    <div>
      <PageTitle icon={<ArrowUpCircle className="size-6 text-brand" />} title="الترفيع السنوي" sub="اختر لكل شعبة أين ينتقل طلابها في العام الجديد (يُقترح الصف التالي). طلاب الصف الأخير يتخرجون." />
      {!sections.length ? <Empty>أنشئ الشعب أولاً من محطة «الصفوف والفصول».</Empty> : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-muted"><th className="p-2 text-start">من شعبة</th><th className="p-2 text-start">الطلاب</th><th className="p-2 text-start">إلى</th></tr></thead>
            <tbody>{sections.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="p-2 font-medium">{sectionLabel(s, levels)}</td>
                <td className="p-2 tabular-nums">{active.filter((x) => x.sectionId === s.id).length}</td>
                <td className="p-2">
                  <select value={dest(s)} onChange={(e) => setPlan({ ...plan, [s.id]: e.target.value })} className={`max-w-64 ${inp}`}>
                    <option value="stay">يبقون في شعبتهم (راسبون / لا ترفيع)</option>
                    <option value="graduate">تخرّج</option>
                    {sections.filter((x) => x.id !== s.id).map((x) => <option key={x.id} value={x.id}>{sectionLabel(x, levels)}</option>)}
                  </select>
                </td>
              </tr>))}</tbody>
          </table>
          <div className="mt-4 flex items-center gap-3"><button onClick={run} className={btnPrimary}><ArrowUpCircle className="size-4" /> تنفيذ الترفيع</button>{done && <span className="inline-flex items-center gap-1 text-sm text-brand-dark"><Check className="size-4" />{done}</span>}</div>
        </div>
      )}
    </div>
  );
}
