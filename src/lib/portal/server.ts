import "server-only";
import { pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { findLicenseByCode, licensingEnabled } from "@/lib/license/server";
import { companyPlace } from "@/lib/sync/company";
import { USERS_KEY, PBKDF2_ITER, type PortalRole, type PortalUser } from "./shared";

/**
 * The school's web portal: a read-only view of the data its computers keep in the school's own
 * place (the same records the stations sync). Users and roles are set by the school in the setup
 * station («حسابات الويب») and travel in that data (only their password hashes).
 */

/** Every record of the school as one value per key, like the browsers hold them. */
export async function snapshotOf(lid: string): Promise<Record<string, string>> {
  const { q } = await companyPlace(lid);
  const r = await q.query(`select coll, id, data, ord from lab_sync_records where not deleted and coll not like 'backup.%' order by coll, ord`);
  const lists = new Map<string, unknown[]>(); const whole = new Map<string, unknown>();
  for (const x of r.rows) {
    const coll = String(x.coll);
    if (String(x.id) === "_") whole.set(coll, x.data);
    else (lists.get(coll) ?? lists.set(coll, []).get(coll)!).push(x.data);
  }
  const out: Record<string, string> = {};
  for (const [k, v] of lists) out[k] = JSON.stringify(v);
  for (const [k, v] of whole) out[k] = typeof v === "string" ? v : JSON.stringify(v);
  return out;
}

export function usersIn(snap: Record<string, string>): PortalUser[] {
  try { const v = JSON.parse(snap[USERS_KEY] ?? "[]"); return Array.isArray(v) ? (v as PortalUser[]) : []; } catch { return []; }
}
export function passwordOk(u: PortalUser, password: string): boolean {
  try {
    const got = pbkdf2Sync(password, Buffer.from(u.salt, "base64"), PBKDF2_ITER, 32, "sha256");
    const want = Buffer.from(u.hash, "base64");
    return got.length === want.length && timingSafeEqual(got, want);
  } catch { return false; }
}

export type LoginResult = { ok: true; lid: string; user: PortalUser; school: string } | { ok: false; error: "disabled" | "bad_code" | "stopped" | "expired" | "no_portal" | "no_data" | "bad_login" };
export async function portalLogin(code: string, username: string, password: string): Promise<LoginResult> {
  if (!licensingEnabled()) return { ok: false, error: "disabled" };
  const row = await findLicenseByCode(code);
  // The same answer for a wrong code and a wrong user, so neither can be probed apart.
  if (!row) return { ok: false, error: "bad_login" };
  if (row.status === "stopped") return { ok: false, error: "stopped" };
  if (row.expires_at == null || row.expires_at <= Date.now()) return { ok: false, error: "expired" };
  if (!row.modules.includes("admin")) return { ok: false, error: "no_portal" };
  let snap: Record<string, string>;
  try { snap = await snapshotOf(row.id); } catch { return { ok: false, error: "no_data" }; }
  const u = usersIn(snap).find((x) => x.username.trim().toLowerCase() === username.trim().toLowerCase() && x.active !== false);
  // Do the hashing work even for an unknown user (no timing difference).
  if (!u) { passwordOk({ id: "", username: "", name: "", role: "teacher", salt: "AAAAAAAAAAAAAAAAAAAAAA==", hash: "AA==" }, password); return { ok: false, error: "bad_login" }; }
  if (!passwordOk(u, password)) return { ok: false, error: "bad_login" };
  let school = row.lab_name;
  try { const i = JSON.parse(snap["school.settings.v1"] ?? "{}"); if (i?.name) school = String(i.name); } catch { /* keep */ }
  return { ok: true, lid: row.id, user: u, school };
}

/** What each role may see (key prefixes); the users' file is never sent. */
const ALLOW: Record<PortalRole, (k: string) => boolean> = {
  manager: () => true,
  accountant: (k) => /^(school\.|students\.|fees\.|teachers\.list|classes\.sections|leaves\.holidays|attendance\.)/.test(k),
  teacher: (k) => /^(school\.|students\.|classes\.|teachers\.|plan\.|results\.|attendance\.|leaves\.)/.test(k),
};
export function filterFor(role: PortalRole, snap: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(snap)) {
    if (k === USERS_KEY || !ALLOW[role](k)) continue;
    // Salaries are for managers and accountants only.
    if (role === "teacher" && k === "teachers.list.v1") {
      try { out[k] = JSON.stringify((JSON.parse(v) as Record<string, unknown>[]).map(({ salary: _s, ...t }) => t)); continue; } catch { continue; }
    }
    out[k] = v;
  }
  return out;
}
