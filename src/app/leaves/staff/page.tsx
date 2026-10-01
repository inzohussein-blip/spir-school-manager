"use client";

import { useState } from "react";
import { Plane, Plus, Trash2, Check, X, Printer } from "lucide-react";
import { getTeachers } from "@/lib/school/store";
import {
  getStaffLeaves, saveStaffLeaves, saveLeaveSettings, getHolidays, getLeaveSettings, leaveDays, STAFF_LEAVE, LEAVE_STATUS, type StaffLeave, type StaffLeaveType, type LeaveStatus,
} from "@/lib/school/leaves";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { newId, todayYmd } from "@/lib/local/util";
import { PageTitle, Modal, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function StaffLeavesPage() {
  const [d, reload] = useLive(() => ({ teachers: getTeachers().filter((t) => t.active), leaves: getStaffLeaves(), hs: getHolidays(), set: getLeaveSettings() }), null);
  const [f, setF] = useState<StaffLeave | null>(null); const [slip, setSlip] = useState<StaffLeave | null>(null);
  if (!d) return null;
  const { teachers, leaves, hs, set } = d;
  const year = String(new Date().getFullYear());
  const put = (v: StaffLeave[]) => { saveStaffLeaves(v); reload(); };
  const used = (tid: string, type: StaffLeaveType) => leaves.filter((l) => l.teacherId === tid && l.type === type && l.status === "approved" && l.from.startsWith(year)).reduce((n, l) => n + leaveDays(l, hs), 0);
  const name = (id: string) => teachers.find((t) => t.id === id)?.name ?? "—";
  const clash = f ? leaves.filter((l) => l.id !== f.id && l.teacherId === f.teacherId && l.status !== "rejected" && l.from <= f.to && l.to >= f.from) : [];
  function save() { if (!f || !f.teacherId) return; put(f.id ? leaves.map((l) => l.id === f.id ? f : l) : [{ ...f, id: newId() }, ...leaves]); setF(null); }
  const setStatus = (l: StaffLeave, status: LeaveStatus) => put(leaves.map((x) => x.id === l.id ? { ...x, status } : x));

  return (
    <div>
      <div className={slip ? "print:hidden" : ""}>
      <PageTitle icon={<Plane className="size-6 text-brand" />} title="إجازات الكادر" sub={`الرصيد السنوي: اعتيادية ${set.annualDays} يوماً ومرضية ${set.sickDays} (يُحسب أيام الدوام فقط، دون العطل).`}>
        <button onClick={() => setF({ id: "", teacherId: teachers[0]?.id ?? "", type: "annual", from: todayYmd(), to: todayYmd(), status: "approved" })} disabled={!teachers.length} className={btnPrimary}><Plus className="size-4" /> إجازة جديدة</button>
      </PageTitle>
      {!teachers.length ? <Empty>أضف المدرسين أولاً من محطة الكادر التدريسي.</Empty> : (
        <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
          <div className={`${card} overflow-x-auto !p-0`}>
            <table className="w-full text-sm"><thead><tr className="border-b border-line bg-canvas text-xs text-muted"><th className="p-3 text-start">المدرس</th><th className="p-3 text-start">النوع</th><th className="p-3 text-start">من → إلى</th><th className="p-3">أيام</th><th className="p-3 text-start">الحالة</th><th className="no-print p-3" /></tr></thead>
              <tbody>{leaves.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0">
                  <td className="p-3 font-medium">{name(l.teacherId)}</td><td className="p-3">{STAFF_LEAVE[l.type]}</td>
                  <td className="p-3 tabular-nums" dir="ltr">{l.from} → {l.to}</td><td className="p-3 text-center tabular-nums">{leaveDays(l, hs)}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${l.status === "approved" ? "bg-emerald-50 text-emerald-700" : l.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{LEAVE_STATUS[l.status]}</span></td>
                  <td className="no-print p-3"><div className="flex justify-end gap-1">
                    {l.status === "pending" && <><button onClick={() => setStatus(l, "approved")} aria-label="موافقة" className="grid size-8 place-items-center rounded-lg border border-line text-emerald-600 hover:bg-emerald-50"><Check className="size-4" /></button><button onClick={() => setStatus(l, "rejected")} aria-label="رفض" className="grid size-8 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"><X className="size-4" /></button></>}
                    <button onClick={() => setSlip(l)} aria-label="طباعة كتاب" className="grid size-8 place-items-center rounded-lg border border-line hover:bg-canvas"><Printer className="size-4" /></button>
                    <button onClick={() => window.confirm("حذف الإجازة؟") && put(leaves.filter((x) => x.id !== l.id))} aria-label="حذف" className="grid size-8 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
                  </div></td></tr>))}
                {!leaves.length && <tr><td colSpan={6} className="p-6 text-center text-sm text-muted">لا إجازات مسجلة.</td></tr>}</tbody></table>
          </div>
          <div className={`${card} no-print h-fit`}>
            <div className="mb-2 text-sm font-semibold">الأرصدة ({year})</div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs"><label>رصيد الاعتيادية<input type="number" min={0} value={set.annualDays} onChange={(e) => { saveLeaveSettings({ ...set, annualDays: Math.max(0, Number(e.target.value) || 0) }); reload(); }} className={inp} /></label><label>رصيد المرضية<input type="number" min={0} value={set.sickDays} onChange={(e) => { saveLeaveSettings({ ...set, sickDays: Math.max(0, Number(e.target.value) || 0) }); reload(); }} className={inp} /></label></div>
            <table className="w-full text-sm"><thead><tr className="text-xs text-muted"><th className="p-1 text-start">المدرس</th><th className="p-1">اعتيادية</th><th className="p-1">مرضية</th></tr></thead>
              <tbody>{teachers.map((t) => { const a = used(t.id, "annual"), s = used(t.id, "sick");
                return <tr key={t.id} className="border-t border-line"><td className="p-1">{t.name}</td><td className={`p-1 text-center tabular-nums ${a > set.annualDays ? "font-bold text-red-600" : ""}`}>{a}/{set.annualDays}</td><td className={`p-1 text-center tabular-nums ${s > set.sickDays ? "font-bold text-red-600" : ""}`}>{s}/{set.sickDays}</td></tr>; })}</tbody></table>
          </div>
        </div>
      )}
      </div>
      {f && (
        <Modal title={f.id ? "تعديل إجازة" : "إجازة جديدة"} onClose={() => setF(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">المدرس<select value={f.teacherId} onChange={(e) => setF({ ...f, teacherId: e.target.value })} className={`mt-1 ${inp}`}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
            <label className="text-sm font-medium">النوع<select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as StaffLeaveType })} className={`mt-1 ${inp}`}>{Object.entries(STAFF_LEAVE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="text-sm font-medium">من<input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value, to: f.to < e.target.value ? e.target.value : f.to })} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm font-medium">إلى<input type="date" min={f.from} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} className={`mt-1 ${inp}`} /></label>
            <label className="text-sm font-medium">المدرس البديل<select value={f.substituteId ?? ""} onChange={(e) => setF({ ...f, substituteId: e.target.value || undefined })} className={`mt-1 ${inp}`}><option value="">—</option>{teachers.filter((t) => t.id !== f.teacherId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
            <label className="text-sm font-medium">الحالة<select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as LeaveStatus })} className={`mt-1 ${inp}`}>{Object.entries(LEAVE_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="text-sm font-medium sm:col-span-2">ملاحظة / رقم التقرير الطبي<input value={f.note ?? ""} onChange={(e) => setF({ ...f, note: e.target.value })} className={`mt-1 ${inp}`} /></label>
          </div>
          <p className="mt-2 text-xs text-muted">المدة: {leaveDays(f, hs)} يوم دوام.</p>
          {clash.length > 0 && <p className="mt-1 text-xs text-red-600">تنبيه: تتداخل مع إجازة أخرى للمدرس نفسه.</p>}
          <div className="mt-3 flex gap-2"><button onClick={save} className={btnPrimary}>حفظ</button><button onClick={() => setF(null)} className={btnGhost}>إلغاء</button></div>
        </Modal>
      )}
      {slip && (
        <Modal title="كتاب إجازة" onClose={() => setSlip(null)} wide printable>
          <div className="no-print mb-3"><button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة</button></div>
          <div className="print-slip"><SchoolSheet title="كتاب إجازة" landscape={false}>
            <div className="mx-auto mt-6 max-w-[160mm] text-[15px] leading-9">
              <p>إلى / مديرية التربية</p>
              <p>م / منح إجازة {STAFF_LEAVE[slip.type]}</p>
              <p>تمنح إجازة {STAFF_LEAVE[slip.type]} للمدرس (ة) <b>{name(slip.teacherId)}</b> لمدة <b className="tabular-nums">{leaveDays(slip, hs)}</b> يوم دوام، من <b className="tabular-nums">{slip.from}</b> إلى <b className="tabular-nums">{slip.to}</b>{slip.substituteId ? <>، ويقوم مقامه (ا) المدرس <b>{name(slip.substituteId)}</b></> : null}.{slip.note ? <> ({slip.note})</> : null}</p>
              <p className="mt-4">للتفضل بالاطلاع وإجراء ما يلزم... مع التقدير.</p>
              <div className="mt-16 text-end">مدير المدرسة<br /><span className="text-xs text-gray-500">التوقيع والختم</span></div>
            </div>
          </SchoolSheet></div>
        </Modal>
      )}
    </div>
  );
}
