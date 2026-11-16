import "server-only";
import { ticketingEmbed } from "../ticketing-embed";
import type { Locale } from "@/lib/i18n/config";
import { formatDate, formatShortDate, formatTime } from "@/lib/i18n/format";
import { canSellOnline } from "@/lib/checkout-availability";
import type { SaydEvent } from "@/lib/domain/types";
import { listPublicEvents } from "./catalog";
import { getStore } from "./index";

export interface NextEventSummary {
  name: string;
  slug: string;
  href: string;
  ticketsHref: string;
  startsAt: string;
  dateShort: string; // "11 oct"
  dateLong: string; // "dimanche 11 octobre, 22 h 00"
  venue: string;
  image?: string;
}

/**
 * Where "Buy tickets" buttons lead. Sold here, or on a partner ticketing site that can be
 * shown inside the event page: the ticket box of the event page. Sold on a partner site
 * that cannot be embedded: straight to that site.
 */
export function ticketsHrefFor(e: Pick<SaydEvent, "slug" | "externalTicketUrl">, lang: Locale): string {
  if (e.externalTicketUrl && !canSellOnline() && !ticketingEmbed(e.externalTicketUrl, lang)) return e.externalTicketUrl;
  return `/${lang}/evenements/${e.slug}#billets`;
}

/** The next party, formatted for calls to action across the site. Null when nothing is announced. */
export async function getNextEventSummary(lang: Locale): Promise<NextEventSummary | null> {
  try {
    const store = getStore();
    const { upcoming } = await listPublicEvents(store);
    const e = upcoming.find((x) => x.status === "published") ?? upcoming[0];
    if (!e) return null;
    const d = formatShortDate(e.startsAt, lang);
    return {
      name: e.name,
      slug: e.slug,
      href: `/${lang}/evenements/${e.slug}`,
      ticketsHref: ticketsHrefFor(e, lang),
      startsAt: e.startsAt,
      dateShort: `${d.day} ${d.month}`,
      dateLong: `${formatDate(e.startsAt, lang)}, ${formatTime(e.startsAt, lang)}`,
      venue: e.venueName,
      image: e.heroImage ?? e.coverImage,
    };
  } catch (err) {
    console.error("[next-event]", err);
    return null;
  }
}
