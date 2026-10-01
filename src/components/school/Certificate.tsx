"use client";

import { PrintStyle } from "@/components/local/PrintDoc";
import { getInfo } from "@/lib/school/store";
import type { CertTemplate } from "@/lib/school/results";

export interface CertScore { subject: string; score: string }

/** One certificate page: double border, school header, text, optional scores, signatures. */
export function Certificate({ t, text, no, date, scores, breakBefore }: { t: CertTemplate; text: string; no: string; date: string; scores?: CertScore[]; breakBefore?: boolean }) {
  const info = getInfo(); const c = "#1e3a8a";
  return (
    <section className={`print-doc cert mb-6 bg-white text-gray-900 ${breakBefore ? "page-break" : ""}`} style={{ width: t.landscape ? "297mm" : "210mm", maxWidth: "100%" }}>
      <PrintStyle landscape={t.landscape} />
      <div className="relative border-[3px] p-1.5" style={{ borderColor: c }}>
        <div className="flex min-h-[170mm] flex-col border p-6 text-center" style={{ borderColor: c, minHeight: t.landscape ? "176mm" : "250mm" }}>
          <div className="flex items-center justify-between gap-4">
            <div className="w-1/3 text-start text-[11px] leading-6 text-gray-600"><div className="font-bold">{info.subtitle || "وزارة التربية"}</div><div>{[info.directorate, info.province].filter(Boolean).join(" — ")}</div></div>
            <div className="flex w-1/3 flex-col items-center">{/* eslint-disable-next-line @next/next/no-img-element */}{info.logo && <img src={info.logo} alt="" className="size-16 object-contain" />}<div className="mt-1 text-lg font-extrabold" style={{ color: c }}>{info.name || "المدرسة"}</div></div>
            <div className="w-1/3 text-end text-[11px] leading-6 text-gray-600"><div>العدد: <span className="tabular-nums">{no}</span></div><div>التاريخ: <span className="tabular-nums">{date}</span></div></div>
          </div>
          <h2 className="mt-8 text-4xl font-extrabold" style={{ color: c }}>{t.title}</h2>
          <div className="mx-auto mt-2 h-0.5 w-40" style={{ background: c }} />
          <p className="mx-auto mt-8 max-w-[85%] text-xl leading-10">{text}</p>
          {t.showScores && scores && scores.length > 0 && (
            <table className="mx-auto mt-6 w-[80%] border-collapse text-sm">
              <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-1.5">المادة</th><th className="border border-gray-300 p-1.5">الدرجة</th></tr></thead>
              <tbody>{scores.map((s) => <tr key={s.subject}><td className="border border-gray-300 p-1">{s.subject}</td><td className="border border-gray-300 p-1 tabular-nums">{s.score}</td></tr>)}</tbody>
            </table>
          )}
          <div className="mt-auto grid grid-cols-3 gap-6 pt-10 text-sm text-gray-700">
            <div><div className="h-8" /><div className="border-t border-gray-400 pt-1">مسؤول الشؤون</div></div>
            <div className="text-xs text-gray-400"><div className="mx-auto grid size-20 place-items-center rounded-full border border-dashed border-gray-300">ختم المدرسة</div></div>
            <div><div className="h-8" /><div className="border-t border-gray-400 pt-1">مدير المدرسة{info.principal ? `: ${info.principal}` : ""}</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
