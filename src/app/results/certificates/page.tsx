"use client";

import { useMemo, useState } from "react";
import { Award, Printer, Save } from "lucide-react";
import { getSections, getLevels, getSubjects, getCurriculum, getStudents, getTerms, currentYear, getInfo, sectionLabel, levelName } from "@/lib/school/store";
import {
  getRules, getMarks, computeResults, getTemplates, saveTemplates, fillTemplate, getCertLog, saveCertLog, nextCertNo, CERT_LABEL, CERT_PLACEHOLDERS, OUTCOME_LABEL, round2,
  type CertKind, type CertTemplate, type CertLogEntry,
} from "@/lib/school/results";
import { Certificate } from "@/components/school/Certificate";
import { newId, todayYmd } from "@/lib/local/util";
import { PageTitle, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function CertificatesPage() {
  const [d, reload] = useLive(() => { const y = currentYear(); return { sections: getSections(), levels: getLevels(), subjects: getSubjects(), cur: getCurriculum(), students: getStudents(), terms: getTerms().filter((t) => !y || t.yearId === y.id), rules: getRules(), marks: getMarks(), templates: getTemplates(), log: getCertLog(), year: y?.name ?? "", info: getInfo() }; }, null);
  const [kind, setKind] = useState<CertKind>("success"); const [sectionId, setSectionId] = useState("");
  const [picked, setPicked] = useState<Set<string> | null>(null); // null = everyone in the section
  const [issued, setIssued] = useState<{ studentId: string; no: string }[] | null>(null);
  const [draft, setDraft] = useState<CertTemplate | null>(null);
  const section = d?.sections.find((s) => s.id === sectionId) ?? d?.sections[0];
  const tpl = draft && draft.kind === kind ? draft : d?.templates.find((t) => t.kind === kind);
  const view = useMemo(() => {
    if (!d || !section) return null;
    const subs = d.cur.filter((r) => r.levelId === section.levelId).map((r) => d.subjects.find((s) => s.id === r.subjectId)!).filter(Boolean);
    const students = d.students.filter((s) => s.status === "active" && s.sectionId === section.id);
    return { subs, results: computeResults(students, subs.map((s) => s.id), d.terms, d.marks, d.rules) };
  }, [d, section]);
  if (!d) return null;
  if (!section || !view || !tpl) return (<div><PageTitle icon={<Award className="size-6 text-brand" />} title="الشهادات" /><Empty>أنشئ الشعب والطلاب وأدخل الدرجات أولاً.</Empty></div>);
  const selected = view.results.filter((r) => !picked || picked.has(r.student.id));
  const level = d.levels.find((l) => l.id === section.levelId);
  const textFor = (r: (typeof view.results)[number], no: string) => fillTemplate(tpl.body, {
    name: r.student.name, level: levelName(level), section: section.name, year: d.year, school: d.info.name || "المدرسة",
    average: r.average === null ? "—" : String(round2(r.average)), grade: r.grade || "—", rank: r.rank ? String(r.rank) : "—", no,
  });
  const toggle = (id: string) => setPicked((p) => { const base = p ?? new Set(view.results.map((r) => r.student.id)); const n = new Set(base); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  function print() {
    if (!selected.length) return;
    const entries: CertLogEntry[] = []; const nos: { studentId: string; no: string }[] = [];
    for (const r of selected) { const no = nextCertNo(); nos.push({ studentId: r.student.id, no }); entries.push({ id: newId(), no, studentId: r.student.id, studentName: r.student.name, kind, date: todayYmd(), year: d!.year }); }
    saveCertLog([...entries, ...d!.log]); setIssued(nos); reload();
    setTimeout(() => window.print(), 300);
  }
  const noOf = (id: string) => issued?.find((x) => x.studentId === id)?.no ?? "—";

  return (
    <div>
      <PageTitle icon={<Award className="size-6 text-brand" />} title="الشهادات" sub="اختر نوع الشهادة والشعبة والطلاب (الكل أو المحدّدين)، عاين ثم اطبع؛ لكل شهادة رقم تسلسلي يُسجَّل.">
        <button onClick={print} disabled={!selected.length} className={btnPrimary}><Printer className="size-4" /> طباعة {selected.length} شهادة</button>
      </PageTitle>
      <div className="no-print grid gap-5 lg:grid-cols-[18rem_1fr]">
        <div className="grid content-start gap-4">
          <div className={card}>
            <label className="text-sm font-medium">نوع الشهادة<select value={kind} onChange={(e) => { setKind(e.target.value as CertKind); setDraft(null); setIssued(null); }} className={`mt-1 ${inp}`}>{(Object.keys(CERT_LABEL) as CertKind[]).map((k) => <option key={k} value={k}>{CERT_LABEL[k]}</option>)}</select></label>
            <label className="mt-3 block text-sm font-medium">الشعبة<select value={section.id} onChange={(e) => { setSectionId(e.target.value); setPicked(null); setIssued(null); }} className={`mt-1 ${inp}`}>{d.sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s, d.levels)}</option>)}</select></label>
          </div>
          <div className={card}>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">الطلاب ({selected.length}/{view.results.length})
              <span className="flex gap-2 text-xs font-normal"><button onClick={() => setPicked(null)} className="text-brand-dark">الكل</button><button onClick={() => setPicked(new Set())} className="text-muted">لا أحد</button></span></div>
            <div className="max-h-72 overflow-auto">{view.results.map((r) => (
              <label key={r.student.id} className="flex cursor-pointer items-center gap-2 border-b border-line py-1.5 text-sm last:border-0">
                <input type="checkbox" checked={!picked || picked.has(r.student.id)} onChange={() => toggle(r.student.id)} className="accent-[var(--color-brand)]" />
                <span className="min-w-0 flex-1 truncate">{r.student.name}</span><span className={`text-[10px] ${r.outcome === "fail" ? "text-red-600" : "text-muted"}`}>{OUTCOME_LABEL[r.outcome].split(" ")[0]}</span></label>))}
              {!view.results.length && <div className="text-xs text-muted">لا طلاب في الشعبة.</div>}</div>
          </div>
          <div className={card}>
            <div className="mb-2 text-sm font-semibold">نص الشهادة</div>
            <input value={tpl.title} onChange={(e) => setDraft({ ...tpl, title: e.target.value })} className={`mb-2 ${inp}`} />
            <textarea rows={6} value={tpl.body} onChange={(e) => setDraft({ ...tpl, body: e.target.value })} className={inp} />
            <p className="mt-1 text-[11px] text-muted" dir="ltr">{CERT_PLACEHOLDERS}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={tpl.landscape} onChange={(e) => setDraft({ ...tpl, landscape: e.target.checked })} className="accent-[var(--color-brand)]" /> أفقية</label>
              <label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={tpl.showScores} onChange={(e) => setDraft({ ...tpl, showScores: e.target.checked })} className="accent-[var(--color-brand)]" /> جدول الدرجات</label>
            </div>
            {draft && <button onClick={() => { saveTemplates(d.templates.map((t) => t.kind === draft.kind ? draft : t)); setDraft(null); reload(); }} className={`${btnGhost} mt-2`}><Save className="size-4" /> حفظ القالب</button>}
          </div>
        </div>
        <div className="min-w-0 overflow-x-auto">
          {selected[0] ? <Certificate t={tpl} text={textFor(selected[0], noOf(selected[0].student.id))} no={noOf(selected[0].student.id)} date={todayYmd()}
            scores={view.subs.map((s) => ({ subject: s.name, score: selected[0].scores[s.id] === null ? "—" : String(round2(selected[0].scores[s.id]!)) }))} /> : <Empty>اختر طالباً للمعاينة.</Empty>}
          <p className="mt-1 text-xs text-muted">معاينة أول طالب من المحدّدين؛ الطباعة تشمل كلهم، كل شهادة في صفحة.</p>
        </div>
      </div>
      <div className="hidden print:block">{selected.map((r, i) => (
        <Certificate key={r.student.id} t={tpl} breakBefore={i > 0} text={textFor(r, noOf(r.student.id))} no={noOf(r.student.id)} date={todayYmd()}
          scores={view.subs.map((s) => ({ subject: s.name, score: r.scores[s.id] === null ? "—" : String(round2(r.scores[s.id]!)) }))} />))}</div>
      {d.log.length > 0 && (
        <div className={`${card} no-print mt-6`}>
          <div className="mb-2 text-sm font-semibold">سجل الشهادات المطبوعة (آخر {Math.min(15, d.log.length)})</div>
          <table className="w-full text-sm"><tbody>{d.log.slice(0, 15).map((e) => <tr key={e.id} className="border-t border-line"><td className="p-1.5 tabular-nums">{e.no}</td><td className="p-1.5">{e.studentName}</td><td className="p-1.5">{CERT_LABEL[e.kind]}</td><td className="p-1.5 tabular-nums text-muted">{e.date}</td></tr>)}</tbody></table>
        </div>
      )}
    </div>
  );
}
