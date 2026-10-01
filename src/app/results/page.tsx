"use client";

import { useEffect, useMemo, useState } from "react";
import { PenLine } from "lucide-react";
import { getSections, getLevels, getSubjects, getCurriculum, getStudents, getTerms, currentYear, sectionLabel } from "@/lib/school/store";
import { getRules, getMarks, saveMarks, markKey, termScore, type Marks } from "@/lib/school/results";
import { PageTitle, Empty, inp, card, useLive } from "@/components/school/ui";

export default function EntryPage() {
  const [d] = useLive(() => {
    const y = currentYear();
    return { sections: getSections(), levels: getLevels(), subjects: getSubjects(), cur: getCurriculum(), students: getStudents(), terms: getTerms().filter((t) => !y || t.yearId === y.id), rules: getRules() };
  }, null);
  const [marks, setMarks] = useState<Marks>({});
  const [sectionId, setSectionId] = useState(""); const [termId, setTermId] = useState(""); const [subjectId, setSubjectId] = useState("");
  useEffect(() => setMarks(getMarks()), []);
  const section = d?.sections.find((s) => s.id === sectionId) ?? d?.sections[0];
  const subjectsOf = useMemo(() => d && section ? d.cur.filter((r) => r.levelId === section.levelId).map((r) => d.subjects.find((s) => s.id === r.subjectId)!).filter(Boolean) : [], [d, section]);
  if (!d) return null;
  const term = d.terms.find((t) => t.id === termId) ?? d.terms[0];
  const subject = subjectsOf.find((s) => s.id === subjectId) ?? subjectsOf[0];
  const students = d.students.filter((s) => s.status === "active" && s.sectionId === section?.id);
  const { rules } = d;

  function set(stId: string, compId: string, raw: string) {
    const next = { ...marks }; const k = markKey(stId, subject!.id, term!.id, compId);
    const v = raw.trim() === "" ? undefined : Math.min(100, Math.max(0, Number(raw.replace(/[^\d.]/g, "")) || 0));
    if (v === undefined) delete next[k]; else next[k] = v;
    setMarks(next); saveMarks(next);
  }
  return (
    <div>
      <PageTitle icon={<PenLine className="size-6 text-brand" />} title="إدخال الدرجات" sub="الدرجة من 100 لكل مكوّن؛ تُحفظ فور الكتابة، ويحسب النظام درجة المادة بأوزان المكوّنات (من «قواعد التقويم»)." />
      {!d.sections.length || !d.terms.length ? <Empty>أنشئ الشعب والعام الدراسي وفصليه أولاً (محطتا الصفوف والإعداد).</Empty> : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <select value={section?.id} onChange={(e) => { setSectionId(e.target.value); setSubjectId(""); }} className={`w-56 ${inp}`}>{d.sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s, d.levels)}</option>)}</select>
            <select value={term?.id} onChange={(e) => setTermId(e.target.value)} className={`w-44 ${inp}`}>{d.terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            <select value={subject?.id} onChange={(e) => setSubjectId(e.target.value)} className={`w-48 ${inp}`}>{subjectsOf.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </div>
          {!subject || !term ? <Empty>لا مواد لهذا الصف في المنهج.</Empty> : !students.length ? <Empty>لا طلاب في هذه الشعبة.</Empty> : (
            <div className={`${card} overflow-x-auto !p-0`}>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-line bg-canvas text-xs text-muted">
                  <th className="p-3 text-start">#</th><th className="p-3 text-start">الطالب</th>
                  {rules.components.map((c) => <th key={c.id} className="p-3">{c.name} <span className="font-normal">({c.weight}%)</span></th>)}
                  <th className="p-3">درجة {subject.name}</th>
                </tr></thead>
                <tbody>{students.map((st, i) => {
                  const total = termScore(marks, rules, st.id, subject.id, term.id);
                  return (
                    <tr key={st.id} className="border-b border-line last:border-0">
                      <td className="p-3 tabular-nums text-muted">{i + 1}</td><td className="p-3 font-medium">{st.name}</td>
                      {rules.components.map((c) => {
                        const v = marks[markKey(st.id, subject.id, term.id, c.id)];
                        return <td key={c.id} className="p-2 text-center"><input inputMode="decimal" dir="ltr" value={v ?? ""} onChange={(e) => set(st.id, c.id, e.target.value)} aria-label={`${st.name} ${c.name}`} className={`mx-auto w-20 text-center ${inp}`} /></td>;
                      })}
                      <td className={`p-3 text-center font-bold tabular-nums ${total !== null && total < rules.passMark ? "text-red-600" : ""}`}>{total === null ? "—" : Math.round(total * 100) / 100}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
