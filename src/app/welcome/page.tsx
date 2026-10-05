import { OfflineReady } from "@/components/local/OfflineReady";
import { ActivationGate } from "@/components/local/ActivationGate";
import { ACTIVATION_SCRIPT } from "@/lib/local/activation";
import Link from "next/link";
import { School, ArrowLeft, Phone, RefreshCw, Info, LayoutDashboard } from "lucide-react";
import { LicensedLink, AdminPanelCard } from "@/components/local/WelcomeLicense";
import { WelcomeAccount } from "@/components/local/WelcomeAccount";
import { WelcomeFooter } from "@/components/local/WelcomeFooter";
import { SCHOOL_STATIONS } from "@/lib/school/stations";

export const metadata = { title: "سبير — إدارة المدارس" };

const INTRO = "منصة عربية لإدارة المدارس الحكومية والأهلية. اختر المحطة التي تريد الدخول إليها؛ كل محطة تعمل على هذا الحاسوب بلا إنترنت، وبياناتها مشتركة بين المحطات: ابدأ بـ«الإعداد» ثم «الطلاب» و«الصفوف».";
const SYNC_DESC = "مزامنة بيانات المحطات بين حواسيب المدرسة: بملف مزامنة، أو تلقائياً عبر الخادم أو الشبكة المحلية.";
const ABOUT_DESC = "شرح المنصة والمحطات، البدء السريع، النصائح، والأسئلة الشائعة — مفتوحة للجميع بلا رمز.";
const tile = "grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_10px_20px_-10px_var(--color-brand)]";
const goNew = "mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-brand to-brand-dark px-4 py-2.5 text-sm font-semibold text-white group-hover:brightness-110";
const cardNew = "group relative flex flex-col rounded-3xl bg-surface p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]";
const chipNew = "absolute end-5 top-5 inline-flex items-center rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark";

export default function WelcomePage() {
  return (
    <div className="school-st min-h-screen bg-canvas">
      <script dangerouslySetInnerHTML={{ __html: ACTIVATION_SCRIPT }} />
      <ActivationGate />
      <OfflineReady />
      <div className="relative mx-auto max-w-5xl px-4 py-10">
        {/* This device's school and subscription (top left; above the header on phones) */}
        <div className="mb-4 flex justify-end md:absolute md:left-4 md:top-4 md:mb-0">
          <WelcomeAccount />
        </div>

        {/* ── New look ── */}
        <div className="ui-only-new">
          <div className="mb-10 flex flex-col items-center text-center">
            <span className="grid size-20 place-items-center rounded-[28px] bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_18px_30px_-14px_var(--color-brand)]"><School className="size-10" /></span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">سبير — إدارة المدارس</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{INTRO}</p>
          </div>
          <Link href="/dashboard" data-testid="dashboard-card" className="mb-5 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-[#14733f] to-[#0b4527] p-6 text-white shadow-[0_18px_30px_-16px_#0e5530]">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/15"><LayoutDashboard className="size-7" /></span>
            <span className="flex-1"><span className="block text-xl font-extrabold">لوحة التحكم</span><span className="block text-sm text-white/75">نظرة عامة على الطلاب والحضور والخطط والتنبيهات، والتحليلات.</span></span>
            <ArrowLeft className="size-6" />
          </Link>
        </div>

        {/* ── Classic look ── */}
        <div className="ui-only-classic mb-10 flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg"><School className="size-10" /></span>
          <h1 className="mt-3 text-3xl font-extrabold text-blue-800">سبير — إدارة المدارس</h1>
          <p className="mt-4 max-w-xl text-sm text-muted">{INTRO}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AdminPanelCard />
          {SCHOOL_STATIONS.map((s) => (
            <LicensedLink key={s.id} module={s.id} href={s.path} className={`${cardNew} ui-station-card ${s.border}`}>
              {/* new look */}
              <span className={`ui-only-new ${chipNew}`}>{s.privateOnly ? "للأهلية" : "مجانية"}</span>
              <span className={`ui-only-new ${tile}`}><s.icon className="size-6" /></span>
              {/* classic look */}
              <span className={`ui-only-classic absolute end-5 top-5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.chip}`}>{s.privateOnly ? "للأهلية" : "مجانية"}</span>
              <span className={`ui-only-classic grid size-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${s.grad}`}><s.icon className="size-6" /></span>
              <div className="mt-4 text-lg font-bold">{s.label}</div>
              <p className="mt-1 flex-1 text-sm leading-7 text-muted">{s.desc}</p>
              <span className={`ui-only-new ${goNew}`}>الدخول <ArrowLeft className="size-4" /></span>
              <span className={`ui-only-classic mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${s.btn}`}>الدخول <ArrowLeft className="size-4" /></span>
            </LicensedLink>
          ))}
          <Link href="/sync" data-testid="sync-card" className={`${cardNew} ui-station-card ui-sync-card`}>
            <span className={`ui-only-new ${tile}`}><RefreshCw className="size-6" /></span>
            <span className="ui-only-classic grid size-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-sm"><RefreshCw className="size-6" /></span>
            <div className="mt-4 text-lg font-bold">محطة المزامنة</div>
            <p className="mt-1 flex-1 text-sm leading-7 text-muted">{SYNC_DESC}</p>
            <span className={`ui-only-new ${goNew}`}>الدخول <ArrowLeft className="size-4" /></span>
            <span className="ui-only-classic mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white group-hover:bg-violet-700">الدخول <ArrowLeft className="size-4" /></span>
          </Link>
          <Link href="/about" data-testid="about-card" className={`${cardNew} ui-station-card ui-about-card`}>
            <span className={`ui-only-new ${chipNew}`}>للجميع</span>
            <span className="ui-only-classic absolute end-5 top-5 inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">للجميع</span>
            <span className={`ui-only-new ${tile}`}><Info className="size-6" /></span>
            <span className="ui-only-classic grid size-12 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm"><Info className="size-6" /></span>
            <div className="mt-4 text-lg font-bold">عن التطبيق</div>
            <p className="mt-1 flex-1 text-sm leading-7 text-muted">{ABOUT_DESC}</p>
            <span className={`ui-only-new ${goNew}`}>الدخول <ArrowLeft className="size-4" /></span>
            <span className="ui-only-classic mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white group-hover:bg-purple-700">الدخول <ArrowLeft className="size-4" /></span>
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-line pt-6 text-center">
          <div className="text-sm font-semibold">للاشتراك والتفعيل والدعم الفني</div>
          <a href="tel:07803993585" className="inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-base font-bold tabular-nums shadow-[var(--shadow-card)]">
            <Phone className="size-4 text-brand-dark" /> 07803993585
          </a>
          <div className="mt-2 text-[11px] text-muted" data-testid="app-version">الإصدار: <span dir="ltr" className="tabular-nums">{process.env.LAB_VERSION}</span></div>
        </div>

        <WelcomeFooter />
        <p className="mt-6 text-center text-[11px] text-muted">© <span className="tabular-nums">{new Date().getFullYear()}</span> SPIR — جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}
