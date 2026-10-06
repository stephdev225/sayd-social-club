import { convertReservation } from "@/lib/domain/inventory";
import { newTicketCode } from "@/lib/domain/ids";
import type { Order, Payment, SaydEvent, Ticket, TicketType } from "@/lib/domain/types";
import type { Store, Tx } from "@/lib/data/store";
import { cancelPendingOrder } from "./checkout";

/** Payment events, normalised from Stripe webhooks (see lib/stripe/events.ts). */
export type PaymentEvent =
  | {
      type: "session_paid";
      eventId: string;
      sessionId: string;
      orderId: string;
      paymentIntentId?: string;
      amountTotalCents: number;
    }
  | { type: "session_awaiting_payment"; eventId: string; sessionId: string; orderId: string }
  | { type: "session_failed"; eventId: string; sessionId: string; orderId: string }
  | { type: "session_expired"; eventId: string; sessionId: string; orderId: string }
  | { type: "charge_refunded"; eventId: string; paymentIntentId: string; fullyRefunded: boolean };

export type FulfillmentOutcome =
  | { result: "fulfilled"; order: Order; tickets: Ticket[]; event: SaydEvent }
  | { result: "duplicate_event" }
  | { result: "already_paid"; orderId: string }
  | { result: "order_not_found"; orderId?: string }
  | { result: "released"; orderId: string }
  | { result: "refunded"; orderId: string }
  | { result: "ignored"; reason: string };

type R = Record<string, unknown>;

async function alreadyProcessed(tx: Tx, eventId: string): Promise<boolean> {
  return (await tx.get("stripeEvents", eventId)) !== null;
}

function markProcessed(tx: Tx, eventId: string, type: string, orderId: string | undefined, now: Date) {
  tx.set("stripeEvents", eventId, { type, orderId: orderId ?? null, processedAt: now.toISOString() });
}

/**
 * Turns a paid Checkout Session into: order "paid", a payment record, one ticket per
 * seat, and reserved→sold stock. Idempotent twice over:
 *   - the Stripe event id is stored (same event delivered twice → no-op);
 *   - an order already "paid" is never fulfilled again (completed + async_succeeded).
 */
async function fulfill(store: Store, ev: Extract<PaymentEvent, { type: "session_paid" }>, now: Date) {
  return store.runTransaction<FulfillmentOutcome>(async (tx) => {
    // --- reads ---
    if (await alreadyProcessed(tx, ev.eventId)) return { result: "duplicate_event" };
    const order = await tx.get<Order & R>("orders", ev.orderId);
    if (!order) return { result: "order_not_found", orderId: ev.orderId };
    if (order.status === "paid" || order.status === "refunded") {
      markProcessed(tx, ev.eventId, "session_paid", order.id, now);
      return { result: "already_paid", orderId: order.id };
    }
    const event = await tx.get<SaydEvent & R>("events", order.eventId);
    if (!event) return { result: "order_not_found", orderId: ev.orderId };
    const types = await tx.getMany<TicketType & R>("ticketTypes", order.items.map((i) => i.ticketTypeId));

    const year = new Date(event.startsAt).getUTCFullYear();
    const seats = order.items.flatMap((item) => Array.from({ length: item.quantity }, () => item));
    let codes = seats.map(() => newTicketCode(year));
    // Guard against the (astronomically unlikely) collision with an existing ticket.
    const existing = await tx.getMany("tickets", codes);
    codes = codes.map((c, i) => (existing[i] ? newTicketCode(year) : c));

    // --- writes ---
    const nowIso = now.toISOString();
    const tickets: Ticket[] = seats.map((item, i) => ({
      id: codes[i],
      orderId: order.id,
      eventId: order.eventId,
      customerId: order.customerId,
      ticketTypeId: item.ticketTypeId,
      ticketTypeName: item.name,
      holderName: order.customerName,
      status: "valid",
      createdAt: nowIso,
    }));
    for (const t of tickets) tx.set("tickets", t.id, t as unknown as R);

    const payment: Payment = {
      id: `pay_${order.id}`,
      orderId: order.id,
      stripeCheckoutSessionId: ev.sessionId,
      ...(ev.paymentIntentId ? { stripePaymentIntentId: ev.paymentIntentId } : {}),
      amountCents: ev.amountTotalCents,
      currency: "cad",
      status: "paid",
      paidAt: nowIso,
    };
    tx.set("payments", payment.id, payment as unknown as R);

    // A late payment on an order whose hold had expired: stock was already released,
    // so we count the sale without touching reserved (convertReservation floors at 0).
    const wasHolding = order.status === "pending";
    order.items.forEach((item, i) => {
      const t = types[i];
      if (!t) return;
      tx.update(
        "ticketTypes",
        t.id,
        wasHolding ? convertReservation(t, item.quantity) : { quantitySold: t.quantitySold + item.quantity },
      );
    });

    const paidOrder: Order = {
      ...order,
      status: "paid",
      stripeCheckoutSessionId: ev.sessionId,
      ...(ev.paymentIntentId ? { stripePaymentIntentId: ev.paymentIntentId } : {}),
      ticketIds: tickets.map((t) => t.id),
      paidAt: nowIso,
      updatedAt: nowIso,
    };
    if (ev.amountTotalCents !== order.totalCents) {
      console.warn(`[fulfill] amount mismatch on ${order.id}: stripe=${ev.amountTotalCents} order=${order.totalCents}`);
    }
    tx.set("orders", order.id, paidOrder as unknown as R);
    markProcessed(tx, ev.eventId, "session_paid", order.id, now);

    return { result: "fulfilled", order: paidOrder, tickets, event };
  });
}

async function release(store: Store, ev: { eventId: string; orderId: string; type: string }, status: "expired" | "failed", now: Date) {
  const isNew = await store.runTransaction(async (tx) => {
    if (await alreadyProcessed(tx, ev.eventId)) return false;
    markProcessed(tx, ev.eventId, ev.type, ev.orderId, now);
    return true;
  });
  if (!isNew) return { result: "duplicate_event" } as const;
  const released = await cancelPendingOrder(store, ev.orderId, status);
  return released ? ({ result: "released", orderId: ev.orderId } as const) : ({ result: "ignored", reason: "order not pending" } as const);
}

async function refund(store: Store, ev: Extract<PaymentEvent, { type: "charge_refunded" }>, now: Date): Promise<FulfillmentOutcome> {
  if (!ev.fullyRefunded) return { result: "ignored", reason: "partial refund: handle manually" };
  const payments = await store.query<Payment & R>("payments", {
    where: [{ field: "stripePaymentIntentId", op: "==", value: ev.paymentIntentId }],
    limit: 1,
  });
  const payment = payments[0];
  if (!payment) return { result: "order_not_found" };

  return store.runTransaction<FulfillmentOutcome>(async (tx) => {
    if (await alreadyProcessed(tx, ev.eventId)) return { result: "duplicate_event" };
    const order = await tx.get<Order & R>("orders", payment.orderId);
    if (!order) return { result: "order_not_found", orderId: payment.orderId };
    if (order.status === "refunded") {
      markProcessed(tx, ev.eventId, "charge_refunded", order.id, now);
      return { result: "refunded", orderId: order.id };
    }
    const tickets = await tx.getMany<Ticket & R>("tickets", order.ticketIds);
    const types = await tx.getMany<TicketType & R>("ticketTypes", order.items.map((i) => i.ticketTypeId));

    const nowIso = now.toISOString();
    tx.update("orders", order.id, { status: "refunded", updatedAt: nowIso });
    tx.update("payments", payment.id, { status: "refunded", refundedAt: nowIso });
    // Refunded tickets stop scanning. Unused seats go back on sale.
    const unusedBack = new Map<string, number>();
    for (const t of tickets) {
      if (!t) continue;
      tx.update("tickets", t.id, { status: "refunded" });
      if (t.status === "valid") unusedBack.set(t.ticketTypeId, (unusedBack.get(t.ticketTypeId) ?? 0) + 1);
    }
    types.forEach((t) => {
      const n = t ? unusedBack.get(t.id) : 0;
      if (t && n) tx.update("ticketTypes", t.id, { quantitySold: Math.max(0, t.quantitySold - n) });
    });
    markProcessed(tx, ev.eventId, "charge_refunded", order.id, now);
    return { result: "refunded", orderId: order.id };
  });
}

export async function handlePaymentEvent(store: Store, ev: PaymentEvent, now: Date = new Date()): Promise<FulfillmentOutcome> {
  switch (ev.type) {
    case "session_paid":
      return fulfill(store, ev, now);
    case "session_awaiting_payment":
      // Bank debit / async method: stock stays reserved until success or failure arrives.
      return { result: "ignored", reason: "awaiting async payment" };
    case "session_failed":
      return release(store, ev, "failed", now);
    case "session_expired":
      return release(store, ev, "expired", now);
    case "charge_refunded":
      return refund(store, ev, now);
  }
}
