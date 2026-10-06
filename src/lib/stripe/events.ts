import type Stripe from "stripe";
import type { PaymentEvent } from "@/lib/services/fulfillment";

function orderIdOf(session: Stripe.Checkout.Session): string | undefined {
  return session.metadata?.orderId ?? session.client_reference_id ?? undefined;
}

function paymentIntentId(pi: string | Stripe.PaymentIntent | null | undefined): string | undefined {
  if (!pi) return undefined;
  return typeof pi === "string" ? pi : pi.id;
}

/**
 * Maps a verified Stripe event to our PaymentEvent. Returns null for events we don't
 * handle (they are acknowledged with 200 so Stripe stops retrying).
 */
export function toPaymentEvent(event: Stripe.Event): PaymentEvent | null {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const s = event.data.object;
      const orderId = orderIdOf(s);
      if (!orderId) return null;
      if (s.payment_status === "paid" || s.payment_status === "no_payment_required") {
        return {
          type: "session_paid",
          eventId: event.id,
          sessionId: s.id,
          orderId,
          paymentIntentId: paymentIntentId(s.payment_intent),
          amountTotalCents: s.amount_total ?? 0,
        };
      }
      return { type: "session_awaiting_payment", eventId: event.id, sessionId: s.id, orderId };
    }
    case "checkout.session.async_payment_failed": {
      const s = event.data.object;
      const orderId = orderIdOf(s);
      return orderId ? { type: "session_failed", eventId: event.id, sessionId: s.id, orderId } : null;
    }
    case "checkout.session.expired": {
      const s = event.data.object;
      const orderId = orderIdOf(s);
      return orderId ? { type: "session_expired", eventId: event.id, sessionId: s.id, orderId } : null;
    }
    case "charge.refunded": {
      const c = event.data.object;
      const pi = paymentIntentId(c.payment_intent);
      return pi ? { type: "charge_refunded", eventId: event.id, paymentIntentId: pi, fullyRefunded: c.refunded } : null;
    }
    default:
      return null;
  }
}

export const HANDLED_STRIPE_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
] as const;
