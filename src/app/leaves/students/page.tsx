"use client";

import { useState } from "react";
import { HeartPulse, Plus, Trash2, Printer } from "lucide-react";
import { getStudents, getSections, getLevels, sectionLabel } from "@/lib/school/store";
import { getStudentLeaves, saveStudentLeaves, getHolidays, leaveDays, STUDENT_LEAVE, type StudentLeave, type StudentLeaveType } from "@/lib/school/leaves";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { newId, todayYmd } from "@/lib/local/util";
import { PageTitle, Modal, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function StudentLeavesPage() {
  const [d, reload] = useLive(() => ({ students: getStudents().filter((s) => s.status === "active"), sections: getSections(), levels: getLevels(), leaves: getStudentLeaves(), hs: getHolidays() }), null);
  const [f, setF] = useState<StudentLeave | null>(null); const [slip, setSlip] = useState<StudentLeave | null>(null); const [q, setQ] = useState("");
  if (!d) return null;
  const { students, sections, levels, leaves, hs } = d;
  const put = (v: StudentLeave[]) => { saveStudentLeaves(v); reload(); };
  const st = (id: string) => students.find((s) => s.id === id);
  const shown = f ? students.filter((s) => !q.trim() || s.name.includes(q.trim())).slice(0, 80) : [];
  return (
    <div>
      <div className={slip ? "print:hidden" : ""}>
      <PageTitle icon={<HeartPulse className="size-6 text-brand" />} title="إجازات الطلاب وغيابهم" sub="الإجازة المرضية بتقرير طبي أو الغياب بعذر لا يُحتسب غياباً في الحضور؛ ويمكن طباعة كتاب عذر.">
        <button onClick={() => { setQ(""); setF({ id: "", studentId: "", type: "sick", from: todayYmd(), to: todayYmd(), hasReport: true }); }} disabled={!students.length} className={btnPrimary}><Plus className="size-4" /> تسجيل إجازة / غياب</button>
      </PageTitle>
      {!leaves.length ? <Empty>لا إجازات أو غيابات مسجلة.</Empty> : (
        <div className={`${card} overflow-x-auto !p-0`}>
          <table className="w-full text-sm"><thead><tr className="border-b border-line bg-canvas text-xs text-muted"><th className="p-3 text-start">الطالب</th><th className="p-3 text-start">الشعبة</th><th className="p-3 text-start">النوع</th><th className="p-3 text-start">من → إلى</th><th className="p-3">أيام</th><th className="p-3">تقرير</th><th className="p-3" /></tr></thead>
            <tbody>{leaves.map((l) => { const s = st(l.studentId); return (
              <tr key={l.id} className="border-b border-line last:border-0"><td className="p-3 font-medium">{s?.name ?? "(محذوف)"}</td><td className="p-3">{sectionLabel(sections.find((x) => x.id === s?.sectionId), levels)}</td>
                <td className="p-3">{STUDENT_LEAVE[l.type]}</td><td className="p-3 tabular-nums" dir="ltr">{l.from} → {l.to}</td><td className="p-3 text-center tabular-nums">{leaveDays(l, hs)}</td><td className="p-3 text-center">{l.hasReport ? "✓" : "—"}</td>
                <td className="p-3"><div className="flex justify-end gap-1"><button onClick={() => setSlip(l)} aria-label="طباعة" className="grid size-8 place-items-center rounded-lg border border-line hover:bg-canvas"><Printer className="size-4" /></button>
                  <button onClick={() => window.confirm("حذف السجل؟") && put(leaves.filter((x) => x.id !== l.id))} aria-label="حذف" className="grid size-8 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button></div></td></tr>); })}</tbody></table>
        </div>
      )}
      </div>
      {f && (
        <Modal title="تسجيل إجازة / غياب" onClose={() => setF(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن الطالب بالاسم…" className={inp} />
              <select size={5} value={f.studentId} onChange={(e) => setF({ ...f, studentId: e.target.value })} className={`mt-1 ${inp}`}>{shown.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <label className="text-sm font-medium">النوع<select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as StudentLeaveType, hasReport: e.target.value === "sick" })} className={`mt-1 ${inp}`}>{Object.entries(STUDENT_LEAVE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="inline-flex items-center gap-1.5 self-end pb-2 text-sm"><input type="checkbox" checked={!!f.hasReport} onChange={(e) => setF({ ...f, hasReport: e.target.checked })} className="accent-[var(--color-brand)]" /> مرفق تقرير طبي</label>
            <label className="text-sm font-medium">من<input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value, to: f.to < e.target.value ? e.target.value : f.to })} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm font-medium">إلى<input type="date" min={f.from} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm font-medium sm:col-span-2">ملاحظة<input value={f.note ?? ""} onChange={(e) => setF({ ...f, note: e.target.value })} className={`mt-1 ${inp}`} /></label>
          </div>
          <div className="mt-3 flex gap-2"><button disabled={!f.studentId} onClick={() => { put([{ ...f, id: newId() }, ...leaves]); setF(null); }} className={btnPrimary}>حفظ</button><button onClick={() => setF(null)} className={btnGhost}>إلغاء</button></div>
        </Modal>
      )}
      {slip && (
        <Modal title="كتاب عذر" onClose={() => setSlip(null)} wide printable>
          <div className="no-print mb-3"><button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة</button></div>
          <SchoolSheet title="كتاب عذر طالب" landscape={false}>
            <div className="mx-auto mt-6 max-w-[160mm] text-[15px] leading-9">
              <p>تشهد إدارة المدرسة بأن الطالب (ة) <b>{st(slip.studentId)?.name}</b> / {sectionLabel(sections.find((x) => x.id === st(slip.studentId)?.sectionId), levels)} قد تغيّب (ت) عن الدوام {slip.type === "sick" ? "لظرف مرضي" : "بعذر"} من <b className="tabular-nums">{slip.from}</b> إلى <b className="tabular-nums">{slip.to}</b> ({leaveDays(slip, hs)} يوم دوام){slip.hasReport ? "، وقدّم (ت) تقريراً طبياً" : ""}.{slip.note ? ` ${slip.note}` : ""}</p>
              <p className="mt-4">وقد أُعطي هذا الكتاب بناءً على طلبه (ا).</p>
              <div className="mt-16 text-end">مدير المدرسة<br /><span className="text-xs text-gray-500">التوقيع والختم</span></div>
            </div>
          </SchoolSheet>
        </Modal>
      )}
    </div>
  );
}
