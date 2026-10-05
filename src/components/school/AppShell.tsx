"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Search, Bell, Menu, X, Sun, Moon, HelpCircle, RefreshCw, Home, Settings, Download, Check, ShieldCheck,
} from "lucide-react";
import { SCHOOL_STATIONS } from "@/lib/school/stations";
import { NAV } from "@/lib/school/nav";
import { THEME_KEYS } from "@/lib/local/theme";
import { getMode, setMode } from "@/components/local/LocalTheme";
import { getInfo, KIND_LABEL, type SchoolInfo } from "@/lib/school/store";
import { alerts, type Alerts } from "@/lib/school/stats";
import { exportBackup } from "@/lib/school/store";
import { downloadJson, todayYmd } from "@/lib/local/util";
import { cn } from "@/lib/utils";
import type { LicenseModule } from "@/lib/license/modules";
import { Palette } from "./Palette";

export type ShellId = Exclude<LicenseModule, "admin"> | "dashboard";
const SHORT: Record<string, string> = { setup: "الإعداد", students: "الطلاب", classes: "الصفوف والجداول", teachers: "الكادر التدريسي", results: "النتائج والشهادات", leaves: "الإجازات والعطل", plan: "الخطة السنوية", attendance: "الحضور والغياب", fees: "الأقساط الشهرية" };

/** The app frame in the dashboard style: floating side menu, top bar (search, alerts, theme, school), page tabs, content. */
export function AppShell({ id, children }: { id: ShellId; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); const [pal, setPal] = useState(false); const [bell, setBell] = useState(false);
  const [info, setInfo] = useState<SchoolInfo | null>(null); const [al, setAl] = useState<Alerts | null>(null); const [dark, setDark] = useState(false); const [saved, setSaved] = useState(false);
  const themeKey = id === "dashboard" ? THEME_KEYS.setup : THEME_KEYS[id];

  useEffect(() => { setOpen(false); setBell(false); setInfo(getInfo()); try { setAl(alerts()); } catch { setAl(null); } }, [pathname]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((p) => !p); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => { const run = () => setDark(document.documentElement.getAttribute("data-theme") === "dark"); run(); const t = setInterval(run, 600); return () => clearInterval(t); }, []);

  const isOn = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const badge = (sid: string) => !al ? 0 : sid === "classes" ? al.conflicts : sid === "leaves" ? al.pendingLeaves : sid === "attendance" ? al.heavyAbsence : sid === "fees" ? al.lateFees : sid === "plan" ? al.latePlans : 0;
  const stations = SCHOOL_STATIONS.filter((s) => !(s.privateOnly && info && info.kind !== "private") || isOn(s.path));
  const tabs = id === "dashboard" ? [{ href: "/dashboard", label: "نظرة عامة", exact: true }, { href: "/dashboard/analytics", label: "التحليلات", exact: false }]
    : (NAV[id]?.flatMap((s) => s.items) ?? []).map((i) => ({ href: i.href, label: i.label, exact: !!i.exact }));
  const toggleTheme = () => { setMode(themeKey, dark ? "light" : "dark"); setDark(!dark); };
  const nItems = al?.items.length ?? 0;

  const link = (href: string, label: string, Icon: typeof Home, active: boolean, n = 0) => (
    <Link key={href} href={href} aria-current={active ? "page" : undefined}
      className={cn("relative flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors", active ? "font-bold text-ink" : "text-muted hover:bg-canvas hover:text-ink")}>
      {active && <span className="absolute inset-y-2 -start-3 w-1 rounded-e-full bg-brand" />}
      <Icon className={cn("size-[18px]", active && "text-brand")} />
      <span className="flex-1 truncate">{label}</span>
      {n > 0 && <span className="grid min-w-5 place-items-center rounded-md bg-brand-dark px-1.5 py-0.5 text-[10px] font-bold leading-none text-white tabular-nums">{n}</span>}
    </Link>
  );

  const menu = (
    <>
      <div className="flex items-center gap-3 px-3 pb-3 pt-1">
        <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_8px_18px_-8px_var(--color-brand)]"><LayoutDashboard className="size-5" /></span>
        <div className="min-w-0 leading-tight"><div className="text-lg font-extrabold">سبير</div><div className="truncate text-[11px] text-muted">إدارة المدارس</div></div>
      </div>
      <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-muted">القائمة</div>
      <nav className="flex flex-col gap-0.5">
        {link("/dashboard", "لوحة التحكم", LayoutDashboard, id === "dashboard")}
        {stations.map((s) => link(s.path, SHORT[s.id] ?? s.label, s.icon, id === s.id, badge(s.id)))}
      </nav>
      <div className="px-3 pb-1 pt-3 text-[11px] font-semibold tracking-wide text-muted">عام</div>
      <nav className="flex flex-col gap-0.5">
        {link("/setup/settings", "الإعدادات", Settings, pathname === "/setup/settings")}
        {link("/sync", "المزامنة", RefreshCw, isOn("/sync"))}
        {link("/about", "المساعدة", HelpCircle, isOn("/about"))}
        {link("/welcome", "الصفحة الرئيسية", Home, false)}
      </nav>
      <div className="mt-auto pt-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e5530] to-[#06331c] p-3.5 text-white">
          <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.12]" aria-hidden><defs><pattern id="wv" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M0 13 Q6.5 0 13 13 T26 13" fill="none" stroke="#fff" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#wv)" /></svg>
          <span className="relative grid size-8 place-items-center rounded-full bg-white/15"><ShieldCheck className="size-4" /></span>
          <div className="relative mt-2 text-sm font-bold leading-snug">نسخة احتياطية لبيانات المدرسة</div>
          <button onClick={() => { downloadJson(`school-backup-${todayYmd()}.json`, exportBackup()); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            className="relative mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-[#1a8a50] to-[#0e6b3c] px-4 py-2 text-sm font-semibold text-white shadow-inner hover:brightness-110">
            {saved ? <><Check className="size-4" /> تم التنزيل</> : <><Download className="size-4" /> تنزيل النسخة</>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div onClick={() => setOpen(false)} className={cn("no-print fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity md:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} />
      <aside className={cn("no-print fixed inset-y-0 start-0 z-50 flex w-72 flex-col overflow-y-auto bg-surface p-4 shadow-[var(--shadow-pop)] transition-transform duration-200",
        "md:sticky md:top-4 md:z-auto md:m-4 md:h-[calc(100vh-2rem)] md:w-64 md:shrink-0 md:translate-x-0 md:rounded-[28px] md:shadow-[var(--shadow-card)]", open ? "translate-x-0" : "translate-x-full")}>
        <button onClick={() => setOpen(false)} aria-label="إغلاق القائمة" className="absolute end-3 top-3 grid size-8 place-items-center rounded-lg text-muted hover:bg-canvas md:hidden"><X className="size-4" /></button>
        {menu}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col md:py-4 md:pe-4">
        <header className="no-print sticky top-0 z-30 flex items-center gap-3 bg-canvas/85 px-4 py-3 backdrop-blur md:static md:mb-4 md:rounded-[28px] md:bg-surface md:px-5 md:py-3 md:shadow-[var(--shadow-card)]">
          <button onClick={() => setOpen(true)} aria-label="فتح القائمة" className="grid size-10 place-items-center rounded-full border border-line bg-surface md:hidden"><Menu className="size-5" /></button>
          <button onClick={() => setPal(true)} aria-label="بحث" className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-canvas px-4 text-start text-sm text-muted md:max-w-md">
            <Search className="size-[18px] shrink-0" /><span className="flex-1 truncate">ابحث عن صفحة أو طالب أو مدرس…</span><kbd className="hidden rounded-md border border-line bg-surface px-1.5 text-[10px] sm:block" dir="ltr">⌘K</kbd>
          </button>
          <div className="ms-auto flex items-center gap-1.5">
            <button onClick={toggleTheme} aria-label="تبديل المظهر" className="grid size-10 place-items-center rounded-full text-muted hover:bg-canvas">{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
            <div className="relative">
              <button onClick={() => setBell((b) => !b)} aria-label="التنبيهات" className="relative grid size-10 place-items-center rounded-full text-muted hover:bg-canvas"><Bell className="size-[18px]" />{nItems > 0 && <span className="absolute end-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-surface" />}</button>
              {bell && (
                <div className="absolute end-0 top-12 z-50 w-72 rounded-3xl border border-line bg-surface p-3 shadow-[var(--shadow-pop)]">
                  <div className="px-2 pb-2 text-sm font-bold">التنبيهات</div>
                  {nItems ? al!.items.map((i) => <Link key={i.href + i.text} href={i.href} className="block rounded-2xl px-3 py-2 text-sm hover:bg-canvas">{i.text}</Link>) : <p className="px-3 py-4 text-center text-sm text-muted">لا تنبيهات. كل شيء على ما يرام.</p>}
                </div>
              )}
            </div>
            <div className="ms-2 hidden items-center gap-3 sm:flex">
              <span className="grid size-10 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">{(info?.name || "م").trim().slice(0, 1)}</span>
              <div className="leading-tight"><div className="max-w-40 truncate text-sm font-bold">{info?.name || "المدرسة"}</div><div className="text-[11px] text-muted">{info ? KIND_LABEL[info.kind] : ""}</div></div>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 pb-6 md:px-1 print:p-0">
          {tabs.length > 1 && (
            <nav className="no-print mb-5 flex gap-1.5 overflow-x-auto pb-1" aria-label="صفحات المحطة">
              {tabs.map((t) => { const on = t.exact ? pathname === t.href : isOn(t.href);
                return <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors", on ? "bg-gradient-to-b from-brand to-brand-dark font-semibold text-white shadow-[0_6px_14px_-6px_var(--color-brand)]" : "text-muted hover:bg-surface hover:text-ink")}>{t.label}</Link>; })}
            </nav>
          )}
          {children}
        </main>
      </div>
      <Palette open={pal} onClose={() => setPal(false)} />
    </>
  );
}
