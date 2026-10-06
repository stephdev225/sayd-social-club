import { NextResponse } from "next/server";
import { z } from "zod";
import { authConfigured, createSession, roleForPassword } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ password: z.string().min(1).max(200), name: z.string().trim().min(1).max(40) });

export async function POST(request: Request) {
  if (!authConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!rateLimit(`login:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const role = roleForPassword(parsed.data.password);
  if (!role) {
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }
  await createSession(role, parsed.data.name);
  return NextResponse.json({ role });
}
