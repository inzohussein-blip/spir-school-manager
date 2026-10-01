"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Trash2, Wand2 } from "lucide-react";
import { getPeriods, savePeriods, defaultPeriods, getRooms, saveRooms, type Period, type Room } from "@/lib/school/store";
import { newId } from "@/lib/local/util";
import { PageTitle, inp, card, btnPrimary, btnGhost } from "@/components/school/ui";

export default function PeriodsPage() {
  const [ps, setPs] = useState<Period[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState("");
  useEffect(() => { setPs(getPeriods()); setRooms(getRooms()); }, []);
  const put = (v: Period[]) => { const n = [...v].sort((a, b) => a.no - b.no); setPs(n); savePeriods(n); };
  const putRooms = (v: Room[]) => { setRooms(v); saveRooms(v); };
  const renumber = (v: Period[]) => put(v.map((p, i) => ({ ...p, no: i + 1 })));
  let teaching = 0;
  return (
    <div>
      <PageTitle icon={<Clock className="size-6 text-brand" />} title="الحصص وأيام الدوام" sub="تُبنى عليها جداول الشعب والمدرسين. الاستراحة تظهر في الجدول ولا تُحسب حصة.">
        <button onClick={() => { if (!ps.length || window.confirm("استبدال الحصص الحالية بالافتراضية (6 حصص واستراحة)؟")) put(defaultPeriods()); }} className={btnGhost}><Wand2 className="size-4" /> حصص افتراضية</button>
      </PageTitle>
      <div className={card}>
        <div className="grid gap-2">
          {ps.map((p) => {
            if (!p.isBreak) teaching++;
            return (
              <div key={p.id} className="grid items-center gap-2 sm:grid-cols-[6rem_8rem_8rem_auto_2rem]">
                <div className="text-sm font-semibold">{p.isBreak ? "استراحة" : `الحصة ${teaching}`}</div>
                <input type="time" value={p.start} onChange={(e) => put(ps.map((x) => x.id === p.id ? { ...x, start: e.target.value } : x))} className={inp} />
                <input type="time" value={p.end} onChange={(e) => put(ps.map((x) => x.id === p.id ? { ...x, end: e.target.value } : x))} className={inp} />
                <label className="inline-flex items-center gap-1.5 text-sm"><input type="checkbox" checked={!!p.isBreak} onChange={(e) => put(ps.map((x) => x.id === p.id ? { ...x, isBreak: e.target.checked } : x))} className="accent-[var(--color-brand)]" /> استراحة</label>
                <button onClick={() => renumber(ps.filter((x) => x.id !== p.id))} aria-label="حذف" className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
              </div>
            );
          })}
        </div>
        <button onClick={() => { const last = ps[ps.length - 1]; put([...ps, { id: newId(), no: ps.length + 1, start: last?.end ?? "08:00", end: last?.end ?? "08:45" }]); }} className={`${btnGhost} mt-3`}><Plus className="size-4" /> إضافة حصة</button>
      </div>
      <div className={`${card} mt-5`}>
        <div className="mb-2 text-sm font-semibold">القاعات والمختبرات (اختياري)</div>
        <p className="mb-3 text-xs text-muted">إن سجّلتها تظهر في خانات الجدول ويكشف النظام تعارض القاعات.</p>
        <div className="flex flex-wrap gap-2">
          {rooms.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-sm">
              {r.name}<button onClick={() => putRooms(rooms.filter((x) => x.id !== r.id))} aria-label={`حذف ${r.name}`} className="text-red-600"><Trash2 className="size-3.5" /></button>
            </span>
          ))}
        </div>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const n = room.trim(); if (n && !rooms.some((r) => r.name === n)) putRooms([...rooms, { id: newId(), name: n }]); setRoom(""); }}>
          <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="مثلاً: مختبر العلوم" className={`max-w-xs ${inp}`} />
          <button className={btnPrimary}><Plus className="size-4" /> إضافة</button>
        </form>
      </div>
    </div>
  );
}
