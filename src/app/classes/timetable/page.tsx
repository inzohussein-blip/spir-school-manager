"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Printer, Trash2, Copy, AlertTriangle } from "lucide-react";
import {
  getSections, getLevels, getSubjects, getCurriculum, getTeachers, getTimetable, saveTimetable, getPeriods, getInfo, getRooms,
  slotKey, slotConflicts, subjectCount, teacherLoad, sectionLabel, type Slot, type Timetable,
} from "@/lib/school/store";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { TimetableGrid } from "@/components/school/TimetableGrid";
import { PageTitle, Modal, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function TimetablePage() {
  const [d, reload] = useLive(() => ({
    sections: getSections(), levels: getLevels(), subjects: getSubjects(), cur: getCurriculum(), teachers: getTeachers(), tt: getTimetable(),
    periods: getPeriods(), info: getInfo(), rooms: getRooms(),
  }), null);
  const [sectionId, setSectionId] = useState("");
  const [cellAt, setCellAt] = useState<{ day: number; no: number } | null>(null);
  useEffect(() => { const h = location.hash.slice(1); if (h) setSectionId(h); }, []);
  const sections = d?.sections ?? [];
  useEffect(() => { if (d && (!sectionId || !sections.some((s) => s.id === sectionId))) setSectionId(sections[0]?.id ?? ""); }, [d, sectionId, sections]);
  const section = sections.find((s) => s.id === sectionId);
  const rows = useMemo(() => d?.cur.filter((r) => r.levelId === section?.levelId) ?? [], [d, section]);
  if (!d) return null;
  const { levels, subjects, teachers, tt, periods, info, rooms } = d;
  if (!section) return (<div><PageTitle icon={<CalendarDays className="size-6 text-brand" />} title="جدول الشعبة" /><Empty>أنشئ شعبة أولاً من صفحة «الشعب».</Empty></div>);
  if (!periods.length) return (<div><PageTitle icon={<CalendarDays className="size-6 text-brand" />} title="جدول الشعبة" /><Empty>حدّد الحصص أولاً من «الإعداد ← الحصص وأيام الدوام».</Empty></div>);
  const days = info.workDays;
  const put = (next: Timetable) => { saveTimetable(next); reload(); };

  function setSlot(day: number, no: number, slot: Slot | null) {
    const next = { ...tt }; const k = slotKey(section!.id, day, no);
    if (slot) next[k] = slot; else delete next[k];
    put(next);
  }
  function clearAll() { if (!window.confirm("مسح جدول هذه الشعبة كله؟")) return; const next = { ...tt }; for (const k of Object.keys(next)) if (k.startsWith(section!.id + "|")) delete next[k]; put(next); }
  function copyFrom() {
    const others = sections.filter((s) => s.id !== section!.id);
    const name = window.prompt("انسخ جدول أي شعبة؟ اكتب رقمها:\n" + others.map((s, i) => `${i + 1}) ${sectionLabel(s, levels)}`).join("\n"));
    const src = others[Number(name) - 1]; if (!src) return;
    const next = { ...tt }; for (const k of Object.keys(next)) if (k.startsWith(section!.id + "|")) delete next[k];
    for (const [k, v] of Object.entries(tt)) if (k.startsWith(src.id + "|")) next[slotKey(section!.id, Number(k.split("|")[1]), Number(k.split("|")[2]))] = { ...v, teacherId: undefined };
    put(next);
  }
  const cellView = (day: number, no: number) => {
    const s = tt[slotKey(section.id, day, no)]; if (!s) return <span className="text-gray-300">+</span>;
    const sub = subjects.find((x) => x.id === s.subjectId); const t = teachers.find((x) => x.id === s.teacherId);
    const bad = slotConflicts(tt, section.id, day, no, s, sections, levels, teachers).length > 0;
    return <div className={`rounded-md px-1 py-1 ${bad ? "ring-2 ring-red-400" : ""}`} style={{ background: (sub?.color ?? "#64748b") + "22" }}>
      <div className="font-semibold leading-tight">{sub?.name ?? "—"}</div>
      {t && <div className="text-[10px] text-gray-600">{t.name}</div>}
      {s.room && <div className="text-[10px] text-gray-500">{s.room}</div>}
    </div>;
  };
  const missing = rows.map((r) => ({ r, have: subjectCount(tt, section.id, r.subjectId) })).filter((x) => x.have !== x.r.weekly);

  return (
    <div>
      <PageTitle icon={<CalendarDays className="size-6 text-brand" />} title="جدول الشعبة" sub="انقر خانة لتعيين المادة والمدرس والقاعة؛ يكشف النظام التعارض فوراً.">
        <select value={section.id} onChange={(e) => { setSectionId(e.target.value); history.replaceState(null, "", `#${e.target.value}`); }} className={`w-56 ${inp}`}>
          {sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s, levels)}</option>)}
        </select>
        <button onClick={copyFrom} className={btnGhost}><Copy className="size-4" /> نسخ من شعبة</button>
        <button onClick={clearAll} className={`${btnGhost} text-red-600`}><Trash2 className="size-4" /> مسح</button>
        <button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة</button>
      </PageTitle>
      <div className="grid gap-5 xl:grid-cols-[1fr_16rem]">
        <SchoolSheet title={`جدول ${sectionLabel(section, levels)}`}>
          <TimetableGrid days={days} periods={periods} cell={cellView} onCell={(day, no) => setCellAt({ day, no })} />
        </SchoolSheet>
        <aside className={`${card} no-print h-fit`}>
          <div className="mb-2 text-sm font-semibold">حصص المواد (الفعلي / المطلوب)</div>
          <ul className="grid gap-1.5 text-sm">
            {rows.map((r) => { const have = subjectCount(tt, section.id, r.subjectId); const sub = subjects.find((s) => s.id === r.subjectId);
              return <li key={r.id} className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: sub?.color }} />{sub?.name}</span>
                <b className={`tabular-nums ${have === r.weekly ? "text-brand-dark" : have > r.weekly ? "text-red-600" : "text-amber-600"}`}>{have} / {r.weekly}</b></li>; })}
            {!rows.length && <li className="text-xs text-muted">لا مواد لهذا الصف في المنهج.</li>}
          </ul>
          {missing.length > 0 && <p className="mt-3 flex items-start gap-1.5 text-xs text-amber-700"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {missing.length} مادة عدد حصصها غير مطابق للمنهج.</p>}
        </aside>
      </div>
      {cellAt && <CellDialog day={cellAt.day} no={cellAt.no} sectionId={section.id} onClose={() => setCellAt(null)} onSet={(s) => { setSlot(cellAt.day, cellAt.no, s); setCellAt(null); }}
        data={{ rows, subjects, teachers, tt, sections, levels, rooms: rooms.map((r) => r.name) }} />}
    </div>
  );
}

function CellDialog({ day, no, sectionId, data, onSet, onClose }: {
  day: number; no: number; sectionId: string; onClose: () => void; onSet: (s: Slot | null) => void;
  data: { rows: ReturnType<typeof getCurriculum>; subjects: ReturnType<typeof getSubjects>; teachers: ReturnType<typeof getTeachers>; tt: Timetable; sections: ReturnType<typeof getSections>; levels: ReturnType<typeof getLevels>; rooms: string[] };
}) {
  const cur = data.tt[slotKey(sectionId, day, no)];
  const [subjectId, setSubjectId] = useState(cur?.subjectId ?? data.rows[0]?.subjectId ?? "");
  const [teacherId, setTeacherId] = useState(cur?.teacherId ?? "");
  const [room, setRoom] = useState(cur?.room ?? "");
  // Teachers of the chosen subject first.
  const ts = [...data.teachers.filter((t) => t.active)].sort((a, b) => Number(b.subjectIds.includes(subjectId)) - Number(a.subjectIds.includes(subjectId)));
  const slot: Slot = { subjectId, ...(teacherId ? { teacherId } : {}), ...(room ? { room } : {}) };
  const clashes = slotConflicts(data.tt, sectionId, day, no, slot, data.sections, data.levels, data.teachers);
  const t = data.teachers.find((x) => x.id === teacherId);
  return (
    <Modal title="تعيين الحصة" onClose={onClose}>
      <div className="grid gap-3">
        <label className="text-sm font-medium">المادة<select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTeacherId(""); }} className={`mt-1 ${inp}`}>
          {data.rows.map((r) => { const s = data.subjects.find((x) => x.id === r.subjectId); return <option key={r.id} value={r.subjectId}>{s?.name}</option>; })}
        </select></label>
        <label className="text-sm font-medium">المدرس<select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={`mt-1 ${inp}`}>
          <option value="">— غير محدد —</option>
          {ts.map((x) => <option key={x.id} value={x.id}>{x.name}{x.subjectIds.includes(subjectId) ? " ★" : ""} ({teacherLoad(data.tt, x.id)}/{x.load})</option>)}
        </select></label>
        <label className="text-sm font-medium">القاعة (اختياري)<input list="room-list" value={room} onChange={(e) => setRoom(e.target.value)} className={`mt-1 ${inp}`} /><datalist id="room-list">{data.rooms.map((r) => <option key={r} value={r} />)}</datalist></label>
        {t && !t.subjectIds.includes(subjectId) && <p className="text-xs text-amber-700">تنبيه: {t.name} غير مسجّل لتدريس هذه المادة.</p>}
        {clashes.map((c) => <p key={c} className="flex items-start gap-1.5 text-xs text-red-600"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{c}</p>)}
        <div className="flex flex-wrap gap-2">
          <button disabled={!subjectId} onClick={() => onSet(slot)} className={btnPrimary}>{clashes.length ? "حفظ رغم التعارض" : "حفظ"}</button>
          {cur && <button onClick={() => onSet(null)} className={`${btnGhost} text-red-600`}>إفراغ الخانة</button>}
        </div>
      </div>
    </Modal>
  );
}
