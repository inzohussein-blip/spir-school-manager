"use client";

import { useState } from "react";
import { Globe, Plus, Trash2, KeyRound, Copy, Check } from "lucide-react";
import { readLS, writeLS, newId } from "@/lib/local/util";
import { USERS_KEY, PBKDF2_ITER, ROLE_LABEL, ROLE_HINT, type PortalRole, type PortalUser } from "@/lib/portal/shared";
import { PageTitle, Modal, Field, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
/** PBKDF2-SHA256 in the browser; the server repeats it with the same salt to check a login. */
async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: PBKDF2_ITER, hash: "SHA-256" }, key, 256);
  return { salt: b64(salt), hash: b64(new Uint8Array(bits)) };
}

export default function PortalAccounts() {
  const [users, reload] = useLive(() => readLS<PortalUser[]>(USERS_KEY, []), [] as PortalUser[]);
  const [f, setF] = useState<{ id: string; name: string; username: string; role: PortalRole; password: string } | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [copied, setCopied] = useState(false);
  const url = typeof location !== "undefined" ? `${location.origin}/portal` : "/portal";
  const put = (v: PortalUser[]) => { writeLS(USERS_KEY, v); reload(); };

  async function save() {
    if (!f) return; setErr("");
    const username = f.username.trim().toLowerCase();
    if (!f.name.trim() || !/^[a-z0-9._-]{3,30}$/.test(username)) return setErr("اكتب الاسم واسم مستخدم من 3 إلى 30 حرفاً لاتينياً أو رقماً (. _ - مسموحة).");
    if (users.some((u) => u.username === username && u.id !== f.id)) return setErr("اسم المستخدم مستعمل.");
    if (!f.id && f.password.length < 8) return setErr("كلمة المرور 8 خانات على الأقل.");
    if (f.id && f.password && f.password.length < 8) return setErr("كلمة المرور 8 خانات على الأقل.");
    setBusy(true);
    try {
      const cred = f.password ? await hashPassword(f.password) : null;
      if (f.id) put(users.map((u) => u.id === f.id ? { ...u, name: f.name.trim(), username, role: f.role, ...(cred ?? {}) } : u));
      else put([...users, { id: newId(), name: f.name.trim(), username, role: f.role, ...cred!, active: true }]);
      setF(null);
    } catch { setErr("تعذّر تشفير كلمة المرور (يلزم اتصال آمن https أو localhost)."); }
    setBusy(false);
  }
  return (
    <div>
      <PageTitle icon={<Globe className="size-6" />} title="حسابات الويب" sub="من يدخل إلى لوحة الإدارة على الإنترنت (للقراءة فقط) وبأي صلاحية.">
        <button onClick={() => { setErr(""); setF({ id: "", name: "", username: "", role: "manager", password: "" }); }} className={btnPrimary}><Plus className="size-4" /> حساب جديد</button>
      </PageTitle>
      <div className={`${card} mb-5 text-sm leading-7`}>
        <p>رابط اللوحة: <b dir="ltr" className="select-all">{url}</b>
          <button onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="ms-2 inline-flex items-center gap-1 text-xs text-brand-dark">{copied ? <><Check className="size-3.5" /> نُسخ</> : <><Copy className="size-3.5" /> نسخ</>}</button></p>
        <p className="text-muted">يدخل المستخدم برمز المدرسة (رمز التفعيل) واسم المستخدم وكلمة المرور. تظهر في اللوحة بيانات الحواسيب التي فعّلت «المزامنة التلقائية» (محطة المزامنة)، ويلزم أن يتضمن رمز المدرسة «لوحة الإدارة الكاملة». كلمات المرور تُحفظ مشفّرة ولا يمكن استرجاعها؛ نسيانها يعني تعيين كلمة جديدة.</p>
      </div>
      <div className={`${card} overflow-x-auto !p-0`}>
        <table className="w-full text-sm"><thead><tr className="border-b border-line bg-canvas text-xs text-muted"><th className="p-3 text-start">الاسم</th><th className="p-3 text-start">المستخدم</th><th className="p-3 text-start">الصلاحية</th><th className="p-3 text-start">الحالة</th><th className="p-3" /></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id} className="border-b border-line last:border-0"><td className="p-3 font-medium">{u.name}</td><td className="p-3" dir="ltr">{u.username}</td><td className="p-3">{ROLE_LABEL[u.role]}</td>
              <td className="p-3"><button onClick={() => put(users.map((x) => x.id === u.id ? { ...x, active: x.active === false } : x))} className={`rounded-full px-2.5 py-0.5 text-xs ${u.active === false ? "bg-canvas text-muted" : "bg-brand-light text-brand-dark"}`}>{u.active === false ? "موقوف" : "فعّال"}</button></td>
              <td className="p-3"><div className="flex justify-end gap-1">
                <button onClick={() => { setErr(""); setF({ id: u.id, name: u.name, username: u.username, role: u.role, password: "" }); }} aria-label={`تعديل ${u.name}`} className="grid size-8 place-items-center rounded-lg border border-line hover:bg-canvas"><KeyRound className="size-4" /></button>
                <button onClick={() => window.confirm(`حذف حساب «${u.name}»؟`) && put(users.filter((x) => x.id !== u.id))} aria-label={`حذف ${u.name}`} className="grid size-8 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button></div></td></tr>))}
            {!users.length && <tr><td colSpan={5} className="p-6 text-center text-sm text-muted">لا حسابات بعد.</td></tr>}</tbody></table>
      </div>
      {f && (
        <Modal title={f.id ? "تعديل حساب" : "حساب ويب جديد"} onClose={() => setF(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="الاسم *"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inp} /></Field>
            <Field label="اسم المستخدم *"><input dir="ltr" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} placeholder="ali.hasan" className={inp} /></Field>
            <Field label="الصلاحية"><select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as PortalRole })} className={inp}>{(Object.keys(ROLE_LABEL) as PortalRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></Field>
            <Field label={f.id ? "كلمة مرور جديدة (اتركها فارغة للإبقاء)" : "كلمة المرور * (8 خانات فأكثر)"}><input type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={inp} /></Field>
          </div>
          <p className="mt-2 text-xs text-muted">{ROLE_HINT[f.role]}</p>
          {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
          <div className="mt-3 flex gap-2"><button disabled={busy} onClick={save} className={btnPrimary}>{busy ? "جارٍ الحفظ…" : "حفظ"}</button><button onClick={() => setF(null)} className={btnGhost}>إلغاء</button></div>
        </Modal>
      )}
    </div>
  );
}
