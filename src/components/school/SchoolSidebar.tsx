"use client";

import {
  LayoutDashboard, Building2, CalendarRange, BookOpen, Clock, Settings, GraduationCap, ArrowUpCircle, School, CalendarDays, AlertTriangle,
  Users, BarChart3, Printer, type LucideIcon,
} from "lucide-react";
import { AppSidebar, type SideSection } from "@/components/local/AppSidebar";
import { stationById } from "@/lib/school/stations";
import type { LicenseModule } from "@/lib/license/modules";

type Id = Exclude<LicenseModule, "admin">;
const it = (href: string, label: string, hint: string, icon: LucideIcon, exact = false) => ({ href, label, hint, icon, exact });

/** Each station's pages. Stations whose pages are not built yet show only their home. */
const NAV: Partial<Record<Id, SideSection[]>> = {
  setup: [
    { title: "البداية", items: [it("/setup", "نظرة عامة", "ما أُنجز وما بقي", LayoutDashboard, true)] },
    { title: "الإعداد", items: [
      it("/setup/school", "بيانات المدرسة", "الاسم والنوع والترويسة", Building2),
      it("/setup/years", "العام والفصول الدراسية", "بداية العام ونهايته", CalendarRange),
      it("/setup/curriculum", "المراحل والصفوف والمواد", "المنهج وحصصه الأسبوعية", BookOpen),
      it("/setup/periods", "الحصص وأيام الدوام", "أوقات الحصص والاستراحة", Clock),
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
  teachers: [
    { title: "الكادر التدريسي", items: [
      it("/teachers", "المدرسون", "الملفات والاختصاص والنصاب", Users, true),
      it("/teachers/schedule", "جدول المدرس", "الجدول الأسبوعي وطباعته", CalendarDays),
      it("/teachers/load", "أحمال الحصص", "النصاب مقابل المُسند", BarChart3),
    ] },
    { title: "النظام", items: [it("/teachers/settings", "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] },
  ],
};

export function SchoolSidebar({ id }: { id: Id }) {
  const st = stationById(id)!;
  const sections = NAV[id] ?? [{ title: st.label, items: [it(st.path, st.label, "قيد الإنشاء", st.icon, true), it(`${st.path}/settings`, "الإعدادات", "النسخ الاحتياطي والمظهر", Settings)] }];
  return <AppSidebar appName={st.label} appTag="مدرسة · بلا إنترنت" icon={st.icon} sections={sections}
    footerNote="البيانات محفوظة على هذا الجهاز ومشتركة مع باقي محطات المدرسة." />;
}
