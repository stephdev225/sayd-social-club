# Security

| Area | Measure | Where |
|---|---|---|
| Secrets | Server-only env vars (no `NEXT_PUBLIC_`), `.env*` git-ignored, `.env.example` has no values | `lib/env.ts`, `.gitignore` |
| Live payments | `sk_live_` refused unless `STRIPE_ALLOW_LIVE=true` | `lib/env.ts` |
| Database | Client rules deny everything; Admin SDK on the server only | `firestore.rules`, `lib/firebase/admin.ts` |
| Payment truth | Only the signed webhook marks orders paid; success page is read-only | `api/stripe/webhook`, `services/fulfillment.ts` |
| Webhook | Signature verified on raw body; idempotent by event id and order status | same |
| Prices | Read from the database inside the reservation transaction; browser sends ids and quantities only | `services/checkout.ts` |
| Overselling | Stock checked and reserved in one transaction | `services/checkout.ts`, tests |
| Input | Zod schemas on every API body; ticket codes normalised and pattern-checked | `lib/validation.ts`, `lib/domain/ids.ts` |
| XSS / injection | React escapes output; emails escape user text; JSON-LD `<` escaped; no raw HTML from users | `lib/html.ts` |
| Spam / abuse | Per-IP rate limits (checkout 10/min, forms 5/min, status 120/min), honeypot on forms | `lib/rate-limit.ts` |
| Headers | HSTS, nosniff, frame DENY, referrer policy, permissions policy | `next.config.ts` |
| Demo mode | Fake payments hard-disabled when `NODE_ENV=production` | `lib/demo.ts` |
| Dependencies | Next 16.3.8 / React 19.2 (the old site ran a vulnerable Next 14.2.3) | `package.json` |

## Known limits (to address)

- Rate limiting is per serverless instance (best effort). Move to Upstash/Vercel KV if abused.
- No Content-Security-Policy yet (Spotify embed and Stripe redirects to whitelist first).
- Admin authentication (`/admin`, `/scan`) arrives in the next phase: Firebase Auth + custom claims + httpOnly session cookie, checked server-side.
- Session ids in confirmation URLs act as bearer tokens for order status: unguessable, `noindex`, but avoid sharing that URL.
