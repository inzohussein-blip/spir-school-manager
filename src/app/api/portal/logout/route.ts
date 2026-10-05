import { NextResponse } from "next/server";
import { PORTAL_COOKIE } from "@/lib/portal/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAL_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
