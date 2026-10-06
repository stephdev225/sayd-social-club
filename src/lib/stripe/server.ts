import "server-only";
import Stripe from "stripe";
import { assertStripeTestModeUnlessLive, env } from "@/lib/env";

let client: Stripe | undefined;

export function stripe(): Stripe {
  if (!env.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not set.");
  assertStripeTestModeUnlessLive();
  client ??= new Stripe(env.stripeSecretKey, { appInfo: { name: "sayd-social-club" } });
  return client;
}
