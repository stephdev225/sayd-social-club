import "server-only";
import { env } from "@/lib/env";
import type { PaymentGateway } from "@/lib/services/checkout";

/**
 * Local demo mode: lets you click through the whole purchase without Stripe keys.
 * Hard-disabled in production builds whatever the env says.
 */
export function demoPaymentsEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_PAYMENTS === "true";
}

export const demoGateway: PaymentGateway = {
  async createCheckoutSession({ orderId, locale }) {
    const id = `cs_test_demo${orderId.replace(/[^A-Za-z0-9]/g, "")}`;
    return { id, url: `${env.siteUrl}/api/dev/demo-pay?session_id=${id}&order=${orderId}&lang=${locale}` };
  },
};
