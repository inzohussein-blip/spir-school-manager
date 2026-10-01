"use client";

import { useMemo, useState } from "react";
import { CalendarOff, Plus, Trash2, ChevronRight, ChevronLeft, Wand2 } from "lucide-react";
import { getHolidays, saveHolidays, holidayOn, dayOfWeek, FIXED_HOLIDAYS, HOLIDAY_KIND, type Holiday, type HolidayKind } from "@/lib/school/leaves";
import { getInfo, currentYear } from "@/lib/school/store";
import { newId, todayYmd, addDays, AR_DAYS } from "@/lib/local/util";
import { PageTitle, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

const MONTHS = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];

export default function HolidaysPage() {
  const [d, reload] = useLive(() => ({ hs: getHolidays(), info: getInfo(), year: currentYear() }), null);
  const [ym, setYm] = useState(() => todayYmd().slice(0, 7));
  const [f, setF] = useState<{ name: string; from: string; to: string; kind: HolidayKind }>({ name: "", from: todayYmd(), to: todayYmd(), kind: "official" });
  const cells = useMemo(() => {
    const first = `${ym}-01`; const lead = dayOfWeek(first);
    const days: (string | null)[] = Array(lead).fill(null);
    for (let i = 0; i < 31; i++) { const dt = addDays(first, i); if (dt.slice(0, 7) !== ym) break; days.push(dt); }
    return days;
  }, [ym]);
  if (!d) return null;
  const { hs, info } = d;
  const put = (v: Holiday[]) => { saveHolidays(v); reload(); };
  const shift = (n: number) => { const [y, m] = ym.split("-").map(Number); const dt = new Date(y, m - 1 + n, 1); setYm(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`); };
  function add() {
    if (!f.name.trim() || !f.from) return;
    put([...hs, { id: newId(), name: f.name.trim(), from: f.from, to: f.to >= f.from ? f.to : f.from, kind: f.kind }]); setF({ ...f, name: "" });
  }
  function fixed() {
    const years = new Set([ym.slice(0, 4), d!.year?.start.slice(0, 4) ?? ym.slice(0, 4), d!.year?.end.slice(0, 4) ?? ym.slice(0, 4)]);
    const add = [...years].flatMap((y) => FIXED_HOLIDAYS(Number(y))).filter((h) => !hs.some((x) => x.from === h.from && x.name === h.name));
    put([...hs, ...add.map((h) => ({ ...h, id: newId() }))]);
  }
  return (
    <div>
      <PageTitle icon={<CalendarOff className="size-6 text-brand" />} title="تقويم العطل" sub="العطل الرسمية والمدرسية تُستثنى من الحضور ومن أيام الخطة السنوية وأرصدة الإجازات.">
        <button onClick={fixed} className={btnGhost}><Wand2 className="size-4" /> العطل الرسمية الثابتة</button>
      </PageTitle>
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className={card}>
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => shift(-1)} aria-label="الشهر السابق" className={btnGhost}><ChevronRight className="size-4" /></button>
            <div className="font-bold">{MONTHS[Number(ym.slice(5)) - 1]} <span className="tabular-nums">{ym.slice(0, 4)}</span></div>
            <button onClick={() => shift(1)} aria-label="الشهر التالي" className={btnGhost}><ChevronLeft className="size-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {AR_DAYS.map((n) => <div key={n} className="py-1 font-semibold text-muted">{n.replace("ال", "")}</div>)}
            {cells.map((dt, i) => {
              if (!dt) return <div key={i} />;
              const h = holidayOn(hs, dt); const off = !info.workDays.includes(dayOfWeek(dt));
              return <div key={dt} title={h?.name} className={`grid h-12 place-items-center rounded-lg border text-sm tabular-nums ${h ? "border-rose-300 bg-rose-100 font-bold text-rose-800" : off ? "border-line bg-canvas text-muted" : "border-line"} ${dt === todayYmd() ? "ring-2 ring-brand" : ""}`}>
                {Number(dt.slice(8))}{h && <span className="-mt-1 block max-w-full truncate px-0.5 text-[9px] font-normal">{h.name}</span>}</div>;
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted">الوردي: عطلة · الرمادي: خارج أيام الدوام (من «الإعداد ← بيانات المدرسة»).</p>
        </div>
        <div className="grid content-start gap-4">
          <div className={card}>
            <div className="mb-2 text-sm font-semibold">إضافة عطلة</div>
            <div className="grid gap-2">
              <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="مثلاً: عيد الفطر" className={inp} />
              <div className="grid grid-cols-2 gap-2"><label className="text-xs">من<input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value, to: f.to < e.target.value ? e.target.value : f.to })} className={inp} /></label><label className="text-xs">إلى<input type="date" value={f.to} min={f.from} onChange={(e) => setF({ ...f, to: e.target.value })} className={inp} /></label></div>
              <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as HolidayKind })} className={inp}>{(Object.keys(HOLIDAY_KIND) as HolidayKind[]).map((k) => <option key={k} value={k}>{HOLIDAY_KIND[k]}</option>)}</select>
              <button onClick={add} className={btnPrimary}><Plus className="size-4" /> إضافة</button>
            </div>
          </div>
          <div className={card}>
            <div className="mb-2 text-sm font-semibold">كل العطل ({hs.length})</div>
            <ul className="grid max-h-80 gap-1.5 overflow-auto text-sm">{[...hs].sort((a, b) => a.from.localeCompare(b.from)).map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-2 border-b border-line pb-1.5 last:border-0"><span><b>{h.name}</b><span className="block text-[11px] tabular-nums text-muted">{h.from}{h.to !== h.from ? ` → ${h.to}` : ""} · {HOLIDAY_KIND[h.kind]}</span></span>
                <button onClick={() => put(hs.filter((x) => x.id !== h.id))} aria-label={`حذف ${h.name}`} className="text-red-600"><Trash2 className="size-4" /></button></li>))}
              {!hs.length && <li className="text-xs text-muted">لا عطل مسجلة.</li>}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}
