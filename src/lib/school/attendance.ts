"use client";

import { readLS, writeLS } from "@/lib/local/util";

export type Mark = "p" | "a" | "l" | "e"; // present, absent, late, excused (leave)
export const MARK_LABEL: Record<Mark, string> = { p: "حاضر", a: "غائب", l: "متأخر", e: "مجاز" };
/** "date|personId" → mark. */
export type Roll = Record<string, Mark>;
export const KA = { students: "attendance.students.v1", staff: "attendance.staff.v1" } as const;
export const getRoll = (k: keyof typeof KA): Roll => readLS<Roll>(KA[k], {});
export const saveRoll = (k: keyof typeof KA, v: Roll) => writeLS(KA[k], v);
export const rollKey = (date: string, id: string) => `${date}|${id}`;
