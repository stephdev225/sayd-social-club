# Stripe

Account: Sayd's own Stripe account (no Connect: Sayd sells its own tickets, money lands directly in the account).
Mode: **test** until the full test plan passes. `lib/env.ts` refuses `sk_live_` keys unless `STRIPE_ALLOW_LIVE=true`.

## Flow

1. `POST /api/checkout` validates input (Zod), rate-limits, then `startCheckout()`:
   - **one Firestore transaction**: read event + ticket types, check stock (`total - sold - reserved`),
     create/update customer, create `orders/{id}` `pending` with `expiresAt = now + 35 min`, `reserved += q`;
   - create the Checkout Session: line items priced **from the database**, GST + QST tax rates (exclusive),
     `metadata.orderId`, `client_reference_id`, `expires_at`, idempotency key `checkout-{orderId}`;
   - if Stripe fails, the reservation is released.
2. Buyer pays on Stripe.
3. `POST /api/stripe/webhook`: signature verified with `STRIPE_WEBHOOK_SECRET` on the raw body, event mapped
   (`lib/stripe/events.ts`), applied by `handlePaymentEvent()` (`lib/services/fulfillment.ts`).
4. `/[lang]/billetterie/confirmation?session_id=…` reads the order and polls `/api/orders/status` until paid.
   It never marks anything paid.

## Events handled

| Stripe event | Effect |
|---|---|
| `checkout.session.completed` (paid) | order `paid`, payment, 1 ticket per seat, `reserved → sold`, email |
| `checkout.session.completed` (unpaid, async method) | nothing; seats stay held |
| `checkout.session.async_payment_succeeded` | same as paid (no double fulfilment: order already paid → skip) |
| `checkout.session.async_payment_failed` | order `failed`, seats released |
| `checkout.session.expired` | order `expired`, seats released (also triggered when the buyer clicks "back") |
| `charge.refunded` (full) | order + payment `refunded`, tickets `refunded` (stop scanning), unused seats back on sale |

## Idempotency

- `stripeEvents/{event.id}` is written in the same transaction as the effects. Same event twice → `duplicate_event`.
- A paid order is never fulfilled again, even from a different event id.
- Webhook returns 500 only when processing failed, so Stripe's retry is safe. Email failures don't cause a 500.

## Taxes

Prices are stored **before tax** in cents. GST 5 % and QST 9.975 % are Stripe Tax Rate objects
(`scripts/create-tax-rates.mjs`), applied per line, exclusive. The site shows the same breakdown
(`lib/domain/money.ts`, rounding per line like Stripe). Stripe's amount is the source of truth;
a mismatch is logged.

## Local testing

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed   # generic event: will be "order_not_found", proves signature + routing
```

Full test plan (to run in test mode before going live): successful payment, declined card, cancel on Stripe,
webhook replay (`stripe events resend evt_…`), invalid signature, stock limit (set quantityTotal = 1, two browsers),
session expiry, full refund from the dashboard.
