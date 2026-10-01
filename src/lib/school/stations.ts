import {
  Settings2, GraduationCap, School, Users, Award, CalendarOff, ClipboardList, UserCheck, Banknote, type LucideIcon,
} from "lucide-react";
import type { LicenseModule } from "@/lib/license/modules";

/** The school stations with their look (shared by the welcome page, the code manager and the sync station).
 *  `tone` / `border` are written out in full so Tailwind can see them. */
export interface SchoolStation {
  id: Exclude<LicenseModule, "admin">;
  label: string;
  path: string;
  icon: LucideIcon;
  color: string;
  desc: string;
  /** Welcome-page card classes. */
  border: string; chip: string; grad: string; btn: string;
  /** Code-manager chip classes. */
  tone: string;
  /** Only meaningful for private (paid-tuition) schools. */
  privateOnly?: boolean;
}

export const SCHOOL_STATIONS: SchoolStation[] = [
  { id: "setup", label: "الإعداد والعام الدراسي", path: "/setup", icon: Settings2, color: "#0d9488",
    desc: "بيانات المدرسة ونوعها (حكومية / أهلية)، العام والفصول الدراسية، المراحل والصفوف والمواد، والحصص اليومية وأيام الدوام.",
    border: "border-teal-300 hover:border-teal-500", chip: "bg-teal-50 text-teal-700", grad: "from-teal-500 to-teal-700", btn: "bg-teal-600 group-hover:bg-teal-700",
    tone: "border-teal-300 bg-teal-50 text-teal-800" },
  { id: "students", label: "الطلاب والتسجيل", path: "/students", icon: GraduationCap, color: "#2563eb",
    desc: "ملف كل طالب وولي أمره، التسجيل والنقل والسحب، توزيع الطلاب على الشعب، والترفيع السنوي، وبطاقات الطلاب.",
    border: "border-blue-300 hover:border-blue-500", chip: "bg-blue-50 text-blue-700", grad: "from-blue-500 to-blue-700", btn: "bg-blue-600 group-hover:bg-blue-700",
    tone: "border-blue-300 bg-blue-50 text-blue-700" },
  { id: "classes", label: "الصفوف والفصول والجداول", path: "/classes", icon: School, color: "#d97706",
    desc: "الشعب الدراسية وسعتها ومربّيها، وجدول أسبوعي لكل فصل بالنقر مع كشف فوري لتعارض المدرسين والقاعات، وطباعته.",
    border: "border-amber-300 hover:border-amber-500", chip: "bg-amber-50 text-amber-700", grad: "from-amber-500 to-amber-700", btn: "bg-amber-600 group-hover:bg-amber-700",
    tone: "border-amber-300 bg-amber-50 text-amber-800" },
  { id: "teachers", label: "الكادر التدريسي وجدول المدرسين", path: "/teachers", icon: Users, color: "#0284c7",
    desc: "ملف المدرس واختصاصه ومواده ونصابه، جدول كل مدرس مشتق من جداول الفصول، أحمال الحصص، والبديل عند الغياب.",
    border: "border-sky-300 hover:border-sky-500", chip: "bg-sky-50 text-sky-700", grad: "from-sky-500 to-sky-700", btn: "bg-sky-600 group-hover:bg-sky-700",
    tone: "border-sky-300 bg-sky-50 text-sky-700" },
  { id: "results", label: "النتائج والشهادات", path: "/results", icon: Award, color: "#059669",
    desc: "إدخال الدرجات وحساب المعدل والرتبة والنجاح والدور الثاني، كشوف الدرجات، وطباعة شهادات التخرج والنجاح لطالب أو لمجموعة.",
    border: "border-emerald-300 hover:border-emerald-500", chip: "bg-emerald-50 text-emerald-700", grad: "from-emerald-500 to-emerald-700", btn: "bg-emerald-600 group-hover:bg-emerald-700",
    tone: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  { id: "leaves", label: "الإجازات والعطل", path: "/leaves", icon: CalendarOff, color: "#e11d48",
    desc: "تقويم العطل الرسمية والمدرسية، إجازات الكادر وأرصدتها، والإجازات المرضية والغياب للطلاب بتقرير طبي.",
    border: "border-rose-300 hover:border-rose-500", chip: "bg-rose-50 text-rose-700", grad: "from-rose-500 to-rose-700", btn: "bg-rose-600 group-hover:bg-rose-700",
    tone: "border-rose-300 bg-rose-50 text-rose-700" },
  { id: "plan", label: "الخطة السنوية", path: "/plan", icon: ClipboardList, color: "#4f46e5",
    desc: "خطة سنوية لكل مدرس ومادة وصف موزعة على أسابيع العام بعد خصم العطل، مع متابعة الإنجاز ونسبة تنفيذ المنهج.",
    border: "border-indigo-300 hover:border-indigo-500", chip: "bg-indigo-50 text-indigo-700", grad: "from-indigo-500 to-indigo-700", btn: "bg-indigo-600 group-hover:bg-indigo-700",
    tone: "border-indigo-300 bg-indigo-50 text-indigo-700" },
  { id: "attendance", label: "الحضور والغياب", path: "/attendance", icon: UserCheck, color: "#ea580c",
    desc: "تحضير يومي للشعبة (حاضر / غائب / متأخر / مجاز) وحضور الكادر، متكامل مع الإجازات والعطل.",
    border: "border-orange-300 hover:border-orange-500", chip: "bg-orange-50 text-orange-700", grad: "from-orange-500 to-orange-700", btn: "bg-orange-600 group-hover:bg-orange-700",
    tone: "border-orange-300 bg-orange-50 text-orange-800" },
  { id: "fees", label: "الأقساط الشهرية (الأهلية)", path: "/fees", icon: Banknote, color: "#65a30d", privateOnly: true,
    desc: "قسط كل صف وخصومات الإخوة، فواتير الشهر، السداد الجزئي والكامل، وصل قبض مطبوع، المتأخرون وملخص الإيراد.",
    border: "border-lime-400 hover:border-lime-600", chip: "bg-lime-50 text-lime-800", grad: "from-lime-500 to-lime-700", btn: "bg-lime-600 group-hover:bg-lime-700",
    tone: "border-lime-300 bg-lime-50 text-lime-800" },
];

export const stationById = (id: string) => SCHOOL_STATIONS.find((s) => s.id === id);
