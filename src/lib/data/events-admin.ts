import "server-only";
import type { OrderChannel, SaydEvent, TicketType } from "@/lib/domain/types";
import { preTaxForAllIn } from "@/lib/domain/money";
import { nightRange } from "@/lib/time";
import type { EventInput, TicketTypeInput } from "@/lib/validation";
import type { Store } from "./store";

type E = SaydEvent & Record<string, unknown>;
type T = TicketType & Record<string, unknown>;

export class AdminError extends Error {
  constructor(public readonly code: "slug_taken" | "not_found" | "below_sold" | "price_unreachable", message: string) {
    super(message);
  }
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** "Waklexx | https://instagram.com/waklexx_" lines → names + links. */
function parseLineup(raw: string): { lineup: string[]; instagram?: Record<string, string> } {
  const lineup: string[] = [];
  const links: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const [name, link] = line.split("|").map((s) => s.trim());
    if (!name) continue;
    lineup.push(name.slice(0, 60));
    if (link && /^https:\/\/[^\s]+$/.test(link)) links[name] = link.slice(0, 300);
  }
  return { lineup: lineup.slice(0, 20), instagram: Object.keys(links).length ? links : undefined };
}

export function lineupToText(e: Pick<SaydEvent, "lineup" | "instagram">): string {
  return e.lineup.map((n) => (e.instagram?.[n] ? `${n} | ${e.instagram[n]}` : n)).join("\n");
}

export async function listAllEvents(store: Store): Promise<SaydEvent[]> {
  const rows = await store.query<E>("events", { orderBy: { field: "startsAt", direction: "desc" } });
  return rows;
}

export async function listAllTicketTypes(store: Store, eventId: string): Promise<TicketType[]> {
  const rows = await store.query<T>("ticketTypes", { where: [{ field: "eventId", op: "==", value: eventId }] });
  return rows.sort((a, b) => a.sortOrder - b.sortOrder || a.priceCents - b.priceCents);
}

/** Creates or updates an event. Returns its id. */
export async function saveEvent(store: Store, input: EventInput, existingId?: string, now = new Date()): Promise<string> {
  const slug = input.slug ?? slugify(input.name);
  if (!slug) throw new AdminError("slug_taken", "Adresse de page invalide");
  const { startsAt, endsAt } = nightRange(input.date, input.startTime, input.endTime);
  const sameSlug = await store.query<E>("events", { where: [{ field: "slug", op: "==", value: slug }], limit: 5 });
  const id = existingId ?? `${slug}-${input.date}`;
  if (sameSlug.some((e) => e.id !== id)) {
    throw new AdminError("slug_taken", `L'adresse « ${slug} » est déjà utilisée par un autre événement.`);
  }
  const existing = existingId ? await store.get<E>("events", existingId) : await store.get<E>("events", id);
  if (existingId && !existing) throw new AdminError("not_found", "Événement introuvable");
  if (!existingId && existing) {
    throw new AdminError("slug_taken", "Un événement avec ce nom existe déjà à cette date.");
  }
  const loc = (fr?: string, en?: string) => (fr || en ? { fr: fr ?? en ?? "", en: en ?? fr ?? "" } : undefined);
  const { lineup, instagram } = parseLineup(input.lineup);
  const iso = now.toISOString();
  const event: SaydEvent = {
    ...(existing ?? {}),
    id,
    slug,
    name: input.name,
    edition: loc(input.editionFr, input.editionEn),
    tagline: { fr: input.taglineFr, en: input.taglineEn },
    description: { fr: input.descriptionFr, en: input.descriptionEn },
    dressCode: loc(input.dressCodeFr, input.dressCodeEn),
    startsAt,
    endsAt,
    venueName: input.venueName,
    address: input.address,
    city: input.city,
    capacity: input.capacity,
    status: input.status,
    lineup,
    instagram,
    partners: input.partners
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10),
    heroImage: input.heroImage,
    coverImage: input.coverImage,
    externalTicketUrl: input.externalTicketUrl,
    createdAt: existing?.createdAt ?? iso,
    updatedAt: iso,
  };
  await store.set("events", id, event as E);
  return id;
}

/** Creates or updates a ticket type. Sold and reserved counters are never touched here. */
export async function saveTicketType(store: Store, eventId: string, input: TicketTypeInput, existingId?: string): Promise<string> {
  const price = preTaxForAllIn(input.allInPrice);
  const channels: OrderChannel[] = [...(input.online ? (["online"] as const) : []), ...(input.door ? (["door"] as const) : [])];
  const fields = {
    name: { fr: input.nameFr, en: input.nameEn },
    description: { fr: input.descriptionFr, en: input.descriptionEn },
    priceCents: price.priceCents,
    quantityTotal: input.quantityTotal,
    maxPerOrder: input.maxPerOrder,
    sortOrder: input.sortOrder,
    channels: channels.length ? channels : (["online"] as OrderChannel[]),
    active: input.active,
  };

  if (existingId) {
    return store.runTransaction(async (tx) => {
      const cur = await tx.get<T>("ticketTypes", existingId);
      if (!cur || cur.eventId !== eventId) throw new AdminError("not_found", "Type de billet introuvable");
      const committed = cur.quantitySold + cur.quantityReserved;
      if (input.quantityTotal < committed) {
        throw new AdminError("below_sold", `Le stock ne peut pas être inférieur à ${committed} (billets déjà vendus ou en cours de paiement).`);
      }
      tx.update("ticketTypes", existingId, fields);
      return existingId;
    });
  }

  const event = await store.get<E>("events", eventId);
  if (!event) throw new AdminError("not_found", "Événement introuvable");
  const base = `${eventId}-${slugify(input.nameFr) || "billet"}`.slice(0, 120);
  let id = base;
  for (let i = 2; await store.get<T>("ticketTypes", id); i++) id = `${base}-${i}`;
  const type: TicketType = {
    id,
    eventId,
    currency: "cad",
    quantitySold: 0,
    quantityReserved: 0,
    ...fields,
  };
  await store.set("ticketTypes", id, type as T);
  return id;
}
