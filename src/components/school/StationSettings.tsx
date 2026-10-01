"use client";

import { useRef, useState } from "react";
import { Settings, Download, Upload, HardDrive, ShieldCheck } from "lucide-react";
import { SyncPanel } from "@/components/local/SyncPanel";
import { ThemeCard } from "@/components/local/LocalTheme";
import { PinCard } from "@/components/local/PinGate";
import { SettingsLayout } from "@/components/SettingsLayout";
import { THEME_KEYS } from "@/lib/local/theme";
import { downloadJson, usageBytes, todayYmd } from "@/lib/local/util";
import { exportBackup, importBackup } from "@/lib/school/store";
import { stationById } from "@/lib/school/stations";
import type { LicenseModule } from "@/lib/license/modules";
import { card, btnGhost } from "./ui";

const PREFIXES = ["school.", "students.", "classes.", "teachers.", "results.", "leaves.", "plan.", "attendance.", "fees."];

/** The settings page every school station shares: backup of the school file, sync, PIN and appearance. */
export function StationSettings({ id }: { id: Exclude<LicenseModule, "admin"> }) {
  const st = stationById(id)!;
  const [msg, setMsg] = useState("");
  const [bytes, setBytes] = useState(() => PREFIXES.reduce((n, p) => n + usageBytes(p), 0));
  const ref = useRef<HTMLInputElement>(null);

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f || !window.confirm("ستُستبدل بيانات المدرسة بمحتوى الملف (ما في الملف يكتب فوق الموجود). متابعة؟")) return;
    try {
      const ok = importBackup(JSON.parse(await f.text()));
      setMsg(ok ? "تمت الاستعادة بنجاح." : "الملف ليس نسخة احتياطية لمنصة المدرسة.");
      if (ok) setBytes(PREFIXES.reduce((n, p) => n + usageBytes(p), 0));
    } catch { setMsg("تعذّرت قراءة الملف."); }
  }

  return (
    <SettingsLayout title={`إعدادات: ${st.label}`} icon={<Settings className="size-6 text-brand" />} sections={[
      {
        id: "device", label: "الجهاز والبيانات", hint: "النسخ الاحتياطي لكل بيانات المدرسة والمزامنة", icon: <HardDrive />,
        content: (
          <>
            <div className={card}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><HardDrive className="size-4" /> النسخ الاحتياطي</div>
              <p className="mb-3 text-xs text-muted">
                ملف واحد يضم بيانات كل محطات المدرسة (الطلاب والصفوف والمدرسين وغيرها). المساحة المستعملة: <b className="tabular-nums">{Math.max(1, Math.round(bytes / 1024))} KB</b>.
                البيانات محفوظة على هذا الجهاز فقط، فاحتفظ بنسخة دورية.
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { downloadJson(`school-backup-${todayYmd()}.json`, exportBackup()); setMsg("تم التصدير."); }} className={btnGhost}><Download className="size-4" /> تصدير نسخة</button>
                <button onClick={() => ref.current?.click()} className={btnGhost}><Upload className="size-4" /> استعادة من ملف</button>
                <input ref={ref} type="file" accept="application/json,.json" onChange={onImport} className="hidden" />
              </div>
              {msg && <p className="mt-2 text-xs text-brand-dark">{msg}</p>}
            </div>
            <SyncPanel />
          </>
        ),
      },
      {
        id: "look", label: "الأمان والمظهر", hint: "رمز الدخول والألوان", icon: <ShieldCheck />,
        content: (<><PinCard station={id} /><ThemeCard storageKey={THEME_KEYS[id]} /></>),
      },
    ]} />
  );
}
