"use client";

import { Palette, Building2, ShieldCheck, Scale, ChevronDown } from "lucide-react";
import { SiteThemeSwitch } from "@/components/local/LocalTheme";

const card = "rounded-2xl border border-line bg-surface p-5 text-start shadow-[var(--shadow-card)]";

/** One policy, folded under its title (open to read). */
function Policy({ id, icon, title, children }: { id: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <details className={`${card} group`} data-testid={id}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span className="[&>svg]:size-4 text-brand-dark">{icon}</span> {title}
        <ChevronDown className="ms-auto size-4 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-2 text-xs leading-6 text-muted">{children}</div>
    </details>
  );
}

/**
 * The bottom of the welcome page: the appearance (light / dark / the computer's), who SPIR is,
 * and the privacy policy and disclaimer.
 */
export function WelcomeFooter() {
  return (
    <div className="mt-8 grid items-start gap-4 md:grid-cols-2" data-testid="welcome-footer">
      <div className={card} data-testid="welcome-theme">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Palette className="size-4 text-brand-dark" /> المظهر</div>
        <p className="mb-3 text-xs text-muted">فاتح أو غامق، أو تلقائي حسب إعداد الجهاز. تتبعه كل محطة مضبوطة على «تلقائي» في إعداداتها.</p>
        <SiteThemeSwitch />
      </div>

      <div className={card} data-testid="about-spir">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Building2 className="size-4 text-brand-dark" /> عن SPIR</div>
        <p className="text-xs leading-6 text-muted">
          <b className="text-ink">SPIR</b> شركة برمجة متخصصة في تطوير الأنظمة والتطبيقات، ومنها منظومة إدارة المدارس هذه:
          محطات تعمل على حاسوب المدرسة بدون إنترنت، ولوحة إدارة كاملة، مع التفعيل والتحديثات والدعم الفني.
        </p>
      </div>

      <Policy id="privacy" icon={<ShieldCheck />} title="سياسة الخصوصية">
        <p>بيانات المحطات (الطلاب والنتائج والجداول والكادر والإجازات والأقساط وغيرها) تُحفظ على جهاز المدرسة نفسه، ولا تُرسل إلى أي جهة.</p>
        <p>عند تفعيل رمز المدرسة يتصل الجهاز بالخادم للتحقق من الاشتراك فقط (الرمز ومعرّف الجهاز وإصدار البرنامج)، دون أي بيانات عن الطلاب أو الكادر.</p>
        <p>المزامنة بين حواسيب المدرسة لا تعمل إلا إذا فعّلتها المدرسة بنفسها، وتُرسل البيانات حينها إلى مكان المدرسة الخاص فقط.</p>
        <p>لا نبيع أي بيانات ولا نشاركها مع أي طرف. المدرسة مسؤولة عن حماية أجهزتها ونسخها الاحتياطية وعن حقوق وصول موظفيها، وعن بيانات الطلاب القاصرين وفق القوانين المعمول بها.</p>
        <p className="text-[11px]">آخر تحديث: <span dir="ltr">2026-10-01</span></p>
      </Policy>

      <Policy id="disclaimer" icon={<Scale />} title="إخلاء المسؤولية">
        <p className="font-semibold text-ink">نحن لا نتحمل أي مسؤولية.</p>
        <p>يُقدَّم البرنامج «كما هو» أداةً مساعدة لتنظيم عمل المدرسة، ولا تتحمل SPIR أي مسؤولية عن:</p>
        <ul className="list-disc space-y-1 ps-5">
          <li>صحة الدرجات والمعدلات والنتائج المُدخلة أو المحسوبة أو المطبوعة، وقواعد النجاح والدور الثاني التي تضبطها المدرسة؛</li>
          <li>مطابقة الشهادات والكشوف المطبوعة للصيغ الرسمية المعتمدة لدى وزارة التربية أو الجهات المختصة؛</li>
          <li>المنهج الافتراضي وحصصه الأسبوعية، وهو نقطة بداية تقريبية تعدّلها المدرسة وفق التعليمات الرسمية؛</li>
          <li>فقدان البيانات أو تلفها لأي سبب، بما فيه عدم أخذ نسخة احتياطية؛</li>
          <li>أي ضرر مباشر أو غير مباشر ينتج عن استخدام البرنامج أو تعذّر استخدامه.</li>
        </ul>
        <p>مراجعة النتائج والشهادات واعتمادها مسؤولية إدارة المدرسة والجهة المختصة وحدهما. استخدام البرنامج يعني الموافقة على ذلك.</p>
        <p className="text-[11px]">آخر تحديث: <span dir="ltr">2026-10-01</span></p>
      </Policy>
    </div>
  );
}
