import { describe, expect, it } from "vitest";
import { checkInTicket } from "@/lib/services/checkin";
import { startCheckout } from "@/lib/services/checkout";
import { handlePaymentEvent } from "@/lib/services/fulfillment";
import type { Order } from "@/lib/domain/types";
import { NOW, customer, fakeGateway, makeStore } from "./fixtures";

async function paidTickets(quantity = 2) {
  const store = makeStore();
  const res = await startCheckout(
    store,
    fakeGateway().gateway,
    { eventId: "evt1", items: [{ ticketTypeId: "ga", quantity }], customer, locale: "fr" },
    NOW,
  );
  if (!res.ok) throw new Error("setup");
  const order = (await store.get<Order & Record<string, unknown>>("orders", res.orderId))!;
  await handlePaymentEvent(store, {
    type: "session_paid",
    eventId: "e1",
    sessionId: order.stripeCheckoutSessionId!,
    orderId: order.id,
    amountTotalCents: order.totalCents,
  });
  const paid = (await store.get<Order & Record<string, unknown>>("orders", res.orderId))!;
  return { store, codes: paid.ticketIds };
}

describe("door check-in", () => {
  it("accepts a valid ticket once, then says already used", async () => {
    const { store, codes } = await paidTickets();
    const first = await checkInTicket(store, codes[0], { eventId: "evt1", scannedBy: "porte-1" });
    expect(first.result).toBe("ok");
    const second = await checkInTicket(store, codes[0], { eventId: "evt1", scannedBy: "porte-2" });
    expect(second.result).toBe("already_used");
    if (second.result === "already_used") expect(second.ticket.checkedInBy).toBe("porte-1");
    expect(store.all("checkins")).toHaveLength(2);
  });

  it("two doors scanning the same code at the same instant: only one gets in", async () => {
    const { store, codes } = await paidTickets(1);
    const results = await Promise.all([1, 2, 3].map((i) => checkInTicket(store, codes[0], { scannedBy: `porte-${i}` })));
    expect(results.filter((r) => r.result === "ok")).toHaveLength(1);
  });

  it("rejects unknown, malformed and other-event codes", async () => {
    const { store, codes } = await paidTickets(1);
    expect((await checkInTicket(store, "SAYD-26-AAAAAAAAAA", { scannedBy: "x" })).result).toBe("invalid");
    expect((await checkInTicket(store, "hello", { scannedBy: "x" })).result).toBe("invalid");
    expect((await checkInTicket(store, codes[0], { eventId: "other", scannedBy: "x" })).result).toBe("wrong_event");
  });

  it("accepts a code typed in lowercase with spaces", async () => {
    const { store, codes } = await paidTickets(1);
    expect((await checkInTicket(store, ` ${codes[0].toLowerCase()} `, { scannedBy: "x" })).result).toBe("ok");
  });
});
