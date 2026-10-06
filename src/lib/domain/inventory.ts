import type { TicketType } from "./types";

export function availableQuantity(t: Pick<TicketType, "quantityTotal" | "quantitySold" | "quantityReserved">): number {
  return Math.max(0, t.quantityTotal - t.quantitySold - t.quantityReserved);
}

export type ReserveError =
  | "inactive"
  | "not_on_sale_yet"
  | "sales_ended"
  | "over_max_per_order"
  | "sold_out"
  | "insufficient_stock";

/**
 * Decides whether `quantity` tickets can be reserved right now.
 * Called INSIDE the Firestore transaction with freshly read counters, so two
 * buyers can never both reserve the last ticket.
 */
export function checkReservation(
  t: TicketType,
  quantity: number,
  now: Date = new Date(),
): { ok: true } | { ok: false; error: ReserveError; available: number } {
  const available = availableQuantity(t);
  if (!t.active) return { ok: false, error: "inactive", available };
  if (t.salesStartAt && now < new Date(t.salesStartAt)) return { ok: false, error: "not_on_sale_yet", available };
  if (t.salesEndAt && now > new Date(t.salesEndAt)) return { ok: false, error: "sales_ended", available };
  if (quantity > t.maxPerOrder) return { ok: false, error: "over_max_per_order", available };
  if (available === 0) return { ok: false, error: "sold_out", available };
  if (quantity > available) return { ok: false, error: "insufficient_stock", available };
  return { ok: true };
}

/** Counter updates applied when a reservation becomes a sale (webhook). */
export function convertReservation(t: Pick<TicketType, "quantitySold" | "quantityReserved">, quantity: number) {
  return {
    quantitySold: t.quantitySold + quantity,
    quantityReserved: Math.max(0, t.quantityReserved - quantity),
  };
}

/** Counter updates applied when a reservation is released (checkout expired / failed). */
export function releaseReservation(t: Pick<TicketType, "quantityReserved">, quantity: number) {
  return { quantityReserved: Math.max(0, t.quantityReserved - quantity) };
}
