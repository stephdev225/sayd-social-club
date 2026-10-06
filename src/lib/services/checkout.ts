import { createHash } from "node:crypto";
import { checkReservation, releaseReservation, type ReserveError } from "@/lib/domain/inventory";
import { computeTotals, SALES_TAXES } from "@/lib/domain/money";
import { newOrderId } from "@/lib/domain/ids";
import type { Customer, Order, OrderItem, SaydEvent, TicketType } from "@/lib/domain/types";
import type { Store } from "@/lib/data/store";

/** Stripe requires a Checkout Session to live at least 30 minutes; keep a margin. */
export const RESERVATION_MINUTES = 35;

export interface CheckoutInput {
  eventId: string;
  items: { ticketTypeId: string; quantity: number }[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    marketingOptIn: boolean;
  };
  locale: "fr" | "en";
}

export interface PaymentGateway {
  createCheckoutSession(input: {
    orderId: string;
    eventName: string;
    lines: { name: string; unitAmountCents: number; quantity: number }[];
    /** GST / QST as separate lines, computed by us so Stripe's total matches the site exactly. */
    taxLines: { name: string; amountCents: number }[];
    customerEmail: string;
    locale: "fr" | "en";
    expiresAt: Date;
  }): Promise<{ id: string; url: string }>;
}

export type CheckoutError = ReserveError | "event_unavailable" | "unknown_ticket" | "empty" | "payment_provider";

export type CheckoutResult =
  | { ok: true; orderId: string; url: string }
  | { ok: false; error: CheckoutError; ticketTypeId?: string; available?: number };

export function customerIdFor(email: string): string {
  return "c_" + createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24);
}

/**
 * 1. Reserves stock and creates a pending order in ONE transaction (prices read from the DB).
 * 2. Creates the Stripe Checkout Session.
 * 3. If Stripe fails, releases the reservation.
 * The browser never sends prices and never confirms a payment.
 */
export async function startCheckout(
  store: Store,
  gateway: PaymentGateway,
  input: CheckoutInput,
  now: Date = new Date(),
): Promise<CheckoutResult> {
  const items = input.items.filter((i) => i.quantity > 0);
  if (items.length === 0) return { ok: false, error: "empty" };

  const orderId = newOrderId();
  const email = input.customer.email.trim().toLowerCase();
  const customerId = customerIdFor(email);
  const expiresAt = new Date(now.getTime() + RESERVATION_MINUTES * 60_000);

  const reserved = await store.runTransaction(async (tx) => {
    // --- reads ---
    const event = await tx.get<SaydEvent & Record<string, unknown>>("events", input.eventId);
    const types = await tx.getMany<TicketType & Record<string, unknown>>(
      "ticketTypes",
      items.map((i) => i.ticketTypeId),
    );
    const existingCustomer = await tx.get<Customer & Record<string, unknown>>("customers", customerId);

    if (!event || event.status !== "published" || new Date(event.endsAt) <= now) {
      return { ok: false as const, error: "event_unavailable" as const };
    }

    const lines: OrderItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const t = types[i];
      if (!t || t.eventId !== event.id || !(t.channels ?? ["online"]).includes("online")) {
        return { ok: false as const, error: "unknown_ticket" as const, ticketTypeId: items[i].ticketTypeId };
      }
      const check = checkReservation(t, items[i].quantity, now);
      if (!check.ok) {
        return { ok: false as const, error: check.error, ticketTypeId: t.id, available: check.available };
      }
      lines.push({
        ticketTypeId: t.id,
        name: t.name[input.locale],
        quantity: items[i].quantity,
        unitPriceCents: t.priceCents,
      });
    }

    // --- writes ---
    const totals = computeTotals(lines);
    const nowIso = now.toISOString();
    const customer: Customer = {
      id: customerId,
      firstName: input.customer.firstName.trim(),
      lastName: input.customer.lastName.trim(),
      email,
      ...(input.customer.phone ? { phone: input.customer.phone.trim() } : {}),
      marketingOptIn: input.customer.marketingOptIn || Boolean(existingCustomer?.marketingOptIn),
      createdAt: existingCustomer?.createdAt ?? nowIso,
    };
    tx.set("customers", customerId, customer as unknown as Record<string, unknown>);

    const order: Order = {
      id: orderId,
      eventId: event.id,
      customerId,
      customerEmail: email,
      customerName: `${customer.firstName} ${customer.lastName}`,
      items: lines,
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      currency: "cad",
      status: "pending",
      channel: "online",
      locale: input.locale,
      ticketIds: [],
      expiresAt: expiresAt.toISOString(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    tx.set("orders", orderId, order as unknown as Record<string, unknown>);

    for (let i = 0; i < items.length; i++) {
      tx.update("ticketTypes", types[i]!.id, {
        quantityReserved: types[i]!.quantityReserved + items[i].quantity,
      });
    }
    return { ok: true as const, order, eventName: event.name };
  });

  if (!reserved.ok) return reserved;

  try {
    const session = await gateway.createCheckoutSession({
      orderId,
      eventName: reserved.eventName,
      lines: reserved.order.items.map((l) => ({ name: l.name, unitAmountCents: l.unitPriceCents, quantity: l.quantity })),
      taxLines: computeTotals(reserved.order.items.map((l) => ({ unitPriceCents: l.unitPriceCents, quantity: l.quantity })))
        .taxes.map((tax, i) => ({
          name: `${SALES_TAXES[i].label[input.locale]} (${(SALES_TAXES[i].rate * 100).toLocaleString(input.locale === "fr" ? "fr-CA" : "en-CA")} %)`,
          amountCents: tax.cents,
        }))
        .filter((t) => t.amountCents > 0),
      customerEmail: email,
      locale: input.locale,
      expiresAt,
    });
    await store.update("orders", orderId, {
      stripeCheckoutSessionId: session.id,
      updatedAt: new Date().toISOString(),
    });
    return { ok: true, orderId, url: session.url };
  } catch (err) {
    console.error("[checkout] payment provider error", err);
    await cancelPendingOrder(store, orderId, "cancelled");
    return { ok: false, error: "payment_provider" };
  }
}

/** Releases the stock held by a pending order. No-op if the order is no longer pending. */
export async function cancelPendingOrder(
  store: Store,
  orderId: string,
  status: "cancelled" | "expired" | "failed",
): Promise<boolean> {
  return store.runTransaction(async (tx) => {
    const order = await tx.get<Order & Record<string, unknown>>("orders", orderId);
    if (!order || order.status !== "pending") return false;
    const types = await tx.getMany<TicketType & Record<string, unknown>>(
      "ticketTypes",
      order.items.map((i) => i.ticketTypeId),
    );
    order.items.forEach((item, i) => {
      const t = types[i];
      if (t) tx.update("ticketTypes", t.id, releaseReservation(t, item.quantity));
    });
    tx.update("orders", orderId, { status, updatedAt: new Date().toISOString() });
    return true;
  });
}
