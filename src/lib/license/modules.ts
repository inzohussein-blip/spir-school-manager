/** What a school code can switch on (shared by the server, the stations and the code manager). */
export const LICENSE_MODULES = [
  { id: "setup", label: "الإعداد والعام الدراسي", path: "/setup" },
  { id: "students", label: "الطلاب والتسجيل", path: "/students" },
  { id: "classes", label: "الصفوف والفصول والجداول", path: "/classes" },
  { id: "teachers", label: "الكادر التدريسي وجدول المدرسين", path: "/teachers" },
  { id: "results", label: "النتائج والشهادات", path: "/results" },
  { id: "leaves", label: "الإجازات والعطل", path: "/leaves" },
  { id: "plan", label: "الخطة السنوية", path: "/plan" },
  { id: "attendance", label: "الحضور والغياب", path: "/attendance" },
  { id: "fees", label: "الأقساط الشهرية (الأهلية)", path: "/fees" },
  { id: "admin", label: "لوحة الإدارة الكاملة", path: "/" },
] as const;

export type LicenseModule = (typeof LICENSE_MODULES)[number]["id"];
export const MODULE_IDS = LICENSE_MODULES.map((m) => m.id) as LicenseModule[];
/** A new code gets the school stations; the full admin panel is switched on per code. */
export const DEFAULT_MODULES: LicenseModule[] = ["setup", "students", "classes", "teachers", "results", "leaves", "plan", "attendance", "fees"];
export const moduleLabel = (id: string) => LICENSE_MODULES.find((m) => m.id === id)?.label ?? id;
export const cleanModules = (v: unknown): LicenseModule[] =>
  Array.isArray(v) ? MODULE_IDS.filter((id) => v.includes(id)) : [...DEFAULT_MODULES];

/** Signed license carried by a device (JWT payload, ES256). */
export interface LicensePayload {
  lid: string;      // license id
  lab: string;      // lab name
  dev: string;      // device id it is bound to
  mods: LicenseModule[];
  until: number;    // expiry, ms since epoch
  iat?: number;
}

/** The admin-panel cookie (HS256, AUTH_SECRET) read by the middleware. */
export const ADMIN_LICENSE_COOKIE = "lab_lic_admin";
