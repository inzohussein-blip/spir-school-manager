"use client";

import { useState } from "react";
import { ClipboardCheck, Check } from "lucide-react";
import { getSections, getLevels, getStudents, getInfo, sectionLabel } from "@/lib/school/store";
import { getHolidays, getStudentLeaves, holidayOn, onLeave, dayOfWeek } from "@/lib/school/leaves";
import { getRoll, saveRoll, rollKey, MARK_LABEL, type Mark, type Roll } from "@/lib/school/attendance";
import { todayYmd } from "@/lib/local/util";
import { PageTitle, Empty, inp, card, btnGhost, useLive } from "@/components/school/ui";

const TONE: Record<Mark, string> = { p: "bg-emerald-600 text-white", a: "bg-red-600 text-white", l: "bg-amber-500 text-white", e: "bg-sky-600 text-white" };

export default function RollPage() {
  const [d, reload] = useLive(() => ({ sections: getSections(), levels: getLevels(), students: getStudents(), roll: getRoll("students"), hs: getHolidays(), leaves: getStudentLeaves(), info: getInfo() }), null);
  const [sectionId, setSectionId] = useState(""); const [date, setDate] = useState(todayYmd());
  if (!d) return null;
  const section = d.sections.find((s) => s.id === sectionId) ?? d.sections[0];
  const students = d.students.filter((s) => s.status === "active" && s.sectionId === section?.id);
  const holiday = holidayOn(d.hs, date); const offDay = !d.info.workDays.includes(dayOfWeek(date));
  /** A student on an approved leave that day counts as «مجاز» unless marked by hand. */
  const markOf = (id: string): Mark | undefined => d.roll[rollKey(date, id)] ?? (d.leaves.some((l) => l.studentId === id && l.type !== "unexcused" && onLeave(l, date)) ? "e" : undefined);
  const set = (id: string, m: Mark) => { const next: Roll = { ...d.roll, [rollKey(date, id)]: m }; saveRoll("students", next); reload(); };
  const all = (m: Mark) => { const next: Roll = { ...d.roll }; for (const s of students) if (markOf(s.id) !== "e") next[rollKey(date, s.id)] = m; saveRoll("students", next); reload(); };
  const count = (m: Mark) => students.filter((s) => markOf(s.id) === m).length;
  return (
    <div>
      <PageTitle icon={<ClipboardCheck className="size-6 text-brand" />} title="تحضير الشعبة" sub="انقر الحالة لكل طالب؛ يُحفظ فوراً. الطالب في إجازة مسجّلة يظهر «مجاز» تلقائياً.">
        <select value={section?.id ?? ""} onChange={(e) => setSectionId(e.target.value)} className={`w-56 ${inp}`}>{d.sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s, d.levels)}</option>)}</select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`w-44 ${inp}`} />
        <button onClick={() => all("p")} className={btnGhost}><Check className="size-4" /> الكل حاضر</button>
      </PageTitle>
      {(holiday || offDay) && <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{holiday ? `هذا اليوم عطلة: ${holiday.name}.` : "هذا اليوم خارج أيام الدوام."} يمكنك التحضير مع ذلك عند الحاجة.</div>}
      {!section || !students.length ? <Empty>لا طلاب في هذه الشعبة.</Empty> : (
        <>
          <div className="mb-3 flex flex-wrap gap-3 text-sm">{(Object.keys(MARK_LABEL) as Mark[]).map((m) => <span key={m} className="inline-flex items-center gap-1.5"><span className={`size-3 rounded-full ${TONE[m].split(" ")[0]}`} />{MARK_LABEL[m]}: <b className="tabular-nums">{count(m)}</b></span>)}<span className="text-muted">بلا تحضير: <b className="tabular-nums">{students.filter((s) => !markOf(s.id)).length}</b></span></div>
          <div className={`${card} grid gap-1 !p-2`}>{students.map((s, i) => { const cur = markOf(s.id); return (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-canvas">
              <span className="text-sm"><span className="inline-block w-7 tabular-nums text-muted">{i + 1}</span>{s.name}</span>
              <span className="flex gap-1">{(Object.keys(MARK_LABEL) as Mark[]).map((m) => <button key={m} onClick={() => set(s.id, m)} aria-pressed={cur === m} aria-label={`${s.name} ${MARK_LABEL[m]}`} className={`rounded-lg border px-3 py-1 text-xs ${cur === m ? `${TONE[m]} border-transparent font-semibold` : "border-line hover:bg-surface"}`}>{MARK_LABEL[m]}</button>)}</span>
            </div>); })}</div>
        </>
      )}
    </div>
  );
}
