"use client";

import { readLS, writeLS, addDays, todayYmd } from "@/lib/local/util";
import { getInfo, currentYear } from "@/lib/school/store";
import { schoolDaysBetween, type Holiday } from "@/lib/school/leaves";

export interface PlanUnit { id: string; title: string; lessons: number; /** inclusive indexes into schoolWeeks() */ from?: number; to?: number; objectives?: string; done: number; note?: string }
export interface Plan { id: string; teacherId: string; subjectId: string; levelId: string; sectionId?: string; yearId: string; units: PlanUnit[]; approvedBy?: string }
export const KP = { plans: "plan.list.v1" } as const;
export const getPlans = () => readLS<Plan[]>(KP.plans, []);
export const savePlans = (v: Plan[]) => writeLS(KP.plans, v);

export interface SchoolWeek { start: string; end: string; days: number }
/** The weeks of the current year that have at least one school day (holidays taken out). */
export function schoolWeeks(hs: Holiday[]): SchoolWeek[] {
  const y = currentYear(); if (!y) return [];
  const { workDays } = getInfo();
  const out: SchoolWeek[] = [];
  // Back up to the Sunday on or before the start.
  const s0 = new Date(y.start + "T00:00:00"); let start = addDays(y.start, -s0.getDay());
  for (let guard = 0; start <= y.end && guard < 70; start = addDays(start, 7), guard++) {
    const a = start < y.start ? y.start : start; const e = addDays(start, 6); const b = e > y.end ? y.end : e;
    const days = schoolDaysBetween(a, b, hs, workDays);
    if (days > 0) out.push({ start: a, end: b, days });
  }
  return out;
}

/** Spread the units over the weeks, each by its lessons (at least one week; the last takes what is left). */
export function distribute(units: PlanUnit[], weeks: SchoolWeek[]): PlanUnit[] {
  if (!units.length || !weeks.length) return units;
  const total = units.reduce((n, u) => n + Math.max(1, u.lessons), 0);
  let cursor = 0;
  return units.map((u, i) => {
    const left = units.length - i - 1;
    const share = Math.max(1, Math.round((Math.max(1, u.lessons) / total) * weeks.length));
    const from = Math.min(cursor, weeks.length - 1);
    const to = i === units.length - 1 ? weeks.length - 1 : Math.max(from, Math.min(weeks.length - 1 - left, from + share - 1));
    cursor = to + 1;
    return { ...u, from, to: Math.max(from, to) };
  });
}

/** Share (0–100) of the plan that should be done by `date`: each unit counts by its lessons, by how far its weeks have passed. */
export function expectedPercent(plan: Plan, weeks: SchoolWeek[], date = todayYmd()): number {
  const total = plan.units.reduce((n, u) => n + Math.max(1, u.lessons), 0); if (!total || !weeks.length) return 0;
  let sum = 0;
  for (const u of plan.units) {
    if (u.from === undefined || u.to === undefined) continue;
    const ws = weeks.slice(u.from, u.to + 1); const all = ws.reduce((n, w) => n + w.days, 0); if (!all) continue;
    const past = ws.reduce((n, w) => n + (date >= w.end ? w.days : date < w.start ? 0 : w.days * ((new Date(date).getTime() - new Date(w.start).getTime()) / 86400000 + 1) / 7), 0);
    sum += Math.min(1, past / all) * Math.max(1, u.lessons);
  }
  return Math.round((sum / total) * 100);
}
export const actualPercent = (plan: Plan): number => {
  const total = plan.units.reduce((n, u) => n + Math.max(1, u.lessons), 0);
  return total ? Math.round(plan.units.reduce((n, u) => n + (Math.min(100, u.done) / 100) * Math.max(1, u.lessons), 0) / total * 100) : 0;
};
