"use client";

import { readLS, writeLS, newId, todayYmd } from "@/lib/local/util";
import { getStudents, getSections, type Student } from "@/lib/school/store";

export interface FeeSettings { /** levelId → monthly fee */ monthly: Record<string, number>; registration: number; dueDay: number }
export interface Discount { studentId: string; percent: number; amount: number; reason: string }
export type ChargeKind = "monthly" | "registration" | "other";
export interface Charge { id: string; studentId: string; month: string; amount: number; kind: ChargeKind; label: string }
export interface Payment { id: string; no: string; studentId: string; date: string; amount: number; note?: string }

export const KF = { settings: "fees.settings.v1", discounts: "fees.discounts.v1", charges: "fees.charges.v1", payments: "fees.payments.v1", counter: "fees.receipt.v1" } as const;
export const getFeeSettings = (): FeeSettings => ({ monthly: {}, registration: 0, dueDay: 5, ...readLS<Partial<FeeSettings>>(KF.settings, {}) });
export const saveFeeSettings = (v: FeeSettings) => writeLS(KF.settings, v);
export const getDiscounts = () => readLS<Discount[]>(KF.discounts, []);
export const saveDiscounts = (v: Discount[]) => writeLS(KF.discounts, v);
export const getCharges = () => readLS<Charge[]>(KF.charges, []);
export const saveCharges = (v: Charge[]) => writeLS(KF.charges, v);
export const getPayments = () => readLS<Payment[]>(KF.payments, []);
export const savePayments = (v: Payment[]) => writeLS(KF.payments, v);
export function nextReceiptNo(): string {
  const y = new Date().getFullYear(); const c = readLS<{ y: number; n: number }>(KF.counter, { y, n: 0 });
  const n = (c.y === y ? c.n : 0) + 1; writeLS(KF.counter, { y, n }); return `${y}/${String(n).padStart(5, "0")}`;
}

export const afterDiscount = (base: number, dis?: Discount) => Math.max(0, Math.round(base - (dis?.amount ?? 0) - (base * (dis?.percent ?? 0)) / 100));

/** Charges for a month for every active student whose section's level has a fee (existing ones are skipped). */
export function monthlyCharges(month: string, existing: Charge[], settings: FeeSettings, discounts: Discount[]): Charge[] {
  const secs = new Map(getSections().map((s) => [s.id, s]));
  const out: Charge[] = [];
  for (const st of getStudents()) {
    if (st.status !== "active" || !st.sectionId) continue;
    const fee = settings.monthly[secs.get(st.sectionId)?.levelId ?? ""]; if (!fee) continue;
    if (existing.some((c) => c.studentId === st.id && c.month === month && c.kind === "monthly")) continue;
    out.push({ id: newId(), studentId: st.id, month, amount: afterDiscount(fee, discounts.find((d) => d.studentId === st.id)), kind: "monthly", label: "القسط الشهري" });
  }
  return out;
}

export interface Line { charge: Charge; paid: number }
/** Payments cover the oldest charges first. */
export function statement(studentId: string, charges: Charge[], payments: Payment[]): { lines: Line[]; due: number; paid: number; balance: number } {
  const cs = charges.filter((c) => c.studentId === studentId).sort((a, b) => a.month.localeCompare(b.month));
  let pool = payments.filter((p) => p.studentId === studentId).reduce((n, p) => n + p.amount, 0); const paid = pool;
  const lines = cs.map((charge) => { const take = Math.min(pool, charge.amount); pool -= take; return { charge, paid: take }; });
  const due = cs.reduce((n, c) => n + c.amount, 0);
  return { lines, due, paid, balance: due - paid };
}
export const isLate = (l: Line, dueDay: number, today = todayYmd()) => l.paid < l.charge.amount && today > `${l.charge.month}-${String(dueDay).padStart(2, "0")}`;
export type { Student };
