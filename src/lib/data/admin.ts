import type { Order, SaydEvent, Ticket, TicketType } from "@/lib/domain/types";
import { availableQuantity } from "@/lib/domain/inventory";
import type { Store } from "./store";

type R = Record<string, unknown>;

export interface DashboardData {
  events: SaydEvent[];
  event: SaydEvent | null;
  types: (TicketType & { available: number })[];
  orders: Order[];
  tickets: Ticket[];
  stats: {
    revenueCents: number;
    taxCents: number;
    paidOrders: number;
    pendingOrders: number;
    ticketsSold: number;
    ticketsAvailable: number;
    checkedIn: number;
    capacity: number;
  };
}

export async function getDashboard(store: Store, eventId?: string): Promise<DashboardData> {
  const events = await store.query<SaydEvent & R>("events", { orderBy: { field: "startsAt", direction: "desc" } });
  const now = new Date().toISOString();
  const event =
    events.find((e) => e.id === eventId) ??
    [...events].reverse().find((e) => e.endsAt >= now) ?? // next upcoming
    events[0] ??
    null;
  if (!event) {
    return {
      events, event: null, types: [], orders: [], tickets: [],
      stats: { revenueCents: 0, taxCents: 0, paidOrders: 0, pendingOrders: 0, ticketsSold: 0, ticketsAvailable: 0, checkedIn: 0, capacity: 0 },
    };
  }
  const where = [{ field: "eventId", op: "==" as const, value: event.id }];
  const [types, orders, tickets] = await Promise.all([
    store.query<TicketType & R>("ticketTypes", { where }),
    store.query<Order & R>("orders", { where }),
    store.query<Ticket & R>("tickets", { where }),
  ]);
  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const paid = orders.filter((o) => o.status === "paid");
  const validTickets = tickets.filter((t) => t.status === "valid" || t.status === "used");
  return {
    events,
    event,
    types: types.sort((a, b) => a.sortOrder - b.sortOrder).map((t) => ({ ...t, available: availableQuantity(t) })),
    orders,
    tickets: tickets.sort((a, b) => a.holderName.localeCompare(b.holderName)),
    stats: {
      revenueCents: paid.reduce((s, o) => s + o.totalCents, 0),
      taxCents: paid.reduce((s, o) => s + o.taxCents, 0),
      paidOrders: paid.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      ticketsSold: validTickets.length,
      ticketsAvailable: types.filter((t) => t.active).reduce((s, t) => s + availableQuantity(t), 0),
      checkedIn: tickets.filter((t) => t.status === "used").length,
      capacity: event.capacity,
    },
  };
}
