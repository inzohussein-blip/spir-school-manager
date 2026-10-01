"use client";

/**
 * The school file shared by every station on this computer (browser storage, no internet needed).
 * Each station reads what the others keep, so a student, a class or a teacher is typed once:
 *   school.*    setup — the school, years, terms, levels, subjects, periods, rooms
 *   students.*  the students
 *   classes.*   the sections («الشعب») and their weekly timetable
 *   teachers.*  the teaching staff
 * Later stations (results, leaves, plan, attendance, fees) keep their own keys under their own prefix.
 */

import { readLS, writeLS, newId, todayYmd } from "@/lib/local/util";
import { kvSyncedEntries, kvGet, kvSet } from "@/lib/local/kv";

// ── Types ───────────────────────────────────────────────────────────────────────
export type SchoolKind = "gov" | "private";
export const KIND_LABEL: Record<SchoolKind, string> = { gov: "حكومية (مجانية)", private: "أهلية (أقساط شهرية)" };
export interface SchoolInfo {
  name: string; subtitle: string; footer: string; logo: string;
  kind: SchoolKind;
  /** المحافظة / المديرية / المدير / الهاتف */
  province: string; directorate: string; principal: string; phone: string;
  /** Genders the school takes: boys, girls or mixed. */
  gender: "boys" | "girls" | "mixed";
  /** 0 = Sunday … 6 = Saturday: the days the school works. */
  workDays: number[];
  /** Morning / evening shift label (empty = one shift). */
  shift: string;
}
export interface Year { id: string; name: string; start: string; end: string; current: boolean }
export interface Term { id: string; yearId: string; name: string; start: string; end: string }
export type Stage = "primary" | "intermediate" | "secondary";
export const STAGE_LABEL: Record<Stage, string> = { primary: "الابتدائية", intermediate: "المتوسطة", secondary: "الإعدادية" };
export interface Level { id: string; stage: Stage; name: string; order: number; branch?: string }
export interface Subject { id: string; name: string; color: string }
/** What a level studies: weekly periods and the subject's top mark. */
export interface CurriculumRow { id: string; levelId: string; subjectId: string; weekly: number; max: number }
export interface Period { id: string; no: number; start: string; end: string; isBreak?: boolean }
export interface Room { id: string; name: string; kind?: string }

export type StudentStatus = "active" | "transferred" | "withdrawn" | "graduated";
export const STUDENT_STATUS: Record<StudentStatus, string> = { active: "مستمر", transferred: "منقول", withdrawn: "منسحب", graduated: "متخرج" };
export interface Student {
  id: string; no: string; name: string; gender: "m" | "f"; birth?: string; birthPlace?: string;
  guardian?: string; relation?: string; phone?: string; phone2?: string; address?: string; nationalId?: string;
  health?: string; notes?: string; photo?: string;
  sectionId?: string; status: StudentStatus; enrolledAt: string; leftAt?: string;
}
export interface Section { id: string; levelId: string; name: string; capacity: number; homeroomId?: string; room?: string }
export interface Slot { subjectId: string; teacherId?: string; room?: string }
/** "sectionId|day|periodNo" → what is taught then. */
export type Timetable = Record<string, Slot>;
export const slotKey = (sectionId: string, day: number, no: number) => `${sectionId}|${day}|${no}`;
export interface Teacher {
  id: string; name: string; specialty?: string; subjectIds: string[]; phone?: string; hireDate?: string;
  /** Weekly periods the teacher should teach (النصاب). */
  load: number; salary?: number; contract?: "permanent" | "contract" | "hourly"; active: boolean; color: string; notes?: string;
}
export const CONTRACT_LABEL = { permanent: "ملاك دائم", contract: "عقد", hourly: "محاضر" } as const;
export const TEACHER_COLORS = ["#0284c7", "#16a34a", "#d97706", "#db2777", "#7c3aed", "#0d9488", "#dc2626", "#4f46e5", "#65a30d", "#ea580c"];
export const SUBJECT_COLORS = TEACHER_COLORS;

// ── Keys ────────────────────────────────────────────────────────────────────────
export const K = {
  info: "school.settings.v1", years: "school.years.v1", terms: "school.terms.v1", levels: "school.levels.v1", subjects: "school.subjects.v1",
  curriculum: "school.curriculum.v1", periods: "school.periods.v1", rooms: "school.rooms.v1",
  students: "students.list.v1", studentCounter: "students.counter.v1",
  sections: "classes.sections.v1", timetable: "classes.timetable.v1",
  teachers: "teachers.list.v1", subs: "teachers.subs.v1",
} as const;

export const DEFAULT_INFO: SchoolInfo = {
  name: "", subtitle: "", footer: "", logo: "", kind: "gov", province: "", directorate: "", principal: "", phone: "",
  gender: "mixed", workDays: [0, 1, 2, 3, 4], shift: "",
};

// ── Getters / setters ───────────────────────────────────────────────────────────
export const getInfo = (): SchoolInfo => ({ ...DEFAULT_INFO, ...readLS<Partial<SchoolInfo>>(K.info, {}) });
export const saveInfo = (v: SchoolInfo) => writeLS(K.info, v);
export const schoolName = () => getInfo().name.trim() || "المدرسة";
export const isPrivate = () => getInfo().kind === "private";

export const getYears = () => readLS<Year[]>(K.years, []);
export const saveYears = (v: Year[]) => writeLS(K.years, v);
export const currentYear = (): Year | undefined => { const y = getYears(); return y.find((x) => x.current) ?? y[y.length - 1]; };
export const getTerms = () => readLS<Term[]>(K.terms, []);
export const saveTerms = (v: Term[]) => writeLS(K.terms, v);
export const getLevels = () => readLS<Level[]>(K.levels, []).sort((a, b) => a.order - b.order);
export const saveLevels = (v: Level[]) => writeLS(K.levels, v);
export const getSubjects = () => readLS<Subject[]>(K.subjects, []);
export const saveSubjects = (v: Subject[]) => writeLS(K.subjects, v);
export const getCurriculum = () => readLS<CurriculumRow[]>(K.curriculum, []);
export const saveCurriculum = (v: CurriculumRow[]) => writeLS(K.curriculum, v);
export const getPeriods = () => readLS<Period[]>(K.periods, []).sort((a, b) => a.no - b.no);
export const savePeriods = (v: Period[]) => writeLS(K.periods, v);
export const getRooms = () => readLS<Room[]>(K.rooms, []);
export const saveRooms = (v: Room[]) => writeLS(K.rooms, v);

export const getStudents = () => readLS<Student[]>(K.students, []);
export const saveStudents = (v: Student[]) => writeLS(K.students, v);
export const getSections = () => readLS<Section[]>(K.sections, []);
export const saveSections = (v: Section[]) => writeLS(K.sections, v);
export const getTimetable = () => readLS<Timetable>(K.timetable, {});
export const saveTimetable = (v: Timetable) => writeLS(K.timetable, v);
export const getTeachers = () => readLS<Teacher[]>(K.teachers, []);
export const saveTeachers = (v: Teacher[]) => writeLS(K.teachers, v);

// ── Names ───────────────────────────────────────────────────────────────────────
export function levelName(l?: Level): string {
  return l ? `${l.name}${l.branch ? ` ${l.branch}` : ""}` : "—";
}
export function sectionLabel(s: Section | undefined, levels: Level[]): string {
  if (!s) return "—";
  return `${levelName(levels.find((l) => l.id === s.levelId))} / ${s.name}`;
}
export const byId = <T extends { id: string }>(list: T[]): Map<string, T> => new Map(list.map((x) => [x.id, x]));

/** The next student number: 1, 2, 3… (a plain counter kept on this device). */
export function nextStudentNo(): string {
  const used = new Set(getStudents().map((s) => s.no));
  let n = Number(kvGet(K.studentCounter) ?? 0) || 0;
  do { n++; } while (used.has(String(n)));
  kvSet(K.studentCounter, String(n));
  return String(n);
}

// ── Defaults for Iraqi schools ──────────────────────────────────────────────────
const SUBJECT_NAMES = [
  "التربية الإسلامية", "اللغة العربية", "اللغة الإنكليزية", "الرياضيات", "العلوم", "الفيزياء", "الكيمياء", "الأحياء", "الاجتماعيات",
  "التاريخ", "الجغرافية", "التربية الوطنية", "الحاسوب", "التربية الفنية", "التربية الرياضية", "التربية الأسرية", "الاقتصاد", "علم الاجتماع", "الفلسفة", "اللغة الكردية",
];
/** weekly periods and top mark per subject, by stage (and branch for the secondary stage). All editable afterwards. */
const PLAN: Record<string, [string, number][]> = {
  primary: [["التربية الإسلامية", 2], ["اللغة العربية", 6], ["اللغة الإنكليزية", 3], ["الرياضيات", 5], ["العلوم", 3], ["الاجتماعيات", 2], ["التربية الفنية", 1], ["التربية الرياضية", 2]],
  intermediate: [["التربية الإسلامية", 2], ["اللغة العربية", 4], ["اللغة الإنكليزية", 4], ["الرياضيات", 4], ["الفيزياء", 2], ["الكيمياء", 2], ["الأحياء", 2], ["التاريخ", 2], ["الجغرافية", 2], ["التربية الوطنية", 1], ["الحاسوب", 2], ["التربية الفنية", 1], ["التربية الرياضية", 1]],
  "secondary:علمي": [["التربية الإسلامية", 2], ["اللغة العربية", 4], ["اللغة الإنكليزية", 4], ["الرياضيات", 5], ["الفيزياء", 4], ["الكيمياء", 4], ["الأحياء", 4], ["الحاسوب", 2], ["التربية الرياضية", 1]],
  "secondary:أدبي": [["التربية الإسلامية", 2], ["اللغة العربية", 5], ["اللغة الإنكليزية", 4], ["الرياضيات", 2], ["التاريخ", 3], ["الجغرافية", 3], ["الاقتصاد", 2], ["علم الاجتماع", 2], ["الحاسوب", 2], ["التربية الرياضية", 1]],
};
const ORD = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];

/** Replace the levels, subjects and curriculum with the usual Iraqi ones (primary 1–6, intermediate 1–3, secondary 4–6 علمي/أدبي). */
export function seedIraqiCurriculum(stages: Stage[] = ["primary", "intermediate", "secondary"]): void {
  const subjects: Subject[] = SUBJECT_NAMES.map((name, i) => ({ id: newId(), name, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }));
  const sid = (n: string) => subjects.find((s) => s.name === n)!.id;
  const levels: Level[] = []; const cur: CurriculumRow[] = [];
  let order = 0;
  const add = (stage: Stage, name: string, plan: [string, number][], branch?: string) => {
    const l: Level = { id: newId(), stage, name, order: order++, ...(branch ? { branch } : {}) };
    levels.push(l);
    for (const [n, weekly] of plan) cur.push({ id: newId(), levelId: l.id, subjectId: sid(n), weekly, max: 100 });
  };
  if (stages.includes("primary")) for (let i = 0; i < 6; i++) add("primary", `${ORD[i]} الابتدائي`, PLAN.primary);
  if (stages.includes("intermediate")) for (let i = 0; i < 3; i++) add("intermediate", `${ORD[i]} المتوسط`, PLAN.intermediate);
  if (stages.includes("secondary")) for (let i = 3; i < 6; i++) for (const b of ["علمي", "أدبي"]) add("secondary", `${ORD[i]} الإعدادي`, PLAN[`secondary:${b}`], b);
  saveSubjects(subjects); saveLevels(levels); saveCurriculum(cur);
}

/** Six 45-minute periods from 08:00 with a break after the third. */
export function defaultPeriods(): Period[] {
  const out: Period[] = []; let t = 8 * 60; let no = 1;
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  for (let i = 0; i < 6; i++) {
    out.push({ id: newId(), no: no++, start: fmt(t), end: fmt(t + 45) });
    t += 45;
    if (i === 2) { out.push({ id: newId(), no: no++, start: fmt(t), end: fmt(t + 20), isBreak: true }); t += 20; }
  }
  return out;
}
/** The teaching periods (breaks left out), in order. */
export const teachingPeriods = (ps: Period[]) => ps.filter((p) => !p.isBreak);

/** Default Iraqi school year: October → June, two terms. */
export function newYear(startYear: number): { year: Year; terms: Term[] } {
  const year: Year = { id: newId(), name: `${startYear}-${startYear + 1}`, start: `${startYear}-10-01`, end: `${startYear + 1}-06-30`, current: true };
  return {
    year,
    terms: [
      { id: newId(), yearId: year.id, name: "الفصل الأول", start: `${startYear}-10-01`, end: `${startYear + 1}-01-31` },
      { id: newId(), yearId: year.id, name: "الفصل الثاني", start: `${startYear + 1}-02-01`, end: `${startYear + 1}-06-30` },
    ],
  };
}

// ── Timetable checks ────────────────────────────────────────────────────────────
export interface Conflict { kind: "teacher" | "room" | "load" | "subject"; text: string; keys: string[] }

/** What would clash if `slot` were put at (section, day, period)? Teacher in two sections at once, a room used twice. */
export function slotConflicts(tt: Timetable, sectionId: string, day: number, no: number, slot: Slot, sections: Section[], levels: Level[], teachers: Teacher[]): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(tt)) {
    const [sec, d, n] = k.split("|");
    if (sec === sectionId || Number(d) !== day || Number(n) !== no) continue;
    const other = sectionLabel(sections.find((s) => s.id === sec), levels);
    if (slot.teacherId && v.teacherId === slot.teacherId) out.push(`${teachers.find((t) => t.id === slot.teacherId)?.name ?? "المدرس"} عنده حصة في ${other} بالوقت نفسه`);
    if (slot.room && v.room === slot.room) out.push(`القاعة «${slot.room}» مشغولة بـ ${other}`);
  }
  return out;
}

/** Every clash in a timetable (for the full report). */
export function allConflicts(tt: Timetable, sections: Section[], levels: Level[], teachers: Teacher[]): Conflict[] {
  const out: Conflict[] = []; const seenT = new Map<string, string>(); const seenR = new Map<string, string>();
  for (const [k, v] of Object.entries(tt)) {
    const [sec, d, n] = k.split("|"); const when = `${d}|${n}`;
    if (v.teacherId) {
      const key = `${v.teacherId}|${when}`;
      if (seenT.has(key)) out.push({ kind: "teacher", keys: [seenT.get(key)!, k], text: `${teachers.find((t) => t.id === v.teacherId)?.name ?? "مدرس"} في ${sectionLabel(sections.find((s) => s.id === sec), levels)} و${sectionLabel(sections.find((s) => s.id === seenT.get(key)!.split("|")[0]), levels)} معاً` });
      else seenT.set(key, k);
    }
    if (v.room) {
      const key = `${v.room}|${when}`;
      if (seenR.has(key)) out.push({ kind: "room", keys: [seenR.get(key)!, k], text: `القاعة «${v.room}» مستعملة مرتين` });
      else seenR.set(key, k);
    }
  }
  return out;
}

/** Periods a teacher teaches per week. */
export function teacherLoad(tt: Timetable, teacherId: string): number {
  return Object.values(tt).filter((s) => s.teacherId === teacherId).length;
}
/** Periods per week a section has for a subject. */
export function subjectCount(tt: Timetable, sectionId: string, subjectId: string): number {
  return Object.entries(tt).filter(([k, s]) => k.startsWith(sectionId + "|") && s.subjectId === subjectId).length;
}

// ── Backup of the whole school file ─────────────────────────────────────────────
const BACKUP_APP = "spir-school";
export function exportBackup() {
  const data: Record<string, unknown> = {};
  for (const [k, v] of kvSyncedEntries()) { try { data[k] = JSON.parse(v); } catch { data[k] = v; } }
  return { app: BACKUP_APP, version: 1, exported_at: new Date().toISOString(), date: todayYmd(), data };
}
export function importBackup(raw: unknown): boolean {
  const b = raw as { app?: string; data?: Record<string, unknown> } | null;
  if (!b || b.app !== BACKUP_APP || !b.data || typeof b.data !== "object") return false;
  for (const [k, v] of Object.entries(b.data)) kvSet(k, typeof v === "string" ? v : JSON.stringify(v));
  return true;
}
