"use client";

import { useState } from "react";
import { BarChart3, Printer } from "lucide-react";
import { getSections, getLevels, getStudents, sectionLabel } from "@/lib/school/store";
import { getLeaveSettings } from "@/lib/school/leaves";
import { getRoll, MARK_LABEL, type Mark } from "@/lib/school/attendance";
import { SchoolSheet } from "@/components/school/SchoolPrint";
import { todayYmd } from "@/lib/local/util";
import { PageTitle, Empty, inp, btnPrimary, useLive } from "@/components/school/ui";

export default function ReportPage() {
  const [d] = useLive(() => ({ sections: getSections(), levels: getLevels(), students: getStudents(), roll: getRoll("students"), warn: getLeaveSettings().absenceWarn }), null);
  const [sectionId, setSectionId] = useState(""); const [ym, setYm] = useState(todayYmd().slice(0, 7));
  if (!d) return null;
  const section = d.sections.find((s) => s.id === sectionId) ?? d.sections[0];
  const rows = d.students.filter((s) => s.status === "active" && s.sectionId === section?.id).map((s) => {
    const c: Record<Mark, number> = { p: 0, a: 0, l: 0, e: 0 };
    for (const [k, m] of Object.entries(d.roll)) if (k.startsWith(ym) && k.endsWith("|" + s.id)) c[m]++;
    return { s, c };
  });
  const totalAbs = (id: string) => Object.entries(d.roll).filter(([k, m]) => m === "a" && k.endsWith("|" + id)).length;
  return (
    <div>
      <PageTitle icon={<BarChart3 className="size-6 text-brand" />} title="تقرير الغياب" sub={`شهري لكل شعبة. إنذار لمن بلغ غيابه الكلي ${d.warn} أيام فأكثر في العام.`}>
        <select value={section?.id ?? ""} onChange={(e) => setSectionId(e.target.value)} className={`w-56 ${inp}`}>{d.sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s, d.levels)}</option>)}</select>
        <input type="month" value={ym} onChange={(e) => setYm(e.target.value)} className={`w-44 ${inp}`} />
        <button onClick={() => window.print()} className={btnPrimary}><Printer className="size-4" /> طباعة</button>
      </PageTitle>
      {!rows.length ? <Empty>لا طلاب.</Empty> : (
        <SchoolSheet landscape={false} title={`تقرير حضور ${sectionLabel(section, d.levels)} — ${ym}`}>
          <table className="w-full border-collapse text-center text-[12px]"><thead><tr className="bg-gray-100"><th className="border border-gray-300 p-1.5">#</th><th className="border border-gray-300 p-1.5 text-start">الطالب</th>
            {(Object.keys(MARK_LABEL) as Mark[]).map((m) => <th key={m} className="border border-gray-300 p-1.5">{MARK_LABEL[m]}</th>)}<th className="border border-gray-300 p-1.5">غياب العام</th></tr></thead>
            <tbody>{rows.map(({ s, c }, i) => { const t = totalAbs(s.id); return (
              <tr key={s.id}><td className="border border-gray-300 p-1 tabular-nums">{i + 1}</td><td className="border border-gray-300 p-1 text-start">{s.name}</td>
                {(Object.keys(MARK_LABEL) as Mark[]).map((m) => <td key={m} className="border border-gray-300 p-1 tabular-nums">{c[m] || "—"}</td>)}
                <td className={`border border-gray-300 p-1 tabular-nums ${t >= d.warn ? "font-bold text-red-600" : ""}`}>{t}{t >= d.warn ? " ⚠" : ""}</td></tr>); })}</tbody></table>
        </SchoolSheet>
      )}
    </div>
  );
}
