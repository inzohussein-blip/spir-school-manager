"use client";

import { stationById } from "@/lib/school/stations";
import { PageTitle, Empty } from "@/components/school/ui";

export default function Page() {
  const st = stationById("attendance")!;
  return (
    <div>
      <PageTitle icon={<st.icon className="size-6 text-brand" />} title={st.label} sub={st.desc} />
      <Empty>هذه المحطة قيد الإنشاء — تأتي في مرحلة قادمة من خطة المشروع (docs/SCHOOL_PLAN.md).</Empty>
    </div>
  );
}
