import { SignJWT, jwtVerify } from "jose";

/** The web portal's session cookie: HS256 with AUTH_SECRET, 8 hours. */
export const PORTAL_COOKIE = "school_portal";
export const PORTAL_MAX_S = 8 * 3600;
import type { PortalRole } from "./shared";
export interface PortalSession { lid: string; uid: string; role: PortalRole; name: string }
const DEV_KEY = "dev-insecure-key-change-me-in-production-00000000";
const secret = () => new TextEncoder().encode("school-portal:" + (process.env.AUTH_SECRET || DEV_KEY));

export async function signPortal(s: PortalSession): Promise<string> {
  return new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${PORTAL_MAX_S}s`).sign(secret());
}
export async function readPortal(token: string | undefined): Promise<PortalSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = payload.role;
    if (typeof payload.lid !== "string" || typeof payload.uid !== "string" || (role !== "manager" && role !== "accountant" && role !== "teacher")) return null;
    return { lid: payload.lid, uid: payload.uid, role, name: String(payload.name ?? "") };
  } catch { return null; }
}
