import type { SideSection } from "@/components/local/AppSidebar";
import type { LicenseModule } from "@/lib/license/modules";
import {
  LayoutDashboard, Building2, CalendarRange, BookOpen, Clock, Settings, GraduationCap, ArrowUpCircle, School, CalendarDays, AlertTriangle,
  Users, BarChart3, Printer, PenLine, Table2, CalendarOff, Plane, HeartPulse, UserCheck, ClipboardCheck, ClipboardList, FileBarChart,
  Banknote, Layers, FilePlus2, HandCoins, Award, SlidersHorizontal, KanbanSquare, RefreshCw, FileDown, Network, History, Globe, type LucideIcon,
} from "lucide-react";

type Id = Exclude<LicenseModule, "admin"> | "sync";
export const it = (href: string, label: string, hint: string, icon: LucideIcon, exact = false) => ({ href, label, hint, icon, exact });

/** Each station's pages. Stations whose pages are not built yet show only their home. */
export const NAV: Partial<Record<Id, SideSection[]>> = {
  sync: [
    { title: "المزامنة", items: [
      it("/sync", "نظرة عامة", "هذا الحاسوب وحالة المزامنة", LayoutDashboard, true),
      it("/sync/file", "المزامنة بملف", "تصدير ملف وإدخال ملف", FileDown),
      it("/sync/auto", "المزامنة التلقائية", "عبر الإنترنت أو الشبكة المحلية", Network),
      it("/sync/log", "سجل المزامنة", "ما صُدّر وما أُدخل", History),
    ] },
    { title: "الإدارة", items: [it("/sync/settings", "الإعدادات", "اسم الحاسوب والمحطات المشتركة", Settings)] },
  ],
  setup: [
    { title: "البداية", items: [it("/setup", "نظرة عامة", "ما أُنجز وما بقي", LayoutDashboard, true)] },
    { title: "الإعداد", items: [
      it("/setup/school", "بيانات المدرسة", "الاسم والنوع والترويسة", Building2),
      it("/setup/years", "العام والفصول الدراسية", "بداية العام ونهايته", CalendarRange),
      it("/setup/curriculum", "المراحل والصفوف والمواد", "المنهج وحصصه الأسبوعية", BookOpen),
      it("/setup/periods", "الحصص وأيام الدوام", "أوقات الحصص والاستراحة", Clock),
      it("/setup/portal", "حسابات الويب", "من يدخل لوحة الإنترنت", Globe),
    ] },
    { title: "النظام", items: [it("/setup/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
  students: [
    { title: "الطلاب", items: [
      it("/students", "سجل الطلاب", "التسجيل والبحث والملف", GraduationCap, true),
      it("/students/promote", "الترفيع السنوي", "نقل الطلاب للصف التالي", ArrowUpCircle),
    ] },
    { title: "النظام", items: [it("/students/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
  classes: [
    { title: "الصفوف والفصول", items: [
      it("/classes", "الشعب", "الصفوف والسعة والطلاب", School, true),
      it("/classes/timetable", "جدول الشعبة", "الجدول الأسبوعي", CalendarDays),
      it("/classes/print", "طباعة الجداول", "كل الشعب دفعة واحدة", Printer),
      it("/classes/conflicts", "التعارضات", "مدرس أو قاعة في مكانين", AlertTriangle),
    ] },
    { title: "النظام", items: [it("/classes/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
  results: [
    { title: "النتائج", items: [
      it("/results", "إدخال الدرجات", "درجات كل مادة وفصل", PenLine, true),
      it("/results/sheet", "كشف النتائج", "المعدل والرتبة والنجاح", Table2),
    ] },
    { title: "الشهادات", items: [it("/results/certificates", "الشهادات", "طباعة لطالب أو لمجموعة", Award)] },
    { title: "النظام", items: [
      it("/results/rules", "قواعد التقويم", "الدرجات والنجاح والتقديرات", SlidersHorizontal),
      it("/results/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings),
    ] },
  ],
  leaves: [
    { title: "العطل والإجازات", items: [
      it("/leaves", "تقويم العطل", "الرسمية والمدرسية", CalendarOff, true),
      it("/leaves/staff", "إجازات الكادر", "الأرصدة والموافقات", Plane),
      it("/leaves/students", "إجازات الطلاب", "المرضية والغياب بعذر", HeartPulse),
    ] },
    { title: "النظام", items: [it("/leaves/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
  attendance: [
    { title: "الحضور", items: [
      it("/attendance", "تحضير الشعبة", "يوم بيوم", ClipboardCheck, true),
      it("/attendance/staff", "حضور الكادر", "الدوام اليومي", UserCheck),
      it("/attendance/report", "تقرير الغياب", "شهري وإنذارات", BarChart3),
    ] },
    { title: "النظام", items: [it("/attendance/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
  plan: [
    { title: "الخطط السنوية", items: [
      it("/plan", "الخطط", "لكل مدرس ومادة وصف", ClipboardList, true),
      it("/plan/board", "لوحة المتابعة", "اسحب الوحدات بين المراحل", KanbanSquare),
      it("/plan/view", "محرّر الخطة", "الوحدات والأسابيع والإنجاز", PenLine),
      it("/plan/report", "تقرير التنفيذ", "المنجز مقابل المتوقع", FileBarChart),
    ] },
    { title: "النظام", items: [it("/plan/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
  fees: [
    { title: "الأقساط", items: [
      it("/fees", "نظرة عامة", "المستحق والمقبوض والمتأخرون", Banknote, true),
      it("/fees/pay", "تسجيل الدفعات", "كشف حساب ووصل قبض", HandCoins),
      it("/fees/charges", "مستحقات الشهر", "إنشاء القسط الشهري", FilePlus2),
      it("/fees/plans", "قسط الصفوف والخصومات", "الأسعار والتخفيضات", Layers),
    ] },
    { title: "النظام", items: [it("/fees/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
  teachers: [
    { title: "الكادر التدريسي", items: [
      it("/teachers", "المدرسون", "الملفات والاختصاص والنصاب", Users, true),
      it("/teachers/schedule", "جدول المدرس", "الجدول الأسبوعي وطباعته", CalendarDays),
      it("/teachers/load", "أحمال الحصص", "النصاب مقابل المُسند", BarChart3),
    ] },
    { title: "النظام", items: [it("/teachers/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
};

