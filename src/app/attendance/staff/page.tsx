"use client";

import { useState } from "react";
import { UserCheck, Check } from "lucide-react";
import { getTeachers } from "@/lib/school/store";
import { getHolidays, getStaffLeaves, holidayOn, onLeave } from "@/lib/school/leaves";
import { getRoll, saveRoll, rollKey, MARK_LABEL, type Mark, type Roll } from "@/lib/school/attendance";
import { todayYmd } from "@/lib/local/util";
import { PageTitle, Empty, inp, card, btnGhost, useLive } from "@/components/school/ui";

const TONE: Record<Mark, string> = { p: "bg-emerald-600 text-white", a: "bg-red-600 text-white", l: "bg-amber-500 text-white", e: "bg-sky-600 text-white" };

export default function StaffRoll() {
  const [d, reload] = useLive(() => ({ teachers: getTeachers().filter((t) => t.active), roll: getRoll("staff"), hs: getHolidays(), leaves: getStaffLeaves() }), null);
  const [date, setDate] = useState(todayYmd());
  if (!d) return null;
  const holiday = holidayOn(d.hs, date);
  const markOf = (id: string): Mark | undefined => d.roll[rollKey(date, id)] ?? (d.leaves.some((l) => l.teacherId === id && l.status === "approved" && onLeave(l, date)) ? "e" : undefined);
  const set = (id: string, m: Mark) => { saveRoll("staff", { ...d.roll, [rollKey(date, id)]: m } as Roll); reload(); };
  const allPresent = () => { const next: Roll = { ...d.roll }; for (const t of d.teachers) if (markOf(t.id) !== "e") next[rollKey(date, t.id)] = "p"; saveRoll("staff", next); reload(); };
  return (
    <div>
      <PageTitle icon={<UserCheck className="size-6 text-brand" />} title="حضور الكادر" sub="المدرس في إجازة موافَق عليها يظهر «مجاز» تلقائياً.">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`w-44 ${inp}`} />
        <button onClick={allPresent} className={btnGhost}><Check className="size-4" /> الكل حاضر</button>
      </PageTitle>
      {holiday && <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">هذا اليوم عطلة: {holiday.name}.</div>}
      {!d.teachers.length ? <Empty>لا مدرسين.</Empty> : (
        <div className={`${card} grid gap-1 !p-2`}>{d.teachers.map((t) => { const cur = markOf(t.id); return (
          <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-canvas"><span className="text-sm">{t.name}</span>
            <span className="flex gap-1">{(Object.keys(MARK_LABEL) as Mark[]).map((m) => <button key={m} onClick={() => set(t.id, m)} aria-pressed={cur === m} aria-label={`${t.name} ${MARK_LABEL[m]}`} className={`rounded-lg border px-3 py-1 text-xs ${cur === m ? `${TONE[m]} border-transparent font-semibold` : "border-line hover:bg-surface"}`}>{MARK_LABEL[m]}</button>)}</span></div>); })}</div>
      )}
    </div>
  );
}
