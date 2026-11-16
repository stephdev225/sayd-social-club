import type { Locale } from "./i18n/config";

/** Partner ticketing sites we accept inside a frame on our pages (Le Point de Vente, FR and EN domains). */
const HOSTS = new Set(["lepointdevente.com", "www.lepointdevente.com", "thepointofsale.com", "www.thepointofsale.com"]);

export interface TicketingEmbed {
  /** Origin of the partner page: the only origin whose messages the frame listens to. */
  origin: string;
  /** The ticket page, in the visitor's language. Also the "open in a new tab" fallback. */
  url: string;
}

/**
 * Can this external ticket link be shown inside the event page? Only an https ticket page
 * of a known partner; anything else stays a plain link that opens the partner site.
 */
export function ticketingEmbed(link: string | undefined, lang: Locale): TicketingEmbed | null {
  if (!link) return null;
  let u: URL;
  try {
    u = new URL(link);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || !HOSTS.has(u.hostname)) return null;
  if (!/^\/(billets|tickets)\/[\w-]+\/?$/.test(u.pathname)) return null;
  u.searchParams.set("lang", lang);
  u.hash = "";
  return { origin: u.origin, url: u.toString() };
}

/**
 * Smallest frame height: the partner page reports its height before its ticket list is
 * drawn (about 550 px), which leaves the prices hidden behind an inner scrollbar.
 */
export const MIN_FRAME_HEIGHT = 820;

/** Frame height asked by the partner page, kept within sane bounds. Null when the value is unusable. */
export function frameHeight(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(6000, Math.max(MIN_FRAME_HEIGHT, Math.ceil(n)));
}
