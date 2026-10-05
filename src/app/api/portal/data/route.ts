import { NextResponse, type NextRequest } from "next/server";
import { PORTAL_COOKIE, readPortal } from "@/lib/portal/session";
import { filterFor, snapshotOf, usersIn } from "@/lib/portal/server";
import { licensingEnabled, licenseById } from "@/lib/license/server";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "cache-control": "no-store" } });

/** The school's records for this portal user's role (re-checks the code and the account every time). */
export async function GET(req: NextRequest) {
  if (!licensingEnabled()) return json({ ok: false, error: "disabled" }, 400);
  const s = await readPortal(req.cookies.get(PORTAL_COOKIE)?.value);
  if (!s) return json({ ok: false, error: "auth" }, 401);
  const row = await licenseById(s.lid);
  if (!row || row.status === "stopped" || row.expires_at == null || row.expires_at <= Date.now() || !row.modules.includes("admin")) return json({ ok: false, error: "auth" }, 401);
  try {
    const snap = await snapshotOf(s.lid);
    const u = usersIn(snap).find((x) => x.id === s.uid && x.active !== false);
    if (!u) return json({ ok: false, error: "auth" }, 401);
    return json({ ok: true, role: u.role, name: u.name, school: row.lab_name, expires: row.expires_at, data: filterFor(u.role, snap) });
  } catch { return json({ ok: false, error: "no_data" }, 502); }
}
