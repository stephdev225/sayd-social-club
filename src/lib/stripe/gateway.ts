import "server-only";
import { env } from "@/lib/env";
import type { PaymentGateway } from "@/lib/services/checkout";
import { stripe } from "./server";

/** Stripe Checkout implementation of the PaymentGateway port. */
export const stripeGateway: PaymentGateway = {
  async createCheckoutSession({ orderId, eventName, lines, taxLines, customerEmail, locale, expiresAt }) {
    const base = `${env.siteUrl}/${locale}/billetterie`;
    const session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        locale: locale === "fr" ? "fr-CA" : "en",
        customer_email: customerEmail,
        client_reference_id: orderId,
        metadata: { orderId },
        payment_intent_data: { metadata: { orderId }, description: `Sayd Social Club — ${eventName}` },
        line_items: [
          ...lines.map((l) => ({
            quantity: l.quantity,
            price_data: {
              currency: "cad",
              unit_amount: l.unitAmountCents,
              product_data: { name: `${eventName} — ${l.name}` },
            },
          })),
          ...taxLines.map((t) => ({
            quantity: 1,
            price_data: { currency: "cad", unit_amount: t.amountCents, product_data: { name: t.name } },
          })),
        ],
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        success_url: `${base}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/confirmation?session_id={CHECKOUT_SESSION_ID}&cancelled=1`,
      },
      { idempotencyKey: `checkout-${orderId}` },
    );
    if (!session.url) throw new Error("Stripe returned a session without URL");
    return { id: session.id, url: session.url };
  },
};
