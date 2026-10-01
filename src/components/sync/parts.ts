import { SCHOOL_STATIONS } from "@/lib/school/stations";
/** Shared bits of «محطة المزامنة»'s pages. */
export const STATION_LABEL: Record<string, string> = Object.fromEntries([["school", "الإعداد والعام الدراسي"], ...SCHOOL_STATIONS.slice(1).map((m) => [m.id, m.label])]);
export const card = "rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]";
export const btn = "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold";
export { fmtDateTime as when } from "@/lib/utils";
/** Whole days since a time (0 = today). */
export const daysSince = (t: number) => Math.floor((Date.now() - t) / 86_400_000);
