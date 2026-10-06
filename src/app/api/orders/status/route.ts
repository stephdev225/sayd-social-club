import { NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { getOrderBySession } from "@/lib/data/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Polled by the confirmation page until the webhook has marked the order paid. Read-only. */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!rateLimit(`status:${clientIp(request)}`, 120, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const order = await getOrderBySession(getStore(), sessionId);
  if (!order) return NextResponse.json({ status: "unknown" }, { status: 404 });
  return NextResponse.json({ status: order.status }, { headers: { "cache-control": "no-store" } });
}
