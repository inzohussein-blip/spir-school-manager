"use client";

/** Holidays, staff leaves, student leaves / absences (keys under "leaves.") and the day checks the other stations use. */

import { readLS, writeLS, addDays } from "@/lib/local/util";
import { getInfo } from "@/lib/school/store";

export type HolidayKind = "official" | "school" | "exam";
export const HOLIDAY_KIND: Record<HolidayKind, string> = { official: "عطلة رسمية", school: "عطلة مدرسية", exam: "عطلة امتحانات" };
export interface Holiday { id: string; name: string; from: string; to: string; kind: HolidayKind }

export type StaffLeaveType = "annual" | "sick" | "emergency" | "maternity" | "study" | "unpaid";
export const STAFF_LEAVE: Record<StaffLeaveType, string> = { annual: "اعتيادية", sick: "مرضية", emergency: "طارئة", maternity: "أمومة", study: "دراسية", unpaid: "بدون راتب" };
export type LeaveStatus = "pending" | "approved" | "rejected";
export const LEAVE_STATUS: Record<LeaveStatus, string> = { pending: "بانتظار الموافقة", approved: "موافَق عليها", rejected: "مرفوضة" };
export interface StaffLeave { id: string; teacherId: string; type: StaffLeaveType; from: string; to: string; status: LeaveStatus; substituteId?: string; note?: string }

export type StudentLeaveType = "sick" | "excuse" | "unexcused";
export const STUDENT_LEAVE: Record<StudentLeaveType, string> = { sick: "إجازة مرضية", excuse: "غياب بعذر", unexcused: "غياب بلا عذر" };
export interface StudentLeave { id: string; studentId: string; type: StudentLeaveType; from: string; to: string; hasReport?: boolean; note?: string }

export interface LeaveSettings { annualDays: number; sickDays: number; absenceWarn: number }
export const DEFAULT_LEAVE_SETTINGS: LeaveSettings = { annualDays: 30, sickDays: 30, absenceWarn: 10 };

export const KL = { holidays: "leaves.holidays.v1", staff: "leaves.staff.v1", students: "leaves.students.v1", settings: "leaves.settings.v1" } as const;
export const getHolidays = () => readLS<Holiday[]>(KL.holidays, []);
export const saveHolidays = (v: Holiday[]) => writeLS(KL.holidays, v);
export const getStaffLeaves = () => readLS<StaffLeave[]>(KL.staff, []);
export const saveStaffLeaves = (v: StaffLeave[]) => writeLS(KL.staff, v);
export const getStudentLeaves = () => readLS<StudentLeave[]>(KL.students, []);
export const saveStudentLeaves = (v: StudentLeave[]) => writeLS(KL.students, v);
export const getLeaveSettings = (): LeaveSettings => ({ ...DEFAULT_LEAVE_SETTINGS, ...readLS<Partial<LeaveSettings>>(KL.settings, {}) });
export const saveLeaveSettings = (v: LeaveSettings) => writeLS(KL.settings, v);

export const holidayOn = (hs: Holiday[], date: string): Holiday | undefined => hs.find((h) => date >= h.from && date <= h.to);
/** The weekday (0 = Sunday) of a YYYY-MM-DD date. */
export const dayOfWeek = (date: string) => new Date(date + "T00:00:00").getDay();
/** A teaching day: one of the school's work days and not a holiday. */
export function isSchoolDay(date: string, hs: Holiday[], workDays = getInfo().workDays): boolean {
  return workDays.includes(dayOfWeek(date)) && !holidayOn(hs, date);
}
/** School days from `from` to `to` inclusive. */
export function schoolDaysBetween(from: string, to: string, hs: Holiday[], workDays = getInfo().workDays): number {
  let n = 0;
  for (let d = from, guard = 0; d <= to && guard < 800; d = addDays(d, 1), guard++) if (isSchoolDay(d, hs, workDays)) n++;
  return n;
}
/** Days a leave takes from the balance (school days only). */
export const leaveDays = (l: { from: string; to: string }, hs: Holiday[]) => schoolDaysBetween(l.from, l.to, hs);
export const onLeave = (l: { from: string; to: string }, date: string) => date >= l.from && date <= l.to;

/** Common fixed-date Iraqi official holidays (the Hijri ones move every year: add them by hand). */
export const FIXED_HOLIDAYS = (year: number): Omit<Holiday, "id">[] => [
  { name: "رأس السنة الميلادية", from: `${year}-01-01`, to: `${year}-01-01`, kind: "official" },
  { name: "عيد الجيش العراقي", from: `${year}-01-06`, to: `${year}-01-06`, kind: "official" },
  { name: "عيد العمال", from: `${year}-05-01`, to: `${year}-05-01`, kind: "official" },
];
