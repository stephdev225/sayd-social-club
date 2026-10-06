import type { SaydEvent, TicketType } from "@/lib/domain/types";
import type { Store } from "./store";

const PUBLIC_STATUSES = new Set(["published", "sold_out", "cancelled"]);

export async function listPublicEvents(store: Store, now = new Date()) {
  const events = await store.query<SaydEvent & Record<string, unknown>>("events", {
    orderBy: { field: "startsAt", direction: "asc" },
  });
  const visible = events.filter((e) => PUBLIC_STATUSES.has(e.status));
  const nowIso = now.toISOString();
  return {
    upcoming: visible.filter((e) => e.endsAt >= nowIso),
    past: visible.filter((e) => e.endsAt < nowIso).reverse(),
  };
}

export async function getEventBySlug(store: Store, slug: string): Promise<SaydEvent | null> {
  const rows = await store.query<SaydEvent & Record<string, unknown>>("events", {
    where: [{ field: "slug", op: "==", value: slug }],
    limit: 5,
  });
  return rows.find((e) => PUBLIC_STATUSES.has(e.status)) ?? null;
}

export async function listTicketTypes(
  store: Store,
  eventId: string,
  channel: "online" | "door" = "online",
): Promise<TicketType[]> {
  const rows = await store.query<TicketType & Record<string, unknown>>("ticketTypes", {
    where: [{ field: "eventId", op: "==", value: eventId }],
  });
  return rows
    .filter((t) => t.active && (t.channels ?? ["online"]).includes(channel))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Lowest active price for "from $X" labels. */
export function lowestPrice(types: TicketType[]): number | null {
  const prices = types.map((t) => t.priceCents);
  return prices.length ? Math.min(...prices) : null;
}
