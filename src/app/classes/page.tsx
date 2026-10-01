"use client";

import Link from "next/link";
import { useState } from "react";
import { School, Plus, Pencil, Trash2, CalendarDays, UserPlus } from "lucide-react";
import {
  getSections, saveSections, getTimetable, saveTimetable, getLevels, getStudents, saveStudents, getTeachers, getRooms, levelName, sectionLabel, STAGE_LABEL, type Section, type Stage,
} from "@/lib/school/store";
import { newId } from "@/lib/local/util";
import { PageTitle, Field, Modal, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function ClassesPage() {
  const [d, reload] = useLive(() => ({ sections: getSections(), levels: getLevels(), students: getStudents(), teachers: getTeachers(), rooms: getRooms() }), null);
  const [edit, setEdit] = useState<Section | null>(null);
  const [assign, setAssign] = useState<Section | null>(null);
  if (!d) return null;
  const { sections, levels, students, teachers, rooms } = d;
  const put = (v: Section[]) => { saveSections(v); reload(); };
  const count = (id: string) => students.filter((s) => s.sectionId === id && s.status === "active").length;
  function save(s: Section) {
    if (!s.levelId || !s.name.trim()) return;
    put(s.id ? sections.map((x) => x.id === s.id ? { ...s, name: s.name.trim() } : x) : [...sections, { ...s, id: newId(), name: s.name.trim() }]);
    setEdit(null);
  }
  function remove(s: Section) {
    if (!window.confirm(`حذف الشعبة «${sectionLabel(s, levels)}»؟ يبقى طلابها بلا شعبة ويُحذف جدولها.`)) return;
    saveStudents(getStudents().map((x) => x.sectionId === s.id ? { ...x, sectionId: undefined } : x));
    const tt = getTimetable(); for (const k of Object.keys(tt)) if (k.startsWith(s.id + "|")) delete tt[k]; saveTimetable(tt);
    put(sections.filter((x) => x.id !== s.id));
  }
  const unassigned = students.filter((s) => s.status === "active" && !s.sectionId).length;
  return (
    <div>
      <PageTitle icon={<School className="size-6 text-brand" />} title="الصفوف والشعب" sub={`${sections.length} شعبة · ${unassigned} طالب بلا شعبة`}>
        <button onClick={() => setEdit({ id: "", levelId: levels[0]?.id ?? "", name: "أ", capacity: 35 })} disabled={!levels.length} className={btnPrimary}><Plus className="size-4" /> شعبة جديدة</button>
      </PageTitle>
      {!levels.length && <Empty>حمّل الصفوف والمواد أولاً من محطة «الإعداد ← المراحل والصفوف والمواد».</Empty>}
      {(Object.keys(STAGE_LABEL) as Stage[]).map((stage) => {
        const ls = levels.filter((l) => l.stage === stage && sections.some((s) => s.levelId === l.id));
        if (!ls.length) return null;
        return (
          <div key={stage} className="mb-6">
            <div className="mb-2 text-sm font-bold text-muted">المرحلة {STAGE_LABEL[stage]}</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ls.flatMap((l) => sections.filter((s) => s.levelId === l.id).map((s) => {
                const n = count(s.id); const t = teachers.find((x) => x.id === s.homeroomId);
                return (
                  <div key={s.id} className={card}>
                    <div className="flex items-start justify-between gap-2">
                      <div><div className="text-lg font-bold">{levelName(l)} / {s.name}</div><div className="text-xs text-muted">{t ? `المربّي: ${t.name}` : "بلا مربٍّ"}{s.room ? ` · ${s.room}` : ""}</div></div>
                      <div className="flex gap-1">
                        <button onClick={() => setEdit(s)} aria-label="تعديل" className="grid size-8 place-items-center rounded-lg border border-line hover:bg-canvas"><Pencil className="size-3.5" /></button>
                        <button onClick={() => remove(s)} aria-label="حذف" className="grid size-8 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${n > s.capacity ? "bg-red-500" : "bg-brand"}`} style={{ width: `${Math.min(100, (n / Math.max(1, s.capacity)) * 100)}%` }} /></div>
                    <div className="mt-1 text-xs text-muted tabular-nums">{n} من {s.capacity} طالب{n > s.capacity ? " — تجاوز السعة!" : ""}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/classes/timetable#${s.id}`} className={btnGhost}><CalendarDays className="size-4" /> الجدول</Link>
                      <button onClick={() => setAssign(s)} className={btnGhost}><UserPlus className="size-4" /> توزيع طلاب</button>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        );
      })}
      {edit && <SectionForm s={edit} onSave={save} onClose={() => setEdit(null)} rooms={rooms.map((r) => r.name)} />}
      {assign && <AssignStudents s={assign} onClose={() => { setAssign(null); reload(); }} />}
    </div>
  );
}

function SectionForm({ s, onSave, onClose, rooms }: { s: Section; onSave: (s: Section) => void; onClose: () => void; rooms: string[] }) {
  const [f, setF] = useState(s); const levels = getLevels(); const teachers = getTeachers().filter((t) => t.active);
  return (
    <Modal title={s.id ? "تعديل شعبة" : "شعبة جديدة"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="grid gap-3 sm:grid-cols-2">
        <Field label="الصف *"><select value={f.levelId} onChange={(e) => setF({ ...f, levelId: e.target.value })} className={inp}>{levels.map((l) => <option key={l.id} value={l.id}>{levelName(l)}</option>)}</select></Field>
        <Field label="اسم الشعبة *"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="أ" className={inp} /></Field>
        <Field label="السعة (عدد الطلاب)"><input type="number" min={1} value={f.capacity} onChange={(e) => setF({ ...f, capacity: Math.max(1, Number(e.target.value) || 1) })} className={inp} /></Field>
        <Field label="مدرس الصف (المربّي)"><select value={f.homeroomId ?? ""} onChange={(e) => setF({ ...f, homeroomId: e.target.value || undefined })} className={inp}><option value="">—</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
        <Field label="القاعة الأساسية" className="sm:col-span-2"><input list="rooms" value={f.room ?? ""} onChange={(e) => setF({ ...f, room: e.target.value || undefined })} className={inp} /><datalist id="rooms">{rooms.map((r) => <option key={r} value={r} />)}</datalist></Field>
        <div className="flex gap-2 sm:col-span-2"><button className={btnPrimary}>حفظ</button><button type="button" onClick={onClose} className={btnGhost}>إلغاء</button></div>
      </form>
    </Modal>
  );
}

/** Put students without a section into this one (tick them), or take its students out. */
function AssignStudents({ s, onClose }: { s: Section; onClose: () => void }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const all = getStudents().filter((x) => x.status === "active");
  const free = all.filter((x) => !x.sectionId);
  const mine = all.filter((x) => x.sectionId === s.id);
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const apply = (ids: Set<string>, sectionId?: string) => { saveStudents(getStudents().map((x) => ids.has(x.id) ? { ...x, sectionId } : x)); onClose(); };
  return (
    <Modal title={`توزيع الطلاب على ${s.name}`} onClose={onClose} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm font-semibold"><span>طلاب بلا شعبة ({free.length})</span>
            <button className="text-xs text-brand-dark" onClick={() => setPicked(new Set(free.slice(0, Math.max(0, s.capacity - mine.length)).map((x) => x.id)))}>تحديد بقدر السعة</button></div>
          <div className="max-h-72 overflow-auto rounded-lg border border-line">{free.map((x) => (
            <label key={x.id} className="flex cursor-pointer items-center gap-2 border-b border-line px-3 py-1.5 text-sm last:border-0 hover:bg-canvas"><input type="checkbox" checked={picked.has(x.id)} onChange={() => toggle(x.id)} className="accent-[var(--color-brand)]" />{x.name}</label>
          ))}{!free.length && <div className="p-3 text-xs text-muted">لا يوجد.</div>}</div>
          <button disabled={!picked.size} onClick={() => apply(picked, s.id)} className={`${btnPrimary} mt-2`}>إضافة المحدّدين ({picked.size})</button>
        </div>
        <div>
          <div className="mb-1 text-sm font-semibold">طلاب الشعبة ({mine.length})</div>
          <div className="max-h-72 overflow-auto rounded-lg border border-line">{mine.map((x) => (
            <div key={x.id} className="flex items-center justify-between border-b border-line px-3 py-1.5 text-sm last:border-0">{x.name}
              <button onClick={() => apply(new Set([x.id]), undefined)} className="text-xs text-red-600">إخراج</button></div>
          ))}{!mine.length && <div className="p-3 text-xs text-muted">فارغة.</div>}</div>
        </div>
      </div>
    </Modal>
  );
}
