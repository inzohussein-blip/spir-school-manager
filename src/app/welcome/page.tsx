import { OfflineReady } from "@/components/local/OfflineReady";
import { ActivationGate } from "@/components/local/ActivationGate";
import { ACTIVATION_SCRIPT } from "@/lib/local/activation";
import Link from "next/link";
import { School, ArrowLeft, Phone, RefreshCw } from "lucide-react";
import { LicensedLink, AdminPanelCard } from "@/components/local/WelcomeLicense";
import { WelcomeAccount } from "@/components/local/WelcomeAccount";
import { WelcomeFooter } from "@/components/local/WelcomeFooter";
import { SCHOOL_STATIONS } from "@/lib/school/stations";

export const metadata = { title: "سبير — إدارة المدارس" };

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <script dangerouslySetInnerHTML={{ __html: ACTIVATION_SCRIPT }} />
      <ActivationGate />
      <OfflineReady />
      <div className="relative mx-auto max-w-5xl px-4 py-10">
        {/* This device's school and subscription (top left; above the header on phones) */}
        <div className="mb-4 flex justify-end md:absolute md:left-4 md:top-4 md:mb-0">
          <WelcomeAccount />
        </div>
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg"><School className="size-10" /></span>
          <h1 className="mt-3 text-3xl font-extrabold text-blue-800">سبير — إدارة المدارس</h1>
          <p className="mt-4 max-w-xl text-sm text-muted">
            منصة عربية لإدارة المدارس الحكومية والأهلية. اختر المحطة التي تريد الدخول إليها؛ كل محطة تعمل على هذا الحاسوب بلا إنترنت،
            وبياناتها مشتركة بين المحطات: ابدأ بـ«الإعداد» ثم «الطلاب» و«الصفوف».
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AdminPanelCard />
          {SCHOOL_STATIONS.map((s) => (
            <LicensedLink key={s.id} module={s.id} href={s.path}
              className={`group flex flex-col rounded-2xl border-2 bg-surface p-6 shadow-[var(--shadow-card)] transition-colors ${s.border}`}>
              <span className={`absolute -mt-9 ms-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.chip}`}>{s.privateOnly ? "للأهلية" : "مجانية"}</span>
              <span className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${s.grad}`}><s.icon className="size-6" /></span>
              <div className="mt-4 text-lg font-bold">{s.label}</div>
              <p className="mt-1 flex-1 text-sm text-muted">{s.desc}</p>
              <span className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${s.btn}`}>
                الدخول <ArrowLeft className="size-4" />
              </span>
            </LicensedLink>
          ))}
          <Link href="/sync" data-testid="sync-card" className="group flex flex-col rounded-2xl border-2 border-violet-300 bg-surface p-6 shadow-[var(--shadow-card)] transition-colors hover:border-violet-500">
            <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-sm"><RefreshCw className="size-6" /></span>
            <div className="mt-4 text-lg font-bold">محطة المزامنة</div>
            <p className="mt-1 flex-1 text-sm text-muted">مزامنة بيانات المحطات بين حواسيب المدرسة: بملف مزامنة، أو تلقائياً عبر الخادم أو الشبكة المحلية.</p>
            <span className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white group-hover:bg-violet-700">
              الدخول <ArrowLeft className="size-4" />
            </span>
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-line pt-6 text-center">
          <div className="text-sm font-semibold">للاشتراك والتفعيل والدعم الفني</div>
          <a href="tel:07803993585" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-base font-bold tabular-nums shadow-[var(--shadow-card)]">
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
