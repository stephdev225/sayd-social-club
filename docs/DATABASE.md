# Database (Cloud Firestore)

Accessed **only** from the Next.js server through the Admin SDK. `firestore.rules` denies all client access.
Dates are ISO-8601 UTC strings (sortable). Money is integer cents, CAD.

| Collection | Id | Key fields |
|---|---|---|
| `events` | readable slug-date, e.g. `sprezzatura-2026-10-11` | slug, name, edition{fr,en}, tagline, description, startsAt, endsAt, venueName, address, city, capacity, status (draft·published·sold_out·cancelled·archived), coverImage, dressCode, lineup[], partners[], accent |
| `ticketTypes` | e.g. `sprezzatura-online` | eventId, name{fr,en}, priceCents (before tax), quantityTotal, quantitySold, quantityReserved, maxPerOrder, active, sortOrder, channels[online·door], salesStartAt?, salesEndAt? |
| `customers` | `c_` + sha256(email)[0:24] | firstName, lastName, email, phone?, marketingOptIn, createdAt |
| `orders` | `ORD-XXXXXXXX` | eventId, customerId, customerEmail, customerName, items[{ticketTypeId,name,quantity,unitPriceCents}], subtotalCents, taxCents, totalCents, status (pending·paid·expired·failed·refunded·cancelled), channel, locale, stripeCheckoutSessionId, stripePaymentIntentId, ticketIds[], emailSentAt, expiresAt, paidAt |
| `payments` | `pay_{orderId}` | orderId, stripeCheckoutSessionId, stripePaymentIntentId, amountCents, status, paidAt, refundedAt |
| `tickets` | `SAYD-26-XXXXXXXXXX` (= QR payload) | orderId, eventId, customerId, ticketTypeId, ticketTypeName, holderName, status (valid·used·cancelled·refunded), checkedInAt, checkedInBy |
| `stripeEvents` | Stripe event id | type, orderId, processedAt |
| `submissions` | auto | kind (contact·ambassador·newsletter), fields, createdAt |
| `checkins` | auto | *(next phase: scan log)* |

## Stock

`available = quantityTotal - quantitySold - quantityReserved`, computed **inside the transaction** that reserves.
Firestore retries a transaction when a document it read changed, so two buyers can't both take the last seat.
Covered by `tests/checkout.test.ts` (5 concurrent buyers, 1 seat → exactly 1 succeeds).

## Ticket codes

`SAYD-YY-` + 10 Crockford base32 chars (50 bits): unguessable, readable aloud, no I/L/O/U.
The code alone proves nothing: it must exist in `tickets` with status `valid`. Check-in will flip it to `used`
in a transaction, so a copied QR passes once at most.

## Indexes

Only single-field equality / order queries are used, which Firestore indexes automatically.

## Privacy

Anonymous visitors are never stored. Only buyers and people who submit a form, with the minimum needed.
Analytics (next phase) stay aggregate and separate from customer data.
