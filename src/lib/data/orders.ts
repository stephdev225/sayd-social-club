import type { Order, SaydEvent, Ticket } from "@/lib/domain/types";
import type { Store } from "./store";

type R = Record<string, unknown>;

export async function getOrderBySession(store: Store, sessionId: string): Promise<Order | null> {
  const rows = await store.query<Order & R>("orders", {
    where: [{ field: "stripeCheckoutSessionId", op: "==", value: sessionId }],
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function getOrderView(store: Store, sessionId: string) {
  const order = await getOrderBySession(store, sessionId);
  if (!order) return null;
  const event = await store.get<SaydEvent & R>("events", order.eventId);
  const tickets =
    order.status === "paid"
      ? (await Promise.all(order.ticketIds.map((id) => store.get<Ticket & R>("tickets", id)))).filter(
          (t): t is Ticket & R => t !== null,
        )
      : [];
  return { order, event, tickets };
}
