"use client";

/** Figures for the dashboard, the analytics page and the sidebar badges — all read from the school file. */

import { getStudents, getTeachers, getSections, getLevels, getTimetable, getInfo, currentYear, getTerms, getSubjects, getCurriculum, allConflicts, STAGE_LABEL, type Stage } from "@/lib/school/store";
import { getRoll, rollKey } from "@/lib/school/attendance";
import { getHolidays, getStaffLeaves, getLeaveSettings, isSchoolDay } from "@/lib/school/leaves";
import { getPlans, schoolWeeks, expectedPercent, actualPercent } from "@/lib/school/plan";
import { getCharges, getPayments, getFeeSettings, statement, isLate } from "@/lib/school/fees";
import { getRules, getMarks, computeResults } from "@/lib/school/results";
import { addDays, todayYmd } from "@/lib/local/util";

/** Attendance rate (%) per calendar day over the last `days` days; null on holidays and days with no roll. */
export function attendanceSeries(days: number, endDate = todayYmd(), offset = 0): { date: string; rate: number | null }[] {
  const roll = getRoll("students"); const hs = getHolidays(); const active = getStudents().filter((s) => s.status === "active");
  const out: { date: string; rate: number | null }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(endDate, -i - offset);
    if (!isSchoolDay(date, hs)) { out.push({ date, rate: null }); continue; }
    let p = 0, n = 0;
    for (const s of active) { const m = roll[rollKey(date, s.id)]; if (!m || m === "e") continue; n++; if (m === "p" || m === "l") p++; }
    out.push({ date, rate: n ? Math.round((p / n) * 100) : null });
  }
  return out;
}
const mean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
export const rateOf = (s: { rate: number | null }[]) => Math.round(mean(s.filter((x) => x.rate !== null).map((x) => x.rate as number)));

export function schoolSnapshot() {
  const students = getStudents().filter((s) => s.status === "active"); const teachers = getTeachers().filter((t) => t.active);
  const sections = getSections(); const levels = getLevels(); const info = getInfo(); const year = currentYear();
  const secLevel = new Map(sections.map((s) => [s.id, levels.find((l) => l.id === s.levelId)]));
  const byStage: Record<Stage, number> = { primary: 0, intermediate: 0, secondary: 0 };
  for (const s of students) { const st = secLevel.get(s.sectionId ?? "")?.stage; if (st) byStage[st]++; }
  const girls = students.filter((s) => s.gender === "f").length;
  return { students, teachers, sections, levels, info, year, byStage, girls, boys: students.length - girls, stageLabel: STAGE_LABEL };
}

/** Share of the school year gone by today (school days, holidays excluded). */
export function yearProgress() {
  const y = currentYear(); if (!y) return null;
  const hs = getHolidays(); let total = 0, done = 0; const today = todayYmd();
  for (let d = y.start, g = 0; d <= y.end && g < 500; d = addDays(d, 1), g++) { if (isSchoolDay(d, hs)) { total++; if (d <= today) done++; } }
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function averageGrade(): number | null {
  const y = currentYear(); const terms = getTerms().filter((t) => !y || t.yearId === y.id);
  const rules = getRules(); const marks = getMarks(); const sections = getSections(); const cur = getCurriculum(); const subjects = new Set(getSubjects().map((s) => s.id));
  const avgs: number[] = [];
  for (const sec of sections) {
    const subs = cur.filter((r) => r.levelId === sec.levelId && subjects.has(r.subjectId)).map((r) => r.subjectId);
    const sts = getStudents().filter((s) => s.status === "active" && s.sectionId === sec.id);
    for (const r of computeResults(sts, subs, terms, marks, rules)) if (r.average !== null) avgs.push(r.average);
  }
  return avgs.length ? Math.round(mean(avgs) * 10) / 10 : null;
}

export interface Alerts { conflicts: number; pendingLeaves: number; heavyAbsence: number; lateFees: number; latePlans: number; items: { href: string; text: string }[] }
export function alerts(): Alerts {
  const sections = getSections(), levels = getLevels(), teachers = getTeachers(), tt = getTimetable();
  const conflicts = allConflicts(tt, sections, levels, teachers).length;
  const pendingLeaves = getStaffLeaves().filter((l) => l.status === "pending").length;
  const warn = getLeaveSettings().absenceWarn; const abs = new Map<string, number>();
  for (const [k, m] of Object.entries(getRoll("students"))) if (m === "a") { const id = k.split("|")[1]; abs.set(id, (abs.get(id) ?? 0) + 1); }
  const heavyAbsence = [...abs.values()].filter((n) => n >= warn).length;
  let lateFees = 0;
  if (getInfo().kind === "private") { const ch = getCharges(), pay = getPayments(), set = getFeeSettings(); lateFees = getStudents().filter((s) => s.status === "active" && statement(s.id, ch, pay).lines.some((l) => isLate(l, set.dueDay))).length; }
  const weeks = schoolWeeks(getHolidays()); const latePlans = getPlans().filter((p) => expectedPercent(p, weeks) - actualPercent(p) > 10).length;
  const items: Alerts["items"] = [];
  if (conflicts) items.push({ href: "/classes/conflicts", text: `${conflicts} تعارض في الجداول` });
  if (pendingLeaves) items.push({ href: "/leaves/staff", text: `${pendingLeaves} إجازة بانتظار الموافقة` });
  if (heavyAbsence) items.push({ href: "/attendance/report", text: `${heavyAbsence} طالب تجاوز حد الغياب` });
  if (lateFees) items.push({ href: "/fees", text: `${lateFees} طالب متأخر عن القسط` });
  if (latePlans) items.push({ href: "/plan/report", text: `${latePlans} خطة سنوية متأخرة` });
  return { conflicts, pendingLeaves, heavyAbsence, lateFees, latePlans, items };
}
