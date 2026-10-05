"use client";

import { useState } from "react";
import { Download, ArrowUp, ArrowDown } from "lucide-react";
import { schoolSnapshot, attendanceSeries, rateOf } from "@/lib/school/stats";
import { getStudents, getSections, getLevels, sectionLabel } from "@/lib/school/store";
import { getRoll } from "@/lib/school/attendance";
import { getPayments } from "@/lib/school/fees";
import { Sparkline, AreaChart, Donut, PALETTE } from "@/components/school/charts";
import { PageTitle, useLive } from "@/components/school/ui";
import { addDays, todayYmd } from "@/lib/local/util";
import { money, CURRENCY } from "@/lib/utils";

const RANGES = [7, 30, 90] as const;
const tile = "rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)]";
const delta = (cur: number, prev: number) => (prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : cur ? 100 : 0);

export default function Analytics() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [d] = useLive(() => ({ snap: schoolSnapshot(), roll: getRoll("students"), students: getStudents(), sections: getSections(), levels: getLevels(), pay: getPayments() }), null);
  if (!d) return null;
  const today = todayYmd(); const from = addDays(today, -days + 1); const pfrom = addDays(today, -2 * days + 1);
  const curAll = attendanceSeries(days); const cur = curAll.filter((x) => x.rate !== null); const prev = attendanceSeries(days, today, days).filter((x) => x.rate !== null);
  const inRange = (date: string, a: string, b: string) => date >= a && date <= b;
  const absences = (a: string, b: string) => Object.entries(d.roll).filter(([k, m]) => m === "a" && inRange(k.split("|")[0], a, b)).length;
  const perDay = (f: (date: string) => number) => Array.from({ length: days }, (_, i) => f(addDays(from, i)));
  const absSeries = perDay((date) => Object.entries(d.roll).filter(([k, m]) => m === "a" && k.startsWith(date)).length);
  const newSeries = perDay((date) => d.students.filter((s) => s.enrolledAt === date).length);
  const paySeries = perDay((date) => d.pay.filter((p) => p.date === date).reduce((n, p) => n + p.amount, 0));
  const priv = d.snap.info.kind === "private";
  const attNow = rateOf(cur), attPrev = rateOf(prev);
  const absNow = absences(from, today), absPrev = absences(pfrom, addDays(from, -1));
  const newNow = d.students.filter((s) => inRange(s.enrolledAt, from, today)).length, newPrev = d.students.filter((s) => inRange(s.enrolledAt, pfrom, addDays(from, -1))).length;
  const payNow = d.pay.filter((p) => inRange(p.date, from, today)).reduce((n, p) => n + p.amount, 0), payPrev = d.pay.filter((p) => inRange(p.date, pfrom, addDays(from, -1))).reduce((n, p) => n + p.amount, 0);
  const kpis = [
    { t: "نسبة الحضور", v: `${attNow}%`, d: delta(attNow, attPrev), good: "up", s: cur.map((x) => x.rate ?? 0) },
    { t: "حالات الغياب", v: String(absNow), d: delta(absNow, absPrev), good: "down", s: absSeries },
    { t: "طلاب جدد", v: String(newNow), d: delta(newNow, newPrev), good: "up", s: newSeries },
    priv ? { t: `المقبوض (${CURRENCY})`, v: money(payNow), d: delta(payNow, payPrev), good: "up", s: paySeries } : { t: "إجمالي الطلاب", v: String(d.snap.students.length), d: 0, good: "up", s: newSeries },
  ] as const;
  const labels = cur.map((x, i) => (i % Math.max(1, Math.floor(days / 6)) === 0 ? x.date.slice(5) : ""));
  const bySection = d.sections.map((s) => {
    let p = 0, n = 0; const ids = new Set(d.students.filter((x) => x.sectionId === s.id && x.status === "active").map((x) => x.id));
    for (const [k, m] of Object.entries(d.roll)) { const [date, id] = k.split("|"); if (!ids.has(id) || !inRange(date, from, today) || m === "e") continue; n++; if (m === "p" || m === "l") p++; }
    return { s, rate: n ? Math.round((p / n) * 100) : null };
  }).filter((x) => x.rate !== null).sort((a, b) => (b.rate as number) - (a.rate as number));
  const stages = (Object.keys(d.snap.byStage) as (keyof typeof d.snap.byStage)[]);
  const exportCsv = () => {
    const csv = "date,attendance_rate\n" + cur.map((x) => `${x.date},${x.rate ?? ""}`).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" })); a.download = `attendance-${today}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <div>
      <PageTitle icon={null} title="التحليلات" sub="كيف يسير الحضور، وأين تذهب الأيام والأموال.">
        <div className="flex rounded-full bg-surface p-1 shadow-[var(--shadow-card)]">{RANGES.map((r) => <button key={r} onClick={() => setDays(r)} aria-pressed={days === r} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${days === r ? "bg-gradient-to-b from-brand to-brand-dark text-white" : "text-muted"}`}>{r} يوم</button>)}</div>
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-surface px-5 py-2.5 text-sm font-medium"><Download className="size-4" /> تصدير CSV</button>
      </PageTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => { const up = k.d >= 0; const good = (k.good === "up") === up; return (
          <div key={k.t} className={tile}><div className="text-xs text-muted">{k.t}</div><div className="mt-1 text-4xl font-extrabold tabular-nums">{k.v}</div>
            <div className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${k.d === 0 ? "text-muted" : good ? "text-brand" : "text-red-600"}`}>{k.d === 0 ? "—" : up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{Math.abs(k.d)}% <span className="font-normal text-muted">عن الفترة السابقة</span></div>
            <div className="mt-2"><Sparkline values={[...k.s]} /></div></div>); })}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.9fr_1fr]">
        <div className={tile}>
          <div className="flex items-start justify-between"><div><div className="text-lg font-bold">الحضور اليومي</div><div className="text-xs text-muted">نسبة الحاضرين في كل يوم دوام مقابل الفترة السابقة</div></div>
            <div className="flex gap-3 text-[11px] text-muted"><span className="inline-flex items-center gap-1"><i className="h-0.5 w-4 bg-brand-dark" /> هذه الفترة</span><span className="inline-flex items-center gap-1"><i className="h-0.5 w-4 border-t border-dashed border-muted" /> السابقة</span></div></div>
          <AreaChart max={100} unit="%" labels={labels} series={[{ name: "prev", values: prev.map((x) => x.rate ?? 0), dashed: true }, { name: "cur", values: cur.map((x) => x.rate ?? 0) }]} />
        </div>
        <div className={tile}>
          <div className="mb-2 text-lg font-bold">الطلاب حسب المرحلة</div>
          <Donut center={String(d.snap.students.length)} sub="طالب مستمر" parts={stages.map((s, i) => ({ value: d.snap.byStage[s], color: PALETTE[i] }))} />
          <ul className="mt-4 grid gap-2 text-sm">{stages.map((s, i) => <li key={s} className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full" style={{ background: PALETTE[i] }} />{d.snap.stageLabel[s]}</span><b className="tabular-nums">{d.snap.byStage[s]}</b></li>)}</ul>
        </div>
      </div>
      <div className={`${tile} mt-4`}>
        <div className="mb-3 text-lg font-bold">الشعب الأعلى حضوراً</div>
        {!bySection.length ? <p className="text-sm text-muted">لا بيانات حضور في هذه الفترة.</p> : <ul className="grid gap-3 sm:grid-cols-2">{bySection.slice(0, 6).map(({ s, rate }) => (
          <li key={s.id}><div className="mb-1 flex justify-between text-sm"><span>{sectionLabel(s, d.levels)}</span><b className="tabular-nums">{rate}%</b></div><div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-l from-brand-mid to-brand" style={{ width: `${rate}%` }} /></div></li>))}</ul>}
      </div>
    </div>
  );
}
