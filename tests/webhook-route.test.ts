import { beforeAll, describe, expect, it } from "vitest";
import Stripe from "stripe";

const SECRET = "whsec_test_secret_for_unit_tests";

// Configure env BEFORE the route module (and lib/env) is imported.
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = SECRET;
delete process.env.FIREBASE_PROJECT_ID; // → in-memory store seeded from data/seed.json

type RouteModule = typeof import("@/app/api/stripe/webhook/route");
let POST: RouteModule["POST"];
let getStore: typeof import("@/lib/data").getStore;
let startCheckout: typeof import("@/lib/services/checkout").startCheckout;

beforeAll(async () => {
  ({ POST } = await import("@/app/api/stripe/webhook/route"));
  ({ getStore } = await import("@/lib/data"));
  ({ startCheckout } = await import("@/lib/services/checkout"));
});

const stripe = new Stripe("sk_test_dummy");

function signedRequest(payload: string, secret = SECRET) {
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": header, "content-type": "application/json" },
    body: payload,
  });
}

function completedEvent(id: string, orderId: string, sessionId: string, amount: number) {
  return JSON.stringify({
    id,
    object: "event",
    type: "checkout.session.completed",
    api_version: "2025-01-01",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        payment_status: "paid",
        status: "complete",
        amount_total: amount,
        currency: "cad",
        payment_intent: "pi_route_test",
        client_reference_id: orderId,
        metadata: { orderId },
      },
    },
  });
}

describe("POST /api/stripe/webhook", () => {
  it("rejects a missing or forged signature", async () => {
    const noSig = await POST(new Request("http://x/api/stripe/webhook", { method: "POST", body: "{}" }));
    expect(noSig.status).toBe(400);
    const forged = await POST(signedRequest(completedEvent("evt_x", "ORD-X", "cs_test_x", 1), "whsec_wrong"));
    expect(forged.status).toBe(400);
  });

  it("fulfils a signed checkout.session.completed once, and acknowledges the replay", async () => {
    const store = getStore();
    const res = await startCheckout(
      store,
      { createCheckoutSession: async ({ orderId }) => ({ id: `cs_test_route${orderId.slice(4)}`, url: "https://x" }) },
      {
        eventId: "sprezzatura-2026-10-11",
        items: [{ ticketTypeId: "sprezzatura-online", quantity: 2 }],
        customer: { firstName: "Test", lastName: "Route", email: "route@example.com", marketingOptIn: false },
        locale: "fr",
      },
      new Date("2026-10-06T12:00:00Z"),
    );
    if (!res.ok) throw new Error(`setup: ${res.error}`);
    const order = (await store.get<{ stripeCheckoutSessionId: string; totalCents: number } & Record<string, unknown>>(
      "orders",
      res.orderId,
    ))!;
    const payload = completedEvent("evt_route_1", res.orderId, order.stripeCheckoutSessionId, order.totalCents);

    const first = await POST(signedRequest(payload));
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ result: "fulfilled" });

    const replay = await POST(signedRequest(payload));
    expect(replay.status).toBe(200);
    expect(await replay.json()).toMatchObject({ result: "duplicate_event" });

    const tickets = await store.query("tickets", { where: [{ field: "orderId", op: "==", value: res.orderId }] });
    expect(tickets).toHaveLength(2);
  });

  it("acknowledges event types it doesn't handle", async () => {
    const payload = JSON.stringify({ id: "evt_other", object: "event", type: "customer.created", data: { object: {} } });
    const r = await POST(signedRequest(payload));
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ ignored: "customer.created" });
  });
});
