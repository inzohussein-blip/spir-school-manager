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
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center rounded-[28px] bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_18px_30px_-14px_var(--color-brand)]"><School className="size-10" /></span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">سبير — إدارة المدارس</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            منصة عربية لإدارة المدارس الحكومية والأهلية. اختر المحطة التي تريد الدخول إليها؛ كل محطة تعمل على هذا الحاسوب بلا إنترنت،
            وبياناتها مشتركة بين المحطات: ابدأ بـ«الإعداد» ثم «الطلاب» و«الصفوف».
          </p>
        </div>

        <Link href="/dashboard" data-testid="dashboard-card" className="mb-5 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-[#14733f] to-[#0b4527] p-6 text-white shadow-[0_18px_30px_-16px_#0e5530]">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/15"><LayoutDashboard className="size-7" /></span>
          <span className="flex-1"><span className="block text-xl font-extrabold">لوحة التحكم</span><span className="block text-sm text-white/75">نظرة عامة على الطلاب والحضور والخطط والتنبيهات، والتحليلات.</span></span>
          <ArrowLeft className="size-6" />
        </Link>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AdminPanelCard />
          {SCHOOL_STATIONS.map((s) => (
            <LicensedLink key={s.id} module={s.id} href={s.path}
              className="group relative flex flex-col rounded-3xl bg-surface p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]">
              <span className="absolute end-5 top-5 inline-flex items-center rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">{s.privateOnly ? "للأهلية" : "مجانية"}</span>
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_10px_20px_-10px_var(--color-brand)]"><s.icon className="size-6" /></span>
              <div className="mt-4 text-lg font-bold">{s.label}</div>
              <p className="mt-1 flex-1 text-sm leading-7 text-muted">{s.desc}</p>
              <span className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-brand to-brand-dark px-4 py-2.5 text-sm font-semibold text-white group-hover:brightness-110">
                الدخول <ArrowLeft className="size-4" />
              </span>
            </LicensedLink>
          ))}
          <Link href="/sync" data-testid="sync-card" className="group flex flex-col rounded-3xl bg-surface p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_10px_20px_-10px_var(--color-brand)]"><RefreshCw className="size-6" /></span>
            <div className="mt-4 text-lg font-bold">محطة المزامنة</div>
            <p className="mt-1 flex-1 text-sm text-muted">مزامنة بيانات المحطات بين حواسيب المدرسة: بملف مزامنة، أو تلقائياً عبر الخادم أو الشبكة المحلية.</p>
            <span className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-brand to-brand-dark px-4 py-2.5 text-sm font-semibold text-white group-hover:brightness-110">
              الدخول <ArrowLeft className="size-4" />
            </span>
          </Link>
          <Link href="/about" data-testid="about-card" className="group relative flex flex-col rounded-3xl bg-surface p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]">
            <span className="absolute end-5 top-5 inline-flex items-center rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">للجميع</span>
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_10px_20px_-10px_var(--color-brand)]"><Info className="size-6" /></span>
            <div className="mt-4 text-lg font-bold">عن التطبيق</div>
            <p className="mt-1 flex-1 text-sm text-muted">شرح المنصة والمحطات، البدء السريع، النصائح، والأسئلة الشائعة — مفتوحة للجميع بلا رمز.</p>
            <span className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-brand to-brand-dark px-4 py-2.5 text-sm font-semibold text-white group-hover:brightness-110">الدخول <ArrowLeft className="size-4" /></span>
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
