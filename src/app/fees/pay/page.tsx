"use client";

import { useState } from "react";
import { HandCoins, Printer, Search } from "lucide-react";
import { getStudents, getSections, getLevels, sectionLabel } from "@/lib/school/store";
import { getCharges, getPayments, savePayments, getFeeSettings, statement, isLate, nextReceiptNo, type Payment } from "@/lib/school/fees";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { newId, todayYmd } from "@/lib/local/util";
import { money, CURRENCY } from "@/lib/utils";
import { PageTitle, Modal, Empty, inp, card, btnPrimary, useLive } from "@/components/school/ui";

export default function PayPage() {
  const [d, reload] = useLive(() => ({ students: getStudents().filter((s) => s.status === "active"), sections: getSections(), levels: getLevels(), charges: getCharges(), payments: getPayments(), set: getFeeSettings() }), null);
  const [q, setQ] = useState(""); const [sid, setSid] = useState(""); const [amount, setAmount] = useState(""); const [note, setNote] = useState(""); const [receipt, setReceipt] = useState<Payment | null>(null);
  if (!d) return null;
  const found = q.trim() ? d.students.filter((s) => s.name.includes(q.trim()) || s.no === q.trim()).slice(0, 8) : [];
  const stu = d.students.find((s) => s.id === sid);
  const st = stu ? statement(stu.id, d.charges, d.payments) : null;
  function pay() {
    const a = Number(amount); if (!stu || !a) return;
    const p: Payment = { id: newId(), no: nextReceiptNo(), studentId: stu.id, date: todayYmd(), amount: a, ...(note.trim() ? { note: note.trim() } : {}) };
    savePayments([p, ...d!.payments]); setAmount(""); setNote(""); setReceipt(p); reload();
  }
  return (
    <div>
      <div className={receipt ? "print:hidden" : ""}>
        <PageTitle icon={<HandCoins className="size-6 text-brand" />} title="تسجيل الدفعات" sub="ابحث عن الطالب، شاهد كشف حسابه، وسجّل الدفعة؛ تُغطّي الدفعة الأقدم من المستحقات أولاً." />
        <div className="relative mb-4 max-w-md"><Search className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم الطالب أو رقم القيد…" className={`${inp} ps-9`} />
          {found.length > 0 && <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-pop)]">{found.map((s) => <li key={s.id}><button onClick={() => { setSid(s.id); setQ(""); }} className="block w-full px-3 py-2 text-start text-sm hover:bg-canvas">{s.name} <span className="text-xs text-muted">{sectionLabel(d.sections.find((x) => x.id === s.sectionId), d.levels)}</span></button></li>)}</ul>}</div>
        {!stu || !st ? <Empty>اختر طالباً.</Empty> : (
          <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <div className={`${card} overflow-x-auto !p-0`}>
              <div className="border-b border-line p-4"><b>{stu.name}</b> <span className="text-xs text-muted">{sectionLabel(d.sections.find((x) => x.id === stu.sectionId), d.levels)}</span></div>
              <table className="w-full text-sm"><thead><tr className="border-b border-line bg-canvas text-xs text-muted"><th className="p-3 text-start">الشهر</th><th className="p-3 text-start">البند</th><th className="p-3">المستحق</th><th className="p-3">المسدد</th><th className="p-3">الحالة</th></tr></thead>
                <tbody>{st.lines.map((l) => { const done = l.paid >= l.charge.amount; return <tr key={l.charge.id} className="border-b border-line last:border-0"><td className="p-3 tabular-nums">{l.charge.month}</td><td className="p-3">{l.charge.label}</td><td className="p-3 text-center tabular-nums">{money(l.charge.amount)}</td><td className="p-3 text-center tabular-nums">{money(l.paid)}</td>
                  <td className="p-3 text-center text-xs"><span className={`rounded-full px-2 py-0.5 ${done ? "bg-emerald-50 text-emerald-700" : isLate(l, d.set.dueDay) ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{done ? "مسدّد" : isLate(l, d.set.dueDay) ? "متأخر" : l.paid ? "جزئي" : "مستحق"}</span></td></tr>; })}
                  {!st.lines.length && <tr><td colSpan={5} className="p-6 text-center text-sm text-muted">لا مستحقات (أنشئها من «مستحقات الشهر»).</td></tr>}</tbody></table>
              <div className="flex justify-between border-t border-line p-4 text-sm"><span>المستحق <b className="tabular-nums">{money(st.due)}</b></span><span>المسدد <b className="tabular-nums">{money(st.paid)}</b></span><span>المتبقي <b className={`tabular-nums ${st.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>{money(st.balance)}</b> {CURRENCY}</span></div>
            </div>
            <div className={`${card} h-fit`}>
              <div className="mb-2 text-sm font-semibold">دفعة جديدة</div>
              <input inputMode="numeric" dir="ltr" value={amount} placeholder={`المبلغ (${CURRENCY})`} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} className={inp} />
              {st.balance > 0 && <button onClick={() => setAmount(String(st.balance))} className="mt-1 text-xs text-brand-dark">كل المتبقي ({money(st.balance)})</button>}
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة (اختياري)" className={`mt-2 ${inp}`} />
              <button disabled={!Number(amount)} onClick={pay} className={`${btnPrimary} mt-3 w-full`}>تسجيل وطباعة الوصل</button>
            </div>
          </div>
        )}
      </div>
      {receipt && (() => { const s = d.students.find((x) => x.id === receipt.studentId); const after = statement(receipt.studentId, d.charges, d.payments); return (
        <Modal title="وصل قبض" onClose={() => setReceipt(null)} printable>
          <div className="no-print mb-3"><button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة الوصل</button></div>
          <SchoolSheet landscape={false} title={`وصل قبض رقم ${receipt.no}`}>
            <div className="mx-auto mt-4 max-w-[150mm] text-[15px] leading-9">
              <p>استلمنا من ولي أمر الطالب (ة) <b>{s?.name}</b> / {sectionLabel(d.sections.find((x) => x.id === s?.sectionId), d.levels)}</p>
              <p>مبلغاً قدره <b className="tabular-nums">{money(receipt.amount)}</b> {CURRENCY} بتاريخ <span className="tabular-nums">{receipt.date}</span>{receipt.note ? ` — ${receipt.note}` : ""}.</p>
              <p className="text-sm text-gray-600">الرصيد المتبقي على الطالب بعد هذه الدفعة: <b className="tabular-nums">{money(after.balance)}</b> {CURRENCY}</p>
              <div className="mt-14 grid grid-cols-2 text-center text-sm"><div>المستلم<div className="mt-6 border-t border-gray-400 pt-1">التوقيع</div></div><div>ختم المدرسة</div></div>
            </div>
          </SchoolSheet>
        </Modal>); })()}
    </div>
  );
}
