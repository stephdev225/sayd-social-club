import "server-only";
import { demoPaymentsEnabled } from "@/lib/demo";
import { isFirebaseConfigured, isStripeConfigured } from "@/lib/env";

/**
 * Online sales need Stripe AND a durable database. In local development you can
 * opt into the in-memory store (ALLOW_MEMORY_STORE=true) to try the flow; orders
 * vanish on restart, so this is refused in production builds.
 */
export function canSellOnline(): boolean {
  if (demoPaymentsEnabled()) return true;
  if (!isStripeConfigured()) return false;
  if (isFirebaseConfigured()) return true;
  return process.env.NODE_ENV !== "production" && process.env.ALLOW_MEMORY_STORE === "true";
}
