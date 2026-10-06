import { NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { demoPaymentsEnabled } from "@/lib/demo";
import type { Order } from "@/lib/domain/types";
import { sendOrderConfirmation } from "@/lib/email/confirmation";
import { handlePaymentEvent } from "@/lib/services/fulfillment";

/**
 * DEMO ONLY (never in production): plays the role of Stripe + its webhook, so the
 * real fulfilment code runs exactly as it would after a test-mode payment.
 */
export async function GET(request: Request) {
  if (!demoPaymentsEnabled()) return NextResponse.json({ error: "not found" }, { status: 404 });
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id") ?? "";
  const orderId = url.searchParams.get("order") ?? "";
  const lang = url.searchParams.get("lang") === "en" ? "en" : "fr";
  const store = getStore();
  const order = await store.get<Order & Record<string, unknown>>("orders", orderId);
  if (!order || order.stripeCheckoutSessionId !== sessionId) return NextResponse.json({ error: "unknown order" }, { status: 404 });

  // Simulate webhook latency, then deliver the same event twice to show idempotency.
  setTimeout(async () => {
    const ev = {
      type: "session_paid" as const,
      eventId: `evt_demo_${orderId}`,
      sessionId,
      orderId,
      paymentIntentId: `pi_demo_${orderId}`,
      amountTotalCents: order.totalCents,
    };
    const first = await handlePaymentEvent(store, ev);
    const again = await handlePaymentEvent(store, ev);
    console.info(`[demo-pay] ${orderId}: ${first.result}, redelivery: ${again.result}`);
    if (first.result === "fulfilled") await sendOrderConfirmation(store, first.order, first.tickets, first.event);
  }, 2500);

  return NextResponse.redirect(new URL(`/${lang}/billetterie/confirmation?session_id=${sessionId}`, url.origin));
}
