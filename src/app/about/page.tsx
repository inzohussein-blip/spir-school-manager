import Link from "next/link";
import { ArrowRight, Phone, Rocket, HelpCircle, ShieldCheck, Layers, School, ArrowLeft } from "lucide-react";
import { SCHOOL_STATIONS } from "@/lib/school/stations";

export const metadata = { title: "عن التطبيق — سبير إدارة المدارس" };

const STEPS = [
  ["الإعداد", "من محطة «الإعداد»: اكتب اسم المدرسة واختر نوعها (حكومية أو أهلية)، أنشئ العام الدراسي، حمّل المنهج العراقي الافتراضي وعدّله، وحدّد الحصص."],
  ["الصفوف والشعب", "من «الصفوف والفصول»: أنشئ الشعب (أ، ب…) لكل صف وحدّد سعتها."],
  ["المدرسون", "من «الكادر التدريسي»: أضف المدرسين مع موادهم ونصابهم الأسبوعي."],
  ["الطلاب", "من «الطلاب والتسجيل»: سجّل الطلاب (أو ألصق قائمة أسماء) ووزّعهم على الشعب."],
  ["الجداول", "من «جدول الشعبة»: انقر الخانات لتعيين المادة والمدرس؛ يكشف النظام التعارض، ثم اطبع جداول الشعب والمدرسين."],
  ["الدرجات والشهادات", "من «النتائج والشهادات»: اضبط قواعد التقويم، أدخل الدرجات، راجع الكشف، ثم اطبع الشهادات لطالب أو لمجموعة."],
] as const;
const FAQ = [
  ["أين تُحفظ البيانات؟", "على هذا الحاسوب نفسه داخل المتصفح، وتعمل المحطات بلا إنترنت. أخذ نسخة احتياطية دورية من «الإعدادات ← النسخ الاحتياطي» ضروري، فمسح بيانات المتصفح يحذف البيانات."],
  ["هل تتشارك المحطات البيانات؟", "نعم؛ كل المحطات على الحاسوب نفسه تقرأ الملف المدرسي نفسه، فالطالب أو المدرس يُكتب مرة واحدة."],
  ["كيف أنقل البيانات إلى حاسوب آخر؟", "من «محطة المزامنة»: صدّر ملف مزامنة من حاسوب وأدخله في الآخر، أو استعمل نسخة احتياطية كاملة من إعدادات أي محطة."],
  ["هل المدرسة الحكومية تحتاج محطة الأقساط؟", "لا. محطة الأقساط للمدارس الأهلية؛ تظهر ملاحظة في المحطة إن كانت المدرسة مضبوطة حكومية."],
  ["هل الشهادات بالصيغة الرسمية للوزارة؟", "القوالب قابلة للتعديل (النص والعنوان والاتجاه)، لكنها ليست الصيغة الرسمية الجاهزة. راجع الجهة المختصة قبل اعتماد أي شهادة."],
  ["نسيت رمز الدخول (PIN) لمحطة", "يعيّنه المالك أو يزيله من مدير الرموز، ثم يأخذه الجهاز بـ«نسيت الرمز؟ ← تحديث من المزوّد»."],
] as const;
const card = "rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)]";
const h2 = "mb-3 flex items-center gap-2 text-xl font-bold";

export default function AboutPage() {
  return (
    <div className="about school-st min-h-screen bg-canvas">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between rounded-[28px] bg-surface px-5 py-3 shadow-[var(--shadow-card)]">
          <Link href="/welcome" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowRight className="size-4" /> الصفحة الرئيسية</Link>
          <div className="flex items-center gap-2 font-extrabold"><span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white"><School className="size-5" /></span> سبير</div>
        </header>

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#14733f] to-[#0b4527] p-7 text-white shadow-[0_18px_30px_-16px_#0e5530]">
          <h1 className="text-3xl font-extrabold">عن التطبيق</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
            «سبير» منصة عربية لإدارة المدارس الحكومية والأهلية العراقية. تضم محطات مستقلة تعمل على حاسوب المدرسة بلا إنترنت وتتشارك ملفاً مدرسياً واحداً: الطلاب والصفوف والمدرسون والجداول والنتائج والشهادات والإجازات والعطل والخطط السنوية والأقساط.
          </p>
          <Link href="/welcome" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark">ابدأ الآن <ArrowLeft className="size-4" /></Link>
        </section>

        <section className="mt-8">
          <h2 className={h2}><Rocket className="size-5 text-brand" /> البدء السريع</h2>
          <ol className="grid gap-3 sm:grid-cols-2">{STEPS.map(([t, d], i) => (
            <li key={t} className={`${card} flex gap-3`}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-b from-brand to-brand-dark text-sm font-bold text-white">{i + 1}</span><span className="text-sm leading-7"><b>{t}.</b> {d}</span></li>))}</ol>
        </section>

        <section className="mt-8">
          <h2 className={h2}><Layers className="size-5 text-brand" /> المحطات</h2>
          <div className="grid gap-3 sm:grid-cols-2">{SCHOOL_STATIONS.map((s) => (
            <Link key={s.id} href={s.path} className={`${card} flex gap-3 transition-shadow hover:shadow-[var(--shadow-pop)]`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white"><s.icon className="size-5" /></span>
              <span><b className="block">{s.label}</b><span className="text-xs leading-6 text-muted">{s.desc}</span></span></Link>))}</div>
        </section>

        <section className="mt-8">
          <h2 className={h2}><ShieldCheck className="size-5 text-brand" /> نصائح</h2>
          <ul className={`${card} list-disc space-y-1.5 ps-10 text-sm leading-7`}>
            <li>خذ نسخة احتياطية أسبوعية على الأقل، واحتفظ بها خارج الحاسوب.</li>
            <li>فعّل رمز الدخول (PIN) للمحطات الحساسة كالنتائج والأقساط من إعدادات المحطة.</li>
            <li>اضبط العطل الرسمية مبكراً؛ فهي تدخل في الحضور وأرصدة الإجازات وأسابيع الخطة السنوية.</li>
            <li>راجع «التعارضات» بعد تعديل أي جدول، وراجع كشف النتائج قبل طباعة الشهادات.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className={h2}><HelpCircle className="size-5 text-brand" /> أسئلة شائعة</h2>
          <div className="grid gap-3">{FAQ.map(([q, a]) => (
            <details key={q} className={card}><summary className="cursor-pointer text-sm font-semibold">{q}</summary><p className="mt-2 text-sm leading-7 text-muted">{a}</p></details>))}</div>
        </section>

        <div className="mt-10 flex flex-col items-center gap-2 pt-4 text-center">
          <div className="text-sm font-semibold">للاشتراك والتفعيل والدعم الفني</div>
          <a href="tel:07803993585" className="inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 font-bold tabular-nums shadow-[var(--shadow-card)]"><Phone className="size-4 text-brand-dark" /> 07803993585</a>
        </div>
      </div>
    </div>
  );
}
