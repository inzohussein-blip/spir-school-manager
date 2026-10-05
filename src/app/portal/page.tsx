"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { School, LogIn, KeyRound, User, Lock } from "lucide-react";

const ERR: Record<string, string> = {
  bad_login: "بيانات الدخول غير صحيحة.", too_many: "محاولات كثيرة، حاول بعد قليل.", disabled: "لوحة الإنترنت غير مفعّلة على هذا الخادم.",
  stopped: "رمز المدرسة موقوف. تواصل مع الدعم.", expired: "انتهى اشتراك المدرسة. تواصل مع الدعم للتجديد.", no_portal: "رمز المدرسة لا يتضمن لوحة الإدارة على الإنترنت.",
  no_data: "لا بيانات للمدرسة على الخادم بعد: فعّل «المزامنة التلقائية» في حاسوب المدرسة.",
};
const field = "w-full rounded-2xl border border-line bg-canvas py-3 ps-11 pe-4 text-sm outline-none focus:border-brand";

export default function PortalLogin() {
  const router = useRouter();
  const [f, setF] = useState({ code: "", username: "", password: "" }); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/portal/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => null);
      if (d?.ok) router.replace("/portal/app/dashboard"); else setErr(ERR[d?.error ?? "bad_login"] ?? "تعذّر الدخول.");
    } catch { setErr("لا اتصال بالخادم."); }
    setBusy(false);
  }
  return (
    <div className="school-st grid min-h-screen place-items-center bg-canvas p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[28px] bg-surface p-7 shadow-[var(--shadow-pop)]">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_14px_26px_-12px_var(--color-brand)]"><School className="size-8" /></span>
          <h1 className="mt-4 text-2xl font-extrabold">لوحة الإدارة</h1>
          <p className="mt-1 text-sm text-muted">ادخل برمز مدرستك وحسابك.</p>
        </div>
        <div className="mt-6 grid gap-3">
          <div className="relative"><KeyRound className="pointer-events-none absolute start-4 top-3.5 size-4 text-muted" /><input dir="ltr" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="XXXX-XXXX-XXXX" aria-label="رمز المدرسة" autoComplete="off" className={field} /></div>
          <div className="relative"><User className="pointer-events-none absolute start-4 top-3.5 size-4 text-muted" /><input dir="ltr" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} placeholder="اسم المستخدم" aria-label="اسم المستخدم" autoComplete="username" className={field} /></div>
          <div className="relative"><Lock className="pointer-events-none absolute start-4 top-3.5 size-4 text-muted" /><input dir="ltr" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="كلمة المرور" aria-label="كلمة المرور" autoComplete="current-password" className={field} /></div>
        </div>
        {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
        <button disabled={busy || f.code.length < 8 || !f.username || !f.password} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand to-brand-dark px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_-8px_var(--color-brand)] disabled:opacity-50"><LogIn className="size-4" /> {busy ? "جارٍ الدخول…" : "دخول"}</button>
        <p className="mt-4 text-center text-[11px] leading-5 text-muted">عرض للقراءة فقط لبيانات المدرسة المتزامنة. حسابات الدخول تُنشأ من محطة «الإعداد ← حسابات الويب».</p>
      </form>
    </div>
  );
}
