"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, BarChart3, GraduationCap, Users, CalendarDays, Gauge, Table2, ClipboardCheck, ClipboardList, Banknote, LogOut, Menu, X, Sun, Moon, School, ShieldCheck, type LucideIcon,
} from "lucide-react";
import { setReadOnlyData } from "@/lib/local/util";
import { ROLE_LABEL, type PortalRole } from "@/lib/portal/shared";
import { getMode, setMode } from "@/components/local/LocalTheme";
import { THEME_KEYS } from "@/lib/local/theme";
import { cn } from "@/lib/utils";

interface Item { href: string; label: string; icon: LucideIcon; roles: PortalRole[] }
const ALL: PortalRole[] = ["manager", "accountant", "teacher"];
const ITEMS: Item[] = [
  { href: "/portal/app/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, roles: ALL },
  { href: "/portal/app/analytics", label: "التحليلات", icon: BarChart3, roles: ["manager", "teacher"] },
  { href: "/portal/app/students", label: "الطلاب", icon: GraduationCap, roles: ALL },
  { href: "/portal/app/teachers", label: "الكادر التدريسي", icon: Users, roles: ["manager", "accountant"] },
  { href: "/portal/app/schedule", label: "جدول المدرس", icon: CalendarDays, roles: ["manager", "teacher"] },
  { href: "/portal/app/load", label: "أحمال الحصص", icon: Gauge, roles: ["manager"] },
  { href: "/portal/app/results", label: "كشف النتائج", icon: Table2, roles: ["manager", "teacher"] },
  { href: "/portal/app/attendance", label: "تقرير الغياب", icon: ClipboardCheck, roles: ["manager", "teacher"] },
  { href: "/portal/app/plan", label: "تنفيذ الخطط", icon: ClipboardList, roles: ["manager", "teacher"] },
  { href: "/portal/app/fees", label: "الأقساط", icon: Banknote, roles: ["manager", "accountant"] },
];

interface Session { role: PortalRole; name: string; school: string; expires: number }

/** The portal's frame: loads the school's records (for this role), then shows them read-only. */
export function PortalFrame({ children }: { children: ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  const [s, setS] = useState<Session | null>(null); const [err, setErr] = useState(""); const [open, setOpen] = useState(false); const [dark, setDark] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/portal/data", { cache: "no-store" }).then(async (r) => {
      const d = await r.json().catch(() => null);
      if (!alive) return;
      if (r.status === 401) { router.replace("/portal"); return; }
      if (!d?.ok) { setErr(d?.error === "no_data" ? "تعذّر قراءة بيانات المدرسة الآن. حاول بعد قليل." : "تعذّر التحميل."); return; }
      setReadOnlyData(d.data);
      setS({ role: d.role, name: d.name, school: d.school, expires: d.expires });
    }).catch(() => alive && setErr("لا اتصال بالخادم."));
    return () => { alive = false; setReadOnlyData(null); };
  }, [router]);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const run = () => { const m = getMode(THEME_KEYS.portal); const d = m === "dark" || (m === "auto" && matchMedia("(prefers-color-scheme: dark)").matches); if (d) document.documentElement.setAttribute("data-theme", "dark"); else document.documentElement.removeAttribute("data-theme"); setDark(d); };
    run(); window.addEventListener("local-theme", run); return () => window.removeEventListener("local-theme", run);
  }, []);

  if (err) return <div className="grid min-h-screen place-items-center p-6 text-center"><div className="max-w-sm rounded-3xl bg-surface p-8 shadow-[var(--shadow-card)]"><p className="mb-4 text-sm">{err}</p><button onClick={() => location.reload()} className="rounded-full bg-gradient-to-b from-brand to-brand-dark px-5 py-2.5 text-sm font-semibold text-white">إعادة المحاولة</button></div></div>;
  if (!s) return <div className="grid min-h-screen place-items-center text-sm text-muted" aria-busy="true">جارٍ تحميل بيانات المدرسة…</div>;

  const items = ITEMS.filter((i) => i.roles.includes(s.role));
  const logout = async () => { await fetch("/api/portal/logout", { method: "POST" }); router.replace("/portal"); };
  const on = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const menu = (
    <>
      <div className="flex items-center gap-3 px-3 pb-4 pt-1">
        <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_8px_18px_-8px_var(--color-brand)]"><School className="size-5" /></span>
        <div className="min-w-0 leading-tight"><div className="truncate text-lg font-extrabold">{s.school}</div><div className="text-[11px] text-muted">لوحة الإدارة على الإنترنت</div></div>
      </div>
      <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-muted">القائمة</div>
      <nav className="flex flex-col gap-0.5">
        {items.map((i) => (
          <Link key={i.href} href={i.href} aria-current={on(i.href) ? "page" : undefined} className={cn("relative flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors", on(i.href) ? "font-bold text-ink" : "text-muted hover:bg-canvas hover:text-ink")}>
            {on(i.href) && <span className="absolute inset-y-2 -start-3 w-1 rounded-e-full bg-brand" />}
            <i.icon className={cn("size-[18px]", on(i.href) && "text-brand")} /><span className="flex-1 truncate">{i.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#0e5530] to-[#06331c] p-3.5 text-white">
          <span className="grid size-8 place-items-center rounded-full bg-white/15"><ShieldCheck className="size-4" /></span>
          <div className="mt-2 text-sm font-bold">عرض للقراءة فقط</div>
          <div className="mt-1 text-[11px] leading-5 text-white/70">البيانات من حواسيب المدرسة المتزامنة. التعديل يتم من محطات المدرسة.</div>
        </div>
      </div>
    </>
  );

  return (
    <div className="school-st min-h-screen md:flex">
      <div onClick={() => setOpen(false)} className={cn("no-print fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity md:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} />
      <aside className={cn("no-print fixed inset-y-0 start-0 z-50 flex w-72 flex-col overflow-y-auto bg-surface p-4 shadow-[var(--shadow-pop)] transition-transform duration-200",
        "md:sticky md:top-4 md:z-auto md:m-4 md:h-[calc(100vh-2rem)] md:w-64 md:shrink-0 md:translate-x-0 md:rounded-[28px] md:shadow-[var(--shadow-card)]", open ? "translate-x-0" : "translate-x-full")}>
        <button onClick={() => setOpen(false)} aria-label="إغلاق القائمة" className="absolute end-3 top-3 grid size-8 place-items-center rounded-lg text-muted hover:bg-canvas md:hidden"><X className="size-4" /></button>
        {menu}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col md:py-4 md:pe-4">
        <header className="no-print sticky top-0 z-30 flex items-center gap-3 bg-canvas/85 px-4 py-3 backdrop-blur md:static md:mb-4 md:rounded-[28px] md:bg-surface md:px-5 md:shadow-[var(--shadow-card)]">
          <button onClick={() => setOpen(true)} aria-label="فتح القائمة" className="grid size-10 place-items-center rounded-full border border-line bg-surface md:hidden"><Menu className="size-5" /></button>
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{items.find((i) => on(i.href))?.label ?? s.school}</div><div className="text-[11px] text-muted">{s.school}</div></div>
          <button onClick={() => setMode(THEME_KEYS.portal, dark ? "light" : "dark")} aria-label="تبديل المظهر" className="grid size-10 place-items-center rounded-full text-muted hover:bg-canvas">{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
          <div className="hidden items-center gap-3 sm:flex"><span className="grid size-10 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">{s.name.trim().slice(0, 1)}</span>
            <div className="leading-tight"><div className="max-w-40 truncate text-sm font-bold">{s.name}</div><div className="text-[11px] text-muted">{ROLE_LABEL[s.role]}</div></div></div>
          <button onClick={logout} aria-label="تسجيل الخروج" className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:bg-canvas"><LogOut className="size-4" /><span className="hidden sm:inline">خروج</span></button>
        </header>
        <main className="min-w-0 flex-1 px-4 pb-6 md:px-1 print:p-0">{children}</main>
      </div>
    </div>
  );
}
