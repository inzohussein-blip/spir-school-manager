"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Trash2, Wand2, Pencil } from "lucide-react";
import {
  getLevels, saveLevels, getSubjects, saveSubjects, getCurriculum, saveCurriculum, seedIraqiCurriculum, levelName, STAGE_LABEL, SUBJECT_COLORS,
  type Level, type Subject, type CurriculumRow, type Stage,
} from "@/lib/school/store";
import { newId } from "@/lib/local/util";
import { PageTitle, inp, card, btnPrimary, btnGhost, Empty } from "@/components/school/ui";

export default function CurriculumPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [cur, setCur] = useState<CurriculumRow[]>([]);
  const [sel, setSel] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newLevel, setNewLevel] = useState<{ stage: Stage; name: string; branch: string }>({ stage: "primary", name: "", branch: "" });
  const reload = () => { const l = getLevels(); setLevels(l); setSubjects(getSubjects()); setCur(getCurriculum()); setSel((s) => (l.some((x) => x.id === s) ? s : l[0]?.id ?? "")); };
  useEffect(reload, []);
  const putCur = (v: CurriculumRow[]) => { setCur(v); saveCurriculum(v); };
  const rows = useMemo(() => cur.filter((r) => r.levelId === sel), [cur, sel]);
  const level = levels.find((l) => l.id === sel);
  const total = rows.reduce((n, r) => n + r.weekly, 0);
  const unused = subjects.filter((s) => !rows.some((r) => r.subjectId === s.id));

  function seed() {
    if (levels.length && !window.confirm("سيُستبدل ما لديك من صفوف ومواد ومنهج بالافتراضي العراقي. متابعة؟")) return;
    seedIraqiCurriculum(); reload();
  }
  function addLevel() {
    if (!newLevel.name.trim()) return;
    const l: Level = { id: newId(), stage: newLevel.stage, name: newLevel.name.trim(), order: levels.length, ...(newLevel.branch.trim() ? { branch: newLevel.branch.trim() } : {}) };
    const next = [...levels, l]; setLevels(next); saveLevels(next); setSel(l.id); setNewLevel({ ...newLevel, name: "", branch: "" });
  }
  function delLevel(l: Level) {
    if (!window.confirm(`حذف «${levelName(l)}» ومنهجه؟ الشعب والطلاب المرتبطون به يفقدون ربطهم.`)) return;
    const next = levels.filter((x) => x.id !== l.id); setLevels(next); saveLevels(next); putCur(cur.filter((r) => r.levelId !== l.id));
  }
  function addSubject() {
    const n = newSubject.trim(); if (!n || subjects.some((s) => s.name === n)) return;
    const next = [...subjects, { id: newId(), name: n, color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length] }]; setSubjects(next); saveSubjects(next); setNewSubject("");
  }
  function delSubject(s: Subject) {
    if (!window.confirm(`حذف المادة «${s.name}» من كل الصفوف؟`)) return;
    const next = subjects.filter((x) => x.id !== s.id); setSubjects(next); saveSubjects(next); putCur(cur.filter((r) => r.subjectId !== s.id));
  }
  function renameSubject(s: Subject) {
    const n = window.prompt("اسم المادة", s.name)?.trim(); if (!n) return;
    const next = subjects.map((x) => x.id === s.id ? { ...x, name: n } : x); setSubjects(next); saveSubjects(next);
  }

  return (
    <div>
      <PageTitle icon={<BookOpen className="size-6 text-brand" />} title="المراحل والصفوف والمواد" sub="لكل صف مواده وعدد حصصها الأسبوعية ودرجتها العظمى؛ عليها تُبنى الجداول والنتائج والخطط.">
        <button onClick={seed} className={btnPrimary}><Wand2 className="size-4" /> تحميل المنهج العراقي الافتراضي</button>
      </PageTitle>
      {!levels.length ? <Empty>لا صفوف بعد. اضغط «تحميل المنهج العراقي الافتراضي» (ابتدائي 1–6، متوسط 1–3، إعدادي 4–6 علمي/أدبي) ثم عدّل ما يلزم، أو أضف صفاً يدوياً أدناه.</Empty> : (
        <div className="grid gap-5 lg:grid-cols-[16rem_1fr]">
          <div className={`${card} !p-3`}>
            {(Object.keys(STAGE_LABEL) as Stage[]).map((st) => levels.some((l) => l.stage === st) && (
              <div key={st} className="mb-2">
                <div className="px-2 py-1 text-xs font-semibold text-muted">{STAGE_LABEL[st]}</div>
                {levels.filter((l) => l.stage === st).map((l) => (
                  <button key={l.id} onClick={() => setSel(l.id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm ${sel === l.id ? "bg-brand font-semibold text-white" : "hover:bg-canvas"}`}>
                    {levelName(l)}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {level && (
            <div className={card}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-lg font-bold">{levelName(level)} <span className="text-xs font-normal text-muted">— {total} حصة أسبوعياً</span></div>
                <button onClick={() => delLevel(level)} className={`${btnGhost} text-red-600`}><Trash2 className="size-4" /> حذف الصف</button>
              </div>
              <div className="grid gap-2">
                <div className="hidden grid-cols-[1fr_6rem_6rem_2rem] gap-2 px-1 text-xs font-semibold text-muted sm:grid"><span>المادة</span><span>حصص/أسبوع</span><span>الدرجة العظمى</span><span /></div>
                {rows.map((r) => {
                  const sub = subjects.find((s) => s.id === r.subjectId);
                  return (
                    <div key={r.id} className="grid items-center gap-2 sm:grid-cols-[1fr_6rem_6rem_2rem]">
                      <span className="flex items-center gap-2 text-sm"><span className="size-3 rounded-full" style={{ background: sub?.color }} />{sub?.name}</span>
                      <input type="number" min={0} max={20} value={r.weekly} onChange={(e) => putCur(cur.map((x) => x.id === r.id ? { ...x, weekly: Math.max(0, Number(e.target.value) || 0) } : x))} className={inp} />
                      <input type="number" min={1} value={r.max} onChange={(e) => putCur(cur.map((x) => x.id === r.id ? { ...x, max: Math.max(1, Number(e.target.value) || 100) } : x))} className={inp} />
                      <button onClick={() => putCur(cur.filter((x) => x.id !== r.id))} aria-label="إزالة" className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
                    </div>
                  );
                })}
              </div>
              {unused.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <select id="addsub" defaultValue="" className={`max-w-xs ${inp}`}>
                    <option value="" disabled>أضف مادة لهذا الصف…</option>
                    {unused.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button className={btnGhost} onClick={() => { const el = document.getElementById("addsub") as HTMLSelectElement; if (el.value) { putCur([...cur, { id: newId(), levelId: level.id, subjectId: el.value, weekly: 2, max: 100 }]); el.value = ""; } }}><Plus className="size-4" /> إضافة</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className={card}>
          <div className="mb-2 text-sm font-semibold">المواد الدراسية ({subjects.length})</div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas py-1 ps-3 pe-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: s.color }} />{s.name}
                <button onClick={() => renameSubject(s)} aria-label={`تعديل ${s.name}`} className="text-muted hover:text-ink"><Pencil className="size-3.5" /></button>
                <button onClick={() => delSubject(s)} aria-label={`حذف ${s.name}`} className="text-red-600"><Trash2 className="size-3.5" /></button>
              </span>
            ))}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addSubject(); }}>
            <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="مادة جديدة" className={`max-w-xs ${inp}`} />
            <button className={btnPrimary}><Plus className="size-4" /> إضافة</button>
          </form>
        </div>
        <div className={card}>
          <div className="mb-2 text-sm font-semibold">إضافة صف</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={newLevel.stage} onChange={(e) => setNewLevel({ ...newLevel, stage: e.target.value as Stage })} className={inp}>
              {(Object.keys(STAGE_LABEL) as Stage[]).map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
            </select>
            <input value={newLevel.name} onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })} placeholder="مثلاً: الرابع الإعدادي" className={inp} />
            <input value={newLevel.branch} onChange={(e) => setNewLevel({ ...newLevel, branch: e.target.value })} placeholder="الفرع (علمي/أدبي)" className={inp} />
          </div>
          <button onClick={addLevel} className={`${btnPrimary} mt-3`}><Plus className="size-4" /> إضافة الصف</button>
        </div>
      </div>
    </div>
  );
}
