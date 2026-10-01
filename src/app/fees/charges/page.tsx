"use client";

import { useState } from "react";
import { FilePlus2, Trash2 } from "lucide-react";
import { getStudents } from "@/lib/school/store";
import { getCharges, saveCharges, getFeeSettings, getDiscounts, monthlyCharges, type Charge } from "@/lib/school/fees";
import { newId, todayYmd } from "@/lib/local/util";
import { money, CURRENCY } from "@/lib/utils";
import { PageTitle, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

export default function ChargesPage() {
  const [d, reload] = useLive(() => ({ charges: getCharges(), students: getStudents(), set: getFeeSettings(), dis: getDiscounts() }), null);
  const [ym, setYm] = useState(todayYmd().slice(0, 7)); const [msg, setMsg] = useState("");
  const [one, setOne] = useState({ studentId: "", label: "رسم التسجيل", amount: "" });
  if (!d) return null;
  const put = (v: Charge[]) => { saveCharges(v); reload(); };
  const month = d.charges.filter((c) => c.month === ym);
  const name = (id: string) => d.students.find((s) => s.id === id)?.name ?? "(محذوف)";
  function generate() {
    const add = monthlyCharges(ym, d!.charges, d!.set, d!.dis);
    put([...d!.charges, ...add]); setMsg(add.length ? `أُنشئ ${add.length} مستحق.` : "لا جديد: كل الطلاب لهم مستحق هذا الشهر، أو لم تُحدَّد أقساط الصفوف.");
  }
  return (
    <div>
      <PageTitle icon={<FilePlus2 className="size-6 text-brand" />} title="مستحقات الشهر" sub="أنشئ القسط الشهري لكل الطلاب بنقرة (لا يتكرر لمن له مستحق)، أو أضف رسماً لطالب.">
        <input type="month" value={ym} onChange={(e) => setYm(e.target.value)} className={`w-44 ${inp}`} />
        <button onClick={generate} className={btnPrimary}><FilePlus2 className="size-4" /> إنشاء مستحقات {ym}</button>
      </PageTitle>
      {msg && <p className="mb-3 text-sm text-brand-dark">{msg}</p>}
      <div className={`${card} mb-5 grid gap-2 sm:grid-cols-[1fr_1fr_9rem_auto]`}>
        <select value={one.studentId} onChange={(e) => setOne({ ...one, studentId: e.target.value })} className={inp}><option value="">طالب…</option>{d.students.filter((s) => s.status === "active").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <input value={one.label} onChange={(e) => setOne({ ...one, label: e.target.value })} className={inp} />
        <input inputMode="numeric" dir="ltr" placeholder={CURRENCY} value={one.amount} onChange={(e) => setOne({ ...one, amount: e.target.value.replace(/\D/g, "") })} className={inp} />
        <button disabled={!one.studentId || !one.amount} onClick={() => { put([...d.charges, { id: newId(), studentId: one.studentId, month: ym, amount: Number(one.amount), kind: "other", label: one.label || "رسم" }]); setOne({ ...one, amount: "" }); }} className={btnGhost}>إضافة رسم</button>
      </div>
      <div className={`${card} overflow-x-auto !p-0`}>
        <table className="w-full text-sm"><thead><tr className="border-b border-line bg-canvas text-xs text-muted"><th className="p-3 text-start">الطالب</th><th className="p-3 text-start">البند</th><th className="p-3">المبلغ ({CURRENCY})</th><th className="p-3" /></tr></thead>
          <tbody>{month.map((c) => <tr key={c.id} className="border-b border-line last:border-0"><td className="p-3">{name(c.studentId)}</td><td className="p-3">{c.label}</td><td className="p-3 text-center tabular-nums">{money(c.amount)}</td>
            <td className="p-3 text-end"><button onClick={() => put(d.charges.filter((x) => x.id !== c.id))} aria-label="حذف" className="text-red-600"><Trash2 className="size-4" /></button></td></tr>)}
            {!month.length && <tr><td colSpan={4} className="p-6 text-center text-sm text-muted">لا مستحقات لهذا الشهر.</td></tr>}</tbody></table>
      </div>
    </div>
  );
}
