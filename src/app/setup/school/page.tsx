"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Check } from "lucide-react";
import { getInfo, saveInfo, KIND_LABEL, type SchoolInfo, type SchoolKind } from "@/lib/school/store";
import { AR_DAYS } from "@/lib/local/util";
import { shrinkImage } from "@/lib/shrinkImage";
import { notifySaved } from "@/components/SettingsLayout";
import { PageTitle, Field, inp, card, btnGhost } from "@/components/school/ui";

const PROVINCES = ["بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "السليمانية", "دهوك", "كركوك", "الأنبار", "ديالى", "صلاح الدين", "بابل", "واسط", "ذي قار", "ميسان", "المثنى", "القادسية"];

export default function SchoolPage() {
  const [s, setS] = useState<SchoolInfo | null>(null);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => setS(getInfo()), []);
  if (!s) return null;
  const save = (patch: Partial<SchoolInfo>) => { const next = { ...s, ...patch }; setS(next); saveInfo(next); notifySaved(); };
  const text = (k: keyof SchoolInfo, placeholder?: string) => (
    <input value={String(s[k] ?? "")} placeholder={placeholder} className={inp}
      onChange={(e) => setS({ ...s, [k]: e.target.value })} onBlur={() => save({})} />
  );
  async function logo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = "";
    if (f) save({ logo: await shrinkImage(f, 400) });
  }
  return (
    <div>
      <PageTitle icon={<Building2 className="size-6 text-brand" />} title="بيانات المدرسة" sub="تظهر على كل المطبوعات: الجداول والشهادات والكشوف. كل حقل يُحفظ عند مغادرته." />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={card}>
          <div className="mb-3 text-sm font-semibold">نوع المدرسة</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(KIND_LABEL) as SchoolKind[]).map((k) => (
              <button key={k} type="button" aria-pressed={s.kind === k} onClick={() => save({ kind: k })}
                className={`rounded-xl border px-3 py-3 text-start ${s.kind === k ? "border-brand bg-brand-light" : "border-line hover:bg-canvas"}`}>
                <span className="flex items-center gap-1.5 text-sm font-semibold">{s.kind === k && <Check className="size-4 text-brand" />}{KIND_LABEL[k]}</span>
                <span className="mt-0.5 block text-[11px] text-muted">{k === "gov" ? "لا أقساط دراسية؛ تُخفى محطة الأقساط." : "أقساط شهرية على الطلاب، بمحطة الأقساط والفواتير."}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="اسم المدرسة *">{text("name", "مدرسة … الابتدائية")}</Field>
            <Field label="سطر فرعي (تحت الاسم)">{text("subtitle", "مديرية تربية …")}</Field>
            <Field label="المحافظة">
              <input list="provinces" value={s.province} className={inp} onChange={(e) => setS({ ...s, province: e.target.value })} onBlur={() => save({})} />
              <datalist id="provinces">{PROVINCES.map((p) => <option key={p} value={p} />)}</datalist>
            </Field>
            <Field label="المديرية / القضاء">{text("directorate")}</Field>
            <Field label="مدير المدرسة">{text("principal")}</Field>
            <Field label="هاتف المدرسة"><input dir="ltr" value={s.phone} className={inp} onChange={(e) => setS({ ...s, phone: e.target.value })} onBlur={() => save({})} /></Field>
            <Field label="نوع الدوام">
              <select value={s.gender} className={inp} onChange={(e) => save({ gender: e.target.value as SchoolInfo["gender"] })}>
                <option value="mixed">مختلطة</option><option value="boys">بنين</option><option value="girls">بنات</option>
              </select>
            </Field>
            <Field label="الفترة (اختياري)">{text("shift", "صباحية / مسائية")}</Field>
          </div>
          <Field label="سطر أسفل المطبوعات" className="mt-3">{text("footer", "العنوان أو شعار الوزارة…")}</Field>
        </div>
        <div className="grid content-start gap-5">
          <div className={card}>
            <div className="mb-3 text-sm font-semibold">أيام الدوام</div>
            <div className="flex flex-wrap gap-2">
              {AR_DAYS.map((d, i) => {
                const on = s.workDays.includes(i);
                return <button key={d} type="button" aria-pressed={on}
                  onClick={() => save({ workDays: on ? s.workDays.filter((x) => x !== i) : [...s.workDays, i].sort() })}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${on ? "border-brand bg-brand font-semibold text-white" : "border-line hover:bg-canvas"}`}>{d}</button>;
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted">تحدّد أعمدة الجداول والحضور (الدوام العراقي المعتاد: الأحد إلى الخميس).</p>
          </div>
          <div className={card}>
            <div className="mb-3 text-sm font-semibold">شعار المدرسة</div>
            <div className="flex items-center gap-4">
              <div className="grid size-24 place-items-center overflow-hidden rounded-xl border border-line bg-canvas text-xs text-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.logo ? <img src={s.logo} alt="" className="size-full object-contain" /> : "لا شعار"}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => file.current?.click()} className={btnGhost}>اختيار صورة</button>
                {s.logo && <button onClick={() => save({ logo: "" })} className={btnGhost}>إزالة</button>}
                <input ref={file} type="file" accept="image/*" onChange={logo} className="hidden" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
