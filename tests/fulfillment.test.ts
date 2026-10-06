import { describe, expect, it } from "vitest";
import { startCheckout } from "@/lib/services/checkout";
import { handlePaymentEvent } from "@/lib/services/fulfillment";
import type { Order, Payment, Ticket, TicketType } from "@/lib/domain/types";
import { NOW, customer, fakeGateway, makeStore, ticketType } from "./fixtures";

type R = Record<string, unknown>;

async function pendingOrder(quantity = 2, total = 10) {
  const store = makeStore([ticketType({ quantityTotal: total })]);
  const res = await startCheckout(
    store,
    fakeGateway().gateway,
    { eventId: "evt1", items: [{ ticketTypeId: "ga", quantity }], customer, locale: "fr" },
    NOW,
  );
  if (!res.ok) throw new Error("setup failed");
  const order = (await store.get<Order & R>("orders", res.orderId))!;
  return { store, order };
}

const paid = (order: Order, eventId = "evt_1") => ({
  type: "session_paid" as const,
  eventId,
  sessionId: order.stripeCheckoutSessionId!,
  orderId: order.id,
  paymentIntentId: "pi_123",
  amountTotalCents: order.totalCents,
});

const ga = async (store: ReturnType<typeof makeStore>) =>
  (await store.get<TicketType & R>("ticketTypes", "ga"))!;

describe("webhook fulfillment", () => {
  it("marks the order paid, records the payment, creates one ticket per seat and moves reserved → sold", async () => {
    const { store, order } = await pendingOrder(3);
    const out = await handlePaymentEvent(store, paid(order), NOW);
    expect(out.result).toBe("fulfilled");

    const saved = (await store.get<Order & R>("orders", order.id))!;
    expect(saved.status).toBe("paid");
    expect(saved.ticketIds).toHaveLength(3);
    expect(saved.stripePaymentIntentId).toBe("pi_123");

    const tickets = store.all<Ticket & R>("tickets");
    expect(tickets).toHaveLength(3);
    expect(new Set(tickets.map((t) => t.id)).size).toBe(3);
    expect(tickets.every((t) => t.status === "valid" && t.holderName === "Awa Diallo")).toBe(true);

    expect(store.all<Payment & R>("payments")).toMatchObject([{ status: "paid", amountCents: order.totalCents }]);
    expect(await ga(store)).toMatchObject({ quantitySold: 3, quantityReserved: 0 });
  });

  it("is idempotent: the same Stripe event delivered 3 times creates tickets once", async () => {
    const { store, order } = await pendingOrder(2);
    const outs = await Promise.all([1, 2, 3].map(() => handlePaymentEvent(store, paid(order), NOW)));
    expect(outs.map((o) => o.result).sort()).toEqual(["duplicate_event", "duplicate_event", "fulfilled"]);
    expect(store.all("tickets")).toHaveLength(2);
    expect(store.all("payments")).toHaveLength(1);
    expect(await ga(store)).toMatchObject({ quantitySold: 2, quantityReserved: 0 });
  });

  it("completed + async_payment_succeeded (two event ids, same order) still fulfils once", async () => {
    const { store, order } = await pendingOrder(1);
    await handlePaymentEvent(store, paid(order, "evt_completed"), NOW);
    const second = await handlePaymentEvent(store, paid(order, "evt_async"), NOW);
    expect(second).toEqual({ result: "already_paid", orderId: order.id });
    expect(store.all("tickets")).toHaveLength(1);
  });

  it("unknown order is reported, not crashed", async () => {
    const { store, order } = await pendingOrder(1);
    const out = await handlePaymentEvent(store, { ...paid(order), orderId: "ORD-NOPE" }, NOW);
    expect(out).toEqual({ result: "order_not_found", orderId: "ORD-NOPE" });
  });

  it("an expired checkout gives the seats back once", async () => {
    const { store, order } = await pendingOrder(4);
    const ev = { type: "session_expired" as const, eventId: "evt_exp", sessionId: "cs", orderId: order.id };
    expect((await handlePaymentEvent(store, ev, NOW)).result).toBe("released");
    expect((await handlePaymentEvent(store, ev, NOW)).result).toBe("duplicate_event");
    expect(await ga(store)).toMatchObject({ quantityReserved: 0, quantitySold: 0 });
    expect((await store.get<Order & R>("orders", order.id))!.status).toBe("expired");
  });

  it("a failed async payment releases the seats", async () => {
    const { store, order } = await pendingOrder(2);
    const out = await handlePaymentEvent(
      store,
      { type: "session_failed", eventId: "evt_f", sessionId: "cs", orderId: order.id },
      NOW,
    );
    expect(out.result).toBe("released");
    expect((await store.get<Order & R>("orders", order.id))!.status).toBe("failed");
  });

  it("awaiting async payment keeps the seats held", async () => {
    const { store, order } = await pendingOrder(2);
    await handlePaymentEvent(store, { type: "session_awaiting_payment", eventId: "e", sessionId: "cs", orderId: order.id });
    expect(await ga(store)).toMatchObject({ quantityReserved: 2 });
  });

  it("a full refund invalidates the tickets and puts unused seats back on sale", async () => {
    const { store, order } = await pendingOrder(2);
    await handlePaymentEvent(store, paid(order), NOW);
    const out = await handlePaymentEvent(
      store,
      { type: "charge_refunded", eventId: "evt_r", paymentIntentId: "pi_123", fullyRefunded: true },
      NOW,
    );
    expect(out).toEqual({ result: "refunded", orderId: order.id });
    expect(store.all<Ticket & R>("tickets").every((t) => t.status === "refunded")).toBe(true);
    expect(store.all<Payment & R>("payments")[0].status).toBe("refunded");
    expect(await ga(store)).toMatchObject({ quantitySold: 0 });
  });

  it("partial refunds are left for manual handling", async () => {
    const { store, order } = await pendingOrder(2);
    await handlePaymentEvent(store, paid(order), NOW);
    const out = await handlePaymentEvent(
      store,
      { type: "charge_refunded", eventId: "evt_p", paymentIntentId: "pi_123", fullyRefunded: false },
      NOW,
    );
    expect(out.result).toBe("ignored");
    expect(store.all<Ticket & R>("tickets").every((t) => t.status === "valid")).toBe(true);
  });
});
