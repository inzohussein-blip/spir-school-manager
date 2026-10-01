"use client";

import { useMemo, useState } from "react";
import { Users, Plus, Pencil, Trash2, Phone, Search } from "lucide-react";
import { getTeachers, saveTeachers, getSubjects, getTimetable, getInfo, teacherLoad, TEACHER_COLORS, CONTRACT_LABEL, type Teacher } from "@/lib/school/store";
import { newId, todayYmd } from "@/lib/local/util";
import { money, CURRENCY } from "@/lib/utils";
import { PageTitle, Field, Modal, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

const blank = (n: number): Teacher => ({ id: "", name: "", subjectIds: [], load: 24, active: true, color: TEACHER_COLORS[n % TEACHER_COLORS.length], contract: "permanent", hireDate: todayYmd() });

export default function TeachersPage() {
  const [d, reload] = useLive(() => ({ teachers: getTeachers(), subjects: getSubjects(), tt: getTimetable(), priv: getInfo().kind === "private" }), null);
  const [edit, setEdit] = useState<Teacher | null>(null); const [q, setQ] = useState("");
  const shown = useMemo(() => (d?.teachers ?? []).filter((t) => !q.trim() || `${t.name} ${t.specialty ?? ""}`.includes(q.trim())), [d, q]);
  if (!d) return null;
  const { teachers, subjects, tt, priv } = d;
  const put = (v: Teacher[]) => { saveTeachers(v); reload(); };
  function save(t: Teacher) {
    if (!t.name.trim()) return;
    put(t.id ? teachers.map((x) => x.id === t.id ? { ...t, name: t.name.trim() } : x) : [...teachers, { ...t, id: newId(), name: t.name.trim() }]);
    setEdit(null);
  }
  return (
    <div>
      <PageTitle icon={<Users className="size-6 text-brand" />} title="الكادر التدريسي" sub={`${teachers.filter((t) => t.active).length} مدرس فعّال`}>
        <button onClick={() => window.print()} className={btnGhost}>طباعة الكشف</button>
        <button onClick={() => setEdit(blank(teachers.length))} className={btnPrimary}><Plus className="size-4" /> مدرس جديد</button>
      </PageTitle>
      <div className="no-print relative mb-4 max-w-sm"><Search className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو الاختصاص…" className={`${inp} ps-9`} /></div>
      {!shown.length ? <Empty>{teachers.length ? "لا نتائج." : "لا مدرسين بعد. أضف الكادر التدريسي."}</Empty> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((t) => {
            const n = teacherLoad(tt, t.id);
            return (
              <div key={t.id} className={`${card} flex gap-3 ${t.active ? "" : "opacity-60"}`}>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl text-lg font-bold text-white" style={{ background: t.color }}>{t.name.slice(0, 1)}</span>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div><div className="font-bold">{t.name}{!t.active && <span className="text-xs font-normal text-muted"> (غير فعّال)</span>}</div><div className="text-xs text-muted">{t.specialty || "—"} · {CONTRACT_LABEL[t.contract ?? "permanent"]}</div></div>
                    <div className="no-print flex shrink-0 gap-1">
                      <button onClick={() => setEdit(t)} aria-label={`تعديل ${t.name}`} className="grid size-7 place-items-center rounded-lg border border-line hover:bg-canvas"><Pencil className="size-3.5" /></button>
                      <button onClick={() => window.confirm(`حذف «${t.name}»؟ يُزال من الجداول.`) && put(teachers.filter((x) => x.id !== t.id))} aria-label={`حذف ${t.name}`} className="grid size-7 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">{t.subjectIds.map((id) => <span key={id} className="rounded-full bg-canvas px-2 py-0.5 text-[11px]">{subjects.find((s) => s.id === id)?.name}</span>)}</div>
                  <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted">
                    <span>الحصص: <b className={`tabular-nums ${n > t.load ? "text-red-600" : "text-ink"}`}>{n}</b> / {t.load}</span>
                    {t.phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone className="size-3" />{t.phone}</span>}
                    {priv && t.salary ? <span>الراتب: <b className="text-ink">{money(t.salary)}</b> {CURRENCY}</span> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {edit && <TeacherForm t={edit} subjects={subjects} priv={priv} onSave={save} onClose={() => setEdit(null)} />}
    </div>
  );
}

function TeacherForm({ t, subjects, priv, onSave, onClose }: { t: Teacher; subjects: ReturnType<typeof getSubjects>; priv: boolean; onSave: (t: Teacher) => void; onClose: () => void }) {
  const [f, setF] = useState(t); const set = <K extends keyof Teacher>(k: K, v: Teacher[K]) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Modal title={t.id ? "تعديل مدرس" : "مدرس جديد"} onClose={onClose} wide>
      <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="grid gap-3 sm:grid-cols-2">
        <Field label="الاسم *" className="sm:col-span-2"><input autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} className={inp} /></Field>
        <Field label="الاختصاص / الشهادة"><input value={f.specialty ?? ""} onChange={(e) => set("specialty", e.target.value)} placeholder="بكالوريوس رياضيات" className={inp} /></Field>
        <Field label="الهاتف"><input dir="ltr" value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inp} /></Field>
        <Field label="النصاب الأسبوعي (حصص)"><input type="number" min={0} value={f.load} onChange={(e) => set("load", Math.max(0, Number(e.target.value) || 0))} className={inp} /></Field>
        <Field label="نوع التعيين"><select value={f.contract ?? "permanent"} onChange={(e) => set("contract", e.target.value as Teacher["contract"])} className={inp}>{Object.entries(CONTRACT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <Field label="تاريخ التعيين"><input type="date" value={f.hireDate ?? ""} onChange={(e) => set("hireDate", e.target.value)} className={inp} /></Field>
        {priv && <Field label={`الراتب (${CURRENCY})`}><input inputMode="numeric" dir="ltr" value={f.salary ?? ""} onChange={(e) => set("salary", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : undefined)} className={inp} /></Field>}
        <div className="text-sm font-medium sm:col-span-2">المواد التي يدرّسها
          <div className="mt-2 flex flex-wrap gap-1.5">{subjects.map((s) => { const on = f.subjectIds.includes(s.id);
            return <button key={s.id} type="button" aria-pressed={on} onClick={() => set("subjectIds", on ? f.subjectIds.filter((x) => x !== s.id) : [...f.subjectIds, s.id])}
              className={`rounded-full border px-3 py-1 text-xs ${on ? "border-brand bg-brand font-semibold text-white" : "border-line hover:bg-canvas"}`}>{s.name}</button>; })}
            {!subjects.length && <span className="text-xs text-muted">حمّل المواد أولاً من محطة الإعداد.</span>}</div>
        </div>
        <div className="text-sm font-medium">اللون في الجداول<div className="mt-2 flex flex-wrap gap-1.5">{TEACHER_COLORS.map((c) => <button key={c} type="button" aria-label={c} onClick={() => set("color", c)} className={`size-6 rounded-full ${f.color === c ? "ring-2 ring-ink ring-offset-2" : ""}`} style={{ background: c }} />)}</div></div>
        <label className="inline-flex items-center gap-1.5 self-end pb-1 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="accent-[var(--color-brand)]" /> فعّال</label>
        <Field label="ملاحظات" className="sm:col-span-2"><input value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className={inp} /></Field>
        <div className="flex gap-2 sm:col-span-2"><button className={btnPrimary}>{t.id ? "حفظ التعديل" : "إضافة"}</button><button type="button" onClick={onClose} className={btnGhost}>إلغاء</button></div>
      </form>
    </Modal>
  );
}
