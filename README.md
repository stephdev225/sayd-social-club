# Sayd Social Club

Site and ticketing for **Sayd Social Club**, premium Afro-Caribbean parties in Québec City since 2019.
Visitors buy tickets directly on the site (Stripe Checkout), receive a unique QR code per person, and every sale lands in our own database.

> Status: **Stripe test mode only.** No live keys, no real payments.

## What it does

- Bilingual public site (FR default, EN) with the season's events
- Ticket purchase: quantity → buyer details → Stripe Checkout → confirmation page with QR codes
- **The Stripe webhook is the only proof of payment**; the success page just reads the database
- Stock reserved in a transaction while the buyer pays (35 min), released if they abandon or cancel
- Idempotent fulfilment: a Stripe event delivered twice never creates two tickets
- Confirmation email with QR codes (Brevo), personal ticket page `/fr/billet/SAYD-26-XXXXXXXXXX`
- Contact, ambassador and newsletter forms: validated, stored, forwarded to the team
- Privacy policy (Loi 25) and terms of sale (non-refundable tickets)

Coming next: admin dashboard (`/admin`), door scanner (`/scan`) with check-in, door sales.

## Stack

| Layer | Choice |
|---|---|
| Front + back | Next.js 16 (App Router, Route Handlers), React 19, TypeScript strict |
| Styles | Tailwind CSS 4, self-hosted fonts (Cormorant Garamond, DM Sans) |
| Database | Cloud Firestore, **server-side Admin SDK only** (client rules deny everything) |
| Payments | Stripe Checkout + webhooks, exclusive GST/QST tax rates |
| Email | Brevo transactional API |
| Validation | Zod |
| Tests | Vitest (domain, checkout, fulfilment, signed webhook route) |
| Hosting | Vercel |

## Architecture

```
Browser ──POST /api/checkout──▶ Next.js server ──transaction──▶ Firestore
                                   │  (reserve stock, pending order, prices from DB)
                                   └──create session──▶ Stripe Checkout ──▶ buyer pays
Stripe ──POST /api/stripe/webhook (signed)──▶ verify ▶ idempotent fulfilment ▶ Firestore
                                                         order paid, payment, tickets, stock
                                                         └──▶ confirmation email + QR
Browser ◀── /billetterie/confirmation polls order status (read-only)
```

Business logic lives in `src/lib/services/` and talks to a small `Store` port (`src/lib/data/store.ts`).
Two adapters: Firestore in production, in-memory for tests and local preview. The in-memory adapter
enforces Firestore's transaction rule (all reads before writes), so tests catch code production would reject.

```
src/
  app/[lang]/…            pages (home, evenements, billetterie/confirmation, billet, forms, legal)
  app/api/                checkout, checkout/cancel, stripe/webhook, orders/status, forms
  lib/domain/             types, money (cents + taxes), inventory, ticket codes  ← pure, tested
  lib/services/           checkout.ts (reserve + session), fulfillment.ts (webhook logic)
  lib/data/               Store port, Firestore + memory adapters, catalog/order queries
  lib/stripe/             client, gateway, event mapping
  lib/email/              Brevo sender, confirmation email
data/seed.json            events + ticket types (load with npm run seed)
docs/                     architecture, Stripe, database, security, project memory
```

## Data model (Firestore)

`events`, `ticketTypes` (priceCents, quantityTotal/Sold/Reserved, channels online|door), `customers`
(id = hash of email), `orders` (items, subtotal/tax/total cents, status, Stripe ids, ticketIds),
`payments`, `tickets` (id = QR payload, status valid|used|refunded), `stripeEvents` (idempotency),
`submissions` (forms). Details in [docs/DATABASE.md](docs/DATABASE.md).

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000 — renders from data/seed.json without any keys
```

Try the whole purchase without Stripe or Firebase: set `DEMO_PAYMENTS=true` in `.env.local`.
A fake "Stripe + webhook" runs the **real** fulfilment code (disabled in production builds).

With real Stripe **test** keys and Firebase:

```bash
node scripts/create-tax-rates.mjs     # once: prints STRIPE_TAX_RATE_GST / _QST
npm run seed                          # loads data/seed.json into Firestore
stripe listen --forward-to localhost:3000/api/stripe/webhook   # prints STRIPE_WEBHOOK_SECRET
npm run dev
```

Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (declined). Any future date, any CVC.

## Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Deploy (Vercel)

1. Import the repo in Vercel. 2. Add the variables from `.env.example` (test keys).
3. In Stripe (test mode) add a webhook endpoint `https://<domain>/api/stripe/webhook` with events
`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
`checkout.session.expired`, `charge.refunded`; copy its signing secret to `STRIPE_WEBHOOK_SECRET`.
4. Deploy Firestore rules: `npx firebase-tools deploy --only firestore:rules`.

Going live (later, after the full test plan): live keys, live tax rates, live webhook, `STRIPE_ALLOW_LIVE=true`.

## Security

Secrets are server-only (no `NEXT_PUBLIC_`), `.env*` is git-ignored, Firestore denies all client access,
webhook signatures are verified on the raw body, prices and stock are read from the database, inputs are
validated with Zod, emails escape user text, endpoints are rate-limited, security headers are set.
See [docs/SECURITY.md](docs/SECURITY.md).
