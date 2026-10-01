"use client";

import { BarChart3 } from "lucide-react";
import { getTeachers, getTimetable, teacherLoad } from "@/lib/school/store";
import { PageTitle, Empty, card, useLive } from "@/components/school/ui";

export default function LoadPage() {
  const [d] = useLive(() => ({ teachers: getTeachers().filter((t) => t.active), tt: getTimetable() }), null);
  if (!d) return null;
  const rows = d.teachers.map((t) => ({ t, n: teacherLoad(d.tt, t.id) })).sort((a, b) => b.n - a.n);
  const sum = rows.reduce((n, r) => n + r.n, 0);
  return (
    <div>
      <PageTitle icon={<BarChart3 className="size-6 text-brand" />} title="أحمال الحصص" sub={`${sum} حصة أسبوعية مُسندة لـ ${rows.length} مدرس. الأحمر: فوق النصاب، والأصفر: دون النصاب.`} />
      {!rows.length ? <Empty>لا مدرسين.</Empty> : (
        <div className={`${card} grid gap-3`}>
          {rows.map(({ t, n }) => { const pct = Math.min(100, (n / Math.max(1, t.load)) * 100); const over = n > t.load; const under = n < t.load;
            return <div key={t.id}><div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium">{t.name}</span><span className="tabular-nums text-muted">{n} / {t.load}{over ? ` (+${n - t.load})` : under ? ` (−${t.load - n})` : ""}</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${over ? "bg-red-500" : under ? "bg-amber-400" : "bg-brand"}`} style={{ width: `${pct}%` }} /></div></div>; })}
        </div>
      )}
    </div>
  );
}
