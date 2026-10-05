"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, GraduationCap, Users, FileText } from "lucide-react";
import { getStudents, getTeachers } from "@/lib/school/store";
import { NAV } from "@/lib/school/nav";
import { SCHOOL_STATIONS } from "@/lib/school/stations";

interface Hit { href: string; title: string; sub: string; kind: "page" | "student" | "teacher" }
const norm = (t: string) => t.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

/** ⌘K / Ctrl+K: jump to a page, a student or a teacher. */
export function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter(); const [q, setQ] = useState(""); const [sel, setSel] = useState(0); const input = useRef<HTMLInputElement>(null);
  const pages = useMemo<Hit[]>(() => [
    { href: "/dashboard", title: "لوحة التحكم", sub: "نظرة عامة", kind: "page" as const },
    { href: "/dashboard/analytics", title: "التحليلات", sub: "الحضور والنتائج والأقساط", kind: "page" as const },
    ...SCHOOL_STATIONS.flatMap((s) => (NAV[s.id] ?? [{ title: s.label, items: [] }]).flatMap((sec) => sec.items.map((i) => ({ href: i.href, title: i.label, sub: s.label, kind: "page" as const })))),
  ], []);
  const hits = useMemo(() => {
    if (!open) return [] as Hit[];
    const n = norm(q.trim());
    const people: Hit[] = n ? [
      ...getStudents().filter((s) => norm(`${s.name} ${s.no}`).includes(n)).slice(0, 6).map((s) => ({ href: "/students", title: s.name, sub: `طالب — قيد ${s.no}`, kind: "student" as const })),
      ...getTeachers().filter((t) => norm(t.name).includes(n)).slice(0, 4).map((t) => ({ href: "/teachers", title: t.name, sub: "مدرس", kind: "teacher" as const })),
    ] : [];
    const p = n ? pages.filter((x) => norm(`${x.title} ${x.sub}`).includes(n)) : pages.slice(0, 8);
    return [...p.slice(0, 8), ...people];
  }, [open, q, pages]);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => input.current?.focus(), 30); } }, [open]);
  useEffect(() => setSel(0), [q]);
  if (!open) return null;
  const go = (h?: Hit) => { if (!h) return; onClose(); router.push(h.href); };
  return (
    <div className="no-print fixed inset-0 z-[100] grid place-items-start justify-items-center bg-slate-900/40 p-4 pt-[12vh] backdrop-blur-[2px]" onMouseDown={onClose}>
      <div role="dialog" aria-label="بحث سريع" onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow-pop)]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-muted" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن صفحة أو طالب أو مدرس…" aria-label="بحث"
            onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(hits.length - 1, s + 1)); } else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); } else if (e.key === "Enter") go(hits[sel]); else if (e.key === "Escape") onClose(); }}
            className="h-14 flex-1 bg-transparent text-sm outline-none" />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted">Esc</kbd>
        </div>
        <ul className="max-h-80 overflow-auto p-2">
          {hits.map((h, i) => { const Icon = h.kind === "student" ? GraduationCap : h.kind === "teacher" ? Users : FileText; return (
            <li key={`${h.href}${h.title}${i}`}><button onMouseEnter={() => setSel(i)} onClick={() => go(h)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-start ${i === sel ? "bg-brand-light" : ""}`}>
              <span className="grid size-8 place-items-center rounded-xl bg-canvas text-brand"><Icon className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{h.title}</span><span className="block truncate text-[11px] text-muted">{h.sub}</span></span>
              {i === sel && <CornerDownLeft className="size-4 text-muted" />}</button></li>); })}
          {!hits.length && <li className="p-6 text-center text-sm text-muted">لا نتائج.</li>}
        </ul>
      </div>
    </div>
  );
}
