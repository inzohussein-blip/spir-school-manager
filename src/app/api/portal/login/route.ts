import { NextResponse, type NextRequest } from "next/server";
import { attemptsBlocked, noteAttempt, clearAttempts } from "@/lib/license/server";
import { ipOf } from "@/lib/license/owner";
import { portalLogin } from "@/lib/portal/server";
import { PORTAL_COOKIE, PORTAL_MAX_S, signPortal } from "@/lib/portal/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "cache-control": "no-store" } });

export async function POST(req: NextRequest) {
  const ip = ipOf(req.headers);
  if (await attemptsBlocked("portal", ip, 10)) return json({ ok: false, error: "too_many" }, 429);
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { /* empty */ }
  const code = String(b.code ?? ""), username = String(b.username ?? ""), password = String(b.password ?? "");
  if (code.length < 8 || !username || !password || password.length > 200) return json({ ok: false, error: "bad_login" }, 400);
  const r = await portalLogin(code, username, password);
  if (!r.ok) {
    if (r.error === "bad_login") { await noteAttempt("portal", ip); await new Promise((res) => setTimeout(res, 400)); }
    return json({ ok: false, error: r.error }, r.error === "disabled" ? 400 : 401);
  }
  await clearAttempts("portal", ip);
  const res = json({ ok: true, name: r.user.name, role: r.user.role, school: r.school });
  res.cookies.set(PORTAL_COOKIE, await signPortal({ lid: r.lid, uid: r.user.id, role: r.user.role, name: r.user.name }), {
    httpOnly: true, sameSite: "lax", secure: req.nextUrl.protocol === "https:", path: "/", maxAge: PORTAL_MAX_S,
  });
  return res;
}
