"use client";

import type { ReactNode } from "react";
import { AR_DAYS } from "@/lib/local/util";
import type { Period } from "@/lib/school/store";

/** A weekly grid: the school's work days across, the day's periods (and the break) down. */
export function TimetableGrid({ days, periods, cell, onCell, print }: {
  days: number[]; periods: Period[];
  /** What a (day, teaching period no) cell shows. */
  cell: (day: number, no: number) => ReactNode;
  onCell?: (day: number, no: number) => void;
  print?: boolean;
}) {
  let teaching = 0;
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-center ${print ? "text-[11px]" : "text-sm"}`}>
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="w-24 border border-gray-300 p-2">الحصة</th>
            {days.map((d) => <th key={d} className="border border-gray-300 p-2">{AR_DAYS[d]}</th>)}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => {
            if (p.isBreak) return <tr key={p.id}><td colSpan={days.length + 1} className="border border-gray-300 bg-gray-50 p-1 text-[11px] text-gray-500">استراحة <span className="tabular-nums" dir="ltr">{p.start}–{p.end}</span></td></tr>;
            const no = ++teaching;
            return (
              <tr key={p.id}>
                <td className="border border-gray-300 bg-gray-50 p-1.5"><div className="font-bold">{no}</div><div className="text-[10px] tabular-nums text-gray-500" dir="ltr">{p.start}–{p.end}</div></td>
                {days.map((d) => (
                  <td key={d} onClick={onCell ? () => onCell(d, no) : undefined}
                    className={`h-14 min-w-24 border border-gray-300 p-1 align-middle ${onCell ? "cursor-pointer hover:bg-blue-50" : ""}`}>{cell(d, no)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
