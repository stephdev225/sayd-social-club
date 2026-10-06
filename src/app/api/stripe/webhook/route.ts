import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStore } from "@/lib/data";
import { sendOrderConfirmation } from "@/lib/email/confirmation";
import { env } from "@/lib/env";
import { handlePaymentEvent } from "@/lib/services/fulfillment";
import { toPaymentEvent } from "@/lib/stripe/events";
import { stripe } from "@/lib/stripe/server";

/**
 * Stripe → our database. The ONLY place a payment is considered successful.
 * 1. Verify the signature on the raw body.
 * 2. Map the event, apply it idempotently (see services/fulfillment.ts).
 * 3. Send the confirmation email once (order.emailSentAt guards re-sends).
 * Any 5xx makes Stripe retry later, which is safe because processing is idempotent.
 */
export async function POST(request: Request) {
  if (!env.stripeWebhookSecret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const paymentEvent = toPaymentEvent(event);
  if (!paymentEvent) return NextResponse.json({ received: true, ignored: event.type });

  const store = getStore();
  try {
    const outcome = await handlePaymentEvent(store, paymentEvent);
    console.info(`[webhook] ${event.type} ${event.id} → ${outcome.result}`);

    if (outcome.result === "fulfilled") {
      try {
        await sendOrderConfirmation(store, outcome.order, outcome.tickets, outcome.event);
      } catch (err) {
        // The sale is recorded; a failed email must not make Stripe re-send the event.
        console.error(`[webhook] confirmation email failed for ${outcome.order.id}`, err);
      }
    }
    return NextResponse.json({ received: true, result: outcome.result });
  } catch (err) {
    console.error(`[webhook] processing failed for ${event.id}`, err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
