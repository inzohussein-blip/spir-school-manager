"use client";

import Link from "next/link";
import { useState } from "react";
import { Banknote, Printer } from "lucide-react";
import { getStudents, getSections, getLevels, getInfo, sectionLabel } from "@/lib/school/store";
import { getCharges, getPayments, getFeeSettings, statement, isLate } from "@/lib/school/fees";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { todayYmd } from "@/lib/local/util";
import { money, CURRENCY } from "@/lib/utils";
import { PageTitle, Empty, inp, card, btnPrimary, useLive } from "@/components/school/ui";

export default function FeesHome() {
  const [d] = useLive(() => ({ students: getStudents(), sections: getSections(), levels: getLevels(), charges: getCharges(), payments: getPayments(), set: getFeeSettings(), priv: getInfo().kind === "private" }), null);
  const [ym, setYm] = useState(todayYmd().slice(0, 7));
  if (!d) return null;
  const { students, charges, payments, set } = d;
  const monthDue = charges.filter((c) => c.month === ym).reduce((n, c) => n + c.amount, 0);
  const monthIn = payments.filter((p) => p.date.startsWith(ym)).reduce((n, p) => n + p.amount, 0);
  const rows = students.map((s) => ({ s, st: statement(s.id, charges, payments) })).filter((r) => r.st.balance > 0).sort((a, b) => b.st.balance - a.st.balance);
  const arrears = rows.reduce((n, r) => n + r.st.balance, 0);
  return (
    <div>
      <PageTitle icon={<Banknote className="size-6 text-brand" />} title="الأقساط الشهرية" sub="ابدأ بتحديد قسط كل صف، ثم أنشئ مستحقات الشهر، ثم سجّل الدفعات.">
        <input type="month" value={ym} onChange={(e) => setYm(e.target.value)} className={`w-44 ${inp}`} />
        <button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة المتأخرين</button>
      </PageTitle>
      {!d.priv && <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">المدرسة مضبوطة كـ«حكومية (مجانية)» فلا أقساط عليها. إن كانت أهلية غيّر النوع من «الإعداد ← بيانات المدرسة».</div>}
      <div className="no-print mb-5 grid gap-3 sm:grid-cols-3">
        {[["مستحقات الشهر", monthDue], ["المقبوض في الشهر", monthIn], ["إجمالي المتأخرات", arrears]].map(([t, v]) => <div key={String(t)} className={card}><div className="text-xs text-muted">{t}</div><div className="mt-1 text-2xl font-bold tabular-nums">{money(Number(v))} <span className="text-sm font-normal">{CURRENCY}</span></div></div>)}
      </div>
      {!Object.keys(set.monthly).length && <Empty>لم تُحدَّد أقساط الصفوف بعد — <Link href="/fees/plans" className="text-brand-dark underline">حدّدها من هنا</Link>.</Empty>}
      {rows.length > 0 && <SchoolSheet landscape={false} title="كشف المتأخرين عن الدفع">
        <table className="w-full border-collapse text-[12px]"><thead><tr className="bg-gray-100"><th className="border border-gray-300 p-1.5">#</th><th className="border border-gray-300 p-1.5 text-start">الطالب</th><th className="border border-gray-300 p-1.5 text-start">الشعبة</th><th className="border border-gray-300 p-1.5">أشهر غير مسددة</th><th className="border border-gray-300 p-1.5">المتبقي ({CURRENCY})</th></tr></thead>
          <tbody>{rows.map(({ s, st }, i) => <tr key={s.id}><td className="border border-gray-300 p-1 text-center tabular-nums">{i + 1}</td><td className="border border-gray-300 p-1">{s.name}</td><td className="border border-gray-300 p-1">{sectionLabel(d.sections.find((x) => x.id === s.sectionId), d.levels)}</td>
            <td className="border border-gray-300 p-1 text-center tabular-nums">{st.lines.filter((l) => isLate(l, set.dueDay)).length}</td><td className="border border-gray-300 p-1 text-center font-bold tabular-nums">{money(st.balance)}</td></tr>)}</tbody></table></SchoolSheet>}
    </div>
  );
}
