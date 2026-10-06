import { NextResponse } from "next/server";
import { canSellOnline } from "@/lib/checkout-availability";
import { getStore } from "@/lib/data";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { startCheckout } from "@/lib/services/checkout";
import { demoGateway, demoPaymentsEnabled } from "@/lib/demo";
import { stripeGateway } from "@/lib/stripe/gateway";
import { checkoutSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!canSellOnline()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!rateLimit(`checkout:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { eventId, items, customer, locale } = parsed.data;
  const result = await startCheckout(getStore(), demoPaymentsEnabled() ? demoGateway : stripeGateway, { eventId, items, customer, locale });

  if (result.ok) return NextResponse.json({ url: result.url });

  const status = result.error === "payment_provider" ? 502 : 409;
  return NextResponse.json(
    { error: result.error === "payment_provider" ? "generic" : result.error, available: result.available },
    { status },
  );
}
