"use client";

/** Marks, averages, ranks and pass / fail rules for the results station (keys under "results."). */

import { readLS, writeLS, newId } from "@/lib/local/util";
import type { Student, Term } from "@/lib/school/store";

export interface Component { id: string; name: string; /** share of the term's mark, in % */ weight: number }
export interface GradeBand { min: number; label: string }
export interface ResultRules {
  /** A subject is passed from this mark (out of 100). */
  passMark: number;
  /** Failing up to this many subjects sends the student to the second round (الدور الثاني); more = fail. */
  secondRoundMax: number;
  components: Component[];
  /** termId → weight (%) in the annual mark; missing = equal shares. */
  termWeights: Record<string, number>;
  bands: GradeBand[];
}
/** Fixed ids for the default components, so marks entered before the rules are ever saved stay attached. */
export const DEFAULT_RULES = (): ResultRules => ({
  passMark: 50, secondRoundMax: 2, termWeights: {},
  components: [
    { id: "c-month1", name: "الشهر الأول", weight: 20 },
    { id: "c-month2", name: "الشهر الثاني", weight: 20 },
    { id: "c-final", name: "الامتحان النهائي", weight: 60 },
  ],
  bands: [{ min: 90, label: "امتياز" }, { min: 80, label: "جيد جداً" }, { min: 70, label: "جيد" }, { min: 60, label: "متوسط" }, { min: 50, label: "مقبول" }, { min: 0, label: "راسب" }],
});

export const KR = { rules: "results.rules.v1", marks: "results.marks.v1", certs: "results.certlog.v1", templates: "results.templates.v1", counter: "results.certCounter.v1" } as const;
export const getRules = (): ResultRules => ({ ...DEFAULT_RULES(), ...readLS<Partial<ResultRules>>(KR.rules, {}) });
export const saveRules = (v: ResultRules) => writeLS(KR.rules, v);

/** "studentId|subjectId|termId|componentId" → mark out of 100. */
export type Marks = Record<string, number>;
export const markKey = (st: string, sub: string, term: string, comp: string) => `${st}|${sub}|${term}|${comp}`;
export const getMarks = () => readLS<Marks>(KR.marks, {});
export const saveMarks = (v: Marks) => writeLS(KR.marks, v);

/** Subject mark for one term (null when nothing was entered). */
export function termScore(marks: Marks, rules: ResultRules, st: string, sub: string, term: string): number | null {
  let any = false, sum = 0, w = 0;
  for (const c of rules.components) {
    const m = marks[markKey(st, sub, term, c.id)];
    if (m !== undefined) any = true;
    sum += (m ?? 0) * c.weight; w += c.weight;
  }
  return any && w > 0 ? sum / w : null;
}
/** Annual subject mark: the terms with marks, by their weights (equal when none are set). */
export function annualScore(marks: Marks, rules: ResultRules, st: string, sub: string, terms: Term[]): number | null {
  let sum = 0, w = 0;
  for (const t of terms) {
    const s = termScore(marks, rules, st, sub, t.id); if (s === null) continue;
    const tw = rules.termWeights[t.id] ?? 100 / Math.max(1, terms.length);
    sum += s * tw; w += tw;
  }
  return w > 0 ? sum / w : null;
}
export const gradeLabel = (rules: ResultRules, avg: number) => [...rules.bands].sort((a, b) => b.min - a.min).find((b) => avg >= b.min)?.label ?? "";
export const round2 = (n: number) => Math.round(n * 100) / 100;

export type Outcome = "pass" | "second" | "fail" | "incomplete";
export const OUTCOME_LABEL: Record<Outcome, string> = { pass: "ناجح", second: "ناجح بالدور الثاني (مكمّل)", fail: "راسب", incomplete: "غير مكتمل" };
export interface StudentResult { student: Student; scores: Record<string, number | null>; average: number | null; failed: number; outcome: Outcome; rank: number; grade: string }

/** Everything for a list of students over some subjects: `termIds` empty/many = annual over those terms. */
export function computeResults(students: Student[], subjectIds: string[], terms: Term[], marks: Marks, rules: ResultRules): StudentResult[] {
  const rows = students.map((student) => {
    const scores: Record<string, number | null> = {};
    for (const sub of subjectIds) scores[sub] = annualScore(marks, rules, student.id, sub, terms);
    const have = subjectIds.map((s) => scores[s]).filter((x): x is number => x !== null);
    const average = have.length ? have.reduce((a, b) => a + b, 0) / have.length : null;
    const failed = have.filter((x) => x < rules.passMark).length;
    const outcome: Outcome = have.length < subjectIds.length || !subjectIds.length ? "incomplete" : failed === 0 ? "pass" : failed <= rules.secondRoundMax ? "second" : "fail";
    return { student, scores, average, failed, outcome, rank: 0, grade: average === null ? "" : gradeLabel(rules, average) };
  });
  const ranked = rows.filter((r) => r.average !== null).sort((a, b) => b.average! - a.average!);
  ranked.forEach((r, i) => { r.rank = i > 0 && round2(r.average!) === round2(ranked[i - 1].average!) ? ranked[i - 1].rank : i + 1; });
  return rows;
}

// ── Certificates ────────────────────────────────────────────────────────────────
export type CertKind = "success" | "graduation" | "report" | "honor";
export interface CertTemplate { kind: CertKind; title: string; body: string; landscape: boolean; showScores: boolean }
export const CERT_LABEL: Record<CertKind, string> = { success: "شهادة نجاح", graduation: "شهادة تخرج", report: "بطاقة درجات", honor: "شهادة تقدير" };
export const CERT_PLACEHOLDERS = "{name} {level} {section} {year} {average} {grade} {school} {rank} {no}";
export const DEFAULT_TEMPLATES: CertTemplate[] = [
  { kind: "success", title: "شهادة نجاح", landscape: true, showScores: true,
    body: "تشهد إدارة {school} بأن الطالب (ة) {name} قد أتمّ (ت) بنجاح متطلبات الصف {level} للعام الدراسي {year} بمعدل {average} وتقدير ({grade})، وقد مُنح (ت) هذه الشهادة بناءً على طلبه (ا)." },
  { kind: "graduation", title: "شهادة تخرج", landscape: true, showScores: true,
    body: "تشهد إدارة {school} بأن الطالب (ة) {name} قد أنهى (ت) بنجاح دراسته في {level} للعام الدراسي {year} بمعدل عام {average} وتقدير ({grade})، وبذلك استحق (ت) شهادة التخرج، متمنين له (ا) دوام التوفيق والنجاح." },
  { kind: "report", title: "بطاقة الدرجات", landscape: false, showScores: true,
    body: "بطاقة درجات الطالب (ة) {name} — {level} / {section} — للعام الدراسي {year}." },
  { kind: "honor", title: "شهادة تقدير", landscape: true, showScores: false,
    body: "تقديراً لجهود الطالب (ة) {name} وتفوّقه (ا) في {level} للعام الدراسي {year} وحصوله (ا) على المرتبة {rank} بمعدل {average}، تمنح إدارة {school} هذه الشهادة مع أطيب الأمنيات." },
];
export const getTemplates = (): CertTemplate[] => {
  const saved = readLS<CertTemplate[]>(KR.templates, []);
  return DEFAULT_TEMPLATES.map((d) => saved.find((s) => s.kind === d.kind) ?? d);
};
export const saveTemplates = (v: CertTemplate[]) => writeLS(KR.templates, v);
export const fillTemplate = (body: string, vars: Record<string, string>) => body.replace(/\{(\w+)\}/g, (m, k) => (k === "year" || k === "average" || k === "no" ? `\u2066${vars[k] ?? m}\u2069` : vars[k] ?? m));

export interface CertLogEntry { id: string; no: string; studentId: string; studentName: string; kind: CertKind; date: string; year: string }
export const getCertLog = () => readLS<CertLogEntry[]>(KR.certs, []);
export const saveCertLog = (v: CertLogEntry[]) => writeLS(KR.certs, v);
/** Next serial like 2026/0001 (a counter per calendar year, kept on this device). */
export function nextCertNo(): string {
  const y = new Date().getFullYear();
  const c = readLS<{ y: number; n: number }>(KR.counter, { y, n: 0 });
  const n = (c.y === y ? c.n : 0) + 1;
  writeLS(KR.counter, { y, n });
  return `${y}/${String(n).padStart(4, "0")}`;
}
