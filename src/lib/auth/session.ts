import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Staff authentication for /admin and /scan.
 * Two shared passwords set in Vercel: ADMIN_PASSWORD (everything) and STAFF_PASSWORD
 * (door scanner only). A successful login sets an httpOnly, signed, 12-hour cookie.
 * The signing key is derived from the passwords, so changing a password logs everyone out.
 */
export type Role = "admin" | "staff";
const COOKIE = "sayd_staff";
const TTL_MS = 12 * 60 * 60 * 1000;

function key(): Buffer | null {
  const a = process.env.ADMIN_PASSWORD;
  if (!a || a.length < 10) return null; // refuse weak or missing configuration
  return createHash("sha256").update(`sayd:${a}:${process.env.STAFF_PASSWORD ?? ""}`).digest();
}

function sign(payload: string, k: Buffer): string {
  return createHmac("sha256", k).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function authConfigured(): boolean {
  return key() !== null;
}

/** Returns the role a password grants, or null. */
export function roleForPassword(password: string): Role | null {
  const admin = process.env.ADMIN_PASSWORD;
  const staff = process.env.STAFF_PASSWORD;
  if (admin && admin.length >= 10 && safeEqual(password, admin)) return "admin";
  if (staff && staff.length >= 8 && safeEqual(password, staff)) return "staff";
  return null;
}

export async function createSession(role: Role, name: string) {
  const k = key();
  if (!k) throw new Error("ADMIN_PASSWORD not configured");
  const payload = Buffer.from(JSON.stringify({ role, name: name.slice(0, 40), exp: Date.now() + TTL_MS })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, k)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<{ role: Role; name: string } | null> {
  const k = key();
  if (!k) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload, k))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { role: Role; name: string; exp: number };
    if (data.exp < Date.now()) return null;
    return { role: data.role, name: data.name };
  } catch {
    return null;
  }
}

/** Use in route handlers: returns the session if it has one of the roles. */
export async function requireRole(...roles: Role[]) {
  const s = await getSession();
  return s && roles.includes(s.role) ? s : null;
}
