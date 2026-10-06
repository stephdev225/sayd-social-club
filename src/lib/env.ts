import "server-only";

/**
 * Server-side configuration. Nothing here is ever sent to the browser
 * (no NEXT_PUBLIC_ prefix). Missing values disable the feature with a clear
 * message instead of crashing the public site.
 */
export const env = {
  siteUrl:
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),

  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export function isFirebaseConfigured(): boolean {
  return Boolean(env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey);
}

export function isStripeConfigured(): boolean {
  return Boolean(env.stripeSecretKey && env.stripeWebhookSecret);
}

/** Refuses live keys until production is explicitly enabled. */
export function assertStripeTestModeUnlessLive(): void {
  const live = env.stripeSecretKey?.startsWith("sk_live_");
  if (live && process.env.STRIPE_ALLOW_LIVE !== "true") {
    throw new Error("Live Stripe key detected but STRIPE_ALLOW_LIVE is not 'true'. Refusing to run.");
  }
}
