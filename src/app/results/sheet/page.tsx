"use client";

import { useMemo, useState } from "react";
import { Table2, Printer } from "lucide-react";
import { getSections, getLevels, getSubjects, getCurriculum, getStudents, getTerms, currentYear, sectionLabel } from "@/lib/school/store";
import { getRules, getMarks, computeResults, OUTCOME_LABEL, round2 } from "@/lib/school/results";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { PageTitle, Empty, inp, btnPrimary, useLive } from "@/components/school/ui";

export default function SheetPage() {
  const [d] = useLive(() => { const y = currentYear(); return { sections: getSections(), levels: getLevels(), subjects: getSubjects(), cur: getCurriculum(), students: getStudents(), terms: getTerms().filter((t) => !y || t.yearId === y.id), rules: getRules(), marks: getMarks() }; }, null);
  const [sectionId, setSectionId] = useState(""); const [termId, setTermId] = useState("annual");
  const section = d?.sections.find((s) => s.id === sectionId) ?? d?.sections[0];
  const view = useMemo(() => {
    if (!d || !section) return null;
    const subs = d.cur.filter((r) => r.levelId === section.levelId).map((r) => d.subjects.find((s) => s.id === r.subjectId)!).filter(Boolean);
    const terms = termId === "annual" ? d.terms : d.terms.filter((t) => t.id === termId);
    const students = d.students.filter((s) => s.status === "active" && s.sectionId === section.id);
    return { subs, rows: computeResults(students, subs.map((s) => s.id), terms, d.marks, d.rules) };
  }, [d, section, termId]);
  if (!d) return null;
  return (
    <div>
      <PageTitle icon={<Table2 className="size-6 text-brand" />} title="كشف النتائج" sub="درجات الشعبة والمعدل والرتبة والنتيجة (الأحمر: دون درجة النجاح).">
        <select value={section?.id ?? ""} onChange={(e) => setSectionId(e.target.value)} className={`w-56 ${inp}`}>{d.sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s, d.levels)}</option>)}</select>
        <select value={termId} onChange={(e) => setTermId(e.target.value)} className={`w-44 ${inp}`}><option value="annual">السنوي</option>{d.terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة</button>
      </PageTitle>
      {!view || !view.rows.length ? <Empty>لا طلاب أو شعب بعد.</Empty> : (
        <SchoolSheet title={`كشف درجات ${sectionLabel(section, d.levels)} — ${termId === "annual" ? "السنوي" : d.terms.find((t) => t.id === termId)?.name}`}>
          <table className="w-full border-collapse text-center text-[12px]">
            <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-1.5">#</th><th className="border border-gray-300 p-1.5 text-start">الطالب</th>
              {view.subs.map((s) => <th key={s.id} className="border border-gray-300 p-1.5">{s.name}</th>)}
              <th className="border border-gray-300 p-1.5">المعدل</th><th className="border border-gray-300 p-1.5">التقدير</th><th className="border border-gray-300 p-1.5">الرتبة</th><th className="border border-gray-300 p-1.5">النتيجة</th></tr></thead>
            <tbody>{view.rows.map((r, i) => (
              <tr key={r.student.id}><td className="border border-gray-300 p-1 tabular-nums">{i + 1}</td><td className="border border-gray-300 p-1 text-start font-medium">{r.student.name}</td>
                {view.subs.map((s) => { const v = r.scores[s.id]; return <td key={s.id} className={`border border-gray-300 p-1 tabular-nums ${v !== null && v < d.rules.passMark ? "font-bold text-red-600" : ""}`}>{v === null ? "—" : round2(v)}</td>; })}
                <td className="border border-gray-300 p-1 font-bold tabular-nums">{r.average === null ? "—" : round2(r.average)}</td><td className="border border-gray-300 p-1">{r.grade}</td>
                <td className="border border-gray-300 p-1 tabular-nums">{r.rank || "—"}</td>
                <td className={`border border-gray-300 p-1 ${r.outcome === "fail" ? "font-bold text-red-600" : ""}`}>{OUTCOME_LABEL[r.outcome]}</td></tr>))}</tbody>
          </table>
          <p className="mt-3 text-[11px] text-gray-600">ناجحون: {view.rows.filter((r) => r.outcome === "pass").length} · دور ثانٍ: {view.rows.filter((r) => r.outcome === "second").length} · راسبون: {view.rows.filter((r) => r.outcome === "fail").length} · غير مكتمل: {view.rows.filter((r) => r.outcome === "incomplete").length}</p>
        </SchoolSheet>
      )}
    </div>
  );
}
