"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Plus, Search, Pencil, Trash2, Users, Printer } from "lucide-react";
import {
  getStudents, saveStudents, getSections, getLevels, sectionLabel, nextStudentNo, STUDENT_STATUS,
  type Student, type StudentStatus,
} from "@/lib/school/store";
import { newId, todayYmd } from "@/lib/local/util";
import { PageTitle, Field, Modal, Empty, inp, card, btnPrimary, btnGhost, useLive } from "@/components/school/ui";

const blank = (): Student => ({ id: "", no: "", name: "", gender: "m", status: "active", enrolledAt: todayYmd() });

export default function StudentsPage() {
  const [data, reload] = useLive(() => ({ students: getStudents(), sections: getSections(), levels: getLevels() }), { students: [] as Student[], sections: [], levels: [] } as ReturnType<typeof read>);
  const { students, sections, levels } = data;
  const [q, setQ] = useState(""); const [sec, setSec] = useState(""); const [status, setStatus] = useState<"" | StudentStatus>("active");
  const [edit, setEdit] = useState<Student | null>(null);
  const [bulk, setBulk] = useState(false);
  const [limit, setLimit] = useState(50);

  const norm = (t: string) => t.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
  const shown = useMemo(() => students.filter((s) =>
    (!status || s.status === status) && (!sec || (sec === "none" ? !s.sectionId : s.sectionId === sec)) &&
    (!q.trim() || norm(`${s.name} ${s.no} ${s.guardian ?? ""} ${s.phone ?? ""}`).includes(norm(q.trim())))), [students, q, sec, status]);

  const put = (v: Student[]) => { saveStudents(v); reload(); };
  function save(s: Student) {
    if (!s.name.trim()) return;
    const rec = { ...s, name: s.name.trim(), no: s.no.trim() || nextStudentNo(), id: s.id || newId() };
    if (rec.status !== "active" && !rec.leftAt) rec.leftAt = todayYmd();
    put(s.id ? students.map((x) => x.id === s.id ? rec : x) : [...students, rec]);
    setEdit(null);
  }
  function remove(s: Student) { if (window.confirm(`حذف الطالب «${s.name}» نهائياً؟ (للانسحاب استعمل حالة «منسحب» لتبقى سجلاته)`)) put(students.filter((x) => x.id !== s.id)); }

  return (
    <div>
      <PageTitle icon={<GraduationCap className="size-6 text-brand" />} title="سجل الطلاب" sub={`${students.filter((s) => s.status === "active").length} طالب مستمر من ${students.length}`}>
        <button onClick={() => window.print()} className={btnGhost}><Printer className="size-4" /> طباعة القائمة</button>
        <button onClick={() => setBulk(true)} className={btnGhost}><Users className="size-4" /> إضافة جماعية</button>
        <button onClick={() => setEdit(blank())} className={btnPrimary}><Plus className="size-4" /> طالب جديد</button>
      </PageTitle>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1"><Search className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو الرقم أو ولي الأمر…" className={`${inp} ps-9`} /></div>
        <select value={sec} onChange={(e) => setSec(e.target.value)} className={`max-w-56 ${inp}`}>
          <option value="">كل الشعب</option><option value="none">بلا شعبة</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s, levels)}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as "" | StudentStatus)} className={`max-w-40 ${inp}`}>
          <option value="">كل الحالات</option>{(Object.keys(STUDENT_STATUS) as StudentStatus[]).map((k) => <option key={k} value={k}>{STUDENT_STATUS[k]}</option>)}
        </select>
      </div>
      {!shown.length ? <Empty>{students.length ? "لا نتائج مطابقة." : "لا طلاب بعد. أضف طالباً أو استعمل «إضافة جماعية» للصق قائمة أسماء."}</Empty> : (
        <div className={`${card} overflow-x-auto !p-0`}>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line bg-canvas text-start text-xs text-muted">
              <th className="p-3 text-start">رقم</th><th className="p-3 text-start">الاسم</th><th className="p-3 text-start">الشعبة</th><th className="p-3 text-start">ولي الأمر</th><th className="p-3 text-start">الهاتف</th><th className="p-3 text-start">الحالة</th><th className="no-print p-3" />
            </tr></thead>
            <tbody>
              {shown.slice(0, limit).map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
                  <td className="p-3 tabular-nums">{s.no}</td>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{sectionLabel(sections.find((x) => x.id === s.sectionId), levels)}</td>
                  <td className="p-3">{s.guardian || "—"}</td>
                  <td className="p-3 tabular-nums" dir="ltr">{s.phone || "—"}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "active" ? "bg-brand-light text-brand-dark" : "bg-canvas text-muted"}`}>{STUDENT_STATUS[s.status]}</span></td>
                  <td className="no-print p-3"><div className="flex justify-end gap-1">
                    <button onClick={() => setEdit(s)} aria-label={`تعديل ${s.name}`} className="grid size-8 place-items-center rounded-lg border border-line hover:bg-canvas"><Pencil className="size-3.5" /></button>
                    <button onClick={() => remove(s)} aria-label={`حذف ${s.name}`} className="grid size-8 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length > limit && <div className="no-print border-t border-line p-3 text-center"><button onClick={() => setLimit((l) => l + 100)} className={btnGhost}>عرض المزيد ({shown.length - limit} متبقٍّ)</button></div>}
        </div>
      )}
      {edit && <StudentForm s={edit} onSave={save} onClose={() => setEdit(null)} />}
      {bulk && <BulkAdd onClose={() => { setBulk(false); reload(); }} />}
    </div>
  );
}
function read() { return { students: getStudents(), sections: getSections(), levels: getLevels() }; }

function StudentForm({ s, onSave, onClose }: { s: Student; onSave: (s: Student) => void; onClose: () => void }) {
  const [f, setF] = useState(s);
  const sections = getSections(); const levels = getLevels();
  const set = <K extends keyof Student>(k: K, v: Student[K]) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Modal title={s.id ? "تعديل طالب" : "طالب جديد"} onClose={onClose} wide>
      <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="grid gap-3 sm:grid-cols-2">
        <Field label="الاسم الرباعي *" className="sm:col-span-2"><input autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} className={inp} /></Field>
        <Field label="رقم القيد (فارغ = تلقائي)"><input dir="ltr" value={f.no} onChange={(e) => set("no", e.target.value)} className={inp} /></Field>
        <Field label="الجنس"><select value={f.gender} onChange={(e) => set("gender", e.target.value as "m" | "f")} className={inp}><option value="m">ذكر</option><option value="f">أنثى</option></select></Field>
        <Field label="تاريخ الميلاد"><input type="date" value={f.birth ?? ""} onChange={(e) => set("birth", e.target.value)} className={inp} /></Field>
        <Field label="محل الولادة"><input value={f.birthPlace ?? ""} onChange={(e) => set("birthPlace", e.target.value)} className={inp} /></Field>
        <Field label="الشعبة">
          <select value={f.sectionId ?? ""} onChange={(e) => set("sectionId", e.target.value || undefined)} className={inp}>
            <option value="">بلا شعبة</option>{sections.map((x) => <option key={x.id} value={x.id}>{sectionLabel(x, levels)}</option>)}
          </select>
        </Field>
        <Field label="الحالة"><select value={f.status} onChange={(e) => set("status", e.target.value as StudentStatus)} className={inp}>{(Object.keys(STUDENT_STATUS) as StudentStatus[]).map((k) => <option key={k} value={k}>{STUDENT_STATUS[k]}</option>)}</select></Field>
        <Field label="ولي الأمر"><input value={f.guardian ?? ""} onChange={(e) => set("guardian", e.target.value)} className={inp} /></Field>
        <Field label="صلة القرابة"><input value={f.relation ?? ""} onChange={(e) => set("relation", e.target.value)} placeholder="الأب / الأم / …" className={inp} /></Field>
        <Field label="هاتف ولي الأمر"><input dir="ltr" value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inp} /></Field>
        <Field label="هاتف آخر"><input dir="ltr" value={f.phone2 ?? ""} onChange={(e) => set("phone2", e.target.value)} className={inp} /></Field>
        <Field label="العنوان" className="sm:col-span-2"><input value={f.address ?? ""} onChange={(e) => set("address", e.target.value)} className={inp} /></Field>
        <Field label="رقم الهوية / البطاقة الموحدة"><input dir="ltr" value={f.nationalId ?? ""} onChange={(e) => set("nationalId", e.target.value)} className={inp} /></Field>
        <Field label="تاريخ التسجيل"><input type="date" value={f.enrolledAt} onChange={(e) => set("enrolledAt", e.target.value)} className={inp} /></Field>
        <Field label="ملاحظات صحية (أمراض مزمنة، حساسية…)" className="sm:col-span-2"><input value={f.health ?? ""} onChange={(e) => set("health", e.target.value)} className={inp} /></Field>
        <Field label="ملاحظات" className="sm:col-span-2"><textarea rows={2} value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className={inp} /></Field>
        <div className="flex gap-2 sm:col-span-2"><button className={btnPrimary}>{s.id ? "حفظ التعديل" : "إضافة الطالب"}</button><button type="button" onClick={onClose} className={btnGhost}>إلغاء</button></div>
      </form>
    </Modal>
  );
}

function BulkAdd({ onClose }: { onClose: () => void }) {
  const sections = getSections(); const levels = getLevels();
  const [text, setText] = useState(""); const [sectionId, setSectionId] = useState("");
  const names = text.split("\n").map((l) => l.trim()).filter(Boolean);
  function add() {
    const list = getStudents(); const today = todayYmd();
    const added: Student[] = names.map((name) => ({ id: newId(), no: nextStudentNo(), name, gender: "m", status: "active", enrolledAt: today, ...(sectionId ? { sectionId } : {}) }));
    saveStudents([...list, ...added]); onClose();
  }
  return (
    <Modal title="إضافة جماعية" onClose={onClose}>
      <p className="mb-2 text-xs text-muted">ألصق الأسماء، اسم في كل سطر (من ملف Excel أو Word). تُنشأ لهم أرقام قيد تلقائية ويكمل الباقي لاحقاً من ملف كل طالب.</p>
      <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className={`mb-2 ${inp}`}>
        <option value="">بلا شعبة</option>{sections.map((x) => <option key={x.id} value={x.id}>{sectionLabel(x, levels)}</option>)}
      </select>
      <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} className={inp} placeholder={"أحمد علي حسن محمد\nزينب كاظم جاسم حميد"} />
      <div className="mt-3 flex items-center gap-2"><button disabled={!names.length} onClick={add} className={btnPrimary}>إضافة {names.length} طالب</button><button onClick={onClose} className={btnGhost}>إلغاء</button></div>
    </Modal>
  );
}
