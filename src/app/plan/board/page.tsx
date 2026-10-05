"use client";

import { useState } from "react";
import { KanbanSquare, MoreHorizontal, Clock, BookOpen } from "lucide-react";
import { getTeachers, getSubjects, getLevels, levelName } from "@/lib/school/store";
import { getHolidays } from "@/lib/school/leaves";
import { getPlans, savePlans, schoolWeeks, type Plan, type PlanUnit } from "@/lib/school/plan";
import { PageTitle, Empty, inp, useLive } from "@/components/school/ui";
import { todayYmd } from "@/lib/local/util";

type Col = "todo" | "doing" | "done";
const COLS: { id: Col; label: string; dot: string; set: number }[] = [
  { id: "todo", label: "لم تبدأ", dot: "bg-slate-400", set: 0 }, { id: "doing", label: "قيد التنفيذ", dot: "bg-amber-400", set: 50 }, { id: "done", label: "مكتملة", dot: "bg-brand", set: 100 },
];
const colOf = (u: PlanUnit): Col => (u.done >= 100 ? "done" : u.done > 0 ? "doing" : "todo");

export default function Board() {
  const [d, reload] = useLive(() => ({ plans: getPlans(), teachers: getTeachers(), subjects: getSubjects(), levels: getLevels(), hs: getHolidays() }), null);
  const [filter, setFilter] = useState<"all" | "late" | "soon">("all"); const [tid, setTid] = useState(""); const [over, setOver] = useState<Col | null>(null); const [menu, setMenu] = useState("");
  if (!d) return null;
  const weeks = schoolWeeks(d.hs); const today = todayYmd();
  const weekNow = weeks.findIndex((w) => today >= w.start && today <= w.end);
  const cards = d.plans.filter((p) => !tid || p.teacherId === tid).flatMap((p) => p.units.map((u) => ({ p, u }))).filter(({ u }) => {
    if (filter === "late") return u.done < 100 && u.to !== undefined && weekNow >= 0 && u.to < weekNow;
    if (filter === "soon") return u.done < 100 && u.from !== undefined && weekNow >= 0 && u.from <= weekNow + 1 && (u.to ?? 0) >= weekNow;
    return true;
  });
  const move = (planId: string, unitId: string, col: Col) => {
    const v = COLS.find((c) => c.id === col)!.set;
    savePlans(d.plans.map((p) => p.id !== planId ? p : { ...p, units: p.units.map((u) => u.id === unitId ? { ...u, done: colOf(u) === col ? u.done : v } : u) })); reload();
  };
  const name = (p: Plan) => `${d.subjects.find((s) => s.id === p.subjectId)?.name ?? ""} — ${levelName(d.levels.find((l) => l.id === p.levelId))}`;
  const pills: [typeof filter, string][] = [["all", "الكل"], ["soon", "هذا الأسبوع"], ["late", "المتأخرة"]];
  return (
    <div>
      <PageTitle icon={<KanbanSquare className="size-6" />} title="لوحة المتابعة" sub="اسحب وحدة إلى مرحلة أخرى أو استعمل قائمتها لتحديث إنجازها.">
        <select value={tid} onChange={(e) => setTid(e.target.value)} className={`w-48 ${inp}`}><option value="">كل المدرسين</option>{d.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      </PageTitle>
      <div className="mb-4 flex items-center gap-2">{pills.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} className={`rounded-full px-4 py-1.5 text-sm ${filter === k ? "bg-gradient-to-b from-brand to-brand-dark font-semibold text-white" : "text-muted hover:bg-surface"}`}>{l}</button>)}<span className="ms-auto text-xs text-muted">{cards.length} وحدة معروضة</span></div>
      {!d.plans.length ? <Empty>لا خطط بعد؛ أنشئ خطة من صفحة «الخطط».</Empty> : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLS.map((c) => {
            const items = cards.filter(({ u }) => colOf(u) === c.id);
            return (
              <section key={c.id} data-col={c.id} onDragOver={(e) => { e.preventDefault(); setOver(c.id); }} onDragLeave={() => setOver((o) => (o === c.id ? null : o))}
                onDrop={(e) => { e.preventDefault(); setOver(null); const [pid, uid] = e.dataTransfer.getData("text/plain").split("|"); if (pid && uid) move(pid, uid, c.id); }}
                className={`rounded-3xl p-3 transition-colors ${over === c.id ? "bg-brand-light ring-2 ring-brand-soft" : "bg-canvas/60"}`}>
                <div className="mb-3 flex items-center gap-2 px-2 text-sm font-bold"><i className={`size-2.5 rounded-full ${c.dot}`} />{c.label}<span className="ms-auto text-xs font-normal text-muted tabular-nums">{items.length}</span></div>
                <div className="grid gap-3">
                  {items.map(({ p, u }) => { const late = u.done < 100 && u.to !== undefined && weekNow >= 0 && u.to < weekNow; const key = `${p.id}|${u.id}`; return (
                    <article key={key} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", key)} className="cursor-grab rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] active:cursor-grabbing">
                      <div className="mb-2 flex items-center gap-2 text-[11px]"><span className="rounded-md bg-brand-light px-1.5 py-0.5 font-medium text-brand-dark">{d.subjects.find((s) => s.id === p.subjectId)?.name}</span>
                        {late && <span className="rounded-md bg-red-50 px-1.5 py-0.5 font-medium text-red-600">متأخرة</span>}
                        <div className="relative ms-auto"><button onClick={() => setMenu(menu === key ? "" : key)} aria-label="نقل" className="grid size-6 place-items-center rounded-md text-muted hover:bg-canvas"><MoreHorizontal className="size-4" /></button>
                          {menu === key && <div className="absolute end-0 top-7 z-10 w-36 rounded-2xl border border-line bg-surface p-1 shadow-[var(--shadow-pop)]">{COLS.filter((x) => x.id !== c.id).map((x) => <button key={x.id} onClick={() => { move(p.id, u.id, x.id); setMenu(""); }} className="block w-full rounded-xl px-3 py-2 text-start text-xs hover:bg-canvas">نقل إلى «{x.label}»</button>)}</div>}</div></div>
                      <div className="text-sm font-semibold leading-snug">{u.title}</div>
                      <div className="mt-1 text-[11px] text-muted">{name(p)}</div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${u.done}%` }} /></div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted"><span className="inline-flex items-center gap-1"><BookOpen className="size-3" />{u.lessons} دروس</span>
                        <span className="inline-flex items-center gap-1 tabular-nums"><Clock className="size-3" />{u.from !== undefined && weeks[u.from] ? weeks[u.from].start.slice(5) : "—"}</span>
                        <span className="rounded-full bg-canvas px-2 py-0.5 font-medium text-ink">{d.teachers.find((t) => t.id === p.teacherId)?.name.split(" ")[0]}</span></div>
                    </article>); })}
                  {!items.length && <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted">اسحب وحدة إلى هنا</div>}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
