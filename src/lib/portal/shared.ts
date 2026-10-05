/** What the school's computers and the web portal both know about portal accounts. */
export const USERS_KEY = "school.portalUsers.v1";
export const PBKDF2_ITER = 120_000;
export type PortalRole = "manager" | "accountant" | "teacher";
export const ROLE_LABEL: Record<PortalRole, string> = { manager: "مدير", accountant: "محاسب", teacher: "مدرس" };
export const ROLE_HINT: Record<PortalRole, string> = {
  manager: "يرى كل شيء: الطلاب والكادر والنتائج والحضور والخطط والأقساط.",
  accountant: "يرى الطلاب والأقساط والمدفوعات وقوائم الكادر مع الرواتب.",
  teacher: "يرى الطلاب والجداول والنتائج والحضور والخطط، دون الأقساط والرواتب.",
};
export interface PortalUser { id: string; username: string; name: string; role: PortalRole; salt: string; hash: string; active?: boolean }
