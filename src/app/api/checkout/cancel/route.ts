import { NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { getOrderBySession } from "@/lib/data/orders";
import { stripe } from "@/lib/stripe/server";

/**
 * Called when the buyer comes back from Stripe with "cancel". Expires the Checkout
 * Session right away; Stripe then sends checkout.session.expired and the webhook
 * puts the seats back on sale (same idempotent path as a natural expiry).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { sessionId?: unknown } | null;
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const order = await getOrderBySession(getStore(), sessionId);
  if (!order || order.status !== "pending") return NextResponse.json({ ok: true });
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.status === "open") await stripe().checkout.sessions.expire(sessionId);
  } catch (err) {
    console.warn("[cancel] could not expire session", sessionId, err);
  }
  return NextResponse.json({ ok: true });
}
