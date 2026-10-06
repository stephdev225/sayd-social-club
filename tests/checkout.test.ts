import { describe, expect, it } from "vitest";
import { cancelPendingOrder, startCheckout, customerIdFor } from "@/lib/services/checkout";
import type { Order, TicketType } from "@/lib/domain/types";
import { NOW, customer, event, fakeGateway, makeStore, ticketType } from "./fixtures";

const input = (quantity: number, ticketTypeId = "ga") => ({
  eventId: "evt1",
  items: [{ ticketTypeId, quantity }],
  customer,
  locale: "fr" as const,
});

describe("startCheckout", () => {
  it("reserves stock, creates a pending order priced from the database, and a Stripe session", async () => {
    const store = makeStore();
    const { gateway, calls } = fakeGateway();
    const res = await startCheckout(store, gateway, input(2), NOW);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const order = (await store.get<Order & Record<string, unknown>>("orders", res.orderId))!;
    expect(order.status).toBe("pending");
    expect(order.subtotalCents).toBe(5298);
    expect(order.totalCents).toBe(5298 + Math.round(5298 * 0.05) + Math.round(5298 * 0.09975));
    expect(order.customerEmail).toBe("awa@example.com");
    expect(order.stripeCheckoutSessionId).toBe(`cs_test_${res.orderId}`);
    expect(new Date(order.expiresAt).getTime() - NOW.getTime()).toBe(35 * 60_000);

    const t = (await store.get<TicketType & Record<string, unknown>>("ticketTypes", "ga"))!;
    expect(t.quantityReserved).toBe(2);
    expect(t.quantitySold).toBe(0);

    expect(calls[0].lines).toEqual([{ name: "Billet en ligne", unitAmountCents: 2649, quantity: 2 }]);
    expect(await store.get("customers", customerIdFor("awa@example.com"))).toMatchObject({ firstName: "Awa" });
  });

  it("never sells the last ticket twice, even with simultaneous buyers", async () => {
    const store = makeStore([ticketType({ quantityTotal: 1 })]);
    const { gateway } = fakeGateway();
    const results = await Promise.all(Array.from({ length: 5 }, () => startCheckout(store, gateway, input(1), NOW)));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok).every((r) => !r.ok && r.error === "sold_out")).toBe(true);
    const t = (await store.get<TicketType & Record<string, unknown>>("ticketTypes", "ga"))!;
    expect(t.quantityReserved).toBe(1);
  });

  it("reports how many are left when asking for too many", async () => {
    const store = makeStore([ticketType({ quantityTotal: 3 })]);
    const res = await startCheckout(store, fakeGateway().gateway, input(5), NOW);
    expect(res).toEqual({ ok: false, error: "insufficient_stock", ticketTypeId: "ga", available: 3 });
  });

  it("refuses door-only tickets, unknown tickets and past or draft events", async () => {
    const door = ticketType({ id: "door", channels: ["door"], priceCents: 3000 });
    const store = makeStore([ticketType(), door]);
    const gw = fakeGateway().gateway;
    expect(await startCheckout(store, gw, input(1, "door"), NOW)).toMatchObject({ ok: false, error: "unknown_ticket" });
    expect(await startCheckout(store, gw, input(1, "nope"), NOW)).toMatchObject({ ok: false, error: "unknown_ticket" });
    expect(await startCheckout(store, gw, input(1), new Date("2026-10-13T00:00:00Z"))).toMatchObject({
      error: "event_unavailable",
    });
    const draft = makeStore([ticketType()], { ...event, status: "draft" });
    expect(await startCheckout(draft, gw, input(1), NOW)).toMatchObject({ error: "event_unavailable" });
    expect(await startCheckout(store, gw, input(0), NOW)).toMatchObject({ error: "empty" });
  });

  it("gives the seats back if Stripe fails", async () => {
    const store = makeStore();
    const res = await startCheckout(store, fakeGateway({ fail: true }).gateway, input(3), NOW);
    expect(res).toEqual({ ok: false, error: "payment_provider" });
    const t = (await store.get<TicketType & Record<string, unknown>>("ticketTypes", "ga"))!;
    expect(t.quantityReserved).toBe(0);
    expect(store.all<Order & Record<string, unknown>>("orders")[0].status).toBe("cancelled");
  });

  it("releasing twice only frees the seats once", async () => {
    const store = makeStore();
    const res = await startCheckout(store, fakeGateway().gateway, input(2), NOW);
    if (!res.ok) throw new Error("setup");
    expect(await cancelPendingOrder(store, res.orderId, "expired")).toBe(true);
    expect(await cancelPendingOrder(store, res.orderId, "expired")).toBe(false);
    const t = (await store.get<TicketType & Record<string, unknown>>("ticketTypes", "ga"))!;
    expect(t.quantityReserved).toBe(0);
  });
});
