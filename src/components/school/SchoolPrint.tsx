"use client";

import type { ReactNode } from "react";
import { Letterhead, PrintStyle } from "@/components/local/PrintDoc";
import { getInfo, currentYear } from "@/lib/school/store";

/** A printed page of the school: letterhead (name, directorate, year) then the content. */
export function SchoolSheet({ title, children, landscape = true, color = "#1e40af", breakBefore = false }: { title: string; children: ReactNode; landscape?: boolean; color?: string; breakBefore?: boolean }) {
  const info = getInfo(); const year = currentYear();
  return (
    <section className={`print-doc mb-6 rounded-2xl border border-line bg-white p-5 text-gray-900 shadow-[var(--shadow-card)] print:m-0 print:rounded-none print:border-0 print:shadow-none ${breakBefore ? "page-break" : ""}`}>
      <PrintStyle landscape={landscape} />
      <Letterhead title={info.name || "المدرسة"} color={color} logo={info.logo}
        subtitle={[info.subtitle, info.directorate, info.province].filter(Boolean).join(" — ")}
        right={<div><div className="font-bold">{title}</div>{year && <div className="tabular-nums">العام الدراسي {year.name}</div>}</div>} />
      <div className="mt-4">{children}</div>
      {info.footer && <div className="mt-4 text-center text-[10px] text-gray-500">{info.footer}</div>}
    </section>
  );
}
